const Notification = require('../models/Notification');

/**
 * Send in-app notification to a user
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.recipientRole
 * @param {string} params.title
 * @param {string} params.message
 * @param {string} params.type
 * @param {string} params.link
 * @param {Object} params.metadata
 */
const createNotification = async ({
  userId,
  recipientRole = 'Patient',
  title,
  message,
  type = 'System',
  link = '',
  metadata = {},
}) => {
  try {
    const notification = await Notification.create({
      userId,
      recipientRole,
      title,
      message,
      type,
      link,
      metadata,
    });
    return notification;
  } catch (error) {
    console.error('[NotificationService] Failed to create notification:', error.message);
    return null;
  }
};

module.exports = {
  createNotification,
};
