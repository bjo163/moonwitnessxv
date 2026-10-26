export type CockpitLocale = 'id' | 'en'

export interface CockpitCopyCatalog {
  // TopBar
  brandTitle: string
  brandSubtitle: string
  servicesOnline: string
  startAll: string
  stopAll: string
  freePorts: string
  crtFilter: string
  crtFilterActive: string
  quickPlayerPlay: string
  quickPlayerPause: string
  quickPlayerMute: string
  quickPlayerUnmute: string
  quickPlayerVolume: string
  selectLanguage: string

  // Sidebar
  microservices: string
  liveControl: string
  statusOnline: string
  statusOffline: string
  statusStarting: string
  statusError: string
  actionStart: string
  actionStop: string
  actionRestart: string
  actionPreview: string
  pid: string
  uptime: string
  port: string
  memory: string

  // Tabs
  tabLogs: string
  tabPreview: string
  tabMedia: string
  tabPorts: string
  tabLedger: string
  tabProgress: string

  // Logs
  filterAll: string
  searchLogsPlaceholder: string
  errorsOnly: string
  autoScroll: string
  clearLogs: string
  copyLogs: string
  emptyLogs: string

  // Preview
  urlPlaceholder: string
  go: string
  reload: string
  externalWindow: string
  iframeTitle: string

  // Media
  sectionTitle: string
  sectionSubtitle: string
  categoryAll: string
  categoryBgm: string
  categoryRadio: string
  categoryIptv: string
  addCustomChannel: string
  channelNameLabel: string
  channelNamePlaceholder: string
  channelTypeLabel: string
  channelUrlLabel: string
  channelUrlPlaceholder: string
  channelGenreLabel: string
  channelGenrePlaceholder: string
  btnAddChannel: string
  errorInvalidUrl: string
  errorEmptyName: string
  successChannelAdded: string

  // Tuner
  tunerTitle: string
  bandFM: string
  bandSW1: string
  bandSW2: string

  // Ports
  portsTitle: string
  portsSubtitle: string
  colPort: string
  colTag: string
  colName: string
  colStatus: string
  colProcess: string
  colAction: string
  statusBound: string
  statusIdle: string
  btnOpenPreview: string
  btnFreePorts: string

  // Ledger
  ledgerTitle: string
  ledgerSubtitle: string
  colTimestamp: string
  colService: string
  colMessage: string
  btnRefresh: string
  btnClearLedger: string
  emptyLedger: string

  // Progress
  progressTitle: string
  progressSubtitle: string
  overallProgress: string
  closedTasks: string
  openTasks: string
  filterAllPriorities: string
  filterP0: string
  filterP1: string
  filterP2: string
  groupFoundation: string
  groupSource: string
  groupResearch: string
  groupWitness: string
  groupOperations: string
  groupOptionalResearch: string
  groupRelease: string
  groupEcosystem: string
  openBlockersHeader: string

  // Footer & Shortcuts
  shortcutsTitle: string
  shortcutPlayPause: string
  shortcutMute: string
  shortcutChannel: string
  shortcutPorts: string
  shortcutTabs: string
  shortcutHelp: string
  runtimeInfo: string

  // Confirm Modal
  stopAllTitle: string
  stopAllDesc: string
  freePortsTitle: string
  freePortsDesc: string
  confirmBtn: string
  cancelBtn: string

  // Help Modal
  helpTitle: string
  helpSubtitle: string
  colKey: string
  colFunction: string
  closeHelp: string
}

