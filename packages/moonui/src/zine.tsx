import type { ReactNode } from 'react'
import { cn } from './cn.js'
import { ProgressBar, type ProgressTone } from './data.js'

export type CrownTone = 'gold' | 'cyan' | 'pink'
export type CrownSize = 'sm' | 'md' | 'lg'

/**
 * Hand-drawn 3-point Basquiat crown SVG — the shared signature icon across
 * Dock, Headquarters, and Login.
 */
export function Crown({
  tone = 'gold',
  size = 'md',
  className,
}: {
  tone?: CrownTone
  size?: CrownSize
  className?: string
}): ReactNode {
  const dims = size === 'sm' ? { w: 18, h: 13 } : size === 'lg' ? { w: 34, h: 24 } : { w: 24, h: 18 }
  return (
    <svg
      className={cn('m-crown-svg', className)}
      data-tone={tone}
      data-size={size}
      viewBox="0 0 36 26"
      width={dims.w}
      height={dims.h}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 22L5.5 6L13 15L18 3L23 15L30.5 6L33 22H3Z"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 24.5H32" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

export type TapeTone = 'accent' | 'pink' | 'cyan' | 'paper'

/** Tilted zine masking-tape label strip (e.g. "TRANSMISSION 001", "STORYTELLING") */
export function Tape({
  children,
  tone = 'accent',
  className,
}: {
  children: ReactNode
  tone?: TapeTone
  className?: string
}): ReactNode {
  return (
    <span className={cn('m-tape', className)} data-tone={tone}>
      {children}
    </span>
  )
}

export type ZineNoteTone = 'paper' | 'accent' | 'pink' | 'dark' | 'cyan'
export type ZineNoteTilt = 'left' | 'right' | 'none'

/** Torn-paper zine callout note or street-art sticker */
export function ZineNote({
  children,
  tone = 'paper',
  tilt = 'left',
  className,
}: {
  children: ReactNode
  tone?: ZineNoteTone
  tilt?: ZineNoteTilt
  className?: string
}): ReactNode {
  return (
    <div className={cn('m-zine-sticker', className)} data-tone={tone} data-tilt={tilt}>
      {children}
    </div>
  )
}

/** Unified Moonwitness brand mark with crown and optional empire subtitle */
export function BrandLogo({
  href = '/',
  subtitle,
  size = 'md',
  className,
}: {
  href?: string
  subtitle?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}): ReactNode {
  return (
    <div className={cn('m-brand-wrap', className)} data-size={size}>
      <a href={href} className="m-brand-link">
        <Crown tone="gold" size={size === 'lg' ? 'lg' : 'md'} />
        <span className="m-brand">
          MOON<span>WITNESS</span>
        </span>
      </a>
      {subtitle ? <div className="m-brand-sub">{subtitle}</div> : null}
    </div>
  )
}

export type ModuleTone = 'pink' | 'cyan' | 'purple' | 'yellow'

/**
 * Interactive bento / module card with neon icon badge, title, crown,
 * description, status metrics, and arrow indicator.
 */
export function ModuleCard({
  href,
  icon,
  tone = 'pink',
  title,
  description,
  metrics,
  compact = false,
}: {
  href: string
  icon: ReactNode
  tone?: ModuleTone
  title: ReactNode
  description?: ReactNode
  metrics?: ReactNode
  compact?: boolean
}): ReactNode {
  return (
    <a href={href} className="m-module-card" data-compact={compact ? 'true' : 'false'}>
      <div className="m-module-icon" data-tone={tone}>
        {icon}
      </div>
      <div className="m-module-info">
        <div className="m-module-head">
          <strong>{title}</strong>
          <Crown tone="gold" size="sm" />
        </div>
        {description ? <p>{description}</p> : null}
        {metrics ? <div className="m-module-metrics">{metrics}</div> : null}
      </div>
      <span className="m-module-arrow" aria-hidden="true">
        →
      </span>
    </a>
  )
}

/**
 * Vertical comic/poster card with artwork thumbnail, overlay title,
 * status pill, and unified progress bar.
 */
export function PosterCard({
  href,
  title,
  image,
  status,
  tone = 'cyan',
  progress,
}: {
  href: string
  title: string
  image: string
  status: string
  tone?: ProgressTone
  progress: number
}): ReactNode {
  return (
    <a href={href} className="m-poster-card">
      <div className="m-poster-art-wrap">
        <img src={image} alt={title} className="m-poster-art" />
        <div className="m-poster-title">{title}</div>
      </div>
      <div className="m-poster-foot">
        <div className="m-poster-status-row">
          <span className="m-poster-pill" data-tone={tone}>
            {status}
          </span>
          <span className="m-mono">{progress}%</span>
        </div>
        <ProgressBar value={progress} tone={tone} size="sm" />
      </div>
    </a>
  )
}
