/**
 * @moonwitness/moonui — Centralized Tailwind CSS Preset
 *
 * Exposes Moon UI design tokens as first-class Tailwind theme utilities:
 * bg-moon-ink, text-moon-cyan, border-moon-pink, font-moon-display, shadow-moon-brutal, etc.
 */

export default {
  theme: {
    extend: {
      colors: {
        moon: {
          ink: 'var(--ink)',
          night: 'var(--night)',
          paper: 'var(--paper)',
          surface: 'var(--surface)',
          'surface-2': 'var(--surface-2)',
          fg: 'var(--fg)',
          accent: 'var(--accent)',
          pink: 'var(--pink)',
          hot: 'var(--hot)',
          cyan: 'var(--cyan)',
          blue: 'var(--blue)',
          ok: 'var(--ok)',
          purple: 'var(--moon)',
          muted: 'var(--muted)',
          chalk: 'var(--chalk)',
          'chalk-dim': 'var(--chalk-dim)',
          hair: 'var(--hair)',
          border: 'var(--border)',
          'border-strong': 'var(--border-strong)',
        },
      },
      fontFamily: {
        'moon-sans': ['var(--font-sans)'],
        'moon-display': ['var(--font-display)'],
        'moon-zine': ['var(--font-zine)'],
        'moon-mono': ['var(--font-mono)'],
      },
      boxShadow: {
        'moon-brutal': 'var(--shadow)',
        'moon-sm': 'var(--shadow-sm)',
        'moon-pink': 'var(--shadow-pink)',
        'moon-accent': 'var(--shadow-accent)',
      },
    },
  },
}
