import React, { useState } from "react";
import {
    FaArrowLeft,
    FaChevronRight,
    FaHospital,
    FaUserMd,
    FaFemale,
    FaBaby,
    FaBrain,
    FaHeartbeat,
    FaTooth,
    FaFlask,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./DepartmentsSection.css";

const departments = {
    "Medical Specialties": {
        icon: <FaUserMd />,
        items: [
            "General Medicine",
            "Pulmonology",
            "Nephrology",
            "Endocrinology",
            "Gastroenterology",
        ],
    },

    "Surgical Departments": {
        icon: <FaHospital />,
        items: [
            "General Surgery",
            "Orthopedics",
            "ENT Surgery",
            "Plastic Surgery",
            "Urology",
        ],
    },

    "Women's Health": {
        icon: <FaFemale />,
        items: [
            "Gynecology",
            "Obstetrics",
            "Fertility",
            "Breast Care",
        ],
    },

    "Child Care": {
        icon: <FaBaby />,
        items: [
            "Neonatology",
            "Pediatric Cardiology",
            "Pediatric Neurology",
            "Pediatric Surgery",
            "Pediatric Endocrinology",
        ],
    },

    "Brain & Nervous System": {
        icon: <FaBrain />,
        items: [
            "Neurology",
            "Neurosurgery",
            "Stroke Care",
            "Spine Care",
        ],
    },

    "Heart Care": {
        icon: <FaHeartbeat />,
        items: [
            "Cardiology",
            "Cardiac Surgery",
            "Interventional Cardiology",
            "Vascular Surgery",
        ],
    },

    "Dental Care": {
        icon: <FaTooth />,
        items: [
            "Orthodontics",
            "Root Canal",
            "Cosmetic Dentistry",
            "Dental Implants",
        ],
    },

    "Diagnostic Services": {
        icon: <FaFlask />,
        items: [
            "Laboratory",
            "Radiology",
            "CT Scan",
            "MRI Scan",
        ],
    },
};

function DepartmentsSection() {
    const [selectedCategory, setSelectedCategory] = useState(null);

    return (
        <section className="departments-section" id="departments">
            <h2>Explore Departments</h2>

            {!selectedCategory ? (
                <div className="department-list">
                    {Object.entries(departments).map(([category, value]) => (
                        <div
                            key={category}
                            className="department-card"
                            onClick={() => setSelectedCategory(category)}
                        >
                            <div className="department-left">
                                <div className="icon">
                                    {value.icon}
                                </div>

                                <div>
                                    <div className="department-title">
                                        {category}
                                    </div>

                                    <p className="department-description">
                                        {category === "Medical Specialties" &&
                                            "Explore physicians for internal medicine."}

                                        {category === "Surgical Departments" &&
                                            "General, ENT, Plastic & more."}

                                        {category === "Women's Health" &&
                                            "Complete care for women."}

                                        {category === "Child Care" &&
                                            "Pediatric specialists for children."}

                                        {category === "Brain & Nervous System" &&
                                            "Neurology & Neurosurgery experts."}

                                        {category === "Heart Care" &&
                                            "Cardiology & cardiac surgery."}

                                        {category === "Dental Care" &&
                                            "Advanced dental treatments."}

                                        {category === "Diagnostic Services" &&
                                            "Laboratory & imaging services."}
                                    </p>
                                </div>
                            </div>

                            <div className="department-arrow">
                                <FaChevronRight />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <>
                        <button
                            className="back-btn"
                            onClick={() => setSelectedCategory(null)}
                        >
                            <FaArrowLeft />
                            Back
                        </button>

                        <div className="subcategory-header">
                            <h3>
                                {departments[selectedCategory].icon}
                                {" "}
                                {selectedCategory}
                            </h3>

                            <p>Select a specialization</p>
                        </div>

                        <div className="subcategory-list">
                            {departments[selectedCategory].items.map((item) => (
                                <div
                                    key={item}
                                    className="subcategory-item"
                                    onClick={() =>
                                        toast.info(`🔒 Login to view doctors in ${item}.`)
                                    }
                                >
                                    <div className="sub-icon">🩺</div>

                                    <div className="sub-title">{item}</div>

                                    <div className="sub-desc">
                                        View specialists in {item}.
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                </>
            )}
        </section>
    );
}

export default DepartmentsSection;