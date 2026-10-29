import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import assert from 'node:assert/strict'

const app = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path) => readFileSync(join(app, path), 'utf8')

test('Indonesian and English public routes exist', () => {
  assert.ok(existsSync(join(app, 'src/app/id/page.tsx')))
  assert.ok(existsSync(join(app, 'src/app/en/page.tsx')))
})
test('preview does not claim launched or expose private API credentials', () => {
  const copy = read('src/lib/copy.ts')
  assert.match(copy, /CODE EXISTS/)
  assert.match(copy, /PLANNED/)
  assert.doesNotMatch(copy, /NEXT_PUBLIC_.*(?:SECRET|TOKEN|KEY)/)
  assert.doesNotMatch(read('src/components/Landing.tsx'), /fetch\s*\(/)
})
test('preview stays noindex until editorial and security approval', () => {
  assert.match(read('src/app/robots.ts'), /disallow:\s*'\/'/)
  assert.match(read('src/app/layout.tsx'), /index:\s*false/)
})
test('static export has no duplicate API or login', () => {
  assert.match(read('next.config.mjs'), /output:\s*'export'/)
  assert.equal(existsSync(join(app, 'src/app/api')), false)
})
