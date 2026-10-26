import { defineLocaleCatalog, type Locale, type LocaleCatalog } from '@moonwitness/core'
import { MoonApiError } from '@moonwitness/moonql-client'

const loginCatalog = defineLocaleCatalog({
  en: {
    title: 'Enter',
    subtitle: 'Private Command Center for stories, research, posters, and publishing.',
    loginLabel: 'Email or username',
    loginPlaceholder: 'Enter your email or username',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    submit: 'ENTER THE SHADOW',
    authorizedCrew: 'Authorized crew only.',
    followSignal: 'FOLLOW THE SIGNAL',
    sameMoon: 'SAME MOON · DIFFERENT PEOPLE',
    storiesBeyond: 'DIFFERENT PEOPLE · SAME SKY · STORIES BEYOND BORDERS.',
    witnessReal: 'WITNESS THE REAL.',
    brighterTomorrow: 'A BRIGHTER TOMORROW FOR A BOLDER HUMANITY.',
    leftDifferent: 'DIFFERENT',
    leftPeople: 'PEOPLE',
    leftSky: 'SAME SKY',
    leftStories: 'STORIES',
    leftBeyond: 'BEYOND',
    leftBorders: 'BORDERS.',
    brandSubtitle: 'EMPIRE OF THE LIGHT',
    footerMission: 'Create · Curate · Publish',
    artworkLabel: 'Moonwitness watcher overlooking a cyberpunk city and blue moon',
    privacy: 'Privacy',
    terms: 'Terms',
    support: 'Support',
    errorRequired: 'Enter your email or username and password to continue.',
    errorInvalid: 'The login details were not accepted. Check them and try again.',
    errorExpired: 'Your session has expired. Sign in again to continue.',
    errorUnavailable: 'Sign-in is temporarily unavailable. Try again shortly.',
  },
  id: {
    title: 'Masuk ke',
    subtitle: 'Pusat Kendali Privat untuk cerita, riset, poster, dan penerbitan.',
    loginLabel: 'Email atau nama pengguna',
    loginPlaceholder: 'Masukkan email atau nama pengguna',
    passwordLabel: 'Kata sandi',
    passwordPlaceholder: 'Masukkan kata sandi',
    rememberMe: 'Ingat saya',
    forgotPassword: 'Lupa kata sandi?',
    submit: 'MASUK KE SHADOW',
    authorizedCrew: 'Khusus kru yang berwenang.',
    followSignal: 'IKUTI SINYAL',
    sameMoon: 'BULAN YANG SAMA · ORANG YANG BERBEDA',
    storiesBeyond: 'ORANG BERBEDA · LANGIT YANG SAMA · CERITA MELAMPAUI BATAS.',
    witnessReal: 'Saksikan yang nyata.',
    brighterTomorrow: 'ESOK YANG LEBIH CERAH UNTUK KEMANUSIAAN YANG LEBIH BERANI.',
    leftDifferent: 'ORANG',
    leftPeople: 'BERBEDA',
    leftSky: 'LANGIT YANG SAMA',
    leftStories: 'CERITA',
    leftBeyond: 'MELAMPAUI',
    leftBorders: 'BATAS.',
    brandSubtitle: 'KEKAISARAN CAHAYA',
    footerMission: 'Cipta · Kurasi · Terbitkan',
    artworkLabel: 'Pengamat Moonwitness memandang kota cyberpunk dan bulan biru',
    privacy: 'Privasi',
    terms: 'Ketentuan',
    support: 'Bantuan',
    errorRequired: 'Masukkan email atau nama pengguna dan kata sandi untuk melanjutkan.',
    errorInvalid: 'Data masuk tidak diterima. Periksa kembali lalu coba lagi.',
    errorExpired: 'Sesi Anda telah berakhir. Masuk kembali untuk melanjutkan.',
    errorUnavailable: 'Layanan masuk sedang tidak tersedia. Coba lagi sebentar.',
  },
})

export type LoginMessageKey = keyof (typeof loginCatalog)['en']
export type LoginErrorKey = 'required' | 'invalid' | 'expired' | 'unavailable'

const errorMessageKeys: Record<LoginErrorKey, LoginMessageKey> = {
  required: 'errorRequired',
  invalid: 'errorInvalid',
  expired: 'errorExpired',
  unavailable: 'errorUnavailable',
}

/** Only known, non-sensitive codes may select a user-facing login notice. */
export function loginErrorMessage(locale: Locale, code: unknown): string | null {
  if (typeof code !== 'string' || !Object.hasOwn(errorMessageKeys, code)) return null
  return loginCatalog[locale][errorMessageKeys[code as LoginErrorKey]]
}

/** Convert upstream failures to stable UI codes; never return an API/runtime message. */
export function loginErrorCode(error: unknown): LoginErrorKey {
  return error instanceof MoonApiError && error.statusCode === 401 ? 'invalid' : 'unavailable'
}

export function loginCopy(locale: Locale): LocaleCatalog<LoginMessageKey>['en'] {
  return loginCatalog[locale]
}
