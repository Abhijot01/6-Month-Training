import { exec } from "child_process";
import path from "path";
import fs from "fs";
import axios from "axios"; // for local AI (optional)

export async function runImageRecognition(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.resolve(req.file.path);

    exec(
      `python ./ml/image_recognition.py "${filePath}"`,
      async (error, stdout, stderr) => {
        if (error) {
          console.error("Python Error:", error);
          return res.status(500).json({ error: "Python execution failed" });
        }

        let detectedText = [];

        try {
          const parsed = JSON.parse(stdout);
          detectedText = parsed.detected_text || [];
        } catch (e) {
          detectedText = stdout
            .split("\n")
            .map(t => t.trim())
            .filter(t => t.length > 0);
        }

        // 🔥 OPTIONAL LOCAL AI CLEANING (NO INTERNET)
        if (detectedText.length > 0) {
          try {
            const aiRes = await axios.post(
              "http://localhost:11434/api/chat",
              {
                model: "phi3",
                messages: [
                  {
                    role: "system",
                    content: "Clean and correct OCR text. Keep original meaning."
                  },
                  {
                    role: "user",
                    content: detectedText.join(" ")
                  }
                ],
                stream: false
              },
              { timeout: 20000 }
            );

            const cleaned = aiRes.data.message.content;

            detectedText = cleaned
              .split("\n")
              .map(t => t.trim())
              .filter(t => t.length > 0);

          } catch (err) {
            console.log("⚠️ Local AI cleaning skipped");
          }
        }

        // 🧹 delete temp file
        fs.unlinkSync(filePath);

        return res.json({
          success: true,
          data: {
            detected_text: detectedText,
            engine: "Local OCR + Optional AI Clean"
          }
        });
      }
    );

  } catch (err) {
    console.error("Controller Error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
