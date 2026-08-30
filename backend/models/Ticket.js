import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, required: true, unique: true },
    subject: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    category: {
      type: String,
      enum: ["Billing", "Technical", "Account", "General", "Other"],
      default: "General",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["New", "Pending", "Assigned", "In Progress", "Resolved", "Rejected"],
      default: "New",
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedWorker: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    // AI's raw suggestion, kept separate from the fields above so a worker can
    // compare it against the final, human-approved category/priority.
    aiSuggestion: {
      category: { type: String, default: null },
      priority: { type: String, default: null },
      summary: { type: String, default: null },
      source: { type: String, enum: ["ai", "heuristic", null], default: null },
    },
    resolutionNote: { type: String, default: null, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

const generateTicketNumber = () => {
  const timePart = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `TCK-${timePart}-${randomPart}`;
};

ticketSchema.pre("validate", function (next) {
  if (!this.ticketNumber) {
    this.ticketNumber = generateTicketNumber();
  }
  next();
});

export default mongoose.model("Ticket", ticketSchema);
