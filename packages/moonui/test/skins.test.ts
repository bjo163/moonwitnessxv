import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { MOON_COLORS, MOON_SKINS } from '../dist/tokens.js'

/**
 * ADR-0014 — MoonUI dual-skin contract.
 *
 * The suite pins the two properties a second skin is allowed to have:
 *  1. intentional difference — every role differs between `zine` and `empire`;
 *  2. semantic invariance   — both skins expose the same roles, the CSS blocks
 *     declare only allowlisted properties, and `zine` still equals MOON_COLORS.
 */

const SKINS = ['zine', 'empire'] as const
type SkinName = (typeof SKINS)[number]

const CSS = readFileSync(new URL('../moon.css', import.meta.url), 'utf8')

/** Colour roles a skin may set (ADR-0014 decision 4). */
const PALETTE_ROLE_PROPERTIES = [
  '--bg',
  '--bg-1',
  '--bg-2',
  '--night',
  '--paper',
  '--fg',
  '--fg-muted',
  '--fg-subtle',
  '--rule',
  '--rule-soft',
  '--rule-strong',
  '--brand',
  '--brand-soft',
  '--on-brand',
  '--brand-2',
  '--brand-2-hover',
  '--brand-2-strong',
  '--signal',
  '--info',
  '--success',
  '--danger',
  '--moon',
  '--focus',
]

/** Edge roles are CSS-only: MOON_SKINS describes colour, not shadow geometry. */
const CSS_ONLY_ROLE_PROPERTIES = ['--edge-shadow', '--edge-shadow-sm']

const ROLE_PROPERTIES = [...PALETTE_ROLE_PROPERTIES, ...CSS_ONLY_ROLE_PROPERTIES]

/** Legacy names every primitive already reads; a skin repeats them verbatim. */
const ALIAS_PROPERTIES = [
  '--ink',
  '--surface',
  '--surface-2',
  '--accent',
  '--pink',
  '--hot',
  '--cyan',
  '--blue',
  '--ok',
  '--muted',
  '--chalk',
  '--chalk-dim',
  '--hair',
  '--border',
  '--border-strong',
  '--line',
  '--shadow',
  '--shadow-sm',
  '--shadow-pink',
  '--shadow-accent',
  '--pink-glow',
  '--cyan-glow',
  '--accent-glow',
  '--ok-glow',
]

/** Geometry and type stacks are skin-independent and must never appear in a skin block. */
const FORBIDDEN_PROPERTIES = ['--s1', '--s2', '--s3', '--s4', '--s5', '--ctl']

const ALLOWED_PROPERTIES = new Set([...ROLE_PROPERTIES, ...ALIAS_PROPERTIES, 'color-scheme'])

/** `MOON_COLORS` legacy key → the role that must carry the same value in `zine`. */
const LEGACY_BRIDGE: ReadonlyArray<readonly [keyof typeof MOON_COLORS, keyof (typeof MOON_SKINS)['zine']]> = [
  ['ink', 'bg'],
  ['night', 'night'],
  ['paper', 'paper'],
  ['surface', 'bg1'],
  ['surface2', 'bg2'],
  ['fg', 'fg'],
  ['accent', 'brand'],
  ['pink', 'brand2'],
  ['hot', 'danger'],
  ['cyan', 'signal'],
  ['blue', 'info'],
  ['ok', 'success'],
  ['moon', 'moon'],
  ['muted', 'fgMuted'],
  ['hair', 'ruleSoft'],
  ['border', 'rule'],
  ['borderStrong', 'ruleStrong'],
]

type Rgba = { r: number; g: number; b: number; a: number }

function parseColor(value: string): Rgba {
  const text = value.trim()
  const hex = /^#([0-9a-f]{3,8})$/i.exec(text)
  if (hex) {
    const digits = hex[1]
    const expand = (part: string) => parseInt(part.length === 1 ? `${part}${part}` : part, 16)
    if (digits.length === 3 || digits.length === 4) {
      return { r: expand(digits[0]), g: expand(digits[1]), b: expand(digits[2]), a: digits.length === 4 ? expand(digits[3]) / 255 : 1 }
    }
    return {
      r: expand(digits.slice(0, 2)),
      g: expand(digits.slice(2, 4)),
      b: expand(digits.slice(4, 6)),
      a: digits.length === 8 ? expand(digits.slice(6, 8)) / 255 : 1,
    }
  }
  const fn = /^rgba?\(([^)]+)\)$/i.exec(text)
  assert.ok(fn, `unsupported colour value "${value}"`)
  const parts = fn[1].split(',').map((part) => Number.parseFloat(part.trim()))
  assert.equal(parts.length >= 3, true, `unsupported colour value "${value}"`)
  return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 }
}

