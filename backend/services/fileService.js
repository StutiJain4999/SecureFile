import fs from "fs/promises";
import File from "../models/File.js";
import User from "../models/User.js";
import { createAuditLog } from "./auditService.js";
import {
  decryptFileToBuffer,
  encryptAndPersistFile,
  replaceEncryptedFile
} from "../security/encryptionService.js";
import { ensureFilePermission } from "./accessControlService.js";
import { scanFileForThreats } from "../security/malwareScanner.js";
import ApiError from "../utils/ApiError.js";

export const uploadFile = async ({ owner, file, requestMeta }) => {
  if (!file) {
    throw new ApiError(400, "A file upload is required");
  }

  await scanFileForThreats({ originalName: file.originalname, buffer: file.buffer });

  const encrypted = await encryptAndPersistFile({
    buffer: file.buffer,
    ownerId: owner._id
  });

  const storedFile = await File.create({
    originalName: file.originalname,
    safeName: encrypted.safeName,
    mimeType: file.mimetype || "application/octet-stream",
    size: file.size,
    storagePath: encrypted.storagePath,
    owner: owner._id,
    encryptedDek: encrypted.encryptedDek,
    encryptionIv: encrypted.encryptionIv,
    encryptionAuthTag: encrypted.encryptionAuthTag,
    encryptionStatus: encrypted.encryptionStatus,
    lastModifiedAt: new Date()
  });

  await createAuditLog({
    actor: owner._id,
    action: "file.upload",
    targetType: "file",
    targetId: storedFile._id.toString(),
    ipAddress: requestMeta.ipAddress,
    userAgent: requestMeta.userAgent,
    metadata: {
      name: storedFile.originalName,
      size: storedFile.size
    }
  });

  return storedFile;
};

export const listAccessibleFiles = async (user) => {
  const query =
    user.role === "admin"
      ? {}
      : {
          $or: [{ owner: user._id }, { "sharedWith.user": user._id }]
        };

  return File.find(query)
    .sort({ createdAt: -1 })
    .populate("owner", "name email")
    .populate("sharedWith.user", "name email");
};

export const getFileByIdForUser = async ({ fileId, user }) => {
  const file = await File.findById(fileId)
    .populate("owner", "name email")
    .populate("sharedWith.user", "name email");
  if (!file) {
    throw new ApiError(404, "File not found");
  }

  ensureFilePermission(file, user, "read");
  return file;
};

export const readFile = async ({ fileId, user, requestMeta }) => {
  const file = await File.findById(fileId);
  if (!file) {
    throw new ApiError(404, "File not found");
  }

  ensureFilePermission(file, user, "read");
  const buffer = await decryptFileToBuffer(file);
  file.lastAccessedAt = new Date();
  await file.save();

  await createAuditLog({
    actor: user._id,
    action: "file.read",
    targetType: "file",
    targetId: file._id.toString(),
    ipAddress: requestMeta.ipAddress,
    userAgent: requestMeta.userAgent
  });

  return { file, buffer };
};

export const updateFileContents = async ({ fileId, user, content, requestMeta }) => {
  const file = await File.findById(fileId);
  if (!file) {
    throw new ApiError(404, "File not found");
  }

  ensureFilePermission(file, user, "write");
  const buffer = Buffer.from(content, "utf8");
  await scanFileForThreats({ originalName: file.originalName, buffer });
  const encryptionUpdate = await replaceEncryptedFile(file, buffer);

  file.size = buffer.length;
  file.encryptionIv = encryptionUpdate.encryptionIv;
  file.encryptionAuthTag = encryptionUpdate.encryptionAuthTag;
  file.lastModifiedAt = new Date();
  await file.save();

  await createAuditLog({
    actor: user._id,
    action: "file.update",
    targetType: "file",
    targetId: file._id.toString(),
    ipAddress: requestMeta.ipAddress,
    userAgent: requestMeta.userAgent
  });

  return file;
};

export const shareFileWithUser = async ({ fileId, owner, targetEmail, level, requestMeta }) => {
  const file = await File.findById(fileId);
  if (!file) {
    throw new ApiError(404, "File not found");
  }

  ensureFilePermission(file, owner, "write");
  const targetUser = await User.findOne({ email: targetEmail });

  if (!targetUser) {
    throw new ApiError(404, "Target user not found");
  }

  if (file.owner.toString() === targetUser._id.toString()) {
    throw new ApiError(400, "Owner already has access");
  }

  const existing = file.sharedWith.find(
    (entry) => entry.user.toString() === targetUser._id.toString()
  );

  if (existing) {
    existing.level = level;
  } else {
    file.sharedWith.push({ user: targetUser._id, level });
  }

  await file.save();
  await createAuditLog({
    actor: owner._id,
    action: "file.share.user",
    targetType: "file",
    targetId: file._id.toString(),
    ipAddress: requestMeta.ipAddress,
    userAgent: requestMeta.userAgent,
    metadata: {
      targetEmail,
      level
    }
  });

  return file;
};

export const deleteFile = async ({ fileId, user, requestMeta }) => {
  const file = await File.findById(fileId);
  if (!file) {
    throw new ApiError(404, "File not found");
  }

  ensureFilePermission(file, user, "write");

  // Remove encrypted file from disk (ignore error if already gone)
  try {
    await fs.unlink(file.storagePath);
  } catch {
    // file may already be missing from disk; proceed with DB removal
  }

  await File.deleteOne({ _id: file._id });

  await createAuditLog({
    actor: user._id,
    action: "file.delete",
    targetType: "file",
    targetId: file._id.toString(),
    ipAddress: requestMeta.ipAddress,
    userAgent: requestMeta.userAgent,
    metadata: { name: file.originalName }
  });
};
