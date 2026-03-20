const Feedback = require("../model/Feedback");
const Booking = require("../model/Booking");
const Cprofile = require("../model/Cprofile");
const Notification = require("../model/Notification");

// ---------------- CREATE FEEDBACK ----------------
exports.createFeedback = async (req, res) => {
  try {
    const { bookingId, caregiverId, rating, message } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!bookingId || !caregiverId || !rating) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if feedback already exists for this booking
    const existing = await Feedback.findOne({ bookingId, userId });
    if (existing)
      return res.status(400).json({ message: "Feedback already submitted" });

    // Create Feedback
    const feedback = await Feedback.create({
      bookingId,
      caregiverId,
      userId,
      rating,
      message,
    });

    //Update Booking: feedback = true
    await Booking.findByIdAndUpdate(bookingId, { feedBack: true });

    // Update Caregiver rating
    const caregiver = await Cprofile.findById(caregiverId);
    if (caregiver) {
      const totalRating =
        (caregiver.rating || 0) * (caregiver.nooffeedback || 0);
      const newNoOfFeedback = (caregiver.nooffeedback || 0) + 1;
      const newRating = (totalRating + rating) / newNoOfFeedback;

      caregiver.rating = newRating.toFixed(2); // limit to 2 decimals
      caregiver.nooffeedback = newNoOfFeedback;

      await caregiver.save();
    }
    await Notification.create({
      receiverId: caregiverId,
      type: "feedback",
      title: "New Feedback",
      message: "You received a new rating",
      link: "/caregiver/feedback",
    });
    res.status(201).json({ message: "Feedback submitted", feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- GET PREVIOUS FEEDBACKS ----------------
exports.getFeedbacks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const feedbacks = await Feedback.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("bookingId")
      .populate({
        path: "bookingId",
        populate: {
          path: "serviceId",
          select: "name", // only fetch the name
        },
      })
      .populate("caregiverId", "fullName");

    res.status(200).json({ feedbacks, message: "Successful fetch" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
