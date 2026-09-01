const getStockStatus = (stockCount) => {
  const stock = Number(stockCount) || 0;

  if (stock > 10) {
    return {
      status: "in-stock",
      label: null,
      isAvailable: true,
      displayStock: null,
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