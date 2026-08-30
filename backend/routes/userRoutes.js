import express from "express";
import User from "../models/User.js";
import Ticket from "../models/Ticket.js";
import Review from "../models/Review.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const workerRatingSummary = async (workerId) => {
  const reviews = await Review.find({ worker: workerId });
  const reviewCount = reviews.length;
  const avgRating = reviewCount
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
    : null;
  return { avgRating, reviewCount };
};

// @route  GET /api/users/workers?category=Billing
// Returns workers who specialize in the given category, each with how many
// tickets they've resolved and their average rating — shown to a customer as
// suggested workers (a simple, transparent stand-in for an AI recommendation).
router.get("/workers", protect, async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { role: "worker" };
    if (category) filter.specialization = category;

    const workers = await User.find(filter).select("name specialization");

    const withStats = await Promise.all(
      workers.map(async (worker) => {
        const resolvedCount = await Ticket.countDocuments({
          assignedWorker: worker._id,
          status: "Resolved",
        });
        const { avgRating, reviewCount } = await workerRatingSummary(worker._id);
        return {
          _id: worker._id,
          name: worker.name,
          specialization: worker.specialization,
          resolvedCount,
          avgRating,
          reviewCount,
        };
      })
    );

    withStats.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0) || b.resolvedCount - a.resolvedCount);
    res.json(withStats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  GET /api/users/workers/:id/profile  (a worker's public stats + reviews)
router.get("/workers/:id/profile", protect, async (req, res) => {
  try {
    const worker = await User.findOne({ _id: req.params.id, role: "worker" }).select("name specialization");
    if (!worker) return res.status(404).json({ message: "Worker not found" });

    const [resolvedCount, { avgRating, reviewCount }, reviews] = await Promise.all([
      Ticket.countDocuments({ assignedWorker: worker._id, status: "Resolved" }),
      workerRatingSummary(worker._id),
      Review.find({ worker: worker._id }).populate("customer", "name").sort({ createdAt: -1 }).limit(20),
    ]);

    res.json({
      _id: worker._id,
      name: worker.name,
      specialization: worker.specialization,
      resolvedCount,
      avgRating,
      reviewCount,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
