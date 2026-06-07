import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

import dropdownRoutes from "./routes/dropdown.routes.js";
import searchRoutes from "./routes/search.routes.js";
import ingestRoutes from "./routes/ingest.routes.js";
import partsRoutes from "./routes/parts.routes.js";
import globalSearchRoutes from "./routes/globalSearch.routes.js";
import predictRoutes from "./routes/predict.js";
import recommendRoutes from "./routes/recommend.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import droneDashboardRoutes from "./routes/droneDashboard.routes.js";
import partsDropdownRoutes from "./routes/partsDropdown.routes.js";
import chatbotRoutes from "./routes/chatbot.routes.js";
import imageRoutes from "./routes/image.routes.js";
import manualEntryRoutes from "./routes/manualEntry.routes.js";


dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

/* ✅ FIXED STATIC PATH */
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

app.use("/api/auth", authRoutes);

app.use("/api/search", globalSearchRoutes);
app.use("/api/dropdowns", dropdownRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/ingest", ingestRoutes);
app.use("/api/parts", partsRoutes);
app.use("/api", predictRoutes);
app.use("/api", recommendRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", droneDashboardRoutes);
app.use("/api/parts-dropdowns", partsDropdownRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api", imageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/manual-entry", manualEntryRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});