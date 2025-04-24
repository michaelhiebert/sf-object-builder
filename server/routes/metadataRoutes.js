import express from "express";
import { upsertMetadata } from "../controllers/metadataController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();
router.post("/upsert", requireAuth, upsertMetadata);

export default router;
