const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Consultation = require('../models/Consultation');
const Prescription = require('../models/Prescription');
const MedicalRecord = require('../models/MedicalRecord');
const Notification = require('../models/Notification');
const Review = require('../models/Review');
const LabReport = require('../models/LabReport');
const DoctorSettings = require('../models/DoctorSettings');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { createNotification } = require('../services/notificationService');
const {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendForbidden,
  sendServerError,
} = require('../utils/responseHandler');

// @desc    Get doctor profile
// @route   GET /api/doctor/profile
// @access  Private (Doctor)
const getProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id }).populate('hospitalId', 'name city address');
    if (!doctor) {
      return sendNotFound(res, 'Doctor profile not found.');
    }
    return sendSuccess(res, 'Doctor profile fetched successfully.', doctor);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch doctor profile.', error);
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctor/profile
// @access  Private (Doctor)
const updateProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return sendNotFound(res, 'Doctor profile not found.');
    }

    const {
      name,
      phone,
      gender,
      bloodGroup,
      city,
      specialization,
      qualification,
      experience,
      practiceType,
      hospitalName,
      branchLocation,
      department,
      clinicName,
      clinicAddress,
      clinicCity,
      clinicState,
      clinicPincode,
      consultationFee,
      isDonorAvailable,
      availableSlots,
      availableDays,
    } = req.body;

    if (name) doctor.name = name.trim();
    if (phone !== undefined) doctor.phone = phone.trim();
    if (gender !== undefined) doctor.gender = gender;
    if (bloodGroup !== undefined) doctor.bloodGroup = bloodGroup;
    if (city !== undefined) doctor.city = city.trim();
    if (specialization) doctor.specialization = specialization.trim();
    if (qualification !== undefined) doctor.qualification = qualification;
    if (experience !== undefined) doctor.experience = experience;
    if (practiceType !== undefined) doctor.practiceType = practiceType;
    if (hospitalName !== undefined) doctor.hospitalName = hospitalName;
    if (branchLocation !== undefined) doctor.branchLocation = branchLocation;
    if (department !== undefined) doctor.department = department;
    if (clinicName !== undefined) doctor.clinicName = clinicName;
    if (clinicAddress !== undefined) doctor.clinicAddress = clinicAddress;
    if (clinicCity !== undefined) doctor.clinicCity = clinicCity;
    if (clinicState !== undefined) doctor.clinicState = clinicState;
    if (clinicPincode !== undefined) doctor.clinicPincode = clinicPincode;
    if (consultationFee !== undefined) doctor.consultationFee = Number(consultationFee);
    if (isDonorAvailable !== undefined) doctor.isDonorAvailable = Boolean(isDonorAvailable);
    if (availableSlots !== undefined) {
      doctor.availableSlots = Array.isArray(availableSlots) ? availableSlots : [];
      doctor.availableDays =
        availableDays && Array.isArray(availableDays) && availableDays.length > 0
          ? availableDays.filter((d) =>
              doctor.availableSlots.some((s) => s && s.day === d && s.isAvailable !== false)
            )
          : Array.from(
              new Set(
                doctor.availableSlots
                  .filter((s) => s && s.day && s.isAvailable !== false)
                  .map((s) => s.day)
              )
            );
    } else if (availableDays !== undefined) {
      doctor.availableDays = Array.isArray(availableDays) ? availableDays : [];
    }

    await doctor.save();

    return sendSuccess(res, 'Doctor profile updated successfully.', doctor);
  } catch (error) {
    return sendServerError(res, 'Failed to update doctor profile.', error);
  }
};

