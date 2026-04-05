import xss from "xss";
import ApiError from "../utils/ApiError.js";

const rawFieldNames = new Set(["password", "otp", "content", "refreshToken"]);

export const sanitizePayload = (payload, sizeLimit = 10000, parentKey = "") => {
  const json = JSON.stringify(payload);
  if (json.length > sizeLimit) {
    throw new ApiError(400, "Request payload is too large");
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizePayload(item, sizeLimit, parentKey));
  }

  if (payload && typeof payload === "object") {
    return Object.fromEntries(
      Object.entries(payload).map(([key, value]) => [key, sanitizePayload(value, sizeLimit, key)])
    );
  }

  if (typeof payload === "string") {
    if (rawFieldNames.has(parentKey)) {
      return payload.trim();
    }
    return xss(payload.trim());
  }

  return payload;
};
