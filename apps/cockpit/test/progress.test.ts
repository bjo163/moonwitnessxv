import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { once } from 'node:events'
import { extractAllTasks, GROUP_DEFS, parseTodoRegister } from '../src/todoRegister.js'
import { ProgressTracker, type ProgressPayload } from '../src/progressTracker.js'
import { findRepoRoot, resolveRegisterPath } from '../src/paths.js'

function row(id: string, done: boolean, priority = 'P1', difficulty = 'D2', title = 'Demo deliverable'): string {
  return `| - [${done ? 'x' : ' '}] | **${id}** — ${title} | ${priority} | ${difficulty} | — | evidence for ${id} |`
}

/** Poll a predicate instead of sleeping a fixed window, so a loaded machine cannot flake the test. */
async function waitFor(predicate: () => boolean, timeoutMs = 1500): Promise<boolean> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (predicate()) return true
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
  return predicate()
}

const FIXTURE = [
  '# Fake register',
  '',
  'Prose that mentions a checkbox `[x]` must never be counted as a task row.',
  '',
  '## M00 — Fake milestone',
  '',
  '| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |',
  '|---|---|---|---|---|---|',
  row('M00-01', true),
  row('M00-02', true, 'P0'),
  row('M00-03', false, 'P0', 'D3'),
  '',
  '## M27 — Release',
  '',
  row('M27-01', false, 'P0', 'D4'),
  row('M27-02', true, 'P1'),
  '',
  '## M19 — Frontend',
  '',
  row('M19-25', true),
  row('M19-26', false, 'P1'),
].join('\n')

void test('parseTodoRegister: counts only canonical table rows', () => {
  const snapshot = parseTodoRegister(FIXTURE)
  // 7 real rows; the prose `[x]` mention and the non-task header rows are excluded.
  assert.equal(snapshot.total, 7)
  assert.equal(snapshot.done, 4)
  assert.equal(snapshot.open, 3)
  assert.equal(snapshot.done + snapshot.open, snapshot.total)
  assert.equal(snapshot.percent, 57.1)
})

void test('parseTodoRegister: rejects a malformed task id instead of half-matching it', () => {
  const snapshot = parseTodoRegister('| - [x] | **M19-26-EXTRA** — Not a canonical id | P1 | D2 | — | x |')
  assert.equal(snapshot.total, 0)
  assert.deepEqual(snapshot.tasks, [])
})

void test('parseTodoRegister: uppercase X is a closed task', () => {
  const snapshot = parseTodoRegister(row('M00-01', true).replace('[x]', '[X]'))
  assert.equal(snapshot.done, 1)
  assert.equal(snapshot.total, 1)
})

void test('parseTodoRegister: groups rows by milestone and rolls up to groups', () => {
  const snapshot = parseTodoRegister(FIXTURE)
  const m00 = snapshot.milestones.find((m) => m.id === 'M00')
  assert.ok(m00, 'M00 must be present')
  assert.equal(m00.total, 3)
  assert.equal(m00.done, 2)
  assert.equal(m00.group, 'G0')

  // Group buckets and milestone buckets must account for the same rows.
  const groupTotal = snapshot.groups.reduce((sum, g) => sum + g.total, 0)
  const groupDone = snapshot.groups.reduce((sum, g) => sum + g.done, 0)
  assert.equal(groupTotal, snapshot.total)
  assert.equal(groupDone, snapshot.done)
  assert.equal(
    snapshot.milestones.reduce((sum, m) => sum + m.total, 0),
    snapshot.total,
  )
  assert.equal(snapshot.milestones.find((m) => m.group === 'G?'), undefined, 'no milestone may fall out of the map')
})

void test('parseTodoRegister: captures priority, difficulty and open P0 ids', () => {
  const snapshot = parseTodoRegister(FIXTURE)
  assert.deepEqual(snapshot.openP0, ['M00-03', 'M27-01'])
  assert.equal(snapshot.priorities.P0?.open, 2)
  assert.equal(snapshot.priorities.P0?.total, 3)
  const first = snapshot.tasks[0]
  assert.ok(first)
  assert.equal(first.difficulty, 'D3')
  assert.equal(first.status, 'open')
  assert.equal(first.title, 'Demo deliverable')
})

void test('parseTodoRegister: open rows only, and no rows invented from empty input', () => {
  assert.ok(snapshotTasksAreAllOpen(parseTodoRegister(FIXTURE)))
  const empty = parseTodoRegister('')
  assert.equal(empty.total, 0)
  assert.equal(empty.percent, 0)
  assert.deepEqual(empty.milestones, [])
  assert.deepEqual(empty.tasks, [])
})

function snapshotTasksAreAllOpen(snapshot: ReturnType<typeof parseTodoRegister>): boolean {
  return snapshot.tasks.every((t) => t.status === 'open')
}

void test('extractAllTasks: returns every row including closed ones', () => {
  const rows = extractAllTasks(FIXTURE)
  assert.equal(rows.length, 7)
  assert.equal(rows.filter((r) => r.status === 'done').length, 4)
})

