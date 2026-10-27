'use client'

import { useState } from 'react'
import type { Locale } from '@moonwitness/core'
import { currentRelativeUrl, validateLocalePreference } from '@/lib/locale-preference'

export function LocaleSelector({ locale }: { locale: Locale }) {
  const [selected, setSelected] = useState(locale)

  function changeLocale(value: string) {
    const next = validateLocalePreference(value)
    if (!next) return
    setSelected(next)
    document.cookie = `mw_locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax`
    window.location.assign(currentRelativeUrl(window.location))
  }

  return (
    <label className="m-row" style={{ gap: 6, alignItems: 'center' }}>
      <span className="m-muted">Language</span>
      <select aria-label="Language" value={selected} onChange={(event) => changeLocale(event.currentTarget.value)}>
        <option value="id">Bahasa Indonesia</option>
        <option value="en">English</option>
      </select>
    </label>
  )
}
