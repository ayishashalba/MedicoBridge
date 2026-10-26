const mongoose = require('mongoose');
const RefundRequest = require('../models/RefundRequest');
const Order = require('../models/Order');
const Patient = require('../models/Patient');
const Payment = require('../models/Payment');
const { createNotification } = require('../services/notificationService');
const {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendForbidden,
  sendServerError,
} = require('../utils/responseHandler');

// @desc    Get all refund requests (Admin)
// @route   GET /api/refunds/admin
// @access  Private (Admin)
const getAdminRefunds = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim()) {
      const cleanSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(cleanSearch, 'i');
      query.$or = [
        { orderNumber: regex },
        { refundId: regex },
        { patientName: regex },
        { patientEmail: regex },
        { patientPhone: regex },
        { 'refundDetails.upiId': regex },
        { 'refundDetails.accountHolderName': regex },
        { 'refundDetails.accountNumberMasked': regex },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [refunds, total, statsAgg] = await Promise.all([
      RefundRequest.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('orderId', 'orderId totalAmount orderStatus paymentMethod paymentStatus createdAt')
        .populate('processedBy', 'name email'),
      RefundRequest.countDocuments(query),
      RefundRequest.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$refundAmount' },
          },
        },
      ]),
    ]);

    // Format statistics accurately per category
    const stats = {
      totalRequests: 0,
      pendingCount: 0,
      pendingAmount: 0,
      approvedCount: 0,
      approvedAmount: 0,
      processingCount: 0,
      processingAmount: 0,
      refundedCount: 0,
      totalRefundedAmount: 0,
      rejectedCount: 0,
      rejectedAmount: 0,
      failedCount: 0,
      failedAmount: 0,
    };

    statsAgg.forEach((s) => {
      stats.totalRequests += s.count;
      if (s._id === 'Pending') {
        stats.pendingCount = s.count;
        stats.pendingAmount = Number((s.totalAmount || 0).toFixed(2));
      } else if (s._id === 'Approved') {
        stats.approvedCount = s.count;
        stats.approvedAmount = Number((s.totalAmount || 0).toFixed(2));
      } else if (s._id === 'Processing') {
        stats.processingCount = s.count;
        stats.processingAmount = Number((s.totalAmount || 0).toFixed(2));
      } else if (s._id === 'Refunded') {
        stats.refundedCount = s.count;
        stats.totalRefundedAmount = Number((s.totalAmount || 0).toFixed(2));
      } else if (s._id === 'Rejected') {
        stats.rejectedCount = s.count;
        stats.rejectedAmount = Number((s.totalAmount || 0).toFixed(2));
      } else if (s._id === 'Failed') {
        stats.failedCount = s.count;
        stats.failedAmount = Number((s.totalAmount || 0).toFixed(2));
      }
    });

    stats.totalRefundedAmount = Number(stats.totalRefundedAmount.toFixed(2));
    stats.pendingAmount = Number(stats.pendingAmount.toFixed(2));
    stats.approvedAmount = Number(stats.approvedAmount.toFixed(2));

    return sendSuccess(res, 'Refund requests retrieved successfully.', {
      refunds,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      stats,
    });
  } catch (error) {
    return sendServerError(res, 'Failed to fetch refund requests.', error);
  }
};

// @desc    Get refund request by ID
// @route   GET /api/refunds/:id
// @access  Private (Admin, Patient owner)
const getRefundById = async (req, res) => {
  try {
    const { id } = req.params;
    let refund = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      refund = await RefundRequest.findById(id)
        .populate('orderId')
        .populate('processedBy', 'name email');
    }
    if (!refund) {
      refund = await RefundRequest.findOne({ refundId: id })
        .populate('orderId')
        .populate('processedBy', 'name email');
    }

    if (!refund) {
      return sendNotFound(res, 'Refund request not found.');
    }

    // Authorization check for patients
    if (req.user.role === 'Patient') {
      let patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) patient = await Patient.findById(req.user._id);

      const candidateIds = [String(req.user._id)];
      if (patient) {
        candidateIds.push(String(patient._id));
        if (patient.userId) candidateIds.push(String(patient.userId));
      }

      const refundPatientId = String(refund.patientId?._id || refund.patientId);
      if (!candidateIds.includes(refundPatientId)) {
        return sendForbidden(res, 'You are not authorized to view this refund request.');
      }
    }

    return sendSuccess(res, 'Refund request details retrieved.', { refund });
  } catch (error) {
    return sendServerError(res, 'Failed to get refund request.', error);
  }
};

