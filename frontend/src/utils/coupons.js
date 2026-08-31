/**
 * MedicoBridge Coupons & Promo Codes Utility
 * 
 * Coupons available:
 * - MEDI10: 10% off, max ₹100
 * - WELCOME50: ₹50 off on orders above ₹499
 * - HEALTH15: 15% off, max ₹150
 * - SAVE100: ₹100 off on orders above ₹999
 * - FREEDLVR: Free delivery on orders above ₹499
 */

export const AVAILABLE_COUPONS = [
  {
    code: "MEDI10",
    title: "10% OFF",
    description: "10% off up to ₹100 on medicine orders",
    type: "percent",
    discountPercent: 10,
    maxDiscount: 100,
    minOrder: 0,
    badge: "POPULAR",
  },
  {
    code: "WELCOME50",
    title: "₹50 OFF",
    description: "Flat ₹50 discount on orders above ₹499",
    type: "flat",
    discountAmount: 50,
    minOrder: 499,
    badge: "SPECIAL",
  },
  {
    code: "HEALTH15",
    title: "15% OFF",
    description: "15% off up to ₹150 on medicine orders",
    type: "percent",
    discountPercent: 15,
    maxDiscount: 150,
    minOrder: 0,
    badge: "HEALTH",
  },
  {
    code: "SAVE100",
    title: "₹100 OFF",
    description: "Flat ₹100 discount on orders above ₹999",
    type: "flat",
    discountAmount: 100,
    minOrder: 999,
    badge: "MEGA SAVER",
  },
  {
    code: "FREEDLVR",
    title: "FREE DELIVERY",
    description: "Free delivery on orders above ₹499",
    type: "freedelivery",
    minOrder: 499,
    badge: "DELIVERY",
  },
];

export function validateAndApplyCoupon(code, subtotal, standardDeliveryFee = 40) {
  if (!code || !code.trim()) {
    return { success: false, message: "Please enter a coupon code." };
  }

  const normalized = code.trim().toUpperCase();
  const coupon = AVAILABLE_COUPONS.find((c) => c.code === normalized);

  if (!coupon) {
    return {
      success: false,
      message: `Invalid coupon code "${code}". Please check and try again.`,
    };
  }

  if (subtotal < coupon.minOrder) {
    const diff = coupon.minOrder - subtotal;
    return {
      success: false,
      message: `Coupon ${coupon.code} requires a minimum order of ₹${coupon.minOrder}. Add ₹${diff} more to apply.`,
    };
  }

  let discount = 0;
  let freesDelivery = false;

  if (coupon.type === "percent") {
    const raw = Math.round((subtotal * coupon.discountPercent) / 100);
    discount = Math.min(raw, coupon.maxDiscount);
  } else if (coupon.type === "flat") {
    discount = Math.min(coupon.discountAmount, subtotal);
  } else if (coupon.type === "freedelivery") {
    freesDelivery = true;
    discount = standardDeliveryFee;
  }

  return {
    success: true,
    coupon,
    discount,
    freesDelivery,
    message: `Coupon "${coupon.code}" applied successfully! You saved ₹${discount}.`,
  };
}
