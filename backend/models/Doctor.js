const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        doctorId: {
            type: String,
            unique: true,
            required: true,
        },

        specialization: {
            type: String,
            required: true,
            trim: true,
        },

        qualification: {
            type: String,
            default: "",
            trim: true,
        },

        experience: {
            type: Number,
            default: 0,
            min: 0,
        },

        licenseNumber: {
            type: String,
            default: "",
            trim: true,
        },

        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        clinicName: {
            type: String,
            default: "",
            trim: true,
        },

        consultationFee: {
            type: Number,
            default: 0,
            min: 0,
        },

        isAvailable: {
            type: Boolean,
            default: true,
        },

        isApproved: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Doctor", doctorSchema);