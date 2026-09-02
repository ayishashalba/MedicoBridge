const Notification = require("../models/Notification");

const {
    successResponse,
    validationErrorResponse,
    notFoundResponse,
    serverErrorResponse,
} = require("../utils/apiResponse");
const { isValidObjectId } = require("../utils/validators");

// Get user notifications
const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipientId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({
            recipientId: req.user.id,
            isRead: false,
        });

        return successResponse(res, "Notifications retrieved successfully", {
            notifications,
            unreadCount,
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch notifications", error);
    }
};

// Mark single notification as read
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid notification ID");
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipientId: req.user.id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return notFoundResponse(res, "Notification not found");
        }

        return successResponse(res, "Notification marked as read", { notification });
    } catch (error) {
        return serverErrorResponse(res, "Unable to update notification", error);
    }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipientId: req.user.id, isRead: false },
            { isRead: true }
        );

        return successResponse(res, "All notifications marked as read");
    } catch (error) {
        return serverErrorResponse(res, "Unable to mark all notifications as read", error);
    }
};

// Create a notification
const createNotification = async (req, res) => {
    try {
        const { recipientId, title, message, type, link } = req.body;

        if (!recipientId || !title || !message) {
            return validationErrorResponse(res, "Recipient, title, and message are required");
        }

        if (!isValidObjectId(recipientId)) {
            return validationErrorResponse(res, "Invalid recipient ID");
        }

        const notification = await Notification.create({
            recipientId,
            senderId: req.user ? req.user.id : null,
            title: title.trim(),
            message: message.trim(),
            type: type || "General",
            link: link || "",
            isRead: false,
        });

        return successResponse(res, "Notification created successfully", { notification }, 201);
    } catch (error) {
        return serverErrorResponse(res, "Unable to create notification", error);
    }
};

module.exports = {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
};
