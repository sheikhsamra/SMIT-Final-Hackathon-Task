# Hackathon MERN Starter

Ready-made MERN stack boilerplate: JWT Authentication + Navbar + Footer + Protected Routes.
On hackathon day, just build your actual feature/idea on top of this.

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

## Structure
```
backend/
  config/db.js          -> MongoDB connection
  models/User.js        -> User schema (hashed password)
  middleware/authMiddleware.js -> protect + adminOnly
  routes/authRoutes.js  -> register, login, me
  server.js             -> entry point

frontend/
  src/components/Navbar.jsx
  src/components/Footer.jsx
  src/components/ProtectedRoute.jsx
  src/context/AuthContext.jsx  -> login/register/logout logic
  src/pages/Home.jsx, Login.jsx, Register.jsx, Dashboard.jsx
  src/utils/api.js       -> axios instance with token auto-attach
```
