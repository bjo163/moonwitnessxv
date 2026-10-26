import type { ReactNode, KeyboardEvent } from 'react'
import { cn } from './cn.js'
import { Glyph } from './glyph.js'
import { triggerHaptic } from './client/haptics.js'

export interface NavItem {
  key: string
  label: string
  href: string
  /** 2-3 letter monogram shown in the <Glyph> tile; falls back to the label */
  icon?: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

/** grouped sidebar navigation; `activeKey` is the current route key */
export function Nav({ groups, activeKey }: { groups: NavGroup[]; activeKey?: string }): ReactNode {
  return (
    <nav className="m-stack" aria-label="Primary">
      {groups
        .filter((group) => group.items.length > 0)
        .map((group) => (
          <div className="m-nav-group" key={group.label}>
            <span className="m-nav-label">{group.label}</span>
            {group.items.map((item) => (
              <a
                key={item.key}
                className="m-nav-item"
                href={item.href}
                data-active={item.key === activeKey ? 'true' : 'false'}
              >
                <Glyph code={item.icon ?? item.label} tone={item.key === activeKey ? 'ink' : 'pink'} size="sm" />
                {item.label}
              </a>
            ))}
          </div>
        ))}
    </nav>
  )
}

export function TabBar({ tabs, activeKey }: { tabs: NavItem[]; activeKey?: string }): ReactNode {
  return (
    <div className="m-tabbar">
      {tabs.map((tab) => (
        <a key={tab.key} className="m-tab" href={tab.href} data-active={tab.key === activeKey ? 'true' : 'false'}>
          {tab.label}
        </a>
      ))}
    </div>
  )
}

export interface TabItem {
  id: string
  label: ReactNode
  count?: number
  tone?: 'pink' | 'cyan' | 'accent' | 'ok'
}

/** Controlled client tab switcher with punk-zine styling and roving tabindex ARIA navigation */
export function Tabs({
  items,
  activeId,
  onChange,
  className,
  haptic = true,
}: {
  items: TabItem[]
  activeId: string
  onChange: (id: string) => void
  className?: string
  haptic?: boolean
}): ReactNode {
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let nextIndex = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % items.length
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + items.length) % items.length
    } else if (e.key === 'Home') {
      nextIndex = 0
    } else if (e.key === 'End') {
      nextIndex = items.length - 1
    }
    const nextTab = items[nextIndex]
    if (nextIndex >= 0 && nextTab) {
      e.preventDefault()
      if (haptic) triggerHaptic('switch')
      onChange(nextTab.id)
      const parent = e.currentTarget.parentElement
      if (parent) {
        const buttons = parent.querySelectorAll<HTMLButtonElement>('button[role="tab"]')
        buttons[nextIndex]?.focus()
      }
    }
  }

  return (
    <div className={cn('m-tabs', className)} role="tablist">
      {items.map((tab, idx) => {
        const isActive = tab.id === activeId
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            tabIndex={isActive ? 0 : -1}
            aria-selected={isActive}
            className="m-tab-btn"
            data-active={isActive ? 'true' : 'false'}
            data-tone={tab.tone ?? 'cyan'}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            onClick={() => {
              if (haptic) triggerHaptic('switch')
              onChange(tab.id)
            }}
          >
            <span>{tab.label}</span>
            {typeof tab.count === 'number' ? <span className="m-tab-badge">{tab.count}</span> : null}
          </button>
        )
      })}
    </div>
  )
}

export function UserChip({ name, detail }: { name: string; detail?: string }): ReactNode {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
  return (
    <span className={cn('m-user-chip')}>
      <span className="m-avatar">{initials || '?'}</span>
      <span>
        {name}
        {detail ? <span className="m-muted"> · {detail}</span> : null}
      </span>
    </span>
  )
}
