import crypto from "crypto";
import bcrypt from "bcrypt";
import SharedLink from "../models/SharedLink.js";
import ApiError from "../utils/ApiError.js";

export const createSharedLink = async ({ fileId, createdBy, expiresInMinutes }) => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = await bcrypt.hash(rawToken, 10);
  const expiresAt = new Date(
    Date.now() + (expiresInMinutes || Number(process.env.SHARE_TOKEN_TTL_MINUTES || 120)) * 60000
  );

  const link = await SharedLink.create({
    file: fileId,
    tokenHash,
    expiresAt,
    createdBy
  });

  return { rawToken, link };
};

export const validateSharedToken = async ({ fileId, token }) => {
  const links = await SharedLink.find({
    file: fileId,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  });

  for (const link of links) {
    const matches = await bcrypt.compare(token, link.tokenHash);
    if (matches) {
      return link;
    }
  }

  throw new ApiError(401, "Shared link is invalid or expired");
};
