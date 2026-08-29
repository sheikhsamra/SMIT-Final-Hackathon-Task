# Hackathon MERN Starter

Ready-made MERN stack boilerplate: JWT Authentication + Navbar + Footer + Protected Routes.
Hackathon ke din bas apna actual feature/idea isi ke andar build karna hai.

## Kaise chalayen

### 1. Backend
```
cd backend
npm install
cp .env.example .env   # phir .env mein apna MongoDB URI aur JWT_SECRET daalein
npm run dev
```
Backend `http://localhost:5000` par chalega.

### 2. Frontend
```
cd frontend
npm install
npm run dev
```
Frontend `http://localhost:5173` par chalega.

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
"# SITM-Final-Hackthon" 
