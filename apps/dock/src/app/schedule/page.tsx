import { Badge, PageHeader } from '@moonwitness/moonui'
import { headers } from 'next/headers'
import { nowPlaying } from '@/data/queries/catalog'
import { serverClient } from '@/data/sdk'
import { todayWeekday } from '@/lib/time'
import { NowPlayingCard, WeekGrid } from '@/ui/components/sections'
import { DOCK_LOCALE_HEADER, localeFromMiddlewareHeader } from '@/lib/locale-context.mjs'

export const dynamic = 'force-dynamic'

export default async function SchedulePage() {
  const requestHeaders = await headers()
  const locale = localeFromMiddlewareHeader(requestHeaders.get(DOCK_LOCALE_HEADER))
  const [now, week] = await Promise.all([nowPlaying(), serverClient().view('weeklySchedule').read({ limit: 100 })])

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title="Signal Archive & Schedule"
        subtitle={`Weekly transmission grid · ${week.rows.length} slots · UTC`}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Archive' }]}
        actions={<Badge tone="cyan">{week.rows.length} active slots</Badge>}
      />
      <NowPlayingCard now={now} locale={locale} />
      <WeekGrid slots={week.rows} today={todayWeekday()} locale={locale} />
    </div>
  )
}
