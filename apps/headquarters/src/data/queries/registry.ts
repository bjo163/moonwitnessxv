import type { ModelName, SchemaDocument } from '@moonwitness/moonql-client'
import type { NavGroup, NavItem } from '@moonwitness/moonui'
import { MODEL_NAMES } from '@moonwitness/moonql-client'

export const isModelName = (name: string): name is ModelName => (MODEL_NAMES as readonly string[]).includes(name)

/** the one place that knows HQ's URL shape (moonql only ever sees API routes) */
export function menuHref(kind: string, key: string, route: string, method?: string): string {
  if (kind === 'model') return `/models/${key}`
  if (kind === 'view') return `/views/${key}`
  if (route === '/monitor/overview') return '/world-monitor'
  const id = `${(method ?? 'get').toLowerCase()}-${route.replace(/^\/+/, '').replace(/[^a-zA-Z0-9]+/g, '-')}`
  return `/system#${id}`
}

/** sidebar groups, straight from `_schema.menu` (never hardcoded) */
export function menuGroups(doc: SchemaDocument): NavGroup[] {
  const groups = new Map<string, NavItem[]>()
  for (const item of doc.menu) {
    const bucket = groups.get(item.group) ?? []
    bucket.push({
      key: `${item.kind}:${item.key}`,
      label: item.label,
      href: menuHref(item.kind, item.key, item.route, item.method),
      ...(item.icon ? { icon: item.icon } : {}),
    })
    groups.set(item.group, bucket)
  }
  return [...groups.entries()].map(([label, items]) => ({ label, items }))
}

/** the sidebar entry that owns `pathname` (deepest match wins) */
export function activeKeyFor(groups: NavGroup[], pathname: string): string | undefined {
  let best: { key: string; length: number } | undefined
  for (const group of groups) {
    for (const item of group.items) {
      if (pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`))) {
        if (!best || item.href.length > best.length) best = { key: item.key, length: item.href.length }
      }
    }
  }
  return best?.key
}
