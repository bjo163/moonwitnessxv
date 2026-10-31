'use client'

import { useState } from 'react'
import type { Locale } from '@moonwitness/core'
import { LocaleSelect } from '@moonwitness/moonui'
import { currentRelativeUrl, validateLocalePreference } from '@/lib/locale-preference'

const OPTIONS = [
  { value: 'id', label: 'Bahasa Indonesia' },
  { value: 'en', label: 'English' },
]

/**
 * ADR-0017: the selector is MoonUI's `LocaleSelect`; this file keeps only the
 * cookie contract and the reload, and renders no markup of its own.
 */
export function LocaleSelector({ locale }: { locale: Locale }) {
  const [selected, setSelected] = useState(locale)

  function changeLocale(value: string) {
    const next = validateLocalePreference(value)
    if (!next) return
    setSelected(next)
    document.cookie = `mw_locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax`
    window.location.assign(currentRelativeUrl(window.location))
  }

  return <LocaleSelect label="Language" value={selected} options={OPTIONS} onChange={changeLocale} />
}
