import { defineLocaleCatalog, type Locale } from '@moonwitness/core'

/**
 * M17-05 SHADOW workspace copy (ADR-0005: `id`/`en` with 1:1 keys).
 *
 * Only chrome is localized. Role names (`editor`, `reviewer`), refusal reason
 * codes and draft identifiers are machine values and stay untranslated, exactly
 * as the model/field identifiers do on the generic editor pages.
 */
const catalog = defineLocaleCatalog({
  en: {
    hq: 'HQ',
    title: 'SHADOW workspace',
    subtitle:
      'Private creative drafts. Ownership and revision permissions are decided on the server; publication belongs to D08.',
    session: 'Session',
    sessionSubtitle: 'Resolved by the existing HQ session and ARSY identity — there is no second login.',
    account: 'Signed-in account',
    role: 'Role',
    authoring: 'Authoring',
    authoringAllowed: 'allowed for this account',
    authoringDenied: 'not allowed for this account',
    reason: 'Reason',
    drafts: 'Readable drafts',
    draftsSubtitle: 'Only private drafts you own or were explicitly granted appear here.',
    draft: 'Draft',
    revision: 'Revision',
    noDrafts: 'No readable private drafts.',
    noDraftsNote:
      'D07 story storage is not connected on this deployment, so this list is empty on every request. No sample draft is invented and nothing is persisted here.',
    persistenceNotice:
      'This page runs the M17-05 permission contract only. Draft creation, editing and storage stay closed until the D07 store exists, so no draft is written by this page.',
    rules: 'Permission contract',
    rulesSubtitle: 'Rules enforced by apps/headquarters/src/lib/shadow-editor.ts',
    ruleColumn: 'Rule',
    valueColumn: 'Value',
    ruleAuthor: 'Create a private draft',
    ruleAuthorValue: '{roles} — authenticated human session only',
    ruleAccess: 'May hold an explicit grant',
    ruleAccessValue: '{roles} — a grant row is still required per draft',
    ruleOwner: 'Draft owner',
    ruleOwnerValue: 'may read and revise that draft; ownership is a record, not a global role',
    ruleGrant: 'Non-owner access',
    ruleGrantValue: 'explicit per-draft grant only; read does not imply revise',
    ruleRevision: 'Revision writes',
    ruleRevisionValue: 'append-only and monotonic; an older expected revision is refused',
    rulePublish: 'Publish or make public',
    rulePublishValue: 'unavailable here — D08 owns publication',
  },
  id: {
    hq: 'HQ',
    title: 'Ruang kerja SHADOW',
    subtitle:
      'Draf kreatif privat. Kepemilikan dan izin revisi diputuskan di server; penerbitan milik D08.',
    session: 'Sesi',
    sessionSubtitle: 'Ditentukan oleh sesi HQ dan identitas ARSY yang sudah ada — tidak ada login kedua.',
    account: 'Akun yang masuk',
    role: 'Peran',
    authoring: 'Penulisan',
    authoringAllowed: 'diizinkan untuk akun ini',
    authoringDenied: 'tidak diizinkan untuk akun ini',
    reason: 'Alasan',
    drafts: 'Draf yang dapat dibaca',
    draftsSubtitle: 'Hanya draf privat milik Anda atau yang diberikan izin eksplisit yang tampil di sini.',
    draft: 'Draf',
    revision: 'Revisi',
    noDrafts: 'Tidak ada draf privat yang dapat dibaca.',
    noDraftsNote:
      'Penyimpanan cerita D07 belum tersambung pada penerapan ini, jadi daftar ini kosong pada setiap permintaan. Tidak ada draf contoh yang dibuat dan tidak ada yang disimpan di sini.',
    persistenceNotice:
      'Halaman ini hanya menjalankan kontrak izin M17-05. Pembuatan, penyuntingan dan penyimpanan draf tetap tertutup sampai penyimpanan D07 tersedia, sehingga halaman ini tidak menulis draf.',
    rules: 'Kontrak izin',
    rulesSubtitle: 'Aturan yang ditegakkan oleh apps/headquarters/src/lib/shadow-editor.ts',
    ruleColumn: 'Aturan',
    valueColumn: 'Nilai',
    ruleAuthor: 'Membuat draf privat',
    ruleAuthorValue: '{roles} — hanya sesi manusia yang terautentikasi',
    ruleAccess: 'Dapat memegang izin eksplisit',
    ruleAccessValue: '{roles} — baris izin per draf tetap diperlukan',
    ruleOwner: 'Pemilik draf',
    ruleOwnerValue: 'boleh membaca dan merevisi draf itu; kepemilikan adalah catatan, bukan peran global',
    ruleGrant: 'Akses bukan pemilik',
    ruleGrantValue: 'hanya izin eksplisit per draf; baca tidak berarti revisi',
    ruleRevision: 'Penulisan revisi',
    ruleRevisionValue: 'hanya menambah dan monoton; revisi yang diharapkan sudah lama ditolak',
    rulePublish: 'Terbitkan atau jadikan publik',
    rulePublishValue: 'tidak tersedia di sini — penerbitan milik D08',
  },
})

export type ShadowCopyKey = keyof (typeof catalog)['en']

export function shadowCopy(locale: Locale): (typeof catalog)['en'] {
  return catalog[locale]
}

/** Only local copy keys are interpolated; identifiers are rendered as-is. */
export function shadowInterpolate(template: string, values: Record<string, string>): string {
  return template.replace(/\{([a-zA-Z]+)\}/g, (match, key: string) => values[key] ?? match)
}
