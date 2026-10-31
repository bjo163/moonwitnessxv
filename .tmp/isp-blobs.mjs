import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import process from 'node:process'

const head = (file) => execFileSync('git', ['show', `HEAD:${file}`], { encoding: 'utf8', maxBuffer: 64e6 })
const work = (file) => readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
const lines = (text) => text.split('\n')

const stash = {}
function out(file, text) {
  const oid = execFileSync('git', ['hash-object', '-w', '--stdin'], { encoding: 'utf8', input: text, maxBuffer: 64e6 }).trim()
  stash[file] = oid
}

function need(condition, label) {
  if (!condition) throw new Error(`anchor not applied: ${label}`)
}

// --- TODO.md: insert the M51 section before the target-register paragraph ---
{
  const wt = lines(work('TODO.md'))
  const start = wt.findIndex((l) => l.startsWith('## M51 '))
  need(start >= 0, 'worktree M51 header')
  let end = wt.findIndex((l, i) => i > start && l.startsWith('**Target register:'))
  need(end > start, 'worktree target register')
  while (end > start + 1 && wt[end - 1].trim() === '') end -= 1
  const block = wt.slice(start, end)

  const hs = lines(head('TODO.md'))
  const at = hs.findIndex((l) => l.startsWith('**Target register:'))
  need(at >= 0, 'HEAD target register')
  out('TODO.md', [...hs.slice(0, at), ...block, '', ...hs.slice(at)].join('\n'))
}

// --- README.md: two M51 table rows plus the D20 hub bullet ---
{
  const wt = lines(work('README.md'))
  const rows = wt.filter((l) => /^\| \*\*ISP (Console|RADIUS Runtime)\*\*/.test(l))
  need(rows.length === 2, 'worktree ISP rows')
  const bullet = wt.find((l) => l.startsWith('- **D20 ISP & Network Operations**'))
  need(Boolean(bullet), 'worktree D20 bullet')

  let hs = lines(head('README.md'))
  const lumen = hs.findIndex((l) => l.startsWith('| **LUMEN Runtime** (M41'))
  need(lumen >= 0, 'HEAD LUMEN row')
  hs = [...hs.slice(0, lumen + 1), ...rows, ...hs.slice(lumen + 1)]
  const arsy = hs.findIndex((l) => l.startsWith('- **ARSY** — canonical identity'))
  need(arsy >= 0, 'HEAD ARSY bullet')
  hs = [...hs.slice(0, arsy + 1), bullet, ...hs.slice(arsy + 1)]
  out('README.md', hs.join('\n'))
}

// --- MASTER_DESIGN.md: the ISP console surface paragraph at the end of the register ---
{
  const wt = lines(work('MASTER_DESIGN.md'))
  const at = wt.findIndex((l) => l.startsWith('**ISP operator surface — ISP Console'))
  need(at >= 0, 'worktree ISP paragraph')
  const paragraph = wt[at]
  const hs = lines(head('MASTER_DESIGN.md'))
  let end = hs.length
  while (end > 0 && hs[end - 1].trim() === '') end -= 1
  out('MASTER_DESIGN.md', [...hs.slice(0, end), '', paragraph, ...hs.slice(end)].join('\n'))
}

// --- DOMAIN_COVERAGE.md: D15/D16 clause, accepted D20 clause, M51 crosswalk section ---
{
  const wt = work('docs/planning/DOMAIN_COVERAGE.md')
  const wl = lines(wt)
  const sectionStart = wl.findIndex((l) => l.startsWith('## M51 ISP & Network Operations'))
  need(sectionStart >= 0, 'worktree M51 coverage section')
  let sectionEnd = wl.length
  while (sectionEnd > sectionStart + 1 && wl[sectionEnd - 1].trim() === '') sectionEnd -= 1
  const section = wl.slice(sectionStart, sectionEnd)
  const clause = wl.find((l) => l.startsWith('D00 foundation/auth'))
  need(Boolean(clause) && clause.includes('accepted D20 ISP/network technical operations M51'), 'worktree coverage clause')

  const hs = lines(head('docs/planning/DOMAIN_COVERAGE.md'))
  const idx = hs.findIndex((l) => l.startsWith('D00 foundation/auth'))
  need(idx >= 0, 'HEAD coverage clause')
  need(!hs[idx].includes('D20'), 'HEAD clause already has D20')
  const patched = clause
  const headClause = hs[idx]
  const sameExceptIsp =
    headClause.replace('proposed D15/D16 WORKS M35;', 'proposed D15/D16 WORKS M35 (ISP vertical mapped by ADR-0018);')
      .replace('proposed D17 HELIOGRID M36;', 'proposed D17 HELIOGRID M36; accepted D20 ISP/network technical operations M51;')
  need(sameExceptIsp === patched, 'coverage clause is HEAD plus ISP only')
  hs[idx] = patched
  out('docs/planning/DOMAIN_COVERAGE.md', [...hs.slice(0, idx + 1), '', ...section, ...hs.slice(idx + 1)].join('\n'))
}

