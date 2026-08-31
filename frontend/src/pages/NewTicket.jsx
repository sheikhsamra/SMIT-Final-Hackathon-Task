import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket, getMatchingWorkers, getWorkerProfile } from "../utils/tickets";
import { IconStar, IconChevronDown, IconSparkle } from "../components/Icons";

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

  // Reviews are fetched on demand (only when a customer expands "View
  // Reviews" for a specific worker) and cached by worker id so re-opening
  // doesn't refetch.
  const [expandedWorkerId, setExpandedWorkerId] = useState(null);
  const [reviewsByWorker, setReviewsByWorker] = useState({});
  const [loadingReviewsFor, setLoadingReviewsFor] = useState(null);

  const toggleReviews = async (workerId) => {
    if (expandedWorkerId === workerId) {
      setExpandedWorkerId(null);
      return;
    }
    setExpandedWorkerId(workerId);
    if (reviewsByWorker[workerId]) return;
    setLoadingReviewsFor(workerId);
    try {
      const profile = await getWorkerProfile(workerId);
      setReviewsByWorker((prev) => ({ ...prev, [workerId]: profile.reviews || [] }));
    } catch {
      setReviewsByWorker((prev) => ({ ...prev, [workerId]: [] }));
    } finally {
      setLoadingReviewsFor(null);
    }
  };

  // Every time the category changes, fetch the workers who specialize in it —
  // this is what feels like an "AI recommending a match," but it's just a
  // straightforward backend query filtered by specialization.
  useEffect(() => {
    setLoadingWorkers(true);
    setSelectedWorker(null);
    setExpandedWorkerId(null);
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
    <div className="page wide-page">
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
          <label className="field-label"><IconSparkle /> Suggested Workers for {category}</label>

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
              {workers.map((w) => {
                const isExpanded = expandedWorkerId === w._id;
                const reviews = reviewsByWorker[w._id];
                return (
                  <div className={`worker-match-wrap ${isExpanded ? "expanded" : ""}`} key={w._id}>
                    <button
                      type="button"
                      className={`worker-match-card ${selectedWorker === w._id ? "selected" : ""}`}
                      onClick={() => setSelectedWorker(selectedWorker === w._id ? null : w._id)}
                    >
                      <span className="worker-match-avatar">{w.name.charAt(0).toUpperCase()}</span>
                      <span className="worker-match-info">
                        <span className="worker-match-name">{w.name}</span>
                        <span className="worker-match-meta">
                          {w.specialization} specialist · {w.resolvedCount} resolved
                          {w.avgRating && <> · <IconStar /> {w.avgRating} ({w.reviewCount})</>}
                        </span>
                      </span>
                      {selectedWorker === w._id && <span className="worker-match-check">✓</span>}
                    </button>

                    <button
                      type="button"
                      className="worker-match-reviews-toggle"
                      onClick={() => toggleReviews(w._id)}
                    >
                      {isExpanded ? "Hide reviews" : `View reviews${w.reviewCount ? ` (${w.reviewCount})` : ""}`}
                      <span className="faq-chevron"><IconChevronDown /></span>
                    </button>

                    {isExpanded && (
                      <div className="worker-match-reviews">
                        {loadingReviewsFor === w._id && (
                          <div className="spinner-wrap small">
                            <div className="spinner" />
                          </div>
                        )}
                        {loadingReviewsFor !== w._id && reviews && reviews.length === 0 && (
                          <p className="worker-match-empty">No reviews yet for {w.name}.</p>
                        )}
                        {loadingReviewsFor !== w._id && reviews && reviews.length > 0 && (
                          reviews.map((r) => (
                            <div className="review-card" key={r._id}>
                              <div className="review-card-title">{r.customer?.name || "Customer"}</div>
                              <div className="star-display">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <span key={n} className={n <= r.rating ? "star filled" : "star"}>★</span>
                                ))}
                              </div>
                              {r.comment && <p className="review-comment">"{r.comment}"</p>}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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
