import express from "express";
import User from "../models/User.js";
import Ticket from "../models/Ticket.js";
import Review from "../models/Review.js";
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

// @route  GET /api/admin/users  (admin-only — every user with role-specific stats)
router.get("/users", protect, restrictTo("admin"), async (req, res) => {
  try {
    const users = await User.find().select("name email role specialization avatar createdAt").sort({ createdAt: -1 });

    const withStats = await Promise.all(
      users.map(async (u) => {
        const base = {
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          specialization: u.specialization,
          avatar: u.avatar,
          createdAt: u.createdAt,
        };

        if (u.role === "worker") {
          const [resolvedCount, reviews] = await Promise.all([
            Ticket.countDocuments({ assignedWorker: u._id, status: "Resolved" }),
            Review.find({ worker: u._id }),
          ]);
          const reviewCount = reviews.length;
          const avgRating = reviewCount
            ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
            : null;
          return { ...base, resolvedCount, avgRating, reviewCount };
        }

        if (u.role === "customer") {
          const ticketCount = await Ticket.countDocuments({ customer: u._id });
          return { ...base, ticketCount };
        }

        return base;
      })
    );

    res.json(withStats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
