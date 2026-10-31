import { readFileSync } from 'node:fs'

const NL = String.fromCharCode(10)

function normalise(file) {
  let html = readFileSync(file, 'utf8')
  html = html.replace(/<script[\s\S]*?<\/script>/g, '')
  html = html.replace(/<link[^>]*>/g, '')
  html = html.replace(/<!--[\s\S]*?-->/g, '')
  html = html.replace(/\/_next\/static\/[^"']*/g, '/asset')
  html = html.replace(/\s+/g, ' ')
  // one tag per line so a diff reads as structure
  return html.replace(/></g, '>' + NL + '<').split(NL)
}

const before = normalise('.tmp/ggs-baseline.html')
const after = normalise('apps/empire-web/out/en/ggs.html')

console.log('baseline nodes:', before.length, '| rebuilt nodes:', after.length)

const setOf = (list) => list.map((line) => line.replace(/(src|href)="[^"]*"/g, '').trim())
const b = setOf(before)
const a = setOf(after)

const onlyBefore = []
const onlyAfter = []
for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
  if (a[i] !== b[i]) {
    if (b[i] !== undefined) onlyBefore.push(`${i}: ${b[i]}`)
    if (a[i] !== undefined) onlyAfter.push(`${i}: ${a[i]}`)
  }
}

console.log('positional mismatches:', onlyBefore.length)
for (const line of onlyBefore.slice(0, 12)) console.log('  BEFORE', line)
for (const line of onlyAfter.slice(0, 12)) console.log('  AFTER ', line)

const textOf = (list) => list.join('').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
const tb = textOf(before)
const ta = textOf(after)
console.log('visible text identical:', tb === ta, '| baseline chars', tb.length, '| rebuilt chars', ta.length)
if (tb !== ta) {
  let i = 0
  while (i < tb.length && tb[i] === ta[i]) i += 1
  console.log('   first text difference at', i, JSON.stringify(tb.slice(i, i + 90)), 'vs', JSON.stringify(ta.slice(i, i + 90)))
}
