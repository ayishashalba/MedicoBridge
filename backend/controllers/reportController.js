const LabReport = require('../models/LabReport');
const MedicalReport = require('../models/MedicalReport');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const { createNotification } = require('../services/notificationService');
const {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendForbidden,
  sendServerError,
} = require('../utils/responseHandler');

// ----------------------------------------------------
// LAB REPORTS
// ----------------------------------------------------

// @desc    Create Lab Report
// @route   POST /api/lab-reports
// @access  Private (Hospital / Doctor)
const createLabReport = async (req, res) => {
  try {
    const { patientId, doctorId, testName, category, results, fileUrl, notes, status, reportDate } = req.body;

    if (!patientId || !testName) {
      return sendValidationError(res, 'Validation failed', ['Patient ID and Test Name are required.']);
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return sendNotFound(res, 'Patient not found.');
    }

    let hospitalId = null;
    if (req.user.role === 'Hospital') {
      const hospital = await Hospital.findOne({ userId: req.user._id });
      hospitalId = hospital ? hospital._id : null;
    } else if (req.user.role === 'Doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      hospitalId = doctor ? doctor.hospitalId : null;
    }

    const labReport = await LabReport.create({
      patientId,
      hospitalId,
      doctorId: doctorId || null,
      testName: testName.trim(),
      category: category || 'General Pathology',
      results: Array.isArray(results) ? results : [],
      fileUrl: fileUrl || '',
      notes: notes || '',
      status: status || 'Completed',
      reportDate: reportDate ? new Date(reportDate) : new Date(),
    });

    // Notify patient
    await createNotification({
      userId: patient.userId,
      recipientRole: 'Patient',
      title: 'New Lab Report Available',
      message: `Your lab test report for "${testName}" has been uploaded.`,
      type: 'LabReport',
      metadata: { labReportId: labReport._id },
    });

    return sendSuccess(res, 'Lab report created successfully.', labReport, 201);
  } catch (error) {
    return sendServerError(res, 'Failed to create lab report.', error);
  }
};

// @desc    Get patient lab reports
// @route   GET /api/patient/lab-reports
// @access  Private (Patient)
const getPatientLabReports = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return sendNotFound(res, 'Patient profile not found.');

    const reports = await LabReport.find({ patientId: patient._id })
      .populate('hospitalId', 'name city phone')
      .populate('doctorId', 'name specialization')
      .sort({ reportDate: -1 });

    return sendSuccess(res, 'Lab reports fetched successfully.', reports);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch lab reports.', error);
  }
};

// ----------------------------------------------------
// MEDICAL REPORTS
// ----------------------------------------------------

// @desc    Create Medical Report
// @route   POST /api/medical-reports
// @access  Private (Doctor / Hospital)
const createMedicalReport = async (req, res) => {
  try {
    const { patientId, doctorId, labReportId, title, summary, findings, recommendations, attachments, reportDate } = req.body;

    if (!patientId || !title) {
      return sendValidationError(res, 'Validation failed', ['Patient ID and Report Title are required.']);
    }

    const patient = await Patient.findById(patientId);
    if (!patient) return sendNotFound(res, 'Patient not found.');

    let hospitalId = null;
    let docId = doctorId || null;

    if (req.user.role === 'Hospital') {
      const hospital = await Hospital.findOne({ userId: req.user._id });
      hospitalId = hospital ? hospital._id : null;
    } else if (req.user.role === 'Doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (doctor) {
        docId = doctor._id;
        hospitalId = doctor.hospitalId;
      }
    }

    const medicalReport = await MedicalReport.create({
      patientId,
      doctorId: docId,
      hospitalId,
      labReportId: labReportId || null,
      title: title.trim(),
      summary: summary || '',
      findings: findings || '',
      recommendations: recommendations || '',
      attachments: Array.isArray(attachments) ? attachments : attachments ? [attachments] : [],
      reportDate: reportDate ? new Date(reportDate) : new Date(),
    });

    // Notify patient
    await createNotification({
      userId: patient.userId,
      recipientRole: 'Patient',
      title: 'New Medical Report Issued',
      message: `A new medical report "${title}" has been issued.`,
      type: 'Prescription',
      metadata: { reportId: medicalReport._id },
    });

    return sendSuccess(res, 'Medical report created successfully.', medicalReport, 201);
  } catch (error) {
    return sendServerError(res, 'Failed to create medical report.', error);
  }
};

// @desc    Get patient medical reports
// @route   GET /api/patient/medical-reports
// @access  Private (Patient)
const getPatientMedicalReports = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return sendNotFound(res, 'Patient profile not found.');

    const reports = await MedicalReport.find({ patientId: patient._id })
      .populate('doctorId', 'name specialization')
      .populate('hospitalId', 'name city')
      .populate('labReportId')
      .sort({ reportDate: -1 });

    return sendSuccess(res, 'Medical reports fetched successfully.', reports);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch medical reports.', error);
  }
};

// @desc    Get single medical report by ID
// @route   GET /api/medical-reports/:id
// @access  Private
const getMedicalReportById = async (req, res) => {
  try {
    const report = await MedicalReport.findById(req.params.id)
      .populate('patientId', 'name phone email gender bloodGroup dob')
      .populate('doctorId', 'name specialization phone')
      .populate('hospitalId', 'name address city')
      .populate('labReportId');

    if (!report) {
      return sendNotFound(res, 'Medical report not found.');
    }

    // Authorization check: Patient can only view their own
    if (req.user.role === 'Patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient || String(report.patientId._id) !== String(patient._id)) {
        return sendForbidden(res, 'You are not authorized to view this report.');
      }
    }

    return sendSuccess(res, 'Medical report fetched successfully.', report);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch medical report.', error);
  }
};

module.exports = {
  createLabReport,
  getPatientLabReports,
  createMedicalReport,
  getPatientMedicalReports,
  getMedicalReportById,
};
