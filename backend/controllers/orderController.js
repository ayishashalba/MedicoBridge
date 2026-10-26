const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Patient = require('../models/Patient');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Payment = require('../models/Payment');
const RefundRequest = require('../models/RefundRequest');
const Coupon = require('../models/Coupon');
const { calculateMedicineOffer, validateCouponDiscount } = require('../services/pricingService');
const { createNotification } = require('../services/notificationService');
const {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendForbidden,
  sendServerError,
} = require('../utils/responseHandler');

/**
 * Validates and normalizes refund method details submitted by a patient.
 * Returns { selectedMethod, refundDetails } or throws if invalid.
 */
function buildRefundInfo(refundMethod, refundDetails = {}, order) {
  const isPaid = order.paymentStatus === 'Paid';
  if (!isPaid) {
    return { selectedMethod: 'None', refundDetails: {} };
  }

  const method = (refundMethod || '').trim();
  if (!method || method === 'None') {
    throw new Error('Please select a refund method to proceed with the cancellation.');
  }

  if (method === 'UPI') {
    const upiId = (refundDetails.upiId || '').trim();
    if (!upiId) throw new Error('UPI ID is required for UPI refund.');
    const upiRegex = /^[a-zA-Z0-9.\-_]{3,}@[a-zA-Z]{3,}$/;
    if (!upiRegex.test(upiId)) throw new Error('Please enter a valid UPI ID (e.g. name@upi).');
    return { selectedMethod: 'UPI', refundDetails: { upiId } };
  }

  if (method === 'Bank Account' || method === 'BankAccount') {
    const { accountHolderName, accountNumber, ifscCode, bankName } = refundDetails;
    if (!accountHolderName || !String(accountHolderName).trim())
      throw new Error('Account holder name is required.');
    if (!accountNumber || !String(accountNumber).trim())
      throw new Error('Account number is required.');
    const cleanAcc = String(accountNumber).trim();
    if (!/^\d{9,18}$/.test(cleanAcc))
      throw new Error('Account number must be 9–18 digits.');
    if (!ifscCode || !String(ifscCode).trim())
      throw new Error('IFSC code is required.');
    const cleanIfsc = String(ifscCode).trim().toUpperCase();
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc))
      throw new Error('Please enter a valid IFSC code (e.g. HDFC0001234).');

    // Never store full account in non-masked plain field; store securely masked
    const masked = cleanAcc.length > 4 
      ? `•••• •••• ${cleanAcc.slice(-4)}`
      : cleanAcc;

    return {
      selectedMethod: 'Bank Account',
      refundDetails: {
        accountHolderName: String(accountHolderName).trim(),
        accountNumberMasked: masked,
        ifscCode: cleanIfsc,
        bankName: bankName ? String(bankName).trim() : '',
      },
    };
  }

  if (method === 'QR Code' || method === 'UPIQRCode' || method === 'QRCode') {
    const qrCodeImage = (refundDetails.qrCodeImage || '').trim();
    if (!qrCodeImage) {
      throw new Error('Please upload your UPI QR code image before proceeding.');
    }
    return {
      selectedMethod: 'QR Code',
      refundDetails: {
        qrCodeImage,
      },
    };
  }

  throw new Error(`Unknown refund method: ${method}. Choose UPI, Bank Account, or QR Code.`);
}


