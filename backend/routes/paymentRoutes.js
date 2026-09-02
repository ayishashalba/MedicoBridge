const express = require("express");
const router = express.Router();

const {
    processPayment,
    verifyPayment,
} = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");

router.post("/process", protect, processPayment);
router.post("/verify", protect, verifyPayment);

module.exports = router;
