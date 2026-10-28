/**
 * M23-04 — Empire taxonomy metadata index.
 *
 * Scope: index what this repository evidences about the three Empire
 * taxonomies while keeping them separate. The kinds are:
 *   - `prime-code` — nine project-authored human-governance principles
 *     (MASTER_VISION_NARRATIVE_XV §12.1).
 *   - `wings` — ten fictional/specialist organizational labels
 *     (MASTER_VISION_NARRATIVE_XV §21A.6 "Ten WINGS names preserved from V10.1").
 *   - `god99` — fictional organizational duty/persona slots. Only three slot
 *     ids are evidenced in this repository; the remaining 96 are recorded as
 *     a gap and are not invented here.
 *
 * Every entry is `authority: 'metadata-only'`. Nothing in this module creates
 * an actor, office, role, permission, session, agent or identity binding, and
 * no entry may be projected into runtime authorization. `labels.id` values for
 * the English Prime Code table are display translations, not source
 * quotations; proper names are left in their source form.
 *
 * Baseline source snapshot: eb3b9f085da73e1e19d8686d467dab95c2b7d13e.
 */

export const EMPIRE_TAXONOMY_KINDS = ['prime-code', 'wings', 'god99'] as const
export type EmpireTaxonomyKind = (typeof EMPIRE_TAXONOMY_KINDS)[number]

export const EMPIRE_TAXONOMY_AUTHORITY = 'metadata-only' as const
export type EmpireTaxonomyAuthority = typeof EMPIRE_TAXONOMY_AUTHORITY

export interface EmpireTaxonomySourceLocator {
  /** Repository-relative document path. */
  readonly file: string
  /** Document section heading (and, where useful, the quoted sub-heading). */
  readonly section: string
  /** One-based line in the baseline snapshot. */
  readonly line: number
}

export interface EmpireTaxonomyEntry {
  readonly kind: EmpireTaxonomyKind
  readonly id: string
  readonly ordinal: number
  readonly labels: { readonly en: string; readonly id: string }
  readonly source: EmpireTaxonomySourceLocator
  readonly corroboratingSources?: readonly EmpireTaxonomySourceLocator[]
  readonly sourceNote?: string
  readonly authority: EmpireTaxonomyAuthority
}

export interface EmpireTaxonomyGap {
  readonly kind: EmpireTaxonomyKind
  readonly expected: number
  readonly evidenced: number
  readonly missing: number
  readonly note: string
}

export interface EmpireTaxonomyIndex {
  readonly schemaVersion: string
  readonly authority: EmpireTaxonomyAuthority
  readonly kinds: readonly EmpireTaxonomyKind[]
  readonly entries: readonly EmpireTaxonomyEntry[]
  readonly gaps: readonly EmpireTaxonomyGap[]
}

export const EMPIRE_TAXONOMY_EXPECTED_COUNTS: Readonly<Record<EmpireTaxonomyKind, number>> = {
  'prime-code': 9,
  wings: 10,
  god99: 99,
}

export const EMPIRE_TAXONOMY_EVIDENCED_COUNTS: Readonly<Record<EmpireTaxonomyKind, number>> = {
  'prime-code': 9,
  wings: 10,
  god99: 3,
}

const VISION = 'docs/vision/MASTER_VISION_NARRATIVE_XV.md'
const ADR_0006 = 'docs/decisions/ADR-0006-skylink-communication-surface.md'
const ADR_0007 = 'docs/decisions/ADR-0007-echolog-storage.md'
const PRIME_CODE_SECTION = '12.1 The Prime Code — nine human-governance principles'
const WINGS_SECTION = '21A.6 — Ten WINGS names preserved from V10.1'

const PRIME_CODE_SOURCE = (line: number): EmpireTaxonomySourceLocator => ({
  file: VISION,
  section: PRIME_CODE_SECTION,
  line,
})

const WINGS_SOURCE = (line = 898): EmpireTaxonomySourceLocator => ({
  file: VISION,
  section: WINGS_SECTION,
  line,
})

