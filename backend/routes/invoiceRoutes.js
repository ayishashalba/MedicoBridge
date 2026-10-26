const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  createInvoice,
  getPatientInvoices,
  getHospitalInvoices,
  updateInvoiceStatus,
  recordInvoicePayment,
  refundInvoice,
  sendInvoiceNotification,
  getHospitalPayments,
  getHospitalInsuranceClaims,
} = require('../controllers/invoiceController');

router.use(protect);

router.post('/', authorizeRoles('Hospital'), createInvoice);
router.get('/patient', authorizeRoles('Patient'), getPatientInvoices);
router.get('/hospital', authorizeRoles('Hospital'), getHospitalInvoices);
router.put('/:id', authorizeRoles('Hospital'), updateInvoiceStatus);
router.post('/:id/payment', authorizeRoles('Hospital'), recordInvoicePayment);
router.post('/:id/refund', authorizeRoles('Hospital'), refundInvoice);
router.post('/:id/send', authorizeRoles('Hospital'), sendInvoiceNotification);
router.get('/hospital/payments', authorizeRoles('Hospital'), getHospitalPayments);
router.get('/hospital/insurance-claims', authorizeRoles('Hospital'), getHospitalInsuranceClaims);

module.exports = router;
