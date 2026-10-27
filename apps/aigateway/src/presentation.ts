import { defineLocaleCatalog, getLocaleMessage, preferredLocale } from '@moonwitness/core'
import type { Locale } from '@moonwitness/core'
import type { ModelDescriptor, ProviderStatus } from './types.js'

const messages = defineLocaleCatalog({
  en: {
    providerActive: 'Active / configured',
    providerUnavailable: 'Missing API key or offline',
    freeModel: 'Automatic cascading router ({providers})',
    autoModel: 'Alias for automatic cascading router ({providers})',
    directModel: 'Direct provider model on {provider}',
    messagesRequired: 'Invalid request: "messages" array is required and must not be empty.',
    inputRequired: 'Invalid request: "input" parameter is required.',
  },
  id: {
    providerActive: 'Aktif / telah dikonfigurasi',
    providerUnavailable: 'Kunci API tidak tersedia atau layanan sedang offline',
    freeModel: 'Router otomatis berjenjang ({providers})',
    autoModel: 'Alias untuk router otomatis berjenjang ({providers})',
    directModel: 'Model provider langsung pada {provider}',
    messagesRequired: 'Permintaan tidak valid: array "messages" wajib diisi dan tidak boleh kosong.',
    inputRequired: 'Permintaan tidak valid: parameter "input" wajib diisi.',
  },
})

export function aiGatewayLocale(acceptLanguage: string | undefined): Locale {
  return preferredLocale(acceptLanguage) ?? 'en'
}

export function localizedProviderStatuses(
  providers: readonly ProviderStatus[],
  locale: Locale,
): ProviderStatus[] {
  return providers.map((provider) => ({
    ...provider,
    reason: localizedProviderReason(provider.reason, locale),
  }))
}

function localizedProviderReason(reason: string | undefined, locale: Locale): string | undefined {
  if (reason === 'Active / Configured') return getLocaleMessage(messages, locale, 'providerActive')
  if (reason === 'Missing API Key or Offline') return getLocaleMessage(messages, locale, 'providerUnavailable')
  return reason
}

export function localizedModelDescription(model: ModelDescriptor, locale: Locale): string {
  const providers = model.description.match(/\(([^()]*)\)$/)?.[1] ?? ''
  if (model.id === 'free') {
    return getLocaleMessage(messages, locale, 'freeModel').replace('{providers}', providers)
  }
  if (model.id === 'auto') {
    return getLocaleMessage(messages, locale, 'autoModel').replace('{providers}', providers)
  }
  return getLocaleMessage(messages, locale, 'directModel').replace('{provider}', model.provider)
}

export function localizedValidationMessage(
  key: 'messagesRequired' | 'inputRequired',
  locale: Locale,
): string {
  return getLocaleMessage(messages, locale, key)
}
