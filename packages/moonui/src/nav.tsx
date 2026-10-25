import type { ReactNode } from 'react'
import { cn } from './cn.js'

export interface NavItem {
  key: string
  label: string
  href: string
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
                <span className="m-nav-icon">{item.icon ?? '•'}</span>
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
