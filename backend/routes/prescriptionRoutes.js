const express = require("express");

const router = express.Router();

const {
    createPrescription,
    getPrescriptions,
} = require("../controllers/prescriptionController");

const protect = require("../middleware/authMiddleware");

router.post("/", protect, createPrescription);

router.get("/", protect, getPrescriptions);

module.exports = router;