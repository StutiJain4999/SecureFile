import bcrypt from "bcrypt";
import User from "../models/User.js";
import { validatePasswordStrength } from "../utils/password.js";
import ApiError from "../utils/ApiError.js";

export const createUser = async ({ name, email, password, role = "user" }) => {
  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.valid) {
    throw new ApiError(400, passwordCheck.message);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "A user with that email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  return User.create({
    name,
    email,
    passwordHash,
    role
  });
};

export const seedAdminAccount = async () => {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return;
  }

  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.valid) {
    throw new Error(`Seed admin password invalid: ${passwordCheck.message}`);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await User.create({
    name: "Administrator",
    email,
    passwordHash,
    role: "admin",
    twoFactorEnabled: false
  });
};

export const listUsers = async () => {
  return User.find().select("-passwordHash -refreshTokenHash -twoFactorSecret");
};

export const toggleUserStatus = async (userId, isActive) => {
  const user = await User.findByIdAndUpdate(userId, { isActive }, { new: true }).select(
    "-passwordHash -refreshTokenHash -twoFactorSecret"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};
