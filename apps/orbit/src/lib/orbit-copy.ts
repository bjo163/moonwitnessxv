import {
  DEFAULT_LOCALE,
  defineLocaleCatalog,
  resolveLocale,
  type Locale,
  type LocaleResolutionInput,
} from '@moonwitness/core'

/**
 * M40-02 ORBIT Shell and Navigation Locale Catalog.
 *
 * Grounded in the shared i18n contract from @moonwitness/core.
 * Enforces 100% key parity between English (`en`) and Indonesian (`id`).
 */
export const orbitCatalog = defineLocaleCatalog({
  en: {
    brandTitle: 'ORBIT',
    brandSubtitle: 'Spatial Agent Operations',
    brandMotto: 'SPATIAL OBSERVATION · AGENT INTELLIGENCE · PROVABLE INTEGRITY',
    hqLink: 'Headquarters (100CENTER)',
    provenanceSimulated: 'PROVENANCE: SIMULATED',
    arsyOffline: 'ARSY: OFFLINE / ISOLATED',
    arsyStandalone: 'ARSY: STANDALONE SIMULATION',
    navOverview: 'Overview',
    navWorkstations: 'Workstations',
    navAgentLoops: 'Agent Loops',
    navTaskQueues: 'Task Queues',
    navAuditTraces: 'Audit Traces',
    viewSpatial: 'Spatial 3D View',
    viewAccessible2D: 'Accessible 2D Fallback',
    spatialViewportNotice:
      'Spatial Topology Projection: 3D scene loads client-side in M40-03. All operations are fully accessible via the 2D operational fallback grid below without requiring WebGL or GPU acceleration.',
    simulatedStage: 'SIMULATED STAGE',
    workstationsHeading: 'Workstations',
    agentLoopsHeading: 'Agent Loops (LUMEN)',
    taskQueuesHeading: 'Task Queues',
    auditTracesHeading: 'Recent Audit Traces',
    accessible2dHeading: 'Accessible 2D Operations Inspector',
    roleLabel: 'Role',
    cycleLabel: 'Cycle',
    stepsLabel: 'Steps',
    leaseLabel: 'Lease',
    zoneLabel: 'Zone',
    agentsLabel: 'Agents',
    priorityLabel: 'Priority',
    idLabel: 'ID',
    handoffNotice: 'Handoff to HQ required',
    dataSourceLabel: 'Data Source',
    synchronizedLabel: 'Synchronized',
    footerNotice: 'MoonWitness XV · ORBIT (Port 3007) · Pure Frontend Observation Boundary',
    skipToContent: 'Skip to main content',
    localeSelectorLabel: 'Language selection',
    reducedMotionNotice: 'Reduced motion active',
    selectedNodeHeading: 'Selected Node Inspector',
    closeInspector: 'Close Inspector',
    nodeTypeWorkstation: 'Workstation Node',
    nodeTypeAgent: 'Agent Loop Worker',
    spatialLoading: 'INITIALIZING SPATIAL WORKSPACE...',
    clickToInspect: 'Click to inspect node details',
    inspectNode: 'Inspect Node',
    clearSelection: 'Clear Selection',
    escToClose: 'Press Esc to close inspector',
    approvalRequiredNotice: 'Action approval required in 100CENTER HQ',
    quickSelectLabel: 'Quick Node Select',
    webglUnavailableNotice:
      'WebGL acceleration is unavailable or disabled in this environment. Operating in 100% accessible 2D fallback mode.',
    webglFallbackActive: '2D Accessible Fallback Active',
    viewModeToggleLabel: 'View mode switcher',
    keyboardNavigationGuide:
      'Keyboard navigation: Tab to focus nodes, Enter or Space to inspect, Esc to close inspector.',
    switchTo2DView: 'Switch to 2D View',
    switchTo3DView: 'Switch to 3D View',
    performanceBudgetNotice:
      '3D Performance Budget: 60 FPS target · Procedural geometry only · Zero external models',
    freshnessFresh: 'FRESH',
    freshnessStale: 'STALE',
    freshnessUnknown: 'UNKNOWN',
    statusUnauthorized: 'UNAUTHORIZED',
    freshnessLabel: 'Freshness',
    provenanceLabel: 'Provenance',
    liveBadge: 'LIVE',
    statusConnected: 'CONNECTED',
    statusOffline: 'OFFLINE',
    offlineNotice: 'ARSY Hub connection is offline. Operating in truthful disconnected / fallback state.',
    switchSimulatedFallback: 'View Local Simulation',
  },
  id: {
    brandTitle: 'ORBIT',
    brandSubtitle: 'Operasi Agen Spasial',
    brandMotto: 'OBSERVASI SPASIAL · KECERDASAN AGEN · INTEGRITAS TERBUKTI',
    hqLink: 'Pusat Komando (100CENTER)',
    provenanceSimulated: 'ASAL DATA: DISIMULASIKAN',
    arsyOffline: 'ARSY: LURING / TERISOLASI',
    arsyStandalone: 'ARSY: SIMULASI MANDIRI',
    navOverview: 'Ringkasan',
    navWorkstations: 'Stasiun Kerja',
    navAgentLoops: 'Siklus Agen',
    navTaskQueues: 'Antrean Tugas',
    navAuditTraces: 'Jejak Audit',
    viewSpatial: 'Tampilan 3D Spasial',
    viewAccessible2D: 'Cadangan 2D Aksesibel',
    spatialViewportNotice:
      'Proyeksi Topologi Spasial: Adegan 3D dimuat di sisi klien pada M40-03. Seluruh operasi dapat diakses penuh melalui kisi cadangan operasional 2D di bawah tanpa memerlukan akselerasi WebGL atau GPU.',
    simulatedStage: 'PANGGUNG SIMULASI',
    workstationsHeading: 'Stasiun Kerja',
    agentLoopsHeading: 'Siklus Agen (LUMEN)',
    taskQueuesHeading: 'Antrean Tugas',
    auditTracesHeading: 'Jejak Audit Terbaru',
    accessible2dHeading: 'Inspektur Operasi 2D Aksesibel',
    roleLabel: 'Peran',
    cycleLabel: 'Siklus',
    stepsLabel: 'Langkah',
    leaseLabel: 'Sewa',
    zoneLabel: 'Zona',
    agentsLabel: 'Agen',
    priorityLabel: 'Prioritas',
    idLabel: 'ID',
    handoffNotice: 'Dibutuhkan penyerahan ke HQ',
    dataSourceLabel: 'Sumber Data',
    synchronizedLabel: 'Disinkronkan',
    footerNotice: 'MoonWitness XV · ORBIT (Port 3007) · Batas Observasi Murni Frontend',
    skipToContent: 'Lompat ke konten utama',
    localeSelectorLabel: 'Pilihan bahasa',
    reducedMotionNotice: 'Pengurangan gerakan aktif',
    selectedNodeHeading: 'Inspektur Node Terpilih',
    closeInspector: 'Tutup Inspektur',
    nodeTypeWorkstation: 'Node Stasiun Kerja',
    nodeTypeAgent: 'Pekerja Siklus Agen',
    spatialLoading: 'MENGINISIALISASI RUANG KERJA SPASIAL...',
    clickToInspect: 'Klik untuk memeriksa detail node',
    inspectNode: 'Periksa Node',
    clearSelection: 'Hapus Pilihan',
    escToClose: 'Tekan Esc untuk menutup inspektur',
    approvalRequiredNotice: 'Persetujuan tindakan diperlukan di HQ 100CENTER',
    quickSelectLabel: 'Pilihan Cepat Node',
    webglUnavailableNotice:
      'Akselerasi WebGL tidak tersedia atau dinonaktifkan di lingkungan ini. Beroperasi dalam mode cadangan 2D yang 100% aksesibel.',
    webglFallbackActive: 'Cadangan 2D Aksesibel Aktif',
    viewModeToggleLabel: 'Pengalih mode tampilan',
    keyboardNavigationGuide:
      'Navigasi keyboard: Tab untuk fokus node, Enter atau Spasi untuk memeriksa, Esc untuk menutup inspektur.',
    switchTo2DView: 'Beralih ke Tampilan 2D',
    switchTo3DView: 'Beralih ke Tampilan 3D',
    performanceBudgetNotice:
      'Batas Kinerja 3D: Target 60 FPS · Geometri prosedural murni · Nol model eksternal',
    freshnessFresh: 'SEGAR',
    freshnessStale: 'KEDALUWARSA',
    freshnessUnknown: 'TIDAK DIKETAHUI',
    statusUnauthorized: 'TIDAK DIIZINKAN',
    freshnessLabel: 'Kesegaran',
    provenanceLabel: 'Asal Data',
    liveBadge: 'LANGSUNG',
    statusConnected: 'TERHUBUNG',
    statusOffline: 'LURING',
    offlineNotice: 'Koneksi ARSY Hub luring. Beroperasi dalam status terputus / cadangan yang jujur.',
    switchSimulatedFallback: 'Lihat Simulasi Lokal',
  },
})

export type OrbitCopyKey = keyof (typeof orbitCatalog)['en']

export const ORBIT_NAV_ITEMS: readonly OrbitCopyKey[] = [
  'navOverview',
  'navWorkstations',
  'navAgentLoops',
  'navTaskQueues',
  'navAuditTraces',
] as const

/**
 * Look up the complete localized dictionary for ORBIT chrome.
 */
export function orbitCopy(locale: Locale): Readonly<Record<OrbitCopyKey, string>> {
  return orbitCatalog[locale] ?? orbitCatalog[DEFAULT_LOCALE]
}

/**
 * Deterministically resolve locale according to ADR-0005 precedence.
 */
export function resolveOrbitLocale(input: LocaleResolutionInput): Locale {
  const result = resolveLocale(input)
  return 'locale' in result ? result.locale : DEFAULT_LOCALE
}
