const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  senderId: {
    type: mongoose.Schema.Types.ObjectId
  },

  type: {
    type: String,
    enum: ["message","booking","feedback","status"]
  },

  title: String,

  message: String,

  link: String,

  read: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);