const express = require('express');
const router = express.Router();
const { searchBloodDonors } = require('../controllers/patientController');

router.get('/search', searchBloodDonors);

module.exports = router;
