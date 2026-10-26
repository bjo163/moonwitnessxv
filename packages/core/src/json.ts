/**
 * Deterministic JSON, defined once.
 *
 * Two copies existed (the schema digest and the SDK generator), and they agreed by
 * luck: a digest that depends on object order is not a digest of the contract, it
 * is a digest of the current registration order, and every addon reshuffle would
 * look like a breaking change to clients.
 */
export function canonicalJson(value: unknown): string {
  const walk = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(walk)
    if (node && typeof node === 'object') {
      return Object.fromEntries(
        Object.entries(node as Record<string, unknown>)
          .filter(([, item]) => item !== undefined)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, item]) => [key, walk(item)]),
      )
    }
    return node
  }
  return JSON.stringify(walk(value))
}
