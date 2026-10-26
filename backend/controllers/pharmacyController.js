const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Order = require('../models/Order');
const Prescription = require('../models/Prescription');
const { createNotification } = require('../services/notificationService');
const {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendForbidden,
  sendServerError,
} = require('../utils/responseHandler');

// @desc    Get pharmacy profile
// @route   GET /api/pharmacy/profile
// @access  Private (Pharmacy)
const getProfile = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });
    if (!pharmacy) {
      return sendNotFound(res, 'Pharmacy profile not found.');
    }
    return sendSuccess(res, 'Pharmacy profile fetched successfully.', pharmacy);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch pharmacy profile.', error);
  }
};

// @desc    Update pharmacy profile
// @route   PUT /api/pharmacy/profile
// @access  Private (Pharmacy)
const updateProfile = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });
    if (!pharmacy) {
      return sendNotFound(res, 'Pharmacy profile not found.');
    }

    const { name, phone, licenseNumber, address, city, state } = req.body;

    if (name) pharmacy.name = name.trim();
    if (phone !== undefined) pharmacy.phone = phone.trim();
    if (licenseNumber !== undefined) pharmacy.licenseNumber = licenseNumber.trim();
    if (address !== undefined) pharmacy.address = address.trim();
    if (city !== undefined) pharmacy.city = city.trim();
    if (state !== undefined) pharmacy.state = state.trim();

    await pharmacy.save();

    return sendSuccess(res, 'Pharmacy profile updated successfully.', pharmacy);
  } catch (error) {
    return sendServerError(res, 'Failed to update pharmacy profile.', error);
  }
};

// @desc    Get retail pharmacy dashboard
// @route   GET /api/pharmacy/dashboard
// @access  Private (Pharmacy)
const getDashboard = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });
    if (!pharmacy) {
      return sendNotFound(res, 'Pharmacy profile not found.');
    }

    const totalMedicines = await Medicine.countDocuments({ pharmacyId: pharmacy._id });
    const lowStockMedicines = await Medicine.countDocuments({
      pharmacyId: pharmacy._id,
      stock: { $gt: 0, $lte: 10 },
    });
    const outOfStockMedicines = await Medicine.countDocuments({
      pharmacyId: pharmacy._id,
      stock: 0,
    });

    const totalOrders = await Order.countDocuments({ pharmacyId: pharmacy._id });
    const pendingOrders = await Order.countDocuments({ pharmacyId: pharmacy._id, orderStatus: 'Pending' });
    const deliveredOrders = await Order.countDocuments({ pharmacyId: pharmacy._id, orderStatus: 'Delivered' });

    const totalRevenueResult = await Order.aggregate([
      { $match: { pharmacyId: pharmacy._id, orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    const recentOrders = await Order.find({ pharmacyId: pharmacy._id })
      .populate('patientId', 'name phone email')
      .sort({ createdAt: -1 })
      .limit(6);

    return sendSuccess(res, 'Pharmacy dashboard fetched successfully.', {
      metrics: {
        totalMedicines,
        lowStockMedicines,
        outOfStockMedicines,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalRevenue,
        rating: pharmacy.rating || 4.6,
      },
      pharmacy,
      recentOrders,
    });
  } catch (error) {
    return sendServerError(res, 'Failed to fetch pharmacy dashboard.', error);
  }
};

// @desc    Get retail pharmacy medicines
// @route   GET /api/pharmacy/medicines
// @access  Private (Pharmacy)
const getMedicines = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });
    if (!pharmacy) {
      return sendNotFound(res, 'Pharmacy profile not found.');
    }

    const { search, category, stockStatus } = req.query;
    const query = { pharmacyId: pharmacy._id };

    if (category && category !== 'All') query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
      ];
    }
    if (stockStatus === 'Low Stock') {
      query.stock = { $gt: 0, $lte: 10 };
    } else if (stockStatus === 'Out of Stock') {
      query.stock = 0;
    }

    const medicines = await Medicine.find(query).sort({ name: 1 });
    return sendSuccess(res, 'Pharmacy medicines fetched successfully.', medicines);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch pharmacy medicines.', error);
  }
};

