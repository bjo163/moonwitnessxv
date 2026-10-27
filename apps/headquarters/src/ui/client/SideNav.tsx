'use client'

import { usePathname } from 'next/navigation'
import type { Locale } from '@moonwitness/core'
import { Nav, type NavGroup } from '@moonwitness/moonui'
import { activeKeyFor } from '@/data/queries/registry'

/**
 * client-side highlight only: the groups and their localized labels come from
 * the server (M19-21 shell catalog). `locale` marks the localized navigation
 * subtree so assistive technology reads the shell in the negotiated language.
 * The `mc:*` keys stay untranslated identifiers; only labels are localized.
 */
export function SideNav({ groups, locale }: { groups: NavGroup[]; locale: Locale }) {
  const pathname = usePathname()
  return (
    <div lang={locale}>
      <Nav groups={groups} activeKey={activeKeyFor(groups, pathname)} />
    </div>
  )
}
