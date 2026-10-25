'use client'

import { usePathname } from 'next/navigation'
import { Nav, type NavGroup } from '@moonwitness/moonui'
import { activeKeyFor } from '@/data/queries/registry'

/** client-side highlight only: the groups themselves come from the server */
export function SideNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname()
  return <Nav groups={groups} activeKey={activeKeyFor(groups, pathname)} />
}
