const Notification = require("../models/Notification");
const User = require("../models/User");


// ============================================================
// GET MY NOTIFICATIONS
// ============================================================

const getNotifications = async (req, res) => {
  try {
    const query = {
      $or: [
        { userId: req.user._id },
        { targetRole: { $in: [req.user.role, 'All Users', 'Doctors & Pharmacies'] } },
      ],
      isDismissed: false,
    };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully.",
      data: notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
      error: error.message,
    });
  }
};


// ============================================================
// MARK ONE AS READ
// ============================================================

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { userId: req.user._id },
          { targetRole: { $in: [req.user.role, 'All Users', 'Doctors & Pharmacies'] } },
        ],
      },
      {
        isRead: true,
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      data: notification,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read.",
      error: error.message,
    });
  }
};


// ============================================================
// MARK ALL AS READ
// ============================================================

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        $or: [
          { userId: req.user._id },
          { targetRole: { $in: [req.user.role, 'All Users', 'Doctors & Pharmacies'] } },
        ],
        isRead: false,
        isDismissed: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read.",
      error: error.message,
    });
  }
};


// ============================================================
// DISMISS NOTIFICATION
// ============================================================

const dismissNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { userId: req.user._id },
          { targetRole: { $in: [req.user.role, 'All Users', 'Doctors & Pharmacies'] } },
        ],
      },
      {
        isDismissed: true,
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification dismissed.",
      data: notification,
    });
  } catch (error) {
    console.error("Dismiss notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to dismiss notification.",
      error: error.message,
    });
  }
};


// ============================================================
// ADMIN BROADCAST
// ============================================================

const createBroadcast = async (req, res) => {
  try {
    const {
      title,
      message,
      targetRole = "All Users",
    } = req.body;

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required.",
      });
    }

    const allowedTargets = [
      "All Users",
      "Patient",
      "Doctor",
      "Hospital",
      "Pharmacy",
      "Doctors & Pharmacies",
    ];

    if (!allowedTargets.includes(targetRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target user segment.",
      });
    }

    let userQuery = {};

    if (targetRole === "Doctors & Pharmacies") {
      userQuery.role = {
        $in: ["Doctor", "Pharmacy"],
      };
    } else if (targetRole !== "All Users") {
      userQuery.role = targetRole;
    }

    const users = await User.find(userQuery).select("_id");
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found for the selected target segment.",
      });
    }

    const notifications = users.map((user) => ({
      userId: user._id,
      title: title.trim(),
      message: message.trim(),
      type: "Info",
      category: "Broadcast",
      targetRole,
      isRead: false,
      isDismissed: false,
    }));

    await Notification.insertMany(notifications);

    return res.status(201).json({
      success: true,
      message: `Broadcast sent successfully to ${users.length} users.`,
      data: {
        recipientCount: users.length,
        title: title.trim(),
        targetRole,
      },
    });
  } catch (error) {
    console.error("Create broadcast error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send broadcast.",
      error: error.message,
    });
  }
};


// ============================================================
// ADMIN BROADCAST HISTORY
// ============================================================

const getBroadcastHistory = async (req, res) => {
  try {
    const broadcasts = await Notification.aggregate([
      {
        $match: {
          category: "Broadcast",
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: {
            title: "$title",
            message: "$message",
            targetRole: "$targetRole",
          },
          createdAt: {
            $first: "$createdAt",
          },
          recipientCount: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: 50,
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Broadcast history fetched successfully.",
      data: broadcasts,
    });
  } catch (error) {
    console.error("Broadcast history error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch broadcast history.",
      error: error.message,
    });
  }
};


module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  createBroadcast,
  getBroadcastHistory,
};