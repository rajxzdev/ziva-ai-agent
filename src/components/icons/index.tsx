import * as React from 'react';

export type IconName =
  | 'pulse' | 'layers' | 'nodes' | 'play' | 'key' | 'clock' | 'sliders'
  | 'sun' | 'moon' | 'monitor' | 'chevronDown' | 'chevronRight' | 'chevronLeft'
  | 'check' | 'plus' | 'minus' | 'trash' | 'copy' | 'download' | 'upload'
  | 'search' | 'spark' | 'shield' | 'bug' | 'code' | 'database' | 'palette'
  | 'pen' | 'compass' | 'route' | 'rocket' | 'grid' | 'close' | 'menu'
  | 'alert' | 'info' | 'external' | 'refresh' | 'zap' | 'cpu' | 'arrowRight'
  | 'eye' | 'eyeOff' | 'lock' | 'terminal' | 'stop' | 'dot' | 'link'
  | 'filter' | 'save' | 'book' | 'target' | 'wand' | 'drag';

const P: Record<IconName, React.ReactNode> = {
  pulse: <path d="M3 12h3.5l2.5-7 4 14 2.5-7H21" />,
  layers: <><path d="M12 3.2 3.4 7.6 12 12l8.6-4.4L12 3.2Z" /><path d="m3.4 16.4 8.6 4.4 8.6-4.4" /><path d="m3.4 12 8.6 4.4L20.6 12" /></>,
  nodes: <><circle cx="5" cy="6" r="2.4" /><circle cx="5" cy="18" r="2.4" /><circle cx="19" cy="12" r="2.4" /><path d="M7.3 7.2 16.7 11M7.3 16.8 16.7 13" /></>,
  play: <path d="M8.4 5.6a.6.6 0 0 1 .9-.5l9.4 5.9a.7.7 0 0 1 0 1.2l-9.4 5.9a.6.6 0 0 1-.9-.5V5.6Z" />,
  key: <><circle cx="7.6" cy="15.4" r="3.6" /><path d="m10.2 12.8 9.3-9.3M17 6l2.4 2.4M14.2 8.8l2.4 2.4" /></>,
  clock: <><circle cx="12" cy="12" r="8.4" /><path d="M12 7.2v5.1l3.4 2" /></>,
  sliders: <><path d="M4 7.5h8M17.5 7.5H20M4 16.5h3.5M13 16.5H20" /><circle cx="14.5" cy="7.5" r="2.4" /><circle cx="10" cy="16.5" r="2.4" /></>,
  sun: <><circle cx="12" cy="12" r="4.1" /><path d="M12 2.6v2.3M12 19.1v2.3M2.6 12h2.3M19.1 12h2.3M5.4 5.4 7 7M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6" /></>,
  moon: <path d="M20.4 14.6A8.7 8.7 0 0 1 9.4 3.6a8.7 8.7 0 1 0 11 11Z" />,
  monitor: <><rect x="3" y="4.5" width="18" height="12" rx="3" /><path d="M9 20h6M12 16.5V20" /></>,
  chevronDown: <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />,
  chevronRight: <path d="m9.5 6 6 6-6 6" />,
  chevronLeft: <path d="m14.5 6-6 6 6 6" />,
  check: <path d="m4.5 12.4 5 5 10-11" />,
  plus: <path d="M12 5.2v13.6M5.2 12h13.6" />,
  minus: <path d="M5.2 12h13.6" />,
  trash: <><path d="M4 6.8h16M9.2 6.8V4.6h5.6v2.2" /><path d="m6.6 6.8 1 12.6h8.8l1-12.6M10.4 10.5v5.4M13.6 10.5v5.4" /></>,
  copy: <><rect x="9" y="9" width="11.2" height="11.2" rx="3.2" /><path d="M15 5.6A2.6 2.6 0 0 0 12.4 3H6.6A2.6 2.6 0 0 0 4 5.6v5.8A2.6 2.6 0 0 0 6.6 14" /></>,
  download: <path d="M12 3.8v11m0 0 4.2-4.2M12 14.8l-4.2-4.2M4.5 19.5h15" />,
  upload: <path d="M12 20.2V9.2m0 0 4.2 4.2M12 9.2 7.8 13.4M4.5 4.5h15" />,
  search: <><circle cx="11" cy="11" r="6.4" /><path d="m15.8 15.8 4.4 4.4" /></>,
  spark: <><path d="m12 3 1.9 5.4L19.4 10l-5.5 1.6L12 17l-1.9-5.4L4.6 10l5.5-1.6L12 3Z" /><path d="m18.5 16.2.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" /></>,
  shield: <><path d="M12 3.2 5.2 6v5.4c0 4.2 2.9 7.8 6.8 8.9 3.9-1.1 6.8-4.7 6.8-8.9V6L12 3.2Z" /><path d="m9.4 11.8 1.9 2 3.4-3.8" /></>,
  bug: <><rect x="8" y="7.6" width="8" height="11.4" rx="4" /><path d="M8 12.2H4.2M19.8 12.2H16M8.4 8.4 6.4 6M15.6 8.4 17.6 6M8.2 16.6 4.8 18M15.8 16.6l3.4 1.4M12 7.6V5.2" /></>,
  code: <path d="m8.6 8.2-4.4 3.8 4.4 3.8M15.4 8.2l4.4 3.8-4.4 3.8M13.6 4.6l-3.2 14.8" />,
  database: <><ellipse cx="12" cy="6.2" rx="7" ry="3.2" /><path d="M5 6.2v11.6c0 1.8 3.1 3.2 7 3.2s7-1.4 7-3.2V6.2M5 12c0 1.8 3.1 3.2 7 3.2s7-1.4 7-3.2" /></>,
  palette: <><path d="M12 3.2a8.8 8.8 0 0 0 0 17.6c1.4 0 2.2-.9 2.2-2 0-1.7-1.3-2 .2-3.2h1.7a4.9 4.9 0 0 0 4.7-4.9c0-4.2-3.9-7.5-8.8-7.5Z" /><circle cx="8" cy="10" r="1.1" /><circle cx="12" cy="7.6" r="1.1" /><circle cx="15.8" cy="10" r="1.1" /></>,
  pen: <path d="m4 20 1.1-4.2L16.6 4.3a2.2 2.2 0 0 1 3.1 3.1L8.2 18.9 4 20Z" />,
  compass: <><circle cx="12" cy="12" r="8.4" /><path d="m15.2 8.8-2 5.2-5.2 2 2-5.2 5.2-2Z" /></>,
  route: <><circle cx="5.6" cy="18.4" r="2.4" /><circle cx="18.4" cy="5.6" r="2.4" /><path d="M8 18.4h5.6a4 4 0 0 0 0-8h-3.2a4 4 0 0 1 0-4.8H16" /></>,
  rocket: <><path d="M12 3.2c3 2.2 4.8 5.6 4.8 9.3L14.4 16H9.6l-2.4-3.5c0-3.7 1.8-7.1 4.8-9.3Z" /><circle cx="12" cy="10" r="1.7" /><path d="M9.6 16 7 18.6l.8-4M14.4 16l2.6 2.6-.8-4M10.6 19.4h2.8" /></>,
  grid: <><rect x="3.6" y="3.6" width="7" height="7" rx="2.2" /><rect x="13.4" y="3.6" width="7" height="7" rx="2.2" /><rect x="3.6" y="13.4" width="7" height="7" rx="2.2" /><rect x="13.4" y="13.4" width="7" height="7" rx="2.2" /></>,
  close: <path d="m6.4 6.4 11.2 11.2M17.6 6.4 6.4 17.6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  alert: <><path d="M10.6 4.2 2.9 17.5A1.6 1.6 0 0 0 4.3 20h15.4a1.6 1.6 0 0 0 1.4-2.5L13.4 4.2a1.6 1.6 0 0 0-2.8 0Z" /><path d="M12 9.4v4M12 16.6h.01" /></>,
  info: <><circle cx="12" cy="12" r="8.4" /><path d="M12 11v5.2M12 7.8h.01" /></>,
  external: <path d="M14 4.4h5.6V10M19.6 4.4 11 13M17.6 14v3.6a2.4 2.4 0 0 1-2.4 2.4H6.4A2.4 2.4 0 0 1 4 17.6V8.8a2.4 2.4 0 0 1 2.4-2.4H10" />,
  refresh: <path d="M20 12a8 8 0 1 1-2.6-5.9M20.2 3.8v4.6h-4.6" />,
  zap: <path d="M13.2 2.8 5.4 13.6h5.6l-1.2 7.6 8-11.2h-5.8l1.2-7.2Z" />,
  cpu: <><rect x="6.6" y="6.6" width="10.8" height="10.8" rx="3" /><rect x="10.2" y="10.2" width="3.6" height="3.6" rx="1.2" /><path d="M9.4 3.4v3.2M14.6 3.4v3.2M9.4 17.4v3.2M14.6 17.4v3.2M3.4 9.4h3.2M3.4 14.6h3.2M17.4 9.4h3.2M17.4 14.6h3.2" /></>,
  arrowRight: <path d="M4.2 12h15m0 0-5.6-5.6M19.2 12l-5.6 5.6" />,
  eye: <><path d="M2.6 12S6 5.8 12 5.8 21.4 12 21.4 12 18 18.2 12 18.2 2.6 12 2.6 12Z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <path d="M4 4l16 16M9.6 5.2A9.4 9.4 0 0 1 12 4.9c6 0 9.4 6.2 9.4 6.2a17 17 0 0 1-3.2 3.9M6.4 7.1A16.7 16.7 0 0 0 2.6 11.1S6 17.3 12 17.3a9.6 9.6 0 0 0 3.7-.7M10 9.4a3 3 0 0 0 4.1 4.2" />,
  lock: <><rect x="4.4" y="10" width="15.2" height="10.2" rx="3.4" /><path d="M8 10V7.6a4 4 0 0 1 8 0V10" /></>,
  terminal: <><rect x="3" y="4.4" width="18" height="15.2" rx="3.4" /><path d="m7.4 9.6 2.8 2.6-2.8 2.6M13 15.2h4" /></>,
  stop: <rect x="6.6" y="6.6" width="10.8" height="10.8" rx="3" />,
  dot: <circle cx="12" cy="12" r="4" />,
  link: <path d="M10.4 13.6a3.6 3.6 0 0 0 5.1 0l2.8-2.8a3.6 3.6 0 1 0-5.1-5.1l-1 1M13.6 10.4a3.6 3.6 0 0 0-5.1 0l-2.8 2.8a3.6 3.6 0 1 0 5.1 5.1l1-1" />,
  filter: <path d="M3.6 5.4h16.8l-6.6 7.6v5.4l-3.6 2v-7.4L3.6 5.4Z" />,
  save: <><path d="M5.4 4.4h10.2L19.6 8.4v11.2H5.4Z" /><path d="M8.6 4.4v5h6.2v-5M8.2 19.6v-5.4h7.6v5.4" /></>,
  book: <path d="M4.4 4.6h6.2a2.6 2.6 0 0 1 2.6 2.6v12a2 2 0 0 0-2-2H4.4V4.6ZM19.6 4.6h-6.2a2.6 2.6 0 0 0-2.6 2.6v12a2 2 0 0 1 2-2h6.8V4.6Z" />,
  target: <><circle cx="12" cy="12" r="8.4" /><circle cx="12" cy="12" r="4.4" /><circle cx="12" cy="12" r="1" /></>,
  wand: <path d="m5 19 9.4-9.4M16.4 7.6 19 5M12.6 4.2l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2ZM19 11l.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4-1.4-.5 1.4-.5.5-1.4Z" />,
  drag: <><circle cx="9" cy="6" r="1.4" /><circle cx="15" cy="6" r="1.4" /><circle cx="9" cy="12" r="1.4" /><circle cx="15" cy="12" r="1.4" /><circle cx="9" cy="18" r="1.4" /><circle cx="15" cy="18" r="1.4" /></>,
};

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName | string;
  size?: number;
  strokeWidth?: number;
}

