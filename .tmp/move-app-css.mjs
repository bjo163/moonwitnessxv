import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'

const argv = process.argv.slice(2)
const arg = (name) => argv[argv.indexOf(name) + 1]
const app = arg('--app')
const appCss = arg('--css')
const moonCssPath = 'packages/moonui/moon.css'
const NL = String.fromCharCode(10)

if (!app || !appCss) throw new Error('usage: move-app-css.mjs --app <tag> --css <path>')

const backup = (file) => {
  const target = `.tmp/${file.split('/').pop()}.pre-${app}.bak`
  if (!existsSync(target)) copyFileSync(file, target)
}
backup(appCss)
backup(moonCssPath)

try {
  execFileSync(process.execPath, ['scripts/check-ui-consistency.mjs', '--json=.tmp/gate.json'], { stdio: 'pipe' })
} catch {
  // mid-migration the gate fails by design; the JSON report is still written
}
const report = JSON.parse(readFileSync('.tmp/gate.json', 'utf8'))
const emitted = new Set(
  report.cssDebt.entries
    .filter((entry) => entry.definedIn.some((p) => p.includes(`/${app}/`)))
    .map((entry) => entry.cls),
)
if (emitted.size === 0) throw new Error(`no C7 debt attributed to ${app}`)

const css = readFileSync(appCss, 'utf8')

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

const movable = parseRules(css).filter((rule) => {
  const classes = [...rule.selector.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1])
  return classes.length > 0 && classes.every((c) => emitted.has(c))
})

let rebuilt = ''
let cursor = 0
for (const rule of movable) {
  rebuilt += css.slice(cursor, rule.start)
  cursor = rule.end
}
rebuilt += css.slice(cursor)
rebuilt = rebuilt.replace(/@(?:media|supports)[^{}]*\{\s*\}\s*/g, '')
let guard = 0
while (rebuilt.includes(NL + NL + NL) && guard < 2000) {
  rebuilt = rebuilt.split(NL + NL + NL).join(NL + NL)
  guard += 1
}
writeFileSync(appCss, rebuilt, 'utf8')

const top = []
const byMedia = new Map()
for (const rule of movable) {
  const text = css.slice(rule.start, rule.end).trim()
  if (rule.at) {
    if (!byMedia.has(rule.at)) byMedia.set(rule.at, [])
    byMedia.get(rule.at).push(text)
  } else top.push(text)
}

const banner = [
  '/* ==========================================================================',
  `   ${app} operator surface (ADR-0017).`,
  '',
  `   These classes are emitted by packages/moonui/src/surfaces/${app}*`,
  '   (`<app>.tsx` and `client/surfaces/<app>.tsx`), so their rules belong to the',
  '   design system. Apps import moon.css first and their own stylesheet after,',
  '   so a page band may still refine a value without restating the anatomy.',
  '   ========================================================================== */',
  '',
]

const section = [
  ...banner,
  ...top,
  '',
  ...[...byMedia.entries()].map(([prelude, blocks]) => `${prelude} {\n  ${blocks.join('\n  ')}\n}`),
  '',
].join('\n')

const moon = readFileSync(moonCssPath, 'utf8')
writeFileSync(moonCssPath, `${moon.replace(/\s+$/, '')}\n\n${section}\n`, 'utf8')

console.log(`${app}: moved ${movable.length} blocks (${top.length} top level, ${byMedia.size} media groups)`)
console.log(`  app stylesheet ${css.split(NL).length} -> ${rebuilt.split(NL).length} lines`)
console.log(`  moon.css ${moon.split(NL).length} -> ${readFileSync(moonCssPath, 'utf8').split(NL).length} lines`)
