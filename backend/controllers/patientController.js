const Patient = require('../models/Patient');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const MedicalRecord = require('../models/MedicalRecord');
const LabReport = require('../models/LabReport');
const MedicalReport = require('../models/MedicalReport');
const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Consultation = require('../models/Consultation');
const Payment = require('../models/Payment');
const mongoose = require("mongoose");
const { createNotification } = require('../services/notificationService');
const {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendForbidden,
  sendServerError,
} = require('../utils/responseHandler');

const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3];
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

const getLocalDateString = (d) => {
  const dateObj = new Date(d);
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const parseDateString = (input) => {
  if (!input) return null;
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.trim())) {
    return input.trim();
  }
  const d = new Date(input);
  if (isNaN(d.getTime())) return null;
  return getLocalDateString(d);
};

// @desc    Get patient profile
// @route   GET /api/patient/profile
// @access  Private (Patient)
const getProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return sendNotFound(res, 'Patient profile not found.');
    }
    return sendSuccess(res, 'Patient profile fetched successfully.', patient);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch patient profile.', error);
  }
};

// @desc    Update patient profile
// @route   PUT /api/patient/profile
// @access  Private (Patient)
const updateProfile = async (req, res) => {
  try {
    console.log("=== UPDATE PATIENT PROFILE ===");
    console.log("REQ BODY:", req.body);
    console.log("REQ FILE:", req.file);
    console.log("USER ID:", req.user?._id);
    const {

      name,
      phone,
      dob,
      gender,
      bloodGroup,
      city,
      address,
      isDonorAvailable,
      emergencyContact,
      allergies,
      chronicConditions,
    } = req.body;

    const patient = await Patient.findOne({
      userId: req.user._id,
    });

    if (!patient) {
      return sendNotFound(res, "Patient profile not found.");
    }

    // Update only fields that were sent
    if (name !== undefined) {
      patient.name = name.trim();
    }

    if (phone !== undefined) {
      patient.phone = phone.trim();
    }

    if (dob !== undefined) {
      patient.dob = dob || null;
    }

    if (gender !== undefined) {
      patient.gender = gender;
    }

    if (bloodGroup !== undefined) {
      patient.bloodGroup = bloodGroup || null;
    }

    if (city !== undefined) {
      patient.city = city.trim();
    }

    if (address !== undefined) {
      patient.address = address.trim();
    }

    // Correctly convert FormData string to boolean
    if (isDonorAvailable !== undefined) {
      patient.isDonorAvailable =
        isDonorAvailable === true ||
        isDonorAvailable === "true";
    }

    // Emergency contact comes from FormData as JSON string
    if (emergencyContact !== undefined) {
      patient.emergencyContact =
        typeof emergencyContact === "string"
          ? JSON.parse(emergencyContact)
          : emergencyContact;
    }

    // Convert comma-separated values to arrays
    if (allergies !== undefined) {
      patient.allergies = allergies
        ? allergies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
        : [];
    }

    if (chronicConditions !== undefined) {
      patient.chronicConditions = chronicConditions
        ? chronicConditions
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
        : [];
    }

    // Save patient profile
    await patient.save();

    // Sync shared fields to User
    const user = await User.findById(req.user._id);

    if (user) {
      if (phone !== undefined) {
        user.phone = phone.trim();
      }

      if (city !== undefined) {
        user.city = city.trim();
      }

      if (bloodGroup !== undefined) {
        user.bloodGroup = bloodGroup || null;
      }

      if (isDonorAvailable !== undefined) {
        user.isDonorAvailable =
          isDonorAvailable === true ||
          isDonorAvailable === "true";
      }

      await user.save({ validateBeforeSave: false });
    }

    return sendSuccess(
      res,
      "Patient profile updated successfully.",
      patient
    );
  } catch (error) {
    console.error("UPDATE PATIENT PROFILE ERROR:", error);

    return sendServerError(
      res,
      "Failed to update patient profile.",
      error
    );
  }
};

// @desc    Search doctors/hospitals
// @route   GET /api/patient/doctors
// @access  Public / Patient
const searchDoctors = async (req, res) => {
  try {
    const { search, specialization, city, hospitalId } = req.query;
    const query = { status: 'verified', accountStatus: 'active' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }
    if (specialization && specialization !== 'All') {
      query.specialization = { $regex: specialization, $options: 'i' };
    }
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    if (hospitalId) {
      query.hospitalId = hospitalId;
    }

    const doctors = await Doctor.find(query).populate('hospitalId', 'name city address');
    const sanitizedDoctors = doctors.map((doc) => {
      const d = doc.toObject ? doc.toObject() : { ...doc };
      if (Array.isArray(d.availableSlots)) {
        d.availableSlots = d.availableSlots.filter((s) => s && s.isAvailable !== false);
      }
      return d;
    });
    return sendSuccess(res, 'Doctors fetched successfully.', sanitizedDoctors);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch doctors.', error);
  }
};

