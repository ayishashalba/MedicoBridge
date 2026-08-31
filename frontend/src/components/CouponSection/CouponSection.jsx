import React, { useState } from "react";
import {
  FaTag,
  FaCheckCircle,
  FaTimesCircle,
  FaPercent,
  FaTruck,
  FaGift,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { AVAILABLE_COUPONS, validateAndApplyCoupon } from "../../utils/coupons";
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

  return (
    <div className="coupon-section-card">
      <div className="coupon-header">
        <div className="coupon-header-title">
          <FaTag className="coupon-header-icon" />
          <span>Apply Coupon / Promo Code</span>
        </div>
        <button
          type="button"
          className="coupon-toggle-list-btn"
          onClick={() => setShowCouponsList((prev) => !prev)}
        >
          {showCouponsList ? (
            <>
              Hide Offers <FaChevronUp />
            </>
          ) : (
            <>
              View Offers ({AVAILABLE_COUPONS.length}) <FaChevronDown />
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
            placeholder="Enter promo code (e.g. MEDI10)"
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
          <p className="coupon-list-title">Available Offers &amp; Coupons</p>
          <div className="coupon-cards-grid">
            {AVAILABLE_COUPONS.map((cpn) => {
              const isApplied = appliedCoupon?.code === cpn.code;
              const isEligible = subtotal >= cpn.minOrder;

              return (
                <div
                  key={cpn.code}
                  className={`coupon-sample-card ${isApplied ? "coupon-sample-card--applied" : ""} ${!isEligible ? "coupon-sample-card--locked" : ""}`}
                >
                  <div className="coupon-sample-left">
                    <div className="coupon-code-badge">
                      <FaPercent className="coupon-badge-icon" />
                      <span>{cpn.code}</span>
                    </div>
                    <p className="coupon-sample-desc">{cpn.description}</p>
                    {cpn.minOrder > 0 && (
                      <span className="coupon-min-order">
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
                    ) : (
                      <button
                        type="button"
                        className="coupon-sample-apply-btn"
                        onClick={() => handleApply(cpn.code)}
                        id={`apply-sample-coupon-${cpn.code}`}
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
