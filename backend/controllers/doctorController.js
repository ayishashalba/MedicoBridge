const Doctor = require("../models/Doctor");
const User = require("../models/User");
const Appointment = require("../models/Appointment");

const {
    successResponse,
    validationErrorResponse,
    notFoundResponse,
    serverErrorResponse,
} = require("../utils/apiResponse");
const { isValidObjectId } = require("../utils/validators");

const getDoctorProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({
            userId: req.user.id,
        }).populate("userId", "name email phone city bloodGroup role profileImage isAvailable");

        if (!doctor) {
            return notFoundResponse(res, "Doctor not found");
        }

        return successResponse(
            res,
            "Doctor profile retrieved successfully",
            { doctor }
        );
    } catch (error) {
        return serverErrorResponse(
            res,
            "Unable to fetch doctor profile",
            error
        );
    }
};

const updateDoctorProfile = async (req, res) => {
    try {
        const {
            phone,
            city,
            bloodGroup,
            specialization,
            qualification,
            experience,
            licenseNumber,
            clinicName,
            consultationFee,
            isAvailable,
        } = req.body;

        const doctor = await Doctor.findOne({
            userId: req.user.id,
        });

        if (!doctor) {
            return notFoundResponse(res, "Doctor not found");
        }

        const allowedBloodGroups = [
            "A+",
            "A-",
            "B+",
            "B-",
            "AB+",
            "AB-",
            "O+",
            "O-",
        ];

        if (
            bloodGroup !== undefined &&
            bloodGroup !== null &&
            bloodGroup !== "" &&
            !allowedBloodGroups.includes(bloodGroup)
        ) {
            return validationErrorResponse(res, "Invalid blood group");
        }

        if (specialization !== undefined) {
            doctor.specialization = specialization;
        }

        if (qualification !== undefined) {
            doctor.qualification = qualification;
        }

        if (experience !== undefined) {
            doctor.experience = Number(experience) || 0;
        }

        if (licenseNumber !== undefined) {
            doctor.licenseNumber = licenseNumber;
        }

        if (clinicName !== undefined) {
            doctor.clinicName = clinicName;
        }

        if (consultationFee !== undefined) {
            doctor.consultationFee = Number(consultationFee) || 0;
        }

        if (isAvailable !== undefined) {
            doctor.isAvailable = Boolean(isAvailable);
        }

        await doctor.save();

        // Update common User profile fields
        const user = await User.findById(req.user.id);

        if (user) {
            if (phone !== undefined) user.phone = phone;
            if (city !== undefined) user.city = city;
            if (bloodGroup !== undefined) user.bloodGroup = bloodGroup || null;
            if (isAvailable !== undefined) user.isAvailable = Boolean(isAvailable);

            await user.save();
        }

        return successResponse(
            res,
            "Doctor profile updated successfully",
            { doctor }
        );
    } catch (error) {
        return serverErrorResponse(
            res,
            "Unable to update doctor profile",
            error
        );
    }
};

const updateDoctorAvailability = async (req, res) => {
    try {
        const { isAvailable } = req.body;

        if (typeof isAvailable !== "boolean") {
            return validationErrorResponse(
                res,
                "isAvailable must be true or false"
            );
        }

        const doctor = await Doctor.findOneAndUpdate(
            { userId: req.user.id },
            { isAvailable },
            { new: true }
        );

        if (!doctor) {
            return notFoundResponse(res, "Doctor not found");
        }

        await User.findByIdAndUpdate(req.user.id, { isAvailable });

        return successResponse(
            res,
            "Doctor availability updated successfully",
            { isAvailable: doctor.isAvailable }
        );
    } catch (error) {
        return serverErrorResponse(
            res,
            "Unable to update doctor availability",
            error
        );
    }
};

// Public/patient search doctors
const getAllDoctors = async (req, res) => {
    try {
        const { search, specialization, city, availableOnly } = req.query;

        const doctorQuery = { isApproved: true };

        if (specialization) {
            doctorQuery.specialization = new RegExp(specialization.trim(), "i");
        }

        if (availableOnly === "true") {
            doctorQuery.isAvailable = true;
        }

        const doctors = await Doctor.find(doctorQuery)
            .populate({
                path: "userId",
                select: "name email phone city bloodGroup isAvailable profileImage isActive",
                match: { isActive: true },
            })
            .populate("hospitalId", "hospitalName city");

        let filteredDoctors = doctors.filter((doc) => doc.userId !== null);

        if (city) {
            const cityRegex = new RegExp(city.trim(), "i");
            filteredDoctors = filteredDoctors.filter(
                (doc) => doc.userId.city && cityRegex.test(doc.userId.city)
            );
        }

        if (search) {
            const searchRegex = new RegExp(search.trim(), "i");
            filteredDoctors = filteredDoctors.filter(
                (doc) =>
                    searchRegex.test(doc.userId.name) ||
                    searchRegex.test(doc.specialization) ||
                    searchRegex.test(doc.clinicName) ||
                    searchRegex.test(doc.userId.city)
            );
        }

        return successResponse(res, "Doctors retrieved successfully", {
            doctors: filteredDoctors,
            count: filteredDoctors.length,
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch doctors", error);
    }
};

// Get single doctor details
const getDoctorById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid doctor ID");
        }

        let doctor = await Doctor.findById(id)
            .populate("userId", "name email phone city bloodGroup profileImage isAvailable")
            .populate("hospitalId", "hospitalName city");

        if (!doctor) {
            doctor = await Doctor.findOne({ userId: id })
                .populate("userId", "name email phone city bloodGroup profileImage isAvailable")
                .populate("hospitalId", "hospitalName city");
        }

        if (!doctor) {
            return notFoundResponse(res, "Doctor not found");
        }

        return successResponse(res, "Doctor retrieved successfully", { doctor });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch doctor", error);
    }
};

// Doctor's patients list
const getDoctorPatients = async (req, res) => {
    try {
        const { bloodGroup, search } = req.query;

        // Find all appointments associated with this doctor
        const appointments = await Appointment.find({ doctorId: req.user.id }).distinct("patientId");

        const query = {
            _id: { $in: appointments },
            isActive: true,
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
            .select("name email phone city bloodGroup gender isAvailable createdAt")
            .lean();

        return successResponse(res, "Doctor's patients retrieved successfully", {
            patients,
            count: patients.length,
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch doctor's patients", error);
    }
};

module.exports = {
    getDoctorProfile,
    updateDoctorProfile,
    updateDoctorAvailability,
    getAllDoctors,
    getDoctorById,
    getDoctorPatients,
};