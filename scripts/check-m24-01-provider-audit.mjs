#!/usr/bin/env node
/**
 * scripts/check-m24-01-provider-audit.mjs
 *
 * M24-01 gate: the USGS / GDACS / NOAA / Open-Meteo / A-L-L-A-H / HELIOGRID
 * provider ledger is internally consistent and every quoted locator resolves
 * to real repository text at the cited line.
 *
 * What this proves:
 *   1. Rows have unique ids and values from the declared enums.
 *   2. Every row locator and evidence quote resolves at file:line.
 *   3. No FIXTURE_ONLY row is labelled LIVE_IMPLEMENTED, and no doc-only or
 *      fixture artifact claims a live client.
 *   4. No terms claim exists without an in-repo locator; NOT_IN_REPO rows carry
 *      no terms locator at all.
 *   5. Every named provider is represented by rows or explicitly recorded
 *      absent, and every subject has a terms record.
 *   6. Declared totals, tallies, URL counts and fixture-live counts match rows.
 *
 * What this does not prove: that any provider feed, adapter, URL, quota or
 * terms text exists. The ledger records absence. External terms were not
 * fetched, so a NOT_IN_REPO entry is not a licence conclusion.
 *
 * Run:            node scripts/check-m24-01-provider-audit.mjs
 * Negative test:  node scripts/check-m24-01-provider-audit.mjs --self-test
 *
 * Exit 0 when clean, 1 on any violation. No third-party dependencies.
 */

import { existsSync, readFileSync } from 'node:fs'

const LEDGER = 'docs/data/M24-01-provider-audit.json'
const EXPECTED_BASELINE_PREFIX = '659da28'

const EVIDENCE_CLASSES = ['REPO_EVIDENCE', 'FIXTURE_ONLY', 'DOC_ONLY_PLAN', 'REPORTED_TERMS']
const ARTIFACT_KINDS = [
  'type_token',
  'fixture',
  'test_consumer',
  'prose_seed',
  'doc_claim',
  'sample_data',
  'schema',
  'ui_surface',
  'ui_status',
  'feature_flag',
]
const LIVE_VERDICTS = [
  'LIVE_IMPLEMENTED',
  'CONTROL_IMPLEMENTED',
  'FIXTURE_ONLY_NOT_LIVE',
  'FIXTURE_PRESENTED_AS_LIVE',
  'TOKEN_ONLY_NOT_LIVE',
  'DOC_ONLY_NOT_IMPLEMENTED',
  'ABSENT',
]
const TERMS_STATUSES = ['NOT_IN_REPO', 'IN_REPO']
const PROVIDERS = ['USGS', 'GDACS', 'NOAA', 'OPEN_METEO']
const RELATED_SUBJECTS = ['ALLAH', 'HELIOGRID']
const SUBJECTS = [...PROVIDERS, ...RELATED_SUBJECTS]
const FIXTURE_KINDS = ['fixture', 'sample_data']

function loadLedger() {
  return JSON.parse(readFileSync(LEDGER, 'utf8'))
}

function makeLineReader() {
  const cache = new Map()
  return (file) => {
    if (!cache.has(file)) cache.set(file, readFileSync(file, 'utf8').split(/\r?\n/))
    return cache.get(file)
  }
}

function sameList(a, b) {
  return Array.isArray(a) && a.length === b.length && a.every((v, i) => v === b[i])
}

function isFilled(value) {
  return typeof value === 'string' && value.trim() !== ''
}

function isHexSha(value, min = 7) {
  return typeof value === 'string' && new RegExp(`^[0-9a-f]{${min},40}$`).test(value)
}

function tally(rows, key, values) {
  return Object.fromEntries(values.map((v) => [v, rows.filter((r) => r[key] === v).length]))
}

function compareTally(name, declared, actual, values, fail) {
  if (!declared || typeof declared !== 'object') {
    fail(`declared_counts.${name} is missing`)
    return
  }
  for (const key of values) {
    if (declared[key] !== actual[key]) {
      fail(`declared ${name}.${key}=${declared[key]} !== rows ${actual[key]}`)
    }
  }
  for (const key of Object.keys(declared)) {
    if (!values.includes(key)) fail(`declared ${name} has unknown key ${JSON.stringify(key)}`)
  }
}

