import {
  ADMIN_FULL,
  ADMIN_ONLY,
  ADMIN_WRITE,
  defineAddon,
  defineModel,
  defineView,
  int,
  m2o,
  sel,
  str,
  text,
  ts,
} from '@moonwitness/moonql'

/**
 * moonql-corpus — Domain D01 Source / Corpus Ingestion Pilot (M07)
 *
 * Implements the 4-tier citation hierarchy:
 *   1. `corpus_works`: Canonical intellectual work (e.g. "Al-Qur'an", "Kitab Zabur")
 *   2. `corpus_editions`: Pinned manuscript/recitation edition (e.g. "Hafs 'an 'Asim, Cairo 1924")
 *   3. `corpus_passages`: Granular structural address (e.g. "QS 2:82", Surah 2, Ayah 82)
 *   4. `corpus_translations`: Consented, licensed vernacular expressions (e.g. Indonesian Kemenag)
 *
 * Rights Invariant (M07-04):
 *   If rightsStatus !== 'RIGHTS_EXACT_VERSION_CLEARED', raw text access is blocked,
 *   safely exposing only canonical metadata to callers.
 */

const TRADITIONS = ['islamic', 'abrahamic', 'historical', 'philosophical'] as const
const RIGHTS_STATUSES = [
  'RIGHTS_EXACT_VERSION_CLEARED',
  'RIGHTS_UNKNOWN',
  'METADATA_ONLY',
  'RESTRICTED',
  'PUBLIC_DOMAIN',
] as const

/** M07-04: only an exact, cleared edition may serialize source bytes. */
const CLEARED = 'RIGHTS_EXACT_VERSION_CLEARED'
const BLOCKED_PLACEHOLDER = '[TEXT_BLOCKED_PENDING_RIGHTS_CLEARANCE]'

type Row = Record<string, unknown>

const nonEmpty = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null

/** Safe edition/work metadata — never carries a text field. */
function sourceMeta(edition: Row | null, work: Row | null): Record<string, string | null> {
  return {
    workCode: nonEmpty(work?.code),
    workTitle: nonEmpty(work?.title),
    originalLanguage: nonEmpty(work?.originalLanguage),
    editionCode: nonEmpty(edition?.code),
    editionName: nonEmpty(edition?.name),
    editorOrPublisher: nonEmpty(edition?.editorOrPublisher),
    rightsStatus: nonEmpty(edition?.rightsStatus) ?? 'RIGHTS_UNKNOWN',
    licenseName: nonEmpty(edition?.licenseName),
    sourceUri: nonEmpty(edition?.sourceUri),
    provenanceSha: nonEmpty(edition?.provenanceSha),
  }
}

const absent = (citation: string): Record<string, unknown> => ({
  state: 'absent',
  message: `No passage is indexed for "${citation}".`,
  citation: null,
  arabic: null,
  translations: [],
  candidates: [],
  citationText: null,
})

/** UI-P05b browse rails: one collapsed language row — identity and rights, never wording. */
type BrowseTranslation = {
  languageCode: string
  translatorName: string | null
  licenseName: string | null
  rightsStatus: string
  editionCode: string | null
  textAvailable: boolean
}

/** A rail lists addresses; it does not dump a corpus. */
const WINDOW_ROWS = 15
const WINDOW_HALF = 7
const TRANSLATION_ROWS = 20
const WINDOW_SCAN = 500
const CATALOG_SCAN = 1000

/** Names an interpretation/commentary lane would plausibly be registered under. */
const INTERPRETATION_MODELS = ['corpus_commentary', 'corpus_interpretations', 'corpus_tafsir', 'corpus_reading_notes']
const INTERPRETATION_NAME = /commentar|interpret|tafsir|exegesis/i

const intOrNull = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : null)

/** Codepoint order, so a rail's list cannot depend on the host's ICU data. */
const byString = (left: string, right: string): number => (left < right ? -1 : left > right ? 1 : 0)

/** The reader's veto, read straight off the edition row: a label like PUBLIC_DOMAIN is not clearance. */
const isCleared = (edition: Row | null): boolean => nonEmpty(edition?.rightsStatus) === CLEARED

/**
 * Is there an interpretation lane at all? Asked of the live registry rather than
 * asserted: `schema()` lists every advertised model, and `orm.model()` still resolves
 * the ones that opted out of REST — so a hidden commentary table cannot slip past.
 */
