// 3rd party dependencies
const path = require("path"),
  express = require("express"),
  session = require("express-session"),
  jsforce = require("jsforce"),
  bodyParser = require("body-parser"),
  cors = require("cors");

const logger = require("morgan");

// Setup HTTP server
const app = express();
const port = process.env.PORT || 8080;
app.set("port", port);

app.use(logger("dev"));

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Load and check config
require("dotenv").config();

// Enable server-side sessions
app.use(
  session({
    secret: process.env.sessionSecretKey,
    cookie: { secure: process.env.isHttps === "true" },
    resave: false,
    saveUninitialized: false,
  })
);

// Serve HTML pages under root directory
app.use("/", express.static(path.join(__dirname, "../public")));

/**
 *  Attemps to retrieves the server session.
 *  If there is no session, redirects with HTTP 401 and an error message
 */
function getSession(request, response) {
  const session = request.session;
  if (!session.sfdcAuth) {
    response.status(401).send("No active session");
    return null;
  }

  return session;
}

function resumeSalesforceConnection(session) {
  return new jsforce.Connection({
    instanceUrl: session.sfdcAuth.instanceUrl,
    accessToken: session.sfdcAuth.accessToken,
    version: process.env.apiVersion,
  });
}

/**
 * Login Endpoint
 */
app.post("/auth/login", async (request, response) => {
  const conn = new jsforce.Connection({
    loginUrl: process.env.loginUrl,
  });

  // TODO: Sanitize strings
  const username = request.body.username;
  const password = request.body.password;

  try {
    const userInfo = await conn.login(username, password);

    // Store session data in server
    request.session.sfdcAuth = {
      instanceUrl: conn.instanceUrl,
      accessToken: conn.accessToken,
    };

    // Redirect to app main page
    return response.redirect("/index.html");
  } catch (error) {
    console.log("Salesforce authorization error: " + JSON.stringify(error));
    response.status(500).json(error);

    return;
  }
});

/**
 * Logout endpoint
 */
app.get("/auth/logout", async (request, response) => {
  const session = getSession(request, response);
  if (session == null) return;

  // Revoke OAuth token
  const conn = resumeSalesforceConnection(session);
  try {
    await conn.logout();
    // Destroy server-side session
    session.destroy((error) => {
      if (error) {
        console.error(
          "Salesforce session destruction error: " + JSON.stringify(error)
        );
      }
    });
    // Redirect to app main page
    return response.redirect("/index.html");
  } catch (error) {
    console.error("Salesforce revoke error: " + JSON.stringify(error));
    response.status(500).json(error);
    return;
  }
});

/**
 * Endpoint for retrieving currently connected user
 */
app.get("/auth/whoami", async (request, response) => {
  const session = getSession(request, response);
  if (session == null) {
    return;
  }

  // Request session info from Salesforce
  const conn = resumeSalesforceConnection(session);
  try {
    const identity = await conn.identity();
    response.send(identity);
  } catch (error) {
    console.error("Salesforce identity error: " + JSON.stringify(error));
    response.status(500).json(error);
    
    return;
  }
});

app.listen(app.get("port"), () => {
  console.log("Server started: http://localhost:" + app.get("port") + "/");
});