function over(foreground: Rgba, background: Rgba): Rgba {
  const a = foreground.a + background.a * (1 - foreground.a)
  const blend = (f: number, b: number) => (f * foreground.a + b * background.a * (1 - foreground.a)) / a
  return { r: blend(foreground.r, background.r), g: blend(foreground.g, background.g), b: blend(foreground.b, background.b), a }
}

function luminance(color: Rgba): number {
  const channel = (value: number) => {
    const c = value / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b)
}

function contrast(foreground: string, background: string): number {
  const bg = parseColor(background)
  const fg = over(parseColor(foreground), bg)
  const a = luminance(fg)
  const b = luminance(bg)
  const [light, dark] = a >= b ? [a, b] : [b, a]
  return (light + 0.05) / (dark + 0.05)
}

/** Selector-anchored block reader: no CSS parser dependency, no ordering assumptions. */
function declarations(selector: string): string {
  const at = CSS.indexOf(selector)
  assert.ok(at >= 0, `moon.css must declare ${selector}`)
  const open = CSS.indexOf('{', at)
  assert.ok(open > at, `moon.css block for ${selector} has no body`)
  let depth = 0
  for (let index = open; index < CSS.length; index += 1) {
    if (CSS[index] === '{') depth += 1
    if (CSS[index] === '}') {
      depth -= 1
      if (depth === 0) return CSS.slice(open + 1, index)
    }
  }
  assert.fail(`moon.css block for ${selector} is unbalanced`)
}

