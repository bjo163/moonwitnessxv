import type { StoryLocale } from './story-universe'

/**
 * Reader copy from the REF-03 mockup (M45-11).
 * The mockup quotes Qur'an 8:60. CLAIMS.md row 11 blocks that: the panel keeps
 * its measured geometry and renders the withheld notice until a named, licensed
 * translation exists. Only the reference numbers (citations, not text) are shown.
 */
type ReaderCopy = {
  crumb: [string, string, string]
  breadcrumbLabel: string
  pageNavLabel: string
  thumbGroupLabel: string
  previousLabel: string
  nextLabel: string
  posterAlt: string
  posterWords: string[]
  posterWordsLow: string[]
  eyebrow: string
  title: [string, string]
  lead: string
  chapter: string
  pages: string
  synopsisTitle: string
  synopsis: string
  meta: Array<{ kind: 'theme' | 'world' | 'tone'; title: string; body: string }>
  wisdomTitle: string
  wisdomLead: string
  wisdomNote: string
  withheldTitle: string
  withheldBody: string
  keyVerses: string
  verses: string[]
  previous: [string, string]
  next: [string, string]
  stripTitle: string
  stripCount: string
  panels: Array<{ index: string; label: string; art: string }>
}

export const readerCopy: Record<StoryLocale, ReaderCopy> = {
  en: {
    crumb: ['MOONWITNESS XV', 'STORY UNIVERSE PORTAL', 'ANGELWITHSHOTGUN'],
    breadcrumbLabel: 'Breadcrumb',
    pageNavLabel: 'Change page',
    thumbGroupLabel: 'Chapter panels',
    previousLabel: 'Previous page',
    nextLabel: 'Next page',
    posterAlt: 'Concept poster of AngelWithShotgun, rear-view figure',
    posterWords: ['PROTECT', 'WHAT', 'STILL', 'MATTERS.'],
    posterWordsLow: ['DIFFERENT', 'PEOPLES', 'SAME MOON', 'BIGGER', 'HUMANITY'],
    eyebrow: 'MOONWITNESS XV · STORY WORLD 02',
    title: ['ANGELWITH', 'SHOTGUN'],
    lead: 'THE BOMBS ARE GETTING CLOSER EVERY DAY',
    chapter: 'CHAPTER 01 / PAGE 01–04',
    pages: '4 PAGES',
    synopsisTitle: 'SYNOPSIS',
    synopsis: 'In a world where the bombs are getting closer every day, a lone guardian walks through the ruins, not to seek war, but to protect what still matters. AngelWithShotgun follows a journey of faith, responsibility, and quiet resistance — where every step is a prayer for a more humane world.',
    meta: [
      { kind: 'theme', title: 'CORE THEME', body: 'Protection, responsibility, and hope in a collapsing world.' },
      { kind: 'world', title: 'STORY WORLD', body: 'MOONWITNESS XV — World 02, AngelWithShotgun' },
      { kind: 'tone', title: 'TONE', body: 'Vigilant, spiritual, reflective, human-centered.' },
    ],
    wisdomTitle: 'WISDOM & REFLECTION',
    wisdomLead: 'STRENGTH IS A TRUST, NOT A PURPOSE. REAL POWER PROTECTS LIFE, DEFENDS THE OPPRESSED, AND KEEPS THE DOOR OPEN FOR A MORE HUMANE TOMORROW.',
    wisdomNote: 'Strength is a trust in this story: protect life, stay humble, and make room for a more humane tomorrow.',
    withheldTitle: 'RELIGIOUS SOURCE CONTENT WITHHELD',
    withheldBody: 'The verse quoted in this panel is not reproduced. A quotation ships only with Uthmani Arabic, a named translation, its licence, and the verified reference (CLAIMS.md row 11).',
    keyVerses: 'KEY VERSES',
    verses: ['8:60', '2:190', '4:75', '47:4', '3:104', '9:122'],
    previous: ['PREVIOUS CHAPTER', 'PROLOGUE — A QUIETER WORLD'],
    next: ['NEXT CHAPTER', 'CHAPTER 02 — SHADOWS RISE'],
    stripTitle: 'CHAPTER 01 — THE BOMBS ARE GETTING CLOSER EVERY DAY',
    stripCount: '4 PAGES',
    panels: [
      { index: '01', label: 'A LONGER NIGHT', art: '/story-universe/reader-poster.webp' },
      { index: '02', label: 'THE WEIGHT WE CARRY', art: '/story-universe/library-guardian.webp' },
      { index: '03', label: 'CLOSER EVERY DAY', art: '/story-universe/codex-guardian.webp' },
      { index: '04', label: 'STILL HERE, STILL HUMAN', art: '/story-universe/home-mooncity.webp' },
    ],
  },
  id: {
    crumb: ['MOONWITNESS XV', 'PORTAL SEMESTA CERITA', 'ANGELWITHSHOTGUN'],
    breadcrumbLabel: 'Jejak navigasi',
    pageNavLabel: 'Pindah halaman',
    thumbGroupLabel: 'Panel bab',
    previousLabel: 'Halaman sebelumnya',
    nextLabel: 'Halaman berikutnya',
    posterAlt: 'Poster konseptual AngelWithShotgun, sosok dari belakang',
    posterWords: ['PROTECT', 'WHAT', 'STILL', 'MATTERS.'],
    posterWordsLow: ['DIFFERENT', 'PEOPLES', 'SAME MOON', 'BIGGER', 'HUMANITY'],
    eyebrow: 'MOONWITNESS XV · DUNIA CERITA 02',
    title: ['ANGELWITH', 'SHOTGUN'],
    lead: 'BOM SEMAKIN DEKAT SETIAP HARI',
    chapter: 'BAB 01 / HALAMAN 01–04',
    pages: '4 HALAMAN',
    synopsisTitle: 'SINOPSIS',
    synopsis: 'Di dunia yang bomnya semakin dekat setiap hari, seorang penjaga berjalan melalui reruntuhan, bukan untuk mencari perang, melainkan untuk melindungi yang masih berarti. AngelWithShotgun mengikuti perjalanan iman, tanggung jawab, dan perlawanan yang tenang — setiap langkah adalah doa untuk dunia yang lebih manusiawi.',
    meta: [
      { kind: 'theme', title: 'TEMA UTAMA', body: 'Perlindungan, tanggung jawab, dan harapan di dunia yang runtuh.' },
      { kind: 'world', title: 'DUNIA CERITA', body: 'MOONWITNESS XV — Dunia 02, AngelWithShotgun' },
      { kind: 'tone', title: 'NADA', body: 'Waspada, spiritual, reflektif, berpusat pada manusia.' },
    ],
    wisdomTitle: 'HIKMAH & RENUNGAN',
    wisdomLead: 'KEKUATAN ADALAH AMANAH, BUKAN TUJUAN. KEKUATAN SEJATI MELINDUNGI KEHIDUPAN, MEMBELA YANG TERTINDAS, DAN MEMBUKA JALAN MENUJU HARI ESOK YANG LEBIH MANUSIAWI.',
    wisdomNote: 'Dalam cerita ini kekuatan adalah amanah: lindungi kehidupan, tetap rendah hati, dan beri ruang bagi hari esok yang lebih manusiawi.',
    withheldTitle: 'SUMBER KEAGAMAAN BELUM DITAMPILKAN',
    withheldBody: 'Ayat yang dikutip pada panel ini tidak ditampilkan. Kutipan hanya terbit dengan teks Uthmani, terjemahan bernama, lisensinya, dan rujukan terverifikasi (CLAIMS.md baris 11).',
    keyVerses: 'AYAT KUNCI',
    verses: ['8:60', '2:190', '4:75', '47:4', '3:104', '9:122'],
    previous: ['BAB SEBELUMNYA', 'PROLOG — DUNIA YANG LEBIH HENING'],
    next: ['BAB BERIKUTNYA', 'BAB 02 — BAYANGAN TERBIT'],
    stripTitle: 'BAB 01 — BOM SEMAKIN DEKAT SETIAP HARI',
    stripCount: '4 HALAMAN',
    panels: [
      { index: '01', label: 'MALAM YANG LEBIH PANJANG', art: '/story-universe/reader-poster.webp' },
      { index: '02', label: 'BEBAN YANG KITA BAWA', art: '/story-universe/library-guardian.webp' },
      { index: '03', label: 'MAKIN DEKAT SETIAP HARI', art: '/story-universe/codex-guardian.webp' },
      { index: '04', label: 'MASIH DI SINI, MASIH MANUSIA', art: '/story-universe/home-mooncity.webp' },
    ],
  },
}
