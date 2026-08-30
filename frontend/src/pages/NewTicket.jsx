import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket, getMatchingWorkers } from "../utils/tickets";

const CATEGORIES = ["General", "Billing", "Technical", "Account", "Other"];

export default function NewTicket() {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const [workers, setWorkers] = useState(null);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Every time the category changes, fetch the workers who specialize in it —
  // this is what feels like an "AI recommending a match," but it's just a
  // straightforward backend query filtered by specialization.
  useEffect(() => {
    setLoadingWorkers(true);
    setSelectedWorker(null);
    getMatchingWorkers(category)
      .then(setWorkers)
      .catch(() => setWorkers([]))
      .finally(() => setLoadingWorkers(false));
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const ticket = await createTicket({ subject, description, category, preferredWorker: selectedWorker });
      navigate(`/tickets/${ticket._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit the ticket. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="dashboard-header">
        <h1>Submit a Ticket</h1>
        <p>Describe your issue and pick who should handle it.</p>
      </div>

      {error && <p className="error-text">{error}</p>}

      <form onSubmit={handleSubmit} className="ticket-form">
        <div className="form-group">
          <label className="field-label">Subject</label>
          <input
            className="field-input"
            type="text"
            placeholder="Short summary of the issue"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={150}
            required
          />
        </div>

        <div className="form-group">
          <label className="field-label">Description</label>
          <textarea
            className="field-textarea"
            placeholder="Explain what happened in as much detail as you can"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            maxLength={5000}
            required
          />
        </div>

        <div className="form-group">
          <label className="field-label">What is this about?</label>
          <select
            className="field-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="field-label">🎯 Suggested Workers for {category}</label>

          {loadingWorkers && (
            <div className="spinner-wrap small">
              <div className="spinner" />
            </div>
          )}

          {!loadingWorkers && workers && workers.length === 0 && (
            <p className="worker-match-empty">
              No worker currently specializes in {category} — your ticket will go to the open queue instead.
            </p>
          )}

          {!loadingWorkers && workers && workers.length > 0 && (
            <div className="worker-match-list">
              {workers.map((w) => (
                <button
                  type="button"
                  key={w._id}
                  className={`worker-match-card ${selectedWorker === w._id ? "selected" : ""}`}
                  onClick={() => setSelectedWorker(selectedWorker === w._id ? null : w._id)}
                >
                  <span className="worker-match-avatar">{w.name.charAt(0).toUpperCase()}</span>
                  <span className="worker-match-info">
                    <span className="worker-match-name">{w.name}</span>
                    <span className="worker-match-meta">
                      {w.specialization} specialist · {w.resolvedCount} resolved
                      {w.avgRating && <> · ⭐ {w.avgRating} ({w.reviewCount})</>}
                    </span>
                  </span>
                  {selectedWorker === w._id && <span className="worker-match-check">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit Ticket →"}
        </button>
      </form>
    </div>
  );
}
