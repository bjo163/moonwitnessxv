import { useState, useEffect, useCallback } from 'react'
import { getCockpitCopy, type CockpitLocale, type CockpitCopyCatalog } from '../lib/cockpit-copy'

const STORAGE_KEY = 'mw_cockpit_locale'

export function useCockpitLocale() {
  const [locale, setLocaleState] = useState<CockpitLocale>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY)
        if (saved === 'id' || saved === 'en') {
          return saved
        }
      } catch {
        // fallback
      }
    }
    return 'en'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY)
        if (saved && (saved === 'id' || saved === 'en') && saved !== locale) {
          setLocaleState(saved)
        }
      } catch {
        // ignore
      }
    }
  }, [locale])

  const setLocale = useCallback((nextLocale: CockpitLocale) => {
    setLocaleState(nextLocale)
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, nextLocale)
      } catch {
        // ignore storage quota error
      }
    }
  }, [])

  const copy: CockpitCopyCatalog = getCockpitCopy(locale)

  return {
    locale,
    setLocale,
    copy,
  }
}
