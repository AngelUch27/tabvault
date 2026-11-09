import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }

function Svg({ size = 18, children, ...rest }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const PlayIcon = (p: P) => (
  <Svg {...p}>
    <path d="M7 5v14l11-7z" fill="currentColor" stroke="none" />
  </Svg>
)
export const PauseIcon = (p: P) => (
  <Svg {...p}>
    <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
    <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
  </Svg>
)
export const StopIcon = (p: P) => (
  <Svg {...p}>
    <rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor" stroke="none" />
  </Svg>
)
export const RepeatIcon = (p: P) => (
  <Svg {...p}>
    <path d="M17 2l4 4-4 4" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <path d="M7 22l-4-4 4-4" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </Svg>
)
export const MetronomeIcon = (p: P) => (
  <Svg {...p}>
    <path d="M9 3h6l3 18H6z" />
    <path d="M12 14 17 6" />
    <path d="M6.5 16h11" />
  </Svg>
)
export const FollowIcon = (p: P) => (
  <Svg {...p}>
    <path d="M12 3v18" />
    <path d="M7 8l5-5 5 5" />
    <path d="M7 16l5 5 5-5" />
  </Svg>
)
export const ZoomInIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
    <path d="M8 11h6M11 8v6" />
  </Svg>
)
export const ZoomOutIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
    <path d="M8 11h6" />
  </Svg>
)
export const LayoutIcon = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 12h18" />
  </Svg>
)
export const LayoutWideIcon = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M12 5v14" />
  </Svg>
)
export const MixerIcon = (p: P) => (
  <Svg {...p}>
    <path d="M5 4v16M12 4v16M19 4v16" />
    <circle cx="5" cy="14" r="2" fill="var(--bg)" />
    <circle cx="12" cy="8" r="2" fill="var(--bg)" />
    <circle cx="19" cy="16" r="2" fill="var(--bg)" />
  </Svg>
)
export const PlusIcon = (p: P) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)
export const MoreIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" />
  </Svg>
)
export const SearchIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </Svg>
)
export const BackIcon = (p: P) => (
  <Svg {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Svg>
)
export const HelpIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5V14" />
    <circle cx="12" cy="17.2" r=".8" fill="currentColor" stroke="none" />
  </Svg>
)
export const LogoIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="4" strokeLinecap="round">
      <line x1="10" y1="20" x2="54" y2="20" />
      <line x1="10" y1="32" x2="54" y2="32" />
      <line x1="10" y1="44" x2="54" y2="44" />
    </g>
    <circle cx="24" cy="20" r="5.5" fill="var(--accent)" />
    <circle cx="42" cy="32" r="5.5" fill="var(--accent)" />
    <circle cx="30" cy="44" r="5.5" fill="var(--accent)" />
  </svg>
)
