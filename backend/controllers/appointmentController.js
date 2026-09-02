const Appointment = require("../models/Appointment");
const User = require("../models/User");

const {
    successResponse,
    validationErrorResponse,
    notFoundResponse,
    serverErrorResponse,
} = require("../utils/apiResponse");

const generateAppointmentId = () => {
    return `APT${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

// Patient books appointment
const bookAppointment = async (req, res) => {
    try {
        const {
            doctorId,
            hospitalId,
            departmentId,
            date,
            time,
            mode,
            reason,
        } = req.body;

        if (!doctorId || !date || !time) {
            return validationErrorResponse(res, "Doctor, date and time are required");
        }

        const doctor = await User.findOne({
            _id: doctorId,
            role: "Doctor",
            isActive: true,
        });

        if (!doctor) {
            return notFoundResponse(res, "Doctor not found");
        }

        // Prevent double booking
        const existingAppointment = await Appointment.findOne({
            doctorId,
            date: new Date(date),
            time,
            status: {
                $in: ["Pending", "Confirmed", "Accepted"],
            },
        });

        if (existingAppointment) {
            return validationErrorResponse(
                res,
                "Selected slot unavailable"
            );
        }

        const appointment = await Appointment.create({
            appointmentId: generateAppointmentId(),
            patientId: req.user.id,
            doctorId,
            hospitalId: hospitalId || null,
            departmentId: departmentId || null,
            date,
            time,
            mode: mode || "Offline",
            reason: reason || "",
        });

        return successResponse(
            res,
            "Appointment booked successfully",
            {
                appointmentId: appointment.appointmentId,
                appointment,
            },
            201
        );
    } catch (error) {
        return serverErrorResponse(
            res,
            "Unable to book appointment",
            error
        );
    }
};

// Patient views own appointments
const getPatientAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            patientId: req.user.id,
        })
            .populate("doctorId", "name email phone city")
            .populate("hospitalId", "name city")
            .sort({ date: 1 });

        return successResponse(
            res,
            "Appointments retrieved successfully",
            { appointments }
        );
    } catch (error) {
        return serverErrorResponse(
            res,
            "Unable to fetch appointments",
            error
        );
    }
};

// Doctor views appointments
const getDoctorAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            doctorId: req.user.id,
        })
            .populate("patientId", "name email phone city bloodGroup")
            .populate("hospitalId", "name city")
            .sort({ date: 1 });

        return successResponse(
            res,
            "Doctor appointments retrieved successfully",
            { appointments }
        );
    } catch (error) {
        return serverErrorResponse(
            res,
            "Unable to fetch doctor appointments",
            error
        );
    }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return notFoundResponse(res, "Appointment not found");
        }

        const userId = req.user.id;

        // Only patient or assigned doctor can cancel
        if (
            appointment.patientId.toString() !== userId &&
            appointment.doctorId.toString() !== userId
        ) {
            return validationErrorResponse(
                res,
                "You are not allowed to cancel this appointment"
            );
        }

        if (appointment.status === "Completed") {
            return validationErrorResponse(
                res,
                "Completed appointment cannot be cancelled"
            );
        }

        appointment.status = "Cancelled";

        await appointment.save();

        return successResponse(
            res,
            "Appointment cancelled successfully",
            { appointment }
        );
    } catch (error) {
        return serverErrorResponse(
            res,
            "Unable to cancel appointment",
            error
        );
    }
};

// Doctor accepts appointment
const acceptAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            doctorId: req.user.id,
        });

        if (!appointment) {
            return notFoundResponse(res, "Appointment not found");
        }

        if (appointment.status !== "Pending") {
            return validationErrorResponse(
                res,
                "Only pending appointments can be accepted"
            );
        }

        appointment.status = "Accepted";

        await appointment.save();

        return successResponse(
            res,
            "Appointment accepted successfully",
            { appointment }
        );
    } catch (error) {
        return serverErrorResponse(
            res,
            "Unable to accept appointment",
            error
        );
    }
};

// Doctor rejects appointment
const rejectAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            doctorId: req.user.id,
        });

        if (!appointment) {
            return notFoundResponse(res, "Appointment not found");
        }

        if (appointment.status !== "Pending") {
            return validationErrorResponse(
                res,
                "Only pending appointments can be rejected"
            );
        }

        appointment.status = "Rejected";

        await appointment.save();

        return successResponse(
            res,
            "Appointment rejected successfully",
            { appointment }
        );
    } catch (error) {
        return serverErrorResponse(
            res,
            "Unable to reject appointment",
            error
        );
    }
};

module.exports = {
    bookAppointment,
    getPatientAppointments,
    getDoctorAppointments,
    cancelAppointment,
    acceptAppointment,
    rejectAppointment,
};