// @route   POST /api/orders
// @access  Private (Patient)
const createOrder = async (req, res) => {
  try {
    let patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      patient = await Patient.findById(req.user._id);
    }
    if (!patient) {
      return sendNotFound(res, 'Patient profile not found.');
    }

    const {
      items,
      deliveryAddress,
      paymentMethod,
      couponCode,
      couponDiscount: requestCouponDiscount,
      deliveryFee: requestDeliveryFee,
      reorderedFromOrderId: requestReorderId,
      reorderedFromOrderNumber: requestReorderNum,
    } = req.body;

    // Items can come from request body or patient's existing cart
    let orderItems = items;
    let existingCart = null;
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      existingCart = await Cart.findOne({ patientId: patient._id });
      if (!existingCart || existingCart.items.length === 0) {
        return sendValidationError(res, 'Validation failed', ['Your cart is empty.']);
      }
      orderItems = existingCart.items;
    } else {
      existingCart = await Cart.findOne({ patientId: patient._id });
    }

    const reorderedFromOrderId = requestReorderId || existingCart?.reorderedFromOrderId || null;
    const reorderedFromOrderNumber = requestReorderNum || existingCart?.reorderedFromOrderNumber || '';
    const isReorder = !!reorderedFromOrderId;

    let subtotal = 0;
    let totalOfferDiscount = 0;
    const finalItems = [];
    let detectedPharmacyId = null;

    for (const item of orderItems) {
      const medId = item.medicineId?._id || item.medicineId;
      const med = await Medicine.findById(medId);

      if (!med) {
        return sendNotFound(res, `Medicine item not found.`);
      }

      if (med.stock < item.quantity) {
        return sendValidationError(res, `Insufficient stock for medicine: ${med.name}`, [
          `Only ${med.stock} units available for ${med.name}.`,
        ]);
      }

      if (!detectedPharmacyId && med.pharmacyId) {
        detectedPharmacyId = med.pharmacyId;
      }

      const { offerDiscount, finalUnitPrice } = await calculateMedicineOffer(med._id, med.price);

      const itemTotal = Number((finalUnitPrice * item.quantity).toFixed(2));
      subtotal += med.price * item.quantity;
      totalOfferDiscount += offerDiscount * item.quantity;

      finalItems.push({
        medicineId: med._id,
        name: med.name,
        quantity: item.quantity,
        unitPrice: med.price,
        offerDiscount,
        finalPrice: finalUnitPrice,
        itemTotal,
      });

      // Deduct inventory stock
      med.stock = Math.max(0, med.stock - item.quantity);
      med.isAvailable = med.stock > 0;
      await med.save();
    }

    const subtotalAfterOffers = Math.max(0, subtotal - totalOfferDiscount);

    // Calculate coupon discount
    let couponDiscount = 0;
    let appliedCouponCode = '';
    if (couponCode) {
      const couponRes = await validateCouponDiscount(couponCode, subtotalAfterOffers);
      if (couponRes.isValid) {
        couponDiscount = couponRes.discount;
        appliedCouponCode = couponRes.coupon?.code || couponCode.toUpperCase().trim();
        // Increment coupon usage
        if (couponRes.coupon?._id) {
          await Coupon.findByIdAndUpdate(couponRes.coupon._id, { $inc: { usedCount: 1 } });
        }
      }
    }

    // Delivery fee: use value sent from checkout (already calculated on the frontend)
    // Minimum 0. Frontend applies free-delivery logic (coupons, threshold) before sending.
    const deliveryFee = Number(requestDeliveryFee) >= 0 ? Number(Number(requestDeliveryFee).toFixed(2)) : 0;

    // Final total = subtotal − offerDiscount − couponDiscount + deliveryFee
    const totalAmount = Number(
      Math.max(0, subtotalAfterOffers - couponDiscount + deliveryFee).toFixed(2)
    );

    const order = await Order.create({
      patientId: patient._id,
      pharmacyId: detectedPharmacyId,
      items: finalItems,
      subtotal: Number(subtotal.toFixed(2)),
      offerDiscount: Number(totalOfferDiscount.toFixed(2)),
      couponCode: appliedCouponCode,
      couponDiscount: Number(couponDiscount.toFixed(2)),
      deliveryFee,
      totalAmount,
      originalTotalAmount: totalAmount,
      isReorder,
      reorderedFromOrderId,
      reorderedFromOrderNumber,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: 'Pending', // COD: paid on delivery; Razorpay: verified after gateway callback
      orderStatus: 'Confirmed',
      deliveryAddress: deliveryAddress || {
        fullName: patient.name,
        phone: patient.phone,
        street: patient.address,
        city: patient.city,
      },
    });

    // Create payment record
    await Payment.create({
      orderId: order._id,
      patientId: patient._id,
      paymentMethod: paymentMethod || 'COD',
      amount: totalAmount,
      paymentStatus: 'Pending', // Will be updated to Completed after Razorpay verification or COD collection
    });

    // Clear cart after checkout
    await Cart.findOneAndUpdate(
      { patientId: patient._id },
      {
        items: [],
        couponCode: '',
        couponDiscount: 0,
        subtotal: 0,
        totalAmount: 0,
        reorderedFromOrderId: null,
        reorderedFromOrderNumber: '',
      }
    );

    // Send notifications
    await createNotification({
      userId: req.user._id,
      recipientRole: 'Patient',
      title: 'Order Confirmed',
      message: `Your medicine order ${order.orderId} of ₹${totalAmount} has been placed successfully.`,
      type: 'Order',
      metadata: { orderId: order._id },
    });

    if (detectedPharmacyId) {
      const pharmacy = await Pharmacy.findById(detectedPharmacyId);
      if (pharmacy) {
        await createNotification({
          userId: pharmacy.userId,
          recipientRole: 'Pharmacy',
          title: 'New Customer Order Received',
          message: `You have received a new order ${order.orderId} for ₹${totalAmount}.`,
          type: 'Order',
          metadata: { orderId: order._id },
        });
      }
    }

    return sendSuccess(res, 'Order placed successfully.', order, 201);
  } catch (error) {
    return sendServerError(res, 'Failed to place order.', error);
  }
};

