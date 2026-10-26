const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Bed = require('../models/Bed');
const Medicine = require('../models/Medicine');
const Prescription = require('../models/Prescription');
const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const HospitalSettings = require('../models/HospitalSettings');
const {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendForbidden,
  sendServerError,
} = require('../utils/responseHandler');

// @desc    Get hospital profile
// @route   GET /api/hospital/profile
// @access  Private (Hospital)
const getProfile = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) {
      return sendNotFound(res, 'Hospital profile not found.');
    }
    return sendSuccess(res, 'Hospital profile fetched successfully.', hospital);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch hospital profile.', error);
  }
};

// @desc    Update hospital profile
// @route   PUT /api/hospital/profile
// @access  Private (Hospital)
const updateProfile = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) {
      return sendNotFound(res, 'Hospital profile not found.');
    }

    const { name, phone, address, city, state, hospitalType, departments, emergencyContact, email } = req.body;

    if (name) hospital.name = name.trim();
    if (phone !== undefined) hospital.phone = phone.trim();
    if (address !== undefined) hospital.address = address.trim();
    if (city !== undefined) hospital.city = city.trim();
    if (state !== undefined) hospital.state = state.trim();
    if (hospitalType !== undefined) hospital.hospitalType = hospitalType;
    if (emergencyContact !== undefined) hospital.emergencyContact = emergencyContact;
    if (email !== undefined && email.trim()) {
      hospital.email = email.trim().toLowerCase();
      await User.findByIdAndUpdate(req.user._id, { email: email.trim().toLowerCase() });
    }
    if (departments) {
      hospital.departments = Array.isArray(departments) ? departments : [departments];
    }

    await hospital.save();

    return sendSuccess(res, 'Hospital profile updated successfully.', hospital);
  } catch (error) {
    return sendServerError(res, 'Failed to update hospital profile.', error);
  }
};

