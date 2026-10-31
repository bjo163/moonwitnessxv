import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

// Reuse the gate's own measurement so this worklist can never drift from C7.
execFileSync(process.execPath, ['scripts/check-ui-consistency.mjs', '--json=.tmp/gate.json'], { stdio: 'pipe' })
const report = JSON.parse(readFileSync('.tmp/gate.json', 'utf8'))
const emitted = new Set(
  report.cssDebt.entries
    .filter((entry) => entry.definedIn.some((p) => p.includes('empire-web')))
    .map((entry) => entry.cls),
)

const path = 'apps/empire-web/src/app/globals.css'
const css = readFileSync(path, 'utf8')

/** Flat list of rule blocks with their enclosing at-prelude and offsets. */
function parseRules(text, atPrelude = null, offsetBase = 0, out = []) {
  let pos = 0
  while (pos < text.length) {
    const brace = text.indexOf('{', pos)
    if (brace < 0) break
    const prelude = text.slice(pos, brace).trim()
    let depth = 1
    let j = brace + 1
    while (j < text.length && depth > 0) {
      if (text[j] === '{') depth += 1
      else if (text[j] === '}') depth -= 1
      j += 1
    }
    const body = text.slice(brace + 1, j - 1)
    if (/^@(media|supports)/.test(prelude)) {
      parseRules(body, prelude, offsetBase + brace + 1, out)
    } else if (prelude) {
      out.push({ selector: prelude.replace(/\s+/g, ' '), at: atPrelude, start: offsetBase + pos, end: offsetBase + j })
    }
    pos = j
  }
  return out
}

const rules = parseRules(css)
const lineOf = (offset) => css.slice(0, offset).split('\n').length

const move = []
const mixed = []
for (const rule of rules) {
  const classes = [...rule.selector.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1])
  const hit = classes.filter((c) => emitted.has(c))
  const rest = [...new Set(classes.filter((c) => !emitted.has(c)))]
  if (hit.length === 0) continue
  if (rest.length === 0) move.push(rule)
  else mixed.push({ ...rule, rest })
}

const movableLines = move.reduce((sum, r) => sum + (lineOf(r.end) - lineOf(r.start)), 0)
console.log('emitted empire classes:', emitted.size)
console.log('rules defined in empire css:', rules.length)
console.log('MOVABLE rule blocks:', move.length, '≈ lines:', movableLines)
console.log('  of which inside @media:', move.filter((r) => r.at).length)
console.log('MIXED rule blocks (need split):', mixed.length)
for (const r of mixed) console.log('   MIX line', lineOf(r.start), '|', r.selector, '| app-only:', r.rest.join(','))
const covered = new Set(move.flatMap((r) => [...r.selector.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1])))
console.log('classes covered by movable blocks:', covered.size, 'of', emitted.size)
console.log('emitted but NOT covered:', [...emitted].filter((c) => !covered.has(c)).join(' '))
