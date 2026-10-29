import type { Locale } from './copy'

export const sections = ['about', 'sources', 'privacy'] as const
export type Section = typeof sections[number]
export const pageCopy = {
  id: {
    home: 'Kembali ke beranda', navigation: 'Informasi proyek', skip: 'Langsung ke isi',
    preview: 'Pilot statis · belum merupakan rilis publik ekosistem',
    about: {
      title: 'Tentang proyek', summary: 'Dari rasa ingin tahu menuju karya yang bermanfaat.',
      paragraphs: [
        'A-L-L-A-H adalah singkatan proyek Accountable Life, Learning & Action Hub. Empire of the Light adalah visi yang dikembangkan dalam MoonWitness XV oleh manusia; aplikasi ini tidak mengklaim otoritas ilahi.',
        'Pilot ini memperkenalkan misi, peta ekosistem, dan refleksi Manusia Pulpen. Cerita tersebut adalah narasi pribadi tentang seseorang yang pendiam dan sedang belajar menulis, bukan riwayat ilmiah atau sumber keagamaan.',
        'Status CODE EXISTS berarti fondasi tersedia di repository, bukan layanan yang telah diluncurkan. PLANNED berarti masih direncanakan. Pilot ini belum menyediakan akun, pembayaran, pemutar radio, atau pembaca korpus.',
      ],
    },
    sources: {
      title: 'Sumber dan kebijakan editorial', summary: 'Pembaca harus dapat membedakan sumber, tafsir, dan cerita.',
      paragraphs: [
        'Teks misi dan atlas disusun dari spesifikasi produk serta dokumentasi MoonWitness XV. Dokumen perencanaan menjelaskan tujuan; keberadaannya tidak membuktikan bahwa sebuah layanan telah beroperasi.',
        'Refleksi Manusia Pulpen diberi label sebagai cerita pribadi. Pilot ini tidak menyajikan kutipan ayat, terjemahan kitab, hasil penelitian, atau poster yang telah dinyatakan lolos peninjauan hak publikasi.',
        'Materi sumber mendatang perlu menyertakan karya, edisi, rujukan yang tepat, atribusi, izin penggunaan, dan status peninjauan. Materi tanpa izin atau konteks yang memadai tidak boleh dianggap siap terbit.',
        'Koreksi harus membedakan perubahan fakta, tafsir, dan penyuntingan cerita. Belum ada formulir pengiriman atau alur publikasi mandiri dalam pilot ini.',
      ],
    },
    privacy: {
      title: 'Privasi pilot', summary: 'Membaca halaman ini tidak memerlukan akun atau informasi pribadi.',
      paragraphs: [
        'Kode pilot ini tidak menambahkan formulir, login, pembayaran, analitik, cookie aplikasi, atau penyimpanan preferensi di browser. Pergantian bahasa menggunakan tautan halaman.',
        'Pilot tidak memuat media pihak ketiga atau menghubungkan browser ke API internal. Konten halaman dikirim sebagai berkas statis.',
        'Saat dihosting, penyedia hosting dapat memproses alamat IP dan informasi permintaan untuk pengiriman halaman, keamanan, serta log operasional. Retensi dan pengelolaan log hosting belum diverifikasi; halaman ini bukan janji bahwa seluruh infrastruktur bebas pencatatan.',
        'Sebelum fitur akun, kontribusi, atau analitik ditambahkan, kebijakan ini perlu diperbarui dengan pengelola yang bertanggung jawab, tujuan pemrosesan, retensi, dan cara mengajukan permintaan data. Tidak ada formulir permintaan data yang aktif dalam pilot ini.',
      ],
    },
  },
  en: {
    home: 'Back to home', navigation: 'Project information', skip: 'Skip to content',
    preview: 'Static pilot · not a public release of the ecosystem',
    about: {
      title: 'About the project', summary: 'From curiosity to useful work.',
      paragraphs: [
        'A-L-L-A-H is the project acronym Accountable Life, Learning & Action Hub. Empire of the Light is a human-led vision developed within MoonWitness XV; this application claims no divine authority.',
        'This pilot introduces the mission, ecosystem map, and Manusia Pulpen reflection. That story follows a quiet person learning to write. It is a personal narrative, not scientific history or a religious source.',
        'CODE EXISTS means foundations exist in the repository, not that a service has launched. PLANNED means proposed work. This pilot does not yet offer accounts, payments, a radio player, or a corpus reader.',
      ],
    },
    sources: {
      title: 'Sources and editorial policy', summary: 'Readers should be able to distinguish sources, interpretation, and stories.',
      paragraphs: [
        'Mission and atlas copy draw on the product specification and MoonWitness XV documentation. Planning documents describe intent; their existence does not prove that a service is operational.',
        'The Manusia Pulpen reflection is labeled as a personal story. This pilot does not publish scripture quotations, scripture translations, research findings, or posters represented as cleared for publication.',
        'Future source material needs an identified work, edition, precise citation, attribution, usage permission, and review state. Material lacking adequate rights or context must not be treated as publication-ready.',
        'Corrections should distinguish factual changes, interpretation, and story edits. This pilot has no submission form or self-publication workflow.',
      ],
    },
    privacy: {
      title: 'Pilot privacy', summary: 'Reading these pages requires no account or personal information.',
      paragraphs: [
        'The pilot code adds no forms, login, payments, analytics, application cookies, or browser preference storage. Language switching uses page links.',
        'The pilot embeds no third-party media and connects the browser to no internal API. Page content is delivered as static files.',
        'When hosted, the hosting provider may process IP addresses and request information for page delivery, security, and operational logs. Hosting log retention and management have not been verified; this page does not promise that all infrastructure is free of logging.',
        'Before accounts, contributions, or analytics are introduced, this policy needs an identified responsible operator, processing purposes, retention rules, and a data request channel. No data request form is active in this pilot.',
      ],
    },
  },
} as const satisfies Record<Locale, unknown>