// @desc    Add medicine to retail pharmacy inventory
// @route   POST /api/pharmacy/medicines
// @access  Private (Pharmacy)
const addMedicine = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });
    if (!pharmacy) {
      return sendNotFound(res, 'Pharmacy profile not found.');
    }

    const {
      name,
      genericName,
      category,
      manufacturer,
      description,
      dosageForm,
      requiresPrescription,
      price,
      stock,
      expiryDate,
      image,
    } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return sendValidationError(res, 'Validation failed', [
        'Medicine name, price, and stock are required.',
      ]);
    }

    const medicine = await Medicine.create({
      pharmacyId: pharmacy._id,
      name: name.trim(),
      genericName: genericName || '',
      category: category || 'General',
      manufacturer: manufacturer || '',
      description: description || '',
      dosageForm: dosageForm || 'Tablet',
      requiresPrescription: Boolean(requiresPrescription),
      price: Number(price),
      stock: Number(stock),
      expiryDate: expiryDate || null,
      image: image || '',
      isHospital: false,
      isAvailable: Number(stock) > 0,
    });

    return sendSuccess(res, 'Medicine added to pharmacy inventory successfully.', medicine, 201);
  } catch (error) {
    return sendServerError(res, 'Failed to add medicine.', error);
  }
};

// @desc    Update retail pharmacy medicine
// @route   PUT /api/pharmacy/medicines/:id
// @access  Private (Pharmacy)
const updateMedicine = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });
    if (!pharmacy) {
      return sendNotFound(res, 'Pharmacy profile not found.');
    }

    const medicine = await Medicine.findOne({ _id: req.params.id, pharmacyId: pharmacy._id });
    if (!medicine) {
      return sendNotFound(res, 'Medicine not found in your inventory.');
    }

    const { name, genericName, category, manufacturer, description, dosageForm, requiresPrescription, price, stock, expiryDate, image, isAvailable } = req.body;

    if (name) medicine.name = name.trim();
    if (genericName !== undefined) medicine.genericName = genericName;
    if (category !== undefined) medicine.category = category;
    if (manufacturer !== undefined) medicine.manufacturer = manufacturer;
    if (description !== undefined) medicine.description = description;
    if (dosageForm !== undefined) medicine.dosageForm = dosageForm;
    if (requiresPrescription !== undefined) medicine.requiresPrescription = Boolean(requiresPrescription);
    if (price !== undefined) medicine.price = Number(price);
    if (stock !== undefined) {
      medicine.stock = Number(stock);
      medicine.isAvailable = Number(stock) > 0;
    }
    if (expiryDate !== undefined) medicine.expiryDate = expiryDate;
    if (image !== undefined) medicine.image = image;
    if (isAvailable !== undefined) medicine.isAvailable = Boolean(isAvailable);

    await medicine.save();
    return sendSuccess(res, 'Medicine updated successfully.', medicine);
  } catch (error) {
    return sendServerError(res, 'Failed to update medicine.', error);
  }
};

// @desc    Delete retail pharmacy medicine
// @route   DELETE /api/pharmacy/medicines/:id
// @access  Private (Pharmacy)
const deleteMedicine = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });
    if (!pharmacy) {
      return sendNotFound(res, 'Pharmacy profile not found.');
    }

    const medicine = await Medicine.findOneAndDelete({ _id: req.params.id, pharmacyId: pharmacy._id });
    if (!medicine) {
      return sendNotFound(res, 'Medicine not found in your inventory.');
    }

    return sendSuccess(res, 'Medicine removed from inventory successfully.');
  } catch (error) {
    return sendServerError(res, 'Failed to delete medicine.', error);
  }
};

// @desc    Get retail pharmacy customer orders
// @route   GET /api/pharmacy/orders
// @access  Private (Pharmacy)
const getOrders = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });
    if (!pharmacy) {
      return sendNotFound(res, 'Pharmacy profile not found.');
    }

    const { status, search } = req.query;
    const query = { pharmacyId: pharmacy._id };

    if (status && status !== 'All') {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate('patientId', 'name phone email address city')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Pharmacy orders fetched successfully.', orders);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch pharmacy orders.', error);
  }
};

