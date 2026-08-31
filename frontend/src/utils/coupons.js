/**
 * MedicoBridge Coupons & Promo Codes Utility
 * 
 * System 2: Cart / Checkout / Payment Coupon System
 * - Kept completely separate from automatic medicine product offers.
 * - Each coupon has From Date and To Date / Expiry Date.
 * - Before From Date: Scheduled (cannot be used).
 * - During Valid Period: Active (can be applied in Cart / Checkout).
 * - After To Date: Expired (cannot be used).
 * - Only available in Cart / Checkout / Payment summary, not on medicine cards.
 */

const STORAGE_KEY = "adminCoupons";

export const AVAILABLE_COUPONS = [
  {
    id: "CPN-101",
    code: "MEDI10",
    title: "10% OFF",
    description: "10% off up to ₹100 on medicine cart subtotal",
    type: "percent",
    discountPercent: 10,
    maxDiscount: 100,
    minOrder: 0,
    fromDate: "2026-08-01",
    toDate: "2027-12-31",
    badge: "POPULAR",
    status: "Active",
  },
  {
    id: "CPN-102",
    code: "WELCOME50",
    title: "₹50 OFF",
    description: "Flat ₹50 discount on orders above ₹499",
    type: "flat",
    discountAmount: 50,
    minOrder: 499,
    fromDate: "2026-08-01",
    toDate: "2027-12-31",
    badge: "SPECIAL",
    status: "Active",
  },
  {
    id: "CPN-103",
    code: "CHRISTMAS20",
    title: "20% OFF",
    description: "Christmas Holiday 20% discount on cart subtotal",
    type: "percent",
    discountPercent: 20,
    maxDiscount: 200,
    minOrder: 499,
    fromDate: "2026-12-20",
    toDate: "2026-12-26",
    badge: "CHRISTMAS",
    status: "Scheduled", // Scheduled for Dec 2026
  },
  {
    id: "CPN-104",
    code: "HEALTH15",
    title: "15% OFF",
    description: "15% off up to ₹150 on medicine orders",
    type: "percent",
    discountPercent: 15,
    maxDiscount: 150,
    minOrder: 0,
    fromDate: "2026-08-01",
    toDate: "2027-12-31",
    badge: "HEALTH",
    status: "Active",
  },
  {
    id: "CPN-105",
    code: "SAVE100",
    title: "₹100 OFF",
    description: "Flat ₹100 discount on orders above ₹999",
    type: "flat",
    discountAmount: 100,
    minOrder: 999,
    fromDate: "2026-08-01",
    toDate: "2027-12-31",
    badge: "MEGA SAVER",
    status: "Active",
  },
  {
    id: "CPN-106",
    code: "FREEDLVR",
    title: "FREE DELIVERY",
    description: "Free delivery on orders above ₹499",
    type: "freedelivery",
    minOrder: 499,
    fromDate: "2026-08-01",
    toDate: "2027-12-31",
    badge: "DELIVERY",
    status: "Active",
  },
  {
    id: "CPN-107",
    code: "SUMMER15",
    title: "15% OFF",
    description: "Early Summer 15% discount voucher",
    type: "percent",
    discountPercent: 15,
    maxDiscount: 150,
    minOrder: 299,
    fromDate: "2026-05-01",
    toDate: "2026-05-31",
    badge: "SUMMER",
    status: "Expired", // Expired
  }
];

export function getStoredCoupons() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("Failed reading custom coupons", e);
  }
  return AVAILABLE_COUPONS;
}

export function saveStoredCoupons(coupons) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
  } catch (e) {
    console.error("Failed saving coupons", e);
  }
}

/**
 * Computes time status for a coupon: 'Active', 'Scheduled', or 'Expired'
 */
export function getCouponTimeStatus(coupon, targetDate = new Date()) {
  const nowStr = targetDate instanceof Date ? targetDate.toISOString().split("T")[0] : targetDate.split("T")[0];
  const from = coupon.fromDate || "2026-01-01";
  const to = coupon.toDate || coupon.expiryDate || "2099-12-31";

  if (nowStr < from) return "Scheduled";
  if (nowStr > to) return "Expired";
  return "Active";
}

/**
 * Returns coupons available for display in Cart & Checkout
 */
export function getActiveCouponsForCart(targetDate = new Date()) {
  const coupons = getStoredCoupons();
  return coupons.map((c) => ({
    ...c,
    timeStatus: getCouponTimeStatus(c, targetDate),
  }));
}

/**
 * Validates and applies a coupon code to a cart subtotal with date checking
 */
export function validateAndApplyCoupon(code, subtotal, standardDeliveryFee = 40, targetDate = new Date()) {
  if (!code || !code.trim()) {
    return { success: false, message: "Please enter a coupon code." };
  }

  const normalized = code.trim().toUpperCase();
  const allCoupons = getStoredCoupons();
  const coupon = allCoupons.find((c) => c.code === normalized);

  if (!coupon) {
    return {
      success: false,
      message: `Invalid coupon code "${code}". Please check and try again.`,
    };
  }

  // Time-based activation & expiration validation
  const timeStatus = getCouponTimeStatus(coupon, targetDate);

  if (timeStatus === "Scheduled") {
    return {
      success: false,
      message: `Coupon "${coupon.code}" is scheduled to start on ${coupon.fromDate}. It cannot be applied yet.`,
    };
  }

  if (timeStatus === "Expired") {
    return {
      success: false,
      message: `Coupon "${coupon.code}" expired on ${coupon.toDate || coupon.expiryDate}. It is no longer valid.`,
    };
  }

  if (coupon.status === "Inactive" || coupon.status === "Disabled") {
    return {
      success: false,
      message: `Coupon "${coupon.code}" is currently disabled.`,
    };
  }

  // Minimum order validation
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
    const pct = Number(coupon.discountPercent || coupon.discountValue) || 10;
    const raw = Math.round((subtotal * pct) / 100);
    discount = coupon.maxDiscount ? Math.min(raw, Number(coupon.maxDiscount)) : raw;
  } else if (coupon.type === "flat") {
    const amt = Number(coupon.discountAmount || coupon.discountValue) || 50;
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
