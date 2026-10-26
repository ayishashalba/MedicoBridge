const mongoose = require("mongoose");

const systemSettingsSchema = new mongoose.Schema(
    {
        maintenanceMode: {
            type: Boolean,
            default: false,
        },

        autoVerifyMedicalRegistrations: {
            type: Boolean,
            default: false,
        },

        telehealthEnabled: {
            type: Boolean,
            default: true,
        },

        platformFeePercent: {
            type: Number,
            min: 0,
            max: 50,
            default: 10,
        },

        pharmacyDeliveryDistanceKm: {
            type: Number,
            min: 1,
            default: 10,
        },

        paymentGateway: {
            type: String,
            enum: ["Razorpay", "Stripe", "Paytm"],
            default: "Razorpay",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "SystemSettings",
    systemSettingsSchema
);