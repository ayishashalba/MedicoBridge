const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { createReview, getMedicineReviews } = require('../controllers/reviewController');

router.post('/', protect, authorizeRoles('Patient'), createReview);
router.get('/:medicineId', getMedicineReviews);

module.exports = router;
