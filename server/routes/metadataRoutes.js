import express from "express";
import {
  upsertMetadata,
  compareMetadata,
  createSalesforceObject,
  listProfiles,
} from "../controllers/metadataController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/profiles", requireAuth, listProfiles);
router.get("/compare", requireAuth, compareMetadata);
router.post("/upsert", requireAuth, upsertMetadata);
router.post("/create", requireAuth, createSalesforceObject);

export default router;
