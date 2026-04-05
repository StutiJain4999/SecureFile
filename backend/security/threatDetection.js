import ApiError from "../utils/ApiError.js";

const sqlInjectionPattern =
  /(\b(SELECT|INSERT|DELETE|UPDATE|DROP|ALTER|UNION|EXEC)\b.*\b(FROM|TABLE|INTO|SET)\b|--|\bOR\b\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?)/i;
const rawFieldNames = new Set(["password", "otp", "content", "refreshToken"]);

export const detectInjectionPatterns = (value, key = "") => {
  if (rawFieldNames.has(key)) {
    return;
  }

  if (typeof value === "string" && sqlInjectionPattern.test(value)) {
    throw new ApiError(400, "Suspicious input detected");
  }
};

export const inspectInputObject = (payload, parentKey = "") => {
  if (Array.isArray(payload)) {
    payload.forEach((item) => inspectInputObject(item, parentKey));
    return;
  }

  if (payload && typeof payload === "object") {
    Object.entries(payload).forEach(([key, value]) => inspectInputObject(value, key));
    return;
  }

  detectInjectionPatterns(payload, parentKey);
};
