#!/usr/bin/env node
/**
 * M25-07 gate — cost/safety/hardware feasibility decision.
 *
 * Dependency-free. Reads docs/decisions/M25-07-hardware-feasibility-decision.md,
 * checks that the three cited prerequisite artifacts resolve on disk, and
 * nothing else. No network. No writes.
 *
 * What it enforces:
 *   1. the record states the decision "No hardware effort without empirical
 *      review" and names who must decide;
 *   2. the seven required gate items (HG-1..HG-7) are present, each states a
 *      non-trivial evidence requirement, and every one is recorded MISSING — no
 *      gate may claim evidence that does not exist;
 *   3. the five non-goals (NG-1..NG-5) and the six revisit conditions
 *      (RV-1..RV-6) are present with a non-trivial statement;
 *   4. no sentence authorizes a purchase, build, fabrication, actuation,
 *      deployment or a calibrated measurement (a negated sentence is a denial,
 *      not an authorization);
 *   5. the three prerequisite artifacts are cited by repository-relative path
 *      and those paths resolve on disk.
 *
 * A gate is a document property. The validator proves that the decision record
 * keeps its prohibitions and its evidence checklist; it does not prove that any
 * review was performed, that an instrument, budget, operator, site, calibration
 * or consent exists, or that a future authorized hardware task would be safe.
 *
 * Usage:
 *   node scripts/check-m25-07-feasibility-gate.mjs
 *   node scripts/check-m25-07-feasibility-gate.mjs --self-test
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '..')
const DOC_FILE = path.join(ROOT, 'docs', 'decisions', 'M25-07-hardware-feasibility-decision.md')

const TASK = 'M25-07'
const DECISION = 'No hardware effort without empirical review'

// Gate ids are fixed by the decision record; order is the reading order.
const REQUIRED_GATES = [
  ['HG-1', 'named instrument and calibration traceability'],
  ['HG-2', 'physical safety plan'],
  ['HG-3', 'operator with documented authority'],
  ['HG-4', 'budget with a named responsible party'],
  ['HG-5', 'falsifiable question with a pass/fail threshold'],
  ['HG-6', 'rights and consent position'],
  ['HG-7', 'data-retention rule'],
]
const REQUIRED_NON_GOALS = ['NG-1', 'NG-2', 'NG-3', 'NG-4', 'NG-5']
const REQUIRED_REVISITS = ['RV-1', 'RV-2', 'RV-3', 'RV-4', 'RV-5', 'RV-6']
const REQUIRED_PREREQUISITES = [
  'docs/design/M25-04-measurement-metadata.md',
  'docs/data/M25-06-cosmos-tradition-context.json',
  'docs/audit/M25-03-heliogrid-questions.md',
]

const MIN_REQUIREMENT = 40
const MIN_ITEM = 40
const MAX_ECHO = 160

// An authorization is a positive predicate. A sentence that also carries a
// negation is read as a denial, so "no purchase is approved" passes while
// "approved to purchase the meter" fails.
const AUTHORIZATION = [
  /\bapproved to (purchase|buy|procure|build|fabricate|assemble|install|deploy|operate)\b/i,
  /\b(purchase|procurement|order|budget|calibrated measurement|calibrated result|hardware effort) (is |has been |was )?approved\b/i,
  /\b(begin|start|commence|proceed with|go ahead with) (the )?(build|construction|fabrication|assembly|installation|measurement campaign|actuation|procurement)\b/i,
  /\bdeploy (the )?hardware\b/i,
  /\b(actuate|energize|energise|switch on|power up|aim) (the )?(instrument|device|hardware|meter|sensor|actuator|telescope)\b/i,
]
const NEGATION = /\b(no|not|never|cannot|can't|must not|does not|do not|without|nor|none|neither|prohibited|forbidden|blocked|denied|refuse|refused|refuses|forbids?)\b/i

const err = (code, message) => ({ code, message })

function repoExists(rel) {
  if (typeof rel !== 'string' || !rel || rel.startsWith('/') || /^[A-Za-z]:/.test(rel)) return false
  if (rel.split(/[\\/]/).includes('..')) return false
  return fs.existsSync(path.join(ROOT, rel))
}

function sentences(text) {
  return text
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?;])\s+/))
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

// Rows of a markdown table whose first cell is an id such as HG-1 or NG-2.
// cells[0] is the id, cells[1] the statement, cells[2] the optional status.
function idRows(text, pattern) {
  const rows = []
  for (const line of String(text).split(/\r?\n/)) {
    if (!line.trim().startsWith('|')) continue
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim())
    if (cells.length < 2) continue
    if (!pattern.test(cells[0])) continue
    rows.push({ id: cells[0], cells })
  }
  return rows
}

// Every docs/ path a decision record cites must exist. This catches a dangling
// prerequisite citation even when the original path is simply replaced.
function citedPaths(text) {
  const pattern = /\bdocs\/[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*\.(?:md|json)\b/g
  return [...new Set([...String(text).matchAll(pattern)].map((match) => match[0]))]
}

function validate(text, exists = repoExists) {
  const errors = []
  const fail = (code, message) => errors.push(err(code, message))

  if (typeof text !== 'string' || text.trim() === '') {
    return { errors: [err('DOC_MISSING', `${TASK} decision record is missing or empty`)], stats: null }
  }

  if (!text.toLowerCase().includes(DECISION.toLowerCase())) {
    fail('DECISION_MISSING', `decision statement ${JSON.stringify(DECISION)} is not stated`)
  }
  if (!/^#+\s*.*who must decide/im.test(text)) {
    fail('AUTHORITY_MISSING', 'the record does not name who must decide (a "Who must decide" heading is required)')
  }

  const gateRows = idRows(text, /^HG-\d+$/)
  if (gateRows.length === 0) {
    fail('GATE_TABLE_MISSING', 'no gate checklist rows (HG-1..HG-7) were found')
  }
  const gates = new Map()
  for (const row of gateRows) {
    if (gates.has(row.id)) fail('GATE_DUPLICATE', `${row.id} appears more than once`)
    else gates.set(row.id, row)
    if (!REQUIRED_GATES.some(([id]) => id === row.id)) {
      fail('GATE_UNKNOWN', `${row.id} is not one of the seven required gates`)
    }
  }
  for (const [id, label] of REQUIRED_GATES) {
    const row = gates.get(id)
    if (!row) {
      fail('GATE_MISSING', `${id} (${label}) is missing from the gate checklist`)
      continue
    }
    const requirement = row.cells[1] ?? ''
    if (requirement.length < MIN_REQUIREMENT) {
      fail('GATE_REQUIREMENT_MISSING', `${id} (${label}) must state the evidence it requires (>= ${MIN_REQUIREMENT} chars)`)
    }
    const status = (row.cells[2] ?? '').toUpperCase()
    if (status !== 'MISSING') {
      fail('GATE_STATUS_NOT_MISSING', `${id} is recorded as ${JSON.stringify(row.cells[2] ?? '')}; no gate may claim evidence in this record`)
    }
  }

  if (!/^#+\s*.*non-goals/im.test(text)) {
    fail('NON_GOALS_MISSING', 'a "Non-goals" section is required')
  }
  const nonGoalRows = idRows(text, /^NG-\d+$/)
  const nonGoals = new Map(nonGoalRows.map((row) => [row.id, row]))
  for (const id of REQUIRED_NON_GOALS) {
    const row = nonGoals.get(id)
    if (!row) fail('NON_GOAL_MISSING', `${id} is missing from the non-goals table`)
    else if ((row.cells[1] ?? '').length < MIN_ITEM) {
      fail('NON_GOAL_EMPTY', `${id} must state the prohibition it makes (>= ${MIN_ITEM} chars)`)
    }
  }
  for (const row of nonGoalRows) {
    if (!REQUIRED_NON_GOALS.includes(row.id)) fail('NON_GOAL_UNKNOWN', `${row.id} is not a required non-goal`)
  }

  if (!/^#+\s*.*revisit/im.test(text)) {
    fail('REVISIT_MISSING', 'a section listing the revisit conditions is required')
  }
  const revisitRows = idRows(text, /^RV-\d+$/)
  const revisits = new Map(revisitRows.map((row) => [row.id, row]))
  for (const id of REQUIRED_REVISITS) {
    const row = revisits.get(id)
    if (!row) fail('REVISIT_CONDITION_MISSING', `${id} is missing from the revisit conditions`)
    else if ((row.cells[1] ?? '').length < MIN_ITEM) {
      fail('REVISIT_CONDITION_EMPTY', `${id} must state the condition that forces a revisit (>= ${MIN_ITEM} chars)`)
    }
  }
  for (const row of revisitRows) {
    if (!REQUIRED_REVISITS.includes(row.id)) fail('REVISIT_UNKNOWN', `${row.id} is not a required revisit condition`)
  }

  for (const sentence of sentences(text)) {
    if (!AUTHORIZATION.some((pattern) => pattern.test(sentence))) continue
    if (NEGATION.test(sentence)) continue
    fail('AUTHORIZATION_PRESENT', `the record authorizes hardware work: ${JSON.stringify(sentence.slice(0, MAX_ECHO))}`)
  }

  for (const rel of REQUIRED_PREREQUISITES) {
    if (!text.includes(rel)) fail('PREREQUISITE_NOT_CITED', `${rel} is not cited by repository-relative path`)
    if (!exists(rel)) fail('PREREQUISITE_UNRESOLVED', `${rel} does not resolve on disk`)
  }
  for (const rel of citedPaths(text)) {
    if (!exists(rel)) fail('CITATION_UNRESOLVED', `cited repository path ${rel} does not resolve on disk`)
  }

  const stats = {
    gates: REQUIRED_GATES.filter(([id]) => gates.has(id)).length,
    gatesMissing: REQUIRED_GATES.filter(([id]) => gates.get(id)?.cells[2]?.toUpperCase() === 'MISSING').length,
    nonGoals: REQUIRED_NON_GOALS.filter((id) => nonGoals.has(id)).length,
    revisits: REQUIRED_REVISITS.filter((id) => revisits.has(id)).length,
    prerequisites: REQUIRED_PREREQUISITES.length,
  }
  return { errors, stats }
}

function report(errors, stats) {
  if (errors.length === 0) {
    console.log(`PASS ${TASK} feasibility gate: gates=${stats.gates}/${REQUIRED_GATES.length} stated, status MISSING=${stats.gatesMissing}/${REQUIRED_GATES.length}`)
    console.log(`  non-goals: ${stats.nonGoals}/${REQUIRED_NON_GOALS.length}; revisit conditions: ${stats.revisits}/${REQUIRED_REVISITS.length}`)
    console.log(`  prerequisites: ${stats.prerequisites}/${REQUIRED_PREREQUISITES.length} cited and present`)
    console.log('  authorization: none found (purchase, build, actuation, deployment, calibrated measurement)')
    console.log('NOTE the gate authorizes no hardware effort; MISSING is the honest state of every gate')
    return
  }
  console.log(`FAIL ${TASK} feasibility gate: ${errors.length} error(s)`)
  for (const e of errors) console.log(`  ${e.code}: ${e.message}`)
}

function baseFixture() {
  return [
    '# Fixture — M25-07 decision gate',
    '',
    'Status: DECISION GATE. No hardware effort without empirical review.',
    '',
    '## 1. Decision',
    '',
    'No hardware effort without empirical review. Nothing here authorizes a',
    'purchase, a build, a measurement or a fabrication.',
    '',
    '### Who must decide',
    '',
    'The repository owner and the integrator decide; no worker may.',
    '',
    '## 2. Gate checklist',
    '',
    '| Gate | Required evidence | Status |',
    '|---|---|---|',
    '| HG-1 | Fixture requirement: a named instrument, its calibration certificate identifier, traceability chain and uncertainty budget. | MISSING |',
    '| HG-2 | Fixture requirement: a written physical safety plan with a named safety reviewer and stop-work authority. | MISSING |',
    '| HG-3 | Fixture requirement: a named operator with documented authority and a second independent reviewer. | MISSING |',
    '| HG-4 | Fixture requirement: a budget with currency, ceiling, funding source and a named responsible party. | MISSING |',
    '| HG-5 | Fixture requirement: one M25-03 question with a unit, pass threshold and falsification condition. | MISSING |',
    '| HG-6 | Fixture requirement: a rights and consent position for any recorded observation, with a withdrawal rule. | MISSING |',
    '| HG-7 | Fixture requirement: a data-retention rule naming what is stored, for how long and who may delete it. | MISSING |',
    '',
    '## 3. Non-goals',
    '',
    '| # | Non-goal |',
    '|---|---|',
    '| NG-1 | Fixture non-goal: no calibrated measurement claim for any value, tolerance or accuracy class. |',
    '| NG-2 | Fixture non-goal: no actuation of any device, actuator, relay or control path. |',
    '| NG-3 | Fixture non-goal: no astronomy-as-scripture and no truth transfer in either direction. |',
    '| NG-4 | Fixture non-goal: no device purchase, order, quote or procurement of hardware. |',
    '| NG-5 | Fixture non-goal: no deployment, installation or production change. |',
    '',
    '## 4. Revisit conditions',
    '',
    '| # | Revisit condition |',
    '|---|---|',
    '| RV-1 | Fixture revisit: the owner records a new decision naming one question, instrument, site and operator. |',
    '| RV-2 | Fixture revisit: an M25-03 blocked question becomes answerable because a real instrument exists. |',
    '| RV-3 | Fixture revisit: M25-02, M25-04 or M25-06 changes incompatibly or a cited path moves. |',
    '| RV-4 | Fixture revisit: a safety event, near miss or regulatory change is reported. |',
    '| RV-5 | Fixture revisit: the repository gains any hardware evidence, adapter or instrument record. |',
    '| RV-6 | Fixture revisit: any proposed hardware action arrives, including donated or already-owned equipment. |',
    '',
    '## 5. Prerequisites',
    '',
    '- docs/design/M25-04-measurement-metadata.md',
    '- docs/data/M25-06-cosmos-tradition-context.json',
    '- docs/audit/M25-03-heliogrid-questions.md',
    '',
  ].join('\n')
}

function selfTest() {
  const valid = baseFixture()
  const exists = (rel) => !rel.includes('dangling')
  const cases = []
  const result = (text) => validate(text, exists)

  const base = result(valid)
  cases.push({
    name: 'valid in-memory fixture accepted',
    ok: base.errors.length === 0,
    detail: base.errors[0]?.code ?? '0 errors',
    expected: 'PASS',
  })

  const missingGate = valid.replace(/^\| HG-3 \|.*\n/m, '')
  cases.push({ name: 'missing gate rejected', ok: result(missingGate).errors.some((e) => e.code === 'GATE_MISSING'), expected: 'GATE_MISSING' })

  const emptyRequirement = valid.replace('Fixture requirement: a named instrument, its calibration certificate identifier, traceability chain and uncertainty budget.', '')
  cases.push({ name: 'empty gate requirement rejected', ok: result(emptyRequirement).errors.some((e) => e.code === 'GATE_REQUIREMENT_MISSING'), expected: 'GATE_REQUIREMENT_MISSING' })

  const satisfiedClaim = valid.replace('| HG-2 | Fixture requirement: a written physical safety plan with a named safety reviewer and stop-work authority. | MISSING |', '| HG-2 | Fixture requirement: a written physical safety plan with a named safety reviewer and stop-work authority. | SATISFIED |')
  cases.push({ name: 'gate claimed satisfied rejected', ok: result(satisfiedClaim).errors.some((e) => e.code === 'GATE_STATUS_NOT_MISSING'), expected: 'GATE_STATUS_NOT_MISSING' })

  const authorization = `${valid}\nApproved to purchase the fixture instrument this quarter.\n`
  cases.push({ name: 'purchase authorization rejected', ok: result(authorization).errors.some((e) => e.code === 'AUTHORIZATION_PRESENT'), expected: 'AUTHORIZATION_PRESENT' })

  const actuation = `${valid}\nCalibrated measurement approved for the fixture rig.\n`
  cases.push({ name: 'calibrated-measurement authorization rejected', ok: result(actuation).errors.some((e) => e.code === 'AUTHORIZATION_PRESENT'), expected: 'AUTHORIZATION_PRESENT' })

  const missingNonGoal = valid.replace(/^\| NG-4 \|.*\n/m, '')
  cases.push({ name: 'missing non-goal rejected', ok: result(missingNonGoal).errors.some((e) => e.code === 'NON_GOAL_MISSING'), expected: 'NON_GOAL_MISSING' })

  const emptyNonGoal = valid.replace('Fixture non-goal: no actuation of any device, actuator, relay or control path.', '')
  cases.push({ name: 'empty non-goal rejected', ok: result(emptyNonGoal).errors.some((e) => e.code === 'NON_GOAL_EMPTY'), expected: 'NON_GOAL_EMPTY' })

  const missingRevisit = valid.replace(/^\| RV-5 \|.*\n/m, '')
  cases.push({ name: 'missing revisit condition rejected', ok: result(missingRevisit).errors.some((e) => e.code === 'REVISIT_CONDITION_MISSING'), expected: 'REVISIT_CONDITION_MISSING' })

  const emptyRevisit = valid.replace('Fixture revisit: a safety event, near miss or regulatory change is reported.', '')
  cases.push({ name: 'empty revisit condition rejected', ok: result(emptyRevisit).errors.some((e) => e.code === 'REVISIT_CONDITION_EMPTY'), expected: 'REVISIT_CONDITION_EMPTY' })

  const dangling = valid.replace('docs/data/M25-06-cosmos-tradition-context.json', 'docs/data/dangling-M25-06.json')
  cases.push({ name: 'dangling prerequisite path rejected', ok: result(dangling).errors.some((e) => e.code === 'CITATION_UNRESOLVED'), expected: 'CITATION_UNRESOLVED' })

  const uncited = valid.replace('- docs/audit/M25-03-heliogrid-questions.md\n', '')
  cases.push({ name: 'uncited prerequisite rejected', ok: result(uncited).errors.some((e) => e.code === 'PREREQUISITE_NOT_CITED'), expected: 'PREREQUISITE_NOT_CITED' })

  const noDecision = valid.replaceAll('No hardware effort without empirical review', 'Hardware work may proceed after a chat.')
  cases.push({ name: 'missing decision statement rejected', ok: result(noDecision).errors.some((e) => e.code === 'DECISION_MISSING'), expected: 'DECISION_MISSING' })

  const noAuthority = valid.replace('### Who must decide', '### Authority')
  cases.push({ name: 'missing decision authority rejected', ok: result(noAuthority).errors.some((e) => e.code === 'AUTHORITY_MISSING'), expected: 'AUTHORITY_MISSING' })

  let failed = 0
  console.log(`SELF-TEST ${TASK} feasibility gate`)
  for (const testCase of cases) {
    if (testCase.ok) {
      console.log(`PASS  ${testCase.name}${testCase.detail ? ` (${testCase.detail})` : testCase.expected ? ` (${testCase.expected})` : ''}`)
    } else {
      failed += 1
      console.log(`FAIL  ${testCase.name}`)
    }
  }
  const tampered = cases.length - 1
  console.log(
    failed === 0
      ? `PASS  ${cases.length - failed}/${cases.length} cases; valid fixture accepted, ${tampered} tampered fixtures rejected`
      : `FAIL  ${cases.length - failed}/${cases.length} cases; ${failed} fixture(s) behaved incorrectly`,
  )
  return failed === 0
}

function main() {
  const args = process.argv.slice(2)
  const unknown = args.filter((arg) => arg !== '--self-test')
  if (unknown.length > 0) {
    console.error(`Unknown argument(s): ${unknown.join(' ')}`)
    console.error('Usage: node scripts/check-m25-07-feasibility-gate.mjs [--self-test]')
    process.exitCode = 2
    return
  }
  if (args.includes('--self-test')) {
    process.exitCode = selfTest() ? 0 : 1
    return
  }
  let text
  try {
    text = fs.readFileSync(DOC_FILE, 'utf8')
  } catch (error) {
    console.log(`FAIL ${TASK} feasibility gate: cannot read docs/decisions/M25-07-hardware-feasibility-decision.md (${error.message})`)
    process.exitCode = 1
    return
  }
  const { errors, stats } = validate(text)
  report(errors, stats)
  process.exitCode = errors.length === 0 ? 0 : 1
}

main()
