'use client'

import { useEffect, useState } from 'react'
import type { MoonBrightnessName } from '../tokens.js'

export interface BrightnessToggleProps {
  className?: string
  'aria-label': string
}

/**
 * Client component that toggles `data-brightness` on `<html>` between 'dark' and 'light'.
 * Persists preference to localStorage. Must be paired with an inline script in `<head>`
 * to prevent FOUC (flash of unstyled content).
 */
export function BrightnessToggle({ className, 'aria-label': ariaLabel }: BrightnessToggleProps) {
  const [brightness, setBrightness] = useState<MoonBrightnessName>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('brightness') as MoonBrightnessName | null
    const initial = stored ?? 'dark'
    setBrightness(initial)
    document.documentElement.dataset.brightness = initial
  }, [])

  function toggle() {
    const next: MoonBrightnessName = brightness === 'dark' ? 'light' : 'dark'
    setBrightness(next)
    document.documentElement.dataset.brightness = next
    localStorage.setItem('brightness', next)
  }

  return (
    <button
      type="button"
      className={className}
      onClick={toggle}
      aria-label={ariaLabel}
      aria-pressed={brightness === 'light'}
    >
      {brightness === 'dark' ? '☀' : '🌙'}
    </button>
  )
}

/**
 * Inline script to prevent FOUC. Must be injected into `<head>` before React hydrates.
 * Reads localStorage and sets `data-brightness` immediately.
 */
export const BRIGHTNESS_INIT_SCRIPT = `
(function() {
  try {
    var b = localStorage.getItem('brightness');
    if (b === 'light' || b === 'dark') {
      document.documentElement.dataset.brightness = b;
    }
  } catch(e) {}
})();
`
