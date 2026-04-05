import { inspectInputObject } from "../security/threatDetection.js";
import { sanitizePayload } from "../security/inputSanitizer.js";

export const validateRequest = (req, res, next) => {
  try {
    inspectInputObject(req.body);
    req.body = sanitizePayload(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
