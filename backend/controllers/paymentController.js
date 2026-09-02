const Order = require("../models/Order");

const {
    successResponse,
    validationErrorResponse,
    notFoundResponse,
    serverErrorResponse,
    forbiddenResponse,
} = require("../utils/apiResponse");
const { isValidObjectId } = require("../utils/validators");

// Process / Initiate payment
const processPayment = async (req, res) => {
    try {
        const { orderId, paymentMethod, amount } = req.body;

        if (!orderId) {
            return validationErrorResponse(res, "Order ID is required");
        }

        const query = isValidObjectId(orderId) ? { _id: orderId } : { orderId };
        const order = await Order.findOne(query);

        if (!order) {
            return notFoundResponse(res, "Order not found");
        }

        if (order.patientId.toString() !== req.user.id.toString()) {
            return forbiddenResponse(res, "Cannot process payment for another user's order");
        }

        const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

        order.paymentMethod = paymentMethod || order.paymentMethod;
        order.paymentStatus = "Completed";
        await order.save();

        return successResponse(res, "Payment processed successfully", {
            transactionId,
            orderId: order.orderId,
            amount: order.finalAmount,
            paymentStatus: "Completed",
            paymentMethod: order.paymentMethod,
            timestamp: new Date(),
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to process payment", error);
    }
};

// Verify payment status
const verifyPayment = async (req, res) => {
    try {
        const { transactionId, orderId } = req.body;

        if (!orderId) {
            return validationErrorResponse(res, "Order ID is required");
        }

        const query = isValidObjectId(orderId) ? { _id: orderId } : { orderId };
        const order = await Order.findOne(query);

        if (!order) {
            return notFoundResponse(res, "Order not found");
        }

        return successResponse(res, "Payment verification successful", {
            orderId: order.orderId,
            paymentStatus: order.paymentStatus,
            finalAmount: order.finalAmount,
            isVerified: order.paymentStatus === "Completed",
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to verify payment", error);
    }
};

module.exports = {
    processPayment,
    verifyPayment,
};
