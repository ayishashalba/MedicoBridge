import React, { useEffect, useState } from "react";

import {
  FaUserMd,
  FaHospital,
  FaGraduationCap,
  FaBriefcase,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaEdit,
  FaIdCard,
  FaTint,
} from "react-icons/fa";

import "./DoctorProfile.css";
import { useNavigate } from "react-router-dom";

function DoctorProfile() {
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const response = await fetch(
          "http://localhost:5000/api/doctor/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        console.log("DOCTOR PROFILE RESPONSE:", data);

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch doctor profile"
          );
        }

        const profile =
          data?.data?.profile ||
          data?.data ||
          data?.profile;

        if (!profile) {
          throw new Error("Doctor profile not found.");
        }

        setDoctor(profile);
      } catch (err) {
        console.error("Doctor profile fetch error:", err);

        setError(
          err.message || "Failed to load doctor profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, []);

  if (loading) {
    return (
      <div className="doctor-profile-page">
        <div className="profile-card">
          <p>Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctor-profile-page">
        <div className="profile-card">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="doctor-profile-page">
        <div className="profile-card">
          <p>Doctor profile not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-profile-page">

      {/* TOP PROFILE CARD */}
      <div className="profile-card">
        <div className="profile-top">

          <div className="doctor-avatar">
            <FaUserMd />
          </div>

          <div className="doctor-basic-info">
            <h2>
              {doctor.name || "Not Provided"}
            </h2>

            <p>
              {doctor.specialization || "Not Provided"}
            </p>

            <button
              className="edit-profile-btn"
              onClick={() =>
                navigate("/doctor/edit-profile")
              }
            >
              <FaEdit />
              Edit Profile
            </button>
          </div>

        </div>
      </div>

      {/* PROFILE DETAILS */}
      <div className="profile-details">

        {/* PROFESSIONAL INFORMATION */}
        <div className="info-card">
          <h3>Professional Information</h3>

          <p>
            <FaGraduationCap />
            <strong> Qualification:</strong>{" "}
            {doctor.qualification || "Not Provided"}
          </p>

          <p>
            <FaBriefcase />
            <strong> Experience:</strong>{" "}
            {doctor.experience || "Not Provided"}
          </p>

          <p>
            <FaTint />
            <strong> Blood Group:</strong>{" "}
            {doctor.bloodGroup || "Not Provided"}
          </p>

          <p>
            <FaIdCard />
            <strong> Registration No:</strong>{" "}
            {doctor.medRegNumber || "Not Provided"}
          </p>

          <p>
            <FaUserMd />
            <strong> Practice Type:</strong>{" "}
            {doctor.practiceType === "hospital"
              ? "Hospital"
              : "Private Clinic"}
          </p>

          {doctor.practiceType === "hospital" ? (
            <>
              <p>
                <FaHospital />
                <strong> Hospital:</strong>{" "}
                {doctor.hospitalName || "Not Provided"}
              </p>

              <p>
                <FaMapMarkerAlt />
                <strong> Branch Location:</strong>{" "}
                {doctor.branchLocation || "Not Provided"}
              </p>

              <p>
                <FaUserMd />
                <strong> Department:</strong>{" "}
                {doctor.department || "Not Provided"}
              </p>
            </>
          ) : (
            <>
              <p>
                <FaHospital />
                <strong> Clinic Name:</strong>{" "}
                {doctor.clinicName || "Not Provided"}
              </p>

              <p>
                <FaMapMarkerAlt />
                <strong> Clinic Address:</strong>{" "}
                {doctor.clinicAddress || "Not Provided"}
              </p>

              <p>
                <FaMapMarkerAlt />
                <strong> City:</strong>{" "}
                {doctor.clinicCity || "Not Provided"}
              </p>

              <p>
                <FaMapMarkerAlt />
                <strong> State:</strong>{" "}
                {doctor.clinicState || "Not Provided"}
              </p>

              <p>
                <FaMapMarkerAlt />
                <strong> Pincode:</strong>{" "}
                {doctor.clinicPincode || "Not Provided"}
              </p>
            </>
          )}

          <p>
            <FaMapMarkerAlt />
            <strong> City:</strong>{" "}
            {doctor.city || "Not Provided"}
          </p>

          <p>
            <FaTint />
            <strong> Blood Donation:</strong>{" "}
            {doctor.isDonorAvailable
              ? "Available"
              : "Not Available"}
          </p>
        </div>

        {/* CONTACT DETAILS */}
        <div className="info-card">
          <h3>Contact Details</h3>

          <p>
            <FaPhoneAlt />
            <strong> Phone:</strong>{" "}
            {doctor.phone || "Not Provided"}
          </p>

          <p>
            <FaEnvelope />
            <strong> Email:</strong>{" "}
            {doctor.email || "Not Provided"}
          </p>

          <p>
            <FaMapMarkerAlt />
            <strong> City:</strong>{" "}
            {doctor.city || "Not Provided"}
          </p>
        </div>

      </div>
    </div>
  );
}

export default DoctorProfile;