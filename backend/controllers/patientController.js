const Patient = require("../models/Patient");
const User = require("../models/User");
const MedicalRecord = require("../models/MedicalRecord");

const {
    successResponse,
    validationErrorResponse,
    notFoundResponse,
    serverErrorResponse,
} = require("../utils/apiResponse");
const { isValidObjectId } = require("../utils/validators");

const getPatientProfile = async (req, res) => {
    try {
        const patient = await Patient.findOne({
            userId: req.user.id,
        }).populate("userId", "name email phone city bloodGroup role isAvailable");

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
            isAvailable,
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

            if (bloodGroup !== null && bloodGroup !== "" && !allowedBloodGroups.includes(bloodGroup)) {
                return validationErrorResponse(res, "Invalid blood group");
            }

            patient.bloodGroup = bloodGroup || null;
        }

        if (phone !== undefined) patient.phone = phone;
        if (city !== undefined) patient.city = city;
        if (address !== undefined) patient.address = address;
        if (dateOfBirth !== undefined) patient.dateOfBirth = dateOfBirth;
        if (gender !== undefined) patient.gender = gender;
        if (emergencyContact !== undefined) patient.emergencyContact = emergencyContact;
        if (isAvailable !== undefined) patient.isAvailable = Boolean(isAvailable);

        await patient.save();

        // Sync with common User fields
        const user = await User.findById(req.user.id);
        if (user) {
            if (phone !== undefined) user.phone = phone;
            if (city !== undefined) user.city = city;
            if (address !== undefined) user.address = address;
            if (bloodGroup !== undefined) user.bloodGroup = bloodGroup || null;
            if (isAvailable !== undefined) user.isAvailable = Boolean(isAvailable);
            await user.save();
        }

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
        const patientTargetId = req.params.patientId || req.user.id;

        // Role authorization check: if doctor or hospital is requesting, verify or allow; if patient, ensure own id
        if (req.user.role === "patient" && patientTargetId.toString() !== req.user.id.toString()) {
            return validationErrorResponse(res, "Cannot access another patient's records");
        }

        const records = await MedicalRecord.find({
            patientId: patientTargetId,
        }).sort({ date: -1, createdAt: -1 });

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

const addMedicalRecord = async (req, res) => {
    try {
        const { title, recordType, description, date } = req.body;

        if (!title) {
            return validationErrorResponse(res, "Title is required for medical record");
        }

        const record = await MedicalRecord.create({
            patientId: req.user.id,
            title: title.trim(),
            recordType: recordType || "Medical Record",
            description: description || "",
            date: date ? new Date(date) : new Date(),
        });

        return successResponse(
            res,
            "Medical record created successfully",
            { record },
            201
        );
    } catch (error) {
        return serverErrorResponse(res, "Unable to create medical record", error);
    }
};

const deleteMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid record ID");
        }

        const record = await MedicalRecord.findOne({
            _id: id,
            patientId: req.user.id,
        });

        if (!record) {
            return notFoundResponse(res, "Medical record not found or unauthorized");
        }

        await MedicalRecord.findByIdAndDelete(id);

        return successResponse(res, "Medical record deleted successfully");
    } catch (error) {
        return serverErrorResponse(res, "Unable to delete medical record", error);
    }
};

/**
 * Location-Aware Blood Donor Search
 * Rules:
 * - Uses existing bloodGroup field
 * - Uses existing city/location field
 * - Only isAvailable === true users
 * - Specific blood-group search must exclude null/empty bloodGroup
 * - Prioritize geographically closer locations (originCity matching first)
 */
const searchBloodDonors = async (req, res) => {
    try {
        const { bloodGroup, originCity = "", search = "" } = req.query;

        const query = {
            isAvailable: true,
            isActive: true,
            bloodGroup: { $ne: null, $nin: ["", "Not Provided"] },
        };

        if (bloodGroup && bloodGroup !== "All Blood Groups" && bloodGroup !== "All") {
            query.bloodGroup = bloodGroup;
        }

        if (search) {
            const searchRegex = new RegExp(search.trim(), "i");
            query.$or = [
                { name: searchRegex },
                { city: searchRegex },
                { address: searchRegex },
            ];
        }

        const donors = await User.find(query)
            .select("name email phone bloodGroup city address isAvailable role")
            .lean();

        // Sort: donors in the originCity come first
        if (originCity) {
            const origin = originCity.trim().toLowerCase();
            donors.sort((a, b) => {
                const aCity = (a.city || "").toLowerCase();
                const bCity = (b.city || "").toLowerCase();

                if (aCity === origin && bCity !== origin) return -1;
                if (bCity === origin && aCity !== origin) return 1;
                return aCity.localeCompare(bCity);
            });
        }

        return successResponse(res, "Blood donors retrieved successfully", {
            donors,
            count: donors.length,
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to search blood donors", error);
    }
};

module.exports = {
    getPatientProfile,
    updatePatientProfile,
    getMedicalRecords,
    addMedicalRecord,
    deleteMedicalRecord,
    searchBloodDonors,
};