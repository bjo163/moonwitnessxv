import type { ReactNode } from 'react'
import { createPrng } from './prng.js'
import { cn } from '../cn.js'

export type MoonAvatarVariant = 'hoodie' | 'crown' | 'matrix' | 'emblem'

export interface MoonAvatarProps {
  seed: string
  size?: number
  variant?: MoonAvatarVariant
  className?: string
  alt?: string
}

const PALETTE = ['#00d4ff', '#ff007a', '#ffd400', '#00e676', '#9d4edd', '#1da1f2']
const BG_PALETTE = ['#0b0912', '#13101d', '#1b172a', '#07060b']

/**
 * Procedural SVG Avatar Generator
 *
 * Deterministic vector generation with zero external dependencies and 0KB network payload.
 * Fully compatible with SSR (Next.js server components) and browser rendering.
 */
export function MoonAvatar({
  seed,
  size = 48,
  variant = 'hoodie',
  className,
  alt = 'Procedural Moon Avatar',
}: MoonAvatarProps): ReactNode {
  const prng = createPrng(seed)
  const eyeColor = PALETTE[Math.floor(prng() * PALETTE.length)] ?? '#00d4ff'
  const accentColor = PALETTE[Math.floor(prng() * PALETTE.length)] ?? '#ff007a'
  const bgColor = BG_PALETTE[Math.floor(prng() * BG_PALETTE.length)] ?? '#0b0912'

  if (variant === 'crown') {
    const spikeHeight = 6 + Math.floor(prng() * 8)
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        className={cn('m-avatar m-avatar-crown', className)}
        role="img"
        aria-label={alt}
        xmlns="http://www.w3.org/2000/svg"
        style={{ borderRadius: '6px', border: '2px solid rgba(247, 244, 236, 0.45)', background: bgColor }}
      >
        <rect width="48" height="48" fill={bgColor} />
        {/* Crown Body */}
        <path
          d={`M 8 36 L 10 ${20 - spikeHeight} L 19 28 L 24 ${14 - spikeHeight} L 29 28 L 38 ${20 - spikeHeight} L 40 36 Z`}
          fill="none"
          stroke={accentColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="8" y1="39" x2="40" y2="39" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" />
        {/* Tape highlight */}
        <rect
          x="14"
          y="22"
          width="20"
          height="4"
          fill="#ffd400"
          transform="rotate(-4 24 24)"
          opacity="0.85"
        />
      </svg>
    )
  }

  if (variant === 'matrix') {
    const cells: ReactNode[] = []
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const active = prng() > 0.45
        if (active) {
          cells.push(
            <rect
              key={`${r}-${c}`}
              x={10 + c * 6}
              y={10 + r * 6}
              width="5"
              height="5"
              fill={prng() > 0.3 ? eyeColor : accentColor}
            />,
          )
        }
      }
    }
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        className={cn('m-avatar m-avatar-matrix', className)}
        role="img"
        aria-label={alt}
        xmlns="http://www.w3.org/2000/svg"
        style={{ borderRadius: '4px', border: '2px solid rgba(247, 244, 236, 0.28)', background: '#07060b' }}
      >
        <rect width="48" height="48" fill="#07060b" />
        <g>{cells}</g>
        <rect x="8" y="8" width="32" height="32" fill="none" stroke="rgba(247, 244, 236, 0.22)" strokeWidth="1" />
      </svg>
    )
  }

  if (variant === 'emblem') {
    const ticks: ReactNode[] = []
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 * Math.PI) / 180
      const x1 = 24 + 16 * Math.cos(angle)
      const y1 = 24 + 16 * Math.sin(angle)
      const x2 = 24 + 19 * Math.cos(angle)
      const y2 = 24 + 19 * Math.sin(angle)
      ticks.push(
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={i % 3 === 0 ? accentColor : 'rgba(247, 244, 236, 0.45)'}
          strokeWidth="1.5"
        />,
      )
    }
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        className={cn('m-avatar m-avatar-emblem', className)}
        role="img"
        aria-label={alt}
        xmlns="http://www.w3.org/2000/svg"
        style={{ borderRadius: '50%', background: bgColor, border: `2px solid ${eyeColor}` }}
      >
        <circle cx="24" cy="24" r="22" fill={bgColor} />
        {ticks}
        <circle cx="24" cy="24" r="10" fill="none" stroke={eyeColor} strokeWidth="2" strokeDasharray="3 2" />
        <circle cx="24" cy="24" r="3" fill={accentColor} />
      </svg>
    )
  }

  // Default: "hoodie" (The iconic Moonwitness faceless silhouette)
  const eyeWidth = 4 + Math.floor(prng() * 3)
  const eyeOffset = 2 + Math.floor(prng() * 3)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={cn('m-avatar m-avatar-hoodie', className)}
      role="img"
      aria-label={alt}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        borderRadius: '8px',
        border: '2px solid rgba(247, 244, 236, 0.35)',
        background: `radial-gradient(circle at 50% 30%, ${bgColor} 0%, #07060b 100%)`,
        boxShadow: '2px 2px 0 #000000',
      }}
    >
      <rect width="48" height="48" fill="#07060b" />
      {/* Background radial accent */}
      <circle cx="24" cy="20" r="14" fill={eyeColor} opacity="0.12" />
      {/* Outer Hood Cowl */}
      <path
        d="M 10 46 C 10 28, 14 10, 24 10 C 34 10, 38 28, 38 46 Z"
        fill="#13101d"
        stroke="rgba(247, 244, 236, 0.55)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Inner Face Void */}
      <path
        d="M 16 46 C 16 32, 18 18, 24 18 C 30 18, 32 32, 32 46 Z"
        fill="#07060b"
      />
      {/* Glowing Horizon Eyes */}
      <ellipse
        cx={24 - 4 - eyeOffset}
        cy="27"
        rx={eyeWidth}
        ry="2.5"
        fill={eyeColor}
        filter="drop-shadow(0 0 3px currentColor)"
      />
      <ellipse
        cx={24 + 4 + eyeOffset}
        cy="27"
        rx={eyeWidth}
        ry="2.5"
        fill={eyeColor}
        filter="drop-shadow(0 0 3px currentColor)"
      />
      {/* Subtle Hood Seam */}
      <path d="M 24 10 L 24 17" stroke="rgba(247, 244, 236, 0.4)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
