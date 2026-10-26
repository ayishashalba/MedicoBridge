const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
  {
    consultationId: {
      type: String,
      unique: true,
      sparse: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
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
    diagnosis: {
      type: String,
      default: '',
    },
    symptoms: {
      type: [String],
      default: [],
    },
    advice: {
      type: String,
      default: '',
    },
    vitals: {
      bp: { type: String, default: '' },
      pulse: { type: String, default: '' },
      temperature: { type: String, default: '' },
      weight: { type: String, default: '' },
      spo2: { type: String, default: '' },
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'In-Progress', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    meetingLink: {
      type: String,
      default: '',
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

consultationSchema.pre('save', function (next) {
  if (!this.consultationId) {
    this.consultationId = `CNS-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  next();
});

module.exports = mongoose.model('Consultation', consultationSchema);
