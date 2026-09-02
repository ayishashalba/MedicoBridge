const Patient = require("../models/Patient");
const User = require("../models/User");
const MedicalRecord = require("../models/MedicalRecord");

const {
    successResponse,
    validationErrorResponse,
    unauthorizedResponse,
    notFoundResponse,
    serverErrorResponse,
} = require("../utils/apiResponse");

const getPatientProfile = async (req, res) => {
    try {
        const patient = await Patient.findOne({
            userId: req.user.id,
        }).populate("userId", "name email role");

        if (!patient) {
            return notFoundResponse(res, "Patient not found");
        }

        return successResponse(res, "Patient profile retrieved successfully", {
            patient,
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch patient profile", error);
    }
};

const updatePatientProfile = async (req, res) => {
    try {
        const {
            phone,
            city,
            address,
            dateOfBirth,
            gender,
            bloodGroup,
            emergencyContact,
        } = req.body;

        const patient = await Patient.findOne({
            userId: req.user.id,
        });

        if (!patient) {
            return notFoundResponse(res, "Patient not found");
        }

        if (bloodGroup !== undefined) {
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

            if (bloodGroup !== null && !allowedBloodGroups.includes(bloodGroup)) {
                return validationErrorResponse(res, "Invalid blood group");
            }

            patient.bloodGroup = bloodGroup;
        }

        if (phone !== undefined) patient.phone = phone;
        if (city !== undefined) patient.city = city;
        if (address !== undefined) patient.address = address;
        if (dateOfBirth !== undefined) patient.dateOfBirth = dateOfBirth;
        if (gender !== undefined) patient.gender = gender;
        if (emergencyContact !== undefined) {
            patient.emergencyContact = emergencyContact;
        }

        await patient.save();

        return successResponse(
            res,
            "Profile updated successfully",
            { patient }
        );
    } catch (error) {
        return serverErrorResponse(res, "Unable to update patient profile", error);
    }
};

const getMedicalRecords = async (req, res) => {
    try {
        const records = await MedicalRecord.find({
            patientId: req.user.id,
        }).sort({ date: -1 });

        return successResponse(
            res,
            "Medical records retrieved successfully",
            { records }
        );
    } catch (error) {
        return serverErrorResponse(
            res,
            "Unable to fetch medical records",
            error
        );
    }
};

module.exports = {
    getPatientProfile,
    updatePatientProfile,
    getMedicalRecords,
};