export const EMPIRE_TAXONOMY_INDEX = {
  schemaVersion: '1.0.0',
  authority: EMPIRE_TAXONOMY_AUTHORITY,
  kinds: EMPIRE_TAXONOMY_KINDS,
  entries: [
    // ---------------------------------------------------------------------
    // Prime Code: all nine values are named in the §12.1 table.
    // ---------------------------------------------------------------------
    {
      kind: 'prime-code',
      id: 'PC01',
      ordinal: 1,
      labels: { en: 'Source Integrity', id: 'Integritas Sumber' },
      source: PRIME_CODE_SOURCE(412),
      authority: EMPIRE_TAXONOMY_AUTHORITY,
    },
    {
      kind: 'prime-code',
      id: 'PC02',
      ordinal: 2,
      labels: { en: 'Truth & Evidence', id: 'Kebenaran & Bukti' },
      source: PRIME_CODE_SOURCE(413),
      authority: EMPIRE_TAXONOMY_AUTHORITY,
    },
    {
      kind: 'prime-code',
      id: 'PC03',
      ordinal: 3,
      labels: { en: 'Human Agency', id: 'Agensi Manusia' },
      source: PRIME_CODE_SOURCE(414),
      authority: EMPIRE_TAXONOMY_AUTHORITY,
    },
    {
      kind: 'prime-code',
      id: 'PC04',
      ordinal: 4,
      labels: { en: 'Trust & Responsibility', id: 'Kepercayaan & Tanggung Jawab' },
      source: PRIME_CODE_SOURCE(415),
      authority: EMPIRE_TAXONOMY_AUTHORITY,
    },
    {
      kind: 'prime-code',
      id: 'PC05',
      ordinal: 5,
      labels: { en: 'Consultation', id: 'Konsultasi' },
      source: PRIME_CODE_SOURCE(416),
      authority: EMPIRE_TAXONOMY_AUTHORITY,
    },
    {
      kind: 'prime-code',
      id: 'PC06',
      ordinal: 6,
      labels: { en: 'Fairness & Justice', id: 'Kewajaran & Keadilan' },
      source: PRIME_CODE_SOURCE(417),
      authority: EMPIRE_TAXONOMY_AUTHORITY,
    },
    {
      kind: 'prime-code',
      id: 'PC07',
      ordinal: 7,
      labels: { en: 'Compassion & Protection', id: 'Kasih Sayang & Perlindungan' },
      source: PRIME_CODE_SOURCE(418),
      authority: EMPIRE_TAXONOMY_AUTHORITY,
    },
    {
      kind: 'prime-code',
      id: 'PC08',
      ordinal: 8,
      labels: { en: 'Restoration & Renewal', id: 'Restorasi & Pembaruan' },
      source: PRIME_CODE_SOURCE(419),
      authority: EMPIRE_TAXONOMY_AUTHORITY,
    },
    {
      kind: 'prime-code',
      id: 'PC09',
      ordinal: 9,
      labels: { en: 'Continuity', id: 'Kesinambungan' },
      source: PRIME_CODE_SOURCE(420),
      authority: EMPIRE_TAXONOMY_AUTHORITY,
    },

    // ---------------------------------------------------------------------
    // WINGS: all ten labels are named in the ordered V10.1 list. Only W01,
    // W02 and W07 unit codes are individually attested; the other codes are
    // derived from list order and are marked as such.
    // ---------------------------------------------------------------------
    {
      kind: 'wings',
      id: 'W01',
      ordinal: 1,
      labels: { en: 'SKYLINK', id: 'SKYLINK' },
      source: WINGS_SOURCE(900),
      corroboratingSources: [{ file: ADR_0006, section: 'Decision — Name', line: 8 }],
      sourceNote: 'First in the V10.1 list; W01 code attested by the §21A.6 cross-reference and ADR-0006.',
      authority: EMPIRE_TAXONOMY_AUTHORITY,
    },
    {
      kind: 'wings',
      id: 'W02',
      ordinal: 2,
      labels: { en: 'RAINMAKERS', id: 'RAINMAKERS' },
      source: WINGS_SOURCE(),
      corroboratingSources: [{ file: ADR_0007, section: 'Consequences — Rejected bullet', line: 60 }],
      sourceNote: 'Second in the V10.1 list; W02 code is attested only by the ADR-0007 rejection note (`W02/GOD-017`).',
      authority: EMPIRE_TAXONOMY_AUTHORITY,
    },
    {
      kind: 'wings',
      id: 'W03',
      ordinal: 3,
      labels: { en: 'LAST SIGNAL', id: 'LAST SIGNAL' },
      source: WINGS_SOURCE(),
      sourceNote: 'Third in the V10.1 list; W03 code is derived from list order only.',
      authority: EMPIRE_TAXONOMY_AUTHORITY,
    },
    {
      kind: 'wings',
      id: 'W04',
      ordinal: 4,
      labels: { en: 'SOFT LANDING', id: 'SOFT LANDING' },
      source: WINGS_SOURCE(),
      sourceNote: 'Fourth in the V10.1 list; W04 code is derived from list order only.',
      authority: EMPIRE_TAXONOMY_AUTHORITY,
    },
    {
      kind: 'wings',
      id: 'W05',
      ordinal: 5,
      labels: { en: 'QUESTION ZERO', id: 'QUESTION ZERO' },
      source: WINGS_SOURCE(),
      sourceNote: 'Fifth in the V10.1 list; W05 code is derived from list order only.',
      authority: EMPIRE_TAXONOMY_AUTHORITY,
    },
    {
      kind: 'wings',
      id: 'W06',
      ordinal: 6,
      labels: { en: 'DOUBLE CHECK', id: 'DOUBLE CHECK' },
      source: WINGS_SOURCE(),
      sourceNote: 'Sixth in the V10.1 list; W06 code is derived from list order only.',
      authority: EMPIRE_TAXONOMY_AUTHORITY,
    },
    {
      kind: 'wings',
      id: 'W07',
      ordinal: 7,
      labels: { en: 'ECHOLOG', id: 'ECHOLOG' },
      source: WINGS_SOURCE(902),
      corroboratingSources: [{ file: ADR_0007, section: 'Decision — Name', line: 14 }],
      sourceNote: 'Seventh in the V10.1 list; W07 code attested by the §21A.6 cross-reference and ADR-0007.',
      authority: EMPIRE_TAXONOMY_AUTHORITY,
    },
    {
      kind: 'wings',
      id: 'W08',
      ordinal: 8,
      labels: { en: 'LEDGER PUNK', id: 'LEDGER PUNK' },
      source: WINGS_SOURCE(),
      corroboratingSources: [{ file: ADR_0007, section: 'Consequences — Rejected bullet', line: 60 }],
      sourceNote: 'Eighth in the V10.1 list; name also appears in the ADR-0007 rejection note without a code.',
      authority: EMPIRE_TAXONOMY_AUTHORITY,
    },
    {
      kind: 'wings',
      id: 'W09',
      ordinal: 9,
      labels: { en: 'FIREWALL', id: 'FIREWALL' },
      source: WINGS_SOURCE(),
      sourceNote: 'Ninth in the V10.1 list; W09 code is derived from list order only.',
      authority: EMPIRE_TAXONOMY_AUTHORITY,
    },
    {
      kind: 'wings',
      id: 'W10',
      ordinal: 10,
      labels: { en: 'HAVEN', id: 'HAVEN' },
      source: WINGS_SOURCE(),
      corroboratingSources: [{ file: ADR_0007, section: 'Consequences — Rejected bullet', line: 60 }],
      sourceNote: 'Tenth in the V10.1 list; name also appears in the ADR-0007 rejection note without a code.',
      authority: EMPIRE_TAXONOMY_AUTHORITY,
    },

    // ---------------------------------------------------------------------
    // G.O.D. 99: only three slots are referenced in this repository. These
    // are slot-id metadata, not persons, deities, angels, agents or offices.
    // ---------------------------------------------------------------------
    {
      kind: 'god99',
      id: 'GOD-017',
      ordinal: 17,
      labels: { en: 'GOD-017', id: 'GOD-017' },
      source: { file: ADR_0007, section: 'Consequences — Rejected bullet', line: 60 },
      sourceNote: 'Only occurrence links GOD-017 to W02 RAINMAKERS in a rejected-name note. No persona label is evidenced; the slot id is the only label.',
      authority: EMPIRE_TAXONOMY_AUTHORITY,
    },
    {
      kind: 'god99',
      id: 'GOD-049',
      ordinal: 49,
      labels: { en: 'GOD-049', id: 'GOD-049' },
      source: WINGS_SOURCE(900),
      corroboratingSources: [{ file: ADR_0006, section: 'Decision — Name', line: 8 }],
      sourceNote: 'Only occurrence is the W01 SKYLINK proposed lead slot reference. No persona label is evidenced; the slot id is the only label.',
      authority: EMPIRE_TAXONOMY_AUTHORITY,
    },
    {
      kind: 'god99',
      id: 'GOD-050',
      ordinal: 50,
      labels: { en: 'FIELD WITNESS', id: 'SAKSI LAPANGAN' },
      source: WINGS_SOURCE(902),
      corroboratingSources: [{ file: ADR_0007, section: 'Decision — Name', line: 14 }],
      sourceNote: 'Only occurrence is the W07 ECHOLOG lead slot reference, where `FIELD WITNESS` is the source label. Department and duty fields are deliberately not indexed.',
      authority: EMPIRE_TAXONOMY_AUTHORITY,
    },
  ],
  gaps: [
    {
      kind: 'prime-code',
      expected: EMPIRE_TAXONOMY_EXPECTED_COUNTS['prime-code'],
      evidenced: EMPIRE_TAXONOMY_EVIDENCED_COUNTS['prime-code'],
      missing: EMPIRE_TAXONOMY_EXPECTED_COUNTS['prime-code'] - EMPIRE_TAXONOMY_EVIDENCED_COUNTS['prime-code'],
      note: 'All nine principles are named in the §12.1 table. No member gap.',
    },
    {
      kind: 'wings',
      expected: EMPIRE_TAXONOMY_EXPECTED_COUNTS.wings,
      evidenced: EMPIRE_TAXONOMY_EVIDENCED_COUNTS.wings,
      missing: EMPIRE_TAXONOMY_EXPECTED_COUNTS.wings - EMPIRE_TAXONOMY_EVIDENCED_COUNTS.wings,
      note: 'All ten labels are named in the ordered V10.1 list. Only W01, W02 and W07 codes are individually attested; the other seven codes are derived from list order and are source-attestation gaps, not member gaps.',
    },
    {
      kind: 'god99',
      expected: EMPIRE_TAXONOMY_EXPECTED_COUNTS.god99,
      evidenced: EMPIRE_TAXONOMY_EVIDENCED_COUNTS.god99,
      missing: EMPIRE_TAXONOMY_EXPECTED_COUNTS.god99 - EMPIRE_TAXONOMY_EVIDENCED_COUNTS.god99,
      note: 'Only GOD-017, GOD-049 and GOD-050 are referenced in this repository. The other 96 slots are not enumerated here and are not invented. GOD99 is a fictional duty-slot taxonomy, not 99 deities or agents.',
    },
  ],
} as const satisfies EmpireTaxonomyIndex

