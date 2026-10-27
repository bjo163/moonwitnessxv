/**
 * apps/orbit/src/components/spatial/tokens.ts
 *
 * Procedural Three.js design token constants for ORBIT spatial scene.
 * Grounded 100% in canonical @moonwitness/moonui tokens.
 * Zero drift or rogue hex colors.
 */

export const SPATIAL_TOKENS = {
  cyan: '#00d4ff',
  ok: '#00e676',
  accent: '#ffd400',
  pink: '#ff007a',
  hot: '#ff1e56',
  moon: '#7c3aed',
  muted: '#8e879f',
  border: '#252038',
  surface: '#13101d',
  surface2: '#1b172a',
  ink: '#07060b',
  fg: '#f7f4ec',
} as const

export type SpatialToken = keyof typeof SPATIAL_TOKENS
