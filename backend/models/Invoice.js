const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: String,
      unique: true,
      sparse: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      default: null,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    patientName: {
      type: String,
      default: '',
    },
    patientCustomId: {
      type: String,
      default: '',
    },
    patientAge: {
      type: Number,
      default: null,
    },
    patientGender: {
      type: String,
      default: 'Male',
    },
    patientPhone: {
      type: String,
      default: '',
    },
    patientEmail: {
      type: String,
      default: '',
    },
    patientAddress: {
      type: String,
      default: '',
    },
    encounterId: {
      type: String,
      default: '',
    },
    encounterType: {
      type: String,
      default: 'OP Visit',
    },
    department: {
      type: String,
      default: 'General',
    },
    attendingDoctor: {
      type: String,
      default: '',
    },
    billingOfficer: {
      type: String,
      default: 'Priya Rajan',
    },
    items: [
      {
        id: { type: Number, default: Date.now },
        description: { type: String, required: true },
        category: { type: String, default: 'Other Services' },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        amount: { type: Number, required: true },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled', 'Refunded'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      default: 'Cash',
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    paidAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    insuranceProvider: {
      type: String,
      default: null,
    },
    policyNumber: {
      type: String,
      default: null,
    },
    paymentHistory: [
      {
        date: { type: String, default: '' },
        amount: { type: Number, required: true },
        method: { type: String, default: 'Cash' },
        ref: { type: String, default: '' },
        note: { type: String, default: '' },
      },
    ],
    insuranceClaim: {
      claimId: { type: String, default: null },
      invoiceId: { type: String, default: null },
      patientName: { type: String, default: '' },
      patientId: { type: String, default: '' },
      provider: { type: String, default: '' },
      policyNo: { type: String, default: '' },
      claimAmount: { type: Number, default: 0 },
      approvedAmount: { type: Number, default: 0 },
      insurancePaid: { type: Number, default: 0 },
      patientPayable: { type: Number, default: 0 },
      claimStatus: {
        type: String,
        enum: ['Submitted', 'Approved', 'Partially Approved', 'Pending', 'Rejected', 'Settled'],
        default: 'Submitted',
      },
      submittedDate: { type: String, default: null },
      settledDate: { type: String, default: null },
      tpaRef: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

invoiceSchema.pre('save', function (next) {
  if (!this.invoiceId) {
    this.invoiceId = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);

