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
   * Promise dan memasangkan `.catch` (lihat komentar isolasi di bawah).
   *
   * Tipe kembaliannya `unknown`, bukan `void | Promise<void>`: bus tidak pernah
   * memakai nilainya, dan listener yang ditulis sebagai ekspresi
   * (`() => warns.push(x)`) mengembalikan number — sah untuk `void`, ditolak oleh
   * union yang mengharuskan Promise.
   */
  on<E extends BusEvent>(event: E, listener: (payload: BusPayloads[E]) => unknown): () => void
  emit<E extends BusEvent>(event: E, payload: BusPayloads[E]): void
  readonly events: readonly BusEvent[]
}

type WarnLog = { warn: (obj: unknown, msg: string) => void }

type AnyListener = (payload: unknown) => unknown

/** only a real Promise gets a `.catch` attached */
const isThenable = (value: unknown): value is Promise<unknown> =>
  typeof value === 'object' && value !== null && typeof (value as { then?: unknown }).then === 'function'

/**
 * Listener isolation is the contract: a subscriber that throws (or rejects)
 * must never fail the write that triggered it — it only logs.
 */
export function createBus(log?: WarnLog): MoonBus {
  const listeners = new Map<BusEvent, Set<AnyListener>>()

  return {
    events: BUS_EVENTS,
    on<E extends BusEvent>(event: E, listener: (payload: BusPayloads[E]) => unknown): () => void {
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
          const result = listener(payload)
          if (isThenable(result)) {
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
