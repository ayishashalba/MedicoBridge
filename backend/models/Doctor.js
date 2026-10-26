const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    doctorId: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    gender: {
      type: String,
      default: '',
    },
    bloodGroup: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: '',
    },
    medRegNumber: {
      type: String,
      default: '',
      trim: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    qualification: {
      type: String,
      default: '',
    },
    experience: {
      type: String,
      default: '',
    },
    practiceType: {
      type: String,
      enum: ['Hospital', 'Clinic', 'Both', 'hospital', 'clinic', 'both', '', null],
      default: 'Hospital',
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null,
    },
    hospitalName: {
      type: String,
      default: '',
    },
    branchLocation: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: '',
    },
    clinicName: {
      type: String,
      default: '',
    },
    clinicAddress: {
      type: String,
      default: '',
    },
    clinicCity: {
      type: String,
      default: '',
    },
    clinicState: {
      type: String,
      default: '',
    },
    clinicPincode: {
      type: String,
      default: '',
    },
    isDonorAvailable: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      default: '',
    },
    medicalLicense: {
      type: String,
      default: '',
    },
    consultationFee: {
      type: Number,
      default: 500,
    },
    availableDays: {
      type: [String],
      default: [],
    },
    availableSlots: [
      {
        day: String,
        startTime: String,
        endTime: String,
        isAvailable: { type: Boolean, default: true },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    accountStatus: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },
    rating: {
      type: Number,
      default: 4.8,
    },
  },
  {
    timestamps: true,
  }
);

doctorSchema.pre('save', function (next) {
  if (!this.doctorId) {
    this.doctorId = `DR-${Math.floor(10000 + Math.random() * 90000)}`;
  }
  next();
});

module.exports = mongoose.model('Doctor', doctorSchema);