// @desc    Book an appointment
// @route   POST /api/appointments/book or POST /api/patient/appointments/book
// @access  Private (Patient)
const bookAppointment = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return sendNotFound(res, 'Patient profile not found.');
    }

    const { doctorId, hospitalId, department, date, timeSlot, type, reason, symptoms, notes } = req.body;

    if (!doctorId || !date || !timeSlot) {
      return sendValidationError(res, 'Validation failed', [
        'Doctor, date, and time slot are required.',
      ]);
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return sendValidationError(res, 'Validation failed', ['Invalid doctor ID provided.']);
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return sendNotFound(res, 'Doctor not found.');
    }

    // Verify doctor verification and account status
    if (doctor.status !== 'verified' || doctor.accountStatus !== 'active') {
      return sendValidationError(res, 'Validation failed', [
        'Doctor is not currently available for appointments.',
      ]);
    }

    // Validate date format
    const dateStr = parseDateString(date);
    if (!dateStr) {
      return sendValidationError(res, 'Validation failed', ['Invalid date format provided.']);
    }

    const todayStr = getLocalDateString(new Date());
    if (dateStr < todayStr) {
      return sendValidationError(res, 'Validation failed', [
        'Appointments cannot be booked for past dates.',
      ]);
    }

    const now = new Date();
    if (dateStr === todayStr) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const slotMinutes = timeToMinutes(timeSlot);
      if (slotMinutes <= currentMinutes) {
        return sendValidationError(res, 'Validation failed', [
          'This time slot has already passed for today.',
        ]);
      }
    }

    // Validate day of week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const requestedDateObj = new Date(`${dateStr}T12:00:00Z`);
    const dayName = dayNames[requestedDateObj.getUTCDay()];

    const availableDays = Array.isArray(doctor.availableDays) ? doctor.availableDays : [];
    if (!availableDays.includes(dayName)) {
      return sendValidationError(res, 'Validation failed', [
        `Doctor is not available on ${dayName}s.`,
      ]);
    }

    // Validate time slot against doctor's available slots
    const cleanSlot = String(timeSlot).trim().toUpperCase();
    const availableSlots = Array.isArray(doctor.availableSlots) ? doctor.availableSlots : [];
    const matchingSlot = availableSlots.find((s) => {
      if (!s || s.day !== dayName || s.isAvailable === false) return false;
      const sStart = (s.startTime || '').trim().toUpperCase();
      const sEnd = (s.endTime || '').trim().toUpperCase();
      const sRange = `${sStart} - ${sEnd}`;
      return sStart === cleanSlot || sEnd === cleanSlot || sRange === cleanSlot || (s.time && s.time.trim().toUpperCase() === cleanSlot);
    });

    if (!matchingSlot) {
      return sendValidationError(res, 'Validation failed', [
        'Selected time slot is not available for this doctor.',
      ]);
    }

    // Check for conflict: prevent duplicate active bookings for the same doctor, date, and slot
    const rangeStart = new Date(`${dateStr}T00:00:00.000Z`);
    rangeStart.setHours(rangeStart.getHours() - 14);
    const rangeEnd = new Date(`${dateStr}T23:59:59.999Z`);
    rangeEnd.setHours(rangeEnd.getHours() + 14);

    const activeAppointments = await Appointment.find({
      doctorId: doctor._id,
      date: { $gte: rangeStart, $lte: rangeEnd },
      timeSlot: timeSlot,
      status: { $nin: ['Cancelled', 'Rejected'] },
    });

    const isConflict = activeAppointments.some((a) => {
      const dStr = getLocalDateString(a.date);
      const isoStr = a.date.toISOString().split('T')[0];
      return dStr === dateStr || isoStr === dateStr;
    });

    if (isConflict) {
      return sendValidationError(res, 'Validation failed', [
        'This time slot is already booked. Please choose another slot.',
      ]);
    }

    // Consultation fee from doctor record only
    const consultationFee = doctor.consultationFee != null ? Number(doctor.consultationFee) : 500;
    const appointmentDate = new Date(`${dateStr}T00:00:00.000Z`);

    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      hospitalId: hospitalId || doctor.hospitalId || null,
      department: department || doctor.department || doctor.specialization,
      date: appointmentDate,
      timeSlot,
      type: type || 'In-Person',
      status: 'Confirmed',
      reason: reason || '',
      symptoms: Array.isArray(symptoms) ? symptoms : symptoms ? [symptoms] : [],
      notes: notes || '',
      fee: consultationFee,
      paymentStatus: 'Pending',
    });

    // Send notifications
    await createNotification({
      userId: doctor.userId,
      recipientRole: 'Doctor',
      title: 'New Appointment Booked',
      message: `Patient ${patient.name} has booked an appointment for ${dateStr} at ${timeSlot}.`,
      type: 'Appointment',
      metadata: { appointmentId: appointment._id },
    });

    await createNotification({
      userId: req.user._id,
      recipientRole: 'Patient',
      title: 'Appointment Confirmed',
      message: `Your appointment with Dr. ${doctor.name} on ${dateStr} at ${timeSlot} is confirmed.`,
      type: 'Appointment',
      metadata: { appointmentId: appointment._id },
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctorId', 'name specialization profileImage consultationFee hospitalName clinicName practiceType city rating phone email availableDays availableSlots')
      .populate('hospitalId', 'name address city phone email')
      .populate('patientId', 'name phone email');

    return sendSuccess(res, 'Appointment booked successfully.', populatedAppointment, 201);
  } catch (error) {
    return sendServerError(res, 'Failed to book appointment.', error);
  }
};

