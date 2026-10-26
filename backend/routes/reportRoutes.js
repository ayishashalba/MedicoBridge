const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  createLabReport,
  getPatientLabReports,
  createMedicalReport,
  getPatientMedicalReports,
  getMedicalReportById,
} = require('../controllers/reportController');

// Lab Reports
router.post('/lab-reports', protect, authorizeRoles('Hospital', 'Doctor'), createLabReport);
router.get('/lab-reports', protect, authorizeRoles('Patient'), getPatientLabReports);

// Medical Reports
router.post('/medical-reports', protect, authorizeRoles('Hospital', 'Doctor'), createMedicalReport);
router.get('/medical-reports', protect, authorizeRoles('Patient'), getPatientMedicalReports);
router.get('/medical-reports/:id', protect, getMedicalReportById);

module.exports = router;
