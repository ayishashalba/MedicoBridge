const express = require("express");
const router = express.Router();

const {
    saveConsultation,
    getConsultations,
    getConsultationByAppointment,
} = require("../controllers/consultationController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.post("/save", protect, authorize("doctor"), saveConsultation);
router.get("/", protect, getConsultations);
router.get("/appointment/:appointmentId", protect, getConsultationByAppointment);

module.exports = router;