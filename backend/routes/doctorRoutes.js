const express = require("express");

const {
    getDoctorProfile,
    updateDoctorProfile,
    updateDoctorAvailability,
} = require("../controllers/doctorController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/profile",
    authMiddleware,
    roleMiddleware("Doctor"),
    getDoctorProfile
);

router.put(
    "/profile",
    authMiddleware,
    roleMiddleware("Doctor"),
    updateDoctorProfile
);

router.put(
    "/availability",
    authMiddleware,
    roleMiddleware("Doctor"),
    updateDoctorAvailability
);

module.exports = router;