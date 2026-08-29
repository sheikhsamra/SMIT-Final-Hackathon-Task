import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// All auth routes are mounted here: /api/auth/register, /api/auth/login, /api/auth/me
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Hackathon backend is running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server is running on port ${PORT}`));

// Exporting the app is required for Vercel serverless functions
export default app;
