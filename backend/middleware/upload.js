const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// storage config
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

// file filter 
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only JPG and PNG allowed"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;
