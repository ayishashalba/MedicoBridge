const MedicalReport = require("../models/MedicalReport");

const {
    successResponse,
    validationErrorResponse,
    notFoundResponse,
    serverErrorResponse,
    forbiddenResponse,
} = require("../utils/apiResponse");
const { isValidObjectId } = require("../utils/validators");

const generateReportId = () => {
    return `MED${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

// Get medical reports
const getMedicalReports = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === "patient") {
            query.patientId = req.user.id;
        } else if (req.user.role === "hospital") {
            query.hospitalId = req.user.id;
        } else if (req.user.role === "doctor") {
            if (req.query.patientId && isValidObjectId(req.query.patientId)) {
                query.patientId = req.query.patientId;
            } else {
                query.doctorId = req.user.id;
            }
        }

        const reports = await MedicalReport.find(query)
            .populate("patientId", "name email bloodGroup city")
            .populate("doctorId", "name email specialization")
            .populate("hospitalId", "name city")
            .sort({ date: -1, createdAt: -1 });

        return successResponse(res, "Medical reports retrieved successfully", {
            reports,
            count: reports.length,
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch medical reports", error);
    }
};

// Get single medical report
const getMedicalReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = isValidObjectId(id) ? { _id: id } : { reportId: id };

        const report = await MedicalReport.findOne(query)
            .populate("patientId", "name email bloodGroup city phone")
            .populate("doctorId", "name email specialization")
            .populate("hospitalId", "name city");

        if (!report) {
            return notFoundResponse(res, "Medical report not found");
        }

        const userId = req.user.id.toString();
        const role = req.user.role;

        if (role === "patient" && report.patientId._id.toString() !== userId) {
            return forbiddenResponse(res, "Cannot view another patient's report");
        }

        return successResponse(res, "Medical report retrieved successfully", { report });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch medical report", error);
    }
};

// Create medical report (Doctor or Hospital)
const createMedicalReport = async (req, res) => {
    try {
        const {
            patientId,
            doctorId,
            reportType,
            title,
            summary,
            diagnosis,
            treatmentPlan,
            attachments,
        } = req.body;

        if (!patientId || !title) {
            return validationErrorResponse(res, "Patient ID and title are required");
        }

        if (!isValidObjectId(patientId)) {
            return validationErrorResponse(res, "Invalid patient ID");
        }

        const report = await MedicalReport.create({
            reportId: generateReportId(),
            patientId,
            doctorId: doctorId && isValidObjectId(doctorId) ? doctorId : (req.user.role === "doctor" ? req.user.id : null),
            hospitalId: req.user.role === "hospital" ? req.user.id : null,
            reportType: reportType || "Diagnostic Summary",
            title: title.trim(),
            summary: summary || "",
            diagnosis: diagnosis || "",
            treatmentPlan: treatmentPlan || "",
            attachments: Array.isArray(attachments) ? attachments : [],
            date: new Date(),
        });

        return successResponse(res, "Medical report created successfully", { report }, 201);
    } catch (error) {
        return serverErrorResponse(res, "Unable to create medical report", error);
    }
};

// Delete medical report
const deleteMedicalReport = async (req, res) => {
    try {
        const { id } = req.params;
        const query = isValidObjectId(id) ? { _id: id } : { reportId: id };

        const report = await MedicalReport.findOneAndDelete(query);
        if (!report) {
            return notFoundResponse(res, "Medical report not found");
        }

        return successResponse(res, "Medical report deleted successfully");
    } catch (error) {
        return serverErrorResponse(res, "Unable to delete medical report", error);
    }
};

module.exports = {
    getMedicalReports,
    getMedicalReportById,
    createMedicalReport,
    deleteMedicalReport,
};
