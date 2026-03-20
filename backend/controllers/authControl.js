const validator = require("validator");
const bcrypt = require("bcryptjs");
const users = require("../model/users");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;
  
    if (!name || !email || !password || !userType) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }
      if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email", success: false });
    }
    if (password.length < 6) {
  return res.status(400).json({ message: "Password must be at least 6 characters", success: false });
}
    const existingUser = await users.findOne({ email });
    if (userType.toLowerCase() === "admin") {
      return res
        .status(400)
        .json({ message: "Unauthorized access", success: false });
    }
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already used", success: false });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const User = await users.create({
      name,
      email,
      password: hashedPassword,
      userType,
    });

    if (User) {
      return res
        .status(201)
        .json({ message: "registered successfully", success: true });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server Error", success: false, error: error.message });
  }
};


exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

  const user = await users.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // 🔐 CREATE TOKEN
  const token = jwt.sign(
    {
      userId: user._id,
      userType: user.userType,
      isSuspended: user.isSuspended
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: {
      name: user.name,
          email: user.email,
          userType: user.userType,
          userId: user._id,
          isSuspended: user.isSuspended
    },success: true, message: "Login successfull"
  });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server Error", success: false, error: error.message });
  }
};


//change passwrod
//  /api/auth/change-password

exports.changePassword = async (req, res) => {
  try {
    const user = req.user; // from auth middleware
    if (!user) return res.status(401).json({ message: "Not logged in" });

    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password must match" });
    }

    // Fetch user from DB
    const dbUser = await users.findById(user.userId);
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, dbUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Hash new password
    // const salt = await bcrypt.genSalt(10);  saltingggg

    dbUser.password = await bcrypt.hash(newPassword, 12);

    await dbUser.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// change username
//   /api/auth/change-username
exports.changeUsername = async (req, res) => {
   try {
    const user = req.user; // from auth middleware
    if (!user) return res.status(401).json({ message: "Not logged in" });

    const { username } = req.body;

    if (!username || username.trim() === "") {
      return res.status(400).json({ message: "Username cannot be empty" });
    }

    // Check if username is already taken
    const existingUser = await users.findOne({ name: username });
    if (existingUser) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    // Update current user
    const dbUser = await users.findByIdAndUpdate(
      user.userId,
      { name: username },
      { new: true }
    );

    if (!dbUser) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ message: "Username changed successfully" });
  } catch (err) {
    console.error("Change username error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// /api/auth/delete-account
exports.deleteAccount = async (req, res) => {
  try {
    // req.userId is set by your auth middleware (after verifying JWT)
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    await Pprofile.deleteMany({ userId: userId });
    await Cprofile.deleteOne({ userId: userId });
    // Delete the user
    const deletedUser = await users.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};