// @desc    Get patient orders
// @route   GET /api/patient/orders
// @access  Private (Patient)
const getPatientOrders = async (req, res) => {
  try {
    let patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      patient = await Patient.findById(req.user._id);
    }

    const candidateIds = [req.user._id];
    if (patient) {
      candidateIds.push(patient._id);
      if (patient.userId) candidateIds.push(patient.userId);
    }

    const orders = await Order.find({
      $or: [
        { patientId: { $in: candidateIds } },
        { 'patientId._id': { $in: candidateIds } },
      ],
    })
      .populate('pharmacyId', 'name phone address city')
      .populate('patientId', 'name phone email address city')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Patient orders fetched successfully.', orders);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch patient orders.', error);
  }
};

// @desc    Get pharmacy orders
// @route   GET /api/pharmacy/orders
// @access  Private (Pharmacy)
const getPharmacyOrders = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });
    if (!pharmacy) return sendNotFound(res, 'Pharmacy profile not found.');

    const orders = await Order.find({ pharmacyId: pharmacy._id })
      .populate('patientId', 'name phone email address city')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Pharmacy orders fetched successfully.', orders);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch pharmacy orders.', error);
  }
};

// @desc    Update order status
// @route   PUT /api/pharmacy/orders/:id
// @access  Private (Pharmacy)
const updatePharmacyOrderStatus = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });
    if (!pharmacy) return sendNotFound(res, 'Pharmacy profile not found.');

    const { orderStatus, trackingNumber, paymentStatus } = req.body;
    const order = await Order.findOne({ _id: req.params.id, pharmacyId: pharmacy._id });

    if (!order) {
      return sendNotFound(res, 'Order not found for this pharmacy.');
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();
    return sendSuccess(res, 'Order status updated successfully.', order);
  } catch (error) {
    return sendServerError(res, 'Failed to update order status.', error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private (Patient, Pharmacy, Admin)
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    let order = null;
    const mongoose = require('mongoose');

    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id)
        .populate('pharmacyId', 'name phone address city')
        .populate('patientId', 'name phone email address city');
    }
    if (!order) {
      order = await Order.findOne({ orderId: id })
        .populate('pharmacyId', 'name phone address city')
        .populate('patientId', 'name phone email address city');
    }

    if (!order) {
      return sendNotFound(res, 'Order not found.');
    }

    // Role check if patient
    if (req.user.role === 'Patient') {
      let patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) patient = await Patient.findById(req.user._id);
      const candidateIds = [String(req.user._id)];
      if (patient) {
        candidateIds.push(String(patient._id));
        if (patient.userId) candidateIds.push(String(patient.userId));
      }
      const orderPatId = String(order.patientId?._id || order.patientId);
      if (!candidateIds.includes(orderPatId)) {
        return sendForbidden(res, 'You are not authorized to view this order.');
      }
    }

    return sendSuccess(res, 'Order fetched successfully.', order);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch order.', error);
  }
};

