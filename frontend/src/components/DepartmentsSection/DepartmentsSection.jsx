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

    const handleDepartmentClick = (dept) => {
        toast.info(`🔒 Login to view doctors in ${dept}.`, {
            position: "top-center",
            autoClose: 2500,
        });
    };

    return (
        <section className="departments-section" id="departments">
            <h2>Explore Departments</h2>

            {!selectedCategory ? (
                <div className="department-list">
                    {Object.entries(departments).map(([category, value]) => (
                        <div
                            key={category}
                            className="department-row"
                            onClick={() => setSelectedCategory(category)}
                        >
                            <div className="department-left">
                                <div className="department-icon">
                                    {dept.icon}
                                </div>

                                <span className="department-title">
                                    {dept.name}
                                </span>
                            </div>

                            <div className="department-arrow">
                                <FaChevronRight />
                            </div>

                            <FaChevronRight />
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <button
                        className="back-btn"
                        onClick={() => setSelectedCategory(null)}
                    >
                        <FaArrowLeft /> Back
                    </button>

                    <h3>{selectedCategory}</h3>

                    <div className="subcategory-header">
                        <h3>{selected.icon} {selected.name}</h3>

                        <p>
                            Select a speciality to explore available doctors.
                        </p>
                    </div>

                    <div className="subcategory-list">
                        {selected.items.map((item) => (
                            <div
                                key={item}
                                className="subcategory-item"
                                onClick={() => toast.info(`🔒 Login to view doctors in ${item}.`)}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}

export default DepartmentsSection;