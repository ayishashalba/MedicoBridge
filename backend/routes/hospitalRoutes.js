const express = require("express");
const router = express.Router();

const {
    getHospitalProfile,
    updateHospitalProfile,
    getAllHospitals,
    getHospitalById,
    getHospitalStaff,
    addHospitalStaff,
    removeHospitalStaff,
    getHospitalPatients,
    getHospitalDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getHospitalBeds,
    createBed,
    updateBed,
    deleteBed,
} = require("../controllers/hospitalController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// Public routes
router.get("/", getAllHospitals);
router.get("/detail/:id", getHospitalById);

// Staff and patient lists (support auth or header fallback)
router.get("/staff", getHospitalStaff);
router.get("/doctors", getHospitalStaff);
router.get("/patients", getHospitalPatients);

// Authenticated Hospital routes
router.get("/profile", protect, authorize("hospital"), getHospitalProfile);
router.put("/profile", protect, authorize("hospital"), updateHospitalProfile);

// Hospital Staff management
router.post("/staff", protect, authorize("hospital"), addHospitalStaff);
router.delete("/staff/:doctorId", protect, authorize("hospital"), removeHospitalStaff);

// Departments
router.get("/departments", protect, getHospitalDepartments);
router.get("/departments/:hospitalId", getHospitalDepartments);
router.post("/departments", protect, authorize("hospital"), createDepartment);
router.put("/departments/:id", protect, authorize("hospital"), updateDepartment);
router.delete("/departments/:id", protect, authorize("hospital"), deleteDepartment);

// Beds
router.get("/beds", protect, getHospitalBeds);
router.get("/beds/:hospitalId", getHospitalBeds);
router.post("/beds", protect, authorize("hospital"), createBed);
router.put("/beds/:id", protect, authorize("hospital"), updateBed);
router.delete("/beds/:id", protect, authorize("hospital"), deleteBed);

module.exports = router;
