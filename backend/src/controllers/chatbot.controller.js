import { processChat } from "../services/chatbot.service.js";

export async function chatbotHandler(req, res) {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.json({
        success: false,
        message: "Message is required"
      });
    }

    // ✅ PASS CORRECT PARAMS
    const response = await processChat(message, history);

    return res.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error("🔥 Chatbot Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}