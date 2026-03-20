const Cprofile = require("../model/Cprofile");


// Submit profile (first time)
exports.createProfile = async (req, res) => {
  try {
   const formData = JSON.parse(req.body.formData);
    const { fullName, dob, govId,gender, address, phone, experienceYears, pastExperience, education,qualifications,servicesOffered,serviceArea, } = formData;
    const photo = req.file?.path;
    const userId = req.body.userId;

    const existing = await Cprofile.findOne({userId});

    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Profile already exists" });
    }

    const profile = await Cprofile.create({
      userId,
      fullName,
      dob,
      govId,
      address,
      phone,
      gender,
      experienceYears,
      pastExperience,
      education,
      qualifications,
      servicesOffered,
      serviceArea,
      photo,
    });
  
    res.status(201).json({
      success: true,
      message: "Profile submitted. Await admin approval.",
      profile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
