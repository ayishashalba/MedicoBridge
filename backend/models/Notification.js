const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      default: "Info",
    },

    category: {
      type: String,
      default: "System Alerts",
    },

    targetRole: {
      type: String,
      enum: [
        "All Users",
        "Patient",
        "Doctor",
        "Hospital",
        "Pharmacy",
        "Doctors & Pharmacies",
      ],
      default: "All Users",
    },

    actionLink: {
      type: String,
      default: "",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    isDismissed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);