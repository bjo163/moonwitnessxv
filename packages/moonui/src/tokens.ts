/**
 * @moonwitness/moonui — Type-Safe Design Tokens (Single Source of Truth)
 *
 * Re-exports the exact, canonical palette and typography values defined in
 * `packages/moonui/moon.css`. Using these typed constants ensures zero
 * color drift, eliminates magic strings in TSX, and enables compile-time safety.
 */

export const MOON_COLORS = {
  ink: '#07060b',
  night: '#0b0912',
  paper: '#0d0b14',
  surface: '#13101d',
  surface2: '#1b172a',
  fg: '#f7f4ec',
  accent: '#ffd400',
  pink: '#ff007a',
  hot: '#ff1e56',
  cyan: '#00d4ff',
  blue: '#1da1f2',
  ok: '#00e676',
  moon: '#9d4edd',
  muted: '#9e96b0',
  chalk: 'rgba(247, 244, 236, 0.88)',
  chalkDim: 'rgba(247, 244, 236, 0.28)',
  hair: 'rgba(247, 244, 236, 0.13)',
  border: 'rgba(247, 244, 236, 0.22)',
  borderStrong: 'rgba(247, 244, 236, 0.45)',
} as const

export type MoonColorName = keyof typeof MOON_COLORS

export const MOON_FONTS = {
  sans: '"Inter", "Segoe UI Variable Text", "Segoe UI", system-ui, -apple-system, sans-serif',
  display: '"Impact", "Anton", "Arial Black", "Franklin Gothic Heavy", sans-serif',
  zine: '"Segoe Print", "Comic Sans MS", "Bradley Hand", "Chalkboard SE", cursive, sans-serif',
  mono: '"JetBrains Mono", "Cascadia Mono", "Consolas", ui-monospace, monospace',
} as const

export const MOON_SPACING = {
  s1: '4px',
  s2: '6px',
  s3: '12px',
  s4: '20px',
  s5: '32px',
  ctl: '30px',
} as const

export const MOON_SHADOWS = {
  brutal: '3px 3px 0 #000000',
  sm: '2px 2px 0 #000000',
  pink: '3px 3px 0 #ff007a',
  accent: '3px 3px 0 #ffd400',
  cyan: '3px 3px 0 #00d4ff',
} as const

export const MOON_BORDERS = {
  line: '2px solid rgba(247, 244, 236, 0.88)',
  strong: '2px solid rgba(247, 244, 236, 0.45)',
  hair: '1px solid rgba(247, 244, 236, 0.13)',
  dim: '1px solid rgba(247, 244, 236, 0.28)',
} as const

export const MOON_GLOWS = {
  pink: 'rgba(255, 0, 122, 0.45)',
  cyan: 'rgba(0, 212, 255, 0.45)',
  accent: 'rgba(255, 212, 0, 0.45)',
  ok: 'rgba(0, 230, 118, 0.45)',
} as const

