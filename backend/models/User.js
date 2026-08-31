import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Not required for a Google account — there's no password to check,
    // Google already authenticated them.
    password: {
      type: String,
      minlength: 6,
      required: function () {
        return this.authProvider === "local";
      },
    },
    role: { type: String, enum: ["customer", "worker", "admin"], default: "customer" },
    // "google" accounts skip the email-verification-code flow — Google
    // already confirmed the address — and have no password to match.
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    googleId: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String, default: null, select: false },
    verificationCodeExpires: { type: Date, default: null, select: false },
    // Only meaningful for workers — which ticket category they handle, used
    // to match them against a customer's ticket.
    specialization: {
      type: String,
      enum: ["Billing", "Technical", "Account", "General", "Other", null],
      default: null,
    },
    // A small data-URL (resized client-side before upload) — no external
    // storage needed for a hackathon-scale user base.
    avatar: { type: String, default: null },
    // Set by an admin — a blocked user can no longer log in, and any
    // existing session is rejected on its next request.
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