/**
 * The complete entry surface. Any other key is rejected by the validator so a
 * later convenience field cannot silently become an actor or privilege binding.
 */
export const EMPIRE_TAXONOMY_ENTRY_KEYS = [
  'kind',
  'id',
  'ordinal',
  'labels',
  'source',
  'corroboratingSources',
  'sourceNote',
  'authority',
] as const

const ENTRY_KEY_SET = new Set<string>(EMPIRE_TAXONOMY_ENTRY_KEYS)

/**
 * Fields that would turn a metadata row into an actor, office, privilege or
 * agent binding. They are forbidden anywhere in an index entry.
 */
export const EMPIRE_TAXONOMY_FORBIDDEN_FIELDS = [
  'role',
  'roles',
  'permission',
  'permissions',
  'agent',
  'agents',
  'identity',
  'identities',
  'credential',
  'credentials',
  'grant',
  'grants',
  'scope',
  'scopes',
  'office',
  'offices',
  'actor',
  'actors',
  'team',
  'teams',
  'persona',
  'personas',
  'department',
  'departments',
  'dept',
  'unit',
  'unitType',
  'proposedLeadPersonaSlot',
  'authorityLimit',
] as const

const FORBIDDEN_FIELD_SET = new Set<string>(
  EMPIRE_TAXONOMY_FORBIDDEN_FIELDS.map((field) => field.toLowerCase()),
)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new TypeError(message)
}

