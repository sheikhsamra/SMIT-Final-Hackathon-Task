import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import HeroIllustration from "../components/HeroIllustration";

export default function Home({ onOpenAuth }) {
  const { user } = useAuth();

  return (
    <div className="page hero-page">
      <div className="hero-bg-blobs" aria-hidden="true">
        <span className="hero-blob hero-blob-1" />
        <span className="hero-blob hero-blob-2" />
        <span className="hero-blob hero-blob-3" />
      </div>

      <div className="hero-split">
        <div className="hero-text">
          <span className="hero-badge">🎫 AI-Assisted Support Desk</span>
          <h1>
            Every ticket, <span className="hero-highlight">relayed right</span>
          </h1>
          <p>
            Submit a ticket, get instantly matched with the right worker, and track
            everything — replies, status, resolution — in one clean place.
          </p>

          <div className="cta-group hero-cta">
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

        <div className="hero-visual">
          <HeroIllustration />
        </div>
      </div>
    </div>
  );
}
