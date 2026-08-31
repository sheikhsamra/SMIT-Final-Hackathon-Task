import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <Link to="/faq">FAQ</Link>
        <Link to="/privacy">Privacy Policy</Link>
      </div>
      <p>
        © {new Date().getFullYear()} <span className="footer-brand">Relay<span>Support</span></span> — Made with 💻 at the hackathon
      </p>
    </footer>
  );
}
