const Hospital = require("../models/Hospital");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Department = require("../models/Department");
const Bed = require("../models/Bed");
const Appointment = require("../models/Appointment");

const {
    successResponse,
    validationErrorResponse,
    notFoundResponse,
    serverErrorResponse,
    forbiddenResponse,
} = require("../utils/apiResponse");
const { isValidObjectId } = require("../utils/validators");

// Get hospital profile
const getHospitalProfile = async (req, res) => {
    try {
        const hospital = await Hospital.findOne({
            userId: req.user.id,
        }).populate("userId", "name email phone city address role isApproved isActive");

        if (!hospital) {
            return notFoundResponse(res, "Hospital profile not found");
        }

        return successResponse(res, "Hospital profile retrieved successfully", { hospital });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch hospital profile", error);
    }
};

// Update hospital profile
const updateHospitalProfile = async (req, res) => {
    try {
        const { hospitalName, registrationNumber, phone, address, city } = req.body;

        const hospital = await Hospital.findOne({ userId: req.user.id });
        if (!hospital) {
            return notFoundResponse(res, "Hospital profile not found");
        }

        if (hospitalName !== undefined) hospital.hospitalName = hospitalName.trim();
        if (registrationNumber !== undefined) hospital.registrationNumber = registrationNumber.trim();
        if (phone !== undefined) hospital.phone = phone.trim();
        if (address !== undefined) hospital.address = address.trim();
        if (city !== undefined) hospital.city = city.trim();

        await hospital.save();

        // Sync with User model
        const user = await User.findById(req.user.id);
        if (user) {
            if (hospitalName !== undefined) user.name = hospitalName.trim();
            if (phone !== undefined) user.phone = phone.trim();
            if (address !== undefined) user.address = address.trim();
            if (city !== undefined) user.city = city.trim();
            await user.save();
        }

        return successResponse(res, "Hospital profile updated successfully", { hospital });
    } catch (error) {
        return serverErrorResponse(res, "Unable to update hospital profile", error);
    }
};

