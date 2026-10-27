#!/usr/bin/env node
/**
 * scripts/check-ui-consistency.mjs
 *
 * Centralized UI Consistency and Design System Enforcement Linter for Moonwitness.
 * Enforces:
 * 1. Mandatory consumption of `@moonwitness/moonui` primitives on all frontend surfaces.
 * 2. Zero rogue hardcoded hex colors / color token drift across monorepo apps.
 * 3. Zero local duplicate component class definitions in app stylesheets.
 * 4. Proper typography token usage across all surfaces.
 *
 * Exit code 0 if all rules pass, 1 if any violations are found.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..')

// ANSI Color Helpers
const cyan = (s) => `\x1b[36m${s}\x1b[0m`
const bold = (s) => `\x1b[1m${s}\x1b[0m`
const green = (s) => `\x1b[32m${s}\x1b[0m`
const yellow = (s) => `\x1b[33m${s}\x1b[0m`
const red = (s) => `\x1b[31m${s}\x1b[0m`
const magenta = (s) => `\x1b[35m${s}\x1b[0m`
const gray = (s) => `\x1b[90m${s}\x1b[0m`

/** Known rogue/drift hex colors and their standard design token replacements */
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

/** Forbidden local duplicate CSS classes in app stylesheets */
const FORBIDDEN_STYLESHEET_CLASSES = [
  { match: /\.dk-btn-/, desc: 'Local button classes (.dk-btn-*) forbidden; use <Button> or <LinkButton> from @moonwitness/moonui' },
  { match: /\.dk-pager\b/, desc: 'Local pager forbidden; use <Pagination> from @moonwitness/moonui' },
  { match: /\.dk-progress\b/, desc: 'Local progress forbidden; use <ProgressBar> from @moonwitness/moonui' },
  { match: /\.dk-live-dot\b/, desc: 'Local live dot forbidden; use <LiveDot> from @moonwitness/moonui' },
  { match: /\.dk-pill\b/, desc: 'Local pill forbidden; use <Pill> from @moonwitness/moonui' },
  { match: /\.dk-tape\b/, desc: 'Local tape forbidden; use <Tape> from @moonwitness/moonui' },
  { match: /\.hq-module-card\b/, desc: 'Local module card forbidden; use <ModuleCard> from @moonwitness/moonui' },
  { match: /\.hq-proj-card\b/, desc: 'Local project card forbidden; use <Card> from @moonwitness/moonui' },
  { match: /\.hq-proj-bar\b/, desc: 'Local project bar forbidden; use <ProgressBar> from @moonwitness/moonui' },
  { match: /\.hq-input-box\b/, desc: 'Local input box forbidden; use <TextInput> or <Field> from @moonwitness/moonui' },
  { match: /\.hq-shadow-submit\b/, desc: 'Local submit button forbidden; use <Button variant="primary"> from @moonwitness/moonui' },
  { match: /\.tab-btn\b/, desc: 'Local tab buttons (.tab-btn) forbidden; use <Tabs> from @moonwitness/moonui' },
  { match: /\.terminal-scroll\b/, desc: 'Local terminal scroll container forbidden; use <TerminalViewer> from @moonwitness/moonui' },
  { match: /\.log-entry\b/, desc: 'Local log entry (.log-entry) forbidden; use <TerminalViewer> from @moonwitness/moonui' },
]

/** Mandatory frontend UI surfaces that must import from @moonwitness/moonui */
const MANDATORY_MOONUI_SURFACES = [
  'apps/dock/src/ui/components/shell.tsx',
  'apps/dock/src/ui/components/sections.tsx',
  'apps/dock/src/ui/client/Player.tsx',
  'apps/dock/src/ui/client/LiveTicker.tsx',
  'apps/dock/src/app/page.tsx',
  'apps/dock/src/app/stations/page.tsx',
  'apps/dock/src/app/stations/[id]/page.tsx',
  'apps/dock/src/app/schedule/page.tsx',
  'apps/dock/src/app/embed/[id]/page.tsx',
  'apps/headquarters/src/layouts/auth.tsx',
  'apps/headquarters/src/layouts/vertical.tsx',
  'apps/headquarters/src/app/login/page.tsx',
  'apps/headquarters/src/app/(admin)/page.tsx',
  'apps/headquarters/src/app/(admin)/world-monitor/page.tsx',
  'apps/cockpit/client/App.tsx',
  'apps/echolog/client/App.tsx',
  'apps/orbit/src/app/page.tsx',
]