// @desc    Get patient's own refund requests
// @route   GET /api/refunds/patient/my-refunds
// @access  Private (Patient)
const getPatientRefunds = async (req, res) => {
  try {
    let patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) patient = await Patient.findById(req.user._id);

    if (!patient) {
      return sendNotFound(res, 'Patient profile not found.');
    }

    const refunds = await RefundRequest.find({ patientId: patient._id })
      .sort({ createdAt: -1 })
      .populate('orderId', 'orderId orderStatus totalAmount createdAt items');

    return sendSuccess(res, 'Patient refunds retrieved.', { refunds });
  } catch (error) {
    return sendServerError(res, 'Failed to get patient refunds.', error);
  }
};

// @desc    Get refund details by order ID
// @route   GET /api/refunds/order/:orderId
// @access  Private (Patient owner, Admin)
const getRefundByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    let order = null;

    if (mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findById(orderId);
    }
    if (!order) {
      order = await Order.findOne({ orderId });
    }

    if (!order) {
      return sendNotFound(res, 'Order not found.');
    }

    if (req.user.role === 'Patient') {
      let patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) patient = await Patient.findById(req.user._id);

      const candidateIds = [String(req.user._id)];
      if (patient) {
        candidateIds.push(String(patient._id));
        if (patient.userId) candidateIds.push(String(patient.userId));
      }

      if (!candidateIds.includes(String(order.patientId))) {
        return sendForbidden(res, 'You are not authorized to view refunds for this order.');
      }
    }

    const refunds = await RefundRequest.find({ orderId: order._id }).sort({ createdAt: -1 });

    return sendSuccess(res, 'Order refund requests retrieved.', {
      refunds,
      latestRefund: refunds[0] || null,
    });
  } catch (error) {
    return sendServerError(res, 'Failed to get order refunds.', error);
  }
};

// @desc    Approve refund request
// @route   PUT /api/refunds/admin/:id/approve
// @access  Private (Admin)
const approveRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const refund = await RefundRequest.findById(id);
    if (!refund) {
      return sendNotFound(res, 'Refund request not found.');
    }

    if (refund.status === 'Refunded') {
      return sendValidationError(res, 'This refund request has already been processed and completed.', [
        'Refund already completed.',
      ]);
    }

    if (refund.status === 'Approved') {
      return sendValidationError(res, 'This refund request is already approved.', [
        'Refund request is already approved.',
      ]);
    }

    refund.status = 'Approved';
    if (adminNotes) refund.adminNotes = adminNotes;
    refund.statusHistory.push({
      status: 'Approved',
      timestamp: new Date(),
      note: adminNotes || 'Refund approved by administrator',
      changedBy: req.user.name || 'Admin',
    });

    await refund.save();

    // Update parent order
    await Order.findByIdAndUpdate(refund.orderId, {
      refundStatus: 'Approved',
    });

    // Notify patient
    const patient = await Patient.findById(refund.patientId);
    if (patient && patient.userId) {
      await createNotification({
        userId: patient.userId,
        recipientRole: 'Patient',
        title: 'Refund Request Approved',
        message: `Your refund request of ₹${refund.refundAmount} for order ${refund.orderNumber} has been approved by the administrator. Transfer is queued for processing.`,
        type: 'Order',
        metadata: { orderId: refund.orderId, refundId: refund._id },
      });
    }

    return sendSuccess(res, `Refund request ${refund.refundId} approved successfully.`, { refund });
  } catch (error) {
    return sendServerError(res, 'Failed to approve refund request.', error);
  }
};

