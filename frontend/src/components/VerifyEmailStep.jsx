import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IconMail } from "./Icons";

const DASHBOARD_BY_ROLE = { customer: "/dashboard", worker: "/worker", admin: "/admin" };

// Shown after registration (or a login attempt on an unverified account) —
// the account has no usable token yet, so this is the only way in.
export default function VerifyEmailStep({ email, onSuccess }) {
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setError("");
    setSubmitting(true);
    try {
      const data = await verifyEmail(email, code);
      onSuccess();
      navigate(DASHBOARD_BY_ROLE[data.role] || "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not verify — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setResent(false);
    try {
      await resendVerification(email);
      setResent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend the code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-icon">
        <IconMail />
      </div>
      <h2>Check your email</h2>
      <p>
        We sent a 6-digit code to <strong>{email}</strong>. Enter it below to finish setting up your account.
      </p>

      {error && <p className="error-text">{error}</p>}
      {resent && !error && <p className="verify-resent-note">A new code is on its way.</p>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="verify-code-input"
            required
            autoFocus
          />
        </div>

        <button type="submit" className="auth-submit-btn" disabled={code.length !== 6 || submitting}>
          {submitting ? "Verifying…" : "Verify & Continue"}
        </button>
      </form>

      <p className="auth-switch-text">
        Didn't get it?{" "}
        <a
          onClick={(e) => {
            e.preventDefault();
            if (!resending) handleResend();
          }}
        >
          {resending ? "Sending…" : "Resend code"}
        </a>
      </p>
    </div>
  );
}
