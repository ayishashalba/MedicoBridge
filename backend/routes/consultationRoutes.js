const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  saveConsultation,
  getConsultations,
} = require('../controllers/doctorController');

router.use(protect);
router.use(authorizeRoles('Doctor'));

router.post('/save', saveConsultation);
router.get('/', getConsultations);

module.exports = router;
