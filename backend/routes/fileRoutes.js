import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { singleFileUpload } from "../middleware/uploadMiddleware.js";
import {
  createShareLink,
  download,
  getMetadata,
  listFiles,
  remove,
  shareWithUser,
  update,
  upload
} from "../controllers/fileController.js";

const router = express.Router();

router.use(requireAuth);
router.get("/", listFiles);
router.post("/upload", singleFileUpload("file"), upload);
router.get("/:fileId", getMetadata);
router.get("/:fileId/download", download);
router.put("/:fileId", validateRequest, update);
router.delete("/:fileId", remove);
router.post("/:fileId/share/user", validateRequest, shareWithUser);
router.post("/:fileId/share/link", validateRequest, createShareLink);

export default router;
