import {
  DEFAULT_LOCALE,
  defineLocaleCatalog,
  getLocaleMessage,
  isLocale,
  type Locale,
} from '@moonwitness/core'

/** Human-authored operator copy, validated by the shared id/en catalog contract. */
export const cliCopy = defineLocaleCatalog({
  en: {
    helpTitle: 'MOONWITNESS XV — OPERATOR COMMAND LINE INTERFACE (CLI)',
    usage: 'Usage:',
    commands: 'Commands:',
    statusCommand: 'Probe every workspace service ({ports}) and report ONLINE/OFFLINE',
    freePortsCommand: 'Release the bound ports ({ports})',
    verifyCommand: 'Execute the monorepo verification pipeline (pnpm verify)',
    helpCommand: 'Display this mission operator manual',
    examples: 'Examples:',
    options: 'Options:',
    localeOption: 'Select human-facing language: id or en (or set MW_LOCALE)',
    statusProbe: 'Probing Moonwitness service ports ({ports})...',
    freePortsStart: 'Releasing all bound microservice ports (3000-3004)...',
    freedPorts: 'Freed ports: {ports}',
    portsClear: 'Ports 3000-3004 were already clear.',
    verifyStart: 'Running the monorepo verification pipeline: pnpm verify',
    unknownCommand: 'Unknown command: "{command}". Run "moon help" for available commands.',
    localeMissing: 'Missing locale value. Use --locale id or --locale en.',
    localeInvalid: 'Unsupported locale "{locale}". Use --locale id or --locale en.',
    serviceHub: 'Radio Core Hub (ARSY)',
    serviceDock: 'Public Radio Dock',
    serviceHeadquarters: 'Command Headquarters',
    serviceAiGateway: 'AI Gateway Router',
    serviceCockpit: 'Moondeck Cockpit',
    sdkDrift: 'moonql: SDK drift — run `pnpm gen:sdk` ({path})',
    sdkSnapshotMissing: 'moonql: no committed schema snapshot at {path} — run `pnpm gen:sdk`',
    sdkSnapshotStale: 'moonql: schema snapshot is stale ({path}) — run `pnpm gen:sdk`',
    sdkHistoryStale: 'moonql: {path} does not record the committed snapshot — run `pnpm gen:sdk`',
    sdkGateRejected: 'moonql: breaking contract changes are not approved.',
    sdkGateAccepted: 'moonql: breaking contract changes were accepted.',
    sdkAdditive: 'moonql: additive — {items}',
    sdkUpToDate: 'moonql: generated SDK is up to date',
    sdkRefusing: 'moonql: refusing to write — {reason}',
    sdkGenerated: 'moonql: generated SDK -> {path}',
    sdkRaiseMajor: 'A breaking change needs a higher API_VERSION major; review it and re-run with --allow-breaking.',
    sdkMajorRequired: '--allow-breaking needs API_VERSION at major {required} or higher (current: "{version}").',
    sdkForced: 'Writing despite the breaking-change gate because --force was supplied.',
    sdkBreakingAccepted: 'Breaking change accepted with --allow-breaking; API major {before} -> {after}.',
  },
  id: {
    helpTitle: 'MOONWITNESS XV — ANTARMUKA BARIS PERINTAH OPERATOR (CLI)',
    usage: 'Penggunaan:',
    commands: 'Perintah:',
    statusCommand: 'Periksa setiap layanan workspace ({ports}) dan laporkan ONLINE/OFFLINE',
    freePortsCommand: 'Lepaskan port yang sedang terikat ({ports})',
    verifyCommand: 'Jalankan rangkaian verifikasi monorepo (pnpm verify)',
    helpCommand: 'Tampilkan panduan operator ini',
    examples: 'Contoh:',
    options: 'Opsi:',
    localeOption: 'Pilih bahasa keluaran: id atau en (atau atur MW_LOCALE)',
    statusProbe: 'Memeriksa port layanan Moonwitness ({ports})...',
    freePortsStart: 'Melepaskan semua port microservice yang terikat (3000-3004)...',
    freedPorts: 'Port dilepaskan: {ports}',
    portsClear: 'Port 3000-3004 sudah kosong.',
    verifyStart: 'Menjalankan rangkaian verifikasi monorepo: pnpm verify',
    unknownCommand: 'Perintah tidak dikenal: "{command}". Jalankan "moon help" untuk melihat perintah.',
    localeMissing: 'Nilai bahasa belum diberikan. Gunakan --locale id atau --locale en.',
    localeInvalid: 'Bahasa "{locale}" tidak didukung. Gunakan --locale id atau --locale en.',
    serviceHub: 'Hub Inti Radio (ARSY)',
    serviceDock: 'Radio Dock Publik',
    serviceHeadquarters: 'Markas Komando',
    serviceAiGateway: 'Router AI Gateway',
    serviceCockpit: 'Kokpit Moondeck',
    sdkDrift: 'moonql: SDK berbeda — jalankan `pnpm gen:sdk` ({path})',
    sdkSnapshotMissing: 'moonql: snapshot skema belum ada di {path} — jalankan `pnpm gen:sdk`',
    sdkSnapshotStale: 'moonql: snapshot skema usang ({path}) — jalankan `pnpm gen:sdk`',
    sdkHistoryStale: 'moonql: {path} belum mencatat snapshot tersimpan — jalankan `pnpm gen:sdk`',
    sdkGateRejected: 'moonql: perubahan kontrak yang merusak kompatibilitas belum disetujui.',
    sdkGateAccepted: 'moonql: perubahan kontrak yang merusak kompatibilitas telah disetujui.',
    sdkAdditive: 'moonql: penambahan — {items}',
    sdkUpToDate: 'moonql: SDK yang dihasilkan sudah sesuai',
    sdkRefusing: 'moonql: penulisan ditolak — {reason}',
    sdkGenerated: 'moonql: SDK dibuat -> {path}',
    sdkRaiseMajor: 'Perubahan yang merusak kompatibilitas memerlukan API_VERSION major yang lebih tinggi; tinjau lalu jalankan kembali dengan --allow-breaking.',
    sdkMajorRequired: '--allow-breaking memerlukan API_VERSION major {required} atau lebih tinggi (saat ini: "{version}").',
    sdkForced: 'Penulisan tetap dilakukan karena --force diberikan meski gerbang perubahan kompatibilitas menolak.',
    sdkBreakingAccepted: 'Perubahan kompatibilitas diterima dengan --allow-breaking; API major {before} -> {after}.',
  },
})

