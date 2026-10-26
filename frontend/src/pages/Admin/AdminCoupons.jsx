import React, { useEffect, useState } from "react";
import {
  FaTicketAlt,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaTimes,
  FaCopy,
  FaTag,
  FaSearch,
  FaBolt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./AdminPages.css";

const API_BASE_URL = "http://localhost:5000/api";

const couponStatusColors = {
  Active: { bg: "#dcfce7", color: "#16a34a" },
  Scheduled: { bg: "#fef3c7", color: "#d97706" },
  Expired: { bg: "#fee2e2", color: "#dc2626" },
  Inactive: { bg: "#f1f5f9", color: "#64748b" },
};

const offerStatusColors = {
  Active: { bg: "#dcfce7", color: "#16a34a" },
  Scheduled: { bg: "#fef3c7", color: "#d97706" },
  Expired: { bg: "#fee2e2", color: "#dc2626" },
  Inactive: { bg: "#f1f5f9", color: "#64748b" },
};

const getCouponScheduleStatus = (coupon, now = new Date()) => {
  if (!coupon?.isActive) return "Inactive";

  const start = new Date(coupon.startDate);
  const end = new Date(coupon.endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Expired";
  }

  if (now < start) return "Scheduled";
  if (now > end) return "Expired";

  return "Active";
};

const getOfferScheduleStatus = (offer, now = new Date()) => {
  if (offer?.isActive === false) return "Inactive";

  const start = new Date(offer?.startDate);
  const end = new Date(offer?.endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Expired";
  }

  if (now < start) return "Scheduled";
  if (now > end) return "Expired";

  return "Active";
};

const formatDateInput = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDateTimeInput = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const formatDisplayDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const formatDisplayDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminCoupons() {
  // ============================================================
  // NAVIGATION
  // ============================================================

  const [activeTab, setActiveTab] = useState("offers");

  // ============================================================
  // PRODUCT OFFERS
  // ============================================================

  const [productOffers, setProductOffers] = useState([]);
  const [offerSearch, setOfferSearch] = useState("");
  const [offerStatusFilter, setOfferStatusFilter] = useState("All");

  const [showAddOfferModal, setShowAddOfferModal] = useState(false);
  const [showEditOfferModal, setShowEditOfferModal] = useState(false);

  const [offerLoading, setOfferLoading] = useState(false);
  const [offerSubmitting, setOfferSubmitting] = useState(false);

  // ============================================================
  // MEDICINES
  // ============================================================

  const [medicinesList, setMedicinesList] = useState([]);
  const [medicineLoading, setMedicineLoading] = useState(false);

  // ============================================================
  // COUPONS
  // ============================================================

  const [coupons, setCoupons] = useState([]);
  const [couponSearch, setCouponSearch] = useState("");
  const [couponStatusFilter, setCouponStatusFilter] = useState("All");
  const [couponTypeFilter, setCouponTypeFilter] = useState("All");

  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [showEditCouponModal, setShowEditCouponModal] = useState(false);

  const [couponLoading, setCouponLoading] = useState(false);
  const [couponSubmitting, setCouponSubmitting] = useState(false);

  // ============================================================
  // OFFER FORM
  // ============================================================

  const initialOfferForm = {
    _id: "",
    offerName: "",
    description: "",
    medicineId: "",
    pharmacyId: "",
    discountType: "flat",
    discountValue: 5,
    startDate: "2026-08-01T00:00",
    endDate: "2026-12-31T23:59",
    isActive: true,
  };

  const [offerFormData, setOfferFormData] = useState(initialOfferForm);

  // ============================================================
  // COUPON FORM
  // ============================================================

  const initialCouponForm = {
    _id: "",
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 10,
    minimumOrderAmount: 499,
    maximumDiscount: 100,
    startDate: "2026-08-01",
    endDate: "2027-12-31",
    usageLimit: 100,
    isActive: true,
  };

  const [couponFormData, setCouponFormData] =
    useState(initialCouponForm);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchOffers();
    fetchMedicines();
    fetchCoupons();
  }, []);

  // ============================================================
  // FETCH OFFERS - REAL API
  // GET /api/offers
  // ============================================================

  const fetchOffers = async () => {
    try {
      setOfferLoading(true);

      const response = await fetch(`${API_BASE_URL}/offers`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to fetch product offers."
        );
      }

      const offerList = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];

      setProductOffers(offerList);
    } catch (error) {
      console.error("Fetch offers error:", error);
      toast.error(
        error.message || "Failed to fetch product offers."
      );
    } finally {
      setOfferLoading(false);
    }
  };

  // ============================================================
  // FETCH MEDICINES
  // GET /api/medicines
  // ============================================================

  const fetchMedicines = async () => {
    try {
      setMedicineLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/medicines`, {
        method: "GET",
        headers: {
          ...(token
            ? {
              Authorization: `Bearer ${token}`,
            }
            : {}),
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to fetch medicines."
        );
      }

      const medicineList = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];

      setMedicinesList(medicineList);
    } catch (error) {
      console.error("Fetch medicines error:", error);

      toast.error(
        error.message || "Failed to fetch medicines."
      );
    } finally {
      setMedicineLoading(false);
    }
  };

  // ============================================================
  // FETCH COUPONS - REAL API
  // ============================================================

  const fetchCoupons = async () => {
    try {
      setCouponLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/coupons`, {
        method: "GET",
        headers: {
          ...(token
            ? {
              Authorization: `Bearer ${token}`,
            }
            : {}),
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to fetch coupons."
        );
      }

      const couponList = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];

      setCoupons(couponList);
    } catch (error) {
      console.error("Fetch coupons error:", error);

      toast.error(
        error.message || "Failed to fetch coupons."
      );
    } finally {
      setCouponLoading(false);
    }
  };

  // ============================================================
  // OFFER PAYLOAD
  // Backend Offer model requires:
  // offerName
  // description
  // discountType = flat | percentage
  // discountValue
  // medicineId
  // pharmacyId
  // startDate
  // endDate
  // isActive
  // ============================================================

  const buildOfferPayload = () => {
    return {
      offerName: offerFormData.offerName.trim(),
      description: offerFormData.description.trim(),
      discountType: offerFormData.discountType,
      discountValue: Number(offerFormData.discountValue),
      medicineId: offerFormData.medicineId,
      ...(offerFormData.pharmacyId
        ? {
          pharmacyId: offerFormData.pharmacyId,
        }
        : {}),
      startDate: offerFormData.startDate,
      endDate: offerFormData.endDate,
      isActive: Boolean(offerFormData.isActive),
    };
  };

  // ============================================================
  // CREATE OFFER - API
  // POST /api/offers
  // ============================================================

  const handleCreateOffer = async (e) => {
    e.preventDefault();

    if (!offerFormData.offerName.trim()) {
      toast.warning("Offer name is required.");
      return;
    }

    if (!offerFormData.medicineId) {
      toast.warning("Please select a target medicine.");
      return;
    }

    if (Number(offerFormData.discountValue) <= 0) {
      toast.warning("Discount value must be greater than 0.");
      return;
    }

    if (
      offerFormData.discountType === "percentage" &&
      Number(offerFormData.discountValue) > 100
    ) {
      toast.warning("Percentage discount cannot exceed 100%.");
      return;
    }

    if (
      !offerFormData.startDate ||
      !offerFormData.endDate
    ) {
      toast.warning("Start date and end date are required.");
      return;
    }

    const start = new Date(offerFormData.startDate);
    const end = new Date(offerFormData.endDate);

    if (Number.isNaN(start.getTime())) {
      toast.warning("Invalid start date.");
      return;
    }

    if (Number.isNaN(end.getTime())) {
      toast.warning("Invalid end date.");
      return;
    }

    if (end <= start) {
      toast.warning("End date must be after start date.");
      return;
    }

    try {
      setOfferSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Admin authentication token not found.");
        return;
      }

      const payload = buildOfferPayload();

      const response = await fetch(`${API_BASE_URL}/offers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to create product offer."
        );
      }

      const createdOffer = data?.data;

      if (createdOffer) {
        setProductOffers((prev) => [
          createdOffer,
          ...prev,
        ]);
      } else {
        await fetchOffers();
      }

      setShowAddOfferModal(false);
      setOfferFormData(initialOfferForm);

      toast.success(
        `Product Offer "${payload.offerName}" created successfully!`
      );
    } catch (error) {
      console.error("Create offer error:", error);

      toast.error(
        error.message || "Failed to create product offer."
      );
    } finally {
      setOfferSubmitting(false);
    }
  };

  // ============================================================
  // OPEN EDIT OFFER
  // ============================================================

  const openEditOffer = (offer) => {
    setOfferFormData({
      _id: offer._id || "",

      offerName: offer.offerName || "",

      description: offer.description || "",

      medicineId:
        offer.medicineId?._id ||
        offer.medicineId ||
        "",

      pharmacyId:
        offer.pharmacyId?._id ||
        offer.pharmacyId ||
        "",

      discountType:
        offer.discountType === "percentage"
          ? "percentage"
          : "flat",

      discountValue:
        offer.discountValue ?? 0,

      startDate:
        formatDateTimeInput(offer.startDate),

      endDate:
        formatDateTimeInput(offer.endDate),

      isActive:
        offer.isActive !== false,
    });

    setShowEditOfferModal(true);
  };

  // ============================================================
  // UPDATE OFFER - API
  // PUT /api/offers/:id
  // ============================================================

  const handleUpdateOffer = async (e) => {
    e.preventDefault();

    if (!offerFormData._id) {
      toast.error("Offer ID is missing.");
      return;
    }

    if (!offerFormData.offerName.trim()) {
      toast.warning("Offer name is required.");
      return;
    }

    if (!offerFormData.medicineId) {
      toast.warning("Target medicine is required.");
      return;
    }

    if (Number(offerFormData.discountValue) <= 0) {
      toast.warning("Discount value must be greater than 0.");
      return;
    }

    if (
      offerFormData.discountType === "percentage" &&
      Number(offerFormData.discountValue) > 100
    ) {
      toast.warning("Percentage discount cannot exceed 100%.");
      return;
    }

    const start = new Date(offerFormData.startDate);
    const end = new Date(offerFormData.endDate);

    if (end <= start) {
      toast.warning("End date must be after start date.");
      return;
    }

    try {
      setOfferSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Admin authentication token not found.");
        return;
      }

      const payload = buildOfferPayload();

      const response = await fetch(
        `${API_BASE_URL}/offers/${offerFormData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to update product offer."
        );
      }

      const updatedOffer = data?.data;

      if (updatedOffer) {
        setProductOffers((prev) =>
          prev.map((offer) =>
            offer._id === offerFormData._id
              ? updatedOffer
              : offer
          )
        );
      } else {
        await fetchOffers();
      }

      setShowEditOfferModal(false);
      setOfferFormData(initialOfferForm);

      toast.success(
        `Offer "${payload.offerName}" updated successfully.`
      );
    } catch (error) {
      console.error("Update offer error:", error);

      toast.error(
        error.message || "Failed to update product offer."
      );
    } finally {
      setOfferSubmitting(false);
    }
  };

  // ============================================================
  // DELETE OFFER - API
  // DELETE /api/offers/:id
  // ============================================================

  const handleDeleteOffer = async (id, name) => {
    if (!id) {
      toast.error("Offer ID is missing.");
      return;
    }

    if (
      !window.confirm(
        `Delete automatic offer "${name}"?`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Admin authentication token not found.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/offers/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to delete product offer."
        );
      }

      setProductOffers((prev) =>
        prev.filter((offer) => offer._id !== id)
      );

      toast.success("Offer removed successfully.");
    } catch (error) {
      console.error("Delete offer error:", error);

      toast.error(
        error.message || "Failed to delete product offer."
      );
    }
  };

  // ============================================================
  // BUILD COUPON PAYLOAD
  // ============================================================

  const buildCouponPayload = () => {
    return {
      code: couponFormData.code.trim().toUpperCase(),

      description:
        couponFormData.description.trim(),

      discountType:
        couponFormData.discountType,

      discountValue:
        Number(couponFormData.discountValue),

      minimumOrderAmount:
        Number(couponFormData.minimumOrderAmount) || 0,

      maximumDiscount:
        couponFormData.maximumDiscount === "" ||
          couponFormData.maximumDiscount === null
          ? null
          : Number(couponFormData.maximumDiscount),

      startDate:
        couponFormData.startDate,

      endDate:
        couponFormData.endDate,

      usageLimit:
        Number(couponFormData.usageLimit) || 100,

      isActive:
        Boolean(couponFormData.isActive),
    };
  };

  // ============================================================
  // CREATE COUPON
  // ============================================================

  const handleCreateCoupon = async (e) => {
    e.preventDefault();

    if (!couponFormData.code.trim()) {
      toast.warning("Coupon code is required.");
      return;
    }

    if (!couponFormData.description.trim()) {
      toast.warning("Coupon description is required.");
      return;
    }

    if (Number(couponFormData.discountValue) <= 0) {
      toast.warning(
        "Discount value must be greater than 0."
      );
      return;
    }

    if (
      couponFormData.discountType === "percentage" &&
      Number(couponFormData.discountValue) > 100
    ) {
      toast.warning(
        "Percentage discount cannot exceed 100%."
      );
      return;
    }

    if (
      !couponFormData.startDate ||
      !couponFormData.endDate
    ) {
      toast.warning(
        "Start date and end date are required."
      );
      return;
    }

    const start = new Date(
      couponFormData.startDate
    );

    const end = new Date(
      couponFormData.endDate
    );

    if (end <= start) {
      toast.warning(
        "End date must be after start date."
      );
      return;
    }

    try {
      setCouponSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error(
          "Admin authentication token not found."
        );
        return;
      }

      const payload = buildCouponPayload();

      const response = await fetch(
        `${API_BASE_URL}/coupons`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
          "Failed to create coupon."
        );
      }

      const createdCoupon = data?.data;

      if (createdCoupon) {
        setCoupons((prev) => [
          createdCoupon,
          ...prev,
        ]);
      } else {
        await fetchCoupons();
      }

      setShowAddCouponModal(false);
      setCouponFormData(initialCouponForm);

      toast.success(
        `Cart Coupon "${payload.code}" created successfully!`
      );
    } catch (error) {
      console.error(
        "Create coupon error:",
        error
      );

      toast.error(
        error.message ||
        "Failed to create coupon."
      );
    } finally {
      setCouponSubmitting(false);
    }
  };

  // ============================================================
  // OPEN EDIT COUPON
  // ============================================================

  const openEditCoupon = (coupon) => {
    setCouponFormData({
      _id: coupon._id || "",

      code: coupon.code || "",

      description:
        coupon.description || "",

      discountType:
        coupon.discountType ||
        "percentage",

      discountValue:
        coupon.discountValue ?? 0,

      minimumOrderAmount:
        coupon.minimumOrderAmount ?? 0,

      maximumDiscount:
        coupon.maximumDiscount ?? "",

      startDate:
        formatDateInput(coupon.startDate),

      endDate:
        formatDateInput(coupon.endDate),

      usageLimit:
        coupon.usageLimit ?? 100,

      isActive:
        coupon.isActive !== false,
    });

    setShowEditCouponModal(true);
  };

  // ============================================================
  // UPDATE COUPON
  // ============================================================

  const handleUpdateCoupon = async (e) => {
    e.preventDefault();

    if (!couponFormData._id) {
      toast.error("Coupon ID is missing.");
      return;
    }

    if (!couponFormData.code.trim()) {
      toast.warning("Coupon code is required.");
      return;
    }

    if (!couponFormData.description.trim()) {
      toast.warning(
        "Coupon description is required."
      );
      return;
    }

    if (
      Number(couponFormData.discountValue) <= 0
    ) {
      toast.warning(
        "Discount value must be greater than 0."
      );
      return;
    }

    if (
      couponFormData.discountType ===
      "percentage" &&
      Number(couponFormData.discountValue) >
      100
    ) {
      toast.warning(
        "Percentage discount cannot exceed 100%."
      );
      return;
    }

    const start = new Date(
      couponFormData.startDate
    );

    const end = new Date(
      couponFormData.endDate
    );

    if (end <= start) {
      toast.warning(
        "End date must be after start date."
      );
      return;
    }

    try {
      setCouponSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error(
          "Admin authentication token not found."
        );
        return;
      }

      const payload =
        buildCouponPayload();

      const response = await fetch(
        `${API_BASE_URL}/coupons/${couponFormData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
          "Failed to update coupon."
        );
      }

      const updatedCoupon =
        data?.data;

      if (updatedCoupon) {
        setCoupons((prev) =>
          prev.map((coupon) =>
            coupon._id ===
              couponFormData._id
              ? updatedCoupon
              : coupon
          )
        );
      } else {
        await fetchCoupons();
      }

      setShowEditCouponModal(false);
      setCouponFormData(
        initialCouponForm
      );

      toast.success(
        `Coupon "${payload.code}" updated successfully.`
      );
    } catch (error) {
      console.error(
        "Update coupon error:",
        error
      );

      toast.error(
        error.message ||
        "Failed to update coupon."
      );
    } finally {
      setCouponSubmitting(false);
    }
  };

  // ============================================================
  // DELETE COUPON
  // ============================================================

  const handleDeleteCoupon = async (
    id,
    code
  ) => {
    if (!id) {
      toast.error(
        "Coupon ID is missing."
      );
      return;
    }

    if (
      !window.confirm(
        `Delete coupon "${code}"?`
      )
    ) {
      return;
    }

    try {
      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        toast.error(
          "Admin authentication token not found."
        );
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/coupons/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
          "Failed to delete coupon."
        );
      }

      setCoupons((prev) =>
        prev.filter(
          (coupon) =>
            coupon._id !== id
        )
      );

      toast.success(
        `Coupon "${code}" deleted successfully.`
      );
    } catch (error) {
      console.error(
        "Delete coupon error:",
        error
      );

      toast.error(
        error.message ||
        "Failed to delete coupon."
      );
    }
  };

  // ============================================================
  // COPY COUPON
  // ============================================================

  const copyToClipboard = async (
    text
  ) => {
    try {
      await navigator.clipboard.writeText(
        text
      );

      toast.success(
        `Copied "${text}" to clipboard!`
      );
    } catch (error) {
      toast.error(
        "Failed to copy coupon code."
      );
    }
  };

  // ============================================================
  // FILTER OFFERS
  // ============================================================

  const filteredOffers =
    productOffers.filter((offer) => {
      const search =
        offerSearch
          .toLowerCase()
          .trim();

      const medicineName =
        offer.medicineId?.name ||
        "";

      const category =
        offer.medicineId?.category ||
        "";

      const matchSearch =
        !search ||
        (offer.offerName || "")
          .toLowerCase()
          .includes(search) ||
        (offer.description || "")
          .toLowerCase()
          .includes(search) ||
        medicineName
          .toLowerCase()
          .includes(search) ||
        category
          .toLowerCase()
          .includes(search);

      const status =
        getOfferScheduleStatus(
          offer,
          new Date()
        );

      const matchStatus =
        offerStatusFilter === "All" ||
        status === offerStatusFilter;

      return (
        matchSearch &&
        matchStatus
      );
    });

  // ============================================================
  // FILTER COUPONS
  // ============================================================

  const filteredCoupons =
    coupons.filter((coupon) => {
      const search =
        couponSearch
          .toLowerCase()
          .trim();

      const matchSearch =
        !search ||
        (coupon.code || "")
          .toLowerCase()
          .includes(search) ||
        (coupon.description || "")
          .toLowerCase()
          .includes(search);

      const status =
        getCouponScheduleStatus(
          coupon,
          new Date()
        );

      const matchStatus =
        couponStatusFilter === "All" ||
        status ===
        couponStatusFilter;

      const matchType =
        couponTypeFilter === "All" ||
        coupon.discountType ===
        couponTypeFilter;

      return (
        matchSearch &&
        matchStatus &&
        matchType
      );
    });

  // ============================================================
  // CLOSE COUPON MODAL
  // ============================================================

  const couponModalOpen =
    showAddCouponModal ||
    showEditCouponModal;

  const isEditingCoupon =
    showEditCouponModal;

  const closeCouponModal = () => {
    if (couponSubmitting) return;

    setShowAddCouponModal(false);
    setShowEditCouponModal(false);
    setCouponFormData(
      initialCouponForm
    );
  };

  // ============================================================
  // CLOSE OFFER MODALS
  // ============================================================

  const closeOfferModal = () => {
    if (offerSubmitting) return;

    setShowAddOfferModal(false);
    setShowEditOfferModal(false);
    setOfferFormData(
      initialOfferForm
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="ad-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="ad-page-header">
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
          }}
        >
          <FaTag
            style={{
              color:
                "var(--ad-primary)",
            }}
          />

          Pharmacy Discounts &
          Offers Management
        </h2>

        <p>
          Manage automatic product
          offers and cart checkout
          promo coupons with date-based
          scheduling
        </p>
      </div>

      {/* ======================================================
          TABS
      ====================================================== */}

      <div
        style={{
          display: "flex",
          gap: "1rem",
          borderBottom:
            "2px solid var(--ad-border-color)",
          paddingBottom: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <button
          className="ad-btn"
          style={{
            background:
              activeTab === "offers"
                ? "var(--ad-primary)"
                : "var(--ad-bg-secondary)",

            color:
              activeTab === "offers"
                ? "#fff"
                : "var(--ad-text-primary)",

            padding:
              "0.65rem 1.25rem",

            fontWeight: "700",

            fontSize: "0.9rem",

            borderRadius: "8px",
          }}
          onClick={() =>
            setActiveTab("offers")
          }
        >
          <FaBolt />

          1. Automatic Product Offers (
          {productOffers.length})
        </button>

        <button
          className="ad-btn"
          style={{
            background:
              activeTab === "coupons"
                ? "var(--ad-primary)"
                : "var(--ad-bg-secondary)",

            color:
              activeTab === "coupons"
                ? "#fff"
                : "var(--ad-text-primary)",

            padding:
              "0.65rem 1.25rem",

            fontWeight: "700",

            fontSize: "0.9rem",

            borderRadius: "8px",
          }}
          onClick={() =>
            setActiveTab("coupons")
          }
        >
          <FaTicketAlt />

          2. Cart & Checkout Coupons (
          {coupons.length})
        </button>
      </div>

      {/* ======================================================
          PRODUCT OFFERS TAB
      ====================================================== */}

      {activeTab === "offers" && (
        <>
          <div
            style={{
              background: "#eff6ff",
              border:
                "1px solid #bfdbfe",
              padding:
                "1rem 1.25rem",
              borderRadius: "10px",
              color: "#1e40af",
              fontSize: "0.85rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <strong>
                ⚡ Automatic Product
                Offers:
              </strong>{" "}
              Applied automatically on
              medicine cards and detail
              pages without requiring a
              coupon code.
            </div>

            <button
              className="ad-btn ad-btn-primary"
              onClick={() => {
                setOfferFormData(
                  initialOfferForm
                );

                setShowEditOfferModal(
                  false
                );

                setShowAddOfferModal(
                  true
                );
              }}
            >
              <FaPlus />
              Create Product Offer
            </button>
          </div>

          <div className="ad-card">
            <div
              className="ad-search-filter-bar"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
                alignItems: "center",
              }}
            >
              <div
                className="ad-search-wrapper"
                style={{
                  flex: 1,
                  minWidth: "260px",
                }}
              >
                <FaSearch className="ad-search-icon" />

                <input
                  type="text"
                  placeholder="Search offer name, medicine, category..."
                  className="ad-input"
                  value={offerSearch}
                  onChange={(e) =>
                    setOfferSearch(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="ad-filters">
                <select
                  className="ad-select"
                  value={
                    offerStatusFilter
                  }
                  onChange={(e) =>
                    setOfferStatusFilter(
                      e.target.value
                    )
                  }
                  style={{
                    width: "160px",
                  }}
                >
                  <option value="All">
                    All Time Statuses
                  </option>

                  <option value="Active">
                    Active (Now)
                  </option>

                  <option value="Scheduled">
                    Scheduled (Future)
                  </option>

                  <option value="Expired">
                    Expired (Past)
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>
              </div>
            </div>

            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>
                      Offer Title
                    </th>

                    <th>
                      Applies To
                    </th>

                    <th>
                      Discount Value
                    </th>

                    <th>
                      Schedule Window
                    </th>

                    <th>
                      Current Status
                    </th>

                    <th>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {offerLoading ? (
                    <tr>
                      <td
                        colSpan="6"
                        style={{
                          textAlign:
                            "center",
                          padding:
                            "2.5rem",
                          color:
                            "var(--ad-text-muted)",
                        }}
                      >
                        Loading product
                        offers...
                      </td>
                    </tr>
                  ) : filteredOffers.length ===
                    0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        style={{
                          textAlign:
                            "center",
                          padding:
                            "2.5rem",
                          color:
                            "var(--ad-text-muted)",
                        }}
                      >
                        No product offers
                        found.
                      </td>
                    </tr>
                  ) : (
                    filteredOffers.map(
                      (offer) => {
                        const status =
                          getOfferScheduleStatus(
                            offer,
                            new Date()
                          );

                        const sc =
                          offerStatusColors[
                          status
                          ];

                        const medicineName =
                          offer
                            .medicineId
                            ?.name ||
                          "Unknown Medicine";

                        return (
                          <tr
                            key={
                              offer._id
                            }
                          >
                            <td>
                              <strong>
                                {
                                  offer.offerName
                                }
                              </strong>

                              <span
                                style={{
                                  display:
                                    "block",
                                  fontSize:
                                    "0.74rem",
                                  color:
                                    "#b45309",
                                  marginTop:
                                    "2px",
                                }}
                              >
                                🏷️{" "}
                                {offer.description ||
                                  "Automatic Product Offer"}
                              </span>

                              <span
                                className="ad-id-badge"
                                style={{
                                  fontSize:
                                    "0.68rem",
                                  marginTop:
                                    "3px",
                                }}
                              >
                                {String(
                                  offer._id
                                ).slice(
                                  -6
                                )}
                              </span>
                            </td>

                            <td>
                              <strong>
                                Product:
                              </strong>{" "}
                              {medicineName}

                              {offer
                                .medicineId
                                ?.category && (
                                  <span
                                    style={{
                                      display:
                                        "block",
                                      fontSize:
                                        "0.75rem",
                                      color:
                                        "var(--ad-text-secondary)",
                                      marginTop:
                                        "3px",
                                    }}
                                  >
                                    Category:{" "}
                                    {
                                      offer
                                        .medicineId
                                        .category
                                    }
                                  </span>
                                )}
                            </td>

                            <td>
                              <span
                                style={{
                                  fontWeight:
                                    "700",
                                  color:
                                    "#16a34a",
                                  fontSize:
                                    "0.95rem",
                                }}
                              >
                                {offer.discountType ===
                                  "flat"
                                  ? `₹${offer.discountValue} FLAT OFF`
                                  : `${offer.discountValue}% OFF`}
                              </span>
                            </td>

                            <td>
                              <div
                                style={{
                                  fontSize:
                                    "0.8rem",
                                }}
                              >
                                <div>
                                  <strong>
                                    From:
                                  </strong>{" "}
                                  {formatDisplayDateTime(
                                    offer.startDate
                                  )}
                                </div>

                                <div>
                                  <strong>
                                    To:
                                  </strong>{" "}
                                  {formatDisplayDateTime(
                                    offer.endDate
                                  )}
                                </div>
                              </div>
                            </td>

                            <td>
                              <span
                                className="ad-pill"
                                style={{
                                  background:
                                    sc.bg,
                                  color:
                                    sc.color,
                                }}
                              >
                                {status}
                              </span>
                            </td>

                            <td>
                              <div
                                style={{
                                  display:
                                    "flex",
                                  gap:
                                    "0.4rem",
                                }}
                              >
                                <button
                                  className="ad-btn ad-btn-outline"
                                  style={{
                                    padding:
                                      "0.3rem 0.55rem",
                                    fontSize:
                                      "0.75rem",
                                  }}
                                  onClick={() =>
                                    openEditOffer(
                                      offer
                                    )
                                  }
                                  title="Edit Offer"
                                >
                                  <FaEdit />
                                  Edit
                                </button>

                                <button
                                  className="ad-btn ad-btn-outline"
                                  style={{
                                    padding:
                                      "0.3rem 0.55rem",
                                    fontSize:
                                      "0.75rem",
                                    color:
                                      "#dc2626",
                                  }}
                                  onClick={() =>
                                    handleDeleteOffer(
                                      offer._id,
                                      offer.offerName
                                    )
                                  }
                                  title="Delete Offer"
                                >
                                  <FaTrashAlt />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ======================================================
          COUPONS TAB
      ====================================================== */}

      {activeTab === "coupons" && (
        <>
          <div
            style={{
              background: "#fdf4ff",
              border:
                "1px solid #f5d0fe",
              padding:
                "1rem 1.25rem",
              borderRadius: "10px",
              color: "#86198f",
              fontSize: "0.85rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <strong>
                🎟️ Cart & Checkout
                Coupons:
              </strong>{" "}
              Entered by patients only
              in Cart and Checkout.
            </div>

            <button
              className="ad-btn ad-btn-primary"
              onClick={() => {
                setCouponFormData(
                  initialCouponForm
                );

                setShowAddCouponModal(
                  true
                );

                setShowEditCouponModal(
                  false
                );
              }}
            >
              <FaPlus />
              Create Cart Coupon
            </button>
          </div>

          <div className="ad-card">
            <div
              className="ad-search-filter-bar"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
                alignItems: "center",
              }}
            >
              <div
                className="ad-search-wrapper"
                style={{
                  flex: 1,
                  minWidth: "260px",
                }}
              >
                <FaSearch className="ad-search-icon" />

                <input
                  type="text"
                  placeholder="Search promo code, description..."
                  className="ad-input"
                  value={couponSearch}
                  onChange={(e) =>
                    setCouponSearch(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="ad-filters">
                <select
                  className="ad-select"
                  value={
                    couponStatusFilter
                  }
                  onChange={(e) =>
                    setCouponStatusFilter(
                      e.target.value
                    )
                  }
                  style={{
                    width: "160px",
                  }}
                >
                  <option value="All">
                    All Time Statuses
                  </option>

                  <option value="Active">
                    Active (Now)
                  </option>

                  <option value="Scheduled">
                    Scheduled (Future)
                  </option>

                  <option value="Expired">
                    Expired (Past)
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>

                <select
                  className="ad-select"
                  value={
                    couponTypeFilter
                  }
                  onChange={(e) =>
                    setCouponTypeFilter(
                      e.target.value
                    )
                  }
                  style={{
                    width: "150px",
                  }}
                >
                  <option value="All">
                    All Types
                  </option>

                  <option value="percentage">
                    Percentage (%)
                  </option>

                  <option value="flat">
                    Flat Amount (₹)
                  </option>
                </select>
              </div>
            </div>

            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>
                      Coupon Code &
                      Description
                    </th>

                    <th>
                      Type & Value
                    </th>

                    <th>
                      Min. Order / Cap
                    </th>

                    <th>
                      Validity Period
                    </th>

                    <th>
                      Schedule Status
                    </th>

                    <th>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {couponLoading ? (
                    <tr>
                      <td
                        colSpan="6"
                        style={{
                          textAlign:
                            "center",
                          padding:
                            "2.5rem",
                          color:
                            "var(--ad-text-muted)",
                        }}
                      >
                        Loading coupons...
                      </td>
                    </tr>
                  ) : filteredCoupons.length ===
                    0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        style={{
                          textAlign:
                            "center",
                          padding:
                            "2.5rem",
                          color:
                            "var(--ad-text-muted)",
                        }}
                      >
                        No cart coupons
                        found.
                      </td>
                    </tr>
                  ) : (
                    filteredCoupons.map(
                      (coupon) => {
                        const status =
                          getCouponScheduleStatus(
                            coupon,
                            new Date()
                          );

                        const sc =
                          couponStatusColors[
                          status
                          ];

                        return (
                          <tr
                            key={
                              coupon._id
                            }
                          >
                            <td>
                              <div
                                style={{
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  gap:
                                    "0.5rem",
                                }}
                              >
                                <strong
                                  style={{
                                    fontSize:
                                      "0.95rem",
                                    color:
                                      "var(--ad-primary)",
                                    letterSpacing:
                                      "0.5px",
                                  }}
                                >
                                  {
                                    coupon.code
                                  }
                                </strong>

                                <button
                                  type="button"
                                  style={{
                                    background:
                                      "none",
                                    border:
                                      "none",
                                    cursor:
                                      "pointer",
                                    color:
                                      "var(--ad-text-muted)",
                                  }}
                                  onClick={() =>
                                    copyToClipboard(
                                      coupon.code
                                    )
                                  }
                                  title="Copy code"
                                >
                                  <FaCopy />
                                </button>
                              </div>

                              <span
                                style={{
                                  display:
                                    "block",
                                  fontSize:
                                    "0.75rem",
                                  color:
                                    "var(--ad-text-secondary)",
                                  marginTop:
                                    "2px",
                                }}
                              >
                                {
                                  coupon.description
                                }
                              </span>
                            </td>

                            <td>
                              <strong>
                                {coupon.discountType ===
                                  "percentage"
                                  ? `${coupon.discountValue}% OFF`
                                  : `₹${coupon.discountValue} OFF`}
                              </strong>
                            </td>

                            <td>
                              <div
                                style={{
                                  fontSize:
                                    "0.8rem",
                                }}
                              >
                                <div>
                                  Min Order:{" "}
                                  <strong>
                                    ₹
                                    {coupon.minimumOrderAmount ??
                                      0}
                                  </strong>
                                </div>

                                {coupon.maximumDiscount !==
                                  null &&
                                  coupon.maximumDiscount !==
                                  undefined && (
                                    <div>
                                      Max Cap: ₹
                                      {
                                        coupon.maximumDiscount
                                      }
                                    </div>
                                  )}
                              </div>
                            </td>

                            <td>
                              <div
                                style={{
                                  fontSize:
                                    "0.8rem",
                                }}
                              >
                                <div>
                                  <strong>
                                    From:
                                  </strong>{" "}
                                  {formatDisplayDate(
                                    coupon.startDate
                                  )}
                                </div>

                                <div>
                                  <strong>
                                    To:
                                  </strong>{" "}
                                  {formatDisplayDate(
                                    coupon.endDate
                                  )}
                                </div>
                              </div>
                            </td>

                            <td>
                              <span
                                className="ad-pill"
                                style={{
                                  background:
                                    sc.bg,
                                  color:
                                    sc.color,
                                }}
                              >
                                {status}
                              </span>
                            </td>

                            <td>
                              <div
                                style={{
                                  display:
                                    "flex",
                                  gap:
                                    "0.4rem",
                                }}
                              >
                                <button
                                  className="ad-btn ad-btn-outline"
                                  style={{
                                    padding:
                                      "0.3rem 0.55rem",
                                    fontSize:
                                      "0.75rem",
                                  }}
                                  onClick={() =>
                                    openEditCoupon(
                                      coupon
                                    )
                                  }
                                >
                                  <FaEdit />
                                  Edit
                                </button>

                                <button
                                  className="ad-btn ad-btn-outline"
                                  style={{
                                    padding:
                                      "0.3rem 0.55rem",
                                    fontSize:
                                      "0.75rem",
                                    color:
                                      "#dc2626",
                                  }}
                                  onClick={() =>
                                    handleDeleteCoupon(
                                      coupon._id,
                                      coupon.code
                                    )
                                  }
                                >
                                  <FaTrashAlt />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ======================================================
          CREATE OFFER MODAL
      ====================================================== */}

      {showAddOfferModal && (
        <div
          className="ad-modal-overlay"
          onClick={closeOfferModal}
        >
          <div
            className="ad-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              maxWidth: "560px",
            }}
          >
            <div className="ad-modal-header">
              <h3 className="ad-modal-title">
                <FaBolt />
                Create Automatic
                Product Offer
              </h3>

              <button
                className="ad-modal-close"
                onClick={closeOfferModal}
                disabled={
                  offerSubmitting
                }
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={
                handleCreateOffer
              }
              className="ad-modal-body"
            >
              {/* OFFER NAME */}

              <div className="ad-form-group">
                <label>
                  Offer Name *
                </label>

                <input
                  type="text"
                  required
                  className="ad-input"
                  placeholder="e.g. Christmas Special"
                  value={
                    offerFormData.offerName
                  }
                  onChange={(e) =>
                    setOfferFormData({
                      ...offerFormData,
                      offerName:
                        e.target.value,
                    })
                  }
                />
              </div>

              {/* DESCRIPTION */}

              <div className="ad-form-group">
                <label>
                  Description
                </label>

                <input
                  type="text"
                  className="ad-input"
                  placeholder="e.g. Christmas Offer ₹5 OFF"
                  value={
                    offerFormData.description
                  }
                  onChange={(e) =>
                    setOfferFormData({
                      ...offerFormData,
                      description:
                        e.target.value,
                    })
                  }
                />
              </div>

              {/* MEDICINE */}

              <div className="ad-form-group">
                <label>
                  Target Medicine *
                </label>

                <select
                  className="ad-select"
                  value={
                    offerFormData.medicineId
                  }
                  onChange={(e) =>
                    setOfferFormData({
                      ...offerFormData,
                      medicineId:
                        e.target.value,
                    })
                  }
                  required
                >
                  <option value="">
                    {medicineLoading
                      ? "Loading medicines..."
                      : "Select Medicine"}
                  </option>

                  {medicinesList.map(
                    (medicine) => (
                      <option
                        key={
                          medicine._id
                        }
                        value={
                          medicine._id
                        }
                      >
                        {medicine.name}
                        {medicine.category
                          ? ` - ${medicine.category}`
                          : ""}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* DISCOUNT */}

              <div
                className="ad-grid-2"
                style={{
                  gap: "1rem",
                }}
              >
                <div className="ad-form-group">
                  <label>
                    Discount Type *
                  </label>

                  <select
                    className="ad-select"
                    value={
                      offerFormData.discountType
                    }
                    onChange={(e) =>
                      setOfferFormData({
                        ...offerFormData,
                        discountType:
                          e.target.value,
                      })
                    }
                  >
                    <option value="flat">
                      Fixed Amount (₹ OFF)
                    </option>

                    <option value="percentage">
                      Percentage (% OFF)
                    </option>
                  </select>
                </div>

                <div className="ad-form-group">
                  <label>
                    Discount Value *
                  </label>

                  <input
                    type="number"
                    required
                    min="1"
                    max={
                      offerFormData.discountType ===
                        "percentage"
                        ? "100"
                        : undefined
                    }
                    className="ad-input"
                    value={
                      offerFormData.discountValue
                    }
                    onChange={(e) =>
                      setOfferFormData({
                        ...offerFormData,
                        discountValue:
                          Number(
                            e.target.value
                          ),
                      })
                    }
                  />
                </div>
              </div>

              {/* DATES */}

              <div
                className="ad-grid-2"
                style={{
                  gap: "1rem",
                }}
              >
                <div className="ad-form-group">
                  <label>
                    From Date & Time *
                  </label>

                  <input
                    type="datetime-local"
                    required
                    className="ad-input"
                    value={
                      offerFormData.startDate
                    }
                    onChange={(e) =>
                      setOfferFormData({
                        ...offerFormData,
                        startDate:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div className="ad-form-group">
                  <label>
                    To Date & Time *
                  </label>

                  <input
                    type="datetime-local"
                    required
                    className="ad-input"
                    value={
                      offerFormData.endDate
                    }
                    onChange={(e) =>
                      setOfferFormData({
                        ...offerFormData,
                        endDate:
                          e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* ACTIVE */}

              <div className="ad-form-group">
                <label
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "0.5rem",
                    cursor:
                      "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={
                      offerFormData.isActive
                    }
                    onChange={(e) =>
                      setOfferFormData({
                        ...offerFormData,
                        isActive:
                          e.target.checked,
                      })
                    }
                  />

                  Offer Active
                </label>
              </div>

              {/* FOOTER */}

              <div className="ad-modal-footer">
                <button
                  type="button"
                  className="ad-btn ad-btn-outline"
                  onClick={
                    closeOfferModal
                  }
                  disabled={
                    offerSubmitting
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ad-btn ad-btn-primary"
                  disabled={
                    offerSubmitting
                  }
                >
                  <FaBolt />

                  {offerSubmitting
                    ? "Creating..."
                    : "Create Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          COUPON MODAL
      ====================================================== */}

      {couponModalOpen && (
        <div
          className="ad-modal-overlay"
          onClick={
            closeCouponModal
          }
        >
          <div
            className="ad-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              maxWidth: "560px",
            }}
          >
            <div className="ad-modal-header">
              <h3 className="ad-modal-title">
                <FaTicketAlt />

                {isEditingCoupon
                  ? "Edit Cart & Checkout Promo Coupon"
                  : "Create Cart & Checkout Promo Coupon"}
              </h3>

              <button
                className="ad-modal-close"
                onClick={
                  closeCouponModal
                }
                disabled={
                  couponSubmitting
                }
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={
                isEditingCoupon
                  ? handleUpdateCoupon
                  : handleCreateCoupon
              }
              className="ad-modal-body"
            >
              {/* CODE + TYPE */}

              <div
                className="ad-grid-2"
                style={{
                  gap: "1rem",
                }}
              >
                <div className="ad-form-group">
                  <label>
                    Coupon Code *
                  </label>

                  <input
                    type="text"
                    required
                    className="ad-input"
                    placeholder="e.g. CHRISTMAS20"
                    value={
                      couponFormData.code
                    }
                    onChange={(e) =>
                      setCouponFormData({
                        ...couponFormData,
                        code:
                          e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>

                <div className="ad-form-group">
                  <label>
                    Coupon Type *
                  </label>

                  <select
                    className="ad-select"
                    value={
                      couponFormData.discountType
                    }
                    onChange={(e) =>
                      setCouponFormData({
                        ...couponFormData,
                        discountType:
                          e.target.value,
                      })
                    }
                  >
                    <option value="percentage">
                      Percentage Discount (%)
                    </option>

                    <option value="flat">
                      Flat Cash Discount (₹)
                    </option>
                  </select>
                </div>
              </div>

              {/* DESCRIPTION */}

              <div className="ad-form-group">
                <label>
                  Description *
                </label>

                <input
                  type="text"
                  required
                  className="ad-input"
                  placeholder="e.g. Flat 20% discount"
                  value={
                    couponFormData.description
                  }
                  onChange={(e) =>
                    setCouponFormData({
                      ...couponFormData,
                      description:
                        e.target.value,
                    })
                  }
                />
              </div>

              {/* DISCOUNT + MIN ORDER */}

              <div
                className="ad-grid-2"
                style={{
                  gap: "1rem",
                }}
              >
                <div className="ad-form-group">
                  <label>
                    {couponFormData.discountType ===
                      "percentage"
                      ? "Discount Percentage (%) *"
                      : "Discount Amount (₹) *"}
                  </label>

                  <input
                    type="number"
                    required
                    min="1"
                    max={
                      couponFormData.discountType ===
                        "percentage"
                        ? "100"
                        : undefined
                    }
                    className="ad-input"
                    value={
                      couponFormData.discountValue
                    }
                    onChange={(e) =>
                      setCouponFormData({
                        ...couponFormData,
                        discountValue:
                          Number(
                            e.target.value
                          ),
                      })
                    }
                  />
                </div>

                <div className="ad-form-group">
                  <label>
                    Minimum Order Subtotal (₹)
                  </label>

                  <input
                    type="number"
                    min="0"
                    className="ad-input"
                    value={
                      couponFormData.minimumOrderAmount
                    }
                    onChange={(e) =>
                      setCouponFormData({
                        ...couponFormData,
                        minimumOrderAmount:
                          Number(
                            e.target.value
                          ),
                      })
                    }
                  />
                </div>
              </div>

              {/* MAX DISCOUNT + USAGE */}

              <div
                className="ad-grid-2"
                style={{
                  gap: "1rem",
                }}
              >
                <div className="ad-form-group">
                  <label>
                    Maximum Discount Cap (₹)
                  </label>

                  <input
                    type="number"
                    min="0"
                    className="ad-input"
                    placeholder="Optional"
                    value={
                      couponFormData.maximumDiscount
                    }
                    onChange={(e) =>
                      setCouponFormData({
                        ...couponFormData,
                        maximumDiscount:
                          e.target.value ===
                            ""
                            ? ""
                            : Number(
                              e.target.value
                            ),
                      })
                    }
                  />
                </div>

                <div className="ad-form-group">
                  <label>
                    Usage Limit
                  </label>

                  <input
                    type="number"
                    min="1"
                    className="ad-input"
                    value={
                      couponFormData.usageLimit
                    }
                    onChange={(e) =>
                      setCouponFormData({
                        ...couponFormData,
                        usageLimit:
                          Number(
                            e.target.value
                          ),
                      })
                    }
                  />
                </div>
              </div>

              {/* DATES */}

              <div
                className="ad-grid-2"
                style={{
                  gap: "1rem",
                }}
              >
                <div className="ad-form-group">
                  <label>
                    From Date *
                  </label>

                  <input
                    type="date"
                    required
                    className="ad-input"
                    value={
                      couponFormData.startDate
                    }
                    onChange={(e) =>
                      setCouponFormData({
                        ...couponFormData,
                        startDate:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div className="ad-form-group">
                  <label>
                    To Date *
                  </label>

                  <input
                    type="date"
                    required
                    className="ad-input"
                    value={
                      couponFormData.endDate
                    }
                    onChange={(e) =>
                      setCouponFormData({
                        ...couponFormData,
                        endDate:
                          e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* ACTIVE */}

              <div
                className="ad-form-group"
                style={{
                  marginTop:
                    "0.25rem",
                }}
              >
                <label
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "0.5rem",
                    cursor:
                      "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={
                      couponFormData.isActive
                    }
                    onChange={(e) =>
                      setCouponFormData({
                        ...couponFormData,
                        isActive:
                          e.target.checked,
                      })
                    }
                  />

                  Coupon Active
                </label>
              </div>

              {/* FOOTER */}

              <div className="ad-modal-footer">
                <button
                  type="button"
                  className="ad-btn ad-btn-outline"
                  onClick={
                    closeCouponModal
                  }
                  disabled={
                    couponSubmitting
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ad-btn ad-btn-primary"
                  disabled={
                    couponSubmitting
                  }
                >
                  <FaTicketAlt />

                  {couponSubmitting
                    ? isEditingCoupon
                      ? "Updating..."
                      : "Creating..."
                    : isEditingCoupon
                      ? "Update Coupon"
                      : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          EDIT OFFER MODAL
      ====================================================== */}

      {showEditOfferModal && (
        <div
          className="ad-modal-overlay"
          onClick={closeOfferModal}
        >
          <div
            className="ad-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              maxWidth: "560px",
            }}
          >
            <div className="ad-modal-header">
              <h3 className="ad-modal-title">
                <FaBolt />
                Edit Automatic
                Product Offer
              </h3>

              <button
                className="ad-modal-close"
                onClick={
                  closeOfferModal
                }
                disabled={
                  offerSubmitting
                }
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={
                handleUpdateOffer
              }
              className="ad-modal-body"
            >
              {/* OFFER NAME */}

              <div className="ad-form-group">
                <label>
                  Offer Name *
                </label>

                <input
                  type="text"
                  required
                  className="ad-input"
                  value={
                    offerFormData.offerName
                  }
                  onChange={(e) =>
                    setOfferFormData({
                      ...offerFormData,
                      offerName:
                        e.target.value,
                    })
                  }
                />
              </div>

              {/* DESCRIPTION */}

              <div className="ad-form-group">
                <label>
                  Description
                </label>

                <input
                  type="text"
                  className="ad-input"
                  value={
                    offerFormData.description
                  }
                  onChange={(e) =>
                    setOfferFormData({
                      ...offerFormData,
                      description:
                        e.target.value,
                    })
                  }
                />
              </div>

              {/* MEDICINE */}

              <div className="ad-form-group">
                <label>
                  Target Medicine *
                </label>

                <select
                  className="ad-select"
                  value={
                    offerFormData.medicineId
                  }
                  onChange={(e) =>
                    setOfferFormData({
                      ...offerFormData,
                      medicineId:
                        e.target.value,
                    })
                  }
                  required
                >
                  <option value="">
                    Select Medicine
                  </option>

                  {medicinesList.map(
                    (medicine) => (
                      <option
                        key={
                          medicine._id
                        }
                        value={
                          medicine._id
                        }
                      >
                        {medicine.name}
                        {medicine.category
                          ? ` - ${medicine.category}`
                          : ""}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* DISCOUNT */}

              <div
                className="ad-grid-2"
                style={{
                  gap: "1rem",
                }}
              >
                <div className="ad-form-group">
                  <label>
                    Discount Type *
                  </label>

                  <select
                    className="ad-select"
                    value={
                      offerFormData.discountType
                    }
                    onChange={(e) =>
                      setOfferFormData({
                        ...offerFormData,
                        discountType:
                          e.target.value,
                      })
                    }
                  >
                    <option value="flat">
                      Fixed Amount (₹ OFF)
                    </option>

                    <option value="percentage">
                      Percentage (% OFF)
                    </option>
                  </select>
                </div>

                <div className="ad-form-group">
                  <label>
                    Discount Value *
                  </label>

                  <input
                    type="number"
                    required
                    min="1"
                    max={
                      offerFormData.discountType ===
                        "percentage"
                        ? "100"
                        : undefined
                    }
                    className="ad-input"
                    value={
                      offerFormData.discountValue
                    }
                    onChange={(e) =>
                      setOfferFormData({
                        ...offerFormData,
                        discountValue:
                          Number(
                            e.target.value
                          ),
                      })
                    }
                  />
                </div>
              </div>

              {/* DATES */}

              <div
                className="ad-grid-2"
                style={{
                  gap: "1rem",
                }}
              >
                <div className="ad-form-group">
                  <label>
                    From Date & Time *
                  </label>

                  <input
                    type="datetime-local"
                    required
                    className="ad-input"
                    value={
                      offerFormData.startDate
                    }
                    onChange={(e) =>
                      setOfferFormData({
                        ...offerFormData,
                        startDate:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div className="ad-form-group">
                  <label>
                    To Date & Time *
                  </label>

                  <input
                    type="datetime-local"
                    required
                    className="ad-input"
                    value={
                      offerFormData.endDate
                    }
                    onChange={(e) =>
                      setOfferFormData({
                        ...offerFormData,
                        endDate:
                          e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* ACTIVE */}

              <div className="ad-form-group">
                <label
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "0.5rem",
                    cursor:
                      "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={
                      offerFormData.isActive
                    }
                    onChange={(e) =>
                      setOfferFormData({
                        ...offerFormData,
                        isActive:
                          e.target.checked,
                      })
                    }
                  />

                  Offer Active
                </label>
              </div>

              {/* FOOTER */}

              <div className="ad-modal-footer">
                <button
                  type="button"
                  className="ad-btn ad-btn-outline"
                  onClick={
                    closeOfferModal
                  }
                  disabled={
                    offerSubmitting
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ad-btn ad-btn-primary"
                  disabled={
                    offerSubmitting
                  }
                >
                  <FaBolt />

                  {offerSubmitting
                    ? "Updating..."
                    : "Update Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}