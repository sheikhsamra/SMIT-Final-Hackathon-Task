import express from "express";
import Ticket from "../models/Ticket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Review from "../models/Review.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import { triageTicket } from "../utils/aiTriage.js";

const router = express.Router();

const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES = ["New", "Pending", "Assigned", "In Progress", "Resolved", "Rejected"];
const LOCKED_STATUSES = ["Resolved", "Rejected"];

const notify = (user, ticket, type, message) =>
  Notification.create({ user, ticket: ticket._id, type, message });

// Ticket refs (customer/assignedWorker) may arrive either as raw ObjectIds or
// as populated documents (.populate("customer", ...)) depending on the route —
// pull the id out either way so the comparison below is never comparing a
// populated document's toString() (which is not its id) against a real id.
const refId = (ref) => (ref?._id ? ref._id.toString() : ref?.toString());

// Workers/admins see the whole ticket queue; a customer only ever sees their own.
const canView = (user, ticket) => {
  if (user.role === "customer") return refId(ticket.customer) === user._id.toString();
  return true;
};

// Mutating a ticket (status, replies, category/priority) is tighter: a customer
// can only act on their own ticket, a worker only on one assigned to them (or
// still unassigned, so they can pick it up), and an admin can do anything.
const canMutate = (user, ticket) => {
  if (user.role === "admin") return true;
  if (user.role === "customer") return refId(ticket.customer) === user._id.toString();
  if (user.role === "worker") {
    return !ticket.assignedWorker || refId(ticket.assignedWorker) === user._id.toString();
  }
  return false;
};

