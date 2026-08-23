const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

export const Logo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect width="32" height="32" rx="7" fill="#B72D54" />
    <path d="M9 22V10l4.5 6L18 10v12" stroke="#FFFDF9" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21.5 16h5" stroke="#FFFDF9" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

export const IconPdf = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

export const IconSearch = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const IconLayers = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 6 3 12 0v-5" />
  </svg>
);

export const IconDna = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

export const IconHybrid = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

export const IconBook = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>
);

export const IconSettings = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.63.28 1.1.87 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const IconUpload = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export const IconSend = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export const IconCopy = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const IconCheckSmall = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S} strokeWidth="2.6">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const IconCheckCircle = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const IconEye = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconChartUp = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export const IconNote = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="14" y2="17" />
  </svg>
);

export const IconShield = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const IconKey = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

export const IconCpu = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
  </svg>
);

export const IconGit = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <line x1="6" y1="3" x2="6" y2="15" />
    <circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
    <path d="M18 9a9 9 0 0 1-9 9" />
  </svg>
);

export const IconGlobe = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export const IconDatabase = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

export const IconFileX = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S} strokeWidth="1.4">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9.5" y1="12.5" x2="14.5" y2="17.5" />
    <line x1="14.5" y1="12.5" x2="9.5" y2="17.5" />
  </svg>
);

export const IconAlertChat = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <line x1="12" y1="8" x2="12" y2="11" />
    <line x1="12" y1="13.5" x2="12" y2="13.501" strokeWidth="2.4" />
  </svg>
);

export const IconScatter = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="5" width="7" height="7" rx="1.5" transform="rotate(8 17.5 8.5)" />
    <rect x="5" y="14" width="7" height="7" rx="1.5" transform="rotate(-8 8.5 17.5)" />
    <rect x="15" y="15" width="6" height="6" rx="1.5" />
  </svg>
);

export const IconBot = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

export const IconUser = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const IconChevronDown = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const IconX = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const IconTrash = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export const IconEyeOff = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export const IconExternal = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...S} strokeWidth="2.2">
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);
