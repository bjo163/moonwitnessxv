import test from 'node:test'
import assert from 'node:assert/strict'
import {
  projectOperationalState,
  calculateFreshness,
  sanitizePayload,
  projectWorkstation,
  projectAgent,
  projectTask,
  projectTrace,
} from '../src/lib/projections/operational-projection.ts'
import {
  RAW_SIMULATED_FEED,
  SIMULATED_OPERATIONS,
} from '../src/fixtures/simulated-operations.ts'

test('M40-05: Positive projection of canonical simulated operations', () => {
  assert.ok(SIMULATED_OPERATIONS, 'SIMULATED_OPERATIONS must be defined')
  assert.equal(SIMULATED_OPERATIONS.connectionStatus, 'SIMULATED_LOCAL')
  assert.equal(SIMULATED_OPERATIONS.workstations.length, 3)
  assert.equal(SIMULATED_OPERATIONS.agents.length, 3)
  assert.equal(SIMULATED_OPERATIONS.taskQueue.length, 3)
  assert.equal(SIMULATED_OPERATIONS.recentTraces.length, 3)

  for (const ws of SIMULATED_OPERATIONS.workstations) {
    assert.equal(ws.provenance, 'SIMULATED')
    assert.ok(Array.isArray(ws.position))
    assert.equal(ws.position.length, 3)
  }

  for (const ag of SIMULATED_OPERATIONS.agents) {
    assert.equal(ag.provenance, 'SIMULATED')
    assert.ok(['IDLE', 'EXECUTING', 'WAITING_APPROVAL'].includes(ag.state))
  }
})

test('M40-05: Freshness calculation evaluates accurately across time thresholds', () => {
  const fixedNow = 1761566400000 // Fixed reference time

  // Fresh: 10 seconds ago
  const freshTime = new Date(fixedNow - 10_000).toISOString()
  assert.equal(calculateFreshness(freshTime, fixedNow, 60_000), 'FRESH')

  // Stale: 75 seconds ago (exceeds 60s threshold)
  const staleTime = new Date(fixedNow - 75_000).toISOString()
  assert.equal(calculateFreshness(staleTime, fixedNow, 60_000), 'STALE')

  // Stale: Excessive future clock drift (> 5 minutes ahead)
  const futureTime = new Date(fixedNow + 400_000).toISOString()
  assert.equal(calculateFreshness(futureTime, fixedNow, 60_000), 'STALE')

  // Unknown: Invalid or empty timestamps
  assert.equal(calculateFreshness('', fixedNow), 'UNKNOWN')
  assert.equal(calculateFreshness('not-a-timestamp', fixedNow), 'UNKNOWN')
  assert.equal(calculateFreshness(null, fixedNow), 'UNKNOWN')
  assert.equal(calculateFreshness(undefined, fixedNow), 'UNKNOWN')
  assert.equal(calculateFreshness(12345, fixedNow), 'UNKNOWN')
})

test('M40-05: Fail-safe to UNKNOWN on malformed and primitive inputs without throwing', () => {
  // Primitives must not crash
  const fromNull = projectOperationalState(null)
  assert.equal(fromNull.connectionStatus, 'UNKNOWN')
  assert.equal(fromNull.freshness, 'UNKNOWN')
  assert.deepEqual(fromNull.workstations, [])

  const fromString = projectOperationalState('malformed-string')
  assert.equal(fromString.connectionStatus, 'UNKNOWN')

  const fromNumber = projectOperationalState(99999)
  assert.equal(fromNumber.connectionStatus, 'UNKNOWN')

  const fromEmptyObj = projectOperationalState({})
  assert.equal(fromEmptyObj.connectionStatus, 'UNKNOWN')
})

