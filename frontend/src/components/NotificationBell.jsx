import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../utils/notifications";
import { IconBell, IconInbox, IconCheckCircle, IconXCircle, IconSparkle, IconAlertTriangle } from "./Icons";

const TYPE_META = {
  new_booking: { Icon: IconInbox, title: "New Booking", color: "var(--status-new)", bg: "rgba(var(--status-new-rgb), 0.14)" },
  accepted: { Icon: IconCheckCircle, title: "Accepted", color: "var(--status-resolved)", bg: "rgba(var(--status-resolved-rgb), 0.14)" },
  rejected: { Icon: IconXCircle, title: "Rejected", color: "var(--priority-high)", bg: "rgba(var(--priority-high-rgb), 0.14)" },
  completed: { Icon: IconSparkle, title: "Completed", color: "var(--priority-medium)", bg: "rgba(var(--priority-medium-rgb), 0.14)" },
  warning: { Icon: IconAlertTriangle, title: "Warning from Admin", color: "var(--priority-high)", bg: "rgba(var(--priority-high-rgb), 0.14)" },
};

const timeAgo = (dateString) => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = () => getNotifications().then(setNotifications).catch(() => {});
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpenNotification = async (n) => {
    setOpen(false);
    if (!n.read) {
      markNotificationRead(n._id).catch(() => {});
      setNotifications((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
    }
    // Account-level notifications (e.g. an admin warning) aren't tied to a
    // ticket, so there's nowhere to navigate.
    if (n.ticket) navigate(`/tickets/${n.ticket}`);
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="notification-bell-wrap" ref={wrapRef}>
      <button
        className="notification-bell-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        <IconBell />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <span>
              Notifications
              {unreadCount > 0 && <span className="notification-count-pill">{unreadCount} new</span>}
            </span>
            {unreadCount > 0 && (
              <button className="notification-mark-all" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 && (
            <div className="notification-empty">
              <span className="notification-empty-icon"><IconBell /></span>
              <p>You're all caught up.</p>
            </div>
          )}

          {notifications.map((n, i) => {
            const meta = TYPE_META[n.type] || { Icon: IconBell, title: "Update", color: "var(--accent-1)", bg: "rgba(var(--accent-1-rgb), 0.14)" };
            return (
              <button
                key={n._id}
                className={`notification-item ${n.read ? "" : "unread"}`}
                onClick={() => handleOpenNotification(n)}
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <span className="notification-icon" style={{ background: meta.bg, color: meta.color }}>
                  <meta.Icon />
                </span>
                <span className="notification-body">
                  <span className="notification-top-row">
                    <span className="notification-title">{meta.title}</span>
                    <span className="notification-time">{timeAgo(n.createdAt)}</span>
                  </span>
                  <span className="notification-text">{n.message}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
