const Cart = require('../models/Cart');
const Patient = require('../models/Patient');
const Medicine = require('../models/Medicine');
const { calculateMedicineOffer, validateCouponDiscount } = require('../services/pricingService');
const {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendServerError,
} = require('../utils/responseHandler');

/**
 * Recalculate cart totals helper
 */
const recalculateCart = async (cart) => {
  let subtotal = 0;
  let totalOfferDiscount = 0;

  for (let i = 0; i < cart.items.length; i++) {
    const item = cart.items[i];
    const med = await Medicine.findById(item.medicineId);

    if (med) {
      const { offerDiscount, finalUnitPrice } = await calculateMedicineOffer(med._id, med.price);
      item.unitPrice = med.price;
      item.offerDiscount = offerDiscount;
      item.finalUnitPrice = finalUnitPrice;
      item.itemTotal = Number((finalUnitPrice * item.quantity).toFixed(2));

      subtotal += med.price * item.quantity;
      totalOfferDiscount += offerDiscount * item.quantity;
    }
  }

  const subtotalAfterOffers = Math.max(0, subtotal - totalOfferDiscount);

  // Revalidate coupon if present
  let couponDiscount = 0;
  if (cart.couponCode) {
    const couponRes = await validateCouponDiscount(cart.couponCode, subtotalAfterOffers);
    if (couponRes.isValid) {
      couponDiscount = couponRes.discount;
    } else {
      cart.couponCode = '';
      cart.couponDiscount = 0;
    }
  }

  cart.subtotal = Number(subtotal.toFixed(2));
  cart.totalOfferDiscount = Number(totalOfferDiscount.toFixed(2));
  cart.couponDiscount = Number(couponDiscount.toFixed(2));
  cart.totalAmount = Number(Math.max(0, subtotalAfterOffers - couponDiscount).toFixed(2));

  await cart.save();
  return cart;
};

// @desc    Get patient cart
// @route   GET /api/cart
// @access  Private (Patient)
const getCart = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return sendNotFound(res, 'Patient profile not found.');
    }

    let cart = await Cart.findOne({ patientId: patient._id }).populate('items.medicineId');

    if (!cart) {
      cart = await Cart.create({
        patientId: patient._id,
        items: [],
      });
    } else {
      cart = await recalculateCart(cart);
      cart = await Cart.findById(cart._id).populate('items.medicineId');
    }

    return sendSuccess(res, 'Cart fetched successfully.', cart);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch cart.', error);
  }
};

