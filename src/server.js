const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("./config/db");
const {
  handleSocketConnection,
} = require("../src/controllers/socketControllers");
const roomRoutes = require("./routes/roomRoutes");
// const authRoutes = require("./routes/authRoutes");
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Routes
// app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

// Socket.IO setup
io.on("connection", (socket) => handleSocketConnection(socket, io));

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