// @desc    Get doctor dashboard metrics
// @route   GET /api/doctor/dashboard
// @access  Private (Doctor)
const getDashboard = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id })
      .populate('hospitalId', 'name city address');
    if (!doctor) {
      return sendNotFound(res, 'Doctor profile not found.');
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // 1. Today's Appointments for this doctor
    const todaysAppointments = await Appointment.find({
      doctorId: doctor._id,
      date: { $gte: todayStart, $lt: todayEnd },
    })
      .populate('patientId', 'name patientId phone email gender dob')
      .populate('hospitalId', 'name city')
      .sort({ timeSlot: 1, createdAt: 1 });

    const todaysAppointmentsCount = todaysAppointments.length;

    // Remaining appointments today (not Completed and not Cancelled)
    const remainingToday = todaysAppointments.filter(
      (a) => a.status !== 'Completed' && a.status !== 'Cancelled'
    ).length;

    // Total unique patients associated with this doctor
    const patientIds = await Appointment.distinct('patientId', { doctorId: doctor._id });
    const totalPatients = patientIds.length;

    // Online consultations count
    const onlineConsultations = await Appointment.countDocuments({
      doctorId: doctor._id,
      type: { $in: ['Online Consultation', 'Video', 'online', 'Online'] },
    });

    // Pending prescriptions count (Active or hospitalPharmacyStatus Pending)
    const pendingPrescriptions = await Prescription.countDocuments({
      doctorId: doctor._id,
      $or: [
        { status: 'Active' },
        { hospitalPharmacyStatus: 'Pending' }
      ]
    });

    // 3. Recent Patients
    const recentApptsWithPatients = await Appointment.find({ doctorId: doctor._id })
      .populate('patientId', 'name patientId phone email gender')
      .sort({ date: -1, createdAt: -1 })
      .limit(20);

    const seenPatientMap = new Map();
    for (const appt of recentApptsWithPatients) {
      if (!appt.patientId) continue;
      const pidStr = String(appt.patientId._id);
      if (!seenPatientMap.has(pidStr)) {
        seenPatientMap.set(pidStr, {
          patient: appt.patientId,
          lastVisit: appt.date || appt.createdAt,
          timeSlot: appt.timeSlot,
          complaint: appt.reason || (appt.symptoms && appt.symptoms[0]) || 'General Consultation',
        });
      }
      if (seenPatientMap.size >= 5) break;
    }

    const recentPatients = [];
    for (const [, item] of seenPatientMap) {
      const review = await Review.findOne({ doctorId: doctor._id, patientId: item.patient._id });
      recentPatients.push({
        _id: item.patient._id,
        name: item.patient.name,
        patientId: item.patient.patientId ? `#${item.patient.patientId}` : '#PT-NEW',
        complaint: item.complaint,
        lastVisitDate: item.lastVisit,
        timeSlot: item.timeSlot,
        rating: review ? review.rating : (doctor.rating ? Math.round(doctor.rating) : 0),
      });
    }

    // 4. Recent Activity
    const [recentPrescriptions, recentAppts, recentRecords, recentNotifs] = await Promise.all([
      Prescription.find({ doctorId: doctor._id })
        .populate('patientId', 'name')
        .sort({ createdAt: -1 })
        .limit(4),
      Appointment.find({ doctorId: doctor._id })
        .populate('patientId', 'name')
        .sort({ createdAt: -1 })
        .limit(4),
      MedicalRecord.find({ doctorId: doctor._id })
        .populate('patientId', 'name')
        .sort({ createdAt: -1 })
        .limit(4),
      Notification.find({
        $or: [
          { userId: req.user._id },
          { targetRole: { $in: ['Doctor', 'All Users', 'Doctors & Pharmacies'] } }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(4),
    ]);

    const activityList = [];

    recentPrescriptions.forEach((p) => {
      activityList.push({
        id: `rx-${p._id}`,
        type: 'prescription',
        message: `Prescription issued for ${p.patientId?.name || 'Patient'} (${p.diagnosis || 'Active Rx'})`,
        timestamp: p.createdAt,
      });
    });

    recentAppts.forEach((a) => {
      activityList.push({
        id: `apt-${a._id}`,
        type: 'appointment',
        message: `Appointment ${a.status ? a.status.toLowerCase() : 'scheduled'} with ${a.patientId?.name || 'Patient'}`,
        timestamp: a.createdAt || a.date,
      });
    });

    recentRecords.forEach((r) => {
      activityList.push({
        id: `mr-${r._id}`,
        type: 'medical-record',
        message: `${r.title || 'Medical record updated'} for ${r.patientId?.name || 'Patient'}`,
        timestamp: r.createdAt || r.date,
      });
    });

    recentNotifs.forEach((n) => {
      activityList.push({
        id: `notif-${n._id}`,
        type: 'notification',
        message: `${n.title ? n.title + ': ' : ''}${n.message}`,
        timestamp: n.createdAt,
      });
    });

    activityList.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    const recentActivity = activityList.slice(0, 6);

    return sendSuccess(res, 'Doctor dashboard data fetched successfully.', {
      metrics: {
        todaysAppointments: todaysAppointmentsCount,
        totalPatients,
        onlineConsultations,
        pendingPrescriptions,
        remainingToday,
        rating: doctor.rating || 0,
      },
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
        practiceType: doctor.practiceType,
        hospitalName: doctor.hospitalName || (doctor.hospitalId && doctor.hospitalId.name) || '',
        clinicName: doctor.clinicName || '',
        hospital: doctor.hospitalId ? {
          name: doctor.hospitalId.name,
          city: doctor.hospitalId.city,
          address: doctor.hospitalId.address,
        } : null,
      },
      todaysAppointments,
      recentPatients,
      recentActivity,
    });
  } catch (error) {
    return sendServerError(res, 'Failed to fetch doctor dashboard.', error);
  }
};

// @desc    Get doctor appointments
// @route   GET /api/doctor/appointments
// @access  Private (Doctor)
const getAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id })
      .populate('hospitalId', 'name city address');
    if (!doctor) {
      return sendNotFound(res, 'Doctor profile not found.');
    }

    const { status, date, search, type } = req.query;
    const query = { doctorId: doctor._id };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (type) {
      if (type.toLowerCase() === 'online' || type.toLowerCase() === 'video') {
        query.type = { $in: ['Online Consultation', 'Video', 'online', 'Online'] };
      } else {
        query.type = type;
      }
    }

    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);
      query.date = { $gte: d, $lt: nextD };
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name patientId phone email gender bloodGroup dob allergies chronicConditions')
      .populate('hospitalId', 'name city address')
      .sort({ date: -1, createdAt: -1 });

    const appointmentIds = appointments.map((a) => a._id);
    const [consultations, prescriptions] = await Promise.all([
      Consultation.find({ appointmentId: { $in: appointmentIds } }),
      Prescription.find({
        $or: [
          { consultationId: { $in: appointmentIds } },
          { patientId: { $in: appointments.map((a) => a.patientId?._id).filter(Boolean) } },
        ],
      }),
    ]);

    const consultationMap = new Map();
    consultations.forEach((c) => {
      consultationMap.set(String(c.appointmentId), c);
    });

    const prescriptionMap = new Map();
    prescriptions.forEach((p) => {
      if (p.consultationId) {
        prescriptionMap.set(String(p.consultationId), p);
      }
    });

    const enrichedAppointments = appointments.map((appt) => {
      const apptObj = appt.toObject();
      const consult = consultationMap.get(String(appt._id));
      if (consult) {
        apptObj.consultation = consult;
        apptObj.meetingLink = consult.meetingLink;
      }
      const rx =
        prescriptionMap.get(String(appt._id)) ||
        prescriptions.find(
          (p) =>
            String(p.patientId) === String(appt.patientId?._id) &&
            String(p.doctorId) === String(doctor._id)
        );
      if (rx) {
        apptObj.prescriptionId = rx._id;
      }
      return apptObj;
    });

    return sendSuccess(res, 'Doctor appointments fetched successfully.', {
      appointments: enrichedAppointments,
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        practiceType: doctor.practiceType,
        hospitalName: doctor.hospitalName || (doctor.hospitalId && doctor.hospitalId.name) || '',
        clinicName: doctor.clinicName || '',
      },
    });
  } catch (error) {
    return sendServerError(res, 'Failed to fetch appointments.', error);
  }
};

// @desc    Update appointment status (Confirm, In-Progress, Completed, Cancelled)
// @route   PUT /api/doctor/appointments/:id/status
// @access  Private (Doctor)
const updateAppointmentStatus = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return sendNotFound(res, 'Doctor profile not found.');
    }

    const { status, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return sendNotFound(res, 'Appointment not found.');
    }

    if (String(appointment.doctorId) !== String(doctor._id)) {
      return sendForbidden(res, 'You are not authorized to update this appointment.');
    }

    appointment.status = status || appointment.status;
    if (notes) appointment.notes = notes;
    await appointment.save();

    // Notify patient
    const patient = await Patient.findById(appointment.patientId);
    if (patient) {
      await createNotification({
        userId: patient.userId,
        recipientRole: 'Patient',
        title: `Appointment Status: ${appointment.status}`,
        message: `Dr. ${doctor.name} has updated your appointment status to ${appointment.status}.`,
        type: 'Appointment',
        metadata: { appointmentId: appointment._id },
      });
    }

    return sendSuccess(res, `Appointment updated to ${appointment.status}.`, appointment);
  } catch (error) {
    return sendServerError(res, 'Failed to update appointment status.', error);
  }
};

