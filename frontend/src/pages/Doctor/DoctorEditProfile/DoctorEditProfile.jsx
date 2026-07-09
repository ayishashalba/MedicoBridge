import React from "react";
import "./DoctorEditProfile.css";

function DoctorEditProfile() {
    return (
        <div className="edit-profile-page">

            <div className="edit-profile-card">

                <h2>Edit Profile</h2>

                <form className="edit-profile-form">

                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" defaultValue="Dr. Ayisha Shalba" />
                    </div>

                    <div className="form-group">
                        <label>Specialization</label>
                        <input type="text" defaultValue="Cardiologist" />
                    </div>

                    <div className="form-group">
                        <label>Qualification</label>
                        <input type="text" defaultValue="MBBS, MD (Cardiology)" />
                    </div>

                    <div className="form-group">
                        <label>Experience</label>
                        <input type="text" defaultValue="12 Years" />
                    </div>

                    <div className="form-group">
                        <label>Hospital / Clinic</label>
                        <input type="text" defaultValue="Apollo Hospital, Kochi" />
                    </div>

                    <div className="form-group">
                        <label>Registration Number</label>
                        <input type="text" defaultValue="KLMC458721" />
                    </div>

                    <div className="form-group">
                        <label>Consultation Fee</label>
                        <input type="number" defaultValue="800" />
                    </div>

                    <div className="form-group">
                        <label>Languages</label>
                        <input type="text" defaultValue="English, Malayalam, Hindi" />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" defaultValue="doctor@example.com" />
                    </div>

                    <div className="form-group">
                        <label>Phone</label>
                        <input type="text" defaultValue="+91 9876543210" />
                    </div>

                    <div className="form-group full-width">
                        <label>About</label>
                        <textarea
                            rows="5"
                            defaultValue="Experienced Cardiologist providing quality patient care."
                        />
                    </div>

                    <div className="button-group">
                        <button type="submit" className="save-btn">
                            Save Changes
                        </button>

                        <button type="button" className="cancel-btn">
                            Cancel
                        </button>
                    </div>

                </form>

            </div>

        </div>
    );
}

export default DoctorEditProfile;