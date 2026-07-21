import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import './PatientAddresses.css';

function PatientAddresses() {
  const navigate = useNavigate();

  const addresses = [
    {
      id: 1,
      type: 'Home',
      address: '123 Health Ave, Apt 4B',
      city: 'New York, NY 10001',
      isDefault: true
    },
    {
      id: 2,
      type: 'Work',
      address: '456 Business Blvd, Suite 200',
      city: 'New York, NY 10012',
      isDefault: false
    }
  ];

  return (
    <div className="pa-page">
      <header className="pa-header">
        <button className="pa-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <h1 className="pa-title">Saved Addresses</h1>
        <p className="pa-subtitle">Manage your shipping and billing addresses</p>
      </header>

      <div className="pa-content">
        <button className="pa-add-btn" onClick={() => alert("Add address is simulated")}>
          <FaPlus /> Add New Address
        </button>

        <div className="pa-list">
          {addresses.map(addr => (
            <div key={addr.id} className="pa-card">
              <div className="pa-card-icon">
                <FaMapMarkerAlt />
              </div>
              <div className="pa-card-details">
                <div className="pa-card-header">
                  <h3>{addr.type}</h3>
                  {addr.isDefault && <span className="pa-badge">Default</span>}
                </div>
                <p>{addr.address}</p>
                <p>{addr.city}</p>
              </div>
              <div className="pa-card-actions">
                <button className="pa-icon-btn" onClick={() => alert("Edit simulated")}><FaEdit /></button>
                <button className="pa-icon-btn pa-delete" onClick={() => alert("Delete simulated")}><FaTrash /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PatientAddresses;
