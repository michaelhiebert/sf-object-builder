import express from "express";
import { login, logout, whoami } from "../controllers/authController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", requireAuth, logout);
router.get("/whoami", requireAuth, whoami);

export default router;
