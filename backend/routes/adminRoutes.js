import express from "express";
import User from "../models/User.js";
import Ticket from "../models/Ticket.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// @route  GET /api/admin/overview  (admin-only system-wide overview)
router.get("/overview", protect, restrictTo("admin"), async (req, res) => {
  try {
    const [userCounts, statusCounts, priorityCounts, totalTickets, totalUsers] = await Promise.all([
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Ticket.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Ticket.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
      Ticket.countDocuments(),
      User.countDocuments(),
    ]);

    res.json({
      users: {
        total: totalUsers,
        byRole: Object.fromEntries(userCounts.map((u) => [u._id, u.count])),
      },
      tickets: {
        total: totalTickets,
        byStatus: Object.fromEntries(statusCounts.map((s) => [s._id, s.count])),
        byPriority: Object.fromEntries(priorityCounts.map((p) => [p._id, p.count])),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
