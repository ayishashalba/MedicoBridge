/**
 * Standard API Response Helper for MedicoBridge
 */

const sendSuccess = (res, message = "Operation completed successfully", data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendValidationError = (res, message = "Validation failed", errors = [], statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors],
  });
};

const sendUnauthorized = (res, message = "Unauthorized access", statusCode = 401) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

const sendForbidden = (res, message = "Forbidden: Access is denied", statusCode = 403) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

const sendNotFound = (res, message = "Resource not found", statusCode = 404) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

const sendServerError = (res, message = "Internal Server Error", error = null, statusCode = 500) => {
  if (error && process.env.NODE_ENV !== "production") {
    console.error("API Server Error:", error);
  }
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  sendSuccess,
  sendValidationError,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendServerError,
};
