require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const consultationRoutes = require("./routes/consultationRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const pharmacyRoutes = require("./routes/pharmacyRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const offerRoutes = require("./routes/offerRoutes");
const couponRoutes = require("./routes/couponRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const labReportRoutes = require("./routes/labReportRoutes");
const medicalReportRoutes = require("./routes/medicalReportRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const adminRoutes = require("./routes/adminRoutes");
const bloodDonorRoutes = require("./routes/bloodDonorRoutes");

const app = express();

// Database
connectDB();

// Middleware
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "MedicoBridge API is running",
        version: "2.0.0",
    });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/appointment", appointmentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/consultation", consultationRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/reviews", feedbackRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/lab-reports", labReportRoutes);
app.use("/api/medical-reports", medicalReportRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/blood-donors", bloodDonorRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("[ServerError]", err);

    res.status(err.statusCode || 500).json({
        success: false,
        message:
            process.env.NODE_ENV === "development"
                ? err.message
                : "Internal Server Error",
        ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`[Server] MedicoBridge API running on port ${PORT}`);
});