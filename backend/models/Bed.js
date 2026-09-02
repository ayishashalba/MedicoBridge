const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema(
    {
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            default: null,
        },
        bedNumber: {
            type: String,
            required: true,
            trim: true,
        },
        bedType: {
            type: String,
            enum: ["General", "ICU", "Semi-Private", "Deluxe", "Emergency", "Pediatric"],
            default: "General",
        },
        isOccupied: {
            type: Boolean,
            default: false,
        },
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        dailyRate: {
            type: Number,
            default: 0,
            min: 0,
        },
        status: {
            type: String,
            enum: ["Available", "Occupied", "Maintenance", "Reserved"],
            default: "Available",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Bed", bedSchema);
