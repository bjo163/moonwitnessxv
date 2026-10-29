import type { StoryLocale } from './story-universe'

/**
 * GGS Full Moon School copy from the REF-05 mockup (M45-11).
 * `LIVE NOW`, `JOIN TODAY — 10:12 WIB` and `12 APR 2025` are mockup strings.
 * CLAIMS.md rows 8–10 record them as story-time labels: the badge is not a live
 * session, the CTA opens the lesson, and the date is a fictional session date.
 */
type GgsCopy = {
  eyebrow: string
  title: [string, string, string]
  lead: string
  body: string
  primaryCta: string
  secondaryCta: string
  script: string
  stats: Array<{ value: string; label: string }>
  lessonEyebrow: string
  live: string
  lessonTitle: string
  lessonLead: string
  lessonBody: string
  lessonMeta: Array<{ label: string; value: string }>
  lessonCta: string
  storyTime: string
  reflectionEyebrow: string
  reflectionTitle: [string, string]
  reflectionQuote: string
  lessonsTitle: string
  lessonsKicker: string
  lessonsViewAll: string
  lessons: Array<{ index: string; title: string; body: string }>
  sessionsTitle: string
  sessionsKicker: string
  sessionsView: string
  nextSession: string
  nextSessionName: string
  nextSessionWhen: [string, string]
  saveDate: string
  pathsTitle: string
  pathsKicker: string
  pathsView: string
  paths: Array<{ title: string; body: string }>
}

