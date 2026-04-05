import { createAuditLog } from "../services/auditService.js";
import { deleteFile, getFileByIdForUser, listAccessibleFiles, readFile, shareFileWithUser, updateFileContents, uploadFile } from "../services/fileService.js";
import { createSharedLink, validateSharedToken } from "../services/sharingService.js";
import { decryptFileToBuffer } from "../security/encryptionService.js";
import File from "../models/File.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { ensureFilePermission } from "../services/accessControlService.js";

export const upload = asyncHandler(async (req, res) => {
  const storedFile = await uploadFile({
    owner: req.user,
    file: req.file,
    requestMeta: req.requestMeta
  });
  res.status(201).json(storedFile);
});

export const listFiles = asyncHandler(async (req, res) => {
  const files = await listAccessibleFiles(req.user);
  res.json(files);
});

export const getMetadata = asyncHandler(async (req, res) => {
  const file = await getFileByIdForUser({ fileId: req.params.fileId, user: req.user });
  res.json(file);
});

export const download = asyncHandler(async (req, res) => {
  const { file, buffer } = await readFile({
    fileId: req.params.fileId,
    user: req.user,
    requestMeta: req.requestMeta
  });
  res.setHeader("Content-Type", file.mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${file.originalName}"`);
  res.send(buffer);
});

export const update = asyncHandler(async (req, res) => {
  const file = await updateFileContents({
    fileId: req.params.fileId,
    user: req.user,
    content: req.body.content,
    requestMeta: req.requestMeta
  });
  res.json(file);
});

export const remove = asyncHandler(async (req, res) => {
  await deleteFile({
    fileId: req.params.fileId,
    user: req.user,
    requestMeta: req.requestMeta
  });
  res.status(204).end();
});

export const shareWithUser = asyncHandler(async (req, res) => {
  const file = await shareFileWithUser({
    fileId: req.params.fileId,
    owner: req.user,
    targetEmail: req.body.email,
    level: req.body.level || "read",
    requestMeta: req.requestMeta
  });
  res.json(file);
});

export const createShareLink = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.fileId);
  if (!file) {
    throw new ApiError(404, "File not found");
  }
  ensureFilePermission(file, req.user, "write");
  const { rawToken, link } = await createSharedLink({
    fileId: file._id,
    createdBy: req.user._id,
    expiresInMinutes: req.body.expiresInMinutes
  });

  await createAuditLog({
    actor: req.user._id,
    action: "file.share.link",
    targetType: "file",
    targetId: file._id.toString(),
    ipAddress: req.requestMeta.ipAddress,
    userAgent: req.requestMeta.userAgent,
    metadata: {
      expiresAt: link.expiresAt
    }
  });

  res.status(201).json({
    token: rawToken,
    expiresAt: link.expiresAt
  });
});

export const accessSharedFile = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.fileId);
  if (!file) {
    throw new ApiError(404, "File not found");
  }
  await validateSharedToken({ fileId: req.params.fileId, token: req.query.token });
  const buffer = await decryptFileToBuffer(file);

  await createAuditLog({
    actor: req.user?._id || null,
    action: "file.share.access",
    targetType: "file",
    targetId: file._id.toString(),
    ipAddress: req.requestMeta.ipAddress,
    userAgent: req.requestMeta.userAgent
  });

  res.setHeader("Content-Type", file.mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${file.originalName}"`);
  res.send(buffer);
});
