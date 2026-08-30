// --- Rule-based ticket triage --------------------------------------------
// Keyword matching on the subject/description. Keeps a stable
// { category, priority, summary, source } shape so the rest of the app
// (storage, validation, the worker's review UI) doesn't need to care how
// the suggestion was produced.
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
// never null — so ticket creation and the worker's review UI can rely on it.
export const triageTicket = async ({ subject, description }) => {
  return heuristicTriage({ subject, description });
};
