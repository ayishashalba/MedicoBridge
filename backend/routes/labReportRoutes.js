const express = require("express");
const router = express.Router();

const {
    getLabReports,
    getLabReportById,
    createLabReport,
    updateLabReport,
} = require("../controllers/labReportController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.use(protect);

router.get("/", getLabReports);
router.get("/:id", getLabReportById);
router.post("/", authorize("doctor", "hospital"), createLabReport);
router.put("/:id", authorize("doctor", "hospital"), updateLabReport);

module.exports = router;
