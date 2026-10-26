/**
 * Hashing for the values the hub must remember without keeping: an origin, a
 * listener id, a login attempt. Web Crypto only — the same rule has to hold in a
 * Node build, a Next.js server action, and a test runner.
 *
 * The hash is deliberately truncated for pseudonyms: 64 bits collide eventually,
 * but the column is a label, not a key, and a full digest in every row invites
 * treating it as an identity.
 */

const encoder = new TextEncoder()

/** Lowercase hex of the SHA-256 digest of `value` (64 chars). */
export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * A stable, prefixed pseudonym for `value` (`lp_1f3c…`), 16 hex chars.
 * Same input, same token — so "the same person" stays visible without the source
 * text ever reaching the table.
 */
export async function pseudonym(prefix: string, value: string): Promise<string> {
  return `${prefix}_${(await sha256Hex(value)).slice(0, 16)}`
}
