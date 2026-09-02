const express = require("express");
const router = express.Router();

const {
    getActiveOffers,
    getAllOffers,
    createOffer,
    updateOffer,
    deleteOffer,
} = require("../controllers/offerController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// Public
router.get("/", getActiveOffers);

// Admin
router.get("/all", protect, authorize("admin"), getAllOffers);
router.post("/", protect, authorize("admin"), createOffer);
router.put("/:id", protect, authorize("admin"), updateOffer);
router.delete("/:id", protect, authorize("admin"), deleteOffer);

module.exports = router;
