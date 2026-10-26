const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const Pharmacy = require('../models/Pharmacy');
const { sendUnauthorized, sendForbidden } = require('../utils/responseHandler');

/**
 * Protect routes: Verify JWT and attach authenticated user & role profile to req
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendUnauthorized(res, 'Authentication token missing or invalid');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'medicobridge_secret_key_2026');
    const user = await User.findById(decoded.id);

    if (!user) {
      return sendUnauthorized(res, 'User belonging to this token no longer exists');
    }

    if (user.status === 'blocked') {
      return sendForbidden(res, 'Your account has been blocked. Please contact support.');
    }

    req.user = user;

    // Attach role profile for convenience
    if (user.role === 'Patient') {
      req.patient = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'Doctor') {
      req.doctor = await Doctor.findOne({ userId: user._id });
    } else if (user.role === 'Hospital') {
      req.hospital = await Hospital.findOne({ userId: user._id });
    } else if (user.role === 'Pharmacy') {
      req.pharmacy = await Pharmacy.findOne({ userId: user._id });
    }

    next();
  } catch (error) {
    console.error('JWT VERIFY ERROR:', error.message);
    console.error('JWT SECRET LOADED:', !!process.env.JWT_SECRET);

    return sendUnauthorized(res, 'Invalid or expired token');
  }
};

module.exports = {
  protect,
};
