import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTicketStats } from "../utils/tickets";
import { IconMail, IconBadge, IconCalendar, IconTicket, IconInbox, IconCheckCircle, IconSparkle, IconBarChart } from "../components/Icons";

const WORKER_PREVIEW = [
  { Icon: IconInbox, title: "Assigned Tickets", desc: "Review tickets routed to you, sorted by AI-suggested priority." },
  { Icon: IconSparkle, title: "AI Suggestions", desc: "Approve or edit the AI's category, priority, and summary before saving." },
  { Icon: IconBarChart, title: "Resolve & Track", desc: "Reply, update status, and close tickets with a resolution note." },
];

export default function Dashboard() {
  const { user } = useAuth();
  const isWorker = user?.role === "worker" || user?.role === "admin";
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!isWorker) {
      getTicketStats().then(setStats).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name} 👋</h1>
        <p>
          {isWorker
            ? "This is your worker workspace. Tickets assigned to you will appear here once ticket management goes live."
            : "This is your support dashboard — track every ticket you've submitted."}
        </p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-icon"><IconMail /></span>
          <div className="stat-card-body">
            <span className="stat-label">Account</span>
            <span className="stat-value">{user?.email}</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon"><IconBadge /></span>
          <div className="stat-card-body">
            <span className="stat-label">Role</span>
            <span className="stat-value stat-badge">{user?.role}</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon"><IconCalendar /></span>
          <div className="stat-card-body">
            <span className="stat-label">Member since</span>
            <span className="stat-value">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
            </span>
          </div>
        </div>
      </div>

      {!isWorker && (
        <>
          <h2 className="section-title">Your Tickets</h2>
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-icon"><IconTicket /></span>
              <div className="stat-card-body">
                <span className="stat-label">Total</span>
                <span className="stat-value">{stats ? stats.total : "—"}</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon" style={{ background: "rgba(var(--status-new-rgb), 0.14)", color: "var(--status-new)" }}><IconInbox /></span>
              <div className="stat-card-body">
                <span className="stat-label">Open</span>
                <span className="stat-value">
                  {stats ? stats.total - (stats.byStatus?.Resolved || 0) : "—"}
                </span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon" style={{ background: "rgba(var(--status-resolved-rgb), 0.14)", color: "var(--status-resolved)" }}><IconCheckCircle /></span>
              <div className="stat-card-body">
                <span className="stat-label">Resolved</span>
                <span className="stat-value">{stats ? stats.byStatus?.Resolved || 0 : "—"}</span>
              </div>
            </div>
          </div>

          <div className="cta-group dashboard-cta">
            <Link to="/tickets/new" className="btn-primary">+ Submit a Ticket</Link>
            <Link to="/tickets" className="btn-secondary">View My Tickets</Link>
          </div>
        </>
      )}

      {isWorker && (
        <>
          <h2 className="section-title">Coming Up</h2>
          <div className="features-grid">
            {WORKER_PREVIEW.map((a, i) => (
              <div className="feature-card" key={a.title} style={{ animationDelay: `${0.1 * i}s` }}>
                <span className="feature-icon"><a.Icon /></span>
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
