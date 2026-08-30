# Relay

An AI-assisted customer support desk: customers submit tickets, pick a suggested worker for the category, and that worker resolves it — built on a MERN stack foundation with JWT Authentication, Navbar, Footer, and Protected Routes.

## Getting Started

### 1. Backend
```
cd backend
npm install
cp .env.example .env   # then fill in your MongoDB URI and JWT_SECRET in .env
npm run dev
```
The backend will run on `http://localhost:5000`.

### 2. Frontend
```
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`.

## Roles & Demo Credentials
There are three roles: `customer`, `worker`, `admin`.

- **Sign-up lets you register as a `customer` or a `worker`.** Choosing "Worker" also asks for a specialization (Billing/Technical/Account/General/Other), used to match them against customer tickets in that category. There is no invite code — anyone can self-register as a worker. This was a deliberate simplification for the demo; it does trade away the stricter access control an invite-gated sign-up would give.
- `admin` accounts are provisioned only via the seed script (no sign-up path):
  ```
  cd backend
  npm run seed
  ```
  This creates demo accounts (skipped if they already exist) — one worker per category, so the "suggested workers" list on the ticket form always has someone to show:

  | Role   | Email                  | Password    | Specialization |
  |--------|------------------------|--------------|-----------------|
  | Worker | billing@relay.test     | worker1234   | Billing         |
  | Worker | technical@relay.test   | worker1234   | Technical       |
  | Worker | account@relay.test     | worker1234   | Account         |
  | Worker | general@relay.test     | worker1234   | General         |
  | Admin  | admin@relay.test       | admin1234    | —               |

## Structure
```
backend/
  config/db.js          -> MongoDB connection
  models/User.js        -> User schema (hashed password, role: customer/worker/admin, specialization)
  models/Ticket.js      -> Ticket schema (status, priority, aiSuggestion, assignedWorker)
  models/Message.js     -> ticket conversation history
  middleware/authMiddleware.js -> protect + restrictTo(...roles)
  middleware/rateLimit.js -> login/register + general API rate limiting
  routes/authRoutes.js  -> register (customer or worker + specialization), login, me
  routes/ticketRoutes.js -> ticket CRUD, assign, status, messages, AI triage
  routes/userRoutes.js  -> GET /users/workers?category=X (suggested-worker matching)
  routes/adminRoutes.js -> GET /admin/overview (system-wide stats)
  utils/aiTriage.js     -> AI triage with a rule-based fallback when no API key is set
  seed.js                -> creates demo worker (one per category) + admin accounts
  server.js             -> entry point

frontend/
  src/components/Navbar.jsx
  src/components/Footer.jsx
  src/components/ProtectedRoute.jsx  -> supports an optional `roles` prop for role-gated routes
  src/context/AuthContext.jsx  -> login/register/logout logic
  src/pages/Home.jsx, Login.jsx, Register.jsx, Dashboard.jsx
  src/utils/api.js       -> axios instance with token auto-attach
```
