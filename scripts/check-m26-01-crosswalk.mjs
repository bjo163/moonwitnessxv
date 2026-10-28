#!/usr/bin/env node
/**
 * scripts/check-m26-01-crosswalk.mjs
 *
 * M26-01 gate: the 99 chapter slots are indexed, every row carries a source
 * status, and no row claims VERIFIED_SOURCE without a named source locator.
 *
 * What this proves:
 *   1. The crosswalk has exactly 99 rows with unique slots 1-99 (no padding).
 *   2. Every slot label is byte-identical to the editorial index in
 *      docs/vision/MASTER_VISION_NARRATIVE_XV.md section 21, and every
 *      label_source line number points at the line holding that label.
 *   3. Every row has a status from the declared enum.
 *   4. VERIFIED_SOURCE requires both source_version and source_locator, and a
 *      zero-claim dataset is accepted because "no fabricated manuscript".
 *   5. NEEDS_SOURCE carries at least one cited gap_evidence entry;
 *      LABEL_ONLY carries none; declared counts match the rows.
 *   6. No duplicate normalised label is silently merged.
 *
 * What this does not prove: that any chapter has a manuscript. A label is an
 * editorial index entry, and 99 labels are not 99 manuscripts.
 *
 * Run:            node scripts/check-m26-01-crosswalk.mjs
 * Negative test:  node scripts/check-m26-01-crosswalk.mjs --self-test
 *
 * Exit 0 when clean, 1 on any violation. No third-party dependencies.
 */

import { readFileSync } from 'node:fs'

const CROSSWALK = 'docs/data/M26-01-chapter-crosswalk.json'
const SOURCE = 'docs/vision/MASTER_VISION_NARRATIVE_XV.md'
const STATUSES = ['VERIFIED_SOURCE', 'LABEL_ONLY', 'NEEDS_SOURCE']

