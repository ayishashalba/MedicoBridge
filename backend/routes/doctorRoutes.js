const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  getProfile,
  updateProfile,
  getDashboard,
  getAppointments,
  updateAppointmentStatus,
  getPrescriptions,
  getPrescriptionById,
  getConsultations,
  getDoctorPatients,
  getDoctorPatientById,
  getAppointmentById,
  getPatientMedicalHistory,
  getDoctorMedicalRecords,
  getDoctorReviews,
  getDoctorSettings,
  updateDoctorSettings,
  changeDoctorPassword,
} = require('../controllers/doctorController');

router.use(protect);
router.use(authorizeRoles('Doctor'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/dashboard', getDashboard);
router.get('/appointments', getAppointments);
router.get('/appointments/:id', getAppointmentById);
router.put('/appointments/:id/status', updateAppointmentStatus);
router.get('/prescriptions', getPrescriptions);
router.get('/prescriptions/:id', getPrescriptionById);
router.get('/consultations', getConsultations);
router.get('/patients', getDoctorPatients);
router.get('/patients/:id/medical-history', getPatientMedicalHistory);
router.get('/patients/:id', getDoctorPatientById);
router.get('/medical-records', getDoctorMedicalRecords);
router.get('/reviews', getDoctorReviews);
router.get('/settings', getDoctorSettings);

router.put('/settings', updateDoctorSettings);

router.put('/settings/password', changeDoctorPassword);

module.exports = router;
