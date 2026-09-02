const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine",
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
    subtotal: {
        type: Number,
        required: true,
    },
});

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            unique: true,
        },
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        pharmacyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: [orderItemSchema],
        totalAmount: {
            type: Number,
            required: true,
        },
        discountAmount: {
            type: Number,
            default: 0,
        },
        finalAmount: {
            type: Number,
            required: true,
        },
        couponCode: {
            type: String,
            default: "",
        },
        shippingAddress: {
            fullName: { type: String, default: "" },
            phone: { type: String, default: "" },
            address: { type: String, default: "" },
            city: { type: String, default: "" },
            pincode: { type: String, default: "" },
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Completed", "Failed", "Refunded"],
            default: "Pending",
        },
        paymentMethod: {
            type: String,
            enum: ["Cash on Delivery", "Card", "UPI", "NetBanking"],
            default: "Cash on Delivery",
        },
        orderStatus: {
            type: String,
            enum: ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"],
            default: "Placed",
        },
        prescriptionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Prescription",
            default: null,
        },
        deliveryDate: {
            type: Date,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
