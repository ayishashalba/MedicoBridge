const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const Pharmacy = require('../models/Pharmacy');
const generateOtp = require('../utils/generateOtp');
const { sendOtpEmail } = require('../services/emailService');
const {
  sendSuccess,
  sendValidationError,
  sendUnauthorized,
  sendNotFound,
  sendServerError,
  sendForbidden,
} = require('../utils/responseHandler');
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'medicobridge_secret_key_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
/**
 * Fetch role profile helper
 */
const getRoleProfile = async (user) => {
  if (user.role === 'Patient') {
    return await Patient.findOne({ userId: user._id });
  } else if (user.role === 'Doctor') {
    return await Doctor.findOne({ userId: user._id });
  } else if (user.role === 'Hospital') {
    return await Hospital.findOne({ userId: user._id });
  } else if (user.role === 'Pharmacy') {
    return await Pharmacy.findOne({ userId: user._id });
  }
  return null;
};

// @desc    Register a new user (Patient, Doctor, Hospital, Pharmacy)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      dob,
      gender,
      bloodGroup,
      city,
      address,
      isDonorAvailable,
      // Doctor fields
      specialization,
      medRegNumber,
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
      hospitalId,
      // Hospital fields
      regNumber,
      state,
      hospitalType,
      departments,
      // Pharmacy fields
      licenseNumber,
      pharmacyType,
    } = req.body;

    if (!name || !email || !password || !role) {
      return sendValidationError(res, 'Validation failed', [
        'Name, email, password, and role are required.',
      ]);
    }

    if (!isValidEmail(email)) {
      return sendValidationError(res, 'Validation failed', ['Invalid email format.']);
    }

    const allowedRoles = ['Patient', 'Doctor', 'Hospital', 'Pharmacy'];
    if (!allowedRoles.includes(role)) {
      return sendValidationError(res, 'Validation failed', [
        `Role must be one of: ${allowedRoles.join(', ')}`,
      ]);
    }

    if (password.length < 6) {
      return sendValidationError(res, 'Validation failed', [
        'Password must be at least 6 characters.',
      ]);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      if (!existingUser.isVerified) {
        // Resend fresh OTP
        const otp = generateOtp();
        const otpExpiresAt = new Date(
          Date.now() + (parseInt(process.env.OTP_EXPIRE_MINUTES) || 10) * 60 * 1000
        );
        existingUser.otpCode = otp;
        existingUser.otpExpiresAt = otpExpiresAt;
        await existingUser.save({ validateBeforeSave: false });

        await sendOtpEmail(existingUser.email, otp, existingUser.role);
        return sendSuccess(
          res,
          'Account already exists but is unverified. A new verification OTP has been sent to your email.',
          {
            email: existingUser.email,
            role: existingUser.role,
            requiresVerification: true,
          },
          200
        );
      }
      return sendValidationError(res, 'Validation failed', [
        'An account with this email already exists. Please log in.',
      ]);
    }

    // Generate secure OTP
    const otp = generateOtp();
    const otpExpiresAt = new Date(
      Date.now() + (parseInt(process.env.OTP_EXPIRE_MINUTES) || 10) * 60 * 1000
    );

    // Create User record
    const user = await User.create({
      email: email.toLowerCase().trim(),
      password,
      role,
      phone: phone || '',
      dob: dob || null,
      gender: gender || '',
      bloodGroup: bloodGroup || null,
      city: city || '',
      address: address || '',
      isDonorAvailable: isDonorAvailable === true || isDonorAvailable === 'true',
      isVerified: false,
      otpCode: otp,
      otpExpiresAt,
      status: 'active',
    });

    // Create Role-specific Profile
    if (role === 'Patient') {
      await Patient.create({
        userId: user._id,
        name: name.trim(),
        email: user.email,
        phone: phone || '',
        dob: dob || null,
        gender: gender || '',
        bloodGroup: bloodGroup || null,
        city: city || '',
        address: address || '',
        isDonorAvailable: isDonorAvailable === true || isDonorAvailable === 'true',
      });
    } else if (role === 'Doctor') {
      const profileImg = req.files?.profileImage?.[0];
      const licenseImg = req.files?.medicalLicense?.[0];

      await Doctor.create({
        userId: user._id,
        name: name.trim(),
        email: user.email,
        phone: phone || '',
        gender: gender || '',
        bloodGroup: bloodGroup || null,
        city: city || '',
        medRegNumber: medRegNumber || '',
        specialization: specialization || 'General Physician',
        qualification: qualification || '',
        experience: experience || '',
        practiceType: practiceType || 'Hospital',
        hospitalName: hospitalName || '',
        branchLocation: branchLocation || '',
        department: department || '',
        clinicName: clinicName || '',
        clinicAddress: clinicAddress || '',
        clinicCity: clinicCity || '',
        clinicState: clinicState || '',
        clinicPincode: clinicPincode || '',
        isDonorAvailable: isDonorAvailable === true || isDonorAvailable === 'true',
        profileImage: profileImg ? `/uploads/doctors/${profileImg.filename}` : '',
        medicalLicense: licenseImg ? `/uploads/doctors/${licenseImg.filename}` : '',
        hospitalId: hospitalId || null,
        status: 'pending',
      });
    } else if (role === 'Hospital') {
      const licenseImg = req.files?.medicalLicense?.[0];
      let depts = [];
      if (Array.isArray(departments)) {
        depts = departments;
      } else if (typeof departments === 'string' && departments.trim()) {
        try {
          depts = JSON.parse(departments);
        } catch {
          depts = departments.split(',').map((d) => d.trim()).filter(Boolean);
        }
      }

      await Hospital.create({
        userId: user._id,
        name: name.trim(),
        email: user.email,
        phone: phone || '',
        regNumber: regNumber || `REG-${Date.now()}`,
        address: address || '',
        city: city || '',
        state: state || '',
        hospitalType: hospitalType || 'General Hospital',
        departments: depts,
        medicalLicense: licenseImg ? `/uploads/hospitals/${licenseImg.filename}` : '',
        status: 'pending',
      });
    } else if (role === 'Pharmacy') {
      await Pharmacy.create({
        userId: user._id,
        name: name.trim(),
        email: user.email,
        phone: phone || '',
        licenseNumber: licenseNumber || '',
        address: address || '',
        city: city || '',
        state: state || '',
        type: pharmacyType || 'Retail',
        status: 'pending',
      });
    }

    // Send OTP email
    await sendOtpEmail(user.email, otp, role);

    return sendSuccess(
      res,
      'Registration successful! Please check your email for the OTP verification code.',
      {
        email: user.email,
        role: user.role,
        requiresVerification: true,
      },
      201
    );
  } catch (error) {
    return sendServerError(res, 'Registration failed. Please try again.', error);
  }
};