// @desc    Save/Update consultation details
// @route   POST /api/consultation/save
// @access  Private (Doctor)
const saveConsultation = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return sendNotFound(res, 'Doctor profile not found.');
    }

    const { appointmentId, patientId, diagnosis, symptoms, advice, vitals, notes, status, meetingLink } = req.body;

    if (!appointmentId || !patientId) {
      return sendValidationError(res, 'Validation failed', ['Appointment ID and Patient ID are required.']);
    }

    let consultation = await Consultation.findOne({ appointmentId });

    if (!consultation) {
      consultation = new Consultation({
        appointmentId,
        patientId,
        doctorId: doctor._id,
        hospitalId: doctor.hospitalId || null,
        diagnosis: diagnosis || '',
        symptoms: Array.isArray(symptoms) ? symptoms : symptoms ? [symptoms] : [],
        advice: advice || '',
        vitals: vitals || {},
        notes: notes || '',
        status: status || 'In-Progress',
        meetingLink: meetingLink || '',
        startedAt: new Date(),
      });
    } else {
      if (diagnosis !== undefined) consultation.diagnosis = diagnosis;
      if (symptoms !== undefined) consultation.symptoms = Array.isArray(symptoms) ? symptoms : [symptoms];
      if (advice !== undefined) consultation.advice = advice;
      if (vitals) consultation.vitals = vitals;
      if (notes !== undefined) consultation.notes = notes;
      if (status !== undefined) consultation.status = status;
      if (meetingLink !== undefined) consultation.meetingLink = meetingLink;
      if (status === 'Completed' && !consultation.endedAt) {
        consultation.endedAt = new Date();
      }
    }

    await consultation.save();

    // If consultation is completed, update appointment status too
    if (status === 'Completed') {
      await Appointment.findByIdAndUpdate(appointmentId, { status: 'Completed' });
    }

    return sendSuccess(res, 'Consultation saved successfully.', consultation);
  } catch (error) {
    return sendServerError(res, 'Failed to save consultation.', error);
  }
};

// @desc    Get doctor consultations
// @route   GET /api/doctor/consultations
// @access  Private (Doctor)
const getConsultations = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return sendNotFound(res, 'Doctor profile not found.');
    }

    const consultations = await Consultation.find({ doctorId: doctor._id })
      .populate('patientId', 'name phone email gender bloodGroup dob')
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Consultations fetched successfully.', consultations);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch consultations.', error);
  }
};

// @desc    Create prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor)
const createPrescription = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return sendNotFound(res, 'Doctor profile not found.');
    }

    const {
      patientId,
      consultationId,
      hospitalId,
      pharmacyId,
      medicines,
      diagnosis,
      advice,
      notes,
      isHospitalPharmacy,
    } = req.body;

    if (!patientId || !medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return sendValidationError(res, 'Validation failed', [
        'Patient ID and a valid list of medicines are required.',
      ]);
    }

    const prescription = await Prescription.create({
      patientId,
      doctorId: doctor._id,
      consultationId: consultationId || null,
      hospitalId: hospitalId || doctor.hospitalId || null,
      pharmacyId: pharmacyId || null,
      medicines,
      diagnosis: diagnosis || '',
      advice: advice || '',
      notes: notes || '',
      isHospitalPharmacy: Boolean(isHospitalPharmacy || doctor.hospitalId),
      hospitalPharmacyStatus: 'Pending',
      status: 'Active',
    });

    // Also create a Medical Record entry for this prescription
    const patient = await Patient.findById(patientId);
    if (patient) {
      await MedicalRecord.create({
        patientId: patient._id,
        doctorId: doctor._id,
        hospitalId: doctor.hospitalId || null,
        recordType: 'Prescription',
        title: `Prescription by Dr. ${doctor.name}`,
        description: diagnosis ? `Diagnosis: ${diagnosis}` : 'Doctor Prescription',
        doctorName: doctor.name,
        hospitalName: doctor.hospitalName || '',
        date: new Date(),
      });

      // Send notification to patient
      await createNotification({
        userId: patient.userId,
        recipientRole: 'Patient',
        title: 'New Prescription Issued',
        message: `Dr. ${doctor.name} has created a new prescription for you.`,
        type: 'Prescription',
        metadata: { prescriptionId: prescription._id },
      });
    }

    return sendSuccess(res, 'Prescription created successfully.', prescription, 201);
  } catch (error) {
    return sendServerError(res, 'Failed to create prescription.', error);
  }
};

// @desc    Update prescription
// @route   PUT /api/prescriptions/:id
// @access  Private (Doctor)
const updatePrescription = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return sendNotFound(res, 'Doctor profile not found.');
    }

    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return sendNotFound(res, 'Prescription not found.');
    }

    if (String(prescription.doctorId) !== String(doctor._id)) {
      return sendForbidden(res, 'You are not authorized to edit this prescription.');
    }

    const { medicines, diagnosis, advice, notes, status } = req.body;

    if (medicines) prescription.medicines = medicines;
    if (diagnosis !== undefined) prescription.diagnosis = diagnosis;
    if (advice !== undefined) prescription.advice = advice;
    if (notes !== undefined) prescription.notes = notes;
    if (status !== undefined) prescription.status = status;

    await prescription.save();

    return sendSuccess(res, 'Prescription updated successfully.', prescription);
  } catch (error) {
    return sendServerError(res, 'Failed to update prescription.', error);
  }
};

// @desc    Get doctor's prescriptions
// @route   GET /api/doctor/prescriptions
// @access  Private (Doctor)
const getPrescriptions = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return sendNotFound(res, 'Doctor profile not found.');
    }

    const prescriptions = await Prescription.find({ doctorId: doctor._id })
      .populate('patientId', 'name phone email gender bloodGroup dob')
      .populate('hospitalId', 'name city')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Doctor prescriptions fetched successfully.', prescriptions);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch prescriptions.', error);
  }
};

// @desc    Get single prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private (Doctor)
const getPrescriptionById = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return sendNotFound(res, 'Doctor profile not found.');
    }

    const { id } = req.params;
    let prescription = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      prescription = await Prescription.findOne({
        _id: id,
        doctorId: doctor._id,
      })
        .populate('patientId')
        .populate('doctorId')
        .populate('hospitalId')
        .populate('consultationId');
    }
    if (!prescription) {
      prescription = await Prescription.findOne({
        prescriptionId: id,
        doctorId: doctor._id,
      })
        .populate('patientId')
        .populate('doctorId')
        .populate('hospitalId')
        .populate('consultationId');
    }

    if (!prescription) {
      return sendNotFound(res, 'Prescription not found or not authorized.');
    }

    const pat = prescription.patientId || {};
    let age = "Not Provided";
    if (pat.dob) {
      const diff = Math.floor((new Date() - new Date(pat.dob)) / (365.25 * 24 * 3600 * 1000));
      if (!isNaN(diff) && diff >= 0) age = diff;
    }

    // Look for linked consultation or appointment
    let consultationType = "In-Person";
    let symptoms = [];
    if (prescription.consultationId) {
      consultationType = "Video";
      symptoms = prescription.consultationId.symptoms || [];
    } else {
      const linkedConsultation = await Consultation.findOne({ patientId: pat._id, doctorId: doctor._id }).sort({ createdAt: -1 });
      if (linkedConsultation) {
        consultationType = linkedConsultation.meetingLink ? "Video" : "In-Person";
        symptoms = linkedConsultation.symptoms || [];
      }
    }

    // Look for follow-up appointment
    const upcomingAppt = await Appointment.findOne({
      doctorId: doctor._id,
      patientId: pat._id,
      status: { $in: ['Scheduled', 'Confirmed', 'Pending'] },
      date: { $gte: new Date() },
    }).sort({ date: 1 });

    const followUpDate = upcomingAppt && upcomingAppt.date
      ? new Date(upcomingAppt.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : "As advised by physician";

    const formatted = {
      _id: prescription._id,
      id: prescription._id,
      rxId: prescription.prescriptionId || `RX-${prescription._id.toString().slice(-4).toUpperCase()}`,
      status: (prescription.status || 'Active').toLowerCase() === 'active' ? 'sent' : (prescription.status || 'sent').toLowerCase(),
      rawStatus: prescription.status || 'Active',
      date: new Date(prescription.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      consultationType,
      patient: {
        id: pat.patientId || `PT-${pat._id ? pat._id.toString().slice(-4).toUpperCase() : '1000'}`,
        name: pat.name || 'Patient',
        age,
        gender: pat.gender || 'Not Provided',
        bloodGroup: pat.bloodGroup || 'Not Provided',
        phone: pat.phone || 'Not Provided',
        email: pat.email || 'Not Provided',
      },
      doctor: {
        name: doctor.name ? `Dr. ${doctor.name.replace(/^Dr\.\s*/i, '')}` : 'Doctor',
        specialization: doctor.specialization || 'General Physician',
        type: doctor.practiceType || 'Hospital',
        hospital: doctor.hospitalName || 'MedicoBridge Hospital',
        clinicName: doctor.clinicName || 'HeartCare Clinic',
        clinicAddress: doctor.clinicAddress || doctor.city || 'Kerala, India',
        regNo: doctor.medRegNumber || doctor.doctorId || 'MCI-KL-20849',
      },
      diagnosis: prescription.diagnosis || 'General Consultation',
      symptoms,
      medicines: (prescription.medicines || []).map((m) => ({
        name: m.name,
        strength: m.dosage || 'Standard',
        dosage: m.dosage || '1 Tablet',
        frequency: m.frequency || 'Twice daily',
        duration: m.duration || '5 days',
        instruction: m.instructions || m.timing || 'Take after meals',
      })),
      advice: prescription.advice || 'Follow medication schedule and maintain healthy lifestyle.',
      followUpDate,
    };

    return sendSuccess(res, 'Prescription details fetched successfully.', formatted);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch prescription details.', error);
  }
};

