import express from "express";
import multer from "multer";
import { runImageRecognition } from "../controllers/image.controller.js";

const router = express.Router();

// 📦 Store uploads
const upload = multer({ dest: "uploads/" });

// POST /api/image-recognition
router.post("/", upload.single("image"), runImageRecognition);

export default router;