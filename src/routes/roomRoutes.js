const express = require("express");
const Room = require("../models/Room");
const router = express.Router();
const Message = require("../models/Message");

// Create Room
router.post("/create", async (req, res) => {
  try {
    const { roomName } = req.body;
    const newRoom = new Room({ roomName });
    await newRoom.save();
    res.status(201).json({ message: "Room created", roomId: newRoom._id });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Join Room
router.post("/join", async (req, res) => {
  try {
    const { roomId } = req.body;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });

    res.status(200).json({ message: "Room joined", roomId: room._id });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/:roomId/messages", async (req, res) => {
  const { roomId } = req.params;
  const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
  res.json(messages);
});

module.exports = router;
