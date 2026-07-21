import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTools } from 'react-icons/fa';
import './PatientChangePassword.css';

function PatientChangePassword() {
  const navigate = useNavigate();

  return (
    <div className="pcp-page">
      <header className="pcp-header">
        <button className="pcp-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
      </header>

      <div className="pcp-content">
        <div className="pcp-icon-container">
          <FaTools className="pcp-icon" />
        </div>
        <h1 className="pcp-title">Under Construction</h1>
        <p className="pcp-message">
          The Change Password feature is coming soon. We are working hard to bring you a secure and seamless experience.
        </p>
      </div>
    </div>
  );
}

export default PatientChangePassword;