// @desc    Get patient appointments
// @route   GET /api/patient/appointments
// @access  Private (Patient)
const getAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return sendNotFound(res, 'Patient profile not found.');
    }

    const appointments = await Appointment.find({ patientId: patient._id })
      .populate(
        'doctorId',
        'name specialization profileImage consultationFee hospitalName clinicName practiceType city rating phone email availableDays availableSlots'
      )
      .populate('hospitalId', 'name address city phone email')
      .sort({ date: -1, createdAt: -1 });

    return sendSuccess(res, 'Appointments fetched successfully.', appointments);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch appointments.', error);
  }
};

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id or DELETE /api/patient/appointments/:id
// @access  Private (Patient / Doctor)
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return sendNotFound(res, 'Appointment not found.');
    }

    // Authorization check
    if (req.user.role === 'Patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient || String(appointment.patientId) !== String(patient._id)) {
        return sendForbidden(res, 'You are not authorized to cancel this appointment.');
      }
      appointment.cancelledBy = 'Patient';
    } else if (req.user.role === 'Doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || String(appointment.doctorId) !== String(doctor._id)) {
        return sendForbidden(res, 'You are not authorized to cancel this appointment.');
      }
      appointment.cancelledBy = 'Doctor';
    } else if (req.user.role === 'Hospital') {
      const hospital = await Hospital.findOne({ userId: req.user._id });
      if (!hospital || String(appointment.hospitalId) !== String(hospital._id)) {
        return sendForbidden(res, 'You are not authorized to cancel this appointment.');
      }
      appointment.cancelledBy = 'Hospital';
    }

    if (appointment.status === 'Completed') {
      return sendValidationError(res, 'Validation failed', ['Completed appointments cannot be cancelled.']);
    }

    if (appointment.status === 'Cancelled') {
      return sendValidationError(res, 'Validation failed', ['Appointment is already cancelled.']);
    }

    appointment.status = 'Cancelled';
    appointment.cancellationReason = req.body.cancellationReason || 'Cancelled by user';
    await appointment.save();

    // Send notification
    if (appointment.cancelledBy === 'Patient') {
      const doctor = await Doctor.findById(appointment.doctorId);
      if (doctor) {
        await createNotification({
          userId: doctor.userId,
          recipientRole: 'Doctor',
          title: 'Appointment Cancelled',
          message: `Appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.timeSlot} has been cancelled by the patient.`,
          type: 'Appointment',
          metadata: { appointmentId: appointment._id },
        });
      }
    } else if (appointment.cancelledBy === 'Doctor') {
      const patient = await Patient.findById(appointment.patientId);
      if (patient) {
        await createNotification({
          userId: patient.userId,
          recipientRole: 'Patient',
          title: 'Appointment Cancelled',
          message: `Your appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.timeSlot} has been cancelled by the doctor.`,
          type: 'Appointment',
          metadata: { appointmentId: appointment._id },
        });
      }
    }

    return sendSuccess(res, 'Appointment cancelled successfully.', appointment);
  } catch (error) {
    return sendServerError(res, 'Failed to cancel appointment.', error);
  }
};

