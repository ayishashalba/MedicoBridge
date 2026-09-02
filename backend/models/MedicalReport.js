const mongoose = require("mongoose");

const medicalReportSchema = new mongoose.Schema(
    {
        reportId: {
            type: String,
            required: true,
            unique: true,
        },
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        reportType: {
            type: String,
            default: "Diagnostic Summary",
            trim: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        summary: {
            type: String,
            default: "",
            trim: true,
        },
        diagnosis: {
            type: String,
            default: "",
            trim: true,
        },
        treatmentPlan: {
            type: String,
            default: "",
            trim: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        attachments: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("MedicalReport", medicalReportSchema);
