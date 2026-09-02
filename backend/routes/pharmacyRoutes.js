const express = require("express");
const router = express.Router();

const {
    getPharmacyProfile,
    updatePharmacyProfile,
    getAllPharmacies,
    getPharmacyById,
    getPharmacyInventory,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    processPrescription,
} = require("../controllers/pharmacyController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// Public routes
router.get("/", getAllPharmacies);
router.get("/detail/:id", getPharmacyById);

// Prescription processing (can be accessed by patient or pharmacy)
router.post("/process-prescription", protect, processPrescription);

// Authenticated Pharmacy Owner routes
router.get("/profile", protect, authorize("pharmacy"), getPharmacyProfile);
router.put("/profile", protect, authorize("pharmacy"), updatePharmacyProfile);

// Inventory CRUD
router.get("/medicines", protect, authorize("pharmacy"), getPharmacyInventory);
router.post("/medicines", protect, authorize("pharmacy"), addMedicine);
router.put("/medicines/:id", protect, authorize("pharmacy"), updateMedicine);
router.delete("/medicines/:id", protect, authorize("pharmacy"), deleteMedicine);

module.exports = router;
