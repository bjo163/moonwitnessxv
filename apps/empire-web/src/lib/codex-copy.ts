import type { StoryCodexArtwork } from '@moonwitness/moonui'
import type { StoryLocale } from './story-universe'

/** REF-04 artwork. The files ship with Empire; the shared view takes the URLs. */
export const codexArtwork: StoryCodexArtwork = {
  hero: '/story-universe/codex-guardian.webp',
  featured: '/story-universe/reader-poster.webp',
}

/** Character Codex copy from the REF-04 mockup (M45-11). */
type CodexCopy = {
  heroEyebrow: string
  heroTitle: [string, string]
  heroLead: string
  heroBody: string
  heroCta: string
  heroSecondary: string
  side: string
  script: string
  featuredEyebrow: string
  featuredTitle: [string, string]
  featuredLead: string
  featuredBody: string
  featuredCta: string
  featuredSecondary: string
  featuredSide: string
  traitsLabel: string
  traits: Array<{ title: string; sub: string; body: string }>
  relatedTitle: string
  related: Array<{ name: string; sub: string; body: string; cta: string; art: string }>
  mapTitle: string
  mapLabelLeft: [string, string]
  mapLabelRight: [string, string]
  mapNodes: Array<{ name: string; lines: string[]; art: string }>
  mapFoot: Array<[string, string]>
}