export const COCKPIT_COPY: Record<CockpitLocale, CockpitCopyCatalog> = {
  en: {
    // TopBar
    brandTitle: 'MOONWITNESS COCKPIT',
    brandSubtitle: 'MISSION SUPERVISOR // LOCAL ENGINE',
    servicesOnline: 'SERVICES ONLINE',
    startAll: 'START ALL',
    stopAll: 'STOP ALL',
    freePorts: 'FREE PORTS',
    crtFilter: 'CRT SCANLINES',
    crtFilterActive: 'CRT ACTIVE',
    quickPlayerPlay: 'Play quick audio stream',
    quickPlayerPause: 'Pause audio stream',
    quickPlayerMute: 'Mute audio',
    quickPlayerUnmute: 'Unmute audio',
    quickPlayerVolume: 'Volume',
    selectLanguage: 'Select interface language',

    // Sidebar
    microservices: 'MICROSERVICES',
    liveControl: 'LIVE CONTROL',
    statusOnline: 'ONLINE',
    statusOffline: 'OFFLINE',
    statusStarting: 'STARTING',
    statusError: 'ERROR',
    actionStart: 'START',
    actionStop: 'STOP',
    actionRestart: 'RESTART',
    actionPreview: 'PREVIEW',
    pid: 'PID',
    uptime: 'UP',
    port: 'PORT',
    memory: 'MEM',

    // Tabs
    tabLogs: 'Terminal & Logs',
    tabPreview: 'In-App Web Preview',
    tabMedia: 'Media & IPTV Player',
    tabPorts: 'Network & Ports',
    tabLedger: 'Error Ledger',
    tabProgress: 'Task Progress',

    // Logs
    filterAll: 'ALL SERVICES',
    searchLogsPlaceholder: 'Search console logs...',
    errorsOnly: 'Errors Only',
    autoScroll: 'Auto-Scroll',
    clearLogs: 'Clear',
    copyLogs: 'Copy',
    emptyLogs: 'No logs recorded for this view.',

    // Preview
    urlPlaceholder: 'Enter URL or choose preset...',
    go: 'GO',
    reload: 'Reload',
    externalWindow: 'Open in External Window',
    iframeTitle: 'Application In-App Web Preview',

    // Media
    sectionTitle: 'Media & Stream Tuner',
    sectionSubtitle: 'Live Radio, IPTV Video Channels, and Lo-Fi Ambient BGM',
    categoryAll: 'All Channels',
    categoryBgm: 'BGM Audio',
    categoryRadio: 'Radio Stations',
    categoryIptv: 'IPTV Video',
    addCustomChannel: 'Register Custom Stream',
    channelNameLabel: 'Stream / Station Name',
    channelNamePlaceholder: 'e.g. Neo Tokyo Lo-Fi FM',
    channelTypeLabel: 'Stream Type',
    channelUrlLabel: 'Stream URL (HLS .m3u8 or MP3 audio stream)',
    channelUrlPlaceholder: 'https://example.com/live/stream.m3u8',
    channelGenreLabel: 'Genre / Description (Optional)',
    channelGenrePlaceholder: 'Ambient, News, Synthwave...',
    btnAddChannel: 'ADD STREAM TO RACK',
    errorInvalidUrl: 'Please provide a valid HTTP/HTTPS stream URL.',
    errorEmptyName: 'Stream name cannot be empty.',
    successChannelAdded: 'Channel successfully added to rack.',

    // Tuner
    tunerTitle: 'Analog Frequency Tuner',
    bandFM: 'FM Band',
    bandSW1: 'Shortwave 1',
    bandSW2: 'Shortwave 2',

    // Ports
    portsTitle: 'Monorepo Service Network Ports',
    portsSubtitle: 'Port bindings, process listeners, and live preview status for workspace services',
    colPort: 'PORT',
    colTag: 'SERVICE TAG',
    colName: 'APPLICATION NAME',
    colStatus: 'STATE',
    colProcess: 'PROCESS',
    colAction: 'ACTION',
    statusBound: 'BOUND / LISTENING',
    statusIdle: 'IDLE / FREE',
    btnOpenPreview: 'OPEN IN PREVIEW',
    btnFreePorts: 'RELEASE ALL PORTS',

    // Ledger
    ledgerTitle: 'Workspace Runtime Error Ledger',
    ledgerSubtitle: 'Aggregated error logs recorded across workspace services',
    colTimestamp: 'TIMESTAMP',
    colService: 'SOURCE',
    colMessage: 'ERROR DETAIL',
    btnRefresh: 'REFRESH LEDGER',
    btnClearLedger: 'CLEAR dev-errors.log',
    emptyLedger: 'Zero runtime errors logged. System health is optimal.',

    // Progress
    progressTitle: 'MoonWitness XV Master Execution Register',
    progressSubtitle: 'Live status synced directly from TODO.md master planning backlog',
    overallProgress: 'OVERALL COMPLETION',
    closedTasks: 'CLOSED TASKS',
    openTasks: 'OPEN TASKS',
    filterAllPriorities: 'ALL PRIORITIES',
    filterP0: 'P0 BLOCKERS',
    filterP1: 'P1 CORE',
    filterP2: 'P2 HORIZON',
    groupFoundation: 'G0 — FOUNDATION',
    groupSource: 'G1 — SOURCE',
    groupResearch: 'G2 — RESEARCH',
    groupWitness: 'G3 — WITNESS & CREATIVE',
    groupOperations: 'G4 — OPERATIONS',
    groupOptionalResearch: 'G5 — OPTIONAL RESEARCH',
    groupRelease: 'G6 — RELEASE',
    groupEcosystem: 'G7 — ECOSYSTEM',
    openBlockersHeader: 'ACTIVE P0 BLOCKERS IN THIS GROUP',

    // Footer & Shortcuts
    shortcutsTitle: 'KEYBOARD SHORTCUTS',
    shortcutPlayPause: 'Play/Pause Audio',
    shortcutMute: 'Toggle Mute',
    shortcutChannel: 'Prev/Next Channel',
    shortcutPorts: 'Jump to Ports',
    shortcutTabs: 'Switch Tab 1-6',
    shortcutHelp: 'Help & Shortcuts Guide',
    runtimeInfo: 'LOCAL WORKSPACE COCKPIT v1.0.0 // MOONWITNESS XV',

    // Confirm Modal
    stopAllTitle: 'Stop All Microservices?',
    stopAllDesc: 'This will terminate all running workspace processes (Radio, Dock, HQ, AI, Sentinel). Are you sure?',
    freePortsTitle: 'Free Allocated Network Ports?',
    freePortsDesc: 'This will forcefully release ports 3000-3004 by terminating lingering background processes.',
    confirmBtn: 'CONFIRM ACTION',
    cancelBtn: 'CANCEL',

    // Help Modal
    helpTitle: 'Cockpit Operator Guide & Keyboard Controls',
    helpSubtitle: 'Quick reference manual for local workspace technician control',
    colKey: 'KEY',
    colFunction: 'ACTION / FUNCTION',
    closeHelp: 'CLOSE [ESC]',
  },
  id: {
    // TopBar
    brandTitle: 'KONSOL COCKPIT MOONWITNESS',
    brandSubtitle: 'SUPERVISOR MISI // MESIN LOKAL',
    servicesOnline: 'SERVIS ONLINE',
    startAll: 'JALANKAN SEMUA',
    stopAll: 'HENTIKAN SEMUA',
    freePorts: 'BEBASKAN PORT',
    crtFilter: 'GARIS PINDAI CRT',
    crtFilterActive: 'CRT AKTIF',
    quickPlayerPlay: 'Putar audio cepat',
    quickPlayerPause: 'Jeda audio',
    quickPlayerMute: 'Bisukan audio',
    quickPlayerUnmute: 'Nyalakan audio',
    quickPlayerVolume: 'Volume',
    selectLanguage: 'Pilih bahasa antarmuka',

    // Sidebar
    microservices: 'MIKROSERVIS',
    liveControl: 'KONTROL LANGSUNG',
    statusOnline: 'AKTIF',
    statusOffline: 'NONAKTIF',
    statusStarting: 'MEMULAI',
    statusError: 'ERROR',
    actionStart: 'MULAI',
    actionStop: 'HENTIKAN',
    actionRestart: 'MULAI ULANG',
    actionPreview: 'PRATINJAU',
    pid: 'PID',
    uptime: 'AKTIF',
    port: 'PORT',
    memory: 'MEMORI',

    // Tabs
    tabLogs: 'Terminal & Log',
    tabPreview: 'Pratinjau Web Internal',
    tabMedia: 'Pemutar Media & IPTV',
    tabPorts: 'Jaringan & Port',
    tabLedger: 'Buku Log Error',
    tabProgress: 'Progres Tugas',

    // Logs
    filterAll: 'SEMUA SERVIS',
    searchLogsPlaceholder: 'Cari log konsol...',
    errorsOnly: 'Hanya Error',
    autoScroll: 'Gulir Otomatis',
    clearLogs: 'Bersihkan',
    copyLogs: 'Salin',
    emptyLogs: 'Tidak ada catatan log pada tampilan ini.',

    // Preview
    urlPlaceholder: 'Masukkan URL atau pilih preset...',
    go: 'BUKA',
    reload: 'Muat Ulang',
    externalWindow: 'Buka di Jendela Eksternal',
    iframeTitle: 'Pratinjau Web Internal Aplikasi',

    // Media
    sectionTitle: 'Tuner Media & Siaran',
    sectionSubtitle: 'Radio Langsung, Saluran Video IPTV, dan Musik Latar BGM Lo-Fi',
    categoryAll: 'Semua Saluran',
    categoryBgm: 'Audio BGM',
    categoryRadio: 'Stasiun Radio',
    categoryIptv: 'Video IPTV',
    addCustomChannel: 'Daftarkan Siaran Kustom',
    channelNameLabel: 'Nama Siaran / Stasiun',
    channelNamePlaceholder: 'contoh: Neo Tokyo Lo-Fi FM',
    channelTypeLabel: 'Jenis Siaran',
    channelUrlLabel: 'URL Siaran (HLS .m3u8 atau audio MP3)',
    channelUrlPlaceholder: 'https://example.com/live/stream.m3u8',
    channelGenreLabel: 'Genre / Deskripsi (Opsional)',
    channelGenrePlaceholder: 'Ambient, Berita, Synthwave...',
    btnAddChannel: 'TAMBAHKAN KE RAK SIARAN',
    errorInvalidUrl: 'Harap masukkan URL siaran HTTP/HTTPS yang valid.',
    errorEmptyName: 'Nama siaran tidak boleh kosong.',
    successChannelAdded: 'Saluran berhasil ditambahkan ke rak.',

    // Tuner
    tunerTitle: 'Tuner Frekuensi Analog',
    bandFM: 'Pita FM',
    bandSW1: 'Gelombang Pendek 1',
    bandSW2: 'Gelombang Pendek 2',

    // Ports
    portsTitle: 'Port Jaringan Servis Repositori',
    portsSubtitle: 'Ikatan port, proses pendengar, dan status pratinjau langsung untuk servis repositori',
    colPort: 'PORT',
    colTag: 'TAG SERVIS',
    colName: 'NAMA APLIKASI',
    colStatus: 'STATUS',
    colProcess: 'PROSES',
    colAction: 'AKSI',
    statusBound: 'TERIKAT / MENDENGAR',
    statusIdle: 'BEBAS / IDLE',
    btnOpenPreview: 'BUKA DI PRATINJAU',
    btnFreePorts: 'LEPASKAN SEMUA PORT',

    // Ledger
    ledgerTitle: 'Buku Log Error Runtime Repositori',
    ledgerSubtitle: 'Agregasi catatan log error di seluruh mikroservis repositori',
    colTimestamp: 'WAKTU',
    colService: 'SUMBER',
    colMessage: 'DETAIL ERROR',
    btnRefresh: 'SEGARKAN BUKU LOG',
    btnClearLedger: 'BERSIHKAN dev-errors.log',
    emptyLedger: 'Nol catatan error. Kesehatan sistem optimal.',

    // Progress
    progressTitle: 'Register Eksekusi Master MoonWitness XV',
    progressSubtitle: 'Status langsung disinkronkan dari backlog perencanaan master TODO.md',
    overallProgress: 'PENYELESAIAN KESELURUHAN',
    closedTasks: 'TUGAS SELESAI',
    openTasks: 'TUGAS TERBUKA',
    filterAllPriorities: 'SEMUA PRIORITAS',
    filterP0: 'BLOKIR P0',
    filterP1: 'INTI P1',
    filterP2: 'HORIZON P2',
    groupFoundation: 'G0 — FONDASI',
    groupSource: 'G1 — SUMBER',
    groupResearch: 'G2 — RISET',
    groupWitness: 'G3 — KESAKSIAN & KREATIF',
    groupOperations: 'G4 — OPERASIONAL',
    groupOptionalResearch: 'G5 — RISET OPSIONAL',
    groupRelease: 'G6 — RILIS',
    groupEcosystem: 'G7 — EKOSISTEM',
    openBlockersHeader: 'BLOKIR P0 AKTIF DALAM GRUP INI',

    // Footer & Shortcuts
    shortcutsTitle: 'PINTASAN KEYBOARD',
    shortcutPlayPause: 'Putar/Jeda Audio',
    shortcutMute: 'Bisukan/Nyalakan',
    shortcutChannel: 'Saluran Sblm/Brkt',
    shortcutPorts: 'Ke Tab Port',
    shortcutTabs: 'Beralih Tab 1-6',
    shortcutHelp: 'Panduan Bantuan & Pintasan',
    runtimeInfo: 'KONSOL REPOSITORI LOKAL v1.0.0 // MOONWITNESS XV',

    // Confirm Modal
    stopAllTitle: 'Hentikan Semua Mikroservis?',
    stopAllDesc: 'Tindakan ini akan menghentikan seluruh proses kerja yang berjalan (Radio, Dock, HQ, AI, Sentinel). Anda yakin?',
    freePortsTitle: 'Bebaskan Port Jaringan?',
    freePortsDesc: 'Tindakan ini akan melepaskan paksa port 3000-3004 dengan menghentikan proses yang menggantung.',
    confirmBtn: 'KONFIRMASI AKSI',
    cancelBtn: 'BATAL',

    // Help Modal
    helpTitle: 'Panduan Operator Cockpit & Pintasan Keyboard',
    helpSubtitle: 'Manual referensi cepat untuk kontrol teknisi repositori lokal',
    colKey: 'TOMBOL',
    colFunction: 'AKSI / FUNGSI',
    closeHelp: 'TUTUP [ESC]',
  },
}

export const getCockpitCopy = (locale: CockpitLocale = 'en'): CockpitCopyCatalog => {
  return COCKPIT_COPY[locale] ?? COCKPIT_COPY.en
}
