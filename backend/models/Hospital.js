const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        hospitalName: {
            type: String,
            required: true,
            trim: true,
        },

        registrationNumber: {
            type: String,
            default: "",
            trim: true,
        },

        phone: {
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

module.exports = mongoose.model("Hospital", hospitalSchema);