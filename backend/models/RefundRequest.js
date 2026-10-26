const mongoose = require('mongoose');

const refundRequestSchema = new mongoose.Schema(
  {
    refundId: {
      type: String,
      unique: true,
      sparse: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    patientName: {
      type: String,
      default: '',
    },
    patientEmail: {
      type: String,
      default: '',
    },
    patientPhone: {
      type: String,
      default: '',
    },
    cancellationType: {
      type: String,
      enum: ['Item', 'Order'],
      default: 'Item',
    },
    cancelledItems: [
      {
        medicineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Medicine',
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        offerDiscount: { type: Number, default: 0 },
        finalPrice: { type: Number, required: true },
        itemTotal: { type: Number, required: true },
        refundAmount: { type: Number, required: true },
      },
    ],
    cancellationReason: {
      type: String,
      default: '',
    },
    refundAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    refundMethod: {
      type: String,
      enum: ['UPI', 'Bank Account', 'QR Code'],
      required: true,
    },
    refundDetails: {
      upiId: { type: String, default: '' },
      accountHolderName: { type: String, default: '' },
      accountNumberMasked: { type: String, default: '' }, // e.g. "•••• •••• 1234"
      ifscCode: { type: String, default: '' },
      bankName: { type: String, default: '' },
      qrCodeImage: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Processing', 'Refunded', 'Rejected', 'Failed'],
      default: 'Pending',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    failureReason: {
      type: String,
      default: '',
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    transactionReference: {
      type: String,
      default: '',
    },
    gatewayMode: {
      type: String,
      default: 'Demo / Simulated Gateway Transfer',
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
        changedBy: { type: String, default: 'System' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

refundRequestSchema.pre('save', function (next) {
  if (!this.refundId) {
    this.refundId = `REF-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  next();
});

module.exports = mongoose.model('RefundRequest', refundRequestSchema);
