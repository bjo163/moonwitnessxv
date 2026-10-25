import type { BusEvent, MoonBus } from './bus.js'
import { BUS_EVENTS } from './bus.js'

/** one frame on the wire */
export interface BusFrame {
  type: 'bus'
  event: BusEvent
  payload: unknown
  at: string
}

export interface BusStreamOptions {
  /** events to follow; default every declared event */
  events?: readonly BusEvent[]
  /** only payloads whose `model` is listed reach the wire (views of one table) */
  models?: readonly string[]
  /** stop after N frames; 0 (default) is unbounded and relies on `seconds` */
  limit?: number
  /** stop after N seconds; 0 means "no self-imposed window" (the router still clamps) */
  seconds?: number
  /** frames buffered while the consumer is slow; the oldest is dropped past this */
  maxQueue?: number
  /** aborted when the client disconnects or the route deadline fires */
  signal: AbortSignal
  /** reshape a frame; used by public streams to keep internal columns off the wire */
  project?: (frame: BusFrame) => unknown
  /** how long one parked read waits for the next event before re-checking the clock */
  pollMs?: number
}

/**
 * The bus-to-async-generator bridge every streaming endpoint shares.
 *
 * Two properties matter more than throughput:
 * - **it always ends.** A quiet feed must not hold a socket forever, so both the
 *   frame budget and the clock are checked on every lap of the loop, and the wait
 *   itself is abortable.
 * - **a slow consumer cannot grow the heap.** The queue is bounded and drops its
 *   oldest frame; losing history beats leaking memory per subscriber.
 */
export function busStream(bus: MoonBus, options: BusStreamOptions): AsyncGenerator<unknown> {
  const {
    events = BUS_EVENTS,
    models,
    limit = 0,
    seconds = 0,
    maxQueue = 200,
    signal,
    project,
    pollMs = 250,
  } = options
  const wanted = models ? new Set(models) : undefined

  return (async function* () {
    const queue: BusFrame[] = []
    let wake: (() => void) | null = null
    const notify = (): void => {
      const resolve = wake
      wake = null
      resolve?.()
    }

    const offs = events.map((event) =>
      bus.on(event, (payload) => {
        const model = (payload as { model?: unknown })?.model
        if (wanted && !(typeof model === 'string' && wanted.has(model))) return
        if (queue.length >= maxQueue) queue.shift()
        queue.push({ type: 'bus', event, payload, at: new Date().toISOString() })
        notify()
      }),
    )

    const deadline = seconds > 0 ? Date.now() + seconds * 1000 : 0
    const wait = (ms: number): Promise<void> =>
      new Promise((resolve) => {
        if (signal.aborted) {
          resolve()
          return
        }
        const timer = setTimeout(finish, ms)
        timer.unref?.()
        function finish(): void {
          clearTimeout(timer)
          signal.removeEventListener('abort', finish)
          resolve()
        }
        signal.addEventListener('abort', finish)
      })

    let sent = 0
    try {
      while (!signal.aborted) {
        if (limit > 0 && sent >= limit) break
        if (deadline > 0 && Date.now() >= deadline) break

        const frame = queue.shift()
        if (frame !== undefined) {
          sent += 1
          yield project ? project(frame) : frame
          continue
        }
        await wait(pollMs)
      }
    } finally {
      for (const off of offs) off()
    }
  })()
}
