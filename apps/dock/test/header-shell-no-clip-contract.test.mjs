/**
 * UI2-G05 shell contract · the Dock header row and its no-clipping guarantee.
 *
 * The defect this pins is recorded in `docs/audit/ui-visual-harness-d54ad43.md`
 * (defect A) and re-measured in
 * `docs/audit/ui2-g05-shell-contract-47b89f4.md`: at 1440px the header used to be
 * a single non-wrapping flex row, so the 15 single-word nav labels (one line =
 * 1296px) pushed 8 focusable controls past the right edge, where `html, body {
 * overflow-x: hidden }` cut them silently — `documentScrollWidth` still read
 * 1440, so the overflow figure lied.
 *
 * The contract is therefore: the header row wraps, the nav owns its own band and
 * wraps internally, no container on that row clips horizontally, and exactly ONE
 * stylesheet rule set (globals.css, `@media (max-width: 1040px)`) decides when the
 * desktop nav gives way to the drawer. Breaking any of those five invariants
 * reopens defect A, so each one is asserted here. `NAV_LINKS` staying the only nav
 * source, with one desktop bar and one drawer dialog, is the "no second nav" proof.
 */
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL, URL } from 'node:url'
import path from 'node:path'
import test from 'node:test'

const require_ = createRequire(new URL('../package.json', import.meta.url))
const ts = require_('typescript')
const { renderToStaticMarkup } = require_('react-dom/server')
const { createElement } = require_('react')

const testDir = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(testDir, '..')
const cssSource = readFileSync(path.resolve(appRoot, 'src', 'app', 'globals.css'), 'utf8')
const shellSource = readFileSync(path.resolve(appRoot, 'src', 'ui', 'components', 'shell.tsx'), 'utf8')

/** Comments carry the measured numbers this test points at, but they are not CSS. */
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '')

const escapeRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * A top-level rule block for one exact selector, comments preserved (the measured
 * contract is written in them), brace-matched so nested blocks cannot leak in.
 */
function ruleBlock(css, selector) {
  const match = new RegExp(`\\n${escapeRe(selector)}\\s*\\{`).exec(css)
  assert.ok(match, `globals.css must declare a top-level \`${selector}\` rule`)
  let i = match.index + match[0].length
  let depth = 1
  let body = ''
  while (i < css.length && depth > 0) {
    if (css.startsWith('/*', i)) {
      const end = css.indexOf('*/', i)
      assert.notEqual(end, -1, 'globals.css must close every comment')
      body += css.slice(i, end + 2)
      i = end + 2
      continue
    }
    const char = css[i]
    if (char === '{') depth += 1
    else if (char === '}') depth -= 1
    if (depth > 0 && char !== '}') body += char
    i += 1
  }
  return body
}

