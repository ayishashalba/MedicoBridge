const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
} = require('../controllers/offerController');

router.get('/', getOffers);
router.post('/', protect, authorizeRoles('Pharmacy', 'Admin'), createOffer);
router.put('/:id', protect, authorizeRoles('Pharmacy', 'Admin'), updateOffer);
router.delete('/:id', protect, authorizeRoles('Pharmacy', 'Admin'), deleteOffer);

module.exports = router;
