const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  getAdminRefunds,
  getRefundById,
  getPatientRefunds,
  getRefundByOrderId,
  approveRefund,
  rejectRefund,
  processRefundTransfer,
  retryRefundTransfer,
  uploadRefundQR,
} = require('../controllers/refundController');

router.use(protect);

// Upload QR code image (Patient)
router.post('/upload-qr', authorizeRoles('Patient'), upload.single('qrCodeImage'), uploadRefundQR);

// Patient endpoints
router.get('/patient/my-refunds', authorizeRoles('Patient'), getPatientRefunds);
router.get('/order/:orderId', authorizeRoles('Patient', 'Admin'), getRefundByOrderId);

// Admin endpoints
router.get('/admin', authorizeRoles('Admin'), getAdminRefunds);
router.get('/admin/:id', authorizeRoles('Admin'), getRefundById);
router.put('/admin/:id/approve', authorizeRoles('Admin'), approveRefund);
router.put('/admin/:id/reject', authorizeRoles('Admin'), rejectRefund);
router.post('/admin/:id/process', authorizeRoles('Admin'), processRefundTransfer);
router.post('/admin/:id/retry', authorizeRoles('Admin'), retryRefundTransfer);

// General ID lookup
router.get('/:id', authorizeRoles('Patient', 'Admin'), getRefundById);

module.exports = router;
