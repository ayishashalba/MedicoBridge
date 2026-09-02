const express = require("express");

const router = express.Router();

const {
    createPrescription,
    getPrescriptions,
    getPrescriptionById,
} = require("../controllers/prescriptionController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.post("/", protect, authorize("doctor"), createPrescription);
router.get("/", protect, getPrescriptions);
router.get("/:id", protect, getPrescriptionById);

module.exports = router;