import cv2
import numpy as np
import easyocr
import re
import json
import sys
import os

# ✅ Fix Windows encoding issue
sys.stdout.reconfigure(encoding='utf-8')

# ✅ Initialize EasyOCR (no crash)
reader = easyocr.Reader(['en'], gpu=False, verbose=False)


# ================= PREPROCESS =================
def preprocess(img):
    h, w = img.shape[:2]

    img = cv2.resize(img, (w * 2, h * 2), interpolation=cv2.INTER_CUBIC)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    gray = clahe.apply(gray)

    kernel = np.array([
        [-1,-1,-1],
        [-1, 9,-1],
        [-1,-1,-1]
    ])
    sharp = cv2.filter2D(gray, -1, kernel)

    return sharp


# ================= DETECT TEXT WITH POSITION =================
def detect_text(img):
    results = reader.readtext(img)

    detections = []

    for (bbox, text, conf) in results:
        if conf > 0.3:
            x_center = (bbox[0][0] + bbox[2][0]) / 2
            detections.append({
                "text": text,
                "x": x_center
            })

    return detections


# ================= CLEAN TEXT =================
def clean_text(text):
    text = text.upper()
    text = re.sub(r'[^A-Z0-9\-_/\.#]', '', text)

    if len(text) < 2:
        return None

    return text


# ================= MERGE BY POSITION =================
def merge_by_position(detections):
    # sort left → right
    detections = sorted(detections, key=lambda x: x["x"])

    merged = []

    i = 0
    while i < len(detections):
        current = detections[i]["text"]

        if i < len(detections) - 1:
            next_text = detections[i + 1]["text"]

            # merge adjacent detections
            combined = current + next_text
            merged.append(combined)

        merged.append(current)
        i += 1

    return list(set(merged))


# ================= EXTRACT IDS =================
def extract_ids(texts):
    valid_ids = []

    # must contain BOTH letter + number
    pattern = r'\b(?=.*[A-Z])(?=.*\d)[A-Z0-9\-_/\.#]{3,15}\b'

    for text in texts:
        if re.match(pattern, text):
            valid_ids.append(text)

    valid_ids = list(set(valid_ids))
    valid_ids.sort(key=len, reverse=True)

    return valid_ids


# ================= SCAN MULTIPLE REGIONS =================
def scan_regions(img):
    h, w = img.shape[:2]

    regions = [
        img[int(h*0.2):int(h*0.5), int(w*0.3):int(w*0.7)],
        img[int(h*0.3):int(h*0.7), int(w*0.4):int(w*0.9)],
        img[int(h*0.4):int(h*0.8), int(w*0.2):int(w*0.6)],
        img  # fallback full image
    ]

    all_detections = []

    for region in regions:
        processed = preprocess(region)
        detections = detect_text(processed)

        all_detections.extend(detections)

    return all_detections


# ================= MAIN =================
def process_image(image_path):
    img = cv2.imread(image_path)

    if img is None:
        raise Exception("Image not found")

    detections = scan_regions(img)

    merged_texts = merge_by_position(detections)

    # clean + filter
    cleaned = list(set(filter(None, [clean_text(t) for t in merged_texts])))

    drone_ids = extract_ids(cleaned)

    return {
        "drone_ids": drone_ids if drone_ids else [],
        "detected_text": cleaned,
        "confidence": 95 if drone_ids else 50,
        "engine": "EasyOCR + Spatial Merge AI"
    }


# ================= ENTRY =================
if __name__ == "__main__":
    try:
        if len(sys.argv) < 2:
            print(json.dumps({"error": "No image provided"}))
            sys.exit(1)

        image_path = sys.argv[1]

        if not os.path.exists(image_path):
            print(json.dumps({"error": "File not found"}))
            sys.exit(1)

        result = process_image(image_path)

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))