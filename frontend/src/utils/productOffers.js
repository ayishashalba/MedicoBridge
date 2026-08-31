/**
 * MedicoBridge Automatic Product Offers Utility
 * 
 * System 1: Automatic Product Offers
 * - Admin can create/schedule an offer for specific medicines or categories.
 * - Offer includes: offer name, target product/category, discount type (percentage or flat), discount value, From Date/Time, and To Date/Time.
 * - Evaluates automatically based on current date & time.
 * - No coupon code required.
 * - Before start date: normal price is shown.
 * - After end date: price automatically returns to normal.
 * - Displays active offer badges on medicine cards and details pages.
 */

const STORAGE_KEY = "mb_admin_product_offers";

export const INITIAL_PRODUCT_OFFERS = [
  {
    id: "OFFER-101",
    offerName: "Christmas Special Offer",
    targetType: "product", // 'product', 'category', 'all'
    targetId: 1, // Paracetamol 650mg
    targetName: "Paracetamol 650mg",
    discountType: "flat", // 'flat' (₹) or 'percent' (%)
    discountValue: 5, // ₹5 OFF
    fromDateTime: "2026-08-01T00:00",
    toDateTime: "2026-12-31T23:59",
    badgeText: "Christmas Offer: ₹5 OFF",
    status: "Active",
  },
  {
    id: "OFFER-102",
    offerName: "Monsoon Immunity Boost",
    targetType: "category",
    targetId: null,
    targetName: "Supplement",
    discountType: "percent",
    discountValue: 20, // 20% OFF
    fromDateTime: "2026-08-01T00:00",
    toDateTime: "2026-10-31T23:59",
    badgeText: "20% OFF · Monsoon Deal",
    status: "Active",
  },
  {
    id: "OFFER-103",
    offerName: "New Year Mega Health Deal",
    targetType: "product",
    targetId: 4, // Azithromycin 500mg
    targetName: "Azithromycin 500mg",
    discountType: "flat",
    discountValue: 30, // ₹30 OFF
    fromDateTime: "2026-12-25T00:00",
    toDateTime: "2027-01-05T23:59",
    badgeText: "New Year Deal: ₹30 OFF",
    status: "Scheduled",
  },
  {
    id: "OFFER-104",
    offerName: "Summer Health Savings",
    targetType: "all",
    targetId: null,
    targetName: "All Medicines",
    discountType: "percent",
    discountValue: 10,
    fromDateTime: "2026-05-01T00:00",
    toDateTime: "2026-05-31T23:59",
    badgeText: "Summer 10% OFF",
    status: "Expired",
  }
];

export function getStoredProductOffers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn("Failed reading product offers", e);
  }
  return INITIAL_PRODUCT_OFFERS;
}

export function saveProductOffers(offers) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
  } catch (e) {
    console.error("Failed saving product offers", e);
  }
}

/**
 * Returns the status of an offer based on given reference date/time
 * @returns {'Active' | 'Scheduled' | 'Expired'}
 */
export function getOfferTimeStatus(offer, now = new Date()) {
  const currentTimestamp = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const startTimestamp = new Date(offer.fromDateTime).getTime();
  const endTimestamp = new Date(offer.toDateTime).getTime();

  if (currentTimestamp < startTimestamp) return "Scheduled";
  if (currentTimestamp > endTimestamp) return "Expired";
  return "Active";
}

/**
 * Evaluates whether a medicine has an active automatic product offer at the given time
 * and calculates the final effective price.
 * 
 * @param {Object} medicine - { id, name, price, mrp, category }
 * @param {Date|string} targetDateTime - optional evaluation date/time (defaults to now)
 * @returns {Object} Pricing details with discount breakdown
 */
export function getEffectiveMedicinePrice(medicine, targetDateTime = new Date()) {
  const basePrice = Number(medicine.price) || 0;
  const mrp = Number(medicine.mrp) || basePrice;
  const offers = getStoredProductOffers();

  const nowTime = targetDateTime instanceof Date ? targetDateTime.getTime() : new Date(targetDateTime).getTime();

  // Find matching active offer
  const activeOffer = offers.find((offer) => {
    // 1. Time window validation
    const start = new Date(offer.fromDateTime).getTime();
    const end = new Date(offer.toDateTime).getTime();
    if (nowTime < start || nowTime > end) return false;

    // 2. Product / Category match
    if (offer.targetType === "all") return true;

    if (offer.targetType === "product") {
      if (offer.targetId && Number(offer.targetId) === Number(medicine.id)) return true;
      if (offer.targetName && medicine.name && medicine.name.toLowerCase().includes(offer.targetName.toLowerCase())) return true;
    }

    if (offer.targetType === "category") {
      if (offer.targetName && medicine.category && medicine.category.toLowerCase() === offer.targetName.toLowerCase()) return true;
    }

    return false;
  });

  if (!activeOffer) {
    return {
      originalPrice: basePrice,
      finalPrice: basePrice,
      mrp,
      hasOffer: false,
      offerName: null,
      discountAmount: 0,
      badgeText: null,
      savings: Math.max(0, mrp - basePrice),
    };
  }

  // Calculate discount
  let discount = 0;
  if (activeOffer.discountType === "percent" || activeOffer.discountType === "percentage") {
    discount = Math.round((basePrice * Number(activeOffer.discountValue)) / 100);
  } else {
    discount = Number(activeOffer.discountValue) || 0;
  }

  // Final price cannot drop below 1
  const finalPrice = Math.max(1, basePrice - discount);
  const actualDiscount = basePrice - finalPrice;

  return {
    originalPrice: basePrice,
    finalPrice,
    mrp,
    hasOffer: true,
    offer: activeOffer,
    offerName: activeOffer.offerName,
    discountAmount: actualDiscount,
    discountType: activeOffer.discountType,
    discountValue: activeOffer.discountValue,
    badgeText: activeOffer.badgeText || `${activeOffer.offerName} · ₹${actualDiscount} OFF`,
    savings: Math.max(0, mrp - finalPrice),
  };
}
