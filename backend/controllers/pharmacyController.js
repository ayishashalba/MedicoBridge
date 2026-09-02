const Pharmacy = require("../models/pharmacy");
const Medicine = require("../models/Medicine");
const User = require("../models/User");
const Prescription = require("../models/Prescription");

const {
    successResponse,
    validationErrorResponse,
    notFoundResponse,
    serverErrorResponse,
    forbiddenResponse,
} = require("../utils/apiResponse");
const { isValidObjectId } = require("../utils/validators");
const { getStockStatus } = require("../utils/stockCalculator");

// Get pharmacy profile
const getPharmacyProfile = async (req, res) => {
    try {
        const pharmacy = await Pharmacy.findOne({
            userId: req.user.id,
        }).populate("userId", "name email phone city address isApproved isActive role");

        if (!pharmacy) {
            return notFoundResponse(res, "Pharmacy profile not found");
        }

        return successResponse(res, "Pharmacy profile retrieved successfully", { pharmacy });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch pharmacy profile", error);
    }
};

// Update pharmacy profile
const updatePharmacyProfile = async (req, res) => {
    try {
        const {
            pharmacyName,
            pharmacyType,
            licenseNumber,
            phone,
            email,
            address,
            city,
        } = req.body;

        const pharmacy = await Pharmacy.findOne({ userId: req.user.id });
        if (!pharmacy) {
            return notFoundResponse(res, "Pharmacy profile not found");
        }

        if (pharmacyName !== undefined) pharmacy.pharmacyName = pharmacyName.trim();
        if (pharmacyType !== undefined) pharmacy.pharmacyType = pharmacyType;
        if (licenseNumber !== undefined) pharmacy.licenseNumber = licenseNumber.trim();
        if (phone !== undefined) pharmacy.phone = phone.trim();
        if (email !== undefined) pharmacy.email = email.trim();
        if (address !== undefined) pharmacy.address = address.trim();
        if (city !== undefined) pharmacy.city = city.trim();

        await pharmacy.save();

        const user = await User.findById(req.user.id);
        if (user) {
            if (pharmacyName !== undefined) user.name = pharmacyName.trim();
            if (phone !== undefined) user.phone = phone.trim();
            if (address !== undefined) user.address = address.trim();
            if (city !== undefined) user.city = city.trim();
            await user.save();
        }

        return successResponse(res, "Pharmacy profile updated successfully", { pharmacy });
    } catch (error) {
        return serverErrorResponse(res, "Unable to update pharmacy profile", error);
    }
};

