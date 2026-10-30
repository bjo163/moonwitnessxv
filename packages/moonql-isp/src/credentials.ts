import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'

const KEY_LENGTH = 32
const COST = 16_384
const SALT_LENGTH = 16
const DUMMY_SALT = Buffer.from('isp-radius-dummy-salt', 'utf8')

async function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, {
      N: COST,
      r: 8,
      p: 1,
      maxmem: 64 * 1024 * 1024,
    }, (error, derived) => {
      if (error) reject(error)
      else resolve(derived)
    })
  })
}

export async function hashRadiusPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH)
  const digest = await derive(password, salt)
  return `scrypt$${COST}$${salt.toString('base64url')}$${digest.toString('base64url')}`
}

export async function verifyRadiusPassword(password: string, encoded: string | null): Promise<boolean> {
  const parts = encoded?.split('$') ?? []
  if (parts.length !== 4 || parts[0] !== 'scrypt' || parts[1] !== String(COST)) {
    await derive(password, DUMMY_SALT)
    return false
  }

  try {
    const salt = Buffer.from(parts[2]!, 'base64url')
    const expected = Buffer.from(parts[3]!, 'base64url')
    if (salt.length !== SALT_LENGTH || expected.length !== KEY_LENGTH) {
      await derive(password, DUMMY_SALT)
      return false
    }
    const actual = await derive(password, salt)
    return timingSafeEqual(actual, expected)
  } catch {
    await derive(password, DUMMY_SALT)
    return false
  }
}
