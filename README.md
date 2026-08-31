# RelaySupport

An AI-assisted customer support desk — a customer describes an issue, gets matched with a specialist worker (ranked by rating and experience), books them, and tracks the whole thing — booking, chat, resolution, review — in one place. Built on the MERN stack for a SMIT hackathon.

**Live demo:** https://smit-final-hackathon-task.vercel.app
**API:** https://sm-final-hackathon-task-backend.vercel.app

---

## What it does

RelaySupport is a three-sided marketplace-style support platform:

- **Customers** submit a ticket, get shown a shortlist of workers who specialize in that category (ranked by rating + tickets resolved), can read that worker's actual reviews before picking one, and track the ticket through to resolution.
- **Workers** get notified of new bookings, can Accept or Reject them, chat with the customer in real time, update status, and mark the ticket resolved.
- **Admins** own the platform: they see every user and worker with live stats, and can Warn or Block anyone misbehaving — no ticket-handling duties of their own.

### Core features

- **AI-assisted triage** — every ticket gets an instant suggested category, priority, and one-line summary. Uses the Claude API when `ANTHROPIC_API_KEY` is set, and falls back to a transparent rule-based heuristic when it isn't — the app never breaks or looks broken for missing a key.
- **Worker matching with real reviews** — the "suggested workers" list on the ticket form shows each worker's rating and resolved count, and lets the customer expand and read their actual past reviews before booking.
- **Booking lifecycle** — `New → Pending → Assigned → In Progress → Resolved`, with a separate `Rejected` terminal state. A worker must Accept a booking before a conversation opens; Rejected and Resolved tickets are permanently locked from further changes.
- **Live-feeling updates without WebSockets** — the whole app polls on short intervals (4–8s) instead of using Socket.IO, specifically so it works cleanly on Vercel's serverless functions.
- **Notifications** — booking requests, accept/reject, chat messages, resolutions, and admin warnings all generate an in-app notification (bell icon), each with its own icon/color and a sensible "where does clicking this take you" behavior.
- **5-star reviews** — a customer can only review a ticket that's actually resolved and actually theirs; the review is public on the worker's profile.
- **Role-based dashboards** — separate, purpose-built dashboards for Customer, Worker, and Admin; nobody sees a screen meant for a different role.
- **Admin moderation** — a live, filterable list of every user/worker with their stats, plus the ability to send a Warning (shows the recipient an unmissable popup) or Block an account (rejected at login, and any existing session is invalidated on its next request).
- **Editable profile** — every user can upload a profile photo (resized client-side, stored as a small data URL — no external file storage needed) and rename themselves.
- **RelaySupport Assistant** — a floating help-chat widget that answers "how do I…" questions about using the app. It's pure client-side keyword matching against a canned reply bank, not a real AI call — no API key needed, and it's honest about not knowing something outside its script.
- **Dark/light theme**, fully responsive, no external CSS framework — every color is a CSS custom property with light/dark values.
- **Security** — JWT auth, bcrypt-hashed passwords, `helmet`, rate limiting on the general API and separately (tighter) on auth endpoints, and role-gated routes on both the frontend (`ProtectedRoute`) and backend (`protect` + `restrictTo`).

---

## Tech stack

| | |
|---|---|
| Frontend | React (Vite), React Router, plain CSS (custom properties, no framework), GSAP (Services page animations only) |
| Backend | Node.js, Express, MongoDB (Mongoose) |
| Auth | JWT, bcryptjs |
| AI | `@anthropic-ai/sdk` (Claude), with a rule-based fallback |
| Hosting | Vercel (frontend + backend both deployed as separate Vercel projects) |

---

## Getting started

### 1. Backend

```
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, and (optionally) ANTHROPIC_API_KEY
npm run dev
```
Runs on `http://localhost:5000`.

### 2. Frontend

```
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`. Reads the backend URL from `VITE_API_URL` in `frontend/.env` (defaults to `http://localhost:5000/api`).

### 3. Seed demo accounts (optional)

