import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaLock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import './PatientChangePassword.css';

function PatientChangePassword() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Auto redirect after 2 seconds
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    }, 800);
  };

  return (
    <div className="pcp-page">
      <header className="pcp-header">
        <button className="pcp-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
      </header>

      <div className="pcp-form-container">
        <div className="pcp-icon-container">
          <FaLock className="pcp-icon" />
        </div>
        <h1 className="pcp-title">Change Password</h1>
        <p className="pcp-subtitle">Update your password to keep your account secure.</p>

        {error && (
          <div className="pcp-alert pcp-alert-error">
            <FaExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="pcp-alert pcp-alert-success">
            <FaCheckCircle />
            <span>Password successfully updated! Redirecting...</span>
          </div>
        )}

        <form className="pcp-form" onSubmit={handleSubmit}>
          <div className="pcp-form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>

          <div className="pcp-form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min. 8 characters)"
            />
          </div>

          <div className="pcp-form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
            />
          </div>

          <button type="submit" className="pcp-submit-btn">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default PatientChangePassword;