// @desc    Reschedule appointment
// @route   PUT /api/patient/appointments/:id/reschedule or PUT /api/appointments/:id/reschedule
// @access  Private (Patient)
const rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, timeSlot, reason } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return sendNotFound(res, 'Appointment not found.');
    }

    if (!date || !timeSlot) {
      return sendValidationError(res, 'Validation failed', [
        'Both new date and time slot are required for rescheduling.',
      ]);
    }

    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return sendNotFound(res, 'Patient profile not found.');
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return sendNotFound(res, 'Appointment not found.');
    }

    if (String(appointment.patientId) !== String(patient._id)) {
      return sendForbidden(res, 'You are not authorized to reschedule this appointment.');
    }

    if (appointment.status === 'Cancelled') {
      return sendValidationError(res, 'Validation failed', [
        'Cancelled appointments cannot be rescheduled.',
      ]);
    }
    if (appointment.status === 'Completed') {
      return sendValidationError(res, 'Validation failed', [
        'Completed appointments cannot be rescheduled.',
      ]);
    }

    const doctor = await Doctor.findById(appointment.doctorId);
    if (!doctor) {
      return sendNotFound(res, 'Doctor not found.');
    }

    if (doctor.status !== 'verified' || doctor.accountStatus !== 'active') {
      return sendValidationError(res, 'Validation failed', [
        'Doctor is not currently available for appointments.',
      ]);
    }

    const dateStr = parseDateString(date);
    if (!dateStr) {
      return sendValidationError(res, 'Validation failed', ['Invalid date format provided.']);
    }

    const todayStr = getLocalDateString(new Date());
    if (dateStr < todayStr) {
      return sendValidationError(res, 'Validation failed', [
        'Rescheduled date cannot be in the past.',
      ]);
    }

    if (dateStr === todayStr) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const slotMinutes = timeToMinutes(timeSlot);
      if (slotMinutes <= currentMinutes) {
        return sendValidationError(res, 'Validation failed', [
          'This time slot has already passed for today.',
        ]);
      }
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const requestedDateObj = new Date(`${dateStr}T12:00:00Z`);
    const dayName = dayNames[requestedDateObj.getUTCDay()];

    const availableDays = Array.isArray(doctor.availableDays) ? doctor.availableDays : [];
    if (!availableDays.includes(dayName)) {
      return sendValidationError(res, 'Validation failed', [
        `Doctor is not available on ${dayName}s.`,
      ]);
    }

    const cleanSlot = String(timeSlot).trim().toUpperCase();
    const availableSlots = Array.isArray(doctor.availableSlots) ? doctor.availableSlots : [];
    const matchingSlot = availableSlots.find((s) => {
      if (!s || s.day !== dayName || s.isAvailable === false) return false;
      const sStart = (s.startTime || '').trim().toUpperCase();
      const sEnd = (s.endTime || '').trim().toUpperCase();
      const sRange = `${sStart} - ${sEnd}`;
      return sStart === cleanSlot || sEnd === cleanSlot || sRange === cleanSlot || (s.time && s.time.trim().toUpperCase() === cleanSlot);
    });

    if (!matchingSlot) {
      return sendValidationError(res, 'Validation failed', [
        'Selected time slot is not available for this doctor.',
      ]);
    }

    // Check for conflict: prevent duplicate active bookings for the same doctor, date, and slot
    const rangeStart = new Date(`${dateStr}T00:00:00.000Z`);
    rangeStart.setHours(rangeStart.getHours() - 14);
    const rangeEnd = new Date(`${dateStr}T23:59:59.999Z`);
    rangeEnd.setHours(rangeEnd.getHours() + 14);

    const activeAppointments = await Appointment.find({
      _id: { $ne: appointment._id },
      doctorId: doctor._id,
      date: { $gte: rangeStart, $lte: rangeEnd },
      timeSlot: timeSlot,
      status: { $nin: ['Cancelled', 'Rejected'] },
    });

    const isConflict = activeAppointments.some((a) => {
      const dStr = getLocalDateString(a.date);
      const isoStr = a.date.toISOString().split('T')[0];
      return dStr === dateStr || isoStr === dateStr;
    });

    if (isConflict) {
      return sendValidationError(res, 'Validation failed', [
        'This time slot is already booked. Please choose another slot.',
      ]);
    }

    // Update appointment date & slot
    appointment.date = new Date(`${dateStr}T00:00:00.000Z`);
    appointment.timeSlot = timeSlot;
    appointment.status = 'Confirmed';
    if (reason) {
      appointment.reason = reason;
    }
    await appointment.save();

    // Send notifications
    await createNotification({
      userId: doctor.userId,
      recipientRole: 'Doctor',
      title: 'Appointment Rescheduled',
      message: `Appointment with Patient ${patient.name} has been rescheduled to ${dateStr} at ${timeSlot}.`,
      type: 'Appointment',
      metadata: { appointmentId: appointment._id },
    });

    await createNotification({
      userId: req.user._id,
      recipientRole: 'Patient',
      title: 'Appointment Rescheduled',
      message: `Your appointment with Dr. ${doctor.name} has been rescheduled to ${dateStr} at ${timeSlot}.`,
      type: 'Appointment',
      metadata: { appointmentId: appointment._id },
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctorId', 'name specialization profileImage consultationFee hospitalName clinicName practiceType city rating phone email availableDays availableSlots')
      .populate('hospitalId', 'name address city phone email')
      .populate('patientId', 'name phone email');

    return sendSuccess(res, 'Appointment rescheduled successfully.', populatedAppointment);
  } catch (error) {
    return sendServerError(res, 'Failed to reschedule appointment.', error);
  }
};

// @desc    Get booked slots for a doctor on a specific date
// @route   GET /api/patient/doctors/:id/booked-slots
// @access  Private (Patient) or Public
const getDoctorBookedSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return sendNotFound(res, 'Doctor not found.');
    }

    if (!date) {
      return sendValidationError(res, 'Validation failed', ['Date parameter is required.']);
    }

    const dateStr = parseDateString(date);
    if (!dateStr) {
      return sendValidationError(res, 'Validation failed', ['Invalid date format.']);
    }

    const rangeStart = new Date(`${dateStr}T00:00:00.000Z`);
    rangeStart.setHours(rangeStart.getHours() - 14);
    const rangeEnd = new Date(`${dateStr}T23:59:59.999Z`);
    rangeEnd.setHours(rangeEnd.getHours() + 14);

    const appointments = await Appointment.find({
      doctorId: id,
      date: { $gte: rangeStart, $lte: rangeEnd },
      status: { $nin: ['Cancelled', 'Rejected'] },
    }).select('timeSlot date');

    const bookedSlots = appointments
      .filter((a) => {
        const dStr = getLocalDateString(a.date);
        const isoStr = a.date.toISOString().split('T')[0];
        return dStr === dateStr || isoStr === dateStr;
      })
      .map((a) => a.timeSlot);

    return sendSuccess(res, 'Booked slots fetched successfully.', {
      doctorId: id,
      date: dateStr,
      bookedSlots,
    });
  } catch (error) {
    return sendServerError(res, 'Failed to fetch booked slots.', error);
  }
};

