import React from "react";
import {
    FaClipboardList,
    FaTruck,
    FaCheckCircle,
    FaClock,
    FaEye,
} from "react-icons/fa";
import "./PatientOrders.css";
import { useNavigate } from "react-router-dom";

const orders = [
    {
        id: "MB20260001",
        date: "20 June 2026",
        items: "Paracetamol 650mg, Vitamin C Tablets",
        amount: "₹290",
        status: "Delivered",
    },
    {
        id: "MB20260002",
        date: "22 June 2026",
        items: "Cetirizine Tablets",
        amount: "₹120",
        status: "Shipped",
    },
    {
        id: "MB20260003",
        date: "24 June 2026",
        items: "Blood Pressure Monitor",
        amount: "₹1,850",
        status: "Pending",
    },
];

function PatientOrders() {
    const navigate = useNavigate();
    return (
        <div className="patient-orders">

            <div className="orders-header">
                <h2>
                    <FaClipboardList /> My Orders
                </h2>
                <p>Track all your medicine orders.</p>
            </div>

            {orders.map((order) => (
                <div className="order-card" key={order.id}>

                    <div className="order-left">

                        <h3>Order #{order.id}</h3>

                        <p>Date : {order.date}</p>

                        <p>{order.items}</p>

                        <h4>{order.amount}</h4>

                    </div>

                    <div className="order-right">

                        <span
                            className={`status ${order.status.toLowerCase()}`}
                        >
                            {order.status === "Delivered" && <FaCheckCircle />}
                            {order.status === "Shipped" && <FaTruck />}
                            {order.status === "Pending" && <FaClock />}
                            {order.status}
                        </span>

                        <button
                            className="view-btn"
                            onClick={() => navigate(`/patient/order-details/${order.id}`)}
                        >
                            <FaEye />
                            View Order
                        </button>

                    </div>

                </div>
            ))}

        </div>
    );
}

export default PatientOrders;