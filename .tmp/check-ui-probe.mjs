#!/usr/bin/env node
/**
 * scripts/check-ui-consistency.mjs
 *
 * Shared-first UI enforcement for the MoonWitness monorepo (ADR-0017).
 *
 * Checks
 *   C1 Surface adoption      every app component file consumes a MoonUI value export
 *   C2 Token purity          no drifted hex literals across any discovered app
 *   C3 Component classes     app stylesheets may not define primitive-level classes
 *                            (suffix matched after `__` / `--` are folded to `-`)
 *   C4 Typography            font stacks come from tokens
 *   C5 Duplicate matrix      one component name, one owner; collisions with MoonUI fail
 *   C6 Exception ledger      bounded, enumerated debt that may only shrink
 *   C7 Design-system CSS     a MoonUI component may not depend on an app stylesheet
 *   C8 Markup fingerprint    an app file may not re-render a MoonUI view's class set
 *   C9 Derived class names   a MoonUI file may not concatenate a class name from data
 *   C10 Primitive overrides  an app stylesheet may not restyle a MoonUI primitive
 *
 * Usage
 *   node scripts/check-ui-consistency.mjs [--root <dir>] [--json[=path]] [--update-ledger]
 *
 * Exit code 0 when every check passes, 1 when any violation is found.
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { APPS } from '../scripts/apps.registry.mjs'

const SCRIPT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Ceiling for `docs/design/moonui-exceptions.json`.
 *
 * This constant is the ratchet. It may only decrease: raising it turns a quiet
 * ledger edit into a visible source diff that a reviewer has to approve.
 *
 * HISTORY — 30 October 2026: 40 -> 41 -> 40. The brief rise was a measurement
 * correction, not an allowance for new debt. C3 had matched component-class
 * suffixes only after a hyphen, so the Empire Story Universe's BEM spellings
 * (`.su-lib__tab`, `.su-info__card`, `.su-reader__pager`, `.su-home__card`) were
 * invisible to the gate while the identical anatomy under a hyphenated name
 * failed. Folding `__` and `--` to `-` exposed one further stylesheet, and the
 * entry was recorded rather than hidden. It went back down the same day because
 * the GGS page fork was deleted instead of exempted: `StoryGgsPage` is now the
 * only implementation, so `apps/empire-web/src/components/story/GgsPage.tsx`
 * holds no markup and left the ledger. The rest of the Story Universe followed
 * the same wave — `StoryCodexPage`, `StoryLibraryPage` and `StoryReaderPage` are
 * now the only implementations of REF-02/03/04, `site.tsx` owns the
 * information-page shell, and `landing.tsx` owns the entry page — taking the
 * ceiling to 35.
 * Every later change must keep shrinking this number.
 */
const RATCHET = 35

/**
 * Files whose basename means "composition root": the framework entry or the
 * route/layout layer. They render markup by design (ADR-0017 R2) and are not
 * reusable components, so they are never ledgers.
 */
const ROUTE_BASENAMES = new Set([
  'page.tsx',
  'layout.tsx',
  'template.tsx',
  'error.tsx',
  'global-error.tsx',
  'global-not-found.tsx',
  'loading.tsx',
  'not-found.tsx',
  'default.tsx',
  'route.tsx',
  'main.tsx',
  // A Vite app has no route folder: `App` is the single composition root.
  'App.tsx',
])

/** Composition roots that live outside `app/` but own the route shell. */
const COMPOSITION_ROOT_SEGMENTS = ['/layouts/', '/app/', '/pages/']

/** Skip walk targets that are build output or dependencies. */
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', 'out', 'coverage', '.git', '.vercel'])

