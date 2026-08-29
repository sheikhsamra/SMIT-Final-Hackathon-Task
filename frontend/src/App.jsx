import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

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
            <Routes>
              <Route path="/" element={<Home onOpenAuth={handleOpenAuth} />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
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