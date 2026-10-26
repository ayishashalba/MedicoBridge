import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./DoctorEditProfile.css";

const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "Not Provided",
];

const SPECIALIZATIONS = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "General Surgery",
  "Gynecology & Obstetrics",
  "Hematology",
  "Internal Medicine",
  "Nephrology",
  "Neurology",
  "Neurosurgery",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Otolaryngology (ENT)",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Urology",
  "Other",
];

const ALL_DAYS = [
  "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday", "Sunday",
];

const TIME_PRESETS = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM",
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
  "6:00 PM", "6:30 PM",
];

const INITIAL = {
  name: "",
  phone: "",
  gender: "",
  bloodGroup: "Not Provided",
  city: "",

  medRegNumber: "",
  specialization: "",
  qualification: "",
  experience: "",

  practiceType: "",
  hospitalName: "",
  branchLocation: "",
  department: "",

  clinicName: "",
  clinicAddress: "",
  clinicCity: "",
  clinicState: "",
  clinicPincode: "",

  isDonorAvailable: true,
};

function DoctorEditProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ── Availability schedule state ──────────────────────────
  // slotsByDay: { "Monday": ["9:00 AM", "10:00 AM", ...], ... }
  const [slotsByDay, setSlotsByDay] = useState({});
  const [activeDays, setActiveDays] = useState([]);   // days with slots
  const [focusedDay, setFocusedDay] = useState("");   // which day panel is open
  const [customSlotInput, setCustomSlotInput] = useState("");

  // ========================================
  // FETCH EXISTING DOCTOR PROFILE
  // ========================================

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/doctor/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        console.log("DOCTOR EDIT PROFILE RESPONSE:", data);

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch doctor profile"
          );
        }

        const profile =
          data?.data?.profile ||
          data?.data ||
          data?.profile;

        if (!profile) {
          throw new Error("Doctor profile not found.");
        }

        setForm({
          name: profile.name || "",
          phone: profile.phone || "",
          gender: profile.gender || "",
          bloodGroup:
            profile.bloodGroup || "Not Provided",
          city: profile.city || "",

          medRegNumber: profile.medRegNumber || "",
          specialization:
            profile.specialization || "",
          qualification:
            profile.qualification || "",
          experience:
            profile.experience || "",

          practiceType:
            profile.practiceType || "",

          hospitalName:
            profile.hospitalName || "",
          branchLocation:
            profile.branchLocation || "",
          department:
            profile.department || "",

          clinicName:
            profile.clinicName || "",
          clinicAddress:
            profile.clinicAddress || "",
          clinicCity:
            profile.clinicCity || "",
          clinicState:
            profile.clinicState || "",
          clinicPincode:
            profile.clinicPincode || "",

          isDonorAvailable:
            profile.isDonorAvailable !== false,
        });

        // ── Load existing availability data ──────────────
        const existingSlots = Array.isArray(profile.availableSlots)
          ? profile.availableSlots
          : [];
        const existingDays = Array.isArray(profile.availableDays)
          ? profile.availableDays
          : [];

        // Build slotsByDay from availableSlots array {day, startTime}
        const rebuilt = {};
        existingSlots.forEach((s) => {
          if (!s || !s.day) return;
          if (!rebuilt[s.day]) rebuilt[s.day] = [];
          // Store startTime as the display slot string
          const slotStr = s.startTime || s.endTime || "";
          if (slotStr && !rebuilt[s.day].includes(slotStr)) {
            rebuilt[s.day].push(slotStr);
          }
        });

        // If days exist but no structured slots, mark them without slots
        existingDays.forEach((d) => {
          if (!rebuilt[d]) rebuilt[d] = [];
        });

        setSlotsByDay(rebuilt);
        const days = Object.keys(rebuilt).filter(
          (d) => ALL_DAYS.includes(d)
        );
        setActiveDays(days);
        if (days.length > 0) setFocusedDay(days[0]);
      } catch (err) {
        console.error(
          "Doctor profile fetch error:",
          err
        );

        setError(
          err.message ||
          "Failed to load doctor profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ========================================
  // CHANGE HANDLER
  // ========================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ========================================
  // SAVE PROFILE
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/doctor/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: form.name,
            phone: form.phone,
            gender: form.gender,
            bloodGroup:
              form.bloodGroup || "Not Provided",
            city: form.city,

            medRegNumber:
              form.medRegNumber,
            specialization:
              form.specialization,
            qualification:
              form.qualification,
            experience:
              form.experience,

            practiceType:
              form.practiceType,

            hospitalName:
              form.hospitalName,
            branchLocation:
              form.branchLocation,
            department:
              form.department,

            clinicName:
              form.clinicName,
            clinicAddress:
              form.clinicAddress,
            clinicCity:
              form.clinicCity,
            clinicState:
              form.clinicState,
            clinicPincode:
              form.clinicPincode,

            isDonorAvailable:
              form.isDonorAvailable,

            // ── Availability ─────────────────────────────
            availableDays: activeDays,
            availableSlots: activeDays.flatMap((day) =>
              (slotsByDay[day] || []).map((slotTime) => ({
                day,
                startTime: slotTime,
                endTime: slotTime,
                isAvailable: true,
              }))
            ),
          }),
        }
      );

      const data = await response.json();

      console.log(
        "DOCTOR PROFILE UPDATE RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to update doctor profile"
        );
      }

      // Optional compatibility with old frontend
      localStorage.setItem(
        "doctorBloodGroup",
        form.bloodGroup || "Not Provided"
      );

      localStorage.setItem(
        "doctorCity",
        form.city || ""
      );

      localStorage.setItem(
        "doctorIsDonorAvailable",
        form.isDonorAvailable
          ? "true"
          : "false"
      );

      toast.success("Profile updated successfully.");

      navigate("/doctor/profile");
    } catch (err) {
      console.error(
        "Doctor profile update error:",
        err
      );

      const errorMsg = err.message || "Failed to update profile.";
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="edit-profile-page">
        <div className="edit-profile-card">
          <h2>Loading Profile...</h2>
        </div>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error && !form.name) {
    return (
      <div className="edit-profile-page">
        <div className="edit-profile-card">
          <h2>Edit Profile</h2>

          <p style={{ color: "red" }}>
            {error}
          </p>

          <button
            type="button"
            className="cancel-btn"
            onClick={() =>
              navigate("/doctor/profile")
            }
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // UI
  // ========================================

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-card">

        <h2>Edit Profile</h2>

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        <form
          className="edit-profile-form"
          onSubmit={handleSubmit}
        >

          {/* PERSONAL INFORMATION */}

          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone</label>

            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Gender</label>

            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
            >
              <option value="">
                Select Gender
              </option>
              <option value="Male">
                Male
              </option>
              <option value="Female">
                Female
              </option>
              <option value="Other">
                Other
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>
              Blood Group{" "}
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "#64748b",
                }}
              >
                (Optional)
              </span>
            </label>

            <select
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={handleChange}
              className="edit-profile-select"
            >
              <option value="Not Provided">
                Not Provided
              </option>

              {BLOOD_GROUPS
                .filter(
                  (bg) => bg !== "Not Provided"
                )
                .map((bg) => (
                  <option
                    key={bg}
                    value={bg}
                  >
                    {bg}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              City / District Location
            </label>

            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="e.g. Kozhikode"
            />
          </div>

          {/* DONOR */}

          <div
            className="form-group checkbox-group"
            style={{ margin: "12px 0" }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                name="isDonorAvailable"
                checked={
                  form.isDonorAvailable
                }
                onChange={handleChange}
              />

              <span>
                <strong>
                  Available for Blood Donation
                </strong>{" "}
                (Urgent blood requests)
              </span>
            </label>
          </div>

          {/* PROFESSIONAL INFORMATION */}

          <div className="form-group">
            <label>
              Medical Registration Number
            </label>

            <input
              type="text"
              name="medRegNumber"
              value={form.medRegNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Specialization</label>

            <select
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              required
            >
              <option value="">
                Select specialization
              </option>

              {SPECIALIZATIONS.map(
                (specialization) => (
                  <option
                    key={specialization}
                    value={specialization}
                  >
                    {specialization}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Qualification</label>

            <input
              type="text"
              name="qualification"
              value={form.qualification}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>
              Years of Experience
            </label>

            <input
              type="number"
              name="experience"
              value={form.experience}
              onChange={handleChange}
              min="0"
              max="60"
            />
          </div>

          {/* PRACTICE TYPE */}

          <div className="form-group full-width">
            <label>Practice Type</label>

            <select
              name="practiceType"
              value={form.practiceType}
              onChange={handleChange}
              required
            >
              <option value="">
                Select Practice Type
              </option>

              <option value="hospital">
                Hospital
              </option>

              <option value="clinic">
                Clinic
              </option>
            </select>
          </div>

          {/* HOSPITAL */}

          {form.practiceType ===
            "hospital" && (
              <>
                <div className="form-group">
                  <label>
                    Hospital Name
                  </label>

                  <input
                    type="text"
                    name="hospitalName"
                    value={
                      form.hospitalName
                    }
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Branch Location
                  </label>

                  <input
                    type="text"
                    name="branchLocation"
                    value={
                      form.branchLocation
                    }
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Department</label>

                  <input
                    type="text"
                    name="department"
                    value={
                      form.department
                    }
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

          {/* CLINIC */}

          {form.practiceType ===
            "clinic" && (
              <>
                <div className="form-group">
                  <label>
                    Clinic Name
                  </label>

                  <input
                    type="text"
                    name="clinicName"
                    value={
                      form.clinicName
                    }
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Clinic Address
                  </label>

                  <input
                    type="text"
                    name="clinicAddress"
                    value={
                      form.clinicAddress
                    }
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>City</label>

                  <input
                    type="text"
                    name="clinicCity"
                    value={
                      form.clinicCity
                    }
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>State</label>

                  <input
                    type="text"
                    name="clinicState"
                    value={
                      form.clinicState
                    }
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Pincode</label>

                  <input
                    type="text"
                    name="clinicPincode"
                    value={
                      form.clinicPincode
                    }
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

          {/* AVAILABILITY SCHEDULE */}

          <div className="availability-section full-width">
            <div className="availability-section-header">
              <div>
                <h3 className="availability-section-title">
                  🗓️ Availability Schedule
                </h3>
                <p className="avail-hint-text">
                  Click a day to select it, then add time slots patients can book. Click a day again to focus and edit its slots.
                </p>
              </div>
            </div>

            {/* Day toggles */}
            <div className="day-toggles-bar">
              {ALL_DAYS.map((day) => {
                const isActive = activeDays.includes(day);
                const isFocused = focusedDay === day;
                return (
                  <button
                    key={day}
                    type="button"
                    className={`day-toggle-chip${isActive ? " selected" : ""}${isFocused ? " active-tab" : ""}`}
                    onClick={() => {
                      if (!isActive) {
                        // Add the day
                        setActiveDays((prev) => [...prev, day]);
                        setSlotsByDay((prev) => ({ ...prev, [day]: prev[day] || [] }));
                        setFocusedDay(day);
                      } else if (!isFocused) {
                        // Just focus it
                        setFocusedDay(day);
                      } else {
                        // Remove the day
                        setActiveDays((prev) => prev.filter((d) => d !== day));
                        setSlotsByDay((prev) => {
                          const copy = { ...prev };
                          delete copy[day];
                          return copy;
                        });
                        setFocusedDay("");
                      }
                    }}
                  >
                    {day.slice(0, 3)}
                    {isActive && (
                      <span style={{ fontSize: "0.7rem" }}>
                        ({(slotsByDay[day] || []).length})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Slots workspace */}
            {focusedDay && activeDays.includes(focusedDay) ? (
              <div className="slots-workspace-card">
                <div className="workspace-header">
                  <h4 className="workspace-day-title">
                    🕐 {focusedDay} — Time Slots
                  </h4>
                  {(slotsByDay[focusedDay] || []).length > 0 && (
                    <button
                      type="button"
                      className="copy-all-btn"
                      title="Clear all slots for this day"
                      onClick={() =>
                        setSlotsByDay((prev) => ({ ...prev, [focusedDay]: [] }))
                      }
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Configured slots */}
                <div className="configured-slots-list">
                  {(slotsByDay[focusedDay] || []).length === 0 ? (
                    <span style={{ color: "#94a3b8", fontSize: "0.83rem" }}>
                      No slots added yet — pick from the presets below or enter a custom time.
                    </span>
                  ) : (
                    (slotsByDay[focusedDay] || []).map((slot) => (
                      <span key={slot} className="configured-slot-pill">
                        ⏰ {slot}
                        <button
                          type="button"
                          className="slot-delete-btn"
                          title="Remove slot"
                          onClick={() =>
                            setSlotsByDay((prev) => ({
                              ...prev,
                              [focusedDay]: prev[focusedDay].filter((s) => s !== slot),
                            }))
                          }
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Preset slots */}
                <p className="slot-preset-header">Quick-add from presets:</p>
                <div className="preset-slots-grid">
                  {TIME_PRESETS.map((preset) => {
                    const already = (slotsByDay[focusedDay] || []).includes(preset);
                    return (
                      <button
                        key={preset}
                        type="button"
                        className="preset-chip-btn"
                        disabled={already}
                        style={already ? { opacity: 0.4, cursor: "not-allowed" } : {}}
                        onClick={() => {
                          if (!already) {
                            setSlotsByDay((prev) => ({
                              ...prev,
                              [focusedDay]: [...(prev[focusedDay] || []), preset],
                            }));
                          }
                        }}
                      >
                        {already ? "✓ " : "+ "}{preset}
                      </button>
                    );
                  })}
                </div>

                {/* Custom slot input */}
                <div className="custom-slot-input-row">
                  <input
                    type="text"
                    className="form-group input custom-slot-input"
                    placeholder='e.g. 7:15 AM'
                    value={customSlotInput}
                    onChange={(e) => setCustomSlotInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = customSlotInput.trim();
                        if (val && !(slotsByDay[focusedDay] || []).includes(val)) {
                          setSlotsByDay((prev) => ({
                            ...prev,
                            [focusedDay]: [...(prev[focusedDay] || []), val],
                          }));
                          setCustomSlotInput("");
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="add-custom-slot-btn"
                    onClick={() => {
                      const val = customSlotInput.trim();
                      if (!val) return;
                      if ((slotsByDay[focusedDay] || []).includes(val)) {
                        toast.warn("That time slot is already added.");
                        return;
                      }
                      setSlotsByDay((prev) => ({
                        ...prev,
                        [focusedDay]: [...(prev[focusedDay] || []), val],
                      }));
                      setCustomSlotInput("");
                    }}
                  >
                    + Add Slot
                  </button>
                </div>
              </div>
            ) : activeDays.length === 0 ? (
              <p className="no-day-selected-msg">
                No days selected. Click a day above to start configuring your availability.
              </p>
            ) : (
              <p className="no-day-selected-msg">
                Click an active day (highlighted) to manage its time slots.
              </p>
            )}
          </div>

          {/* BUTTONS */}

          <div className="button-group">

            <button
              type="submit"
              className="save-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={() =>
                navigate("/doctor/profile")
              }
              disabled={saving}
            >
              Cancel
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default DoctorEditProfile;