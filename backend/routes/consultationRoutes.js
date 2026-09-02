const express = require("express");
const router = express.Router();

const {
    saveConsultation,
    getConsultations,
} = require("../controllers/consultationController");

const protect = require("../middleware/authMiddleware");

router.post("/save", protect, saveConsultation);
router.get("/", protect, getConsultations);

module.exports = router;