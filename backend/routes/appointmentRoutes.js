const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment,
} = require('../controllers/patientController');
const {
  updateAppointmentStatus,
} = require('../controllers/doctorController');

router.use(protect);

router.post('/book', authorizeRoles('Patient'), bookAppointment);
router.delete('/:id', authorizeRoles('Patient', 'Doctor', 'Hospital'), cancelAppointment);
router.put('/:id/reschedule', authorizeRoles('Patient'), rescheduleAppointment);
router.put('/:id/status', authorizeRoles('Doctor'), updateAppointmentStatus);

module.exports = router;
