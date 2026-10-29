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

/**
 * Skin contract (ADR-0014).
 *
 * A skin is a token layer, never a layout or behaviour change. Both skins expose
 * the same key set, so a consumer never asks "which skin am I?" — it asks for a
 * role. `zine` is the default and is asserted equal to MOON_COLORS by
 * `test/skins.test.ts`; `empire` is the approved Story Universe recipe.
 */
export type MoonSkinName = 'zine' | 'empire'

export type MoonSkin = {
  readonly bg: string
  readonly bg1: string
  readonly bg2: string
  readonly night: string
  readonly paper: string
  readonly fg: string
  readonly fgMuted: string
  readonly fgSubtle: string
  readonly rule: string
  readonly ruleSoft: string
  readonly ruleStrong: string
  readonly brand: string
  readonly brandSoft: string
  readonly onBrand: string
  readonly brand2: string
  readonly brand2Hover: string
  readonly brand2Strong: string
  readonly signal: string
  readonly info: string
  readonly success: string
  readonly danger: string
  readonly moon: string
  readonly focus: string
}

export const MOON_SKINS = {
  zine: {
    bg: '#07060b',
    bg1: '#13101d',
    bg2: '#1b172a',
    night: '#0b0912',
    paper: '#0d0b14',
    fg: '#f7f4ec',
    fgMuted: '#9e96b0',
    fgSubtle: 'rgba(247, 244, 236, 0.55)',
    rule: 'rgba(247, 244, 236, 0.22)',
    ruleSoft: 'rgba(247, 244, 236, 0.13)',
    ruleStrong: 'rgba(247, 244, 236, 0.45)',
    brand: '#ffd400',
    brandSoft: 'rgba(255, 212, 0, 0.45)',
    onBrand: '#07060b',
    brand2: '#ff007a',
    brand2Hover: '#ff1e56',
    brand2Strong: '#ff007a',
    signal: '#00d4ff',
    info: '#1da1f2',
    success: '#00e676',
    danger: '#ff1e56',
    moon: '#9d4edd',
    focus: '#00d4ff',
  },
  empire: {
    bg: '#090b0d',
    bg1: '#131518',
    bg2: '#1c1e22',
    night: '#0b0d10',
    paper: '#101215',
    fg: '#f1ede5',
    fgMuted: '#92938f',
    fgSubtle: '#b5afa4',
    rule: '#514638',
    ruleSoft: '#3c3427',
    ruleStrong: '#8d7146',
    brand: '#c5a578',
    brandSoft: '#d8b67f',
    onBrand: '#14100a',
    brand2: '#db1e31',
    brand2Hover: '#e03c49',
    brand2Strong: '#a91525',
    signal: '#8fa4b8',
    info: '#6f8ea8',
    success: '#7fae88',
    danger: '#ff5a6b',
    moon: '#d6d5cd',
    focus: '#e3c391',
  },
} as const satisfies Record<MoonSkinName, MoonSkin>

export const MOON_FONTS = {
  sans: '"Inter", "Segoe UI Variable Text", "Segoe UI", system-ui, -apple-system, sans-serif',
  display: '"Impact", "Anton", "Arial Black", "Franklin Gothic Heavy", sans-serif',
  editorial: '"Georgia", "Iowan Old Style", "Times New Roman", serif',
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

/**
 * Experience layout/typography tokens (M19-02).
 *
 * Four reading contexts share ONE semantic key set — `measure`, `maxWidth`,
 * `density`, `lineHeight`, `fonts.{heading,body,code}`,
 * `typeScale.{display,heading,body,caption,code}` and
 * `space.{gutter,section,inline}` — and differ only in values. Meaning must
 * never drift between modes: a key always names the same decision, and font
 * and spacing values are references into MOON_FONTS / MOON_SPACING, never new
 * families or magic numbers. No palette value lives here; color stays owned by
 * MOON_COLORS so a mode can never fork the palette.
 *
 * - `reader`  — long-form reading (Dock `/reader`): comfortable measure and prose leading.
 * - `research`— dense reference scanning (terms/hypotheses): wider measure, compact leading, sans headings.
 * - `story`   — narrative zine (studio/story): airy leading, narrow measure, zine display face.
 * - `operator`— technician console (Cockpit): no measure cap, dense leading/scale, mono data.
 */
export type MoonExperienceName = 'reader' | 'research' | 'story' | 'operator'

type MoonExperienceDensity = 'airy' | 'comfortable' | 'compact' | 'dense'

type MoonExperience = {
  readonly measure: string
  readonly maxWidth: string
  readonly density: MoonExperienceDensity
  readonly lineHeight: number
  readonly fonts: {
    readonly heading: string
    readonly body: string
    readonly code: string
  }
  readonly typeScale: {
    readonly display: string
    readonly heading: string
    readonly body: string
    readonly caption: string
    readonly code: string
  }
  readonly space: {
    readonly gutter: string
    readonly section: string
    readonly inline: string
  }
}

export const MOON_EXPERIENCES = {
  reader: {
    measure: '68ch',
    maxWidth: '72rem',
    density: 'comfortable',
    lineHeight: 1.75,
    fonts: {
      heading: MOON_FONTS.display,
      body: MOON_FONTS.sans,
      code: MOON_FONTS.mono,
    },
    typeScale: {
      display: '48px',
      heading: '28px',
      body: '17px',
      caption: '12px',
      code: '13px',
    },
    space: {
      gutter: MOON_SPACING.s5,
      section: MOON_SPACING.s5,
      inline: MOON_SPACING.s3,
    },
  },
  research: {
    measure: '84ch',
    maxWidth: '88rem',
    density: 'compact',
    lineHeight: 1.55,
    fonts: {
      heading: MOON_FONTS.sans,
      body: MOON_FONTS.sans,
      code: MOON_FONTS.mono,
    },
    typeScale: {
      display: '34px',
      heading: '22px',
      body: '14px',
      caption: '11px',
      code: '12px',
    },
    space: {
      gutter: MOON_SPACING.s4,
      section: MOON_SPACING.s3,
      inline: MOON_SPACING.s2,
    },
  },
  story: {
    measure: '62ch',
    maxWidth: '66rem',
    density: 'airy',
    lineHeight: 1.8,
    fonts: {
      heading: MOON_FONTS.zine,
      body: MOON_FONTS.sans,
      code: MOON_FONTS.mono,
    },
    typeScale: {
      display: '56px',
      heading: '30px',
      body: '18px',
      caption: '12px',
      code: '13px',
    },
    space: {
      gutter: MOON_SPACING.s5,
      section: MOON_SPACING.s5,
      inline: MOON_SPACING.s3,
    },
  },
  operator: {
    measure: 'none',
    maxWidth: '100%',
    density: 'dense',
    lineHeight: 1.3,
    fonts: {
      heading: MOON_FONTS.display,
      body: MOON_FONTS.sans,
      code: MOON_FONTS.mono,
    },
    typeScale: {
      display: '20px',
      heading: '14px',
      body: '12px',
      caption: '10px',
      code: '12px',
    },
    space: {
      gutter: MOON_SPACING.s3,
      section: MOON_SPACING.s2,
      inline: MOON_SPACING.s1,
    },
  },
} as const satisfies Record<MoonExperienceName, MoonExperience>

