const Medicine = require("../models/Medicine");

const {
    successResponse,
    validationErrorResponse,
    notFoundResponse,
    serverErrorResponse,
} = require("../utils/apiResponse");
const { isValidObjectId } = require("../utils/validators");
const { getStockStatus } = require("../utils/stockCalculator");

// Public & Patient search medicines with masked stock
const searchMedicines = async (req, res) => {
    try {
        const { search, category, pharmacyType, requiresPrescription, maxPrice } = req.query;

        const query = { isActive: true };

        if (category && category !== "All Categories" && category !== "All") {
            query.category = category;
        }

        if (pharmacyType) {
            query.pharmacyType = pharmacyType;
        }

        if (requiresPrescription !== undefined) {
            query.requiresPrescription = requiresPrescription === "true";
        }

        if (maxPrice) {
            query.price = { $lte: Number(maxPrice) };
        }

        if (search) {
            const searchRegex = new RegExp(search.trim(), "i");
            query.$or = [
                { name: searchRegex },
                { genericName: searchRegex },
                { manufacturer: searchRegex },
                { category: searchRegex },
            ];
        }

        const rawMedicines = await Medicine.find(query)
            .populate("pharmacyId", "name email phone city address")
            .sort({ name: 1 })
            .lean();

        // Apply Stock Masking Rule for Patients:
        // stock > 10 => in-stock (displayStock: null), patients must NOT see exact count like 120+
        // stock > 0 && stock <= 10 => low-stock (displayStock: "Low Stock")
        // stock === 0 => out-of-stock (displayStock: "Out of Stock")
        const medicines = rawMedicines.map((m) => {
            const stockInfo = getStockStatus(m.stock);
            return {
                ...m,
                stock: stockInfo.displayStock,
                stockStatus: stockInfo.status,
                isAvailable: stockInfo.isAvailable,
            };
        });

        return successResponse(res, "Medicines retrieved successfully", {
            medicines,
            count: medicines.length,
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to search medicines", error);
    }
};

// Get single medicine details (with masked stock for patients)
const getMedicineById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid medicine ID");
        }

        const medicine = await Medicine.findById(id)
            .populate("pharmacyId", "name email phone city address")
            .populate("hospitalId", "hospitalName city")
            .lean();

        if (!medicine) {
            return notFoundResponse(res, "Medicine not found");
        }

        const stockInfo = getStockStatus(medicine.stock);
        const maskedMedicine = {
            ...medicine,
            stock: stockInfo.displayStock,
            stockStatus: stockInfo.status,
            isAvailable: stockInfo.isAvailable,
        };

        return successResponse(res, "Medicine retrieved successfully", {
            medicine: maskedMedicine,
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch medicine details", error);
    }
};

// Get unique categories
const getCategories = async (req, res) => {
    try {
        const categories = await Medicine.distinct("category", { isActive: true });
        return successResponse(res, "Medicine categories retrieved successfully", {
            categories: ["All Categories", ...categories.filter(Boolean)],
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch categories", error);
    }
};

module.exports = {
    searchMedicines,
    getMedicineById,
    getCategories,
};