export function Icon({ name, size = 20, strokeWidth = 1.7, ...rest }: IconProps) {
  const node = P[name as IconName] ?? P.dot;
  const filled = name === 'play' || name === 'dot' || name === 'moon' || name === 'zap' || name === 'stop' || name === 'filter' || name === 'pen';
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false" {...rest}
    >
      {filled ? <g fill="currentColor" stroke="currentColor" strokeWidth={strokeWidth * 0.6}>{node}</g> : node}
    </svg>
  );
}

/** Logogram Ziva — heksagon simpul dengan jalur "Z". */
export function ZivaMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="zvg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-1)" />
          <stop offset="1" stopColor="var(--brand-2)" />
        </linearGradient>
      </defs>
      <path d="M20 2.6 34.5 11v18L20 37.4 5.5 29V11L20 2.6Z" fill="url(#zvg)" opacity=".16" />
      <path d="M20 2.6 34.5 11v18L20 37.4 5.5 29V11L20 2.6Z" stroke="url(#zvg)" strokeWidth="1.6" />
      <path d="M13.5 13.6h13L14 26.4h13" stroke="url(#zvg)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="13.5" cy="13.6" r="2.6" fill="var(--brand-1)" />
      <circle cx="27" cy="26.4" r="2.6" fill="var(--brand-2)" />
    </svg>
  );
}

