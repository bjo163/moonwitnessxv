import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { APPS, PORTED } from '../../scripts/apps.registry.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..', '..')
const appsDir = path.join(root, 'apps')

/** package name → directory on disk (dock/dock, hq/headquarters, ai/aigateway differ from tags). */
const dirsByPkg = new Map()
for (const entry of fs.readdirSync(appsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const manifestPath = path.join(appsDir, entry.name, 'package.json')
  if (!fs.existsSync(manifestPath)) continue
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  if (String(manifest.name ?? '').startsWith('@moonwitness/')) dirsByPkg.set(manifest.name, entry.name)
}

/** The Cockpit keeps its historical tag for the hub. */
const COCKPIT_TAG = { arsy: 'radio' }

test('every workspace app is listed in the registry', () => {
  const missing = []
  for (const [pkg, dir] of dirsByPkg) {
    if (!APPS.some((app) => app.pkg === pkg)) missing.push(`${dir} (${pkg})`)
  }
  assert.deepEqual(
    missing,
    [],
    'an app that is not in scripts/apps.registry.mjs is invisible to pnpm dev, pnpm ports:free and pnpm apps',
  )
})

test('every runnable entry has a real dev script', () => {
  const broken = []
  for (const app of APPS.filter((candidate) => candidate.dev)) {
    const dir = dirsByPkg.get(app.pkg)
    assert.ok(dir, `${app.tag}: package ${app.pkg} does not exist on disk`)
    const manifest = JSON.parse(fs.readFileSync(path.join(appsDir, dir, 'package.json'), 'utf8'))
    if (!manifest.scripts?.dev) broken.push(app.tag)
  }
  assert.deepEqual(broken, [], 'pnpm dev would spawn an entry that has no dev script')
})

test('a scaffold is listed, never spawned and never supervised', () => {
  for (const app of APPS.filter((candidate) => !candidate.dev)) {
    assert.equal(app.supervised, false, `${app.tag} cannot be supervision without a dev script`)
    assert.ok(app.note, `${app.tag} must state why it is not runnable`)
    // Go or other non-Node services may bind a port even without a Node dev script
    if (app.kind !== 'service') {
      assert.equal(app.port, undefined, `${app.tag} must not claim a port it cannot bind`)
    }
  }
})

test('the Cockpit supervises every supervised app except itself', () => {
  const configSource = fs.readFileSync(path.join(appsDir, 'cockpit', 'src', 'config.ts'), 'utf8')
  const tags = new Set([...configSource.matchAll(/tag: '([a-z-]+)'/g)].map((match) => match[1]))
  const missing = []
  for (const app of APPS.filter((candidate) => candidate.supervised)) {
    const expected = COCKPIT_TAG[app.tag] ?? app.tag
    if (!tags.has(expected)) missing.push(`${app.tag} (expected tag '${expected}')`)
  }
  assert.deepEqual(missing, [], 'a supervised app missing from apps/cockpit/src/config.ts cannot be controlled from the console')
  assert.equal(tags.has('cockpit'), false, 'the console must not supervise itself')
})

test('no two apps claim the same port', () => {
  const ports = PORTED.map((app) => app.port)
  assert.equal(new Set(ports).size, ports.length, 'duplicate ports would make the sweeper kill the wrong service')
})

test('apps/api stays a husk or becomes a registered app', () => {
  const husk = path.join(appsDir, 'api')
  if (!fs.existsSync(husk)) return
  assert.equal(
    fs.existsSync(path.join(husk, 'package.json')),
    false,
    'apps/api now has a manifest — register it in scripts/apps.registry.mjs instead of leaving it half-real',
  )
})
