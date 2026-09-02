const Doctor = require("../models/Doctor");
const User = require("../models/User");

const {
    successResponse,
    validationErrorResponse,
    notFoundResponse,
    serverErrorResponse,
} = require("../utils/apiResponse");

const getDoctorProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({
            userId: req.user.id,
        }).populate("userId", "name email phone city bloodGroup role");

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
            doctor.experience = experience;
        }

        if (licenseNumber !== undefined) {
            doctor.licenseNumber = licenseNumber;
        }

        if (clinicName !== undefined) {
            doctor.clinicName = clinicName;
        }

        if (consultationFee !== undefined) {
            doctor.consultationFee = consultationFee;
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

module.exports = {
    getDoctorProfile,
    updateDoctorProfile,
    updateDoctorAvailability,
};