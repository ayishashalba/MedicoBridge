const Cart = require("../models/Cart");
const Medicine = require("../models/Medicine");

const {
    successResponse,
    validationErrorResponse,
    notFoundResponse,
    serverErrorResponse,
} = require("../utils/apiResponse");
const { isValidObjectId } = require("../utils/validators");

const calculateCartTotal = async (cart) => {
    let total = 0;
    for (const item of cart.items) {
        total += item.price * item.quantity;
    }
    cart.totalAmount = Math.round(total * 100) / 100;
};

// Get current patient cart
const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ patientId: req.user.id }).populate({
            path: "items.medicineId",
            select: "name genericName price discountPrice category image stock pharmacyId pharmacyType",
        });

        if (!cart) {
            cart = await Cart.create({
                patientId: req.user.id,
                items: [],
                totalAmount: 0,
            });
        }

        return successResponse(res, "Cart retrieved successfully", { cart });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch cart", error);
    }
};

// Add / increment item in cart
const addToCart = async (req, res) => {
    try {
        const { medicineId, quantity = 1 } = req.body;

        if (!medicineId || !isValidObjectId(medicineId)) {
            return validationErrorResponse(res, "Valid medicine ID is required");
        }

        const medicine = await Medicine.findById(medicineId);
        if (!medicine || !medicine.isActive) {
            return notFoundResponse(res, "Medicine not found or unavailable");
        }

        if (medicine.stock < Number(quantity)) {
            return validationErrorResponse(res, "Requested quantity exceeds available stock");
        }

        let cart = await Cart.findOne({ patientId: req.user.id });
        if (!cart) {
            cart = new Cart({
                patientId: req.user.id,
                items: [],
                totalAmount: 0,
            });
        }

        const price = medicine.discountPrice > 0 ? medicine.discountPrice : medicine.price;
        const existingItemIndex = cart.items.findIndex(
            (item) => item.medicineId.toString() === medicineId.toString()
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += Number(quantity);
            cart.items[existingItemIndex].price = price;
        } else {
            cart.items.push({
                medicineId,
                quantity: Number(quantity),
                price,
            });
        }

        await calculateCartTotal(cart);
        await cart.save();

        const populatedCart = await Cart.findById(cart._id).populate({
            path: "items.medicineId",
            select: "name genericName price discountPrice category image stock pharmacyId",
        });

        return successResponse(res, "Item added to cart", { cart: populatedCart });
    } catch (error) {
        return serverErrorResponse(res, "Unable to add item to cart", error);
    }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
    try {
        const { medicineId } = req.params;
        const { quantity } = req.body;

        if (!medicineId || !isValidObjectId(medicineId)) {
            return validationErrorResponse(res, "Valid medicine ID is required");
        }

        const qty = Number(quantity);
        if (isNaN(qty) || qty < 0) {
            return validationErrorResponse(res, "Quantity must be 0 or greater");
        }

        let cart = await Cart.findOne({ patientId: req.user.id });
        if (!cart) {
            return notFoundResponse(res, "Cart not found");
        }

        if (qty === 0) {
            cart.items = cart.items.filter(
                (item) => item.medicineId.toString() !== medicineId.toString()
            );
        } else {
            const itemIndex = cart.items.findIndex(
                (item) => item.medicineId.toString() === medicineId.toString()
            );

            if (itemIndex === -1) {
                return notFoundResponse(res, "Item not found in cart");
            }

            cart.items[itemIndex].quantity = qty;
        }

        await calculateCartTotal(cart);
        await cart.save();

        const populatedCart = await Cart.findById(cart._id).populate({
            path: "items.medicineId",
            select: "name genericName price discountPrice category image stock pharmacyId",
        });

        return successResponse(res, "Cart updated successfully", { cart: populatedCart });
    } catch (error) {
        return serverErrorResponse(res, "Unable to update cart", error);
    }
};

// Remove single item from cart
const removeFromCart = async (req, res) => {
    try {
        const { medicineId } = req.params;
        if (!medicineId || !isValidObjectId(medicineId)) {
            return validationErrorResponse(res, "Valid medicine ID is required");
        }

        const cart = await Cart.findOne({ patientId: req.user.id });
        if (!cart) {
            return notFoundResponse(res, "Cart not found");
        }

        cart.items = cart.items.filter(
            (item) => item.medicineId.toString() !== medicineId.toString()
        );

        await calculateCartTotal(cart);
        await cart.save();

        return successResponse(res, "Item removed from cart", { cart });
    } catch (error) {
        return serverErrorResponse(res, "Unable to remove item from cart", error);
    }
};

// Clear entire cart
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ patientId: req.user.id });
        if (cart) {
            cart.items = [];
            cart.totalAmount = 0;
            await cart.save();
        }

        return successResponse(res, "Cart cleared successfully", { cart });
    } catch (error) {
        return serverErrorResponse(res, "Unable to clear cart", error);
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
};
