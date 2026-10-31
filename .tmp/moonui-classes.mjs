import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const skip = new Set(['node_modules', '.next', 'dist', 'out', 'coverage', '.git', '.vercel'])

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (skip.has(entry)) continue
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) walk(full, out)
    else if (full.endsWith('.tsx') || full.endsWith('.ts')) out.push(full)
  }
  return out
}

const emitted = new Map()
for (const file of walk('packages/moonui/src')) {
  const source = readFileSync(file, 'utf8')
  const patterns = [
    /className\s*=\s*"([^"]*)"/g,
    /className\s*=\s*\{`([^`]*)`\}/g,
    /cn\(\s*'([^']*)'/g,
    /cn\(\s*"([^"]*)"/g,
    /className\s*\?\s*'([^']*)'/g,
    /'([^']*\bsu-[\w-]*)'/g,
  ]
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      for (const cls of match[1].split(/\s+/)) {
        if (!/^(su|emp|eol)-/.test(cls)) continue
        if (!emitted.has(cls)) emitted.set(cls, new Set())
        emitted.get(cls).add(file.replace(/\\/g, '/'))
      }
    }
  }
}

const appCss = readFileSync('apps/empire-web/src/app/globals.css', 'utf8')
const moonCss = readFileSync('packages/moonui/moon.css', 'utf8')

console.log('=== classes emitted by MoonUI with an app-namespace prefix ===')
for (const [cls, files] of [...emitted.entries()].sort()) {
  const inEmpire = new RegExp('\\.' + cls.replace(/[-]/g, '\\-') + '\\b').test(appCss)
  const inMoon = new RegExp('\\.' + cls.replace(/[-]/g, '\\-') + '\\b').test(moonCss)
  console.log(
    cls.padEnd(26),
    'empireCss=' + (inEmpire ? 'YES' : 'no ').padEnd(4),
    'moonCss=' + (inMoon ? 'YES' : 'no ').padEnd(4),
    [...files].map((f) => f.split('/').slice(-2).join('/')).join(','),
  )
}
