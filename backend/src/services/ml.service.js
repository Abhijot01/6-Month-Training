import * as tf from "@tensorflow/tfjs";
import fs from "fs";
import axios from "axios";

let model = null;

/* =====================================================
   🔥 LOAD ML MODEL (UNCHANGED - SAFE)
===================================================== */
export async function loadModel() {
  if (model) return model;

  console.log("📦 Loading ML model...");

  const raw = JSON.parse(fs.readFileSync("./ml/model.json"));

  const weightData = new Uint8Array(raw.weightData).buffer;

  model = await tf.loadLayersModel(
    tf.io.fromMemory(
      raw.modelTopology,
      raw.weightSpecs,
      weightData
    )
  );

  console.log("✅ ML Model Loaded SUCCESSFULLY");

  return model;
}

/* =====================================================
   🔥 AI VISION OCR (NEW - DOES NOT AFFECT MODEL)
===================================================== */
export const analyzeImageWithAI = async (imagePath) => {
  try {
    const imageBase64 = fs.readFileSync(imagePath, {
      encoding: "base64"
    });

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `
Extract all visible text from this image.

Rules:
- Keep text EXACT (no guessing)
- Preserve numbers, IDs, serials
- Return clean lines only
- No extra explanation
`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 20000
      }
    );

    const text =
      response?.data?.choices?.[0]?.message?.content?.trim() || "";

    return text;

  } catch (err) {
    console.error("🔥 AI OCR ERROR:", err.response?.data || err.message);
    return "";
  }
};