import type { ReactNode, CSSProperties } from 'react'
import { cn } from './cn.js'

export type CardVariant = 'default' | 'art' | 'outline' | 'ghost' | 'shadow' | 'paper'

export function Card({
  children,
  variant = 'default',
  bgImage,
  className,
  id,
}: {
  children: ReactNode
  variant?: CardVariant
  bgImage?: string
  className?: string
  id?: string
}): ReactNode {
  return (
    <div
      id={id}
      className={cn('m-card', className)}
      data-variant={variant}
      style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
    >
      {children}
    </div>
  )
}

export function CardBody({
  children,
  className,
  style,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
}): ReactNode {
  return <div className={cn('m-card-body', className)} style={style}>{children}</div>
}

export function CardHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}): ReactNode {
  return (
    <header className="m-card-header">
      <div>
        <div className="m-card-title">{title}</div>
        {subtitle ? <div className="m-stat-hint">{subtitle}</div> : null}
      </div>
      {actions ? <div className="m-actions">{actions}</div> : null}
    </header>
  )
}

export function Panel({
  title,
  subtitle,
  actions,
  children,
}: {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  children: ReactNode
}): ReactNode {
  return (
    <section className="m-panel">
      <header className="m-panel-header">
        <div>
          <h2 className="m-panel-title">{title}</h2>
          {subtitle ? <p className="m-panel-sub">{subtitle}</p> : null}
        </div>
        {actions ? <div className="m-actions">{actions}</div> : null}
      </header>
      <div className="m-panel-body">{children}</div>
    </section>
  )
}

export interface Breadcrumb {
  label: ReactNode
  href?: string
}

export function Breadcrumbs({ items }: { items: Breadcrumb[] }): ReactNode {
  return (
    <nav className="m-breadcrumbs" aria-label="Breadcrumb">
      {items.map((it, idx) => {
        const last = idx === items.length - 1
        return (
          <span key={idx} className="m-breadcrumb-item">
            {it.href && !last ? <a href={it.href}>{it.label}</a> : <span>{it.label}</span>}
            {!last ? <span className="m-breadcrumb-sep">/</span> : null}
          </span>
        )
      })}
    </nav>
  )
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
}: {
  title: ReactNode
  subtitle?: ReactNode
  breadcrumbs?: Breadcrumb[]
  actions?: ReactNode
}): ReactNode {
  return (
    <header className="m-page-header">
      <div>
        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
        <h1 className="m-page-title">{title}</h1>
        {subtitle ? <p className="m-page-sub">{subtitle}</p> : null}
      </div>
      {actions ? <div className="m-actions">{actions}</div> : null}
    </header>
  )
}

export type BadgeTone = 'accent' | 'ok' | 'hot' | 'night' | 'moon' | 'pink' | 'cyan'

export function Badge({ children, tone }: { children: ReactNode; tone?: BadgeTone }): ReactNode {
  return (
    <span className="m-badge" data-tone={tone}>
      {children}
    </span>
  )
}

export function Stat({ label, value, hint }: { label: ReactNode; value: ReactNode; hint?: ReactNode }): ReactNode {
  return (
    <div className="m-stat">
      <span className="m-stat-label">{label}</span>
      <span className="m-stat-value">{value}</span>
      {hint ? <span className="m-stat-hint">{hint}</span> : null}
    </div>
  )
}

export function StatCard({ label, value, hint }: { label: ReactNode; value: ReactNode; hint?: ReactNode }): ReactNode {
  return (
    <Card>
      <CardBody>
        <Stat label={label} value={value} hint={hint} />
      </CardBody>
    </Card>
  )
}

export function Alert({ children, tone }: { children: ReactNode; tone?: 'hot' | 'ok' | 'accent' }): ReactNode {
  return (
    <div className="m-alert" data-tone={tone}>
      {children}
    </div>
  )
}

/**
 * Standardized responsive grid for station directory cards
 */
export function StationGrid({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}): ReactNode {
  return (
    <div
      className={cn('m-station-grid', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 12,
        width: '100%',
      }}
    >
      {children}
    </div>
  )
}

/**
 * Standardized schedule grid for weekly broadcasting timeline
 */
export function ScheduleGrid({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}): ReactNode {
  return (
    <div
      className={cn('m-schedule-grid', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 14,
        width: '100%',
      }}
    >
      {children}
    </div>
  )
}

/**
 * Pinned viewport bottom player dock with brutalist shadow and glass surface
 */
export function StickyPlayerBar({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}): ReactNode {
  return (
    <aside
      className={cn('m-sticky-player-bar', className)}
      style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 40,
        width: '100%',
        backgroundColor: 'var(--surface)',
        borderTop: '2px solid rgba(247, 244, 236, 0.45)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.6)',
        padding: '10px 16px',
      }}
    >
      {children}
    </aside>
  )
}

/**
 * Two-column responsive split view (master / detail or radar / list)
 */
export function SplitView({
  left,
  right,
  leftRatio = '60%',
  className,
}: {
  left: ReactNode
  right: ReactNode
  leftRatio?: string
  className?: string
}): ReactNode {
  return (
    <div
      className={cn('m-split-view', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(320px, 1fr))`,
        gap: 16,
        width: '100%',
      }}
    >
      <div style={{ minWidth: 0, flex: leftRatio }}>{left}</div>
      <div style={{ minWidth: 0, flex: 1 }}>{right}</div>
    </div>
  )
}
