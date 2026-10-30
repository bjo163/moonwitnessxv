import { defineLocaleCatalog, type Locale, type LocaleCatalog } from '@moonwitness/core'

/**
 * UI2-P22c — the Headquarters World Monitor label and honesty-state catalogue.
 *
 * Same mechanism as every other HQ surface (`login-copy.ts`, `denial-copy.ts`,
 * `shell-copy.ts`, `editor-copy.ts`): a parity-checked `defineLocaleCatalog`
 * from `@moonwitness/core`, resolved by `requestLocale()`.
 *
 * The catalogue exists because this screen's previous text was not true:
 * "Telemetry Control Plane", "SENTINEL WORKERS", "LIVE" and a global radar map
 * with invented regions, counts and urgency scores. Every string here either
 * names something the projection actually returns (`_schema` models
 * `monitor_radars` / `monitor_sources` / `monitor_signals` / `monitor_tasks` and
 * the `/monitor/overview` snapshot) or names an absence — "unknown",
 * "unavailable", "not shown". Unknown is always spelled out as unknown; it is
 * never rendered as NOMINAL and never filled with a number.
 */
const monitorCatalog = defineLocaleCatalog({
  en: {
    title: 'World Monitor',
    subtitle:
      'The three-tier OSINT collection board: radars group sources, sources capture signals. Everything below is one snapshot read from the hub when this page loaded.',
    noRealtime: 'Not a live feed: there is no stream, no polling and no clock here. Refreshing the page is the only update.',
    stateLoaded: 'Snapshot loaded from the hub.',
    stateEmpty: 'The hub answered successfully and the collection is genuinely empty: no radars, no sources, no signals.',
    stateUnavailable:
      'Collector snapshot unavailable — the hub could not be reached. The figures are unknown, they are not zero.',
    stateForbidden: 'The hub refused the snapshot even though this page was cleared for you. Nothing was loaded.',
    pipelineRadars: 'Tier 1 · Radars',
    pipelineSources: 'Tier 2 · Sources',
    pipelineSignals: 'Tier 3 · Signals',
    pipelineTasks: 'Task queue',
    pipelineSeparate: 'separate list, not filtered with the tiers',
    statActiveRadars: 'Radars active',
    statActiveSources: 'Sources active',
    statSignals: 'Signals stored',
    statPendingTasks: 'Tasks pending',
    statOf: '{active} of {total}',
    statUnknown: 'unknown',
    unknownHint: 'not reported by the snapshot',
    newRadar: '+ New radar',
    newSource: '+ New source',
    allSignals: 'All signals',
    allSources: 'All sources',
    hierarchyTitle: 'Radar → source → signal',
    hierarchyNote:
      'Picking a radar narrows the sources. Picking a source narrows the signals. The task queue below stays a separate list of collector jobs and is deliberately never filtered with them.',
    filterTitle: 'Narrow the board',
    filterSubtitle: 'Every value here is an option the hub publishes on the model itself; nothing is invented.',
    filterPlatform: 'Platform',
    filterDriver: 'Collector driver',
    filterClear: 'Clear all filters',
    filterActiveRadar: 'Radar filter: {name}',
    filterActiveSource: 'Source filter: {id}',
    filterUnknownRadar: 'The radar in this address ({id}) is not in the snapshot. Showing every source instead of pretending it exists.',
    filterUnknownSource: 'The source in this address ({id}) is not in the snapshot. Signal filtering follows the stored references, not a guessed one.',
    filterNoMatch: 'No entries match the active filter.',
    tierRadars: '1 · Radars',
    tierSources: '2 · Sources',
    tierSignals: '3 · Signals',
    tierCrud: 'Records',
    tierRadarSubtitle: 'Macro issue or operation the collection is organised around',
    tierSourceSubtitle: 'A channel, account, keyword or feed a collector reads',
    tierSignalSubtitle: 'A captured post, video or page, plus the triage text stored with it',
    radarSelected: 'selected',
    radarSourceCount: '{sources} sources · {signals} signals',
    sourceNeverChecked: 'never checked — freshness unknown',
    sourceLastChecked: 'last checked {value}',
    sourceCheckedVerbatim: 'as stored',
    sourceInterval: 'every {minutes} min',
    sourceFails: '{count} recorded failures',
    sourceTarget: 'target',
    healthHealthy: 'healthy',
    healthDegraded: 'degraded',
    healthIdle: 'idle',
    healthUnknown: 'no health recorded',
    signalNoTimestamp: 'no publication timestamp stored',
    signalPublished: 'published {value}',
    signalCaptured: 'captured {value}',
    signalUrgency: 'stored urgency score {score}/100',
    signalCounts: 'views {views} · likes {likes} · comments {comments}',
    signalAiTriage: 'Stored AI triage',
    signalAiNote: 'This is the aiSummary field stored on the record, reproduced verbatim. It is an unreviewed claim, not a verified finding.',
    signalUnverified: 'not verified',
    signalSourceUrl: 'Source URL',
    driversTitle: 'Collector drivers',
    driversSubtitle:
      'The list is read from the driver enum the hub publishes for monitor_sources.driver, so a driver the schema knows can never be hidden here.',
    driversAssigned: '{count} sources on this driver',
    driversNoDescription: 'No description recorded for this driver.',
    driverUnknown: 'Snapshot contains a driver outside the published enum: {driver}',
    driverCounts: 'rss: {rss} · api: {api} · playwright: {playwright} · openclaw: {openclaw} · agent: {agent}',
    queueTitle: 'Collector task queue',
    queueSubtitle:
      'monitor_tasks rows: jobs a sentinel worker claims. This is work that was queued, not a measurement of anything live, and it is not filtered with the tiers above.',
    queueInspect: 'Inspect queue',
    queueEmpty: 'No tasks in the queue. This is the hub reporting an empty queue, not an error.',
    queueColDriver: 'driver',
    queueColStatus: 'status',
    queueColWorker: 'worker',
    queueColSignals: 'signals',
    queueColCreated: 'queued at',
    queueColDetail: 'detail',
    queueNoWorker: 'no worker claimed',
    queueNoDetail: 'no detail stored',
    accessDeniedNote: 'Access was checked on the server against the hub\'s published rules before this screen rendered.',
    rolesTitle: 'Who may see this screen',
    rolesBody:
      'The hub publishes GET /monitor/overview as public, so that rule alone would let any signed-in identity read it. This screen therefore also requires the role the hub publishes for listing monitor_tasks. Both rules are read from _schema; HQ does not keep its own role table.',
    geoTitle: 'No geographic view',
    geoBody:
      'Radars are named groupings, not places. The hub stores no coordinates for them and HQ has no map projection, so no map is drawn. The tactical world map removed here previously displayed six invented regions with invented signal counts and urgency scores.',
    focusHint: 'Keyboard: Escape clears the current filter and returns focus to the filter heading.',
    reducedMotion: 'Animations on this screen are disabled when the system asks for reduced motion.',
  },
  id: {
    title: 'Pemantau Dunia',
    subtitle:
      'Papan koleksi OSINT tiga tingkatan: radar mengelompokkan sumber, sumber menangkap sinyal. Semua di bawah ini adalah satu snapshot yang dibaca dari hub ketika halaman ini dimuat.',
    noRealtime: 'Bukan siaran langsung: tidak ada stream, tidak ada polling, tidak ada jam di halaman ini. Memuat ulang halaman adalah satu-satunya pembaruan.',
    stateLoaded: 'Snapshot dimuat dari hub.',
    stateEmpty: 'Hub menjawab dengan sukses dan koleksi benar-benar kosong: tanpa radar, sumber, maupun sinyal.',
    stateUnavailable:
      'Snapshot pengumpul tidak tersedia — hub tidak dapat dijangkau. Angkanya tidak diketahui, bukan nol.',
    stateForbidden: 'Hub menolak snapshot meskipun halaman ini sudah dibuka untuk Anda. Tidak ada data yang dimuat.',
    pipelineRadars: 'Tingkat 1 · Radar',
    pipelineSources: 'Tingkat 2 · Sumber',
    pipelineSignals: 'Tingkat 3 · Sinyal',
    pipelineTasks: 'Antrean tugas',
    pipelineSeparate: 'daftar terpisah, tidak ikut disaring',
    statActiveRadars: 'Radar aktif',
    statActiveSources: 'Sumber aktif',
    statSignals: 'Sinyal tersimpan',
    statPendingTasks: 'Tugas menunggu',
    statOf: '{active} dari {total}',
    statUnknown: 'tidak diketahui',
    unknownHint: 'tidak dilaporkan oleh snapshot',
    newRadar: '+ Radar baru',
    newSource: '+ Sumber baru',
    allSignals: 'Semua sinyal',
    allSources: 'Semua sumber',
    hierarchyTitle: 'Radar → sumber → sinyal',
    hierarchyNote:
      'Memilih radar mempersempit daftar sumber. Memilih sumber mempersempit daftar sinyal. Antrean tugas di bawah tetap daftar terpisah untuk para pekerja pengumpul dan sengaja tidak pernah disaring bersama tingkatan tersebut.',
    filterTitle: 'Persempit papan',
    filterSubtitle: 'Semua nilai di sini adalah opsi yang dipublikasikan hub pada model itu sendiri; tidak ada yang dikarang.',
    filterPlatform: 'Platform',
    filterDriver: 'Pengemudi pengumpul',
    filterClear: 'Hapus semua penyaringan',
    filterActiveRadar: 'Penyaring radar: {name}',
    filterActiveSource: 'Penyaring sumber: {id}',
    filterUnknownRadar: 'Radar di alamat ini ({id}) tidak ada dalam snapshot. Semua sumber ditampilkan daripada berpura-pura radar itu ada.',
    filterUnknownSource: 'Sumber di alamat ini ({id}) tidak ada dalam snapshot. Penyaringan sinyal mengikuti rujukan tersimpan, bukan tebakan.',
    filterNoMatch: 'Tidak ada entri yang cocok dengan penyaringan aktif.',
    tierRadars: '1 · Radar',
    tierSources: '2 · Sumber',
    tierSignals: '3 · Sinyal',
    tierCrud: 'Rekaman',
    tierRadarSubtitle: 'Isu atau operasi makro yang menjadi susunan koleksi',
    tierSourceSubtitle: 'Channel, akun, kata kunci, atau feed yang dibaca pengumpul',
    tierSignalSubtitle: 'Unggahan, video, atau halaman yang ditangkap beserta teks triase yang tersimpan',
    radarSelected: 'dipilih',
    radarSourceCount: '{sources} sumber · {signals} sinyal',
    sourceNeverChecked: 'belum pernah diperiksa — kebaruan tidak diketahui',
    sourceLastChecked: 'terakhir diperiksa {value}',
    sourceCheckedVerbatim: 'apa adanya',
    sourceInterval: 'setiap {minutes} menit',
    sourceFails: '{count} kegagalan tercatat',
    sourceTarget: 'sasaran',
    healthHealthy: 'sehat',
    healthDegraded: 'terganggu',
    healthIdle: 'menganggur',
    healthUnknown: 'tidak ada kondisi tercatat',
    signalNoTimestamp: 'tidak ada stempel waktu publikasi yang tersimpan',
    signalPublished: 'dipublikasikan {value}',
    signalCaptured: 'ditangkap {value}',
    signalUrgency: 'skor urgensi tersimpan {score}/100',
    signalCounts: 'ditonton {views} · suka {likes} · komentar {comments}',
    signalAiTriage: 'Triase AI tersimpan',
    signalAiNote: 'Ini adalah kolom aiSummary yang tersimpan pada rekaman, ditampilkan apa adanya. Ini klaim yang belum ditinjau, bukan temuan terverifikasi.',
    signalUnverified: 'belum terverifikasi',
    signalSourceUrl: 'URL sumber',
    driversTitle: 'Pengemudi pengumpul',
    driversSubtitle:
      'Daftar ini dibaca dari enum pengemudi yang dipublikasikan hub untuk monitor_sources.driver, sehingga pengemudi yang dikenal skema tidak pernah bisa tersembunyi di sini.',
    driversAssigned: '{count} sumber memakai pengemudi ini',
    driversNoDescription: 'Tidak ada deskripsi yang tercatat untuk pengemudi ini.',
    driverUnknown: 'Snapshot memuat pengemudi di luar enum yang dipublikasikan: {driver}',
    driverCounts: 'rss: {rss} · api: {api} · playwright: {playwright} · openclaw: {openclaw} · agent: {agent}',
    queueTitle: 'Antrean tugas pengumpul',
    queueSubtitle:
      'Baris monitor_tasks: tugas yang diambil pekerja sentinel. Ini pekerjaan yang mengantre, bukan pengukuran sesuatu yang langsung berjalan, dan tidak disaring bersama tingkatan di atas.',
    queueInspect: 'Periksa antrean',
    queueEmpty: 'Antrean kosong. Ini laporan antrean kosong dari hub, bukan galat.',
    queueColDriver: 'pengemudi',
    queueColStatus: 'status',
    queueColWorker: 'pekerja',
    queueColSignals: 'sinyal',
    queueColCreated: 'dimasukkan pukul',
    queueColDetail: 'rincian',
    queueNoWorker: 'belum ada pekerja yang mengambil',
    queueNoDetail: 'tidak ada rincian tersimpan',
    accessDeniedNote: 'Akses diperiksa di sisi server terhadap aturan yang dipublikasikan hub sebelum layar ini ditampilkan.',
    rolesTitle: 'Siapa yang boleh melihat layar ini',
    rolesBody:
      'Hub memublikasikan GET /monitor/overview sebagai publik, sehingga aturan itu saja akan membiarkan identitas mana pun yang sudah masuk membacanya. Karena itu layar ini juga memerlukan peran yang dipublikasikan hub untuk membaca daftar monitor_tasks. Kedua aturan dibaca dari _schema; Kantor Pusat tidak menyimpan tabel perannya sendiri.',
    geoTitle: 'Tidak ada tampilan geografis',
    geoBody:
      'Radar adalah pengelompokan bernama, bukan lokasi. Hub tidak menyimpan koordinat untuknya dan Kantor Pusat tidak punya proyeksi peta, sehingga tidak ada peta yang digambar. Peta taktis yang dihapus di sini sebelumnya menampilkan enam wilayah karangan dengan jumlah sinyal dan skor urgensi yang juga karangan.',
    focusHint: 'Papan ketik: Escape menghapus penyaringan saat ini dan mengembalikan fokus ke judul penyaring.',
    reducedMotion: 'Animasi pada layar ini dimatikan ketika sistem meminta gerak yang dikurangi.',
  },
})