// @desc    Add item to cart or apply coupon
// @route   POST /api/cart
// @access  Private (Patient)
const addToCart = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return sendNotFound(res, 'Patient profile not found.');
    }

    const { medicineId, quantity = 1, couponCode } = req.body;

    let cart = await Cart.findOne({ patientId: patient._id });
    if (!cart) {
      cart = new Cart({ patientId: patient._id, items: [] });
    }

    // Apply Coupon flow
    if (couponCode) {
      const subtotalAfterOffers = Math.max(0, cart.subtotal - cart.totalOfferDiscount);
      const couponRes = await validateCouponDiscount(couponCode, subtotalAfterOffers);

      if (!couponRes.isValid) {
        return sendValidationError(res, couponRes.message, [couponRes.message]);
      }

      cart.couponCode = couponCode.toUpperCase().trim();
      cart.couponDiscount = couponRes.discount;
      await cart.save();
      await recalculateCart(cart);

      const updated = await Cart.findById(cart._id).populate('items.medicineId');
      return sendSuccess(res, 'Coupon applied successfully.', updated);
    }

    // Add Item flow
    if (!medicineId) {
      return sendValidationError(res, 'Validation failed', ['Medicine ID is required.']);
    }

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return sendNotFound(res, 'Medicine not found.');
    }

    if (medicine.isAvailable === false || !medicine.stock || medicine.stock <= 0) {
      return sendValidationError(res, 'This medicine is currently out of stock.', [
        'Out of stock.',
      ]);
    }

    const addQty = Math.max(1, Number(quantity) || 1);

    const existingIndex = cart.items.findIndex(
      (item) => String(item.medicineId?._id || item.medicineId) === String(medicine._id)
    );

    const existingQty = existingIndex > -1 ? Number(cart.items[existingIndex].quantity || 0) : 0;

    if (existingQty >= medicine.stock) {
      return sendValidationError(res, 'All available stock is already added to your cart.', [
        'All available stock is already added to your cart.',
      ]);
    }

    if (existingQty + addQty > medicine.stock) {
      const remainingAllowed = medicine.stock - existingQty;
      return sendValidationError(
        res,
        `Cannot add ${addQty} more. Only ${remainingAllowed} more unit${remainingAllowed === 1 ? '' : 's'} can be added to your cart.`,
        ['Stock limit exceeded.']
      );
    }

    const { offerDiscount, finalUnitPrice } = await calculateMedicineOffer(medicine._id, medicine.price);

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += addQty;
      cart.items[existingIndex].unitPrice = medicine.price;
      cart.items[existingIndex].offerDiscount = offerDiscount;
      cart.items[existingIndex].finalUnitPrice = finalUnitPrice;
      cart.items[existingIndex].itemTotal = Number(
        (finalUnitPrice * cart.items[existingIndex].quantity).toFixed(2)
      );
    } else {
      cart.items.push({
        medicineId: medicine._id,
        quantity: addQty,
        unitPrice: medicine.price,
        offerDiscount,
        finalUnitPrice,
        itemTotal: Number((finalUnitPrice * addQty).toFixed(2)),
      });
    }

    await cart.save();
    await recalculateCart(cart);

    const updated = await Cart.findById(cart._id).populate('items.medicineId');
    return sendSuccess(res, 'Item added to cart successfully.', updated);
  } catch (error) {
    return sendServerError(res, 'Failed to add item to cart.', error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private (Patient)
const updateCartItem = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return sendNotFound(res, 'Patient profile not found.');

    const { quantity } = req.body;
    const cart = await Cart.findOne({ patientId: patient._id });
    if (!cart) return sendNotFound(res, 'Cart not found.');

    const item = cart.items.id(req.params.id);
    if (!item) return sendNotFound(res, 'Item not found in cart.');

    const newQty = Number(quantity);
    if (newQty <= 0) {
      cart.items.pull(req.params.id);
    } else {
      const medicine = await Medicine.findById(item.medicineId);
      if (medicine) {
        if (medicine.isAvailable === false || medicine.stock <= 0) {
          return sendValidationError(res, 'This medicine is currently out of stock.', [
            'Out of stock.',
          ]);
        }
        if (newQty > medicine.stock) {
          return sendValidationError(
            res,
            'All available stock is already added to your cart.',
            [`Maximum available stock is ${medicine.stock} units.`]
          );
        }
      }
      item.quantity = newQty;
    }

    await cart.save();
    await recalculateCart(cart);

    const updated = await Cart.findById(cart._id).populate('items.medicineId');
    return sendSuccess(res, 'Cart item updated successfully.', updated);
  } catch (error) {
    return sendServerError(res, 'Failed to update cart item.', error);
  }
};

// @desc    Remove cart item or clear coupon
// @route   DELETE /api/cart/:id
// @access  Private (Patient)
const removeCartItem = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return sendNotFound(res, 'Patient profile not found.');

    const cart = await Cart.findOne({ patientId: patient._id });
    if (!cart) return sendNotFound(res, 'Cart not found.');

    // Check if user requested removing coupon
    if (req.params.id === 'coupon') {
      cart.couponCode = '';
      cart.couponDiscount = 0;
      await cart.save();
      await recalculateCart(cart);
      const updated = await Cart.findById(cart._id).populate('items.medicineId');
      return sendSuccess(res, 'Coupon removed successfully.', updated);
    }

    cart.items.pull(req.params.id);
    await cart.save();
    await recalculateCart(cart);

    const updated = await Cart.findById(cart._id).populate('items.medicineId');
    return sendSuccess(res, 'Item removed from cart successfully.', updated);
  } catch (error) {
    return sendServerError(res, 'Failed to remove cart item.', error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
};
