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
 * Patient & multi-role registration with Email OTP verification for Patient.
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

        // If an already verified account exists
        if (existingUser && (existingUser.emailVerified || existingUser.isEmailVerified)) {
            return validationErrorResponse(res, "Email is already registered");
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // ── PATIENT OTP REGISTRATION FLOW ───────────────────────
        if (normalizedRole === "patient") {
            const otp = generateSixDigitOtp();
            const otpHash = await bcrypt.hash(otp, 10);
            const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

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

            // Store in dedicated OtpVerification model
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

            // Also keep/update user in User collection if pending
            if (existingUser) {
                existingUser.name = displayName;
                existingUser.password = hashedPassword;
                existingUser.otpCode = otpHash;
                existingUser.otpExpiresAt = otpExpiresAt;
                existingUser.emailVerified = false;
                existingUser.isEmailVerified = false;
                await existingUser.save();
            } else {
                await User.create({
                    name: displayName,
                    email: normalizedEmail,
                    password: hashedPassword,
                    role: "patient",
                    phone: phone ? phone.trim() : "",
                    city: city ? city.trim() : "",
                    address: address ? address.trim() : "",
                    bloodGroup: bloodGroup && bloodGroup !== "Not Provided" ? bloodGroup : null,
                    isAvailable: donorStatus,
                    isActive: true,
                    isApproved: true,
                    emailVerified: false,
                    isEmailVerified: false,
                    otpCode: otpHash,
                    otpExpiresAt,
                });
            }

            // Send real OTP email
            const emailResult = await sendOtpEmail(normalizedEmail, otp, displayName);
            if (!emailResult.success && process.env.NODE_ENV === "production") {
                return validationErrorResponse(res, "Unable to send verification email");
            }

            return successResponse(
                res,
                "OTP sent to your email",
                {
                    email: normalizedEmail,
                    requiresVerification: true,
                },
                200
            );
        }

        // ── OTHER ROLES REGISTRATION FLOW (Doctor / Hospital / Pharmacy) ──
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
            emailVerified: true,
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
 * Verifies OTP, activates account, generates JWT, and returns authenticated data for direct Dashboard login.
 */
const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return validationErrorResponse(res, "Invalid OTP");
        }

        if (!validateEmail(email)) {
            return validationErrorResponse(res, "Invalid email format");
        }

        const cleanOtp = String(otp).trim();
        if (!/^\d{6}$/.test(cleanOtp)) {
            return validationErrorResponse(res, "Invalid OTP");
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check user & OTP record
        const user = await User.findOne({ email: normalizedEmail });
        const otpRecord = await OtpVerification.findOne({
            email: normalizedEmail,
            purpose: "registration",
        });

        if (!user && !otpRecord) {
            return notFoundResponse(res, "Registration not found");
        }

        if (user && (user.emailVerified || user.isEmailVerified)) {
            return validationErrorResponse(res, "Email is already verified");
        }

        const effectiveExpiresAt = otpRecord?.expiresAt || user?.otpExpiresAt;
        if (!effectiveExpiresAt || new Date() > new Date(effectiveExpiresAt)) {
            return validationErrorResponse(res, "OTP has expired");
        }

        const storedOtpHash = otpRecord?.otpHash || user?.otpCode;
        if (!storedOtpHash) {
            return validationErrorResponse(res, "Registration not found");
        }

        const isMatch = await bcrypt.compare(cleanOtp, storedOtpHash);

        if (!isMatch) {
            if (otpRecord) {
                otpRecord.attempts = (otpRecord.attempts || 0) + 1;
                await otpRecord.save();
            }
            return validationErrorResponse(res, "Invalid OTP");
        }

        // OTP is valid! Mark email as verified
        const regData = otpRecord?.registrationData || {};

        let activeUser = user;
        if (!activeUser) {
            activeUser = await User.create({
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
                emailVerified: true,
                isEmailVerified: true,
                otpCode: null,
                otpExpiresAt: null,
            });
        } else {
            activeUser.emailVerified = true;
            activeUser.isEmailVerified = true;
            activeUser.isActive = true;
            activeUser.isApproved = true;
            activeUser.otpCode = null;
            activeUser.otpExpiresAt = null;
            if (regData.password) activeUser.password = regData.password;
            if (regData.name) activeUser.name = regData.name;
            if (regData.phone) activeUser.phone = regData.phone;
            if (regData.city) activeUser.city = regData.city;
            if (regData.address) activeUser.address = regData.address;
            if (regData.bloodGroup !== undefined) activeUser.bloodGroup = regData.bloodGroup;
            if (regData.isAvailable !== undefined) activeUser.isAvailable = regData.isAvailable;
            await activeUser.save();
        }

        // Ensure Patient document exists and is linked
        let patient = await Patient.findOne({ userId: activeUser._id });
        if (!patient) {
            patient = await Patient.create({
                userId: activeUser._id,
                patientId: `PAT${Date.now()}${Math.floor(Math.random() * 1000)}`,
                dateOfBirth: regData.dateOfBirth ? new Date(regData.dateOfBirth) : null,
                gender: regData.gender || undefined,
                phone: activeUser.phone,
                address: activeUser.address,
                city: activeUser.city,
                bloodGroup: activeUser.bloodGroup,
                emergencyContact: regData.emergencyContact || "",
                isAvailable: activeUser.isAvailable,
            });
        } else {
            if (regData.dateOfBirth) patient.dateOfBirth = new Date(regData.dateOfBirth);
            if (regData.gender) patient.gender = regData.gender;
            if (activeUser.phone) patient.phone = activeUser.phone;
            if (activeUser.address) patient.address = activeUser.address;
            if (activeUser.city) patient.city = activeUser.city;
            if (activeUser.bloodGroup) patient.bloodGroup = activeUser.bloodGroup;
            await patient.save();
        }

        // Clean up OtpVerification record
        await OtpVerification.deleteMany({ email: normalizedEmail });

        // Generate JWT token for immediate dashboard login
        const token = generateToken(activeUser);

        return successResponse(res, "Email verified successfully", {
            token,
            user: {
                id: activeUser._id,
                name: activeUser.name,
                email: activeUser.email,
                role: activeUser.role,
                phone: activeUser.phone,
                city: activeUser.city,
                bloodGroup: activeUser.bloodGroup,
                emailVerified: true,
                isEmailVerified: true,
                isActive: activeUser.isActive,
                isApproved: activeUser.isApproved,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/resend-otp
 * Resends fresh 6-digit OTP with 5-minute expiry.
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

        const user = await User.findOne({ email: normalizedEmail });
        const otpRecord = await OtpVerification.findOne({
            email: normalizedEmail,
            purpose: "registration",
        });

        if (!user && !otpRecord) {
            return notFoundResponse(res, "Registration not found");
        }

        if (user && (user.emailVerified || user.isEmailVerified)) {
            return validationErrorResponse(res, "Email is already verified");
        }

        // Rate limiting cooldown (30 seconds)
        const lastSent = otpRecord?.lastResentAt ? new Date(otpRecord.lastResentAt).getTime() : 0;
        const diffSeconds = Math.floor((Date.now() - lastSent) / 1000);
        if (diffSeconds < 30) {
            return validationErrorResponse(
                res,
                `Please wait ${30 - diffSeconds}s before requesting a new OTP`
            );
        }

        const newOtp = generateSixDigitOtp();
        const newOtpHash = await bcrypt.hash(newOtp, 10);
        const newExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

        if (otpRecord) {
            otpRecord.otpHash = newOtpHash;
            otpRecord.expiresAt = newExpiresAt;
            otpRecord.attempts = 0;
            otpRecord.lastResentAt = new Date();
            await otpRecord.save();
        }

        if (user) {
            user.otpCode = newOtpHash;
            user.otpExpiresAt = newExpiresAt;
            await user.save();
        }

        const recipientName = otpRecord?.registrationData?.name || user?.name || "Patient";
        const emailResult = await sendOtpEmail(normalizedEmail, newOtp, recipientName);

        if (!emailResult.success && process.env.NODE_ENV === "production") {
            return validationErrorResponse(res, "Unable to send verification email");
        }

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
        if (user.role === "patient" && !user.emailVerified && !user.isEmailVerified) {
            return forbiddenResponse(
                res,
                "Please verify your email before logging in"
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
                emailVerified: Boolean(user.emailVerified || user.isEmailVerified),
                isEmailVerified: Boolean(user.emailVerified || user.isEmailVerified),
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