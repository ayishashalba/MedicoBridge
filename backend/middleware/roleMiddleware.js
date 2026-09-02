const authorize = (...roles) => {
    const normalizedRoles = roles.map((r) => String(r).toLowerCase());

    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access",
            });
        }

        const userRole = String(req.user.role).toLowerCase();

        if (!normalizedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "Access forbidden: insufficient permissions",
            });
        }

        next();
    };
};

module.exports = authorize;