// @desc    Send prescription to patient (notify patient)
// @route   POST /api/prescriptions/:id/send
// @access  Private (Doctor)
const sendPrescriptionToPatient = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return sendNotFound(res, 'Doctor profile not found.');
    }

    const { id } = req.params;
    let prescription = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      prescription = await Prescription.findOne({ _id: id, doctorId: doctor._id });
    }
    if (!prescription) {
      prescription = await Prescription.findOne({ prescriptionId: id, doctorId: doctor._id });
    }

    if (!prescription) {
      return sendNotFound(res, 'Prescription not found or not authorized.');
    }

    prescription.status = 'Active';
    await prescription.save();

    const patient = await Patient.findById(prescription.patientId);
    if (patient && patient.userId) {
      const { createNotification } = require('../services/notificationService');
      await createNotification({
        userId: patient.userId,
        recipientRole: 'Patient',
        title: 'Prescription Issued',
        message: `Dr. ${doctor.name} has sent your digital prescription ${prescription.prescriptionId || ''}.`,
        type: 'Prescription',
        link: '/patient/prescriptions',
        metadata: { prescriptionId: prescription._id },
      });
    }

    return sendSuccess(res, 'Prescription sent to patient successfully.', prescription);
  } catch (error) {
    return sendServerError(res, 'Failed to send prescription.', error);
  }
};

// @desc    Get patients under doctor with blood group / search filters
// @route   GET /api/doctor/patients
// @access  Private (Doctor)
const getDoctorPatients = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return sendNotFound(res, 'Doctor profile not found.');
    }

    const { bloodGroup, search, status } = req.query;

    // Find all unique patient IDs from appointments, consultations, prescriptions, and medical records
    const [appointments, consultations, prescriptions, medRecords] = await Promise.all([
      Appointment.find({ doctorId: doctor._id }).select('patientId'),
      Consultation.find({ doctorId: doctor._id }).select('patientId'),
      Prescription.find({ doctorId: doctor._id }).select('patientId'),
      MedicalRecord.find({ doctorId: { $in: [doctor._id, req.user._id] } }).select('patientId'),
    ]);

    const patientIds = [...new Set([
      ...appointments.map((a) => String(a.patientId)),
      ...consultations.map((c) => String(c.patientId)),
      ...prescriptions.map((p) => String(p.patientId)),
      ...medRecords.map((m) => String(m.patientId)),
    ].filter(Boolean))];

    const patientQuery = { _id: { $in: patientIds } };

    if (bloodGroup && bloodGroup !== 'All Blood Groups' && bloodGroup !== 'All') {
      patientQuery.bloodGroup = bloodGroup;
    }
    if (status && status !== 'All Statuses' && status !== 'All') {
      patientQuery.status = status;
    }
    if (search && search.trim()) {
      const q = search.trim();
      patientQuery.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { patientId: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } },
      ];
    }

    const patients = await Patient.find(patientQuery).sort({ name: 1 });

    const mappedPatients = patients.map((p) => {
      let age = "Not Provided";
      if (p.dob) {
        const diff = Math.floor((new Date() - new Date(p.dob)) / (365.25 * 24 * 3600 * 1000));
        if (!isNaN(diff) && diff >= 0) age = diff;
      }
      return {
        _id: p._id,
        id: p.patientId || `PAT-${String(p._id).slice(-5).toUpperCase()}`,
        patientId: p.patientId || `PAT-${String(p._id).slice(-5).toUpperCase()}`,
        name: p.name,
        age,
        gender: p.gender || "Not Provided",
        bloodGroup: p.bloodGroup || "Not Provided",
        city: p.city || "",
        isDonorAvailable: Boolean(p.isDonorAvailable),
        phone: p.phone || "Not Provided",
        email: p.email || "Not Provided",
      };
    });

    const doctorCity = doctor.city || doctor.clinicCity || doctor.branchLocation || 'Kozhikode';

    return sendSuccess(res, 'Doctor patients fetched successfully.', {
      patients: mappedPatients,
      doctorCity,
      doctorName: doctor.name,
    });
  } catch (error) {
    return sendServerError(res, 'Failed to fetch doctor patients.', error);
  }
};

