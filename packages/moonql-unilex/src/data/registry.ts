/**
 * UNILEX v0.1 seed registry, recovered from
 * bjo163/empire-of-the-light @ 38354ffff077d4ee1e17d40b39d86e41ce769817
 * path: data/unilex/terms.v0.1.json
 * raw file SHA-256: 8e60fe61d35604f560c7c71330754db3e881915ce541c392e09fb99c53d05772
 *
 * The registry itself says PROPOSED_NOT_ADOPTED: 71 concepts, all DRAFT_REVIEW.
 * This is a seed, not a validated universal dictionary.
 */

export type UnilexLane = 'UNIVERSAL' | 'SCRIPTURE' | 'TEXT_SOURCE' | 'PROJECT'

export interface UnilexSeedEntry {
  id: string
  preferredLabel: { en: string; id: string }
  domain: UnilexLane
  kind: string
  definition: { id: string }
  alternateLabels: Record<string, string>
  sourceReferences: Array<Record<string, unknown>>
  relations: Array<{ type: string; targetId: string }>
  status: string
}

export interface UnilexSeedRegistry {
  schemaVersion: string
  status: string
  title: string
  description: string
  relationTypes: string[]
  canonicalRules: string[]
  entries: UnilexSeedEntry[]
}

export const UNILEX_SEED: UnilexSeedRegistry = {
  "schemaVersion": "0.1.0",
  "status": "PROPOSED_NOT_ADOPTED",
  "title": "UNILEX — Universal Lexicon of Empire of the Light",
  "description": "71 source-aware seed concepts spanning universal values, scripture-specific referents, textual witnesses and human-operated project vocabulary.",
  "relationTypes": [
    "relatedTo",
    "inspiredBy",
    "distinctFrom",
    "exactMatch",
    "closeMatch",
    "narrowerThan",
    "broaderThan"
  ],
  "canonicalRules": [
    "Stable IDs are not reused",
    "Scriptural referents and textual witnesses are distinct",
    "No automatic exactMatch across religious traditions",
    "Persona/Scripture names never grant permissions or supernatural authority",
    "Source/edition licensing required before scripture ingest",
    "Human review required for source-specific mappings"
  ],
  "entries": [
    {
      "id": "U001",
      "preferredLabel": {
        "en": "Truth",
        "id": "Kebenaran"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Pernyataan atau keadaan yang sesuai fakta; klaim memerlukan konteks dan dasar penilaian."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "U002",
      "preferredLabel": {
        "en": "Evidence",
        "id": "Bukti"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Materi, pengamatan, atau dokumen yang mendukung atau membantah suatu klaim."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "U003",
      "preferredLabel": {
        "en": "Trust",
        "id": "Kepercayaan"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Kesediaan mengandalkan pihak atau sistem berdasarkan integritas dan ekspektasi yang dapat diperiksa."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "U004",
      "preferredLabel": {
        "en": "Responsibility",
        "id": "Tanggung Jawab"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Kewajiban terdefinisi untuk melaksanakan tugas dan menjelaskan akibat tindakannya."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "U005",
      "preferredLabel": {
        "en": "Accountability",
        "id": "Akuntabilitas"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Kapasitas menjelaskan, diaudit, dan dikoreksi atas keputusan atau tindakan."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "U006",
      "preferredLabel": {
        "en": "Human Agency",
        "id": "Otonomi Manusia"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Kemampuan dan hak manusia memilih tindakan berdasarkan informasi dan izin yang sah."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "U007",
      "preferredLabel": {
        "en": "Consent",
        "id": "Persetujuan"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Izin spesifik, diinformasikan, dan dapat dicabut sesuai konteks yang berlaku."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "U008",
      "preferredLabel": {
        "en": "Dignity",
        "id": "Martabat"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Nilai dan penghormatan yang melekat pada manusia dalam sistem sosial dan operasional."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "U009",
      "preferredLabel": {
        "en": "Justice",
        "id": "Keadilan"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Penanganan hak, kewajiban, dan sengketa dengan standar yang adil dan dapat diperiksa."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "U010",
      "preferredLabel": {
        "en": "Fairness",
        "id": "Kewajaran"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Tidak adanya perlakuan sewenang-wenang dan adanya penilaian yang beralasan serta dapat diuji."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "U011",
      "preferredLabel": {
        "en": "Compassion",
        "id": "Welaskasih"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Kepekaan terhadap kesulitan orang lain disertai kemauan membantu secara tepat."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "U012",
      "preferredLabel": {
        "en": "Consultation",
        "id": "Musyawarah"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Proses meminta dan mempertimbangkan masukan pemangku kepentingan."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "U013",
      "preferredLabel": {
        "en": "Covenant",
        "id": "Perjanjian Komitmen"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Kesepakatan komitmen antara pihak yang secara sadar menyetujuinya."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "U014",
      "preferredLabel": {
        "en": "Stewardship",
        "id": "Pengelolaan Bertanggung Jawab"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Pengelolaan sesuatu yang dipercayakan dengan memperhatikan manfaat dan keberlanjutan."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "U015",
      "preferredLabel": {
        "en": "Protection",
        "id": "Perlindungan"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Pencegahan dan penanganan kerugian melalui pengamanan yang sah dan proporsional."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "U016",
      "preferredLabel": {
        "en": "Restoration",
        "id": "Pemulihan"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Proses memperbaiki kerugian, fungsi, atau hubungan yang terganggu."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "U017",
      "preferredLabel": {
        "en": "Continuity",
        "id": "Keberlanjutan"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Kemampuan proses, pengetahuan, dan tanggung jawab berlanjut saat kondisi berubah."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "U018",
      "preferredLabel": {
        "en": "Knowledge",
        "id": "Pengetahuan"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Informasi atau pemahaman dengan ruang lingkup, dasar, dan keterbatasan yang jelas."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "U019",
      "preferredLabel": {
        "en": "Interpretation",
        "id": "Penafsiran"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Pemaknaan terhadap teks atau peristiwa oleh pihak tertentu dalam konteks tertentu."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "U020",
      "preferredLabel": {
        "en": "Peace",
        "id": "Perdamaian"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Kondisi dan proses mengurangi kekerasan serta memelihara hubungan yang aman."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "U021",
      "preferredLabel": {
        "en": "Scope",
        "id": "Cakupan"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Batas lingkup berlakunya tugas, data, klaim, atau keputusan."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "U022",
      "preferredLabel": {
        "en": "Provenance",
        "id": "Asal-Usul Informasi"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Riwayat asal, pengolahan, dan perubahan suatu informasi atau data."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "U023",
      "preferredLabel": {
        "en": "Source",
        "id": "Sumber"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Asal atau media tempat suatu informasi atau klaim ditemukan."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "U024",
      "preferredLabel": {
        "en": "Verification",
        "id": "Verifikasi"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Pemeriksaan apakah klaim atau data sesuai persyaratan dan bukti yang dinyatakan."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "U025",
      "preferredLabel": {
        "en": "Renewal",
        "id": "Pembaruan"
      },
      "domain": "UNIVERSAL",
      "kind": "concept",
      "definition": {
        "id": "Perbaikan atau pembentukan ulang proses agar tetap relevan dan bertanggung jawab."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "S001",
      "preferredLabel": {
        "en": "Allah (Islamic theological referent)",
        "id": "Allah (rujukan teologi Islam)"
      },
      "domain": "SCRIPTURE",
      "kind": "concept",
      "definition": {
        "id": "Nama Tuhan dalam teologi Islam; tidak dinyatakan identik secara otomatis dengan seluruh konsep ilahi dari tradisi lain."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "S002",
      "preferredLabel": {
        "en": "Amanah (Qur'anic concept)",
        "id": "Amanah (konsep Qur'ani)"
      },
      "domain": "SCRIPTURE",
      "kind": "concept",
      "definition": {
        "id": "Istilah Qur'ani tentang tanggung jawab atau kepercayaan; maknanya bergantung pada konteks ayat dan tafsir."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [
        {
          "type": "relatedTo",
          "targetId": "U003"
        },
        {
          "type": "relatedTo",
          "targetId": "U004"
        }
      ],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "S003",
      "preferredLabel": {
        "en": "Shura (Qur'anic concept)",
        "id": "Syura (konsep Qur'ani)"
      },
      "domain": "SCRIPTURE",
      "kind": "concept",
      "definition": {
        "id": "Konsep musyawarah dalam konteks Qur'ani; analogi sistem tidak menggantikan tafsir."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [
        {
          "type": "relatedTo",
          "targetId": "U012"
        }
      ],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "S004",
      "preferredLabel": {
        "en": "Mizan (Qur'anic concept)",
        "id": "Mizan (konsep Qur'ani)"
      },
      "domain": "SCRIPTURE",
      "kind": "concept",
      "definition": {
        "id": "Istilah timbangan dan keseimbangan yang digunakan dalam konteks Qur'ani; bukan skor software."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [
        {
          "type": "relatedTo",
          "targetId": "U009"
        },
        {
          "type": "relatedTo",
          "targetId": "U010"
        }
      ],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "S005",
      "preferredLabel": {
        "en": "Rahmah (Qur'anic concept)",
        "id": "Rahmah (konsep Qur'ani)"
      },
      "domain": "SCRIPTURE",
      "kind": "concept",
      "definition": {
        "id": "Konsep rahmat dalam teologi dan etika Qur'ani; tidak identik secara menyeluruh dengan welaskasih sosial."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [
        {
          "type": "relatedTo",
          "targetId": "U011"
        }
      ],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "S006",
      "preferredLabel": {
        "en": "Islah (Qur'anic concept)",
        "id": "Islah (konsep Qur'ani)"
      },
      "domain": "SCRIPTURE",
      "kind": "concept",
      "definition": {
        "id": "Istilah perbaikan atau rekonsiliasi menurut konteks ayat dan tafsir."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [
        {
          "type": "relatedTo",
          "targetId": "U016"
        },
        {
          "type": "relatedTo",
          "targetId": "U020"
        }
      ],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "S007",
      "preferredLabel": {
        "en": "Bayyinah (Qur'anic concept)",
        "id": "Bayyinah (konsep Qur'ani)"
      },
      "domain": "SCRIPTURE",
      "kind": "concept",
      "definition": {
        "id": "Istilah bukti atau penjelasan yang jelas menurut konteks Qur'ani, bukan sinonim persis bukti teknis."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [
        {
          "type": "relatedTo",
          "targetId": "U002"
        }
      ],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "S008",
      "preferredLabel": {
        "en": "Al-Mulk (Qur'anic concept)",
        "id": "Al-Mulk (konsep Qur'ani)"
      },
      "domain": "SCRIPTURE",
      "kind": "concept",
      "definition": {
        "id": "Konsep kerajaan dan kekuasaan Allah dalam Al-Qur'an, bukan struktur pengelolaan produk."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "S009",
      "preferredLabel": {
        "en": "Al-Arsh (Qur'anic concept)",
        "id": "Al-'Arsy (konsep Qur'ani)"
      },
      "domain": "SCRIPTURE",
      "kind": "concept",
      "definition": {
        "id": "Rujukan teologis dalam Al-Qur'an yang tidak disamakan dengan platform perangkat lunak ARSY."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [
        {
          "type": "distinctFrom",
          "targetId": "P002"
        }
      ],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "S010",
      "preferredLabel": {
        "en": "Tawrat (Islamic scriptural referent)",
        "id": "Taurat (rujukan Qur'ani)"
      },
      "domain": "SCRIPTURE",
      "kind": "concept",
      "definition": {
        "id": "Nama wahyu dalam kerangka Islam; edisi Torah sebagai teks tetap perlu identitas naskah terpisah."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [
        {
          "type": "relatedTo",
          "targetId": "T001"
        }
      ],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "S011",
      "preferredLabel": {
        "en": "Zabur (Islamic scriptural referent)",
        "id": "Zabur (rujukan Qur'ani)"
      },
      "domain": "SCRIPTURE",
      "kind": "concept",
      "definition": {
        "id": "Nama wahyu dalam kerangka Islam; tradisi Psalms perlu identitas edisi terpisah."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [
        {
          "type": "relatedTo",
          "targetId": "T002"
        }
      ],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "S012",
      "preferredLabel": {
        "en": "Injil (Islamic scriptural referent)",
        "id": "Injil (rujukan Qur'ani)"
      },
      "domain": "SCRIPTURE",
      "kind": "concept",
      "definition": {
        "id": "Nama wahyu dalam kerangka Islam; tidak otomatis identik secara tekstual dengan empat Injil kanonik."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [
        {
          "type": "relatedTo",
          "targetId": "T003"
        }
      ],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "S013",
      "preferredLabel": {
        "en": "Quran (scripture)",
        "id": "Al-Qur'an (kitab)"
      },
      "domain": "SCRIPTURE",
      "kind": "concept",
      "definition": {
        "id": "Kitab suci Islam dengan identitas teks, mushaf, bacaan, terjemahan dan tafsir dicatat terpisah."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [
        {
          "type": "relatedTo",
          "targetId": "T004"
        }
      ],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "T001",
      "preferredLabel": {
        "en": "Torah textual traditions",
        "id": "Tradisi teks Torah"
      },
      "domain": "TEXT_SOURCE",
      "kind": "concept",
      "definition": {
        "id": "Keluarga saksi dan edisi Torah/Pentateukh mengikuti naskah, kanon, dan tradisinya."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [
        {
          "type": "relatedTo",
          "targetId": "S010"
        }
      ],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "T002",
      "preferredLabel": {
        "en": "Psalms textual traditions",
        "id": "Tradisi teks Mazmur"
      },
      "domain": "TEXT_SOURCE",
      "kind": "concept",
      "definition": {
        "id": "Keluarga saksi dan edisi Mazmur dengan penomoran sesuai tradisi terkait."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [
        {
          "type": "relatedTo",
          "targetId": "S011"
        }
      ],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "T003",
      "preferredLabel": {
        "en": "Canonical Gospel textual traditions",
        "id": "Tradisi teks Injil kanonik"
      },
      "domain": "TEXT_SOURCE",
      "kind": "concept",
      "definition": {
        "id": "Empat Injil kanonik dalam tradisi Kristen dengan saksi teks dan versi masing-masing."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [
        {
          "type": "relatedTo",
          "targetId": "S012"
        }
      ],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "T004",
      "preferredLabel": {
        "en": "Quran textual traditions",
        "id": "Tradisi teks Al-Qur'an"
      },
      "domain": "TEXT_SOURCE",
      "kind": "concept",
      "definition": {
        "id": "Teks Al-Qur'an dengan metadata mushaf, bacaan, edisi, terjemahan, dan tafsir."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [
        {
          "type": "relatedTo",
          "targetId": "S013"
        }
      ],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P001",
      "preferredLabel": {
        "en": "A-L-L-A-H Command Center",
        "id": "A-L-L-A-H Command Center"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Nama platform akronim teknologi manusia; bukan sistem yang memiliki otoritas ilahi."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P002",
      "preferredLabel": {
        "en": "ARSY Technology",
        "id": "Teknologi ARSY"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Lapisan kemampuan teknologi dan orkestrasi proyek; berbeda dari konsep teologis al-Arsy."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [
        {
          "type": "distinctFrom",
          "targetId": "S009"
        }
      ],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P003",
      "preferredLabel": {
        "en": "100CENTER",
        "id": "100CENTER"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Konsol koordinasi dan operasi manusia untuk menjalankan serta mengaudit kemampuan sistem."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P004",
      "preferredLabel": {
        "en": "ZIIL",
        "id": "ZIIL"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Peran dan prinsip perlindungan operasional Journey, tanpa mengklaim status spiritual."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [
        {
          "type": "inspiredBy",
          "targetId": "U015"
        }
      ],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P005",
      "preferredLabel": {
        "en": "Raid Pathfinder",
        "id": "RĀ’ID / Pathfinder"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Peran menemukan, merancang dan menguji kemungkinan Path bagi pengguna."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P006",
      "preferredLabel": {
        "en": "Renewal Steward",
        "id": "MUJADDID / Renewal Steward"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Peran pemelihara Path yang ditunjuk dan dapat diaudit; bukan gelar agama otomatis."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [
        {
          "type": "inspiredBy",
          "targetId": "U025"
        }
      ],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P007",
      "preferredLabel": {
        "en": "Witness",
        "id": "WITNESS / Saksi"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Peran memeriksa klaim, bukti dan proses sesuai kewenangannya."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [
        {
          "type": "relatedTo",
          "targetId": "U024"
        }
      ],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P008",
      "preferredLabel": {
        "en": "G.O.D. 99",
        "id": "G.O.D. 99"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Sistem 99 slot persona fiktif bertema tugas manusia; angka bukan jumlah entitas ketuhanan."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P009",
      "preferredLabel": {
        "en": "WINGS 10",
        "id": "WINGS 10"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Sepuluh departemen spesialis yang diinspirasi motif tugas malaikat tanpa kemampuan supernatural."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P010",
      "preferredLabel": {
        "en": "The Prime Code",
        "id": "The Prime Code"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Identitas fondasi nilai dan kualitas sistem, bukan kitab suci atau peraturan ilahi."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P011",
      "preferredLabel": {
        "en": "Universal Lexicon (UNILEX)",
        "id": "Kamus Universal (UNILEX)"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Registri konsep, istilah, definisi, bahasa, sumber dan relasi yang konsisten untuk ekosistem."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P012",
      "preferredLabel": {
        "en": "Journey",
        "id": "Perjalanan"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Rangkaian kejadian nyata yang dialami aktor dari waktu ke waktu."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P013",
      "preferredLabel": {
        "en": "Path",
        "id": "Jalur / Rencana Jalan"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Prosedur atau rute yang dipilih untuk mencapai tujuan, berbeda dari perjalanan aktual."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P014",
      "preferredLabel": {
        "en": "Road Network",
        "id": "Jaringan Jalan"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Keterhubungan banyak Path dari aktor dan komunitas dengan cakupan berbeda."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P015",
      "preferredLabel": {
        "en": "Timeline",
        "id": "Garis Waktu"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Urutan peristiwa berdasarkan waktu atau urutan yang didukung bukti."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P016",
      "preferredLabel": {
        "en": "Milestone",
        "id": "Tonggak Capaian"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Peristiwa penanda pencapaian atau perubahan dalam Journey atau Path."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P017",
      "preferredLabel": {
        "en": "Mission",
        "id": "Misi / Penugasan"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Unit pekerjaan berjangka, memiliki tujuan, pelaksana dan bukti hasil."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P018",
      "preferredLabel": {
        "en": "Persona",
        "id": "Persona / Identitas Peran"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Identitas karakter atau peran yang tidak otomatis membawa hak akses atau kewenangan."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P019",
      "preferredLabel": {
        "en": "Department",
        "id": "Departemen / Unit Kerja"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Kelompok operasional dengan mandat, anggota dan wilayah tanggung jawab yang jelas."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P020",
      "preferredLabel": {
        "en": "AI Agent",
        "id": "Agen AI"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Perangkat lunak yang menyelesaikan tugas dengan alat dan izin terbatas; bukan subjek ilahi."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P021",
      "preferredLabel": {
        "en": "Human Actor",
        "id": "Aktor Manusia"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Manusia nyata yang memiliki identitas dan kewenangan sesuai persetujuan serta aturan yang berlaku."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P022",
      "preferredLabel": {
        "en": "Mandate",
        "id": "Mandat"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Delegasi kewenangan terbatas, teratribusi, dapat dicabut dan memiliki masa berlaku."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [
        {
          "type": "relatedTo",
          "targetId": "U004"
        }
      ],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P023",
      "preferredLabel": {
        "en": "Evidence Record",
        "id": "Rekaman Bukti"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Objek data untuk menyimpan sumber dan hasil pemeriksaan sebuah klaim."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [
        {
          "type": "relatedTo",
          "targetId": "U002"
        },
        {
          "type": "relatedTo",
          "targetId": "U022"
        }
      ],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P024",
      "preferredLabel": {
        "en": "Source Family",
        "id": "Keluarga Sumber"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Kategori pengelompokan sumber untuk penelusuran; bukan pernyataan kesetaraan semua teks di dalamnya."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P025",
      "preferredLabel": {
        "en": "Claim",
        "id": "Klaim"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Pernyataan dengan pembuat, tanggal, asal-usul dan status pembuktian tertentu."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P026",
      "preferredLabel": {
        "en": "Human Review",
        "id": "Tinjauan Manusia"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Pemeriksaan yang dilakukan pihak berwenang sebelum keputusan penting diaktifkan."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P027",
      "preferredLabel": {
        "en": "Corpus",
        "id": "Korpus"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Kumpulan dokumen dan metadata yang terkurasi untuk pencarian dan penelitian."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P028",
      "preferredLabel": {
        "en": "Ontology",
        "id": "Ontologi"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Model eksplisit jenis entitas, relasi dan batas makna dalam suatu domain."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    },
    {
      "id": "P029",
      "preferredLabel": {
        "en": "Ethos",
        "id": "Etos"
      },
      "domain": "PROJECT",
      "kind": "concept",
      "definition": {
        "id": "Himpunan nilai dasar yang ingin diwujudkan sistem, berbeda dari aturan teknis."
      },
      "alternateLabels": {},
      "sourceReferences": [],
      "relations": [],
      "status": "DRAFT_REVIEW"
    }
  ]
}