// @desc    Get patient medical records
// @route   GET /api/patient/medical-records
// @access  Private (Patient)
const getMedicalRecords = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return sendNotFound(res, 'Patient profile not found.');
    }

    const records = await MedicalRecord.find({ patientId: patient._id })
      .populate('doctorId', 'name specialization')
      .populate('hospitalId', 'name city')
      .sort({ date: -1 });

    return sendSuccess(res, 'Medical records fetched successfully.', records);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch medical records.', error);
  }
};

// @desc    Get patient prescriptions
// @route   GET /api/patient/prescriptions
// @access  Private (Patient)
const getPrescriptions = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return sendNotFound(res, 'Patient profile not found.');
    }

    const prescriptions = await Prescription.find({ patientId: patient._id })
      .populate('doctorId', 'name specialization hospitalName profileImage')
      .populate('hospitalId', 'name address')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Prescriptions fetched successfully.', prescriptions);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch prescriptions.', error);
  }
};

// @desc    Get patient lab reports
// @route   GET /api/patient/lab-reports
// @access  Private (Patient)
const getLabReports = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return sendNotFound(res, 'Patient profile not found.');
    }

    const reports = await LabReport.find({ patientId: patient._id })
      .populate('hospitalId', 'name city')
      .populate('doctorId', 'name specialization')
      .sort({ reportDate: -1 });

    return sendSuccess(res, 'Lab reports fetched successfully.', reports);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch lab reports.', error);
  }
};

// @desc    Get patient medical reports
// @route   GET /api/patient/medical-reports
// @access  Private (Patient)
const getMedicalReports = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return sendNotFound(res, 'Patient profile not found.');
    }

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

// @desc    Get patient invoices
// @route   GET /api/patient/invoices
// @access  Private (Patient)
const getInvoices = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return sendNotFound(res, 'Patient profile not found.');
    }

    const invoices = await Invoice.find({ patientId: patient._id })
      .populate('hospitalId', 'name address phone')
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Invoices fetched successfully.', invoices);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch invoices.', error);
  }
};

// @desc    Get patient orders
// @route   GET /api/patient/orders
// @access  Private (Patient)
const getOrders = async (req, res) => {
  try {
    let patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      patient = await Patient.findById(req.user._id);
    }

    const candidateIds = [req.user._id];
    if (patient) {
      candidateIds.push(patient._id);
      if (patient.userId) candidateIds.push(patient.userId);
    }

    const orders = await Order.find({
      $or: [
        { patientId: { $in: candidateIds } },
        { 'patientId._id': { $in: candidateIds } },
      ],
    })
      .populate('pharmacyId', 'name phone address city')
      .populate('patientId', 'name phone email address city')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Orders fetched successfully.', orders);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch orders.', error);
  }
};

// @desc    Search blood donors
// @route   GET /api/blood-donors/search
// @access  Public / Private
const searchBloodDonors = async (req, res) => {
  try {
    const { bloodGroup, originCity, search } = req.query;
    const query = { isDonorAvailable: true, isVerified: true, status: 'active' };

    if (bloodGroup && bloodGroup !== 'All Blood Groups' && bloodGroup !== 'All') {
      query.bloodGroup = bloodGroup;
    }
    if (originCity && originCity !== 'All') {
      query.city = { $regex: originCity, $options: 'i' };
    }

    const users = await User.find(query).select('email phone city bloodGroup isDonorAvailable role gender dob');

    // Attach patient or doctor names and compute age
    const donors = await Promise.all(
      users.map(async (u) => {
        let name = 'Anonymous Donor';
        let facility = '';
        if (u.role === 'Patient') {
          const pat = await Patient.findOne({ userId: u._id });
          if (pat) name = pat.name;
        } else if (u.role === 'Doctor') {
          const doc = await Doctor.findOne({ userId: u._id });
          if (doc) {
            name = doc.name;
            // Try to get hospital name for facility
            const Hospital = require('../models/Hospital');
            if (doc.hospitalId) {
              const hosp = await Hospital.findById(doc.hospitalId);
              if (hosp) facility = hosp.name;
            }
          }
        }

        // Compute age from dob
        let age = null;
        if (u.dob) {
          const birthDate = new Date(u.dob);
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
        }

        return {
          id: u._id,
          name,
          email: u.email,
          phone: u.phone || '',
          city: u.city || 'Unknown',
          bloodGroup: u.bloodGroup || 'O+',
          isDonorAvailable: u.isDonorAvailable,
          role: u.role,
          type: u.role === 'Doctor' ? 'Hospital Doctor' : 'Registered Patient',
          gender: u.gender || '',
          age: age,
          facility: facility || '',
        };
      })
    );

    // Apply text search if provided
    let filtered = donors;
    if (search) {
      const q = search.toLowerCase().trim();
      filtered = donors.filter(
        (d) => d.name.toLowerCase().includes(q) || d.city.toLowerCase().includes(q) || d.bloodGroup.toLowerCase().includes(q)
      );
    }

    return sendSuccess(res, 'Blood donors fetched successfully.', filtered);
  } catch (error) {
    return sendServerError(res, 'Failed to search blood donors.', error);
  }
};
// @desc    Get single doctor profile for patient
// @route   GET /api/patient/doctors/:id
// @access  Private (Patient)

