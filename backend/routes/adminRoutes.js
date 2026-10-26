const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
  // Dashboard
  getDashboard,

  // User Management
  getUsers,
  blockUser,
  activateUser,

  // Approvals
  getPendingApprovals,
  approveDoctor,
  rejectDoctor,
  approveHospital,
  rejectHospital,
  approvePharmacy,
  rejectPharmacy,

  // Medicine Management
  getAdminMedicines,
  approveMedicine,
  rejectMedicine,
  blockMedicine,
  unblockMedicine,
  deleteAdminMedicine,

  // Reports
  getReports,

  // Admin Profile
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
} = require("../controllers/adminController");

// ============================================================
// ADMIN AUTHORIZATION
// ============================================================

router.use(protect);
router.use(authorizeRoles("Admin"));

// ============================================================
// DASHBOARD
// ============================================================

// GET /api/admin/dashboard
router.get("/dashboard", getDashboard);

// ============================================================
// USER MANAGEMENT
// ============================================================

// GET /api/admin/users
router.get("/users", getUsers);

// PUT /api/admin/users/block/:id
router.put("/users/block/:id", blockUser);

// PUT /api/admin/users/activate/:id
router.put("/users/activate/:id", activateUser);

// ============================================================
// ADMIN APPROVALS
// ============================================================

// GET /api/admin/approvals
router.get("/approvals", getPendingApprovals);

// ------------------------------------------------------------
// DOCTOR APPROVAL
// ------------------------------------------------------------

// PUT /api/admin/doctor/approve/:id
router.put("/doctor/approve/:id", approveDoctor);

// PUT /api/admin/doctor/reject/:id
router.put("/doctor/reject/:id", rejectDoctor);

// ------------------------------------------------------------
// HOSPITAL APPROVAL
// ------------------------------------------------------------

// PUT /api/admin/hospital/approve/:id
router.put("/hospital/approve/:id", approveHospital);

// PUT /api/admin/hospital/reject/:id
router.put("/hospital/reject/:id", rejectHospital);

// ------------------------------------------------------------
// PHARMACY APPROVAL
// ------------------------------------------------------------

// PUT /api/admin/pharmacy/approve/:id
router.put("/pharmacy/approve/:id", approvePharmacy);

// PUT /api/admin/pharmacy/reject/:id
router.put("/pharmacy/reject/:id", rejectPharmacy);

// ============================================================
// MEDICINE MANAGEMENT
// ============================================================

// GET /api/admin/medicines
router.get("/medicines", getAdminMedicines);

// PUT /api/admin/medicines/:id/approve
router.put("/medicines/:id/approve", approveMedicine);

// PUT /api/admin/medicines/:id/reject
router.put("/medicines/:id/reject", rejectMedicine);

// PUT /api/admin/medicines/:id/block
router.put("/medicines/:id/block", blockMedicine);

// PUT /api/admin/medicines/:id/unblock
router.put("/medicines/:id/unblock", unblockMedicine);

// DELETE /api/admin/medicines/:id
router.delete("/medicines/:id", deleteAdminMedicine);

// ============================================================
// ADMIN REPORTS
// ============================================================

// GET /api/admin/reports
router.get("/reports", getReports);

// ============================================================
// ADMIN PROFILE
// ============================================================

// GET /api/admin/profile
router.get("/profile", getAdminProfile);

// PUT /api/admin/profile
router.put("/profile", updateAdminProfile);

// PUT /api/admin/profile/password
router.put("/profile/password", changeAdminPassword);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;