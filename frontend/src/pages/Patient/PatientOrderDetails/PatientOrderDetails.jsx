import React, { useState, useEffect } from "react";
import {
    FaArrowLeft,
    FaMapMarkerAlt,
    FaCreditCard,
    FaCheckCircle,
    FaDownload,
    FaClipboardList,
    FaPills,
    FaTruck,
    FaClock,
    FaBoxOpen,
    FaShoppingBag,
    FaArrowRight,
    FaRedo,
    FaReceipt,
    FaCalendarAlt,
    FaShieldAlt,
    FaSpinner,
    FaExclamationCircle,
    FaBan,
    FaTimes,
    FaInfoCircle,
    FaUndo,
    FaLock,
    FaUniversity,
    FaQrcode,
    FaMobileAlt,
    FaUpload,
    FaCheck,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../services/apiConfig";
import "./PatientOrderDetails.css";

const MEDICINE_ICONS = ["💊", "🧪", "💉", "🩺", "🔬", "🩹", "🌡️", "⚕️"];

function getMedicineIcon(name) {
    const hash = (name || "").charCodeAt(0) % MEDICINE_ICONS.length;
    return MEDICINE_ICONS[hash];
}

function PatientOrderDetails() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [rawItems, setRawItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cancellation Modal state
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelTarget, setCancelTarget] = useState(null); // { type: 'order' } or { type: 'item', item: medicineItem }
    const [cancelReason, setCancelReason] = useState("");
    const [cancelling, setCancelling] = useState(false);
    const [reordering, setReordering] = useState(false);

    // Refund Method Selection state
    const [selectedRefundMethod, setSelectedRefundMethod] = useState("UPI"); // 'UPI' | 'Bank Account' | 'QR Code'
    const [refundUpiId, setRefundUpiId] = useState("");
    const [refundAccountHolderName, setRefundAccountHolderName] = useState("");
    const [refundAccountNumber, setRefundAccountNumber] = useState("");
    const [refundIfscCode, setRefundIfscCode] = useState("");
    const [refundBankName, setRefundBankName] = useState("");
    const [refundQrCodeImage, setRefundQrCodeImage] = useState("");
    const [uploadingQr, setUploadingQr] = useState(false);

    const parseOrderData = (raw) => {
        setRawItems(raw.items || []);

        const dateFormatted = raw.createdAt
            ? new Date(raw.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
              })
            : "Recent";

        const timeFormatted = raw.createdAt
            ? new Date(raw.createdAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
              })
            : "";

        const status = raw.orderStatus || "Pending";
        // ── Map DB statuses to the 5-step display timeline ──────────────────
        // DB:      Pending   Confirmed  Processing  Shipped      Delivered
        // Display: OrderPlaced Confirmed  Packed      Dispatched   Delivered
        const isDelivered   = status === "Delivered";
        const isDispatched  = status === "Shipped" || isDelivered;
        const isPacked      = status === "Processing" || isDispatched;
        const isConfirmed   = status === "Confirmed" || isPacked || status === "Partially Cancelled";
        const isOrderPlaced = true; // always first step

        const timeline = [
            {
                step: "Order Placed",
                date: `${dateFormatted}${timeFormatted ? ', ' + timeFormatted : ''}`,
                completed: isOrderPlaced,
            },
            {
                step: "Confirmed",
                date: isConfirmed ? "Order confirmed by pharmacy" : "Awaiting pharmacy confirmation",
                completed: isConfirmed,
            },
            {
                step: "Packed",
                date: isPacked ? "Medicines packed by pharmacy" : "Pending packaging",
                completed: isPacked,
            },
            {
                step: "Dispatched",
                date: isDispatched
                    ? `Dispatched${raw.trackingNumber ? ` · TRK: ${raw.trackingNumber}` : ""}`
                    : "Awaiting dispatch",
                completed: isDispatched,
            },
            {
                step: "Delivered",
                date: isDelivered
                    ? (raw.updatedAt
                        ? new Date(raw.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                        : "Delivered")
                    : status === "Cancelled" ? "Order Cancelled" : "Pending delivery",
                completed: isDelivered,
            },
        ];

        const addr = raw.deliveryAddress || {};
        const addrStr = [addr.fullName, addr.street, addr.city, addr.state, addr.pincode]
            .filter(Boolean)
            .join(", ");

        setOrder({
            id: raw.orderId || raw._id,
            rawId: raw._id,
            date: dateFormatted,
            trackingNumber: raw.trackingNumber || "",
            estimatedDelivery: isDelivered
                ? `Delivered on ${new Date(raw.updatedAt || raw.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                : status === "Cancelled"
                ? "Order Cancelled"
                : status === "Shipped"
                ? "Out for Delivery — Expected Today"
                : "1–2 Days (Standard Pharmacy Delivery)",
            payment: raw.paymentMethod || "Cash on Delivery",
            paymentStatus: raw.paymentStatus || "Pending",
            status: status,
            subtotal: raw.subtotal !== undefined ? raw.subtotal : (raw.totalAmount || 0),
            offerDiscount: raw.offerDiscount || 0,
            couponCode: raw.couponCode || "",
            couponDiscount: raw.couponDiscount || 0,
            delivery: raw.deliveryFee !== undefined ? raw.deliveryFee : 0,
            total: raw.totalAmount !== undefined ? raw.totalAmount : 0,
            originalTotal: raw.originalTotalAmount || raw.totalAmount || 0,
            refundAmount: raw.refundAmount || 0,
            refundStatus: raw.refundStatus || "None",
            refundMethod: raw.refundMethod || "None",
            refundDetails: raw.refundDetails || {},
            refundRejectionReason: raw.refundRejectionReason || "",
            refundFailureReason: raw.refundFailureReason || "",
            isReorder: !!raw.isReorder,
            reorderedFromOrderId: raw.reorderedFromOrderId,
            reorderedFromOrderNumber: raw.reorderedFromOrderNumber,
            address: addrStr || "Standard Patient Address",
            phone: addr.phone || raw.patientId?.phone || "—",
            medicines: (raw.items || []).map((m) => ({
                id: m._id,
                medicineId: m.medicineId?._id || m.medicineId,
                name: m.name || "Medicine",
                qty: m.quantity || 1,
                unitPrice: m.unitPrice ?? m.finalPrice ?? 0,
                offerDiscount: m.offerDiscount || 0,
                finalPrice: m.finalPrice ?? m.unitPrice ?? 0,
                itemTotal: m.itemTotal ?? ((m.finalPrice ?? m.unitPrice ?? 0) * (m.quantity || 1)),
                status: m.status || "Active",
                cancelledAt: m.cancelledAt
                    ? new Date(m.cancelledAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                      })
                    : null,
                cancelReason: m.cancelReason || "",
                refundAmount: m.refundAmount || 0,
                dosage: "Verified Dosage",
                type: "Medicine",
                stockText: "Verified Stock",
                eta: "1–2 Days",
            })),
            timeline: timeline,
        });
    };

    useEffect(() => {
        if (!id) {
            setError("Invalid order ID.");
            setLoading(false);
            return;
        }

        const fetchOrder = async (silent = false) => {
            try {
                if (!silent) setLoading(true);
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login/patient");
                    return;
                }
                // Try /api/orders/:id (supports orderId strings like ORD-887608)
                // then fall back to /api/patient/orders/:id
                let res = await fetch(`${API_BASE_URL}/orders/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                let data = await res.json();

                // If the direct route returned 404, try patient-specific route
                if (!res.ok || !data.data) {
                    res = await fetch(`${API_BASE_URL}/patient/orders/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    data = await res.json();
                }

                if ((res.ok || data.data) && data.data) {
                    parseOrderData(data.data);
                } else {
                    if (!silent) setError(data.message || "Order not found.");
                }
            } catch (err) {
                if (!silent) setError("Unable to connect to server.");
            } finally {
                if (!silent) setLoading(false);
            }
        };

        fetchOrder();

        // Auto-refresh every 30 seconds to pick up pharmacy status updates
        const poll = setInterval(() => fetchOrder(true), 30000);
        return () => clearInterval(poll);
    }, [id, navigate]);

    // Download / Print Invoice
    const handleDownloadInvoice = () => {
        if (!order) return;
        const printWindow = window.open("", "_blank", "width=850,height=900");
        if (!printWindow) {
            toast.info("Please allow popups to print/download invoice.");
            return;
        }

        const activeMeds = (order.medicines || []).filter((m) => m.status !== "Cancelled");
        const cancelledMeds = (order.medicines || []).filter((m) => m.status === "Cancelled");

        const activeRowsHtml = activeMeds
            .map(
                (m, idx) => `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${idx + 1}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><strong>${m.name}</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${m.qty}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${m.unitPrice}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${m.finalPrice}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">₹${m.itemTotal}</td>
                </tr>`
            )
            .join("");

        const cancelledRowsHtml =
            cancelledMeds.length > 0
                ? `
            <div style="margin-top: 24px;">
                <h4 style="color: #dc2626; margin-bottom: 8px;">Cancelled Items</h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #64748b;">
                    <thead>
                        <tr style="background: #fef2f2; text-align: left;">
                            <th style="padding: 8px;">#</th>
                            <th style="padding: 8px;">Medicine</th>
                            <th style="padding: 8px; text-align: center;">Qty Cancelled</th>
                            <th style="padding: 8px; text-align: right;">Refund Amount</th>
                            <th style="padding: 8px;">Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cancelledMeds
                            .map(
                                (m, idx) => `
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #fee2e2;">${idx + 1}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #fee2e2; text-decoration: line-through;">${m.name}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #fee2e2; text-align: center;">${m.qty}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #fee2e2; text-align: right; color: #16a34a; font-weight: 600;">₹${m.refundAmount || 0}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #fee2e2;">${m.cancelReason || "Cancelled"}</td>
                            </tr>`
                            )
                            .join("")}
                    </tbody>
                </table>
            </div>`
                : "";

        const refundBannerHtml =
            order.refundAmount > 0
                ? `
            <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin: 20px 0; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="color: #15803d; font-size: 14px;">Refund Processed (${order.refundStatus})</strong>
                    <div style="color: #166534; font-size: 12px;">Refund issued through original payment gateway integration.</div>
                </div>
                <div style="font-size: 18px; font-weight: 800; color: #15803d;">₹${order.refundAmount}</div>
            </div>`
                : "";

        const invoiceHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Tax Invoice - ${order.id}</title>
            <meta charset="utf-8" />
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 30px; line-height: 1.5; }
                .inv-header { display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 18px; margin-bottom: 20px; }
                .inv-brand { font-size: 24px; font-weight: 800; color: #0284c7; }
                .inv-title { font-size: 20px; font-weight: 700; color: #334155; text-align: right; }
                .inv-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; font-size: 13px; }
                .inv-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px; }
                .inv-table th { background: #f8fafc; padding: 10px; border-bottom: 2px solid #cbd5e1; text-align: left; }
                .inv-summary { margin-top: 20px; width: 320px; margin-left: auto; font-size: 14px; }
                .inv-summary-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
                .inv-total { font-size: 16px; font-weight: 800; border-top: 2px solid #0f172a; padding-top: 8px; color: #0f172a; }
                @media print {
                    body { margin: 10mm; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="no-print" style="margin-bottom: 16px; text-align: right;">
                <button onclick="window.print()" style="background: #0284c7; color: #fff; border: none; padding: 10px 22px; border-radius: 8px; font-weight: 600; cursor: pointer;">Print / Save as PDF</button>
            </div>
            <div class="inv-header">
                <div>
                    <div class="inv-brand">MedicoBridge Pharmacy</div>
                    <div style="font-size: 12px; color: #64748b;">Licensed Digital Healthcare & Pharmacy Network</div>
                </div>
                <div>
                    <div class="inv-title">TAX INVOICE</div>
                    <div style="font-size: 13px; color: #64748b;">Invoice #: INV-${order.id}</div>
                </div>
            </div>

            <div class="inv-info-grid">
                <div>
                    <strong style="color: #475569;">Billed & Delivered To:</strong>
                    <div style="margin-top: 4px;">${order.address}</div>
                    <div>Phone: ${order.phone}</div>
                </div>
                <div style="text-align: right;">
                    <div><strong>Order ID:</strong> #${order.id}</div>
                    <div><strong>Order Date:</strong> ${order.date}</div>
                    <div><strong>Order Status:</strong> ${order.status}</div>
                    <div><strong>Payment Method:</strong> ${order.payment}</div>
                    <div><strong>Payment Status:</strong> ${order.paymentStatus}</div>
                    ${order.isReorder ? `<div><strong style="color: #0284c7;">Reorder of #${order.reorderedFromOrderNumber || order.reorderedFromOrderId}</strong></div>` : ""}
                </div>
            </div>

            ${refundBannerHtml}

            <h3>Prescription & Medicine Summary</h3>
            <table class="inv-table">
                <thead>
                    <tr>
                        <th style="width: 40px;">#</th>
                        <th>Medicine</th>
                        <th style="text-align: center; width: 60px;">Qty</th>
                        <th style="text-align: right; width: 90px;">Unit Price</th>
                        <th style="text-align: right; width: 90px;">Final Price</th>
                        <th style="text-align: right; width: 100px;">Item Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${activeRowsHtml || '<tr><td colspan="6" style="padding: 16px; text-align: center; color: #94a3b8;">All items in this order were cancelled.</td></tr>'}
                </tbody>
            </table>

            ${cancelledRowsHtml}

            <div class="inv-summary">
                <div class="inv-summary-row">
                    <span>Subtotal:</span>
                    <span>₹${order.subtotal}</span>
                </div>
                ${order.offerDiscount > 0 ? `<div class="inv-summary-row" style="color: #16a34a;"><span>Offer Discount:</span><span>-₹${order.offerDiscount}</span></div>` : ""}
                ${order.couponDiscount > 0 ? `<div class="inv-summary-row" style="color: #16a34a;"><span>Coupon (${order.couponCode}):</span><span>-₹${order.couponDiscount}</span></div>` : ""}
                <div class="inv-summary-row">
                    <span>Delivery Charges:</span>
                    <span>${order.delivery === 0 ? "FREE" : `₹${order.delivery}`}</span>
                </div>
                <div class="inv-summary-row inv-total">
                    <span>Final Amount:</span>
                    <span>₹${order.total}</span>
                </div>
                ${order.refundAmount > 0 ? `<div class="inv-summary-row" style="color: #16a34a; font-weight: 700; margin-top: 6px;"><span>Total Refund:</span><span>₹${order.refundAmount}</span></div>` : ""}
            </div>

            <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center;">
                This is a computer generated invoice and does not require a physical signature. MedicoBridge Pharmacy.
            </div>
            <script>
                window.onload = function() { setTimeout(function(){ window.print(); }, 400); };
            </script>
        </body>
        </html>
        `;

        printWindow.document.write(invoiceHtml);
        printWindow.document.close();
    };

    // Reorder Functionality
    const handleReorder = async () => {
        try {
            setReordering(true);
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login/patient");
                return;
            }

            const res = await fetch(`${API_BASE_URL}/orders/${order.rawId || order.id}/reorder`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (res.ok && data.data) {
                window.dispatchEvent(new CustomEvent("cartUpdated"));
                if (data.data.outOfStockItems && data.data.outOfStockItems.length > 0) {
                    const names = data.data.outOfStockItems.map((i) => i.name).join(", ");
                    toast.warn(`Note: ${names} is currently out of stock and could not be added.`);
                }
                toast.success("Medicines added to your cart with current availability & prices!");
                navigate("/patient/cart", {
                    state: {
                        reorderedFromOrderId: order.rawId,
                        reorderedFromOrderNumber: order.id,
                    },
                });
            } else {
                toast.error(data.message || "Failed to reorder items.");
            }
        } catch (err) {
            toast.error("Network error while reordering.");
        } finally {
            setReordering(false);
        }
    };

    // Reset cancellation modal & refund form
    const resetCancelForm = () => {
        setCancelReason("");
        setSelectedRefundMethod("UPI");
        setRefundUpiId("");
        setRefundAccountHolderName("");
        setRefundAccountNumber("");
        setRefundIfscCode("");
        setRefundBankName("");
        setRefundQrCodeImage("");
    };

    // Open Cancel Modal for individual medicine
    const handleInitiateCancelItem = (medicine) => {
        setCancelTarget({ type: "item", item: medicine });
        resetCancelForm();
        setCancelModalOpen(true);
    };

    // Open Cancel Modal for entire order
    const handleInitiateCancelOrder = () => {
        setCancelTarget({ type: "order" });
        resetCancelForm();
        setCancelModalOpen(true);
    };

    // QR Code Image File Upload
    const handleQrFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please upload a valid image file (JPG, PNG, WEBP).");
            return;
        }

        try {
            setUploadingQr(true);
            const token = localStorage.getItem("token");
            if (!token) return;

            const formData = new FormData();
            formData.append("qrCodeImage", file);

            const res = await fetch(`${API_BASE_URL}/refunds/upload-qr`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();

            if (res.ok && data.data?.qrCodeImage) {
                setRefundQrCodeImage(data.data.qrCodeImage);
                toast.success("UPI QR Code uploaded successfully!");
            } else {
                toast.error(data.message || "Failed to upload QR code.");
            }
        } catch (err) {
            toast.error("Network error uploading QR code.");
        } finally {
            setUploadingQr(false);
        }
    };

    // Confirm Cancellation action
    const handleConfirmCancellation = async () => {
        if (!cancelTarget) return;

        // If order was Paid, validate refund method input
        const isPaid = order.paymentStatus === "Paid";
        let refundDetails = {};

        if (isPaid) {
            if (selectedRefundMethod === "UPI") {
                const upiRegex = /^[a-zA-Z0-9.\-_]{3,}@[a-zA-Z]{3,}$/;
                if (!refundUpiId.trim()) {
                    toast.error("Please enter your UPI ID.");
                    return;
                }
                if (!upiRegex.test(refundUpiId.trim())) {
                    toast.error("Please enter a valid UPI ID (e.g. name@okhdfcbank or 9876543210@paytm).");
                    return;
                }
                refundDetails = { upiId: refundUpiId.trim() };
            } else if (selectedRefundMethod === "Bank Account") {
                if (!refundAccountHolderName.trim()) {
                    toast.error("Account holder name is required.");
                    return;
                }
                if (!refundAccountNumber.trim()) {
                    toast.error("Account number is required.");
                    return;
                }
                if (!/^\d{9,18}$/.test(refundAccountNumber.trim())) {
                    toast.error("Account number must be 9 to 18 digits.");
                    return;
                }
                if (!refundIfscCode.trim()) {
                    toast.error("IFSC code is required.");
                    return;
                }
                if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(refundIfscCode.trim().toUpperCase())) {
                    toast.error("Please enter a valid IFSC code (e.g. HDFC0001234).");
                    return;
                }
                refundDetails = {
                    accountHolderName: refundAccountHolderName.trim(),
                    accountNumber: refundAccountNumber.trim(),
                    ifscCode: refundIfscCode.trim().toUpperCase(),
                    bankName: refundBankName.trim(),
                };
            } else if (selectedRefundMethod === "QR Code") {
                if (!refundQrCodeImage) {
                    toast.error("Please upload your UPI QR code image.");
                    return;
                }
                refundDetails = { qrCodeImage: refundQrCodeImage };
            }
        }

        try {
            setCancelling(true);
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login/patient");
                return;
            }

            let endpoint = "";
            let bodyData = {
                refundMethod: isPaid ? selectedRefundMethod : "None",
                refundDetails: isPaid ? refundDetails : {},
            };

            if (cancelTarget.type === "item") {
                endpoint = `${API_BASE_URL}/orders/${order.rawId || order.id}/cancel-item`;
                bodyData = {
                    ...bodyData,
                    itemId: cancelTarget.item.id,
                    medicineId: cancelTarget.item.medicineId,
                    reason: cancelReason || "Cancelled by patient",
                };
            } else {
                endpoint = `${API_BASE_URL}/orders/${order.rawId || order.id}/cancel`;
                bodyData = {
                    ...bodyData,
                    reason: cancelReason || "Entire order cancelled by patient",
                };
            }

            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(bodyData),
            });

            const data = await res.json();
            if (res.ok && data.data?.order) {
                parseOrderData(data.data.order);
                setCancelModalOpen(false);
                setCancelTarget(null);

                window.dispatchEvent(new CustomEvent("notificationsUpdated"));

                if (data.data.couponRemoved) {
                    toast.warn("Item cancelled. Coupon removed because eligible subtotal fell below minimum threshold.");
                }

                if (data.data.incrementalRefund > 0 || data.data.refundAmount > 0) {
                    const refundAmt = data.data.incrementalRefund || data.data.refundAmount;
                    toast.success(`Cancellation confirmed. A refund request of ₹${refundAmt} has been submitted for review & processing!`);
                } else {
                    toast.success("Cancellation completed successfully.");
                }
            } else {
                toast.error(data.message || "Failed to cancel.");
            }
        } catch (err) {
            toast.error("Network error during cancellation.");
        } finally {
            setCancelling(false);
        }
    };

    const timelineIcons = {
        "Order Placed": <FaClipboardList />,
        Confirmed: <FaCheckCircle />,
        Packed: <FaBoxOpen />,
        Shipped: <FaTruck />,
        Delivered: <FaShieldAlt />,
    };

    if (loading) {
        return (
            <div className="od-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1rem", color: "#0d9488" }}>
                <FaSpinner className="fa-spin" /> Loading order details...
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="od-page">
                <button className="od-back-btn" onClick={() => navigate("/patient/orders")}>
                    <FaArrowLeft /> Back to Orders
                </button>
                <div style={{ textAlign: "center", padding: "3rem" }}>
                    <FaExclamationCircle style={{ fontSize: "2.5rem", color: "#ef4444", marginBottom: "1rem" }} />
                    <h2>Order Not Found</h2>
                    <p>{error || "The order you're looking for doesn't exist."}</p>
                    <button className="od-action-btn od-action-btn--primary" style={{ marginTop: "1rem", display: "inline-flex" }} onClick={() => navigate("/patient/orders")}>
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    const isOrderEligibleForCancel =
        !["Shipped", "Delivered", "Cancelled"].includes(order.status) &&
        (order.medicines || []).some((m) => m.status !== "Cancelled");

    const activeMedicines = (order.medicines || []).filter((m) => m.status !== "Cancelled");
    const cancelledMedicines = (order.medicines || []).filter((m) => m.status === "Cancelled");

    // Dynamic status badge styling
    const getStatusClass = (status) => {
        const lower = String(status || "").toLowerCase().replace(/\s+/g, "-");
        return `od-status-badge--${lower}`;
    };

    return (
        <div className="od-page">
            {/* Header */}
            <div className="od-header">
                <div className="od-header-left">
                    <button
                        className="od-back-btn"
                        onClick={() => navigate("/patient/orders")}
                        id="od-back-btn"
                    >
                        <FaArrowLeft />
                        <span>Back to Orders</span>
                    </button>
                </div>
                <div className="od-header-right">
                    <div className="od-header-icon">
                        <FaReceipt />
                    </div>
                    <div>
                        <h1 className="od-title">Order Details</h1>
                        <p className="od-subtitle">
                            Order #{order.id} · Placed on {order.date}
                        </p>
                    </div>
                </div>
            </div>

            {/* Reorder Notification Banner if this order was reordered */}
            {order.isReorder && (
                <div className="od-reorder-banner">
                    <FaRedo className="od-banner-icon" />
                    <span>
                        This order was reordered from previous order{" "}
                        <strong>#{order.reorderedFromOrderNumber || order.reorderedFromOrderId}</strong>.
                    </span>
                    {order.reorderedFromOrderNumber && (
                        <button
                            className="od-reorder-link-btn"
                            onClick={() => navigate(`/patient/order-details/${order.reorderedFromOrderNumber}`)}
                        >
                            View Original Order →
                        </button>
                    )}
                </div>
            )}

            {/* Main Grid */}
            <div className="od-grid">
                {/* Left Column */}
                <div className="od-col-main">
                    {/* Order Info Card */}
                    <div className="od-card od-info-card">
                        <div className="od-card-header">
                            <div className="od-card-icon od-card-icon--blue">
                                <FaClipboardList />
                            </div>
                            <h2 className="od-card-title">Order Information</h2>
                            <span className={`od-status-badge ${getStatusClass(order.status)}`}>
                                {order.status === "Cancelled" ? <FaBan /> : <FaCheckCircle />}
                                {order.status}
                            </span>
                        </div>
                        <div className="od-info-grid">
                            <div className="od-info-item">
                                <span className="od-info-label">Order ID</span>
                                <span className="od-info-value od-info-value--mono">
                                    #{order.id}
                                </span>
                            </div>
                            <div className="od-info-item">
                                <span className="od-info-label">Order Date</span>
                                <span className="od-info-value">
                                    <FaCalendarAlt className="od-info-inline-icon" />
                                    {order.date}
                                </span>
                            </div>
                            <div className="od-info-item">
                                <span className="od-info-label">Delivery Status / ETA</span>
                                <span
                                    className="od-info-value"
                                    style={{
                                        color: order.status === "Cancelled" ? "#ef4444" : "#16a34a",
                                        fontWeight: 700,
                                    }}
                                >
                                    <FaTruck className="od-info-inline-icon" />
                                    {order.estimatedDelivery}
                                </span>
                            </div>
                            <div className="od-info-item">
                                <span className="od-info-label">Payment Method</span>
                                <span className="od-info-value">
                                    <FaCreditCard className="od-info-inline-icon" />
                                    {order.payment}
                                </span>
                            </div>
                            <div className="od-info-item">
                                <span className="od-info-label">Payment Status</span>
                                <span className={`od-payment-status-tag od-payment-status-tag--${order.paymentStatus?.toLowerCase()}`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                            {order.refundAmount > 0 && (
                                <div className="od-info-item">
                                    <span className="od-info-label">Refund Issued</span>
                                    <span className="od-refund-value-tag">
                                        ₹{order.refundAmount} ({order.refundStatus})
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Medicines Card */}
                    <div className="od-card od-medicines-card">
                        <div className="od-card-header">
                            <div className="od-card-icon od-card-icon--teal">
                                <FaPills />
                            </div>
                            <h2 className="od-card-title">Ordered Medicines</h2>
                            <span className="od-items-count">
                                {activeMedicines.length} active item{activeMedicines.length === 1 ? "" : "s"}
                            </span>
                        </div>

                        {activeMedicines.length > 0 ? (
                            <div className="od-medicines-list">
                                {activeMedicines.map((medicine, index) => (
                                    <div className="od-medicine-item" key={medicine.id || index}>
                                        <div className="od-medicine-thumb">
                                            {getMedicineIcon(medicine.name)}
                                        </div>
                                        <div className="od-medicine-info">
                                            <h4 className="od-medicine-name">{medicine.name}</h4>
                                            <div className="od-medicine-meta">
                                                <span className="od-medicine-tag">{medicine.type}</span>
                                                <span className="od-medicine-tag">{medicine.dosage}</span>
                                                {medicine.stockText && (
                                                    <span className="od-medicine-tag" style={{ background: "#f0fdf4", color: "#15803d", fontWeight: 600 }}>
                                                        {medicine.stockText} · Est. {medicine.eta}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="od-medicine-qty">
                                            <span className="od-qty-label">Qty</span>
                                            <span className="od-qty-value">{medicine.qty}</span>
                                        </div>
                                        <div className="od-medicine-price">
                                            <span className="od-price-label">Price</span>
                                            <span className="od-price-value">
                                                ₹{medicine.itemTotal}
                                            </span>
                                            {medicine.offerDiscount > 0 && (
                                                <small className="od-offer-save-tag">
                                                    Saved ₹{medicine.offerDiscount * medicine.qty}
                                                </small>
                                            )}
                                        </div>

                                        {/* Individual Medicine Cancellation Button */}
                                        {isOrderEligibleForCancel ? (
                                            <div className="od-medicine-actions">
                                                <button
                                                    className="od-cancel-med-btn"
                                                    title={`Cancel ${medicine.name}`}
                                                    onClick={() => handleInitiateCancelItem(medicine)}
                                                    id={`cancel-med-btn-${medicine.id || index}`}
                                                >
                                                    <FaTimes />
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="od-medicine-actions">
                                                <button
                                                    className="od-cancel-med-btn od-cancel-med-btn--disabled"
                                                    title={
                                                        ['Shipped', 'Delivered'].includes(order.status)
                                                            ? `Cannot cancel: Order is already ${order.status.toLowerCase()}`
                                                            : "Cancellation unavailable for this item"
                                                    }
                                                    disabled={true}
                                                    aria-disabled="true"
                                                    id={`cancel-med-btn-${medicine.id || index}`}
                                                >
                                                    <FaTimes />
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="od-all-cancelled-notice">
                                <FaBan style={{ color: "#ef4444", fontSize: "20px" }} />
                                <span>All medicines in this order have been cancelled.</span>
                            </div>
                        )}

                        {/* Separate Display for Cancelled Medicines */}
                        {cancelledMedicines.length > 0 && (
                            <div className="od-cancelled-section">
                                <div className="od-cancelled-section-header">
                                    <h3 className="od-cancelled-title">
                                        <FaBan className="od-cancelled-icon" />
                                        Cancelled Medicines ({cancelledMedicines.length})
                                    </h3>
                                    <span className="od-cancelled-badge-pill">Cancelled</span>
                                </div>
                                <div className="od-cancelled-list">
                                    {cancelledMedicines.map((medicine, index) => (
                                        <div className="od-cancelled-item" key={medicine.id || index}>
                                            <div className="od-medicine-thumb od-medicine-thumb--cancelled">
                                                {getMedicineIcon(medicine.name)}
                                            </div>
                                            <div className="od-cancelled-info">
                                                <h4 className="od-cancelled-name">{medicine.name}</h4>
                                                <div className="od-cancelled-meta">
                                                    <span>Cancelled on {medicine.cancelledAt || "Recently"}</span>
                                                    {medicine.cancelReason && (
                                                        <span> · Reason: {medicine.cancelReason}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="od-cancelled-qty">
                                                <span>Qty: {medicine.qty}</span>
                                            </div>
                                            <div className="od-cancelled-refund">
                                                {medicine.refundAmount > 0 ? (
                                                    <span className="od-refund-badge">Refund: ₹{medicine.refundAmount}</span>
                                                ) : (
                                                    <span className="od-cancelled-status-badge">Cancelled</span>
                                                )}
                                                <button
                                                    className="od-cancel-med-btn od-cancel-med-btn--disabled"
                                                    disabled={true}
                                                    aria-disabled="true"
                                                    title="This medicine has already been cancelled"
                                                    style={{ marginLeft: "8px", fontSize: "11px", padding: "4px 8px" }}
                                                >
                                                    <FaBan /> Cancelled
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Order Summary */}
                        <div className="od-summary">
                            <div className="od-summary-row">
                                <span>Subtotal</span>
                                <span>₹{order.subtotal}</span>
                            </div>
                            {order.offerDiscount > 0 && (
                                <div className="od-summary-row" style={{ color: "#16a34a" }}>
                                    <span>Special Offer Discount</span>
                                    <span>-₹{order.offerDiscount}</span>
                                </div>
                            )}
                            {order.couponDiscount > 0 && (
                                <div className="od-summary-row" style={{ color: "#16a34a" }}>
                                    <span>Coupon Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                                    <span>-₹{order.couponDiscount}</span>
                                </div>
                            )}
                            {cancelledMedicines.length > 0 && order.couponCode && order.couponDiscount === 0 && (
                                <div className="od-coupon-removed-note">
                                    <FaInfoCircle />
                                    <span>Coupon ({order.couponCode}) was removed because remaining order value no longer meets the minimum required purchase.</span>
                                </div>
                            )}
                            <div className="od-summary-row">
                                <span>Delivery Charges</span>
                                <span className="od-delivery-fee">
                                    {order.delivery === 0 ? "FREE" : `₹${order.delivery}`}
                                </span>
                            </div>
                            <div className="od-summary-row od-summary-total">
                                <span>Total Amount</span>
                                <span>₹{order.total}</span>
                            </div>
                            {order.refundAmount > 0 && (
                                <div className="od-summary-row od-summary-refund" style={{ color: "#15803d", background: "#f0fdf4", padding: "10px 14px", borderRadius: "10px", marginTop: "12px", border: "1px solid #bbf7d0" }}>
                                    <div>
                                        <div style={{ fontWeight: "700", fontSize: "14px" }}>
                                            Refund {order.refundStatus === "Refunded" ? "Completed" : `Status: ${order.refundStatus}`}
                                        </div>
                                        {order.refundMethod && order.refundMethod !== "None" && (
                                            <div style={{ fontSize: "12px", color: "#166534", marginTop: "2px" }}>
                                                Destination: <strong>{order.refundMethod}</strong>
                                                {order.refundMethod === "UPI" && order.refundDetails?.upiId && ` (${order.refundDetails.upiId})`}
                                                {order.refundMethod === "Bank Account" && order.refundDetails?.accountNumberMasked && ` (${order.refundDetails.accountNumberMasked})`}
                                            </div>
                                        )}
                                        {order.refundStatus === "Pending" && (
                                            <div style={{ fontSize: "11px", color: "#b45309", marginTop: "3px" }}>
                                                ⏳ Your refund request is currently being reviewed by an administrator.
                                            </div>
                                        )}
                                        {order.refundStatus === "Approved" && (
                                            <div style={{ fontSize: "11px", color: "#0369a1", marginTop: "3px" }}>
                                                ✓ Approved! Payment transfer is queued for payout.
                                            </div>
                                        )}
                                        {order.refundStatus === "Rejected" && (
                                            <div style={{ fontSize: "11px", color: "#dc2626", marginTop: "3px" }}>
                                                ✕ Request Rejected: {order.refundRejectionReason || "Please contact support."}
                                            </div>
                                        )}
                                        {order.refundStatus === "Failed" && (
                                            <div style={{ fontSize: "11px", color: "#b91c1c", marginTop: "3px" }}>
                                                ⚠️ Transfer Failed: {order.refundFailureReason || "Retry scheduled by admin."}
                                            </div>
                                        )}
                                    </div>
                                    <strong style={{ fontSize: "16px", color: "#15803d" }}>₹{order.refundAmount}</strong>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Delivery Address Card */}
                    <div className="od-card od-address-card">
                        <div className="od-card-header">
                            <div className="od-card-icon od-card-icon--orange">
                                <FaMapMarkerAlt />
                            </div>
                            <h2 className="od-card-title">Delivery Address</h2>
                        </div>
                        <div className="od-address-body">
                            <p className="od-address-text">{order.address}</p>
                            <p className="od-address-phone">Phone: {order.phone}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="od-col-side">
                    {/* Timeline Card */}
                    <div className="od-card od-timeline-card">
                        <div className="od-card-header">
                            <div className="od-card-icon od-card-icon--green">
                                <FaClock />
                            </div>
                            <h2 className="od-card-title">Order Timeline</h2>
                        </div>
                        <div className="od-timeline">
                            {order.timeline.map((step, index) => (
                                <div
                                    className={`od-timeline-step ${
                                        step.completed ? "od-timeline-step--completed" : ""
                                    } ${
                                        index === order.timeline.length - 1
                                            ? "od-timeline-step--last"
                                            : ""
                                    }`}
                                    key={index}
                                >
                                    <div className="od-timeline-connector">
                                        <div className="od-timeline-dot">
                                            {step.completed ? (
                                                timelineIcons[step.step] || <FaCheckCircle />
                                            ) : (
                                                <div className="od-timeline-dot-inner" />
                                            )}
                                        </div>
                                        {index < order.timeline.length - 1 && (
                                            <div className="od-timeline-line" />
                                        )}
                                    </div>
                                    <div className="od-timeline-content">
                                        <span className="od-timeline-label">{step.step}</span>
                                        <span className="od-timeline-date">{step.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions Card */}
                    <div className="od-card od-actions-card">
                        <div className="od-card-header">
                            <div className="od-card-icon od-card-icon--purple">
                                <FaShoppingBag />
                            </div>
                            <h2 className="od-card-title">Quick Actions</h2>
                        </div>
                        <div className="od-actions-list">
                            {/* Download Invoice Button */}
                            <button
                                className="od-action-btn od-action-btn--primary"
                                id="od-download-invoice-btn"
                                onClick={handleDownloadInvoice}
                            >
                                <FaDownload className="od-action-btn-icon" />
                                <span className="od-action-btn-text">
                                    <strong>Download Invoice</strong>
                                    <small>Get PDF receipt</small>
                                </span>
                                <FaArrowRight className="od-action-btn-arrow" />
                            </button>

                            {/* Reorder Button: Populates cart with current stock & prices */}
                            <button
                                className="od-action-btn od-action-btn--secondary"
                                id="od-reorder-btn"
                                onClick={handleReorder}
                                disabled={reordering}
                            >
                                {reordering ? <FaSpinner className="fa-spin od-action-btn-icon" /> : <FaRedo className="od-action-btn-icon" />}
                                <span className="od-action-btn-text">
                                    <strong>Reorder</strong>
                                    <small>Verify stock & add to cart</small>
                                </span>
                                <FaArrowRight className="od-action-btn-arrow" />
                            </button>

                            {/* Order-level Cancel Button */}
                            {isOrderEligibleForCancel ? (
                                <button
                                    className="od-action-btn od-action-btn--danger"
                                    id="od-cancel-order-btn"
                                    onClick={handleInitiateCancelOrder}
                                >
                                    <FaBan className="od-action-btn-icon" />
                                    <span className="od-action-btn-text">
                                        <strong>Cancel Order</strong>
                                        <small>Cancel all remaining medicines</small>
                                    </span>
                                    <FaArrowRight className="od-action-btn-arrow" />
                                </button>
                            ) : (
                                <button
                                    className="od-action-btn od-action-btn--danger od-action-btn--disabled"
                                    id="od-cancel-order-btn"
                                    disabled={true}
                                    aria-disabled="true"
                                    title={
                                        order.status === "Cancelled" || activeMedicines.length === 0
                                            ? "This order has already been cancelled."
                                            : `Orders that are ${order.status.toLowerCase()} cannot be cancelled or refunded under the order policy.`
                                    }
                                >
                                    <FaBan className="od-action-btn-icon" />
                                    <span className="od-action-btn-text">
                                        <strong>Cancel Order</strong>
                                        <small>
                                            {order.status === "Cancelled" || activeMedicines.length === 0
                                                ? "Order already cancelled"
                                                : `Cannot cancel: Order is ${order.status}`}
                                        </small>
                                    </span>
                                    <FaLock className="od-action-btn-arrow" style={{ opacity: 0.5 }} />
                                </button>
                            )}

                            {/* Continue Shopping */}
                            <button
                                className="od-action-btn od-action-btn--outline"
                                onClick={() => navigate("/patient/pharmacy")}
                                id="od-continue-shopping-btn"
                            >
                                <FaPills className="od-action-btn-icon" />
                                <span className="od-action-btn-text">
                                    <strong>Continue Shopping</strong>
                                    <small>Browse medicines</small>
                                </span>
                                <FaArrowRight className="od-action-btn-arrow" />
                            </button>
                        </div>
                    </div>

                    {/* Help Note */}
                    <div className="od-help-note">
                        <span className="od-help-icon">💬</span>
                        <p>
                            Need help with this order?{" "}
                            <a href="#" className="od-help-link">
                                Contact Support
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Cancellation Confirmation Modal ── */}
            {cancelModalOpen && (
                <div className="od-modal-overlay" onClick={() => !cancelling && setCancelModalOpen(false)}>
                    <div className="od-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="od-modal-header">
                            <div className="od-modal-icon od-modal-icon--danger">
                                <FaBan />
                            </div>
                            <div>
                                <h3 className="od-modal-title">
                                    {cancelTarget?.type === "order"
                                        ? "Cancel Entire Order"
                                        : `Cancel ${cancelTarget?.item?.name}`}
                                </h3>
                                <p className="od-modal-subtitle">
                                    Please confirm your cancellation request below.
                                </p>
                            </div>
                            <button
                                className="od-modal-close-btn"
                                onClick={() => !cancelling && setCancelModalOpen(false)}
                                disabled={cancelling}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="od-modal-body">
                            <div className="od-modal-info-box">
                                <FaInfoCircle className="od-modal-info-icon" />
                                <div className="od-modal-info-text">
                                    {cancelTarget?.type === "order" ? (
                                        <span>
                                            All active medicines in Order <strong>#{order.id}</strong> will be cancelled.
                                            Quantities will be returned to inventory.
                                            {order.paymentStatus === "Paid" && " A full refund will be processed to your original payment method."}
                                        </span>
                                    ) : (
                                        <span>
                                            <strong>{cancelTarget?.item?.name}</strong> (Qty: {cancelTarget?.item?.qty}) will be removed from your order.
                                            Quantities will be restored to inventory.
                                            Remaining items, offers, coupons, and delivery charges will be automatically recalculated.
                                            {order.paymentStatus === "Paid" && " Any refund due will be issued to your account."}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="od-modal-field">
                                <label className="od-modal-label">Reason for Cancellation (Optional)</label>
                                <select
                                    className="od-modal-select"
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    disabled={cancelling}
                                >
                                    <option value="">Select a reason...</option>
                                    <option value="Ordered by mistake">Ordered by mistake</option>
                                    <option value="Found alternative medicine">Found alternative medicine</option>
                                    <option value="Doctor changed prescription">Doctor changed prescription</option>
                                    <option value="Delivery time too long">Delivery time too long</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Refund Method Selection for Paid Orders */}
                            {order.paymentStatus === "Paid" && (
                                <div className="od-refund-method-section" style={{ marginTop: "18px", borderTop: "1.5px dashed #cbd5e1", paddingTop: "14px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                        <FaUndo style={{ color: "#0284c7" }} />
                                        <label className="od-modal-label" style={{ margin: 0, fontWeight: "700", color: "#0f172a" }}>
                                            Choose Refund Destination *
                                        </label>
                                    </div>
                                    <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 12px" }}>
                                        Select how you would like to receive your refund once approved by the administrator:
                                    </p>

                                    {/* Method Buttons */}
                                    <div className="od-refund-method-tabs" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "14px" }}>
                                        <button
                                            type="button"
                                            className={`od-refund-tab-btn ${selectedRefundMethod === "UPI" ? "active" : ""}`}
                                            onClick={() => setSelectedRefundMethod("UPI")}
                                            style={{
                                                padding: "10px 8px",
                                                borderRadius: "10px",
                                                border: selectedRefundMethod === "UPI" ? "2px solid #0284c7" : "1.5px solid #e2e8f0",
                                                background: selectedRefundMethod === "UPI" ? "#f0f9ff" : "#fff",
                                                color: selectedRefundMethod === "UPI" ? "#0369a1" : "#475569",
                                                fontWeight: selectedRefundMethod === "UPI" ? "700" : "500",
                                                fontSize: "12px",
                                                cursor: "pointer",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                gap: "4px",
                                            }}
                                        >
                                            <FaMobileAlt style={{ fontSize: "16px" }} />
                                            <span>UPI ID</span>
                                        </button>

                                        <button
                                            type="button"
                                            className={`od-refund-tab-btn ${selectedRefundMethod === "Bank Account" ? "active" : ""}`}
                                            onClick={() => setSelectedRefundMethod("Bank Account")}
                                            style={{
                                                padding: "10px 8px",
                                                borderRadius: "10px",
                                                border: selectedRefundMethod === "Bank Account" ? "2px solid #0284c7" : "1.5px solid #e2e8f0",
                                                background: selectedRefundMethod === "Bank Account" ? "#f0f9ff" : "#fff",
                                                color: selectedRefundMethod === "Bank Account" ? "#0369a1" : "#475569",
                                                fontWeight: selectedRefundMethod === "Bank Account" ? "700" : "500",
                                                fontSize: "12px",
                                                cursor: "pointer",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                gap: "4px",
                                            }}
                                        >
                                            <FaUniversity style={{ fontSize: "16px" }} />
                                            <span>Bank Account</span>
                                        </button>

                                        <button
                                            type="button"
                                            className={`od-refund-tab-btn ${selectedRefundMethod === "QR Code" ? "active" : ""}`}
                                            onClick={() => setSelectedRefundMethod("QR Code")}
                                            style={{
                                                padding: "10px 8px",
                                                borderRadius: "10px",
                                                border: selectedRefundMethod === "QR Code" ? "2px solid #0284c7" : "1.5px solid #e2e8f0",
                                                background: selectedRefundMethod === "QR Code" ? "#f0f9ff" : "#fff",
                                                color: selectedRefundMethod === "QR Code" ? "#0369a1" : "#475569",
                                                fontWeight: selectedRefundMethod === "QR Code" ? "700" : "500",
                                                fontSize: "12px",
                                                cursor: "pointer",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                gap: "4px",
                                            }}
                                        >
                                            <FaQrcode style={{ fontSize: "16px" }} />
                                            <span>UPI QR Code</span>
                                        </button>
                                    </div>

                                    {/* 1. UPI ID Input Form */}
                                    {selectedRefundMethod === "UPI" && (
                                        <div className="od-refund-form-card" style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                            <label className="od-modal-label" style={{ fontSize: "12px" }}>Enter Recipient UPI ID *</label>
                                            <input
                                                type="text"
                                                className="od-modal-select"
                                                placeholder="e.g. mobileNumber@upi, username@oksbi"
                                                value={refundUpiId}
                                                onChange={(e) => setRefundUpiId(e.target.value)}
                                                disabled={cancelling}
                                                style={{ fontSize: "13px" }}
                                            />
                                            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                                                🔒 Verification note: Never share your UPI PIN or OTP. We only need your receiving address.
                                            </div>
                                        </div>
                                    )}

                                    {/* 2. Bank Account Details Form */}
                                    {selectedRefundMethod === "Bank Account" && (
                                        <div className="od-refund-form-card" style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                                <div style={{ gridColumn: "span 2" }}>
                                                    <label className="od-modal-label" style={{ fontSize: "12px" }}>Account Holder Name *</label>
                                                    <input
                                                        type="text"
                                                        className="od-modal-select"
                                                        placeholder="Name as printed on bank passbook"
                                                        value={refundAccountHolderName}
                                                        onChange={(e) => setRefundAccountHolderName(e.target.value)}
                                                        disabled={cancelling}
                                                        style={{ fontSize: "13px" }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="od-modal-label" style={{ fontSize: "12px" }}>Account Number *</label>
                                                    <input
                                                        type="password"
                                                        className="od-modal-select"
                                                        placeholder="9 to 18 digit account number"
                                                        value={refundAccountNumber}
                                                        onChange={(e) => setRefundAccountNumber(e.target.value)}
                                                        disabled={cancelling}
                                                        style={{ fontSize: "13px" }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="od-modal-label" style={{ fontSize: "12px" }}>IFSC Code *</label>
                                                    <input
                                                        type="text"
                                                        className="od-modal-select"
                                                        placeholder="e.g. HDFC0001234"
                                                        value={refundIfscCode}
                                                        onChange={(e) => setRefundIfscCode(e.target.value.toUpperCase())}
                                                        disabled={cancelling}
                                                        maxLength={11}
                                                        style={{ fontSize: "13px", textTransform: "uppercase" }}
                                                    />
                                                </div>
                                                <div style={{ gridColumn: "span 2" }}>
                                                    <label className="od-modal-label" style={{ fontSize: "12px" }}>Bank Name (Optional)</label>
                                                    <input
                                                        type="text"
                                                        className="od-modal-select"
                                                        placeholder="e.g. State Bank of India, HDFC Bank"
                                                        value={refundBankName}
                                                        onChange={(e) => setRefundBankName(e.target.value)}
                                                        disabled={cancelling}
                                                        style={{ fontSize: "13px" }}
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px" }}>
                                                🔒 Bank numbers are masked and securely saved for payout reconciliation only.
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. QR Code Upload Form */}
                                    {selectedRefundMethod === "QR Code" && (
                                        <div className="od-refund-form-card" style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                                            <label className="od-modal-label" style={{ fontSize: "12px", textAlign: "left" }}>
                                                Upload your receiving UPI QR Code *
                                            </label>
                                            <div style={{ margin: "10px 0" }}>
                                                {refundQrCodeImage ? (
                                                    <div style={{ display: "inline-block", position: "relative" }}>
                                                        <img
                                                            src={`http://localhost:5000${refundQrCodeImage}`}
                                                            alt="Uploaded UPI QR Code"
                                                            style={{ maxWidth: "160px", maxHeight: "160px", borderRadius: "8px", border: "1.5px solid #10b981" }}
                                                        />
                                                        <div style={{ fontSize: "11px", color: "#047857", fontWeight: "600", marginTop: "4px" }}>
                                                            ✓ QR Code Uploaded Successfully
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div style={{ border: "2px dashed #cbd5e1", borderRadius: "8px", padding: "18px", background: "#fff" }}>
                                                        <FaQrcode style={{ fontSize: "32px", color: "#94a3b8", marginBottom: "6px" }} />
                                                        <div style={{ fontSize: "12px", color: "#475569" }}>
                                                            Take a screenshot of your Google Pay, PhonePe, or Paytm QR code and upload it here.
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                id="od-refund-qr-input"
                                                accept="image/*"
                                                style={{ display: "none" }}
                                                onChange={handleQrFileUpload}
                                                disabled={uploadingQr || cancelling}
                                            />
                                            <label
                                                htmlFor="od-refund-qr-input"
                                                className="od-modal-btn od-modal-btn--secondary"
                                                style={{ display: "inline-flex", cursor: "pointer", fontSize: "12px", padding: "8px 16px" }}
                                            >
                                                {uploadingQr ? (
                                                    <>
                                                        <FaSpinner className="fa-spin" /> Uploading...
                                                    </>
                                                ) : refundQrCodeImage ? (
                                                    <>
                                                        <FaUpload /> Change QR Code
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaUpload /> Choose QR Code Image
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="od-modal-footer">
                            <button
                                className="od-modal-btn od-modal-btn--secondary"
                                onClick={() => setCancelModalOpen(false)}
                                disabled={cancelling}
                            >
                                Keep {cancelTarget?.type === "order" ? "Order" : "Medicine"}
                            </button>
                            <button
                                className="od-modal-btn od-modal-btn--danger"
                                onClick={handleConfirmCancellation}
                                disabled={cancelling}
                                id="od-confirm-cancel-btn"
                            >
                                {cancelling ? (
                                    <>
                                        <FaSpinner className="fa-spin" /> Processing...
                                    </>
                                ) : (
                                    <>
                                        <FaBan /> Confirm Cancellation
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PatientOrderDetails;