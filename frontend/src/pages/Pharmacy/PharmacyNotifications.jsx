import React, { useState } from "react";
import { FaBell, FaCheck, FaTimes, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaTruck } from "react-icons/fa";
import "./PharmacyPages.css";

const initialNotifications = [
  { id:1, type:"alert",   icon:<FaExclamationTriangle />, title:"Low Stock Warning",            message:"Amoxicillin 250mg has only 9 units remaining. Reorder immediately.",   time:"5 min ago",  read:false },
  { id:2, type:"info",    icon:<FaInfoCircle />,          title:"New Prescription Received",     message:"Prescription RX-007 from Dr. Sara Thomas for Arjun Mehta is awaiting dispatch.", time:"18 min ago", read:false },
  { id:3, type:"success", icon:<FaCheckCircle />,         title:"Order Delivered",               message:"Order ORD-444 for Vijay Kumar has been marked as delivered.",           time:"1 hr ago",   read:false },
  { id:4, type:"alert",   icon:<FaExclamationTriangle />, title:"Expiry Date Alert",             message:"Ibuprofen 400mg batch expires on 2026-08-20. Consider immediate action.", time:"2 hr ago",   read:true  },
  { id:5, type:"info",    icon:<FaTruck />,               title:"Delivery Agent Assigned",       message:"Ramu Kumar has been assigned to deliver ORD-443 to Priya Patel.",       time:"3 hr ago",   read:true  },
  { id:6, type:"success", icon:<FaCheckCircle />,         title:"Payment Received",              message:"₹950 payment received from Vijay Kumar for invoice INV-2204.",          time:"4 hr ago",   read:true  },
  { id:7, type:"alert",   icon:<FaExclamationTriangle />, title:"Inventory Discrepancy",         message:"Metformin 500mg stock count doesn't match records. Please verify.",      time:"Yesterday",  read:true  },
  { id:8, type:"info",    icon:<FaInfoCircle />,          title:"System Maintenance Scheduled",  message:"Scheduled system maintenance on 15 Jul 2026, 2:00 AM – 4:00 AM IST.",   time:"Yesterday",  read:true  },
];

const typeStyle = {
  alert:   { bg:"#fef3c7", color:"#d97706", border:"#fcd34d" },
  info:    { bg:"#e0f2fe", color:"#0284c7", border:"#7dd3fc" },
  success: { bg:"#dcfce7", color:"#16a34a", border:"#86efac" },
};

export default function PharmacyNotifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
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