void test('GROUP_DEFS covers every milestone id in the real register', () => {
  const registerPath = resolveRegisterPath()
  if (!existsSync(registerPath)) {
    console.info('TODO.md not found; skipping group coverage check')
    return
  }
  const snapshot = parseTodoRegister(readFileSync(registerPath, 'utf8'))
  const unmapped = snapshot.milestones.filter((m) => m.group === 'G?')
  assert.deepEqual(unmapped.map((m) => m.id), [], 'a milestone exists in TODO.md but not in GROUP_DEFS')
  for (const group of GROUP_DEFS) {
    assert.ok(group.label, 'every group needs a label')
  }
})

void test('resolveRegisterPath: finds the workspace root, not the apps directory', () => {
  const root = findRepoRoot()
  assert.ok(existsSync(join(root, 'pnpm-workspace.yaml')), `${root} must be the workspace root`)
  assert.equal(resolveRegisterPath(root), join(root, 'TODO.md'))
})

void test('ProgressTracker: reports a real transition and emits once per change', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'moon-progress-'))
  const file = join(dir, 'TODO.md')
  const tracker = new ProgressTracker({ filePath: file, pollMs: 20, debounceMs: 5 })
  try {
    writeFileSync(file, FIXTURE, 'utf8')
    tracker.start()
    const payloads: ProgressPayload[] = []
    tracker.on('progress', (payload: ProgressPayload) => payloads.push(payload))

    const baseline = tracker.buildPayload()
    assert.equal(baseline.total, 7)
    assert.equal(baseline.done, 4)
    // The first read is a baseline, so it must not invent history.
    assert.deepEqual(baseline.flipLog, [])

    // Close one open P0 row.
    writeFileSync(
      file,
      FIXTURE.replace(row('M00-03', false, 'P0', 'D3'), row('M00-03', true, 'P0', 'D3')),
      'utf8',
    )
    const [payload] = await once(tracker, 'progress')
    const received = payload as ProgressPayload
    assert.equal(received.done, 5)
    assert.equal(received.open, 2)
    assert.ok(received.percent > baseline.percent, 'percent must move up')
    const flip = received.flipLog[0]
    assert.ok(flip, 'a transition must be recorded')
    assert.equal(flip.taskId, 'M00-03')
    assert.equal(flip.from, 'open')
    assert.equal(flip.to, 'done')
    assert.equal(received.source, 'TODO.md')
    assert.equal(received.ready, true)
    // Lifetime counters are what the panel subtracts from its baseline; they must
    // survive the capped flip log (which is a view, not the total).
    assert.deepEqual(received.flipTotals, { closed: 1, reopened: 0 })

    tracker.stop()
    const afterStop = payloads.length
    writeFileSync(file, FIXTURE, 'utf8')
    await new Promise((resolve) => setTimeout(resolve, 80))
    assert.equal(payloads.length, afterStop, 'a stopped tracker must not emit')
  } finally {
    tracker.stop()
    rmSync(dir, { recursive: true, force: true })
  }
})

void test('ProgressTracker: a burst of writes collapses via the debounce window', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'moon-progress-burst-'))
  const file = join(dir, 'TODO.md')
  const tracker = new ProgressTracker({ filePath: file, pollMs: 10, debounceMs: 40 })
  try {
    writeFileSync(file, FIXTURE, 'utf8')
    tracker.start()
    const payloads: ProgressPayload[] = []
    tracker.on('progress', (payload: ProgressPayload) => payloads.push(payload))

    for (let i = 0; i < 5; i++) {
      writeFileSync(file, `${FIXTURE}\n${row(`M27-0${String(i + 3)}`, i % 2 === 0)}`, 'utf8')
      await new Promise((resolve) => setTimeout(resolve, 12))
    }
    // Let the trailing debounce settle rather than waiting on an event that may
    // already have fired during the loop.
    await new Promise((resolve) => setTimeout(resolve, 200))
    // pollMs (10) is shorter than debounceMs (40) here on purpose: an earlier
    // implementation re-armed the debounce on every poll and never parsed at
    // all. Five writes must still collapse into one or two parses.
    assert.ok(payloads.length > 0, 'at least one parse must happen')
    assert.ok(payloads.length <= 3, `expected a collapsed burst, got ${String(payloads.length)} events`)
    const last = payloads[payloads.length - 1]
    assert.ok(last && last.total >= 7)
  } finally {
    tracker.stop()
    rmSync(dir, { recursive: true, force: true })
  }
})

void test('ProgressTracker: a content-identical touch parses at most once', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'moon-progress-touch-'))
  const file = join(dir, 'TODO.md')
  const tracker = new ProgressTracker({ filePath: file, pollMs: 15, debounceMs: 5 })
  try {
    writeFileSync(file, FIXTURE, 'utf8')
    tracker.start()
    let events = 0
    tracker.on('progress', () => {
      events += 1
    })
    const stamp = new Date()
    utimesSync(file, stamp, stamp)
    await new Promise((resolve) => setTimeout(resolve, 150))
    assert.ok(events <= 1, `expected at most one re-parse, got ${String(events)}`)
    assert.equal(tracker.buildPayload().done, 4, 'counts must be unchanged by a touch')
  } finally {
    tracker.stop()
    rmSync(dir, { recursive: true, force: true })
  }
})

