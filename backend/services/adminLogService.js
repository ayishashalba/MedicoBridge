const AdminLog = require('../models/AdminLog');

/**
 * Log an administrative action
 * @param {Object} params
 * @param {string} params.adminId
 * @param {string} params.action
 * @param {string} params.targetType
 * @param {string} params.targetId
 * @param {string} params.description
 * @param {string} params.ipAddress
 */
const logAdminAction = async ({ adminId, action, targetType, targetId, description, ipAddress = '' }) => {
  try {
    const log = await AdminLog.create({
      adminId,
      action,
      targetType,
      targetId: String(targetId || ''),
      description,
      ipAddress,
    });
    return log;
  } catch (error) {
    console.error('[AdminLogService] Failed to create log:', error.message);
    return null;
  }
};

module.exports = {
  logAdminAction,
};
