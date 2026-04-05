import multer from "multer";
import ApiError from "../utils/ApiError.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE_BYTES || 5242880)
  }
});

export const singleFileUpload = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (error) => {
    if (error) {
      return next(new ApiError(400, error.message));
    }
    next();
  });
};