// @desc    Get hospital dashboard metrics
// @route   GET /api/hospital/dashboard
// @access  Private (Hospital)
const getDashboard = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) {
      return sendNotFound(res, 'Hospital profile not found.');
    }

    const totalDoctors = await Doctor.countDocuments({ hospitalId: hospital._id });
    const totalDepartments = await Department.countDocuments({ hospitalId: hospital._id });
    const totalAppointments = await Appointment.countDocuments({ hospitalId: hospital._id });
    const totalBeds = await Bed.countDocuments({ hospitalId: hospital._id });
    const availableBeds = await Bed.countDocuments({ hospitalId: hospital._id, status: 'Available' });
    const occupiedBeds = await Bed.countDocuments({ hospitalId: hospital._id, status: 'Occupied' });
    const reservedBeds = await Bed.countDocuments({ hospitalId: hospital._id, status: 'Reserved' });

    const totalPharmacyMedicines = await Medicine.countDocuments({
      hospitalId: hospital._id,
      isHospital: true,
    });

    const recentAppointments = await Appointment.find({ hospitalId: hospital._id })
      .populate('patientId', 'name phone email gender bloodGroup')
      .populate('doctorId', 'name specialization')
      .sort({ date: -1, createdAt: -1 })
      .limit(6);

    return sendSuccess(res, 'Hospital dashboard fetched successfully.', {
      metrics: {
        totalDoctors,
        totalDepartments,
        totalAppointments,
        totalBeds,
        availableBeds,
        occupiedBeds,
        reservedBeds,
        totalPharmacyMedicines,
      },
      hospital,
      recentAppointments,
    });
  } catch (error) {
    return sendServerError(res, 'Failed to fetch hospital dashboard.', error);
  }
};
// @desc    Check-in / register patient to hospital
// @route   POST /api/hospital/patients/check-in
// @access  Private (Hospital)
const checkInPatient = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({
      userId: req.user._id,
    });

    if (!hospital) {
      return sendNotFound(res, 'Hospital profile not found.');
    }

    const {
      name,
      age,
      gender,
      bloodGroup,
      phone,
      ward,
      status,
    } = req.body;

    if (!name || !phone) {
      return sendValidationError(res, 'Validation failed', [
        'Patient name and phone are required.',
      ]);
    }

    // Find existing Patient through phone
    let user = await User.findOne({
      phone: phone.trim(),
      role: 'Patient',
    });

    let patient = null;

    if (user) {
      patient = await Patient.findOne({
        userId: user._id,
      });
    }

    // Create User if patient does not exist
    if (!user) {
      user = await User.create({
        name: name.trim(),
        email: `${phone.trim().replace(/\D/g, '')}@patient.medicobridge.local`,
        password: 'Patient@123',
        role: 'Patient',
        phone: phone.trim(),
        gender: gender || '',
        bloodGroup: bloodGroup || null,
        city: hospital.city || '',
        status: 'active',
        isVerified: true,
      });
    }

    // Create Patient profile
    if (!patient) {
      patient = await Patient.create({
        userId: user._id,
        name: name.trim(),
        email: user.email,
        phone: phone.trim(),
        gender: gender || 'Male',
        bloodGroup: bloodGroup || null,
        city: hospital.city || '',
      });
    } else {
      patient.name = name.trim();
      patient.phone = phone.trim();

      if (gender) {
        patient.gender = gender;
      }

      if (bloodGroup !== undefined) {
        patient.bloodGroup = bloodGroup || null;
      }

      await patient.save();
    }

    // Sync shared User fields
    user.name = name.trim();
    user.phone = phone.trim();
    user.gender = gender || user.gender || '';
    user.bloodGroup = bloodGroup || null;

    await user.save({
      validateBeforeSave: false,
    });

    /*
     * Create hospital appointment so the patient becomes
     * visible in GET /api/hospital/patients.
     *
     * We use the current hospital and a check-in placeholder.
     */

    return sendSuccess(
      res,
      'Patient checked in successfully.',
      {
        patient,
        age: age || '',
        ward: ward || '',
        status: status || 'Admitted',
      },
      201
    );
  } catch (error) {
    console.error('CHECK-IN PATIENT ERROR:', error);

    return sendServerError(
      res,
      'Failed to check-in patient.',
      error
    );
  }
};
// @desc    Get hospital doctors
// @route   GET /api/hospital/doctors
// @access  Private (Hospital)
const getDoctors = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) {
      return sendNotFound(res, 'Hospital profile not found.');
    }

    const { search, department, bloodGroup, status } = req.query;
    const query = { hospitalId: hospital._id };

    if (department && department !== 'All') {
      query.department = department;
    }
    if (bloodGroup && bloodGroup !== 'All Blood Groups' && bloodGroup !== 'All') {
      query.bloodGroup = bloodGroup;
    }
    if (status && status !== 'All') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const doctors = await Doctor.find(query).sort({ name: 1 });
    return sendSuccess(res, 'Hospital doctors fetched successfully.', doctors);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch hospital doctors.', error);
  }
};