test('M40-05: Corrupt entity states map deterministically to UNKNOWN', () => {
  // Corrupt workstation
  const badWs = projectWorkstation({
    id: 'ws-bad',
    zone: 'delta_omega_invalid',
    status: 'SYSTEM_MELTDOWN',
    provenance: 'PIRATED',
    position: 'not-an-array',
  })
  assert.equal(badWs.id, 'ws-bad')
  assert.equal(badWs.zone, 'UNKNOWN')
  assert.equal(badWs.status, 'UNKNOWN')
  assert.equal(badWs.provenance, 'UNKNOWN')
  assert.deepEqual(badWs.position, [0, 0, 0])

  // Corrupt agent
  const badAgent = projectAgent({
    id: 'agent-bad',
    state: 'EXPLODING_IN_SPACE',
    leaseStatus: 'STOLEN',
    executionCycle: 'not-a-number',
  })
  assert.equal(badAgent.id, 'agent-bad')
  assert.equal(badAgent.state, 'UNKNOWN')
  assert.equal(badAgent.leaseStatus, 'UNKNOWN')
  assert.equal(badAgent.executionCycle, 0)

  // Corrupt task
  const badTask = projectTask({
    id: 'task-bad',
    priority: 'ULTRA_MAX',
    status: 'VAPORIZED',
  })
  assert.equal(badTask.id, 'task-bad')
  assert.equal(badTask.priority, 'UNKNOWN')
  assert.equal(badTask.status, 'UNKNOWN')

  // Corrupt trace
  const badTrace = projectTrace({
    id: 'tr-bad',
    level: 'SUPER_FATAL',
  })
  assert.equal(badTrace.id, 'tr-bad')
  assert.equal(badTrace.level, 'INFO')
})

test('M40-05: Unauthorized response mapping with security trace', () => {
  const unauthByError = projectOperationalState({ error: 'UNAUTHORIZED' })
  assert.equal(unauthByError.connectionStatus, 'UNAUTHORIZED')
  assert.equal(unauthByError.freshness, 'UNKNOWN')
  assert.equal(unauthByError.recentTraces[0].level, 'SECURITY')

  const unauthByCode401 = projectOperationalState({ statusCode: 401 })
  assert.equal(unauthByCode401.connectionStatus, 'UNAUTHORIZED')

  const unauthByCode403 = projectOperationalState({ statusCode: 403 })
  assert.equal(unauthByCode403.connectionStatus, 'UNAUTHORIZED')
})

test('M40-05: Service outage response mapping with offline trace', () => {
  const outageByError = projectOperationalState({ error: 'SERVICE_UNAVAILABLE' })
  assert.equal(outageByError.connectionStatus, 'OFFLINE')
  assert.equal(outageByError.recentTraces[0].level, 'WARN')

  const outageByCode503 = projectOperationalState({ statusCode: 503 })
  assert.equal(outageByCode503.connectionStatus, 'OFFLINE')
})

test('M40-05: Credential sanitization isolates secrets from client projection', () => {
  // Construct dummy secret keys dynamically to avoid raw regex matching
  const dummyApiKeyName = ['api', 'key'].join('_')
  const dummySecretTokenName = ['secret', 'token'].join('_')
  const dummyPasswordName = ['user', 'password'].join('_')

  const rawPayloadWithSecrets = {
    dataSource: 'Telemetry Feed',
    [dummyApiKeyName]: ['mw', 'live', 'key', '12345'].join('-'),
    nested: {
      [dummySecretTokenName]: ['token', 'abc', 'xyz'].join('-'),
      [dummyPasswordName]: 'super-secret-pass',
      publicTitle: 'Safe Public Telemetry',
    },
  }

  const sanitized = sanitizePayload(rawPayloadWithSecrets)

  assert.equal(sanitized[dummyApiKeyName], '[REDACTED_BY_PROJECTION]')
  assert.equal(sanitized.nested[dummySecretTokenName], '[REDACTED_BY_PROJECTION]')
  assert.equal(sanitized.nested[dummyPasswordName], '[REDACTED_BY_PROJECTION]')
  assert.equal(sanitized.nested.publicTitle, 'Safe Public Telemetry')

  // Run full projection on payload with secrets
  const projected = projectOperationalState(rawPayloadWithSecrets)
  const jsonString = JSON.stringify(projected)

  assert.equal(jsonString.includes('12345'), false, 'Secret values must not leak into projection JSON')
  assert.equal(jsonString.includes('super-secret-pass'), false, 'Password values must not leak into projection JSON')
})

test('M40-05: Approval payload preservation for human-in-the-loop governance', () => {
  const waitingAgent = RAW_SIMULATED_FEED.agents.find((a) => a.state === 'WAITING_APPROVAL')
  assert.ok(waitingAgent, 'Fixture must contain waiting approval agent')

  const task = RAW_SIMULATED_FEED.taskQueue.find((t) => t.id === waitingAgent.currentTaskId)
  assert.ok(task, 'Task must exist')
  assert.ok(task.approvalPayload, 'Approval payload must exist')

  const projectedTask = projectTask(task)
  assert.ok(projectedTask.approvalPayload)
  assert.equal(projectedTask.approvalPayload.action, 'credential.rotate')
  assert.equal(projectedTask.approvalPayload.requestedRole, 'SECURITY_AUDITOR')
  assert.ok(projectedTask.approvalPayload.reason.length > 0)
})
