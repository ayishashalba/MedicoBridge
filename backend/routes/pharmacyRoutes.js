const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  getProfile,
  updateProfile,
  getDashboard,
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  getOrders,
  updateOrderStatus,
  getPrescriptions,
  verifyPrescription,
  getInvoices,
  updateInvoicePaymentStatus,
} = require('../controllers/pharmacyController');

router.use(protect);
router.use(authorizeRoles('Pharmacy'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/dashboard', getDashboard);

router.get('/medicines', getMedicines);
router.post('/medicines', addMedicine);
router.put('/medicines/:id', updateMedicine);
router.delete('/medicines/:id', deleteMedicine);

router.get('/orders', getOrders);
router.put('/orders/:id', updateOrderStatus);
router.get('/invoices', getInvoices);
router.put('/invoices/:id', updateInvoicePaymentStatus);
router.get('/prescriptions', getPrescriptions);
router.put('/prescriptions/:id/verify', verifyPrescription);

module.exports = router;
