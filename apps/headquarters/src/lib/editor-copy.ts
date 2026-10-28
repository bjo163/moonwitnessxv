import { defineLocaleCatalog, type Locale, type LocaleCatalog } from '@moonwitness/core'
import { MoonApiError } from '@moonwitness/moonql-client'

/** The only value accepted by the server-side destructive-action confirmation. */
export const DELETE_CONFIRM_VALUE = 'confirm-permanent-delete'

/** A confirmation is explicit and singular; duplicate or forged values fail closed. */
export function isDeleteConfirmed(values: readonly unknown[]): boolean {
  return values.length === 1 && values[0] === DELETE_CONFIRM_VALUE
}

/**
 * UI2-P21d — the Headquarters record-editor label and error catalogue.
 *
 * HQ already has one session boundary and one label mechanism per surface
 * (`login-copy.ts` for the sign-in screen, `denial-copy.ts` for the guarded
 * denial, `shell-copy.ts` for the chrome). This file follows that established
 * pattern exactly rather than inventing a fourth: a parity-checked
 * `defineLocaleCatalog` from `@moonwitness/core`, resolved with
 * `requestLocale()` (the same ADR-0005 precedence every other HQ page uses).
 *
 * Two rules hold here:
 *  1. Nothing is passed through to the browser. An error notice is chosen by a
 *     stable code and nothing else — never a hub status text, a record value, a
 *     stack trace or a credential. That is what keeps the token in the cookie
 *     jar, out of the URL and out of the page.
 *  2. Model and field identifiers are hub metadata and stay untranslated; only
 *     HQ's own chrome text is localized here.
 */
const editorCatalog = defineLocaleCatalog({
  en: {
    crumbHq: 'HQ',
    crumbModels: 'Records',
    crumbNew: 'new',
    editSubtitle: 'Model {model} · stored update {updatedAt} · {fieldCount} schema fields',
    newSubtitle: 'Model {model} · {fieldCount} fields driven by _schema',
    formEditTitle: 'Edit {label}',
    formCreateTitle: 'New {label}',
    formSubtitle: '{count} fields — order, control type and required flags all come from _schema',
    formUnsavedNote: 'Nothing is written until you submit. The server re-checks your role on every submit.',
    requiredLegend: 'Fields marked with * are required by the hub schema.',
    submitCreate: 'Create record',
    submitUpdate: 'Save changes',
    cancel: 'Cancel',
    readOnlyAlert: 'This account may read this record but not edit it; the form is not offered.',
    savedCreated: 'Record created.',
    savedUpdated: 'Record saved.',
    savedDeleted: 'Record deleted.',
    deleteTitle: 'Delete this record',
    deleteBody:
      'Deleting {label} {recordId} is a destructive mutation. The hub applies this model\'s own delete rule; HQ cannot undo it.',
    deleteConfirmLabel: 'Delete record {recordId} permanently',
    deleteSubmit: 'Delete permanently',
    deleteHint: 'Tick the confirmation box before the delete button becomes meaningful.',
    deleteNotice: 'A delete submitted without the confirmation box is rejected server-side and writes nothing.',
    disclosureTitle: 'Raw payload',
    disclosureSubtitle: 'The row exactly as the API returned it. Collapsed by default; expanding it reads nothing new.',
    disclosureSummary: 'Show the raw payload',
    listSubtitle: '{shown} rows shown · {total} total · {fieldCount} fields · addon {addon}',
    listTableTitle: 'Table · {model}',
    listTableSubtitle: 'columns, search and pagination are generated from _schema',
    listNewButton: 'New {label}',
    listSearchLabel: 'Search this model',
    listSearchPlaceholder: 'search…',
    listSearchSubmit: 'Search',
    listRowDelete: 'delete',
    listEmptyRows: 'No rows match the current filter.',
    errNotFound: 'The hub has no such record any more. It may already have been deleted.',
    errInvalid: 'The hub rejected one or more values. Nothing was changed; check the fields and try again.',
    errUnauthorized: 'Your account is not allowed to perform this change. Nothing was written.',
    errExpired: 'Your session has expired. Sign in again to continue.',
    errUnavailable: 'The hub could not be reached, so nothing was written. Your session is still valid.',
    errUnconfirmed: 'The deletion needed an explicit confirmation. Nothing was deleted.',
  },
  id: {
    crumbHq: 'Kantor Pusat',
    crumbModels: 'Rekaman',
    crumbNew: 'baru',
    editSubtitle: 'Model {model} · pembaruan tersimpan {updatedAt} · {fieldCount} kolom skema',
    newSubtitle: 'Model {model} · {fieldCount} kolom yang dikendalikan _schema',
    formEditTitle: 'Ubah {label}',
    formCreateTitle: 'Baru: {label}',
    formSubtitle: '{count} kolom — urutan, jenis kendali, dan wajib/tidaknya semua diambil dari _schema',
    formUnsavedNote: 'Belum ada yang ditulis sampai Anda mengirim formulir. Server memeriksa ulang peran Anda setiap kali kirim.',
    requiredLegend: 'Kolom bertanda * wajib ada menurut skema hub.',
    submitCreate: 'Buat rekaman',
    submitUpdate: 'Simpan perubahan',
    cancel: 'Batal',
    readOnlyAlert: 'Akun ini boleh membaca rekaman ini tetapi tidak boleh mengubahnya; formulir tidak ditampilkan.',
    savedCreated: 'Rekaman dibuat.',
    savedUpdated: 'Rekaman tersimpan.',
    savedDeleted: 'Rekaman dihapus.',
    deleteTitle: 'Hapus rekaman ini',
    deleteBody:
      'Menghapus {label} {recordId} adalah perubahan yang merusak. Hub menerapkan aturan hapus milik model itu sendiri; Kantor Pusat tidak dapat membatalkannya.',
    deleteConfirmLabel: 'Hapus rekaman {recordId} secara permanen',
    deleteSubmit: 'Hapus permanen',
    deleteHint: 'Centang kotak konfirmasi sebelum tombol hapus punya arti.',
    deleteNotice: 'Permintaan hapus tanpa kotak centang ditolak di sisi server dan tidak menulis apa pun.',
    disclosureTitle: 'Muatan mentah',
    disclosureSubtitle: 'Baris persis seperti yang dikembalikan API. Tertutup secara bawaan; membukanya tidak membaca data baru.',
    disclosureSummary: 'Tampilkan muatan mentah',
    listSubtitle: '{shown} baris ditampilkan · total {total} · {fieldCount} kolom · addon {addon}',
    listTableTitle: 'Tabel · {model}',
    listTableSubtitle: 'kolom, pencarian, dan paginasi dihasilkan dari _schema',
    listNewButton: 'Baru: {label}',
    listSearchLabel: 'Cari model ini',
    listSearchPlaceholder: 'cari…',
    listSearchSubmit: 'Cari',
    listRowDelete: 'hapus',
    listEmptyRows: 'Tidak ada baris yang cocok dengan penyaringan saat ini.',
    errNotFound: 'Rekaman tersebut tidak ada lagi di hub. Mungkin sudah dihapus.',
    errInvalid: 'Hub menolak satu atau lebih nilai. Tidak ada yang berubah; periksa kolomnya lalu coba lagi.',
    errUnauthorized: 'Akun Anda tidak diizinkan melakukan perubahan ini. Tidak ada yang ditulis.',
    errExpired: 'Sesi Anda telah berakhir. Masuk kembali untuk melanjutkan.',
    errUnavailable: 'Hub tidak dapat dijangkau sehingga tidak ada yang ditulis. Sesi Anda masih berlaku.',
    errUnconfirmed: 'Penghapusan memerlukan konfirmasi eksplisit. Tidak ada yang dihapus.',
  },
})