export type CliCopyKey = keyof typeof cliCopy.en

export function cliMessage(
  locale: Locale,
  key: CliCopyKey,
  values: Readonly<Record<string, string | number>> = {},
): string {
  return Object.entries(values).reduce(
    (message, [name, value]) => message.replaceAll(`{${name}}`, String(value)),
    getLocaleMessage(cliCopy, locale, key),
  )
}

export type CliLocaleParse =
  | { ok: true; locale: Locale; args: string[] }
  | { ok: false; locale: Locale; error: 'missing' | 'unsupported'; value?: string }

/** `--locale` overrides the process preference; unsupported environment values fall back to English. */
export function resolveCliLocale(args: readonly string[], environmentLocale: unknown): CliLocaleParse {
  const environmentDefault = isLocale(environmentLocale) ? environmentLocale : DEFAULT_LOCALE
  const remaining: string[] = []
  let requested: string | undefined

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === undefined) continue
    if (argument === '--locale') {
      const value = args[index + 1]
      if (value === undefined || value.startsWith('--')) return { ok: false, locale: environmentDefault, error: 'missing' }
      if (requested !== undefined) return { ok: false, locale: environmentDefault, error: 'unsupported', value }
      requested = value
      index += 1
    } else if (argument.startsWith('--locale=')) {
      if (requested !== undefined) return { ok: false, locale: environmentDefault, error: 'unsupported', value: argument.slice(9) }
      requested = argument.slice(9)
    } else {
      remaining.push(argument)
    }
  }

  if (requested !== undefined) {
    if (!isLocale(requested)) return { ok: false, locale: environmentDefault, error: 'unsupported', value: requested }
    return { ok: true, locale: requested, args: remaining }
  }
  return { ok: true, locale: environmentDefault, args: remaining }
}