// @route  POST /api/tickets  (customer creates a ticket, optionally picking a
// suggested worker from the New Ticket form)
router.post("/", protect, restrictTo("customer"), async (req, res) => {
  try {
    const { subject, description, category, preferredWorker } = req.body;
    if (!subject || !description) {
      return res.status(400).json({ message: "Subject and description are required" });
    }

    const ticket = new Ticket({
      subject,
      description,
      category: category || undefined,
      customer: req.user._id,
    });

    // If the customer picked a worker from the suggested list, the ticket goes
    // to that worker as a pending booking request — they still have to accept
    // it before any work (or conversation) can start.
    let bookedWorker = null;
    if (preferredWorker) {
      bookedWorker = await User.findById(preferredWorker);
      if (bookedWorker && bookedWorker.role === "worker") {
        ticket.assignedWorker = bookedWorker._id;
        ticket.status = "Pending";
      } else {
        bookedWorker = null;
      }
    }

    // Triage falls back to rule-based classification if no AI key is
    // configured or the AI call fails/times out — creation never blocks on it.
    ticket.aiSuggestion = await triageTicket({ subject, description });
    await ticket.save();

    if (bookedWorker) {
      await notify(
        bookedWorker._id,
        ticket,
        "new_booking",
        `${req.user.name} booked you for a new ticket: "${ticket.subject}"`
      );
    }

    res.status(201).json(ticket);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: Object.values(error.errors)[0].message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  GET /api/tickets  (role-filtered list)
router.get("/", protect, async (req, res) => {
  try {
    const filter = req.user.role === "customer" ? { customer: req.user._id } : {};

    const tickets = await Ticket.find(filter)
      .populate("customer", "name email")
      .populate("assignedWorker", "name email")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  GET /api/tickets/stats  (basic dashboard counts)
router.get("/stats", protect, async (req, res) => {
  try {
    const filter = req.user.role === "customer" ? { customer: req.user._id } : {};

    const [statusCounts, priorityCounts, total] = await Promise.all([
      Ticket.aggregate([{ $match: filter }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
      Ticket.aggregate([{ $match: filter }, { $group: { _id: "$priority", count: { $sum: 1 } } }]),
      Ticket.countDocuments(filter),
    ]);

    res.json({
      total,
      byStatus: Object.fromEntries(statusCounts.map((s) => [s._id, s.count])),
      byPriority: Object.fromEntries(priorityCounts.map((p) => [p._id, p.count])),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  POST /api/tickets/:id/ai-triage  (worker/admin re-runs AI triage,
// e.g. if it failed or timed out when the ticket was first created)
router.post("/:id/ai-triage", protect, restrictTo("worker", "admin"), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const suggestion = await triageTicket({
      subject: ticket.subject,
      description: ticket.description,
    });

    ticket.aiSuggestion = suggestion;
    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  GET /api/tickets/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("customer", "name email")
      .populate("assignedWorker", "name email");

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (!canView(req.user, ticket)) {
      return res.status(403).json({ message: "You do not have access to this ticket" });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  DELETE /api/tickets/:id  (customer deletes their own ticket — only
// while it's still New/Pending, before a worker has actually started on it)
router.delete("/:id", protect, restrictTo("customer"), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (ticket.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own tickets" });
    }
    if (!["New", "Pending"].includes(ticket.status)) {
      return res.status(400).json({ message: "This ticket can no longer be deleted once a worker has started on it." });
    }

    await Promise.all([
      Message.deleteMany({ ticket: ticket._id }),
      Notification.deleteMany({ ticket: ticket._id }),
      Review.deleteOne({ ticket: ticket._id }),
      ticket.deleteOne(),
    ]);

    res.json({ message: "Ticket deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  PATCH /api/tickets/:id  (worker/admin sets category/priority manually,
// e.g. reviewing an AI suggestion or handling the ticket when AI is unavailable)
router.patch("/:id", protect, restrictTo("worker", "admin"), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (!canMutate(req.user, ticket)) {
      return res.status(403).json({ message: "You can only update tickets assigned to you" });
    }
    if (LOCKED_STATUSES.includes(ticket.status)) {
      return res.status(400).json({ message: `A ${ticket.status.toLowerCase()} ticket cannot be changed.` });
    }

    const { category, priority } = req.body;
    if (priority && !PRIORITIES.includes(priority)) {
      return res.status(400).json({ message: "Invalid priority value" });
    }
    if (category) ticket.category = category;
    if (priority) ticket.priority = priority;

    await ticket.save();
    res.json(ticket);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: Object.values(error.errors)[0].message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  PATCH /api/tickets/:id/assign  (worker claims an unassigned ticket
// from the open queue — separate from accept/reject, which is for tickets a
// customer specifically booked this worker for)
router.patch("/:id/assign", protect, restrictTo("worker", "admin"), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (ticket.assignedWorker) {
      return res.status(400).json({ message: "This ticket is already assigned" });
    }

    ticket.assignedWorker = req.user._id;
    if (ticket.status === "New") ticket.status = "Assigned";
    await ticket.save();

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  PATCH /api/tickets/:id/accept  (worker accepts a booking a customer made for them)
router.patch("/:id/accept", protect, restrictTo("worker", "admin"), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (ticket.status !== "Pending") {
      return res.status(400).json({ message: "Only a pending booking can be accepted" });
    }
    if (!canMutate(req.user, ticket)) {
      return res.status(403).json({ message: "This booking is not assigned to you" });
    }

    ticket.status = "Assigned";
    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  PATCH /api/tickets/:id/reject  (worker declines a booking; this is
// final — the ticket cannot be edited or accepted again afterward)
router.patch("/:id/reject", protect, restrictTo("worker", "admin"), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate("customer", "name");
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (ticket.status !== "Pending") {
      return res.status(400).json({ message: "Only a pending booking can be rejected" });
    }
    if (!canMutate(req.user, ticket)) {
      return res.status(403).json({ message: "This booking is not assigned to you" });
    }

    ticket.status = "Rejected";
    await ticket.save();

    await notify(
      ticket.customer._id,
      ticket,
      "rejected",
      `Your request "${ticket.subject}" was declined. Please submit a new ticket to try another worker.`
    );

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  PATCH /api/tickets/:id/status
router.patch("/:id/status", protect, restrictTo("worker", "admin"), async (req, res) => {
  try {
    const { status, resolutionNote } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const ticket = await Ticket.findById(req.params.id).populate("customer", "name");
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (!canMutate(req.user, ticket)) {
      return res.status(403).json({ message: "You can only update tickets assigned to you" });
    }
    if (LOCKED_STATUSES.includes(ticket.status) && status !== ticket.status) {
      return res.status(400).json({ message: `A ${ticket.status.toLowerCase()} ticket cannot be changed.` });
    }
    const wasAlreadyResolved = ticket.status === "Resolved";
    ticket.status = status;
    if (resolutionNote?.trim()) ticket.resolutionNote = resolutionNote.trim();
    await ticket.save();

    if (status === "Resolved" && !wasAlreadyResolved) {
      await notify(
        ticket.customer._id,
        ticket,
        "completed",
        `Your ticket "${ticket.subject}" is marked as done — let us know how it went!`
      );
    }

    res.json(ticket);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: Object.values(error.errors)[0].message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  PATCH /api/tickets/:id/reopen
router.patch("/:id/reopen", protect, restrictTo("worker", "admin"), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (ticket.status !== "Resolved") {
      return res.status(400).json({ message: "Only a resolved ticket can be reopened" });
    }

    ticket.status = "In Progress";
    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  GET /api/tickets/:id/messages
router.get("/:id/messages", protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (!canView(req.user, ticket)) {
      return res.status(403).json({ message: "You do not have access to this ticket" });
    }

    const messages = await Message.find({ ticket: ticket._id })
      .populate("sender", "name role")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  POST /api/tickets/:id/messages
router.post("/:id/messages", protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (!canMutate(req.user, ticket)) {
      return res.status(403).json({ message: "You do not have access to this ticket" });
    }
    if (ticket.status === "Pending") {
      return res.status(400).json({ message: "This booking hasn't been accepted yet." });
    }
    if (LOCKED_STATUSES.includes(ticket.status)) {
      return res.status(400).json({ message: `This ticket is ${ticket.status.toLowerCase()} and can no longer receive messages.` });
    }

    const message = await Message.create({
      ticket: ticket._id,
      sender: req.user._id,
      senderRole: req.user.role,
      text: text.trim(),
    });

    // A worker's first reply nudges an Assigned ticket into "In Progress"
    if (req.user.role !== "customer" && ticket.status !== "In Progress") {
      ticket.status = "In Progress";
      await ticket.save();
    }

    // Let the other side of the conversation know a reply came in — the
    // customer if a worker/admin replied, or the assigned worker if the
    // customer replied.
    const recipient = req.user.role === "customer" ? ticket.assignedWorker : ticket.customer;
    if (recipient) {
      await notify(
        recipient,
        ticket,
        "message",
        `${req.user.name} sent a new message on "${ticket.subject}"`
      );
    }

    const populated = await message.populate("sender", "name role");
    res.status(201).json(populated);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: Object.values(error.errors)[0].message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  GET /api/tickets/:id/review
router.get("/:id/review", protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (!canView(req.user, ticket)) {
      return res.status(403).json({ message: "You do not have access to this ticket" });
    }

    const review = await Review.findOne({ ticket: ticket._id });
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  POST /api/tickets/:id/review  (customer rates the worker after resolution)
router.post("/:id/review", protect, restrictTo("customer"), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (ticket.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only review your own tickets" });
    }
    if (ticket.status !== "Resolved") {
      return res.status(400).json({ message: "You can only review a resolved ticket" });
    }
    if (!ticket.assignedWorker) {
      return res.status(400).json({ message: "This ticket has no worker to review" });
    }

    const existing = await Review.findOne({ ticket: ticket._id });
    if (existing) {
      return res.status(400).json({ message: "This ticket has already been reviewed" });
    }

    const review = await Review.create({
      ticket: ticket._id,
      worker: ticket.assignedWorker,
      customer: req.user._id,
      rating,
      comment: comment?.trim() || "",
    });

    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "This ticket has already been reviewed" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: Object.values(error.errors)[0].message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
