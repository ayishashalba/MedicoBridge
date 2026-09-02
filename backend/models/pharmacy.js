const mongoose = require("mongoose");

const pharmacySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        pharmacyName: {
            type: String,
            required: true,
            trim: true,
        },

        pharmacyType: {
            type: String,
            enum: ["retail", "hospital"],
            default: "retail",
        },

        licenseNumber: {
            type: String,
            default: "",
        },

        phone: {
            type: String,
            default: "",
        },

        email: {
            type: String,
            default: "",
        },

        address: {
            type: String,
            default: "",
        },

        city: {
            type: String,
            default: "",
            trim: true,
        },

        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        isApproved: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Pharmacy", pharmacySchema);