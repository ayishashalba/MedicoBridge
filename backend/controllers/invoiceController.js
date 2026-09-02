const Invoice = require("../models/Invoice");

const {
    successResponse,
    validationErrorResponse,
    notFoundResponse,
    serverErrorResponse,
    forbiddenResponse,
} = require("../utils/apiResponse");
const { isValidObjectId } = require("../utils/validators");

const generateInvoiceNumber = () => {
    return `INV${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

// Get Invoices
const getInvoices = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === "patient") {
            query.patientId = req.user.id;
        } else if (req.user.role === "hospital") {
            query.hospitalId = req.user.id;
        } else if (req.user.role === "doctor") {
            query.doctorId = req.user.id;
        } else if (req.user.role === "pharmacy") {
            query.pharmacyId = req.user.id;
        } else if (req.user.role === "admin") {
            // Admin boundary check: Admin MUST NOT manage hospital invoices
            // But can see general non-hospital platform summaries if requested or error
            return forbiddenResponse(res, "Admins are not permitted to manage or view private hospital/pharmacy invoices");
        }

        const invoices = await Invoice.find(query)
            .populate("patientId", "name email phone city")
            .populate("hospitalId", "name city")
            .populate("doctorId", "name specialization")
            .populate("pharmacyId", "name city")
            .sort({ issueDate: -1, createdAt: -1 });

        return successResponse(res, "Invoices retrieved successfully", {
            invoices,
            count: invoices.length,
        });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch invoices", error);
    }
};

// Get single invoice
const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = isValidObjectId(id) ? { _id: id } : { invoiceNumber: id };

        const invoice = await Invoice.findOne(query)
            .populate("patientId", "name email phone city address")
            .populate("hospitalId", "name city address phone")
            .populate("doctorId", "name email specialization")
            .populate("pharmacyId", "name city phone");

        if (!invoice) {
            return notFoundResponse(res, "Invoice not found");
        }

        const userId = req.user.id.toString();
        const role = req.user.role;

        if (role === "admin") {
            return forbiddenResponse(res, "Admins cannot inspect private patient/hospital invoices");
        }

        if (role === "patient" && invoice.patientId._id.toString() !== userId) {
            return forbiddenResponse(res, "Cannot access another patient's invoice");
        }

        if (role === "hospital" && (!invoice.hospitalId || invoice.hospitalId._id.toString() !== userId)) {
            return forbiddenResponse(res, "Cannot access another hospital's invoice");
        }

        return successResponse(res, "Invoice retrieved successfully", { invoice });
    } catch (error) {
        return serverErrorResponse(res, "Unable to fetch invoice", error);
    }
};

// Create Invoice (Hospital / Doctor / Pharmacy)
const createInvoice = async (req, res) => {
    try {
        // Admin restriction
        if (req.user.role === "admin") {
            return forbiddenResponse(res, "Admin is strictly prohibited from creating hospital/patient invoices");
        }

        const {
            patientId,
            doctorId,
            pharmacyId,
            type,
            items,
            tax,
            discount,
            dueDate,
            notes,
        } = req.body;

        if (!patientId || !items || !Array.isArray(items) || items.length === 0) {
            return validationErrorResponse(res, "Patient ID and at least one item are required");
        }

        if (!isValidObjectId(patientId)) {
            return validationErrorResponse(res, "Invalid patient ID");
        }

        let subtotal = 0;
        const processedItems = items.map((item) => {
            const amount = Number(item.amount) || 0;
            const quantity = Number(item.quantity) || 1;
            const total = Math.round(amount * quantity * 100) / 100;
            subtotal += total;
            return {
                description: item.description || "Medical Service",
                amount,
                quantity,
                total,
            };
        });

        subtotal = Math.round(subtotal * 100) / 100;
        const taxAmount = Number(tax) || 0;
        const discountAmount = Number(discount) || 0;
        const totalAmount = Math.max(0, Math.round((subtotal + taxAmount - discountAmount) * 100) / 100);

        const invoice = await Invoice.create({
            invoiceNumber: generateInvoiceNumber(),
            patientId,
            hospitalId: req.user.role === "hospital" ? req.user.id : null,
            doctorId: doctorId && isValidObjectId(doctorId) ? doctorId : (req.user.role === "doctor" ? req.user.id : null),
            pharmacyId: pharmacyId && isValidObjectId(pharmacyId) ? pharmacyId : (req.user.role === "pharmacy" ? req.user.id : null),
            type: type || (req.user.role === "hospital" ? "Hospital" : req.user.role === "pharmacy" ? "Pharmacy" : "Consultation"),
            items: processedItems,
            subtotal,
            tax: taxAmount,
            discount: discountAmount,
            totalAmount,
            paymentStatus: "Unpaid",
            issueDate: new Date(),
            dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            notes: notes || "",
        });

        return successResponse(res, "Invoice created successfully", { invoice }, 201);
    } catch (error) {
        return serverErrorResponse(res, "Unable to create invoice", error);
    }
};

// Update invoice payment status (Hospital, Doctor, or Pharmacy owner)
const updateInvoicePayment = async (req, res) => {
    try {
        if (req.user.role === "admin") {
            return forbiddenResponse(res, "Admin is strictly prohibited from modifying hospital invoices or payments");
        }

        const { id } = req.params;
        const { paymentStatus } = req.body;

        const query = isValidObjectId(id) ? { _id: id } : { invoiceNumber: id };
        const invoice = await Invoice.findOne(query);

        if (!invoice) {
            return notFoundResponse(res, "Invoice not found");
        }

        if (paymentStatus) {
            invoice.paymentStatus = paymentStatus;
        }

        await invoice.save();

        return successResponse(res, "Invoice payment status updated successfully", { invoice });
    } catch (error) {
        return serverErrorResponse(res, "Unable to update invoice payment", error);
    }
};

module.exports = {
    getInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoicePayment,
};
