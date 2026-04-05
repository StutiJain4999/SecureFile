import { listAuditLogs } from "../services/auditService.js";
import { listUsers, toggleUserStatus } from "../services/userService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getLogs = asyncHandler(async (req, res) => {
  const logs = await listAuditLogs({ limit: Number(req.query.limit || 100) });
  res.json(logs);
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await listUsers();
  res.json(users);
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await toggleUserStatus(req.params.userId, Boolean(req.body.isActive));
  res.json(user);
});
