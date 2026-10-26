const { sendForbidden } = require('../utils/responseHandler');

/**
 * Role-based authorization middleware
 * @param  {...string} roles - Allowed roles e.g. 'Patient', 'Doctor', 'Hospital', 'Pharmacy', 'Admin'
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendForbidden(res, 'User context missing. Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      return sendForbidden(
        res,
        `Access denied. Role '${req.user.role}' is not authorized to access this resource.`
      );
    }

    next();
  };
};

module.exports = {
  authorizeRoles,
};
