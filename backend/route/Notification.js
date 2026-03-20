const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const { authMiddleware } = require("../middleware/authUser");

const Notification = require("../model/Notification");
const Cprofile = require("../model/Cprofile"); // caregiver profile model



// helper function to resolve receiverId
const getReceiverId = async (user) => {

  if (user.userType === "family") {
    return user.userId;
  }

  if (user.userType === "caregiver") {

    const caregiver = await Cprofile.findOne({ userId: user.userId });

    if (!caregiver) return null;

    return caregiver._id;
  }

  return null;
};



// ---------------- GET NOTIFICATIONS ----------------
router.get("/", authMiddleware, async (req, res) => {

  try {

    const receiverId = await getReceiverId(req.user);

    if (!receiverId) {
      return res.status(404).json({ message: "User profile not found" });
    }

    const notifications = await Notification
      .find({ receiverId: new mongoose.Types.ObjectId(receiverId) })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(notifications);

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Server error" });

  }

});



// ---------------- UNREAD COUNT ----------------
router.get("/unread-count", authMiddleware, async (req, res) => {

  try {

    const receiverId = await getReceiverId(req.user);

    if (!receiverId) {
      return res.status(404).json({ message: "User profile not found" });
    }

    const count = await Notification.countDocuments({
      receiverId: new mongoose.Types.ObjectId(receiverId),
      read: false
    });

    res.json({ count });

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Server error" });

  }

});



// ---------------- MARK ONE AS READ ----------------
router.put("/:id/read", authMiddleware, async (req, res) => {

  try {

    await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true }
    );

    res.json({ success: true });

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Server error" });

  }

});



// ---------------- MARK ALL AS READ ----------------
router.put("/read-all", authMiddleware, async (req, res) => {

  try {

    const receiverId = await getReceiverId(req.user);

    if (!receiverId) {
      return res.status(404).json({ message: "User profile not found" });
    }

    await Notification.updateMany(
      { receiverId: new mongoose.Types.ObjectId(receiverId) },
      { read: true }
    );

    res.json({ success: true });

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Server error" });

  }

});



module.exports = router;