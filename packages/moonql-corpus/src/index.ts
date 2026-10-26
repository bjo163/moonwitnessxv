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

export const corpus = defineAddon({
  name: 'corpus',
  version: '1.0.0',
  depends: ['base', 'auth'],
  models: {
    corpus_works: defineModel({
      label: 'Corpus Work',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'Corpus', icon: '📜', order: 10 },
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
      menu: { group: 'Corpus', icon: '🏛️', order: 20 },
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
      menu: { group: 'Corpus', icon: '🔍', order: 30 },
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
      menu: { group: 'Corpus', icon: '🌐', order: 40 },
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
      menu: { group: 'Corpus', icon: '📖', order: 50 },
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
  },
})

export default corpus
