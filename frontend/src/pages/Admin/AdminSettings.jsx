import React, { useEffect, useState } from "react";

import {
  FaCogs,
  FaDatabase,
  FaCreditCard,
  FaLock,
  FaCheckCircle,
} from "react-icons/fa";

import { toast } from "react-toastify";

import "./AdminPages.css";

const SYSTEM_SETTINGS_API =
  "http://localhost:5000/api/system-settings";

export default function AdminSettings() {
  const [maintenance, setMaintenance] =
    useState(false);

  const [autoVerify, setAutoVerify] =
    useState(false);

  const [telehealth, setTelehealth] =
    useState(true);

  const [billingFee, setBillingFee] =
    useState("10");

  const [deliveryDistance, setDeliveryDistance] =
    useState("10");

  const [gateway, setGateway] =
    useState("Razorpay");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  // =====================================================
  // FETCH SYSTEM SETTINGS
  // =====================================================

  const fetchSystemSettings = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("token");

      if (!token) {
        toast.error(
          "Admin authentication token not found."
        );
        return;
      }

      const response = await fetch(
        SYSTEM_SETTINGS_API,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        result.success === false
      ) {
        throw new Error(
          result.message ||
          "Failed to fetch system settings."
        );
      }

      const settings =
        result.data || {};

      setMaintenance(
        Boolean(
          settings.maintenanceMode
        )
      );

      setAutoVerify(
        Boolean(
          settings.autoVerifyMedicalRegistrations
        )
      );

      setTelehealth(
        settings.telehealthEnabled !==
          undefined
          ? Boolean(
            settings.telehealthEnabled
          )
          : true
      );

      setBillingFee(
        String(
          settings.platformFeePercent ??
          10
        )
      );

      setDeliveryDistance(
        String(
          settings.pharmacyDeliveryDistanceKm ??
          10
        )
      );

      setGateway(
        settings.paymentGateway ||
        "Razorpay"
      );
    } catch (error) {
      console.error(
        "System settings fetch error:",
        error
      );

      toast.error(
        error.message ||
        "Failed to load system settings."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD SETTINGS
  // =====================================================

  useEffect(() => {
    fetchSystemSettings();
  }, []);

  // =====================================================
  // SAVE SYSTEM SETTINGS
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setSaved(false);

      const token =
        localStorage.getItem("token");

      if (!token) {
        toast.error(
          "Admin authentication token not found."
        );
        return;
      }

      const fee =
        Number(billingFee);

      const distance =
        Number(deliveryDistance);

      // -------------------------------------------------
      // FRONTEND VALIDATION
      // -------------------------------------------------

      if (
        Number.isNaN(fee) ||
        fee < 0 ||
        fee > 50
      ) {
        toast.error(
          "Platform fee must be between 0% and 50%."
        );
        return;
      }

      if (
        Number.isNaN(distance) ||
        distance < 1
      ) {
        toast.error(
          "Delivery distance must be at least 1 km."
        );
        return;
      }

      // -------------------------------------------------
      // PAYLOAD
      // -------------------------------------------------

      const payload = {
        maintenanceMode:
          maintenance,

        autoVerifyMedicalRegistrations:
          autoVerify,

        telehealthEnabled:
          telehealth,

        platformFeePercent:
          fee,

        pharmacyDeliveryDistanceKm:
          distance,

        paymentGateway:
          gateway,
      };

      const response = await fetch(
        SYSTEM_SETTINGS_API,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        result.success === false
      ) {
        throw new Error(
          result.message ||
          "Failed to update system settings."
        );
      }

      // Update UI with saved backend data
      const settings =
        result.data || {};

      setMaintenance(
        Boolean(
          settings.maintenanceMode
        )
      );

      setAutoVerify(
        Boolean(
          settings.autoVerifyMedicalRegistrations
        )
      );

      setTelehealth(
        Boolean(
          settings.telehealthEnabled
        )
      );

      setBillingFee(
        String(
          settings.platformFeePercent ??
          fee
        )
      );

      setDeliveryDistance(
        String(
          settings.pharmacyDeliveryDistanceKm ??
          distance
        )
      );

      setGateway(
        settings.paymentGateway ||
        gateway
      );

      setSaved(true);

      toast.success(
        "System settings updated successfully."
      );

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error(
        "System settings save error:",
        error
      );

      toast.error(
        error.message ||
        "Failed to update system settings."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="ad-page">
        <div
          className="ad-card"
          style={{
            minHeight: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <FaCogs
            style={{
              fontSize: "2rem",
              color:
                "var(--ad-primary)",
            }}
          />

          <strong>
            Loading system settings...
          </strong>

          <span
            style={{
              color:
                "var(--ad-text-muted)",
              fontSize: "0.85rem",
            }}
          >
            Fetching configuration from
            server
          </span>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="ad-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="ad-page-header">
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
          }}
        >
          <FaCogs
            style={{
              color:
                "var(--ad-primary)",
            }}
          />

          System Settings
        </h2>

        <p>
          Configure platform features,
          control billing fees, and manage
          gateway configuration.
        </p>
      </div>

      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {saved && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            background: "#0d9488",
            color: "#fff",
            padding:
              "1rem 1.5rem",
            borderRadius: "12px",
            zIndex: 1100,
            boxShadow:
              "0 10px 25px rgba(13,148,136,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            animation:
              "adFadeIn 0.2s ease",
          }}
        >
          <FaCheckCircle />

          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: "600",
            }}
          >
            System settings updated
            successfully.
          </span>
        </div>
      )}

      {/* =================================================
          SETTINGS FORM
      ================================================= */}

      <form
        onSubmit={handleSubmit}
      >

        {/* =================================================
            PLATFORM + FEES
        ================================================= */}

        <div className="ad-grid-2">

          {/* PLATFORM CONTROLS */}

          <div
            className="ad-card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
            }}
          >
            <h3 className="ad-card-title">
              <FaCogs />

              Platform Controls
            </h3>

            {/* Maintenance */}

            <div className="ad-switch-wrapper">
              <div className="ad-switch-label">
                <span className="ad-switch-title">
                  System Maintenance Mode
                </span>

                <span className="ad-switch-desc">
                  Block access to public
                  frontends and mobile apps
                </span>
              </div>

              <label className="ad-switch">
                <input
                  type="checkbox"
                  checked={maintenance}
                  onChange={(e) =>
                    setMaintenance(
                      e.target.checked
                    )
                  }
                  disabled={saving}
                />

                <span className="ad-slider" />
              </label>
            </div>

            {/* Auto Verify */}

            <div className="ad-switch-wrapper">
              <div className="ad-switch-label">
                <span className="ad-switch-title">
                  Auto-Verify Medical
                  Registrations
                </span>

                <span className="ad-switch-desc">
                  Approve clinics immediately
                  without credential file
                  validation
                </span>
              </div>

              <label className="ad-switch">
                <input
                  type="checkbox"
                  checked={autoVerify}
                  onChange={(e) =>
                    setAutoVerify(
                      e.target.checked
                    )
                  }
                  disabled={saving}
                />

                <span className="ad-slider" />
              </label>
            </div>

            {/* Telehealth */}

            <div className="ad-switch-wrapper">
              <div className="ad-switch-label">
                <span className="ad-switch-title">
                  Telehealth Video
                  Consultations
                </span>

                <span className="ad-switch-desc">
                  Enable virtual consulting
                  rooms for doctors
                </span>
              </div>

              <label className="ad-switch">
                <input
                  type="checkbox"
                  checked={telehealth}
                  onChange={(e) =>
                    setTelehealth(
                      e.target.checked
                    )
                  }
                  disabled={saving}
                />

                <span className="ad-slider" />
              </label>
            </div>
          </div>

          {/* SYSTEM LIMITS */}

          <div
            className="ad-card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <h3 className="ad-card-title">
              <FaDatabase />

              System Limits & Fees
            </h3>

            {/* Platform Fee */}

            <div className="ad-form-group">
              <label htmlFor="billingFee">
                Platform Fee Percent (%)
              </label>

              <input
                id="billingFee"
                type="number"
                min="0"
                max="50"
                step="0.1"
                className="ad-input"
                value={billingFee}
                onChange={(e) =>
                  setBillingFee(
                    e.target.value
                  )
                }
                disabled={saving}
              />
            </div>

            {/* Delivery Distance */}

            <div className="ad-form-group">
              <label htmlFor="deliveryLimit">
                Pharmacy Delivery Distance
                (km)
              </label>

              <select
                id="deliveryLimit"
                className="ad-select"
                value={deliveryDistance}
                onChange={(e) =>
                  setDeliveryDistance(
                    e.target.value
                  )
                }
                disabled={saving}
              >
                <option value="10">
                  Up to 10 km (Standard)
                </option>

                <option value="25">
                  Up to 25 km (Extended)
                </option>

                <option value="50">
                  Up to 50 km (Regional)
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* =================================================
            PAYMENT GATEWAY
        ================================================= */}

        <div
          className="ad-card"
          style={{
            marginTop: "1.5rem",
          }}
        >
          <h3
            className="ad-card-title"
            style={{
              marginBottom: "1.25rem",
            }}
          >
            <FaCreditCard />

            Payment Gateway Credentials
          </h3>

          <div
            className="ad-grid-2"
            style={{
              gap: "1.25rem",
            }}
          >

            {/* Gateway */}

            <div className="ad-form-group">
              <label htmlFor="gateway">
                Active Payment Gateway
              </label>

              <select
                id="gateway"
                className="ad-select"
                value={gateway}
                onChange={(e) =>
                  setGateway(
                    e.target.value
                  )
                }
                disabled={saving}
              >
                <option value="Razorpay">
                  Razorpay Checkout (India)
                </option>

                <option value="Stripe">
                  Stripe Payments (Global)
                </option>

                <option value="Paytm">
                  Paytm Merchant Wallet
                </option>
              </select>
            </div>

            {/* SECRET */}

            <div className="ad-form-group">
              <label htmlFor="apiKey">
                Live API Secret Token
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >
                <FaLock
                  style={{
                    position:
                      "absolute",
                    left: "12px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                />

                <input
                  id="apiKey"
                  type="password"
                  className="ad-input"
                  style={{
                    paddingLeft: "35px",
                  }}
                  value="••••••••••••••••••••"
                  readOnly
                  disabled
                />
              </div>

              <span
                style={{
                  display: "block",
                  marginTop: "0.35rem",
                  fontSize: "0.72rem",
                  color:
                    "var(--ad-text-muted)",
                }}
              >
                Payment secrets are managed
                securely on the server and
                are not stored in the frontend.
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            justifyContent:
              "flex-end",
          }}
        >
          <button
            type="submit"
            className="ad-btn ad-btn-primary"
            style={{
              padding:
                "0.75rem 2rem",
            }}
            disabled={saving}
          >
            {saving
              ? "Saving Configurations..."
              : "Save System Config"}
          </button>
        </div>
      </form>
    </div>
  );
}