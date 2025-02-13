import { io, Socket } from "socket.io-client";

const SERVER_URL = "http://localhost:8080"; // Replace with your backend server URL

export class WebSocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SERVER_URL);
      console.log("WebSocket connected");
    }
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    console.log("WebSocket disconnected");
  }

  emit<T, R>(event: string, data: T, callback?: (response: R) => void) {
    this.socket?.emit(event, data, callback);
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string) {
    this.socket?.off(event);
  }
}

const websocketService = new WebSocketService();
export default websocketService;
