/**
 * Standard API Response Utilities for MedicoBridge
 */

const successResponse = (res, message = "Operation completed successfully", data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const validationErrorResponse = (res, message = "Validation failed", errors = [], statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors],
  });
};

const unauthorizedResponse = (res, message = "Unauthorized access", statusCode = 401) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

const forbiddenResponse = (res, message = "Access forbidden: insufficient permissions", statusCode = 403) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

const notFoundResponse = (res, message = "Resource not found", statusCode = 404) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

const serverErrorResponse = (res, message = "Internal Server Error", error = null, statusCode = 500) => {
  if (process.env.NODE_ENV === "development" && error) {
    console.error("[ServerError]", error);
  }
  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && error ? { stack: error.stack } : {}),
  });
};

module.exports = {
  successResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
};
