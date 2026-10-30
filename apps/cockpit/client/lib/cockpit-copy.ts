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

  // Operator failure copy (rendered from the machine-readable lastErrorCode)
  errPortBusy: string
  errPortNotReleased: string
  errSpawnFailed: string
  startAllRefused: string

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

  // Media transport (UI2-P18d): every code the transport can actually be in.
  // There is deliberately no "NOMINAL"-style catch-all: an unknown state says
  // "unknown", because a monitoring surface must not upgrade silence to health.
  mediaTransportLabel: string
  statusPlaying: string
  statusPaused: string
  statusLoading: string
  statusBuffering: string
  statusStopped: string
  statusBlocked: string
  statusUnsupported: string
  statusError: string
  statusNoSurface: string
  statusUnknown: string
  mediaNoReason: string
  mediaBlockedHint: string
  visualizerRole: string
  visualizerReduced: string
  playlistLabel: string
  kindFilterLabel: string
  channelSearchPlaceholder: string
  noChannelsMatch: string
  rackBuiltInOnly: string
  btnPrevChannel: string
  btnNextChannel: string
  btnPlay: string
  btnStop: string
  btnMuted: string
  btnVolume: string
  btnPip: string
  titlePrevChannel: string
  titleNextChannel: string
  titlePlayPause: string
  titleMute: string
  titlePip: string
  pipUnavailable: string

  // Tuner
  tunerTitle: string
  tunerShow: string
  tunerHide: string
  tunerPseudoNote: string
  tunerActiveBand: string
  bandAM: string
  bandFM: string
  bandSW1: string
  bandSW2: string
  bandSW3: string

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
  workerNoPort: string
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
  groupFoundation: string
  groupSource: string
  groupResearch: string
  groupWitness: string
  groupOperations: string
  groupOptionalResearch: string
  groupRelease: string
  groupEcosystem: string
  groupUnmapped: string
  // UI2-P20b/d: delivery truth, not a single live/polling boolean.
  progressFeedReconnecting: string
  progressFeedPollAfterDrop: string
  progressFeedUnavailable: string
  progressErrorLabel: string
  progressRowsCapped: string
  progressAbsoluteFlips: string
  progressFlipsClosed: string
  progressFlipsReopened: string
  progressPercentIsRegister: string
  progressCountMismatch: string
  progressKeyboardHint: string
  openBlockersHeader: string
  progressSourceNote: string
  progressLiveBadge: string
  progressPollingBadge: string
  progressSessionSuffix: string
  progressLastDelivery: string
  progressEmptyTitle: string
  progressEmptyHint: string
  progressStaleNote: string
  progressOpenSuffix: string
  progressCompletionHint: string
  progressClear: string
  progressNoP0Hint: string
  progressRegisterUpdated: string
  progressPanelGroups: string
  progressPanelGroupsSub: string
  progressPanelPriorities: string
  progressPanelPrioritiesSub: string
  progressPanelMilestones: string
  progressPanelMilestonesSub: string
  progressPanelRows: string
  progressShowingRows: string
  progressPanelFlips: string
  progressPanelFlipsSub: string
  progressFlipsEmpty: string
  provenanceTitle: string
  provenanceBody: string
  progressFilterStatus: string
  progressFilterOpen: string
  progressFilterDone: string
  progressFilterAll: string
  progressFilterPriority: string
  progressFilterMilestone: string
  progressFocus: string
  progressClearFocus: string
  progressLoading: string
  progressTrendNeedsTwo: string
  progressTrendAria: string
  progressTrendSamples: string
  colTask: string
  colDeliverable: string
  colMilestone: string
  colGroup: string
  colDone: string
  colOpen: string
  colTotal: string
  colProgress: string
  progressNoRowsDone: string
  progressNoRowsOpen: string
  timeNotYet: string
  timeUnknown: string
  timeSeconds: string
  timeMinutes: string
  timeHours: string

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
  confirmIrreversible: string
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
      actionStart: 'START',
    actionStop: 'STOP',
    actionRestart: 'RESTART',
    actionPreview: 'PREVIEW',
    pid: 'PID',
    uptime: 'UP',
    port: 'PORT',
    memory: 'MEM',

    errPortBusy: 'Port {port} is already in use — stop the other supervisor before starting this service.',
    errPortNotReleased: 'Port {port} did not release after stop. Try FREE PORTS, then restart.',
    errSpawnFailed: 'Failed to launch the process: {reason}',
    startAllRefused: '{count} refused',

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

    // Media transport — one label per state the engine can really be in.
    mediaTransportLabel: 'Transport',
    statusPlaying: 'PLAYING',
    statusPaused: 'PAUSED',
    statusLoading: 'LOADING STREAM',
    statusBuffering: 'BUFFERING',
    statusStopped: 'PLAYBACK STOPPED',
    statusBlocked: 'AUTOPLAY BLOCKED',
    statusUnsupported: 'HLS NOT SUPPORTED HERE',
    statusError: 'STREAM ERROR',
    statusNoSurface: 'VIDEO SURFACE NOT MOUNTED',
    statusUnknown: 'STATE UNKNOWN',
    mediaNoReason: 'no reason reported by the player',
    mediaBlockedHint: 'Press PLAY once to grant this tab audio or video.',
    visualizerRole: 'Decorative level meter — the cockpit does not decode this stream for analysis',
    visualizerReduced: 'Animation paused for reduced motion',
    playlistLabel: 'Playlist',
    kindFilterLabel: 'Kind',
    channelSearchPlaceholder: 'Search stations, genre, or country…',
    noChannelsMatch: 'No channel matches this filter; clear it to see the rack.',
    rackBuiltInOnly: 'Rack fetch failed — showing the built-in rack only.',
    btnPrevChannel: 'PREV',
    btnNextChannel: 'NEXT',
    btnPlay: 'PLAY',
    btnStop: 'STOP',
    btnMuted: 'MUTED',
    btnVolume: 'VOLUME',
    btnPip: 'PIP',
    titlePrevChannel: 'Previous channel ([)',
    titleNextChannel: 'Next channel (])',
    titlePlayPause: 'Play or pause (Space)',
    titleMute: 'Mute or unmute (M)',
    titlePip: 'Picture-in-picture (P)',
    pipUnavailable: 'Picture-in-picture is not available in this browser',

    // Tuner
    tunerTitle: 'Analog Frequency Tuner',
    tunerShow: 'SHOW TUNER',
    tunerHide: 'HIDE TUNER',
    tunerPseudoNote:
      'Illustrative pseudo-frequency: derived from the channel id, not a real broadcast tuning.',
    tunerActiveBand: 'Active band',
    bandAM: 'Medium Wave / AM',
    bandFM: 'FM Band',
    bandSW1: 'Shortwave 1',
    bandSW2: 'Shortwave 2',
    bandSW3: 'Shortwave 3',

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
    workerNoPort: 'WORKER',
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
    groupFoundation: 'G0 — FOUNDATION',
    groupSource: 'G1 — SOURCE',
    groupResearch: 'G2 — RESEARCH',
    groupWitness: 'G3 — WITNESS & CREATIVE',
    groupOperations: 'G4 — OPERATIONS',
    groupOptionalResearch: 'G5 — OPTIONAL RESEARCH',
    groupRelease: 'G6 — RELEASE',
    groupEcosystem: 'G7 — ECOSYSTEM',
    groupUnmapped: 'G? — UNMAPPED',
    progressFeedReconnecting: 'STREAM RECONNECTING',
    progressFeedPollAfterDrop: 'POLLING AFTER STREAM DROP',
    progressFeedUnavailable: 'PUSH FEED UNAVAILABLE',
    progressErrorLabel: 'REGISTER READ ERROR',
    progressRowsCapped: 'Task list is a server-capped sample; the totals above are the full register.',
    progressAbsoluteFlips: 'CHECKBOX FLIPS THIS PROCESS',
    progressFlipsClosed: 'checked',
    progressFlipsReopened: 'unchecked',
    progressPercentIsRegister:
      "Percentage is the register's own done/total ratio — never modelled or rounded forward.",
    progressCountMismatch: 'Sampled rows differ from the register total.',
    progressKeyboardHint: 'Use Tab and the arrow keys to move between filter and row controls.',
    openBlockersHeader: 'OPEN P0 BLOCKERS',
    progressSourceNote: 'SOURCE: TODO.md · READ-ONLY PROJECTION · NOT A TASK REGISTER',
    progressLiveBadge: 'LIVE',
    progressPollingBadge: 'POLLING',
    progressSessionSuffix: 'THIS SESSION',
    progressLastDelivery: 'LAST DELIVERY',
    progressEmptyTitle: 'No register rows parsed',
    progressEmptyHint: 'TODO.md is unreadable or contains no canonical task rows.',
    progressStaleNote: 'Showing the last good parse; the register could not be re-read.',
    progressOpenSuffix: 'open',
    progressCompletionHint: 'checked boxes in the register',
    progressClear: 'CLEAR',
    progressNoP0Hint: 'No open P0 rows',
    progressRegisterUpdated: 'Register updated',
    progressPanelGroups: 'Milestone groups',
    progressPanelGroupsSub: "Percentage of each group's canonical task rows marked done",
    progressPanelPriorities: 'Priorities',
    progressPanelPrioritiesSub: 'Open rows by priority class',
    progressPanelMilestones: 'Milestones',
    progressPanelMilestonesSub: 'Select a milestone to filter the task list',
    progressPanelRows: 'Task rows',
    progressShowingRows: 'matching rows',
    progressPanelFlips: 'Live checkbox activity',
    progressPanelFlipsSub: 'Transitions observed by this cockpit process since it started',
    progressFlipsEmpty: 'No checkbox transitions observed since the cockpit started.',
    provenanceTitle: 'Provenance',
    provenanceBody:
      'Counts are derived from the canonical task rows in TODO.md each time the file changes. This panel never writes to the register; TODO.md remains the sole task and status source of truth.',
    progressFilterStatus: 'Status',
    progressFilterPriority: 'Priority',
    progressFilterMilestone: 'Milestone',
    progressFocus: 'Focus',
    progressClearFocus: 'Clear',
    progressFilterOpen: 'OPEN',
    progressFilterDone: 'DONE',
    progressFilterAll: 'ALL',
    progressLoading: 'LOADING',
    progressTrendNeedsTwo: 'Trend needs two samples.',
    progressTrendAria: 'Completion trend while the cockpit has been open',
    progressTrendSamples: 'samples',
    colTask: 'Task',
    colDeliverable: 'Deliverable',
    colMilestone: 'Milestone',
    colGroup: 'Group',
    colDone: 'Done',
    colOpen: 'Open',
    colTotal: 'Total',
    colProgress: 'Progress',
    progressNoRowsDone: 'No rows match this filter.',
    progressNoRowsOpen: 'Nothing open in this slice.',
    timeNotYet: 'not yet',
    timeUnknown: 'unknown',
    timeSeconds: 's ago',
    timeMinutes: 'm',
    timeHours: 'h',

    // Footer & Shortcuts
    shortcutsTitle: 'KEYBOARD SHORTCUTS',
    shortcutPlayPause: 'Play/Pause Audio',
    shortcutMute: 'Toggle Mute',
    shortcutChannel: 'Prev/Next Channel',
    shortcutPorts: 'Picture-in-Picture (video channels)',
    shortcutTabs: 'Switch Tab 1-6',
    shortcutHelp: 'Help & Shortcuts Guide',
    runtimeInfo: 'LOCAL WORKSPACE COCKPIT v1.0.0 // MOONWITNESS XV',

    // Confirm Modal
    stopAllTitle: 'Stop All Microservices?',
    stopAllDesc: 'This will terminate all running workspace processes (Radio, Dock, HQ, AI, Sentinel). Are you sure?',
    freePortsTitle: 'Free Allocated Network Ports?',
    freePortsDesc: 'This will forcefully release ports 3000-3004 by terminating lingering background processes.',
    confirmBtn: 'CONFIRM ACTION',
    confirmIrreversible: 'This action cannot be undone.',
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
      actionStart: 'MULAI',
    actionStop: 'HENTIKAN',
    actionRestart: 'MULAI ULANG',
    actionPreview: 'PRATINJAU',
    pid: 'PID',
    uptime: 'AKTIF',
    port: 'PORT',
    memory: 'MEMORI',

    errPortBusy: 'Port {port} sudah digunakan — hentikan supervisor lain sebelum menjalankan servis ini.',
    errPortNotReleased: 'Port {port} tidak released setelah dihentikan. Coba BEBASKAN PORT, lalu mulai ulang.',
    errSpawnFailed: 'Gagal menjalankan proses: {reason}',
    startAllRefused: '{count} ditolak',

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

    // Media transport — mirrors the English states one-for-one.
    mediaTransportLabel: 'Transpor',
    statusPlaying: 'SEDANG DIPUTAR',
    statusPaused: 'DIJEDA',
    statusLoading: 'MEMUAT SIARAN',
    statusBuffering: 'MENYIMPAN BUFFER',
    statusStopped: 'PUTARAN DIHENTIKAN',
    statusBlocked: 'PUTAR OTOMATIS DIBLOKIR',
    statusUnsupported: 'HLS TIDAK DUKUNG DI SINI',
    statusError: 'SIARAN BERMASALAH',
    statusNoSurface: 'LAYAR VIDEO BELUM TERPASANG',
    statusUnknown: 'STATUS TIDAK DIKETAHUI',
    mediaNoReason: 'tidak ada alasan dari pemutar',
    mediaBlockedHint: 'Tekan PUTAR sekali untuk mengizinkan audio atau video di tab ini.',
    visualizerRole:
      'Meter level dekoratif — kokpit tidak mengurai siaran ini untuk dianalisis',
    visualizerReduced: 'Animasi dijeda karena mode gerak minimal',
    playlistLabel: 'Daftar Putar',
    kindFilterLabel: 'Jenis',
    channelSearchPlaceholder: 'Cari stasiun, genre, atau negara…',
    noChannelsMatch: 'Tidak ada saluran yang cocok; kosongkan penyaring untuk melihat rak.',
    rackBuiltInOnly: 'Gagal memuat rak — hanya menampilkan rak bawaan.',
    btnPrevChannel: 'SEBELUMNYA',
    btnNextChannel: 'BERIKUTNYA',
    btnPlay: 'PUTAR',
    btnStop: 'HENTI',
    btnMuted: 'BISU',
    btnVolume: 'VOLUME',
    btnPip: 'PIP',
    titlePrevChannel: 'Saluran sebelumnya ([)',
    titleNextChannel: 'Saluran berikutnya (])',
    titlePlayPause: 'Putar atau jeda (Spasi)',
    titleMute: 'Bisukan atau aktifkan suara (M)',
    titlePip: 'Gambar-dalam-gambar (P)',
    pipUnavailable: 'Gambar-dalam-gambar tidak tersedia di peramban ini',

    // Tuner
    tunerTitle: 'Tuner Frekuensi Analog',
    tunerShow: 'TAMPILKAN TUNER',
    tunerHide: 'SEMBUNYIKAN TUNER',
    tunerPseudoNote:
      'Frekuensi semu untuk ilustrasi: diturunkan dari id saluran, bukan penalaan siaran nyata.',
    tunerActiveBand: 'Pita aktif',
    bandAM: 'Gelombang Medium / AM',
    bandFM: 'Pita FM',
    bandSW1: 'Gelombang Pendek 1',
    bandSW2: 'Gelombang Pendek 2',
    bandSW3: 'Gelombang Pendek 3',

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
    workerNoPort: 'PEKERJA',
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
    progressTitle: 'Daftar Eksekusi Master MoonWitness XV',
    progressSubtitle: 'Status langsung disinkronkan dari backlog perencanaan master TODO.md',
    overallProgress: 'PENYELESAIAN KESELURUHAN',
    closedTasks: 'TUGAS SELESAI',
    groupFoundation: 'G0 — FONDASI',
    groupSource: 'G1 — SUMBER',
    groupResearch: 'G2 — RISET',
    groupWitness: 'G3 — KESAKSIAN & KREATIF',
    groupOperations: 'G4 — OPERASIONAL',
    groupOptionalResearch: 'G5 — RISET OPSIONAL',
    groupRelease: 'G6 — RILIS',
    groupEcosystem: 'G7 — EKOSISTEM',
    groupUnmapped: 'G? — BELUM TERPETA',
    progressFeedReconnecting: 'SIARAN ULANG SAMBUNGAN',
    progressFeedPollAfterDrop: 'POLING SETELAH STREAM TERPUTUS',
    progressFeedUnavailable: 'KIRIM DORONG TIDAK TERSEDIA',
    progressErrorLabel: 'GALAT BACA REGISTER',
    progressRowsCapped:
      'Daftar tugas adalah sampel yang dibatasi server; jumlah di atas adalah register utuh.',
    progressAbsoluteFlips: 'PERUBAHAN KOTAK SELAMA PROSES INI',
    progressFlipsClosed: 'dicentang',
    progressFlipsReopened: 'dibatalkan sentusnya',
    progressPercentIsRegister:
      'Persentase adalah rasio selesai/total dari register itu sendiri — tidak pernah direkayasa atau dibulatkan ke depan.',
    progressCountMismatch: 'Jumlah baris sampel berbeda dari total register.',
    progressKeyboardHint: 'Gunakan Tab dan tombol panah untuk berpindah antar penyaring dan kendali baris.',
    openBlockersHeader: 'BLOKIR P0 TERBUKA',
    progressSourceNote: 'SUMBER: TODO.md · PROYEKSI HANYA-BACA · BUKAN REGISTER TUGAS',
    progressLiveBadge: 'LANGSUNG',
    progressPollingBadge: 'DIPOLE BERKALA',
    progressSessionSuffix: 'SESI INI',
    progressLastDelivery: 'PENGIRIMAN TERAKHIR',
    progressEmptyTitle: 'Tidak ada baris daftar tugas terbaca',
    progressEmptyHint: 'TODO.md tidak terbaca atau tidak memuat baris tugas kanonik.',
    progressStaleNote: 'Menampilkan hasil parse terakhir yang baik; daftar tugas tidak dapat dibaca ulang.',
    progressOpenSuffix: 'terbuka',
    progressCompletionHint: 'kotak tercentang di daftar tugas',
    progressClear: 'BERSIH',
    progressNoP0Hint: 'Tidak ada baris P0 terbuka',
    progressRegisterUpdated: 'Daftar tugas diperbarui',
    progressPanelGroups: 'Grup milestone',
    progressPanelGroupsSub: 'Persentase baris tugas kanonik tiap grup yang ditandai selesai',
    progressPanelPriorities: 'Prioritas',
    progressPanelPrioritiesSub: 'Baris terbuka per kelas prioritas',
    progressPanelMilestones: 'Milestone',
    progressPanelMilestonesSub: 'Pilih milestone untuk memfilter daftar tugas',
    progressPanelRows: 'Baris tugas',
    progressShowingRows: 'baris cocok',
    progressPanelFlips: 'Aktivitas centang langsung',
    progressPanelFlipsSub: 'Transisi yang diamati proses cockpit ini sejak mulai',
    progressFlipsEmpty: 'Belum ada transisi centang sejak cockpit dimulai.',
    provenanceTitle: 'Provenans',
    provenanceBody:
      'Angka diturunkan dari baris tugas kanonik di TODO.md setiap kali berkas berubah. Panel ini tidak pernah menulis ke daftar tugas; TODO.md tetap satu-satunya sumber status dan tugas.',
    progressFilterStatus: 'Status',
    progressFilterPriority: 'Prioritas',
    progressFilterMilestone: 'Milestone',
    progressFocus: 'Fokus',
    progressClearFocus: 'Hapus',
    progressFilterOpen: 'TERBUKA',
    progressFilterDone: 'SELESAI',
    progressFilterAll: 'SEMUA',
    progressLoading: 'MEMUAT',
    progressTrendNeedsTwo: 'Tren butuh dua sampel.',
    progressTrendAria: 'Tren penyelesaian selama cockpit terbuka',
    progressTrendSamples: 'sampel',
    colTask: 'Tugas',
    colDeliverable: 'Deliverabel',
    colMilestone: 'Milestone',
    colGroup: 'Grup',
    colDone: 'Selesai',
    colOpen: 'Terbuka',
    colTotal: 'Total',
    colProgress: 'Progres',
    progressNoRowsDone: 'Tidak ada baris yang cocok.',
    progressNoRowsOpen: 'Tidak ada yang terbuka di irisan ini.',
    timeNotYet: 'belum',
    timeUnknown: 'tidak diketahui',
    timeSeconds: 's lalu',
    timeMinutes: 'm',
    timeHours: 'j',

    // Footer & Shortcuts
    shortcutsTitle: 'PINTASAN KEYBOARD',
    shortcutPlayPause: 'Putar/Jeda Audio',
    shortcutMute: 'Bisukan/Nyalakan',
    shortcutChannel: 'Saluran Sblm/Brkt',
    shortcutPorts: 'Gambar-dalam-Gambar (saluran video)',
    shortcutTabs: 'Beralih Tab 1-6',
    shortcutHelp: 'Panduan Bantuan & Pintasan',
    runtimeInfo: 'KONSOL REPOSITORI LOKAL v1.0.0 // MOONWITNESS XV',

    // Confirm Modal
    stopAllTitle: 'Hentikan Semua Mikroservis?',
    stopAllDesc: 'Tindakan ini akan menghentikan seluruh proses kerja yang berjalan (Radio, Dock, HQ, AI, Sentinel). Anda yakin?',
    freePortsTitle: 'Bebaskan Port Jaringan?',
    freePortsDesc: 'Tindakan ini akan melepaskan paksa port 3000-3004 dengan menghentikan proses yang menggantung.',
    confirmBtn: 'KONFIRMASI AKSI',
    confirmIrreversible: 'Tindakan ini tidak dapat dibatalkan.',
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