// @desc    Get single patient details by ID for authenticated doctor
// @route   GET /api/doctor/patients/:id
// @access  Private (Doctor)
const getDoctorPatientById = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return sendNotFound(res, 'Doctor profile not found.');
    }

    const { id } = req.params;
    let patient = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      patient = await Patient.findById(id);
    }
    if (!patient) {
      const cleanId = id.replace(/^#/, '');
      patient = await Patient.findOne({ patientId: cleanId });
    }
    if (!patient) {
      return sendNotFound(res, 'Patient not found.');
    }

    // Verify authorization: patient must belong to this doctor
    const [hasAppt, hasConsult, hasPresc, hasRec] = await Promise.all([
      Appointment.exists({ doctorId: doctor._id, patientId: patient._id }),
      Consultation.exists({ doctorId: doctor._id, patientId: patient._id }),
      Prescription.exists({ doctorId: doctor._id, patientId: patient._id }),
      MedicalRecord.exists({ doctorId: { $in: [doctor._id, req.user._id] }, patientId: patient._id }),
    ]);

    if (!hasAppt && !hasConsult && !hasPresc && !hasRec) {
      return sendForbidden(res, 'Access denied. You are not authorized to view this patient.');
    }

    // Fetch real appointments
    const appointments = await Appointment.find({ doctorId: doctor._id, patientId: patient._id }).sort({ date: -1, createdAt: -1 });

    const now = new Date();
    const upcoming = appointments.find((a) => {
      const isFutureOrActive = a.status === 'Scheduled' || a.status === 'Confirmed' || a.status === 'Pending';
      return isFutureOrActive && (!a.date || new Date(a.date) >= now);
    }) || appointments.find((a) => a.status === 'Scheduled' || a.status === 'Confirmed') || null;

    const lastVisitAppt = appointments.find((a) => a.status === 'Completed' || (a.date && new Date(a.date) < now)) || appointments[0] || null;

    // Fetch real prescriptions
    const prescriptions = await Prescription.find({ doctorId: doctor._id, patientId: patient._id }).sort({ createdAt: -1 });

    // Fetch real medical records & consultations
    const [medicalRecords, consultations] = await Promise.all([
      MedicalRecord.find({ patientId: patient._id, doctorId: { $in: [doctor._id, req.user._id] } }).sort({ date: -1, createdAt: -1 }),
      Consultation.find({ patientId: patient._id, doctorId: doctor._id }).sort({ createdAt: -1 }),
    ]);

    let historySummary = "";
    if (consultations.length > 0) {
      const firstC = consultations[0];
      historySummary = `Consultation on ${new Date(firstC.startedAt || firstC.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}: Diagnosis: ${firstC.diagnosis || 'Clinical evaluation'}. Advice/Notes: ${firstC.notes || firstC.advice || 'Routine consultation conducted.'}`;
    } else if (medicalRecords.length > 0) {
      historySummary = medicalRecords.map(m => `${m.title || m.recordType}: ${m.description || 'Recorded in clinical database.'}`).join('; ');
    } else if (patient.chronicConditions && patient.chronicConditions.length > 0) {
      historySummary = `Patient has documented chronic conditions: ${patient.chronicConditions.join(', ')}.`;
    } else {
      historySummary = "No prior clinical history recorded in database.";
    }

    const activePrescriptions = prescriptions.filter(p => (p.status || '').toLowerCase() === 'active');
    const currentMedications = [];
    (activePrescriptions.length > 0 ? activePrescriptions : prescriptions.slice(0, 1)).forEach(p => {
      (p.medicines || []).forEach(m => {
        currentMedications.push({
          name: `${m.name} ${m.dosage || ''}`.trim(),
          frequency: m.frequency || 'Regular',
          since: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        });
      });
    });

    const mappedPrescriptions = prescriptions.slice(0, 5).map(p => ({
      id: p.prescriptionId || `RX-${p._id.toString().slice(-4).toUpperCase()}`,
      _id: p._id,
      date: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      diagnosis: p.diagnosis || 'General Prescription',
      medications: (p.medicines || []).map(m => `${m.name} ${m.dosage || ''}`.trim()),
      status: (p.status || 'active').toLowerCase(),
    }));

    let upcomingObj = null;
    if (upcoming) {
      upcomingObj = {
        id: upcoming._id,
        date: upcoming.date ? new Date(upcoming.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Scheduled',
        time: upcoming.time || '10:00 AM',
        type: upcoming.type || 'In-Person',
        reason: upcoming.reason || upcoming.complaint || upcoming.notes || 'Routine Consultation',
      };
    }

    const lastVisit = lastVisitAppt ? (lastVisitAppt.date ? new Date(lastVisitAppt.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : new Date(lastVisitAppt.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })) : "No prior visits";

    let age = "Not Provided";
    if (patient.dob) {
      const birth = new Date(patient.dob);
      const ageDiff = Math.floor((new Date() - birth) / (365.25 * 24 * 3600 * 1000));
      if (!isNaN(ageDiff) && ageDiff >= 0) age = ageDiff;
    }

    const ec = patient.emergencyContact && (patient.emergencyContact.name || patient.emergencyContact.phone) ? {
      name: patient.emergencyContact.name || "Emergency Contact",
      relation: patient.emergencyContact.relation || "Contact",
      phone: patient.emergencyContact.phone || "Not Provided",
    } : null;

    return sendSuccess(res, 'Patient details fetched successfully.', {
      id: patient.patientId || `PAT-${String(patient._id).slice(-5).toUpperCase()}`,
      _id: patient._id,
      name: patient.name,
      age,
      gender: patient.gender || "Not Provided",
      bloodGroup: patient.bloodGroup || "Not Provided",
      phone: patient.phone || "Not Provided",
      email: patient.email || "Not Provided",
      address: patient.address || (patient.city ? `${patient.city}, India` : "Not Provided"),
      emergencyContact: ec,
      height: patient.height ? `${patient.height} cm` : "Not Provided",
      weight: patient.weight ? `${patient.weight} kg` : "Not Provided",
      bmi: patient.bmi ? String(patient.bmi) : "Not Provided",
      allergies: patient.allergies && patient.allergies.length > 0 ? patient.allergies : [],
      medicalConditions: patient.chronicConditions && patient.chronicConditions.length > 0 ? patient.chronicConditions : [],
      currentMedications,
      lastVisit,
      upcomingAppointment: upcomingObj,
      medicalHistorySummary: historySummary,
      recentPrescriptions: mappedPrescriptions,
      activeAppointmentId: upcoming ? upcoming._id : (appointments[0] ? appointments[0]._id : null),
    });
  } catch (error) {
    return sendServerError(res, 'Failed to fetch patient details.', error);
  }
};

// @desc    Get single doctor appointment details by ID
// @route   GET /api/doctor/appointments/:id
// @access  Private (Doctor)
const getAppointmentById = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id })
      .populate('hospitalId', 'name city address');
    if (!doctor) {
      return sendNotFound(res, 'Doctor profile not found.');
    }

    const { id } = req.params;
    let appointment = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      appointment = await Appointment.findOne({ _id: id, doctorId: doctor._id })
        .populate('patientId', 'name patientId phone email gender dob allergies chronicConditions bloodGroup')
        .populate('hospitalId', 'name city address');
    }
    if (!appointment) {
      appointment = await Appointment.findOne({ appointmentId: id, doctorId: doctor._id })
        .populate('patientId', 'name patientId phone email gender dob allergies chronicConditions bloodGroup')
        .populate('hospitalId', 'name city address');
    }

    if (!appointment) {
      return sendNotFound(res, 'Appointment not found or not authorized.');
    }

    // Lookup linked consultation and prescription
    const [consultation, prescription] = await Promise.all([
      Consultation.findOne({ appointmentId: appointment._id }),
      Prescription.findOne({
        $or: [
          { consultationId: appointment._id },
          { patientId: appointment.patientId?._id, doctorId: doctor._id },
        ],
      }).sort({ createdAt: -1 }),
    ]);

    const apptObj = appointment.toObject();
    if (consultation) {
      apptObj.consultation = consultation;
      apptObj.meetingLink = consultation.meetingLink;
    }
    if (prescription) {
      apptObj.prescriptionId = prescription._id;
    }

    return sendSuccess(res, 'Appointment details fetched successfully.', {
      appointment: apptObj,
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        practiceType: doctor.practiceType,
        hospitalName: doctor.hospitalName || (doctor.hospitalId && doctor.hospitalId.name) || '',
        clinicName: doctor.clinicName || '',
      },
    });
  } catch (error) {
    return sendServerError(res, 'Failed to fetch appointment details.', error);
  }
};

