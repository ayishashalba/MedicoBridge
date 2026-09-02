const express = require("express");

const {
    getDoctorProfile,
    updateDoctorProfile,
    updateDoctorAvailability,
    getAllDoctors,
    getDoctorById,
    getDoctorPatients,
} = require("../controllers/doctorController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Public doctor directory & details
router.get("/", getAllDoctors);
router.get("/detail/:id", getDoctorById);

// Doctor private profile
router.get(
    "/profile",
    authMiddleware,
    roleMiddleware("doctor"),
    getDoctorProfile
);

router.put(
    "/profile",
    authMiddleware,
    roleMiddleware("doctor"),
    updateDoctorProfile
);

router.put(
    "/availability",
    authMiddleware,
    roleMiddleware("doctor"),
    updateDoctorAvailability
);

// Doctor's patients list
router.get(
    "/patients",
    authMiddleware,
    roleMiddleware("doctor"),
    getDoctorPatients
);

module.exports = router;