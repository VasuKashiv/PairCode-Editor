import React, { useState, useEffect } from "react";
import { useWebSocket } from "../services/websocketContext";
import "../styles/main.css";

interface ChatProps {
  roomId: string;
  username: string;
}
const Chat: React.FC<ChatProps> = ({ roomId, username }) => {
  const { sendMessage, onMessageReceived, off } = useWebSocket();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    { username: string; message: string }[]
  >([]);

  // Listen for new chat messages
  useEffect(() => {
    const handleNewMessage = (data: { username: string; message: string }) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    };

    onMessageReceived(handleNewMessage);

    return () => {
      off("chat-message"); // Clean up the listener
    };
  }, [onMessageReceived, off]);

  // Handle form submission for sending messages
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim()) {
      sendMessage(roomId, message, username);
      setMessage("");
    }
  };
  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${
              msg.username === username ? "chat-message-you" : ""
            }`}
          >
            <strong>{msg.username}: </strong>
            <span>{msg.message}</span>
          </div>
        ))}
      </div>
      <form className="chat-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
        />
        <button type="submit" className="chat-send-btn">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
