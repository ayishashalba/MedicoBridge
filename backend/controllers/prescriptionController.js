const Prescription = require("../models/Prescription");

const createPrescription = async (req, res) => {
    try {
        const { patientId, medicine, dosage, duration, notes } = req.body;

        if (!patientId || !medicine || !dosage || !duration) {
            return res.status(400).json({
                success: false,
                message: "Invalid prescription details",
            });
        }

        const prescription = await Prescription.create({
            patientId,
            doctorId: req.user.id,
            medicine,
            dosage,
            duration,
            notes,
        });

        return res.status(201).json({
            success: true,
            message: "Prescription created",
            data: prescription,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

const getPrescriptions = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({
            patientId: req.user.id,
        })
            .populate("doctorId", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: prescriptions,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

module.exports = {
    createPrescription,
    getPrescriptions,
};