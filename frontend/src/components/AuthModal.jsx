import { useState, useEffect } from "react";
import Login from "../pages/Login";
import Register from "../pages/Register";

export default function AuthModal({ isOpen, onClose, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);

  // Jab bhi modal dobara open ho ya initialMode change ho, mode update ho jaye
  useEffect(() => {
    setMode(initialMode);
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        
        {mode === "login" ? (
          <Login 
            onSuccess={onClose} 
            onSwitchToRegister={() => setMode("register")} 
          />
        ) : (
          <Register 
            onSuccess={onClose} 
            onSwitchToLogin={() => setMode("login")} 
          />
        )}
      </div>
    </div>
  );
}