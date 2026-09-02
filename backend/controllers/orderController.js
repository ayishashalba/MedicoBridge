const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Medicine = require("../models/Medicine");
const Coupon = require("../models/Coupon");

const {
    successResponse,
    validationErrorResponse,
    notFoundResponse,
    serverErrorResponse,
    forbiddenResponse,
} = require("../utils/apiResponse");
const { isValidObjectId } = require("../utils/validators");

const generateOrderId = () => {
    return `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

// Place Order (Patient)
const placeOrder = async (req, res) => {
    try {
        const {
            pharmacyId,
            items,
            couponCode,
            shippingAddress,
            paymentMethod,
            prescriptionId,
        } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return validationErrorResponse(res, "Order must contain at least one item");
        }

        if (!pharmacyId || !isValidObjectId(pharmacyId)) {
            return validationErrorResponse(res, "Valid pharmacy ID is required");
        }

        let totalAmount = 0;
        const processedItems = [];

        for (const item of items) {
            if (!item.medicineId || !isValidObjectId(item.medicineId)) {
                return validationErrorResponse(res, "Invalid medicine ID in order items");
            }

            const medicine = await Medicine.findById(item.medicineId);
            if (!medicine || !medicine.isActive) {
                return validationErrorResponse(res, `Medicine ${item.name || item.medicineId} is unavailable`);
            }

            const qty = Number(item.quantity) || 1;
            if (medicine.stock < qty) {
                return validationErrorResponse(
                    res,
                    `Insufficient stock for ${medicine.name}. Available: ${medicine.stock}`
                );
            }

            const price = medicine.discountPrice > 0 ? medicine.discountPrice : medicine.price;
            const subtotal = Math.round(price * qty * 100) / 100;
            totalAmount += subtotal;

            processedItems.push({
                medicineId: medicine._id,
                name: medicine.name,
                price,
                quantity: qty,
                subtotal,
            });

            // Decrement medicine stock
            medicine.stock = Math.max(0, medicine.stock - qty);
            await medicine.save();
        }

        totalAmount = Math.round(totalAmount * 100) / 100;

        // Apply coupon if provided
        let discountAmount = 0;
        if (couponCode) {
            const coupon = await Coupon.findOne({
                code: couponCode.trim().toUpperCase(),
                isActive: true,
            });

            if (coupon && (!coupon.expiryDate || new Date(coupon.expiryDate) >= new Date()) && coupon.usedCount < coupon.usageLimit) {
                if (totalAmount >= coupon.minOrderAmount) {
                    if (coupon.discountType === "percentage") {
                        discountAmount = (totalAmount * coupon.discountValue) / 100;
                        if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
                            discountAmount = coupon.maxDiscountAmount;
                        }
                    } else {
                        discountAmount = coupon.discountValue;
                    }
                    discountAmount = Math.min(discountAmount, totalAmount);
                    coupon.usedCount += 1;
                    await coupon.save();
                }
            }
        }

        discountAmount = Math.round(discountAmount * 100) / 100;
        const finalAmount = Math.max(0, Math.round((totalAmount - discountAmount) * 100) / 100);

        const order = await Order.create({
            orderId: generateOrderId(),
            patientId: req.user.id,
            pharmacyId,
            items: processedItems,
            totalAmount,
            discountAmount,
            finalAmount,
            couponCode: couponCode || "",
            shippingAddress: shippingAddress || {},
            paymentMethod: paymentMethod || "Cash on Delivery",
            paymentStatus: paymentMethod === "Cash on Delivery" ? "Pending" : "Completed",
            orderStatus: "Placed",
            prescriptionId: prescriptionId && isValidObjectId(prescriptionId) ? prescriptionId : null,
            deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Estimated 3 days
        });

        // Clear patient cart
        await Cart.findOneAndUpdate({ patientId: req.user.id }, { items: [], totalAmount: 0 });

        return successResponse(res, "Order placed successfully", { order }, 201);
    } catch (error) {
        return serverErrorResponse(res, "Unable to place order", error);
    }
};

// Patient: Get own orders
const getPatientOrders = async (req, res) => {
    try {
        const orders = await Order.find({ patientId: req.user.id })
            .populate("pharmacyId", "name email phone city address")
            .sort({ createdAt: -1 });

        return successResponse(res, "Orders retrieved successfully", { orders });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch orders", error);
    }
};

// Pharmacy: Get orders for their pharmacy
const getPharmacyOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const query = { pharmacyId: req.user.id };
        if (status && status !== "All") {
            query.orderStatus = status;
        }

        const orders = await Order.find(query)
            .populate("patientId", "name email phone city address")
            .sort({ createdAt: -1 });

        return successResponse(res, "Pharmacy orders retrieved successfully", { orders });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch pharmacy orders", error);
    }
};

// Get single order details
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = isValidObjectId(id) ? { _id: id } : { orderId: id };

        const order = await Order.findOne(query)
            .populate("patientId", "name email phone city address")
            .populate("pharmacyId", "name email phone city address")
            .populate("prescriptionId");

        if (!order) {
            return notFoundResponse(res, "Order not found");
        }

        const userId = req.user.id.toString();
        const role = req.user.role;

        if (
            role === "patient" && order.patientId._id.toString() !== userId
        ) {
            return forbiddenResponse(res, "Cannot access another user's order");
        }

        if (
            role === "pharmacy" && order.pharmacyId._id.toString() !== userId
        ) {
            return forbiddenResponse(res, "Cannot access another pharmacy's order");
        }

        return successResponse(res, "Order retrieved successfully", { order });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch order details", error);
    }
};

// Update order / delivery status (Pharmacy only)
const updateOrderStatus = async (req, res) => {
    try {
        // Admin rule: Admin MUST NOT modify pharmacy delivery status
        if (req.user.role === "admin") {
            return forbiddenResponse(res, "Admins are strictly forbidden from modifying pharmacy delivery status");
        }

        const { id } = req.params;
        const { orderStatus, paymentStatus } = req.body;

        const query = isValidObjectId(id) ? { _id: id } : { orderId: id };
        const order = await Order.findOne({ ...query, pharmacyId: req.user.id });

        if (!order) {
            return notFoundResponse(res, "Order not found or not assigned to your pharmacy");
        }

        if (orderStatus) {
            const allowedStatuses = ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"];
            if (!allowedStatuses.includes(orderStatus)) {
                return validationErrorResponse(res, "Invalid order status");
            }
            order.orderStatus = orderStatus;
        }

        if (paymentStatus) {
            order.paymentStatus = paymentStatus;
        }

        await order.save();

        return successResponse(res, "Order status updated successfully", { order });
    } catch (error) {
        return serverErrorResponse(res, "Unable to update order status", error);
    }
};

// Cancel order (Patient or Pharmacy)
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const query = isValidObjectId(id) ? { _id: id } : { orderId: id };

        const order = await Order.findOne(query);
        if (!order) {
            return notFoundResponse(res, "Order not found");
        }

        const userId = req.user.id.toString();
        const role = req.user.role;

        if (role === "admin") {
            return forbiddenResponse(res, "Admins cannot directly cancel customer orders");
        }

        if (
            order.patientId.toString() !== userId &&
            order.pharmacyId.toString() !== userId
        ) {
            return forbiddenResponse(res, "Not authorized to cancel this order");
        }

        if (order.orderStatus === "Delivered" || order.orderStatus === "Cancelled") {
            return validationErrorResponse(res, `Cannot cancel order with status '${order.orderStatus}'`);
        }

        order.orderStatus = "Cancelled";
        await order.save();

        // Restock medicines
        for (const item of order.items) {
            if (item.medicineId) {
                await Medicine.findByIdAndUpdate(item.medicineId, {
                    $inc: { stock: item.quantity },
                });
            }
        }

        return successResponse(res, "Order cancelled successfully and inventory restocked", { order });
    } catch (error) {
        return serverErrorResponse(res, "Unable to cancel order", error);
    }
};

module.exports = {
    placeOrder,
    getPatientOrders,
    getPharmacyOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
};
