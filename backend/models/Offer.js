const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    offerName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    discountType: {
      type: String,
      enum: ['flat', 'percentage'],
      required: true,
      default: 'flat',
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      default: null,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to check if offer is currently valid
offerSchema.methods.isCurrentlyActive = function () {
  const now = new Date();
  return this.isActive && now >= new Date(this.startDate) && now <= new Date(this.endDate);
};

module.exports = mongoose.model('Offer', offerSchema);
