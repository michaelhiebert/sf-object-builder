import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
// import { handleCsvUpload } from "../controllers/csvController.js";
import { processCsvUpload } from "../controllers/csvController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `csvFile-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    ext === ".csv" ? cb(null, true) : cb(new Error("Only CSV files are allowed"));
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Routes
// router.post("/csv", requireAuth, upload.single("csvFile"), handleCsvUpload);
router.post("/csv", requireAuth, upload.single("csvFile"), processCsvUpload);

export default router;
