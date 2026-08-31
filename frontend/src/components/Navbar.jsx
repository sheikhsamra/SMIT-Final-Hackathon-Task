import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NotificationBell from "./NotificationBell";
import { IconSun, IconMoon } from "./Icons";

export default function Navbar({ onOpenAuth }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/");
  };

  const linkClass = ({ isActive }) => (isActive ? "active" : "");
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Relay<span>Support</span></Link>
      </div>

      <div className={`navbar-center ${menuOpen ? "mobile-open" : ""}`}>
        <NavLink to="/" end className={linkClass} onClick={closeMenu}>
          Home
        </NavLink>
        <NavLink to="/services" className={linkClass} onClick={closeMenu}>
          Services
        </NavLink>
        <NavLink to="/about" className={linkClass} onClick={closeMenu}>
          About
        </NavLink>
        <NavLink to="/faq" className={linkClass} onClick={closeMenu}>
          FAQ
        </NavLink>
        {user?.role === "customer" && (
          <>
            <NavLink to="/dashboard" className={linkClass} onClick={closeMenu}>
              Dashboard
            </NavLink>
            <NavLink to="/tickets" className={linkClass} onClick={closeMenu}>
              My Tickets
            </NavLink>
          </>
        )}
        {user?.role === "admin" && (
          <NavLink to="/admin" className={linkClass} onClick={closeMenu}>
            Admin
          </NavLink>
        )}
        {user?.role === "worker" && (
          <NavLink to="/worker" className={linkClass} onClick={closeMenu}>
            Worker Dashboard
          </NavLink>
        )}

        {/* Mobile-only: the rest of navbar-actions is hidden above this width,
            so the same actions are repeated inside the slide-down menu. */}
        <div className="navbar-mobile-actions">
          {user ? (
            <>
              <span className="navbar-username mobile">
                Hi, {user.name}
                {user.role !== "customer" && <span className="role-tag">{user.role}</span>}
              </span>
              <button onClick={handleLogout} className="btn-link">Logout</button>
            </>
          ) : (
            <>
              <button
                onClick={() => { closeMenu(); onOpenAuth("login"); }}
                className="nav-btn-trigger"
              >
                Login
              </button>
              <button
                onClick={() => { closeMenu(); onOpenAuth("register"); }}
                className="nav-btn-trigger register-btn"
              >
                Register
              </button>
            </>
          )}
        </div>
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
            <span className="navbar-username desktop-only">
              Hi, {user.name}
              {user.role !== "customer" && <span className="role-tag">{user.role}</span>}
            </span>
            <button onClick={handleLogout} className="btn-link desktop-only">Logout</button>
          </>
        ) : (
          <span className="desktop-only navbar-auth-btns">
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
          </span>
        )}
        <button
          type="button"
          className={`navbar-hamburger ${menuOpen ? "open" : ""}`}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}