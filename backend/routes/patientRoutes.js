const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  getProfile,
  updateProfile,
  changePassword,
  searchDoctors,
  getAppointments,
  getAppointmentById,
  getMedicalRecords,
  getMedicalRecordById,
  getPrescriptions,
  getPrescriptionById,
  getLabReports,
  getLabReportById,
  getMedicalReports,
  getMedicalReportById,
  getInvoices,
  getOrders,
  getOrderById,
  getPatientDoctorById,
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment,
  getDoctorBookedSlots,
  submitAppointmentFeedback,
} = require('../controllers/patientController');
const {
  createOrder,
  cancelOrderItem,
  cancelOrder,
  reorderOrder,
} = require('../controllers/orderController');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  dismissNotification,
} = require('../controllers/notificationController');

// All patient routes require authentication and Patient role
router.use(protect);
router.use(authorizeRoles('Patient'));

router.get('/profile', getProfile);
router.put('/profile', upload.single('profileImage'), updateProfile);
router.put('/password', changePassword);
router.get('/doctors', searchDoctors);
router.get('/doctors/:id', getPatientDoctorById);
router.get('/doctors/:id/booked-slots', getDoctorBookedSlots);
router.get('/appointments', getAppointments);
router.get('/appointments/:id', getAppointmentById);
router.get('/consultations/:id', getAppointmentById);
router.post('/appointments/book', bookAppointment);
router.delete('/appointments/:id', cancelAppointment);
router.put('/appointments/:id/reschedule', rescheduleAppointment);
router.post('/appointments/:id/feedback', submitAppointmentFeedback);
router.get('/prescriptions', getPrescriptions);
router.get('/prescriptions/:id', getPrescriptionById);
router.get('/medical-records', getMedicalRecords);
router.get('/medical-records/:id', getMedicalRecordById);
router.get('/lab-reports', getLabReports);
router.get('/lab-reports/:id', getLabReportById);
router.get('/medical-reports', getMedicalReports);
router.get('/medical-reports/:id', getMedicalReportById);
router.get('/invoices', getInvoices);

router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);
router.post('/orders', createOrder);
router.post('/orders/:id/cancel-item', cancelOrderItem);
router.post('/orders/:id/cancel', cancelOrder);
router.post('/orders/:id/reorder', reorderOrder);

router.get('/notifications', getNotifications);
router.put('/notifications/read-all', markAllAsRead);
router.put('/notifications/:id/read', markAsRead);
router.put('/notifications/:id/dismiss', dismissNotification);
router.delete('/notifications/:id', dismissNotification);

module.exports = router;

