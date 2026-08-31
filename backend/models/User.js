import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["customer", "worker", "admin"], default: "customer" },
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
