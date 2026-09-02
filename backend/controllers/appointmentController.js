const Appointment = require("../models/Appointment");
const User = require("../models/User");

const {
    successResponse,
    validationErrorResponse,
    notFoundResponse,
    serverErrorResponse,
    forbiddenResponse,
} = require("../utils/apiResponse");
const { isValidObjectId } = require("../utils/validators");

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

        if (!isValidObjectId(doctorId)) {
            return validationErrorResponse(res, "Invalid doctor ID format");
        }

        const doctor = await User.findOne({
            _id: doctorId,
            role: "doctor",
            isActive: true,
        });

        if (!doctor) {
            return notFoundResponse(res, "Doctor not found or inactive");
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
                "Selected slot is unavailable"
            );
        }

        const appointment = await Appointment.create({
            appointmentId: generateAppointmentId(),
            patientId: req.user.id,
            doctorId,
            hospitalId: hospitalId && isValidObjectId(hospitalId) ? hospitalId : null,
            departmentId: departmentId && isValidObjectId(departmentId) ? departmentId : null,
            date: new Date(date),
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
            .sort({ date: 1, createdAt: -1 });

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
            .sort({ date: 1, createdAt: -1 });

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

// Hospital views appointments
const getHospitalAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            hospitalId: req.user.id,
        })
            .populate("patientId", "name email phone city bloodGroup")
            .populate("doctorId", "name email specialization")
            .sort({ date: 1, createdAt: -1 });

        return successResponse(
            res,
            "Hospital appointments retrieved successfully",
            { appointments }
        );
    } catch (error) {
        return serverErrorResponse(
            res,
            "Unable to fetch hospital appointments",
            error
        );
    }
};

// Get single appointment
const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid appointment ID");
        }

        const appointment = await Appointment.findById(id)
            .populate("patientId", "name email phone city bloodGroup")
            .populate("doctorId", "name email phone city")
            .populate("hospitalId", "name city");

        if (!appointment) {
            return notFoundResponse(res, "Appointment not found");
        }

        const userId = req.user.id.toString();
        const isAuthorized =
            appointment.patientId._id.toString() === userId ||
            appointment.doctorId._id.toString() === userId ||
            (appointment.hospitalId && appointment.hospitalId._id.toString() === userId) ||
            req.user.role === "admin";

        if (!isAuthorized) {
            return forbiddenResponse(res, "Not authorized to view this appointment");
        }

        return successResponse(res, "Appointment retrieved successfully", { appointment });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch appointment", error);
    }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid appointment ID");
        }

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return notFoundResponse(res, "Appointment not found");
        }

        const userId = req.user.id.toString();

        // Admin MUST NOT reject or cancel individual doctor appointments (Admin boundary rule)
        if (req.user.role === "admin") {
            return forbiddenResponse(res, "Admins are not permitted to cancel individual doctor appointments");
        }

        // Only patient or assigned doctor can cancel
        if (
            appointment.patientId.toString() !== userId &&
            appointment.doctorId.toString() !== userId &&
            (!appointment.hospitalId || appointment.hospitalId.toString() !== userId)
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
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid appointment ID");
        }

        const appointment = await Appointment.findOne({
            _id: id,
            doctorId: req.user.id,
        });

        if (!appointment) {
            return notFoundResponse(res, "Appointment not found or not assigned to you");
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
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid appointment ID");
        }

        // Admin rule: Admin MUST NOT reject individual doctor appointments
        if (req.user.role === "admin") {
            return forbiddenResponse(res, "Admin is not allowed to reject doctor appointments");
        }

        const appointment = await Appointment.findOne({
            _id: id,
            doctorId: req.user.id,
        });

        if (!appointment) {
            return notFoundResponse(res, "Appointment not found or not assigned to you");
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

// Complete appointment
const completeAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid appointment ID");
        }

        const appointment = await Appointment.findOne({
            _id: id,
            doctorId: req.user.id,
        });

        if (!appointment) {
            return notFoundResponse(res, "Appointment not found or not assigned to you");
        }

        appointment.status = "Completed";
        await appointment.save();

        return successResponse(res, "Appointment marked as completed", { appointment });
    } catch (error) {
        return serverErrorResponse(res, "Unable to complete appointment", error);
    }
};

module.exports = {
    bookAppointment,
    getPatientAppointments,
    getDoctorAppointments,
    getHospitalAppointments,
    getAppointmentById,
    cancelAppointment,
    acceptAppointment,
    rejectAppointment,
    completeAppointment,
};