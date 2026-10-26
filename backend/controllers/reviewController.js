const Review = require('../models/Review');
const Patient = require('../models/Patient');
const Medicine = require('../models/Medicine');
const Order = require('../models/Order');
const {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendServerError,
} = require('../utils/responseHandler');

// @desc    Create review
// @route   POST /api/reviews
// @access  Private (Patient)
const createReview = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return sendNotFound(res, 'Patient profile not found.');

    const { medicineId, pharmacyId, doctorId, rating, comment } = req.body;

    if (!rating || !comment) {
      return sendValidationError(res, 'Validation failed', ['Rating and comment are required.']);
    }

    if (Number(rating) < 1 || Number(rating) > 5) {
      return sendValidationError(res, 'Validation failed', ['Rating must be between 1 and 5.']);
    }

    // Check if patient purchased medicine
    let isVerifiedPurchase = false;
    if (medicineId) {
      const order = await Order.findOne({
        patientId: patient._id,
        'items.medicineId': medicineId,
        orderStatus: 'Delivered',
      });
      isVerifiedPurchase = Boolean(order);
    }

    const review = await Review.create({
      patientId: patient._id,
      patientName: patient.name,
      medicineId: medicineId || null,
      pharmacyId: pharmacyId || null,
      doctorId: doctorId || null,
      rating: Number(rating),
      comment: comment.trim(),
      isVerifiedPurchase,
    });

    return sendSuccess(res, 'Review submitted successfully.', review, 201);
  } catch (error) {
    return sendServerError(res, 'Failed to submit review.', error);
  }
};

// @desc    Get reviews for a medicine
// @route   GET /api/reviews/:medicineId
// @access  Public
const getMedicineReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ medicineId: req.params.medicineId })
      .populate('patientId', 'name profileImage')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
      : 0;

    return sendSuccess(res, 'Reviews fetched successfully.', {
      reviews,
      totalReviews: reviews.length,
      averageRating: avgRating,
    });
  } catch (error) {
    return sendServerError(res, 'Failed to fetch reviews.', error);
  }
};

module.exports = {
  createReview,
  getMedicineReviews,
};
