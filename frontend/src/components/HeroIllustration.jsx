export default function HeroIllustration() {
  return (
    <svg viewBox="0 0 420 340" className="hero-illustration" xmlns="http://www.w3.org/2000/svg">
      <circle cx="330" cy="60" r="70" fill="var(--accent-1)" opacity="0.14" />
      <circle cx="50" cy="290" r="55" fill="var(--accent-2)" opacity="0.14" />

      {/* Main card */}
      <rect x="30" y="40" width="300" height="230" rx="18" fill="var(--bg-card)" stroke="var(--border-color)" />
      <circle cx="55" cy="65" r="5" fill="var(--priority-high)" />
      <circle cx="72" cy="65" r="5" fill="var(--priority-medium)" />
      <circle cx="89" cy="65" r="5" fill="var(--priority-low)" />

      {/* Ticket rows */}
      <g>
        <rect x="52" y="95" width="256" height="38" rx="10" fill="var(--bg-input)" />
        <circle cx="72" cy="114" r="6" fill="var(--status-new)" />
        <rect x="90" y="106" width="140" height="8" rx="4" fill="var(--text-secondary)" opacity="0.5" />
        <rect x="250" y="106" width="40" height="16" rx="8" fill="var(--status-new)" opacity="0.18" />
      </g>
      <g>
        <rect x="52" y="141" width="256" height="38" rx="10" fill="var(--bg-input)" />
        <circle cx="72" cy="160" r="6" fill="var(--priority-medium)" />
        <rect x="90" y="152" width="110" height="8" rx="4" fill="var(--text-secondary)" opacity="0.5" />
        <rect x="250" y="152" width="40" height="16" rx="8" fill="var(--priority-medium)" opacity="0.18" />
      </g>
      <g>
        <rect x="52" y="187" width="256" height="38" rx="10" fill="var(--bg-input)" />
        <circle cx="72" cy="206" r="6" fill="var(--status-resolved)" />
        <rect x="90" y="198" width="160" height="8" rx="4" fill="var(--text-secondary)" opacity="0.5" />
        <rect x="250" y="198" width="40" height="16" rx="8" fill="var(--status-resolved)" opacity="0.18" />
      </g>

      {/* Floating AI badge */}
      <g transform="translate(300, 245)">
        <rect x="0" y="0" width="90" height="40" rx="20" fill="var(--accent-1)" />
        <text x="45" y="25" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--btn-text)" fontFamily="inherit">
          AI Matched
        </text>
      </g>

      {/* Floating rating badge */}
      <g transform="translate(10, 20)">
        <rect x="0" y="0" width="76" height="34" rx="17" fill="var(--bg-card)" stroke="var(--border-strong)" />
        <text x="38" y="22" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--priority-medium)" fontFamily="inherit">
          ★ 4.9
        </text>
      </g>
    </svg>
  );
}