// @desc    Get single doctor profile for patient
// @route   GET /api/patient/doctors/:id
// @access  Private (Patient)

const getPatientDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("=== GET PATIENT DOCTOR PROFILE ===");
    console.log("Doctor ID:", id);

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return sendNotFound(res, "Doctor not found.");
    }

    const doctor = await Doctor.findById(id)
      .populate(
        "hospitalId",
        "name city address phone email"
      )
      .lean();

    if (!doctor) {
      return sendNotFound(res, "Doctor not found.");
    }

    // Only expose patient-facing information.
    const hospitalName =
      doctor.hospitalName ||
      doctor.hospitalId?.name ||
      "";

    const city =
      doctor.city ||
      doctor.hospitalId?.city ||
      doctor.clinicCity ||
      doctor.branchLocation ||
      "";

    const address =
      doctor.address ||
      doctor.hospitalId?.address ||
      doctor.clinicAddress ||
      doctor.branchLocation ||
      "";

    const practiceType =
      String(doctor.practiceType || "hospital").toLowerCase();

    const doctorProfile = {
      _id: doctor._id,

      name:
        doctor.name ||
        "Doctor",

      specialization:
        doctor.specialization ||
        "General Physician",

      qualification:
        doctor.qualification ||
        "Not Provided",

      experience:
        Number(doctor.experience) || 0,

      phone:
        doctor.phone ||
        "",

      email:
        doctor.email ||
        "",

      gender:
        doctor.gender ||
        "Not Provided",

      profileImage:
        doctor.profileImage ||
        "",

      bloodGroup:
        doctor.bloodGroup ||
        null,

      practiceType,

      hospitalName,

      hospitalId:
        doctor.hospitalId?._id ||
        null,

      hospital: doctor.hospitalId
        ? {
          _id: doctor.hospitalId._id,
          name: doctor.hospitalId.name || "",
          city: doctor.hospitalId.city || "",
          address: doctor.hospitalId.address || "",
          phone: doctor.hospitalId.phone || "",
          email: doctor.hospitalId.email || "",
        }
        : null,

      clinicName:
        doctor.clinicName ||
        "",

      clinicAddress:
        doctor.clinicAddress ||
        "",

      clinicCity:
        doctor.clinicCity ||
        "",

      city,

      address,

      consultationFee:
        doctor.consultationFee != null
          ? Number(doctor.consultationFee)
          : 500,

      rating:
        Number(doctor.rating) || 0,

      reviews:
        Number(doctor.reviews) || 0,

      availableSlots:
        Array.isArray(doctor.availableSlots)
          ? doctor.availableSlots.filter((s) => s && s.isAvailable !== false)
          : [],

      availableDays:
        Array.isArray(doctor.availableDays) && doctor.availableDays.length > 0
          ? doctor.availableDays.filter((d) => {
              if (!Array.isArray(doctor.availableSlots) || doctor.availableSlots.length === 0) {
                return false;
              }
              return doctor.availableSlots.some(
                (s) => s && s.day === d && s.isAvailable !== false
              );
            })
          : Array.from(
              new Set(
                (doctor.availableSlots || [])
                  .filter((s) => s && s.day && s.isAvailable !== false)
                  .map((s) => s.day)
              )
            ),

      isDonorAvailable:
        Boolean(doctor.isDonorAvailable),

      status:
        doctor.status ||
        "verified",

      accountStatus:
        doctor.accountStatus ||
        "active",
    };

    return sendSuccess(
      res,
      "Doctor profile fetched successfully.",
      doctorProfile
    );

  } catch (error) {
    console.error(
      "GET PATIENT DOCTOR PROFILE ERROR:",
      error
    );

    return sendServerError(
      res,
      "Failed to fetch doctor profile.",
      error
    );
  }
};

// @desc    Submit feedback/rating for a completed appointment
// @route   POST /api/patient/appointments/:id/feedback
// @access  Private (Patient)
const submitAppointmentFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return sendNotFound(res, 'Appointment not found.');
    }

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return sendValidationError(res, 'Validation failed', [
        'Rating must be between 1 and 5.',
      ]);
    }

    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return sendNotFound(res, 'Patient profile not found.');
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return sendNotFound(res, 'Appointment not found.');
    }

    if (String(appointment.patientId) !== String(patient._id)) {
      return sendForbidden(res, 'You are not authorized to submit feedback for this appointment.');
    }

    if (appointment.status !== 'Completed') {
      return sendValidationError(res, 'Validation failed', [
        'Feedback can only be submitted for completed appointments.',
      ]);
    }

    if (appointment.rating != null) {
      return sendValidationError(res, 'Validation failed', [
        'Feedback has already been submitted for this appointment.',
      ]);
    }

    // Save feedback on the appointment
    appointment.rating = Number(rating);
    appointment.feedback = comment ? comment.trim() : '';
    await appointment.save();

    // Also create a Review record for the doctor
    const Review = require('../models/Review');
    try {
      await Review.create({
        patientId: patient._id,
        appointmentId: appointment._id,
        doctorId: appointment.doctorId,
        rating: Number(rating),
        comment: comment ? comment.trim() : 'Great experience',
        patientName: patient.name || '',
        isVerifiedPurchase: true,
      });
    } catch (reviewErr) {
      console.error('Failed to create review record:', reviewErr);
      // Non-fatal: feedback is already saved on appointment
    }

    // Update doctor average rating
    try {
      const doctor = await Doctor.findById(appointment.doctorId);
      if (doctor) {
        const allRated = await Appointment.find({
          doctorId: doctor._id,
          rating: { $ne: null },
        }).select('rating');
        if (allRated.length > 0) {
          const avg = allRated.reduce((sum, a) => sum + a.rating, 0) / allRated.length;
          doctor.rating = Number(avg.toFixed(1));
          await doctor.save();
        }
      }
    } catch (ratingErr) {
      console.error('Failed to update doctor rating:', ratingErr);
    }

    return sendSuccess(res, 'Feedback submitted successfully.', {
      appointmentId: appointment._id,
      rating: appointment.rating,
      feedback: appointment.feedback,
    });
  } catch (error) {
    return sendServerError(res, 'Failed to submit feedback.', error);
  }
};

