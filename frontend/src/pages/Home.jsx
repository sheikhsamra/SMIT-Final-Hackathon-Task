import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: "🤖",
    title: "AI Triage",
    desc: "Every ticket is automatically categorized, prioritized, and summarized by AI before a worker opens it.",
  },
  {
    icon: "⚡",
    title: "Real-time Updates",
    desc: "Replies and status changes show up instantly for both customer and worker — no refreshing needed.",
  },
  {
    icon: "🔒",
    title: "Role-based Access",
    desc: "Customers see only their own tickets; workers see and manage what's assigned to them.",
  },
];

export default function Home({ onOpenAuth }) {
  const { user } = useAuth();

  return (
    <div className="page">
      <div className="hero">
        <span className="hero-badge">🎫 AI-Assisted Support Desk</span>
        <h1>
          Every ticket, <span className="hero-highlight">relayed right</span>
        </h1>
        <p>
          Submit a ticket, let AI triage it in seconds, and get a real response from
          a real worker — all tracked in one place.
        </p>

        <div className="cta-group">
          {user ? (
            <Link to="/dashboard" className="btn-primary">
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <button className="btn-primary" onClick={() => onOpenAuth?.("register")}>
                Submit a Ticket →
              </button>
              <button className="btn-secondary" onClick={() => onOpenAuth?.("login")}>
                I already have an account
              </button>
            </>
          )}
        </div>
      </div>

      <div className="features-grid">
        {FEATURES.map((f, i) => (
          <div className="feature-card" key={f.title} style={{ animationDelay: `${0.1 * i}s` }}>
            <span className="feature-icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
