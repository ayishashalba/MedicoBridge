const mongoose = require('mongoose');

const hospitalSettingsSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
      unique: true,
    },
    // Ward settings
    autoReleaseBeds: {
      type: Boolean,
      default: true,
    },
    admitAlertEmails: {
      type: Boolean,
      default: true,
    },
    icuBedCapacity: {
      type: Number,
      default: 20,
      min: 0,
    },
    // Billing settings
    cgstRate: {
      type: Number,
      default: 2.5,
      min: 0,
    },
    sgstRate: {
      type: Number,
      default: 2.5,
      min: 0,
    },
    icuRoomFeePerDay: {
      type: Number,
      default: 15000,
      min: 0,
    },
    generalWardFeePerDay: {
      type: Number,
      default: 2500,
      min: 0,
    },
    billingReminders: {
      type: Boolean,
      default: false,
    },
    // Security settings
    twoFactorAuth: {
      type: Boolean,
      default: false,
    },
    loginAuditLogs: {
      type: Boolean,
      default: true,
    },
    autoLogoutTimeout: {
      type: Number,
      default: 30,
      enum: [15, 30, 60],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('HospitalSettings', hospitalSettingsSchema);
