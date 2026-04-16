import React, { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Ask me anything about the Bhagavad Gita." },
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    setInput("");

    const dummyReply = {
      role: "assistant",
      text: "Backend API is not connected yet.",
    };

    setMessages((prev) => [...prev, dummyReply]);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "0 auto" }}>
      <h2>Wisdom GPT Chat</h2>

      <div
        style={{
          border: "1px solid #ccc",
          minHeight: "400px",
          padding: "12px",
          marginBottom: "12px",
          overflowY: "auto",
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: "10px" }}>
            <strong>{msg.role === "user" ? "You" : "Assistant"}:</strong>{" "}
            {msg.text}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          style={{ flex: 1, padding: "10px" }}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}