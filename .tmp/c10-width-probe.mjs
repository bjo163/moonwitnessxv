// Scratch: would counting width/height as anatomy add real sites, or noise?
import { readFileSync, writeFileSync } from 'node:fs'

const base = readFileSync('scripts/check-ui-consistency.mjs', 'utf8')
const CURRENT = '/^((background|border|outline|padding|color|font|box-shadow|text-shadow|text-transform|letter-spacing|line-height|opacity)(-[a-z-]+)?)$/'
const WIDER = '/^((background|border|outline|padding|color|font|box-shadow|text-shadow|text-transform|letter-spacing|line-height|opacity|width|height)(-[a-z-]+)?)$/'
if (!base.includes(CURRENT)) throw new Error('anchor regex not found')
const patched = base.replace(CURRENT, WIDER).replace("from './apps.registry.mjs'", "from '../scripts/apps.registry.mjs'")
writeFileSync('.tmp/check-ui-probe.mjs', patched)

const { execFileSync } = await import('node:child_process')
const out = execFileSync('node', ['.tmp/check-ui-probe.mjs', '--root', '.', '--json=.tmp/gate-probe.json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
void out
const report = JSON.parse(readFileSync('.tmp/gate-probe.json', 'utf8'))
for (const v of report.violations.filter((x) => x.check === 'C10')) console.log(v.file + ':' + v.line, v.message)
