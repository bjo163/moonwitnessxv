import { defineLocaleCatalog, type Locale } from '@moonwitness/core'

/**
 * Localized text for a server-side authorization denial.
 *
 * Same discipline as `login-copy.ts`: only a fixed set of stable codes selects a
 * message, and the messages are written here. An upstream status text, token or
 * private value can never be rendered, because nothing is ever passed through —
 * the code is the whole input.
 */
const denialCatalog = defineLocaleCatalog({
  en: {
    forbiddenTitle: 'Not authorized',
    forbiddenBody: 'Your account does not hold the role this area requires. No records were loaded.',
    unavailableTitle: 'Temporarily unavailable',
    unavailableBody:
      'The hub could not be reached, so this area could not be checked. Your session is still valid — this is not a sign-out.',
    retry: 'Try again',
    back: 'Back to Mission Control',
  },
  id: {
    forbiddenTitle: 'Tidak berwenang',
    forbiddenBody: 'Akun Anda tidak memiliki peran yang dibutuhkan area ini. Tidak ada data yang dimuat.',
    unavailableTitle: 'Sementara tidak tersedia',
    unavailableBody:
      'Hub tidak dapat dijangkau sehingga area ini tidak dapat diperiksa. Sesi Anda masih berlaku — ini bukan keluar dari akun.',
    retry: 'Coba lagi',
    back: 'Kembali ke Mission Control',
  },
})

export type DenialMessageKey = keyof (typeof denialCatalog)['en']
export type DenialCopyKey = 'forbidden' | 'unavailable'

const denialMessages: Record<DenialCopyKey, { title: DenialMessageKey; body: DenialMessageKey }> = {
  forbidden: { title: 'forbiddenTitle', body: 'forbiddenBody' },
  unavailable: { title: 'unavailableTitle', body: 'unavailableBody' },
}

export function denialCopy(locale: Locale): { retry: string; back: string } {
  const copy = denialCatalog[locale]
  return { retry: copy.retry, back: copy.back }
}

/** Unknown, injected or credential-like codes select no message at all. */
export function denialMessage(locale: Locale, code: unknown): { title: string; body: string } | null {
  if (typeof code !== 'string' || !Object.hasOwn(denialMessages, code)) return null
  const keys = denialMessages[code as DenialCopyKey]
  const copy = denialCatalog[locale]
  return { title: copy[keys.title], body: copy[keys.body] }
}
