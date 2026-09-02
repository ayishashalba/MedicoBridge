const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");
const Pharmacy = require("../models/pharmacy");
const OtpVerification = require("../models/OtpVerification");
const { sendOtpEmail } = require("../services/emailService");
const {
    successResponse,
    validationErrorResponse,
    unauthorizedResponse,
    forbiddenResponse,
    notFoundResponse,
    serverErrorResponse,
} = require("../utils/apiResponse");
const { validateEmail } = require("../utils/validators");

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE || "7d",
        }
    );
};

/**
 * Generate cryptographically secure 6-digit OTP
 */
const generateSixDigitOtp = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

/**
 * POST /api/auth/register
 * Supports OTP verification for Patient role.
 */
const register = async (req, res, next) => {
    try {
        const {
            name,
            fullName,
            email,
            password,
            role = "patient",
            phone = "",
            city = "",
            address = "",
            bloodGroup = "",
            dateOfBirth,
            dob,
            gender = "",
            emergencyContact = "",
            isDonorAvailable,
            isAvailable,
        } = req.body;

        const displayName = (name || fullName || "").trim();
        const birthDate = dateOfBirth || dob || null;
        const donorStatus = isDonorAvailable !== undefined ? Boolean(isDonorAvailable) : (isAvailable !== undefined ? Boolean(isAvailable) : false);

        if (!displayName || !email || !password || !role) {
            return validationErrorResponse(res, "Validation failed", [
                "Name is required",
                "Email is required",
                "Password is required",
                "Role is required",
            ]);
        }

        if (!validateEmail(email)) {
            return validationErrorResponse(res, "Invalid email format");
        }

        if (typeof password !== "string" || password.length < 6) {
            return validationErrorResponse(res, "Password must be at least 6 characters long");
        }

        const allowedRoles = ["patient", "doctor", "hospital", "pharmacy"];
        const normalizedRole = role.toLowerCase().trim();

        if (!allowedRoles.includes(normalizedRole)) {
            return validationErrorResponse(res, "Invalid registration role");
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        // If user exists and is already verified, disallow re-registration
        if (existingUser && existingUser.isEmailVerified) {
            return validationErrorResponse(res, "Email already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // ── PATIENT OTP REGISTRATION FLOW ───────────────────────
        if (normalizedRole === "patient") {
            const otp = generateSixDigitOtp();
            const otpHash = await bcrypt.hash(otp, 10);
            const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            const registrationData = {
                name: displayName,
                email: normalizedEmail,
                password: hashedPassword,
                role: "patient",
                phone: phone ? phone.trim() : "",
                city: city ? city.trim() : "",
                address: address ? address.trim() : "",
                bloodGroup: bloodGroup && bloodGroup !== "Not Provided" ? bloodGroup : null,
                dateOfBirth: birthDate,
                gender: gender || "",
                emergencyContact: emergencyContact || "",
                isAvailable: donorStatus,
            };

            // Upsert pending OTP record
            await OtpVerification.findOneAndUpdate(
                { email: normalizedEmail, purpose: "registration" },
                {
                    email: normalizedEmail,
                    otpHash,
                    purpose: "registration",
                    registrationData,
                    expiresAt: otpExpiresAt,
                    attempts: 0,
                    verified: false,
                    lastResentAt: new Date(),
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            // Send OTP email
            await sendOtpEmail(normalizedEmail, otp, displayName);

            return successResponse(
                res,
                "OTP sent successfully to your email",
                {
                    email: normalizedEmail,
                    requiresOtpVerification: true,
                },
                200
            );
        }

        // ── OTHER ROLES REGISTRATION FLOW ──────────────────────
        // For doctor/hospital/pharmacy: create user record (subject to approval)
        const user = await User.create({
            name: displayName,
            email: normalizedEmail,
            password: hashedPassword,
            role: normalizedRole,
            phone: phone ? phone.trim() : "",
            city: city ? city.trim() : "",
            address: address ? address.trim() : "",
            bloodGroup: bloodGroup && bloodGroup !== "Not Provided" ? bloodGroup : null,
            isActive: true,
            isApproved: false,
            isEmailVerified: true,
        });

        if (normalizedRole === "doctor") {
            await Doctor.create({
                userId: user._id,
                doctorId: `DR-${Date.now()}`,
                specialization: req.body.specialization || "General Medicine",
                qualification: req.body.qualification || "",
                experience: Number(req.body.experience) || 0,
                licenseNumber: req.body.licenseNumber || "",
                clinicName: req.body.clinicName || "",
                consultationFee: Number(req.body.consultationFee) || 0,
                isApproved: false,
            });
        } else if (normalizedRole === "hospital") {
            await Hospital.create({
                userId: user._id,
                hospitalName: req.body.hospitalName || displayName,
                registrationNumber: req.body.registrationNumber || "",
                phone: user.phone,
                address: user.address,
                city: user.city,
                isApproved: false,
            });
        } else if (normalizedRole === "pharmacy") {
            await Pharmacy.create({
                userId: user._id,
                pharmacyName: req.body.pharmacyName || displayName,
                pharmacyType: req.body.pharmacyType || "retail",
                licenseNumber: req.body.licenseNumber || "",
                phone: user.phone,
                email: user.email,
                address: user.address,
                city: user.city,
                isApproved: false,
            });
        }

        return successResponse(
            res,
            "User registered successfully. Account is pending approval.",
            {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    city: user.city,
                    bloodGroup: user.bloodGroup,
                    isActive: user.isActive,
                    isApproved: user.isApproved,
                },
            },
            201
        );
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/verify-otp
 * Verifies submitted OTP, creates User & Patient records, and marks account verified.
 */
const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return validationErrorResponse(res, "Email and OTP are required");
        }

        if (!validateEmail(email)) {
            return validationErrorResponse(res, "Invalid email format");
        }

        const cleanOtp = String(otp).trim();
        if (!/^\d{6}$/.test(cleanOtp)) {
            return validationErrorResponse(res, "OTP must be a 6-digit numeric code");
        }

        const normalizedEmail = email.toLowerCase().trim();

        const otpRecord = await OtpVerification.findOne({
            email: normalizedEmail,
            purpose: "registration",
        });

        if (!otpRecord) {
            return validationErrorResponse(
                res,
                "No pending registration found for this email. Please register again."
            );
        }

        if (new Date() > new Date(otpRecord.expiresAt)) {
            return validationErrorResponse(
                res,
                "OTP has expired. Please request a new OTP."
            );
        }

        if (otpRecord.attempts >= 5) {
            return validationErrorResponse(
                res,
                "Maximum verification attempts exceeded. Please request a new OTP."
            );
        }

        // Increment attempts
        otpRecord.attempts += 1;

        const isMatch = await bcrypt.compare(cleanOtp, otpRecord.otpHash);

        if (!isMatch) {
            await otpRecord.save();
            return validationErrorResponse(
                res,
                "Invalid OTP code. Please check the code and try again."
            );
        }

        // OTP verified successfully
        otpRecord.verified = true;
        const regData = otpRecord.registrationData || {};

        // Find or create User
        let user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            user = await User.create({
                name: regData.name || "Patient",
                email: normalizedEmail,
                password: regData.password,
                role: "patient",
                phone: regData.phone || "",
                city: regData.city || "",
                address: regData.address || "",
                bloodGroup: regData.bloodGroup || null,
                isAvailable: Boolean(regData.isAvailable),
                isActive: true,
                isApproved: true,
                isEmailVerified: true,
            });
        } else {
            user.isEmailVerified = true;
            user.isActive = true;
            user.isApproved = true;
            if (regData.password) user.password = regData.password;
            if (regData.name) user.name = regData.name;
            if (regData.phone) user.phone = regData.phone;
            if (regData.city) user.city = regData.city;
            if (regData.address) user.address = regData.address;
            if (regData.bloodGroup !== undefined) user.bloodGroup = regData.bloodGroup;
            await user.save();
        }

        // Create Patient document if not exists
        let patient = await Patient.findOne({ userId: user._id });
        if (!patient) {
            patient = await Patient.create({
                userId: user._id,
                patientId: `PAT${Date.now()}${Math.floor(Math.random() * 1000)}`,
                dateOfBirth: regData.dateOfBirth ? new Date(regData.dateOfBirth) : null,
                gender: regData.gender || undefined,
                phone: user.phone,
                address: user.address,
                city: user.city,
                bloodGroup: user.bloodGroup,
                emergencyContact: regData.emergencyContact || "",
                isAvailable: user.isAvailable,
            });
        }

        // Remove the OTP record after successful registration
        await OtpVerification.deleteOne({ _id: otpRecord._id });

        return successResponse(res, "Email verified successfully. You can now login.", {
            verified: true,
            email: user.email,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/resend-otp
 * Resends a fresh 6-digit OTP with rate limiting protection.
 */
const resendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return validationErrorResponse(res, "Email is required");
        }

        if (!validateEmail(email)) {
            return validationErrorResponse(res, "Invalid email format");
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if already registered & verified
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser && existingUser.isEmailVerified) {
            return validationErrorResponse(
                res,
                "This email is already verified. You can proceed to login."
            );
        }

        const otpRecord = await OtpVerification.findOne({
            email: normalizedEmail,
            purpose: "registration",
        });

        if (!otpRecord) {
            return notFoundResponse(
                res,
                "No pending registration found for this email. Please register first."
            );
        }

        // Rate limit: 30 seconds cooldown between resends
        const now = Date.now();
        const lastSent = new Date(otpRecord.lastResentAt || otpRecord.updatedAt).getTime();
        const diffSeconds = Math.floor((now - lastSent) / 1000);

        if (diffSeconds < 30) {
            return validationErrorResponse(
                res,
                `Please wait ${30 - diffSeconds}s before requesting a new OTP.`
            );
        }

        const newOtp = generateSixDigitOtp();
        const newOtpHash = await bcrypt.hash(newOtp, 10);

        otpRecord.otpHash = newOtpHash;
        otpRecord.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        otpRecord.attempts = 0;
        otpRecord.lastResentAt = new Date();
        await otpRecord.save();

        const recipientName = otpRecord.registrationData?.name || "Patient";
        await sendOtpEmail(normalizedEmail, newOtp, recipientName);

        return successResponse(res, "A new OTP has been sent to your email", {
            email: normalizedEmail,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/login
 * Blocks unverified patients from logging in.
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return validationErrorResponse(res, "Validation failed", [
                "Email is required",
                "Password is required",
            ]);
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({
            email: normalizedEmail,
        }).select("+password");

        if (!user) {
            return unauthorizedResponse(res, "Invalid email or password");
        }

        if (!user.isActive) {
            return forbiddenResponse(res, "Your account has been blocked");
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return unauthorizedResponse(res, "Invalid email or password");
        }

        // ── EMAIL VERIFICATION ENFORCEMENT ─────────────────────
        if (user.role === "patient" && !user.isEmailVerified) {
            return forbiddenResponse(
                res,
                "Please verify your email using the OTP before logging in."
            );
        }

        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user);

        return successResponse(res, "Login successful", {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                city: user.city,
                bloodGroup: user.bloodGroup,
                isActive: user.isActive,
                isApproved: user.isApproved,
                isEmailVerified: user.isEmailVerified,
            },
        });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res) => {
    return successResponse(res, "User logged out successfully", {});
};

module.exports = {
    register,
    verifyOtp,
    resendOtp,
    login,
    logout,
};