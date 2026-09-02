const Consultation = require("../models/Consultation");
const Appointment = require("../models/Appointment");

const {
    successResponse,
    validationErrorResponse,
    notFoundResponse,
    serverErrorResponse,
    forbiddenResponse,
} = require("../utils/apiResponse");
const { isValidObjectId } = require("../utils/validators");

const saveConsultation = async (req, res) => {
    try {
        const { appointmentId, patientId, diagnosis, advice } = req.body;

        if (!appointmentId || !patientId) {
            return validationErrorResponse(
                res,
                "Appointment ID and Patient ID are required"
            );
        }

        if (!isValidObjectId(appointmentId) || !isValidObjectId(patientId)) {
            return validationErrorResponse(res, "Invalid ID format");
        }

        const appointment = await Appointment.findOne({
            _id: appointmentId,
            doctorId: req.user.id,
        });

        if (!appointment) {
            return notFoundResponse(
                res,
                "Appointment not found or not assigned to you"
            );
        }

        let consultation = await Consultation.findOne({ appointmentId });

        if (consultation) {
            consultation.diagnosis = diagnosis !== undefined ? diagnosis.trim() : consultation.diagnosis;
            consultation.advice = advice !== undefined ? advice.trim() : consultation.advice;
            await consultation.save();
        } else {
            consultation = await Consultation.create({
                appointmentId,
                patientId,
                doctorId: req.user.id,
                diagnosis: diagnosis ? diagnosis.trim() : "",
                advice: advice ? advice.trim() : "",
            });
        }

        // Mark appointment as Completed
        appointment.status = "Completed";
        await appointment.save();

        const populated = await Consultation.findById(consultation._id)
            .populate("doctorId", "name email phone specialization")
            .populate("patientId", "name email bloodGroup city");

        return successResponse(
            res,
            "Consultation saved successfully",
            { consultation: populated },
            201
        );
    } catch (error) {
        return serverErrorResponse(
            res,
            "Unable to save consultation",
            error
        );
    }
};

const getConsultations = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === "patient") {
            query.patientId = req.user.id;
        } else if (req.user.role === "doctor") {
            query.doctorId = req.user.id;
        } else if (req.query.patientId) {
            if (!isValidObjectId(req.query.patientId)) {
                return validationErrorResponse(res, "Invalid patient ID");
            }
            query.patientId = req.query.patientId;
        }

        const consultations = await Consultation.find(query)
            .populate("doctorId", "name email specialization")
            .populate("patientId", "name email bloodGroup city")
            .populate("appointmentId", "date time mode")
            .sort({ createdAt: -1 });

        return successResponse(
            res,
            "Consultations retrieved successfully",
            { consultations }
        );
    } catch (error) {
        return serverErrorResponse(
            res,
            "Unable to fetch consultations",
            error
        );
    }
};

const getConsultationByAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        if (!isValidObjectId(appointmentId)) {
            return validationErrorResponse(res, "Invalid appointment ID");
        }

        const consultation = await Consultation.findOne({ appointmentId })
            .populate("doctorId", "name email specialization")
            .populate("patientId", "name email bloodGroup city");

        if (!consultation) {
            return notFoundResponse(res, "No consultation found for this appointment");
        }

        return successResponse(
            res,
            "Consultation retrieved successfully",
            { consultation }
        );
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch consultation", error);
    }
};

module.exports = {
    saveConsultation,
    getConsultations,
    getConsultationByAppointment,
};