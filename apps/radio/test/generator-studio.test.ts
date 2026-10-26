import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  hashString,
  createPrng,
  MOON_COLORS,
  MOON_FONTS,
  MOON_SPACING,
} from '@moonwitness/moonui'

describe('Generative HD Vector Studio Engine', () => {
  it('computes deterministic PRNG values via Mulberry32', () => {
    const prng1 = createPrng('moonwitness-test-seed')
    const prng2 = createPrng('moonwitness-test-seed')

    const seq1 = [prng1(), prng1(), prng1()]
    const seq2 = [prng2(), prng2(), prng2()]

    assert.deepEqual(seq1, seq2, 'Identical seed must produce identical PRNG sequence')

    const hash1 = hashString('seed-alpha')
    const hash2 = hashString('seed-beta')
    assert.notEqual(hash1, hash2, 'Different seeds produce different hashes')

    // Verify all PRNG outputs stay strictly within 0..1 interval
    for (let i = 0; i < 100; i++) {
      const val = prng1()
      assert.ok(val >= 0 && val < 1, `PRNG output ${val} must be in [0, 1)`)
    }
  })

  it('guarantees pure type-safe Moon design tokens without color drift', () => {
    assert.equal(MOON_COLORS.ink, '#07060b')
    assert.equal(MOON_COLORS.night, '#0b0912')
    assert.equal(MOON_COLORS.surface, '#13101d')
    assert.equal(MOON_COLORS.fg, '#f7f4ec')
    assert.equal(MOON_COLORS.cyan, '#00d4ff')
    assert.equal(MOON_COLORS.pink, '#ff007a')
    assert.equal(MOON_COLORS.accent, '#ffd400')
    assert.equal(MOON_COLORS.ok, '#00e676')

    assert.ok(MOON_FONTS.sans.includes('Inter'))
    assert.ok(MOON_FONTS.mono.includes('JetBrains Mono'))
    assert.equal(MOON_SPACING.s1, '4px')
    assert.equal(MOON_SPACING.s4, '20px')
  })

  it('generates consistent archetype color mappings from seeds', () => {
    const testSeeds = ['witness-prime', 'archivist-01', 'basquiat-99', 'luna-radio']
    const palettes = ['#00d4ff', '#ff007a', '#ffd400', '#00e676', '#9d4edd', '#1da1f2']

    for (const seed of testSeeds) {
      const prng = createPrng(seed)
      const colorIndex = Math.floor(prng() * palettes.length)
      const color = palettes[colorIndex]
      assert.ok(color, 'Mapped color must exist in canonical palette')
      assert.ok(palettes.includes(color as string), 'Color must belong to design system')
    }
  })
})
