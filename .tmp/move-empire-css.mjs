import { execFileSync } from 'node:child_process'
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'

const APP_CSS = 'apps/empire-web/src/app/globals.css'
const MOON_CSS = 'packages/moonui/moon.css'

copyFileSync(APP_CSS, '.tmp/globals.css.bak')
copyFileSync(MOON_CSS, '.tmp/moon.css.bak')

execFileSync(process.execPath, ['scripts/check-ui-consistency.mjs', '--json=.tmp/gate.json'], { stdio: 'pipe' })
const report = JSON.parse(readFileSync('.tmp/gate.json', 'utf8'))
const emitted = new Set(
  report.cssDebt.entries
    .filter((entry) => entry.definedIn.some((p) => p.includes('empire-web')))
    .map((entry) => entry.cls),
)

const css = readFileSync(APP_CSS, 'utf8')

function parseRules(text, atPrelude = null, offsetBase = 0, out = []) {
  let pos = 0
  while (pos < text.length) {
    const brace = text.indexOf('{', pos)
    if (brace < 0) break
    const preludeStart = pos
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
      parseRules(body, prelude.split('{')[0].trim(), offsetBase + brace + 1, out)
    } else if (prelude) {
      out.push({ selector: prelude.replace(/\s+/g, ' '), at: atPrelude, start: offsetBase + preludeStart, end: offsetBase + j })
    }
    pos = j
  }
  return out
}

const rules = parseRules(css)
const movable = rules.filter((rule) => {
  const classes = [...rule.selector.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1])
  if (classes.length === 0) return false
  if (!classes.every((c) => emitted.has(c))) return false
  // A leading comment belongs to the block; strip nothing else.
  return true
})

/* Rebuild globals.css without the moved ranges. */
let out = ''
let cursor = 0
for (const rule of movable) {
  out += css.slice(cursor, rule.start)
  cursor = rule.end
}
out += css.slice(cursor)
// Drop at-preludes that lost every inner rule, then collapse blank runs.
out = out.replace(/@(?:media|supports)[^{}]*\{\s*\}\n?/g, '')
out = out.replace(/\n{3,}/g, '\n\n')
writeFileSync(APP_CSS, out, 'utf8')

/* Compose the moon.css section, preserving each @media wrapper once. */
const head = []
const byMedia = new Map()
for (const rule of movable) {
  const text = css.slice(rule.start, rule.end).trim()
  if (rule.at) {
    if (!byMedia.has(rule.at)) byMedia.set(rule.at, [])
    byMedia.get(rule.at).push(text)
  } else {
    head.push(text)
  }
}

const banner = [
  '/* ==========================================================================',
  '   Site chrome and Story Universe surfaces (ADR-0017).',
  '',
  '   These classes are emitted by packages/moonui/src (site.tsx,',
  '   client/site-header.tsx, story.tsx), so their rules live here and not in',
  '   apps/empire-web/src/app/globals.css. Colour and geometry come from the',
  '   ADR-0014 skin roles above; an app stylesheet defining a class that MoonUI',
  '   renders is the inverted dependency check C7 rejects.',
  '   ========================================================================== */',
  '',
]

const section = [
  ...banner,
  ...head,
  '',
  ...[...byMedia.entries()].map(([prelude, blocks]) => `${prelude} {\n  ${blocks.join('\n  ')}\n}`),
  '',
].join('\n')

const moon = readFileSync(MOON_CSS, 'utf8')
writeFileSync(MOON_CSS, `${moon.replace(/\s+$/, '')}\n\n${section}\n`, 'utf8')

console.log('moved blocks:', movable.length)
console.log('  top level:', head.length, '| inside @media:', byMedia.size, 'preludes')
console.log('app css lines:', css.split('\n').length, '->', out.split('\n').length)
console.log('moon css lines:', moon.split('\n').length, '->', readFileSync(MOON_CSS, 'utf8').split('\n').length)