// @desc    Get single appointment / consultation by ID for patient
// @route   GET /api/patient/appointments/:id or GET /api/patient/consultations/:id
// @access  Private (Patient)
const getAppointmentById = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return sendNotFound(res, 'Patient profile not found.');
    }

    const { id } = req.params;
    if (!id) {
      return sendValidationError(res, 'Appointment ID is required.');
    }

    let appointment = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      appointment = await Appointment.findById(id)
        .populate(
          'doctorId',
          'name specialization profileImage consultationFee hospitalName clinicName practiceType city rating phone email availableDays availableSlots'
        )
        .populate('hospitalId', 'name address city phone email')
        .populate('patientId', 'name patientId phone email gender dob bloodGroup city address');
    }

    if (!appointment) {
      appointment = await Appointment.findOne({ appointmentId: id })
        .populate(
          'doctorId',
          'name specialization profileImage consultationFee hospitalName clinicName practiceType city rating phone email availableDays availableSlots'
        )
        .populate('hospitalId', 'name address city phone email')
        .populate('patientId', 'name patientId phone email gender dob bloodGroup city address');
    }

    if (!appointment) {
      return sendNotFound(res, 'Appointment not found.');
    }

    // Verify ownership
    const apptPatientId = appointment.patientId?._id || appointment.patientId;
    if (String(apptPatientId) !== String(patient._id)) {
      return sendForbidden(res, 'You are not authorized to view this appointment.');
    }

    // Verify payment from Payment collection if appointment.paymentStatus is not Paid
    if (appointment.paymentStatus !== 'Paid') {
      const verifiedPayment = await Payment.findOne({
        appointmentId: appointment._id,
        paymentStatus: { $in: ['Completed', 'Paid'] },
      });
      if (verifiedPayment) {
        appointment.paymentStatus = 'Paid';
        await appointment.save();
      }
    }

    // Lookup linked consultation and prescription
    const [consultation, prescription] = await Promise.all([
      Consultation.findOne({ appointmentId: appointment._id })
        .populate('doctorId', 'name specialization')
        .populate('hospitalId', 'name city'),
      Prescription.findOne({
        $or: [
          { consultationId: appointment._id },
          { patientId: patient._id, doctorId: appointment.doctorId?._id || appointment.doctorId },
        ],
      })
        .populate('doctorId', 'name specialization profileImage')
        .sort({ createdAt: -1 }),
    ]);

    let resolvedPrescription = prescription;
    if (!resolvedPrescription && consultation) {
      resolvedPrescription = await Prescription.findOne({
        consultationId: consultation._id,
      })
        .populate('doctorId', 'name specialization profileImage')
        .sort({ createdAt: -1 });
    }

    const apptObj = appointment.toObject();
    if (consultation) {
      apptObj.consultation = consultation;
      apptObj.meetingLink = consultation.meetingLink || '';
      apptObj.startedAt = consultation.startedAt || null;
      apptObj.endedAt = consultation.endedAt || null;
    }
    if (resolvedPrescription) {
      apptObj.prescription = resolvedPrescription;
      apptObj.prescriptionId = resolvedPrescription._id;
    }

    return sendSuccess(res, 'Appointment details fetched successfully.', apptObj);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch appointment details.', error);
  }
};

// @desc    Change patient password
// @route   PUT /api/patient/password
// @access  Private (Patient)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return sendValidationError(res, 'Validation failed', ['Current password and new password are required.']);
    }
    if (newPassword.length < 6) {
      return sendValidationError(res, 'Validation failed', ['New password must be at least 6 characters long.']);
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return sendNotFound(res, 'User not found.');
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return sendValidationError(res, 'Invalid credentials', ['Incorrect current password.']);
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, 'Password changed successfully.');
  } catch (error) {
    return sendServerError(res, 'Failed to change password.', error);
  }
};

