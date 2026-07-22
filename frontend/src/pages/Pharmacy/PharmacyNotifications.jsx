import React, { useState } from "react";
import { FaBell, FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaTruck } from "react-icons/fa";
import "./PharmacyPages.css";

const retailNotifications = [
  { id:1, type:"info",    icon:<FaInfoCircle />,          title:"New Prescription",              message:"Prescription RX-007 from Dr. Sara Thomas for Arjun Mehta is awaiting dispatch.", time:"18 min ago", read:false },
  { id:2, type:"success", icon:<FaCheckCircle />,         title:"Order Ready",                   message:"Order ORD-444 for Vijay Kumar is ready for pickup.",                    time:"1 hr ago",   read:false },
  { id:3, type:"alert",   icon:<FaExclamationTriangle />, title:"Low Stock",                     message:"Amoxicillin 250mg has only 9 units remaining. Reorder immediately.",   time:"5 min ago",  read:false },
];

const hospitalNotifications = [
  { id:1, type:"info",    icon:<FaInfoCircle />,          title:"Ward Medicine Request",         message:"ICU A requested Adrenaline and Saline.", time:"10 min ago", read:false },
  { id:2, type:"alert",   icon:<FaExclamationTriangle />, title:"Emergency Stock Request",       message:"Emergency ward needs 5 units of O-negative blood substitutes.", time:"2 min ago",   read:false },
  { id:3, type:"info",    icon:<FaInfoCircle />,          title:"Doctor Prescription",           message:"Dr. A. Menon sent a prescription for Ramesh Iyer (Bed 102).",   time:"30 min ago",  read:false },
];

const wholesaleNotifications = [
  { id:1, type:"info",    icon:<FaInfoCircle />,          title:"Retail Order Received",         message:"MediCare Pharmacy placed a new order for ₹45,000.", time:"15 min ago", read:false },
  { id:2, type:"info",    icon:<FaInfoCircle />,          title:"Hospital Bulk Order",           message:"Apollo Hospital placed a bulk order for IV fluids.", time:"1 hr ago",   read:false },
  { id:3, type:"success", icon:<FaTruck />,               title:"Dispatch Completed",            message:"Shipment dispatched for City Health Pharma.",   time:"2 hrs ago",  read:false },
];

const typeStyle = {
  alert:   { bg:"#fef3c7", color:"#d97706", border:"#fcd34d" },
  info:    { bg:"#e0f2fe", color:"#0284c7", border:"#7dd3fc" },
  success: { bg:"#dcfce7", color:"#16a34a", border:"#86efac" },
};

export default function PharmacyNotifications() {
  const pharmacyType = localStorage.getItem("pharmacyType") || "Retail";
  
  const getInitialNotifs = () => {
    switch (pharmacyType) {
      case "Hospital": return hospitalNotifications;
      case "Wholesale": return wholesaleNotifications;
      case "Retail":
      default: return retailNotifications;
    }
  };

  const [notifications, setNotifications] = useState(getInitialNotifs());
  const [filter, setFilter] = useState("All");

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const dismiss     = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));
  const markRead    = (id) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  const filtered = notifications.filter((n) => {
    if (filter === "Unread") return !n.read;
    if (filter === "Alerts") return n.type === "alert";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="ph-page">
      <div className="ph-page-header">
        <div>
          <h2 className="ph-page-title"><FaBell /> Notifications</h2>
          <p className="ph-page-sub">{unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}</p>
        </div>
        <div className="ph-notif-toolbar">
          <div className="ph-filter-box">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option>All</option><option>Unread</option><option>Alerts</option>
            </select>
          </div>
          {unreadCount > 0 && (
            <button className="ph-btn-mark-read" onClick={markAllRead}>
              <FaCheck /> Mark All Read
            </button>
          )}
        </div>
      </div>

      <div className="ph-notif-list">
        {filtered.length === 0 ? (
          <div className="ph-empty-state">No notifications.</div>
        ) : filtered.map((n) => {
          const ts = typeStyle[n.type] || typeStyle.info;
          return (
            <div
              key={n.id}
              className={`ph-notif-card ${!n.read ? "ph-notif-card--unread" : ""}`}
              onClick={() => markRead(n.id)}
            >
              <div className="ph-notif-icon" style={{ background: ts.bg, color: ts.color, border: `1px solid ${ts.border}` }}>
                {n.icon}
              </div>
              <div className="ph-notif-content">
                <div className="ph-notif-title-row">
                  <span className="ph-notif-title">{n.title}</span>
                  {!n.read && <span className="ph-notif-unread-dot" />}
                </div>
                <p className="ph-notif-msg">{n.message}</p>
                <span className="ph-notif-time">{n.time}</span>
              </div>
              <button className="ph-notif-dismiss" onClick={(e) => { e.stopPropagation(); dismiss(n.id); }} aria-label="Dismiss">
                <FaTimes />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
