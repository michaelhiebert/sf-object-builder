// server/testServer.js
import express from 'express';
import session from 'express-session';

const app = express();

app.use(express.json());
app.use(
  session({
    secret: "test_secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Simplified routes for testing
app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;
  
  if (username === "validUser" && password === "validPass") {
    req.session.user = {
      username,
      orgId: "mockOrgId",
      name: "Mock User",
      accessToken: "mockAccessToken",
      instanceUrl: "https://mock.salesforce.com"
    };
    
    // Redirect as expected in the test
    return res.redirect("/index.html");
  }
  
  return res.status(401).json({ message: "Invalid credentials" });
});

app.post("/auth/logout", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "No user session" });
  }
  
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Failed to destroy session");
    }
    return res.status(200).json({ message: "Logged out" });
  });
});

app.get("/auth/whoami", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  return res.status(200).json({
    user_id: "mockUserId",
    display_name: "Mock User",
    organization_id: "mockOrgId"
  });
});

export default app;