const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  getCoupons,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');

router.get('/', getCoupons);
router.post('/validate', validateCoupon);
router.post('/', protect, authorizeRoles('Admin'), createCoupon);
router.put('/:id', protect, authorizeRoles('Admin'), updateCoupon);
router.delete('/:id', protect, authorizeRoles('Admin'), deleteCoupon);

module.exports = router;
