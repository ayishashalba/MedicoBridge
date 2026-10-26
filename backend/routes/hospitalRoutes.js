const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  getProfile,
  updateProfile,
  getDashboard,
  getDoctors,
  addDoctor,
  updateDoctor,
  removeDoctor,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAppointments,
  getHospitalPatients,
  checkInPatient,
  getHospitalStaff,
  getHospitalPharmacyMedicines,
  addHospitalPharmacyMedicine,
  updateHospitalPharmacyMedicine,
  getHospitalPharmacyPrescriptions,
  verifyHospitalPrescription,
  approveHospitalPrescription,
  dispenseHospitalPrescription,
  rejectHospitalPrescription,
  getHospitalOrders,
  updateHospitalOrderStatus,
  getHospitalSettings,
  updateHospitalSettings,
} = require('../controllers/hospitalController');
const {
  getHospitalBeds,
  addBed,
  updateBed,
  deleteBed,
} = require('../controllers/bedController');
const {
  getHospitalInvoices,
  createInvoice,
  updateInvoiceStatus,
  recordInvoicePayment,
  refundInvoice,
  sendInvoiceNotification,
  getHospitalPayments,
  getHospitalInsuranceClaims,
} = require('../controllers/invoiceController');
const {
  getHospitalLabReports,
  createHospitalLabReport,
  updateHospitalLabReport,
  completeHospitalLabReport,
} = require('../controllers/hospitalLabReportController');

router.use(protect);
router.use(authorizeRoles('Hospital'));

// Profile & Dashboard & Settings
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/settings', getHospitalSettings);
router.put('/settings', updateHospitalSettings);
router.get('/dashboard', getDashboard);
router.post('/patients/check-in', checkInPatient);
// Doctor Management
router.get('/doctors', getDoctors);
router.post('/doctors', addDoctor);
router.put('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', removeDoctor);
router.get('/staff', getHospitalStaff);

// Department Management
router.get('/departments', getDepartments);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);

// Appointments & Patients
router.get('/appointments', getAppointments);
router.get('/patients', getHospitalPatients);

// Bed Management
router.get('/beds', getHospitalBeds);
router.post('/beds', addBed);
router.put('/beds/:id', updateBed);
router.delete('/beds/:id', deleteBed);

// Hospital Pharmacy
router.get('/pharmacy/medicines', getHospitalPharmacyMedicines);
router.post('/pharmacy/medicines', addHospitalPharmacyMedicine);
router.put('/pharmacy/medicines/:id', updateHospitalPharmacyMedicine);
router.get('/pharmacy/prescriptions', getHospitalPharmacyPrescriptions);
router.put('/pharmacy/prescriptions/:id/verify', verifyHospitalPrescription);
router.put('/pharmacy/prescriptions/:id/approve', approveHospitalPrescription);
router.put('/pharmacy/prescriptions/:id/dispense', dispenseHospitalPrescription);
router.put('/pharmacy/prescriptions/:id/reject', rejectHospitalPrescription);

// Hospital Pharmacy Orders
router.get('/pharmacy/orders', getHospitalOrders);
router.put('/pharmacy/orders/:id/status', updateHospitalOrderStatus);

// Hospital Lab Reports
router.get('/lab-reports', getHospitalLabReports);
router.post('/lab-reports', createHospitalLabReport);
router.put('/lab-reports/:id', updateHospitalLabReport);
router.put('/lab-reports/:id/complete', completeHospitalLabReport);

// Hospital Invoices & Billing
router.get('/invoices', getHospitalInvoices);
router.post('/invoices', createInvoice);
router.put('/invoices/:id', updateInvoiceStatus);
router.post('/invoices/:id/payment', recordInvoicePayment);
router.post('/invoices/:id/refund', refundInvoice);
router.post('/invoices/:id/send', sendInvoiceNotification);
router.get('/payments', getHospitalPayments);
router.get('/insurance-claims', getHospitalInsuranceClaims);

module.exports = router;