export type MonitorMessageKey = keyof (typeof monitorCatalog)['en']

export function monitorCopy(locale: Locale): LocaleCatalog<MonitorMessageKey>['en'] {
  return monitorCatalog[locale]
}

/**
 * The three states the snapshot can come back in. `unavailable` and `forbidden`
 * are never collapsed into `empty`, because "we could not ask" and "there is
 * nothing" are different sentences and the screen must be able to tell them.
 */
export type MonitorSnapshotState = 'loaded' | 'empty' | 'unavailable' | 'forbidden'

export function monitorStateMessage(locale: Locale, state: MonitorSnapshotState): string {
  const copy = monitorCatalog[locale]
  if (state === 'empty') return copy.stateEmpty
  if (state === 'unavailable') return copy.stateUnavailable
  if (state === 'forbidden') return copy.stateForbidden
  return copy.stateLoaded
}

/**
 * Health is a stored enum, not a live probe. A null/unknown value renders as
 * "no health recorded" — never as NOMINAL and never as healthy-by-default.
 */
export function monitorHealthLabel(locale: Locale, healthStatus: unknown): string {
  const copy = monitorCatalog[locale]
  if (healthStatus === 'healthy') return copy.healthHealthy
  if (healthStatus === 'degraded') return copy.healthDegraded
  if (healthStatus === 'idle') return copy.healthIdle
  return copy.healthUnknown
}

export type MonitorHealthTone = 'ok' | 'hot' | 'night'

export function monitorHealthTone(healthStatus: unknown): MonitorHealthTone {
  if (healthStatus === 'healthy') return 'ok'
  if (healthStatus === 'degraded') return 'hot'
  return 'night'
}
