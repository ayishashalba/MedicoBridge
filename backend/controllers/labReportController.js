const LabReport = require("../models/LabReport");

const {
    successResponse,
    validationErrorResponse,
    notFoundResponse,
    serverErrorResponse,
    forbiddenResponse,
} = require("../utils/apiResponse");
const { isValidObjectId } = require("../utils/validators");

const generateReportId = () => {
    return `LAB${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

// Get lab reports
const getLabReports = async (req, res) => {
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

        const reports = await LabReport.find(query)
            .populate("patientId", "name email bloodGroup city")
            .populate("doctorId", "name email specialization")
            .populate("hospitalId", "name city")
            .sort({ reportDate: -1, createdAt: -1 });

        return successResponse(res, "Lab reports retrieved successfully", {
            reports,
            count: reports.length,
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch lab reports", error);
    }
};

// Get single lab report
const getLabReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = isValidObjectId(id) ? { _id: id } : { reportId: id };

        const report = await LabReport.findOne(query)
            .populate("patientId", "name email bloodGroup city phone")
            .populate("doctorId", "name email specialization")
            .populate("hospitalId", "name city");

        if (!report) {
            return notFoundResponse(res, "Lab report not found");
        }

        const userId = req.user.id.toString();
        const role = req.user.role;

        if (role === "patient" && report.patientId._id.toString() !== userId) {
            return forbiddenResponse(res, "Cannot view another patient's lab report");
        }

        return successResponse(res, "Lab report retrieved successfully", { report });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch lab report", error);
    }
};

// Create lab report (Hospital or Doctor)
const createLabReport = async (req, res) => {
    try {
        const {
            patientId,
            doctorId,
            testName,
            category,
            result,
            normalRange,
            unit,
            status,
            fileUrl,
            notes,
        } = req.body;

        if (!patientId || !testName) {
            return validationErrorResponse(res, "Patient ID and Test name are required");
        }

        if (!isValidObjectId(patientId)) {
            return validationErrorResponse(res, "Invalid patient ID");
        }

        const report = await LabReport.create({
            reportId: generateReportId(),
            patientId,
            doctorId: doctorId && isValidObjectId(doctorId) ? doctorId : (req.user.role === "doctor" ? req.user.id : null),
            hospitalId: req.user.role === "hospital" ? req.user.id : null,
            testName: testName.trim(),
            category: category || "Biochemistry",
            result: result || "",
            normalRange: normalRange || "",
            unit: unit || "",
            status: status || "Completed",
            fileUrl: fileUrl || "",
            notes: notes || "",
            reportDate: new Date(),
        });

        return successResponse(res, "Lab report created successfully", { report }, 201);
    } catch (error) {
        return serverErrorResponse(res, "Unable to create lab report", error);
    }
};

// Update lab report
const updateLabReport = async (req, res) => {
    try {
        const { id } = req.params;
        const query = isValidObjectId(id) ? { _id: id } : { reportId: id };

        const report = await LabReport.findOne(query);
        if (!report) {
            return notFoundResponse(res, "Lab report not found");
        }

        const { testName, category, result, normalRange, unit, status, fileUrl, notes } = req.body;
        if (testName !== undefined) report.testName = testName.trim();
        if (category !== undefined) report.category = category;
        if (result !== undefined) report.result = result;
        if (normalRange !== undefined) report.normalRange = normalRange;
        if (unit !== undefined) report.unit = unit;
        if (status !== undefined) report.status = status;
        if (fileUrl !== undefined) report.fileUrl = fileUrl;
        if (notes !== undefined) report.notes = notes;

        await report.save();

        return successResponse(res, "Lab report updated successfully", { report });
    } catch (error) {
        return serverErrorResponse(res, "Unable to update lab report", error);
    }
};

module.exports = {
    getLabReports,
    getLabReportById,
    createLabReport,
    updateLabReport,
};
