const SERVICES = [
  { icon: "💳", title: "Billing", desc: "Refunds, duplicate charges, invoices, and subscription questions." },
  { icon: "🛠️", title: "Technical", desc: "Bugs, crashes, errors, and anything that isn't working as expected." },
  { icon: "🔐", title: "Account", desc: "Login issues, password resets, and account access problems." },
  { icon: "💬", title: "General", desc: "Anything that doesn't fit the categories above — we'll route it right." },
  { icon: "📦", title: "Other", desc: "One-off requests handled by whichever specialist is the best fit." },
];

export default function Services() {
  return (
    <div className="page">
      <div className="dashboard-header">
        <h1>Services</h1>
        <p>Every ticket is matched to a worker who specializes in exactly this.</p>
      </div>

      <div className="features-grid">
        {SERVICES.map((s, i) => (
          <div className="feature-card" key={s.title} style={{ animationDelay: `${0.08 * i}s` }}>
            <span className="feature-icon">{s.icon}</span>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
