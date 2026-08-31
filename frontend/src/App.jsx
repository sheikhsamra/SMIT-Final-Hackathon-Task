import { lazy, Suspense, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";

// Everything past the landing page is loaded on demand — a first-time
// visitor only pays for Home's JS, not the whole app.
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NewTicket = lazy(() => import("./pages/NewTicket"));
const MyTickets = lazy(() => import("./pages/MyTickets"));
const TicketDetail = lazy(() => import("./pages/TicketDetail"));
const WorkerDashboard = lazy(() => import("./pages/WorkerDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

const RouteFallback = () => (
  <div className="spinner-wrap">
    <div className="spinner" />
  </div>
);

export default function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const handleOpenAuth = (mode = "login") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar onOpenAuth={handleOpenAuth} />
          <main className="main-content">
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Home onOpenAuth={handleOpenAuth} />} />
                <Route path="/about" element={<About onOpenAuth={handleOpenAuth} />} />
                <Route path="/faq" element={<FAQ onOpenAuth={handleOpenAuth} />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/services" element={<Services onOpenAuth={handleOpenAuth} />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tickets/new"
                  element={
                    <ProtectedRoute roles={["customer"]}>
                      <NewTicket />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tickets"
                  element={
                    <ProtectedRoute roles={["customer"]}>
                      <MyTickets />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tickets/:id"
                  element={
                    <ProtectedRoute>
                      <TicketDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/worker"
                  element={
                    <ProtectedRoute roles={["worker", "admin"]}>
                      <WorkerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </main>
          <Footer />

          {/* Global Blur Backdrop Popup Modal */}
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            initialMode={authMode}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}