// @desc    Get single prescription by ID
// @route   GET /api/patient/prescriptions/:id
// @access  Private (Patient)
const getPrescriptionById = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return sendNotFound(res, 'Patient profile not found.');

    const { id } = req.params;
    let prescription = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      prescription = await Prescription.findOne({ _id: id, patientId: patient._id })
        .populate('doctorId', 'name specialization hospitalName profileImage phone email')
        .populate('hospitalId', 'name address city phone')
        .populate('patientId', 'name phone email gender dob');
    }
    if (!prescription && mongoose.Types.ObjectId.isValid(id)) {
      prescription = await Prescription.findOne({ appointmentId: id, patientId: patient._id })
        .populate('doctorId', 'name specialization hospitalName profileImage phone email')
        .populate('hospitalId', 'name address city phone')
        .populate('patientId', 'name phone email gender dob');
    }
    if (!prescription) {
      prescription = await Prescription.findOne({ prescriptionId: id, patientId: patient._id })
        .populate('doctorId', 'name specialization hospitalName profileImage phone email')
        .populate('hospitalId', 'name address city phone')
        .populate('patientId', 'name phone email gender dob');
    }

    if (!prescription) {
      return sendNotFound(res, 'Prescription not found.');
    }

    return sendSuccess(res, 'Prescription fetched successfully.', prescription);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch prescription.', error);
  }
};

// @desc    Get single medical record by ID
// @route   GET /api/patient/medical-records/:id
// @access  Private (Patient)
const getMedicalRecordById = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return sendNotFound(res, 'Patient profile not found.');

    const { id } = req.params;
    let record = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      record = await MedicalRecord.findOne({ _id: id, patientId: patient._id })
        .populate('doctorId', 'name specialization profileImage')
        .populate('hospitalId', 'name city address phone')
        .populate('patientId', 'name phone email gender dob');
    }

    if (!record) {
      return sendNotFound(res, 'Medical record not found.');
    }

    return sendSuccess(res, 'Medical record fetched successfully.', record);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch medical record.', error);
  }
};

// @desc    Get single lab report by ID
// @route   GET /api/patient/lab-reports/:id
// @access  Private (Patient)
const getLabReportById = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return sendNotFound(res, 'Patient profile not found.');

    const { id } = req.params;
    let report = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      report = await LabReport.findOne({ _id: id, patientId: patient._id })
        .populate('hospitalId', 'name city address phone')
        .populate('doctorId', 'name specialization')
        .populate('patientId', 'name phone email gender dob');
    }
    if (!report) {
      report = await LabReport.findOne({ reportId: id, patientId: patient._id })
        .populate('hospitalId', 'name city address phone')
        .populate('doctorId', 'name specialization')
        .populate('patientId', 'name phone email gender dob');
    }

    if (!report) {
      return sendNotFound(res, 'Lab report not found.');
    }

    return sendSuccess(res, 'Lab report fetched successfully.', report);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch lab report.', error);
  }
};

// @desc    Get single medical report by ID
// @route   GET /api/patient/medical-reports/:id
// @access  Private (Patient)
const getMedicalReportById = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return sendNotFound(res, 'Patient profile not found.');

    const { id } = req.params;
    let report = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      report = await MedicalReport.findOne({ _id: id, patientId: patient._id })
        .populate('hospitalId', 'name city address phone')
        .populate('doctorId', 'name specialization')
        .populate('patientId', 'name phone email gender dob');
    }
    if (!report) {
      report = await MedicalReport.findOne({ reportId: id, patientId: patient._id })
        .populate('hospitalId', 'name city address phone')
        .populate('doctorId', 'name specialization')
        .populate('patientId', 'name phone email gender dob');
    }

    if (!report) {
      return sendNotFound(res, 'Medical report not found.');
    }

    return sendSuccess(res, 'Medical report fetched successfully.', report);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch medical report.', error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/patient/orders/:id
// @access  Private (Patient)
const getOrderById = async (req, res) => {
  try {
    let patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      patient = await Patient.findById(req.user._id);
    }

    const candidateIds = [req.user._id];
    if (patient) {
      candidateIds.push(patient._id);
      if (patient.userId) candidateIds.push(patient.userId);
    }

    const { id } = req.params;
    let order = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findOne({
        _id: id,
        $or: [
          { patientId: { $in: candidateIds } },
          { 'patientId._id': { $in: candidateIds } },
        ],
      })
        .populate('pharmacyId', 'name phone address city')
        .populate('patientId', 'name phone email address city');
    }
    if (!order) {
      order = await Order.findOne({
        orderId: id,
        $or: [
          { patientId: { $in: candidateIds } },
          { 'patientId._id': { $in: candidateIds } },
        ],
      })
        .populate('pharmacyId', 'name phone address city')
        .populate('patientId', 'name phone email address city');
    }

    if (!order) {
      return sendNotFound(res, 'Order not found.');
    }

    return sendSuccess(res, 'Order fetched successfully.', order);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch order.', error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  searchDoctors,
  bookAppointment,
  getAppointments,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
  getDoctorBookedSlots,
  getMedicalRecords,
  getMedicalRecordById,
  getPrescriptions,
  getPrescriptionById,
  getLabReports,
  getLabReportById,
  getMedicalReports,
  getMedicalReportById,
  getInvoices,
  getOrders,
  getOrderById,
  searchBloodDonors,
  getPatientDoctorById,
  submitAppointmentFeedback,
};

