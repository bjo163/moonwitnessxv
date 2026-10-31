import { execFileSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'

const head = (file) => execFileSync('git', ['show', `HEAD:${file}`], { encoding: 'utf8', maxBuffer: 64e6 })
const work = (file) => readFileSync(file, 'utf8').replace(/\r\n/g, '\n')

const stash = {}
function out(file, text) {
  const oid = execFileSync('git', ['hash-object', '-w', '--stdin'], { encoding: 'utf8', input: text, maxBuffer: 64e6 }).trim()
  stash[file] = oid
}
function need(condition, label) {
  if (!condition) throw new Error(`anchor not applied: ${label}`)
}

// root package.json: HEAD plus the owning-package ISP suite in the root test run
{
  const text = head('package.json')
  const anchor = '@moonwitness/moonui test"'
  const tail = '@moonwitness/moonui test && pnpm --filter @moonwitness/moonql-isp test"'
  need(text.split(anchor).length === 2, 'root test script tail is unique')
  need(!text.includes('moonql-isp'), 'HEAD root package.json has no ISP wiring yet')
  out('package.json', text.replace(anchor, tail))
}

// pnpm-lock.yaml: HEAD plus only the moonql-isp importer and the ARSY dependency edge
{
  const headText = head('pnpm-lock.yaml').replace(/\r\n/g, '\n')
  const lines = headText.split('\n')
  const worktree = work('pnpm-lock.yaml').split('\n')

  const blockOf = (source, key) => {
    const start = source.indexOf(key)
    if (start < 0) return null
    let end = start + 1
    while (end < source.length && !/^  \S/.test(source[end])) end += 1
    return source.slice(start, end)
  }

  const importer = blockOf(worktree, '  packages/moonql-isp:')
  need(importer !== null && importer[0] === '  packages/moonql-isp:', 'pnpm wrote a moonql-isp importer')
  need(importer.some((line) => line === '        version: link:../moonql'), 'the ISP importer links the shared MoonQL owner')
  need(!importer.some((line) => /^ {6}'?[^']+'?:$/.test(line) && /next|react|moonui/.test(line)), 'the ISP importer pulls in no frontend package')

  const arsyWork = blockOf(worktree, '  apps/arsy:') ?? []
  const edgeStart = arsyWork.findIndex((line) => line === "      '@moonwitness/moonql-isp':")
  need(edgeStart > -1, 'pnpm wired the ISP package into the ARSY importer')
  const edge = arsyWork.slice(edgeStart, edgeStart + 3)
  need(edge[2] === '        version: link:../../packages/moonql-isp', 'the ARSY edge links the workspace package')

  const journey = lines.findIndex((line, index) => index > lines.indexOf('  apps/arsy:') && line === "      '@moonwitness/moonql-journey':")
  need(journey > -1, 'ARSY journey dependency')
  lines.splice(journey, 0, ...edge)

  const journeyImporter = lines.findIndex((line, index) => index > journey && line === '  packages/moonql-journey:')
  need(journeyImporter > -1, 'moonql-journey importer')
  lines.splice(journeyImporter, 0, ...importer)

  const patched = lines.join('\n')
  need(patched.split('\n').length === headText.split('\n').length + importer.length + edge.length, 'lockfile grows by exactly the ISP importer and ARSY edge')
  out('pnpm-lock.yaml', patched)
}

// TODO.md: HEAD with only the M51-03 box checked
{
  const text = head('TODO.md')
  const anchor = '| - [ ] | **M51-03** — Implement D20 MoonQL models and tenant-safe ARSY APIs'
  need(text.includes(anchor), 'M51-03 row')
  out('TODO.md', text.replace(anchor, anchor.replace('- [ ]', '- [x]')))
}

const wholeFiles = [
  'packages/moonql-isp/package.json',
  'packages/moonql-isp/tsconfig.json',
  'packages/moonql-isp/src/credentials.ts',
  'packages/moonql-isp/src/index.ts',
  'packages/moonql-isp/src/models.ts',
  'packages/moonql-isp/test/credentials.test.mjs',
  'packages/moonql-isp/test/models.test.mjs',
  'apps/arsy/package.json',
  'apps/arsy/tsconfig.json',
  'apps/arsy/src/addons.ts',
  'apps/arsy/test/isp.test.ts',
  'packages/moonql-client/src/generated.ts',
  'packages/moonql-client/src/schema-snapshot.json',
  'packages/moonql-client/src/schema-history.json',
  'docs/architecture/ISP_NETWORK.md',
]
for (const file of wholeFiles) out(file, work(file))

for (const [file, oid] of Object.entries(stash)) {
  execFileSync('git', ['cat-file', '-e', oid], { stdio: 'ignore' })
  const mode = (readFileSync(file).length > 0 && (statSync(file).mode & 0o111) !== 0) ? '100755' : '100644'
  execFileSync('git', ['update-index', '--add', '--cacheinfo', `${mode},${oid},${file}`], { stdio: 'inherit' })
}
process.stdout.write(`staged ${Object.keys(stash).length} ISP paths\n`)
