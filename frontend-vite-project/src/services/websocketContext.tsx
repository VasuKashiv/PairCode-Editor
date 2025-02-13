import React, { createContext, useContext, useEffect, ReactNode } from "react";
import websocketService, { WebSocketService } from "./websocketService";
interface ExecutionResult {
  Title: string;
  stdout: string | null;
  stderr: string | null;
  status: string;
  compile_output: string | null;
  roomId: string;
}
interface WebSocketContextType {
  sendCodeUpdate: (roomId: string, code: string) => void;
  onCodeUpdate: (callback: (code: string) => void) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string) => void;
  joinRoom: (roomId: string, username: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, message: string, username: string) => void;
  onMessageReceived: (
    callback: (data: { username: string; message: string }) => void
  ) => void;
  onParticipantsUpdate: (
    callback: (participants: { socketId: string; username: string }[]) => void
  ) => void;
  emitWithCallback: <T, R>(
    event: string,
    data: T,
    callback: (response: R) => void
  ) => void;
  changeLanguage: (roomId: string, language: string) => void;
  onLanguageChange: (callback: (language: string) => void) => void;
  submitCode: (roomId: string, code: string, language: string) => void;
  onExecutionResult: (callback: (result: ExecutionResult) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  useEffect(() => {
    websocketService.connect();

    return () => {
      websocketService.disconnect();
    };
  }, []);

  const sendCodeUpdate = (roomId: string, code: string) => {
    websocketService.emit("code-update", { roomId, code });
  };

  const emitWithCallback = <T, R>(
    event: string,
    data: T,
    callback: (response: R) => void
  ) => {
    websocketService.emit(event, data, callback);
  };

  const onCodeUpdate = (callback: (code: string) => void) => {
    websocketService.on("code-update", callback);
  };

  const joinRoom = (roomId: string, username: string) => {
    websocketService.emit("join-room", { roomId, username });
  };
  // const joinRoom = (roomId: string, username?: string) => {
  //   // if (!username) {
  //   //   username = prompt("Enter your username:");
  //   //   if (!username) return; // Prevent joining without a username
  //   // }
  //   websocketService.emit("join-room", { roomId, username });
  // };
  const leaveRoom = (roomId: string) => {
    websocketService.emit("leave-room", roomId);
  };

  const sendMessage = (roomId: string, message: string, username: string) => {
    websocketService.emit("chat-message", { roomId, message, username });
  };

  const onMessageReceived = (
    callback: (data: { username: string; message: string }) => void
  ) => {
    websocketService.on("chat-message", callback);
  };

  const onParticipantsUpdate = (
    callback: (participants: { socketId: string; username: string }[]) => void
  ) => {
    websocketService.on("room-participants", callback);
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    websocketService.on(event, callback);
  };

  const off = (event: string) => {
    websocketService.off(event);
  };
  const changeLanguage = (roomId: string, language: string) => {
    websocketService.emit("language-change", { roomId, language });
  };

  const onLanguageChange = (callback: (language: string) => void) => {
    websocketService.on("language-change", callback);
  };

  const submitCode = (roomId: string, code: string, language: string) => {
    websocketService.emit("submit-code", { roomId, code, language });
  };

  const onExecutionResult = (callback: (result: ExecutionResult) => void) => {
    websocketService.on("execution-result", callback);
  };

  return (
    <WebSocketContext.Provider
      value={{
        sendCodeUpdate,
        onCodeUpdate,
        on,
        off,
        joinRoom,
        leaveRoom,
        sendMessage,
        onMessageReceived,
        onParticipantsUpdate,
        emitWithCallback,
        changeLanguage,
        onLanguageChange,
        submitCode,
        onExecutionResult,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
