import { randomBytes, scrypt, scryptSync, timingSafeEqual } from 'node:crypto'

const scryptAsync = (password: string, salt: string): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (err, derived) => (err ? reject(err) : resolve(derived)))
  })

/** scrypt password hashing with a per-password salt — zero external deps. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}$${hash}`
}

/**
 * The request-path variant: `scryptSync` blocks the event loop for ~100 ms per
 * attempt, so a handful of concurrent logins would stall the whole hub.
 */
export async function hashPasswordAsync(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  return `${salt}$${(await scryptAsync(password, salt)).toString('hex')}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split('$')
  if (!salt || !hash) return false
  const candidate = scryptSync(password, salt, 64)
  const expected = Buffer.from(hash, 'hex')
  return candidate.length === expected.length && timingSafeEqual(candidate, expected)
}

/** Async verify for the login path. */
export async function verifyPasswordAsync(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split('$')
  if (!salt || !hash) return false
  const candidate = await scryptAsync(password, salt)
  const expected = Buffer.from(hash, 'hex')
  return candidate.length === expected.length && timingSafeEqual(candidate, expected)
}

/** Opaque session token (revocable, unlike JWT). */
export const newToken = (): string => randomBytes(32).toString('hex')
