import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const JoinRoom = () => {
  const { roomId } = useParams();
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!username) return alert("Enter a username");
    navigate(`/room/${roomId}`, { state: { username } });
  };

  return (
    <div className="join-room-container">
      <h3>Join Room: {roomId}</h3>
      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleJoin}>Join Room</button>
    </div>
  );
};

export default JoinRoom;