// @desc    Get patient medical history for doctor
// @route   GET /api/doctor/patients/:id/medical-history
// @access  Private (Doctor)
const getPatientMedicalHistory = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return sendNotFound(res, 'Doctor profile not found.');
    }

    const { id } = req.params;
    let patient = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      patient = await Patient.findById(id);
    }
    if (!patient) {
      const cleanId = id.replace(/^#/, '');
      patient = await Patient.findOne({ patientId: cleanId });
    }
    if (!patient) {
      return sendNotFound(res, 'Patient not found.');
    }

    // Verify doctor is authorized to view this patient's records
    const hasAuthorizedRelationship = await Appointment.exists({
      doctorId: doctor._id,
      patientId: patient._id,
    });
    if (!hasAuthorizedRelationship) {
      const hasOtherRecord = await MedicalRecord.exists({
        doctorId: doctor._id,
        patientId: patient._id,
      });
      if (!hasOtherRecord) {
        return sendForbidden(res, 'You are not authorized to view this patient medical history.');
      }
    }

    // Fetch consultations, prescriptions, lab reports, medical records
    const [consultations, prescriptions, labReports, medicalRecords] = await Promise.all([
      Consultation.find({ patientId: patient._id })
        .populate('doctorId', 'name specialization')
        .populate('hospitalId', 'name')
        .sort({ createdAt: -1 }),
      Prescription.find({ patientId: patient._id })
        .populate('doctorId', 'name specialization')
        .populate('hospitalId', 'name')
        .sort({ createdAt: -1 }),
      LabReport.find({ patientId: patient._id })
        .populate('doctorId', 'name specialization')
        .populate('hospitalId', 'name')
        .sort({ createdAt: -1 }),
      MedicalRecord.find({ patientId: patient._id })
        .populate('doctorId', 'name specialization')
        .populate('hospitalId', 'name')
        .sort({ date: -1, createdAt: -1 }),
    ]);

    // Map consultations
    const mappedConsultations = consultations.map((c) => ({
      id: c.consultationId || `CON-${String(c._id).slice(-5).toUpperCase()}`,
      date: c.startedAt
        ? new Date(c.startedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : new Date(c.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      diagnosis: c.diagnosis || 'Clinical Consultation',
      doctor: c.doctorId?.name ? `Dr. ${c.doctorId.name}` : doctor.name ? `Dr. ${doctor.name}` : 'Doctor',
      specialization: c.doctorId?.specialization || doctor.specialization || 'General Physician',
      hospital: c.hospitalId?.name || doctor.hospitalName || doctor.clinicName || 'Clinic',
      symptoms: Array.isArray(c.symptoms) ? c.symptoms.join(', ') : c.symptoms || '',
      treatment: c.advice || '',
      notes: c.notes || '',
    }));

    // Map prescriptions
    const mappedPrescriptions = prescriptions.map((p) => ({
      id: p.prescriptionId || `RX-${String(p._id).slice(-5).toUpperCase()}`,
      _id: p._id,
      date: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      diagnosis: p.diagnosis || 'General Prescription',
      doctor: p.doctorId?.name ? `Dr. ${p.doctorId.name}` : doctor.name ? `Dr. ${doctor.name}` : 'Doctor',
      hospital: p.hospitalId?.name || doctor.hospitalName || doctor.clinicName || 'Hospital/Clinic',
      medicines: (p.medicines || []).map((m) => ({
        name: m.name || '',
        dosage: m.dosage || '',
        duration: m.duration || '',
        instructions: m.instructions || m.timing || '',
      })),
      notes: p.advice || p.notes || '',
    }));

    // Map lab reports
    const mappedLabReports = labReports.map((l) => ({
      id: l.reportId || `LAB-${String(l._id).slice(-5).toUpperCase()}`,
      test: l.testName || 'Lab Test',
      date: new Date(l.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      orderedBy: l.doctorId?.name ? `Dr. ${l.doctorId.name}` : 'Doctor',
      hospital: l.hospitalId?.name || 'Diagnostic Lab',
      referenceId: l.reportId || `REF-${String(l._id).slice(-6).toUpperCase()}`,
      results: (l.results || []).map((r) => ({
        parameter: r.parameter || 'Test Parameter',
        value: r.value ? `${r.value} ${r.unit || ''}`.trim() : 'N/A',
        normalRange: r.referenceRange || 'Standard',
        flag: r.status || (l.isAbnormal ? 'Abnormal' : 'Normal'),
      })),
    }));

    // Map documents from medicalRecords where recordType is Document, Discharge Summary, or has attachments
    const docRecords = medicalRecords.filter(
      (m) =>
        m.recordType === 'Discharge Summary' ||
        m.recordType === 'General' ||
        (m.attachments && m.attachments.length > 0)
    );
    const mappedDocuments = docRecords.map((d) => ({
      id: `DOC-${String(d._id).slice(-5).toUpperCase()}`,
      title: d.title || 'Medical Document',
      type: d.recordType || 'Medical Report',
      date: new Date(d.date || d.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      uploadedBy: d.doctorName || (d.doctorId?.name ? `Dr. ${d.doctorId.name}` : 'Medical Staff'),
      hospital: d.hospitalName || (d.hospitalId?.name) || 'Hospital',
      fileSize: d.attachments?.length > 0 ? `${d.attachments.length} file(s)` : 'Standard PDF',
      description: d.description || 'Clinical document file on record.',
    }));

    return sendSuccess(res, 'Patient medical history fetched successfully.', {
      patientId: patient.patientId ? `#${patient.patientId}` : `#PT-${String(patient._id).slice(-5).toUpperCase()}`,
      patientName: patient.name,
      bloodGroup: patient.bloodGroup || 'Not Provided',
      medicalConditions:
        patient.chronicConditions && patient.chronicConditions.length > 0
          ? patient.chronicConditions
          : [],
      allergies: patient.allergies && patient.allergies.length > 0 ? patient.allergies : [],
      consultations: mappedConsultations,
      prescriptions: mappedPrescriptions,
      labReports: mappedLabReports,
      documents: mappedDocuments,
    });
  } catch (error) {
    return sendServerError(res, 'Failed to fetch patient medical history.', error);
  }
};

// @desc    Get all medical records accessible to the doctor
// @route   GET /api/doctor/medical-records
// @access  Private (Doctor)
const getDoctorMedicalRecords = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return sendNotFound(res, 'Doctor profile not found.');
    }

    // Get all patient IDs who have appointments with this doctor
    const appointments = await Appointment.find({ doctorId: doctor._id }).select('patientId');
    const patientIds = [...new Set(appointments.map((a) => String(a.patientId)).filter(Boolean))];

    const doctorIds = [doctor._id, req.user._id];
    const safeDoctorName = (doctor.name || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 1. Fetch MedicalRecord documents
    const medicalRecords = await MedicalRecord.find({
      $or: [
        { doctorId: { $in: doctorIds } },
        { patientId: { $in: patientIds } },
        ...(safeDoctorName ? [{ doctorName: new RegExp(safeDoctorName, 'i') }] : []),
      ],
    })
      .populate('patientId', 'name patientId bloodGroup gender')
      .populate('hospitalId', 'name city')
      .sort({ date: -1, createdAt: -1 });

    // 2. Fetch Consultations for this doctor
    const consultations = await Consultation.find({ doctorId: doctor._id })
      .populate('patientId', 'name patientId bloodGroup gender')
      .populate('hospitalId', 'name city')
      .sort({ createdAt: -1 });

    // 3. Fetch Prescriptions for this doctor
    const prescriptions = await Prescription.find({ doctorId: doctor._id })
      .populate('patientId', 'name patientId bloodGroup gender')
      .populate('hospitalId', 'name city')
      .sort({ createdAt: -1 });

    const normalizedRecords = [];
    const seenKeys = new Set();

    const getInitials = (name = '') => {
      const parts = name.trim().split(' ').filter(Boolean);
      if (!parts.length) return 'PT';
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const AVATAR_COLORS = ['#0d9488', '#7c3aed', '#0284c7', '#d97706', '#dc2626', '#059669', '#9333ea', '#e11d48'];
    const getColor = (str = '') => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
      return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
    };

    // Add explicit MedicalRecord items
    medicalRecords.forEach((mr) => {
      const p = mr.patientId || {};
      const pName = p.name || mr.patientName || 'Unknown Patient';
      const recId = mr._id.toString();
      seenKeys.add(recId);

      const d = mr.date || mr.createdAt || new Date();
      normalizedRecords.push({
        _id: recId,
        id: `MR-${recId.slice(-4).toUpperCase()}`,
        patient: pName,
        initials: getInitials(pName),
        avatarColor: getColor(pName),
        patientId: p.patientId ? `#${p.patientId}` : `#PT-${String(p._id || recId).slice(-4).toUpperCase()}`,
        diagnosis: mr.title || mr.description || 'General Medical Record',
        visitDate: new Date(d).toISOString().slice(0, 10),
        visitDateDisplay: new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        doctor: mr.doctorName || `Dr. ${doctor.name}`,
        department: doctor.specialization || 'General Practice',
        status: 'final',
        symptoms: mr.symptoms || [],
        consultationNotes: mr.description || '',
        prescriptions: [],
        labReports: mr.recordType === 'Lab Report' ? [{ test: mr.title, value: mr.description || 'Recorded', normalRange: '-', flag: 'Normal' }] : [],
        otherDocs: (mr.attachments || []).map((att, i) => ({
          name: typeof att === 'string' ? att.split('/').pop() || `Document-${i + 1}` : att.name || `Document-${i + 1}`,
          type: mr.recordType || 'Document',
          size: '1.2 MB',
          url: typeof att === 'string' ? att : att.url || '',
        })),
      });
    });

    // Add Consultations
    consultations.forEach((c) => {
      const p = c.patientId || {};
      const pName = p.name || 'Unknown Patient';
      const cId = c._id.toString();
      if (seenKeys.has(cId)) return;
      seenKeys.add(cId);

      const d = c.startedAt || c.createdAt || new Date();
      const statusMap = {
        'Completed': 'final',
        'In-Progress': 'pending',
        'Scheduled': 'pending',
        'Cancelled': 'cancelled',
      };

      normalizedRecords.push({
        _id: cId,
        id: c.consultationId || `CNS-${cId.slice(-4).toUpperCase()}`,
        patient: pName,
        initials: getInitials(pName),
        avatarColor: getColor(pName),
        patientId: p.patientId ? `#${p.patientId}` : `#PT-${String(p._id || cId).slice(-4).toUpperCase()}`,
        diagnosis: c.diagnosis || 'Clinical Consultation',
        visitDate: new Date(d).toISOString().slice(0, 10),
        visitDateDisplay: new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        doctor: `Dr. ${doctor.name}`,
        department: doctor.specialization || 'General Practice',
        status: statusMap[c.status] || 'pending',
        symptoms: Array.isArray(c.symptoms) ? c.symptoms : c.symptoms ? [c.symptoms] : [],
        consultationNotes: c.notes || c.advice || '',
        prescriptions: [],
        labReports: [],
        otherDocs: [],
      });
    });

    // Add Prescriptions
    prescriptions.forEach((pr) => {
      const p = pr.patientId || {};
      const pName = p.name || 'Unknown Patient';
      const prId = pr._id.toString();
      if (seenKeys.has(prId)) return;
      seenKeys.add(prId);

      const d = pr.createdAt || new Date();
      const statusMap = {
        'Active': 'final',
        'Completed': 'final',
        'Dispensed': 'final',
        'Cancelled': 'cancelled',
      };

      normalizedRecords.push({
        _id: prId,
        id: pr.prescriptionId || `RX-${prId.slice(-4).toUpperCase()}`,
        patient: pName,
        initials: getInitials(pName),
        avatarColor: getColor(pName),
        patientId: p.patientId ? `#${p.patientId}` : `#PT-${String(p._id || prId).slice(-4).toUpperCase()}`,
        diagnosis: pr.diagnosis || 'Prescription',
        visitDate: new Date(d).toISOString().slice(0, 10),
        visitDateDisplay: new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        doctor: `Dr. ${doctor.name}`,
        department: doctor.specialization || 'General Practice',
        status: statusMap[pr.status] || 'final',
        symptoms: [],
        consultationNotes: pr.advice || pr.notes || '',
        prescriptions: (pr.medicines || []).map((m) => ({
          name: m.name,
          dosage: m.dosage || '1 tablet',
          frequency: m.frequency || 'Twice daily',
          duration: m.duration || '5 days',
        })),
        labReports: [],
        otherDocs: [],
      });
    });

    // Link prescriptions to any record of the same patient if empty
    prescriptions.forEach((pr) => {
      const matched = normalizedRecords.find(
        (nr) => nr.patient === (pr.patientId?.name || '') && nr.prescriptions.length === 0
      );
      if (matched && pr.medicines && pr.medicines.length > 0) {
        matched.prescriptions = pr.medicines.map((m) => ({
          name: m.name,
          dosage: m.dosage || '1 tablet',
          frequency: m.frequency || 'Twice daily',
          duration: m.duration || '5 days',
        }));
      }
    });

    // Sort newest first
    normalizedRecords.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));

    return sendSuccess(res, 'Doctor medical records fetched successfully.', normalizedRecords);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch medical records.', error);
  }
};

