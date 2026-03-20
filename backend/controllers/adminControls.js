
const Service = require("../model/Service");
const Pprofile = require("../model/Pprofile");
const users = require("../model/users");
const Cprofile = require("../model/Cprofile");
const Complaint = require("../model/Complaint");

// POST /api/admin/addServices
exports.addService = async (req, res) => {
  try {
    const { name, description, priceType, price, extraCost } = req.body;

    if (!name || !priceType || !price || !extraCost) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }
 
    const newService = new Service({
      name,
      description,
      priceType,
      price,
      extraCost,
    });
 
    const savedService = await newService.save();

    res.status(201).json({ message: "Service added successfully", service: savedService });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// PUT /api/admin/editService/:id
exports.editService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, priceType, price, extraCost } = req.body;

    if (!name || !priceType || !price || !extraCost) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const updatedService = await Service.findByIdAndUpdate(
      id,
      { name, description, priceType, price, extraCost },
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({ message: "Service updated", service: updatedService });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Service.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Service not found" });

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//       /deletePatient/:id
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Pprofile.findByIdAndDelete(id);

    if (!deleted)
      return res.status(404).json({ message: "Patient not found" });

    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/admin/users/:id/status
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user
    const user = await users.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle isSuspended
    user.isSuspended = !user.isSuspended;

    await user.save();
 
    res.status(200).json({
      message: `User ${user.isSuspended ? "suspended" : "activated"} successfully`,
      isSuspended: user.isSuspended,
    });
  } catch (error) {
    console.error("Toggle User Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};




// DELETE /api/admin/users/:id
// DELETE user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await users.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Optional: clean related data
    await Pprofile.deleteMany({ userId: id });
    await Cprofile.deleteOne({ userId: id });

    await users.findByIdAndDelete(id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


//complaint review
exports.reviewComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = "reviewed";
    await complaint.save();

    res.status(200).json({ message: "Complaint reviewed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



// update caregiver status and verifaction
exports.updateCaregiverStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
console.log(status)
    // Validate status
    const validStatuses = ["pending", "review", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find caregiver
    const caregiver = await Cprofile.findById(id);
    if (!caregiver) {
      return res.status(404).json({ message: "Caregiver not found" });
    }

    // Update status
    caregiver.status = status;
    if(status==="approved"){
      caregiver.verified=true
    }else{
      caregiver.verified=false
    }
    await caregiver.save();

    res.status(200).json({ message: `Caregiver status updated to ${status}`, caregiver });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};