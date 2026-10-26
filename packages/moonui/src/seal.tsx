import type { ReactNode } from 'react'
import { createPrng } from './avatar/prng.js'
import { cn } from './cn.js'

export interface StationSealProps {
  stationId: string
  name: string
  genre?: string
  size?: number
  className?: string
}

const SEAL_PALETTE = ['#00d4ff', '#ff007a', '#ffd400', '#00e676', '#9d4edd', '#1da1f2']

/**
 * Procedural Algorithmic Heraldic Seal for Radio Stations
 *
 * Replaces blurry third-party raster logos with mathematically deterministic
 * vector SVG seals generated directly from station metadata.
 */
export function StationSeal({
  stationId,
  name,
  genre = 'RADIO',
  size = 56,
  className,
}: StationSealProps): ReactNode {
  const seed = `${stationId}:${name}:${genre}`
  const prng = createPrng(seed)
  const primaryColor = SEAL_PALETTE[Math.floor(prng() * SEAL_PALETTE.length)] ?? '#00d4ff'
  const secondaryColor = SEAL_PALETTE[Math.floor(prng() * SEAL_PALETTE.length)] ?? '#ffd400'

  // Constructivist Monogram: take first 2 letters
  const code = (name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2) || 'MR').toUpperCase()

  // Generate 8 radial frequency tick marks
  const ticks: ReactNode[] = []
  for (let i = 0; i < 8; i++) {
    const angle = (i * 45 * Math.PI) / 180
    const x1 = 32 + 25 * Math.cos(angle)
    const y1 = 32 + 25 * Math.sin(angle)
    const x2 = 32 + 29 * Math.cos(angle)
    const y2 = 32 + 29 * Math.sin(angle)
    ticks.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={i % 2 === 0 ? primaryColor : 'rgba(247, 244, 236, 0.5)'}
        strokeWidth="2"
      />,
    )
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={cn('m-station-seal', className)}
      role="img"
      aria-label={`${name} Insignia Seal`}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        borderRadius: '50%',
        background: '#0b0912',
        border: '2px solid rgba(247, 244, 236, 0.45)',
        boxShadow: '3px 3px 0 #000000',
        flexShrink: 0,
      }}
    >
      {/* Outer Ticks */}
      {ticks}
      {/* Outer Ring */}
      <circle cx="32" cy="32" r="24" fill="none" stroke={primaryColor} strokeWidth="2" />
      {/* Dashed Sub-Ring */}
      <circle
        cx="32"
        cy="32"
        r="20"
        fill="#13101d"
        stroke={secondaryColor}
        strokeWidth="1.5"
        strokeDasharray="4 2"
      />
      {/* Center Brutalist Monogram */}
      <text
        x="32"
        y="38"
        textAnchor="middle"
        fontFamily="Impact, Anton, Arial Black, sans-serif"
        fontSize="17"
        fontWeight="900"
        fill="#f7f4ec"
        letterSpacing="0.05em"
      >
        {code}
      </text>
      {/* Mini Callout Arc */}
      <path
        d="M 20 46 A 16 16 0 0 0 44 46"
        fill="none"
        stroke={primaryColor}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
