const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/paymentController');

router.use(protect);

// Razorpay payment flow
router.post('/razorpay/create-order', authorizeRoles('Patient'), createRazorpayOrder);
router.post('/razorpay/verify', authorizeRoles('Patient'), verifyRazorpayPayment);

module.exports = router;
