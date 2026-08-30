import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTickets, getTicketStats } from "../utils/tickets";
import DonutChart from "../components/DonutChart";
import { IconTicket, IconInbox, IconClock, IconCheckCircle, IconHourglass } from "../components/Icons";

const STATUS_FILTERS = ["All", "New", "Pending", "Assigned", "In Progress", "Resolved", "Rejected"];
const PRIORITY_FILTERS = ["All", "High", "Medium", "Low"];

const STATUS_COLORS = {
  New: "var(--status-new)",
  Pending: "var(--status-pending)",
  Assigned: "var(--status-assigned)",
  "In Progress": "var(--status-progress)",
  Resolved: "var(--status-resolved)",
  Rejected: "var(--status-rejected)",
};

export default function WorkerDashboard() {
  const [tickets, setTickets] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  useEffect(() => {
    getTickets()
      .then(setTickets)
      .catch((err) => setError(err.response?.data?.message || "Could not load tickets."));
    getTicketStats().then(setStats).catch(() => {});

    // Poll so a new ticket, claim, or status change from another worker shows
    // up here without a manual refresh. Silent on failure.
    const interval = setInterval(() => {
      getTickets().then(setTickets).catch(() => {});
      getTicketStats().then(setStats).catch(() => {});
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const filtered = (tickets || []).filter(
    (t) =>
      (statusFilter === "All" || t.status === statusFilter) &&
      (priorityFilter === "All" || t.priority === priorityFilter)
  );

  return (
    <div className="page">
      <div className="dashboard-header">
        <h1>Worker Dashboard</h1>
        <p>All incoming tickets, sorted by newest first. <span className="live-indicator"><span className="live-dot" />Live</span></p>
      </div>

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
            <span className="stat-label">Unassigned (New)</span>
            <span className="stat-value">{stats ? stats.byStatus?.New || 0 : "—"}</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon" style={{ background: "rgba(var(--status-pending-rgb), 0.14)", color: "var(--status-pending)" }}><IconHourglass /></span>
          <div className="stat-card-body">
            <span className="stat-label">Waiting on Accept</span>
            <span className="stat-value">{stats ? stats.byStatus?.Pending || 0 : "—"}</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon" style={{ background: "rgba(var(--status-progress-rgb), 0.14)", color: "var(--status-progress)" }}><IconClock /></span>
          <div className="stat-card-body">
            <span className="stat-label">In Progress</span>
            <span className="stat-value">{stats ? stats.byStatus?.["In Progress"] || 0 : "—"}</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon" style={{ background: "rgba(var(--status-resolved-rgb), 0.14)", color: "var(--status-resolved)" }}><IconCheckCircle /></span>
          <div className="stat-card-body">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{stats ? stats.byStatus?.Resolved || 0 : "—"}</span>
          </div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3>Ticket Status Breakdown</h3>
          <DonutChart
            data={Object.keys(STATUS_COLORS).map((status) => ({
              label: status,
              value: stats?.byStatus?.[status] || 0,
              color: STATUS_COLORS[status],
            }))}
          />
        </div>
      </div>

      <div className="ticket-filters">
        <select className="field-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>{s === "All" ? "All statuses" : s}</option>
          ))}
        </select>
        <select className="field-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          {PRIORITY_FILTERS.map((p) => (
            <option key={p} value={p}>{p === "All" ? "All priorities" : p}</option>
          ))}
        </select>
      </div>

      {error && <p className="error-text">{error}</p>}

      {!tickets && !error && (
        <div className="spinner-wrap">
          <div className="spinner" />
        </div>
      )}

      {tickets && filtered.length === 0 && (
        <div className="empty-state">
          <span className="empty-state-icon">📭</span>
          <p>No tickets match these filters.</p>
        </div>
      )}

      {tickets && filtered.length > 0 && (
        <div className="ticket-list">
          {filtered.map((t) => (
            <Link to={`/tickets/${t._id}`} className="ticket-card" key={t._id}>
              <div className="ticket-card-main">
                <span className="ticket-number">
                  {t.ticketNumber} · {t.customer?.name || "Unknown customer"}
                </span>
                <h3>{t.subject}</h3>
                {!t.assignedWorker && <span className="unassigned-tag">Unassigned</span>}
                {t.assignedWorker && <span className="ticket-number">Worker: {t.assignedWorker.name}</span>}
              </div>
              <div className="ticket-card-badges">
                <span className="badge-priority" data-priority={t.priority}>{t.priority}</span>
                <span className="badge-status" data-status={t.status}>{t.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
