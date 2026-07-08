import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaStar,
  FaPills,
  FaCapsules,
  FaSyringe,
  FaHeartbeat,
  FaFileUpload,
  FaArrowRight,
} from "react-icons/fa";
import "./PatientPharmacy.css";

const categories = [
  { id: 1, name: "Tablets", icon: <FaPills /> },
  { id: 2, name: "Capsules", icon: <FaCapsules /> },
  { id: 3, name: "Syrups", icon: <FaHeartbeat /> },
  { id: 4, name: "Injections", icon: <FaSyringe /> },
  { id: 5, name: "Personal Care", icon: <FaHeartbeat /> },
  { id: 6, name: "Supplements", icon: <FaHeartbeat /> },
];

const pharmacies = [
  {
    id: 1,
    name: "Apollo Pharmacy",
    rating: 4.8,
    distance: "500 m",
    status: "Open Now",
  },
  {
    id: 2,
    name: "MediPlus Pharmacy",
    rating: 4.7,
    distance: "1.2 km",
    status: "Open Now",
  },
  {
    id: 3,
    name: "Care Medicals",
    rating: 4.6,
    distance: "2 km",
    status: "Open Now",
  },
];

const medicines = [
  {
    id: 1,
    name: "Paracetamol 650mg",
    price: "₹35",
    stock: "In Stock",
  },
  {
    id: 2,
    name: "Vitamin C Tablets",
    price: "₹220",
    stock: "In Stock",
  },
  {
    id: 3,
    name: "Digital Thermometer",
    price: "₹399",
    stock: "In Stock",
  },
];

function PatientPharmacy() {
  const navigate = useNavigate();
  return (
    <div className="patient-pharmacy">

      {/* Header */}

      <div className="pharmacy-header">
        <h2>💊 Pharmacy</h2>
        <p>
          Search medicines, browse nearby pharmacies and upload your
          prescription.
        </p>
      </div>

      {/* Search */}

      <div className="medicine-search">

        <FaSearch className="search-icon" />

        <input
          type="text"
          placeholder="Search medicines..."
        />

      </div>

      {/* Categories */}

      <section className="pharmacy-section">

        <h3>Categories</h3>

        <div className="category-grid">

          {categories.map((category) => (

            <div className="category-card" key={category.id}>

              <div className="category-icon">
                {category.icon}
              </div>

              <p>{category.name}</p>

            </div>

          ))}

        </div>

      </section>

      {/* Nearby Pharmacies */}

      <section className="pharmacy-section">

        <h3>Nearby Pharmacies</h3>

        <div className="pharmacy-grid">

          {pharmacies.map((item) => (

            <div className="pharmacy-card" key={item.id}>

              <h4>{item.name}</h4>

              <p>
                <FaStar /> {item.rating}
              </p>

              <p>
                <FaMapMarkerAlt /> {item.distance}
              </p>

              <span className="open-badge">
                {item.status}
              </span>

              <button className="primary-btn">
                View Medicines
                <FaArrowRight />
              </button>

            </div>

          ))}

        </div>

      </section>

      {/* Featured Medicines */}

      <section className="pharmacy-section">

        <h3>Featured Medicines</h3>

        <div className="medicine-grid">

          {medicines.map((medicine) => (

            <div className="medicine-card" key={medicine.id}>

              <div className="medicine-image">
                💊
              </div>

              <h4>{medicine.name}</h4>

              <p>{medicine.price}</p>

              <span className="stock-badge">
                {medicine.stock}
              </span>

              <button
                className="medicine-btn"
                onClick={() => navigate(`/patient/medicine/${medicine.id}`)}
              >
                View Details
                <FaArrowRight />
              </button>

            </div>

          ))}

        </div>

      </section>

      {/* Upload Prescription */}

      <section className="upload-prescription">

        <FaFileUpload className="upload-icon" />

        <h3>Upload Prescription</h3>

        <p>
          Upload your doctor's prescription to order medicines easily.
        </p>

        <button className="primary-btn">
          Upload Prescription
        </button>

      </section>

    </div>
  );
}

export default PatientPharmacy;