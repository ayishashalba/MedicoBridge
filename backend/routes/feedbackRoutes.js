const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
    createFeedback,
    getFeedbacks,
    resolveFeedback,
    replyToFeedback,
} = require("../controllers/feedbackController");

// Patient / Doctor / Hospital / Pharmacy → Submit feedback
router.post(
    "/",
    protect,
    authorizeRoles("Patient", "Doctor", "Hospital", "Pharmacy"),
    createFeedback
);

// Admin → View feedbacks
router.get(
    "/",
    protect,
    authorizeRoles("Admin"),
    getFeedbacks
);

// Admin → Resolve feedback
router.put(
    "/:id/resolve",
    protect,
    authorizeRoles("Admin"),
    resolveFeedback
);

// Admin → Reply to feedback
router.put(
    "/:id/reply",
    protect,
    authorizeRoles("Admin"),
    replyToFeedback
);

module.exports = router;