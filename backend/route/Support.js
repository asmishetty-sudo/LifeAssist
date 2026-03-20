const express = require("express");
const router = express.Router();
const { authMiddleware, authMiddlewareSus } = require("../middleware/authUser");
const { addComplaint, getUserComplaints, addSuspensionComplaint } = require("../controllers/supportControls");


// Submit complaint
router.post("/complaints", authMiddleware, addComplaint);

// Get all complaints for logged-in user
router.get("/complaints", authMiddleware, getUserComplaints);

// Suspended users can submit complaints
router.post("/complaints/suspension", authMiddlewareSus, addSuspensionComplaint);


module.exports = router; 