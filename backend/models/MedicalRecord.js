const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        recordType: {
            type: String,
            default: "Medical Record",
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);