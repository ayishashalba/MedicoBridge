import React, { useState } from "react";
import { FaArrowLeft, FaMapMarkerAlt, FaMoneyBillWave } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./PatientCheckout.css";

function PatientCheckout() {
    const navigate = useNavigate();

    const [payment, setPayment] = useState("cod");

    return (
        <div className="patient-checkout">

            <button
                className="back-btn"
                onClick={() => navigate(-1)}
            >
                <FaArrowLeft /> Back
            </button>

            <h2>Checkout</h2>

            {/* Delivery Address */}

            <div className="checkout-card">

                <h3>
                    <FaMapMarkerAlt /> Delivery Address
                </h3>

                <p>John Doe</p>

                <p>
                    House No. 12, MG Road,
                    Kochi, Kerala - 682001
                </p>

                <button className="change-btn">
                    Change Address
                </button>

            </div>

            {/* Order Summary */}

            <div className="checkout-card">

                <h3>Order Summary</h3>

                <div className="summary-row">
                    <span>Paracetamol 650mg x2</span>
                    <span>₹70</span>
                </div>

                <div className="summary-row">
                    <span>Vitamin C Tablets x1</span>
                    <span>₹220</span>
                </div>

                <hr />

                <div className="summary-row total">
                    <span>Total</span>
                    <span>₹290</span>
                </div>

            </div>

            {/* Payment */}

            <div className="checkout-card">

                <h3>
                    <FaMoneyBillWave /> Payment Method
                </h3>

                <label>
                    <input
                        type="radio"
                        value="cod"
                        checked={payment === "cod"}
                        onChange={(e) =>
                            setPayment(e.target.value)
                        }
                    />
                    Cash on Delivery
                </label>

                <label>
                    <input
                        type="radio"
                        value="upi"
                        checked={payment === "upi"}
                        onChange={(e) =>
                            setPayment(e.target.value)
                        }
                    />
                    UPI
                </label>

                <label>
                    <input
                        type="radio"
                        value="card"
                        checked={payment === "card"}
                        onChange={(e) =>
                            setPayment(e.target.value)
                        }
                    />
                    Credit / Debit Card
                </label>

            </div>

            <button
                className="place-order-btn"
                onClick={() =>
                    navigate("/patient/order-success")
                }
            >
                Place Order
            </button>

        </div>
    );
}

export default PatientCheckout;