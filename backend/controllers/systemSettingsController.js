const SystemSettings = require("../models/SystemSettings");

// GET SYSTEM SETTINGS
const getSystemSettings = async (req, res) => {
    try {
        let settings = await SystemSettings.findOne();

        // First time aanenkil default settings create cheyyum
        if (!settings) {
            settings = await SystemSettings.create({});
        }

        return res.status(200).json({
            success: true,
            message: "System settings fetched successfully.",
            data: settings,
        });
    } catch (error) {
        console.error("Get system settings error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch system settings.",
            error: error.message,
        });
    }
};

// UPDATE SYSTEM SETTINGS
const updateSystemSettings = async (req, res) => {
    try {
        const {
            maintenanceMode,
            autoVerifyMedicalRegistrations,
            telehealthEnabled,
            platformFeePercent,
            pharmacyDeliveryDistanceKm,
            paymentGateway,
        } = req.body;

        let settings = await SystemSettings.findOne();

        if (!settings) {
            settings = new SystemSettings();
        }

        if (maintenanceMode !== undefined) {
            settings.maintenanceMode = Boolean(maintenanceMode);
        }

        if (autoVerifyMedicalRegistrations !== undefined) {
            settings.autoVerifyMedicalRegistrations =
                Boolean(autoVerifyMedicalRegistrations);
        }

        if (telehealthEnabled !== undefined) {
            settings.telehealthEnabled = Boolean(telehealthEnabled);
        }

        if (platformFeePercent !== undefined) {
            const fee = Number(platformFeePercent);

            if (Number.isNaN(fee) || fee < 0 || fee > 50) {
                return res.status(400).json({
                    success: false,
                    message: "Platform fee must be between 0 and 50 percent.",
                });
            }

            settings.platformFeePercent = fee;
        }

        if (pharmacyDeliveryDistanceKm !== undefined) {
            const distance = Number(pharmacyDeliveryDistanceKm);

            if (Number.isNaN(distance) || distance < 1) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Pharmacy delivery distance must be at least 1 km.",
                });
            }

            settings.pharmacyDeliveryDistanceKm = distance;
        }

        if (paymentGateway !== undefined) {
            const allowedGateways = ["Razorpay", "Stripe", "Paytm"];

            if (!allowedGateways.includes(paymentGateway)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid payment gateway.",
                });
            }

            settings.paymentGateway = paymentGateway;
        }

        await settings.save();

        return res.status(200).json({
            success: true,
            message: "System settings updated successfully.",
            data: settings,
        });
    } catch (error) {
        console.error("Update system settings error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update system settings.",
            error: error.message,
        });
    }
};

module.exports = {
    getSystemSettings,
    updateSystemSettings,
};