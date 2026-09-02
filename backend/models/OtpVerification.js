const mongoose = require("mongoose");

const otpVerificationSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        otpHash: {
            type: String,
            required: true,
        },
        purpose: {
            type: String,
            enum: ["registration", "password_reset", "login_2fa"],
            default: "registration",
        },
        registrationData: {
            type: Object,
            default: null,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: "0s" }, // Automatic TTL deletion by MongoDB
        },
        attempts: {
            type: Number,
            default: 0,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        lastResentAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("OtpVerification", otpVerificationSchema);
