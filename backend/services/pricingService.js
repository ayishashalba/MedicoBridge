const Medicine = require('../models/Medicine');
const Offer = require('../models/Offer');
const Coupon = require('../models/Coupon');

/**
 * Calculate active offer discount for a medicine
 * @param {string|ObjectId} medicineId
 * @param {number} unitPrice
 * @returns {Promise<{ offerDiscount: number, finalUnitPrice: number, activeOffer: Object|null }>}
 */
const calculateMedicineOffer = async (medicineId, unitPrice) => {
  const now = new Date();
  const activeOffer = await Offer.findOne({
    medicineId,
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  });

  if (!activeOffer) {
    return {
      offerDiscount: 0,
      finalUnitPrice: unitPrice,
      activeOffer: null,
    };
  }

  let discount = 0;
  if (activeOffer.discountType === 'flat') {
    discount = Math.min(activeOffer.discountValue, unitPrice);
  } else if (activeOffer.discountType === 'percentage') {
    discount = (unitPrice * activeOffer.discountValue) / 100;
  }

  // Ensure discount doesn't exceed unit price
  discount = Math.min(discount, unitPrice);
  const finalUnitPrice = Math.max(0, unitPrice - discount);

  return {
    offerDiscount: Number(discount.toFixed(2)),
    finalUnitPrice: Number(finalUnitPrice.toFixed(2)),
    activeOffer,
  };
};

const SYSTEM_COUPONS = [
  {
    code: 'MEDI10',
    description: '10% off up to ₹100 on medicine cart subtotal',
    discountType: 'percentage',
    discountValue: 10,
    minimumOrderAmount: 0,
    maximumDiscount: 100,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2027-12-31'),
    usageLimit: 10000,
    usedCount: 0,
    isActive: true,
  },
  {
    code: 'WELCOME50',
    description: 'Flat ₹50 discount on orders above ₹499',
    discountType: 'flat',
    discountValue: 50,
    minimumOrderAmount: 499,
    maximumDiscount: 50,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2027-12-31'),
    usageLimit: 10000,
    usedCount: 0,
    isActive: true,
  },
  {
    code: 'HEALTH15',
    description: '15% off up to ₹150 on medicine orders',
    discountType: 'percentage',
    discountValue: 15,
    minimumOrderAmount: 0,
    maximumDiscount: 150,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2027-12-31'),
    usageLimit: 10000,
    usedCount: 0,
    isActive: true,
  },
  {
    code: 'SAVE100',
    description: 'Flat ₹100 discount on orders above ₹999',
    discountType: 'flat',
    discountValue: 100,
    minimumOrderAmount: 999,
    maximumDiscount: 100,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2027-12-31'),
    usageLimit: 10000,
    usedCount: 0,
    isActive: true,
  },
  {
    code: 'MEDICO20',
    description: '20% off on all medicines',
    discountType: 'percentage',
    discountValue: 20,
    minimumOrderAmount: 0,
    maximumDiscount: null,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2027-12-31'),
    usageLimit: 10000,
    usedCount: 0,
    isActive: true,
  },
  {
    code: 'FREEDLVR',
    description: 'Free delivery on orders above ₹499',
    discountType: 'freedelivery',
    discountValue: 40,
    minimumOrderAmount: 499,
    maximumDiscount: 40,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2027-12-31'),
    usageLimit: 10000,
    usedCount: 0,
    isActive: true,
  },
];

/**
 * Validate and calculate coupon discount on an order amount
 * @param {string} code - Coupon code
 * @param {number} subtotalAfterOffers - Current total after product offers
 * @returns {Promise<{ isValid: boolean, discount: number, message: string, coupon: Object|null }>}
 */
const validateCouponDiscount = async (code, subtotalAfterOffers) => {
  if (!code) {
    return { isValid: false, discount: 0, message: 'Coupon code is required.', coupon: null };
  }

  const normalizedCode = code.toUpperCase().trim();
  const now = new Date();
  let coupon = await Coupon.findOne({
    code: normalizedCode,
    isActive: true,
  });

  if (!coupon) {
    const sysCoupon = SYSTEM_COUPONS.find((c) => c.code === normalizedCode);
    if (sysCoupon) {
      coupon = await Coupon.findOneAndUpdate(
        { code: sysCoupon.code },
        sysCoupon,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  }

  if (!coupon) {
    return { isValid: false, discount: 0, message: 'Invalid or inactive coupon code.', coupon: null };
  }

  if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) {
    return { isValid: false, discount: 0, message: 'Coupon has expired or is not yet active.', coupon: null };
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    return { isValid: false, discount: 0, message: 'Coupon usage limit has been reached.', coupon: null };
  }

  if (coupon.minimumOrderAmount && subtotalAfterOffers < coupon.minimumOrderAmount) {
    return {
      isValid: false,
      discount: 0,
      message: `Minimum order amount of ₹${coupon.minimumOrderAmount} required for this coupon.`,
      coupon: null,
    };
  }

  let discount = 0;
  if (coupon.discountType === 'flat') {
    discount = coupon.discountValue;
  } else if (coupon.discountType === 'percentage' || coupon.discountType === 'percent') {
    discount = Math.round((subtotalAfterOffers * coupon.discountValue) / 100);
    if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
      discount = coupon.maximumDiscount;
    }
  } else if (coupon.discountType === 'freedelivery') {
    discount = coupon.discountValue || 40;
  }

  discount = Math.min(discount, subtotalAfterOffers);

  return {
    isValid: true,
    discount: Number(discount.toFixed(2)),
    message: 'Coupon applied successfully.',
    coupon,
  };
};

module.exports = {
  calculateMedicineOffer,
  validateCouponDiscount,
};
