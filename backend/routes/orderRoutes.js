const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
  createOrder,
  getPatientOrders,
  getPharmacyOrders,
  updatePharmacyOrderStatus,
  getOrderById,
  cancelOrderItem,
  cancelOrder,
  reorderOrder,
} = require('../controllers/orderController');

router.use(protect);

router.post('/', authorizeRoles('Patient'), createOrder);
router.get('/patient', authorizeRoles('Patient'), getPatientOrders);
router.get('/pharmacy', authorizeRoles('Pharmacy'), getPharmacyOrders);
router.get('/:id', authorizeRoles('Patient', 'Pharmacy', 'Admin'), getOrderById);
router.put('/pharmacy/:id', authorizeRoles('Pharmacy'), updatePharmacyOrderStatus);
router.post('/:id/cancel-item', authorizeRoles('Patient', 'Admin'), cancelOrderItem);
router.post('/:id/cancel', authorizeRoles('Patient', 'Admin'), cancelOrder);
router.post('/:id/reorder', authorizeRoles('Patient'), reorderOrder);

module.exports = router;