function declaredProperties(selector: string): string[] {
  return [...declarations(selector).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((match) => match[1])
}

function skin(name: SkinName) {
  const palette = MOON_SKINS[name]
  assert.ok(palette, `skin "${name}" must exist`)
  return palette
}

/** `--brand-2-hover` → `brand2Hover`, so CSS properties can be compared with MOON_SKINS keys. */
function roleKey(property: string): string {
  return property.replace(/^--/, '').replace(/-([a-z0-9])/g, (_, character: string) => character.toUpperCase())
}

describe('MOON_SKINS — two skins, one role set', () => {
  it('exposes exactly zine and empire', () => {
    assert.deepEqual(Object.keys(MOON_SKINS).sort(), [...SKINS].sort())
  })

  it('keeps the same role set in every skin', () => {
    const reference = Object.keys(skin('zine')).sort()
    assert.deepEqual(reference, Object.keys(skin('empire')).sort())
    assert.deepEqual(reference, PALETTE_ROLE_PROPERTIES.map(roleKey).sort())
  })

  it('makes every role differ between the two skins', () => {
    for (const role of Object.keys(skin('zine')) as Array<keyof (typeof MOON_SKINS)['zine']>) {
      assert.notEqual(skin('zine')[role], skin('empire')[role], `role "${role}" is identical in both skins`)
    }
  })

  it('keeps zine identical to the legacy MOON_COLORS palette', () => {
    for (const [legacy, role] of LEGACY_BRIDGE) {
      assert.equal(skin('zine')[role], MOON_COLORS[legacy], `MOON_COLORS.${legacy} drifted from MOON_SKINS.zine.${role}`)
    }
  })
})

describe('MOON_SKINS — legibility across both skins', () => {
  for (const name of SKINS) {
    it(`meets AA for text roles in "${name}"`, () => {
      const palette = skin(name)
      const pairs: Array<[string, string, string]> = [
        ['fg on bg', palette.fg, palette.bg],
        ['fg on bg-1', palette.fg, palette.bg1],
        ['fg-muted on bg', palette.fgMuted, palette.bg],
        ['brand on bg', palette.brand, palette.bg],
        ['on-brand on brand', palette.onBrand, palette.brand],
      ]
      for (const [label, foreground, background] of pairs) {
        assert.ok(contrast(foreground, background) >= 4.5, `${name}: ${label} is ${contrast(foreground, background).toFixed(2)}:1, expected >= 4.5`)
      }
    })

    it(`keeps the focus ring and hairlines visible in "${name}"`, () => {
      const palette = skin(name)
      assert.ok(contrast(palette.focus, palette.bg) >= 3, `${name}: focus ring is ${contrast(palette.focus, palette.bg).toFixed(2)}:1, expected >= 3`)
      assert.ok(contrast(palette.rule, palette.bg) >= 1.5, `${name}: hairline is ${contrast(palette.rule, palette.bg).toFixed(2)}:1, expected >= 1.5`)
    })
  }

  it('keeps the empire call-to-action readable', () => {
    // The zine primary button (white on #ff007a ≈ 3.45:1) predates ADR-0014 and is
    // grandfathered; the empire skin may not inherit that failure.
    const empire = skin('empire')
    assert.ok(contrast(empire.fg, empire.brand2Strong) >= 4.5, `empire CTA is ${contrast(empire.fg, empire.brand2Strong).toFixed(2)}:1, expected >= 4.5`)
    assert.ok(contrast(empire.brand2, empire.bg) >= 3, `empire accent is ${contrast(empire.brand2, empire.bg).toFixed(2)}:1, expected >= 3`)
  })

  it('rejects an inverted pair (guard self-check)', () => {
    assert.ok(contrast('#f7f4ec', '#07060b') > 15)
    assert.ok(contrast('#3a3a3a', '#07060b') < 2)
  })
})

describe('moon.css — the skin blocks honour the contract', () => {
  it('declares the default skin and the empire skin', () => {
    assert.match(CSS, /:root,\s*\n:root\[data-skin='zine'\]\s*\{/)
    assert.match(CSS, /:root\[data-skin='empire'\]\s*\{/)
  })

  it('lets the empire block declare roles and aliases only', () => {
    const declared = declaredProperties(":root[data-skin='empire']")
    const unexpected = declared.filter((property) => !ALLOWED_PROPERTIES.has(property))
    assert.deepEqual(unexpected, [], 'the empire block declares a property outside the allowlist')
    for (const geometry of FORBIDDEN_PROPERTIES) {
      assert.ok(!declared.includes(geometry), `the empire block may not override ${geometry}`)
    }
    assert.ok(!declared.some((property) => property.startsWith('--font-')), 'the empire block may not override a font stack')
  })

  it('declares every role and alias in both skins', () => {
    const zine = declaredProperties(":root[data-skin='zine']")
    const empire = declaredProperties(":root[data-skin='empire']")
    for (const property of [...ROLE_PROPERTIES, ...ALIAS_PROPERTIES]) {
      assert.ok(zine.includes(property), `the default skin is missing ${property}`)
      assert.ok(empire.includes(property), `the empire skin is missing ${property}`)
    }
  })

  it('keeps geometry in the default block only', () => {
    const zine = declaredProperties(":root[data-skin='zine']")
    for (const geometry of FORBIDDEN_PROPERTIES) {
      assert.ok(zine.includes(geometry), `the default skin must keep ${geometry}`)
    }
    assert.match(declarations(":root[data-skin='zine']"), /--font-editorial:/)
  })

  it('keeps every default-skin value identical to the shipped zine palette', () => {
    const declared = declarations(":root[data-skin='zine']")
    const values = new Map(
      [...declared.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((match) => [match[1], match[2].trim().toLowerCase().replace(/\s+/g, '')]),
    )
    for (const property of PALETTE_ROLE_PROPERTIES) {
      const expected = String(skin('zine')[roleKey(property) as keyof (typeof MOON_SKINS)['zine']])
        .toLowerCase()
        .replace(/\s+/g, '')
      assert.equal(values.get(property), expected, `moon.css ${property} drifted from MOON_SKINS.zine`)
    }
  })

  it('routes the danger and accent variants through roles', () => {
    assert.match(CSS, /\.m-btn\[data-variant="danger"\]\s*\{\s*background:\s*var\(--danger\)/)
    assert.match(CSS, /\.m-btn\[data-variant="accent"\]\s*\{[\s\S]*?color:\s*var\(--on-brand\)/)
  })
})