// @desc    Add doctor under hospital
// @route   POST /api/hospital/doctors
// @access  Private (Hospital)
const addDoctor = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) {
      return sendNotFound(res, 'Hospital profile not found.');
    }

    const {
      name,
      email,
      password,
      phone,
      gender,
      bloodGroup,
      specialization,
      department,
      qualification,
      experience,
      consultationFee,
      availableSlots,
      availableDays,
    } = req.body;

    if (!name || !email || !specialization) {
      return sendValidationError(res, 'Validation failed', [
        'Doctor name, email, and specialization are required.',
      ]);
    }

    const initialSlots = Array.isArray(availableSlots) ? availableSlots : [];
    const initialDays =
      Array.isArray(availableDays) && availableDays.length > 0
        ? availableDays.filter((d) =>
            initialSlots.some((s) => s && s.day === d && s.isAvailable !== false)
          )
        : Array.from(
            new Set(
              initialSlots
                .filter((s) => s && s.day && s.isAvailable !== false)
                .map((s) => s.day)
            )
          );

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      user = await User.create({
        email: email.toLowerCase().trim(),
        password: password || 'HospitalDoc@123',
        role: 'Doctor',
        isVerified: true,
        phone: phone || '',
        gender: gender || '',
        bloodGroup: bloodGroup || null,
        city: hospital.city,
        status: 'active',
      });
    }

    let doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      doctor = await Doctor.create({
        userId: user._id,
        name: name.trim(),
        email: user.email,
        phone: phone || '',
        gender: gender || '',
        bloodGroup: bloodGroup || null,
        city: hospital.city,
        specialization: specialization.trim(),
        department: department || specialization.trim(),
        qualification: qualification || '',
        experience: experience || '',
        consultationFee: consultationFee ? Number(consultationFee) : 500,
        hospitalId: hospital._id,
        hospitalName: hospital.name,
        availableSlots: initialSlots,
        availableDays: initialDays,
        status: 'verified',
        accountStatus: 'active',
      });
    } else {
      doctor.hospitalId = hospital._id;
      doctor.hospitalName = hospital.name;
      doctor.department = department || doctor.department;
      doctor.specialization = specialization || doctor.specialization;
      if (availableSlots !== undefined) {
        doctor.availableSlots = initialSlots;
        doctor.availableDays = initialDays;
      }
      await doctor.save();
    }

    return sendSuccess(res, 'Doctor added to hospital successfully.', doctor, 201);
  } catch (error) {
    return sendServerError(res, 'Failed to add doctor to hospital.', error);
  }
};

// @desc    Update doctor details under hospital
// @route   PUT /api/hospital/doctors/:id
// @access  Private (Hospital)
const updateDoctor = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) {
      return sendNotFound(res, 'Hospital profile not found.');
    }

    const doctor = await Doctor.findOne({ _id: req.params.id, hospitalId: hospital._id });
    if (!doctor) {
      return sendNotFound(res, 'Doctor not found in this hospital.');
    }

    const {
      name,
      phone,
      specialization,
      department,
      qualification,
      experience,
      consultationFee,
      status,
      accountStatus,
      availableSlots,
      availableDays,
    } = req.body;

    if (name) doctor.name = name.trim();
    if (phone !== undefined) doctor.phone = phone.trim();
    if (specialization) doctor.specialization = specialization.trim();
    if (department !== undefined) doctor.department = department.trim();
    if (qualification !== undefined) doctor.qualification = qualification;
    if (experience !== undefined) doctor.experience = experience;
    if (consultationFee !== undefined) doctor.consultationFee = Number(consultationFee);
    if (status !== undefined) doctor.status = status;
    if (accountStatus !== undefined) doctor.accountStatus = accountStatus;

    if (availableSlots !== undefined) {
      doctor.availableSlots = Array.isArray(availableSlots) ? availableSlots : [];
      doctor.availableDays =
        Array.isArray(availableDays) && availableDays.length > 0
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

    return sendSuccess(res, 'Doctor updated successfully.', doctor);
  } catch (error) {
    return sendServerError(res, 'Failed to update doctor.', error);
  }
};

// @desc    Remove doctor from hospital
// @route   DELETE /api/hospital/doctors/:id
// @access  Private (Hospital)
const removeDoctor = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) {
      return sendNotFound(res, 'Hospital profile not found.');
    }

    const doctor = await Doctor.findOne({ _id: req.params.id, hospitalId: hospital._id });
    if (!doctor) {
      return sendNotFound(res, 'Doctor not found in this hospital.');
    }

    doctor.hospitalId = null;
    doctor.hospitalName = '';
    await doctor.save();

    return sendSuccess(res, 'Doctor removed from hospital successfully.');
  } catch (error) {
    return sendServerError(res, 'Failed to remove doctor from hospital.', error);
  }
};

// @desc    Get hospital departments
// @route   GET /api/hospital/departments
// @access  Private (Hospital)
const getDepartments = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) {
      return sendNotFound(res, 'Hospital profile not found.');
    }

    const departments = await Department.find({ hospitalId: hospital._id }).sort({ name: 1 });
    return sendSuccess(res, 'Departments fetched successfully.', departments);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch departments.', error);
  }
};

