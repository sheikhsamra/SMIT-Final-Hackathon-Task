import { useEffect, useState } from "react";
import { getAdminOverview, getAdminUsers, getAdminWarnings, blockUser, unblockUser, warnUser } from "../utils/admin";
import DonutChart from "../components/DonutChart";
import { IconUsers, IconUser, IconBriefcase, IconShield, IconAlertTriangle } from "../components/Icons";

const ROLE_FILTERS = ["All", "customer", "worker", "admin"];
const ROLE_LABELS = { All: "All", customer: "Customers", worker: "Workers", admin: "Admins" };

const STATUS_COLORS = {
  New: "var(--status-new)",
  Pending: "var(--status-pending)",
  Assigned: "var(--status-assigned)",
  "In Progress": "var(--status-progress)",
  Resolved: "var(--status-resolved)",
  Rejected: "var(--status-rejected)",
};

const PRIORITY_COLORS = {
  High: "var(--priority-high)",
  Medium: "var(--priority-medium)",
  Low: "var(--priority-low)",
};

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState(null);
  const [warnings, setWarnings] = useState(null);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [warnTarget, setWarnTarget] = useState(null);
  const [warnMessage, setWarnMessage] = useState("");
  const [warnSubmitting, setWarnSubmitting] = useState(false);
  const [warnError, setWarnError] = useState("");

  const loadUsers = () => getAdminUsers().then(setUsers).catch(() => {});
  const loadWarnings = () => getAdminWarnings().then(setWarnings).catch(() => {});

  useEffect(() => {
    const load = () => {
      getAdminOverview().then(setOverview).catch((err) => setError(err.response?.data?.message || "Could not load overview."));
      loadUsers();
      loadWarnings();
    };
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = (users || []).filter((u) => roleFilter === "All" || u.role === roleFilter);

  const handleBlock = async (u) => {
    if (!window.confirm(`Block ${u.name}? They won't be able to log in until you unblock them.`)) return;
    setActionLoadingId(u._id);
    setActionError("");
    try {
      await blockUser(u._id);
      await loadUsers();
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not block this user.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnblock = async (u) => {
    setActionLoadingId(u._id);
    setActionError("");
    try {
      await unblockUser(u._id);
      await loadUsers();
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not unblock this user.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const openWarnModal = (u) => {
    setWarnTarget(u);
    setWarnMessage("");
    setWarnError("");
  };

  const closeWarnModal = () => {
    if (warnSubmitting) return;
    setWarnTarget(null);
  };

  const submitWarn = async (e) => {
    e.preventDefault();
    if (!warnMessage.trim() || !warnTarget) return;
    setWarnSubmitting(true);
    setWarnError("");
    try {
      await warnUser(warnTarget._id, warnMessage.trim());
      setWarnTarget(null);
      loadWarnings();
    } catch (err) {
      setWarnError(err.response?.data?.message || "Could not send the warning.");
    } finally {
      setWarnSubmitting(false);
    }
  };

  return (
    <div className="page wide-page">
      <div className="dashboard-header">
        <h1>Admin Overview</h1>
        <p>System-wide stats across every customer and worker. <span className="live-indicator"><span className="live-dot" />Live</span></p>
      </div>

      {error && <p className="error-text">{error}</p>}

      {!overview && !error && (
        <div className="spinner-wrap">
          <div className="spinner" />
        </div>
      )}

      {overview && (
        <>
          <h2 className="section-title">Users</h2>
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-icon"><IconUsers /></span>
              <div className="stat-card-body">
                <span className="stat-label">Total Users</span>
                <span className="stat-value">{overview.users.total}</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon" style={{ background: "rgba(var(--status-new-rgb), 0.14)", color: "var(--status-new)" }}><IconUser /></span>
              <div className="stat-card-body">
                <span className="stat-label">Customers</span>
                <span className="stat-value">{overview.users.byRole?.customer || 0}</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon" style={{ background: "rgba(var(--accent-2-rgb), 0.14)", color: "var(--accent-2)" }}><IconBriefcase /></span>
              <div className="stat-card-body">
                <span className="stat-label">Workers</span>
                <span className="stat-value">{overview.users.byRole?.worker || 0}</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon" style={{ background: "rgba(var(--priority-medium-rgb), 0.14)", color: "var(--priority-medium)" }}><IconShield /></span>
              <div className="stat-card-body">
                <span className="stat-label">Admins</span>
                <span className="stat-value">{overview.users.byRole?.admin || 0}</span>
              </div>
            </div>
          </div>

          <h2 className="section-title">Tickets</h2>
          <div className="charts-row">
            <div className="chart-card">
              <h3>By Status</h3>
              <DonutChart
                data={Object.keys(STATUS_COLORS).map((status) => ({
                  label: status,
                  value: overview.tickets.byStatus?.[status] || 0,
                  color: STATUS_COLORS[status],
                }))}
              />
            </div>
            <div className="chart-card">
              <h3>By Priority</h3>
              <DonutChart
                data={Object.keys(PRIORITY_COLORS).map((priority) => ({
                  label: priority,
                  value: overview.tickets.byPriority?.[priority] || 0,
                  color: PRIORITY_COLORS[priority],
                }))}
              />
            </div>
          </div>

          <div className="admin-users-header">
            <h2 className="section-title">All Users</h2>
            <div className="admin-role-filters">
              {ROLE_FILTERS.map((r) => (
                <button
                  type="button"
                  key={r}
                  className={`admin-role-filter-btn ${roleFilter === r ? "active" : ""}`}
                  onClick={() => setRoleFilter(r)}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          {!users && (
            <div className="spinner-wrap">
              <div className="spinner" />
            </div>
          )}

          {users && filteredUsers.length === 0 && (
            <div className="empty-state">
              <span className="empty-state-icon">👥</span>
              <p>No {ROLE_LABELS[roleFilter].toLowerCase()} yet.</p>
            </div>
          )}

          {actionError && <p className="error-text">{actionError}</p>}

          {users && filteredUsers.length > 0 && (
            <div className="admin-user-list">
              {filteredUsers.map((u) => (
                <div className={`admin-user-row ${u.isBlocked ? "blocked" : ""}`} key={u._id}>
                  <span
                    className="admin-user-avatar"
                    style={u.avatar ? { backgroundImage: `url(${u.avatar})` } : undefined}
                  >
                    {!u.avatar && u.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="admin-user-info">
                    <span className="admin-user-name">
                      {u.name}
                      {u.isBlocked && <span className="admin-blocked-tag">Blocked</span>}
                    </span>
                    <span className="admin-user-email">{u.email}</span>
                  </div>
                  <span className={`profile-role-badge role-${u.role}`}>{u.role}</span>
                  <div className="admin-user-stat">
                    {u.role === "customer" && (
                      <span>{u.ticketCount} ticket{u.ticketCount === 1 ? "" : "s"} submitted</span>
                    )}
                    {u.role === "worker" && (
                      <span>
                        {u.specialization} · {u.resolvedCount} resolved
                        {u.avgRating && <> · <span className="worker-match-star">★</span> {u.avgRating} ({u.reviewCount})</>}
                      </span>
                    )}
                    {u.role === "admin" && <span>Administrator</span>}
                  </div>

                  {u.role !== "admin" && (
                    <div className="admin-user-actions">
                      <button
                        type="button"
                        className="admin-action-btn warn"
                        onClick={() => openWarnModal(u)}
                      >
                        Warn
                      </button>
                      {u.isBlocked ? (
                        <button
                          type="button"
                          className="admin-action-btn unblock"
                          onClick={() => handleUnblock(u)}
                          disabled={actionLoadingId === u._id}
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="admin-action-btn block"
                          onClick={() => handleBlock(u)}
                          disabled={actionLoadingId === u._id}
                        >
                          Block
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <h2 className="section-title">Warning History</h2>
          {warnings && warnings.length === 0 && (
            <div className="empty-state">
              <span className="empty-state-icon">✅</span>
              <p>No warnings have been sent yet.</p>
            </div>
          )}

          {warnings && warnings.length > 0 && (
            <div className="admin-warning-list">
              {warnings.map((w) => (
                <div className="admin-warning-row" key={w._id}>
                  <span className="admin-warning-icon"><IconAlertTriangle /></span>
                  <div className="admin-warning-body">
                    <div className="admin-warning-top">
                      <span className="admin-warning-recipient">
                        {w.user?.name || "Deleted user"}
                        {w.user?.email && <span className="admin-user-email"> · {w.user.email}</span>}
                      </span>
                      <span className="admin-warning-time">{new Date(w.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="admin-warning-message">{w.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {warnTarget && (
        <div className="modal-overlay" onClick={closeWarnModal}>
          <div className="modal-content warn-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeWarnModal}>&times;</button>
            <form className="warn-modal-card" onSubmit={submitWarn}>
              <span className="warn-modal-icon"><IconAlertTriangle /></span>
              <h2>Warn {warnTarget.name}</h2>
              <p>This sends them a notification with your message — they'll see it as soon as they're online.</p>
              <textarea
                className="field-textarea"
                placeholder="e.g. Please respond to customer tickets faster."
                value={warnMessage}
                onChange={(e) => setWarnMessage(e.target.value)}
                rows={4}
                maxLength={500}
                autoFocus
              />
              {warnError && <p className="error-text">{warnError}</p>}
              <div className="cta-group">
                <button type="submit" className="btn-primary" disabled={!warnMessage.trim() || warnSubmitting}>
                  {warnSubmitting ? "Sending…" : "Send Warning"}
                </button>
                <button type="button" className="btn-secondary" onClick={closeWarnModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
