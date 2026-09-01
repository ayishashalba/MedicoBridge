const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

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

const register = async (req, res, next) => {
    try {
        const {
            name,
            email,
            password,
            role,
            phone = "",
            city = "",
            address = "",
            bloodGroup = "",
        } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: [
                    "Name is required",
                    "Email is required",
                    "Password is required",
                    "Role is required",
                ],
            });
        }

        const allowedRoles = [
            "patient",
            "doctor",
            "hospital",
            "pharmacy",
        ];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid registration role",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role,
            phone,
            city,
            address,
            bloodGroup,
            isActive: true,
            isApproved: role === "patient" ? true : false,
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
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
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: [
                    "Email is required",
                    "Password is required",
                ],
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({
            email: normalizedEmail,
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked",
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
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
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res) => {
    return res.status(200).json({
        success: true,
        message: "User logged out successfully",
        data: {},
    });
};

module.exports = {
    register,
    login,
    logout,
};