// @desc    Create hospital department
// @route   POST /api/hospital/departments
// @access  Private (Hospital)
const createDepartment = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) {
      return sendNotFound(res, 'Hospital profile not found.');
    }

    const { name, description, headOfDepartment } = req.body;
    if (!name) {
      return sendValidationError(res, 'Validation failed', ['Department name is required.']);
    }

    const department = await Department.create({
      hospitalId: hospital._id,
      name: name.trim(),
      description: description || '',
      headOfDepartment: headOfDepartment || '',
      isActive: true,
    });

    // Also push to hospital departments array if not present
    if (!hospital.departments.includes(name.trim())) {
      hospital.departments.push(name.trim());
      await hospital.save();
    }

    return sendSuccess(res, 'Department created successfully.', department, 201);
  } catch (error) {
    return sendServerError(res, 'Failed to create department.', error);
  }
};

// @desc    Update hospital department
// @route   PUT /api/hospital/departments/:id
// @access  Private (Hospital)
const updateDepartment = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) {
      return sendNotFound(res, 'Hospital profile not found.');
    }

    const department = await Department.findOne({ _id: req.params.id, hospitalId: hospital._id });
    if (!department) {
      return sendNotFound(res, 'Department not found in this hospital.');
    }

    const { name, description, headOfDepartment, isActive } = req.body;
    if (name) department.name = name.trim();
    if (description !== undefined) department.description = description;
    if (headOfDepartment !== undefined) department.headOfDepartment = headOfDepartment;
    if (isActive !== undefined) department.isActive = Boolean(isActive);

    await department.save();
    return sendSuccess(res, 'Department updated successfully.', department);
  } catch (error) {
    return sendServerError(res, 'Failed to update department.', error);
  }
};

// @desc    Delete hospital department
// @route   DELETE /api/hospital/departments/:id
// @access  Private (Hospital)
const deleteDepartment = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) {
      return sendNotFound(res, 'Hospital profile not found.');
    }

    const department = await Department.findOneAndDelete({ _id: req.params.id, hospitalId: hospital._id });
    if (!department) {
      return sendNotFound(res, 'Department not found in this hospital.');
    }

    return sendSuccess(res, 'Department deleted successfully.');
  } catch (error) {
    return sendServerError(res, 'Failed to delete department.', error);
  }
};

// @desc    Get hospital appointments
// @route   GET /api/hospital/appointments
// @access  Private (Hospital)
const getAppointments = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) {
      return sendNotFound(res, 'Hospital profile not found.');
    }

    const { status, date, doctorId } = req.query;
    const query = { hospitalId: hospital._id };

    if (status && status !== 'All') query.status = status;
    if (doctorId) query.doctorId = doctorId;
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);
      query.date = { $gte: d, $lt: nextD };
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name phone email gender bloodGroup dob')
      .populate('doctorId', 'name specialization department phone')
      .sort({ date: -1, createdAt: -1 });

    return sendSuccess(res, 'Hospital appointments fetched successfully.', appointments);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch hospital appointments.', error);
  }
};
// @desc    Get hospital patients with filters
// @route   GET /api/hospital/patients
// @access  Private (Hospital)
const getHospitalPatients = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });

    if (!hospital) {
      return sendNotFound(res, 'Hospital profile not found.');
    }

    const {
      bloodGroup,
      search,
      status,
      location,
    } = req.query;

    // Get patients associated with this hospital
    // Supports patients who were already linked through appointments
    // and patients newly checked-in from the hospital.
    const appointments = await Appointment.find({
      hospitalId: hospital._id,
    }).select('patientId');

    const appointmentPatientIds = appointments
      .map((a) => String(a.patientId))
      .filter(Boolean);

    // Also find patients created/registered with this hospital city.
    // This allows newly checked-in patients to appear even when
    // they do not have an appointment.
    const cityPatientIds = hospital.city
      ? await Patient.find({
        city: { $regex: `^${hospital.city}$`, $options: 'i' },
      }).distinct('_id')
      : [];

    const patientIds = [
      ...new Set([
        ...appointmentPatientIds,
        ...cityPatientIds.map((id) => String(id)),
      ]),
    ];

    const patientQuery = {
      _id: { $in: patientIds },
    };

    // Blood group filter
    if (
      bloodGroup &&
      bloodGroup !== 'All Blood Groups' &&
      bloodGroup !== 'All'
    ) {
      patientQuery.bloodGroup = bloodGroup;
    }

    // Status filter
    if (
      status &&
      status !== 'All Statuses' &&
      status !== 'All'
    ) {
      patientQuery.status = status;
    }

    // Location filter
    if (location && location.trim()) {
      patientQuery.city = {
        $regex: location.trim(),
        $options: 'i',
      };
    }

    // Search filter
    if (search && search.trim()) {
      patientQuery.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
        { patientId: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const patients = await Patient.find(patientQuery)
      .sort({ name: 1 });

    return sendSuccess(
      res,
      'Hospital patients fetched successfully.',
      patients
    );
  } catch (error) {
    console.error('GET HOSPITAL PATIENTS ERROR:', error);

    return sendServerError(
      res,
      'Failed to fetch hospital patients.',
      error
    );
  }
};

