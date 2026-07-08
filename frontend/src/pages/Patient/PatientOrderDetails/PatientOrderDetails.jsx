import React from "react";
import {
    FaArrowLeft,
    FaMapMarkerAlt,
    FaCreditCard,
    FaCheckCircle,
    FaDownload,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./PatientOrderDetails.css";

function PatientOrderDetails() {
    const navigate = useNavigate();

    const order = {
        id: "MB20260001",
        date: "20 June 2026",
        payment: "Cash on Delivery",
        status: "Delivered",
        total: "₹290",
        address: "John Doe, MG Road, Kochi, Kerala - 682001",
        medicines: [
            {
                name: "Paracetamol 650mg",
                qty: 2,
                price: "₹70",
            },
            {
                name: "Vitamin C Tablets",
                qty: 1,
                price: "₹220",
            },
        ],
    };

    return (
        <div className="order-details">

            <button
                className="back-btn"
                onClick={() => navigate("/patient/orders")}
            >
                <FaArrowLeft /> Back to Orders
            </button>

            <div className="details-card">

                <h2>Order Details</h2>

                <div className="detail-row">
                    <strong>Order ID</strong>
                    <span>{order.id}</span>
                </div>

                <div className="detail-row">
                    <strong>Order Date</strong>
                    <span>{order.date}</span>
                </div>

                <div className="detail-row">
                    <strong>Status</strong>
                    <span className="status delivered">
                        <FaCheckCircle />
                        {order.status}
                    </span>
                </div>

            </div>

            <div className="details-card">

                <h3>
                    <FaMapMarkerAlt /> Delivery Address
                </h3>

                <p>{order.address}</p>

            </div>

            <div className="details-card">

                <h3>Ordered Medicines</h3>

                {order.medicines.map((medicine, index) => (

                    <div
                        className="medicine-row"
                        key={index}
                    >

                        <span>{medicine.name}</span>

                        <span>Qty : {medicine.qty}</span>

                        <span>{medicine.price}</span>

                    </div>

                ))}

            </div>

            <div className="details-card">

                <h3>
                    <FaCreditCard /> Payment
                </h3>

                <p>{order.payment}</p>

            </div>

            <div className="details-card">

                <h3>Order Timeline</h3>

                <ul className="timeline">

                    <li className="completed">
                        ✔ Order Placed
                    </li>

                    <li className="completed">
                        ✔ Packed
                    </li>

                    <li className="completed">
                        ✔ Shipped
                    </li>

                    <li className="completed">
                        ✔ Delivered
                    </li>

                </ul>

            </div>

            <div className="details-card total-card">

                <h2>Total : {order.total}</h2>

                <button className="invoice-btn">
                    <FaDownload />
                    Download Invoice
                </button>

            </div>

        </div>
    );
}

export default PatientOrderDetails;