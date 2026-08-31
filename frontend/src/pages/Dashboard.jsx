import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTicketStats, getTickets } from "../utils/tickets";
import DonutChart from "../components/DonutChart";
import ProfileCard from "../components/ProfileCard";
import { IconTicket, IconInbox, IconCheckCircle } from "../components/Icons";

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
    if (isWorker) return;
    const load = () => {
      getTicketStats().then(setStats).catch(() => {});
      getTickets().then(setTickets).catch(() => {});
    };
    load();
    const interval = setInterval(load, 6000);
    return () => clearInterval(interval);
  }, [isWorker]);

  // Workers/admins manage everything (profile, reviews, tickets) from the
  // Worker Dashboard now — this page is customer-only.
  if (isWorker) {
    return <Navigate to="/worker" replace />;
  }

  const open = stats ? stats.total - (stats.byStatus?.Resolved || 0) : null;

  return (
    <div className="page wide-page">
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
          <ProfileCard />

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
