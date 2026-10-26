import { badRequest, byStaleness, fetchJsonWithPolicy, pseudonym, runWithBudget } from '@moonwitness/core'
import { ADMIN_FULL, busStream, defineAddon, defineModel, defineView, int, m2o, sel, str, text, ts, type BusFrame } from '@moonwitness/moonql'

/**
 * "Now playing" is not in the schedule — it is in the stream. Icecast-class
 * broadcasters publish /status-json.xsl and Shoutcast v2 publishes /json/stats,
 * both derived from the station's own URL: no extra configuration, no secrets.
 * The shapes differ, so both are tried and anything unrecognised degrades to
 * "no update" rather than an error (a third of the catalog is neither).
 */
const statusUrls = (streamUrl: string): string[] => {
  try {
    const url = new URL(streamUrl)
    const base = `${url.protocol}//${url.host}`
    return [`${base}/status-json.xsl`, `${base}/json/stats`]
  } catch {
    return []
  }
}

interface NowPlayingFact {
  track: string | null
  artist: string | null
  listeners: number | null
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

const parseNowPlaying = (body: unknown): NowPlayingFact | null => {
  // Icecast: { icestats: { source: {...} } } — a single object or one per mount
  const iceSource = asRecord(asRecord(body).icestats).source
  const mount = Array.isArray(iceSource) ? iceSource[0] : iceSource
  if (mount) {
    const m = asRecord(mount)
    const title = typeof m.songtitle === 'string' ? m.songtitle : ''
    const [artist, ...rest] = title.split(' - ')
    return {
      track: rest.length ? rest.join(' - ').trim() || null : title.trim() || null,
      artist: rest.length ? artist?.trim() || null : null,
      listeners: typeof m.listeners === 'number' ? m.listeners : null,
    }
  }
  // Shoutcast v2: { stations: [{ nametitle, listenerscurrent }] }
  const stations = asRecord(body).stations
  const sc = Array.isArray(stations) ? asRecord(stations[0]) : null
  if (sc?.nametitle) {
    const [artist, ...rest] = String(sc.nametitle).split(' - ')
    return {
      track: rest.join(' - ').trim() || String(sc.nametitle),
      artist: rest.length ? artist?.trim() || null : null,
      listeners: typeof sc.listenerscurrent === 'number' ? sc.listenerscurrent : null,
    }
  }
  return null
}

/**
 * The public beacon used to store whatever name the visitor typed, which turned
 * an append-only analytics table into unbounded personal data. A caller-visible
 * label stays possible, but what is persisted is a stable pseudonym: same person,
 * same token, no plaintext identity — and the demo seeds keep their readable
 * names because seeds never pass through this handler.
 */
const listenerToken = (value: string, salt = ''): Promise<string> => pseudonym('lp', value, salt)

/** Longest an anonymous tab may keep the on-air feed open; it reconnects after. */
const MAX_ON_AIR_SECONDS = 300

/**
 * The public feed is id-level on purpose: it says *which* station moved and what
 * is playing, and nothing else. Internal columns (row ids, the listener pseudonym,
 * source) stay off the wire because this endpoint answers to anonymous callers.
 */
const onAirFrame = ({ payload, at }: BusFrame): Record<string, unknown> => {
  const row = ((payload as { row?: Record<string, unknown> })?.row ?? {}) as Record<string, unknown>
  const model = (payload as { model?: string }).model ?? ''
  if (model === 'now_playing') {
    return { at, kind: 'track', stationRef: row.stationRef ?? null, track: row.track ?? null, artist: row.artist ?? null, listeners: row.listeners ?? null }
  }
  // the schedule grid is a pointer, not content: the dock recomputes "what is on
  // air now" from the clock, and only needs to know that the grid was edited
  if (model === 'schedule_slots') return { at, kind: 'schedule', stationRef: row.stationRef ?? null }
  return { at, kind: 'listen', stationRef: row.stationRef ?? null, event: row.event ?? null, seconds: row.seconds ?? null }
}

/**
 * moonql-playlog — listen events for the radio hub.
 * Aggregate showcase: `topStations` compiles to a real GROUP BY on pg
 * and an identical fold on the memory engine. The public view is the
 * curated face of an admin-only model (views define their own ACL).
 */
export const playlog = defineAddon({
  name: 'playlog',
  version: '1.0.0',
  depends: ['radio'],
  env: ['EGRESS_ENABLED', 'PLAYLOG_RETENTION_DAYS', 'PLAYLOG_PSEUDONYM_SALT'],
  models: {
    playlogs: defineModel({
      label: 'Play event',
      rest: true,
      // a beacon per listener session: the audit trail would grow with the audience
      // and say nothing a human reads (the charts are its own aggregation)
      audit: false,
      fields: {
        stationRef: m2o('stations', { index: true }),
        event: sel(['start', 'stop', 'skip'], { default: 'start' }),
        listener: str({ maxLength: 60, null: true, index: true }),
        /** seconds actually heard, reported when a session closes (stop/skip) */
        seconds: int({ null: true }),
      },
      // charts are admin data; a play may also be recorded by any signed-in
      // client (the public /listen beacon is separate and states its own intent)
      acl: { ...ADMIN_FULL, create: 'auth' },
      // Every real query on this table is "one station, recent, newest first":
      // the chart, the quality view and the retention purge. A single-column index
      // on either half still scans the other.
      indexes: [['stationRef', 'createdAt']],
      // demo listening week over the REAL station catalog: '@stations:<name>'
      // refs resolve against the seeded stations (radio addon runs first)
      seed: [
        { stationRef: '@stations:Prambors FM Jakarta', event: 'start', listener: 'anne' },
        { stationRef: '@stations:Prambors FM Jakarta', event: 'skip', listener: 'bob' },
        { stationRef: '@stations:Prambors FM Jakarta', event: 'start', listener: 'chen' },
        { stationRef: '@stations:Sonora FM 92 Jakarta', event: 'start', listener: 'dee' },
        { stationRef: '@stations:Sonora FM 92 Jakarta', event: 'stop', listener: 'anne' },
        { stationRef: '@stations:SomaFM Groove Salad', event: 'start', listener: 'eli' },
        { stationRef: '@stations:SomaFM Groove Salad', event: 'skip', listener: 'fay' },
        { stationRef: '@stations:KEXP Seattle', event: 'start', listener: 'gus' },
        { stationRef: '@stations:KEXP Seattle', event: 'stop', listener: 'hana' },
        { stationRef: '@stations:FIP Paris', event: 'start', listener: 'ivo' },
        { stationRef: '@stations:NTS Radio London', event: 'start', listener: 'jade' },
        { stationRef: '@stations:WNYC New York', event: 'start', listener: 'kai' },
      ],
    }),
    // one row per station: the freshest word about what is on the air right now
    now_playing: defineModel({
      label: 'Now playing',
      seedless: true, // machine-written telemetry, never demo data
      audit: false, // one row per station per poll: telemetry, not a human action
      rest: false, // read through `nowPlayingTrack`, written by the cron
      fields: {
        stationRef: m2o('stations', { unique: true }),
        track: str({ maxLength: 200, null: true }),
        artist: str({ maxLength: 120, null: true }),
        listeners: int({ null: true }),
        at: ts({ index: true }),
      },
      unique: [['stationRef']],
    }),
    /**
     * A listener request is a row, not a log line. DENPA's inbound webhook lands
     * here so the queue is queryable, sortable and closable (`status`) instead of
     * something a DJ has to scroll a terminal for. The sender arrives as a
     * pseudonym: the webhook sees an origin, the table does not.
     */
    requests: defineModel({
      label: 'Listener request',
      seedless: true,
      rest: true,
      fields: {
        stationRef: m2o('stations', { index: true }),
        message: text(),
        sender: str({ maxLength: 64, null: true, index: true }),
        status: sel(['new', 'queued', 'played', 'declined'], { default: 'new', index: true }),
      },
      acl: ADMIN_FULL,
    }),
    /**
     * The daily rollup that keeps history cheap to draw. `topStations` aggregates
     * over every row it has ever seen, so the chart's cost grows with the table;
     * this table makes the answer one read per day, at the price of a lag equal to
     * the refresh interval — which is stated, not hidden.
     */
    airplay_daily: defineModel({
      label: 'Daily airplay',
      seedless: true,
      rest: false, // written by the cron, read through `airplayDaily`
      fields: {
        stationRef: m2o('stations', { index: true }),
        /** ISO date (YYYY-MM-DD) the row summarizes */
        day: str({ maxLength: 10 }),
        sessions: int({ default: 0 }),
        /** whole seconds heard that day; null when nothing reported a duration */
        seconds: int({ null: true }),
      },
      unique: [['stationRef', 'day']],
      acl: ADMIN_FULL,
    }),
  },
  views: {
    topStations: defineView('topStations', {
      label: 'Most played stations',
      from: 'playlogs',
      aggregate: { groupBy: ['stationRef'], metrics: { plays: { fn: 'count' } } },
      // the station name travels with the chart: one request, no N+1
      expand: ['stationRef'],
      order: '-plays',
      limit: 10,
      menu: { group: 'Radio', icon: 'TS', order: 30 },
    }),
    recentPlays: defineView('recentPlays', {
      label: 'Latest listen events',
      from: 'playlogs',
      select: { station: 'stationRef', event: 'event', listener: 'listener', at: 'createdAt' },
      order: '-createdAt',
      limit: 20,
      acl: ['admin'],
      menu: { group: 'Radio', order: 31 },
    }),
    /**
     * Listen quality: how each station's sessions end, and for how long. Split by
     * `event` on purpose — one metric per column keeps the projection honest (a
     * computed column holding two aggregates renders as `[object Object]`), and the
     * played-vs-skipped ratio is one row apart for the reader.
     */
    listenQuality: defineView('listenQuality', {
      label: 'Listen outcomes per station',
      from: 'playlogs',
      aggregate: {
        groupBy: ['stationRef', 'event'],
        metrics: { beacons: { fn: 'count' }, avgSeconds: { fn: 'avg', field: 'seconds' } },
      },
      expand: ['stationRef'],
      order: '-beacons',
      limit: 200,
      menu: { group: 'Radio', icon: 'LQ', order: 32 },
    }),
    /**
     * What the queue looks like to the people who run it: open requests first,
     * newest on top. Admin-only because a request may contain anything a listener
     * chose to write, and the message is not public data.
     */
    requestQueue: defineView('requestQueue', {
      label: 'Open listener requests',
      from: 'requests',
      select: { station: 'stationRef', message: 'message', sender: 'sender', status: 'status', at: 'createdAt' },
      where: { status: { in: ['new', 'queued'] } },
      order: '-createdAt',
      limit: 100,
      acl: ['admin'],
      menu: { group: 'Radio', icon: 'RQ', order: 33 },
    }),
    /**
     * Same chart, one day wide. The `where` is a function of the clock, so the
     * window moves with "now" instead of being a date someone has to maintain.
     */
    topStationsToday: defineView('topStationsToday', {
      label: 'Most played stations (last 24h)',
      from: 'playlogs',
      where: ({ now }) => ({ createdAt: { gte: new Date(now.getTime() - 86_400_000).toISOString() } }),
      aggregate: { groupBy: ['stationRef'], metrics: { plays: { fn: 'count' } } },
      expand: ['stationRef'],
      order: '-plays',
      limit: 10,
      menu: { group: 'Radio', icon: 'TD', order: 29 },
    }),
    /**
     * The stored rollup: reading history costs one scan of a table that grows by
     * stations x days, not by every beacon ever sent.
     */
    airplayDaily: defineView('airplayDaily', {
      label: 'Airplay per station per day',
      from: 'airplay_daily',
      expand: ['stationRef'],
      order: '-day',
      limit: 500,
      menu: { group: 'Radio', icon: 'AD', order: 30 },
    }),
    // public: this is what a listener actually wants to see under a station name
    nowPlayingTrack: defineView('nowPlayingTrack', {
      label: 'What each station is playing right now',
      from: 'now_playing',
      select: { station: 'stationRef', track: 'track', artist: 'artist', listeners: 'listeners', at: 'at' },
      expand: ['stationRef'],
      order: '-at',
      limit: 100,
      menu: { group: 'Radio', icon: 'NP', order: 12 },
    }),
  },
  endpoints: {
    // public listen beacon: the homepage reports a play, the charts become real.
    // Public *deliberately* — the model's own `create: 'auth'` does not apply to
    // an endpoint, so the intent is stated here and the station is validated.
    listen: {
      path: '/listen',
      method: 'POST',
      requires: 'public',
      menu: { group: 'Radio', icon: 'TL', order: 40 },
      body: {
        stationRef: str({ maxLength: 36 }),
        event: sel(['start', 'stop', 'skip'], { default: 'start' }),
        listener: str({ maxLength: 60, null: true }),
        seconds: int({ null: true }),
      },
      handler: async ({ body, orm, status, env }) => {
        // an unknown station would become a chart row that no catalog row can
        // explain (and an easy way to stuff the table with junk)
        const station = await orm.model('stations').get(body.stationRef).catch(() => null)
        if (!station) throw badRequest(`Unknown station "${body.stationRef}" — report a play for a listed station`)
        status(201)
        // The browser measures the session, so the number is only ever an estimate:
        // it is clamped to a day and never trusted past that.
        const seconds = typeof body.seconds === 'number' ? Math.max(0, Math.min(86_400, Math.round(body.seconds))) : null
        return orm.model('playlogs').create({
          stationRef: body.stationRef,
          event: body.event ?? 'start',
          listener: body.listener ? await listenerToken(String(body.listener), env.PLAYLOG_PSEUDONYM_SALT ?? '') : null,
          seconds,
        })
      },
    },
    // The live face of the hub: what just started playing and who is listening.
    // Public by intent — the frame carries station ids and track text only.
    onAir: {
      path: '/on-air',
      method: 'GET',
      requires: 'public',
      stream: true,
      menu: { group: 'Radio', icon: 'ON', order: 41 },
      handler: ({ bus, query, signal }) => {
        // An anonymous caller holding a socket is the one thing a single-process
        // hub cannot hand out freely: five minutes per tab, then reconnect.
        const requested = Number(query.seconds ?? MAX_ON_AIR_SECONDS)
        const seconds = Number.isFinite(requested)
          ? Math.max(1, Math.min(MAX_ON_AIR_SECONDS, Math.floor(requested)))
          : MAX_ON_AIR_SECONDS
        return busStream(bus, {
          events: ['model.created', 'model.updated'],
          models: ['playlogs', 'now_playing', 'schedule_slots'],
          seconds,
          limit: Number(query.limit ?? 0) || 0,
          signal,
          project: onAirFrame,
        })
      },
    },
  },
  cron: [
    {
      /**
       * Fold today's beacons into `airplay_daily`. The day is recomputed from
       * scratch on every tick, so a late beacon or a hand-edited row is corrected
       * on the next pass instead of drifting forever. The read is one indexed
       * window over a single day, paged to a bound — the whole point is that chart
       * cost stops growing with the history table.
       */
      name: 'refresh-airplay-daily',
      every: '5m',
      startImmediately: true,
      run: async ({ orm }) => {
        const day = new Date().toISOString().slice(0, 10)
        const startOfDay = `${day}T00:00:00.000Z`
        const PAGE = 500

        const totals = new Map<string, { sessions: number; seconds: number }>()
        for (let offset = 0; ; ) {
          const page = await orm.model('playlogs').search({
            limit: PAGE,
            offset,
            where: { createdAt: { gte: startOfDay } },
            order: 'createdAt',
          })
          for (const row of page.rows) {
            const station = String(row.stationRef ?? '')
            if (!station) continue
            const hit = totals.get(station) ?? { sessions: 0, seconds: 0 }
            hit.sessions += 1
            if (typeof row.seconds === 'number') hit.seconds += row.seconds
            totals.set(station, hit)
          }
          offset += page.rows.length
          if (page.rows.length < PAGE) break
        }

        const stored = await orm.model('airplay_daily').search({ limit: PAGE, where: { day } })
        const byStation = new Map<string, Record<string, unknown>>(
          stored.rows.map((row: Record<string, unknown>) => [String(row.stationRef), row]),
        )
        let written = 0
        for (const [station, hit] of totals) {
          const payload = { stationRef: station, day, sessions: hit.sessions, seconds: hit.seconds > 0 ? hit.seconds : null }
          const existing = byStation.get(station)
          if (existing) await orm.model('airplay_daily').update(String(existing.id), payload)
          else await orm.model('airplay_daily').create(payload)
          written += 1
        }
        return { day, stations: written }
      },
    },
    {
      // listen events are the fastest-growing table in the hub and the only one
      // holding visitor-derived data: it needs its own retention window
      name: 'purge-playlog',
      every: '1d',
      run: async ({ orm, env, budgetMs }) => {
        const days = Number(env.PLAYLOG_RETENTION_DAYS ?? 90) || 90
        const cutoff = new Date(Date.now() - days * 86_400_000).toISOString()
        // Requests carry listener-authored text, so they expire on the same clock
        // as the listen events they sit beside — one retention rule, not two.
        //
        // Drain instead of a fixed 50-pass cap: past 50k rows a day the cap left
        // visitor data older than the retention window we advertised, silently.
        // The budget is the limit now, and what it could not reach is reported.
        const deadline = Date.now() + budgetMs
        let removed = 0
        let remaining = 0
        for (const model of ['playlogs', 'requests'] as const) {
          const repo = orm.model(model)
          while (Date.now() < deadline) {
            const chunk: number = await repo.removeWhere({ createdAt: { lt: cutoff } }, 1000)
            removed += chunk
            if (chunk < 1000) break
          }
          remaining += await repo.count({ createdAt: { lt: cutoff } })
        }
        return { days, removed, remaining }
      },
    },
    {
      /**
       * Pull the per-station status feeds. Every 5 min rather than every few
       * seconds: the dock can show a track that started minutes ago, and the
       * broadcasters should not be polled by every listener.
       */
      name: 'fetch-now-playing',
      every: '5m',
      run: async ({ orm, env, budgetMs }) => {
        if (env.EGRESS_ENABLED !== 'true') return { skipped: 'EGRESS_ENABLED is not true' }
        const nowPlaying = orm.model('now_playing')
        const active = (await orm.model('stations').list({ where: { active: true }, limit: 500 })) as Array<Record<string, unknown>>
        // Cursor: oldest fact first (a station with no row yet counts as oldest), so
        // a run that runs out of budget leaves the untouched stations at the front
        // of the next one instead of re-reading the same head every time.
        const seen = new Map<string, string>(
          ((await nowPlaying.list({ limit: 1000 })) as Array<Record<string, unknown>>).map((row) => [String(row.stationRef), String(row.at ?? '')]),
        )
        const ordered = byStaleness(active, (station) => seen.get(String(station.id)) ?? '')
        let updated = 0
        const run = await runWithBudget(ordered, {
          budgetMs,
          run: async (station) => {
            let fact: NowPlayingFact | null = null
            for (const candidate of statusUrls(String(station.streamUrl ?? ''))) {
              fact = parseNowPlaying(await fetchJsonWithPolicy(candidate))
              if (fact) break
            }
            if (!fact) return false
            const payload = {
              track: fact.track,
              artist: fact.artist,
              listeners: fact.listeners,
              at: new Date().toISOString(),
            }
            const existing = await nowPlaying.list({ where: { stationRef: String(station.id) }, limit: 1 })
            if (existing[0]) await nowPlaying.update(String(existing[0].id), payload)
            else await nowPlaying.create({ stationRef: String(station.id), ...payload })
            updated++
            return true
          },
        })
        return { stations: run.done, updated, skippedByBudget: run.skipped.length, remaining: run.skipped.length }
      },
    },
  ],
})

export default playlog
