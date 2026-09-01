/**
 * Stock status calculator according to MedicoBridge business rules:
 * - stock > 10: normal ('in-stock')
 * - stock > 0 && stock <= 10: 'low-stock'
 * - stock === 0: 'out-of-stock'
 */

const getStockStatus = (stockCount) => {
  const stock = Number(stockCount) || 0;
  if (stock > 10) {
    return {
      status: "in-stock",
      label: "In Stock",
      isAvailable: true,
      displayStock: null, // Do not expose stock count to patients when > 10
    };
  }
  if (stock > 0 && stock <= 10) {
    return {
      status: "low-stock",
      label: "Low Stock",
      isAvailable: true,
      displayStock: "Low Stock",
    };
  }
  return {
    status: "out-of-stock",
    label: "Out of Stock",
    isAvailable: false,
    displayStock: "Out of Stock",
  };
};

module.exports = {
  getStockStatus,
};
