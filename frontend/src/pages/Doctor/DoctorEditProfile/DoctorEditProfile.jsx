import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorEditProfile.css";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Not Provided"];
const DOCTOR_TYPE = "Hospital";

function DoctorEditProfile() {
  const navigate = useNavigate();
  const [bloodGroup, setBloodGroup] = useState(
    localStorage.getItem("doctorBloodGroup") || "O+"
  );
  const [city, setCity] = useState(
    localStorage.getItem("doctorCity") || "Kozhikode"
  );
  const [isDonorAvailable, setIsDonorAvailable] = useState(
    localStorage.getItem("doctorIsDonorAvailable") !== "false"
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalBg = bloodGroup || "Not Provided";
    localStorage.setItem("doctorBloodGroup", finalBg);
    localStorage.setItem("doctorCity", city || "Kozhikode");
    localStorage.setItem("doctorIsDonorAvailable", isDonorAvailable ? "true" : "false");
    navigate("/doctor/profile");
  };

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-card">
        <h2>Edit Profile</h2>

        <form className="edit-profile-form" onSubmit={handleSubmit}>
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
            <label>
              Blood Group <span style={{ fontSize: "0.8rem", color: "#64748b" }}>(Optional)</span>
            </label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="edit-profile-select"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                outline: "none",
                fontSize: "14px",
                marginTop: "6px",
              }}
            >
              <option value="">Not Provided</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>City / District Location</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Kozhikode, Malappuram"
            />
          </div>

          <div className="form-group checkbox-group" style={{ margin: "12px 0" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={isDonorAvailable}
                onChange={(e) => setIsDonorAvailable(e.target.checked)}
              />
              <span><strong>Available for Blood Donation</strong> (Urgent blood requests)</span>
            </label>
          </div>

          {DOCTOR_TYPE === "Hospital" ? (
            <>
              <div className="form-group">
                <label>Hospital Name</label>
                <input type="text" defaultValue="Apollo Hospital, Kochi" />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input type="text" defaultValue="Cardiology" />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Clinic Name</label>
                <input type="text" defaultValue="HeartCare Clinic" />
              </div>
              <div className="form-group">
                <label>Clinic Address</label>
                <input type="text" defaultValue="123 Main St, Kochi" />
              </div>
              <div className="form-group">
                <label>Clinic Timings</label>
                <input type="text" defaultValue="Mon-Sat, 9:00 AM - 5:00 PM" />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" defaultChecked /> Walk-in Available
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" defaultChecked /> Online Consultation Available
                </label>
              </div>
            </>
          )}

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

            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/doctor/profile")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DoctorEditProfile;