const express = require("express");
const router = express.Router();

const {
    getInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoicePayment,
} = require("../controllers/invoiceController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.use(protect);

router.get("/", getInvoices);
router.get("/:id", getInvoiceById);
router.post("/", authorize("hospital", "doctor", "pharmacy"), createInvoice);
router.put("/:id/payment", authorize("hospital", "doctor", "pharmacy"), updateInvoicePayment);

module.exports = router;
