// A scripted, keyword-matched reply engine for the floating help widget.
// No API call, no network request — it just pattern-matches the message
// against topics real users actually ask about (submitting a ticket,
// tracking status, reviews, becoming a worker, etc.) so the widget can
// feel conversational without needing any AI provider wired up.

const TOPICS = [
  {
    keywords: ["hi", "hello", "hey", "salam", "assalam"],
    replies: [
      "Hi! I'm the RelaySupport Assistant — ask me how to submit a complaint, track a ticket, or anything else about using this app.",
      "Hey there! Happy to help. You can ask me things like \"how do I submit a complaint\" or \"how do reviews work\".",
    ],
  },
  {
    keywords: ["thank", "shukriya", "thanks"],
    replies: ["You're welcome! Anything else I can help with?", "Anytime! Let me know if you have another question."],
  },
  {
    keywords: ["submit", "complain", "complaint", "file a ticket", "create a ticket", "raise a ticket", "report", "new ticket", "how do i open"],
    replies: [
      "To submit a complaint: click \"Submit a Ticket\" on your Dashboard or the navbar, write a short subject and a detailed description, pick a category (Billing, Technical, Account, General, or Other), and optionally pick a suggested specialist. Then hit Submit — that's it!",
    ],
  },
  {
    keywords: ["match", "matched", "matching", "which worker", "assign", "specialist", "pick a worker", "choose a worker", "select a worker"],
    replies: [
      "When you pick a category, RelaySupport shows you the workers who specialize in it, ranked by rating and how many tickets they've resolved. You can pick one directly, or leave it blank and it'll go to the open queue for any specialist in that category.",
    ],
  },
  {
    keywords: ["status", "track", "where is my ticket", "pending", "progress", "check my ticket"],
    replies: [
      "Open \"My Tickets\" from the navbar to see every ticket you've submitted and its current status — New, Pending, Assigned, In Progress, Resolved, or Rejected. It updates live, no need to refresh.",
    ],
  },
  {
    keywords: ["cancel", "delete", "remove ticket", "undo"],
    replies: [
      "You can delete a ticket yourself from My Tickets, but only while it's still New or Pending (before a worker accepts it). Once accepted, it can only end by being resolved or rejected.",
    ],
  },
  {
    keywords: ["reject", "rejected", "declined"],
    replies: [
      "If a worker rejects your booking, you'll get a notification right away. A rejected ticket can't be reopened — just submit a new one to try a different specialist.",
    ],
  },
  {
    keywords: ["review", "rate", "rating", "star", "feedback"],
    replies: [
      "Once your ticket is marked resolved, a review form appears right there — pick 1 to 5 stars and add an optional comment. It shows up on that worker's public profile.",
    ],
  },
  {
    keywords: ["become a worker", "join as a worker", "work here", "be a specialist", "worker account", "sign up as worker", "register as worker"],
    replies: [
      "Register with the \"Worker\" role and pick a specialization — Billing, Technical, Account, or General. You'll immediately start showing up as a suggested specialist for matching tickets.",
    ],
  },
  {
    keywords: ["free", "price", "cost", "pay", "subscription", "billing plan"],
    replies: ["RelaySupport is completely free — it was built as a hackathon demo, no billing or paid tier."],
  },
  {
    keywords: ["privacy", "data", "safe", "secure", "password"],
    replies: [
      "Your password is hashed and never stored in plain text. Check the Privacy Policy page (link in the footer) for the full plain-language breakdown of what's collected and why.",
    ],
  },
  {
    keywords: ["human", "real person", "talk to someone", "real agent", "customer service"],
    replies: [
      "I'm just a simple assistant for navigating the app — for anything account-specific, submit a ticket and a real specialist will help you directly!",
    ],
  },
  {
    keywords: ["message", "chat", "reply", "conversation"],
    replies: [
      "Once a worker accepts your booking, a Conversation section opens on the ticket page where you can chat back and forth in real time — you'll get notified on every new reply.",
    ],
  },
  {
    keywords: ["notification", "notify", "alert"],
    replies: [
      "The bell icon in the navbar shows notifications for every booking, message, rejection, and resolution — click it anytime to see what's new.",
    ],
  },
  {
    keywords: ["dashboard"],
    replies: [
      "Your Dashboard shows a quick overview of your tickets and profile. Workers get an extra queue view with stats — check the \"Worker Dashboard\" link in the navbar.",
    ],
  },
];

const FALLBACKS = [
  "I'm not totally sure about that one — but I can help with submitting a complaint, tracking ticket status, worker matching, reviews, or becoming a worker. Try asking about one of those, or check the FAQ page for more.",
  "Hmm, I don't have a canned answer for that yet. Try rephrasing, or ask me about submitting a ticket, checking status, reviews, or becoming a worker.",
];

// Predefined questions shown as clickable chips so a user always has an
// obvious next thing to ask, and never has to guess wording.
export const SUGGESTED_QUESTIONS = [
  "How do I submit a complaint?",
  "How does worker matching work?",
  "How do I track my ticket?",
  "How do I leave a review?",
  "How do I become a worker?",
  "Is this free to use?",
];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Whole-word/phrase matching — a plain substring check would let short
// keywords like "hi" match inside unrelated words (e.g. "this", "chip"),
// so every keyword is wrapped with \b word boundaries before testing.
const mentionsKeyword = (text, keyword) => new RegExp(`\\b${escapeRegex(keyword)}\\b`, "i").test(text);

export const getAssistantReply = (message) => {
  const text = message.toLowerCase();
  const topic = TOPICS.find((t) => t.keywords.some((k) => mentionsKeyword(text, k)));
  return topic ? pick(topic.replies) : pick(FALLBACKS);
};
