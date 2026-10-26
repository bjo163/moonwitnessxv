/**
 * @moonwitness/radio — Ring Buffer Audio Timeshifting Engine
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

export class TimeshiftRingBuffer {
  private chunks: Map<string, AudioChunk[]> = new Map()

  public pushChunk(stationId: string, durationMs = 1000, byteLength = 16384): AudioChunk {
    let list = this.chunks.get(stationId)
    if (!list) {
      list = []
      this.chunks.set(stationId, list)
    }

    const now = Date.now()
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
