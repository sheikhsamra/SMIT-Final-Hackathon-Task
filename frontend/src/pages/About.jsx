export default function About() {
  return (
    <div className="page">
      <div className="dashboard-header">
        <h1>About Relay</h1>
        <p>A faster, more transparent way to run customer support.</p>
      </div>

      <div className="about-content">
        <p>
          Relay is an AI-assisted support desk that connects customers directly with the
          right worker for their issue — no waiting in a generic queue. When a ticket comes
          in, our system reads it, suggests a category and priority, and shows the customer
          a shortlist of specialists who can help, ranked by experience and rating.
        </p>
        <p>
          Every step of the journey — booking, acceptance, conversation, resolution, and
          review — is tracked in real time, so nothing gets lost and nobody is left
          wondering what happens next.
        </p>

        <div className="about-grid">
          <div className="about-card">
            <h3>Our Mission</h3>
            <p>Make support feel personal again — fast matching, clear communication, real accountability.</p>
          </div>
          <div className="about-card">
            <h3>How It Works</h3>
            <p>Submit a ticket → get matched with a worker → chat and track progress → rate the experience.</p>
          </div>
          <div className="about-card">
            <h3>Built For</h3>
            <p>Teams who want a lightweight, modern alternative to bloated legacy helpdesk software.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
