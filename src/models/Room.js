const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomId: { type: String, unique: true, required: true },
  participants: [
    {
      username: { type: String, required: true },
      socketId: { type: String, required: true },
    },
  ],
  code: { type: String, default: "" },
});

module.exports = mongoose.model("Room", roomSchema);
