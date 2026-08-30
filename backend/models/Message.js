import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["customer", "worker", "admin"], required: true },
    text: { type: String, required: true, trim: true, maxlength: 3000 },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
