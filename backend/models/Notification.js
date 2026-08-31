import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Not every notification is about a ticket — an admin warning is
    // account-level, so this is optional.
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
    type: {
      type: String,
      enum: ["new_booking", "accepted", "rejected", "completed", "message", "warning"],
      required: true,
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
