import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NotificationBell from "./NotificationBell";
import { IconSun, IconMoon } from "./Icons";

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
        <Link to="/">Relay</Link>
      </div>

      <div className="navbar-center">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
          Home
        </NavLink>
        <NavLink to="/services" className={({ isActive }) => (isActive ? "active" : "")}>
          Services
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
          About
        </NavLink>
        {user && (
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
            Dashboard
          </NavLink>
        )}
        {user?.role === "customer" && (
          <NavLink to="/tickets" className={({ isActive }) => (isActive ? "active" : "")}>
            My Tickets
          </NavLink>
        )}
        {user?.role === "admin" && (
          <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
            Admin
          </NavLink>
        )}
        {(user?.role === "worker" || user?.role === "admin") && (
          <NavLink to="/worker" className={({ isActive }) => (isActive ? "active" : "")}>
            Worker Dashboard
          </NavLink>
        )}
      </div>

      <div className="navbar-actions">
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          aria-label="Toggle theme"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          <span key={theme} className="theme-icon">
            {theme === "dark" ? <IconMoon /> : <IconSun />}
          </span>
        </button>
        {user ? (
          <>
            <NotificationBell />
            <span className="navbar-username">
              Hi, {user.name}
              {user.role !== "customer" && <span className="role-tag">{user.role}</span>}
            </span>
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