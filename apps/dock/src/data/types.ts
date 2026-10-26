/**
 * Presentation shapes that exist only in this app.
 *
 * The hub's row and view shapes are NOT mirrored here any more: they arrive as
 * `ViewOutputs` / `Rows` from the generated SDK, so a hub field rename is a compile
 * error at the point of use instead of a mapper quietly keeping the old name.
 */

export interface NowPlaying {
  title: string
  host: string | null
  stationId: string | null
  stationName: string | null
  startMin: number
  endMin: number
  /** 0..100 progress through the slot */
  progress: number
}

export interface ChartRow {
  label: string
  value: number
  href?: string
}
