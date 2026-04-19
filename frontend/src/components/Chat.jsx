import React, { useState, useEffect, useRef } from "react";

export default function Chat({ messages, setMessages }) {
  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState(messages || []);
  const chatEndRef = useRef(null);

  // Sync with parent when chat changes
  useEffect(() => {
    setLocalMessages(messages || []);
  }, [messages]);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const question = input;

    const updatedMessages = [
      ...localMessages,
      { role: "user", text: question },
      { role: "assistant", text: "Thinking..." }
    ];

    setLocalMessages(updatedMessages);
    setMessages(updatedMessages); // sync to App
    setInput("");

    try {
      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question })
      });

      if (!response.ok) {
        throw new Error("Backend error");
      }

      const data = await response.json();

      const finalMessages = [
        ...updatedMessages.slice(0, -1), // remove "Thinking..."
        { role: "assistant", text: data.answer || "No response" }
      ];

      setLocalMessages(finalMessages);
      setMessages(finalMessages); // sync to App

    } catch (error) {
      console.error(error);

      const errorMessages = [
        ...updatedMessages.slice(0, -1),
        { role: "assistant", text: "⚠️ Backend crashed or not responding." }
      ];

      setLocalMessages(errorMessages);
      setMessages(errorMessages);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#212121",
        color: "white",
      }}
    >
      {/* 🔹 HEADER */}
      <div
        style={{
          padding: "15px 20px",
          borderBottom: "1px solid #333",
          fontSize: "18px",
          fontWeight: "600",
        }}
      >
        🧠 Wisdom GPT
        <div style={{ fontSize: "12px", color: "#aaa", marginTop: "4px" }}>
          Ask anything about life, emotions, Bhagavad Gita
        </div>
      </div>

      {/* 🔹 MESSAGES */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
        }}
      >
        {localMessages.length === 0 && (
          <div style={{ color: "#888", textAlign: "center", marginTop: "50px" }}>
            Start a conversation...
          </div>
        )}

        {localMessages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: "15px",
              display: "flex",
              justifyContent:
                msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "65%",
                padding: "12px 14px",
                borderRadius: "12px",
                lineHeight: "1.5",
                background:
                  msg.role === "user" ? "#0b93f6" : "#2f2f2f",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        <div ref={chatEndRef} />
      </div>

      {/* 🔹 INPUT */}
      <div
        style={{
          padding: "15px",
          borderTop: "1px solid #333",
          display: "flex",
          gap: "10px",
          background: "#1a1a1a",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #444",
            background: "#2a2a2a",
            color: "white",
            outline: "none",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />

        <button
          onClick={handleSend}
          style={{
            padding: "12px 20px",
            background: "#19c37d",
            border: "none",
            color: "white",
            cursor: "pointer",
            borderRadius: "8px",
            fontWeight: "500",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}