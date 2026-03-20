// models/Message.js

const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat"
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId
  },
  text: String,
  status: {
    type: String,
    enum: ["sent", "delivered", "seen"],
    default: "sent"
  }
}, { timestamps: true });

module.exports = mongoose.model("Message", MessageSchema);