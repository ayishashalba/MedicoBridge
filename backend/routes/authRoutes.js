const express = require("express");

const {
    register,
    verifyOtp,
    resendOtp,
    login,
    logout,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.get("/logout", protect, logout);

module.exports = router;