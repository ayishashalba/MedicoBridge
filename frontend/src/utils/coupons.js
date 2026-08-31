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

export function getActiveCoupons() {
  try {
    const raw = localStorage.getItem("adminCoupons");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((c) => c.status !== "Inactive");
      }
    }
  } catch (e) {
    console.warn("Failed reading custom coupons", e);
  }
  return AVAILABLE_COUPONS;
}

export function validateAndApplyCoupon(code, subtotal, standardDeliveryFee = 40) {
  if (!code || !code.trim()) {
    return { success: false, message: "Please enter a coupon code." };
  }

  const normalized = code.trim().toUpperCase();
  const allCoupons = getActiveCoupons();
  const coupon = allCoupons.find((c) => c.code === normalized);

  if (!coupon) {
    return {
      success: false,
      message: `Invalid or inactive coupon code "${code}". Please check and try again.`,
    };
  }

  if (coupon.minOrder && subtotal < coupon.minOrder) {
    const diff = coupon.minOrder - subtotal;
    return {
      success: false,
      message: `Coupon ${coupon.code} requires a minimum order of ₹${coupon.minOrder}. Add ₹${diff} more to apply.`,
    };
  }

  let discount = 0;
  let freesDelivery = false;

  if (coupon.type === "percent" || coupon.type === "percentage") {
    const pct = coupon.discountPercent || coupon.discountValue || 10;
    const raw = Math.round((subtotal * pct) / 100);
    discount = coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
  } else if (coupon.type === "flat") {
    const amt = coupon.discountAmount || coupon.discountValue || 50;
    discount = Math.min(amt, subtotal);
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

