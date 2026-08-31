import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getNotifications, markNotificationRead } from "../utils/notifications";
import { IconAlertTriangle } from "./Icons";

// Polls for the current user's own unread "warning" notifications and
// surfaces the first one as an unmissable popup — a warning sitting quietly
// in the notification bell is too easy to miss.
export default function WarningAlert() {
  const { user } = useAuth();
  const [activeWarning, setActiveWarning] = useState(null);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    if (!user) {
      setActiveWarning(null);
      return;
    }
    const check = () => {
      getNotifications()
        .then((list) => {
          const unread = list.find((n) => n.type === "warning" && !n.read);
          setActiveWarning((prev) => prev || unread || null);
        })
        .catch(() => {});
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleDismiss = async () => {
    if (!activeWarning) return;
    setDismissing(true);
    try {
      await markNotificationRead(activeWarning._id);
    } catch {
      // Not fatal — worst case it shows again on the next poll.
    }
    setActiveWarning(null);
    setDismissing(false);
  };

  if (!activeWarning) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content warn-modal-content">
        <div className="warn-modal-card recipient">
          <span className="warn-modal-icon"><IconAlertTriangle /></span>
          <h2>Warning from Admin</h2>
          <p className="warn-modal-message">{activeWarning.message}</p>
          <button type="button" className="btn-primary" onClick={handleDismiss} disabled={dismissing}>
            {dismissing ? "…" : "I Understand"}
          </button>
        </div>
      </div>
    </div>
  );
}
