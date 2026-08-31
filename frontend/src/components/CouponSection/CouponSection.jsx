import React, { useState, useEffect } from "react";
import {
  FaTag,
  FaCheckCircle,
  FaTimesCircle,
  FaPercent,
  FaTruck,
  FaGift,
  FaChevronDown,
  FaChevronUp,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";
import { getActiveCouponsForCart, validateAndApplyCoupon } from "../../utils/coupons";
import "./CouponSection.css";

export default function CouponSection({
  subtotal,
  deliveryFee = 40,
  appliedCoupon,
  couponDiscount,
  onApplyCoupon,
  onRemoveCoupon,
}) {
  const [inputCode, setInputCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showCouponsList, setShowCouponsList] = useState(false);
  const [couponsList, setCouponsList] = useState([]);

  useEffect(() => {
    setCouponsList(getActiveCouponsForCart());
  }, []);

  const handleApply = (codeToApply) => {
    const code = codeToApply || inputCode;
    setErrorMsg("");
    setSuccessMsg("");

    if (!code || !code.trim()) {
      setErrorMsg("Please enter a valid coupon code.");
      return;
    }

    const result = validateAndApplyCoupon(code, subtotal, deliveryFee);
    if (result.success) {
      setSuccessMsg(result.message);
      setInputCode(result.coupon.code);
      if (onApplyCoupon) {
        onApplyCoupon(result);
      }
    } else {
      setErrorMsg(result.message);
    }
  };

  const handleRemove = () => {
    setInputCode("");
    setErrorMsg("");
    setSuccessMsg("");
    if (onRemoveCoupon) {
      onRemoveCoupon();
    }
  };

  const activeCount = couponsList.filter((c) => c.timeStatus === "Active").length;

  return (
    <div className="coupon-section-card">
      <div className="coupon-header">
        <div className="coupon-header-title">
          <FaTag className="coupon-header-icon" />
          <span>Apply Cart / Checkout Coupon</span>
        </div>
        <button
          type="button"
          className="coupon-toggle-list-btn"
          onClick={() => setShowCouponsList((prev) => !prev)}
        >
          {showCouponsList ? (
            <>
              Hide Vouchers <FaChevronUp />
            </>
          ) : (
            <>
              View Vouchers ({activeCount} Active) <FaChevronDown />
            </>
          )}
        </button>
      </div>

      {/* Input & Apply Row */}
      <div className="coupon-input-wrap">
        <div className="coupon-input-box">
          <FaTag className="coupon-input-icon" />
          <input
            type="text"
            className="coupon-input"
            placeholder="Enter coupon code (e.g. MEDI10, WELCOME50)"
            value={inputCode}
            onChange={(e) => {
              setInputCode(e.target.value.toUpperCase());
              setErrorMsg("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApply(inputCode);
              }
            }}
            disabled={!!appliedCoupon}
            id="coupon-code-input"
          />
        </div>

        {appliedCoupon ? (
          <button
            type="button"
            className="coupon-remove-btn"
            onClick={handleRemove}
            id="coupon-remove-btn"
          >
            Remove
          </button>
        ) : (
          <button
            type="button"
            className="coupon-apply-btn"
            onClick={() => handleApply(inputCode)}
            id="coupon-apply-btn"
          >
            Apply
          </button>
        )}
      </div>

      {/* Applied Success State */}
      {appliedCoupon && (
        <div className="coupon-applied-alert">
          <div className="coupon-applied-info">
            <FaCheckCircle className="coupon-success-icon" />
            <div>
              <strong>"{appliedCoupon.code}" Applied!</strong>
              <p>You saved ₹{couponDiscount} on this order.</p>
            </div>
          </div>
          <span className="coupon-savings-pill">−₹{couponDiscount}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="coupon-error-alert">
          <FaTimesCircle className="coupon-error-icon" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Available Coupons List (Toggleable) */}
      {showCouponsList && (
        <div className="coupon-available-list">
          <p className="coupon-list-title">Platform Checkout Promo Codes</p>
          <div className="coupon-cards-grid">
            {couponsList.map((cpn) => {
              const isApplied = appliedCoupon?.code === cpn.code;
              const isEligible = subtotal >= (cpn.minOrder || 0);
              const isScheduled = cpn.timeStatus === "Scheduled";
              const isExpired = cpn.timeStatus === "Expired";
              const canApply = cpn.timeStatus === "Active" && isEligible;

              return (
                <div
                  key={cpn.code}
                  className={`coupon-sample-card ${isApplied ? "coupon-sample-card--applied" : ""} ${!canApply && !isApplied ? "coupon-sample-card--locked" : ""}`}
                >
                  <div className="coupon-sample-left">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div className="coupon-code-badge">
                        <FaPercent className="coupon-badge-icon" />
                        <span>{cpn.code}</span>
                      </div>

                      {/* Time Status Badge */}
                      {isScheduled && (
                        <span style={{ fontSize: "0.68rem", background: "#fef3c7", color: "#b45309", padding: "0.15rem 0.45rem", borderRadius: "4px", fontWeight: "700" }}>
                          ⏰ Scheduled
                        </span>
                      )}
                      {isExpired && (
                        <span style={{ fontSize: "0.68rem", background: "#fee2e2", color: "#dc2626", padding: "0.15rem 0.45rem", borderRadius: "4px", fontWeight: "700" }}>
                          ✕ Expired
                        </span>
                      )}
                    </div>

                    <p className="coupon-sample-desc">{cpn.description}</p>
                    
                    {/* Validity Period */}
                    <div style={{ fontSize: "0.72rem", color: "var(--text-secondary, #64748b)", display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.2rem" }}>
                      <FaCalendarAlt style={{ fontSize: "0.65rem" }} />
                      <span>Valid: {cpn.fromDate} to {cpn.toDate || cpn.expiryDate}</span>
                    </div>

                    {cpn.minOrder > 0 && (
                      <span className="coupon-min-order" style={{ marginTop: "0.15rem", display: "block" }}>
                        Min. order ₹{cpn.minOrder}{" "}
                        {!isEligible && (
                          <em style={{ color: "#dc2626" }}>
                            (Add ₹{cpn.minOrder - subtotal} more)
                          </em>
                        )}
                      </span>
                    )}
                  </div>

                  <div className="coupon-sample-right">
                    {isApplied ? (
                      <span className="coupon-applied-tag">✓ Applied</span>
                    ) : isScheduled ? (
                      <span style={{ fontSize: "0.75rem", color: "#b45309", fontWeight: "600", padding: "0.4rem" }}>
                        Starts {cpn.fromDate}
                      </span>
                    ) : isExpired ? (
                      <span style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: "600", padding: "0.4rem" }}>
                        Expired
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="coupon-sample-apply-btn"
                        onClick={() => handleApply(cpn.code)}
                        id={`apply-sample-coupon-${cpn.code}`}
                        disabled={!isEligible}
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
