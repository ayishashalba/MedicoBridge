const express = require("express");
const router = express.Router();

const {
    submitFeedback,
    getFeedback,
    getPatientFeedback,
} = require("../controllers/feedbackController");

const protect = require("../middleware/authMiddleware");

// Both authenticated and public can submit or view feedback
router.post("/", (req, res, next) => {
    // If auth header present, try protect, else continue
    if (req.headers.authorization) {
        return protect(req, res, next);
    }
    next();
}, submitFeedback);

router.get("/", getFeedback);
router.get("/patient", getPatientFeedback);

module.exports = router;
