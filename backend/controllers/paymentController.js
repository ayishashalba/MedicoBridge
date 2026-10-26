const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendServerError,
} = require('../utils/responseHandler');

/**
 * Lazily-initialise Razorpay once so missing env vars only throw at call-time,
 * not at module load (which would crash the server during dev with no keys yet).
 */
function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      'Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env'
    );
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

// @desc    Create a Razorpay order (server-side)
// @route   POST /api/payment/razorpay/create-order
// @access  Private (Patient)
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || Number(amount) <= 0) {
      return sendValidationError(res, 'Validation failed', ['A valid positive amount is required.']);
    }

    const razorpay = getRazorpayInstance();

    // Razorpay expects amount in paise (smallest currency unit)
    const amountPaise = Math.round(Number(amount) * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    });

    return sendSuccess(res, 'Razorpay order created successfully.', {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    if (error.message?.includes('credentials not configured')) {
      return sendValidationError(res, error.message, [error.message]);
    }
    return sendServerError(res, 'Failed to create Razorpay order.', error);
  }
};

// @desc    Verify Razorpay payment signature and update order payment status
// @route   POST /api/payment/razorpay/verify
// @access  Private (Patient)
const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId, // Our internal MongoDB order _id
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return sendValidationError(res, 'Validation failed', [
        'razorpay_order_id, razorpay_payment_id, and razorpay_signature are all required.',
      ]);
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return sendValidationError(res, 'Razorpay credentials not configured.', [
        'Set RAZORPAY_KEY_SECRET in .env',
      ]);
    }

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return sendValidationError(res, 'Payment verification failed. Invalid signature.', [
        'Invalid payment signature. Please contact support.',
      ]);
    }

    // Mark the MedicoBridge order as Paid if an orderId was provided
    let updatedOrder = null;
    if (orderId) {
      updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: 'Paid',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
        },
        { new: true }
      );

      if (updatedOrder) {
        // Record a Payment entry for audit trail
        await Payment.create({
          orderId: updatedOrder._id,
          patientId: updatedOrder.patientId,
          amount: updatedOrder.totalAmount,
          paymentMethod: 'Razorpay',
          status: 'Completed',
          transactionId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          gatewayResponse: {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
          },
        });
      }
    }

    return sendSuccess(res, 'Payment verified and recorded successfully.', {
      verified: true,
      razorpayPaymentId: razorpay_payment_id,
      order: updatedOrder,
    });
  } catch (error) {
    return sendServerError(res, 'Failed to verify Razorpay payment.', error);
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};
