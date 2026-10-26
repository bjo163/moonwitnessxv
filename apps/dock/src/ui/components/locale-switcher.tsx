'use client'

import { useEffect, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import type { Locale } from '@moonwitness/core'
import { currentDockLocale, localizedDockHref, persistDockLocalePreference } from '@/lib/locale-context.mjs'

const localeOptions: readonly { locale: Locale; code: string; label: string }[] = [
  { locale: 'id', code: 'ID', label: 'Bahasa Indonesia' },
  { locale: 'en', code: 'EN', label: 'English' },
]

interface LocationSnapshot {
  pathname: string
  search: string
  hash: string
}

interface LocaleSwitcherProps {
  initialPath: string
  initialSearch: string
  initialLocale: Locale
}

export function LocaleSwitcher({ initialPath, initialSearch, initialLocale }: LocaleSwitcherProps): ReactNode {
  const [location, setLocation] = useState<LocationSnapshot>({
    pathname: initialPath,
    search: initialSearch,
    hash: '',
  })
  const [activeLocale, setActiveLocale] = useState<Locale>(initialLocale)

  useEffect(() => {
    const pathname = window.location.pathname
    setLocation({ pathname, search: window.location.search, hash: window.location.hash })
    setActiveLocale(currentDockLocale(pathname, document.cookie))
  }, [initialPath, initialSearch])

  function selectLocale(event: MouseEvent<HTMLAnchorElement> | KeyboardEvent<HTMLAnchorElement>, locale: Locale): void {
    persistDockLocalePreference(locale, document, window.location.protocol === 'https:')

    const destination = localizedDockHref(
      window.location.pathname,
      window.location.search,
      window.location.hash,
      locale,
    )
    event.currentTarget.href = destination
    if ('button' in event && event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    event.preventDefault()
    window.location.assign(destination)
  }

  const navLabel = activeLocale === 'id'
    ? 'Pilihan bahasa'
    : activeLocale === 'en'
      ? 'Language selection'
      : 'Language / Pilihan bahasa'

  return (
    <nav className="dk-locale-switcher" aria-label={navLabel}>
      {localeOptions.map(({ locale, code, label }) => (
        <a
          key={locale}
          className="dk-icon-btn"
          href={localizedDockHref(location.pathname, location.search, location.hash, locale)}
          lang={locale}
          aria-label={label}
          aria-current={activeLocale === locale ? 'true' : undefined}
          onClick={(event) => selectLocale(event, locale)}
          onKeyDown={(event) => {
            if (event.key === ' ' || event.key === 'Spacebar') {
              event.preventDefault()
              selectLocale(event, locale)
            }
          }}
        >
          {code}
        </a>
      ))}
    </nav>
  )
}
