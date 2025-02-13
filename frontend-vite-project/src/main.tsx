import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/main.css";
import App from "./App.tsx";
import { WebSocketProvider } from "./services/websocketContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WebSocketProvider>
      <App />
    </WebSocketProvider>
  </StrictMode>
);
