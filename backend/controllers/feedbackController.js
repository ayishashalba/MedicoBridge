const Feedback = require("../models/Feedback");
const {
    sendSuccess,
    sendValidationError,
    sendNotFound,
    sendServerError,
} = require("../utils/responseHandler");

// @desc    Create feedback
// @route   POST /api/feedback
// @access  Private (Patient, Doctor, Hospital, Pharmacy)
const createFeedback = async (req, res) => {
    try {
        const { type, subject, message, rating } = req.body;

        if (!type || !subject || !message) {
            return sendValidationError(res, "Validation failed", [
                "Type, subject and message are required.",
            ]);
        }

        const allowedTypes = [
            "Complaint",
            "Suggestion",
            "General Feedback",
            "Bug Report",
        ];

        if (!allowedTypes.includes(type)) {
            return sendValidationError(res, "Validation failed", [
                "Invalid feedback type.",
            ]);
        }

        if (
            rating !== undefined &&
            rating !== null &&
            (Number(rating) < 1 || Number(rating) > 5)
        ) {
            return sendValidationError(res, "Validation failed", [
                "Rating must be between 1 and 5.",
            ]);
        }

        const feedback = await Feedback.create({
            userId: req.user._id,
            user: req.user.name || "",
            role: req.user.role,
            type,
            subject: subject.trim(),
            message: message.trim(),
            rating:
                rating !== undefined && rating !== null && rating !== ""
                    ? Number(rating)
                    : null,
        });

        return sendSuccess(
            res,
            "Feedback submitted successfully.",
            feedback,
            201
        );
    } catch (error) {
        return sendServerError(res, "Failed to submit feedback.", error);
    }
};

// @desc    Get all feedbacks
// @route   GET /api/feedback
// @access  Private (Admin)
const getFeedbacks = async (req, res) => {
    try {
        const { status, type, role, search } = req.query;

        const query = {};

        if (status) {
            query.status = status;
        }

        if (type) {
            query.type = type;
        }

        if (role) {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { user: { $regex: search, $options: "i" } },
                { subject: { $regex: search, $options: "i" } },
                { message: { $regex: search, $options: "i" } },
            ];
        }

        const feedbacks = await Feedback.find(query)
            .populate("userId", "name email role")
            .sort({ createdAt: -1 });

        return sendSuccess(
            res,
            "Feedbacks fetched successfully.",
            feedbacks
        );
    } catch (error) {
        return sendServerError(res, "Failed to fetch feedbacks.", error);
    }
};

// @desc    Resolve feedback
// @route   PUT /api/feedback/:id/resolve
// @access  Private (Admin)
const resolveFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return sendNotFound(res, "Feedback not found.");
        }

        feedback.status = "Resolved";
        await feedback.save();

        return sendSuccess(
            res,
            "Feedback marked as resolved.",
            feedback
        );
    } catch (error) {
        return sendServerError(res, "Failed to resolve feedback.", error);
    }
};

// @desc    Reply to feedback
// @route   PUT /api/feedback/:id/reply
// @access  Private (Admin)
const replyToFeedback = async (req, res) => {
    try {
        const { reply } = req.body;

        if (!reply || !reply.trim()) {
            return sendValidationError(res, "Validation failed", [
                "Reply message is required.",
            ]);
        }

        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return sendNotFound(res, "Feedback not found.");
        }

        feedback.adminReply = reply.trim();
        feedback.repliedAt = new Date();
        feedback.status = "Resolved";

        await feedback.save();

        return sendSuccess(
            res,
            "Reply saved and feedback resolved.",
            feedback
        );
    } catch (error) {
        return sendServerError(res, "Failed to reply to feedback.", error);
    }
};

module.exports = {
    createFeedback,
    getFeedbacks,
    resolveFeedback,
    replyToFeedback,
};