const express = require("express");
const {
  caregiver,
  admin,
  caregiverbookings,
  updateProfile,
  updateAvailability,
  updateBookingStatus,
  familyInfo,
  addPatient,
  removePatient,
  addBookings,
  cancelBooking,
  getCaregiverServices,
} = require("../controllers/infoControl");
const { authMiddleware, isAdmin } = require("../middleware/authUser");

const router = express.Router();

router.get("/caregiver", authMiddleware, caregiver);
router.get("/caregiverbookings", authMiddleware, caregiverbookings);
router.put("/updateprofile", authMiddleware, updateProfile);
router.put("/updateavailability", authMiddleware, updateAvailability);
router.put("/bookings/:id/status", authMiddleware, updateBookingStatus);
router.get("/caregiverservices", authMiddleware, getCaregiverServices);

router.post("/addpatients", authMiddleware, addPatient);
router.delete("/removepatient/:patientId", authMiddleware, removePatient);
router.post("/bookings", authMiddleware, addBookings);
 router.patch("/bookings/:bookingId/cancel", authMiddleware, cancelBooking);

router.get("/family", authMiddleware, familyInfo);

//fetch all admin data
router.get("/admin", authMiddleware ,isAdmin, admin);

module.exports = router;
