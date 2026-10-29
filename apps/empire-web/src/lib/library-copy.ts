import type { StoryLocale } from './story-universe'

/**
 * Library copy, reproduced from the REF-02 mockup (M45-11).
 * `50+ STORIES & IDEAS` is a mockup claim, not a catalogue count: the register
 * in docs/story-universe/CLAIMS.md records the owner's verbatim decision.
 */
export type LibraryCard = {
  id: string
  index: string
  eyebrow: string
  title: string
  tagline: string
  body: string
  badges: Array<{ label: string; tone: 'neutral' | 'done' | 'live' | 'pending' }>
  href: string
  category: 'origin' | 'guardian' | 'learning' | 'universe'
  status: 'draft' | 'proposed'
  artwork: string
}

type LibraryCopy = {
  eyebrow: string
  title: [string, string]
  lead: string
  body: string
  primaryCta: string
  secondaryCta: string
  script: string
  filtersLabel: [string, string]
  filters: Array<{ id: 'all' | 'origin' | 'guardian' | 'learning' | 'universe'; label: string; sub: string }>
  searchPlaceholder: string
  sortLabel: string
  sortOptions: Array<{ value: string; label: string }>
  worldLabel: string
  worldAll: string
  statusLabel: string
  statusAll: string
  statusDraft: string
  statusProposed: string
  cardsCta: string
  statsTitle: [string, string]
  stats: Array<{ value: string; label: string }>
  statsQuote: string
}

export const libraryCopy: Record<StoryLocale, LibraryCopy> = {
  en: {
    eyebrow: 'STORY UNIVERSE PORTAL · MOONWITNESS XV',
    title: ['MOONSTORIES', 'LIBRARY'],
    lead: 'WHEN THE MOON RISES, WE SHARE MESSAGES.',
    body: 'Stories, ideas, and actions from ordinary humans for an extraordinary tomorrow. Explore real stories from the MoonWitness XV universe.',
    primaryCta: 'EXPLORE STORIES',
    secondaryCta: 'OUR VISION',
    script: 'Stories connect worlds',
    filtersLabel: ['EXPLORE', 'STORIES'],
    filters: [
      { id: 'all', label: 'ALL STORIES', sub: '4 WORLDS' },
      { id: 'origin', label: 'ORIGIN STORY', sub: 'BEGINNINGS' },
      { id: 'guardian', label: 'GUARDIAN STORY', sub: 'PROTECT & SERVE' },
      { id: 'learning', label: 'LEARNING STORY', sub: 'GROW TOGETHER' },
      { id: 'universe', label: 'UNIVERSE STORY', sub: 'A LARGER VISION' },
    ],
    searchPlaceholder: 'Search stories, characters, worlds, or themes…',
    sortLabel: 'SORT BY',
    sortOptions: [{ value: 'newest', label: 'Newest First' }, { value: 'oldest', label: 'Oldest First' }, { value: 'title', label: 'Title A–Z' }],
    worldLabel: 'WORLD',
    worldAll: 'All Worlds',
    statusLabel: 'STATUS',
    statusAll: 'All Stories',
    statusDraft: 'Draft',
    statusProposed: 'Proposed',
    cardsCta: 'ENTER STORY WORLD',
    statsTitle: ['A UNIVERSE', 'OF MEANINGFUL STORIES'],
    stats: [
      { value: '4', label: 'STORY WORLDS' },
      { value: '50+', label: 'STORIES & IDEAS' },
      { value: '1', label: 'HUMANITY' },
      { value: '∞', label: 'BIGGER TOMORROW' },
    ],
    statsQuote: '“Different paths. One shared moon. A brighter tomorrow.”',
  },
  id: {
    eyebrow: 'PORTAL SEMESTA CERITA · MOONWITNESS XV',
    title: ['MOONSTORIES', 'PERPUSTAKAAN'],
    lead: 'SAAT BULAN TERBIT, KITA BERBAGI PESAN.',
    body: 'Cerita, gagasan, dan tindakan dari manusia biasa untuk hari esok yang luar biasa. Jelajahi cerita nyata dari semesta MoonWitness XV.',
    primaryCta: 'JELAJAHI CERITA',
    secondaryCta: 'VISI KAMI',
    script: 'Cerita menghubungkan dunia',
    filtersLabel: ['JELAJAHI', 'CERITA'],
    filters: [
      { id: 'all', label: 'SEMUA CERITA', sub: '4 DUNIA' },
      { id: 'origin', label: 'KISAH ASAL', sub: 'PERMULAAN' },
      { id: 'guardian', label: 'KISAH PENJAGA', sub: 'LINDUNGI & LAYANI' },
      { id: 'learning', label: 'KISAH BELAJAR', sub: 'TUMBUH BERSAMA' },
      { id: 'universe', label: 'KISAH SEMESTA', sub: 'VISI LEBIH LUAS' },
    ],
    searchPlaceholder: 'Cari cerita, karakter, dunia, atau tema…',
    sortLabel: 'URUTKAN',
    sortOptions: [{ value: 'newest', label: 'Terbaru' }, { value: 'oldest', label: 'Terlama' }, { value: 'title', label: 'Judul A–Z' }],
    worldLabel: 'DUNIA',
    worldAll: 'Semua Dunia',
    statusLabel: 'STATUS',
    statusAll: 'Semua Cerita',
    statusDraft: 'Draf',
    statusProposed: 'Diusulkan',
    cardsCta: 'MASUK DUNIA CERITA',
    statsTitle: ['SEMESTA CERITA', 'YANG BERMAKNA'],
    stats: [
      { value: '4', label: 'DUNIA CERITA' },
      { value: '50+', label: 'CERITA & GAGASAN' },
      { value: '1', label: 'KEMANUSIAAN' },
      { value: '∞', label: 'ESOK LEBIH BESAR' },
    ],
    statsQuote: '“Jalan berbeda. Satu bulan. Hari esok yang lebih cerah.”',
  },
}

