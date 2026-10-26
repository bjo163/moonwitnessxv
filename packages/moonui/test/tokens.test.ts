import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  MOON_COLORS,
  MOON_FONTS,
  MOON_SPACING,
  MOON_SHADOWS,
  MOON_BORDERS,
  MOON_GLOWS,
} from '../dist/tokens.js'

describe('MoonUI Design Tokens (Single Source of Truth)', () => {
  it('exports canonical cyber/moon color palette with zero drift', () => {
    assert.equal(MOON_COLORS.ink, '#07060b')
    assert.equal(MOON_COLORS.pink, '#ff007a')
    assert.equal(MOON_COLORS.cyan, '#00d4ff')
    assert.equal(MOON_COLORS.accent, '#ffd400')
    assert.equal(MOON_COLORS.ok, '#00e676')
    assert.equal(MOON_COLORS.surface, '#13101d')
    assert.equal(MOON_COLORS.paper, '#0d0b14')
    assert.equal(MOON_COLORS.fg, '#f7f4ec')
  })

  it('exports standardized typography token families', () => {
    assert.ok(MOON_FONTS.sans.includes('Inter'))
    assert.ok(MOON_FONTS.display.includes('Anton') || MOON_FONTS.display.includes('Impact'))
    assert.ok(MOON_FONTS.mono.includes('JetBrains Mono'))
  })

  it('exports consistent spacing and brutalist shadows', () => {
    assert.equal(MOON_SPACING.s1, '4px')
    assert.equal(MOON_SPACING.s3, '12px')
    assert.equal(MOON_SPACING.s5, '32px')
    assert.equal(MOON_SHADOWS.brutal, '3px 3px 0 #000000')
    assert.equal(MOON_SHADOWS.pink, '3px 3px 0 #ff007a')
  })

  it('exports high-fidelity neon glow tokens', () => {
    assert.ok(MOON_GLOWS.pink.startsWith('rgba(255, 0, 122'))
    assert.ok(MOON_GLOWS.cyan.startsWith('rgba(0, 212, 255'))
    assert.ok(MOON_GLOWS.accent.startsWith('rgba(255, 212, 0'))
    assert.ok(MOON_GLOWS.ok.startsWith('rgba(0, 230, 118'))
  })
})
