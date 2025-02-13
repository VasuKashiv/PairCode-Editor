const boilerplate = require("../constants/boilerplate");
const { promisify } = require("util");
const dotenv = require("dotenv");
const redis = require("redis");
const rooms = {};
const userMap = {};
dotenv.config();
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

const redisClientSubscribing = redis.createClient({
  url: process.env.REDIS_URL,
});

redisClient.connect().catch((err) => {
  console.log(err);
});
redisClientSubscribing.connect().catch((err) => {
  console.log(err);
});
// Redis queue name
const QUEUE_NAME = "codeQueue";

const handleSocketConnection = (socket, io) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);
    userMap[socket.id] = username;
    console.log(`User ${username} (${socket.id}) joined room ${roomId}`);

    if (!rooms[roomId]) {
      rooms[roomId] = { code: "", language: "javascript" };
    }
    // rooms[roomId].participants = [
    //   ...rooms[roomId].participants.filter(
    //     (user) => user.socketId !== socket.id
    //   ),
    //   { socketId: socket.id, username },
    // ];

    socket.emit("room-data", rooms[roomId]);

    const participants = Array.from(
      io.sockets.adapter.rooms.get(roomId) || []
    ).map((id) => ({
      socketId: id,
      username: userMap[id] || "Unknown",
    }));
    io.to(roomId).emit("room-participants", participants);
    // io.to(roomId).emit("room-participants", rooms[roomId].participants);
  });

  socket.on("code-update", ({ roomId, code }) => {
    if (rooms[roomId]) {
      rooms[roomId].code = code;
    }
    socket.to(roomId).emit("code-update", code);
  });

  socket.on("language-change", ({ roomId, language }) => {
    if (rooms[roomId]) {
      rooms[roomId].language = language;
    }
    io.to(roomId).emit("language-change", language);
  });

  socket.on("submit-code", async ({ roomId, code, language }) => {
    console.log(
      `Code submission received: Room ${roomId}, Language ${language}`
    );
    const job = { roomId, code, language, submittedAt: Date.now() };
    try {
      await redisClient.lPush(QUEUE_NAME, JSON.stringify(job));
      console.log(`Code submission added to queue for room ${roomId}`);

      redisClientSubscribing.subscribe(roomId, (message) => {
        try {
          redisClientSubscribing.unsubscribe(roomId);
          const parsedResult = JSON.parse(message);
          const resultMessage = {
            Title: "Result",
            stdout: parsedResult.stdout,
            stderr: parsedResult.stderr,
            status: parsedResult.status.description,
            compile_output: parsedResult.compile_output,
            roomId: roomId,
          };
          io.to(resultMessage.roomId).emit("execution-result", resultMessage);
          console.log(
            `Execution result broadcasted for room ${resultMessage.roomId}:`,
            resultMessage
          );
        } catch (error) {
          console.error("Error subscribing to channel:", error);
        }
      });
    } catch (err) {
      console.error("Error pushing to Redis queue:", err);
    }
  });

  socket.on("chat-message", ({ roomId, message, username }) => {
    const chatData = { username, message };
    io.to(roomId).emit("chat-message", chatData);
  });

  socket.on("get-boilerplate", (language, callback) => {
    if (boilerplate[language]) {
      callback({ success: true, code: boilerplate[language] });
    } else {
      callback({ success: false, error: "Language not supported" });
    }
  });

  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);
    delete userMap[socket.id];

    const participants = Array.from(
      io.sockets.adapter.rooms.get(roomId) || []
    ).map((id) => ({
      socketId: id,
      username: userMap[id] || "Unknown",
    }));
    io.to(roomId).emit("room-participants", participants);
  });

  socket.on("disconnect", () => {
    delete userMap[socket.id];

    for (const roomId of Object.keys(rooms)) {
      const participants = Array.from(
        io.sockets.adapter.rooms.get(roomId) || []
      ).map((id) => ({
        socketId: id,
        username: userMap[id] || "Unknown",
      }));
      io.to(roomId).emit("room-participants", participants);

      if (!participants.length) {
        delete rooms[roomId];
      }
    }

    // console.log(`User disconnected: ${socket.id}`);
    // const socketId = socket.id;
    // const username = userMap[socketId];

    // if (username) {
    //   console.log(`User ${username} (${socketId}) disconnected`);

    //   // Find the room the user was in and remove them
    //   for (const roomId in rooms) {
    //     rooms[roomId].participants = rooms[roomId].participants.filter(
    //       (user) => user.socketId !== socketId
    //     );

    //     // Notify remaining users
    //     io.to(roomId).emit("room-participants", rooms[roomId].participants);
    //   }
    // }

    // delete userMap[socketId]; // Remove user from the map
  });
};

module.exports = { handleSocketConnection };