// @desc    Cancel an individual medicine item from an order
// @route   POST /api/orders/:id/cancel-item
// @access  Private (Patient, Admin)
const cancelOrderItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemId, medicineId, reason, refundMethod, refundDetails } = req.body;

    if (!itemId && !medicineId) {
      return sendValidationError(res, 'Validation failed', ['Item ID or Medicine ID is required to cancel a medicine.']);
    }

    let patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) patient = await Patient.findById(req.user._id);

    const candidateIds = [String(req.user._id)];
    if (patient) {
      candidateIds.push(String(patient._id));
      if (patient.userId) candidateIds.push(String(patient.userId));
    }

    let order = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({ orderId: id });
    }

    if (!order) {
      return sendNotFound(res, 'Order not found.');
    }

    // Role & ownership check
    if (req.user.role === 'Patient') {
      const orderPatId = String(order.patientId?._id || order.patientId);
      if (!candidateIds.includes(orderPatId)) {
        return sendForbidden(res, 'You are not authorized to modify this order.');
      }
    }

    // Prevent cancellation if already shipped, delivered, or cancelled
    if (['Shipped', 'Delivered', 'Cancelled'].includes(order.orderStatus)) {
      return sendValidationError(
        res,
        `Cannot cancel medicine. Orders that are ${order.orderStatus.toLowerCase()} cannot be cancelled or refunded under the order policy.`,
        [`Cannot cancel medicine. Orders that are ${order.orderStatus.toLowerCase()} cannot be cancelled or refunded under the order policy.`]
      );
    }

    // Find the item in order.items
    const targetItem = order.items.find(
      (it) =>
        (itemId && (String(it._id) === String(itemId) || String(it.medicineId) === String(itemId))) ||
        (medicineId && (String(it.medicineId) === String(medicineId) || String(it._id) === String(medicineId)))
    );

    if (!targetItem) {
      return sendNotFound(res, 'Medicine item not found in this order.');
    }

    if (['Shipped', 'Delivered'].includes(targetItem.status)) {
      return sendValidationError(
        res,
        `Cannot cancel medicine. This medicine has already been ${targetItem.status.toLowerCase()} and cannot be cancelled or refunded.`,
        [`Cannot cancel medicine. This medicine has already been ${targetItem.status.toLowerCase()} and cannot be cancelled or refunded.`]
      );
    }

    if (targetItem.status === 'Cancelled') {
      return sendValidationError(res, 'This medicine is already cancelled.', ['This medicine is already cancelled.']);
    }

    // 1. Restore stock to inventory safely (ensure never restored twice)
    if (!targetItem.stockRestored) {
      const medId = targetItem.medicineId?._id || targetItem.medicineId;
      await Medicine.findByIdAndUpdate(medId, {
        $inc: { stock: targetItem.quantity },
        $set: { isAvailable: true },
      });
      targetItem.stockRestored = true;
    }

    // 2. Mark item as Cancelled
    targetItem.status = 'Cancelled';
    targetItem.cancelledAt = new Date();
    targetItem.cancelReason = reason || 'Cancelled by patient';

    // 3. Keep original total if not already saved
    if (order.originalTotalAmount == null) {
      order.originalTotalAmount = order.totalAmount;
    }
    const previousTotal = order.totalAmount;

    // 4. Recalculate order amounts based on remaining active items
    const activeItems = order.items.filter((it) => it.status !== 'Cancelled');

    let newSubtotal = 0;
    let newOfferDiscount = 0;
    for (const it of activeItems) {
      newSubtotal += it.unitPrice * it.quantity;
      newOfferDiscount += (it.offerDiscount || 0) * it.quantity;
    }
    newSubtotal = Number(newSubtotal.toFixed(2));
    newOfferDiscount = Number(newOfferDiscount.toFixed(2));
    const newSubtotalAfterOffers = Math.max(0, Number((newSubtotal - newOfferDiscount).toFixed(2)));

    let newCouponDiscount = 0;
    let couponRemoved = false;
    let couponMessage = '';

    if (activeItems.length === 0) {
      // All items are now cancelled! Order becomes Cancelled.
      order.subtotal = 0;
      order.offerDiscount = 0;
      order.couponDiscount = 0;
      order.deliveryFee = 0;
      order.totalAmount = 0;
      order.orderStatus = 'Cancelled';
      order.cancelledAt = new Date();
      order.cancelReason = reason || 'All medicines in the order were cancelled';
    } else {
      // Revalidate coupon against remaining subtotalAfterOffers
      if (order.couponCode) {
        const couponRes = await validateCouponDiscount(order.couponCode, newSubtotalAfterOffers);
        if (couponRes.isValid) {
          newCouponDiscount = couponRes.discount;
        } else {
          newCouponDiscount = 0;
          couponRemoved = true;
          couponMessage = couponRes.message || 'Coupon requirement no longer met';
        }
      }

      // Recalculate delivery fee according to existing policy:
      // Free if subtotalAfterOffers >= 499 or valid freedelivery coupon, else 40
      const DELIVERY_THRESHOLD = 499;
      const DELIVERY_CHARGE = 40;
      let isFreeDelivery = newSubtotalAfterOffers >= DELIVERY_THRESHOLD;
      if (!isFreeDelivery && order.couponCode) {
        const couponRes = await validateCouponDiscount(order.couponCode, newSubtotalAfterOffers);
        if (couponRes.isValid && (couponRes.coupon?.discountType === 'freedelivery' || couponRes.coupon?.code === 'FREEDLVR')) {
          isFreeDelivery = true;
        }
      }
      const newDeliveryFee = (newSubtotalAfterOffers > 0 && !isFreeDelivery) ? DELIVERY_CHARGE : 0;

      const newTotalAmount = Math.max(0, Number((newSubtotalAfterOffers - newCouponDiscount + newDeliveryFee).toFixed(2)));

      order.subtotal = newSubtotal;
      order.offerDiscount = newOfferDiscount;
      order.couponDiscount = newCouponDiscount;
      order.deliveryFee = newDeliveryFee;
      order.totalAmount = newTotalAmount;
      order.orderStatus = 'Partially Cancelled';
    }

    // 5. Handle Refund:
    const isPaid = order.paymentStatus === 'Paid';
    let incrementalRefund = 0;
    let createdRefundRequest = null;
    if (isPaid) {
      incrementalRefund = Math.max(0, Number((previousTotal - order.totalAmount).toFixed(2)));
      if (incrementalRefund > 0) {
        let refundInfo;
        try {
          refundInfo = buildRefundInfo(refundMethod, refundDetails, order);
        } catch (vErr) {
          return sendValidationError(res, vErr.message, [vErr.message]);
        }

        createdRefundRequest = await RefundRequest.create({
          orderId: order._id,
          orderNumber: order.orderId,
          patientId: order.patientId?._id || order.patientId,
          patientName: patient?.name || order.deliveryAddress?.fullName || 'Patient',
          patientEmail: patient?.email || req.user.email || '',
          patientPhone: patient?.phone || order.deliveryAddress?.phone || '',
          cancellationType: 'Item',
          cancelledItems: [
            {
              medicineId: targetItem.medicineId?._id || targetItem.medicineId,
              name: targetItem.name,
              quantity: targetItem.quantity,
              unitPrice: targetItem.unitPrice,
              offerDiscount: targetItem.offerDiscount || 0,
              finalPrice: targetItem.finalPrice,
              itemTotal: targetItem.itemTotal,
              refundAmount: incrementalRefund,
            },
          ],
          cancellationReason: reason || 'Cancelled by patient',
          refundAmount: incrementalRefund,
          refundMethod: refundInfo.selectedMethod,
          refundDetails: refundInfo.refundDetails,
          status: 'Pending',
          statusHistory: [
            {
              status: 'Pending',
              timestamp: new Date(),
              note: `Refund request initiated for cancelled medicine: ${targetItem.name}`,
              changedBy: 'Patient',
            },
          ],
        });

        order.refundAmount = Number(((order.refundAmount || 0) + incrementalRefund).toFixed(2));
        targetItem.refundAmount = incrementalRefund;
        order.refundStatus = 'Pending';
        order.refundMethod = refundInfo.selectedMethod;
        order.refundDetails = refundInfo.refundDetails;
      }
      if (order.totalAmount === 0) {
        order.paymentStatus = 'Refunded';
      }
    } else {
      if (order.totalAmount === 0) {
        order.paymentStatus = 'Refunded';
      }
      order.refundStatus = 'None';
    }

    await order.save();

    await order.populate('pharmacyId', 'name phone address city');
    await order.populate('patientId', 'name phone email address city');

    // Notify Patient
    await createNotification({
      userId: req.user._id,
      recipientRole: 'Patient',
      title: activeItems.length === 0 ? 'Order Cancelled' : 'Medicine Cancelled',
      message: activeItems.length === 0
        ? `Order ${order.orderId} has been cancelled completely.${incrementalRefund > 0 ? ` A refund of ₹${incrementalRefund} has been processed.` : ''}`
        : `${targetItem.name} was cancelled from order ${order.orderId}.${couponRemoved ? ' Applied coupon was removed as minimum order value is no longer met.' : ''}${incrementalRefund > 0 ? ` A refund of ₹${incrementalRefund} has been processed.` : ''}`,
      type: 'Order',
      metadata: { orderId: order._id },
    });

    return sendSuccess(res, `Medicine "${targetItem.name}" cancelled successfully.`, {
      order,
      cancelledItem: targetItem,
      incrementalRefund,
      couponRemoved,
      couponMessage,
    });
  } catch (error) {
    return sendServerError(res, 'Failed to cancel medicine item.', error);
  }
};

