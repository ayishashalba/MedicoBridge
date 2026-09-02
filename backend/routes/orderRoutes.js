const express = require("express");
const router = express.Router();

const {
    placeOrder,
    getPatientOrders,
    getPharmacyOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.use(protect);

// Patient endpoints
router.post("/", authorize("patient"), placeOrder);
router.get("/patient", authorize("patient"), getPatientOrders);
router.get("/", authorize("patient"), getPatientOrders);

// Pharmacy endpoints
router.get("/pharmacy", authorize("pharmacy"), getPharmacyOrders);
router.put("/:id/status", authorize("pharmacy"), updateOrderStatus);

// General authenticated endpoints
router.get("/:id", getOrderById);
router.put("/:id/cancel", cancelOrder);

module.exports = router;
