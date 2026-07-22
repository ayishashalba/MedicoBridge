import React, { useState } from "react";
import {
    FaHospital,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaUserTie,
    FaBed,
    FaUserMd,
    FaEdit,
} from "react-icons/fa";

import "./HospitalProfile.css";

function HospitalProfile() {
    const [editing, setEditing] = useState(false);

    const [hospital, setHospital] = useState({
        name: "City General Hospital",
        admin: "Admin Center",
        email: "admin@cityhospital.com",
        phone: "+91 9876543210",
        address: "MG Road, Kochi",
    });
    return (
        <div className="hospital-profile-page">
            <div className="hospital-profile-card">

                {/* Header */}
                <div className="hospital-profile-header">
                    <div className="hospital-profile-avatar">
                        <FaHospital />
                    </div>

                    <div className="hospital-profile-details">
                        {
                            editing ? (
                                <input
                                    className="profile-input"
                                    value={hospital.name}
                                    onChange={(e) =>
                                        setHospital({ ...hospital, name: e.target.value })
                                    }
                                />
                            ) : (
                                <h2>{hospital.name}</h2>
                            )
                        }
                        <p>Hospital Administration</p>
                        <span className="hospital-id">Hospital ID : #HOSP-5021</span>
                    </div>

                    <button
                        className="edit-profile-btn"
                        onClick={() => setEditing(!editing)}
                    >
                        <FaEdit />
                        {editing ? "Save Profile" : "Edit Profile"}
                    </button>
                </div>

                {/* Information */}
                <div className="profile-grid">

                    <div className="profile-item">
                        <FaEnvelope className="profile-icon" />
                        <div>
                            <h4>Email</h4>
                            {
                                editing ? (
                                    <input
                                        className="profile-input"
                                        value={hospital.email}
                                        onChange={(e) =>
                                            setHospital({ ...hospital, email: e.target.value })
                                        }
                                    />
                                ) : (
                                    <p>{hospital.email}</p>
                                )
                            }
                        </div>
                    </div>

                    <div className="profile-item">
                        <FaPhone className="profile-icon" />
                        <div>
                            <h4>Phone</h4>
                            {
                                editing ? (
                                    <input
                                        className="profile-input"
                                        value={hospital.phone}
                                        onChange={(e) =>
                                            setHospital({ ...hospital, phone: e.target.value })
                                        }
                                    />
                                ) : (
                                    <p>{hospital.phone}</p>
                                )
                            }
                        </div>
                    </div>

                    <div className="profile-item">
                        <FaMapMarkerAlt className="profile-icon" />
                        <div>
                            <h4>Location</h4>
                            {
                                editing ? (
                                    <input
                                        className="profile-input"
                                        value={hospital.address}
                                        onChange={(e) =>
                                            setHospital({ ...hospital, address: e.target.value })
                                        }
                                    />
                                ) : (
                                    <p>{hospital.address}</p>
                                )
                            }
                        </div>
                    </div>

                    <div className="profile-item">
                        <FaUserTie className="profile-icon" />
                        <div>
                            <h4>Administrator</h4>
                            <p>Dr. Ayisha Shalba</p>
                        </div>
                    </div>

                    <div className="profile-item">
                        <FaUserMd className="profile-icon" />
                        <div>
                            <h4>Total Doctors</h4>
                            <p>84 Doctors</p>
                        </div>
                    </div>

                    <div className="profile-item">
                        <FaBed className="profile-icon" />
                        <div>
                            <h4>Total Beds</h4>
                            <p>250 Beds</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default HospitalProfile;