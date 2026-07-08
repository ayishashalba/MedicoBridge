import React from "react";
import { FaCheckCircle, FaHome, FaClipboardList } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./PatientOrderSuccess.css";

function PatientOrderSuccess() {
    const navigate = useNavigate();

    return (
        <div className="order-success">

            <div className="success-card">

                <FaCheckCircle className="success-icon" />

                <h2>Order Placed Successfully!</h2>

                <p>
                    Thank you for your purchase.
                    Your medicines will be delivered soon.
                </p>

                <div className="order-info">

                    <p><strong>Order ID:</strong> #MB20260001</p>

                    <p><strong>Estimated Delivery:</strong> Tomorrow</p>

                    <p><strong>Payment:</strong> Cash on Delivery</p>

                </div>

                <div className="success-buttons">

                    <button
                        className="primary-btn"
                        onClick={() => navigate("/patient/pharmacy")}
                    >
                        <FaHome />
                        Continue Shopping
                    </button>

                    <button
                        className="secondary-btn"
                        onClick={() => navigate("/patient/orders")}
                    >
                        <FaClipboardList />
                        View Orders
                    </button>

                </div>

            </div>

        </div>
    );
}

export default PatientOrderSuccess;