import { Badge, CardSkeleton, PageHeader } from '@moonwitness/moonui'
import { headers } from 'next/headers'
import { nowPlaying } from '@/data/queries/catalog'
import { panelErrorMessage } from '@/data/queries/error'
import { serverClient } from '@/data/sdk'
import { todayWeekday } from '@/lib/time'
import { NowPlayingCard, WeekGrid } from '@/ui/components/sections'
import { OutcomePanel, readPanel, type PanelCopy } from '@/ui/components/states'
import { DOCK_LOCALE_HEADER, dockHrefFor, localeFromMiddlewareHeader } from '@/lib/locale-context.mjs'
import { getStatesCopy } from '@/lib/states-copy'

export const dynamic = 'force-dynamic'

type NowPlaying = Awaited<ReturnType<typeof nowPlaying>>

export default async function SchedulePage() {
  const requestHeaders = await headers()
  const locale = localeFromMiddlewareHeader(requestHeaders.get(DOCK_LOCALE_HEADER))
  const localeHref = dockHrefFor(locale)
  const copy = getStatesCopy(locale)

  const nowCopy: PanelCopy = {
    loadingLabel: copy.loadingContent,
    emptyTitle: copy.emptyNowPlaying,
    errorMessage: copy.errorScheduleUnavailable,
  }
  const gridCopy: PanelCopy = {
    loadingLabel: copy.loadingContent,
    emptyTitle: copy.emptyScheduleSlots,
    emptyHint: copy.emptyScheduleSlotsHint,
    errorMessage: copy.errorScheduleUnavailable,
  }

  // Two panels, two reads: "nothing is on air" and "the week is not seeded" are
  // different facts, and neither one may be presented as the other.
  const [nowOutcome, gridOutcome] = await Promise.all([
    readPanel<NowPlaying>(nowPlaying, nowCopy, undefined, (err) =>
      panelErrorMessage(err, copy.errorScheduleUnavailable),
    ),
    readPanel(
      () => serverClient().view('weeklySchedule').read({ limit: 100 }),
      gridCopy,
      (week) => week.rows.length === 0,
      (err) => panelErrorMessage(err, copy.errorScheduleUnavailable),
    ),
  ])

  const slotCount = gridOutcome.state === 'ready' ? gridOutcome.value.rows.length : null

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <PageHeader
        title="Signal Archive & Schedule"
        subtitle={
          slotCount === null
            ? 'Weekly transmission grid · UTC'
            : `Weekly transmission grid · ${slotCount} slots · UTC`
        }
        breadcrumbs={[{ label: 'Home', href: localeHref('/') }, { label: 'Archive' }]}
        actions={slotCount === null ? undefined : <Badge tone="cyan">{slotCount} active slots</Badge>}
      />

      <OutcomePanel outcome={nowOutcome} copy={nowCopy} skeleton={<CardSkeleton />}>
        {(now) => <NowPlayingCard now={now} locale={locale} />}
      </OutcomePanel>

      <OutcomePanel
        outcome={gridOutcome}
        copy={gridCopy}
        skeleton={
          <div className="m-grid m-grid-3" style={{ gap: 14 }}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        }
      >
        {(week) => <WeekGrid slots={week.rows} today={todayWeekday()} locale={locale} />}
      </OutcomePanel>
    </div>
  )
}
