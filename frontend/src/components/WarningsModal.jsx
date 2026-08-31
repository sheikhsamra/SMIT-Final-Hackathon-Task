import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useWarnings } from "../context/WarningsContext";
import { getNotifications, markNotificationRead } from "../utils/notifications";
import { IconAlertTriangle } from "./Icons";

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

// A single popup listing every warning the current user has ever received
// from an admin. Opens itself the moment a new one arrives, and can also
// be opened on demand (e.g. clicking a warning in the notification bell).
export default function WarningsModal() {
  const { user } = useAuth();
  const { isOpen, open, close } = useWarnings();
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    if (!user) return;
    const load = () => {
      getNotifications()
        .then((list) => {
          const onlyWarnings = list.filter((n) => n.type === "warning");
          setWarnings(onlyWarnings);
          if (onlyWarnings.some((n) => !n.read)) open();
        })
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleClose = async () => {
    const unread = warnings.filter((n) => !n.read);
    if (unread.length > 0) {
      await Promise.all(unread.map((n) => markNotificationRead(n._id).catch(() => {})));
      setWarnings((prev) => prev.map((n) => ({ ...n, read: true })));
    }
    close();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content warn-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleClose}>&times;</button>
        <div className="warn-modal-card recipient">
          <span className="warn-modal-icon"><IconAlertTriangle /></span>
          <h2>Warnings from Admin</h2>

          {warnings.length === 0 ? (
            <p className="warnings-empty">No warnings — you're all clear.</p>
          ) : (
            <div className="warnings-list">
              {warnings.map((w) => (
                <div className={`warning-item ${w.read ? "" : "unread"}`} key={w._id}>
                  <p>{w.message}</p>
                  <span className="warning-time">{timeAgo(w.createdAt)}</span>
                </div>
              ))}
            </div>
          )}

          <button type="button" className="btn-primary" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
