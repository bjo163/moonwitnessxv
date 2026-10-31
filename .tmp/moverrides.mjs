import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const skip = new Set(['node_modules', '.next', 'dist', 'out', 'coverage', '.git', '.vercel'])
const ANATOMY = /^(color|background|background-color|border|border-\w+|font\S*|box-shadow|outline\S*|padding\S*|text-transform|letter-spacing|opacity|text-shadow|line-height)$/

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (skip.has(entry)) continue
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) walk(full, out)
    else if (full.endsWith('.css')) out.push(full)
  }
  return out
}

const moon = new Set([...readFileSync('packages/moonui/moon.css', 'utf8').matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]))

function parseRules(text, at = null, base = 0, out = []) {
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
    if (/^@(media|supports)/.test(prelude)) parseRules(body, prelude.split('{')[0].trim(), base + brace + 1, out)
    else if (prelude) out.push({ selector: prelude.replace(/\s+/g, ' '), body, at, start: base + pos })
    pos = j
  }
  return out
}

let anatomy = 0
let positional = 0
for (const file of walk('apps')) {
  const source = readFileSync(file, 'utf8')
  for (const rule of parseRules(source)) {
    const classes = [...rule.selector.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1])
    const shared = classes.filter((c) => c.startsWith('m-') && moon.has(c))
    if (shared.length === 0) continue
    const props = [...rule.body.matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1])
    const hit = props.filter((p) => ANATOMY.test(p))
    const line = source.slice(0, rule.start).split('\n').length
    if (hit.length) {
      anatomy += 1
      console.log(`ANATOMY    ${file.replace(/\\/g, '/')}:${line}`)
    } else {
      positional += 1
      console.log(`positional ${file.replace(/\\/g, '/')}:${line}`)
    }
    console.log(`             ${rule.at ? rule.at + ' ' : ''}${rule.selector.slice(0, 110)}`)
    console.log(`             anatomy: ${hit.join(',') || '-'}   all: ${props.join(',')}`)
  }
}
console.log(`anatomy-override rules: ${anatomy}   positional-only: ${positional}`)
