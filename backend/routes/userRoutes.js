import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", requireAuth, getProfile);

export default router;
