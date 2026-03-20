const express = require("express");
const { getFeedbacks, createFeedback } = require("../controllers/feedbackControls");
const { authMiddleware } = require("../middleware/authUser");
const router = express.Router();


router.post("/", authMiddleware, createFeedback);
router.get("/", authMiddleware, getFeedbacks);

module.exports = router;