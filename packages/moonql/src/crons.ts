import type { MoonRegistry } from './registry.js'
import type { MoonQlInstance } from './boot.js'
import type { Log } from './log.js'
import { pickAddonEnv } from './addon.js'

export interface CronHandle {
  stop(): void
}

const UNIT_MS: Record<string, number> = { ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }

/** Floor: below this a "cron" is a busy loop. Ceiling: Node clamps larger delays to 1ms. */
const MIN_INTERVAL_MS = 100
const MAX_INTERVAL_MS = 2_147_483_647

/** cron results reach the bus as (short) text — never a live object graph */
function safeDetail(value: unknown): string | null {
  if (value === undefined) return null
  try {
    return JSON.stringify(value).slice(0, 500)
  } catch {
    return String(value).slice(0, 500)
  }
}

export function parseEvery(every: string | number): number {
  if (typeof every === 'number') {
    if (every < MIN_INTERVAL_MS) throw new Error(`moonql cron: raw interval ${every}ms is too small (use '1s' style)`)
    if (every > MAX_INTERVAL_MS) throw new Error(`moonql cron: raw interval ${every}ms exceeds a timer (chain shorter ticks instead)`)
    return every
  }
  const m = /^(\d+)(ms|s|m|h|d)$/.exec(every)
  if (!m?.[1] || !m[2]) throw new Error(`moonql cron: bad interval "${every}" (expected like '30s', '5m', '2h')`)
  const ms = Number(m[1]) * UNIT_MS[m[2]]!
  // setInterval() clamps a delay above the 32-bit range to 1ms — a "monthly" job
  // would then fire continuously and flood ops_jobs — and 0ms busy-loops the
  // event loop. Both are declared errors, not surprises at runtime.
  if (ms < MIN_INTERVAL_MS) throw new Error(`moonql cron: interval "${every}" (${ms}ms) is below ${MIN_INTERVAL_MS}ms`)
  if (ms > MAX_INTERVAL_MS) throw new Error(`moonql cron: interval "${every}" (${ms}ms) exceeds a timer; chain shorter ticks`)
  return ms
}

/**
 * Arm declared crons for a booted instance. Each tick is guarded against
 * overlap and never crashes the process; timers are unref'd so test and
 * dev processes exit cleanly.
 */
export function startCrons(instance: MoonQlInstance, registry: MoonRegistry, log: Log): CronHandle {
  const timers: NodeJS.Timeout[] = []
  // one context per addon: a cron may read only the env names its addon declared
  const ctxFor = (addon: string): { orm: { model: MoonQlInstance['model'] }; env: Record<string, string | undefined>; log: Log; bus: MoonQlInstance['bus'] } => {
    const owner = registry.addons.find((candidate) => candidate.name === addon)
    return { orm: { model: instance.model }, env: pickAddonEnv(instance.env, owner?.env ?? []), log, bus: instance.bus }
  }

  for (const { addon, def } of registry.crons) {
    const ms = parseEvery(def.every)
    // 80% of the cadence: room to finish and return before the next tick, without
    // the overlap guard below turning a slow job into a silent one.
    const cronCtx = { ...ctxFor(addon), budgetMs: Math.floor(ms * 0.8) }
    let running = false
    const tick = () => {
      if (running) {
        log.warn({ cron: `${addon}/${def.name}` }, 'moonql cron: previous run still in progress, tick skipped')
        return
      }
      running = true
      const started = Date.now()
      Promise.resolve()
        .then(() => def.run(ctx))
        .then((result) => {
          instance.bus.emit('cron.run', {
            addon,
            cron: def.name,
            status: 'ok',
            durationMs: Date.now() - started,
            detail: safeDetail(result),
          })
        })
        .catch((err: Error) => {
          log.warn({ err: err.message }, `moonql cron ${addon}/${def.name} failed`)
          instance.bus.emit('cron.run', {
            addon,
            cron: def.name,
            status: 'error',
            durationMs: Date.now() - started,
            detail: err.message.slice(0, 500),
          })
        })
        .finally(() => {
          running = false
        })
    }
    const timer = setInterval(tick, ms)
    timer.unref?.() // must not keep the event loop alive (tests exit!)
    timers.push(timer)
    if (def.startImmediately) {
      // next tick, not inline: a repair job must not delay the first request
      const first = setTimeout(tick, 0)
      first.unref?.()
      timers.push(first as unknown as NodeJS.Timeout)
    }
    log.info({ cron: `${addon}/${def.name}`, every: def.every }, 'moonql cron: armed')
  }

  return {
    stop() {
      for (const t of timers) clearInterval(t)
      timers.length = 0
    },
  }
}