function assertKind(value: unknown, context: string): asserts value is EmpireTaxonomyKind {
  assert(
    typeof value === 'string' && (EMPIRE_TAXONOMY_KINDS as readonly string[]).includes(value),
    `${context} must be one of ${EMPIRE_TAXONOMY_KINDS.join(', ')}`,
  )
}

function assertNonEmptyString(value: unknown, context: string): asserts value is string {
  assert(typeof value === 'string' && value.trim() !== '', `${context} must be a non-empty string`)
}

function assertPositiveInteger(value: unknown, context: string): asserts value is number {
  assert(typeof value === 'number' && Number.isInteger(value) && value > 0, `${context} must be a positive integer`)
}

function findForbiddenFields(value: unknown, path: string, found: string[]): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => findForbiddenFields(item, `${path}[${index}]`, found))
    return
  }
  if (!isRecord(value)) return
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_FIELD_SET.has(key.toLowerCase())) found.push(`${path}.${key}`)
    findForbiddenFields(child, `${path}.${key}`, found)
  }
}

/**
 * Throws unless the candidate is a well-formed, metadata-only index:
 * three distinct kinds, unique ids that never cross kinds, no forbidden
 * actor/role/permission/agent/identity fields, and arithmetic-friendly gap
 * records that match the evidenced and expected counts.
 */
