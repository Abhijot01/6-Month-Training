import express from "express";
import { chatbotHandler } from "../controllers/chatbot.controller.js";

const router = express.Router();

router.post("/", chatbotHandler);

export default router;