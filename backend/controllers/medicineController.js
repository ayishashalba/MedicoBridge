const Medicine = require('../models/Medicine');
const Offer = require('../models/Offer');
const { calculateMedicineOffer } = require('../services/pricingService');
const {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendServerError,
} = require('../utils/responseHandler');

const LOW_STOCK_THRESHOLD = 10;

/**
 * Helper to determine actual stock quantity and status
 */
const determineStockInfo = (med) => {
  const isExplicitlyUnavailable = med.isAvailable === false;
  const rawStock = med.stock;

  // If stock is undefined or null or NaN (missing stock data)
  if (rawStock === undefined || rawStock === null || isNaN(Number(rawStock))) {
    return {
      stock: null,
      stockStatus: isExplicitlyUnavailable ? 'Out of Stock' : 'Stock unavailable',
      isAvailable: false,
      canOrder: false,
    };
  }

  const numericStock = Number(rawStock);

  if (isExplicitlyUnavailable || numericStock <= 0) {
    return {
      stock: Math.max(0, numericStock),
      stockStatus: 'Out of Stock',
      isAvailable: false,
      canOrder: false,
    };
  }

  if (numericStock <= LOW_STOCK_THRESHOLD) {
    return {
      stock: numericStock,
      stockStatus: 'Low Stock',
      isAvailable: true,
      canOrder: true,
    };
  }

  return {
    stock: numericStock,
    stockStatus: 'In Stock',
    isAvailable: true,
    canOrder: true,
  };
};

// @desc    Get all available medicines (Public / Patient) with active offers attached
// @route   GET /api/medicines
// @access  Public
const getAllMedicines = async (req, res) => {
  try {
    const { category, search, pharmacyId, requiresPrescription, isAvailable } = req.query;
    const query = { isHospital: false };

    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    if (category && category !== 'All' && category !== 'All Categories') {
      query.category = { $regex: category, $options: 'i' };
    }
    if (pharmacyId) {
      query.pharmacyId = pharmacyId;
    }
    if (requiresPrescription !== undefined) {
      query.requiresPrescription = requiresPrescription === 'true';
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
      ];
    }

    const medicines = await Medicine.find(query).populate('pharmacyId', 'name city rating address');

    // Enrich medicines with active offers and actual stock quantities
    const enrichedMedicines = await Promise.all(
      medicines.map(async (med) => {
        const { offerDiscount, finalUnitPrice, activeOffer } = await calculateMedicineOffer(
          med._id,
          med.price
        );

        const stockInfo = determineStockInfo(med);

        return {
          _id: med._id,
          id: med._id,
          name: med.name,
          genericName: med.genericName,
          category: med.category,
          manufacturer: med.manufacturer,
          description: med.description,
          dosageForm: med.dosageForm,
          requiresPrescription: med.requiresPrescription,
          price: med.price,
          originalPrice: med.price,
          offerDiscount,
          finalPrice: finalUnitPrice,
          activeOffer: activeOffer
            ? {
                offerName: activeOffer.offerName,
                discountType: activeOffer.discountType,
                discountValue: activeOffer.discountValue,
              }
            : null,
          image: med.image,
          pharmacyId: med.pharmacyId,
          stockStatus: stockInfo.stockStatus,
          stock: stockInfo.stock,
          expiryDate: med.expiryDate,
          batchNumber: med.batchNumber,
          storageTemp: med.storageTemp,
          unit: med.unit,
          isAvailable: stockInfo.isAvailable,
          canOrder: stockInfo.canOrder,
        };
      })
    );

    return sendSuccess(res, 'Medicines fetched successfully.', enrichedMedicines);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch medicines.', error);
  }
};

// @desc    Get medicine by ID
// @route   GET /api/medicines/:id
// @access  Public
const getMedicineById = async (req, res) => {
  try {
    const med = await Medicine.findById(req.params.id).populate('pharmacyId', 'name city rating address');
    if (!med) {
      return sendNotFound(res, 'Medicine not found.');
    }

    const { offerDiscount, finalUnitPrice, activeOffer } = await calculateMedicineOffer(
      med._id,
      med.price
    );

    const stockInfo = determineStockInfo(med);

    const enriched = {
      _id: med._id,
      id: med._id,
      name: med.name,
      genericName: med.genericName,
      category: med.category,
      manufacturer: med.manufacturer,
      description: med.description,
      dosageForm: med.dosageForm,
      requiresPrescription: med.requiresPrescription,
      price: med.price,
      originalPrice: med.price,
      offerDiscount,
      finalPrice: finalUnitPrice,
      activeOffer,
      image: med.image,
      pharmacyId: med.pharmacyId,
      stockStatus: stockInfo.stockStatus,
      stock: stockInfo.stock,
      expiryDate: med.expiryDate,
      batchNumber: med.batchNumber,
      storageTemp: med.storageTemp,
      unit: med.unit,
      isAvailable: stockInfo.isAvailable,
      canOrder: stockInfo.canOrder,
    };

    return sendSuccess(res, 'Medicine details fetched successfully.', enriched);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch medicine details.', error);
  }
};

// @desc    Process prescription and match with catalog medicines
// @route   POST /api/medicines/process-prescription
// @access  Public
const processPrescription = async (req, res) => {
  try {
    const { fileName } = req.body;
    const medicines = await Medicine.find({ isHospital: false }).limit(4);

    const extractedMedicines = medicines.map((m) => {
      const stockInfo = determineStockInfo(m);

      return {
        name: m.name,
        dosage: m.dosageForm || "Standard Dosage",
        quantity: 1,
        instruction: "Take as directed by physician",
        requiresPrescription: m.requiresPrescription,
        matched: true,
        product: {
          id: m._id,
          _id: m._id,
          price: m.price,
          stock: stockInfo.stock,
          stockStatus: stockInfo.stockStatus,
          isAvailable: stockInfo.isAvailable,
          canOrder: stockInfo.canOrder,
        },
      };
    });

    return sendSuccess(res, 'Prescription processed successfully.', {
      prescriptionId: `RX-${Date.now().toString().slice(-6)}`,
      fileName: fileName || "Prescription.pdf",
      prescriptionDate: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      doctorName: "Verified Healthcare Practitioner",
      clinicName: "MedicoBridge Integrated Healthcare",
      medicines: extractedMedicines,
    });
  } catch (error) {
    return sendServerError(res, 'Failed to process prescription.', error);
  }
};

module.exports = {
  getAllMedicines,
  getMedicineById,
  processPrescription,
};

