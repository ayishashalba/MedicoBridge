const express = require('express');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const {
    getMedicalRecords,
    getMedicalRecordById,
} = require('../controllers/medicalRecordController');

router.use(protect);
router.get('/', getMedicalRecords);
router.get('/:id', getMedicalRecordById);

module.exports = router;