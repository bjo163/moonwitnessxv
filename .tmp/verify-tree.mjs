import { execFileSync } from 'node:child_process'
import process from 'node:process'
const T = process.argv[2]
const read = (p) => execFileSync('git', ['show', `${T}:${p}`], { encoding: 'utf8', maxBuffer: 64e6 })
const boundary = await import('../scripts/check-m51-01-d20-boundary.mjs')
const matrix = await import('../scripts/check-isp-migration-matrix.mjs')
const b = boundary.validateBoundary(read)
const m = matrix.validateMatrix(read('docs/research/mwx-isp-into-xv-migration-matrix.md'))
const todo = read('TODO.md')
const rows = todo.split('\n').filter((l) => /^\| - \[[ x]\] \| \*\*M/.test(l)).length
const m51 = todo.split('\n').filter((l) => /^\| - \[[ x]\] \| \*\*M51-/.test(l)).length
console.log(JSON.stringify({ boundary: b, matrix: { failures: m.failures, ids: m.ids?.length ?? null }, todoRows: rows, m51Rows: m51 }, null, 1))
