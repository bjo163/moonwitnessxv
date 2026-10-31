import type { HTMLAttributes, ReactNode, CSSProperties } from 'react'
import { cn } from './cn.js'

export type CardVariant = 'default' | 'art' | 'outline' | 'ghost' | 'shadow' | 'paper'

export function Card({
  children,
  variant = 'default',
  bgImage,
  className,
  id,
  style,
}: {
  children: ReactNode
  variant?: CardVariant
  bgImage?: string
  className?: string
  id?: string
  style?: CSSProperties
}): ReactNode {
  return (
    <div
      id={id}
      className={cn('m-card', className)}
      data-variant={variant}
      style={bgImage ? { backgroundImage: `url(${bgImage})`, ...style } : style}
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

/** A status word. `title` is passed through so a badge can carry its own tooltip. */
export function Badge({
  children,
  tone,
  ...rest
}: { children: ReactNode; tone?: BadgeTone } & HTMLAttributes<HTMLSpanElement>): ReactNode {
  return (
    <span className="m-badge" data-tone={tone} {...rest}>
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

export interface StatStripItem {
  value: ReactNode
  label: ReactNode
}

/**
 * Value/label strip. The page owns the band (position, height); the `<b>`/`<span>`
 * anatomy and its tokens belong to MoonUI. `column` is the stacked form a narrow
 * paper card needs — the page must not re-declare the anatomy to get it.
 */
export function StatStrip({
  items,
  className,
  as: Tag = 'div',
  orientation = 'row',
}: {
  items: StatStripItem[]
  className?: string
  as?: 'div' | 'section'
  orientation?: 'row' | 'column'
}): ReactNode {
  return (
    <Tag className={cn('m-stat-strip', className)} data-orientation={orientation}>
      {items.map((item, index) => (
        <div className="m-stat-strip-item" key={`${index}-${String(item.label)}`}>
          <b>{item.value}</b>
          <span>{item.label}</span>
        </div>
      ))}
    </Tag>
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

export function Alert({
  children,
  tone,
  role,
  live,
}: {
  children: ReactNode
  tone?: 'hot' | 'ok' | 'accent'
  /** `alert` interrupts, `status` announces politely; omitted means presentational. */
  role?: 'alert' | 'status'
  live?: 'polite' | 'assertive'
}): ReactNode {
  return (
    <div
      className="m-alert"
      data-tone={tone}
      role={role}
      aria-live={live ?? (role === 'status' ? 'polite' : undefined)}
    >
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
