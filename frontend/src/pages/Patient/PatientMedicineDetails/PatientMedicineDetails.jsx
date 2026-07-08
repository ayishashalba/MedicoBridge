import React, { useState } from "react";
import {
    FaArrowLeft,
    FaShoppingCart,
    FaBolt,
    FaCheckCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./PatientMedicineDetails.css";

function PatientMedicineDetails() {
    const navigate = useNavigate();

    const [quantity, setQuantity] = useState(1);

    const medicine = {
        name: "Paracetamol 650mg",
        brand: "Cipla",
        price: 35,
        stock: "In Stock",
        description:
            "Used for fever, headache and mild to moderate pain relief.",
    };

    return (
        <div className="medicine-details">

            <button
                className="back-btn"
                onClick={() => navigate(-1)}
            >
                <FaArrowLeft /> Back
            </button>

            <div className="medicine-card">

                <div className="medicine-image">
                    💊
                </div>

                <div className="medicine-info">

                    <h2>{medicine.name}</h2>

                    <p className="brand">
                        Brand : {medicine.brand}
                    </p>

                    <h3>₹ {medicine.price}</h3>

                    <span className="stock">
                        <FaCheckCircle /> {medicine.stock}
                    </span>

                    <p className="description">
                        {medicine.description}
                    </p>

                    <div className="quantity-box">

                        <label>Quantity</label>

                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) =>
                                setQuantity(e.target.value)
                            }
                        />

                    </div>

                    <div className="button-group">

                        <button
                            className="cart-btn"
                            onClick={() => navigate("/patient/cart")}
                        >
                            <FaShoppingCart />
                            Add to Cart
                        </button>

                        <button className="buy-btn">
                            <FaBolt />
                            Buy Now
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default PatientMedicineDetails;