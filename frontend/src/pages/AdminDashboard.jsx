import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminOverview } from "../utils/admin";
import DonutChart from "../components/DonutChart";
import { IconUsers, IconUser, IconBriefcase, IconShield } from "../components/Icons";

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
  const [error, setError] = useState("");

  useEffect(() => {
    const load = () => getAdminOverview().then(setOverview).catch((err) => setError(err.response?.data?.message || "Could not load overview."));
    load();
    const interval = setInterval(() => {
      getAdminOverview().then(setOverview).catch(() => {});
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page">
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

          <div className="cta-group dashboard-cta">
            <Link to="/worker" className="btn-primary">Manage Tickets →</Link>
          </div>
        </>
      )}
    </div>
  );
}
