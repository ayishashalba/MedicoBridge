const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  createPrescription,
  updatePrescription,
  getPrescriptions,
  getPrescriptionById,
  sendPrescriptionToPatient,
} = require('../controllers/doctorController');

router.use(protect);

router.post('/', authorizeRoles('Doctor'), createPrescription);
router.get('/', authorizeRoles('Doctor'), getPrescriptions);
router.get('/:id', authorizeRoles('Doctor'), getPrescriptionById);
router.put('/:id', authorizeRoles('Doctor'), updatePrescription);
router.post('/:id/send', authorizeRoles('Doctor'), sendPrescriptionToPatient);

module.exports = router;
