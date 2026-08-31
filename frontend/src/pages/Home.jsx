import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import HeroIllustration from "../components/HeroIllustration";
import {
  IconTicket,
  IconUsers,
  IconCheckCircle,
  IconSparkle,
  IconClock,
  IconShield,
  IconStar,
} from "../components/Icons";

const STEPS = [
  {
    Icon: IconTicket,
    color: "c-teal",
    step: "Step 1",
    title: "Submit a ticket",
    desc: "Describe the issue and pick a category — billing, technical, account, or general.",
  },
  {
    Icon: IconUsers,
    color: "c-blue",
    step: "Step 2",
    title: "Get matched instantly",
    desc: "Relay suggests the right worker for your category, rated and ranked by experience.",
  },
  {
    Icon: IconCheckCircle,
    color: "c-green",
    step: "Step 3",
    title: "Track it to resolution",
    desc: "Chat in real time, get notified on every update, and rate the worker once it's done.",
  },
];

const FEATURES = [
  {
    Icon: IconSparkle,
    title: "AI-Assisted Triage",
    desc: "Every ticket gets an instant suggested category and priority, so nothing sits unsorted.",
  },
  {
    Icon: IconClock,
    title: "Live Status Updates",
    desc: "Notifications the moment a booking is accepted, replied to, or marked complete.",
  },
  {
    Icon: IconStar,
    title: "Verified Reviews",
    desc: "Every rating comes from a real closed ticket, tied to the worker's public profile.",
  },
  {
    Icon: IconShield,
    title: "Role-Based Access",
    desc: "Customers, workers, and admins each see exactly what they need — nothing more.",
  },
];

export default function Home({ onOpenAuth }) {
  const { user } = useAuth();

  return (
    <div className="page hero-page wide-page">
      <div className="hero-bg-blobs" aria-hidden="true">
        <span className="hero-blob hero-blob-1" />
        <span className="hero-blob hero-blob-2" />
        <span className="hero-blob hero-blob-3" />
      </div>

      <div className="hero-split">
        <div className="hero-text">
          <span className="hero-badge">
            <IconTicket /> AI-Assisted Support Desk
          </span>
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

      <div className="section-header">
        <h2 className="section-title">How it works</h2>
        <p>Three steps from "I have a problem" to "it's fixed."</p>
      </div>
      <div className="vivid-stats-row how-it-works-row">
        {STEPS.map((s, i) => (
          <div className={`vivid-card ${s.color}`} key={s.title} style={{ animationDelay: `${0.1 * i}s` }}>
            <span className="vivid-card-icon"><s.Icon /></span>
            <div className="vivid-card-label how-it-works-step">{s.step}</div>
            <div className="how-it-works-title">{s.title}</div>
            <p className="how-it-works-desc">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="section-header">
        <h2 className="section-title">Why Relay</h2>
        <p>Built for support teams that want to move fast without losing track of anything.</p>
      </div>
      <div className="features-grid">
        {FEATURES.map((f, i) => (
          <div className="feature-card" key={f.title} style={{ animationDelay: `${0.08 * i}s` }}>
            <span className="feature-icon-chip"><f.Icon /></span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      {!user && (
        <div className="home-cta-banner">
          <h2>Ready to get your ticket relayed right?</h2>
          <p>It takes less than a minute to submit your first ticket.</p>
          <button className="btn-primary" onClick={() => onOpenAuth?.("register")}>
            Get Started →
          </button>
        </div>
      )}
    </div>
  );
}
