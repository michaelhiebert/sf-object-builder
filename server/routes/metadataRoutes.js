import express from "express";
import { upsertMetadata } from "../controllers/metadataController.js";

const router = express.Router();
router.post("/upsert", upsertMetadata);

export default router;
