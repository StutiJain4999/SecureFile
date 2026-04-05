import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import ApiError from "../utils/ApiError.js";

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return process.env.JWT_SECRET;
};

const getRefreshSecret = () => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not configured");
  }

  return process.env.JWT_REFRESH_SECRET;
};

export const signAccessToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      email: user.email
    },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m"
    }
  );

export const signRefreshToken = async (user) => {
  const tokenId = crypto.randomUUID();
  const token = jwt.sign(
    {
      sub: user._id.toString(),
      jti: tokenId
    },
    getRefreshSecret(),
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
    }
  );

  return {
    token,
    hashed: await bcrypt.hash(token, 10)
  };
};

export const verifyAccessToken = (token) => jwt.verify(token, getJwtSecret());

export const verifyRefreshToken = (token) => jwt.verify(token, getRefreshSecret());

export const verifyStoredRefreshToken = async (token, storedHash) => {
  if (!storedHash) {
    throw new ApiError(401, "Refresh token is missing");
  }

  const matches = await bcrypt.compare(token, storedHash);
  if (!matches) {
    throw new ApiError(401, "Refresh token is invalid");
  }
};
