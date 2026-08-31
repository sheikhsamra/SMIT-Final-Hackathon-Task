import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const DASHBOARD_BY_ROLE = { customer: "/dashboard", worker: "/worker", admin: "/admin" };

// Loaded once and cached — several instances of this button (login modal,
// register modal) can mount/unmount without re-fetching the script.
let scriptPromise = null;
const loadGoogleScript = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
};

// Renders Google's own "Sign in with Google" button and hands the resulting
// ID token to the backend — no client secret ever touches the frontend.
export default function GoogleSignInButton({ onError, onSuccess }) {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const btnRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !btnRef.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: async (response) => {
            try {
              const data = await googleLogin(response.credential);
              onSuccess?.();
              navigate(DASHBOARD_BY_ROLE[data.role] || "/dashboard");
            } catch (err) {
              onError?.(err.response?.data?.message || "Google sign-in failed. Please try again.");
            }
          },
        });
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          width: 320,
          text: "continue_with",
        });
        setReady(true);
      })
      .catch(() => onError?.("Could not load Google Sign-In right now."));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!CLIENT_ID) return null;

  return (
    <div className="google-signin-wrap">
      <div className="auth-divider"><span>or</span></div>
      <div ref={btnRef} className="google-signin-btn" style={{ visibility: ready ? "visible" : "hidden" }} />
    </div>
  );
}