// @desc    Reject refund request
// @route   PUT /api/refunds/admin/:id/reject
// @access  Private (Admin)
const rejectRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, adminNotes } = req.body;

    if (!reason || !reason.trim()) {
      return sendValidationError(res, 'Rejection reason is required.', [
        'Please provide a valid reason for rejecting this refund request.',
      ]);
    }

    const refund = await RefundRequest.findById(id);
    if (!refund) {
      return sendNotFound(res, 'Refund request not found.');
    }

    if (refund.status === 'Refunded') {
      return sendValidationError(res, 'Cannot reject a refund that has already been completed.', [
        'Refund has already been completed.',
      ]);
    }

    refund.status = 'Rejected';
    refund.rejectionReason = reason.trim();
    if (adminNotes) refund.adminNotes = adminNotes;
    refund.statusHistory.push({
      status: 'Rejected',
      timestamp: new Date(),
      note: `Rejected: ${reason.trim()}`,
      changedBy: req.user.name || 'Admin',
    });

    await refund.save();

    // Update parent order
    await Order.findByIdAndUpdate(refund.orderId, {
      refundStatus: 'Rejected',
      refundRejectionReason: reason.trim(),
    });

    // Notify patient
    const patient = await Patient.findById(refund.patientId);
    if (patient && patient.userId) {
      await createNotification({
        userId: patient.userId,
        recipientRole: 'Patient',
        title: 'Refund Request Rejected',
        message: `Your refund request of ₹${refund.refundAmount} for order ${refund.orderNumber} was rejected. Reason: ${reason.trim()}`,
        type: 'Order',
        metadata: { orderId: refund.orderId, refundId: refund._id },
      });
    }

    return sendSuccess(res, `Refund request ${refund.refundId} rejected.`, { refund });
  } catch (error) {
    return sendServerError(res, 'Failed to reject refund request.', error);
  }
};

