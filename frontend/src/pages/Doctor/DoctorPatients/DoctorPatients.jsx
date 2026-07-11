import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaEye,
  FaSearch,
} from "react-icons/fa";
import "./DoctorPatients.css";

const patients = [
  {
    id: 1,
    name: "Rahul Nair",
    age: 32,
    gender: "Male",
    phone: "+91 9876543210",
    email: "rahul@gmail.com",
  },
  {
    id: 2,
    name: "Anjali Thomas",
    age: 27,
    gender: "Female",
    phone: "+91 9876543211",
    email: "anjali@gmail.com",
  },
  {
    id: 3,
    name: "Arun Kumar",
    age: 41,
    gender: "Male",
    phone: "+91 9876543212",
    email: "arun@gmail.com",
  },
];

function DoctorPatients() {
  const navigate = useNavigate();

  return (
    <div className="doctor-patients">

      <div className="patients-header">
        <h2>Patients</h2>
        <p>Manage your patients.</p>
      </div>

      <div className="patients-search">

        <FaSearch />

        <input
          type="text"
          placeholder="Search patient..."
        />

      </div>

      <div className="patients-grid">

        {patients.map((patient) => (

          <div
            className="patient-card"
            key={patient.id}
          >

            <div className="patient-avatar">
              <FaUser />
            </div>

            <h3>{patient.name}</h3>

            <p>{patient.age} Years • {patient.gender}</p>

            <p>
              <FaPhone />
              {patient.phone}
            </p>

            <p>
              <FaEnvelope />
              {patient.email}
            </p>

            <button
              className="view-btn"
              onClick={() =>
                navigate(`/doctor/patients/${patient.id}`)
              }
            >
              <FaEye />
              View Details
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}

export default DoctorPatients;