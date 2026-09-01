const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },

        phone: {
            type: String,
            default: "",
            trim: true,
        },

        role: {
            type: String,
            enum: ["patient", "doctor", "hospital", "pharmacy", "admin"],
            required: true,
        },

        city: {
            type: String,
            default: "",
            trim: true,
        },

        address: {
            type: String,
            default: "",
            trim: true,
        },

        bloodGroup: {
            type: String,
            enum: [
                "",
                "A+",
                "A-",
                "B+",
                "B-",
                "AB+",
                "AB-",
                "O+",
                "O-",
            ],
            default: "",
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        isApproved: {
            type: Boolean,
            default: false,
        },

        lastLogin: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);