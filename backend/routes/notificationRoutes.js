const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  createBroadcast,
  getBroadcastHistory,
} = require("../controllers/notificationController");

// All notification routes require login
router.use(protect);

// ============================================================
// USER NOTIFICATIONS
// ============================================================

router.get("/", getNotifications);

router.put("/read-all", markAllAsRead);

// ============================================================
// ADMIN BROADCAST
// ============================================================

// Broadcast history must come before /:id routes
router.get(
  "/broadcast/history",
  authorizeRoles("Admin"),
  getBroadcastHistory
);

router.post(
  "/broadcast",
  authorizeRoles("Admin"),
  createBroadcast
);

// ============================================================
// INDIVIDUAL NOTIFICATION ACTIONS
// ============================================================

router.put("/:id/read", markAsRead);

router.put("/:id/dismiss", dismissNotification);
router.delete("/:id", dismissNotification);

module.exports = router;