const cardBase = {
  href: '/stories',
  status: 'draft' as const,
}

export const libraryCards: Record<StoryLocale, LibraryCard[]> = {
  en: [
    { ...cardBase, id: 'manusia-pulpen', index: '01', eyebrow: 'STORY WORLD', title: 'MANUSIA PULPEN', tagline: 'WRITING A BRIGHTER HUMANITY.', body: 'Stories, ideas, and actions from ordinary humans for an extraordinary tomorrow.', badges: [{ label: 'Origin Story', tone: 'neutral' }, { label: 'Completed', tone: 'done' }], category: 'origin', artwork: '/story-universe/home-mooncity.webp' },
    { ...cardBase, id: 'angelwithshotgun', index: '02', eyebrow: 'STORY WORLD', title: 'ANGELWITH SHOTGUN', tagline: 'PROTECT WHAT STILL MATTERS.', body: 'A guardian’s path through darkness, resistance, and the fight for a more humane world.', badges: [{ label: 'Guardian Story', tone: 'neutral' }, { label: 'Ongoing', tone: 'live' }], category: 'guardian', href: '/stories/angelwithshotgun', artwork: '/story-universe/library-guardian.webp' },
    { ...cardBase, id: 'ggs', index: '03', eyebrow: 'STORY WORLD', title: 'GGS — FULL MOON SCHOOL', tagline: 'LEARN. REFLECT. BUILD. TOGETHER.', body: 'A school for curious minds, compassionate hearts, and brave actions.', badges: [{ label: 'Learning Story', tone: 'neutral' }, { label: 'Ongoing', tone: 'live' }], category: 'learning', href: '/ggs', artwork: '/story-universe/moon-academy.webp' },
    { ...cardBase, id: 'empire-of-the-light', index: '04', eyebrow: 'STORY WORLD', title: 'EMPIRE OF THE LIGHT', tagline: 'A LARGER VISION FOR HUMANITY.', body: 'Civilizations, systems, and alliances towards a more just, conscious, and harmonious world.', badges: [{ label: 'Universe Story', tone: 'neutral' }, { label: 'In Development', tone: 'pending' }], category: 'universe', status: 'proposed', artwork: '/story-universe/reader-poster.webp' },
  ],
  id: [
    { ...cardBase, id: 'manusia-pulpen', index: '01', eyebrow: 'DUNIA CERITA', title: 'MANUSIA PULPEN', tagline: 'MENULIS UNTUK KEMANUSIAAN LEBIH BAIK.', body: 'Cerita, gagasan, dan tindakan dari manusia biasa untuk hari esok yang luar biasa.', badges: [{ label: 'Kisah Asal', tone: 'neutral' }, { label: 'Selesai', tone: 'done' }], category: 'origin', artwork: '/story-universe/home-mooncity.webp' },
    { ...cardBase, id: 'angelwithshotgun', index: '02', eyebrow: 'DUNIA CERITA', title: 'ANGELWITH SHOTGUN', tagline: 'LINDUNGI YANG MASIH BERHARGA.', body: 'Jalan seorang penjaga menembus kegelapan, perlawanan, dan perjuangan untuk dunia yang lebih manusiawi.', badges: [{ label: 'Kisah Penjaga', tone: 'neutral' }, { label: 'Berjalan', tone: 'live' }], category: 'guardian', href: '/stories/angelwithshotgun', artwork: '/story-universe/library-guardian.webp' },
    { ...cardBase, id: 'ggs', index: '03', eyebrow: 'DUNIA CERITA', title: 'GGS — SEKOLAH BULAN PURNAMA', tagline: 'BELAJAR. RENUNGKAN. BANGUN. BERSAMA.', body: 'Sekolah bagi pikiran ingin tahu, hati penyayang, dan tindakan berani.', badges: [{ label: 'Kisah Belajar', tone: 'neutral' }, { label: 'Berjalan', tone: 'live' }], category: 'learning', href: '/ggs', artwork: '/story-universe/moon-academy.webp' },
    { ...cardBase, id: 'empire-of-the-light', index: '04', eyebrow: 'DUNIA CERITA', title: 'EMPIRE OF THE LIGHT', tagline: 'VISI YANG LEBIH BESAR UNTUK MANUSIA.', body: 'Peradaban, sistem, dan aliansi menuju dunia yang lebih adil, sadar, dan harmonis.', badges: [{ label: 'Kisah Semesta', tone: 'neutral' }, { label: 'Dalam Pengembangan', tone: 'pending' }], category: 'universe', status: 'proposed', artwork: '/story-universe/reader-poster.webp' },
  ],
}
