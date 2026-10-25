/** A single received transmission ("denpa" = captured signal). */
export interface Transmission {
  id: string
  receivedAt: string
  origin: string
  payload: unknown
}

export interface DenpaOptions {
  /** Master switch (default true). */
  enable?: boolean
  /** Shared secret; when set, requests must send header `x-denpa-key`. */
  token?: string
  /** Ring-buffer capacity for recent transmissions (default 100). */
  limit?: number
  /** Callback fired on every received transmission (fan-out to bots, etc). */
  onReceive?: (t: Transmission) => void
}

declare module 'fastify' {
  // Allow documentation fields in route schemas without importing swagger.
  interface FastifySchema {
    tags?: string[]
    summary?: string
    description?: string
  }
}
