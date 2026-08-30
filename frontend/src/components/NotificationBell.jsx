import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../utils/notifications";
import { IconBell, IconInbox, IconCheckCircle, IconXCircle, IconSparkle } from "./Icons";

const ICON_BY_TYPE = {
  new_booking: IconInbox,
  accepted: IconCheckCircle,
  rejected: IconXCircle,
  completed: IconSparkle,
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
    navigate(`/tickets/${n.ticket}`);
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
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button className="notification-mark-all" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 && (
            <p className="notification-empty">No notifications yet.</p>
          )}

          {notifications.map((n) => {
            const NotifIcon = ICON_BY_TYPE[n.type] || IconBell;
            return (
              <button
                key={n._id}
                className={`notification-item ${n.read ? "" : "unread"}`}
                onClick={() => handleOpenNotification(n)}
              >
                <span className="notification-icon"><NotifIcon /></span>
                <span className="notification-text">{n.message}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
