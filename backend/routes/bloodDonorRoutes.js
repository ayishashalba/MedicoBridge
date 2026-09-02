const express = require("express");
const router = express.Router();

const { searchBloodDonors } = require("../controllers/patientController");

// Search blood donors (supports public or authenticated)
router.get("/search", searchBloodDonors);
router.get("/", searchBloodDonors);

module.exports = router;