// Public: Get all hospitals
const getAllHospitals = async (req, res) => {
    try {
        const { search, city } = req.query;

        const query = { isActive: true };

        const hospitals = await Hospital.find(query)
            .populate("userId", "name email phone city address isApproved isActive")
            .lean();

        let filtered = hospitals;

        if (city) {
            const cityRegex = new RegExp(city.trim(), "i");
            filtered = filtered.filter((h) => (h.city && cityRegex.test(h.city)) || (h.userId && h.userId.city && cityRegex.test(h.userId.city)));
        }

        if (search) {
            const searchRegex = new RegExp(search.trim(), "i");
            filtered = filtered.filter(
                (h) =>
                    searchRegex.test(h.hospitalName) ||
                    (h.userId && searchRegex.test(h.userId.name)) ||
                    searchRegex.test(h.city)
            );
        }

        return successResponse(res, "Hospitals retrieved successfully", {
            hospitals: filtered,
            count: filtered.length,
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch hospitals", error);
    }
};

// Public: Get single hospital
const getHospitalById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid hospital ID");
        }

        let hospital = await Hospital.findById(id).populate("userId", "name email phone city address");
        if (!hospital) {
            hospital = await Hospital.findOne({ userId: id }).populate("userId", "name email phone city address");
        }

        if (!hospital) {
            return notFoundResponse(res, "Hospital not found");
        }

        const departments = await Department.find({ hospitalId: hospital.userId || hospital._id, isActive: true });
        const beds = await Bed.find({ hospitalId: hospital.userId || hospital._id });

        return successResponse(res, "Hospital retrieved successfully", {
            hospital,
            departments,
            bedStats: {
                total: beds.length,
                available: beds.filter((b) => !b.isOccupied && b.status === "Available").length,
                occupied: beds.filter((b) => b.isOccupied).length,
            },
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch hospital", error);
    }
};

// Hospital: Get staff / doctors (Supports query filters matching frontend getHospitalStaff)
const getHospitalStaff = async (req, res) => {
    try {
        const hospitalId = req.user ? req.user.id : req.headers["x-hospital-id"];
        const { bloodGroup, search, status } = req.query;

        const doctors = await Doctor.find({ hospitalId })
            .populate("userId", "name email phone city bloodGroup isAvailable isActive")
            .lean();

        let staff = doctors.map((d) => ({
            _id: d._id,
            doctorId: d.doctorId,
            userId: d.userId?._id,
            name: d.userId?.name || "",
            email: d.userId?.email || "",
            phone: d.userId?.phone || "",
            city: d.userId?.city || "",
            bloodGroup: d.userId?.bloodGroup || "Not Provided",
            specialization: d.specialization,
            qualification: d.qualification,
            experience: d.experience,
            isAvailable: d.isAvailable,
            status: d.userId?.isActive ? "Active" : "Inactive",
        }));

        if (bloodGroup && bloodGroup !== "All Blood Groups" && bloodGroup !== "All") {
            staff = staff.filter((s) => s.bloodGroup === bloodGroup);
        }

        if (status && status !== "All Statuses" && status !== "All") {
            staff = staff.filter((s) => s.status === status);
        }

        if (search) {
            const q = search.toLowerCase().trim();
            staff = staff.filter(
                (s) =>
                    s.name.toLowerCase().includes(q) ||
                    s.email.toLowerCase().includes(q) ||
                    s.specialization.toLowerCase().includes(q) ||
                    s.phone.includes(q)
            );
        }

        return successResponse(res, "Hospital staff retrieved successfully", {
            staff,
            count: staff.length,
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch hospital staff", error);
    }
};

// Hospital: Add doctor to hospital
const addHospitalStaff = async (req, res) => {
    try {
        const { doctorUserId } = req.body;
        if (!doctorUserId || !isValidObjectId(doctorUserId)) {
            return validationErrorResponse(res, "Valid doctor user ID is required");
        }

        const doctor = await Doctor.findOne({ userId: doctorUserId });
        if (!doctor) {
            return notFoundResponse(res, "Doctor not found");
        }

        doctor.hospitalId = req.user.id;
        await doctor.save();

        return successResponse(res, "Doctor added to hospital staff successfully", { doctor });
    } catch (error) {
        return serverErrorResponse(res, "Unable to add doctor to hospital", error);
    }
};

// Hospital: Remove doctor from hospital
const removeHospitalStaff = async (req, res) => {
    try {
        const { doctorId } = req.params;
        if (!isValidObjectId(doctorId)) {
            return validationErrorResponse(res, "Invalid doctor ID");
        }

        const doctor = await Doctor.findOne({
            $or: [{ _id: doctorId }, { userId: doctorId }],
            hospitalId: req.user.id,
        });

        if (!doctor) {
            return notFoundResponse(res, "Doctor not found in this hospital");
        }

        doctor.hospitalId = null;
        await doctor.save();

        return successResponse(res, "Doctor removed from hospital staff successfully");
    } catch (error) {
        return serverErrorResponse(res, "Unable to remove doctor from hospital", error);
    }
};

// Hospital: Get patients (Appointments & records associated with this hospital)
const getHospitalPatients = async (req, res) => {
    try {
        const hospitalId = req.user ? req.user.id : req.headers["x-hospital-id"];
        const { bloodGroup, search, status } = req.query;

        const patientIds = await Appointment.find({ hospitalId }).distinct("patientId");

        const query = {
            _id: { $in: patientIds },
        };

        if (bloodGroup && bloodGroup !== "All Blood Groups" && bloodGroup !== "All") {
            query.bloodGroup = bloodGroup;
        }

        if (search) {
            const searchRegex = new RegExp(search.trim(), "i");
            query.$or = [
                { name: searchRegex },
                { email: searchRegex },
                { phone: searchRegex },
                { city: searchRegex },
            ];
        }

        const patients = await User.find(query)
            .select("name email phone city bloodGroup address isActive createdAt")
            .lean();

        let formatted = patients.map((p) => ({
            ...p,
            bloodGroup: p.bloodGroup || "Not Provided",
            status: p.isActive ? "Active" : "Inactive",
        }));

        if (status && status !== "All Statuses" && status !== "All") {
            formatted = formatted.filter((p) => p.status === status);
        }

        return successResponse(res, "Hospital patients retrieved successfully", {
            patients: formatted,
            count: formatted.length,
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch hospital patients", error);
    }
};

// Hospital Departments CRUD
const getHospitalDepartments = async (req, res) => {
    try {
        const hospitalId = req.params.hospitalId || req.user.id;
        const departments = await Department.find({ hospitalId, isActive: true })
            .populate("headDoctorId", "name email specialization")
            .sort({ name: 1 });

        return successResponse(res, "Departments retrieved successfully", { departments });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch departments", error);
    }
};

const createDepartment = async (req, res) => {
    try {
        const { name, headDoctorId, description, bedCapacity } = req.body;

        if (!name) {
            return validationErrorResponse(res, "Department name is required");
        }

        const department = await Department.create({
            hospitalId: req.user.id,
            name: name.trim(),
            headDoctorId: headDoctorId && isValidObjectId(headDoctorId) ? headDoctorId : null,
            description: description ? description.trim() : "",
            bedCapacity: Number(bedCapacity) || 0,
        });

        return successResponse(res, "Department created successfully", { department }, 201);
    } catch (error) {
        return serverErrorResponse(res, "Unable to create department", error);
    }
};

const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid department ID");
        }

        const department = await Department.findOne({ _id: id, hospitalId: req.user.id });
        if (!department) {
            return notFoundResponse(res, "Department not found");
        }

        const { name, headDoctorId, description, bedCapacity, isActive } = req.body;
        if (name !== undefined) department.name = name.trim();
        if (headDoctorId !== undefined) department.headDoctorId = headDoctorId && isValidObjectId(headDoctorId) ? headDoctorId : null;
        if (description !== undefined) department.description = description.trim();
        if (bedCapacity !== undefined) department.bedCapacity = Number(bedCapacity) || 0;
        if (isActive !== undefined) department.isActive = Boolean(isActive);

        await department.save();

        return successResponse(res, "Department updated successfully", { department });
    } catch (error) {
        return serverErrorResponse(res, "Unable to update department", error);
    }
};

const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid department ID");
        }

        const department = await Department.findOneAndDelete({ _id: id, hospitalId: req.user.id });
        if (!department) {
            return notFoundResponse(res, "Department not found");
        }

        return successResponse(res, "Department deleted successfully");
    } catch (error) {
        return serverErrorResponse(res, "Unable to delete department", error);
    }
};

