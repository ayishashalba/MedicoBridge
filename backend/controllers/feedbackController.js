const Review = require("../models/Review");
const User = require("../models/User");

const {
    successResponse,
    validationErrorResponse,
    notFoundResponse,
    serverErrorResponse,
} = require("../utils/apiResponse");
const { isValidObjectId } = require("../utils/validators");

// Submit review / feedback
const submitFeedback = async (req, res) => {
    try {
        const { targetType, targetId, rating, comment, patientName } = req.body;

        if (!rating || !comment) {
            return validationErrorResponse(res, "Rating and comment are required");
        }

        const ratingNum = Number(rating);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            return validationErrorResponse(res, "Rating must be between 1 and 5");
        }

        const userName = patientName || (req.user ? req.user.name : "Anonymous");

        const review = await Review.create({
            userId: req.user ? req.user.id : null,
            patientName: userName,
            targetType: targetType || "Platform",
            targetId: targetId && isValidObjectId(targetId) ? targetId : null,
            rating: ratingNum,
            comment: comment.trim(),
            isApproved: true,
        });

        return successResponse(res, "Feedback submitted successfully", { review }, 201);
    } catch (error) {
        return serverErrorResponse(res, "Unable to submit feedback", error);
    }
};

// Get feedback (filtered by targetId, targetType, or platform)
const getFeedback = async (req, res) => {
    try {
        const { targetType, targetId } = req.query;

        const query = { isApproved: true };
        if (targetType) query.targetType = new RegExp(`^${targetType}$`, "i");
        if (targetId && isValidObjectId(targetId)) query.targetId = targetId;

        const reviews = await Review.find(query)
            .populate("userId", "name profileImage role")
            .sort({ createdAt: -1 });

        const averageRating =
            reviews.length > 0
                ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) * 10) / 10
                : 5.0;

        return successResponse(res, "Feedback retrieved successfully", {
            reviews,
            count: reviews.length,
            averageRating,
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch feedback", error);
    }
};

// Get feedback for patient view
const getPatientFeedback = async (req, res) => {
    try {
        const reviews = await Review.find({ isApproved: true })
            .sort({ createdAt: -1 })
            .limit(20);

        return successResponse(res, "Patient feedback retrieved successfully", {
            feedback: reviews,
            count: reviews.length,
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch feedback", error);
    }
};

module.exports = {
    submitFeedback,
    getFeedback,
    getPatientFeedback,
};
