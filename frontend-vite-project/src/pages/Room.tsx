import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useWebSocket } from "../services/websocketContext";
import Editor from "../components/Editor";
import Chat from "../components/Chat";
import "../styles/main.css";

const Room: React.FC = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const websocketService = useWebSocket();

  const username = location.state?.username || `Guest_${Date.now()}`;
  const [participants, setParticipants] = useState<
    {
      socketId: string;
      username: string;
    }[]
  >([]);
  const [language, setLanguage] = useState<string>("javascript");
  const [editorContent, setEditorContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [executionResult, setExecutionResult] = useState<string>("");
  const roomUrl = `${window.location.origin}/room/${roomId}`;
  useEffect(() => {
    if (!roomId) {
      console.error("Room ID is missing");
      return;
    }
    console.log("Joining room", roomId, username);
    // Join the room
    websocketService.joinRoom(roomId, username);
    // websocketService.onUserJoined((user) => {
    //   alert(`${user.username} joined the room!`);
    // });
    websocketService.onParticipantsUpdate(setParticipants);
    websocketService.onLanguageChange((newLanguage) => {
      setLanguage(newLanguage);
      fetchBoilerplate(newLanguage, false); // Fetch boilerplate but don't broadcast again
    });
    websocketService.onCodeUpdate((newCode) => {
      setEditorContent(newCode);
    });
    websocketService.onExecutionResult((result) => {
      setExecutionResult(result.stdout!);
    });
    // Cleanup
    return () => {
      websocketService.leaveRoom(roomId);
      websocketService.off("room-participants");
      websocketService.off("language-change");
      websocketService.off("code-update");
      websocketService.off("execution-result");
    };
  }, [roomId, username, websocketService]);
  const fetchBoilerplate = (selectedLanguage: string, notify: boolean) => {
    setLoading(true);
    websocketService.emitWithCallback(
      "get-boilerplate",
      selectedLanguage,
      (response: any) => {
        setLoading(false);
        if (response.success) {
          setEditorContent(response.code);
          if (notify) {
            websocketService.sendCodeUpdate(roomId!, response.code); // Notify others only if required
          }
        } else {
          console.error(response.error);
        }
      }
    );
  };
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    fetchBoilerplate(newLanguage, true); // Fetch boilerplate dynamically
    websocketService.changeLanguage(roomId!, newLanguage); // Notify backend
  };

  const handleRunCode = () => {
    websocketService.submitCode(roomId!, editorContent, language);
  };
  return (
    <div className="room-container">
      <div className="sidebar">
        <h3>Room ID: {roomId}</h3>
        <h4>Participants</h4>
        {/* <ul>
          {participants.map((user) => (
            <li key={user.socketId}>{user.username}</li>
          ))}
        </ul> */}
        {/* <div className="invite-section">
          <input type="text" value={roomUrl} readOnly />
          <button
            onClick={() => {
              navigator.clipboard.writeText(roomUrl);
              alert("Invite link copied!");
            }}
          >
            Copy Link
          </button>
        </div> */}
        <div className="language-selector">
          <label htmlFor="language">Select Language:</label>
          <select
            id="language"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
          </select>
          {loading && <span>Loading...</span>}
        </div>
        <button onClick={handleRunCode} className="submit-button">
          Run Code
        </button>
      </div>
      <div className="main-section">
        <Editor
          roomId={roomId!}
          language={language}
          value={editorContent}
          onChange={(content) => {
            setEditorContent(content); // Update parent state
            websocketService.sendCodeUpdate(roomId!, content); // Notify others
          }}
        />
        <Chat roomId={roomId!} username={username} />
        <div className="execution-result">
          <h4 className="result-header">Execution Result:</h4>

          {executionResult ? (
            <div className="result-content">
              <div className="result-section">
                <strong>Standard Output:</strong>
                <pre className="result-stdout">
                  {executionResult || "No output."}
                </pre>
              </div>
            </div>
          ) : (
            <div className="no-result">No result yet...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Room;
