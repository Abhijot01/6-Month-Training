import axios from "axios";

export const processChat = async (message) => {
  try {

    const response = await axios.post(
      "http://127.0.0.1:11434/api/generate",

      {
        model: "phi3:latest",

        prompt: `
You are Drone Expert AI.

You are an intelligent drone engineering assistant.

Rules:
- Answer clearly
- Keep responses concise
- Help with drone parts, ESC, motors, batteries, propellers, frames
- Help with troubleshooting
- Help beginners understand concepts
- Use professional engineering tone

User Question:
${message}
        `,

        stream: false
      },

      {
        timeout: 0
      }
    );

    return {
      reply: response.data.response
    };

  } catch (err) {

    console.error(
      "🔥 OLLAMA ERROR:",
      err.response?.data || err.message
    );

    return {
      reply:
        "⚠️ Local AI is unavailable or still loading the model."
    };
  }
};