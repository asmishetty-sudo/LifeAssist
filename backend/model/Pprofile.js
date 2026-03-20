const mongoose = require("mongoose");

const profileSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Others"],
    },
    medicalNeeds: {
      type: String, 
      required: true,
    },
    allergies: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    econtact:{ type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Pprofile", profileSchema);
