// 3rd party dependencies
import express from "express";
import path from "path";
import session from "express-session";
import jsforce from "jsforce";
import bodyParser from "body-parser";
import cors from "cors";
import multer from "multer";
import { fileURLToPath } from 'url';

// const path = require("path"),
//   express = require("express"),
//   session = require("express-session"),
//   jsforce = require("jsforce"),
//   bodyParser = require("body-parser"),
//   cors = require("cors"),
//   multer = require("multer");

import logger from "morgan";

// Load and check config
// require("dotenv").config();
import dotenv from 'dotenv';
dotenv.config();

// Setup HTTP server
const app = express();
const port = process.env.PORT || 8080;
// const __dirname = path.resolve();
// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set("port", port);

app.use(logger("dev"));

// Serve static assets from 'public' (including scripts/)
// app.use(express.static(path.resolve(process.cwd(), 'public')));

const distPath = path.resolve(__dirname, '../dist');
const indexHtml = path.resolve(distPath, 'index.html');

app.use(express.static(distPath));

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Enable server-side sessions
app.use(
  session({
    secret: process.env.sessionSecretKey,
    cookie: { secure: process.env.isHttps === "true" },
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// Serve HTML pages under root directory
// app.use("/", express.static(path.join(__dirname, "../public")));

// app.use("uploads", express.static(path.join(__dirname, "uploads")));

// Upload Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Files will be saved in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Rename file to prevent conflicts
  },
});

const upload = multer({ storage: storage });

/**
 * Upload Endpoint
 */
app.post("/upload", upload.single("file"), (req, res) => {
  // console.log("req.body: ", req.body);
  console.log('path',path.join(__dirname, "uploads/"));
  // console.log("req.file: ", req.file);
  // console.log("path.join(__dirname, 'uploads')",path.join(__dirname, 'uploads'));
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  res
    .status(200)
    .send({
      message: "File uploaded successfully",
      filename: req.file.filename,
    });
});

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
    // return response.send("Login successful");
    // response.send(userInfo);
    // Redirect to app main page
    return response.redirect('/index.html');
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
  console.log('path',path.join(__dirname, "uploads/"));
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

app.post("/metadata/upsert", async (request, response) => {
  const session = getSession(request, response);
  if (session == null) {
    return;
  }

  // Request session info from Salesforce
  const conn = resumeSalesforceConnection(session);
  const results = await conn.metadata.upsert("CustomObject", request.body);
  let errors = [];
  // Debug individual results
  for (let i = 0; i < results.length; i++) {
    const result = results[i];

    //Debug messages
    console.log("success ? : " + result.success);
    console.log("created ? : " + result.created);
    console.log("fullName : " + result.fullName);

    if (!result.success) {
      errors.push(JSON.stringify(result.errors));
    }
  }

  if (Array.isArray(errors) && errors.length) {
    return response.status(400).send(errors);
  }

  return response.send(results);
});

// Serve index.html for the root path
app.get('/{*any}', (req, res) => {
  res.sendFile(indexHtml);
});

app.listen(app.get("port"), () => {
  console.log("Server started: http://localhost:" + app.get("port") + "/");
});