import { nowPlaying } from '@/data/queries/catalog'
import { serverClient } from '@/data/sdk'
import { todayWeekday } from '@/lib/time'
import { NowPlayingCard, WeekGrid } from '@/ui/components/sections'

export const dynamic = 'force-dynamic'

export default async function SchedulePage() {
  const [now, week] = await Promise.all([nowPlaying(), serverClient().view('weeklySchedule').read({ limit: 100 })])

  return (
    <div className="m-stack" style={{ gap: 20 }}>
      <div className="dk-card-label">Weekly grid · {week.rows.length} slots · UTC</div>
      <NowPlayingCard now={now} />
      <WeekGrid slots={week.rows} today={todayWeekday()} />
    </div>
  )
}
