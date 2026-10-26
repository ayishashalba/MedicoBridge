const Coupon = require('../models/Coupon');
const { validateCouponDiscount } = require('../services/pricingService');
const {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendServerError,
} = require('../utils/responseHandler');

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Public / Admin
const getCoupons = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const query = {};

    if (activeOnly === 'true') {
      const now = new Date();
      query.isActive = true;
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
    }

    const coupons = await Coupon.find(query).sort({ createdAt: -1 });
    return sendSuccess(res, 'Coupons fetched successfully.', coupons);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch coupons.', error);
  }
};

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Private / Public
const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      return sendValidationError(res, 'Validation failed', ['Coupon code is required.']);
    }

    const amount = Number(orderAmount) || 0;
    const result = await validateCouponDiscount(code, amount);

    if (!result.isValid) {
      return sendValidationError(res, result.message, [result.message]);
    }

    return sendSuccess(res, result.message, {
      code: result.coupon.code,
      discount: result.discount,
      discountType: result.coupon.discountType,
      discountValue: result.coupon.discountValue,
    });
  } catch (error) {
    return sendServerError(res, 'Failed to validate coupon.', error);
  }
};

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private (Admin)
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscount,
      startDate,
      endDate,
      usageLimit,
      isActive,
    } = req.body;

    if (!code || !discountType || discountValue === undefined || !startDate || !endDate) {
      return sendValidationError(res, 'Validation failed', [
        'Coupon code, discount type, discount value, start date, and end date are required.',
      ]);
    }

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existingCoupon) {
      return sendValidationError(res, 'Validation failed', ['A coupon with this code already exists.']);
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      description: description || '',
      discountType,
      discountValue: Number(discountValue),
      minimumOrderAmount: Number(minimumOrderAmount) || 0,
      maximumDiscount: maximumDiscount ? Number(maximumDiscount) : null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      usageLimit: Number(usageLimit) || 100,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return sendSuccess(res, 'Coupon created successfully.', coupon, 201);
  } catch (error) {
    return sendServerError(res, 'Failed to create coupon.', error);
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private (Admin)
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return sendNotFound(res, 'Coupon not found.');
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscount,
      startDate,
      endDate,
      usageLimit,
      isActive,
    } = req.body;

    if (code) coupon.code = code.toUpperCase().trim();
    if (description !== undefined) coupon.description = description;
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
    if (minimumOrderAmount !== undefined) coupon.minimumOrderAmount = Number(minimumOrderAmount);
    if (maximumDiscount !== undefined) coupon.maximumDiscount = maximumDiscount ? Number(maximumDiscount) : null;
    if (startDate) coupon.startDate = new Date(startDate);
    if (endDate) coupon.endDate = new Date(endDate);
    if (usageLimit !== undefined) coupon.usageLimit = Number(usageLimit);
    if (isActive !== undefined) coupon.isActive = Boolean(isActive);

    await coupon.save();
    return sendSuccess(res, 'Coupon updated successfully.', coupon);
  } catch (error) {
    return sendServerError(res, 'Failed to update coupon.', error);
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private (Admin)
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return sendNotFound(res, 'Coupon not found.');
    }
    return sendSuccess(res, 'Coupon deleted successfully.');
  } catch (error) {
    return sendServerError(res, 'Failed to delete coupon.', error);
  }
};

module.exports = {
  getCoupons,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
