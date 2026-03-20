const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: process.env.DOMAIN, // your frontend
    credentials: true,
  }),
);
app.use(express.json());
app.use("/api/auth", require("./route/Auth"));
app.use("/api", require("./route/Caregiver"));
app.use("/api/info", require("./route/Info"));
app.use("/api/admin", require("./route/Admin"));
app.use("/api/support", require("./route/Support"));
app.use("/api/feedback", require("./route/Feedback"));
app.use("/api/chats", require("./route/Chat"));
app.use("/api/notifications", require("./route/Notification"));

app.use("/uploads", express.static("uploads"));

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("backend is workingg");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongoose connected !!");
  })
  .catch((err) => {
    // console.log(err);
  });
// ---------------------- SOCKET.IO SETUP ----------------------
const http = require("http");
const { Server } = require("socket.io");
const Chat = require("./model/Chat");
const Message = require("./model/Message");
const Notification = require("./model/Notification");

// Create HTTP server from express app
const server = http.createServer(app);

// Socket.IO server
const io = new Server(server, {
  cors: {
    origin: process.env.DOMAIN,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected", socket.id);
socket.on("join_user", (userId) => {
    socket.join(userId);
    console.log("User joined notification room:", userId);
  });
  
  socket.on("join_chat", async (chatId) => {
    socket.join(chatId);

    // mark messages as delivered
    await Message.updateMany(
      { chat: chatId, status: "sent" },
      { status: "delivered" },
    );

    io.to(chatId).emit("messages_delivered", chatId);
  });

  socket.on("send_message", async (data) => {
    const message = await Message.create({
      chat: data.chatId,
      sender: data.sender,
      receiver:data.receiver,
      text: data.text,
      status: "sent",
    }); 

    const chat = await Chat.findById(data.chatId);

    if (!chat) return;

    const receiverId = chat.participants.find(
      (p) => p.toString() !== data.sender,
    );

    // create notification
    await Notification.create({
      receiverId: receiverId,
      senderId: data.sender,
      type: "message",
      title: "New Message",
      message: "You received a new message",
      link: "/messages",
    });

    io.to(receiverId.toString()).emit("notification", {
      type: "message",
      title: "New Message",
      message: "You received a new message",
    });

    io.to(data.chatId).emit("receive_message", message);
  });

  // Seen messages
  socket.on("seen_messages", async ({chatId,userId}) => {
    await Message.updateMany(
    {
      chat: chatId,
      sender: { $ne: userId }, // 🔥 KEY FIX
      status: { $ne: "seen" },
    },
    { status: "seen" }
  );

    io.to(chatId).emit("messages_seen", chatId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});
// -------------------------------------------------------------

server.listen(port, () => {
  // console.log(`Example app listening on port ${port}`);
});
