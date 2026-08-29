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

// Saare auth routes yahan se milenge: /api/auth/register, /api/auth/login, /api/auth/me
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Hackathon backend chal raha hai 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server chal raha hai port ${PORT} par`));
