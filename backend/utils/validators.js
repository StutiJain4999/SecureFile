import validator from "validator";
import xss from "xss";
import ApiError from "./ApiError.js";

export const sanitizeText = (value, maxLength = 255) => {
  const stringValue = String(value ?? "").trim();

  if (stringValue.length > maxLength) {
    throw new ApiError(400, `Input exceeds maximum length of ${maxLength}`);
  }

  return xss(stringValue);
};

export const validateEmail = (email) => {
  const normalized = validator.normalizeEmail(String(email || "").trim());
  if (!normalized || !validator.isEmail(normalized)) {
    throw new ApiError(400, "A valid email address is required");
  }

  return normalized;
};
