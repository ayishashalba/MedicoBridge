const mongoose = require('mongoose');

const doctorSettingsSchema = new mongoose.Schema(
    {
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            required: true,
            unique: true,
        },

        notifications: {
            appointmentReminders: {
                type: Boolean,
                default: true,
            },
            prescriptionUpdates: {
                type: Boolean,
                default: true,
            },
            labResults: {
                type: Boolean,
                default: true,
            },
            systemUpdates: {
                type: Boolean,
                default: false,
            },
            reminderTime: {
                type: String,
                default: '30 minutes before',
            },
        },

        privacy: {
            profileVisibility: {
                type: String,
                enum: ['Public', 'Private'],
                default: 'Public',
            },
            showOnlineStatus: {
                type: Boolean,
                default: true,
            },
            allowPatientMessages: {
                type: Boolean,
                default: true,
            },
            showContactInformation: {
                type: Boolean,
                default: true,
            },
        },

        language: {
            type: String,
            default: 'English',
        },

        theme: {
            mode: {
                type: String,
                enum: ['Light', 'Dark', 'System'],
                default: 'Light',
            },
            accent: {
                type: String,
                default: 'Teal',
            },
        },

        analytics: {
            enabled: {
                type: Boolean,
                default: true,
            },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('DoctorSettings', doctorSettingsSchema);