const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Connection Error:", err));
};

connectDB();

module.exports = mongoose;
