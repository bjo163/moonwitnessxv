import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import assert from 'node:assert/strict'

const app = join(dirname(fileURLToPath(import.meta.url)), '..')
const root = join(app, '..', '..')
const read = (path) => readFileSync(join(root, path), 'utf8')

test('Empire chrome declares the Empire mark variant', () => {
  const copy = read('apps/empire-web/src/lib/site-copy.ts')
  assert.match(copy, /mark:\s*'empire'/)
})

test('Empire favicon colors stay aligned with dark MoonUI tokens', () => {
  const tokens = read('packages/moonui/src/tokens.ts')
  const block = /empire:\s*\{([\s\S]*?)\n\s*\},/.exec(tokens)?.[1]
  assert.ok(block, 'dark Empire palette must exist')
  const token = (name) => {
    const value = new RegExp(`\\b${name}:\\s*'([^']+)'`).exec(block)?.[1]
    assert.ok(value, `dark Empire palette must define ${name}`)
    return value
  }
  const favicon = read('apps/empire-web/src/app/icon.svg')
  assert.match(favicon, /<title[^>]*>Empire of the Light/)
  assert.ok(favicon.includes(`fill="${token('bg')}"`), 'favicon ground must match Empire background')
  assert.ok(favicon.includes(`fill="${token('brand')}"`), 'favicon mark must match Empire gold')
  assert.ok(favicon.includes(`stroke="${token('brandSoft')}"`), 'favicon orbital highlight must match Empire soft gold')
  assert.ok(favicon.includes(`fill="${token('brand2')}"`), 'favicon signal must match Empire red')
})
