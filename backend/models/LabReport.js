const mongoose = require("mongoose");

const labReportSchema = new mongoose.Schema(
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
        testName: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            default: "Biochemistry",
            trim: true,
        },
        result: {
            type: String,
            default: "",
            trim: true,
        },
        normalRange: {
            type: String,
            default: "",
            trim: true,
        },
        unit: {
            type: String,
            default: "",
            trim: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Completed", "In Review"],
            default: "Completed",
        },
        reportDate: {
            type: Date,
            default: Date.now,
        },
        fileUrl: {
            type: String,
            default: "",
        },
        notes: {
            type: String,
            default: "",
            trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("LabReport", labReportSchema);
