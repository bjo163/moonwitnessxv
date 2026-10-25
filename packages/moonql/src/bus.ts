import type { Row } from './engines/engine.js'

/**
 * The tiny event bus of a booted instance. Addons declare `observe(bus, ctx)`
 * to react to writes they do not own (audit, metrics, webhooks) without
 * touching the owner addon — the gap `registry.hookFor` leaves open.
 */
export interface BusPayloads {
  'model.created': { model: string; id: string; row: Row }
  'model.updated': { model: string; id: string; row: Row }
  'model.deleted': { model: string; id: string }
  'cron.run': { addon: string; cron: string; status: 'ok' | 'error'; durationMs: number; detail: string | null }
  'data.synced': { model: string; created: number; updated: number; unchanged: number }
  'seed.applied': { model: string; rows: number }
}

export type BusEvent = keyof BusPayloads

export const BUS_EVENTS = [
  'model.created',
  'model.updated',
  'model.deleted',
  'cron.run',
  'data.synced',
  'seed.applied',
] as const satisfies readonly BusEvent[]

export interface MoonBus {
  /**
   * Sebuah listener boleh async — `emit` sengaja memeriksa hasil yang berupa
   * Promise dan memasangkan `.catch` (lihat komentar isolasi di bawah). Karena itu
   * tipenya harus `void | Promise<void>`: versi `void` saja membuat antarmuka lebih
   * sempit dari implementasinya, dan listener async yang sah ditolak pemonsumsi tipe.
   */
  on<E extends BusEvent>(event: E, listener: (payload: BusPayloads[E]) => void | Promise<void>): () => void
  emit<E extends BusEvent>(event: E, payload: BusPayloads[E]): void
  readonly events: readonly BusEvent[]
}

type WarnLog = { warn: (obj: unknown, msg: string) => void }

type AnyListener = (payload: unknown) => void | Promise<void>

/**
 * Listener isolation is the contract: a subscriber that throws (or rejects)
 * must never fail the write that triggered it — it only logs.
 */
export function createBus(log?: WarnLog): MoonBus {
  const listeners = new Map<BusEvent, Set<AnyListener>>()

  return {
    events: BUS_EVENTS,
    on<E extends BusEvent>(event: E, listener: (payload: BusPayloads[E]) => void | Promise<void>): () => void {
      let set = listeners.get(event)
      if (!set) {
        set = new Set()
        listeners.set(event, set)
      }
      const fn = listener as unknown as AnyListener
      set.add(fn)
      return () => {
        set.delete(fn)
      }
    },
    emit<E extends BusEvent>(event: E, payload: BusPayloads[E]): void {
      const set = listeners.get(event)
      if (!set) return
      for (const listener of [...set]) {
        try {
          // An async subscriber rejects *after* this loop has moved on: without
          // this handler the rejection escapes as unhandledRejection (which can
          // take the process down) and the write that triggered it is blamed.
          const result = listener(payload) as void | Promise<void>
          if (result && typeof result.catch === 'function') {
            result.catch((err: unknown) =>
              log?.warn({ err: (err as Error).message, event }, 'moonql bus: async listener failed (write is not affected)'),
            )
          }
        } catch (err) {
          log?.warn({ err: (err as Error).message, event }, 'moonql bus: listener failed (write is not affected)')
        }
      }
    },
  }
}
