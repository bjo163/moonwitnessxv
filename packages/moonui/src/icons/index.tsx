import type { ReactNode } from 'react'

export interface IconProps {
  size?: number
  color?: string
  className?: string
  strokeWidth?: number
}

function svg(paths: ReactNode, { size = 20, color = 'currentColor', className, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {paths}
    </svg>
  )
}

export function IconRadio(props: IconProps): ReactNode {
  return svg(
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
    </>,
    props,
  )
}

export function IconPlay(props: IconProps): ReactNode {
  return svg(<polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />, props)
}

export function IconPause(props: IconProps): ReactNode {
  return svg(
    <>
      <rect x="6" y="4" width="4" height="16" fill="currentColor" />
      <rect x="14" y="4" width="4" height="16" fill="currentColor" />
    </>,
    props,
  )
}

export function IconSkip(props: IconProps): ReactNode {
  return svg(
    <>
      <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" />
      <line x1="19" y1="5" x2="19" y2="19" />
    </>,
    props,
  )
}

export function IconVolume(props: IconProps): ReactNode {
  return svg(
    <>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </>,
    props,
  )
}

export function IconVolumeMute(props: IconProps): ReactNode {
  return svg(
    <>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </>,
    props,
  )
}

export function IconSliders(props: IconProps): ReactNode {
  return svg(
    <>
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </>,
    props,
  )
}

export function IconRadar(props: IconProps): ReactNode {
  return svg(
    <>
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
      <path d="M12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4z" />
      <line x1="12" y1="12" x2="20" y2="6" strokeWidth="2.5" />
    </>,
    props,
  )
}

export function IconSignal(props: IconProps): ReactNode {
  return svg(
    <>
      <path d="M2 20h.01" />
      <path d="M7 20v-4" />
      <path d="M12 20v-8" />
      <path d="M17 20V8" />
      <path d="M22 20V4" />
    </>,
    props,
  )
}

export function IconShield(props: IconProps): ReactNode {
  return svg(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, props)
}

export function IconTerminal(props: IconProps): ReactNode {
  return svg(
    <>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </>,
    props,
  )
}

export function IconGlobe(props: IconProps): ReactNode {
  return svg(
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </>,
    props,
  )
}

export function IconLayers(props: IconProps): ReactNode {
  return svg(
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </>,
    props,
  )
}

export function IconActivity(props: IconProps): ReactNode {
  return svg(<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />, props)
}

export function IconCrosshair(props: IconProps): ReactNode {
  return svg(
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="22" y1="12" x2="18" y2="12" />
      <line x1="6" y1="12" x2="2" y2="12" />
      <line x1="12" y1="6" x2="12" y2="2" />
      <line x1="12" y1="22" x2="12" y2="18" />
    </>,
    props,
  )
}

export function IconCrown(props: IconProps): ReactNode {
  return svg(
    <>
      <path d="M3 20L5.5 6L12 14L18 4L24 14L30.5 6L33 20H3Z" />
      <line x1="4" y1="22" x2="32" y2="22" />
    </>,
    props,
  )
}

export function IconEye(props: IconProps): ReactNode {
  return svg(
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </>,
    props,
  )
}

export function IconMoon(props: IconProps): ReactNode {
  return svg(<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />, props)
}

export function IconSparkles(props: IconProps): ReactNode {
  return svg(
    <>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </>,
    props,
  )
}

export function IconFlame(props: IconProps): ReactNode {
  return svg(
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
    props,
  )
}

export function IconTape(props: IconProps): ReactNode {
  return svg(
    <>
      <rect x="2" y="7" width="20" height="10" rx="1" transform="rotate(-3 12 12)" />
      <line x1="6" y1="12" x2="18" y2="12" strokeDasharray="2 2" />
    </>,
    props,
  )
}

export function IconCompass(props: IconProps): ReactNode {
  return svg(
    <>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" />
    </>,
    props,
  )
}

export function IconBookOpen(props: IconProps): ReactNode {
  return svg(
    <>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </>,
    props,
  )
}

export function IconCpu(props: IconProps): ReactNode {
  return svg(
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="14" x2="4" y2="14" />
    </>,
    props,
  )
}

export function IconClock(props: IconProps): ReactNode {
  return svg(
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>,
    props,
  )
}

export function IconLock(props: IconProps): ReactNode {
  return svg(
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>,
    props,
  )
}

export function IconKey(props: IconProps): ReactNode {
  return svg(
    <>
      <path d="m21 2-2 2m-1.5 1.5L19 7l-2 2-2-2-1.5 1.5M10.5 13.5A6 6 0 1 1 2 12a6 6 0 0 1 8.5 1.5Z" />
    </>,
    props,
  )
}

export function IconShare(props: IconProps): ReactNode {
  return svg(
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </>,
    props,
  )
}

export function IconRefresh(props: IconProps): ReactNode {
  return svg(
    <>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </>,
    props,
  )
}

export function IconAlertTriangle(props: IconProps): ReactNode {
  return svg(
    <>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>,
    props,
  )
}

export function IconCheckCircle(props: IconProps): ReactNode {
  return svg(
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </>,
    props,
  )
}

export function IconSearch(props: IconProps): ReactNode {
  return svg(
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>,
    props,
  )
}