/** Every `@media` block in the file as `{ query, body }`, comments removed. */
function mediaBlocks(css) {
  const found = []
  const stripped = stripComments(css)
  const re = /@media([^{]+)\{/g
  let match
  while ((match = re.exec(stripped)) !== null) {
    let i = match.index + match[0].length
    let depth = 1
    let body = ''
    while (i < stripped.length && depth > 0) {
      const char = stripped[i]
      if (char === '{') depth += 1
      else if (char === '}') depth -= 1
      if (depth > 0) body += char
      i += 1
    }
    found.push({ query: match[1].trim(), body: stripComments(body) })
  }
  return found
}

/** True when a body mentions one of the shell selectors as a whole selector. */
function mentionsShellSelector(body, selector) {
  return new RegExp(`\\.${selector}(?![\\w-])`).test(body)
}

const HEADER_CLIPPERS = /overflow(?:-x)?:\s*(?:hidden|clip|auto|scroll)/

// ------------------------------------------------- the header row itself ------

test('UI2-G05 the header is a wrapping row, so nothing right of the nav can be pushed off-screen', () => {
  const header = ruleBlock(cssSource, '.dk-header')
  assert.match(header, /flex-wrap:\s*wrap/, 'the header row must wrap; the pre-fix nowrap row is defect A')
  assert.doesNotMatch(
    stripComments(header),
    HEADER_CLIPPERS,
    'a row of focusable controls may not clip or scroll horizontally — that is what hid defect A',
  )
})

test('UI2-G05 the measured fit of the header row is recorded where the rule lives', () => {
  // DoD "source of truth documented": the numbers are part of the rule, not folklore.
  const header = ruleBlock(cssSource, '.dk-header')
  assert.match(header, /1041px[\s\S]*?1920px/, 'the rule must cite the measured viewport range')
  assert.match(header, /1440px/, '1440px is the width defect A was reported at')
})

test('UI2-G05 the nav owns its own band and wraps internally instead of overflowing', () => {
  const nav = stripComments(ruleBlock(cssSource, '.dk-nav'))
  assert.match(nav, /order:\s*3/, 'the nav is placed last so the brand and the cluster keep their width')
  assert.match(nav, /flex-wrap:\s*wrap/, '16 single-word labels cannot shrink; they have to wrap')
  assert.match(nav, /min-width:\s*0/, 'without this the flex item resolves to its one-line min-content')
  assert.doesNotMatch(nav, HEADER_CLIPPERS, 'the nav band may not hide its own overflow')
})

// --------------------------------------------------- one breakpoint, one owner -

test('UI2-G05 globals.css is the single owner of the desktop/drawer switch', () => {
  const blocks = mediaBlocks(cssSource).filter((entry) => /max-width:\s*1040px/.test(entry.query))
  assert.equal(blocks.length, 1, 'exactly one 1040px block may govern the shell')

  const shell = blocks[0].body
  assert.match(shell, /\.dk-nav\s*\{[^}]*display:\s*none/, 'the desktop nav collapses at 1040px')
  assert.match(
    shell,
    /\.dk-mobile-menu-toggle\s*\{[^}]*display:\s*grid/,
    'the drawer trigger appears exactly where the desktop nav stops fitting',
  )
})

test('UI2-G05 no other media query re-decides the shell nav, so no second breakpoint was invented', () => {
  for (const block of mediaBlocks(cssSource)) {
    if (/max-width:\s*1040px/.test(block.query)) continue
    for (const selector of ['dk-nav', 'dk-header', 'dk-mobile-menu-toggle']) {
      assert.ok(
        !mentionsShellSelector(block.body, selector),
        `.${selector} must not be restyled inside @media ${block.query}`,
      )
    }
  }
})

test('UI2-G05 the drawer trigger is hidden above the breakpoint by source order, not by !important', () => {
  const desktop = stripComments(cssSource).match(/\n\.dk-mobile-menu-toggle\s*\{[^}]*\}/)
  assert.ok(desktop, 'globals.css must hide .dk-mobile-menu-toggle on the desktop row')
  assert.match(desktop[0], /display:\s*none/)
  assert.doesNotMatch(desktop[0], /!important/, 'the switch must not be forced, or nothing can ever override it')
  const iconBtnIndex = cssSource.indexOf('\n.dk-icon-btn {')
  const toggleIndex = cssSource.indexOf('\n.dk-mobile-menu-toggle {')
  assert.ok(iconBtnIndex >= 0, '.dk-icon-btn also declares display, so it must exist to order against')
  assert.ok(
    toggleIndex > iconBtnIndex,
    'the trigger rule must come after .dk-icon-btn; its display: grid would otherwise win',
  )
})

test('UI2-G05 the header component declares no breakpoint of its own', () => {
  // An inline <style> here re-created the 1040px rule with !important, giving one
  // breakpoint two owners; the shell must not grow a stylesheet again.
  assert.doesNotMatch(shellSource, /<style>/, 'the shell must not restyle itself inline')
  assert.doesNotMatch(shellSource, /@media/, 'the shell must not own a media query')
  assert.doesNotMatch(shellSource, /max-width:\s*1040px/, 'the breakpoint must not be repeated in the component')
  assert.doesNotMatch(shellSource, /!important/, 'the drawer switch is resolved by stylesheet order alone')
})

// --------------------------------------------------------- no second nav ------

/**
 * `shell.tsx` is a client component with JSX and `@/` aliases, so it is compiled
 * and rewritten exactly the way the drawer contract test does, into a temp module
 * under `test/` that is removed again in the same tick.
 */
async function loadShell() {
  const srcDir = path.resolve(appRoot, 'src')
  let code = shellSource.replace(/from ['"]@\/([^'"]+)['"]/g, (_match, subpath) => {
    let target = path.join(srcDir, subpath)
    if (!target.endsWith('.mjs') && !target.endsWith('.ts') && !target.endsWith('.tsx')) {
      target += '.ts'
    }
    return `from '${pathToFileURL(target).href}'`
  })
  code = code.replace(
    /import\s*\{\s*LocaleSwitcher\s*\}\s*from\s*['"]\.\/locale-switcher['"]/,
    'const LocaleSwitcher = () => null;',
  )

  const { outputText } = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  })
  const tempPath = path.resolve(testDir, '.temp-g05-shell.mjs')
  writeFileSync(tempPath, outputText)
  try {
    return await import(pathToFileURL(tempPath).href)
  } finally {
    unlinkSync(tempPath)
  }
}

