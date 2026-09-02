const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        appointmentId: {
            type: String,
            unique: true,
            required: true,
        },

        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            default: null,
        },

        date: {
            type: Date,
            required: true,
        },

        time: {
            type: String,
            required: true,
        },

        mode: {
            type: String,
            enum: ["Online", "Offline"],
            default: "Offline",
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Confirmed",
                "Accepted",
                "Cancelled",
                "Completed",
                "Rejected",
            ],
            default: "Pending",
        },

        reason: {
            type: String,
            default: "",
        },

        notes: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Appointment", appointmentSchema);