// @desc    Get all reviews for logged-in doctor
// @route   GET /api/doctor/reviews
// @access  Private (Doctor)
const getDoctorReviews = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return sendNotFound(res, 'Doctor profile not found.');

    const reviews = await Review.find({ doctorId: doctor._id })
      .populate('patientId', 'name profileImage')
      .sort({ createdAt: -1 });

    // Derive consultation type for each review via the most recent appointment
    const AVATAR_COLORS = [
      '#0d9488', '#7c3aed', '#0284c7', '#d97706', '#dc2626',
      '#059669', '#9333ea', '#0369a1', '#be185d', '#b45309',
      '#047857', '#1d4ed8',
    ];

    const formatted = await Promise.all(reviews.map(async (r, idx) => {
      const pat = r.patientId || {};
      const name = r.patientName || pat.name || 'Patient';
      const words = name.trim().split(/\s+/);
      const initials = words.length >= 2
        ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
        : name.slice(0, 2).toUpperCase();

      // Try to find linked appointment to get consultation type
      let consultationType = 'In-Person';
      try {
        const appt = await Appointment.findOne({
          doctorId: doctor._id,
          patientId: r.patientId?._id || r.patientId,
        }).sort({ createdAt: -1 });
        if (appt) {
          consultationType = appt.type === 'Online' || appt.mode === 'Online' ||
            appt.consultationType === 'Online' || appt.isVideo ? 'Online' : 'Hospital';
        }
      } catch (_) { }

      return {
        id: r._id,
        patientName: name,
        initials,
        avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
        date: new Date(r.createdAt).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric',
        }),
        rating: r.rating,
        text: r.comment,
        consultationType,
      };
    }));

    return sendSuccess(res, 'Doctor reviews fetched successfully.', formatted);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch doctor reviews.', error);
  }
};
// @desc    Get doctor settings
// @route   GET /api/doctor/settings
// @access  Private (Doctor)
const getDoctorSettings = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      userId: req.user._id,
    });

    if (!doctor) {
      return sendNotFound(res, 'Doctor profile not found.');
    }

    let settings = await DoctorSettings.findOne({
      doctorId: doctor._id,
    });

    // Create only if settings do not already exist
    if (!settings) {
      settings = await DoctorSettings.create({
        doctorId: doctor._id,
      });
    }

    return sendSuccess(
      res,
      'Doctor settings fetched successfully.',
      {
        settings,
      }
    );
  } catch (error) {
    console.error('GET DOCTOR SETTINGS ERROR:', error);

    return sendServerError(
      res,
      'Failed to fetch doctor settings.',
      error
    );
  }
};


