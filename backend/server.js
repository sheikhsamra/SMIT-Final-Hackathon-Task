import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { apiLimiter } from "./middleware/rateLimit.js";

dotenv.config();
connectDB();

const app = express();

// Vercel (like any reverse proxy) sits in front of this app, so Express only
// ever sees the proxy's own connection IP unless told to trust its
// X-Forwarded-For header. Without this, express-rate-limit either buckets
// every visitor under the same misdetected "IP" (so one person's requests
// exhaust the whole app's shared login/register quota for everyone) or
// throws its own validation error outright — both look like "registration
// just doesn't work" for anyone but whoever hit it first.
app.set("trust proxy", 1);

// CLIENT_URL can be a comma-separated list of allowed origins in production.
// Left unset, every origin is allowed — fine for local development/demos.
const allowedOrigins = process.env.CLIENT_URL?.split(",").map((o) => o.trim());

app.use(helmet());
app.use(
  cors(
    allowedOrigins
      ? {
          origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
            callback(new Error("Not allowed by CORS"));
          },
        }
      : {}
  )
);
app.use(express.json({ limit: "3mb" }));
app.use(apiLimiter);

// All auth routes are mounted here: /api/auth/register, /api/auth/login, /api/auth/me
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Hackathon backend is running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server is running on port ${PORT}`));

// Exporting the app is required for Vercel serverless functions
export default app;
