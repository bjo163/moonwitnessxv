export type Locale = 'id' | 'en'
export type Space = {
  id: string
  name: string
  caption: string
  description: string
  status: 'CODE EXISTS' | 'PLANNED' | 'PILOT'
  accent: 'warm' | 'cool' | 'pink'
}
const spaces: Record<Locale, Space[]> = {
  id: [
    { id: 'moonwitness', name: 'MOONWITNESS', caption: 'STORIES / KNOWLEDGE', description: 'Cerita, sumber, dan karya yang dapat ditelusuri konteksnya.', status: 'PLANNED', accent: 'warm' },
    { id: 'dock', name: 'DOCK', caption: 'READ / DISCOVER / SIGNAL', description: 'Fondasi pembacaan, eksplorasi, dan radio ada di kode XV.', status: 'CODE EXISTS', accent: 'cool' },
    { id: 'harbor', name: 'HARBOR', caption: 'PEOPLE / COMMUNITY', description: 'Ruang partisipasi sukarela dan kerja bersama, masih direncanakan.', status: 'PLANNED', accent: 'pink' },
    { id: 'moonlab', name: 'MOONLAB', caption: 'RESEARCH / EVIDENCE', description: 'Penelitian yang memisahkan data, tafsir, dan hipotesis.', status: 'PLANNED', accent: 'cool' },
    { id: 'shadow', name: 'SHADOW', caption: 'CREATE / EDITORIAL', description: 'Studio cerita, komik, dan media dengan tinjauan manusia.', status: 'PLANNED', accent: 'pink' },
    { id: 'works', name: 'WORKS', caption: 'ECONOMY / ACTION', description: 'Karya dan layanan yang menghasilkan manfaat serta penghidupan nyata.', status: 'PLANNED', accent: 'warm' },
  ],
  en: [
    { id: 'moonwitness', name: 'MOONWITNESS', caption: 'STORIES / KNOWLEDGE', description: 'Stories, traceable sources, and creative works in context.', status: 'PLANNED', accent: 'warm' },
    { id: 'dock', name: 'DOCK', caption: 'READ / DISCOVER / SIGNAL', description: 'Reading, discovery, and radio foundations exist in XV source.', status: 'CODE EXISTS', accent: 'cool' },
    { id: 'harbor', name: 'HARBOR', caption: 'PEOPLE / COMMUNITY', description: 'Voluntary participation and mutual support. Still proposed.', status: 'PLANNED', accent: 'pink' },
    { id: 'moonlab', name: 'MOONLAB', caption: 'RESEARCH / EVIDENCE', description: 'Research that distinguishes data, interpretation, and hypotheses.', status: 'PLANNED', accent: 'cool' },
    { id: 'shadow', name: 'SHADOW', caption: 'CREATE / EDITORIAL', description: 'A human-reviewed studio for stories, comics, and media.', status: 'PLANNED', accent: 'pink' },
    { id: 'works', name: 'WORKS', caption: 'ECONOMY / ACTION', description: 'Useful work, services, and real economic value.', status: 'PLANNED', accent: 'warm' },
  ],
}
export const content = {
  id: {
    other: 'EN', otherHref: '/en', navigation: ['Visi', 'Ekosistem', 'Cerita', 'Prinsip'],
    eyebrow: 'ACCOUNTABLE LIFE · LEARNING · ACTION', kick: 'THE CLOUD OF LOVE / PUBLIC PREVIEW',
    headline1: 'DARI MENATAP LANGIT,', headline2: 'MENJADI TINDAKAN.',
    intro: 'Sebuah pintu masuk untuk pengetahuan yang dapat diperiksa, cerita yang bermakna, karya yang bermanfaat, dan tindakan yang bertanggung jawab.',
    explore: 'JELAJAHI EKOSISTEM', why: 'BACA VISINYA',
    missionTitle: 'Bukan untuk menguasai. Untuk melayani.',
    mission: 'A-L-L-A-H adalah nama proyek Accountable Life, Learning & Action Hub. Inspirasi iman tidak menggantikan bukti, hak orang lain, ataupun tanggung jawab manusia.',
    spacesEyebrow: 'ATLAS / DOMAIN', spacesTitle: 'SATU VISI. BANYAK RUANG.',
    spacesNote: 'Status adalah kematangan fitur menurut fondasi kode dan blueprint; bukan klaim situs telah tersedia secara publik.',
    storyEyebrow: 'ORIGIN STORY / MANUSIA PULPEN', storyTitle: 'COLONG START DI CLOUD',
    story: 'Rabu, 28 Oktober 2026: sebuah niat baik dimulai. Kamis, 29 Oktober: ROCKSOUL yang biasanya pendiam mulai belajar menuliskannya. Dari langit menuju teknologi cloud, bukan untuk menandingi ciptaan ALLAH, melainkan mengupayakan manfaat bagi manusia.',
    storyNote: 'Refleksi pribadi dan karya naratif; bukan wahyu, bukti ilmiah, atau otoritas keagamaan.',
    principlesEyebrow: 'THE OPERATING PROMISE', principlesTitle: 'KEBAIKAN HARUS DIBUKTIKAN.',
    principles: ['Sumber dan tafsir dibedakan.', 'Sistem boleh salah dan harus bisa dikoreksi.', 'Tidak ada otoritas ilahi yang diklaim aplikasi.', 'Privasi, izin, dan hak cipta dihormati.'],
    closing: 'Born from love. Built in the cloud. Guided by faith. Proven through deeds.',
    notice: 'Preview konseptual — belum menjadi portal semua aplikasi.',
    footer: 'ONLY YOU. YOUR DEEDS. AND ALLAH.',
    spaces: spaces.id,
  },
  en: {
    other: 'ID', otherHref: '/id', navigation: ['Mission', 'Ecosystem', 'Story', 'Principles'],
    eyebrow: 'ACCOUNTABLE LIFE · LEARNING · ACTION', kick: 'THE CLOUD OF LOVE / PUBLIC PREVIEW',
    headline1: 'FROM LOOKING AT THE SKY,', headline2: 'TO MEANINGFUL ACTION.',
    intro: 'A gateway to inspectable knowledge, meaningful storytelling, useful creation, and accountable human action.',
    explore: 'EXPLORE ECOSYSTEM', why: 'READ THE MISSION',
    missionTitle: 'Built to serve, not to rule.',
    mission: 'A-L-L-A-H is the project acronym Accountable Life, Learning & Action Hub. Faith-inspired purpose never replaces evidence, human rights, or accountability.',
    spacesEyebrow: 'ATLAS / DOMAIN', spacesTitle: 'ONE VISION. MANY SPACES.',
    spacesNote: 'Statuses describe documented code maturity and proposals, not evidence that every service is publicly deployed.',
    storyEyebrow: 'ORIGIN STORY / MANUSIA PULPEN', storyTitle: 'A HEAD START IN THE CLOUD',
    story: 'Wednesday, 28 October 2026: a good intention began. Thursday, 29 October: the usually quiet ROCKSOUL tried to write about it. From the sky to cloud technology—not to rival creation, but to work toward real human benefit.',
    storyNote: 'A personal, creative reflection—not revelation, scientific proof, or religious authority.',
    principlesEyebrow: 'THE OPERATING PROMISE', principlesTitle: 'GOOD INTENTIONS REQUIRE EVIDENCE.',
    principles: ['Sources and interpretations remain distinct.', 'Systems can be wrong and must be correctable.', 'Software claims no divine authority.', 'Privacy, consent, and copyright matter.'],
    closing: 'Born from love. Built in the cloud. Guided by faith. Proven through deeds.',
    notice: 'Concept preview — not all applications are public.',
    footer: 'ONLY YOU. YOUR DEEDS. AND ALLAH.',
    spaces: spaces.en,
  },
} as const
