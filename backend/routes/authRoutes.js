import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

const router = express.Router();

const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const generateCode = () => String(crypto.randomInt(100000, 1000000)); // 6 digits

const authResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  specialization: user.specialization,
  avatar: user.avatar,
  createdAt: user.createdAt,
  token: generateToken(user._id),
});

// @route  POST /api/auth/register
router.post("/register", authLimiter, async (req, res) => {
  try {
    const { name, email, password, role, specialization } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    let finalRole = "customer";
    let finalSpecialization = null;
    if (role === "worker") {
      if (!specialization) {
        return res.status(400).json({ message: "Please select a specialization" });
      }
      finalRole = "worker";
      finalSpecialization = specialization;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const code = generateCode();
    const user = await User.create({
      name,
      email,
      password,
      role: finalRole,
      specialization: finalSpecialization,
      verificationCode: code,
      verificationCodeExpires: Date.now() + 15 * 60 * 1000,
    });

    await sendVerificationEmail(user.email, user.name, code);

    // No token yet — the account can't log in until the code is confirmed.
    res.status(201).json({
      needsVerification: true,
      email: user.email,
      message: "We sent a 6-digit code to your email. Enter it to finish creating your account.",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: Object.values(error.errors)[0].message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  POST /api/auth/verify-email
router.post("/verify-email", authLimiter, async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Please enter the code from your email" });
    }

    const user = await User.findOne({ email }).select("+verificationCode +verificationCodeExpires");
    if (!user) return res.status(404).json({ message: "No account found for this email" });
    if (user.isVerified) return res.status(400).json({ message: "This account is already verified" });

    if (
      !user.verificationCode ||
      user.verificationCode !== code ||
      !user.verificationCodeExpires ||
      user.verificationCodeExpires < Date.now()
    ) {
      return res.status(400).json({ message: "That code is invalid or has expired — request a new one" });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    res.json(authResponse(user));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  POST /api/auth/resend-verification
router.post("/resend-verification", authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account found for this email" });
    if (user.isVerified) return res.status(400).json({ message: "This account is already verified" });

    const code = generateCode();
    user.verificationCode = code;
    user.verificationCodeExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    await sendVerificationEmail(user.email, user.name, code);
    res.json({ message: "A new code has been sent to your email" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  POST /api/auth/login
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.authProvider === "google") {
      return res.status(400).json({ message: "This account uses Google Sign-In — continue with Google instead." });
    }

    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account has been blocked. Contact support if you think this is a mistake." });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        needsVerification: true,
        email: user.email,
      });
    }

    res.json(authResponse(user));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route  POST /api/auth/google  (Sign in / sign up with a Google ID token)
router.post("/google", authLimiter, async (req, res) => {
  try {
    if (!googleClient) {
      return res.status(503).json({ message: "Google Sign-In isn't configured on this server yet." });
    }

    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Missing Google credential" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    let user = await User.findOne({ email: payload.email });

    if (user && user.authProvider !== "google") {
      return res.status(400).json({ message: "An account with this email already exists — log in with your password instead." });
    }

    if (user && user.isBlocked) {
      return res.status(403).json({ message: "Your account has been blocked. Contact support if you think this is a mistake." });
    }

    if (!user) {
      user = await User.create({
        name: payload.name || payload.email.split("@")[0],
        email: payload.email,
        authProvider: "google",
        googleId: payload.sub,
        avatar: payload.picture || null,
        isVerified: true, // Google already confirmed this address
        role: "customer", // Google sign-in only ever creates a customer account
      });
    }

    res.json(authResponse(user));
  } catch (error) {
    res.status(401).json({ message: "Could not verify Google sign-in", error: error.message });
  }
});

// @route  GET /api/auth/me  (protected route — only accessible to logged-in users)
router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

// @route  PATCH /api/auth/profile  (update your own name and/or avatar)
router.patch("/profile", protect, async (req, res) => {
  try {
    const { name, avatar } = req.body;

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ message: "Name cannot be empty" });
      req.user.name = name.trim();
    }
    if (avatar !== undefined) {
      if (avatar && avatar.length > 2_000_000) {
        return res.status(400).json({ message: "Image is too large — please use a smaller photo" });
      }
      req.user.avatar = avatar || null;
    }

    await req.user.save();

    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      specialization: req.user.specialization,
      avatar: req.user.avatar,
      createdAt: req.user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
