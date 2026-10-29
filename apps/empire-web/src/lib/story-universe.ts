export type StoryCategory = 'origin' | 'guardian' | 'learning' | 'universe'
export type StoryLocale = 'id' | 'en'

export type StoryRecord = {
  id: string
  index: string
  title: string
  category: StoryCategory
  categoryLabel: Record<StoryLocale, string>
  route: string
  tagline: Record<StoryLocale, string>
  synopsis: Record<StoryLocale, string>
  publication: 'draft' | 'proposed'
  motif: 'writer' | 'guardian' | 'school' | 'empire'
}

export const stories: StoryRecord[] = [
  { id: 'manusia-pulpen', index: '01', title: 'MANUSIA PULPEN', category: 'origin', categoryLabel: { id: 'Kisah Asal', en: 'Origin Story' }, route: '/stories/manusia-pulpen', tagline: { id: 'MENULIS UNTUK KEMANUSIAAN YANG LEBIH BAIK.', en: 'WRITING A BRIGHTER HUMANITY.' }, synopsis: { id: 'Seorang manusia pendiam mencoba belajar menulis, membangun karya teknologi, dan membuktikan niat baik melalui tindakan kecil yang bertanggung jawab.', en: 'A quiet person learns to write, build technology, and express good intentions through small, responsible actions.' }, publication: 'draft', motif: 'writer' },
  { id: 'angelwithshotgun', index: '02', title: 'ANGELWITHSHOTGUN', category: 'guardian', categoryLabel: { id: 'Kisah Penjaga', en: 'Guardian Story' }, route: '/stories/angelwithshotgun', tagline: { id: 'LINDUNGI YANG MASIH BERHARGA.', en: 'PROTECT WHAT STILL MATTERS.' }, synopsis: { id: 'Ketika dunia terasa semakin gaduh, seorang penjaga sunyi belajar bahwa keberanian berarti menjaga belas kasih dan keselamatan manusia.', en: 'As the world grows louder, a quiet guardian learns that courage means protecting compassion and human safety.' }, publication: 'draft', motif: 'guardian' },
  { id: 'ggs-full-moon-school', index: '03', title: 'GGS FULL MOON SCHOOL', category: 'learning', categoryLabel: { id: 'Kisah Pembelajaran', en: 'Learning Story' }, route: '/ggs', tagline: { id: 'BELAJAR. RENUNGKAN. BANGUN. BERSAMA.', en: 'LEARN. REFLECT. BUILD. TOGETHER.' }, synopsis: { id: 'Di sekolah purnama fiksi dalam kisah MYLUFT, ROCKSOUL belajar tetap bersyukur setelah masa sulit.', en: 'At a fictional full moon school in MYLUFT’s story, ROCKSOUL learns to remain grateful after hardship.' }, publication: 'draft', motif: 'school' },
  { id: 'empire-of-the-light', index: '04', title: 'EMPIRE OF THE LIGHT', category: 'universe', categoryLabel: { id: 'Kisah Semesta', en: 'Universe Story' }, route: '/stories/empire-of-the-light', tagline: { id: 'VISI YANG LEBIH BESAR UNTUK MANUSIA.', en: 'A LARGER VISION FOR HUMANITY.' }, synopsis: { id: 'Gagasan tentang semesta karya dan tindakan yang mengutamakan kejujuran, pembelajaran, kasih sayang, dan manfaat.', en: 'A vision of stories and actions guided by honesty, learning, compassion, and human benefit.' }, publication: 'proposed', motif: 'empire' },
]

export const categoryLabels: Record<StoryLocale, Array<{ id: StoryCategory | 'all'; label: string; sub: string }>> = {
  id: [
    { id: 'all', label: 'SEMUA CERITA', sub: '4 DUNIA' }, { id: 'origin', label: 'KISAH ASAL', sub: 'PERMULAAN' },
    { id: 'guardian', label: 'KISAH PENJAGA', sub: 'LINDUNGI & LAYANI' }, { id: 'learning', label: 'KISAH BELAJAR', sub: 'TUMBUH BERSAMA' },
    { id: 'universe', label: 'KISAH SEMESTA', sub: 'VISI LEBIH LUAS' },
  ],
  en: [
    { id: 'all', label: 'ALL STORIES', sub: '4 WORLDS' }, { id: 'origin', label: 'ORIGIN STORY', sub: 'BEGINNINGS' },
    { id: 'guardian', label: 'GUARDIAN STORY', sub: 'PROTECT & SERVE' }, { id: 'learning', label: 'LEARNING STORY', sub: 'GROW TOGETHER' },
    { id: 'universe', label: 'UNIVERSE STORY', sub: 'A LARGER VISION' },
  ],
}

export const text = {
  id: { home: 'BERANDA', stories: 'CERITA', characters: 'KARAKTER', knowledge: 'PENGETAHUAN', timeline: 'LINIMASA', ecosystem: 'EKOSISTEM', about: 'TENTANG', preview: 'PREVIEW KONSEPTUAL · KONTEN DRAF · BUKAN RILIS PUBLIK', read: 'JELAJAHI CERITA', draft: 'DRAF · BELUM DITERBITKAN', proposed: 'DIUSULKAN · BELUM DITERBITKAN' },
  en: { home: 'HOME', stories: 'STORIES', characters: 'CHARACTERS', knowledge: 'KNOWLEDGE', timeline: 'TIMELINE', ecosystem: 'ECOSYSTEM', about: 'ABOUT', preview: 'CONCEPT PREVIEW · DRAFT CONTENT · NOT A PUBLIC RELEASE', read: 'EXPLORE STORIES', draft: 'DRAFT · NOT PUBLISHED', proposed: 'PROPOSED · NOT PUBLISHED' },
} as const
