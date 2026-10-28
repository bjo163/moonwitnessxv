import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  MOON_COLORS,
  MOON_EXPERIENCES,
  MOON_FONTS,
  MOON_SPACING,
} from '../dist/tokens.js'

/**
 * M19-02 — Reader/Research/Story/Operator layout & typography tokens.
 *
 * The suite pins two things at once:
 *  1. intentional difference  — each mode differs in layout/typography values;
 *  2. semantic invariance     — every mode exposes the same key set, reuses the
 *     MOON_FONTS / MOON_SPACING owners, and never grows its own palette.
 */

const MODES = ['reader', 'research', 'story', 'operator'] as const
type Mode = (typeof MODES)[number]

const FONT_VALUES = new Set<string>(Object.values(MOON_FONTS))
const SPACING_VALUES = new Set<string>(Object.values(MOON_SPACING))
const COLOR_VALUES = new Set<string>(Object.values(MOON_COLORS))

/** Semantic key set shared by all four modes (no additions without M19 review). */
const EXPECTED_KEYS = [
  'density',
  'fonts.body',
  'fonts.code',
  'fonts.heading',
  'lineHeight',
  'maxWidth',
  'measure',
  'space.gutter',
  'space.inline',
  'space.section',
  'typeScale.body',
  'typeScale.caption',
  'typeScale.code',
  'typeScale.display',
  'typeScale.heading',
].sort()

const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|(?:rgb|hsl)a?\([^)]*\)/g

function keyPaths(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object') return [prefix]
  const entries = Object.entries(value as Record<string, unknown>)
  return entries.flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  )
}

function colorLiterals(value: unknown): string[] {
  return JSON.stringify(value).match(COLOR_LITERAL) ?? []
}

function px(value: string): number {
  const match = /^(\d+(?:\.\d+)?)px$/.exec(value)
  assert.ok(match, `expected a px type-scale step, received "${value}"`)
  return Number(match[1])
}

function modeOf(name: Mode) {
  const mode = MOON_EXPERIENCES[name]
  assert.ok(mode, `mode "${name}" must exist`)
  return mode
}

describe('MOON_EXPERIENCES — four reading modes', () => {
  it('exposes exactly reader, research, story and operator', () => {
    assert.deepEqual(Object.keys(MOON_EXPERIENCES).sort(), [...MODES].sort())
  })

  it('keeps the same semantic key set in every mode', () => {
    const reference = keyPaths(modeOf('reader')).sort()
    assert.deepEqual(reference, EXPECTED_KEYS)
    for (const name of MODES) {
      assert.deepEqual(
        keyPaths(modeOf(name)).sort(),
        reference,
        `mode "${name}" drifts from the shared key set`,
      )
    }
  })

  it('does not relabel a reader token as a story token', () => {
    // Same key names AND same value types: story may only change values.
    assert.deepEqual(keyPaths(modeOf('story')).sort(), keyPaths(modeOf('reader')).sort())
    for (const key of ['measure', 'maxWidth', 'density'] as const) {
      assert.equal(typeof modeOf('story')[key], typeof modeOf('reader')[key])
    }
    assert.equal(typeof modeOf('story').lineHeight, 'number')
    assert.equal(typeof modeOf('reader').lineHeight, 'number')
  })

  it('draws every font from MOON_FONTS and keeps code text monospaced', () => {
    for (const name of MODES) {
      const { fonts } = modeOf(name)
      for (const role of ['heading', 'body', 'code'] as const) {
        assert.ok(
          FONT_VALUES.has(fonts[role]),
          `mode "${name}" fonts.${role} must be a MOON_FONTS member`,
        )
      }
      assert.equal(fonts.code, MOON_FONTS.mono, `mode "${name}" must keep code text mono`)
      assert.equal(fonts.body, MOON_FONTS.sans, `mode "${name}" must keep body text sans`)
    }
  })

  it('draws every spacing decision from MOON_SPACING', () => {
    for (const name of MODES) {
      for (const slot of ['gutter', 'section', 'inline'] as const) {
        assert.ok(
          SPACING_VALUES.has(modeOf(name).space[slot]),
          `mode "${name}" space.${slot} must be a MOON_SPACING member`,
        )
      }
    }
  })

  it('keeps a descending, legible type scale in px', () => {
    for (const name of MODES) {
      const { display, heading, body, caption, code } = modeOf(name).typeScale
      assert.ok(px(display) > px(heading), `mode "${name}" display must exceed heading`)
      assert.ok(px(heading) > px(body), `mode "${name}" heading must exceed body`)
      assert.ok(px(body) >= px(caption), `mode "${name}" body must not be smaller than caption`)
      assert.ok(px(body) >= 12, `mode "${name}" body must stay >= 12px`)
      assert.ok(px(code) >= 10, `mode "${name}" code must stay >= 10px`)
    }
  })

  it('keeps leading inside a readable band', () => {
    for (const name of MODES) {
      const { lineHeight } = modeOf(name)
      assert.ok(lineHeight >= 1.25 && lineHeight <= 2, `mode "${name}" line-height out of band`)
    }
  })
})

describe('MOON_EXPERIENCES — intentional differences without semantic drift', () => {
  it('gives reader and operator deliberately different measure and density', () => {
    const reader = modeOf('reader')
    const operator = modeOf('operator')
    assert.notEqual(reader.measure, operator.measure)
    assert.notEqual(reader.maxWidth, operator.maxWidth)
    assert.notEqual(reader.density, operator.density)
    assert.ok(reader.lineHeight > operator.lineHeight)
  })

  it('gives each mode its own density (four distinct intents)', () => {
    const densities = MODES.map((name) => modeOf(name).density)
    assert.equal(new Set(densities).size, MODES.length)
  })

  it('makes every pair of modes differ somewhere', () => {
    for (let i = 0; i < MODES.length; i += 1) {
      for (let j = i + 1; j < MODES.length; j += 1) {
        const left = MODES[i] as Mode
        const right = MODES[j] as Mode
        const a = JSON.stringify(modeOf(left))
        const b = JSON.stringify(modeOf(right))
        assert.notEqual(a, b, `modes "${left}" and "${right}" are identical`)
      }
    }
  })
})

describe('MOON_EXPERIENCES — palette guard', () => {
  it('introduces no colour literal outside MOON_COLORS', () => {
    for (const name of MODES) {
      const rogue = colorLiterals(modeOf(name)).filter((literal) => !COLOR_VALUES.has(literal))
      assert.deepEqual(rogue, [], `mode "${name}" carries a colour outside MOON_COLORS`)
    }
  })

  it('never adds a colour-shaped key to a layout/typography group', () => {
    for (const name of MODES) {
      for (const key of keyPaths(modeOf(name))) {
        assert.doesNotMatch(key, /colou?r|palette|tone|hex|rgba/i)
      }
    }
  })

  it('detects a rogue literal (guard self-check)', () => {
    assert.deepEqual(colorLiterals({ measure: '68ch' }), [])
    const rogue = colorLiterals({ bg: '#ff2a85' }).filter((literal) => !COLOR_VALUES.has(literal))
    assert.deepEqual(rogue, ['#ff2a85'])
    assert.ok(COLOR_VALUES.has(MOON_COLORS.cyan))
  })
})
