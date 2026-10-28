/**
 * UI-F16 regression contract for the mobile navigation drawer in
 * `src/ui/components/shell.tsx`. The drawer was fixed under M19-13/M19-18 and is
 * considered closed work; this test exists so a later edit cannot quietly break
 * it: Escape must dismiss, Tab must not be able to leave the drawer, focus must
 * return to the trigger, and the ARIA relationship between trigger and dialog
 * must stay intact.
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
const shellPath = path.resolve(appRoot, 'src', 'ui', 'components', 'shell.tsx')
const shellSource = readFileSync(shellPath, 'utf8')

/**
 * `shell.tsx` is a client component with JSX and `@/` aliases, so it is compiled
 * and rewritten exactly the way the header semantics test does, into a temp
 * module under `test/` that is removed again in the same tick.
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
  const tempPath = path.resolve(testDir, '.temp-drawer-shell.mjs')
  writeFileSync(tempPath, outputText)
  try {
    return await import(pathToFileURL(tempPath).href)
  } finally {
    unlinkSync(tempPath)
  }
}

const { SiteHeader } = await loadShell()

const renderHeader = (initialPath, initialLocale = 'en') =>
  renderToStaticMarkup(
    createElement(SiteHeader, { initialPath, initialSearch: '', initialLocale }),
  )

// ------------------------------------------------------- keyboard contract ----

test('UI-F16 the drawer owns refs for the trigger, the dialog and the previously focused element', () => {
  assert.match(shellSource, /const triggerRef = useRef<HTMLButtonElement>\(null\)/)
  assert.match(shellSource, /const drawerRef = useRef<HTMLDivElement>\(null\)/)
  assert.match(
    shellSource,
    /const previousActiveElementRef = useRef<HTMLElement \| null>\(null\)/,
    'focus restoration needs its own ref, not a module-level variable',
  )
  assert.match(shellSource, /<button\s+ref=\{triggerRef\}/)
  assert.match(shellSource, /ref=\{drawerRef\}/)
})

test('UI-F16 Escape dismisses the drawer and consumes the keypress', () => {
  assert.match(
    shellSource,
    /if \(event\.key === 'Escape'\) \{\s*event\.preventDefault\(\)\s*closeMenu\(\)\s*return/,
    'Escape must preventDefault and close, in that order, before the Tab branch',
  )
})

test('UI-F16 Tab is trapped inside the drawer in both directions', () => {
  assert.match(shellSource, /if \(event\.key === 'Tab'\)/)
  assert.match(
    shellSource,
    /const first = focusable\[0\]\s*const last = focusable\[focusable\.length - 1\]/,
    'the trap must resolve its own first and last tabbable nodes',
  )
  assert.match(
    shellSource,
    /if \(event\.shiftKey\) \{\s*if \(document\.activeElement === first\) \{\s*event\.preventDefault\(\)\s*last\.focus\(\)/,
    'shift+Tab on the first node must wrap to the last',
  )
  assert.match(
    shellSource,
    /if \(document\.activeElement === last\) \{\s*event\.preventDefault\(\)\s*first\.focus\(\)/,
    'Tab on the last node must wrap to the first',
  )
})

test('UI-F16 the open-focus step and the Tab trap use one identical focusable selector', () => {
  // Keep the selector centralized so opening focus and Tab trapping cannot drift.
  const helper = /function drawerFocusableElements\(drawer: HTMLDivElement\): HTMLElement\[\] \{([\s\S]*?)\n\}/.exec(shellSource)?.[0] ?? ''
  assert.ok(helper.length > 0, 'the drawer focus selector is defined in one helper')
  assert.equal((shellSource.match(/function drawerFocusableElements\(/g) ?? []).length, 1)
  assert.equal((shellSource.match(/drawerFocusableElements\(drawer\)/g) ?? []).length, 2,
    'the same helper serves focus-on-open and the Tab trap')
  assert.match(helper, /querySelectorAll<HTMLElement>\(\s*'a\[href\], button:not\(\[disabled\]\)/)
  assert.match(helper, /\[tabindex\]:not\(\[tabindex="-1"\]\)/, 'the selector must honour tabindex')
})

test('UI-F16 focus is captured on open and restored to the trigger on close', () => {
  assert.match(
    shellSource,
    /previousActiveElementRef\.current = document\.activeElement as HTMLElement \| null/,
    'the element that opened the drawer is recorded before focus moves',
  )
  assert.match(shellSource, /focusable\[0\]\.focus\(\)/, 'focus moves into the drawer on open')
  assert.match(
    shellSource,
    /if \(previousActiveElementRef\.current\) \{\s*previousActiveElementRef\.current\.focus\(\)\s*previousActiveElementRef\.current = null/,
    'closing restores focus and clears the ref, so a later close cannot steal it',
  )
})

test('UI-F16 the key handler is bound while open and unbound on every other path', () => {
  assert.match(shellSource, /window\.addEventListener\('keydown', handleKeyDown\)/)
  assert.match(
    shellSource,
    /return \(\) => \{\s*window\.removeEventListener\('keydown', handleKeyDown\)/,
    'the effect must return a cleanup, or every opened drawer leaves a listener behind',
  )
  assert.match(shellSource, /\}, \[isMenuOpen, closeMenu\]\)/, 'the effect re-runs on open and close')
})

// ------------------------------------------------------------ aria contract ----

test('UI-F16 the trigger declares the dialog it controls and its own state', () => {
  assert.match(shellSource, /aria-expanded=\{isMenuOpen\}/)
  assert.match(shellSource, /aria-controls="dk-mobile-menu"/)
  assert.match(shellSource, /id="dk-mobile-menu"/)
})

test('UI-F16 the drawer is a modal dialog that is hidden, not merely styled away', () => {
  assert.match(shellSource, /role="dialog"/)
  assert.match(shellSource, /aria-modal="true"/)
  assert.match(
    shellSource,
    /hidden=\{!isMenuOpen\}/,
    'a closed drawer must be hidden from assistive tech, not just off-screen',
  )
  assert.match(shellSource, /display: isMenuOpen \? 'flex' : 'none'/)
})

test('UI-F16 both the trigger and the in-drawer close give a localized accessible name', () => {
  assert.match(
    shellSource,
    /const toggleLabel = isMenuOpen\s*\?\s*initialLocale === 'id'\s*\?\s*'Tutup navigasi'\s*:\s*'Close navigation'\s*:\s*initialLocale === 'id'\s*\?\s*'Buka navigasi'\s*:\s*'Open navigation'/,
    'the trigger label must state the action in the visitor locale',
  )
  assert.match(shellSource, /aria-label=\{toggleLabel\}/)
  assert.match(
    shellSource,
    /aria-label=\{initialLocale === 'id' \? 'Tutup navigasi' : 'Close navigation'\}\s*onClick=\{closeMenu\}/,
    'the drawer carries its own dismiss control',
  )
})

test('UI-F16 route-active marking is applied in the desktop nav and again in the drawer', () => {
  const desktopNav = /<nav className="dk-nav"[\s\S]*?<\/nav>/.exec(shellSource)?.[0] ?? ''
  const drawerNav = /<nav\s+className="dk-mobile-nav"[\s\S]*?<\/nav>/.exec(shellSource)?.[0] ?? ''
  assert.match(desktopNav, /aria-current=\{active \? 'page' : undefined\}/)
  assert.match(drawerNav, /aria-current=\{active \? 'page' : undefined\}/)
  assert.match(drawerNav, /onClick=\{closeMenu\}/, 'a drawer link dismisses the drawer on activation')

  const indexDisclosure = shellSource.slice(shellSource.indexOf('function IndexDisclosure('), shellSource.indexOf('/**\n * Normalizes a path'))
  assert.match(indexDisclosure, /aria-current=\{active \? 'page' : undefined\}/,
    'reusable index links mark their own active route')
})

// -------------------------------------------------------------- rendered ----

test('UI-F16 a rendered header starts with the drawer closed and correctly labelled', () => {
  const html = renderHeader('/id', 'id')
  assert.match(
    html,
    /<button[^>]*class="[^"]*dk-mobile-menu-toggle[^"]*"[^>]*aria-expanded="false"[^>]*aria-controls="dk-mobile-menu"/,
  )
  assert.match(html, /aria-label="Buka navigasi"/, 'an Indonesian visitor gets an Indonesian control name')
  assert.match(html, /<div[^>]*id="dk-mobile-menu"[^>]*role="dialog"[^>]*aria-modal="true"/)
  assert.match(html, /<div[^>]*id="dk-mobile-menu"[^>]*hidden=""/, 'the closed drawer is hidden from the tree')
  assert.doesNotMatch(html, /id="dk-mobile-menu"[^>]*aria-hidden="false"/)
})

test('UI-F16 the drawer marks the active route and leaves the others unmarked', () => {
  const html = renderHeader('/id/stations', 'id')
  const drawer = /<nav class="dk-mobile-nav"[\s\S]*?<\/nav>/.exec(html)?.[0] ?? ''
  assert.ok(drawer.length > 0, 'the drawer navigation must be present in the markup')

  const signal = /<a\b[^>]*href="\/id\/stations"[^>]*>[\s\S]*?<\/a>/.exec(drawer)?.[0] ?? ''
  assert.ok(signal.length > 0, 'the Indonesian route catalog links to /id/stations')
  assert.match(signal, /aria-current="page"/, 'the route is marked current')
  assert.match(signal, />SINYAL(?:<span\b[^>]*>\s*·\s*NYATA<\/span>)?<\/a>/,
    'the active link uses the Indonesian catalog label and may include its status span')

  const reader = /<a\b[^>]*href="\/id\/reader"[^>]*>[\s\S]*?<\/a>/.exec(drawer)?.[0] ?? ''
  assert.match(reader, />BACA(?:<span\b[^>]*>\s*·\s*NYATA<\/span>)?<\/a>/, 'the reader link uses its Indonesian catalog label and status')
  assert.doesNotMatch(reader, /aria-current="page"/)
})

test('UI-F16 the English drawer labels its control and dialog in English', () => {
  const html = renderHeader('/en/terms', 'en')
  assert.match(html, /aria-label="Open navigation"/)
  assert.match(html, /aria-label="Mobile navigation"/)
  const drawer = /<nav class="dk-mobile-nav"[\s\S]*?<\/nav>/.exec(html)?.[0] ?? ''
  const terms = /<a\b[^>]*href="\/en\/terms"[^>]*>[\s\S]*?<\/a>/.exec(drawer)?.[0] ?? ''
  assert.ok(terms.length > 0, 'the English route catalog links to /en/terms')
  assert.match(terms, /aria-current="page"/)
  assert.match(terms, />EXPLORE(?:<span\b[^>]*>[\s\S]*?<\/span>)?<\/a>/,
    'the active link uses the current English catalog label')
})

test('UI-F16 the drawer is announced by its own accessible name, not only by role', () => {
  assert.match(shellSource, /aria-label=\{initialLocale === 'id' \? 'Navigasi seluler' : 'Mobile navigation'\}/)
})
