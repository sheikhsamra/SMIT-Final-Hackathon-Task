const SECTIONS = [
  {
    title: "What we collect",
    color: "sc-blue",
    body: "When you register, we store your name, email address, and a hashed version of your password (we never store or see your actual password). If you sign up as a worker, we also store your chosen specialization. When you use the app, we store the tickets, messages, and reviews you create so the platform can function.",
  },
  {
    title: "How we use it",
    color: "sc-teal",
    body: "Your information is used only to run the platform: matching tickets to workers, sending you in-app notifications, showing your name and rating on your public worker profile (workers only), and letting you and the other party on a ticket see each other's name in the conversation.",
  },
  {
    title: "What's on your device",
    color: "sc-amber",
    body: "We keep a login token and your basic profile in your browser's local storage so you stay signed in, and your dark/light theme preference. Clearing your browser data or logging out removes this. We don't use third-party tracking or advertising cookies.",
  },
  {
    title: "Who can see what",
    color: "sc-violet",
    body: "A customer only ever sees their own tickets. A worker sees tickets in their category plus any assigned to them. Reviews are public on a worker's profile once submitted. An admin account can see aggregate counts across all users and tickets, not private message contents beyond a ticket they'd otherwise have access to.",
  },
  {
    title: "Sharing with third parties",
    color: "sc-rose",
    body: "We don't sell or share your data with advertisers or data brokers. If AI-assisted ticket triage is enabled, the ticket's subject and description are sent to Anthropic's Claude API solely to suggest a category and priority — no other personal data is included in that request.",
  },
  {
    title: "Your choices",
    color: "sc-blue",
    body: "You can delete a ticket yourself while it's still New or Pending. For any other request about your data — access, correction, or deletion — reach out to the team running this instance of RelaySupport.",
  },
];

export default function Privacy() {
  return (
    <div className="page wide-page">
      <div className="dashboard-header">
        <h1 className="wide-page-title">Privacy Policy</h1>
        <p>What we collect, why, and what you control.</p>
      </div>

      <div className="about-content">
        <p>
          RelaySupport is a support-ticket platform built for a hackathon demo. This page explains,
          in plain language, exactly what data the app stores and how it's used — no legal
          boilerplate, just what actually happens in the code.
        </p>
      </div>

      <div className="policy-list">
        {SECTIONS.map((s) => (
          <div className={`policy-card ${s.color}`} key={s.title}>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
