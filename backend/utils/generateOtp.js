const crypto = require('crypto');

/**
 * Generate a secure 6-digit numeric OTP
 * @returns {string} 6-digit OTP
 */
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

module.exports = generateOtp;