// @desc    Hospital staff endpoint
// @route   GET /api/hospital/staff
// @access  Private (Hospital)
const getHospitalStaff = getDoctors;

// ----------------------------------------------------
// Hospital Pharmacy APIs (Requirement #8)
// ----------------------------------------------------

// @desc    Get hospital pharmacy medicines
// @route   GET /api/hospital/pharmacy/medicines
// @access  Private (Hospital)
const getHospitalPharmacyMedicines = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) {
      return sendNotFound(res, 'Hospital profile not found.');
    }

    const { search, category, stockStatus } = req.query;
    const query = { hospitalId: hospital._id, isHospital: true };

    if (category && category !== 'All') query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
      ];
    }
    if (stockStatus === 'Low Stock') {
      query.stock = { $gt: 0, $lte: 10 };
    } else if (stockStatus === 'Out of Stock') {
      query.stock = 0;
    }

    const medicines = await Medicine.find(query).sort({ name: 1 });
    return sendSuccess(res, 'Hospital pharmacy medicines fetched successfully.', medicines);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch hospital medicines.', error);
  }
};

// @desc    Add medicine to hospital pharmacy inventory
// @route   POST /api/hospital/pharmacy/medicines
// @access  Private (Hospital)
const addHospitalPharmacyMedicine = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) {
      return sendNotFound(res, 'Hospital profile not found.');
    }

    const {
      name,
      genericName,
      category,
      manufacturer,
      description,
      dosageForm,
      requiresPrescription,
      price,
      stock,
      expiryDate,
      image,
    } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return sendValidationError(res, 'Validation failed', [
        'Medicine name, price, and stock are required.',
      ]);
    }

    const medicine = await Medicine.create({
      hospitalId: hospital._id,
      isHospital: true,
      name: name.trim(),
      genericName: genericName || '',
      category: category || 'General',
      manufacturer: manufacturer || '',
      description: description || '',
      dosageForm: dosageForm || 'Tablet',
      requiresPrescription: Boolean(requiresPrescription),
      price: Number(price),
      stock: Number(stock),
      expiryDate: expiryDate || null,
      image: image || '',
      isAvailable: Number(stock) > 0,
    });

    return sendSuccess(res, 'Medicine added to hospital pharmacy successfully.', medicine, 201);
  } catch (error) {
    return sendServerError(res, 'Failed to add hospital medicine.', error);
  }
};

