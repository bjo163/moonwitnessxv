import { useEffect, useState } from 'react'

/**
 * Reduced-motion reader (UI2-P18e / global M4).
 *
 * `moon.css` has no `prefers-reduced-motion` block at all, so anything that
 * animates continuously — the decorative level meter, the tuner needle sweep —
 * has to opt out itself. This hook is the single place the cockpit asks.
 */
export function prefersReducedMotion(
  matchMedia: ((query: string) => MediaQueryList) | undefined,
): boolean {
  if (typeof matchMedia !== 'function') return false
  try {
    return matchMedia('(prefers-reduced-motion: reduce)').matches === true
  } catch {
    // A host without matchMedia must not crash the shell; treat as "no preference".
    return false
  }
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    prefersReducedMotion(typeof window === 'undefined' ? undefined : window.matchMedia?.bind(window)),
  )

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
