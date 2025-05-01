import express from "express";
import {
  upsertMetadata,
  compareMetadata,
  createSalesforceObject,
} from "../controllers/metadataController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.post("/upsert", requireAuth, upsertMetadata);
router.get("/compare", requireAuth, compareMetadata);
router.post("/create", requireAuth, createSalesforceObject);

export default router;
