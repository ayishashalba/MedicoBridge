const mongoose = require("mongoose");

const adminLogSchema = new mongoose.Schema(
    {
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        action: {
            type: String,
            required: true,
            trim: true,
        },
        targetType: {
            type: String,
            required: true,
            enum: ["User", "Doctor", "Hospital", "Pharmacy", "Offer", "Coupon", "System"],
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
        details: {
            type: String,
            default: "",
        },
        ipAddress: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AdminLog", adminLogSchema);