function interpretationState(
  orm: { model(name: string): unknown },
  schema: () => { models: Record<string, unknown> },
): { available: boolean; reason: string } {
  const installed = new Set(Object.keys(schema().models))
  for (const name of INTERPRETATION_MODELS) {
    try {
      orm.model(name)
      installed.add(name)
    } catch {
      // no installed addon defines it — that is the answer, not a failure
    }
  }
  const found = [...installed].filter((name) => INTERPRETATION_NAME.test(name)).sort(byString)
  if (found.length) {
    return {
      available: true,
      reason: `Interpretation is projected by ${found.join(', ')}; its wording still passes the same rights veto as any other source.`,
    }
  }
  return {
    available: false,
    reason:
      `INTERPRETATION: LABELED — no commentary/interpretation model is registered in the corpus addon. ` +
      `It owns corpus_works/corpus_editions/corpus_passages/corpus_translations only, and none of ` +
      `${INTERPRETATION_MODELS.join(', ')} exists among the ${installed.size} installed models, so this ` +
      `row may be labelled "no interpretation layer is wired up" — never "none for this verse".`,
  }
}

/** A refused browse address keeps every contract key present so a rail has nothing to invent. */
const refusedBrowse = (message: string, interpretation: { available: boolean; reason: string }): Record<string, unknown> => ({
  state: 'invalid',
  message,
  citation: '',
  edition: null,
  resolved: false,
  work: null,
  works: [],
  editions: [],
  passages: [],
  translations: [],
  interpretation,
  export: {
    citationAvailable: false,
    textExportAllowed: false,
    reason: `The address was refused (${message}), so there is nothing to cite or export.`,
  },
})

