const MedicalRecord = require('../models/MedicalRecord');

const getMedicalRecords = async (req, res) => {
    try {
        const {
            search = '',
            recordType = '',
            patientId = '',
        } = req.query;

        const query = {};

        if (recordType && recordType !== 'All') {
            query.recordType = recordType;
        }

        if (patientId) {
            query.patientId = patientId;
        }

        if (search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');

            query.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { doctorName: searchRegex },
                { hospitalName: searchRegex },
                { recordType: searchRegex },
            ];
        }

        const records = await MedicalRecord.find(query)
            .populate('patientId')
            .populate('doctorId')
            .populate('hospitalId')
            .sort({ date: -1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Medical records fetched successfully.',
            data: records,
        });
    } catch (error) {
        console.error('Get medical records error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch medical records.',
            error: error.message,
        });
    }
};

const getMedicalRecordById = async (req, res) => {
    try {
        const record = await MedicalRecord.findById(req.params.id)
            .populate('patientId')
            .populate('doctorId')
            .populate('hospitalId');

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Medical record not found.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Medical record fetched successfully.',
            data: record,
        });
    } catch (error) {
        console.error('Get medical record error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch medical record.',
            error: error.message,
        });
    }
};

module.exports = {
    getMedicalRecords,
    getMedicalRecordById,
};