/** App stylesheets to check for local primitive cloning */
const APP_STYLESHEETS = [
  'apps/dock/src/app/globals.css',
  'apps/headquarters/src/app/globals.css',
  'apps/cockpit/client/cockpit-layout.css',
  'apps/echolog/client/echolog-layout.css',
  'apps/orbit/src/app/globals.css',
]

/** Recursively scan directory for files matching extension */
function scanFiles(dir, extensions, fileList = []) {
  const fullDir = resolve(ROOT, dir)
  try {
    const entries = readdirSync(fullDir)
    for (const entry of entries) {
      if (entry === 'node_modules' || entry === '.next' || entry === 'dist' || entry === '.git') {
        continue
      }
      const p = join(fullDir, entry)
      const st = statSync(p)
      if (st.isDirectory()) {
        scanFiles(p, extensions, fileList)
      } else if (extensions.some((ext) => entry.endsWith(ext))) {
        fileList.push(relative(ROOT, p).replace(/\\/g, '/'))
      }
    }
  } catch {
    // skip non-existent directories
  }
  return fileList
}

console.log(bold(cyan('═══════════════════════════════════════════════════════════════════════')))
console.log(bold(cyan('   🌙 MOONWITNESS MONOREPO UI CONSISTENCY & HARDCODE ENFORCER       ')))
console.log(bold(cyan('═══════════════════════════════════════════════════════════════════════')))
console.log(gray(`Scanning monorepo apps for design system adoption & token purity...\n`))

let totalViolations = 0
let scannedFilesCount = 0

// ---------------------------------------------------------------------
// CHECK 1: Mandatory @moonwitness/moonui Imports on UI Surfaces
// ---------------------------------------------------------------------
console.log(bold(magenta('📦 CHECK 1: UI Surfaces Consuming @moonwitness/moonui')))
for (const relPath of MANDATORY_MOONUI_SURFACES) {
  scannedFilesCount++
  const fullPath = resolve(ROOT, relPath)
  try {
    const content = readFileSync(fullPath, 'utf8')
    if (!content.includes(`from '@moonwitness/moonui'`) && !content.includes(`from "@moonwitness/moonui"`)) {
      console.log(`  ${red('✖ ERROR')}: ${bold(relPath)}`)
      console.log(`    ${yellow('💡 Must import and consume primitives from @moonwitness/moonui')}`)
      totalViolations++
    } else {
      console.log(`  ${green('✔ PASS')}: ${relPath}`)
    }
  } catch {
    console.log(`  ${red('✖ ERROR')}: Cannot read surface file: ${relPath}`)
    totalViolations++
  }
}

// ---------------------------------------------------------------------
// CHECK 2: Rogue Hardcoded Color Drift Across Apps
// ---------------------------------------------------------------------
console.log(`\n${bold(magenta('🎨 CHECK 2: Rogue Hex Color Drift & Design Token Violations'))}`)
const filesToInspect = [
  ...scanFiles('apps/dock/src', ['.tsx', '.css']),
  ...scanFiles('apps/headquarters/src', ['.tsx', '.css']),
  ...scanFiles('apps/cockpit/client', ['.tsx', '.css']),
  ...scanFiles('apps/echolog/client', ['.tsx', '.css']),
  ...scanFiles('apps/orbit/src', ['.tsx', '.css']),
  'apps/arsy/src/lib/launchpad.ts',
]

const inspectedSet = new Set(filesToInspect)
let colorDriftCount = 0

