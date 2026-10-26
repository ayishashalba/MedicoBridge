const Offer = require('../models/Offer');
const Medicine = require('../models/Medicine');
const {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendServerError,
} = require('../utils/responseHandler');

// @desc    Get all offers (filtered by active status if requested)
// @route   GET /api/offers
// @access  Public / Private
const getOffers = async (req, res) => {
  try {
    const { activeOnly, pharmacyId, medicineId } = req.query;
    const query = {};

    if (pharmacyId) query.pharmacyId = pharmacyId;
    if (medicineId) query.medicineId = medicineId;

    if (activeOnly === 'true') {
      const now = new Date();
      query.isActive = true;
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
    }

    const offers = await Offer.find(query)
      .populate('medicineId', 'name price category image')
      .populate('pharmacyId', 'name city')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Offers fetched successfully.', offers);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch offers.', error);
  }
};

// @desc    Create new offer
// @route   POST /api/offers
// @access  Private (Pharmacy / Admin)
const createOffer = async (req, res) => {
  try {
    const { offerName, description, discountType, discountValue, medicineId, pharmacyId, startDate, endDate, isActive } = req.body;

    if (!offerName || !discountType || discountValue === undefined || !medicineId || !startDate || !endDate) {
      return sendValidationError(res, 'Validation failed', [
        'Offer name, discount type, discount value, medicine ID, start date, and end date are required.',
      ]);
    }

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return sendNotFound(res, 'Medicine not found.');
    }

    const offer = await Offer.create({
      offerName: offerName.trim(),
      description: description || '',
      discountType,
      discountValue: Number(discountValue),
      medicineId,
      pharmacyId: pharmacyId || medicine.pharmacyId || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return sendSuccess(res, 'Offer created successfully.', offer, 201);
  } catch (error) {
    return sendServerError(res, 'Failed to create offer.', error);
  }
};

// @desc    Update offer
// @route   PUT /api/offers/:id
// @access  Private (Pharmacy / Admin)
const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return sendNotFound(res, 'Offer not found.');
    }

    const { offerName, description, discountType, discountValue, startDate, endDate, isActive } = req.body;

    if (offerName) offer.offerName = offerName.trim();
    if (description !== undefined) offer.description = description;
    if (discountType) offer.discountType = discountType;
    if (discountValue !== undefined) offer.discountValue = Number(discountValue);
    if (startDate) offer.startDate = new Date(startDate);
    if (endDate) offer.endDate = new Date(endDate);
    if (isActive !== undefined) offer.isActive = Boolean(isActive);

    await offer.save();
    return sendSuccess(res, 'Offer updated successfully.', offer);
  } catch (error) {
    return sendServerError(res, 'Failed to update offer.', error);
  }
};

// @desc    Delete offer
// @route   DELETE /api/offers/:id
// @access  Private (Pharmacy / Admin)
const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) {
      return sendNotFound(res, 'Offer not found.');
    }
    return sendSuccess(res, 'Offer deleted successfully.');
  } catch (error) {
    return sendServerError(res, 'Failed to delete offer.', error);
  }
};

module.exports = {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
};
