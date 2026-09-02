const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");
const Pharmacy = require("../models/pharmacy");
const Appointment = require("../models/Appointment");
const Order = require("../models/Order");
const Medicine = require("../models/Medicine");
const AdminLog = require("../models/AdminLog");

const {
    successResponse,
    validationErrorResponse,
    notFoundResponse,
    serverErrorResponse,
    forbiddenResponse,
} = require("../utils/apiResponse");
const { isValidObjectId } = require("../utils/validators");

// Log administrative action
const logAdminAction = async (adminId, action, targetType, targetId, details = "", ipAddress = "") => {
    try {
        await AdminLog.create({
            adminId,
            action,
            targetType,
            targetId: targetId && isValidObjectId(targetId) ? targetId : null,
            details,
            ipAddress,
        });
    } catch (err) {
        console.error("Failed to write admin log:", err);
    }
};

// Admin: Get all users with filters (Supports tab, bloodGroup, search, status matching frontend getAdminUsers)
const getUsers = async (req, res) => {
    try {
        const { tab, bloodGroup, search, status, role } = req.query;

        const query = {};

        // Role filter
        if (role && role !== "All") {
            query.role = role.toLowerCase();
        } else if (tab && tab !== "all" && tab !== "All Users") {
            const roleMap = {
                patients: "patient",
                doctors: "doctor",
                hospitals: "hospital",
                pharmacies: "pharmacy",
                admins: "admin",
            };
            query.role = roleMap[tab.toLowerCase()] || tab.toLowerCase();
        }

        // Blood group filter
        if (bloodGroup && bloodGroup !== "All Blood Groups" && bloodGroup !== "All") {
            query.bloodGroup = bloodGroup;
        }

        // Status filter
        if (status && status !== "All Statuses" && status !== "All") {
            if (status.toLowerCase() === "active") query.isActive = true;
            if (status.toLowerCase() === "inactive" || status.toLowerCase() === "blocked") query.isActive = false;
            if (status.toLowerCase() === "pending") query.isApproved = false;
            if (status.toLowerCase() === "approved") query.isApproved = true;
        }

        // Search query
        if (search) {
            const searchRegex = new RegExp(search.trim(), "i");
            query.$or = [
                { name: searchRegex },
                { email: searchRegex },
                { phone: searchRegex },
                { city: searchRegex },
            ];
        }

        const users = await User.find(query)
            .select("-password")
            .sort({ createdAt: -1 })
            .lean();

        const formatted = users.map((u) => ({
            ...u,
            bloodGroup: u.bloodGroup || "Not Provided",
            accountStatus: u.isActive ? "Active" : "Blocked",
            approvalStatus: u.isApproved ? "Approved" : "Pending",
        }));

        return successResponse(res, "Users retrieved successfully", {
            users: formatted,
            count: formatted.length,
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch users", error);
    }
};

// Admin: Get single user details
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid user ID");
        }

        const user = await User.findById(id).select("-password");
        if (!user) {
            return notFoundResponse(res, "User not found");
        }

        let roleProfile = null;
        if (user.role === "doctor") {
            roleProfile = await Doctor.findOne({ userId: user._id });
        } else if (user.role === "hospital") {
            roleProfile = await Hospital.findOne({ userId: user._id });
        } else if (user.role === "pharmacy") {
            roleProfile = await Pharmacy.findOne({ userId: user._id });
        }

        return successResponse(res, "User details retrieved successfully", {
            user,
            roleProfile,
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch user details", error);
    }
};

// Admin: Update user active/blocked status
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid user ID");
        }

        if (typeof isActive !== "boolean") {
            return validationErrorResponse(res, "isActive boolean is required");
        }

        const user = await User.findById(id);
        if (!user) {
            return notFoundResponse(res, "User not found");
        }

        if (user.role === "admin" && user._id.toString() === req.user.id.toString()) {
            return validationErrorResponse(res, "Cannot change your own admin status");
        }

        user.isActive = isActive;
        await user.save();

        // Also update role profile
        if (user.role === "hospital") {
            await Hospital.findOneAndUpdate({ userId: user._id }, { isActive });
        } else if (user.role === "pharmacy") {
            await Pharmacy.findOneAndUpdate({ userId: user._id }, { isActive });
        }

        await logAdminAction(
            req.user.id,
            isActive ? "ACTIVATE_USER" : "BLOCK_USER",
            "User",
            user._id,
            `User ${user.email} status changed to ${isActive ? "Active" : "Blocked"}`
        );

        return successResponse(res, `User ${isActive ? "activated" : "blocked"} successfully`, {
            user: {
                id: user._id,
                email: user.email,
                isActive: user.isActive,
            },
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to update user status", error);
    }
};

// Admin: Approve / Reject role onboarding
const approveUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { isApproved } = req.body;

        if (!isValidObjectId(id)) {
            return validationErrorResponse(res, "Invalid user ID");
        }

        if (typeof isApproved !== "boolean") {
            return validationErrorResponse(res, "isApproved boolean is required");
        }

        const user = await User.findById(id);
        if (!user) {
            return notFoundResponse(res, "User not found");
        }

        user.isApproved = isApproved;
        await user.save();

        if (user.role === "doctor") {
            await Doctor.findOneAndUpdate({ userId: user._id }, { isApproved });
        } else if (user.role === "hospital") {
            await Hospital.findOneAndUpdate({ userId: user._id }, { isApproved });
        } else if (user.role === "pharmacy") {
            await Pharmacy.findOneAndUpdate({ userId: user._id }, { isApproved });
        }

        await logAdminAction(
            req.user.id,
            isApproved ? "APPROVE_ACCOUNT" : "REJECT_ACCOUNT",
            "User",
            user._id,
            `Account ${user.email} (${user.role}) approval set to ${isApproved}`
        );

        return successResponse(res, `User approval status updated to ${isApproved}`, {
            user: {
                id: user._id,
                email: user.email,
                isApproved: user.isApproved,
            },
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to update approval status", error);
    }
};

// Admin: Platform analytics & stats
const getPlatformStats = async (req, res) => {
    try {
        const [
            totalUsers,
            patientsCount,
            doctorsCount,
            hospitalsCount,
            pharmaciesCount,
            appointmentsCount,
            ordersCount,
            medicinesCount,
            pendingApprovals,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: "patient" }),
            User.countDocuments({ role: "doctor" }),
            User.countDocuments({ role: "hospital" }),
            User.countDocuments({ role: "pharmacy" }),
            Appointment.countDocuments(),
            Order.countDocuments(),
            Medicine.countDocuments(),
            User.countDocuments({ isApproved: false }),
        ]);

        return successResponse(res, "Platform statistics retrieved successfully", {
            stats: {
                totalUsers,
                patientsCount,
                doctorsCount,
                hospitalsCount,
                pharmaciesCount,
                appointmentsCount,
                ordersCount,
                medicinesCount,
                pendingApprovals,
            },
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch platform stats", error);
    }
};

// Admin: Get administrative audit logs
const getAdminLogs = async (req, res) => {
    try {
        const logs = await AdminLog.find()
            .populate("adminId", "name email role")
            .sort({ createdAt: -1 })
            .limit(100);

        return successResponse(res, "Admin logs retrieved successfully", { logs });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch admin logs", error);
    }
};

module.exports = {
    getUsers,
    getUserById,
    updateUserStatus,
    approveUser,
    getPlatformStats,
    getAdminLogs,
    logAdminAction,
};
