const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        genericName: {
            type: String,
            default: "",
            trim: true,
        },
        category: {
            type: String,
            default: "General",
            trim: true,
        },
        manufacturer: {
            type: String,
            default: "",
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        discountPrice: {
            type: Number,
            default: 0,
            min: 0,
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        expiryDate: {
            type: Date,
        },
        requiresPrescription: {
            type: Boolean,
            default: false,
        },
        pharmacyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        pharmacyType: {
            type: String,
            enum: ["retail", "hospital"],
            default: "retail",
        },
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        dosageForm: {
            type: String,
            enum: ["Tablet", "Capsule", "Syrup", "Injection", "Ointment", "Drops", "Other"],
            default: "Tablet",
        },
        strength: {
            type: String,
            default: "",
            trim: true,
        },
        image: {
            type: String,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Medicine", medicineSchema);