export function validateEmpireTaxonomyIndex(candidate: unknown): asserts candidate is EmpireTaxonomyIndex {
  assert(isRecord(candidate), 'EMPIRE_TAXONOMY_INDEX must be an object')
  assertNonEmptyString(candidate.schemaVersion, 'schemaVersion')
  assert(
    candidate.authority === EMPIRE_TAXONOMY_AUTHORITY,
    `index authority must be ${EMPIRE_TAXONOMY_AUTHORITY}`,
  )

  assert(Array.isArray(candidate.kinds), 'kinds must be an array')
  assert(candidate.kinds.length === EMPIRE_TAXONOMY_KINDS.length, 'kinds must contain exactly three kinds')
  for (const kind of EMPIRE_TAXONOMY_KINDS) {
    assert(candidate.kinds.includes(kind), `kinds is missing ${kind}`)
  }

  assert(Array.isArray(candidate.entries), 'entries must be an array')

  const seen = new Map<string, EmpireTaxonomyKind>()
  const counts: Record<EmpireTaxonomyKind, number> = { 'prime-code': 0, wings: 0, god99: 0 }

  for (const [index, rawEntry] of candidate.entries.entries()) {
    const context = `entries[${index}]`
    assert(isRecord(rawEntry), `${context} must be an object`)

    const forbidden: string[] = []
    findForbiddenFields(rawEntry, context, forbidden)
    assert(forbidden.length === 0, `forbidden privilege/agent fields: ${forbidden.join(', ')}`)

    for (const key of Object.keys(rawEntry)) {
      assert(ENTRY_KEY_SET.has(key), `${context} has unexpected field ${key}`)
    }

    const kind = rawEntry.kind
    assertKind(kind, `${context}.kind`)

    assertNonEmptyString(rawEntry.id, `${context}.id`)
    const id = rawEntry.id
    const priorKind = seen.get(id)
    if (priorKind !== undefined) {
      assert(priorKind === kind, `${context}.id "${id}" is merged across kinds (${priorKind} vs ${kind})`)
      throw new TypeError(`${context}.id "${id}" is duplicated within kind ${kind}`)
    }
    seen.set(id, kind)

    assertPositiveInteger(rawEntry.ordinal, `${context}.ordinal`)

    const labels = rawEntry.labels
    assert(isRecord(labels), `${context}.labels must be an object`)
    assertNonEmptyString(labels.en, `${context}.labels.en`)
    assertNonEmptyString(labels.id, `${context}.labels.id`)

    const source = rawEntry.source
    assert(isRecord(source), `${context}.source must be an object`)
    assertNonEmptyString(source.file, `${context}.source.file`)
    assertNonEmptyString(source.section, `${context}.source.section`)
    assertPositiveInteger(source.line, `${context}.source.line`)

    if (rawEntry.corroboratingSources !== undefined) {
      assert(Array.isArray(rawEntry.corroboratingSources), `${context}.corroboratingSources must be an array`)
      for (const [sourceIndex, rawSource] of rawEntry.corroboratingSources.entries()) {
        const sourceContext = `${context}.corroboratingSources[${sourceIndex}]`
        assert(isRecord(rawSource), `${sourceContext} must be an object`)
        assertNonEmptyString(rawSource.file, `${sourceContext}.file`)
        assertNonEmptyString(rawSource.section, `${sourceContext}.section`)
        assertPositiveInteger(rawSource.line, `${sourceContext}.line`)
      }
    }

    assert(
      rawEntry.authority === EMPIRE_TAXONOMY_AUTHORITY,
      `${context}.authority must be ${EMPIRE_TAXONOMY_AUTHORITY}`,
    )

    counts[kind] += 1
  }

  for (const kind of EMPIRE_TAXONOMY_KINDS) {
    assert(
      counts[kind] === EMPIRE_TAXONOMY_EVIDENCED_COUNTS[kind],
      `${kind} must have ${EMPIRE_TAXONOMY_EVIDENCED_COUNTS[kind]} evidenced entries, found ${counts[kind]}`,
    )
  }

  assert(Array.isArray(candidate.gaps), 'gaps must be an array')
  const gapKinds = new Set<EmpireTaxonomyKind>()
  for (const [index, rawGap] of candidate.gaps.entries()) {
    const context = `gaps[${index}]`
    assert(isRecord(rawGap), `${context} must be an object`)
    const kind = rawGap.kind
    assertKind(kind, `${context}.kind`)
    assert(!gapKinds.has(kind), `${context}.kind "${kind}" has more than one gap record`)
    gapKinds.add(kind)

    assertPositiveInteger(rawGap.expected, `${context}.expected`)
    assert(
      typeof rawGap.evidenced === 'number' && Number.isInteger(rawGap.evidenced) && rawGap.evidenced >= 0,
      `${context}.evidenced must be a non-negative integer`,
    )
    assert(
      typeof rawGap.missing === 'number' && Number.isInteger(rawGap.missing) && rawGap.missing >= 0,
      `${context}.missing must be a non-negative integer`,
    )
    assert(rawGap.expected === EMPIRE_TAXONOMY_EXPECTED_COUNTS[kind], `${context}.expected is not the declared count`)
    assert(rawGap.evidenced === counts[kind], `${context}.evidenced must equal the indexed entry count`)
    assert(rawGap.missing === rawGap.expected - rawGap.evidenced, `${context}.missing must equal expected - evidenced`)
    assertNonEmptyString(rawGap.note, `${context}.note`)
  }

  for (const kind of EMPIRE_TAXONOMY_KINDS) {
    assert(gapKinds.has(kind), `gaps is missing a record for ${kind}`)
  }
}

type Never<T extends never> = T

/**
 * Compile-time guard. If `EmpireTaxonomyEntry` ever gains a role, permission,
 * agent, identity, credential, office or scope field, `Extract` stops being
 * `never` and this alias fails typecheck.
 */
export type EmpireTaxonomyEntryRejectsPrivilegeFields = Never<
  Extract<keyof EmpireTaxonomyEntry, (typeof EMPIRE_TAXONOMY_FORBIDDEN_FIELDS)[number]>
>