// --- docs/decisions/README.md: index ADR-0018 and state what acceptance does not prove ---
{
  const hs = lines(head('docs/decisions/README.md'))
  const linkIdx = hs.findIndex((l) => l.includes('(ADR-0016-public-domain-map.md).'))
  need(linkIdx >= 0, 'HEAD ADR-0016 link')
  hs[linkIdx] = hs[linkIdx].replace(
    '(ADR-0016-public-domain-map.md).',
    '(ADR-0016-public-domain-map.md), [ADR-0018 ISP & Network Operations in XV](ADR-0018-isp-network-operations.md).',
  )
  const noteIdx = hs.findIndex((l) => l.startsWith('A decision'))
  need(noteIdx >= 0, 'HEAD decision note paragraph')
  need(hs[noteIdx].endsWith('it authorizes no schema, route, code or grant assignment.'), 'HEAD note tail')
  hs[noteIdx] += ' ADR-0018 accepts the D20 ISP/network boundary for XV and pins the MWX-ISP source baseline; it authorizes no third SQL owner, second Hub, public ISP surface, production use or deployment.'
  out('docs/decisions/README.md', hs.join('\n'))
}

// --- package.json: run the two M51 planning tests and expose the two cheap checks ---
{
  const text = head('package.json')
  const parsed = JSON.parse(text)
  need(parsed.scripts.test.includes('test/planning/m21-02-ai-candidate-evidence.test.mjs'), 'HEAD planning test group')
  const withTests = parsed.scripts.test.replace(
    'test/planning/m33-05-private-poster-access-attribution.test.mjs',
    'test/planning/m33-05-private-poster-access-attribution.test.mjs test/planning/m51-01-d20-boundary.test.mjs test/planning/m51-02-mwx-isp-migration.test.mjs',
  )
  const withChecks = parsed.scripts.verify.replace(
    '&& pnpm build:web',
    '&& pnpm isp:matrix:check && pnpm isp:boundary:check && pnpm build:web',
  )
  need(withTests !== parsed.scripts.test && withChecks !== parsed.scripts.verify, 'HEAD script anchors')
  const eol = text.includes('\r\n') ? '\r\n' : '\n'
  let next = text.replace(JSON.stringify(parsed.scripts.test).slice(1, -1), JSON.stringify(withTests).slice(1, -1))
  next = next.replace(JSON.stringify(parsed.scripts.verify).slice(1, -1), JSON.stringify(withChecks).slice(1, -1))
  const anchor = `${eol}    "lint":`
  need(next.includes(anchor), 'HEAD lint script position')
  next = next.replace(
    anchor,
    `${eol}    "isp:matrix:check": "node scripts/check-isp-migration-matrix.mjs",${eol}    "isp:boundary:check": "node scripts/check-m51-01-d20-boundary.mjs",${anchor}`,
  )
  const reparse = JSON.parse(next)
  need(reparse.scripts['isp:matrix:check'] === 'node scripts/check-isp-migration-matrix.mjs', 'isp:matrix:check present')
  need(reparse.scripts.test === withTests && reparse.scripts.verify === withChecks, 'script edits landed')
  out('package.json', next)
}

for (const [file, oid] of Object.entries(stash)) process.stdout.write(`${oid}\t${file}\n`)
