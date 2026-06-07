import React from "react";

const ChatbotToggle = ({ toggle }) => {
  return (
    <button className="chatbot-toggle" onClick={toggle}>
      💬
    </button>
  );
};

export default ChatbotToggle;