for (const relPath of inspectedSet) {
  scannedFilesCount++
  const fullPath = resolve(ROOT, relPath)
  let content
  try {
    content = readFileSync(fullPath, 'utf8')
  } catch {
    continue
  }

  const lines = content.split('\n')
  lines.forEach((line, index) => {
    // Ignore comments or documentation files
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return

    for (const rule of DRIFTED_COLORS) {
      if (rule.pattern.test(line)) {
        // Reset regex state
        rule.pattern.lastIndex = 0
        const match = line.match(rule.pattern)?.[0] || 'hex'
        console.log(`  ${red('✖ COLOR DRIFT')}: ${bold(relPath)}:${index + 1}`)
        console.log(`    ${gray('Found:')}    ${red(line.trim())}`)
        console.log(`    ${yellow('Remedy:')}   Replace ${bold(match)} with ${green(rule.fix)}`)
        colorDriftCount++
        totalViolations++
      }
    }
  })
}

if (colorDriftCount === 0) {
  console.log(`  ${green('✔ PASS')}: All inspected apps adhere 100% to Moon design tokens. Zero color drift detected!`)
}

// ---------------------------------------------------------------------
// CHECK 3: Forbid Local Duplicate CSS Component Classes in Stylesheets
// ---------------------------------------------------------------------
console.log(`\n${bold(magenta('🧩 CHECK 3: Duplicate Component Classes in App Stylesheets'))}`)
let duplicateClassCount = 0

for (const relPath of APP_STYLESHEETS) {
  scannedFilesCount++
  const fullPath = resolve(ROOT, relPath)
  let content
  try {
    content = readFileSync(fullPath, 'utf8')
  } catch {
    continue
  }

  for (const rule of FORBIDDEN_STYLESHEET_CLASSES) {
    if (rule.match.test(content)) {
      console.log(`  ${red('✖ DUPLICATE COMPONENT')}: ${bold(relPath)}`)
      console.log(`    ${yellow('Rule Violation:')} ${rule.desc}`)
      duplicateClassCount++
      totalViolations++
    }
  }
}

if (duplicateClassCount === 0) {
  console.log(`  ${green('✔ PASS')}: No duplicate component classes detected in local app stylesheets.`)
}

// ---------------------------------------------------------------------
// CHECK 4: Typography and Font Consistency
// ---------------------------------------------------------------------
console.log(`\n${bold(magenta('🔤 CHECK 4: Font & Typography Consistency'))}`)
let fontDriftCount = 0

for (const relPath of APP_STYLESHEETS) {
  const fullPath = resolve(ROOT, relPath)
  let content
  try {
    content = readFileSync(fullPath, 'utf8')
  } catch {
    continue
  }

  const lines = content.split('\n')
  lines.forEach((line, index) => {
    // Flag untokenized font declarations like "font-family: Arial" or "font-family: sans-serif"
    if (/font-family:\s*(?!var\(--font-)(Arial|sans-serif|monospace|Consolas|Helvetica)/i.test(line)) {
      console.log(`  ${yellow('⚠ FONT WARNING')}: ${bold(relPath)}:${index + 1}`)
      console.log(`    ${gray('Found:')}  ${line.trim()}`)
      console.log(`    ${yellow('Hint:')}   Use var(--font-display), var(--font-mono), or var(--font-body)`)
      fontDriftCount++
    }
  })
}

if (fontDriftCount === 0) {
  console.log(`  ${green('✔ PASS')}: All typography uses standardized font design tokens.`)
}

// ---------------------------------------------------------------------
// SUMMARY & EXIT
// ---------------------------------------------------------------------
console.log(`\n${bold(cyan('═══════════════════════════════════════════════════════════════════════'))}`)
console.log(
  `Files scanned: ${bold(String(scannedFilesCount))} | Total Violations: ${
    totalViolations > 0 ? red(String(totalViolations)) : green('0')
  }`
)
console.log(bold(cyan('═══════════════════════════════════════════════════════════════════════')) + '\n')

if (totalViolations > 0) {
  console.error(red(bold(`❌ UI Consistency Check FAILED with ${totalViolations} violation(s).`)))
  console.error(yellow(`Fix the reported violations above to maintain design system consistency.\n`))
  process.exit(1)
} else {
  console.log(green(bold(`✨ Monorepo UI consistency check PASSED! All apps are 100% unified with @moonwitness/moonui.`)))
  process.exit(0)
}
