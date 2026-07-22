import React from "react";
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
    return (
        <div className="hospital-profile-page">
            <div className="hospital-profile-card">

                {/* Header */}
                <div className="hospital-profile-header">
                    <div className="hospital-profile-avatar">
                        <FaHospital />
                    </div>

                    <div className="hospital-profile-details">
                        <h2>City General Hospital</h2>
                        <p>Hospital Administration</p>
                        <span className="hospital-id">Hospital ID : #HOSP-5021</span>
                    </div>

                    <button className="edit-profile-btn">
                        <FaEdit /> Edit Profile
                    </button>
                </div>

                {/* Information */}
                <div className="profile-grid">

                    <div className="profile-item">
                        <FaEnvelope className="profile-icon" />
                        <div>
                            <h4>Email</h4>
                            <p>citygeneralhospital@gmail.com</p>
                        </div>
                    </div>

                    <div className="profile-item">
                        <FaPhone className="profile-icon" />
                        <div>
                            <h4>Phone</h4>
                            <p>+91 9876543210</p>
                        </div>
                    </div>

                    <div className="profile-item">
                        <FaMapMarkerAlt className="profile-icon" />
                        <div>
                            <h4>Location</h4>
                            <p>Kochi, Kerala</p>
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