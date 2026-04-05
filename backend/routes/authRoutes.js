import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  login,
  logout,
  me,
  refresh,
  register,
  setupTwoFactor,
  verifyTwoFactor
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", validateRequest, register);
router.post("/login", validateRequest, login);
router.post("/refresh", validateRequest, refresh);
router.get("/me", requireAuth, me);
router.post("/logout", requireAuth, logout);
router.post("/2fa/setup", requireAuth, setupTwoFactor);
router.post("/2fa/verify", requireAuth, validateRequest, verifyTwoFactor);

export default router;