// @desc    Process refund transfer (Demo / Simulated Gateway Integration)
// @route   POST /api/refunds/admin/:id/process
// @access  Private (Admin)
const processRefundTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const { simulateFailure, failureReasonText } = req.body;

    const refund = await RefundRequest.findById(id);
    if (!refund) {
      return sendNotFound(res, 'Refund request not found.');
    }

    // Prevent duplicate payouts
    if (refund.status === 'Refunded') {
      return sendValidationError(res, 'This refund has already been completed. Duplicate transfers are prevented.', [
        'Refund has already been successfully transferred.',
      ]);
    }

    if (refund.status === 'Rejected') {
      return sendValidationError(res, 'Cannot process a rejected refund. Approve the request first.', [
        'Cannot process a rejected refund request.',
      ]);
    }

    // Mark as Processing
    refund.status = 'Processing';
    refund.statusHistory.push({
      status: 'Processing',
      timestamp: new Date(),
      note: 'Processing payout via simulated payment gateway',
      changedBy: req.user.name || 'Admin',
    });
    await refund.save();

    // ─────────────────────────────────────────────────────────────
    // SIMULATED GATEWAY TRANSFER EXECUTION
    // ─────────────────────────────────────────────────────────────
    if (simulateFailure) {
      // Simulate failure scenario for testing
      refund.status = 'Failed';
      refund.failureReason = failureReasonText || 'Bank network timeout / IFSC routing unreachable during simulated transfer';
      refund.statusHistory.push({
        status: 'Failed',
        timestamp: new Date(),
        note: `Transfer failed: ${refund.failureReason}`,
        changedBy: 'Gateway Simulation',
      });
      await refund.save();

      await Order.findByIdAndUpdate(refund.orderId, {
        refundStatus: 'Failed',
        refundFailureReason: refund.failureReason,
      });

      return sendValidationError(res, `Simulated transfer failed: ${refund.failureReason}`, [
        `Simulated transfer failed: ${refund.failureReason}`,
      ]);
    }

    // Success path:
    const txRef = `SIM-UTR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    refund.status = 'Refunded';
    refund.transactionReference = txRef;
    refund.processedAt = new Date();
    refund.processedBy = req.user._id;
    refund.failureReason = '';
    refund.statusHistory.push({
      status: 'Refunded',
      timestamp: new Date(),
      note: `Simulated payout of ₹${refund.refundAmount} completed to ${refund.refundMethod} (Ref: ${txRef})`,
      changedBy: req.user.name || 'Admin',
    });

    await refund.save();

    // Create confirmed Payment record for accounting
    await Payment.create({
      orderId: refund.orderId,
      patientId: refund.patientId,
      patientName: refund.patientName,
      paymentMethod: refund.refundMethod,
      amount: -refund.refundAmount,
      reference: txRef,
      note: `Simulated refund via ${refund.refundMethod} for order ${refund.orderNumber}`,
      paymentStatus: 'Refunded',
      gatewayResponse: {
        mode: 'Demo / Simulated Gateway Transfer',
        destination:
          refund.refundMethod === 'UPI'
            ? refund.refundDetails?.upiId
            : refund.refundMethod === 'Bank Account'
            ? `${refund.refundDetails?.bankName || 'Bank'} (${refund.refundDetails?.accountNumberMasked})`
            : 'UPI QR Account',
        transactionReference: txRef,
        completedAt: new Date(),
      },
    });

    // Update parent Order
    const order = await Order.findById(refund.orderId);
    if (order) {
      order.refundAmount = Number(((order.refundAmount || 0) + refund.refundAmount).toFixed(2));
      order.refundStatus = order.totalAmount === 0 ? 'Refunded' : 'Partially Refunded';
      if (order.totalAmount === 0) {
        order.paymentStatus = 'Refunded';
      }
      await order.save();
    }

    // Notify Patient
    const patient = await Patient.findById(refund.patientId);
    if (patient && patient.userId) {
      const destText =
        refund.refundMethod === 'UPI'
          ? `UPI ID (${refund.refundDetails?.upiId})`
          : refund.refundMethod === 'Bank Account'
          ? `Bank Account (${refund.refundDetails?.accountNumberMasked})`
          : `UPI QR account`;

      await createNotification({
        userId: patient.userId,
        recipientRole: 'Patient',
        title: 'Refund Successfully Transferred',
        message: `A refund of ₹${refund.refundAmount} for order ${refund.orderNumber} has been successfully transferred to your ${destText}. Transaction reference: ${txRef} (Simulated).`,
        type: 'Order',
        metadata: { orderId: refund.orderId, refundId: refund._id, reference: txRef },
      });
    }

    return sendSuccess(res, `Simulated transfer of ₹${refund.refundAmount} completed successfully.`, {
      refund,
      transactionReference: txRef,
      gatewayMode: 'Demo / Simulated Gateway Transfer',
    });
  } catch (error) {
    return sendServerError(res, 'Failed to process refund transfer.', error);
  }
};

// @desc    Retry failed refund transfer
// @route   POST /api/refunds/admin/:id/retry
// @access  Private (Admin)
const retryRefundTransfer = async (req, res) => {
  try {
    const { id } = req.params;

    const refund = await RefundRequest.findById(id);
    if (!refund) {
      return sendNotFound(res, 'Refund request not found.');
    }

    if (refund.status === 'Refunded') {
      return sendValidationError(res, 'This refund has already been completed.', [
        'Refund has already been completed.',
      ]);
    }

    if (refund.status !== 'Failed' && refund.status !== 'Approved' && refund.status !== 'Processing') {
      return sendValidationError(res, `Cannot retry a refund with status ${refund.status}.`, [
        `Cannot retry refund with status ${refund.status}.`,
      ]);
    }

    // Re-run the transfer execution safely
    req.body.simulateFailure = false;
    return processRefundTransfer(req, res);
  } catch (error) {
    return sendServerError(res, 'Failed to retry refund transfer.', error);
  }
};

// @desc    Upload QR code image for refund
// @route   POST /api/refunds/upload-qr
// @access  Private (Patient)
const uploadRefundQR = async (req, res) => {
  try {
    if (!req.file) {
      return sendValidationError(res, 'Please upload a valid QR code image file.', [
        'No file was uploaded.',
      ]);
    }

    const relativePath = `/uploads/refunds/${req.file.filename}`;
    return sendSuccess(res, 'QR code uploaded successfully.', {
      qrCodeImage: relativePath,
      filename: req.file.filename,
    });
  } catch (error) {
    return sendServerError(res, 'Failed to upload QR code image.', error);
  }
};

module.exports = {
  getAdminRefunds,
  getRefundById,
  getPatientRefunds,
  getRefundByOrderId,
  approveRefund,
  rejectRefund,
  processRefundTransfer,
  retryRefundTransfer,
  uploadRefundQR,
};
