const Offer = require("../models/Offer");

const {
    successResponse,
    validationErrorResponse,
    notFoundResponse,
    serverErrorResponse,
} = require("../utils/apiResponse");
const { isValidObjectId } = require("../utils/validators");

// Public: Get active offers
const getActiveOffers = async (req, res) => {
    try {
        const offers = await Offer.find({ isActive: true }).sort({ createdAt: -1 });
        return successResponse(res, "Active offers retrieved successfully", { offers });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch offers", error);
    }
};

// Admin: Get all offers
const getAllOffers = async (req, res) => {
    try {
        const offers = await Offer.find().sort({ createdAt: -1 });
        return successResponse(res, "All offers retrieved successfully", { offers });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch offers", error);
    }
};

// Admin: Create offer
const createOffer = async (req, res) => {
    try {
        const { title, description, bannerImage, discountPercentage, category, startDate, endDate } = req.body;

        if (!title || discountPercentage === undefined) {
            return validationErrorResponse(res, "Title and discount percentage are required");
        }

        const offer = await Offer.create({
            title: title.trim(),
            description: description || "",
            bannerImage: bannerImage || "",
            discountPercentage: Number(discountPercentage),
            category: category || "All",
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : null,
            isActive: true,
        });

        return successResponse(res, "Offer created successfully", { offer }, 201);
    } catch (error) {
        return serverErrorResponse(res, "Unable to create offer", error);
    }
};

// Admin: Update offer
const updateOffer = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid offer ID");
        }

        const offer = await Offer.findById(id);
        if (!offer) {
            return notFoundResponse(res, "Offer not found");
        }

        const { title, description, bannerImage, discountPercentage, category, startDate, endDate, isActive } = req.body;
        if (title !== undefined) offer.title = title.trim();
        if (description !== undefined) offer.description = description;
        if (bannerImage !== undefined) offer.bannerImage = bannerImage;
        if (discountPercentage !== undefined) offer.discountPercentage = Number(discountPercentage);
        if (category !== undefined) offer.category = category;
        if (startDate !== undefined) offer.startDate = new Date(startDate);
        if (endDate !== undefined) offer.endDate = endDate ? new Date(endDate) : null;
        if (isActive !== undefined) offer.isActive = Boolean(isActive);

        await offer.save();

        return successResponse(res, "Offer updated successfully", { offer });
    } catch (error) {
        return serverErrorResponse(res, "Unable to update offer", error);
    }
};

// Admin: Delete offer
const deleteOffer = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid offer ID");
        }

        const offer = await Offer.findByIdAndDelete(id);
        if (!offer) {
            return notFoundResponse(res, "Offer not found");
        }

        return successResponse(res, "Offer deleted successfully");
    } catch (error) {
        return serverErrorResponse(res, "Unable to delete offer", error);
    }
};

module.exports = {
    getActiveOffers,
    getAllOffers,
    createOffer,
    updateOffer,
    deleteOffer,
};
