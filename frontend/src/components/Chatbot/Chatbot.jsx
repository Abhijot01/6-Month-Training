import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import { sendMessage } from "../../services/chatbot.service";
import "../../styles/chatbot.css";

const Chatbot = () => {
  /* ---------------- STATE ---------------- */
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* ---------------- SEND MESSAGE ---------------- */
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = {
      sender: "user",
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await sendMessage(input, null, history);

      console.log("🧠 API RESPONSE:", res); // ✅ DEBUG

      setIsTyping(false);

      // ✅ HANDLE ALL POSSIBLE RESPONSE FORMATS
      const botReply =
        res?.data?.response ||   // ✅ your backend format
        res?.data?.reply || 
        res?.reply ||
        "⚠️ No reply from AI";

      const botMsg = {
        sender: "bot",
        response: botReply
      };

      setMessages(prev => [...prev, botMsg]);

      // ✅ SAVE HISTORY (FOR CONTEXT)
      setHistory(prev => [
        ...prev,
        { role: "user", content: input },
        { role: "assistant", content: botReply }
      ]);

    } catch (err) {
      setIsTyping(false);
      console.error("❌ Chat Error:", err);

      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          response: "⚠️ Error connecting to AI. Check backend."
        }
      ]);
    }
  };

  /* ---------------- SMART SUGGESTIONS ---------------- */
const getSuggestions = () => [
  "Best drone for beginners under budget",
  "How to fix ESC desync issue?",
  "Difference between 4S and 6S battery",
  "Suggest motors for 7 inch drone",
];

  /* ---------------- TOGGLE ---------------- */
  const toggleChat = () => setOpen(prev => !prev);

  return (
    <>
      {/* ===== FLOATING BUTTON ===== */}
      <button className="chatbot-toggle" onClick={toggleChat}>
        {open ? "✖" : "💬"}
      </button>

      {/* ===== CHAT PANEL ===== */}
      {open && (
        <div className="chatbot-container right-panel">

          {/* HEADER */}
          <div className="chatbot-header">
            🚁 Drone Expert AI
          </div>

          {/* MESSAGES */}
          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="chat-message bot">
                <p><b>Welcome 👋</b></p>
                <p>Ask me about drone builds, components, or issues.</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <ChatMessage key={i} msg={msg} />
            ))}

            {/* Typing animation */}
            {isTyping && (
              <div className="chat-message bot typing">
                <span></span><span></span><span></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* SUGGESTIONS */}
          <div className="chat-suggestions">
            {getSuggestions().map((s, i) => (
              <button key={i} onClick={() => setInput(s)}>
                {s}
              </button>
            ))}
          </div>

          {/* INPUT */}
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Ask about drones..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>Send</button>
          </div>

        </div>
      )}
    </>
  );
};

export default Chatbot;