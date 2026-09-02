const Coupon = require("../models/Coupon");

const {
    successResponse,
    validationErrorResponse,
    notFoundResponse,
    serverErrorResponse,
} = require("../utils/apiResponse");
const { isValidObjectId } = require("../utils/validators");

// Patient: Validate coupon
const validateCoupon = async (req, res) => {
    try {
        const { code, orderAmount } = req.body;

        if (!code) {
            return validationErrorResponse(res, "Coupon code is required");
        }

        const coupon = await Coupon.findOne({
            code: code.trim().toUpperCase(),
            isActive: true,
        });

        if (!coupon) {
            return validationErrorResponse(res, "Invalid or expired coupon code");
        }

        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            return validationErrorResponse(res, "This coupon has expired");
        }

        if (coupon.usedCount >= coupon.usageLimit) {
            return validationErrorResponse(res, "Coupon usage limit reached");
        }

        const amount = Number(orderAmount) || 0;
        if (amount < coupon.minOrderAmount) {
            return validationErrorResponse(
                res,
                `Minimum order amount of $${coupon.minOrderAmount} required to use this coupon`
            );
        }

        let discount = 0;
        if (coupon.discountType === "percentage") {
            discount = (amount * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                discount = coupon.maxDiscountAmount;
            }
        } else {
            discount = coupon.discountValue;
        }

        discount = Math.min(discount, amount);

        return successResponse(res, "Coupon applied successfully", {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount: Math.round(discount * 100) / 100,
            finalAmount: Math.round((amount - discount) * 100) / 100,
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to validate coupon", error);
    }
};

// Admin: Get all coupons
const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        return successResponse(res, "Coupons retrieved successfully", { coupons });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch coupons", error);
    }
};

// Admin: Create coupon
const createCoupon = async (req, res) => {
    try {
        const {
            code,
            description,
            discountType,
            discountValue,
            minOrderAmount,
            maxDiscountAmount,
            expiryDate,
            usageLimit,
        } = req.body;

        if (!code || discountValue === undefined) {
            return validationErrorResponse(res, "Coupon code and discount value are required");
        }

        const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
        if (existing) {
            return validationErrorResponse(res, "Coupon code already exists");
        }

        const coupon = await Coupon.create({
            code: code.trim().toUpperCase(),
            description: description || "",
            discountType: discountType || "percentage",
            discountValue: Number(discountValue),
            minOrderAmount: Number(minOrderAmount) || 0,
            maxDiscountAmount: Number(maxDiscountAmount) || 0,
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            usageLimit: Number(usageLimit) || 1000,
            isActive: true,
        });

        return successResponse(res, "Coupon created successfully", { coupon }, 201);
    } catch (error) {
        return serverErrorResponse(res, "Unable to create coupon", error);
    }
};

// Admin: Update coupon
const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid coupon ID");
        }

        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return notFoundResponse(res, "Coupon not found");
        }

        const {
            description,
            discountType,
            discountValue,
            minOrderAmount,
            maxDiscountAmount,
            expiryDate,
            usageLimit,
            isActive,
        } = req.body;

        if (description !== undefined) coupon.description = description;
        if (discountType !== undefined) coupon.discountType = discountType;
        if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
        if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount);
        if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = Number(maxDiscountAmount);
        if (expiryDate !== undefined) coupon.expiryDate = expiryDate ? new Date(expiryDate) : null;
        if (usageLimit !== undefined) coupon.usageLimit = Number(usageLimit);
        if (isActive !== undefined) coupon.isActive = Boolean(isActive);

        await coupon.save();

        return successResponse(res, "Coupon updated successfully", { coupon });
    } catch (error) {
        return serverErrorResponse(res, "Unable to update coupon", error);
    }
};

// Admin: Delete coupon
const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid coupon ID");
        }

        const coupon = await Coupon.findByIdAndDelete(id);
        if (!coupon) {
            return notFoundResponse(res, "Coupon not found");
        }

        return successResponse(res, "Coupon deleted successfully");
    } catch (error) {
        return serverErrorResponse(res, "Unable to delete coupon", error);
    }
};

module.exports = {
    validateCoupon,
    getAllCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
};
