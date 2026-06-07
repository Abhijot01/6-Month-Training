const ChatMessage = ({ msg }) => {
  if (msg.sender === "user") {
    return <div className="chat-message user">{msg.text}</div>;
  }

  const text = msg.response || "";

  const lines = text.split("\n").filter(l => l.trim() !== "");

  return (
    <div className="chat-message bot">

      {lines.map((line, i) => {
        const clean = line.trim();

        // 👉 Detect headings
        if (clean.endsWith(":")) {
          return <p key={i}><b>{clean}</b></p>;
        }

        // 👉 Detect bullet lines only if starts with bullet
        if (clean.startsWith("•") || clean.startsWith("-")) {
          return <li key={i}>{clean.replace(/^[-•]\s*/, "")}</li>;
        }

        // 👉 Normal text
        return <p key={i}>{clean}</p>;
      })}

    </div>
  );
};

export default ChatMessage;