const express = require("express");

const {
    getPatientProfile,
    updatePatientProfile,
    getMedicalRecords,
    addMedicalRecord,
    deleteMedicalRecord,
    searchBloodDonors,
} = require("../controllers/patientController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Blood donor search
router.get("/donors", authMiddleware, searchBloodDonors);

// Patient profile
router.get(
    "/profile",
    authMiddleware,
    roleMiddleware("patient"),
    getPatientProfile
);

router.put(
    "/profile",
    authMiddleware,
    roleMiddleware("patient"),
    updatePatientProfile
);

// Medical records
router.get(
    "/records",
    authMiddleware,
    roleMiddleware("patient"),
    getMedicalRecords
);

router.post(
    "/records",
    authMiddleware,
    roleMiddleware("patient"),
    addMedicalRecord
);

router.delete(
    "/records/:id",
    authMiddleware,
    roleMiddleware("patient"),
    deleteMedicalRecord
);

// Accessible by doctor or hospital to view patient records
router.get(
    "/:patientId/medical-records",
    authMiddleware,
    roleMiddleware("doctor", "hospital", "patient"),
    getMedicalRecords
);

module.exports = router;