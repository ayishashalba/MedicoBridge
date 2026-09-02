const Prescription = require("../models/Prescription");
const User = require("../models/User");

const {
    successResponse,
    validationErrorResponse,
    notFoundResponse,
    serverErrorResponse,
    forbiddenResponse,
} = require("../utils/apiResponse");
const { isValidObjectId } = require("../utils/validators");

const createPrescription = async (req, res) => {
    try {
        const { patientId, medicine, dosage, duration, notes } = req.body;

        if (!patientId || !medicine || !dosage || !duration) {
            return validationErrorResponse(
                res,
                "Patient, medicine name, dosage, and duration are required"
            );
        }

        if (!isValidObjectId(patientId)) {
            return validationErrorResponse(res, "Invalid patient ID");
        }

        const prescription = await Prescription.create({
            patientId,
            doctorId: req.user.id,
            medicine: medicine.trim(),
            dosage: dosage.trim(),
            duration: duration.trim(),
            notes: notes ? notes.trim() : "",
        });

        const populated = await Prescription.findById(prescription._id)
            .populate("doctorId", "name email phone specialization")
            .populate("patientId", "name email phone bloodGroup");

        return successResponse(
            res,
            "Prescription created successfully",
            { prescription: populated },
            201
        );
    } catch (error) {
        return serverErrorResponse(res, "Unable to create prescription", error);
    }
};

const getPrescriptions = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === "patient") {
            query.patientId = req.user.id;
        } else if (req.user.role === "doctor") {
            query.doctorId = req.user.id;
        } else if (req.user.role === "pharmacy" || req.user.role === "admin") {
            // Pharmacy or admin querying with patientId filter
            if (req.query.patientId) {
                if (!isValidObjectId(req.query.patientId)) {
                    return validationErrorResponse(res, "Invalid patient ID");
                }
                query.patientId = req.query.patientId;
            }
        }

        const prescriptions = await Prescription.find(query)
            .populate("doctorId", "name email specialization")
            .populate("patientId", "name email bloodGroup city")
            .sort({ createdAt: -1 });

        return successResponse(
            res,
            "Prescriptions retrieved successfully",
            { prescriptions }
        );
    } catch (error) {
        return serverErrorResponse(
            res,
            "Unable to fetch prescriptions",
            error
        );
    }
};

const getPrescriptionById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid prescription ID");
        }

        const prescription = await Prescription.findById(id)
            .populate("doctorId", "name email specialization")
            .populate("patientId", "name email bloodGroup city phone");

        if (!prescription) {
            return notFoundResponse(res, "Prescription not found");
        }

        const userId = req.user.id.toString();
        const role = req.user.role;

        // Role authorization check
        if (
            role === "patient" && prescription.patientId._id.toString() !== userId
        ) {
            return forbiddenResponse(res, "Cannot view another patient's prescription");
        }

        if (
            role === "doctor" && prescription.doctorId._id.toString() !== userId
        ) {
            return forbiddenResponse(res, "Cannot view another doctor's prescription");
        }

        return successResponse(
            res,
            "Prescription retrieved successfully",
            { prescription }
        );
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch prescription", error);
    }
};

module.exports = {
    createPrescription,
    getPrescriptions,
    getPrescriptionById,
};