import { serverClient } from '@/data/sdk'
import type { ConstellationProjection } from './graph-projection'

export * from './graph-projection'

/**
 * The Constellation is a read-only projection from the hub's ontology tables.
 * The Dock never computes a graph or a graph ID of its own.
 */
export async function readConstellation(): Promise<ConstellationProjection> {
  return serverClient().call<ConstellationProjection>('/ontology/constellation')
}
