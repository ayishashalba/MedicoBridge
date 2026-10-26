const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        user: {
            type: String,
            default: "",
            trim: true,
        },

        role: {
            type: String,
            enum: ["Patient", "Doctor", "Hospital", "Pharmacy"],
            required: true,
        },

        type: {
            type: String,
            enum: ["Complaint", "Suggestion", "General Feedback", "Bug Report"],
            required: true,
        },

        subject: {
            type: String,
            required: true,
            trim: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },

        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: null,
        },

        status: {
            type: String,
            enum: ["Pending", "Resolved"],
            default: "Pending",
        },

        adminReply: {
            type: String,
            default: "",
            trim: true,
        },

        repliedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Feedback", feedbackSchema);