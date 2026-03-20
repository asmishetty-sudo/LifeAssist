//fetches caregiver info

const Booking = require("../model/Booking");
const Cprofile = require("../model/Cprofile");
const Pprofile = require("../model/Pprofile");
const users = require("../model/users");
const Feedback = require("../model/Feedback");
const Complaint = require("../model/Complaint");
const Service = require("../model/Service");
const Notification = require("../model/Notification");

//    /api/info/caregiver
exports.caregiver = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not logged in" });
    }

    if (user.userType !== "caregiver") {
      return res.status(403).json({ message: "Not a caregiver" });
    }

    // checks if profile exists
    const profile = await Cprofile.findOne({ userId: user.userId }).populate({ path: "servicesOffered" });
    if (!profile) {
      return res.status(200).json({ firstLogin: true });
    }

    return res.status(200).json({
      firstLogin: false,
      profile: { 
        name: profile.fullName,
        id: profile._id,
        dob: profile.dob,
        gender: profile.gender,
        govId: profile.govId,
        phone: profile.phone,
        address: profile.address,
        verified: profile.verified,
        experienceYears: profile.experienceYears,
        pastExperience: profile.pastExperience,
        education: profile.education,
        qualifications: profile.qualifications,
        servicesOffered: profile.servicesOffered,
        serviceArea: profile.serviceArea,
        photo: profile.photo,
        status: profile.status,
        bio: profile.bio,
        nooffeedback: profile.nooffeedback,
        rating: profile.rating,
        availability: profile.availability,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//     /api/info/caregiverbookings
exports.caregiverbookings = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not logged in" });
    }

    if (user.userType !== "caregiver") {
      return res.status(403).json({ message: "Not a caregiver" });
    }
    //fetch bookingss
    const caregiver = await Cprofile.findOne({ userId: user.userId });
    const bookings = await Booking.find({ caregiverId: caregiver._id })
      .populate(
        "patientId",
        "name age medicalNeeds address gender allergies econtact",
      )
      .populate("userId", "name email")
      .populate("serviceId", "name price")
      .sort({ createdAt: -1 }); // newest first
    const feedbacks = await Feedback.find({
      caregiverId: caregiver._id,
    }).populate("userId", "_id name");
    // Send response
    res.status(200).json({
      success: true,
      bookings,
      feedbacks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCaregiverServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json({
      success: true,
      services,
    });

  } catch (error) {
    console.error("Error fetching services:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch services",
    });
  }
};

// update profile in caregiver's profile
//  api/info/updateprofile
exports.updateProfile = async (req, res) => {
  try {
    const user = req.user; // Set by your authMiddleware
    if (!user) {
      return res.status(401).json({ message: "Not logged in" });
    }

    if (user.userType !== "caregiver") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Only allow editable fields
    const editableFields = [
      "phone",
      "address",
      "experienceYears",
      "education",
      "bio",
      "pastExperience",
    ];

    const updates = {};
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    const updatedProfile = await Cprofile.findOneAndUpdate(
      { userId: user.userId },
      { $set: updates },
      { new: true }, // return updated document
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res
      .status(200)
      .json({ message: "Profile updated", profile: updatedProfile });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// updating availability
//  api/info/updateavailability
exports.updateAvailability = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Not logged in" });
    if (user.userType !== "caregiver")
      return res.status(403).json({ message: "Not authorized" });

    const { availability } = req.body;

    if (!Array.isArray(availability)) {
      return res
        .status(400)
        .json({ message: "Availability should be an array" });
    }

    const updatedProfile = await Cprofile.findOneAndUpdate(
      { userId: user.userId },
      { $set: { availability } },
      { new: true },
    );

    if (!updatedProfile)
      return res.status(404).json({ message: "Profile not found" });

    return res
      .status(200)
      .json({ message: "Availability updated", profile: updatedProfile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//  /api/info/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { status, finalAmount, paymentStatus } = req.body;

    if (!user || user.userType !== "caregiver")
      return res.status(403).json({ message: "Forbidden" });

    const caregiver = await Cprofile.findOne({ userId: user.userId });
    const booking = await Booking.findOne({
      _id: id,
      caregiverId: caregiver._id,
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Update allowed fields
    if (status) booking.status = status;
    // Update paymentStatus regardless of status
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    // Only allow finalAmount & paymentStatus for completed bookings
    if (status === "completed") {
      if (finalAmount === undefined)
        return res.status(400).json({ message: "Final amount required" });
      
      await Notification.create({
      receiverId: booking.userId,
      type: "feedback",
      title: "Feedback for booking completed",
      message: `Give Feedback for completed booking with ${caregiver.fullName}`,
      link: "/family/reviews",
    });
      booking.endDate = new Date();
      booking.finalAmount = finalAmount;
      booking.paymentStatus = paymentStatus || "unpaid";
    }

    await booking.save();
    await Notification.create({
      receiverId: booking.userId,
      type: "status",
      title: "Booking Updated",
      message: `Your booking with ${caregiver.fullName} is now ${status}`,
      link: "/family/bookings",
    });
    res.status(200).json({ message: `Booking updated`, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//fetches family member info
//    /api/info/family
exports.familyInfo = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not logged in" });
    }

    if (user.userType !== "family") {
      return res.status(403).json({ message: "Not a family user" });
    }

    const patients = await Pprofile.find({ userId: user.userId });

    //Get all bookings where this family user is the requester
    const bookings = await Booking.find({ userId: req.user.userId })
      .populate("caregiverId", "_id fullName")
      .populate("serviceId", "_id name")
      .populate("patientId", "name");

    //Get verified caregivers
    const caregivers = await Cprofile.find(
      { verified: true },
      { dob: 0, govId: 0, email: 0, phone: 0 },
    ).populate({ path: "servicesOffered" });

    const services = await Service.find();

    return res.status(200).json({
      patients,
      bookings,
      caregivers,
      services,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// api/info/addpatients
exports.addPatient = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not logged in" });
    }

    if (user.userType !== "family") {
      return res.status(403).json({ message: "Not a family user" });
    }

    const {
      name,
      age,
      gender,
      medicalNeeds,
      econtact,
      allergies,
      street,
      city,
      state,
      pincode,
      country,
    } = req.body;

    if (!name || !age || !medicalNeeds || !econtact) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const parsedAge = Number(age);

    if (isNaN(parsedAge) || parsedAge < 0) {
      return res.status(400).json({ message: "Invalid age" });
    }

    const newPatient = await Pprofile.create({
      userId: user.userId,
      name,
      age: parsedAge,
      gender,
      econtact,
      allergies,
      medicalNeeds,
      address: {
        street,
        city,
        state,
        pincode,
        country,
      },
    });

    return res.status(201).json({
      message: "Patient added successfully",
      patient: newPatient,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/info/removepatient/:patientId
exports.removePatient = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not logged in" });
    }

    if (user.userType !== "family") {
      return res.status(403).json({ message: "Not a family user" });
    }

    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }

    // Find patient and ensure it belongs to this user
    const patient = await Pprofile.findOne({
      _id: patientId,
      userId: user.userId,
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    await patient.deleteOne();

    return res.status(200).json({ message: "Patient removed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

//           api/info/bookings
exports.addBookings = async (req, res) => {
  try {
    console.log("its fine till here");

    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not logged in" });
    }

    const {
      caregiverId,
      patientId,
      serviceId,
      slot,
      startDate,
      durationType,
      durationValue,
      notes,
      estimatedAmount,
    } = req.body;

    if (
      !caregiverId ||
      !patientId ||
      !serviceId ||
      !slot ||
      !slot.selectedDay ||
      !slot.startTime ||
      !slot.endTime ||
      !startDate ||
      !durationType ||
      !durationValue ||
      !estimatedAmount
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    // Create booking
    const booking = new Booking({
      userId: req.user.userId, // 👈 from JWT, not frontend
      caregiverId,
      patientId,
      serviceId,
      slot,
      startDate,
      durationType,
      durationValue,
      notes,
      estimatedAmount,
    });

    await booking.save();
const User = await users.findOne({ _id: req.user.userId });
    await Notification.create({
      receiverId: caregiverId,
      type: "booking",
      title: "New Booking Request",
      message: `${User.name} requested your service`,
      link: "/caregiver/requests",
    });

    return res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({
      message: "Server error while creating booking",
    });
  }
};

// cancelss booking
exports.cancelBooking = async (req, res) => {
  try {
    const user = req.user; // Set by auth middleware
    const bookingId = req.params.bookingId;

    // 1 Check user type
    if (!user || user.userType !== "family") {
      return res.status(403).json({ message: "Unauthorized: only family can cancel" });
    }

    // 2Find booking by id and userId
    const booking = await Booking.findOne({ _id: bookingId, userId: user.userId });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    //  Update status to cancelled
    booking.status = "cancelled";
    await booking.save();
    const User = await users.findOne({ _id: req.user.userId });
 await Notification.create({
      receiverId: booking.caregiverId,
      type: "status",
      title: "Booking Cancellation",
      message: `${User.name} has cancelled their booking!`,
      link: "/caregiver/bookings",
    });
   
    return res.status(200).json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

//fetches admin info
//    /api/info/admin
exports.admin = async (req, res) => {
  try {
    const [
      caregivers,
      Users,
      patients,
      bookings,
      feedbacks,
      complaints,
      services,
    ] = await Promise.all([
      Cprofile.find().populate({ path: "servicesOffered" }).populate({ path: "userId", select: "_id email" }),
      users.find(),
      Pprofile.find(),
      Booking.find()
        .populate({ path: "patientId", select: "_id name" })
        .populate({ path: "serviceId" }),
      Feedback.find().populate({ path: "userId", select: "_id name" }),
      Complaint.find(),
      Service.find(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        caregivers,
        users: Users,
        patients,
        bookings,
        feedbacks,
        complaints,
        services,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin data",
    });
  }
};
