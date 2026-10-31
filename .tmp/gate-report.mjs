import { execFileSync } from 'node:child_process'
import process from 'node:process'
import { readFileSync } from 'node:fs'

let status = 0
try {
  execFileSync(process.execPath, ['scripts/check-ui-consistency.mjs', '--json=.tmp/gate.json'], { stdio: 'pipe' })
} catch (error) {
  status = typeof error.status === 'number' ? error.status : 1
}
const report = JSON.parse(readFileSync('.tmp/gate.json', 'utf8'))
console.log('status', status, 'ok', report.ok, 'ratchet', report.ratchet, 'ledger', report.ledger.entries)
console.log('cssDebt', report.cssDebt.entries.length, '/', report.cssDebt.ceiling)
const byCheck = {}
for (const v of report.violations) byCheck[v.check] = (byCheck[v.check] ?? 0) + 1
console.log('violations', JSON.stringify(byCheck))
for (const v of report.violations.filter((x) => x.check === 'C3')) console.log('  C3', v.file, v.message)
for (const v of report.violations.filter((x) => x.check === 'C6')) console.log('  C6', v.file, v.message)
const owners = new Map()
for (const e of report.cssDebt.entries) {
  const key = e.definedIn.join(',')
  owners.set(key, (owners.get(key) ?? 0) + 1)
}
console.log('cssDebt grouped by defining stylesheet:')
for (const [key, count] of owners) console.log('  ', count, key)
console.log('emittedBy:', [...new Set(report.cssDebt.entries.flatMap((e) => e.emittedIn))].join(', '))