// @desc    Cancel entire order
// @route   POST /api/orders/:id/cancel
// @access  Private (Patient, Admin)
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, refundMethod, refundDetails } = req.body;

    let patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) patient = await Patient.findById(req.user._id);

    const candidateIds = [String(req.user._id)];
    if (patient) {
      candidateIds.push(String(patient._id));
      if (patient.userId) candidateIds.push(String(patient.userId));
    }

    let order = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({ orderId: id });
    }

    if (!order) {
      return sendNotFound(res, 'Order not found.');
    }

    // Role check if patient
    if (req.user.role === 'Patient') {
      const orderPatId = String(order.patientId?._id || order.patientId);
      if (!candidateIds.includes(orderPatId)) {
        return sendForbidden(res, 'You are not authorized to cancel this order.');
      }
    }

    // Prevent cancellation if already shipped, delivered, or cancelled
    if (['Shipped', 'Delivered', 'Cancelled'].includes(order.orderStatus)) {
      return sendValidationError(
        res,
        `Cannot cancel order. Orders that are ${order.orderStatus.toLowerCase()} cannot be cancelled or refunded under the order policy.`,
        [`Cannot cancel order. Orders that are ${order.orderStatus.toLowerCase()} cannot be cancelled or refunded under the order policy.`]
      );
    }

    const activeItems = order.items.filter((it) => it.status !== 'Cancelled');
    if (activeItems.length === 0) {
      return sendValidationError(res, 'All medicines in this order have already been cancelled.', [
        'All medicines in this order have already been cancelled.',
      ]);
    }

    // 1. Restore stock for all non-cancelled items that haven't been restored yet
    for (const item of order.items) {
      if (item.status !== 'Cancelled') {
        if (!item.stockRestored) {
          const medId = item.medicineId?._id || item.medicineId;
          await Medicine.findByIdAndUpdate(medId, {
            $inc: { stock: item.quantity },
            $set: { isAvailable: true },
          });
          item.stockRestored = true;
        }
        item.status = 'Cancelled';
        item.cancelledAt = new Date();
        item.cancelReason = reason || 'Order cancelled by patient';
      }
    }

    if (order.originalTotalAmount == null) {
      order.originalTotalAmount = order.totalAmount;
    }
    const previousTotal = order.totalAmount;

    order.subtotal = 0;
    order.offerDiscount = 0;
    order.couponDiscount = 0;
    order.deliveryFee = 0;
    order.totalAmount = 0;
    order.orderStatus = 'Cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = reason || 'Order cancelled by patient';

    // 2. Refund handling:
    const isPaid = order.paymentStatus === 'Paid';
    let incrementalRefund = 0;
    if (isPaid && previousTotal > 0) {
      incrementalRefund = Math.max(0, Number(previousTotal.toFixed(2)));

      let refundInfo;
      try {
        refundInfo = buildRefundInfo(refundMethod, refundDetails, order);
      } catch (vErr) {
        return sendValidationError(res, vErr.message, [vErr.message]);
      }

      await RefundRequest.create({
        orderId: order._id,
        orderNumber: order.orderId,
        patientId: order.patientId?._id || order.patientId,
        patientName: patient?.name || order.deliveryAddress?.fullName || 'Patient',
        patientEmail: patient?.email || req.user.email || '',
        patientPhone: patient?.phone || order.deliveryAddress?.phone || '',
        cancellationType: 'Order',
        cancelledItems: activeItems.map((it) => ({
          medicineId: it.medicineId?._id || it.medicineId,
          name: it.name,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          offerDiscount: it.offerDiscount || 0,
          finalPrice: it.finalPrice,
          itemTotal: it.itemTotal,
          refundAmount: it.itemTotal,
        })),
        cancellationReason: reason || 'Order cancelled by patient',
        refundAmount: incrementalRefund,
        refundMethod: refundInfo.selectedMethod,
        refundDetails: refundInfo.refundDetails,
        status: 'Pending',
        statusHistory: [
          {
            status: 'Pending',
            timestamp: new Date(),
            note: `Refund request initiated for order cancellation`,
            changedBy: 'Patient',
          },
        ],
      });

      order.refundAmount = Number(((order.refundAmount || 0) + incrementalRefund).toFixed(2));
      order.refundStatus = 'Pending';
      order.refundMethod = refundInfo.selectedMethod;
      order.refundDetails = refundInfo.refundDetails;
    } else {
      order.paymentStatus = 'Refunded';
      order.refundStatus = 'None';
    }

    await order.save();

    await order.populate('pharmacyId', 'name phone address city');
    await order.populate('patientId', 'name phone email address city');

    await createNotification({
      userId: req.user._id,
      recipientRole: 'Patient',
      title: 'Order Cancelled',
      message: `Your order ${order.orderId} has been cancelled.${incrementalRefund > 0 ? ` A refund of ₹${incrementalRefund} has been processed.` : ''}`,
      type: 'Order',
      metadata: { orderId: order._id },
    });

    if (order.pharmacyId) {
      const pharmacy = await Pharmacy.findById(order.pharmacyId?._id || order.pharmacyId);
      if (pharmacy) {
        await createNotification({
          userId: pharmacy.userId,
          recipientRole: 'Pharmacy',
          title: 'Order Cancelled by Customer',
          message: `Order ${order.orderId} was cancelled by the customer.`,
          type: 'Order',
          metadata: { orderId: order._id },
        });
      }
    }

    return sendSuccess(res, `Order ${order.orderId} cancelled successfully.`, {
      order,
      refundAmount: incrementalRefund,
    });
  } catch (error) {
    return sendServerError(res, 'Failed to cancel order.', error);
  }
};