// @desc    Update doctor settings
// @route   PUT /api/doctor/settings
// @access  Private (Doctor)
const updateDoctorSettings = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      userId: req.user._id,
    });

    if (!doctor) {
      return sendNotFound(res, 'Doctor profile not found.');
    }

    const {
      notifications,
      privacy,
      language,
      theme,
      analytics,
    } = req.body;

    let settings = await DoctorSettings.findOne({
      doctorId: doctor._id,
    });

    if (!settings) {
      settings = new DoctorSettings({
        doctorId: doctor._id,
      });
    }

    if (notifications !== undefined) {
      if (notifications.appointmentReminders !== undefined) {
        settings.notifications.appointmentReminders =
          Boolean(notifications.appointmentReminders);
      }

      if (notifications.prescriptionUpdates !== undefined) {
        settings.notifications.prescriptionUpdates =
          Boolean(notifications.prescriptionUpdates);
      }

      if (notifications.labResults !== undefined) {
        settings.notifications.labResults =
          Boolean(notifications.labResults);
      }

      if (notifications.systemUpdates !== undefined) {
        settings.notifications.systemUpdates =
          Boolean(notifications.systemUpdates);
      }

      if (notifications.reminderTime !== undefined) {
        settings.notifications.reminderTime =
          String(notifications.reminderTime);
      }
    }

    if (privacy !== undefined) {
      if (privacy.profileVisibility !== undefined) {
        settings.privacy.profileVisibility =
          privacy.profileVisibility;
      }

      if (privacy.showOnlineStatus !== undefined) {
        settings.privacy.showOnlineStatus =
          Boolean(privacy.showOnlineStatus);
      }

      if (privacy.allowPatientMessages !== undefined) {
        settings.privacy.allowPatientMessages =
          Boolean(privacy.allowPatientMessages);
      }

      if (privacy.showContactInformation !== undefined) {
        settings.privacy.showContactInformation =
          Boolean(privacy.showContactInformation);
      }
    }

    if (language !== undefined) {
      settings.language = String(language);
    }

    if (theme !== undefined) {
      if (theme.mode !== undefined) {
        settings.theme.mode = theme.mode;
      }

      if (theme.accent !== undefined) {
        settings.theme.accent = String(theme.accent);
      }
    }

    if (analytics !== undefined) {
      if (analytics.enabled !== undefined) {
        settings.analytics.enabled =
          Boolean(analytics.enabled);
      }
    }

    await settings.save();

    return sendSuccess(
      res,
      'Doctor settings updated successfully.',
      settings
    );
  } catch (error) {
    return sendServerError(
      res,
      'Failed to update doctor settings.',
      error
    );
  }
};


// @desc    Change doctor password
// @route   PUT /api/doctor/change-password
// @access  Private (Doctor)
const changeDoctorPassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return sendNotFound(res, 'User account not found.');
    }

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return sendValidationError(
        res,
        'Validation failed',
        ['All password fields are required.']
      );
    }

    if (newPassword !== confirmPassword) {
      return sendValidationError(
        res,
        'Validation failed',
        ['New password and confirm password do not match.']
      );
    }

    if (newPassword.length < 6) {
      return sendValidationError(
        res,
        'Validation failed',
        ['New password must be at least 6 characters long.']
      );
    }

    const isCurrentPasswordValid =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!isCurrentPasswordValid) {
      return sendValidationError(
        res,
        'Validation failed',
        ['Current password is incorrect.']
      );
    }

    user.password = newPassword;

    await user.save();

    return sendSuccess(
      res,
      'Password changed successfully.'
    );
  } catch (error) {
    return sendServerError(
      res,
      'Failed to change password.',
      error
    );
  }
};
module.exports = {
  getProfile,
  updateProfile,
  getDashboard,
  getAppointments,
  updateAppointmentStatus,
  saveConsultation,
  getConsultations,
  createPrescription,
  updatePrescription,
  getPrescriptions,
  getPrescriptionById,
  sendPrescriptionToPatient,
  getDoctorPatients,
  getDoctorPatientById,
  getAppointmentById,
  getPatientMedicalHistory,
  getDoctorMedicalRecords,
  getDoctorReviews,

  // Doctor Settings
  getDoctorSettings,
  updateDoctorSettings,
  changeDoctorPassword,
};