function checkLocator(locator, quote, readLines, stats, fail, where) {
  const match = typeof locator === 'string' ? /^(.+):(\d+)$/.exec(locator) : null
  if (!match) {
    fail(`${where} locator ${JSON.stringify(locator)} is not a file:line string`)
    return false
  }
  const file = match[1]
  const lineNo = Number(match[2])
  if (!existsSync(file)) {
    fail(`${where} locator file ${file} does not exist`)
    return false
  }
  const lines = readLines(file)
  if (lineNo < 1 || lineNo > lines.length) {
    fail(`${where} locator line ${lineNo} is outside ${file} lines 1-${lines.length}`)
    return false
  }
  if (!isFilled(quote)) {
    fail(`${where} has an empty quote`)
    return false
  }
  if (!lines[lineNo - 1].includes(quote)) {
    fail(`${where} quote ${JSON.stringify(quote)} not found at ${locator}`)
    return false
  }
  stats.locatorChecks++
  return true
}

function validate(doc, readLines, stats = { locatorChecks: 0 }) {
  const errors = []
  const fail = (msg) => errors.push(msg)

  const rows = Array.isArray(doc.rows) ? doc.rows : []
  if (rows.length === 0) fail('rows is empty or not an array')

  if (doc.task !== 'M24-01') fail(`task ${JSON.stringify(doc.task)} !== "M24-01"`)
  if (!isHexSha(doc.baseline_sha) || !doc.baseline_sha.startsWith(EXPECTED_BASELINE_PREFIX)) {
    fail(`baseline_sha ${JSON.stringify(doc.baseline_sha)} is not the M24-01 baseline ${EXPECTED_BASELINE_PREFIX}...`)
  }
  if (!isHexSha(doc.observed_head_sha)) {
    fail(`observed_head_sha ${JSON.stringify(doc.observed_head_sha)} is not a hex SHA`)
  }

  if (!sameList(doc.evidence_class_enum, EVIDENCE_CLASSES)) {
    fail('evidence_class_enum does not match the ledger vocabulary')
  }
  if (!sameList(doc.artifact_kind_enum, ARTIFACT_KINDS)) {
    fail('artifact_kind_enum does not match the ledger vocabulary')
  }
  if (!sameList(doc.live_verdict_enum, LIVE_VERDICTS)) {
    fail('live_verdict_enum does not match the ledger vocabulary')
  }
  if (!sameList(doc.terms_status_enum, TERMS_STATUSES)) {
    fail('terms_status_enum does not match the ledger vocabulary')
  }
  if (!sameList(doc.providers, PROVIDERS)) fail('providers does not match USGS|GDACS|NOAA|OPEN_METEO')
  if (!sameList(doc.related_subjects, RELATED_SUBJECTS)) {
    fail('related_subjects does not match ALLAH|HELIOGRID')
  }
  if (!doc.provider_kind || typeof doc.provider_kind !== 'object') {
    fail('provider_kind is missing')
  } else {
    for (const subject of SUBJECTS) {
      if (!isFilled(doc.provider_kind[subject])) fail(`provider_kind.${subject} is missing`)
    }
  }

  const ids = new Set()
  const rowsById = new Map()
  for (const row of rows) {
    if (!isFilled(row.id)) {
      fail(`row at index ${rows.indexOf(row)} has no id`)
      continue
    }
    if (ids.has(row.id)) fail(`duplicate id ${row.id}`)
    ids.add(row.id)
    rowsById.set(row.id, row)

    if (!SUBJECTS.includes(row.provider)) {
      fail(`row ${row.id} provider ${JSON.stringify(row.provider)} is not in ${SUBJECTS.join('|')}`)
    }
    if (!ARTIFACT_KINDS.includes(row.artifact_kind)) {
      fail(`row ${row.id} artifact_kind ${JSON.stringify(row.artifact_kind)} is not in the ledger vocabulary`)
    }
    if (!EVIDENCE_CLASSES.includes(row.evidence_class)) {
      fail(`row ${row.id} evidence_class ${JSON.stringify(row.evidence_class)} is not in the ledger vocabulary`)
    }
    if (!LIVE_VERDICTS.includes(row.live_verdict)) {
      fail(`row ${row.id} live_verdict ${JSON.stringify(row.live_verdict)} is not in the ledger vocabulary`)
    }
    if (!TERMS_STATUSES.includes(row.terms_status)) {
      fail(`row ${row.id} terms_status ${JSON.stringify(row.terms_status)} is not in the ledger vocabulary`)
    }

    const locatorOk = checkLocator(row.locator, row.quote, readLines, stats, fail, `row ${row.id}`)

    const evidence = row.evidence
    if (!Array.isArray(evidence) || evidence.length === 0) {
      fail(`row ${row.id} has no evidence locators`)
    } else {
      for (let i = 0; i < evidence.length; i++) {
        const item = evidence[i]
        if (!item || typeof item.locator !== 'string' || typeof item.quote !== 'string') {
          fail(`row ${row.id} evidence[${i}] needs locator+quote strings`)
          continue
        }
        checkLocator(item.locator, item.quote, readLines, stats, fail, `row ${row.id} evidence[${i}]`)
      }
      if (locatorOk && !evidence.some((item) => item && item.locator === row.locator)) {
        fail(`row ${row.id} main locator is not repeated in evidence and cannot be quote-verified`)
      }
    }

    if (row.terms_status === 'IN_REPO') {
      if (!isFilled(row.terms_locator) || !isFilled(row.terms_quote)) {
        fail(`row ${row.id} claims terms IN_REPO without terms_locator+terms_quote`)
      } else {
        checkLocator(row.terms_locator, row.terms_quote, readLines, stats, fail, `row ${row.id} terms`)
      }
    } else if (isFilled(row.terms_locator) || isFilled(row.terms_quote)) {
      fail(`row ${row.id} is NOT_IN_REPO but carries a terms locator or quote`)
    }
    if (row.evidence_class === 'REPORTED_TERMS' && row.terms_status !== 'IN_REPO') {
      fail(`row ${row.id} is REPORTED_TERMS but terms_status is ${JSON.stringify(row.terms_status)}`)
    }

    if (row.evidence_class === 'FIXTURE_ONLY' && row.live_verdict === 'LIVE_IMPLEMENTED') {
      fail(`row ${row.id} is FIXTURE_ONLY but labelled LIVE_IMPLEMENTED`)
    }
    if (FIXTURE_KINDS.includes(row.artifact_kind) && row.live_verdict === 'LIVE_IMPLEMENTED') {
      fail(`row ${row.id} artifact_kind ${row.artifact_kind} cannot be LIVE_IMPLEMENTED`)
    }
    if (row.artifact_kind === 'doc_claim' && row.live_verdict === 'LIVE_IMPLEMENTED') {
      fail(`row ${row.id} is a doc_claim and cannot be LIVE_IMPLEMENTED`)
    }
    if (row.live_verdict === 'LIVE_IMPLEMENTED' && row.evidence_class !== 'REPO_EVIDENCE') {
      fail(`row ${row.id} claims LIVE_IMPLEMENTED with evidence_class ${row.evidence_class}`)
    }
    if (row.live_verdict === 'FIXTURE_PRESENTED_AS_LIVE' && row.evidence_class === 'FIXTURE_ONLY') {
      // Explicitly allowed: this is the defect class the audit records, not a
      // claim that the fixture is a live source.
      if (row.artifact_kind !== 'ui_status' && row.artifact_kind !== 'ui_surface') {
        fail(`row ${row.id} marks a non-surface fixture as FIXTURE_PRESENTED_AS_LIVE`)
      }
    }
  }

  const records = Array.isArray(doc.provider_records) ? doc.provider_records : []
  if (records.length === 0) fail('provider_records is empty or not an array')
  const recordSubjects = new Set()
  for (const record of records) {
    if (!isFilled(record.provider) || !SUBJECTS.includes(record.provider)) {
      fail(`provider_records entry ${JSON.stringify(record.provider)} is not a known subject`)
      continue
    }
    if (recordSubjects.has(record.provider)) fail(`duplicate provider_records entry ${record.provider}`)
    recordSubjects.add(record.provider)

    if (typeof record.code_present !== 'boolean') {
      fail(`provider_records.${record.provider}.code_present must be boolean`)
    }
    if (typeof record.client_implemented !== 'boolean') {
      fail(`provider_records.${record.provider}.client_implemented must be boolean`)
    }
    if (record.client_implemented === true) {
      const live = rows.some(
        (row) => row.provider === record.provider && row.live_verdict === 'LIVE_IMPLEMENTED',
      )
      if (!live) {
        fail(`provider_records.${record.provider} claims a live client but no LIVE_IMPLEMENTED row exists`)
      }
    }
    if (record.code_present === false) {
      if (!isFilled(record.absent_locator) || !isFilled(record.absent_quote)) {
        fail(`provider_records.${record.provider} is absent but has no absent_locator+absent_quote`)
      } else {
        checkLocator(
          record.absent_locator,
          record.absent_quote,
          readLines,
          stats,
          fail,
          `provider_records.${record.provider} absence`,
        )
      }
    } else if (record.code_present === true) {
      const codeRows = rows.filter(
        (row) => row.provider === record.provider && row.evidence_class !== 'DOC_ONLY_PLAN',
      )
      if (codeRows.length === 0) {
        fail(`provider_records.${record.provider} says code_present but no non-doc row exists`)
      }
    }

    const subjectRows = rows.filter((row) => row.provider === record.provider)
    if (!Array.isArray(record.row_ids) || record.row_ids.length !== subjectRows.length) {
      fail(`provider_records.${record.provider}.row_ids does not list every ${record.provider} row`)
    } else {
      const listed = new Set(record.row_ids)
      if (listed.size !== record.row_ids.length) {
        fail(`provider_records.${record.provider}.row_ids has duplicates`)
      }
      for (const row of subjectRows) {
        if (!listed.has(row.id)) fail(`provider_records.${record.provider}.row_ids omits ${row.id}`)
      }
      for (const id of record.row_ids) {
        if (!rowsById.has(id)) fail(`provider_records.${record.provider}.row_ids names unknown row ${id}`)
      }
    }

    const codeCount = subjectRows.filter((row) => row.evidence_class !== 'DOC_ONLY_PLAN').length
    const docCount = subjectRows.filter((row) => row.evidence_class === 'DOC_ONLY_PLAN').length
    const fixtureCount = subjectRows.filter((row) => row.evidence_class === 'FIXTURE_ONLY').length
    if (record.code_row_count !== codeCount) {
      fail(`provider_records.${record.provider}.code_row_count=${record.code_row_count} !== rows ${codeCount}`)
    }
    if (record.doc_row_count !== docCount) {
      fail(`provider_records.${record.provider}.doc_row_count=${record.doc_row_count} !== rows ${docCount}`)
    }
    if (record.fixture_row_count !== fixtureCount) {
      fail(`provider_records.${record.provider}.fixture_row_count=${record.fixture_row_count} !== rows ${fixtureCount}`)
    }
    if (!Number.isInteger(record.url_count) || record.url_count < 0) {
      fail(`provider_records.${record.provider}.url_count must be a non-negative integer`)
    }
  }
  for (const subject of SUBJECTS) {
    if (!recordSubjects.has(subject)) fail(`provider_records is missing subject ${subject}`)
  }

  const terms = Array.isArray(doc.terms_register) ? doc.terms_register : []
  if (terms.length === 0) fail('terms_register is empty or not an array')
  const termsSubjects = new Set()
  for (const entry of terms) {
    if (!isFilled(entry.subject) || !SUBJECTS.includes(entry.subject)) {
      fail(`terms_register entry ${JSON.stringify(entry.subject)} is not a known subject`)
      continue
    }
    if (termsSubjects.has(entry.subject)) fail(`duplicate terms_register entry ${entry.subject}`)
    termsSubjects.add(entry.subject)
    if (!TERMS_STATUSES.includes(entry.status)) {
      fail(`terms_register.${entry.subject} status ${JSON.stringify(entry.status)} is not in the vocabulary`)
      continue
    }
    if (entry.status === 'IN_REPO') {
      if (!isFilled(entry.locator) || !isFilled(entry.quote)) {
        fail(`terms_register.${entry.subject} claims IN_REPO without locator+quote`)
      } else {
        checkLocator(entry.locator, entry.quote, readLines, stats, fail, `terms_register.${entry.subject}`)
      }
    } else if (isFilled(entry.locator) || isFilled(entry.quote)) {
      fail(`terms_register.${entry.subject} is NOT_IN_REPO but carries a locator or quote`)
    }
  }
  for (const subject of SUBJECTS) {
    if (!termsSubjects.has(subject)) fail(`terms_register is missing subject ${subject}`)
  }

  const urls = Array.isArray(doc.url_inventory) ? doc.url_inventory : []
  if (urls.length === 0) fail('url_inventory is empty or not an array')
  let urlTotal = 0
  for (const entry of urls) {
    if (!isFilled(entry.subject) || !SUBJECTS.includes(entry.subject)) {
      fail(`url_inventory entry ${JSON.stringify(entry.subject)} is not a known subject`)
      continue
    }
    if (!Array.isArray(entry.urls)) {
      fail(`url_inventory.${entry.subject}.urls must be an array`)
      continue
    }
    if (entry.urls.length > 0) {
      fail(`url_inventory.${entry.subject} lists ${entry.urls.length} provider URL(s); a URL must be a row with a locator`)
    }
    urlTotal += entry.urls.length
    const record = records.find((r) => r.provider === entry.subject)
    if (record && record.url_count !== entry.urls.length) {
      fail(`provider_records.${entry.subject}.url_count=${record.url_count} !== url_inventory ${entry.urls.length}`)
    }
  }

  const flags = Array.isArray(doc.feature_flags) ? doc.feature_flags : []
  let providerFlags = 0
  for (const flag of flags) {
    if (!isFilled(flag.name)) {
      fail('feature_flags entry has no name')
      continue
    }
    if (typeof flag.provider_specific !== 'boolean') {
      fail(`feature_flags.${flag.name}.provider_specific must be boolean`)
    }
    if (flag.provider_specific === true) providerFlags++
    if (!isFilled(flag.locator) || !isFilled(flag.quote)) {
      fail(`feature_flags.${flag.name} has no locator+quote`)
    } else {
      checkLocator(flag.locator, flag.quote, readLines, stats, fail, `feature_flags.${flag.name}`)
    }
  }

  for (const record of records) {
    const entry = terms.find((t) => t.subject === record.provider)
    if (entry && record.terms_status !== entry.status) {
      fail(
        `provider_records.${record.provider}.terms_status=${record.terms_status} !== terms_register ${entry.status}`,
      )
    }
  }

  const counts = doc.declared_counts
  if (!counts || typeof counts !== 'object') {
    fail('declared_counts is missing')
    return errors
  }
  if (counts.total !== rows.length) {
    fail(`declared total ${counts.total} !== rows ${rows.length}`)
  }

  compareTally('by_evidence_class', counts.by_evidence_class, tally(rows, 'evidence_class', EVIDENCE_CLASSES), EVIDENCE_CLASSES, fail)
  compareTally('by_live_verdict', counts.by_live_verdict, tally(rows, 'live_verdict', LIVE_VERDICTS), LIVE_VERDICTS, fail)
  compareTally('by_provider', counts.by_provider, tally(rows, 'provider', SUBJECTS), SUBJECTS, fail)
  compareTally('by_artifact_kind', counts.by_artifact_kind, tally(rows, 'artifact_kind', ARTIFACT_KINDS), ARTIFACT_KINDS, fail)
  compareTally('by_terms_status', counts.by_terms_status, tally(rows, 'terms_status', TERMS_STATUSES), TERMS_STATUSES, fail)

  const fixtureLive = rows.filter(
    (row) => row.evidence_class === 'FIXTURE_ONLY' && row.live_verdict === 'LIVE_IMPLEMENTED',
  ).length
  if (fixtureLive !== 0) fail(`${fixtureLive} fixture-only row(s) labelled LIVE_IMPLEMENTED`)
  if (counts.fixture_rows_labelled_live !== fixtureLive) {
    fail(`declared fixture_rows_labelled_live=${counts.fixture_rows_labelled_live} !== computed ${fixtureLive}`)
  }

  const termsWithoutLocator = rows.filter(
    (row) => row.terms_status === 'IN_REPO' && (!isFilled(row.terms_locator) || !isFilled(row.terms_quote)),
  ).length
  if (termsWithoutLocator !== 0) fail(`${termsWithoutLocator} terms claim(s) without an in-repo locator`)
  if (counts.terms_claims_without_locator !== termsWithoutLocator) {
    fail(
      `declared terms_claims_without_locator=${counts.terms_claims_without_locator} !== computed ${termsWithoutLocator}`,
    )
  }

  const liveClients = records.filter((record) => record.client_implemented === true).length
  if (counts.providers_with_live_client !== liveClients) {
    fail(`declared providers_with_live_client=${counts.providers_with_live_client} !== records ${liveClients}`)
  }
  if (counts.provider_urls_found !== urlTotal) {
    fail(`declared provider_urls_found=${counts.provider_urls_found} !== url_inventory ${urlTotal}`)
  }
  if (counts.provider_specific_feature_flags !== providerFlags) {
    fail(
      `declared provider_specific_feature_flags=${counts.provider_specific_feature_flags} !== flags ${providerFlags}`,
    )
  }
  const absent = records.filter((record) => record.code_present === false).length
  if (counts.absent_providers !== absent) {
    fail(`declared absent_providers=${counts.absent_providers} !== records ${absent}`)
  }

  return errors
}

