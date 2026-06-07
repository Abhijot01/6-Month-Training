from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import cv2
import numpy as np
import easyocr
import re

app = FastAPI()

# ✅ CORS (required for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load EasyOCR ONCE (important)
reader = easyocr.Reader(['en'], gpu=False)


# -------------------------------
# 🧠 IMAGE PREPROCESSING
# -------------------------------
def preprocess_variants(image):
    variants = []

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # CLAHE (contrast boost)
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)

    # Blur
    blur = cv2.GaussianBlur(enhanced, (5, 5), 0)

    # OTSU threshold
    _, otsu = cv2.threshold(
        blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )

    # Keep only best variants (LIMITED)
    variants.append(image)
    variants.append(enhanced)
    variants.append(otsu)

    return variants


# -------------------------------
# 🧠 OCR ENGINE (SAFE + FAST)
# -------------------------------
def run_ocr_best(image):
    variants = preprocess_variants(image)

    best_results = []
    best_score = 0

    for img in variants[:2]:
        print("🧠 Running OCR...")

        try:
            results = reader.readtext(img)
        except:
            continue

        score = sum([r[2] for r in results if r[2] > 0.4])

        if score > best_score:
            best_score = score
            best_results = results

    return best_results, best_score


# -------------------------------
# 🧠 MAIN ANALYSIS
# -------------------------------
def analyze_image(image_path):
    print("\n🚀 STRUCTURED OCR MODE")

    image = cv2.imread(image_path)
    if image is None:
        raise Exception("Image not loaded")

    results, score = run_ocr_best(image)

    # -----------------------------
    # 🧠 SORT BY POSITION (TOP → BOTTOM)
    # -----------------------------
    results = sorted(results, key=lambda r: r[0][0][1])

    lines = []
    current_line = []
    last_y = None

    for (bbox, text, prob) in results:
        if prob < 0.35:
            continue

        text = text.strip()
        if not text:
            continue

        y = bbox[0][1]

        # group into same line
        if last_y is None or abs(y - last_y) < 25:
            current_line.append(text)
        else:
            lines.append(" ".join(current_line))
            current_line = [text]

        last_y = y

    if current_line:
        lines.append(" ".join(current_line))

    print("🧾 RECONSTRUCTED LINES:", lines)

    return {
        "detected_text": lines,
        "confidence": int(score / max(len(results), 1) * 100),
        "engine": "Structured OCR (No Loss)"
    }


# -------------------------------
# 🚀 API ROUTE
# -------------------------------
@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    try:
        print("\n📥 File received:", file.filename)

        file_location = f"temp_{file.filename}"

        # Save file
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print("💾 Saved:", file_location)

        # Run OCR
        result = analyze_image(file_location)

        # Delete temp file
        os.remove(file_location)

        print("✅ DONE:", result)

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        print("🔥 API ERROR:", str(e))
        return {
            "success": False,
            "error": str(e)
        }