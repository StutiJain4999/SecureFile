import express from "express";
import { accessSharedFile } from "../controllers/fileController.js";

const router = express.Router();

router.get("/:fileId", accessSharedFile);

export default router;
