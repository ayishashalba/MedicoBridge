import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

import { toast } from "react-toastify";
import "./HospitalProfile.css";

function HospitalProfile() {
    const navigate = useNavigate();

    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [hospital, setHospital] = useState({
        _id: "",
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        regNumber: "",
        hospitalType: "",
        departments: [],
    });

    // =========================
    // FETCH HOSPITAL PROFILE
    // =========================
    useEffect(() => {
        const fetchHospitalProfile = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login/hospital");
                    return;
                }

                const response = await fetch(
                    "http://localhost:5000/api/hospital/profile",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                console.log("HOSPITAL PROFILE RESPONSE:", data);

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load hospital profile."
                    );
                }

                const profile =
                    data.data?.profile ||
                    data.profile ||
                    data.data ||
                    data.hospital;

                if (!profile) {
                    throw new Error("Hospital profile data not found.");
                }

                setHospital({
                    _id: profile._id || "",
                    name: profile.name || "",
                    email: profile.email || "",
                    phone: profile.phone || "",
                    address: profile.address || "",
                    city: profile.city || "",
                    state: profile.state || "",
                    regNumber: profile.regNumber || "",
                    hospitalType: profile.hospitalType || "",
                    departments: Array.isArray(profile.departments)
                        ? profile.departments
                        : [],
                });
            } catch (error) {
                console.error("Hospital profile error:", error);
                setError(error.message || "Failed to load hospital profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchHospitalProfile();
    }, [navigate]);

    // =========================
    // INPUT CHANGE
    // =========================
    const handleChange = (field, value) => {
        setHospital((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // =========================
    // SAVE PROFILE
    // =========================
    const handleSave = async () => {
        try {
            setSaving(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login/hospital");
                return;
            }

            const response = await fetch(
                "http://localhost:5000/api/hospital/profile",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: hospital.name,
                        phone: hospital.phone,
                        address: hospital.address,
                        city: hospital.city,
                        state: hospital.state,
                        hospitalType: hospital.hospitalType,
                        departments: hospital.departments,
                    }),
                }
            );

            const data = await response.json();

            console.log("HOSPITAL PROFILE UPDATE RESPONSE:", data);

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update hospital profile."
                );
            }

            const updatedProfile =
                data.data?.profile ||
                data.data ||
                data.profile ||
                data.hospital;

            if (updatedProfile) {
                setHospital((prev) => ({
                    ...prev,
                    ...updatedProfile,
                    departments: Array.isArray(updatedProfile.departments)
                        ? updatedProfile.departments
                        : prev.departments,
                }));
            }

            setEditing(false);

            toast.success("Hospital profile updated successfully.");
        } catch (error) {
            console.error("Hospital profile update error:", error);

            const errText = error.message || "Failed to update hospital profile.";
            toast.error(errText);
            setError(errText);
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // HOSPITAL ID
    // =========================
    const hospitalDisplayId = hospital._id
        ? `#HOSP-${hospital._id.slice(-3).toUpperCase()}`
        : "#HOSP----";

    if (loading) {
        return (
            <div className="hospital-profile-page">
                <div className="hospital-profile-card">
                    <p>Loading hospital profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="hospital-profile-page">
            <div className="hospital-profile-card">

                {/* HEADER */}
                <div className="hospital-profile-header">
                    <div className="hospital-profile-avatar">
                        <FaHospital />
                    </div>

                    <div className="hospital-profile-details">
                        {editing ? (
                            <input
                                className="profile-input"
                                value={hospital.name}
                                onChange={(e) =>
                                    handleChange("name", e.target.value)
                                }
                            />
                        ) : (
                            <h2>{hospital.name || "Hospital"}</h2>
                        )}

                        <p>Hospital Administration</p>

                        <span className="hospital-id">
                            Hospital ID : {hospitalDisplayId}
                        </span>
                    </div>

                    <button
                        className="edit-profile-btn"
                        onClick={editing ? handleSave : () => setEditing(true)}
                        disabled={saving}
                    >
                        <FaEdit />

                        {saving
                            ? "Saving..."
                            : editing
                                ? "Save Profile"
                                : "Edit Profile"}
                    </button>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="profile-error">
                        {error}
                    </div>
                )}

                {/* INFORMATION */}
                <div className="profile-grid">

                    {/* EMAIL */}
                    <div className="profile-item">
                        <FaEnvelope className="profile-icon" />

                        <div>
                            <h4>Email</h4>

                            <p>{hospital.email || "Not Provided"}</p>
                        </div>
                    </div>

                    {/* PHONE */}
                    <div className="profile-item">
                        <FaPhone className="profile-icon" />

                        <div>
                            <h4>Phone</h4>

                            {editing ? (
                                <input
                                    className="profile-input"
                                    value={hospital.phone}
                                    onChange={(e) =>
                                        handleChange("phone", e.target.value)
                                    }
                                />
                            ) : (
                                <p>{hospital.phone || "Not Provided"}</p>
                            )}
                        </div>
                    </div>

                    {/* LOCATION */}
                    <div className="profile-item">
                        <FaMapMarkerAlt className="profile-icon" />

                        <div>
                            <h4>Location</h4>

                            {editing ? (
                                <>
                                    <input
                                        className="profile-input"
                                        value={hospital.address}
                                        placeholder="Address"
                                        onChange={(e) =>
                                            handleChange("address", e.target.value)
                                        }
                                    />

                                    <input
                                        className="profile-input"
                                        value={hospital.city}
                                        placeholder="City"
                                        onChange={(e) =>
                                            handleChange("city", e.target.value)
                                        }
                                    />

                                    <input
                                        className="profile-input"
                                        value={hospital.state}
                                        placeholder="State"
                                        onChange={(e) =>
                                            handleChange("state", e.target.value)
                                        }
                                    />
                                </>
                            ) : (
                                <p>
                                    {[
                                        hospital.address,
                                        hospital.city,
                                        hospital.state,
                                    ]
                                        .filter(Boolean)
                                        .join(", ") || "Not Provided"}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ADMINISTRATOR */}
                    <div className="profile-item">
                        <FaUserTie className="profile-icon" />

                        <div>
                            <h4>Administrator</h4>
                            <p>Hospital Administration</p>
                        </div>
                    </div>

                    {/* TOTAL DOCTORS */}
                    <div className="profile-item">
                        <FaUserMd className="profile-icon" />

                        <div>
                            <h4>Total Doctors</h4>
                            <p>84 Doctors</p>
                        </div>
                    </div>

                    {/* TOTAL BEDS */}
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