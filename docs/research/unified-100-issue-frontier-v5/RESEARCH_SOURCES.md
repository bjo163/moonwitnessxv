# Sumber Riset dan Metode

**Tanggal batas bukti:** 2026-10-30. Confidence tinggi berarti sumber berwenang menjelaskan isinya sendiri; itu tidak membuktikan penerapan pada MoonWitness XV, kepatuhan hukum, permintaan pasar, atau kebenaran teologis.

## Metode dan cakupan aktual

Pemeriksaan dimulai dari README dan indeks dokumen, lalu meninjau TODO, dokumen batas domain/arsitektur, sebagian manifest dan source path, panduan kontribusi/keamanan, serta metadata Git. Skrip discovery scripts/diagnostics/environment-doctor.mjs --commands hanya digunakan untuk memeriksa versi dan menemukan perintah root; hasilnya Node 24.22.1 dan pnpm 10.33.4, sesuai persyaratan manifest. Skrip tersebut tidak menjalankan aplikasi.

GitHub ditinjau melalui connector untuk beberapa repositori terkait pada tingkat README, pencarian issue/PR yang tersedia, serta metadata branch/ref. Ini bukan audit semua riwayat issue atau source code repositori terkait.

Cakupan aktual: 24 README repositori terkait; 14 sumber teknis/standar/operasional resmi atau primer di bawah (beberapa memiliki halaman pendamping); satu paper peer-reviewed, yaitu FAIR; tanpa tinjauan sistematis 15 paper, tanpa 15 audit source-code OSS, tanpa 10 studi produk/bisnis, serta tanpa tinjauan teks agama primer. Ada sejumlah kerangka ekonomi/kemanusiaan, tetapi bukan delapan kajian lengkap untuk tiap kategori. Target dalam prompt adalah sasaran riset, bukan izin untuk mengarang bukti. Kekurangan ini tercermin pada confidence rendah/sedang dan pembatasan issue menjadi discovery/prototype.

## Register bukti repositori

| Kunci | Sumber | Mendukung | Batas |
|---|---|---|---|
| R01 | [README.md](../../../README.md) | Gambaran proyek dan ringkasan tingkat repo. | Angka agregatnya berbeda dari TODO. |
| R02 | [TODO.md](../../../TODO.md) | Status tugas/milestone dan bukti yang tercatat. | Register dapat berubah; paket ini tidak mengeditnya. |
| R03 | [BLUEPRINT.md](../../../BLUEPRINT.md) | Arsitektur dan batas domain. | Harus dibaca bersama ADR dan implementasi aktual. |
| R04 | [MASTER_DESIGN.md](../../../MASTER_DESIGN.md) | Semantik UI dan maksud interaksi. | Maksud desain bukan bukti implementasi. |
| R05 | [APPS.md](../../../docs/architecture/APPS.md) | Daftar aplikasi dan kapabilitas yang dinyatakan. | Beberapa status berbeda dari dokumen lain. |
| R06 | [SKYLINK.md](../../../docs/architecture/SKYLINK.md) | Batas dan status SKYLINK menurut dokumen. | Root guidance/TODO juga menentukan status. |
| R07 | [ECHOLOG.md](../../../docs/architecture/ECHOLOG.md) | Kontrak object storage dan batas layanan. | Tidak membuktikan endpoint aktif dan tidak memberi hak memiliki tabel. |
| R08 | [LUMEN.md](../../../docs/architecture/LUMEN.md) dan [LUMEN_CONTRACTS.md](../../../docs/architecture/LUMEN_CONTRACTS.md) | Batas worker/runtime yang didokumentasikan. | Kontrak/test lokal bukan bukti runtime produksi. |
| R09 | [Indeks keputusan](../../../docs/decisions/README.md) | Daftar ADR yang diterima. | Hanya keputusan yang tercatat dalam indeks. |
| R10 | [AI execution contract](../../../docs/planning/AI_EXECUTION_CONTRACT.md) | Kontrak eksekusi/otorisasi yang berlaku. | Tidak memberi izin implementasi pada paket ini. |
| R11 | [CONTRIBUTING.md](../../../CONTRIBUTING.md) | Aturan kontribusi, TODO, dan persiapan governance. | Pembuatan issue GitHub tetap terpisah. |
| R12 | [SECURITY.md](../../../SECURITY.md) | Panduan pelaporan dan publikasi keamanan. | Tidak ada kerentanan yang diuji atau diklaim. |
| R13 | [Audit source pins M06-01](../../../docs/audit/M06-01-source-repo-pins.md) | Pin repositori sumber dan status review yang tercatat. | Lookup connector atas beberapa ref gagal; penyebab UNKNOWN. |
| R14 | [GRANULARITY_AUDIT.md](../../../docs/planning/GRANULARITY_AUDIT.md) | Angka perencanaan historis. | Bukan status authority; TODO berwenang. |
| R15 | [apps.registry.mjs](../../../scripts/apps.registry.mjs) | Metadata registry aplikasi, termasuk status dev LUMEN. | Metadata bukan bukti runtime/deployment. |
| R16 | package.json, pnpm-workspace.yaml, lockfile | Batas runtime dan susunan workspace. | Konfigurasi bukan bukti install/build berhasil. |
| R17 | Source/test aplikasi dan paket yang dirujuk pada issue terkait | Kandidat kepemilikan modul dan batas yang ada. | Pemeriksaan selektif; test tidak dijalankan. |