void test('ProgressTracker: an unreadable register never throws and keeps ready false', async () => {
  const missing = join(tmpdir(), `moon-progress-missing-${String(Date.now())}`, 'TODO.md')
  const tracker = new ProgressTracker({ filePath: missing, pollMs: 15, debounceMs: 5 })
  try {
    tracker.start()
    let emitted = 0
    tracker.on('progress', () => {
      emitted += 1
    })
    await new Promise((resolve) => setTimeout(resolve, 80))
    const payload = tracker.buildPayload()
    assert.equal(tracker.hasSnapshot(), false)
    assert.equal(payload.ready, false)
    assert.equal(payload.total, 0)
    assert.ok(payload.error, 'a reason must be surfaced')
    assert.equal(emitted, 0, 'nothing may be emitted without a parse')
  } finally {
    tracker.stop()
  }
})

void test('ProgressTracker: a read failure is announced once and recovery is announced too', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'moon-progress-stale-'))
  const file = join(dir, 'TODO.md')
  const tracker = new ProgressTracker({ filePath: file, pollMs: 15, debounceMs: 5 })
  try {
    writeFileSync(file, FIXTURE, 'utf8')
    tracker.start()
    const payloads: ProgressPayload[] = []
    tracker.on('progress', (payload: ProgressPayload) => payloads.push(payload))

    // Make the register unreadable: the panel must be told it went blind instead
    // of silently serving live-looking numbers.
    rmSync(file)
    const sawStale = await waitFor(() => payloads.some((p) => p.stale))
    assert.ok(sawStale, 'a read failure must be pushed at least once')
    const stale = payloads.filter((p) => p.stale)
    assert.ok(stale[0]?.error, 'the stale payload must carry a reason')
    assert.equal(stale[0]?.ready, false)
    // Repeated failures of the same kind stay quiet.
    assert.ok(stale.length <= 2, `expected transition-only emits, got ${String(stale.length)}`)
    assert.equal(stale[0]?.done, 4, 'the last good snapshot is kept')

    // Recovery is a transition as well.
    const beforeRecovery = payloads.length
    writeFileSync(file, FIXTURE, 'utf8')
    const recovered = await waitFor(() => payloads.slice(beforeRecovery).some((p) => p.ready))
    assert.ok(recovered, 'recovery must be pushed')
    assert.equal(payloads.slice(beforeRecovery).find((p) => p.ready)?.stale, false)
  } finally {
    tracker.stop()
    rmSync(dir, { recursive: true, force: true })
  }
})

void test('ProgressTracker: the idle heartbeat is actually published', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'moon-progress-heartbeat-'))
  const file = join(dir, 'TODO.md')
  const tracker = new ProgressTracker({ filePath: file, pollMs: 10, debounceMs: 5, heartbeatMs: 30 })
  try {
    writeFileSync(file, FIXTURE, 'utf8')
    tracker.start()
    const payloads: ProgressPayload[] = []
    tracker.on('progress', (payload: ProgressPayload) => payloads.push(payload))

    // No file change at all: only the heartbeat can produce these frames.
    const published = await waitFor(() => payloads.length >= 1)
    assert.ok(published, 'the heartbeat must emit, not just append history')
    const historyLengths = payloads.map((p) => p.history.length)
    assert.ok(
      Math.max(...historyLengths) > 1,
      `history must grow in the delivered payloads, saw ${historyLengths.join(',')}`,
    )
  } finally {
    tracker.stop()
    rmSync(dir, { recursive: true, force: true })
  }
})

void test('ProgressTracker: queryTasks filters by status, milestone and priority', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'moon-progress-query-'))
  const file = join(dir, 'TODO.md')
  const tracker = new ProgressTracker({ filePath: file })
  try {
    writeFileSync(file, FIXTURE, 'utf8')
    tracker.start()
    const open = tracker.queryTasks({ status: 'open' })
    assert.equal(open.matched, 3)
    assert.ok(open.rows.every((r) => r.status === 'open'))
    const closed = tracker.queryTasks({ status: 'done' })
    assert.equal(closed.matched, 4)
    assert.ok(closed.rows.every((r) => r.status === 'done'))
    assert.equal(tracker.queryTasks({ milestone: 'M00' }).matched, 3)
    assert.equal(tracker.queryTasks({ priority: 'P0', status: 'open' }).matched, 2)
    assert.equal(tracker.queryTasks({ status: 'all', limit: 2 }).returned, 2)
    const before = statSync(file)
    tracker.buildPayload()
    tracker.queryTasks({ status: 'all' })
    const after = statSync(file)
    assert.equal(after.size, before.size, 'the tracker must not modify the register')
    assert.equal(after.mtimeMs, before.mtimeMs, 'the tracker must not modify the register')
  } finally {
    tracker.stop()
    rmSync(dir, { recursive: true, force: true })
  }
})
