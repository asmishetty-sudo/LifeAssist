const mongoose = require("mongoose");

const profileSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },

    // Identity Info
    fullName: { type: String, required: true },
    dob: { type: Date, required: true },
    govId: { type: String, required: true },
    address: { type: String, required: true },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    phone: { type: String, required: true },
    // Experience
    experienceYears: { type: Number, required: true },
    pastExperience: { type: String, required: true },
    education: { type: String, required: true },
    bio: { type: String },
    photo: { type: String, required: true }, // store image URL

    // Admin approval
    status: {
      type: String,
      enum: ["pending","review","approved", "rejected"],
      default: "pending",
    },

    qualifications: {
      type: [String],
      enum: [
        "ANM",
        "GNM",
        "B.Sc Nursing",
        "M.Sc Nursing",
        "CNA",
        "Physiotherapist",
        "Elder Care Assistant",
        "CPR Certified",
        "First Aid Certified",
        "Dementia Care Training",
        "Palliative Care Training",
      ],
      required: true,
    },
    servicesOffered: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service"
  }
],
    serviceArea: {
      city: { type: String, required: true },
      state: { type: String, required: true },
    },

    verified: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    nooffeedback: {
      type: Number,
      min: 0,
      default:0
    },
    // Availability (NOT required initially)
    availability: [
      {
        day: String,
        startTime: String,
        endTime: String,
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Cprofile", profileSchema);
