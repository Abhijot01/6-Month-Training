import express from "express";
import { recommendHandler } from "../controllers/recommend.controller.js";

const router = express.Router();

// POST /api/recommend
router.post("/recommend", recommendHandler);

export default router;