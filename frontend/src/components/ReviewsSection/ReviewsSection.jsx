import React from "react";
import { FaStar, FaQuoteLeft } from "react-icons/fa";
import "./ReviewsSection.css";

const reviews = [
    {
        name: "Akhil Mathew",
        role: "Patient",
        image: "https://i.pravatar.cc/150?img=12",
        rating: 5,
        review:
            "Booking an appointment was incredibly simple. The doctor was professional and the video consultation saved me a hospital visit.",
    },
    {
        name: "Sneha Nair",
        role: "Patient",
        image: "https://i.pravatar.cc/150?img=47",
        rating: 5,
        review:
            "The platform helped me find the right specialist within minutes. The entire experience felt smooth and trustworthy.",
    },
    {
        name: "Rahul Joseph",
        role: "Patient",
        image: "https://i.pravatar.cc/150?img=15",
        rating: 5,
        review:
            "Medicine ordering and prescription management were seamless. Everything I needed was available in one place.",
    },
];

function ReviewsSection() {
    return (
        <section className="reviews-section">
            <div className="reviews-container">
                <div className="reviews-header">
                    <span className="reviews-badge">Trusted by Patients</span>

                    <h2>
                        What Our <span>Patients Say</span>
                    </h2>

                    <p>
                        Thousands of patients trust MedicoBridge for appointments,
                        consultations and healthcare services.
                    </p>
                </div>

                <div className="reviews-grid">
                    {reviews.map((review, index) => (
                        <div className="review-card" key={index}>
                            <FaQuoteLeft className="quote-icon" />

                            <div className="review-stars">
                                {[...Array(review.rating)].map((_, i) => (
                                    <FaStar key={i} />
                                ))}
                            </div>

                            <p className="review-text">
                                "{review.review}"
                            </p>

                            <div className="review-user">
                                <img
                                    src={review.image}
                                    alt={review.name}
                                    className="review-avatar"
                                />

                                <div>
                                    <h4>{review.name}</h4>
                                    <span>{review.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default ReviewsSection;