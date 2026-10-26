import assert from 'node:assert/strict'
import test from 'node:test'
import { cliMessage, formatServiceStatusLine, printHelp, resolveCliLocale, runCli } from '@moonwitness/cli'
import { formatPlanNotice, type WritePlan } from '../src/tools/gen-sdk.js'

test('M05-23 shared CLI locale selection defaults safely and preserves command arguments', () => {
  assert.deepEqual(resolveCliLocale(['help'], undefined), { ok: true, locale: 'en', args: ['help'] })
  assert.deepEqual(resolveCliLocale(['--locale', 'id', 'status'], 'en'), { ok: true, locale: 'id', args: ['status'] })
  assert.deepEqual(resolveCliLocale(['status', '--locale=en'], 'id'), { ok: true, locale: 'en', args: ['status'] })
  assert.deepEqual(resolveCliLocale(['help'], 'fr'), { ok: true, locale: 'en', args: ['help'] })
  assert.deepEqual(resolveCliLocale(['--locale'], 'id'), { ok: false, locale: 'id', error: 'missing' })
  assert.deepEqual(resolveCliLocale(['--locale', 'id-ID', 'help'], 'id'), {
    ok: false,
    locale: 'id',
    error: 'unsupported',
    value: 'id-ID',
  })
})

test('M05-23 CLI help localizes human copy while command and option identifiers remain stable', () => {
  const output: string[] = []
  const originalInfo = console.info
  console.info = (message?: unknown) => output.push(String(message ?? ''))
  try {
    printHelp('id')
    printHelp('en')
  } finally {
    console.info = originalInfo
  }

  assert.match(output[0] ?? '', /Perintah:/)
  assert.match(output[0] ?? '', /Jalankan rangkaian verifikasi monorepo/)
  assert.match(output[0] ?? '', /moon <command> \[options\]/)
  assert.match(output[0] ?? '', /--locale <id\|en>/)
  assert.match(output[0] ?? '', /3000, 3001, 3002, 3003, 3004/)
  assert.match(output[1] ?? '', /Commands:/)
  assert.match(output[1] ?? '', /ONLINE\/OFFLINE/)
})

test('M05-23 command errors are localized and keep the failure exit code', async () => {
  const errors: string[] = []
  const originalError = console.error
  const originalExitCode = process.exitCode
  console.error = (message?: unknown) => errors.push(String(message ?? ''))
  try {
    await runCli(['--locale', 'id', 'not-a-command'])
    assert.equal(process.exitCode, 1)
    await runCli(['not-a-command', '--locale', 'en'])
    assert.equal(process.exitCode, 1)
    await runCli(['status', '--locale', 'fr'])
    assert.equal(process.exitCode, 1)
  } finally {
    console.error = originalError
    process.exitCode = originalExitCode
  }

  assert.match(errors[0] ?? '', /Perintah tidak dikenal/)
  assert.match(errors[1] ?? '', /Unknown command/)
  assert.match(errors[2] ?? '', /Unsupported locale "fr"/)
})

test('M05-23 status rows translate labels but preserve port, status token and endpoint format', () => {
  const service = { status: 'OFFLINE' as const, port: 3000, name: 'Radio Core Hub (ARSY)', url: 'http://127.0.0.1:3000' }
  const indonesian = formatServiceStatusLine(service, 'id')
  const english = formatServiceStatusLine(service, 'en')

  assert.match(indonesian, /\[:3000\] Hub Inti Radio \(ARSY\).* -> OFFLINE \(http:\/\/127\.0\.0\.1:3000\)/)
  assert.match(english, /\[:3000\] Radio Core Hub \(ARSY\).* -> OFFLINE \(http:\/\/127\.0\.0\.1:3000\)/)
})

test('M05-23 SDK generator notices localize actionable copy and preserve contract controls', () => {
  const refused: WritePlan = { write: false, breaking: ['view stationCatalog removed'], reason: 'breaking' }
  const accepted: WritePlan = { write: true, breaking: ['view stationCatalog removed'], reason: 'breaking' }

  const idReason = formatPlanNotice('id', refused, '1.0.0', '1.0.0', { allowBreaking: false }) ?? ''
  const enReason = formatPlanNotice('en', refused, '1.0.0', '1.0.0', { allowBreaking: false }) ?? ''
  assert.match(idReason, /API_VERSION major yang lebih tinggi/)
  assert.match(idReason, /--allow-breaking/)
  assert.match(enReason, /higher API_VERSION major/)
  assert.match(enReason, /--allow-breaking/)

  const approved = formatPlanNotice('id', accepted, '1.0.0', '2.0.0', { allowBreaking: true }) ?? ''
  assert.match(approved, /API major 1 -> 2/)
  assert.equal(cliMessage('id', 'sdkDrift', { path: 'packages/moonql-client/src/generated.ts' }),
    'moonql: SDK berbeda — jalankan `pnpm gen:sdk` (packages/moonql-client/src/generated.ts)')
  assert.equal(cliMessage('en', 'sdkDrift', { path: 'packages/moonql-client/src/generated.ts' }),
    'moonql: SDK drift — run `pnpm gen:sdk` (packages/moonql-client/src/generated.ts)')
  assert.match(cliMessage('id', 'sdkSnapshotMissing', { path: 'snapshot.json' }), /snapshot skema belum ada/)
  assert.match(cliMessage('en', 'sdkSnapshotMissing', { path: 'snapshot.json' }), /no committed schema snapshot/)
})
