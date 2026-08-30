import rateLimit from "express-rate-limit";

// General safety net for the whole API. The app polls several endpoints
// (dashboard stats, ticket lists, notifications) every few seconds for the
// real-time feel, so this needs real headroom — it's a guard against actual
// abuse, not a throttle on normal usage.
export const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 1200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// Tighter limit on login/register to slow down brute-force / credential-stuffing attempts
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again in a few minutes." },
});
