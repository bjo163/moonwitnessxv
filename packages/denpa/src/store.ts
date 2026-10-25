import { randomUUID } from 'node:crypto'
import type { Transmission } from './types.js'

/**
 * Tiny in-memory ring buffer of received transmissions.
 * Newest first when listed. Swap for a DB later if needed.
 */
export function createDenpaStore(limit = 100) {
  const items: Transmission[] = []

  return {
    put(input: Omit<Transmission, 'id' | 'receivedAt'>): Transmission {
      const t: Transmission = { id: randomUUID(), receivedAt: new Date().toISOString(), ...input }
      items.push(t)
      if (items.length > limit) items.shift()
      return t
    },
    recent(n?: number): Transmission[] {
      const size = Math.min(n ?? items.length, items.length)
      return items.slice(-size).reverse()
    },
    find(id: string): Transmission | null {
      return items.find((t) => t.id === id) ?? null
    },
  }
}

export type DenpaStore = ReturnType<typeof createDenpaStore>
