import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import jwtDecode from "jwt-decode";
import { getSocket } from "../utils/socket";
import Config from "../config/Config.json";

const Chat = ({ receiverId, receiverName, onClose }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");
  let senderId, senderName;
  try {
    const decoded = jwtDecode(token);
    senderId = decoded.userId;
    senderName = decoded.userName;
  } catch (err) {
    senderId = null;
    senderName = "";
  }

  // Load persisted chat history for this conversation
  useEffect(() => {
    if (!senderId || !receiverId) return;
    axios
      .get(`${Config.SERVER_URL}chat/history/${receiverId}`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then((res) => setMessages(res.data.messages || []))
      .catch((err) => console.log(err));
  }, [senderId, receiverId, token]);

  // Subscribe to live messages on the shared socket
  useEffect(() => {
    if (!senderId) return;
    const socket = getSocket(senderId);

    const onReceive = (data) => {
      // Only messages belonging to this 1:1 conversation
      const inThisChat =
        (data.senderId === senderId && data.receiverId === receiverId) ||
        (data.senderId === receiverId && data.receiverId === senderId);
      if (!inThisChat) return;
      setMessages((prev) => {
        if (data._id && prev.some((m) => m._id === data._id)) return prev;
        return [...prev, data];
      });
    };

    const onOnline = (onlineUsers) =>
      setIsOnline(onlineUsers.includes(receiverId));

    socket.on("receiveMessage", onReceive);
    socket.on("onlineUsers", onOnline);

    return () => {
      socket.off("receiveMessage", onReceive);
      socket.off("onlineUsers", onOnline);
    };
  }, [senderId, receiverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() === "" || !senderId) return;

    const socket = getSocket(senderId);
    socket.emit("sendMessage", {
      senderId,
      receiverId,
      message: message.trim(),
      senderName,
    });
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const styles = {
    overlay: {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      zIndex: 9999,
    },
    chatBox: {
      width: "350px",
      height: "500px",
      background: "white",
      borderRadius: "20px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    },
    header: {
      background: "linear-gradient(135deg, #1a1a2e, #0f3460)",
      padding: "16px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerLeft: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    avatar: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      background: "#4cc9f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      fontWeight: "700",
      color: "white",
    },
    headerName: {
      color: "white",
      fontWeight: "700",
      fontSize: "15px",
      margin: 0,
    },
    onlineStatus: {
      fontSize: "12px",
      color: isOnline ? "#06d6a0" : "#a0aec0",
      margin: 0,
    },
    closeBtn: {
      background: "rgba(255,255,255,0.1)",
      border: "none",
      color: "white",
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      cursor: "pointer",
      fontSize: "16px",
    },
    messagesArea: {
      flex: 1,
      padding: "16px",
      overflowY: "auto",
      background: "#f7fafc",
    },
    emptyMessages: {
      textAlign: "center",
      padding: "40px 20px",
      color: "#a0aec0",
    },
    inputArea: {
      padding: "12px 16px",
      background: "white",
      borderTop: "1px solid #e2e8f0",
      display: "flex",
      gap: "8px",
      alignItems: "center",
    },
    input: {
      flex: 1,
      padding: "10px 14px",
      border: "2px solid #e2e8f0",
      borderRadius: "50px",
      fontSize: "14px",
      outline: "none",
    },
    sendBtn: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #4361ee, #3a0ca3)",
      border: "none",
      color: "white",
      fontSize: "18px",
      cursor: "pointer",
    },
  };

  const getBubbleStyle = (isSender) => ({
    display: "flex",
    justifyContent: isSender ? "flex-end" : "flex-start",
    marginBottom: "12px",
  });

  const getBubble = (isSender) => ({
    maxWidth: "70%",
    padding: "10px 14px",
    borderRadius: isSender ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
    background: isSender ? "linear-gradient(135deg, #4361ee, #3a0ca3)" : "white",
    color: isSender ? "white" : "#2d3748",
    fontSize: "14px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  });

  return (
    <div style={styles.overlay}>
      <div style={styles.chatBox}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.avatar}>
              {receiverName ? receiverName[0].toUpperCase() : "U"}
            </div>
            <div>
              <p style={styles.headerName}>{receiverName}</p>
              <p style={styles.onlineStatus}>
                {isOnline ? "🟢 Online" : "⚫ Offline"}
              </p>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Messages */}
        <div style={styles.messagesArea}>
          {messages.length === 0 ? (
            <div style={styles.emptyMessages}>
              <div style={{ fontSize: "40px", marginBottom: "8px" }}>💬</div>
              <p style={{ fontSize: "14px" }}>
                Start a conversation with {receiverName}!
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isSender = msg.senderId === senderId;
              const ts = msg.timestamp || msg.createdAt;
              return (
                <div key={msg._id || index} style={getBubbleStyle(isSender)}>
                  <div style={getBubble(isSender)}>
                    <p style={{ fontSize: "11px", color: isSender ? "rgba(255,255,255,0.7)" : "#a0aec0", margin: "0 0 4px 0", fontWeight: "600" }}>
                      {isSender ? "You" : msg.senderName}
                    </p>
                    <p style={{ margin: 0 }}>{msg.message}</p>
                    <p style={{ fontSize: "10px", color: isSender ? "rgba(255,255,255,0.6)" : "#a0aec0", margin: "4px 0 0 0", textAlign: "right" }}>
                      {ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={styles.inputArea}>
          <input
            style={styles.input}
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button style={styles.sendBtn} onClick={sendMessage}>➤</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;