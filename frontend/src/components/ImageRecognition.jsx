import { useState } from "react";
import "../styles/imageRecognition.css";

export default function ImageRecognition() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Please select an image");

    const formData = new FormData();
    formData.append("file", file); 

    try {
      setLoading(true);
      setResult(null);

      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      console.log("🔥 API RESPONSE:", data); // DEBUG

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Server error");
      }

      setResult(data.data); // ✅ store ONLY data

    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="image-recognition-container">
      <h2>🧠 Image Recognition</h2>

      <div className="upload-box">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const selectedFile = e.target.files[0];

            if (selectedFile) {
              setFile(selectedFile);
              setPreview(URL.createObjectURL(selectedFile));
            }
          }}
        />

          {preview && (
            <div className="preview-box">

              <h3>Uploaded Image</h3>

              <img
                src={preview}
                alt="Preview"
                className="preview-image"
              />

            </div>
          )}

        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {loading && (
        <div className="loading">🔄 AI is analyzing image...</div>
      )}

      {result && (
  <div className="result-box">

    <h3>OCR Analysis Result</h3>
    

    {result.detected_text?.length > 0 ? (
      <>
        <strong>Detected Text:</strong>
        <div className="text-values">
          {result.detected_text.join(", ")}
        </div>
      </>
    ) : (
      <div className="no-id">No Text Detected</div>
    )}

    <div className="confidence">
      Confidence: {result.confidence}%
    </div>
  </div>
)}
    </div>
  );
}