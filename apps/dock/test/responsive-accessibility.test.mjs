import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const globalsCssPath = join(__dirname, '../src/app/globals.css')
const cssContent = readFileSync(globalsCssPath, 'utf8')

/**
 * Helper to extract the contents of a CSS block by tracking curly brace depth.
 */
function extractMediaBlock(css, mediaQueryRegex) {
  const match = css.match(mediaQueryRegex)
  if (!match) return null
  const startIndex = match.index + match[0].length
  let depth = 1
  let i = startIndex
  while (i < css.length && depth > 0) {
    if (css[i] === '{') depth++
    else if (css[i] === '}') depth--
    i++
  }
  return css.slice(startIndex, i - 1)
}

function extractRule(css, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{`))
  if (!match) return null

  const startIndex = match.index + match[0].length
  let depth = 1
  let i = startIndex
  while (i < css.length && depth > 0) {
    if (css[i] === '{') depth++
    else if (css[i] === '}') depth--
    i++
  }
  return css.slice(startIndex, i - 1)
}

test('globals.css defines prefers-reduced-motion media query suppressing animations and hover transforms', () => {
  assert.match(
    cssContent,
    /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/i,
    'globals.css must define prefers-reduced-motion: reduce media query'
  )

  const reducedMotionBlock = extractMediaBlock(cssContent, /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{/)
  assert.ok(reducedMotionBlock, 'Reduced-motion media query block must be extracted')

  // Verify instantaneous animation & transition durations
  assert.match(
    reducedMotionBlock,
    /animation-duration:\s*0\.01ms\s*!important/i,
    'Must set animation-duration to 0.01ms !important'
  )
  assert.match(
    reducedMotionBlock,
    /animation-iteration-count:\s*1\s*!important/i,
    'Must set animation-iteration-count to 1 !important'
  )
  assert.match(
    reducedMotionBlock,
    /transition-duration:\s*0\.01ms\s*!important/i,
    'Must set transition-duration to 0.01ms !important'
  )

  // Verify spinner and animated element rules
  assert.match(
    reducedMotionBlock,
    /\.m-spinner/,
    'Must explicitly target .m-spinner to suppress loading animation'
  )

  // Verify hover transform resets
  assert.match(
    reducedMotionBlock,
    /\.dk-station:hover/,
    'Must target .dk-station:hover'
  )
  assert.match(
    reducedMotionBlock,
    /\.m-btn:hover/,
    'Must target .m-btn:hover'
  )
  assert.match(
    reducedMotionBlock,
    /transform:\s*none\s*!important/i,
    'Must reset transforms on hover to none !important'
  )
  assert.match(
    cssContent,
    /\.dk-space-card:hover\s*\{[^}]*transform:\s*translateY\(-2px\)/i,
    'Space cards must define the hover transform that reduced motion overrides'
  )
  assert.match(
    reducedMotionBlock,
    /\.dk-space-card:hover[\s\S]*?transform:\s*none\s*!important/i,
    'Reduced motion must suppress the space-card hover transform'
  )
})

test('globals.css defines visible keyboard focus-visible outline rules for navigation links and buttons', () => {
  // Navigation links focus outline
  assert.match(
    cssContent,
    /\.dk-nav\s+a:focus-visible/,
    'Must define focus-visible outline for .dk-nav a'
  )

  // Icon buttons focus outline
  assert.match(
    cssContent,
    /\.dk-icon-btn:focus-visible/,
    'Must define focus-visible outline for .dk-icon-btn'
  )

  // System buttons focus outline
  assert.match(
    cssContent,
    /\.m-btn:focus-visible/,
    'Must define focus-visible outline for .m-btn'
  )

  // Brand logo link focus outline
  assert.match(
    cssContent,
    /\.m-brand-link:focus-visible/,
    'Must define focus-visible outline for .m-brand-link'
  )

  // High contrast outline values matching MoonUI design tokens
  assert.match(
    cssContent,
    /outline:\s*3px\s+solid\s+var\(--accent\)/i,
    'Must use 3px solid var(--accent) focus outline'
  )
  assert.match(
    cssContent,
    /outline-offset:\s*3px/i,
    'Must use 3px outline-offset'
  )
})

test('globals.css defines responsive layout safeguards and horizontal overflow containment', () => {
  // Root viewport horizontal overflow prevention
  assert.match(
    cssContent,
    /html,\s*body\s*\{[^}]*max-width:\s*100vw;[^}]*overflow-x:\s*hidden;/i,
    'Must contain horizontal overflow on html, body'
  )

  // Shell overflow containment
  assert.match(
    cssContent,
    /\.dk-shell\s*\{[^}]*overflow-x:\s*clip;/i,
    'Must constrain horizontal overflow on .dk-shell'
  )

  // Breakpoint 1040px media query
  assert.match(
    cssContent,
    /@media\s*\(\s*max-width:\s*1040px\s*\)/i,
    'Must define media query for max-width: 1040px'
  )

  const media1040Block = extractMediaBlock(cssContent, /@media\s*\(\s*max-width:\s*1040px\s*\)\s*\{/)
  assert.ok(media1040Block, 'max-width: 1040px block must be extracted')

  // Overflow containment inside media query for viewports <1040px
  assert.match(
    media1040Block,
    /max-width:\s*100vw/i,
    'Must reinforce max-width: 100vw inside @media (max-width: 1040px)'
  )
  assert.match(
    media1040Block,
    /overflow-x:\s*hidden/i,
    'Must reinforce overflow-x: hidden inside @media (max-width: 1040px)'
  )

  // Mobile header layout adjustments
  assert.match(
    media1040Block,
    /\.dk-header\s*\{[^}]*padding:/i,
    'Must adjust .dk-header padding for mobile viewports'
  )
  assert.match(
    media1040Block,
    /\.dk-nav\s*\{[^}]*display:\s*none;/i,
    'Must collapse desktop .dk-nav for viewports <= 1040px'
  )
})

test('space cards use the four-to-two-to-one responsive grid without fixed widths', () => {
  const baseGrid = extractRule(cssContent, '.dk-space-grid')
  assert.ok(baseGrid, 'Space grid base rule must exist')
  assert.match(
    baseGrid,
    /grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/i,
    'Wide layouts must render four flexible columns'
  )

  const tabletBlock = extractMediaBlock(cssContent, /@media\s*\(\s*max-width:\s*1024px\s*\)\s*\{/i)
  assert.ok(tabletBlock, 'Tablet grid breakpoint must exist')
  assert.match(
    extractRule(tabletBlock, '.dk-space-grid'),
    /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/i,
    'Tablet layouts must render two flexible columns'
  )

  const mobileBlock = extractMediaBlock(cssContent, /@media\s*\(\s*max-width:\s*560px\s*\)\s*\{/i)
  assert.ok(mobileBlock, 'Mobile grid breakpoint must exist')
  assert.match(
    extractRule(mobileBlock, '.dk-space-grid'),
    /grid-template-columns:\s*minmax\(0,\s*1fr\)/i,
    'Mobile layouts must render one flexible column'
  )

  const cardRule = extractRule(cssContent, '.dk-space-card')
  assert.ok(cardRule, 'Space card rule must exist')
  assert.match(cardRule, /min-width:\s*0/i, 'Cards must be allowed to shrink within the grid')
  assert.match(cardRule, /overflow-wrap:\s*anywhere/i, 'Long card copy must wrap without forcing overflow')
  assert.doesNotMatch(cardRule, /(?:^|;)\s*width:\s*\d+(?:\.\d+)?px\s*(?:;|$)/i, 'Cards must not set a fixed pixel width')
})
