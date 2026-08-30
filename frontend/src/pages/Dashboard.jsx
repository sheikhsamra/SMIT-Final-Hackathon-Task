import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTicketStats, getTickets, getWorkerProfile } from "../utils/tickets";
import DonutChart from "../components/DonutChart";
import ProfileCard from "../components/ProfileCard";
import { IconTicket, IconInbox, IconCheckCircle, IconSparkle } from "../components/Icons";

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
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (isWorker) {
      if (!user?._id) return;
      const load = () => getWorkerProfile(user._id).then(setProfile).catch(() => {});
      load();
      const interval = setInterval(load, 6000);
      return () => clearInterval(interval);
    }

    const load = () => {
      getTicketStats().then(setStats).catch(() => {});
      getTickets().then(setTickets).catch(() => {});
    };
    load();
    const interval = setInterval(load, 6000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWorker, user?._id]);

  if (isWorker) {
    return (
      <div className="page">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name} 👋</h1>
          <p>Your profile, performance, and customer reviews.</p>
        </div>

        <div className="vivid-stats-row">
          <div className="vivid-card c-teal">
            <span className="vivid-card-icon"><IconCheckCircle /></span>
            <div className="vivid-card-value">{profile ? profile.resolvedCount : "—"}</div>
            <div className="vivid-card-label">Tickets Completed</div>
          </div>
          <div className="vivid-card c-amber">
            <span className="vivid-card-icon"><IconSparkle /></span>
            <div className="vivid-card-value">{profile?.avgRating ?? "—"}</div>
            <div className="vivid-card-label">Average Rating</div>
          </div>
          <div className="vivid-card c-blue">
            <span className="vivid-card-icon"><IconInbox /></span>
            <div className="vivid-card-value">{profile ? profile.reviewCount : "—"}</div>
            <div className="vivid-card-label">Reviews Received</div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-main">
            <h2 className="section-title">Recent Reviews</h2>

            {profile && profile.reviews.length === 0 && (
              <div className="empty-state">
                <span className="empty-state-icon">⭐</span>
                <p>No reviews yet — customers can rate you after you finish a ticket.</p>
              </div>
            )}

            {profile && profile.reviews.length > 0 && (
              <div>
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

            <div className="cta-group dashboard-cta">
              <Link to="/worker" className="btn-primary">Go to Worker Dashboard</Link>
            </div>
          </div>

          <div className="dashboard-sidebar">
            <ProfileCard
              extraMeta={
                profile?.specialization && (
                  <div className="profile-meta" style={{ borderTop: "none", paddingTop: 0, marginTop: 4 }}>
                    Specializes in {profile.specialization}
                  </div>
                )
              }
            />
          </div>
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
