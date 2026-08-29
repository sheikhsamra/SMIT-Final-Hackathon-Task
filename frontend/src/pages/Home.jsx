import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: "🔐",
    title: "Auth Ready",
    desc: "JWT login, register aur protected routes pehle se wired hain.",
  },
  {
    icon: "⚡",
    title: "MERN Stack",
    desc: "MongoDB, Express, React aur Node — sab connect ho chuka hai.",
  },
  {
    icon: "🎨",
    title: "Themeable UI",
    desc: "Dark/light mode toggle aur glassmorphism design system built-in.",
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
          Header, Footer, Navbar aur Authentication pehle se ready hain — ab bas apna
          actual idea/feature isi structure mein add karna hai.
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
