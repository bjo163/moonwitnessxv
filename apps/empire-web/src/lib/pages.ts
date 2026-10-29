import type { Locale } from './copy'

export const sections = ['about', 'ecosystem', 'values', 'roadmap', 'sources', 'privacy'] as const
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
    ecosystem: {
      title: 'Peta ekosistem', summary: 'Kenali tujuan setiap ruang dan status aksesnya.',
      paragraphs: [
        'Daftar ini menjelaskan ruang publik yang diperkenalkan dalam visi MoonWitness XV. Nama aplikasi dan fondasi kode tidak membuktikan bahwa layanan sudah tersedia di internet.',
        'Belum ada alamat layanan publik yang terverifikasi untuk dihubungkan dari pilot ini. Karena itu, kartu yang direncanakan tetap berupa informasi, tanpa tombol masuk palsu.',
      ],
    },
    values: {
      title: 'Nilai dan tanggung jawab', summary: 'Niat baik dijalankan melalui tindakan yang dapat diperiksa.',
      paragraphs: [
        'Pelayanan: pengetahuan dan karya diupayakan untuk memberi manfaat. Membaca halaman publik tidak memerlukan keanggotaan, pembayaran, atau persetujuan terhadap keyakinan tertentu.',
        'Kejujuran: fakta, rujukan sumber, tafsir, hipotesis, cerita pribadi, dan karya fiksi perlu dibedakan. Ketidakpastian disampaikan; perangkat lunak tidak menetapkan kebenaran agama.',
        'Hak dan privasi: sumber digunakan sesuai izin, kontribusi memerlukan persetujuan, dan informasi pribadi tidak boleh dijadikan materi publik secara otomatis.',
        'Koreksi: kesalahan harus bisa ditinjau dan diperbaiki oleh manusia. Manfaat tidak diwakili oleh angka pengguna, klaim spiritual, atau dampak yang belum diukur.',
      ],
    },
    roadmap: {
      title: 'Roadmap pilot', summary: 'Urutan pengembangan tanpa persentase kemajuan rekaan.',
      paragraphs: [
        'Tahap pilot statis: beranda bilingual, penjelasan proyek, atlas ekosistem, nilai, kebijakan sumber, dan privasi. Ketersediaan kode harus dibedakan dari hasil pengujian dan deployment.',
        'Tahap verifikasi: pemeriksaan ekspor halaman, metadata bahasa, tautan, build, serta navigasi mobile dan keyboard. Pemeriksaan visual browser dan uji aksesibilitas lengkap memiliki bukti tersendiri.',
        'Tahap Preview hosting: masih ditunda. Belum ada alamat Preview publik yang terverifikasi untuk digunakan dari pilot ini.',
        'Tahap layanan nyata: cerita berilustrasi dan pembaca sumber menunggu izin publikasi serta peninjauan materi. Radio mengikuti implementasi Dock; pilot ini tidak membuat pemutar atau backend radio baru.',
        'Tahap komunitas dan ekonomi: Harbor, MoonLab, SHADOW, serta WORKS tetap rencana. Akun, kontribusi, pembayaran, dan donasi membutuhkan alur operasional yang nyata sebelum diaktifkan.',
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
    ecosystem: {
      title: 'Ecosystem map', summary: 'Understand each space and its access status.',
      paragraphs: [
        'This directory describes public-facing spaces introduced in the MoonWitness XV vision. Application names and source-code foundations do not prove that services are available online.',
        'No public service destination has been verified for linking from this pilot. Proposed cards therefore remain information, without pretend entry buttons.',
      ],
    },
    values: {
      title: 'Values and accountability', summary: 'Good intentions become actions that can be inspected.',
      paragraphs: [
        'Service: knowledge and creative work should benefit people. Reading public pages requires no membership, payment, or agreement with a particular belief.',
        'Honesty: facts, original sources, interpretations, hypotheses, personal stories, and fiction need distinct labels. Uncertainty should be visible; software does not adjudicate religious truth.',
        'Rights and privacy: sources require appropriate permission, contributions require consent, and private information must not automatically become public material.',
        'Correction: humans must be able to review and correct mistakes. Unmeasured impact, spiritual claims, and user counts do not stand in for verified benefit.',
      ],
    },
    roadmap: {
      title: 'Pilot roadmap', summary: 'An ordered plan without invented completion percentages.',
      paragraphs: [
        'Static pilot: bilingual home, project explanation, ecosystem atlas, values, source policy, and privacy. Code availability is distinct from test results and deployment.',
        'Verification: exported pages, language metadata, links, build, and mobile and keyboard navigation. Visual browser checks and a complete accessibility audit require separate evidence.',
        'Hosted Preview: still deferred. No public Preview address has been verified for use from this pilot.',
        'Real services: illustrated stories and source reading await publication rights and content review. Radio follows the Dock implementation; this pilot adds no radio backend or player.',
        'Community and economy: Harbor, MoonLab, SHADOW, and WORKS remain planned. Accounts, contributions, payments, and donations require real operating workflows before activation.',
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