export const ggsCopy: Record<StoryLocale, GgsCopy> = {
  en: {
    eyebrow: 'STORY UNIVERSE PORTAL · MOONWITNESS XV',
    title: ['GGS —', 'FULL MOON', 'SCHOOL'],
    lead: 'A SCHOOL THAT APPEARS UNDER THE FULL MOON.',
    body: 'A sanctuary for curious minds, compassionate hearts, and brave actions. Learn. Reflect. Build. Together.',
    primaryCta: 'ENTER THE SCHOOL',
    secondaryCta: 'WATCH TRAILER',
    script: 'Learn Reflect Build Together',
    stats: [
      { value: '4+', label: 'LEARNING PATHS' },
      { value: '∞', label: 'LESSONS & REFLECTIONS' },
      { value: '1', label: 'A GLOBAL COMMUNITY' },
    ],
    lessonEyebrow: 'TODAY’S LESSON',
    live: 'LIVE NOW',
    lessonTitle: 'THE FORGOTTEN PRAYER',
    lessonLead: 'REDISCOVERING A CONVERSATION THAT NEVER LEFT US.',
    lessonBody: 'A guided lesson on returning to the essence of prayer — not as a routine, but as a living connection, especially after hardship.',
    lessonMeta: [
      { label: 'TIME', value: '10:12 WIB' },
      { label: 'FORMAT', value: 'Guided Lesson + Reflection' },
      { label: 'OPEN TO', value: 'All Seekers' },
      { label: 'UNDER THE', value: 'Full Moon' },
    ],
    lessonCta: 'JOIN TODAY — 10:12 WIB',
    storyTime: 'Story time in this fiction · not a live session',
    reflectionEyebrow: 'REFLECTION OF THE DAY',
    reflectionTitle: ['GRATITUDE', 'AFTER HARDSHIP'],
    reflectionQuote: '“Sometimes the heaviest nights bring the clearest versions of ourselves. Hardship is not the end, but a doorway — to a deeper gratitude, a softer heart, and a stronger return to Him.”',
    lessonsTitle: 'LESSONS',
    lessonsKicker: 'TIMELESS KNOWLEDGE FOR A BRIGHTER HUMANITY.',
    lessonsViewAll: 'VIEW ALL',
    lessons: [
      { index: '01', title: 'THE FORGOTTEN PRAYER', body: 'Reconnecting with what matters most.' },
      { index: '02', title: 'HEARTS AFTER HARDSHIP', body: 'Healing, patience, and renewed purpose.' },
      { index: '03', title: 'A KINDER TOMORROW', body: 'Turning faith into action for a better world.' },
    ],
    sessionsTitle: 'FULL MOON SESSIONS',
    sessionsKicker: 'LIVE GATHERINGS UNDER THE SAME MOON.',
    sessionsView: 'VIEW SCHEDULE',
    nextSession: 'NEXT SESSION',
    nextSessionName: 'FULL MOON CIRCLE XV',
    nextSessionWhen: ['12 APR 2025', '20:00 WIB'],
    saveDate: 'SAVE THE DATE',
    pathsTitle: 'LEARNING PATHS',
    pathsKicker: 'DIFFERENT PATHS. ONE BRIGHTER TOMORROW.',
    pathsView: 'EXPLORE ALL',
    paths: [
      { title: 'FAITH & SELF', body: 'Know. Remember. Return.' },
      { title: 'CHARACTER & ACTION', body: 'From values to real impact.' },
      { title: 'SOCIETY & HUMANITY', body: 'People. Communities. Change.' },
      { title: 'SCIENCE & CREATION', body: 'Explore the signs around us.' },
    ],
  },
  id: {
    eyebrow: 'PORTAL SEMESTA CERITA · MOONWITNESS XV',
    title: ['GGS —', 'SEKOLAH BULAN', 'PURNAMA'],
    lead: 'SEKOLAH YANG MUNCUL DI BAWAH BULAN PURNAMA.',
    body: 'Tempat aman bagi pikiran ingin tahu, hati penyayang, dan tindakan berani. Belajar. Renungkan. Bangun. Bersama.',
    primaryCta: 'MASUK SEKOLAH',
    secondaryCta: 'TONTON TRAILER',
    script: 'Belajar Renungkan Bangun',
    stats: [
      { value: '4+', label: 'JALUR BELAJAR' },
      { value: '∞', label: 'PELAJARAN & RENUNGAN' },
      { value: '1', label: 'KOMUNITAS GLOBAL' },
    ],
    lessonEyebrow: 'PELAJARAN HARI INI',
    live: 'LIVE NOW',
    lessonTitle: 'DOA YANG TERLUPAKAN',
    lessonLead: 'MENEMUKAN KEMBALI PERCAKAPAN YANG TAK PERNAH PERGI.',
    lessonBody: 'Pelajaran terbimbing untuk kembali ke esensi doa — bukan sebagai rutinitas, melainkan hubungan yang hidup, terutama setelah masa sulit.',
    lessonMeta: [
      { label: 'WAKTU', value: '10:12 WIB' },
      { label: 'FORMAT', value: 'Pelajaran + Renungan' },
      { label: 'TERBUKA UNTUK', value: 'Semua Pencari' },
      { label: 'DI BAWAH', value: 'Bulan Purnama' },
    ],
    lessonCta: 'JOIN TODAY — 10:12 WIB',
    storyTime: 'Waktu cerita dalam fiksi · bukan sesi langsung',
    reflectionEyebrow: 'RENUNGAN HARI INI',
    reflectionTitle: ['SYUKUR', 'SETELAH KESULITAN'],
    reflectionQuote: '“Kadang malam terberat membawa versi diri yang paling jernih. Kesulitan bukan akhir, melainkan pintu — menuju syukur yang lebih dalam, hati yang lebih lembut, dan kembali yang lebih kuat kepada-Nya.”',
    lessonsTitle: 'PELAJARAN',
    lessonsKicker: 'PENGETAHUAN ABADI UNTUK KEMANUSIAAN LEBIH CERAH.',
    lessonsViewAll: 'LIHAT SEMUA',
    lessons: [
      { index: '01', title: 'DOA YANG TERLUPAKAN', body: 'Menyambung kembali hal yang paling penting.' },
      { index: '02', title: 'HATI SETELAH KESULITAN', body: 'Pemulihan, kesabaran, dan tujuan baru.' },
      { index: '03', title: 'ESOK YANG LEBIH BAIK', body: 'Mengubah iman menjadi tindakan.' },
    ],
    sessionsTitle: 'SESI BULAN PURNAMA',
    sessionsKicker: 'PERTEMUAN DI BAWAH BULAN YANG SAMA.',
    sessionsView: 'LIHAT JADWAL',
    nextSession: 'SESI BERIKUTNYA',
    nextSessionName: 'FULL MOON CIRCLE XV',
    nextSessionWhen: ['12 APR 2025', '20:00 WIB'],
    saveDate: 'SIMPAN TANGGAL',
    pathsTitle: 'JALUR BELAJAR',
    pathsKicker: 'JALAN BERBEDA. SATU ESOK LEBIH CERAH.',
    pathsView: 'JELAJAHI SEMUA',
    paths: [
      { title: 'IMAN & DIRI', body: 'Kenali. Ingat. Kembali.' },
      { title: 'KARAKTER & AKSI', body: 'Dari nilai menjadi dampak nyata.' },
      { title: 'MASYARAKAT & MANUSIA', body: 'Manusia. Komunitas. Perubahan.' },
      { title: 'SAINS & CIPTAAN', body: 'Jelajahi tanda di sekitar kita.' },
    ],
  },
}
