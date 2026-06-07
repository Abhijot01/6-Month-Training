import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/image-recognition", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path));

    const response = await fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(), // 🔥 IMPORTANT
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error("FastAPI error: " + text);
    }

    const data = await response.json();

    // delete uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      data,
    });

  } catch (err) {
    console.error("🔥 Image Recognition Error:", err);

    res.status(500).json({
      success: false,
      message: "AI processing failed",
      error: err.message,
    });
  }
});

export default router;