const express = require("express");
const router = express.Router();

const {
    getUsers,
    getUserById,
    updateUserStatus,
    approveUser,
    getPlatformStats,
    getAdminLogs,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// All admin routes require admin authentication
router.use(protect);
router.use(authorize("admin"));

router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id/status", updateUserStatus);
router.put("/users/:id/approve", approveUser);
router.get("/stats", getPlatformStats);
router.get("/logs", getAdminLogs);

module.exports = router;
