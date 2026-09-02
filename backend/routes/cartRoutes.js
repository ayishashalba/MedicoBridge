const express = require("express");
const router = express.Router();

const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} = require("../controllers/cartController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.use(protect);
router.use(authorize("patient"));

router.get("/", getCart);
router.post("/items", addToCart);
router.put("/items/:medicineId", updateCartItem);
router.delete("/items/:medicineId", removeFromCart);
router.delete("/", clearCart);

module.exports = router;
