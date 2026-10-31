import { execFileSync } from 'node:child_process'

const tree = process.argv[2]
const show = (path) => execFileSync('git', ['show', `${tree}:${path}`], { encoding: 'utf8', maxBuffer: 64e6 })

const todo = show('TODO.md')
const rows = todo.match(/^\| - \[[ x]\] \| \*\*M\d+-\d+\*\*/gm) ?? []
const m51 = rows.filter((row) => row.includes('**M51-'))
const checked = (todo.match(/\| - \[x\] \| \*\*M51-/g) ?? []).length

const pkg = JSON.parse(show('package.json'))
const lock = show('pnpm-lock.yaml').split('\n')
const arsyBlockStart = lock.indexOf('  apps/arsy:')
function arsyBlockEnd(start, source) {
  let end = start + 1
  while (end < source.length && !/^  \S/.test(source[end])) end += 1
  return end
}
const arsyBlock = lock.slice(arsyBlockStart, arsyBlockEnd(arsyBlockStart, lock))
const ispImporter = lock.includes('  packages/moonql-isp:')
const consoleImporter = lock.includes('  apps/isp-console:')

const addons = show('apps/arsy/src/addons.ts')
const snapshot = JSON.parse(show('packages/moonql-client/src/schema-snapshot.json'))
const ispPaths = snapshot.endpoints.filter((ep) => ep.path.startsWith('/isp')).length
const generated = show('packages/moonql-client/src/generated.ts')

console.log(JSON.stringify({
  todoRows: rows.length,
  m51Rows: m51.length,
  m51Checked: checked,
  m51CheckedLines: todo.split('\n').filter((line) => line.includes('| **M51-') && line.includes('- [x]')).map((line) => line.slice(0, 40)),
  rootTestHasIspSuite: pkg.scripts.test.includes('@moonwitness/moonql-isp test'),
  rootVerifyHasBothChecks: pkg.scripts.verify.includes('isp:matrix:check') && pkg.scripts.verify.includes('isp:boundary:check'),
  lockIspImporter: ispImporter,
  lockIspConsoleImporter: consoleImporter,
  lockArsyIspEdge: arsyBlock.some((line) => line === "      '@moonwitness/moonql-isp':"),
  arsTsconfigRef: JSON.parse(show('apps/arsy/tsconfig.json')).references.some((r) => r.path === '../../packages/moonql-isp'),
  arsDep: Boolean(JSON.parse(show('apps/arsy/package.json')).dependencies['@moonwitness/moonql-isp']),
  addonsRegistersIsp: addons.includes("import isp from '@moonwitness/moonql-isp'") && /\n  isp,\n/.test(addons),
  snapshotIspEndpoints: ispPaths,
  snapshotSchemaHash: snapshot.schemaHash,
  generatedHashMatchesSnapshot: generated.includes(`'${snapshot.schemaHash}'`),
  modelsPrivate: (show('packages/moonql-isp/src/models.ts').match(/rest: false/g) ?? []).length,
}, null, 1))
