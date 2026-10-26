const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    bedNumber: {
      type: String,
      required: true,
      trim: true,
    },
    ward: {
      type: String,
      required: true,
      trim: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    departmentName: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['General', 'ICU', 'Semi-Private', 'Private', 'Emergency', 'Pediatric', 'Maternity'],
      default: 'General',
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Reserved'],
      default: 'Available',
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      default: null,
    },
    patientName: {
      type: String,
      default: '',
    },
    dailyRate: {
      type: Number,
      default: 1000,
    },
    admittedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure bedNumber is unique per hospital
bedSchema.index({ hospitalId: 1, bedNumber: 1, ward: 1 }, { unique: true });

module.exports = mongoose.model('Bed', bedSchema);
