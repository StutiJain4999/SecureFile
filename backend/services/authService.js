import nodemailer from "nodemailer";
import QRCode from "qrcode";
import speakeasy from "speakeasy";
import User from "../models/User.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  verifyStoredRefreshToken
} from "../security/tokenService.js";
import ApiError from "../utils/ApiError.js";

const buildTransporter = () => {
  if (!process.env.SMTP_HOST) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

export const issueSession = async (user) => {
  const accessToken = signAccessToken(user);
  const { token: refreshToken, hashed } = await signRefreshToken(user);
  user.refreshTokenHash = hashed;
  user.lastLoginAt = new Date();
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  return { accessToken, refreshToken };
};

export const authenticateUser = async ({ email, password, otp }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.isActive) {
    throw new ApiError(403, "This account has been disabled");
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new ApiError(423, "Account temporarily locked due to repeated failures");
  }

  const passwordValid = await user.comparePassword(password);
  if (!passwordValid) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await user.save();
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.twoFactorEnabled) {
    if (!otp) {
      throw new ApiError(401, "OTP is required for this account");
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: otp,
      window: 1
    });

    if (!verified) {
      throw new ApiError(401, "Invalid OTP");
    }
  }

  return user;
};

export const generateTwoFactorSetup = async (user) => {
  const secret = speakeasy.generateSecret({
    name: `SecureFileManager (${user.email})`
  });
  const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);
  user.twoFactorSecret = secret.base32;
  user.twoFactorEnabled = false;
  await user.save();

  return { qrCodeDataUrl, secret: secret.base32 };
};

export const enableTwoFactor = async (user, otp) => {
  if (!user.twoFactorSecret) {
    throw new ApiError(400, "Two-factor secret not initialized");
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: otp,
    window: 1
  });

  if (!verified) {
    throw new ApiError(400, "Invalid OTP");
  }

  user.twoFactorEnabled = true;
  await user.save();
};

export const refreshUserSession = async (refreshToken) => {
  const payload = verifyRefreshToken(refreshToken);
  const user = await User.findById(payload.sub);

  if (!user) {
    throw new ApiError(401, "User no longer exists");
  }

  await verifyStoredRefreshToken(refreshToken, user.refreshTokenHash);
  return { user, ...(await issueSession(user)) };
};

export const revokeSession = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
};

export const sendOtpEmail = async ({ email, otp }) => {
  const transporter = buildTransporter();
  if (!transporter) {
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Your Secure File Manager OTP",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`
  });
};
