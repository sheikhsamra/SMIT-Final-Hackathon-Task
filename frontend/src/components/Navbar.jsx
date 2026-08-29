import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar({ onOpenAuth }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🚀 HackProject</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          aria-label="Toggle theme"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          <span key={theme} className="theme-icon">
            {theme === "dark" ? "🌙" : "☀️"}
          </span>
        </button>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <span className="navbar-username">Hi, {user.name}</span>
            <button onClick={handleLogout} className="btn-link">Logout</button>
          </>
        ) : (
          <>
            <button 
              onClick={() => onOpenAuth("login")} 
              className="nav-btn-trigger"
            >
              Login
            </button>
            <button 
              onClick={() => onOpenAuth("register")} 
              className="nav-btn-trigger register-btn"
            >
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
}