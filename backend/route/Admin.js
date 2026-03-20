const express= require("express")
const { authMiddleware, isAdmin } = require("../middleware/authUser")
const { addService, editService, deleteService, deletePatient, toggleUserStatus, deleteUser, reviewComplaint, updateCaregiverStatus } = require("../controllers/adminControls")

const router = express.Router()

router.post("/addServices", authMiddleware,isAdmin,addService)
router.put("/editService/:id", authMiddleware,isAdmin,editService)
router.delete("/deleteServices/:id",authMiddleware,isAdmin, deleteService);

router.delete("/deletePatient/:id",authMiddleware,isAdmin, deletePatient);

router.patch("/users/:id/status", authMiddleware,isAdmin, toggleUserStatus);
router.delete("/users/:id",authMiddleware,isAdmin, deleteUser);


router.patch("/complaints/:id/review",authMiddleware,isAdmin,reviewComplaint);

// update caregiver status and verification
router.patch("/caregivers/:id/status",authMiddleware,isAdmin, updateCaregiverStatus);


module.exports = router 