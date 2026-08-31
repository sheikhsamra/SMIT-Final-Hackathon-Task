import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  IconSparkle,
  IconBarChart,
  IconUsers,
  IconClock,
  IconShield,
  IconStar,
} from "../components/Icons";

const PILLARS = [
  {
    Icon: IconSparkle,
    color: "c-teal",
    title: "Our Mission",
    desc: "Make support feel personal again — fast matching, clear communication, real accountability.",
  },
  {
    Icon: IconBarChart,
    color: "c-blue",
    title: "How It Works",
    desc: "Submit a ticket → get matched with a worker → chat and track progress → rate the experience.",
  },
  {
    Icon: IconUsers,
    color: "c-green",
    title: "Built For",
    desc: "Teams who want a lightweight, modern alternative to bloated legacy helpdesk software.",
  },
];

const VALUES = [
  { Icon: IconClock, title: "Fast", desc: "A ticket gets a suggested category, priority, and matching worker in seconds." },
  { Icon: IconStar, title: "Transparent", desc: "Every status change and message is visible to the customer, in real time." },
  { Icon: IconShield, title: "Fair", desc: "Reviews are tied to real closed tickets — no fake ratings, no gaming the system." },
  { Icon: IconSparkle, title: "Simple", desc: "No bloated settings or workflows to configure before you can use it." },
];

export default function About({ onOpenAuth }) {
  const { user } = useAuth();

  return (
    <div className="page wide-page">
      <div className="dashboard-header">
        <h1 className="wide-page-title">About Relay</h1>
        <p>A faster, more transparent way to run customer support.</p>
      </div>

      <div className="about-content">
        <p>
          Relay is an AI-assisted support desk that connects customers directly with the
          right worker for their issue — no waiting in a generic queue. When a ticket comes
          in, our system reads it, suggests a category and priority, and shows the customer
          a shortlist of specialists who can help, ranked by experience and rating.
        </p>
        <p>
          Every step of the journey — booking, acceptance, conversation, resolution, and
          review — is tracked in real time, so nothing gets lost and nobody is left
          wondering what happens next.
        </p>
      </div>

      <div className="vivid-stats-row how-it-works-row">
        {PILLARS.map((p, i) => (
          <div className={`vivid-card ${p.color}`} key={p.title} style={{ animationDelay: `${0.1 * i}s` }}>
            <span className="vivid-card-icon"><p.Icon /></span>
            <div className="how-it-works-title">{p.title}</div>
            <p className="how-it-works-desc">{p.desc}</p>
          </div>
        ))}
      </div>

      <div className="section-header">
        <h2 className="section-title">What we stand for</h2>
        <p>The handful of things Relay refuses to compromise on.</p>
      </div>
      <div className="features-grid">
        {VALUES.map((v, i) => (
          <div className="feature-card" key={v.title} style={{ animationDelay: `${0.08 * i}s` }}>
            <span className="feature-icon-chip"><v.Icon /></span>
            <h3>{v.title}</h3>
            <p>{v.desc}</p>
          </div>
        ))}
      </div>

      {!user && (
        <div className="home-cta-banner">
          <h2>See it for yourself</h2>
          <p>Create an account and submit your first ticket in under a minute.</p>
          <button className="btn-primary" onClick={() => onOpenAuth?.("register")}>
            Get Started →
          </button>
        </div>
      )}

      {user?.role === "customer" && (
        <div className="home-cta-banner">
          <h2>Ready for another ticket?</h2>
          <p>Get matched with a specialist in seconds.</p>
          <Link to="/tickets/new" className="btn-primary">Submit a Ticket →</Link>
        </div>
      )}
    </div>
  );
}
