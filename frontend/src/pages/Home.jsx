import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: "🔐",
    title: "Auth Ready",
    desc: "JWT login, register, and protected routes are wired up out of the box.",
  },
  {
    icon: "⚡",
    title: "MERN Stack",
    desc: "MongoDB, Express, React, and Node — all connected and ready to go.",
  },
  {
    icon: "🎨",
    title: "Themeable UI",
    desc: "Dark/light mode toggle and a glassmorphism design system, built-in.",
  },
];

export default function Home({ onOpenAuth }) {
  const { user } = useAuth();

  return (
    <div className="page">
      <div className="hero">
        <span className="hero-badge">🚀 Hackathon Starter</span>
        <h1>
          Build fast, <span className="hero-highlight">ship faster</span>
        </h1>
        <p>
          Header, Footer, Navbar, and Authentication are ready to go — now just add
          your actual idea or feature into this structure.
        </p>

        <div className="cta-group">
          {user ? (
            <Link to="/dashboard" className="btn-primary">
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <button className="btn-primary" onClick={() => onOpenAuth?.("register")}>
                Get Started →
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
