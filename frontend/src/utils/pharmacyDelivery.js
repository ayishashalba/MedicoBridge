/**
 * MedicoBridge Pharmacy Delivery & Stock Logic Utility
 * 
 * Rules:
 * - Stock > 40 units: Sufficient stock -> Estimated delivery: 1–2 Days
 * - Stock 10–40 units: Medium stock -> Estimated delivery: 2–3 Days
 * - Stock 1–9 units: Low stock -> Estimated delivery: 3–5 Days (Limited availability)
 * - Stock = 0 units: Out of Stock -> Ordering disabled
 */

export function getStockAndDeliveryInfo(stockUnitsOrStatus) {
  let units = typeof stockUnitsOrStatus === "number" ? stockUnitsOrStatus : null;

  if (units === null) {
    if (stockUnitsOrStatus === "low-stock") units = 8;
    else if (stockUnitsOrStatus === "out-of-stock") units = 0;
    else units = 120; // default in-stock
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
    };
  }

  if (units < 10) {
    return {
      status: "low-stock",
      label: "Low Stock",
      stockText: `${units} units left`,
      badgeCls: "stock-badge--low",
      deliveryEta: "3–5 Days",
      deliveryDesc: "Est. Delivery: 3–5 Days (Limited availability)",
      canOrder: true,
    };
  }

  if (units <= 40) {
    return {
      status: "medium-stock",
      label: "In Stock",
      stockText: `${units} units available`,
      badgeCls: "stock-badge--medium",
      deliveryEta: "2–3 Days",
      deliveryDesc: "Est. Delivery: 2–3 Days",
      canOrder: true,
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
  };
}
