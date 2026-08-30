import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTickets, getTicketStats, getWorkerProfile } from "../utils/tickets";
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
  const { user } = useAuth();
  const [tickets, setTickets] = useState(null);
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  useEffect(() => {
    const loadProfile = () => {
      if (user?._id) getWorkerProfile(user._id).then(setProfile).catch(() => {});
    };
    getTickets()
      .then(setTickets)
      .catch((err) => setError(err.response?.data?.message || "Could not load tickets."));
    getTicketStats().then(setStats).catch(() => {});
    loadProfile();

    // Poll so a new ticket, claim, status change, or new review shows up here
    // without a manual refresh. Silent on failure.
    const interval = setInterval(() => {
      getTickets().then(setTickets).catch(() => {});
      getTicketStats().then(setStats).catch(() => {});
      loadProfile();
    }, 6000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

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

      <div className="vivid-stats-row">
        <div className="vivid-card c-teal">
          <span className="vivid-card-icon"><IconTicket /></span>
          <div className="vivid-card-value">{stats ? stats.total : "—"}</div>
          <div className="vivid-card-label">Total Tickets</div>
        </div>
        <div className="vivid-card c-blue">
          <span className="vivid-card-icon"><IconInbox /></span>
          <div className="vivid-card-value">{stats ? stats.byStatus?.New || 0 : "—"}</div>
          <div className="vivid-card-label">Unassigned</div>
        </div>
        <div className="vivid-card c-violet">
          <span className="vivid-card-icon"><IconHourglass /></span>
          <div className="vivid-card-value">{stats ? stats.byStatus?.Pending || 0 : "—"}</div>
          <div className="vivid-card-label">Waiting on Accept</div>
        </div>
        <div className="vivid-card c-amber">
          <span className="vivid-card-icon"><IconClock /></span>
          <div className="vivid-card-value">{stats ? stats.byStatus?.["In Progress"] || 0 : "—"}</div>
          <div className="vivid-card-label">In Progress</div>
        </div>
        <div className="vivid-card c-green">
          <span className="vivid-card-icon"><IconCheckCircle /></span>
          <div className="vivid-card-value">{stats ? stats.byStatus?.Resolved || 0 : "—"}</div>
          <div className="vivid-card-label">Completed</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main">
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

        <div className="dashboard-sidebar">
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

          <div className="sidebar-card">
            <h3>Your Rating</h3>
            {profile?.reviewCount ? (
              <>
                <div className="star-display">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={n <= Math.round(profile.avgRating) ? "star filled" : "star"}>★</span>
                  ))}
                </div>
                <p className="profile-meta" style={{ marginTop: 8, paddingTop: 0, border: "none" }}>
                  {profile.avgRating} average from {profile.reviewCount} review{profile.reviewCount === 1 ? "" : "s"} · {profile.resolvedCount} completed
                </p>
              </>
            ) : (
              <p className="profile-meta" style={{ paddingTop: 0, border: "none" }}>
                No reviews yet — customers can rate you after you finish a ticket.
              </p>
            )}
          </div>

          {profile?.reviews?.length > 0 && (
            <div className="sidebar-card">
              <h3>Recent Reviews</h3>
              {profile.reviews.map((r) => (
                <div className="review-card" key={r._id}>
                  <div className="review-card-title">{r.customer?.name || "Customer"}</div>
                  <div className="star-display">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className={n <= r.rating ? "star filled" : "star"}>★</span>
                    ))}
                  </div>
                  {r.comment && <p className="review-comment">"{r.comment}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
