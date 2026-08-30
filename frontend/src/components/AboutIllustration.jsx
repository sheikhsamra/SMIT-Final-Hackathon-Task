export default function AboutIllustration() {
  return (
    <svg viewBox="0 0 420 340" className="hero-illustration about-illustration" xmlns="http://www.w3.org/2000/svg">
      <circle className="hero-orb-pulse" cx="60" cy="70" r="60" fill="var(--accent-2)" opacity="0.14" />
      <circle className="hero-orb-pulse" style={{ animationDelay: "1.5s" }} cx="360" cy="280" r="65" fill="var(--accent-1)" opacity="0.14" />

      {/* Connecting path between customer and worker */}
      <path
        d="M 110 160 C 180 100, 240 220, 310 160"
        fill="none"
        stroke="var(--border-strong)"
        strokeWidth="2.5"
        strokeDasharray="7 8"
        className="about-connector-line"
      />

      {/* Customer avatar */}
      <g className="hero-row-in" style={{ animationDelay: "0.1s" }}>
        <circle cx="100" cy="160" r="52" fill="var(--bg-card)" stroke="var(--border-color)" />
        <circle cx="100" cy="144" r="18" fill="var(--accent-1)" opacity="0.85" />
        <path d="M 66 196 C 66 172, 134 172, 134 196" fill="var(--accent-1)" opacity="0.85" />
      </g>

      {/* Worker avatar */}
      <g className="hero-row-in" style={{ animationDelay: "0.25s" }}>
        <circle cx="320" cy="160" r="52" fill="var(--bg-card)" stroke="var(--border-color)" />
        <circle cx="320" cy="144" r="18" fill="var(--accent-2)" opacity="0.85" />
        <path d="M 286 196 C 286 172, 354 172, 354 196" fill="var(--accent-2)" opacity="0.85" />
      </g>

      {/* Chat bubble in the middle, sitting on the connector */}
      <g transform="translate(178, 90)">
        <g className="hero-badge-bob">
          <rect x="0" y="0" width="64" height="46" rx="14" fill="var(--bg-card)" stroke="var(--border-strong)" strokeWidth="1.5" />
          <path d="M 20 46 L 20 58 L 34 46 Z" fill="var(--bg-card)" stroke="var(--border-strong)" strokeWidth="1.5" />
          <circle className="hero-dot-pulse" style={{ animationDelay: "0s" }} cx="18" cy="23" r="4" fill="var(--priority-medium)" />
          <circle className="hero-dot-pulse" style={{ animationDelay: "0.2s" }} cx="32" cy="23" r="4" fill="var(--priority-medium)" />
          <circle className="hero-dot-pulse" style={{ animationDelay: "0.4s" }} cx="46" cy="23" r="4" fill="var(--priority-medium)" />
        </g>
      </g>

      {/* Floating "resolved" badge */}
      <g transform="translate(300, 250)">
        <g className="hero-badge-sway">
          <rect x="0" y="0" width="100" height="38" rx="19" fill="var(--status-resolved)" />
          <text x="50" y="24" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--bg-primary)" fontFamily="inherit">
            Resolved ✓
          </text>
        </g>
      </g>

      {/* Floating rating badge */}
      <g transform="translate(20, 250)">
        <g className="hero-badge-sway" style={{ animationDelay: "0.6s" }}>
          <rect x="0" y="0" width="76" height="34" rx="17" fill="var(--bg-card)" stroke="var(--border-strong)" />
          <text x="38" y="22" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--priority-medium)" fontFamily="inherit">
            ★ 4.9
          </text>
        </g>
      </g>
    </svg>
  );
}
