import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

const client = new Anthropic();

const TriageSchema = z.object({
  category: z.enum(["Billing", "Technical", "Account", "General", "Other"]),
  priority: z.enum(["Low", "Medium", "High"]),
  summary: z.string().min(1).max(300),
});

// --- Rule-based fallback -----------------------------------------------
// Used whenever no LLM key is configured, or the real AI call fails/times
// out. Keeps the exact same { category, priority, summary } shape so the
// rest of the app (storage, validation, the worker's review UI) never has to
// know which path produced the suggestion.
const CATEGORY_KEYWORDS = {
  Billing: ["charge", "charged", "refund", "payment", "invoice", "bill", "subscription", "price"],
  Technical: ["error", "bug", "crash", "broken", "not working", "doesn't work", "failed", "freeze", "glitch"],
  Account: ["password", "login", "log in", "account", "locked", "access", "sign in", "reset"],
};

const HIGH_PRIORITY_WORDS = ["urgent", "immediately", "asap", "critical", "can't access", "down", "twice", "emergency"];
const LOW_PRIORITY_WORDS = ["minor", "small issue", "whenever", "no rush", "just wondering"];

const detectCategory = (text) => {
  for (const [category, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (words.some((w) => text.includes(w))) return category;
  }
  return "General";
};

const detectPriority = (text) => {
  if (HIGH_PRIORITY_WORDS.some((w) => text.includes(w))) return "High";
  if (LOW_PRIORITY_WORDS.some((w) => text.includes(w))) return "Low";
  return "Medium";
};

const buildSummary = (subject, description) => {
  const firstSentence = description.split(/[.!?]/)[0].trim();
  if (!firstSentence) return subject;
  return firstSentence.length > 140 ? `${firstSentence.slice(0, 140)}…` : firstSentence;
};

const heuristicTriage = ({ subject, description }) => {
  const text = `${subject} ${description}`.toLowerCase();
  return {
    category: detectCategory(text),
    priority: detectPriority(text),
    summary: buildSummary(subject, description),
    source: "heuristic",
  };
};

// --- Public API ----------------------------------------------------------
// Always resolves to a { category, priority, summary, source } suggestion —
// never null — so ticket creation and the worker's review UI behave the same
// whether a real AI key is configured or not.
export const triageTicket = async ({ subject, description }) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return heuristicTriage({ subject, description });
  }

  try {
    const response = await client.messages.parse(
      {
        model: "claude-opus-5",
        max_tokens: 512,
        system:
          "You are a support-ticket triage assistant. Read the customer's ticket and classify it. " +
          "Be decisive. The summary must be a single concise sentence restating the core issue.",
        messages: [
          { role: "user", content: `Subject: ${subject}\n\nDescription: ${description}` },
        ],
        output_config: {
          format: zodOutputFormat(TriageSchema),
          effort: "low",
        },
      },
      { timeout: 12000 }
    );

    if (!response.parsed_output) return heuristicTriage({ subject, description });
    return { ...response.parsed_output, source: "ai" };
  } catch (error) {
    console.error("AI triage failed, falling back to rule-based triage:", error.message);
    return heuristicTriage({ subject, description });
  }
};
