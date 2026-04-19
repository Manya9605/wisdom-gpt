import { useState, useEffect } from "react";
import Chat from "./components/Chat";

function App() {
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("chats");
    return saved
      ? JSON.parse(saved)
      : [{ id: Date.now(), title: "New Chat", messages: [] }];
  });

  const [activeChatId, setActiveChatId] = useState(chats[0]?.id);

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  // 🔹 Save chats
  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  // 🔥 UPDATE MESSAGES (FIXED)
  const updateMessages = (newMessages) => {
    if (!Array.isArray(newMessages)) return; // 🛑 prevents crash

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === activeChatId) {
          
          // 🧠 AUTO TITLE (from first user message)
          let title = chat.title;

          if (chat.title === "New Chat") {
            const firstUser = newMessages.find(m => m.role === "user");
            if (firstUser) {
              title = firstUser.text.slice(0, 30);
            }
          }

          return {
            ...chat,
            messages: newMessages,
            title
          };
        }
        return chat;
      })
    );
  };

  // ➕ NEW CHAT
  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: []
    };

    setChats((prev) => [...prev, newChat]);
    setActiveChatId(newChat.id);
  };

  // ❌ DELETE CHAT
  const deleteChat = (id) => {
    const updated = chats.filter((c) => c.id !== id);

    if (updated.length === 0) {
      const newChat = {
        id: Date.now(),
        title: "New Chat",
        messages: []
      };
      setChats([newChat]);
      setActiveChatId(newChat.id);
    } else {
      setChats(updated);
      setActiveChatId(updated[0].id);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f0f0f" }}>
      
      {/* 🔹 SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>🧠 Wisdom GPT</div>

        <button onClick={createNewChat} style={styles.newChat}>
          + New Chat
        </button>

        <div style={styles.chatList}>
          {chats.map((chat) => (
            <div
              key={chat.id}
              style={{
                ...styles.chatItem,
                background:
                  chat.id === activeChatId ? "#2a2a2a" : "transparent"
              }}
            >
              <span onClick={() => setActiveChatId(chat.id)}>
                {chat.title}
              </span>

              {/* ❌ DELETE BUTTON */}
              <span
                onClick={() => deleteChat(chat.id)}
                style={styles.deleteBtn}
              >
                ✕
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 🔹 CHAT AREA */}
      <div style={{ flex: 1 }}>
        <Chat
          messages={activeChat?.messages || []}
          setMessages={updateMessages}
        />
      </div>
    </div>
  );
}

export default App;

const styles = {
  sidebar: {
    width: "260px",
    background: "#111",
    color: "white",
    padding: "15px",
    display: "flex",
    flexDirection: "column"
  },

  logo: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "20px"
  },

  newChat: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#1f1f1f",
    color: "white",
    cursor: "pointer",
    marginBottom: "15px"
  },

  chatList: {
    flex: 1,
    overflowY: "auto"
  },

  chatItem: {
    padding: "10px",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "6px",
    fontSize: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  deleteBtn: {
    color: "#888",
    cursor: "pointer",
    fontSize: "12px",
    marginLeft: "10px"
  }
};