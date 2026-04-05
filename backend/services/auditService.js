import AuditLog from "../models/AuditLog.js";

export const createAuditLog = async ({
  actor,
  action,
  status = "success",
  ipAddress = null,
  userAgent = null,
  targetType = null,
  targetId = null,
  metadata = {}
}) => {
  await AuditLog.create({
    actor,
    action,
    status,
    ipAddress,
    userAgent,
    targetType,
    targetId,
    metadata
  });
};

export const listAuditLogs = async ({ limit = 100 }) => {
  return AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("actor", "name email role");
};
