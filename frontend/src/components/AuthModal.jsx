import { useState, useEffect } from "react";
import Login from "../pages/Login";
import Register from "../pages/Register";
import VerifyEmailStep from "./VerifyEmailStep";

export default function AuthModal({ isOpen, onClose, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const [verifyEmailAddress, setVerifyEmailAddress] = useState("");

  // Reset the mode whenever the modal reopens or initialMode changes
  useEffect(() => {
    setMode(initialMode);
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleNeedsVerification = (email) => {
    setVerifyEmailAddress(email);
    setMode("verify");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>

        {mode === "login" && (
          <Login
            onSuccess={onClose}
            onSwitchToRegister={() => setMode("register")}
            onNeedsVerification={handleNeedsVerification}
          />
        )}
        {mode === "register" && (
          <Register
            onSuccess={onClose}
            onSwitchToLogin={() => setMode("login")}
            onNeedsVerification={handleNeedsVerification}
          />
        )}
        {mode === "verify" && <VerifyEmailStep email={verifyEmailAddress} onSuccess={onClose} />}
      </div>
    </div>
  );
}
