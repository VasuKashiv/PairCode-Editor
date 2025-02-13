import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/main.css";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substr(2, 8); // Generate a random room ID
    navigate(`/room/${newRoomId}`, { state: { username } });
  };

  const handleJoinRoom = () => {
    if (!roomId.trim() || !username.trim()) {
      alert("Please enter a valid room ID and username.");
      return;
    }
    navigate(`/room/${roomId}`, { state: { username } });
  };

  return (
    <div className="home-container">
      <h1>Collaborative Code Editor</h1>
      <div className="form-container">
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Room ID to join"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={handleJoinRoom}>Join Room</button>
        <button onClick={handleCreateRoom}>Create New Room</button>
      </div>
    </div>
  );
};

export default Home;
