const express = require("express");

const {
    bookAppointment,
    getPatientAppointments,
    getDoctorAppointments,
    cancelAppointment,
    acceptAppointment,
    rejectAppointment,
} = require("../controllers/appointmentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Patient
router.post(
    "/book",
    authMiddleware,
    roleMiddleware("Patient"),
    bookAppointment
);

router.get(
    "/patient",
    authMiddleware,
    roleMiddleware("Patient"),
    getPatientAppointments
);

// Doctor
router.get(
    "/doctor",
    authMiddleware,
    roleMiddleware("Doctor"),
    getDoctorAppointments
);

router.put(
    "/:id/accept",
    authMiddleware,
    roleMiddleware("Doctor"),
    acceptAppointment
);

router.put(
    "/:id/reject",
    authMiddleware,
    roleMiddleware("Doctor"),
    rejectAppointment
);

// Patient or doctor
router.delete(
    "/:id",
    authMiddleware,
    cancelAppointment
);

module.exports = router;