/** Ornamen sudut SVG untuk kartu — 4 sudut membingkai konten. */
export function CornerFrame({ inset = 10, len = 16, className = '' }: { inset?: number; len?: number; className?: string }) {
  const c = 'pointer-events-none absolute text-[var(--corner)] transition-colors duration-500';
  const s: React.CSSProperties = { width: len, height: len };
  return (
    <span className={`ziva-corners ${className}`} aria-hidden="true">
      <svg className={`${c} top-0 left-0`} style={{ ...s, margin: inset }} viewBox="0 0 16 16" fill="none">
        <path d="M15 1H4.6A3.6 3.6 0 0 0 1 4.6V15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <svg className={`${c} top-0 right-0`} style={{ ...s, margin: inset }} viewBox="0 0 16 16" fill="none">
        <path d="M1 1h10.4A3.6 3.6 0 0 1 15 4.6V15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <svg className={`${c} bottom-0 left-0`} style={{ ...s, margin: inset }} viewBox="0 0 16 16" fill="none">
        <path d="M1 1v10.4A3.6 3.6 0 0 0 4.6 15H15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <svg className={`${c} bottom-0 right-0`} style={{ ...s, margin: inset }} viewBox="0 0 16 16" fill="none">
        <path d="M15 1v10.4A3.6 3.6 0 0 1 11.4 15H1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}