// Public: Get all pharmacies
const getAllPharmacies = async (req, res) => {
    try {
        const { search, city, pharmacyType } = req.query;

        const query = { isActive: true };
        if (pharmacyType) query.pharmacyType = pharmacyType;

        const pharmacies = await Pharmacy.find(query)
            .populate("userId", "name email phone city address isApproved isActive")
            .lean();

        let filtered = pharmacies;

        if (city) {
            const cityRegex = new RegExp(city.trim(), "i");
            filtered = filtered.filter((p) => (p.city && cityRegex.test(p.city)) || (p.userId && p.userId.city && cityRegex.test(p.userId.city)));
        }

        if (search) {
            const searchRegex = new RegExp(search.trim(), "i");
            filtered = filtered.filter(
                (p) =>
                    searchRegex.test(p.pharmacyName) ||
                    (p.userId && searchRegex.test(p.userId.name)) ||
                    searchRegex.test(p.city)
            );
        }

        return successResponse(res, "Pharmacies retrieved successfully", {
            pharmacies: filtered,
            count: filtered.length,
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch pharmacies", error);
    }
};

// Public: Get pharmacy details with medicines
const getPharmacyById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid pharmacy ID");
        }

        let pharmacy = await Pharmacy.findById(id).populate("userId", "name email phone city address");
        if (!pharmacy) {
            pharmacy = await Pharmacy.findOne({ userId: id }).populate("userId", "name email phone city address");
        }

        if (!pharmacy) {
            return notFoundResponse(res, "Pharmacy not found");
        }

        const rawMedicines = await Medicine.find({
            pharmacyId: pharmacy.userId || pharmacy._id,
            isActive: true,
        }).lean();

        // Apply stock mask rule for public viewing
        const medicines = rawMedicines.map((m) => {
            const stockInfo = getStockStatus(m.stock);
            return {
                ...m,
                stock: stockInfo.displayStock,
                stockStatus: stockInfo.status,
                isAvailable: stockInfo.isAvailable,
            };
        });

        return successResponse(res, "Pharmacy retrieved successfully", {
            pharmacy,
            medicines,
            count: medicines.length,
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch pharmacy", error);
    }
};

// Pharmacy Owner: Get full inventory (with raw stock count)
const getPharmacyInventory = async (req, res) => {
    try {
        const { search, category, lowStock } = req.query;

        const query = { pharmacyId: req.user.id };

        if (category && category !== "All") {
            query.category = category;
        }

        if (search) {
            const searchRegex = new RegExp(search.trim(), "i");
            query.$or = [
                { name: searchRegex },
                { genericName: searchRegex },
                { manufacturer: searchRegex },
            ];
        }

        if (lowStock === "true") {
            query.stock = { $lte: 10 };
        }

        const medicines = await Medicine.find(query).sort({ name: 1 });

        return successResponse(res, "Inventory retrieved successfully", {
            medicines,
            count: medicines.length,
            stats: {
                total: medicines.length,
                lowStock: medicines.filter((m) => m.stock > 0 && m.stock <= 10).length,
                outOfStock: medicines.filter((m) => m.stock === 0).length,
                inStock: medicines.filter((m) => m.stock > 10).length,
            },
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch inventory", error);
    }
};

// Pharmacy Owner: Add Medicine
const addMedicine = async (req, res) => {
    try {
        // Admin rule: Admin MUST NOT restock pharmacy medicines
        if (req.user.role === "admin") {
            return forbiddenResponse(res, "Admins are not permitted to manage pharmacy inventory directly");
        }

        const {
            name,
            genericName,
            category,
            manufacturer,
            price,
            discountPrice,
            stock,
            expiryDate,
            requiresPrescription,
            pharmacyType,
            hospitalId,
            description,
            dosageForm,
            strength,
            image,
        } = req.body;

        if (!name || price === undefined || stock === undefined) {
            return validationErrorResponse(res, "Name, price, and stock are required");
        }

        const medicine = await Medicine.create({
            name: name.trim(),
            genericName: genericName ? genericName.trim() : "",
            category: category || "General",
            manufacturer: manufacturer ? manufacturer.trim() : "",
            price: Number(price),
            discountPrice: Number(discountPrice) || 0,
            stock: Number(stock) || 0,
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            requiresPrescription: Boolean(requiresPrescription),
            pharmacyId: req.user.id,
            pharmacyType: pharmacyType || "retail",
            hospitalId: hospitalId && isValidObjectId(hospitalId) ? hospitalId : null,
            description: description || "",
            dosageForm: dosageForm || "Tablet",
            strength: strength || "",
            image: image || "",
        });

        return successResponse(res, "Medicine added to inventory successfully", { medicine }, 201);
    } catch (error) {
        return serverErrorResponse(res, "Unable to add medicine", error);
    }
};

// Pharmacy Owner: Update Medicine
const updateMedicine = async (req, res) => {
    try {
        if (req.user.role === "admin") {
            return forbiddenResponse(res, "Admins are not permitted to manage pharmacy inventory directly");
        }

        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid medicine ID");
        }

        const medicine = await Medicine.findOne({ _id: id, pharmacyId: req.user.id });
        if (!medicine) {
            return notFoundResponse(res, "Medicine not found in your inventory");
        }

        const {
            name,
            genericName,
            category,
            manufacturer,
            price,
            discountPrice,
            stock,
            expiryDate,
            requiresPrescription,
            description,
            dosageForm,
            strength,
            image,
            isActive,
        } = req.body;

        if (name !== undefined) medicine.name = name.trim();
        if (genericName !== undefined) medicine.genericName = genericName.trim();
        if (category !== undefined) medicine.category = category;
        if (manufacturer !== undefined) medicine.manufacturer = manufacturer.trim();
        if (price !== undefined) medicine.price = Number(price);
        if (discountPrice !== undefined) medicine.discountPrice = Number(discountPrice);
        if (stock !== undefined) medicine.stock = Number(stock);
        if (expiryDate !== undefined) medicine.expiryDate = expiryDate ? new Date(expiryDate) : null;
        if (requiresPrescription !== undefined) medicine.requiresPrescription = Boolean(requiresPrescription);
        if (description !== undefined) medicine.description = description;
        if (dosageForm !== undefined) medicine.dosageForm = dosageForm;
        if (strength !== undefined) medicine.strength = strength;
        if (image !== undefined) medicine.image = image;
        if (isActive !== undefined) medicine.isActive = Boolean(isActive);

        await medicine.save();

        return successResponse(res, "Medicine updated successfully", { medicine });
    } catch (error) {
        return serverErrorResponse(res, "Unable to update medicine", error);
    }
};

// Pharmacy Owner: Delete Medicine
const deleteMedicine = async (req, res) => {
    try {
        if (req.user.role === "admin") {
            return forbiddenResponse(res, "Admins are not permitted to manage pharmacy inventory directly");
        }

        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid medicine ID");
        }

        const medicine = await Medicine.findOneAndDelete({ _id: id, pharmacyId: req.user.id });
        if (!medicine) {
            return notFoundResponse(res, "Medicine not found in your inventory");
        }

        return successResponse(res, "Medicine deleted successfully");
    } catch (error) {
        return serverErrorResponse(res, "Unable to delete medicine", error);
    }
};

// Process / Verify Prescription
const processPrescription = async (req, res) => {
    try {
        const { prescriptionId, patientId } = req.body;

        if (!prescriptionId && !patientId) {
            return validationErrorResponse(res, "Prescription ID or Patient ID is required");
        }

        let prescription = null;
        if (prescriptionId && isValidObjectId(prescriptionId)) {
            prescription = await Prescription.findById(prescriptionId)
                .populate("doctorId", "name email specialization")
                .populate("patientId", "name email phone");
        } else if (patientId && isValidObjectId(patientId)) {
            prescription = await Prescription.findOne({ patientId })
                .sort({ createdAt: -1 })
                .populate("doctorId", "name email specialization")
                .populate("patientId", "name email phone");
        }

        if (!prescription) {
            return notFoundResponse(res, "Prescription not found or invalid");
        }

        return successResponse(res, "Prescription verified successfully", {
            prescription,
            status: "Verified",
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to process prescription", error);
    }
};

module.exports = {
    getPharmacyProfile,
    updatePharmacyProfile,
    getAllPharmacies,
    getPharmacyById,
    getPharmacyInventory,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    processPrescription,
};
