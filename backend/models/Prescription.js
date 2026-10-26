const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
      default: null,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null,
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      default: null,
    },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, default: '1 tablet' },
        frequency: { type: String, default: 'Twice daily' },
        duration: { type: String, default: '5 days' },
        timing: { type: String, default: 'After meals' },
        instructions: { type: String, default: '' },
      },
    ],
    diagnosis: {
      type: String,
      default: '',
    },
    advice: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Dispensed', 'Cancelled'],
      default: 'Active',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verificationDate: {
      type: Date,
      default: null,
    },
    isHospitalPharmacy: {
      type: Boolean,
      default: false,
    },
    hospitalPharmacyStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Approved', 'Dispensed', 'Rejected'],
      default: 'Pending',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

prescriptionSchema.pre('save', function (next) {
  if (!this.prescriptionId) {
    this.prescriptionId = `RX-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  next();
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
