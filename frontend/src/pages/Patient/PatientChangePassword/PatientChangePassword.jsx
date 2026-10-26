import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../../services/apiConfig';
import './PatientChangePassword.css';

function PatientChangePassword() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login/patient');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/patient/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Password successfully updated!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          navigate(-1);
        }, 1500);
      } else {
        toast.error(data.message || 'Failed to update password.');
      }
    } catch (err) {
      console.error('Password update error:', err);
      toast.error('Network error updating password.');
    } finally {
      setLoading(false);
    }
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

        <form className="pcp-form" onSubmit={handleSubmit}>
          <div className="pcp-form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              disabled={loading}
              required
            />
          </div>

          <div className="pcp-form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min. 6 characters)"
              disabled={loading}
              required
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
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="pcp-submit-btn" disabled={loading}>
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PatientChangePassword;