// @desc    Reorder an existing order (populates cart with current prices and stock validation)
// @route   POST /api/orders/:id/reorder
// @access  Private (Patient)
const reorderOrder = async (req, res) => {
  try {
    const { id } = req.params;

    let patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) patient = await Patient.findById(req.user._id);
    if (!patient) return sendNotFound(res, 'Patient profile not found.');

    const candidateIds = [String(req.user._id)];
    if (patient) {
      candidateIds.push(String(patient._id));
      if (patient.userId) candidateIds.push(String(patient.userId));
    }

    let order = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({ orderId: id });
    }

    if (!order) {
      return sendNotFound(res, 'Order not found.');
    }

    // Role check if patient
    if (req.user.role === 'Patient') {
      const orderPatId = String(order.patientId?._id || order.patientId);
      if (!candidateIds.includes(orderPatId)) {
        return sendForbidden(res, 'You are not authorized to reorder this order.');
      }
    }

    // Inspect each medicine from the original order
    const outOfStockItems = [];
    const availableItems = [];

    for (const item of order.items) {
      const medId = item.medicineId?._id || item.medicineId;
      const medicine = await Medicine.findById(medId);

      if (!medicine || medicine.isAvailable === false || !medicine.stock || medicine.stock <= 0) {
        outOfStockItems.push({
          name: item.name,
          requestedQty: item.quantity,
          availableStock: 0,
          reason: 'Out of stock',
        });
      } else {
        const canAddQty = Math.min(item.quantity, medicine.stock);
        const { offerDiscount, finalUnitPrice } = await calculateMedicineOffer(medicine._id, medicine.price);
        availableItems.push({
          medicineId: medicine._id,
          name: medicine.name,
          quantity: canAddQty,
          unitPrice: medicine.price,
          offerDiscount,
          finalUnitPrice,
          itemTotal: Number((finalUnitPrice * canAddQty).toFixed(2)),
          adjustedQty: canAddQty < item.quantity,
          requestedQty: item.quantity,
        });
      }
    }

    if (availableItems.length === 0) {
      return sendValidationError(res, 'All medicines from this order are currently out of stock.', [
        'All medicines from this order are currently out of stock. Cannot reorder at this time.',
      ]);
    }

    // Populate patient's cart with available items
    let cart = await Cart.findOne({ patientId: patient._id });
    if (!cart) {
      cart = new Cart({ patientId: patient._id, items: [] });
    }

    // Add or merge available items into cart
    for (const item of availableItems) {
      const existingIdx = cart.items.findIndex(
        (ci) => String(ci.medicineId?._id || ci.medicineId) === String(item.medicineId)
      );
      if (existingIdx > -1) {
        // Update quantity (bounded by current stock)
        const med = await Medicine.findById(item.medicineId);
        const currentStock = med?.stock || 999;
        const totalDesired = cart.items[existingIdx].quantity + item.quantity;
        cart.items[existingIdx].quantity = Math.min(totalDesired, currentStock);
        cart.items[existingIdx].unitPrice = item.unitPrice;
        cart.items[existingIdx].offerDiscount = item.offerDiscount;
        cart.items[existingIdx].finalUnitPrice = item.finalUnitPrice;
        cart.items[existingIdx].itemTotal = Number((item.finalUnitPrice * cart.items[existingIdx].quantity).toFixed(2));
      } else {
        cart.items.push({
          medicineId: item.medicineId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          offerDiscount: item.offerDiscount,
          finalUnitPrice: item.finalUnitPrice,
          itemTotal: item.itemTotal,
        });
      }
    }

    // Link cart to original order for reorder tracking
    cart.reorderedFromOrderId = order._id;
    cart.reorderedFromOrderNumber = order.orderId;

    // Recalculate cart totals
    let subtotal = 0;
    let totalOfferDiscount = 0;
    for (const ci of cart.items) {
      const med = await Medicine.findById(ci.medicineId);
      if (med) {
        const { offerDiscount, finalUnitPrice } = await calculateMedicineOffer(med._id, med.price);
        ci.unitPrice = med.price;
        ci.offerDiscount = offerDiscount;
        ci.finalUnitPrice = finalUnitPrice;
        ci.itemTotal = Number((finalUnitPrice * ci.quantity).toFixed(2));
        subtotal += med.price * ci.quantity;
        totalOfferDiscount += offerDiscount * ci.quantity;
      }
    }

    const subtotalAfterOffers = Math.max(0, subtotal - totalOfferDiscount);
    let couponDiscount = 0;
    if (cart.couponCode) {
      const couponRes = await validateCouponDiscount(cart.couponCode, subtotalAfterOffers);
      if (couponRes.isValid) {
        couponDiscount = couponRes.discount;
      } else {
        cart.couponCode = '';
        cart.couponDiscount = 0;
      }
    }

    cart.subtotal = Number(subtotal.toFixed(2));
    cart.totalOfferDiscount = Number(totalOfferDiscount.toFixed(2));
    cart.couponDiscount = Number(couponDiscount.toFixed(2));
    cart.totalAmount = Number(Math.max(0, subtotalAfterOffers - couponDiscount).toFixed(2));

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.medicineId');

    return sendSuccess(res, 'Items added to your cart for reorder.', {
      cart: populatedCart,
      reorderedFromOrderId: order._id,
      reorderedFromOrderNumber: order.orderId,
      availableCount: availableItems.length,
      outOfStockItems,
    });
  } catch (error) {
    return sendServerError(res, 'Failed to process reorder.', error);
  }
};

module.exports = {
  createOrder,
  getPatientOrders,
  getPharmacyOrders,
  updatePharmacyOrderStatus,
  getOrderById,
  cancelOrderItem,
  cancelOrder,
  reorderOrder,
};


