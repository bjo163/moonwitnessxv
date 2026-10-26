/**
 * Read-only projection of TODO.md, the repository's sole task/status register.
 *
 * This module never writes anything. It exists so the Cockpit can show progress
 * without becoming a second register: the checkboxes in TODO.md stay the only
 * source of truth and every number here is derived from them on demand.
 */

export type TaskStatus = 'done' | 'open'

export interface TodoTask {
  id: string
  title: string
  status: TaskStatus
  priority: string
  difficulty: string
  milestone: string
}

export interface MilestoneProgress {
  id: string
  done: number
  open: number
  total: number
  percent: number
  group: string
}

export interface GroupProgress {
  id: string
  label: string
  done: number
  open: number
  total: number
  percent: number
}

export interface PriorityProgress {
  done: number
  open: number
  total: number
}

export interface RegisterSnapshot {
  generatedAt: string
  total: number
  done: number
  open: number
  percent: number
  milestones: MilestoneProgress[]
  groups: GroupProgress[]
  priorities: Record<string, PriorityProgress>
  openP0: string[]
  /** Open tasks only, capped. The full row set stays server-side. */
  tasks: TodoTask[]
}

/** Mirrors the "Group and milestone map" section of TODO.md. */
export const GROUP_DEFS: ReadonlyArray<{ id: string; label: string; milestones: string[] }> = [
  { id: 'G0', label: 'Foundation', milestones: ['M00', 'M01', 'M02', 'M03', 'M04', 'M05', 'M28'] },
  { id: 'G1', label: 'Source', milestones: ['M06', 'M07', 'M08', 'M09', 'M10', 'M11'] },
  { id: 'G2', label: 'Research', milestones: ['M12', 'M13', 'M14', 'M15'] },
  { id: 'G3', label: 'Witness & Creative', milestones: ['M16', 'M17', 'M18', 'M19'] },
  { id: 'G4', label: 'Operations', milestones: ['M20', 'M21', 'M22', 'M23', 'M38', 'M39'] },
  { id: 'G5', label: 'Optional Research', milestones: ['M24', 'M25', 'M26'] },
  { id: 'G6', label: 'Release', milestones: ['M27'] },
  { id: 'G7', label: 'Ecosystem', milestones: ['M29', 'M30', 'M31', 'M32', 'M33', 'M34', 'M35', 'M36', 'M37'] },
]

const UNMAPPED = { id: 'G?', label: 'Unmapped' }

const MILESTONE_TO_GROUP = new Map<string, { id: string; label: string }>()
for (const group of GROUP_DEFS) {
  for (const milestone of group.milestones) {
    MILESTONE_TO_GROUP.set(milestone, { id: group.id, label: group.label })
  }
}

/**
 * A canonical task row looks like:
 *   | - [x] | **M00-01** — Snapshot current HEAD and tree for evidence | P0 | D1 | — | … |
 * The leading pipe anchor matters: prose lines quote `[x]` inside backticks and
 * would otherwise be counted as tasks.
 */
const TASK_ROW = /^\|\s*- \[([ xX])\]\s*\|\s*\*\*(M\d{2}-\d+)\*\*([^|]*)\|\s*(P\d)\s*\|\s*(D\d)\s*\|/

const MAX_TASK_ROWS = 400

function roundPercent(done: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((done / total) * 1000) / 10
}

function cleanTitle(raw: string): string {
  return raw.replace(/^[\s—–-]+/, '').trim()
}

function emptyTally(): PriorityProgress {
  return { done: 0, open: 0, total: 0 }
}

/**
 * Every canonical task row in document order, uncapped. The register payload
 * ships only a bounded slice of these, so a caller that must diff two versions
 * or answer a drill-down query reads through here instead.
 */
export function extractAllTasks(text: string): TodoTask[] {
  const rows: TodoTask[] = []
  for (const line of text.split(/\r?\n/)) {
    const row = readRow(line)
    if (row) rows.push(row)
  }
  return rows
}

interface ParsedRow {
  id: string
  title: string
  status: TaskStatus
  priority: string
  difficulty: string
  milestone: string
}

function readRow(line: string): ParsedRow | null {
  const match = TASK_ROW.exec(line)
  if (!match) return null
  const [, mark, id, rawTitle, priority, difficulty] = match
  // The regex makes groups 2-5 mandatory whenever it matches; a missing id is
  // treated as "not a task row" rather than guessed at.
  if (!id) return null
  const dash = id.indexOf('-')
  return {
    id,
    title: cleanTitle(rawTitle ?? ''),
    status: mark === ' ' ? 'open' : 'done',
    priority: priority ?? '',
    difficulty: difficulty ?? '',
    // `M01-05` -> `M01`. Splitting on the separator rather than fixed slicing
    // keeps working if the register ever grows past two task digits.
    milestone: dash > 0 ? id.slice(0, dash) : id,
  }
}

export function parseTodoRegister(text: string): RegisterSnapshot {
  const rows = extractAllTasks(text)
  const priorities: Record<string, PriorityProgress> = {
    P0: emptyTally(),
    P1: emptyTally(),
    P2: emptyTally(),
    P3: emptyTally(),
  }
  const milestoneAgg = new Map<string, PriorityProgress & { group: string }>()
  const groupAgg = new Map<string, { label: string; done: number; open: number; total: number }>()
  const openP0: string[] = []
  const tasks: TodoTask[] = []
  let done = 0

  for (const row of rows) {
    const { id, status, priority, milestone } = row
    const group = MILESTONE_TO_GROUP.get(milestone) ?? UNMAPPED

    if (status === 'done') done += 1

    const priorityTally = priorities[priority] ?? (priorities[priority] = emptyTally())
    priorityTally.total += 1
    if (status === 'done') priorityTally.done += 1
    else priorityTally.open += 1

    let msAgg = milestoneAgg.get(milestone)
    if (!msAgg) {
      msAgg = { done: 0, open: 0, total: 0, group: group.id }
      milestoneAgg.set(milestone, msAgg)
    }
    msAgg.total += 1
    if (status === 'done') msAgg.done += 1
    else msAgg.open += 1

    let gAgg = groupAgg.get(group.id)
    if (!gAgg) {
      gAgg = { label: group.label, done: 0, open: 0, total: 0 }
      groupAgg.set(group.id, gAgg)
    }
    gAgg.total += 1
    if (status === 'done') gAgg.done += 1
    else gAgg.open += 1

    if (status === 'open' && priority === 'P0') openP0.push(id)

    if (status === 'open' && tasks.length < MAX_TASK_ROWS) {
      tasks.push(row)
    }
  }

  const total = rows.length

  const milestones: MilestoneProgress[] = [...milestoneAgg.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([id, agg]) => ({
      id,
      done: agg.done,
      open: agg.open,
      total: agg.total,
      percent: roundPercent(agg.done, agg.total),
      group: agg.group,
    }))

  const groups: GroupProgress[] = [...groupAgg.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([id, agg]) => ({
      id,
      label: agg.label,
      done: agg.done,
      open: agg.open,
      total: agg.total,
      percent: roundPercent(agg.done, agg.total),
    }))

  return {
    generatedAt: new Date().toISOString(),
    total,
    done,
    open: total - done,
    percent: roundPercent(done, total),
    milestones,
    groups,
    priorities,
    openP0: openP0.sort(),
    tasks,
  }
}
