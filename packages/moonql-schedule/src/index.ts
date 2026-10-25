import { WEEKDAYS, minutesOf, weekdayIndex } from '@moonwitness/core'
import { ADMIN_WRITE, bool, computed, defineAddon, defineModel, defineView, int, m2o, sel, str } from '@moonwitness/moonql'

// the calendar-week order and the "minutes since UTC midnight" convention come
// from @moonwitness/core, so the hub, this addon and the public site agree
const DAYS = WEEKDAYS

/**
 * moonql-schedule — program slots for the radio hub.
 * The showcase for the view-driven method: `nowPlaying` re-evaluates its
 * filter on every request ({ now }), `upcoming` is a static projection.
 */
export const schedule = defineAddon({
  name: 'schedule',
  version: '1.0.0',
  depends: ['radio'],
  models: {
    schedule_slots: defineModel({
      label: 'Program slot',
      rest: true,
      fields: {
        title: str({ maxLength: 120 }),
        host: str({ maxLength: 80, null: true }),
        stationRef: m2o('stations', { index: true }),
        weekday: sel(DAYS),
        // Position of the weekday in the calendar week (0 = Sun), stored so SQL can
        // order by it (`weekday` alone sorts alphabetically: fri, mon, sat…).
        // A stored compute — the engine recalculates it on every insert and update,
        // on both engines — so no hook and no repair cron is needed here.
        dayIndex: computed({ type: 'number', deps: ['weekday'], store: true, get: (row) => weekdayIndex(row.weekday) }),
        startMin: int({
          validate: (v: number, row: Record<string, unknown>) =>
            v < 0 || v > 1439
              ? 'startMin must be between 0 and 1439'
              : typeof row.endMin === 'number' && v >= row.endMin
                ? 'startMin must be before endMin'
                : null,
        }),
        endMin: int({
          // the other direction of the same rule: a PATCH { endMin } used to be
          // able to park an interval behind its own start
          validate: (v: number, row: Record<string, unknown>) =>
            v < 1 || v > 1440
              ? 'endMin must be between 1 and 1440'
              : typeof row.startMin === 'number' && v <= row.startMin
                ? 'endMin must be after startMin'
                : null,
        }),
        live: bool({ default: true }),
      },
      unique: [['weekday', 'stationRef', 'startMin']],
      acl: ADMIN_WRITE,
      menu: { group: 'Radio', icon: '🗓️', order: 7 },
      // full-week demo grid over the REAL station catalog: every UTC weekday
      // covered morning + evening, so nowPlaying is NEVER empty at any hour
      seed: (
        [
          ['mon', 'Prambors Pagi', 'Desta', '@stations:Prambors FM Jakarta', 0, 720],
          ['mon', 'Dangdut Malam', 'Inul', '@stations:Mettaswara Dangdut', 720, 1440],
          ['tue', 'Sonora Siang', 'Naras', '@stations:Sonora FM 92 Jakarta', 0, 720],
          ['tue', 'Chill Salad', 'Ari', '@stations:SomaFM Groove Salad', 720, 1440],
          ['wed', 'Elshinta Update', 'Rina', '@stations:Elshinta FM Jakarta', 0, 720],
          ['wed', 'London After Hours', 'Zoe', '@stations:NTS Radio London', 720, 1440],
          ['thu', 'Campursari Subuh', 'Bagus', '@stations:Campursari FM Jakarta', 0, 720],
          ['thu', 'Paris Jazz', 'Camille', '@stations:FIP Paris', 720, 1440],
          ['fri', 'Seattle Indie', 'Cheryl', '@stations:KEXP Seattle', 0, 720],
          ['fri', 'New York Tonight', 'Brian', '@stations:WNYC New York', 720, 1440],
          ['sat', 'NPO Weekend', 'Sanne', '@stations:NPO Radio 1', 0, 720],
          ['sat', 'Prambors Sabtu', 'Desta', '@stations:Prambors FM Jakarta', 720, 1440],
          ['sun', 'Slow Sunday Salad', 'Ari', '@stations:SomaFM Groove Salad', 0, 720],
          ['sun', 'Closing Jazz', 'Camille', '@stations:FIP Paris', 720, 1440],
        ] as const
      ).map(([weekday, title, host, station, startMin, endMin]) => ({
        title,
        host,
        stationRef: station,
        weekday,
        startMin,
        endMin,
      })),
    }),
  },
  views: {
    nowPlaying: defineView('nowPlaying', {
      label: 'What is on the air right now',
      from: 'schedule_slots',
      select: { title: 'title', host: 'host', station: 'stationRef', startMin: 'startMin', endMin: 'endMin' },
      where: ({ now }) => ({
        weekday: DAYS[now.getUTCDay()],
        startMin: { lte: minutesOf(now) },
        endMin: { gt: minutesOf(now) },
        live: true,
      }),
      expand: ['stationRef'],
      menu: { group: 'Radio', icon: '🔴', order: 1 },
    }),
    weeklySchedule: defineView('weeklySchedule', {
      label: 'The full week grid',
      from: 'schedule_slots',
      select: { id: 'id', title: 'title', host: 'host', weekday: 'weekday', startMin: 'startMin', endMin: 'endMin', stationRef: 'stationRef' },
      expand: ['stationRef'],
      order: 'dayIndex,startMin',
      limit: 100,
      menu: { group: 'Radio', icon: '🗓️', order: 2 },
    }),
    upcoming: defineView('upcoming', {
      label: 'Live program slots',
      from: 'schedule_slots',
      select: { title: 'title', host: 'host', weekday: 'weekday', startMin: 'startMin', endMin: 'endMin' },
      where: { live: true },
      order: 'dayIndex,startMin',
      limit: 24,
      menu: { group: 'Radio', order: 3 },
    }),
  },
})

export default schedule
