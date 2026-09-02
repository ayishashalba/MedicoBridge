const express = require("express");

const {
    getPatientProfile,
    updatePatientProfile,
    getMedicalRecords,
} = require("../controllers/patientController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/profile",
    authMiddleware,
    roleMiddleware("Patient"),
    getPatientProfile,
    getMedicalRecords
);

router.put(
    "/profile",
    authMiddleware,
    roleMiddleware("Patient"),
    updatePatientProfile
);

module.exports = router;