const express = require("express");

const router = express.Router();

const {
    protect,
} = require("../middleware/authMiddleware");

const {
    authorizeRoles,
} = require("../middleware/roleMiddleware");

const {
    getSystemSettings,
    updateSystemSettings,
} = require("../controllers/systemSettingsController");

// Only Admin can access system settings
router.use(protect);
router.use(authorizeRoles("Admin"));

router.get("/", getSystemSettings);
router.put("/", updateSystemSettings);

module.exports = router;