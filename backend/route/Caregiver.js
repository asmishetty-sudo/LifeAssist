const express= require("express")
const { createProfile } = require("../controllers/createCaregiver")
const upload = require("../middleware/upload")

const router = express.Router()

router.post("/caregiver",upload.single("photo"),createProfile)

module.exports = router