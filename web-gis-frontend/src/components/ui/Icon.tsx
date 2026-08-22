export type IconName =
  | 'dashboard'
  | 'map'
  | 'list'
  | 'qr'
  | 'search'
  | 'plus'
  | 'refresh'
  | 'close'
  | 'alert'
  | 'sprout'
  | 'area'
  | 'truck'
  | 'menu'
  | 'chevron-right'
  | 'layers'
  | 'pen'
  | 'target'
  | 'inbox'
  | 'shield'
  | 'sun'
  | 'moon'
  | 'cloud'
  | 'cloud-rain'
  | 'wind'
  | 'droplet'
  | 'thermometer'
  | 'maximize'
  | 'minimize'
  | 'phone'
  | 'map-pin';

const PATHS: Record<IconName, React.ReactNode> = {
  phone: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
  'map-pin': (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  map: (
    <>
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </>
  ),
  list: (
    <>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
    </>
  ),
  qr: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M14 14h3v3h-3zM20 14v.01M14 20v.01M20 20v.01" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  refresh: (
    <>
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 4v5h-5" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  alert: (
    <>
      <path d="M10.3 3.9 2.4 17.5A1.9 1.9 0 0 0 4 20.4h16a1.9 1.9 0 0 0 1.6-2.9L13.7 3.9a1.9 1.9 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  sprout: (
    <>
      <path d="M7 20h10" />
      <path d="M12 20V9" />
      <path d="M12 9C12 6 9.5 4 6 4c0 3.5 2.5 5 6 5Z" />
      <path d="M12 11c0-2.8 2.3-5 5.5-5 0 3.2-2.3 5-5.5 5Z" />
    </>
  ),
  area: (
    <>
      <path d="M4 4h16v16H4z" />
      <path d="M4 14h6v6M14 4v6h6" />
    </>
  ),
  truck: (
    <>
      <path d="M2 7h11v9H2zM13 10h4l3 3v3h-7" />
      <circle cx="6" cy="18" r="1.8" />
      <circle cx="17" cy="18" r="1.8" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  'chevron-right': <path d="m9 5 7 7-7 7" />,
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
  pen: (
    <>
      <path d="M15.5 4.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      <path d="m14 6 3 3" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.2" />
    </>
  ),
  inbox: (
    <>
      <path d="M3 12h5l1.5 3h5L16 12h5" />
      <path d="M4.6 5.5 3 12v6.5A1.5 1.5 0 0 0 4.5 20h15a1.5 1.5 0 0 0 1.5-1.5V12l-1.6-6.5A1.5 1.5 0 0 0 18 4.5H6a1.5 1.5 0 0 0-1.4 1Z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v6c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </>
  ),
  moon: (
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  ),
  cloud: (
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
  ),
  'cloud-rain': (
    <>
      <path d="M17.5 16H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      <path d="M8 19v2M12 19v2M16 19v2" />
    </>
  ),
  wind: (
    <>
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </>
  ),
  droplet: (
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-6-1.5-1.5-3-3.5-4-6-1 2.5-2.5 4.5-4 6-2 2.1-3 4-3 6a7 7 0 0 0 7 7Z" />
  ),
  thermometer: (
    <>
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </>
  ),
  maximize: (
    <>
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </>
  ),
  minimize: (
    <>
      <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
    </>
  ),
};

interface Props {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 17, className }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
