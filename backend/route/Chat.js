// routes/chats.js
const express = require("express");
const router = express.Router();
const Booking = require("../model/Booking");
const Chat = require("../model/Chat");
const Cprofile = require("../model/Cprofile");
const Message = require("../model/Message");
const { authMiddleware } = require("../middleware/authUser");

router.get("/eligible", authMiddleware, async (req, res) => {
  try {
    let myId = req.user.userId;
    if(req.user.userType == "caregiver") {
      const caregiver = await Cprofile.findOne({ userId: req.user.userId });
      if (!caregiver) {
        return res.status(404).json({ error: "Caregiver profile not found" });
      }
      myId = caregiver._id;
    }
    const bookings = await Booking.find({
  status: { $in: ["accepted", "ongoing"] },
  $or: [
    { userId: myId },
    { caregiverId: myId }
  ]
})
  .populate("userId", "name")
  .populate("caregiverId", "fullName");

    const uniquePairs = new Map();

    // create unique user pairs
    bookings.forEach((b) => {
      const key = `${b.userId._id}-${b.caregiverId._id}`;

      if (!uniquePairs.has(key)) {
        uniquePairs.set(key, {
          user: {
            _id: b.userId._id,
            name: b.userId.name,
          },
          caregiver: {
            _id: b.caregiverId._id,
            name: b.caregiverId.fullName,
          },
        });
      }
    });

    const chats = [];

    for (const pair of uniquePairs.values()) {
      let chat = await Chat.findOne({
        participants: { $all: [pair.user._id, pair.caregiver._id] },
      });

      if (!chat) {
        chat = await Chat.create({
          participants: [pair.user._id, pair.caregiver._id],
        });
      }

      // LAST MESSAGE
      const lastMessage = await Message.findOne({ chat: chat._id }).sort({
        createdAt: -1,
      });

      // UNREAD COUNT
      const unreadCount = await Message.countDocuments({
        chat: chat._id,
        receiver: myId,
        status: { $ne: "seen" },
      });

      chats.push({
        ...chat.toObject(),
        participants: [pair.user, pair.caregiver],
        lastMessage,
        unreadCount,
      });
    }

    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:chatId/messages", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId }).sort(
      "createdAt",
    );
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
