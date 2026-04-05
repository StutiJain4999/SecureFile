import express from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { getLogs, getUsers, updateUserStatus } from "../controllers/adminController.js";

const router = express.Router();

router.use(requireAuth, requireRole("admin"));
router.get("/logs", getLogs);
router.get("/users", getUsers);
router.patch("/users/:userId/status", validateRequest, updateUserStatus);

export default router;
