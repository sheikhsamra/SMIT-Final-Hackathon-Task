import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IconChevronDown, IconTicket, IconStar, IconShield } from "../components/Icons";

const CATEGORIES = [
  {
    name: "Booking & Tickets",
    Icon: IconTicket,
    color: "sc-blue",
    items: [
      {
        q: "How does RelaySupport match my ticket to a worker?",
        a: "When you submit a ticket, you pick a category (Billing, Technical, Account, General, or Other). RelaySupport shows you the workers who specialize in that category, ranked by their rating and how many tickets they've resolved — you pick one, or the ticket goes into the open queue for any specialist in that category to claim.",
      },
      {
        q: "What happens after I submit a ticket?",
        a: "The worker you picked gets a notification and can Accept or Reject the booking. Once accepted, you can chat back and forth in real time, and you'll be notified the moment they reply, change the status, or mark it resolved.",
      },
      {
        q: "Can I cancel or delete a ticket?",
        a: "Yes — as long as it's still New or Pending (not yet accepted by a worker), you can delete it from My Tickets. Once a worker accepts it, it's locked in and can only end by being resolved or rejected.",
      },
      {
        q: "What happens if a worker rejects my booking?",
        a: "You'll get a notification right away. A rejected ticket can't be reopened or reassigned — submit a new ticket to try a different worker.",
      },
    ],
  },
  {
    name: "Reviews & Workers",
    Icon: IconStar,
    color: "sc-amber",
    items: [
      {
        q: "How do reviews work?",
        a: "Once a ticket is marked resolved, you can leave a 1–5 star rating and an optional comment. It's tied to that specific ticket and shows up on the worker's public profile — there's no way to review a worker without a real closed ticket behind it.",
      },
      {
        q: "How do I become a worker on RelaySupport?",
        a: "Register with the \"Worker\" role and pick a specialization (Billing, Technical, Account, or General). You'll start showing up as a suggested specialist for new tickets in that category right away.",
      },
    ],
  },
  {
    name: "Trust & Cost",
    Icon: IconShield,
    color: "sc-teal",
    items: [
      {
        q: "Is my data safe?",
        a: "Passwords are hashed, never stored in plain text. See the full Privacy Policy for exactly what we collect and how it's used.",
      },
      {
        q: "Is RelaySupport free to use?",
        a: "Yes — RelaySupport was built for a hackathon as a demo of an AI-assisted support desk. There's no billing or paid tier.",
      },
    ],
  },
];

export default function FAQ({ onOpenAuth }) {
  const { user } = useAuth();
  const [openKey, setOpenKey] = useState("Booking & Tickets-0");

  return (
    <div className="page wide-page">
      <div className="dashboard-header">
        <h1 className="wide-page-title">Frequently Asked Questions</h1>
        <p>Everything you might want to know before you submit a ticket.</p>
      </div>

      {CATEGORIES.map((cat) => (
        <div className="faq-category" key={cat.name}>
          <div className="faq-category-header">
            <span className={`faq-category-icon ${cat.color}`}><cat.Icon /></span>
            <h2>{cat.name}</h2>
          </div>

          <div className="faq-list">
            {cat.items.map((item, i) => {
              const key = `${cat.name}-${i}`;
              const isOpen = openKey === key;
              return (
                <div className={`faq-item ${cat.color} ${isOpen ? "open" : ""}`} key={key}>
                  <button
                    type="button"
                    className="faq-question"
                    onClick={() => setOpenKey(isOpen ? "" : key)}
                    aria-expanded={isOpen}
                  >
                    <span>{item.q}</span>
                    <span className="faq-chevron"><IconChevronDown /></span>
                  </button>
                  {isOpen && <p className="faq-answer">{item.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {!user && (
        <div className="home-cta-banner">
          <h2>Still have a question?</h2>
          <p>Create an account and submit a ticket — a real specialist will get back to you.</p>
          <button className="btn-primary" onClick={() => onOpenAuth?.("register")}>
            Get Started →
          </button>
        </div>
      )}

      {user?.role === "customer" && (
        <div className="home-cta-banner">
          <h2>Didn't find your answer?</h2>
          <p>Submit a ticket and a specialist will help you directly.</p>
          <Link to="/tickets/new" className="btn-primary">Submit a Ticket →</Link>
        </div>
      )}
    </div>
  );
}
