const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const IconUser = () => (
  <svg {...base}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
  </svg>
);

export const IconUsers = () => (
  <svg {...base}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2 20c0-3.3 3-5 7-5s7 1.7 7 5" />
    <path d="M16 5.5a3.5 3.5 0 0 1 0 6.8" />
    <path d="M17.5 15c2.5.5 4.5 2 4.5 5" />
  </svg>
);

export const IconMail = () => (
  <svg {...base}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export const IconBadge = () => (
  <svg {...base}>
    <path d="M12 2 20 6v6c0 4.5-3.2 8-8 10-4.8-2-8-5.5-8-10V6z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const IconCalendar = () => (
  <svg {...base}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </svg>
);

export const IconTicket = () => (
  <svg {...base}>
    <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" />
    <path d="M11 6v12" strokeDasharray="2.5 2.5" />
  </svg>
);

export const IconInbox = () => (
  <svg {...base}>
    <path d="M12 3v10" />
    <path d="m7 9 5 5 5-5" />
    <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
  </svg>
);

export const IconCheckCircle = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.5 2.5 5-5" />
  </svg>
);

export const IconClock = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
);

export const IconCamera = () => (
  <svg {...base}>
    <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);

export const IconPencil = () => (
  <svg {...base}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const IconCreditCard = () => (
  <svg {...base}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
    <path d="M2.5 9.5h19" />
    <path d="M6 14.5h4" />
  </svg>
);

export const IconWrench = () => (
  <svg {...base}>
    <path d="M14.7 6.3a4 4 0 0 0-5.6 4.9L3 17.3l2.7 2.7 6.1-6.1a4 4 0 0 0 4.9-5.6l-2.6 2.6-2-2Z" />
  </svg>
);

export const IconLock = () => (
  <svg {...base}>
    <rect x="4" y="11" width="16" height="9" rx="2" />
    <path d="M7.5 11V7.5a4.5 4.5 0 0 1 9 0V11" />
  </svg>
);

export const IconChat = () => (
  <svg {...base}>
    <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
  </svg>
);

export const IconBox = () => (
  <svg {...base}>
    <path d="M3.5 8 12 3.5 20.5 8 12 12.5Z" />
    <path d="M3.5 8v9L12 21.5" />
    <path d="M20.5 8v9L12 21.5" />
    <path d="M12 12.5v9" />
  </svg>
);

export const IconChevronDown = () => (
  <svg {...base}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const IconAlertTriangle = () => (
  <svg {...base}>
    <path d="M12 3.5 22 20.5H2Z" />
    <path d="M12 10v4" />
    <path d="M12 17.5h.01" />
  </svg>
);

export const IconSend = () => (
  <svg {...base}>
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22l-4-9-9-4Z" />
  </svg>
);

export const IconStar = () => (
  <svg {...base}>
    <path d="M12 3.5 14.7 9l6.1.9-4.4 4.3 1 6.1L12 17.3 6.6 20.3l1-6.1L3.2 9.9 9.3 9Z" />
  </svg>
);

export const IconHourglass = () => (
  <svg {...base}>
    <path d="M6 3h12" />
    <path d="M6 21h12" />
    <path d="M7 3v3.5a5 5 0 0 0 2 4l1.5 1.2a1 1 0 0 1 0 1.6L9 14.5a5 5 0 0 0-2 4V21" />
    <path d="M17 3v3.5a5 5 0 0 1-2 4l-1.5 1.2a1 1 0 0 0 0 1.6l1.5 1.2a5 5 0 0 1 2 4V21" />
  </svg>
);

export const IconBriefcase = () => (
  <svg {...base}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M3 13h18" />
  </svg>
);

export const IconShield = () => (
  <svg {...base}>
    <path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z" />
  </svg>
);

export const IconSparkle = () => (
  <svg {...base}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
  </svg>
);

export const IconBarChart = () => (
  <svg {...base}>
    <path d="M4 21V10M12 21V4M20 21v-7" />
    <path d="M2 21h20" />
  </svg>
);

export const IconSun = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
  </svg>
);

export const IconMoon = () => (
  <svg {...base}>
    <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export const IconBell = () => (
  <svg {...base}>
    <path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
    <path d="M10 21a2 2 0 0 0 4 0" />
  </svg>
);

export const IconXCircle = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="m9.5 9.5 5 5M14.5 9.5l-5 5" />
  </svg>
);
