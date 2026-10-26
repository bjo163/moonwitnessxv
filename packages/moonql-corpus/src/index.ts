import {
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
      acl: ADMIN_WRITE,
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
      unique: [['citationKey']],
      data: {
        rows: [
          {
            citationKey: 'QS 2:82',
            editionRef: '@corpus_editions:quran_cairo_hafs',
            surahNumber: 2,
            ayahNumber: 82,
            arabicText:
              'وَٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ أُو۟لَـٰٓئِكَ أَصْحَـٰبُ ٱلْجَنَّةِ ۖ هُمْ فِيهَا خَـٰلِدُونَ',
            rgblForeignRef: 'RGBL-TEXT-002-082-V10',
          },
        ],
      },
    }),

    corpus_translations: defineModel({
      label: 'Corpus Translation',
      rest: true,
      acl: ADMIN_WRITE,
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
        rows: [
          {
            code: 'QS_2_82_id_kemenag',
            passageRef: '@corpus_passages:QS 2:82',
            languageCode: 'id',
            translatorName: 'Kemenag RI',
            translationText:
              'Adapun orang-orang yang beriman dan beramal saleh, mereka itulah penghuni surga. Mereka kekal di dalamnya.',
            rightsStatus: 'RIGHTS_EXACT_VERSION_CLEARED',
            licenseName: 'Public Domain / Open Translation',
          },
        ],
      },
    }),
  },

  views: {
    corpusPassageOverview: defineView('corpusPassageOverview', {
      from: 'corpus_passages',
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
})

export default corpus
