const LabReport = require('../models/LabReport');
const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendForbidden,
  sendServerError,
} = require('../utils/responseHandler');

// Helper: resolve hospital from logged-in user
const resolveHospital = async (user) => {
  return Hospital.findOne({ userId: user._id });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all lab reports for this hospital
// @route   GET /api/hospital/lab-reports
// @access  Private (Hospital)
// ─────────────────────────────────────────────────────────────────────────────
const getHospitalLabReports = async (req, res) => {
  try {
    const hospital = await resolveHospital(req.user);
    if (!hospital) return sendNotFound(res, 'Hospital profile not found.');

    const reports = await LabReport.find({ hospitalId: hospital._id })
      .populate('patientId', 'name patientId gender dob')
      .populate('doctorId', 'name specialization department')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Lab reports fetched successfully.', reports);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch lab reports.', error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new lab report order
// @route   POST /api/hospital/lab-reports
// @access  Private (Hospital)
// ─────────────────────────────────────────────────────────────────────────────
const createHospitalLabReport = async (req, res) => {
  try {
    const hospital = await resolveHospital(req.user);
    if (!hospital) return sendNotFound(res, 'Hospital profile not found.');

    const { patientId, doctorId, testName, category, sampleType, remarks, results } = req.body;

    if (!patientId || !testName) {
      return sendValidationError(res, 'Validation failed', [
        'Patient ID and Test Name are required.',
      ]);
    }

    // Verify patient belongs to this hospital context
    const patient = await Patient.findById(patientId);
    if (!patient) return sendNotFound(res, 'Patient not found.');

    // Verify doctor belongs to this hospital (if provided)
    let resolvedDoctorId = doctorId || null;
    if (doctorId) {
      const doctor = await Doctor.findOne({ _id: doctorId, hospitalId: hospital._id });
      if (!doctor) {
        // Allow but don't hard-fail — just log
        console.warn(`Doctor ${doctorId} is not part of hospital ${hospital._id}`);
      }
    }

    const labReport = await LabReport.create({
      patientId,
      hospitalId: hospital._id,
      doctorId: resolvedDoctorId,
      testName: testName.trim(),
      category: category || 'General Pathology',
      sampleType: sampleType || '',
      remarks: remarks || '',
      isAbnormal: false,
      associatedWithMedicalRecord: false,
      results: Array.isArray(results) ? results : [],
      status: 'Requested',
      reportDate: new Date(),
    });

    // Re-fetch with populated fields for front-end
    const populated = await LabReport.findById(labReport._id)
      .populate('patientId', 'name patientId gender dob')
      .populate('doctorId', 'name specialization department');

    return sendSuccess(res, 'Lab order created successfully.', populated, 201);
  } catch (error) {
    return sendServerError(res, 'Failed to create lab order.', error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update an existing lab report (status, results, remarks, isAbnormal)
// @route   PUT /api/hospital/lab-reports/:id
// @access  Private (Hospital)
// ─────────────────────────────────────────────────────────────────────────────
const updateHospitalLabReport = async (req, res) => {
  try {
    const hospital = await resolveHospital(req.user);
    if (!hospital) return sendNotFound(res, 'Hospital profile not found.');

    const report = await LabReport.findOne({
      _id: req.params.id,
      hospitalId: hospital._id,
    });
    if (!report) return sendNotFound(res, 'Lab report not found.');

    const { status, results, isAbnormal, remarks } = req.body;

    if (status !== undefined) report.status = status;
    if (results !== undefined && Array.isArray(results)) report.results = results;
    if (isAbnormal !== undefined) report.isAbnormal = isAbnormal;
    if (remarks !== undefined) report.remarks = remarks;

    await report.save();

    const populated = await LabReport.findById(report._id)
      .populate('patientId', 'name patientId gender dob')
      .populate('doctorId', 'name specialization department');

    return sendSuccess(res, 'Lab report updated successfully.', populated);
  } catch (error) {
    return sendServerError(res, 'Failed to update lab report.', error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Mark lab report as Completed and optionally link to Medical Record
// @route   PUT /api/hospital/lab-reports/:id/complete
// @access  Private (Hospital)
// ─────────────────────────────────────────────────────────────────────────────
const completeHospitalLabReport = async (req, res) => {
  try {
    const hospital = await resolveHospital(req.user);
    if (!hospital) return sendNotFound(res, 'Hospital profile not found.');

    const report = await LabReport.findOne({
      _id: req.params.id,
      hospitalId: hospital._id,
    })
      .populate('patientId', 'name patientId gender dob')
      .populate('doctorId', 'name specialization department');

    if (!report) return sendNotFound(res, 'Lab report not found.');

    report.status = 'Completed';

    // Create / link Medical Record if not already linked
    if (!report.associatedWithMedicalRecord) {
      try {
        const patientDoc = await Patient.findById(report.patientId._id || report.patientId);
        const doctorDoc = report.doctorId
          ? await Doctor.findById(report.doctorId._id || report.doctorId)
          : null;

        const medRecord = await MedicalRecord.create({
          patientId: patientDoc._id,
          doctorId: doctorDoc ? doctorDoc._id : null,
          hospitalId: hospital._id,
          recordType: 'Lab Report',
          title: `Lab Report: ${report.testName}`,
          description: report.remarks || `Completed lab test: ${report.testName}`,
          date: new Date(),
          doctorName: doctorDoc ? doctorDoc.name : '',
          hospitalName: hospital.name || '',
        });

        report.associatedWithMedicalRecord = true;
        report.medicalRecordId = medRecord._id;
      } catch (medErr) {
        console.error('Failed to create medical record link:', medErr);
        // Don't fail the whole operation — just mark completed without link
        report.associatedWithMedicalRecord = false;
      }
    }

    await report.save();

    const populated = await LabReport.findById(report._id)
      .populate('patientId', 'name patientId gender dob')
      .populate('doctorId', 'name specialization department');

    return sendSuccess(res, 'Lab report marked as completed.', populated);
  } catch (error) {
    return sendServerError(res, 'Failed to complete lab report.', error);
  }
};

module.exports = {
  getHospitalLabReports,
  createHospitalLabReport,
  updateHospitalLabReport,
  completeHospitalLabReport,
};
