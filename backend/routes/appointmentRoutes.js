const express = require("express");

const {
    bookAppointment,
    getPatientAppointments,
    getDoctorAppointments,
    getHospitalAppointments,
    getAppointmentById,
    cancelAppointment,
    acceptAppointment,
    rejectAppointment,
    completeAppointment,
} = require("../controllers/appointmentController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Patient
router.post(
    "/book",
    authMiddleware,
    roleMiddleware("patient"),
    bookAppointment
);

router.get(
    "/patient",
    authMiddleware,
    roleMiddleware("patient"),
    getPatientAppointments
);

// Doctor
router.get(
    "/doctor",
    authMiddleware,
    roleMiddleware("doctor"),
    getDoctorAppointments
);

router.put(
    "/:id/accept",
    authMiddleware,
    roleMiddleware("doctor"),
    acceptAppointment
);

router.put(
    "/:id/reject",
    authMiddleware,
    roleMiddleware("doctor"),
    rejectAppointment
);

router.put(
    "/:id/complete",
    authMiddleware,
    roleMiddleware("doctor"),
    completeAppointment
);

// Hospital
router.get(
    "/hospital",
    authMiddleware,
    roleMiddleware("hospital"),
    getHospitalAppointments
);

// Single appointment details
router.get(
    "/:id",
    authMiddleware,
    getAppointmentById
);

// Cancel appointment (Patient or Doctor or Hospital)
router.delete(
    "/:id",
    authMiddleware,
    cancelAppointment
);

module.exports = router;