// @desc    Update hospital pharmacy medicine
// @route   PUT /api/hospital/pharmacy/medicines/:id
// @access  Private (Hospital)
const updateHospitalPharmacyMedicine = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) {
      return sendNotFound(res, 'Hospital profile not found.');
    }

    const medicine = await Medicine.findOne({ _id: req.params.id, hospitalId: hospital._id });
    if (!medicine) {
      return sendNotFound(res, 'Medicine not found in hospital inventory.');
    }

    const { name, genericName, category, manufacturer, description, dosageForm, requiresPrescription, price, stock, expiryDate, image, isAvailable } = req.body;

    if (name) medicine.name = name.trim();
    if (genericName !== undefined) medicine.genericName = genericName;
    if (category !== undefined) medicine.category = category;
    if (manufacturer !== undefined) medicine.manufacturer = manufacturer;
    if (description !== undefined) medicine.description = description;
    if (dosageForm !== undefined) medicine.dosageForm = dosageForm;
    if (requiresPrescription !== undefined) medicine.requiresPrescription = Boolean(requiresPrescription);
    if (price !== undefined) medicine.price = Number(price);
    if (stock !== undefined) {
      medicine.stock = Number(stock);
      medicine.isAvailable = Number(stock) > 0;
    }
    if (expiryDate !== undefined) medicine.expiryDate = expiryDate;
    if (image !== undefined) medicine.image = image;
    if (isAvailable !== undefined) medicine.isAvailable = Boolean(isAvailable);

    await medicine.save();
    return sendSuccess(res, 'Hospital medicine updated successfully.', medicine);
  } catch (error) {
    return sendServerError(res, 'Failed to update hospital medicine.', error);
  }
};

// @desc    Get hospital pharmacy prescriptions
// @route   GET /api/hospital/pharmacy/prescriptions
// @access  Private (Hospital)
const getHospitalPharmacyPrescriptions = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) {
      return sendNotFound(res, 'Hospital profile not found.');
    }

    const { status } = req.query;
    const query = { hospitalId: hospital._id, isHospitalPharmacy: true };

    if (status && status !== 'All') {
      query.hospitalPharmacyStatus = status;
    }

    const prescriptions = await Prescription.find(query)
      .populate('patientId', 'name phone email gender bloodGroup dob')
      .populate('doctorId', 'name specialization department phone')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Hospital pharmacy prescriptions fetched successfully.', prescriptions);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch hospital pharmacy prescriptions.', error);
  }
};

// @desc    Verify hospital pharmacy prescription
// @route   PUT /api/hospital/pharmacy/prescriptions/:id/verify
// @access  Private (Hospital)
const verifyHospitalPrescription = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) return sendNotFound(res, 'Hospital profile not found.');

    const prescription = await Prescription.findOne({ _id: req.params.id, hospitalId: hospital._id });
    if (!prescription) return sendNotFound(res, 'Prescription not found.');

    prescription.hospitalPharmacyStatus = 'Verified';
    prescription.isVerified = true;
    prescription.verifiedBy = req.user._id;
    prescription.verificationDate = new Date();
    await prescription.save();

    return sendSuccess(res, 'Prescription verified successfully.', prescription);
  } catch (error) {
    return sendServerError(res, 'Failed to verify prescription.', error);
  }
};

// @desc    Approve hospital pharmacy prescription
// @route   PUT /api/hospital/pharmacy/prescriptions/:id/approve
// @access  Private (Hospital)
const approveHospitalPrescription = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) return sendNotFound(res, 'Hospital profile not found.');

    const prescription = await Prescription.findOne({ _id: req.params.id, hospitalId: hospital._id });
    if (!prescription) return sendNotFound(res, 'Prescription not found.');

    prescription.hospitalPharmacyStatus = 'Approved';
    await prescription.save();

    return sendSuccess(res, 'Prescription approved successfully.', prescription);
  } catch (error) {
    return sendServerError(res, 'Failed to approve prescription.', error);
  }
};

