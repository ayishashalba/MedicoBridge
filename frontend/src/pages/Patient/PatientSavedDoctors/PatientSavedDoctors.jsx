import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaSearch,
  FaStethoscope,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaMapMarkerAlt,
  FaHospital,
  FaClinicMedical,
  FaMoneyBillWave,
  FaBriefcase,
  FaEye,
  FaCalendarCheck,
  FaTrashAlt,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import { getSavedDoctors, removeDoctorFromStorage } from "../../../utils/savedDoctorsStorage";
import "./PatientSavedDoctors.css";

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="psd-stars">
      {[1, 2, 3, 4, 5].map((i) => {
        if (i <= full) return <FaStar key={i} />;
        if (i === full + 1 && half) return <FaStarHalfAlt key={i} />;
        return <FaRegStar key={i} />;
      })}
    </span>
  );
}

function PatientSavedDoctors() {
  const navigate = useNavigate();
  const [savedList, setSavedList] = useState(() => getSavedDoctors());
  const [searchQuery, setSearchQuery] = useState("");
  const [noticeMsg, setNoticeMsg] = useState("");

  useEffect(() => {
    const handleUpdate = () => {
      setSavedList(getSavedDoctors());
    };
    window.addEventListener("savedDoctorsUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("savedDoctorsUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const handleRemove = (doctorId, doctorName) => {
    removeDoctorFromStorage(doctorId);
    setNoticeMsg(`${doctorName || "Doctor"} removed from your saved list`);
    setTimeout(() => setNoticeMsg(""), 3000);
  };

  const filteredDoctors = savedList.filter((doc) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      doc.name.toLowerCase().includes(q) ||
      (doc.specialization && doc.specialization.toLowerCase().includes(q)) ||
      (doc.hospital && doc.hospital.toLowerCase().includes(q)) ||
      (doc.city && doc.city.toLowerCase().includes(q))
    );
  });

  return (
    <div className="psd-page">
      {/* Header Banner */}
      <div className="psd-page-header">
        <div>
          <h1 className="psd-page-title">
            <FaHeart className="psd-title-heart" /> Saved Doctors
          </h1>
          <p className="psd-page-subtitle">
            Your bookmarked medical specialists for quick access, consultations, and appointment booking.
          </p>
        </div>
        <div className="psd-count-badge">
          <span>{savedList.length} Saved {savedList.length === 1 ? "Doctor" : "Doctors"}</span>
        </div>
      </div>

      {noticeMsg && (
        <div className="psd-notice-bar" role="status">
          {noticeMsg}
        </div>
      )}

      {/* Search & Toolbar */}
      {savedList.length > 0 && (
        <div className="psd-toolbar">
          <div className="psd-search-box">
            <FaSearch className="psd-search-icon" />
            <input
              type="text"
              placeholder="Search saved doctors by name, specialty, hospital..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="psd-browse-btn"
            onClick={() => navigate("/patient/find-doctors")}
          >
            <FaStethoscope /> Find More Doctors
          </button>
        </div>
      )}

      {/* Main Content Grid / Empty State */}
      {savedList.length === 0 ? (
        <div className="psd-empty-state">
          <div className="psd-empty-icon-wrap">
            <FaRegHeart className="psd-empty-icon" />
          </div>
          <h2>No Saved Doctors Yet</h2>
          <p>
            You haven't bookmarked any doctors yet. Click the <strong>Save Doctor</strong> button on any doctor's profile to add them here for fast booking.
          </p>
          <button
            className="psd-empty-browse-btn"
            onClick={() => navigate("/patient/find-doctors")}
          >
            <FaStethoscope /> Browse Doctors
          </button>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="psd-empty-state">
          <h2>No Matching Doctors Found</h2>
          <p>No saved doctor matches your search term "{searchQuery}".</p>
          <button
            className="psd-empty-browse-btn"
            onClick={() => setSearchQuery("")}
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="psd-grid">
          {filteredDoctors.map((doc) => {
            const color = doc.color || "#0d9488";
            const isHospital = doc.type === "hospital";
            return (
              <article key={doc.id} className="psd-card">
                {/* Top Ribbon */}
                <div
                  className={`psd-card-ribbon ${
                    doc.available ? "psd-ribbon--avail" : "psd-ribbon--unavail"
                  }`}
                >
                  {doc.available ? (
                    <>
                      <FaCheckCircle /> Available Today
                    </>
                  ) : (
                    <>
                      <FaClock /> Currently Unavailable
                    </>
                  )}
                </div>

                {/* Card Main Info */}
                <div className="psd-card-body">
                  <div className="psd-avatar-wrap">
                    <div
                      className="psd-avatar"
                      style={{
                        background: `linear-gradient(135deg, ${color}dd, ${color}66)`,
                        border: `2px solid ${color}55`,
                      }}
                    >
                      <span>{doc.initials || doc.name.charAt(0)}</span>
                    </div>
                  </div>

                  <div className="psd-info">
                    <h3 className="psd-doc-name">{doc.name}</h3>
                    <p className="psd-doc-spec">
                      <FaStethoscope className="psd-icon" />
                      {doc.specialization}
                    </p>

                    <div className="psd-rating-row">
                      <StarRating rating={doc.rating || 4.8} />
                      <span className="psd-rating-val">{doc.rating || 4.8}</span>
                      <span className="psd-rating-reviews">
                        ({doc.reviews || 100} reviews)
                      </span>
                    </div>

                    <div className="psd-meta-list">
                      <div className="psd-meta-item">
                        {isHospital ? (
                          <FaHospital className="psd-icon psd-icon--hosp" />
                        ) : (
                          <FaClinicMedical className="psd-icon psd-icon--clinic" />
                        )}
                        <span>{doc.hospital}</span>
                      </div>

                      {doc.city && (
                        <div className="psd-meta-item">
                          <FaMapMarkerAlt className="psd-icon psd-icon--loc" />
                          <span>{doc.city}</span>
                        </div>
                      )}

                      <div className="psd-meta-item">
                        <FaBriefcase className="psd-icon psd-icon--exp" />
                        <span>{doc.experience} Years Exp.</span>
                      </div>

                      <div className="psd-meta-item psd-fee-item">
                        <FaMoneyBillWave className="psd-icon psd-icon--fee" />
                        <span>₹{doc.fee} Consult Fee</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="psd-card-actions">
                  <button
                    className="psd-act-btn psd-act-btn--primary"
                    onClick={() => navigate(`/patient/book-appointment/${doc.id}`)}
                    title="Book Appointment"
                  >
                    <FaCalendarCheck />
                    <span>Book Appointment</span>
                  </button>

                  <button
                    className="psd-act-btn psd-act-btn--secondary"
                    onClick={() => navigate(`/patient/doctor-profile/${doc.id}`)}
                    title="View Doctor Profile"
                  >
                    <FaEye />
                    <span>View Profile</span>
                  </button>

                  <button
                    className="psd-act-btn psd-act-btn--remove"
                    onClick={() => handleRemove(doc.id, doc.name)}
                    title="Remove from Saved List"
                  >
                    <FaTrashAlt />
                    <span>Remove</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PatientSavedDoctors;
