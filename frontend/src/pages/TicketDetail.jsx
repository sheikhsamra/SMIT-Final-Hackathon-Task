import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getTicket,
  getMessages,
  sendMessage,
  assignTicket,
  updateTicketStatus,
  updateTicketDetails,
  reopenTicket,
  runAiTriage,
  acceptTicket,
  rejectTicket,
  getTicketReview,
  submitReview,
  deleteTicket,
} from "../utils/tickets";

const CATEGORIES = ["General", "Billing", "Technical", "Account", "Other"];
const PRIORITIES = ["Low", "Medium", "High"];
const DELETABLE_STATUSES = ["New", "Pending"];

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const [category, setCategory] = useState("General");
  const [priority, setPriority] = useState("Medium");
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const [resolutionNoteInput, setResolutionNoteInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const [triaging, setTriaging] = useState(false);
  const [triageError, setTriageError] = useState("");

  const [review, setReview] = useState(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const isWorkerRole = user?.role === "worker" || user?.role === "admin";

  const loadTicket = () => {
    setError("");
    Promise.all([getTicket(id), getMessages(id), getTicketReview(id)])
      .then(([ticketData, messagesData, reviewData]) => {
        setTicket(ticketData);
        setMessages(messagesData);
        setCategory(ticketData.category);
        setPriority(ticketData.priority);
        setReview(reviewData);
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load this ticket."));
  };

  // Background refresh — polled every few seconds so a reply or status change
  // from the other side shows up without a manual page refresh. Deliberately
  // silent on failure (a missed poll shouldn't blow away what's on screen),
  // and never touches the category/priority inputs so it can't clobber an
  // worker mid-edit.
  const pollTicket = () => {
    Promise.all([getTicket(id), getMessages(id), getTicketReview(id)])
      .then(([ticketData, messagesData, reviewData]) => {
        setTicket(ticketData);
        setMessages(messagesData);
        setReview(reviewData);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadTicket();
    const interval = setInterval(pollTicket, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    setSendError("");
    try {
      const message = await sendMessage(id, reply);
      setMessages((prev) => [...prev, message]);
      setReply("");
      if (isWorkerRole) loadTicket(); // status may auto-advance to "In Progress"
    } catch (err) {
      setSendError(err.response?.data?.message || "Could not send your message.");
    } finally {
      setSending(false);
    }
  };

  const runAction = async (fn) => {
    setActionLoading(true);
    setActionError("");
    try {
      const updated = await fn();
      setTicket(updated);
    } catch (err) {
      setActionError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClaim = () => runAction(() => assignTicket(id));
  const handleAccept = () => runAction(() => acceptTicket(id));
  const handleReject = () => {
    if (!window.confirm("Reject this booking? This cannot be undone.")) return;
    runAction(() => rejectTicket(id));
  };
  const handleMarkInProgress = () => runAction(() => updateTicketStatus(id, "In Progress"));
  const handleReopen = () => runAction(() => reopenTicket(id));

  const handleResolve = (e) => {
    e.preventDefault();
    if (!resolutionNoteInput.trim()) return;
    runAction(() => updateTicketStatus(id, "Resolved", resolutionNoteInput)).then(() =>
      setResolutionNoteInput("")
    );
  };

  const handleRunTriage = async () => {
    setTriaging(true);
    setTriageError("");
    try {
      const updated = await runAiTriage(id);
      setTicket(updated);
    } catch (err) {
      setTriageError(err.response?.data?.message || "AI triage failed.");
    } finally {
      setTriaging(false);
    }
  };

  const handleApplySuggestion = () => {
    if (!ticket.aiSuggestion) return;
    if (ticket.aiSuggestion.category) setCategory(ticket.aiSuggestion.category);
    if (ticket.aiSuggestion.priority) setPriority(ticket.aiSuggestion.priority);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this ticket? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteTicket(id);
      navigate("/tickets");
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not delete this ticket.");
      setDeleting(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewError("");
    try {
      const created = await submitReview(id, ratingInput, commentInput);
      setReview(created);
    } catch (err) {
      setReviewError(err.response?.data?.message || "Could not submit your review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setSavingDetails(true);
    setDetailsError("");
    try {
      const updated = await updateTicketDetails(id, { category, priority });
      setTicket(updated);
    } catch (err) {
      setDetailsError(err.response?.data?.message || "Could not save changes.");
    } finally {
      setSavingDetails(false);
    }
  };

  if (error) {
    return (
      <div className="page">
        <p className="error-text">{error}</p>
        <Link to={isWorkerRole ? "/worker" : "/tickets"} className="btn-secondary">← Back</Link>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="page">
        <div className="spinner-wrap">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  const isResolved = ticket.status === "Resolved";
  const isPending = ticket.status === "Pending";
  const isRejected = ticket.status === "Rejected";
  const isMine = ticket.assignedWorker?._id === user?._id;
  const canManage = isWorkerRole && (user.role === "admin" || !ticket.assignedWorker || isMine);
  const canManageNow = canManage && !isPending && !isResolved && !isRejected;
  const isMyResolvedTicket = isResolved && user?.role === "customer" && ticket.customer?._id === user?._id;
  const isMyTicket = user?.role === "customer" && ticket.customer?._id === user?._id;
  const canDelete = isMyTicket && DELETABLE_STATUSES.includes(ticket.status);

  return (
    <div className="page">
      <Link to={isWorkerRole ? "/worker" : "/tickets"} className="back-link">
        ← Back to {isWorkerRole ? "Worker Dashboard" : "My Tickets"}
      </Link>

      <div className="ticket-detail-header">
        <div>
          <span className="ticket-number">{ticket.ticketNumber}</span>
          <h1>{ticket.subject}</h1>
        </div>
        <div className="ticket-card-badges">
          <span className="badge-priority" data-priority={ticket.priority}>{ticket.priority}</span>
          <span className="badge-status" data-status={ticket.status}>{ticket.status}</span>
          {canDelete && (
            <button type="button" className="btn-secondary reject-btn" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "🗑️ Delete"}
            </button>
          )}
        </div>
      </div>

      <div className="ticket-meta">
        <span>Category: {ticket.category}</span>
        <span>Customer: {ticket.customer?.name}</span>
        <span>Opened: {new Date(ticket.createdAt).toLocaleString()}</span>
        {ticket.assignedWorker && <span>Worker: {ticket.assignedWorker.name}</span>}
      </div>

      <div className="ticket-description-card">
        <p>{ticket.description}</p>
      </div>

      {ticket.resolutionNote && (
        <div className="resolution-note">
          <strong>Resolution:</strong> {ticket.resolutionNote}
        </div>
      )}

      {review && (
        <div className="review-card">
          <div className="review-card-title">⭐ Customer Review</div>
          <div className="star-display">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={n <= review.rating ? "star filled" : "star"}>★</span>
            ))}
          </div>
          {review.comment && <p className="review-comment">"{review.comment}"</p>}
        </div>
      )}

      {isMyResolvedTicket && !review && (
        <form onSubmit={handleSubmitReview} className="review-form">
          <label className="field-label">Rate this worker</label>
          <div className="star-picker">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                className={n <= ratingInput ? "star filled" : "star"}
                onClick={() => setRatingInput(n)}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            className="field-textarea"
            placeholder="Optional comment about your experience…"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            rows={2}
            maxLength={1000}
          />
          {reviewError && <p className="error-text">{reviewError}</p>}
          <button type="submit" className="btn-primary" disabled={reviewSubmitting}>
            {reviewSubmitting ? "Submitting…" : "Submit Review"}
          </button>
        </form>
      )}

      {isWorkerRole && (
        <div className="agent-panel">
          {actionError && <p className="error-text">{actionError}</p>}

          {ticket.aiSuggestion?.category ? (
            <div className="ai-suggestion-card">
              <div className="ai-suggestion-title">
                {ticket.aiSuggestion.source === "heuristic" ? "⚡ Auto-suggested (rule-based)" : "🤖 AI Suggestion"}
              </div>
              <div className="ai-suggestion-body">
                <span className="badge-priority" data-priority={ticket.aiSuggestion.priority}>
                  {ticket.aiSuggestion.priority}
                </span>
                <span className="ai-suggestion-category">{ticket.aiSuggestion.category}</span>
              </div>
              <p className="ai-suggestion-summary">{ticket.aiSuggestion.summary}</p>
              {canManageNow && (
                <button type="button" className="btn-secondary" onClick={handleApplySuggestion}>
                  Apply to Category/Priority
                </button>
              )}
            </div>
          ) : (
            canManageNow && (
              <div className="ai-suggestion-card ai-suggestion-empty">
                {triageError && <p className="error-text">{triageError}</p>}
                <p>No AI suggestion yet (AI may have been unavailable when this ticket was created).</p>
                <button type="button" className="btn-secondary" onClick={handleRunTriage} disabled={triaging}>
                  {triaging ? "Analyzing…" : "Run AI Triage"}
                </button>
              </div>
            )
          )}

          {!ticket.assignedWorker && (
            <button className="btn-primary" onClick={handleClaim} disabled={actionLoading}>
              {actionLoading ? "Claiming…" : "Claim This Ticket"}
            </button>
          )}

          {ticket.assignedWorker && !isMine && user.role !== "admin" && (
            <p className="ticket-resolved-note">
              This ticket is assigned to {ticket.assignedWorker.name}.
            </p>
          )}

          {canManage && ticket.assignedWorker && isPending && (
            <div className="pending-actions">
              <p>📥 New booking request from {ticket.customer?.name}. Accept to start working on it, or reject to decline.</p>
              <div className="cta-group">
                <button className="btn-primary" onClick={handleAccept} disabled={actionLoading}>
                  {actionLoading ? "Accepting…" : "✅ Accept"}
                </button>
                <button className="btn-secondary reject-btn" onClick={handleReject} disabled={actionLoading}>
                  ❌ Reject
                </button>
              </div>
            </div>
          )}

          {isRejected && (
            <p className="ticket-resolved-note">This booking was rejected and can no longer be changed.</p>
          )}

          {canManage && ticket.assignedWorker && isResolved && (
            <button className="btn-secondary" onClick={handleReopen} disabled={actionLoading}>
              {actionLoading ? "Reopening…" : "Reopen Ticket"}
            </button>
          )}

          {canManageNow && ticket.assignedWorker && (
            <>
              <form onSubmit={handleSaveDetails} className="agent-details-form">
                <div className="form-group">
                  <label className="field-label">Category</label>
                  <select className="field-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="field-label">Priority</label>
                  <select className="field-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn-secondary" disabled={savingDetails}>
                  {savingDetails ? "Saving…" : "Save"}
                </button>
              </form>
              {detailsError && <p className="error-text">{detailsError}</p>}

              {ticket.status === "Assigned" && (
                <button className="btn-secondary" onClick={handleMarkInProgress} disabled={actionLoading}>
                  Mark as In Progress
                </button>
              )}

              <form onSubmit={handleResolve} className="resolve-form">
                <label className="field-label">Resolution note (required to resolve)</label>
                <textarea
                  className="field-textarea"
                  placeholder="Summarize how this was resolved…"
                  value={resolutionNoteInput}
                  onChange={(e) => setResolutionNoteInput(e.target.value)}
                  rows={2}
                  maxLength={2000}
                />
                <button type="submit" className="btn-primary" disabled={actionLoading || !resolutionNoteInput.trim()}>
                  {actionLoading ? "Resolving…" : "Resolve Ticket"}
                </button>
              </form>
            </>
          )}
        </div>
      )}

      <div className="conversation-header">
        <h2 className="section-title">Conversation</h2>
        <span className="live-indicator"><span className="live-dot" />Live</span>
      </div>
      <div className="conversation">
        {messages.length === 0 && (
          <p className="conversation-empty">No messages yet.</p>
        )}
        {messages.map((m) => (
          <div
            key={m._id}
            className={`message-bubble ${m.sender?._id === user?._id ? "mine" : "theirs"}`}
          >
            <div className="message-meta">
              <span className="message-sender">{m.sender?.name || "Unknown"}</span>
              <span className="message-role">{m.senderRole}</span>
            </div>
            <p>{m.text}</p>
          </div>
        ))}
      </div>

      {isResolved || isPending || isRejected ? (
        <p className="ticket-resolved-note">
          {isPending && "Waiting for the worker to accept this booking before you can chat."}
          {isRejected && "This booking was rejected. Please submit a new ticket to try another worker."}
          {isResolved && "This ticket has been resolved. It needs to be reopened before the conversation can continue."}
        </p>
      ) : (
        <form onSubmit={handleReply} className="reply-form">
          {sendError && <p className="error-text">{sendError}</p>}
          <textarea
            className="field-textarea"
            placeholder="Type your reply…"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            maxLength={3000}
          />
          <button type="submit" className="btn-primary" disabled={sending || !reply.trim()}>
            {sending ? "Sending…" : "Send Reply"}
          </button>
        </form>
      )}
    </div>
  );
}
