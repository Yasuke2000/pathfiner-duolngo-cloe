import { UNIT_ICON } from "@/dutch/icon-map";

/**
 * One line icon per unit, drawn from plain SVG primitives. They give each card a
 * recognisable shape, so the path can be scanned instead of read.
 */
const P: Record<string, React.ReactNode> = {
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  lines: (
    <>
      <path d="M4 5h16v11H9l-5 4z" />
      <path d="M8 9h8M8 12h5" />
    </>
  ),
  cap: (
    <>
      <path d="M2 9l10-5 10 5-10 5z" />
      <path d="M6 11.5V16c2 2 10 2 12 0v-4.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  bag: (
    <>
      <path d="M5 8h14l-1 12H6z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  flag: (
    <>
      <path d="M5 21V4" />
      <path d="M5 4h13l-2.5 4L18 12H5" />
    </>
  ),
  building: (
    <>
      <path d="M3 21h18M5 21V10l7-5 7 5v11" />
      <path d="M10 21v-5h4v5" />
    </>
  ),
  doc: (
    <>
      <path d="M7 3h8l4 4v14H7z" />
      <path d="M15 3v4h4M10 12h6M10 16h6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16.5 14.2c2.7.3 4.5 2.4 4.5 5.8" />
    </>
  ),
  monitor: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  braces: (
    <>
      <path d="M9 4H8a2 2 0 0 0-2 2v3a2 2 0 0 1-2 2 2 2 0 0 1 2 2v3a2 2 0 0 0 2 2h1" />
      <path d="M15 4h1a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2 2 2 0 0 0-2 2v3a2 2 0 0 1-2 2h-1" />
    </>
  ),
  tag: (
    <>
      <path d="M3 12V4h8l10 10-8 8z" />
      <circle cx="7.5" cy="8.5" r="1.5" />
    </>
  ),
  hash: <path d="M9 3 7 21M17 3l-2 18M4 9h17M3 15h17" />,
  bug: (
    <>
      <path d="M8 9a4 4 0 0 1 8 0v6a4 4 0 0 1-8 0z" />
      <path d="M12 13v6M4 13h4M16 13h4M5 7l3 2M19 7l-3 2M5 20l3-3M19 20l-3-3" />
    </>
  ),
  cube: (
    <>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </>
  ),
  branch: (
    <>
      <circle cx="6" cy="5" r="2" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="8" r="2" />
      <path d="M6 7v10M18 10c0 4-12 2-12 5" />
    </>
  ),
  swap: <path d="M4 7h11M12 4l3 3-3 3M20 17H9M12 14l-3 3 3 3" />,
  chart: (
    <>
      <path d="M4 20V4M4 20h16" />
      <path d="M7 16l4-5 3 3 5-7" />
    </>
  ),
  nodes: (
    <>
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M10.8 7.2 7.2 15.8M13.2 7.2l3.6 8.6" />
    </>
  ),
  cpu: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" />
    </>
  ),
  chip: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
      <rect x="10" y="10" width="4" height="4" />
      <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3l9 4.5-9 4.5-9-4.5z" />
      <path d="M3 12l9 4.5 9-4.5M3 16.5 12 21l9-4.5" />
    </>
  ),
  sparkle: (
    <>
      <path d="M11 4l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
      <path d="M19 3v4M17 5h4" />
    </>
  ),
  sigma: <path d="M17 5H7l6 7-6 7h10" />,
  curve: (
    <>
      <path d="M4 20V4M4 20h16" />
      <path d="M5 17c4 0 4-10 8-10s3 6 6 6" />
    </>
  ),
  bits: (
    <>
      <rect x="4" y="6" width="6" height="12" rx="3" />
      <path d="M15 8l3-2v12M15 18h6" />
    </>
  ),
  board: (
    <>
      <rect x="3" y="4" width="18" height="11" rx="1" />
      <path d="M12 15v3M8 21l4-3 4 3" />
    </>
  ),
  check: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3h6v1M9 13l2 2 4-4" />
    </>
  ),
  split: <path d="M4 12h5M9 12l4-5h7M9 12l4 5h7M18 5l2 2-2 2M18 15l2 2-2 2" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  code: <path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />,
  layout: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M9 9v11" />
    </>
  ),
  steps: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="5" cy="6" r="1" />
      <circle cx="5" cy="12" r="1" />
      <circle cx="5" cy="18" r="1" />
    </>
  ),
  idea: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z" />
    </>
  ),
  terminal: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 9l3 3-3 3M13 15h4" />
    </>
  ),
  speaker: (
    <>
      <path d="M11 5 6 9H3v6h3l5 4V5z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    </>
  ),
};


export function UnitIcon({ unitId, size = 20 }: { unitId: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {P[UNIT_ICON[unitId] ?? "chat"] ?? P.chat}
    </svg>
  );
}

/** Icon names that actually have a drawing. */
export const ICON_NAMES = Object.keys(P);
