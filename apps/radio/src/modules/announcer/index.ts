import type { TypedModule } from '../../lib/types.js'
import { generateLunaScript } from './tts.js'

/**
 * Announcer module — no routes on purpose. It is mounted by the folder convention
 * and exists only to close the loop the addons cannot: `CronDef.run` sees `orm`,
 * `env` and `log`, never a channel, while this process has both the bus and the
 * channel manager. Subscribing here is what turns "a request arrived" and "a job
 * failed" into something a listener-facing system can act on.
 *
 * Everything it does is best-effort and rate-bounded by its own settings:
 * a hub must never stop serving because a messenger was unreachable.
 */

/** Messages are truncated: an IM channel is not a place for a novel. */
const MESSAGE_CAP = 400

const clip = (value: string): string => (value.length > MESSAGE_CAP ? `${value.slice(0, MESSAGE_CAP - 1)}…` : value)

const announcerRoutes: TypedModule = async (fastify) => {
  const orm = fastify.moonql

  const setting = async (key: string): Promise<string> => {
    const rows = await orm.model('settings_entries').list({ where: { key }, limit: 1 })
    return String(rows[0]?.value ?? '')
  }

  /** Send one line to the configured destination, if the operator configured one. */
  const announce = async (text: string, source: string): Promise<void> => {
    const to = await setting('announce_to')
    if (!to) return
    try {
      const results = await fastify.channels.broadcast({ to, text })
      for (const result of results) {
        if (!result.ok) fastify.log.warn({ channel: result.channel, error: result.error }, `announcer: ${source} delivery failed`)
      }
    } catch (err) {
      // a dead socket in the messenger is never allowed to surface as a failed write
      fastify.log.warn({ err: (err as Error).message }, `announcer: ${source} broadcast threw`)
    }
  }

  const requestsOpen = async (): Promise<boolean> => (await setting('announce_requests')) !== 'false'

  orm.bus.on('model.created', (payload) => {
    if (payload.model !== 'requests') return
    void (async () => {
      if (!(await requestsOpen())) return
      const row = payload.row as Record<string, unknown>
      const station = row.stationRef ? await orm.model('stations').get(String(row.stationRef)).catch(() => null) : null
      const who = String(row.sender ?? 'an anonymous listener')
      await announce(
        `[request] from ${who}${station ? ` for ${String(station.name)}` : ''}: ${clip(String(row.message ?? ''))}`,
        'request',
      )
    })().catch((err: unknown) => fastify.log.warn({ err: (err as Error).message }, 'announcer: request hook failed'))
  })

  // The alert rule for the observability loop, riding the same leg as requests:
  // a cron that errors is invisible in HTTP counters and in the admin UI until
  // somebody opens it.
  orm.bus.on('cron.run', (payload) => {
    if (payload.status !== 'error') return
    void announce(
      `[alert] cron ${payload.addon}/${payload.cron} failed after ${payload.durationMs}ms: ${clip(String(payload.detail ?? 'no detail'))}`,
      'cron',
    ).catch((err: unknown) => fastify.log.warn({ err: (err as Error).message }, 'announcer: alert hook failed'))
  })

  // Critical Sentinel intelligence flash announcer hook:
  orm.bus.on('model.created', (payload) => {
    if (payload.model !== 'monitor_signals') return
    void (async () => {
      const row = payload.row as Record<string, unknown>
      const urgency = Number(row.urgencyScore ?? 0)
      const sentiment = String(row.sentiment ?? '')
      if (urgency >= 80 || sentiment === 'critical' || sentiment === 'alert') {
        const title = clip(String(row.title ?? 'breaking signal'))
        const platform = String(row.platform ?? 'intel').toUpperCase()
        
        // 1. Announce to IM channels
        await announce(`[INTEL FLASH] (${platform} URGENCY ${urgency}%): ${title}`, 'intel')
        
        // 2. Format AI Voice DJ Luna script and log cue
        const cue = generateLunaScript({ title, urgency, platform })
        fastify.log.info({ cueId: cue.id, urgency, script: cue.scriptText }, 'announcer: Luna voice flash cue generated')
      }
    })().catch((err: unknown) => fastify.log.warn({ err: (err as Error).message }, 'announcer: intel flash hook failed'))
  })

  fastify.log.info('announcer: listening for requests, cron failures, and critical intel')
}

export default announcerRoutes
