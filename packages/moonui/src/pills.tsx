import type { ReactNode } from 'react'
import { cn } from './cn.js'

export type PillTone = 'cyan' | 'pink' | 'accent' | 'ok' | 'hot' | 'night'

export function Pill({
  label,
  active = false,
  onClick,
  count,
  tone = 'cyan',
  className,
}: {
  label: ReactNode
  active?: boolean
  onClick?: () => void
  count?: number
  tone?: PillTone
  className?: string
}): ReactNode {
  return (
    <button
      type="button"
      className={cn('m-pill', className)}
      data-active={active ? 'true' : 'false'}
      data-tone={tone}
      onClick={onClick}
    >
      <span className="m-pill-label">{label}</span>
      {typeof count === 'number' ? <span className="m-pill-badge">{count}</span> : null}
    </button>
  )
}

export function PillGroup({
  children,
  label,
  className,
}: {
  children: ReactNode
  label?: ReactNode
  className?: string
}): ReactNode {
  return (
    <div className={cn('m-pill-group', className)}>
      {label ? <span className="m-pill-group-label">{label}</span> : null}
      <div className="m-pill-group-items">{children}</div>
    </div>
  )
}
