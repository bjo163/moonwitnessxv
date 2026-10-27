/**
 * apps/orbit/test/orbit-queues-inspectors.test.mjs
 *
 * M40-07: Task queue, workstation and agent inspectors.
 *
 * Verifies:
 * 1. Pure filter helpers are deterministic and never fabricate records.
 * 2. Counts derived from the canonical projection are honest.
 * 3. Scene and 2D list resolve the same record ids (shared selection contract).
 * 4. Restricted / empty / failed states are safe and non-crashing.
 * 5. Keyboard-stable markup and ARIA contracts in the components.
 * 6. Locale parity for the new M40-07 copy keys.
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildOperationalQueues,
  filterTaskQueue,
  filterAgentQueue,
  filterWorkstationQueue,
  filterTraceQueue,
  resolveActiveTask,
  resolveAgentTraces,
  resolveAgentTasks,
  resolveWorkstationTraces,
  shouldDismissTaskInspectorOnKey,
  distinctZones,
  distinctAgentStates,
  distinctTaskStatuses,
  distinctTaskPriorities,
} from '../src/lib/queues/operational-queues.ts'
import { projectOperationalState } from '../src/lib/projections/operational-projection.ts'
import { SIMULATED_OPERATIONS, RAW_SIMULATED_FEED } from '../src/fixtures/simulated-operations.ts'
import { orbitCatalog } from '../src/lib/orbit-copy.ts'

const testDir = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(testDir, '..')

test('M40-07: buildOperationalQueues reports honest counts from the canonical projection', () => {
  const queues = buildOperationalQueues(SIMULATED_OPERATIONS)

  assert.equal(queues.counts.workstations, SIMULATED_OPERATIONS.workstations.length)
  assert.equal(queues.counts.agents, SIMULATED_OPERATIONS.agents.length)
  assert.equal(queues.counts.tasks, SIMULATED_OPERATIONS.taskQueue.length)
  assert.equal(queues.counts.traces, SIMULATED_OPERATIONS.recentTraces.length)

  // approvalRequired must equal the real APPROVAL_REQUIRED task count
  const realApproval = SIMULATED_OPERATIONS.taskQueue.filter(
    (t) => t.status === 'APPROVAL_REQUIRED'
  ).length
  assert.equal(queues.counts.approvalRequired, realApproval)
  assert.ok(realApproval > 0, 'fixture must contain an approval-required task')

  // Arrays are the same references/order as the projection: no re-ordering, no invention
  assert.deepEqual(queues.taskQueue.map((t) => t.id), SIMULATED_OPERATIONS.taskQueue.map((t) => t.id))
})

test('M40-07: duplicate projected ids fail closed for every ambiguous row', () => {
  const workstation = SIMULATED_OPERATIONS.workstations[0]
  const agent = SIMULATED_OPERATIONS.agents[0]
  const task = SIMULATED_OPERATIONS.taskQueue[0]
  const trace = SIMULATED_OPERATIONS.recentTraces[0]
  assert.ok(workstation && agent && task && trace)

  const queues = buildOperationalQueues({
    ...SIMULATED_OPERATIONS,
    workstations: [...SIMULATED_OPERATIONS.workstations, workstation],
    agents: [...SIMULATED_OPERATIONS.agents, { ...agent, id: workstation.id }],
    taskQueue: [...SIMULATED_OPERATIONS.taskQueue, { ...task }],
    recentTraces: [...SIMULATED_OPERATIONS.recentTraces, { ...trace }],
  })

  assert.equal(queues.identityConflictCount, 3)
  assert.equal(queues.workstations.some((record) => record.id === workstation.id), false)
  assert.equal(queues.agents.some((record) => record.id === workstation.id), false)
  assert.equal(queues.taskQueue.some((record) => record.id === task.id), false)
  assert.equal(queues.recentTraces.some((record) => record.id === trace.id), false)
  assert.ok(queues.workstations.length > 0, 'unambiguous records remain in source order')
  assert.ok(queues.taskQueue.length > 0)
  assert.ok(queues.recentTraces.length > 0)
})

test('M40-07: Escape dismisses a selected task inspector only', () => {
  assert.equal(shouldDismissTaskInspectorOnKey('Escape', 'task-sec-401'), true)
  assert.equal(shouldDismissTaskInspectorOnKey('Enter', 'task-sec-401'), false)
  assert.equal(shouldDismissTaskInspectorOnKey('Escape', null), false)
})

test('M40-07: filterTaskQueue matches status, priority, agent and search without fabricating', () => {
  const queues = buildOperationalQueues(SIMULATED_OPERATIONS)

  const approval = filterTaskQueue(queues.taskQueue, { status: 'APPROVAL_REQUIRED' })
  assert.ok(approval.length > 0)
  for (const t of approval) assert.equal(t.status, 'APPROVAL_REQUIRED')

  const critical = filterTaskQueue(queues.taskQueue, { priority: 'CRITICAL' })
  assert.ok(critical.length > 0)
  for (const t of critical) assert.equal(t.priority, 'CRITICAL')

  const byAgent = filterTaskQueue(queues.taskQueue, { assignedAgentId: 'agent-sentinel-01' })
  assert.ok(byAgent.length > 0)
  for (const t of byAgent) assert.equal(t.assignedAgentId, 'agent-sentinel-01')

  // Unassigned filter must return only unassigned records
  const unassigned = filterTaskQueue(queues.taskQueue, { assignedAgentId: null })
  for (const t of unassigned) assert.equal(t.assignedAgentId, null)

  // Search is a subset; never adds records
  const searched = filterTaskQueue(queues.taskQueue, { search: 'radar' })
  assert.ok(searched.length <= queues.taskQueue.length)
  assert.ok(searched.every((t) => queues.taskQueue.includes(t)))

  // No match yields an empty list, not a fallback invention
  assert.deepEqual(filterTaskQueue(queues.taskQueue, { search: 'zzz-no-such-record' }), [])

  // Empty filter returns the identical ordered set
  assert.deepEqual(filterTaskQueue(queues.taskQueue, {}), [...queues.taskQueue])
})

test('M40-07: filterAgentQueue and filterWorkstationQueue are deterministic subsets', () => {
  const queues = buildOperationalQueues(SIMULATED_OPERATIONS)

  const waiting = filterAgentQueue(queues.agents, { state: 'WAITING_APPROVAL' })
  assert.ok(waiting.length > 0)
  for (const a of waiting) assert.equal(a.state, 'WAITING_APPROVAL')

  const atStation = filterAgentQueue(queues.agents, { workstationId: 'ws-beta-01' })
  assert.ok(atStation.length > 0)
  for (const a of atStation) assert.equal(a.workstationId, 'ws-beta-01')

  const alphaWs = filterWorkstationQueue(queues.workstations, { zone: 'alpha' })
  assert.ok(alphaWs.length > 0)
  for (const ws of alphaWs) assert.equal(ws.zone, 'alpha')

  const offlineWs = filterWorkstationQueue(queues.workstations, { status: 'OFFLINE' })
  assert.equal(offlineWs.length, 0, 'no offline workstation in fixture; must not invent one')

  assert.deepEqual(filterAgentQueue(queues.agents, { search: 'Sentinel' }).map((agent) => agent.id), [
    'agent-sentinel-01',
  ])
  assert.deepEqual(filterWorkstationQueue(queues.workstations, { search: 'Station Beta' }).map((ws) => ws.id), [
    'ws-beta-01',
  ])

  // ALL sentinel behaves like no filter
  assert.equal(
    filterAgentQueue(queues.agents, { state: 'ALL' }).length,
    queues.agents.length
  )
})

test('M40-07: corrupt and absent inputs fail safe to UNKNOWN/empty rather than throwing', () => {
  const corrupt = projectOperationalState({
    connectionStatus: 'LIVE_CONNECTED',
    lastSyncTimestamp: 'not-a-time',
    workstations: [null, 'garbage', { id: 'ws-ok' }],
    agents: [{ id: 'ag-ok', state: 'TELEPORTING' }],
    taskQueue: [undefined, { id: 'task-ok', status: 'MELTED' }],
    recentTraces: 'not-an-array',
  })

  const queues = buildOperationalQueues(corrupt)
  assert.equal(queues.counts.traces, 0, 'non-array traces must not be counted as records')
  assert.ok(queues.workstations.some((ws) => ws.id === 'ws-ok'))
  assert.equal(queues.agents.find((a) => a.id === 'ag-ok').state, 'UNKNOWN')
  assert.equal(queues.taskQueue.find((t) => t.id === 'task-ok').status, 'UNKNOWN')

  // A projection with no records at all (e.g. UNAUTHORIZED) yields zeroed queues
  const unauth = projectOperationalState({ statusCode: 401 })
  const emptyQueues = buildOperationalQueues(unauth)
  assert.equal(emptyQueues.counts.tasks, 0)
  assert.equal(emptyQueues.counts.workstations, 0)
  assert.equal(emptyQueues.counts.approvalRequired, 0)
  assert.deepEqual(filterTaskQueue(emptyQueues.taskQueue, { status: 'QUEUED' }), [])

  // null/undefined inputs to the helpers never throw
  assert.deepEqual(filterTaskQueue([], { status: 'QUEUED' }), [])
  assert.deepEqual(resolveAgentTraces('agent-none', []), [])
  assert.deepEqual(distinctZones([]), [])
  assert.deepEqual(distinctAgentStates([]), [])
  assert.deepEqual(distinctTaskStatuses([]), [])
  assert.deepEqual(distinctTaskPriorities([]), [])
})

test('M40-07: scene and 2D list resolve the same record ids through shared selection', () => {
  const queues = buildOperationalQueues(SIMULATED_OPERATIONS)
  const allNodeIds = [
    ...queues.workstations.map((ws) => ws.id),
    ...queues.agents.map((a) => a.id),
  ]

  // Every id that the 3D scene renders is also resolvable by the 2D lists
  for (const id of allNodeIds) {
    const inWorkstations = queues.workstations.some((ws) => ws.id === id)
    const inAgents = queues.agents.some((a) => a.id === id)
    assert.ok(inWorkstations || inAgents, `${id} must resolve in exactly one collection`)
    assert.ok(!(inWorkstations && inAgents), `${id} must be unambiguous across collections`)
  }

  // Selecting an unknown id resolves to nothing (no fabricated detail panel)
  const phantom = queues.workstations.find((ws) => ws.id === 'ws-does-not-exist')
  assert.equal(phantom, undefined)
  assert.equal(resolveActiveTask({ currentTaskId: 'task-phantom' }, queues.taskQueue), null)
})

test('M40-07: agent activity derives only from real traces and real bound tasks', () => {
  const queues = buildOperationalQueues(SIMULATED_OPERATIONS)

  const lumen = queues.agents.find((a) => a.id === 'agent-lumen-01')
  assert.ok(lumen)

  // Active task resolution uses the canonical id link, never a placeholder
  const activeTask = resolveActiveTask(lumen, queues.taskQueue)
  assert.ok(activeTask, 'lumen agent must resolve its bound task')
  assert.equal(activeTask.id, lumen.currentTaskId)
  assert.equal(activeTask.status, 'APPROVAL_REQUIRED')
  assert.ok(activeTask.approvalPayload, 'approval payload must survive projection')

  // An IDLE agent with no current task truthfully reports no active task
  const echolog = queues.agents.find((a) => a.id === 'agent-echolog-01')
  assert.equal(resolveActiveTask(echolog, queues.taskQueue), null)

  // Traces are a subset of the canonical trace list and keep order
  const traces = resolveAgentTraces('lumen', queues.recentTraces)
  for (const t of traces) assert.ok(queues.recentTraces.includes(t))
  const indices = traces.map((t) => queues.recentTraces.indexOf(t))
  assert.deepEqual(indices, [...indices].sort((a, b) => a - b), 'canonical order preserved')

  // Unknown agent yields no activity instead of invented activity
  assert.deepEqual(resolveAgentTraces('agent-phantom-99', queues.recentTraces), [])
  assert.deepEqual(
    resolveAgentTraces('agent-lumen-01', [
      {
        id: 'tr-prefix-near-match',
        timestamp: '2026-10-27T12:00:00.000Z',
        level: 'INFO',
        source: 'agent-lumen-010',
        message: 'unrelated trace',
        provenance: 'SIMULATED',
      },
    ]),
    [],
    'a longer identifier prefix must not be attributed to the selected agent'
  )
})

test('M40-07: shared search filters traces and workstation activity preserves canonical order', () => {
  const queues = buildOperationalQueues(SIMULATED_OPERATIONS)
  assert.deepEqual(filterTraceQueue(queues.recentTraces, 'radar').map((trace) => trace.id), ['tr-002'])
  assert.deepEqual(filterTraceQueue(queues.recentTraces, 'no-such-trace'), [])
  assert.deepEqual(filterTraceQueue(queues.recentTraces, '  '), queues.recentTraces)

  const station = queues.workstations.find((ws) => ws.id === 'ws-alpha-01')
  assert.ok(station)
  const stationAgents = queues.agents.filter((agent) => station.agentIds.includes(agent.id))
  assert.deepEqual(resolveAgentTasks(stationAgents, queues.taskQueue).map((task) => task.id), ['task-sec-401'])
  assert.deepEqual(
    resolveWorkstationTraces(station, queues.recentTraces),
    [],
    'do not infer trace ownership without a canonical agent id in its source or message'
  )
  assert.deepEqual(resolveAgentTasks([], queues.taskQueue), [])
})

test('M40-07: distinct filter options are sorted, de-duplicated and projection-derived', () => {
  const queues = buildOperationalQueues(SIMULATED_OPERATIONS)

  const zones = distinctZones(queues.workstations)
  assert.deepEqual(zones, [...zones].sort())
  assert.equal(zones.length, new Set(zones).size)

  const states = distinctAgentStates(queues.agents)
  assert.deepEqual(states, [...states].sort())

  const statuses = distinctTaskStatuses(queues.taskQueue)
  assert.ok(statuses.includes('APPROVAL_REQUIRED'))
  assert.ok(statuses.includes('RUNNING'))

  const priorities = distinctTaskPriorities(queues.taskQueue)
  assert.ok(priorities.includes('CRITICAL'))

  // Filter options only ever contain values that exist in the projection
  for (const s of statuses) {
    assert.ok(queues.taskQueue.some((t) => t.status === s))
  }
})

test('M40-07: queue components exist and honour the accessibility + safe-state contract', () => {
  const barPath = resolve(appRoot, 'src/components/OrbitQueueFilterBar.tsx')
  const wsPath = resolve(appRoot, 'src/components/OrbitOperationsWorkspace.tsx')
  assert.ok(existsSync(barPath), 'OrbitQueueFilterBar.tsx must exist')

  const bar = readFileSync(barPath, 'utf8')
  const ws = readFileSync(wsPath, 'utf8')

  // Filter bar is an accessible search region with pressed-state chips
  assert.ok(bar.includes("role=\"search\""), 'filter bar must declare a search role')
  assert.ok(bar.includes('aria-expanded='), 'filter expansion must be announced')
  assert.ok(bar.includes('aria-controls="orbit-advanced-filters"'), 'filter toggle controls the advanced filters')
  assert.ok(bar.includes('aria-label={copy.queueFiltersHeading}'), 'filter toggle has a stable accessible name')
  assert.ok(bar.includes('aria-pressed='), 'filter chips must report pressed state')
  assert.ok(bar.includes("type=\"search\""), 'search input must use the search type')
  assert.ok(bar.includes('role="group"'), 'chip groups must be labelled')

  // Workspace consumes the pure queue helpers (single source of truth)
  for (const fn of [
    'buildOperationalQueues',
    'filterTaskQueue',
    'filterAgentQueue',
    'filterWorkstationQueue',
    'resolveActiveTask',
    'resolveAgentTraces',
    'filterTraceQueue',
    'resolveAgentTasks',
    'resolveWorkstationTraces',
    'shouldDismissTaskInspectorOnKey',
  ]) {
    assert.ok(ws.includes(fn), `workspace must use ${fn} from the pure queue layer`)
  }

  // Empty/restricted/failed states are explicit, never silent
  assert.ok(ws.includes('copy.queueEmptyState'), 'empty filtered state must render honest notice')
  assert.ok(ws.includes('copy.queueFailedState'), 'failed state must render diagnosis notice')
  assert.ok(ws.includes('data.errorMessage'), 'error details feed a safe generic failure notice')
  assert.ok(ws.includes('selectedTaskId'), 'task rows have a selectable inspector')
  assert.ok(ws.includes('queues.identityConflictCount'), 'runtime duplicate ids show an explicit notice')
  assert.ok(ws.includes('const displayData = isRestricted'), 'denied projections are cleared before rendering the scene')
  assert.ok(ws.includes('data={displayData}'), 'scene receives only the safe projection')
  assert.ok(ws.includes('aria-pressed={isSelected}'), 'selectable records expose their current selection')
  assert.match(ws, /auditTracesHeading\} \(\{filteredTraces\.length\}\)/)
  assert.ok(ws.includes('copy.queueNoActivity'), 'no-activity state must be truthful')
  assert.ok(
    ws.includes("data.connectionStatus === 'UNAUTHORIZED'") && ws.includes('copy.queueRestrictedState'),
    'restricted (unauthorized) state must render an explicit notice instead of an empty board'
  )
  assert.ok(
    ws.includes("role=\"alert\""),
    'restricted notice must be announced as an alert'
  )

  // Selection is one shared control: both scene and 2D lists call the same setter
  assert.ok(ws.includes('const selectNode = useCallback'), 'selection must be a single shared handler')
  assert.ok(ws.includes('onSelectNode={selectNode}'), '3D scene must use the shared selection handler')
  assert.ok(
    (ws.match(/selectNode\(/g) ?? []).length >= 4,
    '2D workstation and agent lists must share the same selection handler'
  )

  // No fabricated progress: the workspace must never invent status text
  for (const forbidden of ['Math.random(', 'lorem', 'fake', 'DUMMY_']) {
    assert.equal(ws.includes(forbidden), false, `workspace must not contain "${forbidden}"`)
  }

  // Keyboard stability preserved on filtered lists
  assert.ok(ws.includes("e.key === 'Enter' || e.key === ' '"), 'filtered items stay keyboard-operable')
  assert.ok(ws.includes('role="status"'), 'empty-state notices must be announced politely')
})

test('M40-07: new copy keys keep exact en/id parity', () => {
  const m4007Keys = [
    'queueFiltersHeading',
    'queueSearchLabel',
    'queueStatusFilter',
    'queuePriorityFilter',
    'queueStateFilter',
    'queueZoneFilter',
    'queueAll',
    'queueClearFilters',
    'queueEmptyState',
    'queueRestrictedState',
    'queueFailedState',
    'queueIdentityConflictState',
    'queueActivityHeading',
    'queueNoActivity',
    'queueSourceLabel',
    'queueEventOrder',
    'queueApprovalAction',
    'queueHandoffStatus',
    'queuePendingHandoff',
    'queueDeniedHandoff',
  ]

  const enKeys = Object.keys(orbitCatalog.en).sort()
  const idKeys = Object.keys(orbitCatalog.id).sort()
  assert.deepEqual(idKeys, enKeys, 'locale key sets must remain identical')

  for (const key of m4007Keys) {
    assert.ok(key in orbitCatalog.en, `en.${key} must exist`)
    assert.ok(key in orbitCatalog.id, `id.${key} must exist`)
    assert.ok(orbitCatalog.en[key].trim().length > 0, `en.${key} must not be empty`)
    assert.ok(orbitCatalog.id[key].trim().length > 0, `id.${key} must not be empty`)
  }

  // Translations must be genuinely distinct for the narrative strings
  assert.notEqual(orbitCatalog.en.queueEmptyState, orbitCatalog.id.queueEmptyState)
  assert.notEqual(orbitCatalog.en.queueActivityHeading, orbitCatalog.id.queueActivityHeading)
  assert.notEqual(orbitCatalog.en.queueNoActivity, orbitCatalog.id.queueNoActivity)
  assert.notEqual(orbitCatalog.en.queueEventOrder, orbitCatalog.id.queueEventOrder)

  // Every key referenced by the new components must exist in the catalog
  const wsSrc = readFileSync(resolve(appRoot, 'src/components/OrbitOperationsWorkspace.tsx'), 'utf8')
  const barSrc = readFileSync(resolve(appRoot, 'src/components/OrbitQueueFilterBar.tsx'), 'utf8')
  const referenced = new Set(
    [...wsSrc.matchAll(/copy\.([a-zA-Z0-9_]+)/g), ...barSrc.matchAll(/copy\.([a-zA-Z0-9_]+)/g)].map(
      (m) => m[1]
    )
  )
  for (const key of referenced) {
    assert.ok(key in orbitCatalog.en, `component references missing key en.${key}`)
    assert.ok(key in orbitCatalog.id, `component references missing key id.${key}`)
  }
})

test('M40-07: filter styling uses MoonUI tokens only, no rogue hex', () => {
  const css = readFileSync(resolve(appRoot, 'src/app/globals.css'), 'utf8')
  assert.ok(css.includes('.orbit-queue-filter-bar'), 'filter bar styles must exist')
  assert.ok(css.includes('.orbit-panel-title'), 'panel title styles must exist')
  assert.ok(css.includes('.orbit-empty-state'), 'empty state styles must exist')
  assert.ok(css.includes('.orbit-filter-chip:focus-visible'), 'filter chips need visible focus')

  const hexMatches = css.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []
  assert.deepEqual(hexMatches, [], `globals.css must not hardcode hex colors, found ${hexMatches.join(', ')}`)

  assert.ok(
    css.includes('@media (prefers-reduced-motion: reduce)'),
    'reduced motion contract must remain'
  )

  // M40-07 components must stay silent and motion-neutral like the rest of ORBIT
  const forbiddenAudioTerms = ['AudioContext', 'new Audio(', '<audio', 'webkitAudioContext', '.play()']
  for (const file of ['src/components/OrbitQueueFilterBar.tsx', 'src/components/OrbitOperationsWorkspace.tsx']) {
    const src = readFileSync(resolve(appRoot, file), 'utf8')
    for (const term of forbiddenAudioTerms) {
      assert.equal(src.includes(term), false, `${file} must not contain "${term}"`)
    }
  }
})

test('M40-07: fixture ground truth still has no fabricated LIVE provenance', () => {
  // The queue layer must not introduce live/provenance drift into simulated feeds
  for (const ws of SIMULATED_OPERATIONS.workstations) assert.equal(ws.provenance, 'SIMULATED')
  for (const a of SIMULATED_OPERATIONS.agents) assert.equal(a.provenance, 'SIMULATED')
  for (const t of SIMULATED_OPERATIONS.taskQueue) assert.equal(t.provenance, 'SIMULATED')
  for (const tr of SIMULATED_OPERATIONS.recentTraces) assert.equal(tr.provenance, 'SIMULATED')

  // Raw feed and projection agree on record identity (nothing added by the queue layer)
  assert.equal(RAW_SIMULATED_FEED.taskQueue.length, SIMULATED_OPERATIONS.taskQueue.length)
  assert.equal(RAW_SIMULATED_FEED.agents.length, SIMULATED_OPERATIONS.agents.length)
})
