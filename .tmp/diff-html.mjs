import { readFileSync } from 'node:fs'

const NL = String.fromCharCode(10)

function normalise(file) {
  let html = readFileSync(file, 'utf8')
  html = html.replace(/<script[\s\S]*?<\/script>/g, '')
  html = html.replace(/<link[^>]*>/g, '')
  html = html.replace(/<!--[\s\S]*?-->/g, '')
  html = html.replace(/\/_next\/static\/[^"']*/g, '/asset')
  html = html.replace(/\s+/g, ' ')
  return html.replace(/></g, '>' + NL + '<').split(NL)
}

const [baselinePath, rebuiltPath] = process.argv.slice(2)
const before = normalise(baselinePath)
const after = normalise(rebuiltPath)
const strip = (list) => list.map((line) => line.replace(/(src|href|style)="[^"]*"/g, '').trim())
const b = strip(before)
const a = strip(after)

const mismatches = []
for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
  if (a[i] !== b[i]) mismatches.push(`${i}\n     before: ${b[i] ?? '(none)'}\n     after : ${a[i] ?? '(none)'}`)
}
console.log(`${rebuiltPath}: nodes ${before.length} -> ${after.length} | structural mismatches ${mismatches.length}`)
for (const m of mismatches.slice(0, 10)) console.log('  ' + m)

const textOf = (list) => list.join('').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
const tb = textOf(before)
const ta = textOf(after)
console.log(`  visible text identical: ${tb === ta} (${tb.length} vs ${ta.length} chars)`)
if (tb !== ta) {
  let i = 0
  while (i < tb.length && tb[i] === ta[i]) i += 1
  console.log('   first text difference:', JSON.stringify(tb.slice(i, i + 70)), 'vs', JSON.stringify(ta.slice(i, i + 70)))
}
