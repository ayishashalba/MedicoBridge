const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      sparse: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      default: null,
    },
    items: [
      {
        medicineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Medicine',
          required: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
        offerDiscount: { type: Number, default: 0 },
        finalPrice: { type: Number, required: true },
        itemTotal: { type: Number, required: true },
        status: {
          type: String,
          enum: ['Active', 'Cancelled'],
          default: 'Active',
        },
        cancelledAt: {
          type: Date,
          default: null,
        },
        cancelReason: {
          type: String,
          default: '',
        },
        stockRestored: {
          type: Boolean,
          default: false,
        },
        refundAmount: {
          type: Number,
          default: 0,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    offerDiscount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: '',
    },
    couponDiscount: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    originalTotalAmount: {
      type: Number,
      default: null,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundStatus: {
      type: String,
      enum: ['None', 'Pending', 'Approved', 'Processing', 'Partially Refunded', 'Refunded', 'Rejected', 'Failed'],
      default: 'None',
    },
    refundMethod: {
      type: String,
      enum: ['None', 'UPI', 'Bank Account', 'QR Code'],
      default: 'None',
    },
    refundDetails: {
      upiId: { type: String, default: '' },
      accountHolderName: { type: String, default: '' },
      accountNumberMasked: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      bankName: { type: String, default: '' },
      qrCodeImage: { type: String, default: '' },
    },
    refundRejectionReason: {
      type: String,
      default: '',
    },
    refundFailureReason: {
      type: String,
      default: '',
    },
    reorderedFromOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    reorderedFromOrderNumber: {
      type: String,
      default: '',
    },
    isReorder: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Razorpay', 'Online', 'Card', 'UPI'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Partially Cancelled'],
      default: 'Pending',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelReason: {
      type: String,
      default: '',
    },
    deliveryAddress: {
      fullName: { type: String, default: '' },
      phone: { type: String, default: '' },
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    trackingNumber: {
      type: String,
      default: '',
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null,
    },
    wardLocation: {
      type: String,
      default: '',
    },
    paymentMode: {
      type: String,
      default: '',
    },
    hospitalOrderStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Preparing', 'Ready', 'Dispensed', 'Cancelled'],
      default: 'Pending',
    },
    isHospitalOrder: {
      type: Boolean,
      default: false,
    },
    // Razorpay payment tracking
    razorpayOrderId: {
      type: String,
      default: '',
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre('save', function (next) {
  if (!this.orderId) {
    this.orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
