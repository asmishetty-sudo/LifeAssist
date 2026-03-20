const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    caregiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cprofile",
      required: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pprofile",
      required: true,
    },

    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    slot: {
      selectedDay: { type: [String], required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
    },

    durationType: {
      type: String,
      enum: ["days", "weeks", "months"],
      required: true,
    },

    durationValue: {
      type: Number,
      required: true,
    },

    notes: {
      type: String,
      default: "",
    },

    estimatedAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "ongoing",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    finalAmount: {
      type: Number,
    },
    feedBack: {
      type: Boolean,
      default: false,
    },
     expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

bookingSchema.pre("save", async function () {
  if (this.isNew) {
    const twoDaysLater = new Date();
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);
    this.expiresAt = twoDaysLater;
  }
});

module.exports = mongoose.model("Booking", bookingSchema);