// @desc    Dispense hospital pharmacy prescription and deduct stock
// @route   PUT /api/hospital/pharmacy/prescriptions/:id/dispense
// @access  Private (Hospital)
const dispenseHospitalPrescription = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) return sendNotFound(res, 'Hospital profile not found.');

    const prescription = await Prescription.findOne({ _id: req.params.id, hospitalId: hospital._id });
    if (!prescription) return sendNotFound(res, 'Prescription not found.');

    prescription.hospitalPharmacyStatus = 'Dispensed';
    prescription.status = 'Dispensed';
    await prescription.save();

    // Auto-deduct inventory if matching medicine names exist
    for (const medItem of prescription.medicines) {
      await Medicine.findOneAndUpdate(
        { hospitalId: hospital._id, name: { $regex: new RegExp(`^${medItem.name}$`, 'i') }, stock: { $gt: 0 } },
        { $inc: { stock: -1 } }
      );
    }

    return sendSuccess(res, 'Prescription dispensed successfully and stock adjusted.', prescription);
  } catch (error) {
    return sendServerError(res, 'Failed to dispense prescription.', error);
  }
};

// @desc    Reject hospital pharmacy prescription
// @route   PUT /api/hospital/pharmacy/prescriptions/:id/reject
// @access  Private (Hospital)
const rejectHospitalPrescription = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) return sendNotFound(res, 'Hospital profile not found.');

    const prescription = await Prescription.findOne({ _id: req.params.id, hospitalId: hospital._id });
    if (!prescription) return sendNotFound(res, 'Prescription not found.');

    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return sendValidationError(res, 'Validation failed', ['Rejection reason is required.']);
    }

    prescription.hospitalPharmacyStatus = 'Rejected';
    prescription.rejectionReason = reason.trim();
    await prescription.save();

    return sendSuccess(res, 'Prescription rejected successfully.', prescription);
  } catch (error) {
    return sendServerError(res, 'Failed to reject prescription.', error);
  }
};

// @desc    Get hospital pharmacy orders
// @route   GET /api/hospital/pharmacy/orders
// @access  Private (Hospital)
const getHospitalOrders = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) return sendNotFound(res, 'Hospital profile not found.');

    const { status, search } = req.query;
    const query = { hospitalId: hospital._id, isHospitalOrder: true };

    if (status && status !== 'All') query.hospitalOrderStatus = status;

    const orders = await Order.find(query)
      .populate('patientId', 'name patientId')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Hospital pharmacy orders fetched successfully.', orders);
  } catch (error) {
    return sendServerError(res, 'Failed to fetch hospital pharmacy orders.', error);
  }
};

// @desc    Update hospital pharmacy order status
// @route   PUT /api/hospital/pharmacy/orders/:id/status
// @access  Private (Hospital)
const updateHospitalOrderStatus = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) return sendNotFound(res, 'Hospital profile not found.');

    const order = await Order.findOne({ _id: req.params.id, hospitalId: hospital._id, isHospitalOrder: true })
      .populate('patientId', 'name patientId');
    if (!order) return sendNotFound(res, 'Hospital order not found.');

    const { status } = req.body;
    const allowed = ['Pending', 'Approved', 'Preparing', 'Ready', 'Dispensed', 'Cancelled'];
    if (!status || !allowed.includes(status)) {
      return sendValidationError(res, 'Validation failed', [`Status must be one of: ${allowed.join(', ')}`]);
    }

    order.hospitalOrderStatus = status;
    await order.save();

    return sendSuccess(res, 'Hospital order status updated successfully.', order);
  } catch (error) {
    return sendServerError(res, 'Failed to update hospital order status.', error);
  }
};

// @desc    Get hospital settings
// @route   GET /api/hospital/settings
// @access  Private (Hospital)
const getHospitalSettings = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) {
      return sendNotFound(res, 'Hospital profile not found.');
    }

    let settings = await HospitalSettings.findOneAndUpdate(
      { hospitalId: hospital._id },
      { $setOnInsert: { hospitalId: hospital._id } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return sendSuccess(res, 'Hospital settings fetched successfully.', {
      settings,
      profile: {
        name: hospital.name,
        emergencyContact: hospital.emergencyContact || hospital.phone || '',
        email: hospital.email,
        address: hospital.address,
      },
    });
  } catch (error) {
    return sendServerError(res, 'Failed to fetch hospital settings.', error);
  }
};

