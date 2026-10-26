const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const {
  register,
  verifyOtp,
  resendOtp,
  login,
  googleLogin,
  logout,
  getMe,
} = require('../controllers/authController');

// Registration with multi-file upload support (doctor/hospital licenses & profile images)
router.post(
  '/register',
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'medicalLicense', maxCount: 1 },
  ]),
  register
);

// Hospital register alias if used by frontend
router.post(
  '/register-hospital',
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'medicalLicense', maxCount: 1 },
  ]),
  register
);

// Email OTP Verification
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);

// Login & Logout
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/logout', logout);

// Current user
router.get('/me', protect, getMe);

module.exports = router;
