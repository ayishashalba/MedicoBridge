import React from "react";
import {
    FaHeartbeat,
    FaUserMd,
    FaFemale,
    FaBaby,
    FaBrain,
    FaTooth,
    FaFlask,
    FaHospital,
} from "react-icons/fa";
import "./DepartmentsSection.css";

function DepartmentsSection() {
    const categories = [
        {
            icon: <FaHeartbeat />,
            title: "Heart Care",
            desc: "Cardiology, Cardiac Surgery & Vascular Care",
        },
        {
            icon: <FaBrain />,
            title: "Brain & Nervous System",
            desc: "Neurology & Neurosurgery",
        },
        {
            icon: <FaUserMd />,
            title: "Medical Specialties",
            desc: "General Medicine, Pulmonology, Nephrology",
        },
        {
            icon: <FaHospital />,
            title: "Surgical Departments",
            desc: "Orthopedics, ENT, General Surgery",
        },
        {
            icon: <FaFemale />,
            title: "Women's Health",
            desc: "Gynecology & Obstetrics",
        },
        {
            icon: <FaBaby />,
            title: "Child Care",
            desc: "Pediatrics & Neonatal Care",
        },
        {
            icon: <FaTooth />,
            title: "Dental Care",
            desc: "Dental & Oral Health Services",
        },
        {
            icon: <FaFlask />,
            title: "Diagnostic Services",
            desc: "Laboratory & Imaging Services",
        },
    ];

    return (
        <section className="departments-section" id="departments">
            <div className="departments-header">
                <h2>Explore Medical Departments</h2>
                <p>
                    Discover specialized healthcare services across multiple medical
                    fields.
                </p>
            </div>

            <div className="departments-grid">
                {categories.map((item, index) => (
                    <div className="department-card" key={index}>
                        <div className="department-icon">{item.icon}</div>
                        <h3>{item.title}</h3>
                        <p>{item.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default DepartmentsSection;