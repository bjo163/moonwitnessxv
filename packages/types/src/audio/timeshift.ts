/**
 * Audio Timeshift & Circular Buffer Typings (Section 21A.4)
 */
export interface TimeShiftBufferChunk {
  sequence: number
  timestamp: number
  durationMs: number
  byteLength: number
}

export interface TimeShiftState {
  isLive: boolean
  offsetSeconds: number
  maxOffsetSeconds: number
  bufferedDurationSeconds: number
  chunkCount: number
}
