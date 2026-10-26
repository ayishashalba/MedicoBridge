const express = require('express');
const router = express.Router();
const { getAllMedicines, getMedicineById, processPrescription } = require('../controllers/medicineController');

// Public endpoints to browse and view medicines
router.get('/', getAllMedicines);
router.post('/process-prescription', processPrescription);
router.get('/:id', getMedicineById);

module.exports = router;
