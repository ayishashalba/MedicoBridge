const Appointment = require("../models/Appointment");

const getAdminAppointments = async (req, res) => {
    try {
        const {
            search = "",
            status = "",
            type = "",
        } = req.query;

        const query = {};

        if (status && status !== "All") {
            const statusMap = {
                Upcoming: "Confirmed",
                Ongoing: "In-Progress",
                Completed: "Completed",
                Cancelled: "Cancelled",
            };

            query.status = statusMap[status] || status;
        }

        if (type && type !== "All") {
            const typeMap = {
                "Video Consultation": "Online Consultation",
                "In-Clinic Visit": "In-Person",
            };

            query.type = typeMap[type] || type;
        }

        const appointments = await Appointment.find(query)
            .populate("patientId")
            .populate("doctorId")
            .populate("hospitalId")
            .sort({ date: -1, createdAt: -1 });

        const searchText = search.trim().toLowerCase();

        const formattedAppointments = appointments
            .map((appointment) => {
                const patient = appointment.patientId || {};
                const doctor = appointment.doctorId || {};
                const hospital = appointment.hospitalId || {};

                const appointmentDate = appointment.date
                    ? new Date(appointment.date)
                    : null;

                let computedStatus = appointment.status;

                if (appointment.status === "Cancelled") {
                    computedStatus = "Cancelled";
                } else if (appointment.status === "Completed") {
                    computedStatus = "Completed";
                } else if (appointmentDate) {
                    const now = new Date();

                    if (appointmentDate > now) {
                        computedStatus = "Upcoming";
                    } else if (appointment.status === "In-Progress") {
                        computedStatus = "Ongoing";
                    } else if (
                        appointment.status === "Pending" ||
                        appointment.status === "Confirmed"
                    ) {
                        computedStatus = "Overdue";
                    }
                }

                const patientName =
                    patient.name ||
                    patient.fullName ||
                    patient.userId?.name ||
                    "Patient";

                const doctorName =
                    doctor.name ||
                    doctor.fullName ||
                    doctor.userId?.name ||
                    "Doctor";

                const hospitalName =
                    hospital.name ||
                    hospital.hospitalName ||
                    "Independent / Not Assigned";

                const specialization =
                    doctor.specialization ||
                    doctor.department ||
                    "General";

                const patientPhone =
                    patient.phone ||
                    patient.userId?.phone ||
                    "";

                return {
                    id: appointment.appointmentId || appointment._id.toString(),

                    _id: appointment._id,

                    patientId:
                        patient.patientId ||
                        patient._id?.toString() ||
                        appointment.patientId?._id?.toString() ||
                        "",

                    patientName,
                    patientPhone,

                    doctorId:
                        doctor.doctorId ||
                        doctor._id?.toString() ||
                        "",

                    doctorName,
                    specialization,

                    hospital:
                        hospitalName,

                    hospitalId:
                        hospital.hospitalId ||
                        hospital._id?.toString() ||
                        "",

                    department: appointment.department || doctor.department || "",

                    type:
                        appointment.type === "Online Consultation"
                            ? "Video Consultation"
                            : appointment.type === "In-Person"
                                ? "In-Clinic Visit"
                                : appointment.type,

                    date: appointmentDate
                        ? appointmentDate.toLocaleDateString("en-IN")
                        : "",

                    rawDate: appointment.date,

                    timeSlot: appointment.timeSlot || "",

                    fee: appointment.fee ?? 500,

                    paymentStatus: appointment.paymentStatus || "Pending",

                    status: appointment.status,

                    computedStatus,

                    reason: appointment.reason || "",

                    symptoms: Array.isArray(appointment.symptoms)
                        ? appointment.symptoms.join(", ")
                        : appointment.symptoms || "",

                    doctorNotes: appointment.notes || "",

                    cancellationReason:
                        appointment.cancellationReason || "",

                    cancelledBy:
                        appointment.cancelledBy || "",

                    roomUrl: "",

                    prescriptionIssued: false,

                    prescriptionId: "",

                    createdAt: appointment.createdAt,
                    updatedAt: appointment.updatedAt,
                };
            })
            .filter((appointment) => {
                if (!searchText) return true;

                return [
                    appointment.id,
                    appointment.patientName,
                    appointment.patientPhone,
                    appointment.doctorName,
                    appointment.specialization,
                    appointment.hospital,
                    appointment.patientId,
                ]
                    .filter(Boolean)
                    .some((value) =>
                        String(value).toLowerCase().includes(searchText)
                    );
            });

        return res.status(200).json({
            success: true,
            message: "Appointments fetched successfully.",
            data: formattedAppointments,
        });
    } catch (error) {
        console.error("Get admin appointments error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch appointments.",
            error: error.message,
        });
    }
};

const getAdminAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate("patientId")
            .populate("doctorId")
            .populate("hospitalId");

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Appointment fetched successfully.",
            data: appointment,
        });
    } catch (error) {
        console.error("Get admin appointment error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch appointment.",
            error: error.message,
        });
    }
};

module.exports = {
    getAdminAppointments,
    getAdminAppointmentById,
};