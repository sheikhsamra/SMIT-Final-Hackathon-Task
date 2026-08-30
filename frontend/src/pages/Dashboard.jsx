import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTicketStats, getTickets } from "../utils/tickets";
import DonutChart from "../components/DonutChart";
import { IconTicket, IconInbox, IconCheckCircle, IconSparkle, IconBarChart } from "../components/Icons";

const WORKER_PREVIEW = [
  { Icon: IconInbox, title: "Assigned Tickets", desc: "Review tickets routed to you, sorted by AI-suggested priority." },
  { Icon: IconSparkle, title: "AI Suggestions", desc: "Approve or edit the AI's category, priority, and summary before saving." },
  { Icon: IconBarChart, title: "Resolve & Track", desc: "Reply, update status, and close tickets with a resolution note." },
];

const STATUS_COLORS = {
  New: "var(--status-new)",
  Pending: "var(--status-pending)",
  Assigned: "var(--status-assigned)",
  "In Progress": "var(--status-progress)",
  Resolved: "var(--status-resolved)",
  Rejected: "var(--status-rejected)",
};

export default function Dashboard() {
  const { user } = useAuth();
  const isWorker = user?.role === "worker" || user?.role === "admin";
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState(null);

  useEffect(() => {
    if (!isWorker) {
      const load = () => {
        getTicketStats().then(setStats).catch(() => {});
        getTickets().then(setTickets).catch(() => {});
      };
      load();
      const interval = setInterval(load, 6000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isWorker) {
    return (
      <div className="page">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name} 👋</h1>
          <p>This is your worker workspace. Tickets assigned to you will appear here once ticket management goes live.</p>
        </div>
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
      </div>
    );
  }

  const open = stats ? stats.total - (stats.byStatus?.Resolved || 0) : null;

  return (
    <div className="page">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name} 👋</h1>
        <p>This is your support dashboard — track every ticket you've submitted.</p>
      </div>

      <div className="vivid-stats-row">
        <div className="vivid-card c-teal">
          <span className="vivid-card-icon"><IconTicket /></span>
          <div className="vivid-card-value">{stats ? stats.total : "—"}</div>
          <div className="vivid-card-label">Total Tickets</div>
        </div>
        <div className="vivid-card c-blue">
          <span className="vivid-card-icon"><IconInbox /></span>
          <div className="vivid-card-value">{open ?? "—"}</div>
          <div className="vivid-card-label">Open</div>
        </div>
        <div className="vivid-card c-green">
          <span className="vivid-card-icon"><IconCheckCircle /></span>
          <div className="vivid-card-value">{stats ? stats.byStatus?.Resolved || 0 : "—"}</div>
          <div className="vivid-card-label">Resolved</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <h2 className="section-title">Recent Complaints</h2>

          {tickets && tickets.length === 0 && (
            <div className="empty-state">
              <span className="empty-state-icon">🎫</span>
              <p>You haven't submitted any tickets yet.</p>
            </div>
          )}

          {tickets && tickets.length > 0 && (
            <div className="ticket-list">
              {tickets.slice(0, 5).map((t) => (
                <Link to={`/tickets/${t._id}`} className="ticket-card" key={t._id}>
                  <div className="ticket-card-main">
                    <span className="ticket-number">{t.ticketNumber}</span>
                    <h3>{t.subject}</h3>
                  </div>
                  <div className="ticket-card-badges">
                    <span className="badge-priority" data-priority={t.priority}>{t.priority}</span>
                    <span className="badge-status" data-status={t.status}>{t.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="cta-group dashboard-cta">
            <Link to="/tickets/new" className="btn-primary">+ Submit a Ticket</Link>
            <Link to="/tickets" className="btn-secondary">View All Tickets</Link>
          </div>
        </div>

        <div className="dashboard-sidebar">
          <div className="sidebar-card profile-card">
            <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="profile-name">{user?.name}</div>
            <div className="profile-email">{user?.email}</div>
            <span className="stat-badge">{user?.role}</span>
            <div className="profile-meta">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
            </div>
          </div>

          {stats && stats.total > 0 && (
            <div className="sidebar-card">
              <h3>Status Breakdown</h3>
              <DonutChart
                size={120}
                thickness={14}
                data={Object.keys(STATUS_COLORS).map((status) => ({
                  label: status,
                  value: stats.byStatus?.[status] || 0,
                  color: STATUS_COLORS[status],
                }))}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