// @desc    Verify OTP and activate account
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return sendValidationError(res, 'Validation failed', ['Email and OTP are required.']);
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return sendNotFound(res, 'Account not found. Please register.');
    }

    if (user.isVerified) {
      return sendValidationError(res, 'Validation failed', [
        'Account is already verified. Please log in.',
      ]);
    }

    if (!user.otpCode) {
      return sendValidationError(res, 'Validation failed', [
        'No active OTP found. Please request a new code.',
      ]);
    }

    if (user.otpCode !== otp.toString().trim()) {
      return sendValidationError(res, 'Invalid OTP code. Please try again.', [
        'Invalid OTP. Please try again.',
      ]);
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      return sendValidationError(res, 'OTP has expired. Please request a new code.', [
        'OTP has expired. Please request a new code.',
      ]);
    }

    // Mark user verified
    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save({ validateBeforeSave: false });

    // Fetch role profile
    const profile = await getRoleProfile(user);
    const token = generateToken(user._id);

    return sendSuccess(res, 'Email verified successfully! Welcome to MedicoBridge.', {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: true,
        status: user.status,
        profile,
      },
    });
  } catch (error) {
    return sendServerError(res, 'OTP verification failed.', error);
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendValidationError(res, 'Validation failed', ['Email is required.']);
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return sendNotFound(res, 'Account not found. Please register.');
    }

    if (user.isVerified) {
      return sendValidationError(res, 'Validation failed', [
        'Account is already verified. Please log in.',
      ]);
    }

    const otp = generateOtp();
    const otpExpiresAt = new Date(
      Date.now() + (parseInt(process.env.OTP_EXPIRE_MINUTES) || 10) * 60 * 1000
    );

    user.otpCode = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save({ validateBeforeSave: false });

    await sendOtpEmail(user.email, otp, user.role);

    return sendSuccess(res, 'A new verification OTP has been sent to your email.', {
      email: user.email,
    });
  } catch (error) {
    return sendServerError(res, 'Failed to resend OTP.', error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return sendValidationError(res, 'Validation failed', [
        'Email and password are required.',
      ]);
    }

    if (!isValidEmail(email)) {
      return sendValidationError(res, 'Validation failed', ['Invalid email format.']);
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      // For Patient login: use generic message to avoid revealing whether a non-patient account exists
      if (role === 'Patient') {
        return sendNotFound(res, "User doesn't exist. Please register.");
      }
      return sendNotFound(res, 'Account not found. Please register.');
    }

    if (role && user.role !== role && user.role !== 'Admin') {
      // For Patient login: never reveal that the email belongs to another role
      if (role === 'Patient') {
        return sendNotFound(res, "User doesn't exist. Please register.");
      }
      return sendUnauthorized(
        res,
        `This account is registered as ${user.role}. Please use ${user.role} Login.`
      );
    }

    if (!user.isVerified) {
      // Send fresh OTP
      const otp = generateOtp();
      const otpExpiresAt = new Date(
        Date.now() + (parseInt(process.env.OTP_EXPIRE_MINUTES) || 10) * 60 * 1000
      );
      user.otpCode = otp;
      user.otpExpiresAt = otpExpiresAt;
      await user.save({ validateBeforeSave: false });
      await sendOtpEmail(user.email, otp, user.role);

      return res.status(403).json({
        success: false,
        message: 'Email not verified. A new OTP has been sent to your email.',
        unverified: true,
        email: user.email,
        role: user.role,
      });
    }

    if (user.status === 'blocked') {
      return sendForbidden(res, 'Your account has been blocked. Please contact support.');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendUnauthorized(res, 'Invalid email or password.');
    }

    const profile = await getRoleProfile(user);
    const token = generateToken(user._id);

    return sendSuccess(res, 'Login successful.', {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        profile,
      },
    });
  } catch (error) {
    return sendServerError(res, 'Login failed.', error);
  }
};
// @desc    Login patient with Google
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { credential, role } = req.body;

    if (!credential) {
      return sendValidationError(res, 'Validation failed', [
        'Google credential is required.',
      ]);
    }

    if (role !== 'Patient') {
      return sendUnauthorized(
        res,
        'Google login is available only for Patient accounts.'
      );
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return sendServerError(
        res,
        'Google login is not configured on the server.'
      );
    }

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return sendUnauthorized(
        res,
        'Invalid Google authentication.'
      );
    }

    const {
      sub: googleId,
      email,
      email_verified: emailVerified,
      name,
      picture,
    } = payload;

    if (!email || !emailVerified) {
      return sendUnauthorized(
        res,
        'Google account email could not be verified.'
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find existing account
    let user = await User.findOne({
      email: normalizedEmail,
    });

    if (user) {
      // Google login is only for Patient — never reveal other roles
      if (user.role !== 'Patient') {
        return sendNotFound(
          res,
          "User doesn't exist. Please register."
        );
      }

      if (user.status === 'blocked') {
        return sendForbidden(
          res,
          'Your account has been blocked. Please contact support.'
        );
      }

      // Google verified the email
      if (!user.isVerified) {
        user.isVerified = true;
        user.otpCode = null;
        user.otpExpiresAt = null;
        await user.save({ validateBeforeSave: false });
      }

      // Update Google ID if your User model supports it
      if (user.googleId !== googleId) {
        user.googleId = googleId;
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // Create a new Patient account from Google
      user = await User.create({
        email: normalizedEmail,
        role: 'Patient',
        password: `google_${googleId}_${Date.now()}`,
        isVerified: true,
        status: 'active',
        googleId,
      });

      await Patient.create({
        userId: user._id,
        name: name || 'Patient',
        email: normalizedEmail,
        phone: '',
        dob: null,
        gender: '',
        bloodGroup: null,
        city: '',
        address: '',
        isDonorAvailable: false,
      });
    }

    const profile = await getRoleProfile(user);
    const token = generateToken(user._id);

    return sendSuccess(res, 'Google login successful.', {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: true,
        status: user.status,
        profile,
        picture: picture || '',
      },
    });
  } catch (error) {
    console.error('Google login error:', error);

    return sendServerError(
      res,
      'Google login failed. Please try again.',
      error
    );
  }
};
// @desc    Logout (client token removal acknowledgement)
// @route   GET /api/auth/logout
// @access  Private
const logout = (req, res) => {
  return sendSuccess(res, 'Logged out successfully. Please clear your local session.');
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = req.user;
    const profile = await getRoleProfile(user);

    return sendSuccess(res, 'User fetched successfully.', {
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
      profile,
    });
  } catch (error) {
    return sendServerError(res, 'Failed to fetch user.', error);
  }
};

// Alias for hospital register route if called via register-hospital
const registerHospital = register;
const verifyOTP = verifyOtp;
const resendOTP = resendOtp;

module.exports = {
  register,
  registerHospital,
  verifyOtp,
  verifyOTP,
  resendOtp,
  resendOTP,
  login,
  googleLogin,
  logout,
  getMe,
};