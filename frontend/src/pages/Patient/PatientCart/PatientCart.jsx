import React, { useState } from "react";
import { FaTrash, FaArrowLeft, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./PatientCart.css";

const initialCart = [
    {
        id: 1,
        name: "Paracetamol 650mg",
        price: 35,
        quantity: 2,
    },
    {
        id: 2,
        name: "Vitamin C Tablets",
        price: 220,
        quantity: 1,
    },
];

function PatientCart() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState(initialCart);

    const updateQuantity = (id, value) => {
        setCartItems((items) =>
            items.map((item) =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, Number(value)) }
                    : item
            )
        );
    };

    const removeItem = (id) => {
        setCartItems(cartItems.filter((item) => item.id !== id));
    };

    const total = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <div className="patient-cart">

            <button className="back-btn" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Back
            </button>

            <h2>
                <FaShoppingCart /> My Cart
            </h2>

            {cartItems.length === 0 ? (
                <div className="empty-cart">
                    <h3>Your cart is empty.</h3>
                </div>
            ) : (
                <>
                    {cartItems.map((item) => (
                        <div className="cart-card" key={item.id}>

                            <div>
                                <h4>{item.name}</h4>
                                <p>₹ {item.price}</p>
                            </div>

                            <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                    updateQuantity(item.id, e.target.value)
                                }
                            />

                            <button
                                className="remove-btn"
                                onClick={() => removeItem(item.id)}
                            >
                                <FaTrash />
                            </button>

                        </div>
                    ))}

                    <div className="cart-summary">
                        <h3>Total : ₹ {total}</h3>

                        <button
                            className="checkout-btn"
                            onClick={() => navigate("/patient/checkout")}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default PatientCart;