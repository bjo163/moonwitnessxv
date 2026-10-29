import type { StoryLocale } from './story-universe'

/**
 * Home copy, reproduced from the REF-01 mockup (M45-11).
 * The `en` strings are verbatim; `id` keeps the same shape and weight so both
 * locales occupy the same measured boxes.
 */
type HomeCopy = {
  eyebrow: string
  heroLines: [string, string, string, string]
  intro: string
  primaryCta: string
  secondaryCta: string
  stats: Array<{ value: string; label: string }>
  side: string
  script: string
  cards: Array<{ index: string; eyebrow: string; title: string; tagline: string; body: string; cta: string }>
  foundationEyebrow: string
  foundationTitle: [string, string]
  principles: Array<{ title: string; body: string }>
  footerQuote: string
  bottomLeft: [string, string, string]
  bottomRight: [string, string, string]
}

export const homeCopy: Record<StoryLocale, HomeCopy> = {
  en: {
    eyebrow: 'STORY UNIVERSE PORTAL · MOONWITNESS XV',
    heroLines: ['WHEN THE', 'MOON RISES,', 'WE SHARE', 'MESSAGES.'],
    intro: 'A GATEWAY TO STORIES, KNOWLEDGE, AND MEANINGFUL ACTION.',
    primaryCta: 'EXPLORE STORIES',
    secondaryCta: 'READ THE VISION',
    stats: [
      { value: '4+', label: 'STORY WORLDS' },
      { value: '∞', label: 'IDEAS & POSSIBILITIES' },
      { value: '1', label: 'HUMANITY' },
    ],
    side: 'DIFFERENT PEOPLES · SAME MOON · BIGGER HUMANITY',
    script: 'Stories connect worlds',
    cards: [
      { index: '01', eyebrow: 'STORY WORLD', title: 'MANUSIA PULPEN', tagline: 'WRITING A BRIGHTER HUMANITY.', body: 'Stories, ideas, and actions from ordinary humans for an extraordinary tomorrow.', cta: 'ENTER WORLD' },
      { index: '02', eyebrow: 'STORY WORLD', title: 'ANGELWITH SHOTGUN', tagline: 'PROTECT WHAT STILL MATTERS.', body: 'A guardian’s path through darkness, resistance, and the fight for a more humane world.', cta: 'ENTER WORLD' },
      { index: '03', eyebrow: 'STORY WORLD', title: 'GGS — FULL MOON SCHOOL', tagline: 'LEARN. REFLECT. BUILD. TOGETHER.', body: 'A school for curious minds, compassionate hearts, and brave actions.', cta: 'ENTER WORLD' },
      { index: '04', eyebrow: 'STORY WORLD', title: 'EMPIRE OF THE LIGHT', tagline: 'A LARGER VISION FOR HUMANITY.', body: 'Civilizations, systems, and alliances towards a more just, conscious, and harmonious world.', cta: 'ENTER WORLD' },
    ],
    foundationEyebrow: 'OUR FOUNDATION',
    foundationTitle: ['PRINCIPLES', 'FOR A BRIGHTER HUMANITY.'],
    principles: [
      { title: 'TRUTH-SEEKING', body: 'We explore reality with curiosity and humility.' },
      { title: 'COMPASSION', body: 'We put people and all life at the center of progress.' },
      { title: 'MEANINGFUL ACTION', body: 'We turn ideas into real-world positive change.' },
      { title: 'A UNITED HUMANITY', body: 'Different paths, one shared moon, a brighter tomorrow.' },
    ],
    footerQuote: 'A brighter humanity is a story we build together.',
    bottomLeft: ['MOONWITNESS XV UNIVERSE', 'A-L-L-A-H.COM', 'EST. 2025'],
    bottomRight: ['DIFFERENT PEOPLES', 'SAME MOON', 'BIGGER HUMANITY'],
  },
  id: {
    eyebrow: 'PORTAL SEMESTA CERITA · MOONWITNESS XV',
    heroLines: ['SAAT BULAN', 'TERBIT,', 'KITA BERBAGI', 'PESAN.'],
    intro: 'GERBANG MENUJU CERITA, PENGETAHUAN, DAN TINDAKAN BERMAKNA.',
    primaryCta: 'JELAJAHI CERITA',
    secondaryCta: 'BACA VISI',
    stats: [
      { value: '4+', label: 'DUNIA CERITA' },
      { value: '∞', label: 'GAGASAN & KEMUNGKINAN' },
      { value: '1', label: 'KEMANUSIAAN' },
    ],
    side: 'BANGSA BERBEDA · BULAN SAMA · KEMANUSIAAN LEBIH BESAR',
    script: 'Cerita menghubungkan dunia',
    cards: [
      { index: '01', eyebrow: 'DUNIA CERITA', title: 'MANUSIA PULPEN', tagline: 'MENULIS UNTUK KEMANUSIAAN LEBIH BAIK.', body: 'Cerita, gagasan, dan tindakan dari manusia biasa untuk hari esok yang luar biasa.', cta: 'MASUK DUNIA' },
      { index: '02', eyebrow: 'DUNIA CERITA', title: 'ANGELWITH SHOTGUN', tagline: 'LINDUNGI YANG MASIH BERHARGA.', body: 'Jalan seorang penjaga menembus kegelapan, perlawanan, dan perjuangan untuk dunia yang lebih manusiawi.', cta: 'MASUK DUNIA' },
      { index: '03', eyebrow: 'DUNIA CERITA', title: 'GGS — SEKOLAH BULAN PURNAMA', tagline: 'BELAJAR. RENUNGKAN. BANGUN. BERSAMA.', body: 'Sekolah bagi pikiran ingin tahu, hati penyayang, dan tindakan berani.', cta: 'MASUK DUNIA' },
      { index: '04', eyebrow: 'DUNIA CERITA', title: 'EMPIRE OF THE LIGHT', tagline: 'VISI YANG LEBIH BESAR UNTUK MANUSIA.', body: 'Peradaban, sistem, dan aliansi menuju dunia yang lebih adil, sadar, dan harmonis.', cta: 'MASUK DUNIA' },
    ],
    foundationEyebrow: 'LANDASAN KAMI',
    foundationTitle: ['PRINSIP', 'UNTUK KEMANUSIAAN LEBIH CERAH.'],
    principles: [
      { title: 'MENCARI KEBENARAN', body: 'Menjelajahi kenyataan dengan rasa ingin tahu dan rendah hati.' },
      { title: 'BELAS KASIH', body: 'Menempatkan manusia dan seluruh kehidupan di pusat kemajuan.' },
      { title: 'TINDAKAN BERMAKNA', body: 'Mengubah gagasan menjadi perubahan nyata yang baik.' },
      { title: 'KEMANUSIAAN BERSATU', body: 'Jalan berbeda, satu bulan, hari esok yang lebih cerah.' },
    ],
    footerQuote: 'Kemanusiaan yang lebih cerah adalah cerita yang kita bangun bersama.',
    bottomLeft: ['SEMESTA MOONWITNESS XV', 'A-L-L-A-H.COM', 'SEJAK 2025'],
    bottomRight: ['BANGSA BERBEDA', 'BULAN SAMA', 'KEMANUSIAAN LEBIH BESAR'],
  },
}

/** Card artwork per motif until the M45 art slots land (see ARTWORK_SLOTS.md). */
export const homeCardArtwork = [
  '/story-universe/home-mooncity.webp',
  '/story-universe/library-guardian.webp',
  '/story-universe/moon-academy.webp',
  '/story-universe/reader-poster.webp',
]
export const homeHeroArtwork = '/story-universe/codex-guardian.webp'
