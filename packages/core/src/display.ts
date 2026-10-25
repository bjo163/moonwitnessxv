/**
 * The one "what does a human call this value" rule for the workspace.
 *
 * Two implementations used to exist (the SDK's `displayLabel` and moonui's
 * `cellText`) with slightly different key lists — so a user row rendered as its
 * `login` in a select and as its `id` in a table. Both names now delegate here.
 */

/** Preference order for a row's display label. */
const LABEL_KEYS = ['name', 'label', 'title', 'displayName', 'code', 'key', 'login', 'id'] as const

/** What a row is called, without knowing the model. '' when nothing matches. */
export function displayLabel(row: unknown): string {
  if (row === null || row === undefined) return ''
  if (typeof row === 'string') return row
  if (typeof row === 'number' || typeof row === 'boolean') return String(row)
  if (typeof row !== 'object') return ''
  const record = row as Record<string, unknown>
  for (const key of LABEL_KEYS) {
    const value = record[key]
    if (typeof value === 'string' && value !== '') return value
    if (typeof value === 'number') return String(value)
  }
  return ''
}

/**
 * Any value as table text — never `[object Object]`. Falls back to JSON so an
 * unexpected shape is still readable (and suspicious) instead of blank.
 */
export function cellText(value: unknown): string {
  const label = displayLabel(value)
  if (label) return label
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}
