const rateLimit = require("express-rate-limit");
const { registerUser, loginUser, changePassword, changeUsername, deleteAccount } = require("../controllers/authControl");
const express=require("express");
const { authMiddleware } = require("../middleware/authUser");
const router=express.Router()

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: "Too many attempts, try later"
});


router.post("/register", registerUser)

//route for user Login
router.post("/login", limiter, loginUser)

router.post("/change-password", authMiddleware ,changePassword)
router.post("/change-username", authMiddleware ,changeUsername)
router.delete("/delete-account", authMiddleware ,deleteAccount)

module.exports = router;