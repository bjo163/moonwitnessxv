import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import process from 'node:process'

const raw = (text) => execFileSync('git', ['hash-object', '-w', '--stdin'], { encoding: 'utf8', input: text, maxBuffer: 64e6 }).trim()
const stage = (file, text) => execFileSync('git', ['update-index', '--cacheinfo', `100644,${raw(text)},${file}`], { encoding: 'utf8' })
const headText = (file) => execFileSync('git', ['show', `HEAD:${file}`], { encoding: 'utf8', maxBuffer: 64e6 })

// Line-array edits keep the file's own end-of-line style and final newline.
function edit(text, apply) {
  const eol = text.includes('\r\n') ? '\r\n' : '\n'
  const trailing = text.endsWith('\n')
  const lines = text.split(/\r?\n/)
  if (trailing) lines.pop()
  apply(lines)
  return lines.join(eol) + (trailing ? eol : '')
}
const need = (condition, label) => {
  if (!condition) throw new Error(`anchor not applied: ${label}`)
}

const ispBlock = (() => {
  const w = readFileSync('TODO.md', 'utf8').split(/\r?\n/)
  const from = w.findIndex((line) => line.startsWith('## M51'))
  const to = w.findIndex((line) => line.startsWith('**Target register:'))
  need(from >= 0 && to > from, 'TODO M51 section')
  return w.slice(from, to)
})()

stage('TODO.md', edit(headText('TODO.md'), (lines) => {
  const at = lines.findIndex((line) => line.startsWith('**Target register:'))
  need(at >= 0, 'TODO target register line')
  lines.splice(at, 0, ...ispBlock)
}))

stage('README.md', edit(headText('README.md'), (lines) => {
  const w = readFileSync('README.md', 'utf8').split(/\r?\n/)
  const rows = ['| **ISP Console** (M51', '| **ISP RADIUS Runtime** (M51'].map((prefix) => {
    const row = w.find((line) => line.startsWith(prefix))
    need(Boolean(row), prefix)
    return row
  })
  const bullet = w.find((line) => line.startsWith('- **D20 ISP & Network Operations**'))
  need(Boolean(bullet), 'README D20 bullet')
  const lumen = lines.findIndex((line) => line.startsWith('| **LUMEN Runtime** (M41'))
  need(lumen >= 0, 'README LUMEN row')
  lines.splice(lumen + 1, 0, ...rows)
  const arsy = lines.findIndex((line) => line.startsWith('- **ARSY** — canonical identity'))
  need(arsy >= 0, 'README ARSY bullet')
  lines.splice(arsy + 1, 0, bullet)
}))

stage('MASTER_DESIGN.md', edit(headText('MASTER_DESIGN.md'), (lines) => {
  const w = readFileSync('MASTER_DESIGN.md', 'utf8').split(/\r?\n/)
  const paragraph = w.find((line) => line.startsWith('**ISP operator surface'))
  need(Boolean(paragraph), 'MASTER_DESIGN ISP paragraph')
  const orbit = lines.findIndex((line) => line.startsWith('**Spatial agent-operations surface semantics'))
  need(orbit >= 0, 'MASTER_DESIGN ORBIT paragraph')
  lines.splice(orbit + 1, 0, '', paragraph)
}))

stage('docs/planning/DOMAIN_COVERAGE.md', edit(headText('docs/planning/DOMAIN_COVERAGE.md'), (lines) => {
  const w = readFileSync('docs/planning/DOMAIN_COVERAGE.md', 'utf8').split(/\r?\n/)
  const index = lines.findIndex((line) => line.includes('proposed D17 HELIOGRID M36;'))
  need(index >= 0, 'DOMAIN_COVERAGE index line')
  lines[index] = lines[index]
    .replace('proposed D15/D16 WORKS M35;', 'proposed D15/D16 WORKS M35 (ISP vertical mapped by ADR-0018);')
    .replace('proposed D17 HELIOGRID M36;', 'proposed D17 HELIOGRID M36; accepted D20 ISP/network technical operations M51;')
  const from = w.findIndex((line) => line === '## M51 ISP & Network Operations')
  need(from >= 0, 'DOMAIN_COVERAGE M51 section')
  lines.push('', ...w.slice(from).filter((line, position) => position < 6))
}))

stage('docs/decisions/README.md', edit(headText('docs/decisions/README.md'), (lines) => {
  const index = lines.findIndex((line) => line.includes('(ADR-0016-public-domain-map.md).'))
  need(index >= 0, 'ADR index line')
  lines[index] = lines[index].replace(
    '[ADR-0016 public domain map and hostname ownership](ADR-0016-public-domain-map.md).',
    '[ADR-0016 public domain map and hostname ownership](ADR-0016-public-domain-map.md), [ADR-0018 ISP & Network Operations in XV](ADR-0018-isp-network-operations.md).',
  )
  const note = lines.findIndex((line) => line.startsWith("A decision's acceptance does not prove implementation."))
  need(note >= 0, 'ADR note line')
  lines[note] = `${lines[note].trimEnd()} ADR-0018 accepts D20 ISP & Network Operations as ARSY/MoonQL-owned data with a SQL-less Go protocol runtime and a private console; it accepts no implementation, deployment or real NAS use, and M35/M37/M38 gates stay in force.`
}))

process.stdout.write('staged ISP index edits\n')
