import User from "../models/User.js";
import { verifyAccessToken } from "../security/tokenService.js";
import ApiError from "../utils/ApiError.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

    if (!token) {
      throw new ApiError(401, "Authentication token is required");
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select("-passwordHash -refreshTokenHash");

    if (!user || !user.isActive) {
      throw new ApiError(401, "Authenticated user is unavailable");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, "Insufficient privileges"));
  }

  next();
};
