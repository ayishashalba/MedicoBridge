const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        patientName: {
            type: String,
            default: "",
            trim: true,
        },
        targetType: {
            type: String,
            enum: ["Doctor", "Hospital", "Pharmacy", "Platform", "doctor", "hospital", "pharmacy", "platform"],
            default: "Platform",
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
        },
        isApproved: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
