/**
 * apps/orbit/test/orbit-approval-handoff.test.mjs
 *
 * M40-08 — Human-approval handoff to Headquarters / 100CENTER.
 *
 * The handoff is a link with no authority: ORBIT may display that the API
 * marked a task approval-required and it may point at the 100CENTER review
 * surface, but it may never decide, steer, or claim delivery. These tests hold
 * that line on both the pure contract and the source boundary.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import {
  buildApprovalHandoff,
  isApprovalRequired,
} from '../src/lib/handoff/approval-handoff.ts'
import {
  resolveReviewSurface,
  validateReviewOrigin,
  LOOPBACK_REVIEW_SURFACE,
} from '../src/lib/server/review-surface.ts'
import { SIMULATED_OPERATIONS } from '../src/fixtures/simulated-operations.ts'
import { orbitCopy } from '../src/lib/orbit-copy.ts'

const appRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const read = (relative) => readFileSync(join(appRoot, relative), 'utf8')

const SURFACE = { available: true, origin: 'https://hq.example.test' }
const approvalTask = (overrides = {}) => ({
  id: 'task-sec-401',
  title: 'Rotate leaked credential',
  priority: 'CRITICAL',
  status: 'APPROVAL_REQUIRED',
  provenance: 'LIVE',
  assignedAgentId: 'agent-lumen-01',
  createdAt: '2026-10-27T12:00:00.000Z',
  approvalPayload: {
    action: 'credential.rotate',
    requestedRole: 'SECURITY_AUDITOR',
    reason: 'Operator submitted a restricted action.',
  },
  ...overrides,
})

test('M40-08: approval-required is read from the record, never inferred', () => {
  assert.equal(isApprovalRequired(approvalTask()), true)
  assert.equal(isApprovalRequired(approvalTask({ status: 'RUNNING' })), false)
  assert.equal(isApprovalRequired(approvalTask({ status: 'QUEUED' })), false)
  assert.equal(isApprovalRequired({ ...approvalTask(), approvalPayload: undefined }), false)
  assert.equal(
    isApprovalRequired({ ...approvalTask(), approvalPayload: { action: '  ', requestedRole: 'X', reason: 'y' } }),
    false,
    'a blank action is not an approval request',
  )
})

test('M40-08: positive handoff builds a validated 100CENTER review link', () => {
  const handoff = buildApprovalHandoff(approvalTask(), {
    connectionStatus: 'LIVE_CONNECTED',
    reviewSurface: SURFACE,
  })
  assert.equal(handoff.status, 'AWAITING_HUMAN_REVIEW')
  assert.ok(handoff.reviewUrl, 'a verified session with a review surface gets a link')
  assert.ok(handoff.reviewUrl.startsWith('https://hq.example.test/review?'), handoff.reviewUrl)
  const parsed = new URL(handoff.reviewUrl)
  assert.equal(parsed.origin, 'https://hq.example.test')
  assert.equal(parsed.pathname, '/review')
  assert.equal(parsed.searchParams.get('task'), 'task-sec-401')
  assert.equal(parsed.searchParams.get('role'), 'SECURITY_AUDITOR')
  assert.equal(handoff.simulated, false)
})

test('M40-08: no handoff is offered when the task does not require approval', () => {
  const handoff = buildApprovalHandoff(approvalTask({ status: 'RUNNING' }), {
    connectionStatus: 'LIVE_CONNECTED',
    reviewSurface: SURFACE,
  })
  assert.equal(handoff.status, 'NOT_REQUIRED')
  assert.equal(handoff.reviewUrl, undefined, 'an unrequested task must not get a review CTA')
})

test('M40-08: unverified session denies the handoff instead of faking one', () => {
  for (const connectionStatus of ['UNAUTHORIZED', 'OFFLINE', 'UNKNOWN']) {
    const handoff = buildApprovalHandoff(approvalTask(), { connectionStatus, reviewSurface: SURFACE })
    assert.equal(handoff.status, 'UNAVAILABLE', `${connectionStatus} must deny the handoff`)
    assert.equal(handoff.reviewUrl, undefined, `${connectionStatus} must not render a link`)
  }
})

test('M40-08: invalid redirect targets are refused by the origin validator', () => {
  const cases = [
    ['javascript:alert(1)', 'ORIGIN_SCHEME_UNSUPPORTED'],
    ['data:text/html;base64,PHNjcmlwdD4=', 'ORIGIN_SCHEME_UNSUPPORTED'],
    ['file:///etc/passwd', 'ORIGIN_SCHEME_UNSUPPORTED'],
    ['http://admin:p@ss@hq.example.test', 'ORIGIN_CREDENTIALS_FORBIDDEN'],
    ['not a url', 'ORIGIN_MALFORMED'],
    ['', 'ORIGIN_UNRESOLVED'],
    ['   ', 'ORIGIN_UNRESOLVED'],
    [undefined, 'ORIGIN_UNRESOLVED'],
  ]
  for (const [raw, code] of cases) {
    const surface = validateReviewOrigin(raw)
    assert.equal(surface.available, false, `${String(raw)} must not be usable`)
    assert.equal(surface.denial, code, `${String(raw)} → ${code}`)
    assert.equal(surface.origin, undefined, 'a denied target carries no origin')
  }
})

test('M40-08: a denied origin cannot be bypassed by a poisoned payload', () => {
  const hostile = approvalTask({
    approvalPayload: {
      action: 'credential.rotate',
      requestedRole: 'SECURITY_AUDITOR',
      reason: 'click http://evil.test/ to finish',
      reviewUrl: 'javascript:alert(1)',
      href: 'http://evil.test',
    },
  })
  const handoff = buildApprovalHandoff(hostile, {
    connectionStatus: 'LIVE_CONNECTED',
    reviewSurface: SURFACE,
  })
  assert.equal(new URL(handoff.reviewUrl).origin, 'https://hq.example.test')
  assert.ok(!handoff.reviewUrl.includes('evil.test'), 'payload text must never reach the target')
  assert.ok(!handoff.reviewUrl.includes('javascript:'), 'payload text must never reach the target')

  const noSurface = buildApprovalHandoff(hostile, {
    connectionStatus: 'LIVE_CONNECTED',
    reviewSurface: { available: false, denial: 'ORIGIN_SCHEME_UNSUPPORTED' },
  })
  assert.equal(noSurface.status, 'UNAVAILABLE')
  assert.equal(noSurface.denial, 'ORIGIN_SCHEME_UNSUPPORTED')
  assert.equal(noSurface.reviewUrl, undefined)
})

test('M40-08: review surface is server-resolved and defaults to 100CENTER, not the hub', () => {
  assert.deepEqual(resolveReviewSurface({}), LOOPBACK_REVIEW_SURFACE)
  assert.equal(LOOPBACK_REVIEW_SURFACE.available, true)
  const parsed = new URL(LOOPBACK_REVIEW_SURFACE.origin)
  assert.equal(parsed.port, '3002', '100CENTER owns the review surface, the hub does not')
  assert.equal(resolveReviewSurface({ NEXT_PUBLIC_HEADQUARTERS_URL: '' }).available, false)
  assert.equal(
    resolveReviewSurface({ NEXT_PUBLIC_HEADQUARTERS_URL: 'https://hq.moonwitness.test/' }).origin,
    'https://hq.moonwitness.test',
  )
})

test('M40-08: simulated fixtures label themselves and never claim a live queue', () => {
  const simulated = SIMULATED_OPERATIONS.taskQueue.find((t) => t.status === 'APPROVAL_REQUIRED')
  assert.ok(simulated, 'the fixture set must contain an approval-required task')
  const handoff = buildApprovalHandoff(simulated, {
    connectionStatus: 'SIMULATED_LOCAL',
    reviewSurface: SIMULATED_OPERATIONS.reviewSurface,
  })
  assert.equal(handoff.status, 'AWAITING_HUMAN_REVIEW')
  assert.equal(handoff.simulated, true, 'a fixture handoff is marked simulated')
  assert.ok(
    read('src/components/OrbitNodeInspector.tsx').includes('handoffNoLiveQueue'),
    'the inspector must state that no live review queue is connected',
  )
})

test('M40-08: every projected state carries the server-validated review surface', () => {
  const client = read('src/lib/server/arsy-runtime-client.ts')
  assert.match(client, /const reviewSurface = resolveReviewSurface\(env\)/)
  for (const site of [
    'buildOfflineState(\'UNKNOWN_HUB\', now, err instanceof Error ? err.message : String(err), reviewSurface)',
    'buildUnauthorizedState(hubUrl, now, response.status, reviewSurface)',
    'buildOfflineState(hubUrl, now, errorMsg, reviewSurface)',
    'reviewSurface,\n      })',
    'reviewSurface,\n    }\n  } catch',
  ]) {
    assert.ok(client.includes(site), `missing handoff surface wiring: ${site.split('\n')[0]}`)
  }
  assert.equal(SIMULATED_OPERATIONS.reviewSurface.available, true)
})

test('M40-08: ORBIT owns no review engine — no decision path, no mutating call, no hardcoded target', () => {
  const files = []
  const walk = (dir) => {
    for (const entry of readdirSync(join(appRoot, dir), { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (/\.(ts|tsx)$/.test(entry.name)) files.push(path)
    }
  }
  walk('src')

  const mutating = files.filter((file) => {
    const source = read(file)
    return /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/.test(source) ||
      /\.(post|put|patch|delete)\s*\(/.test(source)
  })
  assert.deepEqual(mutating, [], 'the observation boundary must never write')

  const decisionPath = files.filter((file) =>
    /\b(approveTask|rejectTask|castDecision|submitApproval|autoPublish)\s*\(/.test(read(file)))
  assert.deepEqual(decisionPath, [], 'no approval, rejection or publication may be executed from ORBIT')

  const hardcoded = files.filter((file) => /href=["']https?:\/\/(localhost|127\.0\.0\.1)/.test(read(file)))
  assert.deepEqual(hardcoded, [], 'cross-app targets come from the validated surface, not literals')

  const envInClient = files
    .filter((file) => file.startsWith(join('src', 'components')) || file.startsWith(join('src', 'app')))
    .filter((file) => read(file).includes('process.env'))
  assert.deepEqual(envInClient, [], 'client components must not read configuration')

  const apiFiles = readdirSync(join(appRoot, 'src/app/api/ops/state'))
  assert.deepEqual(apiFiles, ['route.ts'], 'ORBIT exposes only its read-only state route')
  assert.equal(read('src/app/api/ops/state/route.ts').includes('export async function POST'), false)
})

test('M40-08: handoff copy exists in en and id with identical key sets', () => {
  const en = Object.keys(orbitCopy('en')).sort()
  const id = Object.keys(orbitCopy('id')).sort()
  assert.deepEqual(en, id, 'locale parity is required for every ORBIT string')
  for (const key of [
    'handoffCta',
    'handoffBoundaryNotice',
    'handoffNoLiveQueue',
    'handoffUnavailable',
    'handoffRoleLabel',
    'handoffReasonLabel',
  ]) {
    assert.ok(en.includes(key), `${key} must exist in both locales`)
    assert.notEqual(orbitCopy('en')[key], orbitCopy('id')[key], `${key} must be translated`)
  }
})

test('M40-08: the handoff is stated as a boundary in the rendered markup', () => {
  const inspector = read('src/components/OrbitNodeInspector.tsx')
  const workspace = read('src/components/OrbitOperationsWorkspace.tsx')
  for (const source of [inspector, workspace]) {
    assert.ok(source.includes('buildApprovalHandoff'), 'handoff must be derived from the shared contract')
    assert.ok(source.includes('handoffBoundaryNotice'), 'the no-decision boundary is stated to the operator')
  }
  assert.ok(inspector.includes("rel=\"noopener noreferrer\""), 'the cross-app link is isolated from the opener')
  assert.ok(!inspector.includes('approvalPayload &&'), 'approval display must not read raw payload truth directly')
  assert.ok(workspace.includes('handoffContext'), 'the surface and session come from the projection')
  assert.ok(read('src/app/globals.css').includes('.orbit-handoff-link:focus-visible'), 'the link is keyboard visible')
})
