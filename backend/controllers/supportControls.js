const Complaint = require("../model/Complaint");

// /api/support/complaints
exports.addComplaint = async (req, res) => {
  try {
    const user = req.user; // from auth middleware
    if (!user) return res.status(401).json({ message: "Not logged in" });

    const { type, caregiverId, message } = req.body;

    if (!type || !message)
      return res.status(400).json({ message: "All fields are required" });

    const complaintData = {
      userId: user.userId,
      complain: message,
      type,
    };

    if (type === "caregiver") {
      if (!caregiverId)
        return res
          .status(400)
          .json({ message: "Please select a caregiver" });
      complaintData.against = caregiverId;
    }


const complaint = await Complaint.create(complaintData);

    return res
      .status(201)
      .json({ message: "Complaint submitted successfully", complaint });
  } catch (err) {
    console.error("Complaint error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get all complaints of a user
//    /api/support/complaints
exports.getUserComplaints = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Not logged in" });

    const complaints = await Complaint.find({ userId: user.userId })
      .populate("against", "fullName") // get caregiver name
      .sort({ createdAt: -1 });

    return res.status(200).json({ complaints });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


//        /api/support/complaints/suspension
exports.addSuspensionComplaint = async (req, res) => {
  try {
    const user = req.user; // from softAuthMiddleware
    if (!user) return res.status(401).json({ message: "Not logged in" });

    const { message } = req.body;
    if (!message)
      return res.status(400).json({ message: "Message is required" });

    const complaint = await Complaint.create({
      userId: user.userId,
      complain: message,
      type: "other",
    });

    return res
      .status(201)
      .json({ message: "Complaint submitted successfully", complaint });
  } catch (err) {
    console.error("Suspension complaint error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};