export type EditorMessageKey = keyof (typeof editorCatalog)['en']

/**
 * The only values that may ever appear in an `?error=` / `?saved=` query
 * parameter. A code is a closed enum: an upstream message, a token, a stack
 * frame or a record value has no shape that matches one of these keys, so it
 * cannot select copy and cannot reach the browser.
 */
export const EDITOR_ERROR_CODES = [
  'not_found',
  'invalid',
  'unauthorized',
  'expired',
  'unavailable',
  'unconfirmed',
] as const

export type EditorErrorCode = (typeof EDITOR_ERROR_CODES)[number]

export const EDITOR_SAVED_CODES = ['created', 'updated', 'deleted'] as const
export type EditorSavedCode = (typeof EDITOR_SAVED_CODES)[number]

const errorCodeKeys: Record<EditorErrorCode, EditorMessageKey> = {
  not_found: 'errNotFound',
  invalid: 'errInvalid',
  unauthorized: 'errUnauthorized',
  expired: 'errExpired',
  unavailable: 'errUnavailable',
  unconfirmed: 'errUnconfirmed',
}

const savedCodeKeys: Record<EditorSavedCode, EditorMessageKey> = {
  created: 'savedCreated',
  updated: 'savedUpdated',
  deleted: 'savedDeleted',
}

export function editorCopy(locale: Locale): LocaleCatalog<EditorMessageKey>['en'] {
  return editorCatalog[locale]
}

/** Stable codes only. Anything else — including a raw hub message — selects nothing. */
export function editorErrorMessage(locale: Locale, code: unknown): string | null {
  if (typeof code !== 'string' || !Object.hasOwn(errorCodeKeys, code)) return null
  return editorCatalog[locale][errorCodeKeys[code as EditorErrorCode]]
}

export function editorSavedMessage(locale: Locale, code: unknown): string | null {
  if (typeof code !== 'string' || !Object.hasOwn(savedCodeKeys, code)) return null
  return editorCatalog[locale][savedCodeKeys[code as EditorSavedCode]]
}

/**
 * Translate a hub or runtime failure into one of the stable codes.
 *
 * The status number is the whole input; `error.message` is deliberately never
 * read, because the hub echoes validation detail and a rejected value can
 * contain private witness material.
 */
export function editorErrorCode(error: unknown): EditorErrorCode {
  if (error instanceof MoonApiError) {
    if (error.statusCode === 401) return 'expired'
    if (error.statusCode === 403) return 'unauthorized'
    if (error.statusCode === 404) return 'not_found'
    if (error.statusCode === 400 || error.statusCode === 409 || error.statusCode === 422) return 'invalid'
    return 'unavailable'
  }
  return 'unavailable'
}

/** Tiny, total interpolator: only the placeholders named above are substituted. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(values, key) ? String(values[key]) : match,
  )
}
