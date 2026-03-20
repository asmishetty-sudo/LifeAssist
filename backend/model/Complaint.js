const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    against: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cprofile", // caregiver
    },
    complain: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["caregiver", "other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);