import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { URL } from 'node:url'
import { planFiles } from '../../scripts/app-create.mjs'

const repoRoot = new URL('../../', import.meta.url)

function generatedFrontendFiles() {
  return planFiles('factory-frontend', 'frontend')
}

test('generated frontend is a Vite workspace member with no Next runtime artifacts', () => {
  const files = generatedFrontendFiles()
  const byPath = new Map(files.map((file) => [file.relPath.replaceAll('\\', '/'), file.content]))
  const packageJson = JSON.parse(byPath.get('apps/factory-frontend/package.json'))

  assert.equal(packageJson.scripts.build, 'vite build')
  assert.ok(byPath.has('apps/factory-frontend/vite.config.ts'))
  assert.ok(byPath.has('apps/factory-frontend/index.html'))
  assert.ok(!byPath.has('apps/factory-frontend/next.config.mjs'))
  assert.ok(!byPath.has('apps/factory-frontend/.next'))
})

test('Dockerfile.web accepts the existing Next apps and requires Next build output at runtime', async () => {
  const [dockManifest, hqManifest, dockerfile] = await Promise.all([
    readFile(new URL('apps/dock/package.json', repoRoot), 'utf8').then(JSON.parse),
    readFile(new URL('apps/headquarters/package.json', repoRoot), 'utf8').then(JSON.parse),
    readFile(new URL('Dockerfile.web', repoRoot), 'utf8'),
  ])

  for (const manifest of [dockManifest, hqManifest]) {
    assert.equal(manifest.scripts.build, 'next build')
    assert.match(manifest.scripts.start, /^next start\b/)
  }
  assert.match(dockerfile, /COPY --from=build \/repo\/apps\/\$\{APP\}\/next\.config\.mjs/)
  assert.match(dockerfile, /COPY --from=build \/repo\/apps\/\$\{APP\}\/\.next apps\/\$\{APP\}\/\.next/)
  assert.match(dockerfile, /\.\/node_modules\/\.bin\/next start -p \$\{APP_PORT\}/)
})

test('negative mapping: the generated Vite app does not satisfy Dockerfile.web Next requirements', async () => {
  const files = generatedFrontendFiles()
  const generatedPaths = new Set(files.map((file) => file.relPath.replaceAll('\\', '/')))
  const dockerfile = await readFile(new URL('Dockerfile.web', repoRoot), 'utf8')

  assert.ok(!generatedPaths.has('apps/factory-frontend/next.config.mjs'))
  assert.ok(!generatedPaths.has('apps/factory-frontend/.next'))
  assert.match(dockerfile, /next\.config\.mjs/)
  assert.match(dockerfile, /apps\/\$\{APP\}\/\.next/)
  assert.match(dockerfile, /next start/)
})
