const Consultation = require("../models/Consultation");

const saveConsultation = async (req, res) => {
    try {
        const { appointmentId, patientId, diagnosis, advice } = req.body;

        if (!appointmentId || !patientId) {
            return res.status(400).json({
                success: false,
                message: "Invalid consultation details",
            });
        }

        const consultation = await Consultation.create({
            appointmentId,
            patientId,
            doctorId: req.user.id,
            diagnosis,
            advice,
        });

        return res.status(201).json({
            success: true,
            message: "Consultation saved",
            data: consultation,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

const getConsultations = async (req, res) => {
    try {
        const consultations = await Consultation.find({
            patientId: req.user.id,
        })
            .populate("doctorId", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: consultations,
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
    saveConsultation,
    getConsultations,
};