export const codexCopy: Record<StoryLocale, CodexCopy> = {
  en: {
    heroEyebrow: 'MOONWITNESS XV UNIVERSE',
    heroTitle: ['CHARACTER', 'CODEX'],
    heroLead: 'PEOPLES. PATHS. PURPOSES.',
    heroBody: 'Explore the beings who shape the stories, carry the light, and build a brighter humanity across worlds.',
    heroCta: 'ALL CHARACTERS',
    heroSecondary: 'STORY UNIVERSE',
    side: 'DIFFERENT PEOPLES · SAME MOON · BIGGER HUMANITY',
    script: 'Stories connect worlds',
    featuredEyebrow: 'CHARACTER / MOONWITNESS XV',
    featuredTitle: ['WHO IS', 'ANGELWITHSHOTGUN?'],
    featuredLead: 'A GUARDIAN’S PATH THROUGH DARKNESS, TO PROTECT WHAT STILL MATTERS.',
    featuredBody: 'AngelWithShotgun is a seeker, protector, and bridge between broken worlds. Walking the edge between shadow and light, they carry both the weight of loss and the fire of a brighter tomorrow. Through action, reflection, and compassion, AngelWithShotgun fights for a more humane world.',
    featuredCta: 'READ FULL BIO',
    featuredSecondary: 'STORY APPEARANCES',
    featuredSide: 'NOT JUST A FIGHTER BUT A BRIDGE TO A BRIGHTER HUMANITY',
    traitsLabel: 'Six character dimensions',
    traits: [
      { title: 'ROLE', sub: '// PURPOSE', body: 'Guardian, protector, truth-seeker, and catalyst for a more humane world.' },
      { title: 'SYMBOLISM', sub: '// WHAT THEY REPRESENT', body: 'The enduring human spirit. Carrying both darkness and light, a reminder that even broken people can build a brighter tomorrow.' },
      { title: 'TRAITS', sub: '// KEY CHARACTERISTICS', body: 'Resilient, compassionate, strategic, introspective, loyal, action-oriented, and driven by a deep sense of justice.' },
      { title: 'INTERNAL CONFLICT', sub: '// THE STRUGGLE WITHIN', body: 'Haunted by past loss and the cost of violence, yet unable to stand by while others suffer. Balancing hope with the realities of a broken world.' },
      { title: 'WISDOM', sub: '// CORE BELIEFS', body: 'People still matter. Compassion is a strength. Stories can change worlds. A brighter humanity is possible.' },
      { title: 'STORY LINKS', sub: '// WHERE THEY APPEAR', body: 'MoonWitness XV · Manusia Pulpen · Empire of the Light · GGS — Full Moon School · Related Characters' },
    ],
    relatedTitle: 'RELATED CHARACTERS',
    related: [
      { name: 'ROCKSOUL', sub: 'THE FOUNDATION', body: 'A steady force and loyal ally. RockSoul brings strength, stability, and unwavering loyalty to the journey.', cta: 'VIEW PROFILE', art: '/story-universe/library-guardian.webp' },
      { name: 'MYLUFT', sub: 'THE REMINDER', body: 'A source of light and rejuvenation. MyLuft brings perspective, healing, and hope when the path gets heavy.', cta: 'VIEW PROFILE', art: '/story-universe/moon-academy.webp' },
    ],
    mapTitle: 'RELATIONSHIP MAP',
    mapLabelLeft: ['TRUST', 'BATTLEFIELD'],
    mapLabelRight: ['BALANCE', 'INSPIRATION'],
    mapNodes: [
      { name: 'ROCKSOUL', lines: ['STRENGTH', 'LOYALTY', 'BROTHERHOOD'], art: '/story-universe/library-guardian.webp' },
      { name: 'ANGELWITHSHOTGUN', lines: ['GUARDIAN · SEEKER · BRIDGE'], art: '/story-universe/reader-poster.webp' },
      { name: 'MYLUFT', lines: ['HEALING', 'PERSPECTIVE', 'HOPE'], art: '/story-universe/moon-academy.webp' },
    ],
    mapFoot: [['DIFFERENT PATHS', 'SAME PURPOSE'], ['STRONGER TOGETHER', 'A BRIGHTER HUMANITY'], ['STORIES CONNECT WORLDS', 'PEOPLE COMPLETE THE STORY']],
  },
  id: {
    heroEyebrow: 'SEMESTA MOONWITNESS XV',
    heroTitle: ['KODEKS', 'KARAKTER'],
    heroLead: 'TOKOH. JALAN. TUJUAN.',
    heroBody: 'Jelajahi sosok yang membentuk cerita, membawa cahaya, dan membangun kemanusiaan yang lebih cerah lintas dunia.',
    heroCta: 'SEMUA KARAKTER',
    heroSecondary: 'SEMESTA CERITA',
    side: 'BANGSA BERBEDA · BULAN SAMA · KEMANUSIAAN LEBIH BESAR',
    script: 'Cerita menghubungkan dunia',
    featuredEyebrow: 'KARAKTER / MOONWITNESS XV',
    featuredTitle: ['SIAPA', 'ANGELWITHSHOTGUN?'],
    featuredLead: 'JALAN SEORANG PENJAGA MENEMBUS KEGELAPAN UNTUK MELINDUNGI YANG MASIH BERHARGA.',
    featuredBody: 'AngelWithShotgun adalah pencari, pelindung, dan jembatan antara dunia yang retak. Berjalan di tepi bayangan dan cahaya, mereka membawa beban kehilangan sekaligus api hari esok yang lebih cerah. Melalui tindakan, refleksi, dan belas kasih, AngelWithShotgun berjuang untuk dunia yang lebih manusiawi.',
    featuredCta: 'BACA BIO LENGKAP',
    featuredSecondary: 'PENAMPILAN CERITA',
    featuredSide: 'BUKAN HANYA PEJUANG TETAPI JEMBATAN MENUJU KEMANUSIAAN LEBIH CERAH',
    traitsLabel: 'Enam aspek karakter',
    traits: [
      { title: 'PERAN', sub: '// TUJUAN', body: 'Penjaga, pelindung, pencari kebenaran, dan katalis bagi dunia yang lebih manusiawi.' },
      { title: 'SIMBOLISME', sub: '// YANG DIWAKILI', body: 'Semangat manusia yang bertahan. Membawa kegelapan dan cahaya, pengingat bahwa manusia yang terluka pun dapat membangun hari esok yang lebih cerah.' },
      { title: 'SIFAT', sub: '// CIRI UTAMA', body: 'Tangguh, penyayang, strategis, reflektif, setia, berorientasi tindakan, dan digerakkan rasa keadilan yang mendalam.' },
      { title: 'KONFLIK BATIN', sub: '// PERGULATAN DI DALAM', body: 'Dibayangi kehilangan dan harga kekerasan, namun tak bisa diam saat orang lain menderita. Menyeimbangkan harapan dengan kenyataan dunia yang retak.' },
      { title: 'HIKMAH', sub: '// KEYAKINAN INTI', body: 'Manusia tetap penting. Belas kasih adalah kekuatan. Cerita dapat mengubah dunia. Kemanusiaan yang lebih cerah mungkin.' },
      { title: 'TAUTAN CERITA', sub: '// TEMPAT MEREKA HADIR', body: 'MoonWitness XV · Manusia Pulpen · Empire of the Light · GGS — Sekolah Bulan Purnama · Karakter Terkait' },
    ],
    relatedTitle: 'KARAKTER TERKAIT',
    related: [
      { name: 'ROCKSOUL', sub: 'LANDASAN', body: 'Kekuatan yang mantap dan sekutu setia. RockSoul membawa kekuatan, stabilitas, dan kesetiaan yang tak goyah dalam perjalanan.', cta: 'LIHAT PROFIL', art: '/story-universe/library-guardian.webp' },
      { name: 'MYLUFT', sub: 'PENGINGAT', body: 'Sumber cahaya dan penyegaran. MyLuft membawa perspektif, pemulihan, dan harapan saat jalan terasa berat.', cta: 'LIHAT PROFIL', art: '/story-universe/moon-academy.webp' },
    ],
    mapTitle: 'PETA RELASI',
    mapLabelLeft: ['KEPERCAYAAN', 'MEDAN PERTEMPURAN'],
    mapLabelRight: ['KESEIMBANGAN', 'INSPIRASI'],
    mapNodes: [
      { name: 'ROCKSOUL', lines: ['KEKUATAN', 'KESETIAAN', 'PERSAUDARAAN'], art: '/story-universe/library-guardian.webp' },
      { name: 'ANGELWITHSHOTGUN', lines: ['PENJAGA · PENCARI · JEMBATAN'], art: '/story-universe/reader-poster.webp' },
      { name: 'MYLUFT', lines: ['PEMULIHAN', 'PERSPEKTIF', 'HARAPAN'], art: '/story-universe/moon-academy.webp' },
    ],
    mapFoot: [['JALAN BERBEDA', 'TUJUAN SAMA'], ['LEBIH KUAT BERSAMA', 'KEMANUSIAAN LEBIH CERAH'], ['CERITA MENGHUBUNGKAN DUNIA', 'MANUSIA MELENGKAPI CERITA']],
  },
}
