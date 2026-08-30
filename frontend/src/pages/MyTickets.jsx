import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTickets } from "../utils/tickets";

export default function MyTickets() {
  const [tickets, setTickets] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getTickets()
      .then(setTickets)
      .catch((err) => setError(err.response?.data?.message || "Could not load your tickets."));

    // Poll so a status change (e.g. a worker resolving a ticket) shows up
    // here without a manual refresh. Silent on failure — a missed poll
    // shouldn't replace the list with an error.
    const interval = setInterval(() => {
      getTickets().then(setTickets).catch(() => {});
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page">
      <div className="dashboard-header">
        <h1>My Tickets</h1>
        <p>Track the status of every issue you've submitted. <span className="live-indicator"><span className="live-dot" />Live</span></p>
      </div>

      <Link to="/tickets/new" className="btn-primary ticket-list-cta">
        + New Ticket
      </Link>

      {error && <p className="error-text">{error}</p>}

      {!tickets && !error && (
        <div className="spinner-wrap">
          <div className="spinner" />
        </div>
      )}

      {tickets && tickets.length === 0 && (
        <div className="empty-state">
          <span className="empty-state-icon">🎫</span>
          <p>You haven't submitted any tickets yet.</p>
        </div>
      )}

      {tickets && tickets.length > 0 && (
        <div className="ticket-list">
          {tickets.map((t) => (
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
    </div>
  );
}