const { SiteHeader, NAV_LINKS } = await loadShell()

const renderHeader = (initialPath, initialLocale = 'en') =>
  renderToStaticMarkup(createElement(SiteHeader, { initialPath, initialSearch: '', initialLocale }))

test('UI2-G05 one nav source feeds the shell; the second surface is the drawer, closed at rest', () => {
  const html = renderHeader('/en')
  const navs = html.match(/<nav\b/g) ?? []
  assert.equal(navs.length, 2, 'the shell is one desktop bar plus one drawer dialog, never a third bar')

  const desktop = /<nav class="dk-nav"[\s\S]*?<\/nav>/.exec(html)?.[0] ?? ''
  assert.ok(desktop.length > 0, 'the desktop bar must render')
  assert.equal((desktop.match(/<a\b/g) ?? []).length, NAV_LINKS.length)

  const drawerStart = html.indexOf('id="dk-mobile-menu"')
  const drawerNavStart = html.indexOf('<nav class="dk-mobile-nav"')
  assert.ok(drawerStart >= 0 && drawerNavStart > drawerStart, 'the drawer nav lives inside the dialog')
  assert.match(html.slice(drawerStart, drawerNavStart), /hidden=""/, 'the drawer is closed and hidden at rest')

  // Both surfaces map the same array; nothing hardcodes a parallel link list.
  assert.equal((shellSource.match(/NAV_LINKS\.map\(/g) ?? []).length, 2)
  assert.equal(
    NAV_LINKS.length,
    15,
    'the label row measured at 1296px is the case defect A was reported for',
  )
})

test('UI2-G05 the shell consumes MoonUI tokens rather than naming colors in the header row', () => {
  const nav = stripComments(ruleBlock(cssSource, '.dk-nav'))
  assert.match(nav, /var\(--font-display\)/, 'the nav type must come from the shared token set')
  assert.doesNotMatch(nav, /#[0-9a-f]{3,6}\b/i, 'no color literal may enter the header nav row')
})

test('UI2-G05 horizontal clipping is not reintroduced anywhere else in the header row', () => {
  // `.dk-shell` and `html, body` clip for the page; the header row itself must be
  // visible without that backstop, so assert no ancestor rule added a clip on it.
  const shell = stripComments(ruleBlock(cssSource, '.dk-shell'))
  assert.match(shell, /overflow-x:\s*clip/, 'the page keeps its documented page-level backstop')
  const header = stripComments(ruleBlock(cssSource, '.dk-header'))
  const nav = stripComments(ruleBlock(cssSource, '.dk-nav'))
  for (const row of [header, nav]) {
    assert.doesNotMatch(row, HEADER_CLIPPERS, 'the row that carries focusable controls must not clip')
  }
})