export const corpus = defineAddon({
  name: 'corpus',
  version: '1.0.0',
  depends: ['base', 'auth'],
  models: {
    corpus_works: defineModel({
      label: 'Corpus Work',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'Corpus', icon: 'WK', order: 10 },
      fields: {
        code: str({ maxLength: 40 }),
        title: str({ maxLength: 120 }),
        tradition: sel(TRADITIONS, { default: 'islamic' }),
        originalLanguage: str({ maxLength: 10, default: 'ar' }),
        description: text({ null: true }),
      },
      unique: [['code']],
      data: {
        rows: [
          {
            code: 'quran',
            title: "Al-Qur'an al-Karim",
            tradition: 'islamic',
            originalLanguage: 'ar',
            description: 'The final canonical revelation delivered to Prophet Muhammad SAW.',
          },
        ],
      },
    }),

    corpus_editions: defineModel({
      label: 'Corpus Edition',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'Corpus', icon: 'ED', order: 20 },
      fields: {
        code: str({ maxLength: 60 }),
        workRef: m2o('corpus_works', { index: true }),
        name: str({ maxLength: 150 }),
        editorOrPublisher: str({ maxLength: 120 }),
        rightsStatus: sel(RIGHTS_STATUSES, { default: 'PUBLIC_DOMAIN' }),
        licenseName: str({ maxLength: 80, default: 'Public Domain / Verified Transmission' }),
        sourceUri: str({ format: 'uri', null: true }),
        provenanceSha: str({ maxLength: 64, null: true }),
      },
      unique: [['code']],
      data: {
        rows: [
          {
            code: 'quran_cairo_hafs',
            workRef: '@corpus_works:quran',
            name: "Amiri Press Cairo Edition 1924 (Hafs 'an 'Asim)",
            editorOrPublisher: 'Al-Azhar / Egyptian Royal Survey',
            rightsStatus: 'RIGHTS_EXACT_VERSION_CLEARED',
            licenseName: 'Public Domain / Verified Recitation Transmission',
            sourceUri: 'https://archive.org/details/cairo-quran-1924',
            provenanceSha: 'c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912',
          },
        ],
      },
    }),

    corpus_passages: defineModel({
      label: 'Corpus Passage',
      rest: true,
      // raw source bytes never leave through generic REST; the public projection
      // is `/corpus/reader`, which evaluates the edition's rights first
      acl: ADMIN_FULL,
      menu: { group: 'Corpus', icon: 'PS', order: 30 },
      fields: {
        citationKey: str({ maxLength: 60 }), // e.g. "QS 2:82"
        editionRef: m2o('corpus_editions', { index: true }),
        surahNumber: int(),
        ayahNumber: int(),
        arabicText: text(),
        rgblForeignRef: str({ maxLength: 60, null: true }), // M07-06 legacy RGBL pointer
        verifiedAt: ts({ null: true }),
      },
      // the same address may legitimately exist in more than one edition
      unique: [['citationKey', 'editionRef']],
      data: {
        matchBy: ['citationKey', 'editionRef'],
        rows: [
          {
            citationKey: 'QS 2:82',
            editionRef: '@corpus_editions:quran_cairo_hafs',
            surahNumber: 2,
            ayahNumber: 82,
            arabicText:
              'وَٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ أُو۟لَـٰٓئِكَ أَصْحَـٰبُ ٱلْجَنَّةِ ۖ هُمْ فِيهَا خَـٰلِدُونَ',
            rgblForeignRef: 'RGBL-TEXT-002-082-V10',
            verifiedAt: '2026-10-26T00:00:00.000Z',
          },
        ],
      },
    }),

    corpus_translations: defineModel({
      label: 'Corpus Translation',
      rest: true,
      acl: ADMIN_FULL,
      menu: { group: 'Corpus', icon: 'TR', order: 40 },
      fields: {
        code: str({ maxLength: 80 }),
        passageRef: m2o('corpus_passages', { index: true }),
        languageCode: str({ maxLength: 10, default: 'id' }),
        translatorName: str({ maxLength: 120, default: 'Kementerian Agama RI' }),
        translationText: text(),
        rightsStatus: sel(RIGHTS_STATUSES, { default: 'RIGHTS_EXACT_VERSION_CLEARED' }),
        licenseName: str({ maxLength: 80, default: 'Open Official Indonesian Translation' }),
      },
      unique: [['code'], ['passageRef', 'languageCode']],
      data: {
        // '@model.field:value' refs only accept lower-case field names, and the
        // passage natural key is camelCase (citationKey + editionRef), so resolve
        // the passage id explicitly instead of storing a literal '@...' string.
        rows: async ({ orm }) => {
          const passages = (await orm.model('corpus_passages').list({ where: { citationKey: 'QS 2:82' }, limit: 1 })) as Row[]
          const passage = passages[0]
          if (!passage) return []
          return [
            {
              code: 'QS_2_82_id_kemenag',
              passageRef: String(passage.id),
              languageCode: 'id',
              translatorName: 'Kemenag RI',
              translationText:
                'Adapun orang-orang yang beriman dan beramal saleh, mereka itulah penghuni surga. Mereka kekal di dalamnya.',
              rightsStatus: 'RIGHTS_EXACT_VERSION_CLEARED',
              licenseName: 'Public Domain / Open Translation',
            },
          ]
        },
      },
    }),
  },

  views: {
    corpusPassageOverview: defineView('corpusPassageOverview', {
      from: 'corpus_passages',
      acl: ADMIN_ONLY,
      select: {
        citationKey: 'citationKey',
        surahNumber: 'surahNumber',
        ayahNumber: 'ayahNumber',
        arabicText: 'arabicText',
        rgblForeignRef: 'rgblForeignRef',
      },
      expand: ['editionRef'],
    }),
  },

  endpoints: {
    /**
     * The only public projection of corpus text. It resolves the canonical
     * passage, applies the edition/translation rights veto (M07-04), and returns
     * metadata-only states instead of silently inventing or leaking a verse.
     */
    reader: {
      method: 'GET',
      path: '/corpus/reader',
      requires: 'public',
      menu: { group: 'Corpus', icon: 'OV', order: 50 },
      handler: async ({ query, orm, status }) => {
        const raw = typeof query.citation === 'string' ? query.citation : ''
        const citation = raw.trim().replace(/\s+/g, ' ')
        if (!citation) {
          status(400)
          return { state: 'invalid', message: 'citation is required', citation: null, arabic: null, translations: [], candidates: [], citationText: null }
        }
        if (citation.length > 60) {
          status(400)
          return { state: 'invalid', message: 'citation is longer than 60 characters', citation: null, arabic: null, translations: [], candidates: [], citationText: null }
        }

        const exact = (await orm.model('corpus_passages').list({ where: { citationKey: citation }, limit: 50 })) as Row[]
        // typo-tolerant address lookup only; authorization is unaffected because
        // every returned row still goes through the edition rights veto below
        const matches = exact.length
          ? exact
          : ((await orm.model('corpus_passages').list({ limit: 1000 })) as Row[]).filter(
              (row) => String(row.citationKey ?? '').toLowerCase() === citation.toLowerCase(),
            )
        if (!matches.length) return absent(citation)

        const editions = new Map(
          ((await orm.model('corpus_editions').list({ limit: 1000 })) as Row[]).map((row) => [String(row.id), row]),
        )
        const works = new Map(
          ((await orm.model('corpus_works').list({ limit: 100 })) as Row[]).map((row) => [String(row.id), row]),
        )
        const editionFilter = typeof query.edition === 'string' ? query.edition.trim() : ''
        const resolved = matches
          .map((passage) => ({ passage, edition: editions.get(String(passage.editionRef)) ?? null }))
          .filter((entry) => !editionFilter || entry.edition?.code === editionFilter)

        if (!resolved.length) return absent(citation)
        if (resolved.length > 1) {
          // several editions carry the same address: picking one would be a
          // silent editorial decision, so expose metadata and let the reader choose
          return {
            state: 'ambiguous',
            message: `"${citation}" exists in more than one edition; choose one to continue.`,
            citation: null,
            arabic: null,
            translations: [],
            candidates: resolved.map(({ passage, edition }) => ({
              citationKey: nonEmpty(passage.citationKey),
              ...sourceMeta(edition, edition ? works.get(String(edition.workRef)) ?? null : null),
            })),
            citationText: null,
          }
        }

        const entry = resolved[0]
        if (!entry) return absent(citation)
        const { passage, edition } = entry
        const work = edition ? works.get(String(edition.workRef)) ?? null : null
        const meta = sourceMeta(edition, work)
        const editionCleared = meta.rightsStatus === CLEARED
        const arabicText = nonEmpty(passage.arabicText)

        const translations = (
          (await orm.model('corpus_translations').list({ where: { passageRef: passage.id }, limit: 100 })) as Row[]
        ).map((row) => {
          const cleared = editionCleared && row.rightsStatus === CLEARED
          return {
            languageCode: nonEmpty(row.languageCode) ?? 'und',
            translatorName: nonEmpty(row.translatorName),
            licenseName: nonEmpty(row.licenseName),
            rightsStatus: nonEmpty(row.rightsStatus) ?? 'RIGHTS_UNKNOWN',
            text: cleared ? nonEmpty(row.translationText) : null,
            blocked: !cleared,
          }
        })

        const sourceDate = nonEmpty(passage.verifiedAt) ?? nonEmpty(edition?.createdAt)
        const retrievedAt = new Date().toISOString()
        const citationText = [
          nonEmpty(passage.citationKey),
          meta.workTitle ?? 'UNKNOWN WORK',
          meta.editionName ? `${meta.editionName} [${meta.editionCode ?? 'no-code'}]` : 'UNRESOLVED EDITION',
          meta.editorOrPublisher ? `by ${meta.editorOrPublisher}` : null,
          `rights=${meta.rightsStatus}`,
          `license=${meta.licenseName ?? 'UNKNOWN'}`,
          `provenance=${meta.provenanceSha ?? 'UNRECORDED'}`,
          `source=${meta.sourceUri ?? 'UNRECORDED'}`,
          `source-date=${sourceDate ?? 'UNKNOWN'}`,
          `retrieved=${retrievedAt}`,
        ]
          .filter(Boolean)
          .join(' · ')

        return {
          state: editionCleared ? 'available' : 'rights_blocked',
          message: editionCleared ? null : `Text withheld: edition rights are ${meta.rightsStatus}.`,
          citation: { key: nonEmpty(passage.citationKey), ...meta, sourceDate, retrievedAt },
          arabic:
            editionCleared && arabicText
              ? { text: arabicText, language: meta.originalLanguage ?? 'ar', script: 'Arab', direction: 'rtl' }
              : null,
          translations,
          candidates: [],
          citationText,
          blockedPlaceholder: editionCleared ? null : BLOCKED_PLACEHOLDER,
        }
      },
    },

    /**
     * The inventory behind the CORPUS READER rails (UI-P05b): the source catalog,
     * the editions, a passage-index window around one address, the translation
     * languages an edition carries, and an honest statement of what may be exported.
     *
     * It is metadata-only by construction: this handler never reads `arabicText` or
     * `translationText`, so it cannot become a second text exit around M07-04 —
     * `/corpus/reader` stays the only projection that serializes source bytes. The
     * `cleared` / `textAvailable` / `textExportAllowed` flags below are the reader's
     * own `rightsStatus === CLEARED` invariant applied per row, so the rails and the
     * reader can never disagree about what a reader is actually allowed to see.
     */
    browse: {
      method: 'GET',
      path: '/corpus/browse',
      requires: 'public',
      menu: { group: 'Corpus', icon: 'BR', order: 55 },
      handler: async ({ query, orm, schema, status }) => {
        const interpretation = interpretationState(orm, schema)
        const raw = typeof query.citation === 'string' ? query.citation : ''
        const citation = raw.trim().replace(/\s+/g, ' ')
        if (!citation) {
          status(400)
          return refusedBrowse('citation is required', interpretation)
        }
        if (citation.length > 60) {
          status(400)
          return refusedBrowse('citation is longer than 60 characters', interpretation)
        }

        const editionFilter = typeof query.edition === 'string' ? query.edition.trim() : ''
        const editionRows = (await orm.model('corpus_editions').list({ limit: CATALOG_SCAN })) as Row[]
        const workRows = (await orm.model('corpus_works').list({ limit: 100 })) as Row[]
        const editionsById = new Map(editionRows.map((row) => [String(row.id), row]))
        const editionOf = (passage: Row): Row | null => editionsById.get(String(passage.editionRef)) ?? null

        const exact = (await orm.model('corpus_passages').list({ where: { citationKey: citation }, limit: 50 })) as Row[]
        // the reader's own address resolution, typo-tolerant second pass included:
        // the rails and the reader must agree on what resolves
        const matches = exact.length
          ? exact
          : ((await orm.model('corpus_passages').list({ limit: CATALOG_SCAN })) as Row[]).filter(
              (row) => String(row.citationKey ?? '').toLowerCase() === citation.toLowerCase(),
            )
        const candidates = matches
          .map((passage) => ({ passage, edition: editionOf(passage) }))
          .filter((entry) => !editionFilter || String(entry.edition?.code ?? '') === editionFilter)
        // one address living in several editions is a choice the reader must make
        // explicitly; an inventory is not an editorial act, so the window comes from
        // the lowest edition code and every row keeps naming its own edition
        const head = candidates
          .slice()
          .sort((a, b) => byString(String(a.edition?.code ?? ''), String(b.edition?.code ?? '')))[0]
        const resolvedPassage = head?.passage ?? null
        const editionMatched = editionFilter ? (editionRows.find((row) => String(row.code ?? '') === editionFilter) ?? null) : null
        const contextEdition = head?.edition ?? editionMatched ?? null
        const resolved = resolvedPassage !== null

        const windowRows = contextEdition
          ? ((await orm.model('corpus_passages').list({
              where: { editionRef: contextEdition.id },
              limit: WINDOW_SCAN,
              order: 'surahNumber,ayahNumber',
            })) as Row[])
          : []
        // sorted twice on purpose: the engine order bounds the scan, this local
        // tie-break keeps the identical window on the memory engine and on pg
        const ordered = windowRows
          .slice()
          .sort(
            (a, b) =>
              (intOrNull(a.surahNumber) ?? 0) - (intOrNull(b.surahNumber) ?? 0) ||
              (intOrNull(a.ayahNumber) ?? 0) - (intOrNull(b.ayahNumber) ?? 0) ||
              byString(String(a.citationKey ?? ''), String(b.citationKey ?? '')),
          )
        const anchorIndex = resolvedPassage
          ? ordered.findIndex((row) => String(row.id) === String(resolvedPassage.id))
          : -1
        const from = Math.max(0, (anchorIndex >= 0 ? anchorIndex : 0) - WINDOW_HALF)
        const passages = ordered.slice(from, from + WINDOW_ROWS).map((row) => ({
          citationKey: nonEmpty(row.citationKey) ?? '',
          surahNumber: intOrNull(row.surahNumber),
          ayahNumber: intOrNull(row.ayahNumber),
          editionCode: nonEmpty(editionOf(row)?.code),
          verifiedAt: nonEmpty(row.verifiedAt),
          textAvailable: isCleared(editionOf(row)),
        }))

        // counts come from the engine, not from a capped scan: a rail that printed
        // "500 passages" for a 6,236-row edition would be a fake operational claim
        const editions = await Promise.all(
          editionRows
            .slice()
            .sort((a, b) => byString(String(a.code ?? ''), String(b.code ?? '')))
            .map(async (edition) => ({
              code: nonEmpty(edition.code) ?? '',
              name: nonEmpty(edition.name),
              editorOrPublisher: nonEmpty(edition.editorOrPublisher),
              rightsStatus: nonEmpty(edition.rightsStatus) ?? 'RIGHTS_UNKNOWN',
              licenseName: nonEmpty(edition.licenseName),
              sourceUri: nonEmpty(edition.sourceUri),
              provenanceSha: nonEmpty(edition.provenanceSha),
              passageCount: Number(await orm.model('corpus_passages').count({ editionRef: edition.id })),
              cleared: isCleared(edition),
            })),
        )

        const works = workRows
          .slice()
          .sort((a, b) => byString(String(a.code ?? ''), String(b.code ?? '')))
          .map((work) => ({
            code: nonEmpty(work.code) ?? '',
            title: nonEmpty(work.title) ?? '',
            tradition: nonEmpty(work.tradition),
            originalLanguage: nonEmpty(work.originalLanguage),
            editionCount: editionRows.filter((edition) => String(edition.workRef) === String(work.id)).length,
          }))

        const passageIds = new Set(ordered.map((row) => String(row.id)))
        const translationRows = passageIds.size
          ? ((await orm.model('corpus_translations').list({ limit: CATALOG_SCAN })) as Row[]).filter((row) =>
              passageIds.has(String(row.passageRef)),
            )
          : []
        const contextCleared = isCleared(contextEdition)
        // the rail lists languages, not passages: rows collapse on
        // (language, translator, licence, rights) and stop at TRANSLATION_ROWS
        const grouped = new Map<string, BrowseTranslation>()
        for (const row of translationRows) {
          const rightsStatus = nonEmpty(row.rightsStatus) ?? 'RIGHTS_UNKNOWN'
          const entry: BrowseTranslation = {
            languageCode: nonEmpty(row.languageCode) ?? 'und',
            translatorName: nonEmpty(row.translatorName),
            licenseName: nonEmpty(row.licenseName),
            rightsStatus,
            editionCode: nonEmpty(contextEdition?.code),
            textAvailable: contextCleared && rightsStatus === CLEARED,
          }
          const key = [entry.languageCode, entry.translatorName, entry.licenseName, entry.rightsStatus, entry.editionCode].join('|')
          if (!grouped.has(key)) grouped.set(key, entry)
        }
        const translations = [...grouped.values()]
          .sort(
            (a, b) =>
              byString(a.languageCode, b.languageCode) ||
              byString(a.translatorName ?? '', b.translatorName ?? '') ||
              byString(a.licenseName ?? '', b.licenseName ?? '') ||
              byString(a.rightsStatus, b.rightsStatus),
          )
          .slice(0, TRANSLATION_ROWS)

        const workRow = contextEdition
          ? (workRows.find((work) => String(work.id) === String(contextEdition.workRef)) ?? null)
          : null
        const work = workRow
          ? {
              code: nonEmpty(workRow.code),
              title: nonEmpty(workRow.title),
              originalLanguage: nonEmpty(workRow.originalLanguage),
            }
          : null

        const contextRights = nonEmpty(contextEdition?.rightsStatus) ?? 'RIGHTS_UNKNOWN'
        const contextCode = nonEmpty(contextEdition?.code) ?? 'unknown'
        return {
          citation,
          edition: editionFilter || null,
          resolved,
          work,
          works,
          editions,
          passages,
          translations,
          interpretation,
          export: {
            citationAvailable: resolved,
            textExportAllowed: contextRights === CLEARED,
            reason: !contextEdition
              ? 'EXPORT: GUARDED — no edition resolved for this request, so there is no cleared source to export; only the metadata lists above may be cited.'
              : contextRights === CLEARED
                ? `EXPORT: PERMITTED — edition ${contextCode} is ${contextRights}, so a text export is allowed. The bytes still never come from this endpoint: /corpus/reader re-applies the veto per address.`
                : `EXPORT: GUARDED — text export withheld: edition ${contextCode} reports rights=${contextRights}, not ${CLEARED}. Only the metadata citation line may be exported.`,
          },
        }
      },
    },
  },
})

export default corpus
