import { useAuth } from "../context/AuthContext";

const QUICK_ACTIONS = [
  { icon: "📝", title: "Start a new feature", desc: "Add your hackathon idea's first page here." },
  { icon: "🗄️", title: "Connect a model", desc: "Add a Mongoose schema in backend/models." },
  { icon: "🔗", title: "Wire an API route", desc: "Add an Express route in backend/routes." },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="page">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name} 👋</h1>
        <p>This is a protected page — visible only after logging in. Start building your hackathon feature from here.</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">Account</span>
          <span className="stat-value">{user?.email}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Role</span>
          <span className="stat-value stat-badge">{user?.role || "user"}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Member since</span>
          <span className="stat-value">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
          </span>
        </div>
      </div>

      <h2 className="section-title">Quick Actions</h2>
      <div className="features-grid">
        {QUICK_ACTIONS.map((a, i) => (
          <div className="feature-card" key={a.title} style={{ animationDelay: `${0.1 * i}s` }}>
            <span className="feature-icon">{a.icon}</span>
            <h3>{a.title}</h3>
            <p>{a.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