// @desc    Get pharmacy billing/invoices from orders
// @route   GET /api/pharmacy/invoices
// @access  Private (Pharmacy)
const getInvoices = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });

    if (!pharmacy) {
      return sendNotFound(res, 'Pharmacy profile not found.');
    }

    const { paymentStatus, search } = req.query;

    const query = {
      pharmacyId: pharmacy._id,
    };

    if (paymentStatus && paymentStatus !== 'All') {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'deliveryAddress.fullName': { $regex: search, $options: 'i' } },
      ];
    }

    const orders = await Order.find(query)
      .populate('patientId', 'name phone email')
      .sort({ createdAt: -1 });

    const invoices = orders.map((order) => ({
      id: order._id,
      invoiceId: order.orderId
        ? `INV-${order.orderId.replace(/^ORD-/, '')}`
        : `INV-${order._id.toString().slice(-6).toUpperCase()}`,

      patient: order.patientId?.name || order.deliveryAddress?.fullName || 'Unknown Patient',

      phone:
        order.patientId?.phone ||
        order.deliveryAddress?.phone ||
        '',

      order: order.orderId || order._id,

      date: order.createdAt,

      subtotal: Number(order.subtotal || 0),

      tax: 0,

      discount: Number(
        (Number(order.offerDiscount || 0) +
          Number(order.couponDiscount || 0)).toFixed(2)
      ),

      total: Number(order.totalAmount || 0),

      method: order.paymentMethod || 'COD',

      status: order.paymentStatus || 'Pending',

      items: order.items || [],
    }));

    return sendSuccess(
      res,
      'Pharmacy invoices fetched successfully.',
      invoices
    );
  } catch (error) {
    return sendServerError(
      res,
      'Failed to fetch pharmacy invoices.',
      error
    );
  }
};


// @desc    Update pharmacy invoice/payment status
// @route   PUT /api/pharmacy/invoices/:id
// @access  Private (Pharmacy)
const updateInvoicePaymentStatus = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });

    if (!pharmacy) {
      return sendNotFound(res, 'Pharmacy profile not found.');
    }

    const order = await Order.findOne({
      _id: req.params.id,
      pharmacyId: pharmacy._id,
    });

    if (!order) {
      return sendNotFound(res, 'Invoice/order not found for this pharmacy.');
    }

    const { paymentStatus, paymentMethod } = req.body;

    const allowedStatuses = [
      'Pending',
      'Paid',
      'Failed',
      'Refunded',
    ];

    if (
      paymentStatus &&
      !allowedStatuses.includes(paymentStatus)
    ) {
      return sendValidationError(res, 'Validation failed', [
        `Payment status must be one of: ${allowedStatuses.join(', ')}`,
      ]);
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (paymentMethod !== undefined) {
      order.paymentMethod = paymentMethod;
    }

    await order.save();

    return sendSuccess(
      res,
      `Invoice payment status updated to ${order.paymentStatus}.`,
      order
    );
  } catch (error) {
    return sendServerError(
      res,
      'Failed to update invoice payment status.',
      error
    );
  }
};
// @desc    Update order status
// @route   PUT /api/pharmacy/orders/:id
// @access  Private (Pharmacy)
const updateOrderStatus = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });
    if (!pharmacy) {
      return sendNotFound(res, 'Pharmacy profile not found.');
    }

    const { orderStatus, trackingNumber, paymentStatus } = req.body;
    const order = await Order.findOne({ _id: req.params.id, pharmacyId: pharmacy._id })
      .populate('patientId', 'name phone email userId');

    if (!order) {
      return sendNotFound(res, 'Order not found for this pharmacy.');
    }

    // ── Validate requested status ───────────────────────────────────────────
    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Partially Cancelled'];
    if (orderStatus && !validStatuses.includes(orderStatus)) {
      return sendValidationError(res, 'Validation failed', [
        `Order status must be one of: ${validStatuses.join(', ')}`,
      ]);
    }

    // ── Enforce forward-only transitions (pharmacy cannot move backwards) ───
    // Cancellation is only allowed from early statuses
    if (orderStatus) {
      const statusOrder = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
      const currentIdx = statusOrder.indexOf(order.orderStatus);
      const requestedIdx = statusOrder.indexOf(orderStatus);

      const isCancelRequest = (orderStatus === 'Cancelled' || orderStatus === 'Partially Cancelled');

      if (!isCancelRequest && requestedIdx !== -1 && currentIdx !== -1) {
        if (requestedIdx < currentIdx) {
          return sendValidationError(res, 'Invalid status transition', [
            `Cannot move order back from "${order.orderStatus}" to "${orderStatus}". Status can only move forward.`,
          ]);
        }
        if (requestedIdx > currentIdx + 1 && orderStatus !== 'Delivered') {
          return sendValidationError(res, 'Invalid status transition', [
            `Cannot skip from "${order.orderStatus}" to "${orderStatus}". Please advance one step at a time.`,
          ]);
        }
      }

      // Prevent cancelling an already shipped/delivered order
      if (isCancelRequest && (order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered')) {
        return sendValidationError(res, 'Cannot cancel shipped/delivered order', [
          `Order is already "${order.orderStatus}" and cannot be cancelled by the pharmacy.`,
        ]);
      }

      order.orderStatus = orderStatus;

      // ── Auto-generate tracking number when dispatched (Shipped) ────────
      if (orderStatus === 'Shipped' && !order.trackingNumber) {
        const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const randomPart = Math.floor(10000 + Math.random() * 90000);
        order.trackingNumber = `TRK${datePart}${randomPart}`;
      }

      // ── Mark COD order as Paid on Delivered ────────────────────────────
      if (orderStatus === 'Delivered' && order.paymentMethod === 'COD' && order.paymentStatus === 'Pending') {
        order.paymentStatus = 'Paid';
      }
    }

    // Allow manual tracking number override
    if (trackingNumber !== undefined && trackingNumber.trim()) {
      order.trackingNumber = trackingNumber.trim();
    }

    // Allow manual payment status update
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    // ── Notify patient ──────────────────────────────────────────────────────
    if (order.patientId) {
      const patient = order.patientId;
      const statusMessages = {
        Confirmed: 'Your order has been confirmed by the pharmacy and is being prepared.',
        Processing: 'Your medicines are being packed and prepared for dispatch.',
        Shipped: `Your order has been dispatched! Tracking Number: ${order.trackingNumber || 'N/A'}. Estimated delivery: 1–2 days.`,
        Delivered: 'Your order has been delivered successfully. Enjoy your medicines!',
        Cancelled: 'Your order has been cancelled by the pharmacy.',
      };

      const notifMsg = statusMessages[order.orderStatus] ||
        `Your medicine order status has been updated to: ${order.orderStatus}.`;

      const patientUserId = patient.userId || patient._id;
      await createNotification({
        userId: patientUserId,
        recipientRole: 'Patient',
        title: `Order ${order.orderId} — ${order.orderStatus}`,
        message: notifMsg,
        type: 'Order',
        metadata: { orderId: order._id, orderStatus: order.orderStatus, trackingNumber: order.trackingNumber },
      });
    }

    // Re-fetch with populated patient for a complete response
    const updatedOrder = await Order.findById(order._id)
      .populate('patientId', 'name phone email')
      .populate('pharmacyId', 'name phone address city');

    return sendSuccess(res, `Order updated to ${order.orderStatus}.`, updatedOrder);
  } catch (error) {
    return sendServerError(res, 'Failed to update order status.', error);
  }
};


