/**
 * @moonwitness/arsy — Ring Buffer Audio Timeshifting Engine
 *
 * Implements a bounded circular buffer tracking recent audio chunks
 * to allow live rewind up to 3 minutes (180 seconds) without memory bloat.
 */

export interface AudioChunk {
  seq: number
  stationId: string
  timestamp: number
  durationMs: number
  byteLength: number
}

export interface TimeshiftWindow {
  stationId: string
  availableSeconds: number
  oldestTimestamp: number
  newestTimestamp: number
  chunkCount: number
}

const MAX_WINDOW_SECONDS = 180 // 3 minutes

/**
 * Distinct station ids are caller-supplied (the beacon route takes `:id` from the
 * request), so without a cap this Map grows one entry per id forever — an
 * unbounded-memory path on a public route. The cap bounds it; least-recently-used
 * stations are evicted, which is exactly the stations that stopped beaming audio.
 */
export const MAX_STATIONS = 256

export class TimeshiftRingBuffer {
  private chunks: Map<string, AudioChunk[]> = new Map()

  /** Distinct stations currently retained; exposed for the bound assertion. */
  public get stationCount(): number {
    return this.chunks.size
  }

  public pushChunk(stationId: string, durationMs = 1000, byteLength = 16384): AudioChunk {
    const now = Date.now()

    // Map insertion order doubles as recency order: drop and re-insert on touch so
    // the first key is always the least-recently-used station.
    const existing = this.chunks.get(stationId)
    if (existing) this.chunks.delete(stationId)
    else if (this.chunks.size >= MAX_STATIONS) {
      const oldest = this.chunks.keys().next().value
      if (oldest !== undefined) this.chunks.delete(oldest)
    }

    const list = existing ?? []
    const lastSeq = list.length > 0 ? (list[list.length - 1]?.seq ?? 0) : 0
    const chunk: AudioChunk = {
      seq: lastSeq + 1,
      stationId,
      timestamp: now,
      durationMs,
      byteLength,
    }

    list.push(chunk)

    // Prune chunks older than 180 seconds
    const cutoff = now - MAX_WINDOW_SECONDS * 1000
    while (list.length > 0 && (list[0]?.timestamp ?? 0) < cutoff) {
      list.shift()
    }

    // The chunk just pushed is always inside the window, so a list only becomes
    // empty through eviction; never leave an empty station entry behind.
    if (list.length > 0) this.chunks.set(stationId, list)

    return chunk
  }

  public getWindow(stationId: string): TimeshiftWindow {
    const list = this.chunks.get(stationId) ?? []
    if (list.length === 0) {
      const now = Date.now()
      return {
        stationId,
        availableSeconds: 0,
        oldestTimestamp: now,
        newestTimestamp: now,
        chunkCount: 0,
      }
    }

    const oldest = list[0]?.timestamp ?? Date.now()
    const newest = list[list.length - 1]?.timestamp ?? Date.now()
    const availableSeconds = Math.max(0, Math.round((newest - oldest) / 1000))

    return {
      stationId,
      availableSeconds,
      oldestTimestamp: oldest,
      newestTimestamp: newest,
      chunkCount: list.length,
    }
  }
}

export const timeshiftBuffer = new TimeshiftRingBuffer()
