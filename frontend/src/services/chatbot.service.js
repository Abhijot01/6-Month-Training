const API_URL = "http://localhost:5000/api/chatbot";

export async function sendMessage(message, context = null, history = []) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message, context, history })
  });

  return await res.json();
}