function parseSourceIndex(text) {
  const lines = text.split(/\r?\n/)
  const start = lines.findIndex((l) => l.startsWith('# 21 — The 99-chapter'))
  const end = lines.findIndex((l) => l.startsWith('# 21A —'))
  if (start < 0 || end < 0) {
    return { error: 'section 21 boundaries not found in ' + SOURCE, entries: [] }
  }
  const entries = []
  let band = null
  for (let i = start; i < end; i++) {
    const heading = lines[i].match(/^## ([IVX]+)\. (.+?) \((\d{2})(?:–(\d{2}))?\)\s*$/)
    if (heading) {
      band = { id: heading[1], from: Number(heading[3]), to: Number(heading[4] ?? heading[3]) }
      continue
    }
    if (!/^\d{2} /.test(lines[i])) continue
    for (const part of lines[i].replace(/\.\s*$/, '').split(' · ')) {
      const m = part.match(/^(\d{2}) (.+)$/)
      if (!m) continue
      entries.push({
        slot: Number(m[1]),
        label: m[2].trim(),
        band_id: band ? band.id : null,
        line: i + 1,
      })
    }
  }
  return { entries }
}

function normalise(label) {
  return String(label)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function validate(doc, sourceEntries) {
  const errors = []
  const rows = Array.isArray(doc.rows) ? doc.rows : []
  const fail = (msg) => errors.push(msg)

  if (rows.length !== 99) fail(`row count ${rows.length} !== 99`)
  if (sourceEntries.length !== 99) fail(`source index count ${sourceEntries.length} !== 99`)

  const slots = new Set()
  for (const row of rows) {
    if (!Number.isInteger(row.slot) || row.slot < 1 || row.slot > 99) {
      fail(`slot ${JSON.stringify(row.slot)} is not an integer 1-99`)
      continue
    }
    if (slots.has(row.slot)) fail(`duplicate slot ${row.slot}`)
    slots.add(row.slot)
  }
  for (let s = 1; s <= 99; s++) if (!slots.has(s)) fail(`missing slot ${s}`)

  const bySlot = new Map(sourceEntries.map((e) => [e.slot, e]))
  for (const row of rows) {
    const src = bySlot.get(row.slot)
    if (!src) {
      fail(`slot ${row.slot} has no source label`)
      continue
    }
    if (row.label !== src.label) {
      fail(`slot ${row.slot} label ${JSON.stringify(row.label)} !== source ${JSON.stringify(src.label)}`)
    }
    if (row.label_source !== `${SOURCE}:${src.line}`) {
      fail(`slot ${row.slot} label_source ${JSON.stringify(row.label_source)} !== ${SOURCE}:${src.line}`)
    }
    if (row.band_id !== src.band_id) {
      fail(`slot ${row.slot} band ${JSON.stringify(row.band_id)} !== source band ${src.band_id}`)
    }
  }

  for (const row of rows) {
    if (!STATUSES.includes(row.source_status)) {
      fail(`slot ${row.slot} status ${JSON.stringify(row.source_status)} is not in ${STATUSES.join('|')}`)
    }
    const evidence = Array.isArray(row.gap_evidence) ? row.gap_evidence : null
    if (evidence === null) fail(`slot ${row.slot} gap_evidence is not an array`)
    if (row.source_status === 'VERIFIED_SOURCE') {
      if (!row.source_locator || String(row.source_locator).trim() === '') {
        fail(`slot ${row.slot} claims VERIFIED_SOURCE without source_locator`)
      }
      if (!row.source_version || String(row.source_version).trim() === '') {
        fail(`slot ${row.slot} claims VERIFIED_SOURCE without source_version`)
      }
    } else if (row.source_locator !== null || row.source_version !== null) {
      fail(`slot ${row.slot} is ${row.source_status} but carries source_locator/source_version`)
    }
    if (row.source_status === 'NEEDS_SOURCE' && (!evidence || evidence.length === 0)) {
      fail(`slot ${row.slot} is NEEDS_SOURCE without gap_evidence`)
    }
    if (row.source_status === 'LABEL_ONLY' && evidence && evidence.length > 0) {
      fail(`slot ${row.slot} is LABEL_ONLY but carries gap_evidence`)
    }
    for (const item of evidence ?? []) {
      if (!item.locator || !item.note) fail(`slot ${row.slot} has gap_evidence without locator+note`)
    }
  }

  const seen = new Map()
  for (const row of rows) {
    const key = normalise(row.label)
    if (seen.has(key)) {
      if (row.duplicate_label_ack !== true) {
        fail(`duplicate label ${JSON.stringify(row.label)} at slots ${seen.get(key)}+${row.slot} silently merged`)
      }
    } else {
      seen.set(key, row.slot)
    }
  }

  const tally = Object.fromEntries(STATUSES.map((s) => [s, 0]))
  for (const row of rows) if (tally[row.source_status] !== undefined) tally[row.source_status]++
  const declared = doc.counts && doc.counts.by_status ? doc.counts.by_status : {}
  for (const s of STATUSES) {
    if (declared[s] !== tally[s]) fail(`declared count ${s}=${declared[s]} !== rows ${tally[s]}`)
  }
  if (doc.counts && doc.counts.total !== rows.length) {
    fail(`declared total ${doc.counts.total} !== rows ${rows.length}`)
  }

  return errors
}

function load() {
  const doc = JSON.parse(readFileSync(CROSSWALK, 'utf8'))
  const { entries, error } = parseSourceIndex(readFileSync(SOURCE, 'utf8'))
  if (error) throw new Error(error)
  return { doc, entries }
}

function selfTest() {
  const { doc, entries } = load()
  const clone = () => JSON.parse(JSON.stringify(doc))
  const cases = [
    {
      name: 'VERIFIED_SOURCE with empty source_locator is rejected',
      mutate: (d) => {
        d.rows[0].source_status = 'VERIFIED_SOURCE'
        d.rows[0].source_version = null
        d.rows[0].source_locator = null
      },
    },
    {
      name: 'VERIFIED_SOURCE with locator but no source_version is rejected',
      mutate: (d) => {
        d.rows[0].source_status = 'VERIFIED_SOURCE'
        d.rows[0].source_locator = 'somewhere'
        d.rows[0].source_version = null
      },
    },
    {
      name: 'duplicate slot is rejected',
      mutate: (d) => {
        d.rows[1].slot = d.rows[0].slot
      },
    },
    {
      name: 'padded extra row is rejected',
      mutate: (d) => {
        d.rows.push({ ...d.rows[98] })
      },
    },
    {
      name: 'fabricated label that is not in the source is rejected',
      mutate: (d) => {
        d.rows[10].label = 'The Invented Chapter'
      },
    },
    {
      name: 'missing status is rejected',
      mutate: (d) => {
        delete d.rows[20].source_status
      },
    },
    {
      name: 'NEEDS_SOURCE without gap_evidence is rejected',
      mutate: (d) => {
        const row = d.rows.find((r) => r.source_status === 'NEEDS_SOURCE')
        row.gap_evidence = []
      },
    },
    {
      name: 'misdeclared counts are rejected',
      mutate: (d) => {
        d.counts.by_status.LABEL_ONLY = 64
      },
    },
    {
      name: 'duplicate label silently merged is rejected',
      // Mutating both the row and the parsed source keeps every other check
      // green, so only the duplicate-label rule can reject this dataset.
      mutate: (d, e) => {
        d.rows[1].label = d.rows[0].label
        d.rows[1].label_source = d.rows[0].label_source
        e[1].label = e[0].label
        e[1].line = e[0].line
      },
    },
  ]

  let failed = 0
  for (const c of cases) {
    const mutated = clone()
    const mutatedEntries = JSON.parse(JSON.stringify(entries))
    c.mutate(mutated, mutatedEntries)
    const errors = validate(mutated, mutatedEntries)
    const rejected = errors.length > 0
    console.log(`${rejected ? 'PASS' : 'FAIL'}  negative: ${c.name}`)
    if (rejected) console.log(`      first error: ${errors[0]}`)
    else failed++
  }
  return failed
}

const args = process.argv.slice(2)
if (args.includes('--self-test')) {
  const failed = selfTest()
  console.log(failed === 0 ? 'SELF-TEST PASS: all invalid datasets rejected' : `SELF-TEST FAIL: ${failed} invalid dataset(s) accepted`)
  process.exit(failed === 0 ? 0 : 1)
}

const { doc, entries } = load()
const errors = validate(doc, entries)
if (errors.length > 0) {
  for (const e of errors) console.error('VIOLATION ' + e)
  console.error(`FAIL: ${errors.length} violation(s)`)
  process.exit(1)
}

const tally = doc.counts.by_status
console.log(`PASS slots=1-99 unique rows=${doc.rows.length} labels_match_source=99/99`)
console.log(`PASS statuses VERIFIED_SOURCE=${tally.VERIFIED_SOURCE} LABEL_ONLY=${tally.LABEL_ONLY} NEEDS_SOURCE=${tally.NEEDS_SOURCE}`)
console.log('PASS zero VERIFIED_SOURCE rows without a named source_locator (no manuscript claimed)')
console.log('PASS no duplicate labels silently merged')
