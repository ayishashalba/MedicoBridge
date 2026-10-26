import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaPlus, FaEdit, FaTrash, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../../services/apiConfig';
import './PatientAddresses.css';

function PatientAddresses() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    city: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login/patient');
        return;
      }
      const res = await fetch(`${API_BASE_URL}/patient/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setProfile(data.data);
        setFormData({
          address: data.data.address || '',
          city: data.data.city || '',
        });
      }
    } catch (err) {
      console.error('Error fetching address:', err);
      toast.error('Failed to load address.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.address.trim()) {
      toast.error('Address cannot be empty.');
      return;
    }
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/patient/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          address: formData.address.trim(),
          city: formData.city.trim(),
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Address updated successfully!');
        setProfile(prev => ({
          ...prev,
          address: formData.address.trim(),
          city: formData.city.trim()
        }));
        setIsEditing(false);
      } else {
        toast.error(data.message || 'Failed to update address.');
      }
    } catch (err) {
      console.error('Save address error:', err);
      toast.error('Error saving address.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to remove your saved address?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/patient/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          address: '',
          city: '',
        })
      });
      if (res.ok) {
        toast.success('Address removed.');
        setProfile(prev => ({ ...prev, address: '', city: '' }));
        setFormData({ address: '', city: '' });
      } else {
        toast.error('Failed to remove address.');
      }
    } catch (err) {
      toast.error('Error deleting address.');
    }
  };

  const hasAddress = profile?.address && profile.address.trim().length > 0;

  return (
    <div className="pa-page">
      <header className="pa-header">
        <button className="pa-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <h1 className="pa-title">Saved Addresses</h1>
        <p className="pa-subtitle">Manage your delivery and billing address</p>
      </header>

      <div className="pa-content">
        {!isEditing && (
          <button
            className="pa-add-btn"
            onClick={() => {
              setFormData({
                address: profile?.address || '',
                city: profile?.city || '',
              });
              setIsEditing(true);
            }}
          >
            <FaPlus /> {hasAddress ? 'Update Saved Address' : 'Add New Address'}
          </button>
        )}

        {isEditing && (
          <form onSubmit={handleSave} className="pa-card" style={{ flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, color: '#0f172a' }}>{hasAddress ? 'Edit Address' : 'Add Address'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Street Address / Landmark</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Flat 402, Green Valley Apartments"
                style={{ padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>City, State & Postal Code</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Kochi, Kerala 682001"
                style={{ padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={saving}
                className="pa-add-btn"
                style={{ margin: 0, padding: '0.5rem 1.25rem' }}
              >
                <FaCheck /> {saving ? 'Saving...' : 'Save Address'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="pa-icon-btn"
                style={{ width: 'auto', padding: '0.5rem 1rem' }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading address details...</div>
        ) : hasAddress ? (
          <div className="pa-list">
            <div className="pa-card">
              <div className="pa-card-icon">
                <FaMapMarkerAlt />
              </div>
              <div className="pa-card-details">
                <div className="pa-card-header">
                  <h3>Home</h3>
                  <span className="pa-badge">Primary Delivery</span>
                </div>
                <p>{profile.address}</p>
                {profile.city && <p>{profile.city}</p>}
              </div>
              <div className="pa-card-actions">
                <button
                  className="pa-icon-btn"
                  title="Edit Address"
                  onClick={() => {
                    setFormData({ address: profile.address || '', city: profile.city || '' });
                    setIsEditing(true);
                  }}
                >
                  <FaEdit />
                </button>
                <button
                  className="pa-icon-btn pa-delete"
                  title="Remove Address"
                  onClick={handleDelete}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ) : (
          !isEditing && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
              <FaMapMarkerAlt style={{ fontSize: '2.5rem', color: '#cbd5e1', marginBottom: '1rem' }} />
              <h3 style={{ margin: '0 0 0.5rem', color: '#1e293b' }}>No Address Saved</h3>
              <p style={{ margin: 0 }}>Add your delivery address to speed up medicine checkout and consultations.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default PatientAddresses;
