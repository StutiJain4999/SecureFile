import { createAuditLog } from "../services/auditService.js";
import {
  authenticateUser,
  enableTwoFactor,
  generateTwoFactorSetup,
  issueSession,
  refreshUserSession,
  revokeSession
} from "../services/authService.js";
import { createUser } from "../services/userService.js";
import { validateEmail } from "../utils/validators.js";
import asyncHandler from "../utils/asyncHandler.js";

const formatAuthResponse = (user, tokens) => ({
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    twoFactorEnabled: user.twoFactorEnabled
  },
  accessToken: tokens.accessToken,
  refreshToken: tokens.refreshToken
});

export const register = asyncHandler(async (req, res) => {
  const user = await createUser({
    name: req.body.name,
    email: validateEmail(req.body.email),
    password: req.body.password
  });

  await createAuditLog({
    actor: user._id,
    action: "auth.register",
    targetType: "user",
    targetId: user._id.toString(),
    ipAddress: req.requestMeta.ipAddress,
    userAgent: req.requestMeta.userAgent
  });

  res.status(201).json({
    message: "Registration successful. Please sign in."
  });
});

export const login = asyncHandler(async (req, res) => {
  const user = await authenticateUser({
    email: validateEmail(req.body.email),
    password: req.body.password,
    otp: req.body.otp
  });
  const tokens = await issueSession(user);

  await createAuditLog({
    actor: user._id,
    action: "auth.login",
    targetType: "user",
    targetId: user._id.toString(),
    ipAddress: req.requestMeta.ipAddress,
    userAgent: req.requestMeta.userAgent
  });

  res.json(formatAuthResponse(user, tokens));
});

export const refresh = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await refreshUserSession(req.body.refreshToken);
  res.json(formatAuthResponse(user, { accessToken, refreshToken }));
});

export const logout = asyncHandler(async (req, res) => {
  await revokeSession(req.user._id);
  await createAuditLog({
    actor: req.user._id,
    action: "auth.logout",
    targetType: "user",
    targetId: req.user._id.toString(),
    ipAddress: req.requestMeta.ipAddress,
    userAgent: req.requestMeta.userAgent
  });
  res.json({ message: "Logged out successfully" });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    twoFactorEnabled: req.user.twoFactorEnabled
  });
});

export const setupTwoFactor = asyncHandler(async (req, res) => {
  const setup = await generateTwoFactorSetup(req.user);
  res.json(setup);
});

export const verifyTwoFactor = asyncHandler(async (req, res) => {
  await enableTwoFactor(req.user, req.body.otp);
  await createAuditLog({
    actor: req.user._id,
    action: "auth.2fa.enable",
    targetType: "user",
    targetId: req.user._id.toString(),
    ipAddress: req.requestMeta.ipAddress,
    userAgent: req.requestMeta.userAgent
  });
  res.json({ message: "Two-factor authentication enabled" });
});