// @desc    Get retail pharmacy prescriptions
// @route   GET /api/pharmacy/prescriptions
// @access  Private (Pharmacy)
const getPrescriptions = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });
    if (!pharmacy) {
      return sendNotFound(res, 'Pharmacy profile not found.');
    }

    const prescriptions = await Prescription.find({
      $or: [{ pharmacyId: pharmacy._id }, { pharmacyId: null, isHospitalPharmacy: false }],
    })
      .populate('patientId', 'name phone email gender bloodGroup')
      .populate('doctorId', 'name specialization phone')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Prescriptions fetched successfully.', prescriptions);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch prescriptions.', error);
  }
};

// @desc    Verify retail pharmacy prescription
// @route   PUT /api/pharmacy/prescriptions/:id/verify
// @access  Private (Pharmacy)
const verifyPrescription = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });
    if (!pharmacy) {
      return sendNotFound(res, 'Pharmacy profile not found.');
    }

    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return sendNotFound(res, 'Prescription not found.');
    }

    prescription.isVerified = true;
    prescription.verifiedBy = req.user._id;
    prescription.pharmacyId = pharmacy._id;
    prescription.verificationDate = new Date();
    await prescription.save();

    return sendSuccess(res, 'Prescription verified successfully.', prescription);
  } catch (error) {
    return sendServerError(res, 'Failed to verify prescription.', error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getDashboard,
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  getOrders,
  updateOrderStatus,
  getPrescriptions,
  verifyPrescription,
  getInvoices,
  updateInvoicePaymentStatus,
};