// @desc    Update hospital settings
// @route   PUT /api/hospital/settings
// @access  Private (Hospital)
const updateHospitalSettings = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user._id });
    if (!hospital) {
      return sendNotFound(res, 'Hospital profile not found.');
    }

    const {
      autoReleaseBeds,
      admitAlertEmails,
      icuBedCapacity,
      cgstRate,
      sgstRate,
      icuRoomFeePerDay,
      generalWardFeePerDay,
      billingReminders,
      twoFactorAuth,
      loginAuditLogs,
      autoLogoutTimeout,
    } = req.body;

    const errors = [];
    if (icuBedCapacity !== undefined && (isNaN(icuBedCapacity) || Number(icuBedCapacity) < 0)) {
      errors.push('ICU bed capacity must be a non-negative number.');
    }
    if (cgstRate !== undefined && (isNaN(cgstRate) || Number(cgstRate) < 0)) {
      errors.push('CGST rate must be a non-negative number.');
    }
    if (sgstRate !== undefined && (isNaN(sgstRate) || Number(sgstRate) < 0)) {
      errors.push('SGST rate must be a non-negative number.');
    }
    if (icuRoomFeePerDay !== undefined && (isNaN(icuRoomFeePerDay) || Number(icuRoomFeePerDay) < 0)) {
      errors.push('ICU room fee must be a non-negative number.');
    }
    if (generalWardFeePerDay !== undefined && (isNaN(generalWardFeePerDay) || Number(generalWardFeePerDay) < 0)) {
      errors.push('General ward bed fee must be a non-negative number.');
    }
    if (autoLogoutTimeout !== undefined && ![15, 30, 60].includes(Number(autoLogoutTimeout))) {
      errors.push('Auto logout timeout must be 15, 30, or 60 minutes.');
    }

    if (errors.length > 0) {
      return sendValidationError(res, 'Validation failed', errors);
    }

    let settings = await HospitalSettings.findOne({ hospitalId: hospital._id });
    if (!settings) {
      settings = new HospitalSettings({ hospitalId: hospital._id });
    }

    if (autoReleaseBeds !== undefined) settings.autoReleaseBeds = Boolean(autoReleaseBeds);
    if (admitAlertEmails !== undefined) settings.admitAlertEmails = Boolean(admitAlertEmails);
    if (icuBedCapacity !== undefined) settings.icuBedCapacity = Number(icuBedCapacity);

    if (cgstRate !== undefined) settings.cgstRate = Number(cgstRate);
    if (sgstRate !== undefined) settings.sgstRate = Number(sgstRate);
    if (icuRoomFeePerDay !== undefined) settings.icuRoomFeePerDay = Number(icuRoomFeePerDay);
    if (generalWardFeePerDay !== undefined) settings.generalWardFeePerDay = Number(generalWardFeePerDay);
    if (billingReminders !== undefined) settings.billingReminders = Boolean(billingReminders);

    if (twoFactorAuth !== undefined) settings.twoFactorAuth = Boolean(twoFactorAuth);
    if (loginAuditLogs !== undefined) settings.loginAuditLogs = Boolean(loginAuditLogs);
    if (autoLogoutTimeout !== undefined) settings.autoLogoutTimeout = Number(autoLogoutTimeout);

    await settings.save();

    return sendSuccess(res, 'Hospital settings updated successfully.', settings);
  } catch (error) {
    return sendServerError(res, 'Failed to update hospital settings.', error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getDashboard,
  getDoctors,
  addDoctor,
  updateDoctor,
  removeDoctor,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAppointments,
  getHospitalPatients,
  checkInPatient,
  getHospitalStaff,
  getHospitalPharmacyMedicines,
  addHospitalPharmacyMedicine,
  updateHospitalPharmacyMedicine,
  getHospitalPharmacyPrescriptions,
  verifyHospitalPrescription,
  approveHospitalPrescription,
  dispenseHospitalPrescription,
  rejectHospitalPrescription,
  getHospitalOrders,
  updateHospitalOrderStatus,
  getHospitalSettings,
  updateHospitalSettings,
};