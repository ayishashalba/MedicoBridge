const express = require("express");
const router = express.Router();

const {
    getMedicalReports,
    getMedicalReportById,
    createMedicalReport,
    deleteMedicalReport,
} = require("../controllers/medicalReportController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.use(protect);

router.get("/", getMedicalReports);
router.get("/:id", getMedicalReportById);
router.post("/", authorize("doctor", "hospital"), createMedicalReport);
router.delete("/:id", authorize("doctor", "hospital"), deleteMedicalReport);

module.exports = router;
