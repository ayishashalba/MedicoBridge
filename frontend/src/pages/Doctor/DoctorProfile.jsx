import React from "react";
import {
  FaUserMd,
  FaHospital,
  FaGraduationCap,
  FaBriefcase,
  FaLanguage,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaEdit,
  FaIdCard,
  FaMoneyBillWave,
} from "react-icons/fa";
import "./DoctorProfile.css";

function DoctorProfile() {
  const doctor = {
    name: "Dr. Ayisha Shalba",
    specialization: "Cardiologist",
    qualification: "MBBS, MD (Cardiology)",
    experience: "12 Years",
    hospital: "Apollo Hospital, Kochi",
    registration: "KLMC 458721",
    consultationFee: "₹800",
    languages: "English, Malayalam, Hindi",
    email: "ayisha@example.com",
    phone: "+91 9876543210",
    address: "Kochi, Kerala",
    about:
      "Experienced Cardiologist specializing in preventive cardiology, heart failure management, and non-invasive cardiac procedures. Dedicated to providing compassionate and patient-centered care.",
  };

  return (
    <div className="doctor-profile-page">

      <div className="profile-card">

        <div className="profile-top">

          <div className="doctor-avatar">
            <FaUserMd />
          </div>

          <div className="doctor-basic-info">
            <h2>{doctor.name}</h2>
            <p>{doctor.specialization}</p>

            <button className="edit-profile-btn">
              <FaEdit />
              Edit Profile
            </button>
          </div>

        </div>

      </div>

      <div className="profile-details">

        <div className="info-card">
          <h3>Professional Information</h3>

          <p>
            <FaGraduationCap />
            <strong> Qualification:</strong> {doctor.qualification}
          </p>

          <p>
            <FaBriefcase />
            <strong> Experience:</strong> {doctor.experience}
          </p>

          <p>
            <FaHospital />
            <strong> Hospital:</strong> {doctor.hospital}
          </p>

          <p>
            <FaIdCard />
            <strong> Registration No:</strong> {doctor.registration}
          </p>

          <p>
            <FaMoneyBillWave />
            <strong> Consultation Fee:</strong> {doctor.consultationFee}
          </p>

          <p>
            <FaLanguage />
            <strong> Languages:</strong> {doctor.languages}
          </p>

        </div>

        <div className="info-card">
          <h3>About</h3>

          <p>{doctor.about}</p>

        </div>

        <div className="info-card">
          <h3>Contact Details</h3>

          <p>
            <FaPhoneAlt />
            <strong> Phone:</strong> {doctor.phone}
          </p>

          <p>
            <FaEnvelope />
            <strong> Email:</strong> {doctor.email}
          </p>

          <p>
            <FaMapMarkerAlt />
            <strong> Address:</strong> {doctor.address}
          </p>

        </div>

      </div>

    </div>
  );
}

export default DoctorProfile;