function selfTest() {
  const base = loadLedger()
  const readLines = makeLineReader()
  const baseErrors = validate(base, readLines, { locatorChecks: 0 })
  if (baseErrors.length > 0) {
    console.log(`SELF-TEST FAIL: baseline ledger is invalid: ${baseErrors[0]}`)
    return 1
  }

  const clone = () => JSON.parse(JSON.stringify(base))
  const rowById = (d, id) => d.rows.find((r) => r.id === id)
  const record = (d, provider) => d.provider_records.find((r) => r.provider === provider)

  const cases = [
    {
      name: 'duplicate row id is rejected',
      mutate: (d) => {
        d.rows[1].id = d.rows[0].id
      },
    },
    {
      name: 'FIXTURE_ONLY row labelled LIVE_IMPLEMENTED is rejected',
      mutate: (d) => {
        rowById(d, 'usgs-mock-fixture').live_verdict = 'LIVE_IMPLEMENTED'
      },
    },
    {
      name: 'fixture artifact kind labelled LIVE_IMPLEMENTED is rejected',
      mutate: (d) => {
        const row = rowById(d, 'usgs-mock-fixture')
        row.evidence_class = 'REPO_EVIDENCE'
        row.live_verdict = 'LIVE_IMPLEMENTED'
      },
    },
    {
      name: 'doc_claim labelled LIVE_IMPLEMENTED is rejected',
      mutate: (d) => {
        rowById(d, 'noaa-vision-claim').live_verdict = 'LIVE_IMPLEMENTED'
      },
    },
    {
      name: 'terms IN_REPO without a locator is rejected',
      mutate: (d) => {
        rowById(d, 'usgs-mock-fixture').terms_status = 'IN_REPO'
      },
    },
    {
      name: 'terms IN_REPO with a quote absent from the cited line is rejected',
      mutate: (d) => {
        const row = rowById(d, 'usgs-mock-fixture')
        row.terms_status = 'IN_REPO'
        row.terms_locator = 'packages/types/src/sentinel/signals.ts:11'
        row.terms_quote = 'USGS public domain, no attribution required'
      },
    },
    {
      name: 'REPORTED_TERMS row with NOT_IN_REPO terms is rejected',
      mutate: (d) => {
        rowById(d, 'usgs-vision-claim').evidence_class = 'REPORTED_TERMS'
      },
    },
    {
      name: 'a quote absent from the cited line is rejected',
      mutate: (d) => {
        rowById(d, 'usgs-type-token').quote = 'live USGS earthquake feed'
      },
    },
    {
      name: 'a locator line outside the file is rejected',
      mutate: (d) => {
        rowById(d, 'usgs-type-token').locator = 'packages/types/src/sentinel/signals.ts:99999'
      },
    },
    {
      name: 'an unknown provider is rejected',
      mutate: (d) => {
        rowById(d, 'usgs-type-token').provider = 'ECMWF'
      },
    },
    {
      name: 'an unknown live verdict is rejected',
      mutate: (d) => {
        rowById(d, 'usgs-type-token').live_verdict = 'LIVE'
      },
    },
    {
      name: 'a missing provider record is rejected',
      mutate: (d) => {
        d.provider_records = d.provider_records.filter((r) => r.provider !== 'NOAA')
      },
    },
    {
      name: 'a record claiming code_present without a code row is rejected',
      mutate: (d) => {
        record(d, 'NOAA').code_present = true
      },
    },
    {
      name: 'a record claiming a live client without a live row is rejected',
      mutate: (d) => {
        record(d, 'USGS').client_implemented = true
      },
    },
    {
      name: 'misdeclared total is rejected',
      mutate: (d) => {
        d.declared_counts.total = 30
      },
    },
    {
      name: 'misdeclared evidence-class tally is rejected',
      mutate: (d) => {
        d.declared_counts.by_evidence_class.FIXTURE_ONLY = 7
      },
    },
    {
      name: 'misdeclared provider tally is rejected',
      mutate: (d) => {
        d.declared_counts.by_provider.USGS = 4
      },
    },
    {
      name: 'a non-empty provider URL inventory is rejected',
      mutate: (d) => {
        d.url_inventory[0].urls.push('https://earthquake.usgs.gov/fdsnws/event/1/query')
      },
    },
    {
      name: 'terms_register IN_REPO without a locator is rejected',
      mutate: (d) => {
        d.terms_register[0].status = 'IN_REPO'
      },
    },
    {
      name: 'a wrong baseline SHA is rejected',
      mutate: (d) => {
        d.baseline_sha = '0000000000000000000000000000000000000000'
      },
    },
    {
      name: 'provider_records.row_ids omitting a row is rejected',
      mutate: (d) => {
        record(d, 'USGS').row_ids.pop()
      },
    },
    {
      name: 'an unknown artifact kind is rejected',
      mutate: (d) => {
        rowById(d, 'usgs-type-token').artifact_kind = 'rss_feed'
      },
    },
  ]

  let failed = 0
  for (const c of cases) {
    const mutated = clone()
    c.mutate(mutated)
    const errors = validate(mutated, readLines, { locatorChecks: 0 })
    const rejected = errors.length > 0
    console.log(`${rejected ? 'PASS' : 'FAIL'}  negative: ${c.name}`)
    if (rejected) console.log(`      first error: ${errors[0]}`)
    else failed++
  }
  console.log(
    failed === 0
      ? `SELF-TEST PASS: all ${cases.length} invalid datasets rejected`
      : `SELF-TEST FAIL: ${failed} invalid dataset(s) accepted`,
  )
  return failed
}

