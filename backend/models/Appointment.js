const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
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
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null,
    },
    department: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['In-Person', 'Online Consultation', 'Emergency', 'General Visit'],
      default: 'In-Person',
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    reason: {
      type: String,
      default: '',
    },
    symptoms: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      default: '',
    },
    fee: {
      type: Number,
      default: 500,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded', 'Failed'],
      default: 'Pending',
    },
    cancelledBy: {
      type: String,
      enum: ['Patient', 'Doctor', 'Hospital', ''],
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    feedback: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ doctorId: 1, date: 1, timeSlot: 1 });
appointmentSchema.index({ patientId: 1, date: -1 });

appointmentSchema.pre('save', function (next) {
  if (!this.appointmentId) {
    this.appointmentId = `APT-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
