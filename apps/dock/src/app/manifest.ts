import type { MetadataRoute } from 'next'

/**
 * PWA manifest (served at /manifest.webmanifest and linked by the root layout).
 *
 * The dock is a listener surface: someone opens it on a phone, taps play, and wants
 * it back the next night. `display: standalone` plus an icon is what makes that
 * possible without building an app, and `start_url: '/'` sends an installed site to
 * the catalog — where the interesting thing is, not to a dead-end splash.
 *
 * This is installability only. Offline catalog browsing would need a service worker,
 * and there is deliberately not one: a cached radio directory that never tells you
 * the stream moved is worse than no cache at all.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Moonwitness — late-night radio',
    short_name: 'Moonwitness',
    description: 'Browse the catalog, see what is on air, and press play.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0d12',
    theme_color: '#0b0d12',
    lang: 'en',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  }
}
