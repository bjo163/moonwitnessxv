import type { ReactNode } from 'react'
import { cn } from './cn.js'

export interface Breadcrumb {
  label: string
  href?: string
}

export function Breadcrumbs({ items }: { items: Breadcrumb[] }): ReactNode {
  return (
    <nav className="m-breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="m-row" style={{ gap: 6 }}>
          {index > 0 ? <span className="m-sep">/</span> : null}
          {item.href ? <a href={item.href}>{item.label}</a> : <span>{item.label}</span>}
        </span>
      ))}
    </nav>
  )
}

export function Card({ children, className }: { children: ReactNode; className?: string }): ReactNode {
  return <section className={cn('m-card', className)}>{children}</section>
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

export function CardBody({ children }: { children: ReactNode }): ReactNode {
  return <div className="m-card-body">{children}</div>
}

/** card + optional header in one call (the common case in a page) */
export function Panel({
  title,
  subtitle,
  actions,
  children,
  className,
}: {
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}): ReactNode {
  return (
    <Card className={className}>
      {title ? <CardHeader title={title} subtitle={subtitle} actions={actions} /> : null}
      <CardBody>{children}</CardBody>
    </Card>
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
    <div className="m-stack" style={{ gap: 8 }}>
      {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}
      <div className="m-page-header">
        <div>
          <h1>{title}</h1>
          {subtitle ? <p className="m-page-sub">{subtitle}</p> : null}
        </div>
        {actions ? <div className="m-actions">{actions}</div> : null}
      </div>
    </div>
  )
}

export type BadgeTone = 'accent' | 'ok' | 'hot' | 'night' | 'moon'

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
