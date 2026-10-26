const mongoose = require('mongoose');

const labReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      unique: true,
      sparse: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null,
    },
    testName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'General Pathology',
    },
    sampleType: {
      type: String,
      default: '',
    },
    results: [
      {
        parameter: String,
        value: String,
        unit: String,
        referenceRange: String,
        status: {
          type: String,
          enum: ['Normal', 'High', 'Low', 'Abnormal', 'Borderline', 'Pending'],
          default: 'Normal',
        },
      },
    ],
    fileUrl: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    remarks: {
      type: String,
      default: '',
    },
    isAbnormal: {
      type: Boolean,
      default: false,
    },
    associatedWithMedicalRecord: {
      type: Boolean,
      default: false,
    },
    medicalRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalRecord',
      default: null,
    },
    status: {
      type: String,
      enum: ['Requested', 'Sample Collected', 'Processing', 'Completed', 'Pending', 'Delivered'],
      default: 'Requested',
    },
    reportDate: {
      type: Date,
      default: Date.now,
    },
    sampleCollectedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

labReportSchema.pre('save', function (next) {
  if (!this.reportId) {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.reportId = `LAB-${ts}${rand}`;
  }
  next();
});

module.exports = mongoose.model('LabReport', labReportSchema);