## Sumber eksternal

Tanggal update tidak selalu tersedia; halaman tanpa tanggal publikasi/update yang terverifikasi diperiksa pada 2026-10-30. Confidence mengukur mutu sumber untuk pernyataan yang didukung, bukan kebenaran teologis.

1. **S01 — NIST AI Risk Management Framework**, NIST, [halaman framework](https://www.nist.gov/itl/ai-risk-management-framework). **Tinggi** untuk status sukarela dan materi yang diterbitkan; bukan hukum atau bukti kepatuhan MoonWitness. Halaman mencatat revisi RMF 1.0 dan profil GenAI 2024. Relevan untuk ENG-009, ENG-012, FUT-001–005.
2. **S02 — OWASP GenAI Security Project 2026 Top 10 dan Agent Control Standard**, 2026-09-01, [pengumuman](https://genai.owasp.org/2026/09/01/owasp-genai-security-project-unveils-2026-top-10-for-llm-applications-new-agent-control-standard-and-sponsors-as-community-tops-30000-members/). **Tinggi** untuk pengumuman proyek sendiri; panduan komunitas, bukan mandat hukum. Relevan untuk ENG-009/012 dan FUT-001/003/004.
3. **S03 — Guardrails and human approvals**, dokumentasi API OpenAI, [panduan resmi](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals). **Tinggi** untuk mekanisme produk yang dijelaskan; vendor-spesifik dan bukan rekomendasi vendor. Relevan untuk FUT-001/003/004.
4. **S04 — Agent Builder safety**, dokumentasi API OpenAI, [panduan resmi](https://developers.openai.com/api/docs/guides/agent-builder-safety). **Tinggi** untuk panduan yang dijelaskan; vendor-spesifik. Halaman menyebut rencana deprecate Agent Builder pada 2026-11-30, sehingga paket ini tidak merekomendasikannya. Relevan untuk FUT-001/003/004.
5. **S05 — WCAG 2.2**, W3C Recommendation, 2024-12-12, [spesifikasi](https://www.w3.org/TR/wcag/). **Tinggi** sebagai acuan aksesibilitas normatif. Relevan untuk ENG-022–024 dan FUT-011/012; tidak ada klaim konformitas.
6. **S06 — WCAG 2.2 sebagai ISO/IEC 40500:2025**, pengumuman W3C, [rilis](https://www.w3.org/press-releases/2025/wcag22-iso-pas/). **Tinggi** untuk isi pengumuman; bukan opini hukum yurisdiksi tertentu. Relevan untuk ENG-022–024 dan FUT-011/012.
7. **S07 — Local-first software**, Ink & Switch, [esai](https://www.inkandswitch.com/essay/local-first/) dan [halaman proyek](https://www.inkandswitch.com/local-first-software/). **Sedang**: riset/prototipe berpengaruh, bukan sistem sync siap pakai atau bukti bahwa local-first tepat untuk semua data MoonWitness. Relevan untuk FUT-005/007/019–021/030.
8. **S08 — TEI P5 Guidelines, rilis 4.12.0**, Text Encoding Initiative, update 2026-07-28, [panduan](https://www.tei-c.org/Vault/P5/current/doc/tei-p5-doc/en/html/). **Tinggi** untuk model encoding; markup akademik tidak menentukan otoritas teologis atau hak cipta. Relevan untuk FUT-015 dan ONT-001–003/011/013.
9. **S09 — PROV-O**, W3C Recommendation, [spesifikasi](https://www.w3.org/TR/prov-o/). **Tinggi** sebagai kosakata provenance stabil. Bisa menjadi bahan pemetaan, tetapi tidak mewajibkan penggantian system of record. Relevan untuk ENG-016, FUT-013/026/030, ONT-004/009/010.
10. **S10 — Handbook on Data Protection in Humanitarian Action, edisi ke-3**, ICRC, 2024-11-19, [handbook](https://www.icrc.org/en/data-protection-humanitarian-action-handbook). **Tinggi** untuk panduan perlindungan data; penerapan bergantung operasi/yurisdiksi. Relevan untuk FUT-021 dan CHAR-001/002/006/010.
11. **S11 — Core Humanitarian Standard 2024**, CHS Alliance, [standar 2024](https://handbook.corehumanitarianstandard.org/en/chs/2024) dan [ringkasan](https://www.corehumanitarianstandard.org/the-standard). **Tinggi** untuk komitmen dan kerangka feedback/accountability; tidak ada klaim kesesuaian CHS. Relevan untuk CHAR-001–004/007/009/010.
12. **S12 — Better Criteria for Better Evaluation**, OECD DAC Network on Development Evaluation, revisi 2019, [publikasi](https://www.oecd.org/en/publications/better-criteria-for-better-evaluation_15a9c26b-en.html). **Tinggi** untuk kriteria evaluasi; bukan bukti hasil program. Relevan untuk FUT-014 dan CHAR-009.
13. **S13 — FAIR Guiding Principles**, Wilkinson dkk., Scientific Data 3, 160018 (2016), [DOI](https://doi.org/10.1038/sdata.2016.18). **Tinggi** sebagai paper prinsip peer-reviewed; FAIR tidak sama dengan akses terbuka dan tidak menggantikan consent/hak. Relevan untuk FUT-026 dan ONT-003/005.
14. **S14 — IATI Standard**, International Aid Transparency Initiative, [dokumentasi publisher](https://publisher.iatistandard.org/iati-standard). **Tinggi** untuk standar pelaporan; konteks bantuan internasional mungkin tidak cocok bagi proyek kecil dan tidak mengotorisasi sistem donasi. Relevan untuk CHAR-004–006.

Register ini memiliki 14 sumber; beberapa sumber mencakup halaman pendamping. Klaim paket merujuk ke sumber-sumber ini dan kunci bukti repositori. Tambahkan riset independen sebelum membuat keputusan implementasi dengan confidence tinggi.

## Pemetaan sumber ke kandidat

| Kunci | Kandidat terkait |
|---|---|
| S01 NIST AI RMF | ENG-009/012, FUT-001–005 |
| S02 OWASP GenAI | ENG-009/012, FUT-001/003/004 |
| S03 OpenAI approvals | FUT-001/003/004 |
| S04 Agent Builder safety | FUT-001/003/004 |
| S05 WCAG 2.2 | ENG-022–024, FUT-011/012 |
| S06 WCAG ISO | ENG-022–024, FUT-011/012 |
| S07 Local-first | FUT-005/007/019–021/030 |
| S08 TEI P5 | FUT-015, ONT-001–003/011/013 |
| S09 PROV-O | ENG-016, FUT-013/026/030, ONT-004/009/010 |
| S10 ICRC | FUT-021, CHAR-001/002/006/010 |
| S11 CHS | CHAR-001–004/007/009/010 |
| S12 OECD-DAC | FUT-014, CHAR-009 |
| S13 FAIR | FUT-026, ONT-003/005 |
| S14 IATI | CHAR-004–006 |

## Kematangan teknologi dan relevansi 2035

| Area | Kematangan sumber yang ditinjau | Implikasi |
|---|---|---|
| Kerangka risiko/keamanan AI | Panduan terbit dan standar berkembang; bukan jaminan implementasi. | Gunakan untuk threat model dan evaluasi, bukan sertifikasi. |
| UX human approval | Dokumentasi vendor menjelaskan pola produk yang berjalan; kecocokan MoonWitness belum diuji. | Prototipe tanpa kapabilitas menjalankan aksi. |
| Aksesibilitas | WCAG 2.2 adalah Recommendation W3C dan ISO/IEC PAS; konformitas perlu diuji per rute. | Gunakan kriteria terukur pada ruang lingkup sempit. |
| Encoding teks/provenance | TEI P5 dan PROV-O adalah spesifikasi terbit yang matang. | Petakan satu fixture; jangan otomatis mengganti kepemilikan MoonQL. |
| Local-first | Ada riset/prototipe; kompromi perangkat, keamanan dan sinkronisasi tetap ada. | Uji catatan offline dan konflik dengan data sintetis. |
| Spatial world/agent otonom | Tidak ada bukti kebutuhan pengguna/operasi MoonWitness dalam riset ini. | Jaga sebagai mock kecil dengan kriteria no-go. |
| Kerangka kemanusiaan | Panduan operasional terbit; penerapan bergantung operator dan konteks. | Minta review lokal; jangan klaim patuh. |

Uji 2035 mengutamakan kapabilitas lintas generasi model/perangkat—provenance, tampilan ketidakpastian, aksesibilitas, kerja offline terbatas, dan approval aman. Ini inferensi dari standar dan batas proyek, bukan prediksi. Spatial exploration, persistent memory, dan atlas naratif tetap spekulatif; hentikan jika tampilan daftar/teks sederhana sama baiknya atau bukti pengguna tidak ada.

