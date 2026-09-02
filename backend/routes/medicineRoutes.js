const express = require("express");
const router = express.Router();

const {
    searchMedicines,
    getMedicineById,
    getCategories,
} = require("../controllers/medicineController");

router.get("/", searchMedicines);
router.get("/search", searchMedicines);
router.get("/categories", getCategories);
router.get("/:id", getMedicineById);

module.exports = router;
