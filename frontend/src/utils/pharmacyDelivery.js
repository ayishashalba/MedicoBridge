/**
 * MedicoBridge Pharmacy Delivery & Stock Logic Utility
 * 
 * Stock Rules:
 * - Missing/undefined/null: Stock unavailable -> Ordering disabled
 * - Stock <= 0 or isAvailable === false: Out of Stock -> Ordering disabled
 * - Stock 1–10: Low Stock -> Estimated delivery: 3–5 Days (Limited availability)
 * - Stock > 10–40: In Stock (Medium stock) -> Estimated delivery: 2–3 Days
 * - Stock > 40: In Stock (Sufficient stock) -> Estimated delivery: 1–2 Days
 */

export const LOW_STOCK_THRESHOLD = 10;

export function getStockAndDeliveryInfo(stockUnitsOrStatus, isAvailable = true) {
  // If explicitly flagged as unavailable in the database
  if (isAvailable === false) {
    return {
      status: "out-of-stock",
      label: "Out of Stock",
      stockText: "0 units available",
      badgeCls: "stock-badge--out",
      deliveryEta: "Unavailable",
      deliveryDesc: "Item currently unavailable · Ordering disabled",
      canOrder: false,
      availableStock: 0,
    };
  }

  // Handle missing/undefined/null stock data explicitly
  if (stockUnitsOrStatus === undefined || stockUnitsOrStatus === null || stockUnitsOrStatus === "") {
    return {
      status: "unavailable",
      label: "Stock unavailable",
      stockText: "Stock unverified",
      badgeCls: "stock-badge--unavailable",
      deliveryEta: "Pending",
      deliveryDesc: "Stock verification pending · Ordering paused",
      canOrder: false,
      availableStock: 0,
    };
  }

  let units;
  if (typeof stockUnitsOrStatus === "number") {
    units = stockUnitsOrStatus;
  } else {
    // Check if string representation is a valid number
    const parsed = Number(stockUnitsOrStatus);
    if (!isNaN(parsed)) {
      units = parsed;
    } else if (stockUnitsOrStatus === "low-stock") {
      units = LOW_STOCK_THRESHOLD;
    } else if (stockUnitsOrStatus === "out-of-stock") {
      units = 0;
    } else if (stockUnitsOrStatus === "in-stock") {
      units = 50;
    } else {
      // Unrecognized string or missing stock data
      return {
        status: "unavailable",
        label: "Stock unavailable",
        stockText: "Stock unverified",
        badgeCls: "stock-badge--unavailable",
        deliveryEta: "Pending",
        deliveryDesc: "Stock verification pending · Ordering paused",
        canOrder: false,
        availableStock: 0,
      };
    }
  }

  if (units <= 0) {
    return {
      status: "out-of-stock",
      label: "Out of Stock",
      stockText: "0 units available",
      badgeCls: "stock-badge--out",
      deliveryEta: "Unavailable",
      deliveryDesc: "Item out of stock · Ordering disabled",
      canOrder: false,
      availableStock: 0,
    };
  }

  if (units <= LOW_STOCK_THRESHOLD) {
    return {
      status: "low-stock",
      label: "Low Stock",
      stockText: `${units} units left`,
      badgeCls: "stock-badge--low",
      deliveryEta: "3–5 Days",
      deliveryDesc: "Est. Delivery: 3–5 Days (Limited availability)",
      canOrder: true,
      availableStock: units,
    };
  }

  if (units <= 40) {
    return {
      status: "in-stock",
      label: "In Stock",
      stockText: `${units} units available`,
      badgeCls: "stock-badge--in",
      deliveryEta: "2–3 Days",
      deliveryDesc: "Est. Delivery: 2–3 Days",
      canOrder: true,
      availableStock: units,
    };
  }

  // > 40 units (Sufficient stock)
  return {
    status: "in-stock",
    label: "In Stock",
    stockText: `${units}+ units available`,
    badgeCls: "stock-badge--in",
    deliveryEta: "1–2 Days",
    deliveryDesc: "Est. Delivery: 1–2 Days (Sufficient stock)",
    canOrder: true,
    availableStock: units,
  };
}
