import express from "express";
import path from "path";
import session from "express-session";
import cors from "cors";
import logger from "morgan";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import metadataRoutes from "./routes/metadataRoutes.js";
import csvRoutes from "./routes/csvRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("port", port);
app.use(logger("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, "../dist")));

app.use(session({
  secret: process.env.sessionSecretKey,
  cookie: { secure: process.env.isHttps === "true" },
  resave: false,
  saveUninitialized: false,
}));

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/metadata", metadataRoutes);
app.use("/api/upload", csvRoutes);

// Fallback for React SPA
// serve index.html for _any_ route that doesn't start with /api
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }
  res.sendFile(path.resolve(__dirname, "../dist/index.html"));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