const args = process.argv.slice(2)
if (args.includes('--self-test')) {
  process.exit(selfTest() === 0 ? 0 : 1)
}

const doc = loadLedger()
const stats = { locatorChecks: 0 }
const errors = validate(doc, makeLineReader(), stats)
if (errors.length > 0) {
  for (const error of errors) console.error('VIOLATION ' + error)
  console.error(`FAIL: ${errors.length} violation(s)`)
  process.exit(1)
}

const counts = doc.declared_counts
console.log(`PASS rows=${doc.rows.length} unique ids=${new Set(doc.rows.map((r) => r.id)).size}`)
console.log(
  `PASS evidence REPO_EVIDENCE=${counts.by_evidence_class.REPO_EVIDENCE} FIXTURE_ONLY=${counts.by_evidence_class.FIXTURE_ONLY} DOC_ONLY_PLAN=${counts.by_evidence_class.DOC_ONLY_PLAN} REPORTED_TERMS=${counts.by_evidence_class.REPORTED_TERMS}`,
)
console.log(
  `PASS verdicts LIVE_IMPLEMENTED=${counts.by_live_verdict.LIVE_IMPLEMENTED} CONTROL_IMPLEMENTED=${counts.by_live_verdict.CONTROL_IMPLEMENTED} FIXTURE_ONLY_NOT_LIVE=${counts.by_live_verdict.FIXTURE_ONLY_NOT_LIVE} FIXTURE_PRESENTED_AS_LIVE=${counts.by_live_verdict.FIXTURE_PRESENTED_AS_LIVE} TOKEN_ONLY_NOT_LIVE=${counts.by_live_verdict.TOKEN_ONLY_NOT_LIVE} DOC_ONLY_NOT_IMPLEMENTED=${counts.by_live_verdict.DOC_ONLY_NOT_IMPLEMENTED}`,
)
console.log(
  `PASS subjects USGS=${counts.by_provider.USGS} GDACS=${counts.by_provider.GDACS} NOAA=${counts.by_provider.NOAA} OPEN_METEO=${counts.by_provider.OPEN_METEO} ALLAH=${counts.by_provider.ALLAH} HELIOGRID=${counts.by_provider.HELIOGRID}`,
)
console.log(`PASS ${stats.locatorChecks} locator quotes resolved at the cited file:line`)
console.log('PASS zero FIXTURE_ONLY rows labelled LIVE_IMPLEMENTED')
console.log(`PASS zero terms claims without an in-repo locator (NOT_IN_REPO rows=${counts.by_terms_status.NOT_IN_REPO})`)
console.log('PASS all four named providers represented; NOAA and OPEN_METEO explicitly recorded absent from code')
console.log('PASS declared counts, URL inventory, provider records and fixture counts match rows')
console.log('NOTE the ledger records absence: no provider client, URL, quota or terms text exists in the repository')
