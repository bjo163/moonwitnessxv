import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from './cn.js'

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'content'> {
  content: ReactNode
  position?: TooltipPosition
  children: ReactNode
}

/**
 * Tactical Cyber Tooltip with subtle high-contrast border and monospace label.
 */
export function Tooltip({
  content,
  position = 'top',
  children,
  className,
  ...rest
}: TooltipProps): ReactNode {
  return (
    <span className={cn('m-tooltip-wrapper', className)} tabIndex={0} {...rest}>
      {children}
      <span role="tooltip" className="m-tooltip" data-pos={position}>
        {content}
      </span>
    </span>
  )
}

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  width?: string | number
  height?: string | number
  rounded?: boolean
}

/**
 * Shimmering Monospace Phosphor Skeleton Loader
 */
export function Skeleton({
  width,
  height = '1rem',
  rounded,
  className,
  style,
  ...rest
}: SkeletonProps): ReactNode {
  return (
    <span
      className={cn('m-skeleton', rounded ? 'rounded-full' : '', className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      aria-hidden="true"
      {...rest}
    />
  )
}

/**
 * Pre-composed Skeleton for Cards and Modules
 */
export function CardSkeleton({ className }: { className?: string }): ReactNode {
  return (
    <div
      className={cn('m-card', className)}
      style={{ padding: 'var(--s3)', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}
      aria-hidden="true"
    >
      <Skeleton height="1.25rem" width="40%" />
      <Skeleton height="0.875rem" width="85%" />
      <Skeleton height="0.875rem" width="60%" />
    </div>
  )
}

/**
 * Pre-composed Skeleton for DataTables and tabular telemetry
 */
export function TableSkeleton({
  rows = 5,
  cols = 4,
  className,
}: {
  rows?: number
  cols?: number
  className?: string
}): ReactNode {
  return (
    <div
      className={cn('m-table-wrap', className)}
      style={{ padding: 'var(--s2)', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}
      aria-hidden="true"
    >
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} style={{ display: 'flex', gap: 'var(--s3)', alignItems: 'center' }}>
          {Array.from({ length: cols }).map((_, cIdx) => (
            <Skeleton key={cIdx} height="1rem" width={cIdx === 0 ? '30%' : '20%'} />
          ))}
        </div>
      ))}
    </div>
  )
}

export interface GlitchTextProps extends HTMLAttributes<HTMLSpanElement> {
  text: string
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'div'
}

/**
 * Cyberpunk Chromatic Aberration & Glitch Typography
 */
export function GlitchText({
  text,
  as: Component = 'span',
  className,
  ...rest
}: GlitchTextProps): ReactNode {
  return (
    <Component className={cn('m-glitch', className)} data-text={text} {...rest}>
      {text}
    </Component>
  )
}

export type CyberTone = 'cyan' | 'pink' | 'accent' | 'ok'

export interface CyberFrameProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CyberTone
  children?: ReactNode
}

/**
 * Tactical Cybernetic HUD Container with Neon Corner Brackets
 */
export function CyberFrame({
  tone = 'cyan',
  children,
  className,
  ...rest
}: CyberFrameProps): ReactNode {
  return (
    <div className={cn('m-cyber-frame', className)} data-tone={tone} {...rest}>
      {children}
    </div>
  )
}