/** Known rogue/drift hex colours and their standard token replacements. */
const DRIFTED_COLORS = [
  { pattern: /#00e5ff\b/gi, fix: 'var(--cyan) (#00d4ff)' },
  { pattern: /#00ffff\b/gi, fix: 'var(--cyan) (#00d4ff)' },
  { pattern: /#22d3ee\b/gi, fix: 'var(--cyan) (#00d4ff)' },
  { pattern: /#38bdf8\b/gi, fix: 'var(--cyan) (#00d4ff)' },
  { pattern: /#ff2a85\b/gi, fix: 'var(--pink) (#ff007a)' },
  { pattern: /#ff1493\b/gi, fix: 'var(--pink) (#ff007a)' },
  { pattern: /#ff85a1\b/gi, fix: 'var(--hot) (#ff1e56)' },
  { pattern: /#e11d48\b/gi, fix: 'var(--hot) (#ff1e56)' },
  { pattern: /#f43f5e\b/gi, fix: 'var(--hot) (#ff1e56)' },
  { pattern: /#090a0f\b/gi, fix: 'var(--ink) (#07060b)' },
  { pattern: /#040307\b/gi, fix: 'var(--ink) (#07060b)' },
  { pattern: /#05040a\b/gi, fix: 'var(--ink) (#07060b)' },
  { pattern: /#090d16\b/gi, fix: 'var(--ink) (#07060b)' },
  { pattern: /#12151e\b/gi, fix: 'var(--surface) (#13101d)' },
  { pattern: /#181d2a\b/gi, fix: 'var(--surface-2) (#1b172a)' },
  { pattern: /#1b2234\b/gi, fix: 'var(--surface-2) (#1b172a)' },
  { pattern: /#242b3d\b/gi, fix: 'var(--border) (#252038)' },
  { pattern: /#2a324b\b/gi, fix: 'var(--border) (#252038)' },
  { pattern: /#384561\b/gi, fix: 'var(--chalk-dim) or var(--cyan)' },
  { pattern: /#10b981\b/gi, fix: 'var(--ok) (#00e676)' },
  { pattern: /#f59e0b\b/gi, fix: 'var(--accent) (#ffd400)' },
  { pattern: /#fff280\b/gi, fix: 'var(--accent) (#ffd400)' },
  { pattern: /#facc15\b/gi, fix: 'var(--accent) (#ffd400)' },
  { pattern: /#a855f7\b/gi, fix: 'var(--moon) (#7c3aed)' },
  { pattern: /#e6edf3\b/gi, fix: 'var(--fg) (#f7f4ec)' },
  { pattern: /#8b949e\b/gi, fix: 'var(--muted) (#8e879f)' },
]

/**
 * Class-name suffixes that describe a primitive. An app stylesheet that styles
 * `*-btn`, `*-card`, `*-dialog`… is reskinning a component MoonUI already owns.
 * Suffix matching, not a literal list: a renamed class must not slip through.
 */
const COMPONENT_CLASS_SUFFIXES = [
  '-btn',
  '-button',
  '-card',
  '-dialog',
  '-modal',
  '-chip',
  '-pill',
  '-badge',
  '-tab',
  '-tabs',
  '-tab-btn',
  '-nav',
  '-nav-link',
  '-navbar',
  '-table',
  '-input',
  '-select',
  '-textarea',
  '-toggle',
  '-switch',
  '-tooltip',
  '-toast',
  '-spinner',
  '-skeleton',
  '-stat',
  '-stat-row',
  '-panel',
  '-pager',
  '-pagination',
  '-progress',
  '-empty',
  '-alert',
]

/**
 * Component names that only one owner may implement. Populated from the MoonUI
 * barrels at runtime and extended with the obvious synonyms a fork tends to
 * pick when it renames a primitive instead of importing it.
 */
const SHARED_NAME_ALIASES = [
  'Alert',
  'Badge',
  'Breadcrumbs',
  'Button',
  'Card',
  'Chip',
  'Column',
  'DataTable',
  'Dialog',
  'Field',
  'Kbd',
  'KbdLegend',
  'LinkButton',
  'List',
  'Modal',
  'Nav',
  'PageHeader',
  'Panel',
  'Pagination',
  'Pill',
  'Popover',
  'ProgressBar',
  'Select',
  'SelectInput',
  'Sheet',
  'Skeleton',
  'Spinner',
  'Stat',
  'StatRow',
  'StatStrip',
  'Switch',
  'Tab',
  'TabBar',
  'Table',
  'Tabs',
  'Tag',
  'TextInput',
  'Textarea',
  'Toast',
  'Toggle',
  'Tooltip',
]

/**
 * Component names every Vite app legitimately names after itself. An app root is
 * a container, not a primitive: two apps both calling theirs `App` is not a fork.
 */
const ENTRY_COMPONENT_NAMES = new Set(['App'])

const LEDGER_RELATIVE_PATH = 'docs/design/moonui-exceptions.json'
const MOONUI_BARRELS = ['packages/moonui/src/index.ts', 'packages/moonui/src/client/index.ts']
const MOONUI_SOURCE_DIR = 'packages/moonui/src'
const MOONUI_STYLESHEET = 'packages/moonui/moon.css'

/**
 * Ceiling for the C7 debt list (classes a MoonUI component emits whose CSS only
 * an application stylesheet defines).
 *
 * It is a ratchet in the same sense as RATCHET: the count was measured, not
 * guessed, and it may only shrink. Moving a rule into `moon.css` removes one.
 *
 * HISTORY — measured at 120 on 30 October 2026 across the promoted surfaces:
 * `site.tsx`/`client/site-header.tsx`/`story.tsx` (82 Empire classes),
 * `surfaces/orbit.tsx`/`client/surfaces/orbit.tsx` (24), `surfaces/cockpit.tsx`
 * (11) and `surfaces/echolog.tsx` (3). Earlier waves moved markup into MoonUI
 * without moving its rules, so those components rendered unstyled for any
 * consumer other than the one app that still defined the class.
 *
 * The whole list has been paid down the same day: ECHOLOG's three were folded
 * into `m-row` plus two new `moon.css` rules, and the Empire, Orbit and Cockpit
 * rule blocks were moved out of their app stylesheets into `moon.css` (their
 * names are still the app-namespace spellings — renaming them to `.m-*` is a
 * naming follow-up, the ownership is already corrected).
 *
 * The ceiling is therefore 0: no MoonUI component may depend on an application
 * stylesheet, and it may never be raised again without the same evidence.
 */
const MOONUI_CSS_DEBT_CEILING = 0

/**
 * A file must render at least this many moon.css-defined classes before its
 * class set counts as a fingerprint, so a page that merely uses a few
 * primitives is not mistaken for a fork of a view.
 */
const FINGERPRINT_MIN_CLASSES = 12

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const options = { root: SCRIPT_ROOT, json: null, updateLedger: false }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--root') {
      const value = argv[i + 1]
      if (!value) throw new Error('--root requires a directory')
      options.root = resolve(value)
      i += 1
    } else if (arg === '--json') {
      const next = argv[i + 1]
      options.json = next && !next.startsWith('--') ? resolve(next) : 'stdout'
      if (options.json !== 'stdout') i += 1
    } else if (arg.startsWith('--json=')) {
      const value = arg.slice('--json='.length)
      options.json = value ? resolve(value) : 'stdout'
    } else if (arg === '--update-ledger') {
      options.updateLedger = true
    } else if (arg === '--help' || arg === '-h') {
      console.log('usage: check-ui-consistency.mjs [--root <dir>] [--json[=path]] [--update-ledger]')
      process.exit(0)
    } else {
      throw new Error(`unknown argument: ${arg}`)
    }
  }
  return options
}

// ---------------------------------------------------------------------------
// Terminal helpers (ASCII only: the Windows console mangles box drawing)
// ---------------------------------------------------------------------------

const useColor = process.stdout.isTTY && !process.env.NO_COLOR
const paint = (code) => (text) => (useColor ? `\x1b[${code}m${text}\x1b[0m` : String(text))
const bold = paint('1')
const gray = paint('90')
const green = paint('32')
const yellow = paint('33')
const red = paint('31')
const cyan = paint('36')

// ---------------------------------------------------------------------------
// Filesystem helpers
// ---------------------------------------------------------------------------

function walk(dir, fileList = []) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return fileList
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue
    const full = join(dir, entry)
    let stat
    try {
      stat = statSync(full)
    } catch {
      continue
    }
    if (stat.isDirectory()) walk(full, fileList)
    else fileList.push(full)
  }
  return fileList
}

function toPosix(path) {
  return path.split('\\').join('/')
}

function relPath(root, full) {
  return toPosix(relative(root, full))
}

function readText(full) {
  try {
    return readFileSync(full, 'utf8')
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

/** App directories: registry entries first, then anything else on disk with a UI tree. */
function discoverApps(root) {
  const discovered = new Map()
  for (const app of APPS) {
    const dir = join(root, 'apps', app.tag)
    if (existsSync(dir)) discovered.set(app.tag, dir)
  }
  let entries = []
  try {
    entries = readdirSync(join(root, 'apps'))
  } catch {
    entries = []
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue
    const dir = join(root, 'apps', entry)
    try {
      if (!statSync(dir).isDirectory()) continue
    } catch {
      continue
    }
    const hasUi =
      existsSync(join(dir, 'src')) ||
      existsSync(join(dir, 'client')) ||
      existsSync(join(dir, 'app'))
    if (hasUi && !discovered.has(entry)) discovered.set(entry, dir)
  }
  return [...discovered.entries()]
}

/** Every UI source file an app owns, split into component files and route shells. */
function collectAppSurfaces(root) {
  const apps = discoverApps(root)
  const components = []
  const routes = []
  const stylesheets = []

  for (const [tag, appDir] of apps) {
    for (const child of ['src', 'client']) {
      const dir = join(appDir, child)
      if (!existsSync(dir)) continue
      for (const file of walk(dir)) {
        const relativePath = relPath(root, file)
        if (file.endsWith('.tsx')) {
          const isRoot =
            ROUTE_BASENAMES.has(basename(file)) ||
            COMPOSITION_ROOT_SEGMENTS.some((segment) => `/${relativePath}`.includes(segment))
          const target = isRoot ? routes : components
          target.push({ app: tag, path: relativePath, full: file })
        } else if (file.endsWith('.css')) {
          stylesheets.push({ app: tag, path: relativePath, full: file })
        }
      }
    }
  }

  return { apps, components, routes, stylesheets }
}

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

/** TypeScript type-position words that look like a JSX tag but are not one. */
const TS_TYPE_KEYWORDS = new Set(['typeof', 'keyof', 'readonly', 'infer', 'extends', 'satisfies'])

/** Intrinsic tags an app component actually renders. */
const HTML_TAGS = new Set([
  'a', 'abbr', 'article', 'aside', 'b', 'blockquote', 'br', 'button', 'caption', 'code', 'dd',
  'details', 'dfn', 'div', 'dl', 'dt', 'em', 'fieldset', 'figcaption', 'figure', 'footer', 'form',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'i', 'img', 'input', 'kbd', 'label', 'legend',
  'li', 'main', 'mark', 'nav', 'ol', 'optgroup', 'option', 'p', 'pre', 'q', 'section', 'select',
  'small', 'span', 'strong', 'summary', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead',
  'time', 'tr', 'u', 'ul',
])

/**
 * JSX detection that survives TypeScript generics. `Promise<ReactNode>` and
 * `ReturnType<typeof f>` are type positions, so a tag counts only when it is an
 * intrinsic element or a capitalised component with a closing or self-closing
 * counterpart somewhere in the file.
 */
function rendersJsx(source) {
  for (const match of source.matchAll(/<([A-Za-z][\w.-]*)/g)) {
    const tag = match[1]
    if (TS_TYPE_KEYWORDS.has(tag)) continue
    if (HTML_TAGS.has(tag)) return true
    if (!/^[A-Z]/.test(tag)) continue
    if (source.includes(`</${tag}>`)) return true
    if (new RegExp(`<${tag}\\b[^>]*/>`).test(source)) return true
  }
  return false
}

/** Returns the imported specifiers per module source, ignoring type-only imports. */
function collectImports(source) {
  const imports = new Map()
  const pattern = /import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g
  for (const match of source.matchAll(pattern)) {
    const clause = match[1]
    const sourcePath = match[2]
    if (clause.startsWith('type ')) continue
    const names = imports.get(sourcePath) ?? []
    const braces = clause.match(/\{([\s\S]*)\}/)
    if (braces) {
      for (const part of braces[1].split(',')) {
        const cleaned = part.trim()
        if (!cleaned || cleaned.startsWith('type ')) continue
        names.push(cleaned.split(/\s+as\s+/)[0].trim())
      }
    }
    const defaultMatch = clause.match(/^([A-Za-z_$][\w$]*)\s*(?:,|$)/)
    if (defaultMatch) names.push(defaultMatch[1])
    imports.set(sourcePath, names)
  }
  return imports
}

/**
 * A React Three Fiber component returns scene-graph objects, not DOM. R1 covers
 * components that render DOM, so a WebGL mesh is application-owned artwork.
 */
function rendersSceneGraph(source) {
  return /from '[^']*@react-three\/fiber'|from '[^']*\bthree\b'/.test(source)
}

/** Value exports from the MoonUI barrels, used for collision detection. */
function readMoonUiExports(root) {
  const names = new Set()
  for (const barrel of MOONUI_BARRELS) {
    const full = join(root, barrel)
    if (!existsSync(full)) continue
    const source = readText(full)
    for (const match of source.matchAll(/export\s*\{([\s\S]*?)\}/g)) {
      for (const part of match[1].split(',')) {
        const cleaned = part.trim()
        if (!cleaned || cleaned.startsWith('type ')) continue
        names.add(cleaned.split(/\s+as\s+/).pop().trim())
      }
    }
    for (const match of source.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z][A-Za-z0-9_]*)/g)) {
      names.add(match[1])
    }
    for (const match of source.matchAll(/export\s+const\s+([A-Za-z][A-Za-z0-9_]*)/g)) {
      names.add(match[1])
    }
  }
  return names
}

/** Component declarations found in one source file, with line numbers. */
function findComponentDeclarations(source) {
  const found = []
  const lines = source.split('\n')
  const patterns = [
    /export\s+function\s+([A-Z][A-Za-z0-9_]*)/,
    /export\s+const\s+([A-Z][A-Za-z0-9_]*)\s*[:=]/,
    /(?:^|\s)function\s+([A-Z][A-Za-z0-9_]*)\s*[(<]/,
  ]
  lines.forEach((line, index) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return
    for (const pattern of patterns) {
      const match = line.match(pattern)
      if (match && !found.some((entry) => entry.name === match[1])) {
        found.push({ name: match[1], line: index + 1 })
      }
    }
  })
  return found
}

// ---------------------------------------------------------------------------
// Ledger
// ---------------------------------------------------------------------------

function readLedger(root) {
  const full = join(root, LEDGER_RELATIVE_PATH)
  if (!existsSync(full)) return null
  try {
    const parsed = JSON.parse(readText(full))
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.entries)) return null
    return parsed
  } catch {
    return null
  }
}

function ledgerIndex(ledger) {
  const files = new Set()
  const selectors = new Map()
  for (const entry of ledger?.entries ?? []) {
    if (!entry || typeof entry.path !== 'string') continue
    files.add(entry.path)
    if (Array.isArray(entry.selectors) && entry.selectors.length > 0) {
      selectors.set(entry.path, new Set(entry.selectors))
    }
  }
  return { files, selectors }
}

/**
 * Component-class suffixes are matched after BEM separators are folded away:
 * `.demo-btn`, `.demo__btn` and `.demo--btn` are the same primitive under a
 * different spelling, and a renamed or re-separated class must not slip past
 * C3 (ADR-0017: the denylist is a pattern, not a list of last year's names).
 */
function normaliseSelectorName(name) {
  return name.split('__').join('-').split('--').join('-')
}

/** Class names a stylesheet defines, at any selector position. */
function classNamesInCss(source) {
  const names = new Set()
  for (const match of source.matchAll(/\.([a-zA-Z][\w-]*)/g)) names.add(match[1])
  return names
}

/**
 * Every token a MoonUI source file can put on an element: the quoted strings in
 * `className`, `cn()` and around them. A token counts only when some stylesheet
 * in the repository defines it, so ARIA words, variants and prop values are not
 * mistaken for classes.
 */
function classNamesInSource(source) {
  const literals = []
  for (const match of source.matchAll(/["'`]([^"'`\n]{1,140})["'`]/g)) literals.push(match[1])
  for (const match of source.matchAll(/className=\{`([^`]*)`\}/g)) literals.push(match[1])
  const tokens = new Set()
  for (const literal of literals) {
    for (const token of literal.split(/\s+/)) {
      if (/^[a-zA-Z][\w-]*$/.test(token) && token.includes('-')) tokens.add(token)
    }
  }
  return tokens
}

/**
 * C7 — the design system may not depend on an application stylesheet.
 *
 * Promoting markup without promoting its CSS leaves a MoonUI component that
 * renders unstyled for every consumer except the one app that still defines the
 * class. Each entry is one such class: emitted by `packages/moonui/src`, defined
 * only under `apps/`.
 */
function collectDesignSystemCssDebt({ root, surfaces }) {
  const moonPath = join(root, MOONUI_STYLESHEET)
  const moonClasses = existsSync(moonPath) ? classNamesInCss(readText(moonPath)) : new Set()

  const appOwners = new Map()
  for (const sheet of surfaces.stylesheets) {
    for (const name of classNamesInCss(readText(sheet.full))) {
      if (!appOwners.has(name)) appOwners.set(name, [])
      appOwners.get(name).push(sheet.path)
    }
  }

  const moonDir = join(root, MOONUI_SOURCE_DIR)
  if (!existsSync(moonDir)) return []

  const debt = new Map()
  for (const file of walk(moonDir)) {
    if (!/\.(ts|tsx)$/.test(file)) continue
    for (const name of classNamesInSource(readText(file))) {
      if (moonClasses.has(name)) continue
      const owners = appOwners.get(name)
      if (!owners) continue
      if (!debt.has(name)) debt.set(name, { cls: name, emittedIn: [], definedIn: [...new Set(owners)] })
      const relative = relPath(root, file)
      if (!debt.get(name).emittedIn.includes(relative)) debt.get(name).emittedIn.push(relative)
    }
  }

  return [...debt.values()].sort((a, b) => a.cls.localeCompare(b.cls))
}

/**
 * C8 — a renamed twin is still a twin.
 *
 * C5 compares declared names, so `GgsPage` beside MoonUI's `StoryGgsPage` slips
 * through while both emit the same twenty classes. This compares the class set a
 * file renders instead of what it is called: an application file that renders a
 * MoonUI view's fingerprint (or a superset of it) is that view forked.
 */
function collectMarkupFingerprints({ root, surfaces }) {
  const moonDir = join(root, MOONUI_SOURCE_DIR)
  if (!existsSync(moonDir)) return { moonViews: [], duplicates: [] }

  const moonViews = []
  const ownedClasses = moonCssClasses(root)
  for (const file of walk(moonDir)) {
    if (!file.endsWith('.tsx')) continue
    const classes = classNamesInSource(readText(file))
    const owned = [...classes].filter((name) => ownedClasses.has(name))
    if (owned.length < FINGERPRINT_MIN_CLASSES) continue
    moonViews.push({ path: relPath(root, file), classes: new Set(owned) })
  }

  const duplicates = []
  for (const file of [...surfaces.components, ...surfaces.routes]) {
    const classes = classNamesInSource(readText(file.full))
    if (classes.size < FINGERPRINT_MIN_CLASSES) continue
    for (const view of moonViews) {
      if (view.path === file.path) continue
      const shared = [...view.classes].filter((name) => classes.has(name))
      if (shared.length < FINGERPRINT_MIN_CLASSES) continue
      if (shared.length !== view.classes.size) continue
      duplicates.push({
        app: file.app,
        file: file.path,
        moonView: view.path,
        classes: shared.sort(),
      })
      break
    }
  }

  return { moonViews, duplicates }
}

const MOON_CSS_CLASSES = new Map()

/** The class names moon.css defines, memoised per root. */
function moonCssClasses(root) {
  if (!MOON_CSS_CLASSES.has(root)) {
    const path = join(root, MOONUI_STYLESHEET)
    MOON_CSS_CLASSES.set(root, existsSync(path) ? classNamesInCss(readText(path)) : new Set())
  }
  return MOON_CSS_CLASSES.get(root)
}

/**
 * C9 — a class name assembled from data is invisible to C7.
 *
 * `className={`emp-space-${accent}`}` emits `emp-space-warm`, `emp-space-cool`
 * and `emp-space-pink`, none of which appear as a literal anywhere, so C7 cannot
 * tell whether an application stylesheet is the only thing styling them. A
 * variant is a `data-*` attribute plus a rule in `moon.css` (ADR-0017's
 * convention); substituting a whole class name from a caller-supplied `className`
 * or a local constant stays legal, so only a fragment ending in `-` is rejected.
 */
function collectDerivedClassNames(root) {
  const moonDir = join(root, MOONUI_SOURCE_DIR)
  if (!existsSync(moonDir)) return []

  // Only a class slot counts: `className="…"`, `className={…}` and a `cn()`
  // argument. A `key={\`${i}-${label}\`}` builds no class and must not be caught.
  const patterns = [
    /className\s*=\s*\{[^{}]*`([^`]*-[a-zA-Z0-9_-]*)\$\{/g,
    /className\s*=\s*`([^`]*-[a-zA-Z0-9_-]*)\$\{/g,
    /cn\(\s*`([^`]*-[a-zA-Z0-9_-]*)\$\{/g,
    /,\s*`([^`]*-[a-zA-Z0-9_-]*)\$\{[^`]*`\s*\)\s*\}/g,
  ]

  const found = []
  for (const file of walk(moonDir)) {
    if (!file.endsWith('.tsx')) continue
    const source = readText(file)
    for (const pattern of patterns) {
      for (const match of source.matchAll(pattern)) {
        const offset = match.index ?? 0
        const line = source.slice(0, offset).split('\n').length
        const fragment = match[1].trim()
        if (!fragment) continue
        if (!/-[a-zA-Z0-9_-]*$/.test(fragment)) continue
        found.push({ file: relPath(root, file), line, fragment })
      }
    }
  }

  const seen = new Set()
  return found.filter((site) => {
    const key = `${site.file}:${site.line}:${site.fragment}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Properties that decide how a component looks. Position is a page band's
 * business — `margin`, `flex`, `order`, `max-width`, `grid-template-columns`
 * and friends stay legal next to a shared class — but colour, type, border,
 * padding, shadow and outline are the primitive's anatomy (ADR-0017 R4).
 */
const ANATOMY_PROPERTIES = /^((background|border|outline|padding|color|font|box-shadow|text-shadow|text-transform|letter-spacing|line-height|opacity|width|height)(-[a-z-]+)?)$/

/** Declaration keywords of a rule body that decide how the element looks. */
function anatomyPropertiesOf(body) {
  return [...new Set(
    [...body.matchAll(/([a-z-]+)\s*:/g)]
      .map((match) => match[1])
      .filter((property) => ANATOMY_PROPERTIES.test(property)),
  )]
}

/** Rule blocks of a stylesheet, with the enclosing at-prelude and offsets. */
function parseCssRules(text, atPrelude = null, base = 0, out = []) {
  let pos = 0
  while (pos < text.length) {
    const brace = text.indexOf('{', pos)
    if (brace < 0) break
    const prelude = text.slice(pos, brace).trim()
    let depth = 1
    let end = brace + 1
    while (end < text.length && depth > 0) {
      if (text[end] === '{') depth += 1
      else if (text[end] === '}') depth -= 1
      end += 1
    }
    const body = text.slice(brace + 1, end - 1)
    if (/^@(media|supports)/.test(prelude)) {
      parseCssRules(body, prelude.split('{')[0].trim(), base + brace + 1, out)
    } else if (prelude) {
      out.push({ selector: prelude.replace(/\s+/g, ' '), body, at: atPrelude, start: base + pos })
    }
    pos = end
  }
  return out
}

/**
 * C10 — an application stylesheet may style its own page bands; it may not
 * restyle a component the design system already drew.
 *
 * `.dk-map-pin .m-badge { max-width }` places a badge. `.m-sidebar { border-right:
 * none }` and `.emp-state-dot.m-live-dot { background }` redraw one, and because
 * the app stylesheet loads after moon.css it wins — which is how a shared
 * primitive silently stops being shared. Only rules that set an anatomy
 * property on a class moon.css defines are reported.
 */
function collectPrimitiveOverrides({ root, surfaces }) {
  const shared = moonCssClasses(root)
  const found = []
  for (const sheet of surfaces.stylesheets) {
    const source = readText(sheet.full)
    for (const rule of parseCssRules(source)) {
      const targets = [...rule.selector.matchAll(/\.([a-zA-Z][\w-]*)/g)]
        .map((match) => match[1])
        .filter((name) => name.startsWith('m-') && shared.has(name))
      if (targets.length === 0) continue
      const anatomy = anatomyPropertiesOf(rule.body)
      if (anatomy.length === 0) continue
      const line = source.slice(0, rule.start).split('\n').length
      found.push({
        sheet: sheet.path,
        line,
        selector: rule.selector,
        at: rule.at,
        classes: [...new Set(targets)],
        properties: anatomy,
      })
    }
  }
  return found
}

const MOON_CSS_ANATOMY = new Map()

/** Which anatomy properties each `m-*` class in moon.css declares for itself. */
function primitiveAnatomyByClass(root) {
  if (!MOON_CSS_ANATOMY.has(root)) {
    const map = new Map()
    const path = join(root, MOONUI_STYLESHEET)
    if (existsSync(path)) {
      for (const rule of parseCssRules(readText(path))) {
        const properties = anatomyPropertiesOf(rule.body)
        if (properties.length === 0) continue
        for (const match of rule.selector.matchAll(/\.([a-zA-Z][\w-]*)/g)) {
          if (!match[1].startsWith('m-')) continue
          if (!map.has(match[1])) map.set(match[1], new Set())
          for (const property of properties) map.get(match[1]).add(property)
        }
      }
    }
    MOON_CSS_ANATOMY.set(root, map)
  }
  return MOON_CSS_ANATOMY.get(root)
}

/**
 * Band classes MoonUI puts on the same element as one of its own primitives.
 *
 * `<span className="emp-state-dot m-live-dot" />` is one element wearing two
 * classes, so a rule on the band side reaches the primitive without ever naming
 * it — the half of R4 the selector-based half of C10 structurally cannot see.
 */
function bandCompanionClasses(root) {
  const pairs = new Map()
  const moonDir = join(root, MOONUI_SOURCE_DIR)
  if (!existsSync(moonDir)) return pairs
  const shared = moonCssClasses(root)
  for (const file of walk(moonDir)) {
    if (!file.endsWith('.tsx')) continue
    const source = readText(file)
    for (const match of source.matchAll(/className\s*=\s*(?:"([^"]*)"|`([^`]*)`|\{\s*cn\(([^)]*)\)\s*\})/g)) {
      const tokens = [match[1], match[2], match[3]]
        .filter(Boolean)
        .join(' ')
        .split(/[\s"'`,]+/)
        .filter((token) => /^[a-zA-Z][\w-]*$/.test(token))
      const primitives = tokens.filter((token) => token.startsWith('m-') && shared.has(token))
      if (primitives.length === 0) continue
      for (const token of tokens) {
        if (token.startsWith('m-') || token === 'cn') continue
        if (!pairs.has(token)) pairs.set(token, new Set())
        for (const primitive of primitives) pairs.get(token).add(primitive)
      }
    }
  }
  return pairs
}

/**
 * C10, second half — a page band may sit next to a primitive, and may hold it in
 * place; it may not repaint it under a different name.
 *
 * `.emp-state-dot { width: 7px; background: var(--muted) }` never mentions
 * `.m-live-dot`, yet it is applied on the same span, so the shared dot silently
 * becomes an app-private one. A `data-*` compound (`.emp-space[data-accent]`) is
 * the sanctioned variant mechanism and stays out of this check.
 */
function collectBandRedrawsOfPrimitives({ root, surfaces }) {
  const anatomy = primitiveAnatomyByClass(root)
  const companions = bandCompanionClasses(root)
  if (companions.size === 0) return []
  const sheets = [...surfaces.stylesheets]
  const moonPath = join(root, MOONUI_STYLESHEET)
  if (existsSync(moonPath)) {
    sheets.unshift({ app: 'moonui', path: relPath(root, moonPath), full: moonPath })
  }
  const found = []
  for (const sheet of sheets) {
    const source = readText(sheet.full)
    for (const rule of parseCssRules(source)) {
      for (const part of rule.selector.split(',')) {
        const selector = part.trim()
        // A descendant selector styles the band's own subtree, not the element
        // the primitive class is on; only a self-selector can repaint it.
        if (/\s/.test(selector)) continue
        // A data-* compound is a variant declaration, not a covert override.
        if (/\[data-[a-z-]+/.test(selector)) continue
        const classes = [...selector.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((match) => match[1])
        const band = classes.find((name) => companions.has(name))
        if (!band) continue
        const properties = anatomyPropertiesOf(rule.body)
        if (properties.length === 0) continue
        for (const primitive of companions.get(band)) {
          const drawn = anatomy.get(primitive)
          if (!drawn) continue
          const repaint = properties.filter((property) => drawn.has(property))
          if (repaint.length === 0) continue
          found.push({
            sheet: sheet.path,
            line: source.slice(0, rule.start).split('\n').length,
            selector,
            at: rule.at,
            classes: [`${band} (on the same element as .${primitive})`],
            properties: repaint,
          })
        }
      }
    }
  }
  return found
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

function runChecks({ root, updateLedger }) {
  const surfaces = collectAppSurfaces(root)
  const ledger = readLedger(root)
  const index = ledgerIndex(ledger)
  const moonUiExports = readMoonUiExports(root)
  const sharedNames = new Set([...SHARED_NAME_ALIASES, ...moonUiExports])
  const violations = []
  const matrix = []
  const ledgeredDebt = []
  let scanned = 0

  const report = (check, file, line, message, remedy) => {
    violations.push({ check, file, line: line ?? null, message, remedy: remedy ?? null })
  }

  // C1 — surface adoption ---------------------------------------------------
  for (const file of surfaces.components) {
    scanned += 1
    const source = readText(file.full)
    if (!rendersJsx(source) || rendersSceneGraph(source)) continue
    const imports = collectImports(source)
    const consumesMoonUi = [...imports.entries()].some(([sourcePath, names]) => {
      if (!sourcePath.startsWith('@moonwitness/moonui')) return false
      return names.some((name) => !name.startsWith('Icon') && name !== 'cn' && name !== 'cellText')
    })
    if (consumesMoonUi) continue
    if (index.files.has(file.path)) {
      ledgeredDebt.push({ check: 'C1', file: file.path, line: 1, name: 'no-moonui-import' })
      continue
    }
    report(
      'C1',
      file.path,
      1,
      'component file renders JSX but imports no MoonUI component',
      "import the primitive from '@moonwitness/moonui' instead of composing markup or importing icons only",
    )
  }

  // C2 — token purity -------------------------------------------------------
  const styleSource = [
    ...surfaces.components.map((entry) => ({ ...entry, kind: 'tsx' })),
    ...surfaces.stylesheets.map((entry) => ({ ...entry, kind: 'css' })),
    ...surfaces.routes.map((entry) => ({ ...entry, kind: 'tsx' })),
  ]
  for (const file of styleSource) {
    scanned += 1
    const lines = readText(file.full).split('\n')
    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim()
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return
      for (const rule of DRIFTED_COLORS) {
        if (!rule.pattern.test(line)) continue
        rule.pattern.lastIndex = 0
        const match = line.match(rule.pattern)?.[0] ?? 'hex'
        report('C2', file.path, lineIndex + 1, `drifted hex colour ${match}`, `replace with ${rule.fix}`)
      }
    })
  }

  // C3 — component-level classes -------------------------------------------
  const stylesheetDebt = new Map()
  for (const sheet of surfaces.stylesheets) {
    scanned += 1
    const allowed = index.selectors.get(sheet.path) ?? new Set()
    const source = readText(sheet.full)
    const lines = source.split('\n')
    lines.forEach((line, lineIndex) => {
      const braceIndex = line.indexOf('{')
      const selectorPart = braceIndex >= 0 ? line.slice(0, braceIndex) : line.trim().startsWith('.') ? line.trim() : ''
      if (!selectorPart.includes('.')) return
      for (const match of selectorPart.matchAll(/\.([a-zA-Z][\w-]*)/g)) {
        const name = match[1]
        if (name.startsWith('m-')) continue
        const normalised = normaliseSelectorName(name)
        const suffix = COMPONENT_CLASS_SUFFIXES.find((candidate) => normalised.endsWith(candidate))
        if (!suffix) continue
        const selector = `.${name}`
        // Every component class found in an app stylesheet is ledger material,
        // whether it is already exempted or newly written: --update-ledger must
        // be able to capture the whole set in one pass.
        if (!stylesheetDebt.has(sheet.path)) stylesheetDebt.set(sheet.path, new Set())
        stylesheetDebt.get(sheet.path).add(selector)
        if (allowed.has(selector)) continue
        report(
          'C3',
          sheet.path,
          lineIndex + 1,
          `component class ${selector} restyles a MoonUI primitive (${suffix})`,
          'delete the rule and compose the MoonUI primitive; page bands may keep layout-only classes',
        )
      }
    })
  }

  // C4 — typography ---------------------------------------------------------
  for (const sheet of surfaces.stylesheets) {
    const lines = readText(sheet.full).split('\n')
    lines.forEach((line, lineIndex) => {
      if (!/font-family:\s*(?!var\(--font-)(Arial|sans-serif|monospace|Consolas|Helvetica)/i.test(line)) return
      report(
        'C4',
        sheet.path,
        lineIndex + 1,
        'untokenized font stack',
        'use var(--font-display), var(--font-mono) or var(--font-body)',
      )
    })
  }

  // C5 — duplicate component matrix ----------------------------------------
  const declarations = new Map()
  for (const file of surfaces.components) {
    const source = readText(file.full)
    for (const decl of findComponentDeclarations(source)) {
      if (!declarations.has(decl.name)) declarations.set(decl.name, [])
      declarations.get(decl.name).push({ app: file.app, path: file.path, line: decl.line })
    }
  }
  for (const [name, sites] of [...declarations.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (ENTRY_COMPONENT_NAMES.has(name)) continue
    const apps = [...new Set(sites.map((site) => site.app))]
    const collidesWithMoonUi = sharedNames.has(name)
    const duplicatedAcrossApps = apps.length > 1
    if (!collidesWithMoonUi && !duplicatedAcrossApps) continue
    matrix.push({ name, apps, sites, reason: collidesWithMoonUi ? 'moonui-export' : 'cross-app-duplicate' })
    for (const site of sites) {
      if (index.files.has(site.path)) {
        ledgeredDebt.push({ check: 'C5', file: site.path, line: site.line, name })
        continue
      }
      report(
        'C5',
        site.path,
        site.line,
        collidesWithMoonUi
          ? `declares ${name}, which MoonUI already owns`
          : `declares ${name}, which ${apps.filter((app) => app !== site.app).join(', ')} also declares`,
        'delete the local component and consume the MoonUI export, or promote it into packages/moonui/src',
      )
    }
  }

  // C6 — exception ledger ratchet ------------------------------------------
  if (!ledger) {
    report('C6', LEDGER_RELATIVE_PATH, 1, 'exception ledger is missing', 'run node scripts/check-ui-consistency.mjs --update-ledger')
  } else {
    if (ledger.entries.length > RATCHET) {
      report(
        'C6',
        LEDGER_RELATIVE_PATH,
        1,
        `ledger holds ${ledger.entries.length} entries but the ceiling is ${RATCHET}`,
        'remove entries by migrating the component into MoonUI; raising RATCHET is a source-level decision, not a ledger edit',
      )
    }
    for (const entry of ledger.entries) {
      if (!entry.path) {
        report('C6', LEDGER_RELATIVE_PATH, 1, 'ledger entry without a path', 'delete the entry')
        continue
      }
      const full = join(root, entry.path)
      if (!existsSync(full)) {
        report('C6', LEDGER_RELATIVE_PATH, 1, `ledger points at a missing file: ${entry.path}`, 'delete the stale entry')
        continue
      }
      const source = readText(full)
      if (Array.isArray(entry.selectors)) {
        for (const selector of entry.selectors) {
          if (!source.includes(selector)) {
            report(
              'C6',
              LEDGER_RELATIVE_PATH,
              1,
              `ledger exempts ${selector} in ${entry.path} but the rule is gone`,
              'delete the stale selector exemption',
            )
          }
        }
      }
      if (Array.isArray(entry.exports)) {
        for (const name of entry.exports) {
          if (!new RegExp(`(?:function|const)\\s+${name}\\b`).test(source)) {
            report(
              'C6',
              LEDGER_RELATIVE_PATH,
              1,
              `ledger claims ${name} in ${entry.path} but the declaration is gone`,
              'delete the stale entry',
            )
          }
        }
      }
    }
    for (const file of surfaces.components) {
      if (index.files.has(file.path)) continue
      const source = readText(file.full)
      if (!rendersJsx(source) || rendersSceneGraph(source)) continue
      report(
        'C6',
        file.path,
        1,
        'component file is not registered in the exception ledger',
        'move it into packages/moonui/src, or register the file with an owner and a removal task',
      )
    }
  }

  // C10 — primitives restyled by an application stylesheet, or repainted by the
  // band class stacked on top of them -----------------------------------------
  const overrides = [
    ...collectPrimitiveOverrides({ root, surfaces }),
    ...collectBandRedrawsOfPrimitives({ root, surfaces }),
  ]
  for (const site of overrides) {
    const allowed = index.selectors.get(site.sheet) ?? new Set()
    if (allowed.has(site.selector.split('{')[0].trim()) || allowed.has(site.classes.map((c) => `.${c}`).join(''))) {
      ledgeredDebt.push({ check: 'C10', file: site.sheet, line: site.line, name: site.selector })
      continue
    }
    report(
      'C10',
      site.sheet,
      site.line,
      `${site.classes.join(', ')} restyled by ${site.properties.join(', ')} — the anatomy of a MoonUI primitive`,
      'delete the rule; if the primitive needs a size or tone, give it a data-* variant in moon.css instead',
    )
  }

  // C8 — markup fingerprints ----------------------------------------------
  const fingerprints = collectMarkupFingerprints({ root, surfaces })
  for (const duplicate of fingerprints.duplicates) {
    if (index.files.has(duplicate.file)) {
      ledgeredDebt.push({ check: 'C8', file: duplicate.file, line: 1, name: duplicate.moonView })
      continue
    }
    report(
      'C8',
      duplicate.file,
      1,
      `renders the same ${duplicate.classes.length}-class anatomy as ${duplicate.moonView} under a different name`,
      'delete this copy and render the MoonUI view; keep only the props the route needs',
    )
  }

  // C9 — class names assembled from data -----------------------------------
  const derived = collectDerivedClassNames(root)
  for (const site of derived) {
    report(
      'C9',
      site.file,
      site.line,
      `builds a class name by concatenating \`${site.fragment}\${…}\`, which C7 cannot resolve`,
      'render a data-* attribute and put the variant rule in moon.css',
    )
  }

  const generatedLedger = buildLedger({ root, surfaces, sharedNames, stylesheetDebt })

  // C7 — design-system CSS ownership ---------------------------------------
  const cssDebt = collectDesignSystemCssDebt({ root, surfaces })
  if (cssDebt.length > MOONUI_CSS_DEBT_CEILING) {
    report(
      'C7',
      MOONUI_STYLESHEET,
      1,
      `${cssDebt.length} classes are emitted by MoonUI but only an app stylesheet defines them (ceiling ${MOONUI_CSS_DEBT_CEILING})`,
      `move each rule into ${MOONUI_STYLESHEET}; the design system may not depend on an apps/** stylesheet`,
    )
  }

  return {
    ok: violations.length === 0,
    root,
    ratchet: RATCHET,
    scannedFiles: scanned,
    surfaces: {
      apps: surfaces.apps.map(([tag]) => tag),
      components: surfaces.components.length,
      routes: surfaces.routes.length,
      stylesheets: surfaces.stylesheets.length,
    },
    violations,
    ledger: {
      path: LEDGER_RELATIVE_PATH,
      entries: ledger?.entries.length ?? 0,
      debt: ledgeredDebt,
    },
    matrix,
    cssDebt: { path: MOONUI_STYLESHEET, ceiling: MOONUI_CSS_DEBT_CEILING, entries: cssDebt },
    overrides,
    fingerprints: {
      views: fingerprints.moonViews.map((view) => ({ path: view.path, classes: [...view.classes].sort() })),
      duplicates: fingerprints.duplicates,
    },
    generatedLedger,
    updateLedger,
  }
}

/**
 * Rebuild the ledger from the tree: every unledgered component file becomes an
 * entry, every component class rule becomes a selector exemption. Existing
 * entries keep their owner/reason/removalTask so a regeneration does not erase
 * the reason a file was allowed to stay.
 */
function buildLedger({ root, surfaces, sharedNames, stylesheetDebt }) {
  const existing = readLedger(root)
  const byPath = new Map((existing?.entries ?? []).map((entry) => [entry.path, entry]))
  const entries = []

  const needsEntry = (file) => {
    const source = readText(file.full)
    if (rendersSceneGraph(source)) return null
    const names = findComponentDeclarations(source).map((decl) => decl.name)
    if (names.length === 0) return null
    const isShared = names.some((name) => sharedNames.has(name))
    const alreadyLedgered = byPath.has(file.path)
    if (!isShared && !alreadyLedgered && !rendersJsx(source)) return null
    return names
  }

  for (const file of surfaces.components) {
    const names = needsEntry(file)
    if (!names) continue
    const previous = byPath.get(file.path)
    const debtSelectors = stylesheetDebt.get(file.path)
    entries.push({
      path: file.path,
      owner: previous?.owner ?? file.app,
      mode: previous?.mode ?? 'view',
      exports: names,
      reason: previous?.reason ?? 'app-local component pending promotion into @moonwitness/moonui',
      removalTask: previous?.removalTask ?? 'M19-36',
      ...(debtSelectors ? { selectors: [...debtSelectors].sort() } : {}),
    })
  }

  for (const sheet of surfaces.stylesheets) {
    const selectors = stylesheetDebt.get(sheet.path)
    const previous = byPath.get(sheet.path)
    // No component classes left in this stylesheet: the debt is paid, so the
    // entry disappears instead of carrying a stale exemption forward.
    if (!selectors || selectors.size === 0) continue
    const list = [...selectors].sort()
    entries.push({
      path: sheet.path,
      owner: previous?.owner ?? sheet.app,
      mode: 'stylesheet',
      selectors: list,
      reason: previous?.reason ?? 'component-level class pending removal once the surface consumes the MoonUI primitive',
      removalTask: previous?.removalTask ?? 'M19-36',
    })
  }

  entries.sort((a, b) => a.path.localeCompare(b.path))
  return {
    version: 1,
    generatedAt: new Date().toISOString().slice(0, 10),
    note: 'App-local UI debt under ADR-0017. This ledger may only shrink: every entry names a removal task, and RATCHET in scripts/check-ui-consistency.mjs is the ceiling.',
    entries,
  }
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

function printReport(result) {
  console.log(bold(cyan('=======================================================================')))
  console.log(bold(cyan('  MOONWITNESS SHARED-FIRST UI GATE (ADR-0017)')))
  console.log(bold(cyan('=======================================================================')))
  console.log(gray(`root: ${result.root}`))
  console.log(
    gray(
      `apps: ${result.surfaces.apps.join(', ')} | component files: ${result.surfaces.components} | ` +
        `route shells: ${result.surfaces.routes} | stylesheets: ${result.surfaces.stylesheets}`,
    ),
  )
  console.log(gray(`ledger: ${result.ledger.entries} entries (ceiling ${result.ratchet})`))
  console.log(gray(`fingerprints: ${result.fingerprints.views.length} MoonUI view anatomies tracked, ${result.fingerprints.duplicates.length} duplicated\n`))

  const checks = [
    ['C1', 'Surface adoption'],
    ['C2', 'Token purity'],
    ['C3', 'Component classes'],
    ['C4', 'Typography'],
    ['C5', 'Duplicate matrix'],
    ['C6', 'Exception ledger'],
    ['C7', 'Design-system CSS'],
    ['C8', 'Markup fingerprint'],
    ['C9', 'Derived class names'],
    ['C10', 'Primitive overrides'],
  ]
  for (const [code, label] of checks) {
    const found = result.violations.filter((violation) => violation.check === code)
    if (found.length === 0) {
      console.log(`${green('[PASS]')} ${code} ${label}`)
      continue
    }
    console.log(`${red('[FAIL]')} ${code} ${label} — ${found.length} violation(s)`)
    for (const violation of found.slice(0, 40)) {
      console.log(`   ${red('x')} ${bold(violation.file)}${violation.line ? `:${violation.line}` : ''}`)
      console.log(`     ${violation.message}`)
      if (violation.remedy) console.log(`     ${yellow('fix:')} ${violation.remedy}`)
    }
    if (found.length > 40) console.log(gray(`   ... ${found.length - 40} more`))
  }

  if (result.matrix.length > 0) {
    console.log(`\n${bold('Promotion matrix (one name, one owner):')}`)
    for (const row of result.matrix) {
      const sites = row.sites.map((site) => `${site.app}:${site.path.split('/').slice(-1)[0]}`).join(', ')
      console.log(`   ${row.name} <- ${sites} ${gray(`(${row.reason})`)}`)
    }
  }

  if (result.ledger.debt.length > 0) {
    console.log(`\n${yellow('Ledgered debt (allowed, must shrink):')}`)
    for (const item of result.ledger.debt.slice(0, 40)) {
      console.log(`   ${item.name} @ ${item.file}:${item.line}`)
    }
    if (result.ledger.debt.length > 40) console.log(gray(`   ... ${result.ledger.debt.length - 40} more`))
  }

  if (result.cssDebt.entries.length > 0) {
    console.log(`\n${bold(`Design-system CSS debt (MoonUI emits, only an app styles it): ${result.cssDebt.entries.length}/${result.cssDebt.ceiling}`)}`)
    for (const entry of result.cssDebt.entries.slice(0, 12)) {
      console.log(`   ${entry.cls} <- ${gray(entry.definedIn.join(', '))} [${entry.emittedIn.join(', ')}]`)
    }
    if (result.cssDebt.entries.length > 12) console.log(gray(`   ... ${result.cssDebt.entries.length - 12} more`))
  }

  if (result.overrides.length > 0) {
    console.log(`\n${bold('Primitives restyled by an application stylesheet:')}`)
    for (const site of result.overrides.slice(0, 20)) {
      console.log(`   ${red('x')} ${bold(site.sheet)}:${site.line}${site.at ? ` (${site.at})` : ''}`)
      console.log(`     ${site.selector}`)
      console.log(`     ${yellow('anatomy:')} ${site.properties.join(', ')}`)
    }
    if (result.overrides.length > 20) console.log(gray(`   ... ${result.overrides.length - 20} more`))
  }

  console.log(`\n${bold(cyan('======================================================================='))}`)
  if (result.ok) {
    console.log(green(bold(`PASS — ${result.scannedFiles} files scanned, 0 violations.`)))
  } else {
    console.log(red(bold(`FAIL — ${result.violations.length} violation(s) across ${result.scannedFiles} scanned files.`)))
  }
  console.log(bold(cyan('=======================================================================')) + '\n')
}

function writeJson(result, target) {
  const payload = {
    ok: result.ok,
    ratchet: result.ratchet,
    scannedFiles: result.scannedFiles,
    surfaces: result.surfaces,
    violations: result.violations,
    ledger: { path: result.ledger.path, entries: result.ledger.entries, debt: result.ledger.debt },
    cssDebt: result.cssDebt,
    overrides: result.overrides,
    fingerprints: result.fingerprints,
    matrix: result.matrix,
  }
  const body = `${JSON.stringify(payload, null, 2)}\n`
  if (target === 'stdout') process.stdout.write(body)
  else writeFileSync(target, body, 'utf8')
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

function main() {
  const options = parseArgs(process.argv.slice(2))
  const result = runChecks({ root: options.root, updateLedger: options.updateLedger })

  if (options.updateLedger) {
    const target = join(options.root, LEDGER_RELATIVE_PATH)
    writeFileSync(target, `${JSON.stringify(result.generatedLedger, null, 2)}\n`, 'utf8')
    console.log(
      yellow(
        `ledger written: ${LEDGER_RELATIVE_PATH} (${result.generatedLedger.entries.length} entries) — set RATCHET to ${result.generatedLedger.entries.length} in scripts/check-ui-consistency.mjs`,
      ),
    )
  }

  printReport(result)
  if (options.json) writeJson(result, options.json)
  process.exit(result.ok ? 0 : 1)
}

main()