```
cd backend
npm run seed
```
Creates one worker per category plus the admin account (skips any that already exist):

| Role   | Email                    | Password    | Specialization |
|--------|--------------------------|-------------|-----------------|
| Worker | billing@relay.test       | worker1234  | Billing         |
| Worker | technical@relay.test     | worker1234  | Technical       |
| Worker | account@relay.test       | worker1234  | Account         |
| Worker | general@relay.test       | worker1234  | General         |
| Admin  | admin@relaysupport.com   | admin1234   | —               |

Anyone can also self-register as a `customer` or a `worker` (picking a specialization) — there's no invite code gating worker sign-up. `admin` accounts can only be created via the seed script or directly in the database; there's no admin sign-up path.

---

## Roles at a glance

- **Customer** — submits tickets, picks a worker, chats once accepted, leaves a review after resolution. Dashboard: ticket stats, recent complaints, editable profile.
- **Worker** — has a specialization (`Billing` / `Technical` / `Account` / `General` / `Other`), sees tickets in their category, Accepts/Rejects bookings, updates status, resolves tickets. Dashboard: ticket queue with filters, own rating + reviews, editable profile.
- **Admin** — sees every user/worker with live stats (tickets submitted, tickets resolved, rating), can Warn or Block any non-admin account, and views a full warning history. Deliberately has no access to the worker ticket queue — the admin owns the platform, not individual tickets.

---

## Project structure

```
backend/
  config/db.js                  MongoDB connection
  models/
    User.js                     hashed password, role, specialization, avatar, isBlocked
    Ticket.js                   status, priority, aiSuggestion, assignedWorker, resolutionNote
    Message.js                  per-ticket conversation
    Notification.js             booking/message/warning notifications
    Review.js                   1 review per resolved ticket
  middleware/
    authMiddleware.js           protect (JWT) + restrictTo(...roles); rejects blocked/invalid sessions
    rateLimit.js                general + auth-specific rate limiters
  routes/
    authRoutes.js                register / login / me / profile
    ticketRoutes.js               create, list, assign, accept/reject, status, messages, AI triage, reviews
    userRoutes.js                 GET /users/workers?category=X, worker public profile
    adminRoutes.js                overview stats, user list, block/unblock/warn, warning history
    notificationRoutes.js         list / mark read
  utils/
    aiTriage.js                  Claude-powered triage with a heuristic fallback
  seed.js                        demo accounts
  server.js                      entry point

frontend/src/
  pages/                         Home, Services, About, FAQ, Privacy, Dashboard, NewTicket,
                                  MyTickets, TicketDetail, WorkerDashboard, AdminDashboard,
                                  Login, Register
  components/                    Navbar, Footer, AuthModal, ProtectedRoute, ProfileCard,
                                  NotificationBell, WarningsModal, ChatWidget, HeroIllustration,
                                  DonutChart, Icons (hand-drawn SVG set, no icon library)
  context/                       AuthContext, ThemeContext, WarningsContext
  utils/                         api.js (axios + auto-logout on invalid session), tickets.js,
                                  admin.js, notifications.js, assistantReplies.js (chat widget's
                                  keyword-matched reply bank)
```

---

## Notes on some deliberate choices

- **Polling instead of WebSockets** — Socket.IO doesn't play well with Vercel's serverless functions (no persistent connections), so every page that needs to feel "live" polls the relevant endpoint every few seconds instead.
- **No file storage service** — profile photos are resized in the browser (via `<canvas>`) down to a small JPEG and stored directly as a data URL on the user document. Fine at this scale; would need real object storage (S3/Cloudinary/etc.) beyond a hackathon demo.
- **Heuristic AI fallback** — the app is fully functional and honest about it (`⚡ Quick Suggestion` vs `🤖 AI Suggestion` in the UI) even with zero external API keys configured.
- **`vercel.json` in `frontend/`** — Vercel's static hosting 404s on a direct reload of a client-side route (e.g. `/tickets/:id`) without a rewrite rule; this file redirects every path to `index.html` so React Router can take over.
