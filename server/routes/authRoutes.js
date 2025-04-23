import express from "express";
import { login, logout, whoami } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/whoami", whoami);

export default router;