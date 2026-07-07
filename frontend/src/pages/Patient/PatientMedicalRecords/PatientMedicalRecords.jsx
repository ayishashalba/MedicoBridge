import React from "react";
import {
  FaFileMedical,
  FaCalendarAlt,
  FaUserMd,
  FaHospital,
  FaEye,
  FaSearch,
} from "react-icons/fa";
import "./PatientMedicalRecords.css";
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

const consultations = [
  {
    id: 1,
    doctor: "Dr. Sarah Johnson",
    specialization: "Cardiologist",
    hospital: "Apollo Hospital",
    city: "Kochi",
    date: "20 June 2026",
    type: "Online Consultation",
    diagnosis: "Mild Hypertension",
    status: "Completed",
  },
  {
    id: 2,
    doctor: "Dr. John Smith",
    specialization: "Dermatologist",
    hospital: "Aster Clinic",
    city: "Kochi",
    date: "12 June 2026",
    type: "Hospital Visit",
    diagnosis: "Skin Allergy",
    status: "Completed",
  },
  {
    id: 3,
    doctor: "Dr. Emily Wilson",
    specialization: "Neurologist",
    hospital: "Lakeshore Hospital",
    city: "Ernakulam",
    date: "03 June 2026",
    type: "Online Consultation",
    diagnosis: "Migraine",
    status: "Completed",
  },
];
const prescriptions = [
  {
    id: 1,
    doctor: "Dr. Sarah Johnson",
    date: "20 June 2026",
    diagnosis: "Mild Hypertension",
    medicines: "Amlodipine, Aspirin",
  },
  {
    id: 2,
    doctor: "Dr. John Smith",
    date: "12 June 2026",
    diagnosis: "Skin Allergy",
    medicines: "Cetirizine, Calamine Lotion",
  },
];
const labReports = [
  {
    id: 1,
    test: "Complete Blood Count (CBC)",
    hospital: "Apollo Hospital, Kochi",
    date: "18 June 2026",
    status: "Available",
  },
  {
    id: 2,
    test: "Blood Sugar Test",
    hospital: "Aster Clinic, Kochi",
    date: "05 June 2026",
    status: "Available",
  },
];

const medicalDocuments = [
  {
    id: 1,
    title: "Chest X-Ray",
    hospital: "Apollo Hospital, Kochi",
    date: "15 June 2026",
    type: "X-Ray",
  },
  {
    id: 2,
    title: "MRI Brain Scan",
    hospital: "Lakeshore Hospital, Ernakulam",
    date: "02 June 2026",
    type: "MRI",
  },
  {
    id: 3,
    title: "ECG Report",
    hospital: "Aster Clinic, Kochi",
    date: "28 May 2026",
    type: "ECG",
  },
];


function PatientMedicalRecords() {
  return (
    <div className="medical-records">

      <div className="medical-header">
        <div className="records-toolbar">

          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search medical records..."
            />
          </div>

          <select className="filter-select">
            <option>All Records</option>
            <option>Consultations</option>
            <option>Prescriptions</option>
            <option>Lab Reports</option>
            <option>Medical Documents</option>
          </select>

        </div>
        <h2>
          <FaFileMedical /> Medical Records
        </h2>
        <p>
          View your complete consultation history and healthcare records.
        </p>
      </div>

      <div className="records-section">

        <h3>Consultation History</h3>

        {consultations.map((record) => (
          <div className="record-card" key={record.id}>

            <div className="record-left">

              <div className="record-icon">
                <FaUserMd />
              </div>

              <div className="record-details">

                <h4>{record.doctor}</h4>

                <p>{record.specialization}</p>

                <p>
                  <FaHospital /> {record.hospital}, {record.city}
                </p>

                <p>
                  <FaCalendarAlt /> {record.date}
                </p>

                <span className="consultation-type">
                  {record.type}
                </span>

                <div className="diagnosis">
                  Diagnosis: <strong>{record.diagnosis}</strong>
                </div>

              </div>

            </div>

            <div className="record-right">

              <span className="completed-badge">
                {record.status}
              </span>


              <button
                className="view-btn"
                onClick={() => navigate(`/patient/medical-records/${record.id}`)}
              >
                <FaEye />
                View Details
              </button>

            </div>

          </div>
        ))}

      </div>
      <div className="records-section">

        <h3>Prescriptions</h3>

        {prescriptions.map((item) => (
          <div className="record-card" key={item.id}>

            <div className="record-left">

              <div className="record-icon">
                <FaFileMedical />
              </div>

              <div className="record-details">

                <h4>{item.doctor}</h4>

                <p>Date: {item.date}</p>

                <p>Diagnosis: {item.diagnosis}</p>

                <p>Medicines: {item.medicines}</p>

              </div>

            </div>

            <div className="record-right">

              <button className="view-btn">
                <FaEye />
                View Prescription
              </button>

            </div>

          </div>
        ))}

      </div>
      <div className="records-section">

        <h3>Lab Reports</h3>

        {labReports.map((report) => (
          <div className="record-card" key={report.id}>

            <div className="record-left">

              <div className="record-icon">
                <FaFileMedical />
              </div>

              <div className="record-details">

                <h4>{report.test}</h4>

                <p>{report.hospital}</p>

                <p>Date: {report.date}</p>

                <p>Status: {report.status}</p>

              </div>

            </div>

            <div className="record-right">

              <button className="view-btn">
                <FaEye />
                View Report
              </button>

            </div>

          </div>
        ))}

      </div>
      <div className="records-section">

        <h3>Medical Documents</h3>

        {medicalDocuments.map((document) => (
          <div className="record-card" key={document.id}>

            <div className="record-left">

              <div className="record-icon">
                <FaFileMedical />
              </div>

              <div className="record-details">

                <h4>{document.title}</h4>

                <p>{document.hospital}</p>

                <p>Type: {document.type}</p>

                <p>Date: {document.date}</p>

              </div>

            </div>

            <div className="record-right">

              <button className="view-btn">
                <FaEye />
                View Document
              </button>

            </div>

          </div>
        ))}

      </div>
    </div>


  );

}


export default PatientMedicalRecords;