// Hospital Beds Management CRUD
const getHospitalBeds = async (req, res) => {
    try {
        const hospitalId = req.params.hospitalId || req.user.id;
        const { departmentId, bedType, status } = req.query;

        const query = { hospitalId };
        if (departmentId && isValidObjectId(departmentId)) query.departmentId = departmentId;
        if (bedType) query.bedType = bedType;
        if (status) query.status = status;

        const beds = await Bed.find(query)
            .populate("departmentId", "name")
            .populate("patientId", "name email phone")
            .sort({ bedNumber: 1 });

        return successResponse(res, "Hospital beds retrieved successfully", {
            beds,
            count: beds.length,
            stats: {
                total: beds.length,
                available: beds.filter((b) => b.status === "Available" && !b.isOccupied).length,
                occupied: beds.filter((b) => b.isOccupied).length,
                maintenance: beds.filter((b) => b.status === "Maintenance").length,
            },
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch hospital beds", error);
    }
};

const createBed = async (req, res) => {
    try {
        const { departmentId, bedNumber, bedType, dailyRate } = req.body;

        if (!bedNumber) {
            return validationErrorResponse(res, "Bed number is required");
        }

        const existing = await Bed.findOne({ hospitalId: req.user.id, bedNumber: bedNumber.trim() });
        if (existing) {
            return validationErrorResponse(res, "Bed number already exists in this hospital");
        }

        const bed = await Bed.create({
            hospitalId: req.user.id,
            departmentId: departmentId && isValidObjectId(departmentId) ? departmentId : null,
            bedNumber: bedNumber.trim(),
            bedType: bedType || "General",
            dailyRate: Number(dailyRate) || 0,
            status: "Available",
            isOccupied: false,
        });

        return successResponse(res, "Bed created successfully", { bed }, 201);
    } catch (error) {
        return serverErrorResponse(res, "Unable to create bed", error);
    }
};

const updateBed = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid bed ID");
        }

        const bed = await Bed.findOne({ _id: id, hospitalId: req.user.id });
        if (!bed) {
            return notFoundResponse(res, "Bed not found");
        }

        const { departmentId, bedNumber, bedType, dailyRate, status, isOccupied, patientId } = req.body;
        if (departmentId !== undefined) bed.departmentId = departmentId && isValidObjectId(departmentId) ? departmentId : null;
        if (bedNumber !== undefined) bed.bedNumber = bedNumber.trim();
        if (bedType !== undefined) bed.bedType = bedType;
        if (dailyRate !== undefined) bed.dailyRate = Number(dailyRate) || 0;
        if (status !== undefined) bed.status = status;
        if (isOccupied !== undefined) {
            bed.isOccupied = Boolean(isOccupied);
            if (!bed.isOccupied) bed.patientId = null;
        }
        if (patientId !== undefined) {
            bed.patientId = patientId && isValidObjectId(patientId) ? patientId : null;
            if (bed.patientId) {
                bed.isOccupied = true;
                bed.status = "Occupied";
            }
        }

        await bed.save();

        return successResponse(res, "Bed updated successfully", { bed });
    } catch (error) {
        return serverErrorResponse(res, "Unable to update bed", error);
    }
};

const deleteBed = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid bed ID");
        }

        const bed = await Bed.findOneAndDelete({ _id: id, hospitalId: req.user.id });
        if (!bed) {
            return notFoundResponse(res, "Bed not found");
        }

        return successResponse(res, "Bed deleted successfully");
    } catch (error) {
        return serverErrorResponse(res, "Unable to delete bed", error);
    }
};

module.exports = {
    getHospitalProfile,
    updateHospitalProfile,
    getAllHospitals,
    getHospitalById,
    getHospitalStaff,
    addHospitalStaff,
    removeHospitalStaff,
    getHospitalPatients,
    getHospitalDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getHospitalBeds,
    createBed,
    updateBed,
    deleteBed,
};
