import { Link } from "react-router-dom";

const PRODUCT_LINKS = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
];

const SUPPORT_LINKS = [
  { to: "/faq", label: "FAQ" },
  { to: "/privacy", label: "Privacy Policy" },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-about">
          <span className="footer-brand">Relay<span>Support</span></span>
          <p>AI-assisted customer support — every ticket, relayed to the right specialist.</p>
        </div>

        <div className="footer-col">
          <h4>Product</h4>
          {PRODUCT_LINKS.map((l) => (
            <Link to={l.to} key={l.label}>{l.label}</Link>
          ))}
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          {SUPPORT_LINKS.map((l) => (
            <Link to={l.to} key={l.label}>{l.label}</Link>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} RelaySupport — Made with 💻 at the hackathon</p>
      </div>
    </footer>
  );
}
