# Ekosistem Frontier — Paket Riset dan 100 Issue V5

**Status:** 100 candidates registered as TODO tasks M46–M50; all are unchecked. They are not GitHub issues.
**Tanggal:** 2026-10-30  
**Repositori:** MoonWitness XV, bjo163/moonwitnessxv

## Cakupan dan batas penggunaan

Paket ini memuat tepat 100 kandidat issue: 32 engineering, 30 frontier innovation, 8 economy, 10 charity/humanitarian, dan 20 faith/ontology. Setiap issue memiliki ID unik, satu domain utama dan subdomain, ruang lingkup, bukti dan tingkat keyakinan, rencana kerja, acceptance criteria, risiko, metrik, perkiraan upaya, rollback/fallback, relasi dependensi, serta bukti penutupan.

Ringkasan dan laporan riset berbahasa Indonesia. Spesifikasi issue rinci memakai English untuk istilah dan kriteria teknis agar mudah dipindahkan ke alur kerja engineering. Seluruh isi tetap berstatus **PROPOSED**.

Paket riset awal dibuat sebagai dokumen usulan; pengguna kemudian secara eksplisit meminta pendaftaran 100 kandidat ke TODO. Semua kandidat kini dipetakan satu-ke-satu ke M46–M50 dan tetap unchecked. Pendaftaran bukan otorisasi implementasi atau pembuatan issue GitHub. TODO.md tetap satu-satunya sumber status; pemilik kontrak, dependensi, hak, consent dan gerbang manusia tetap berlaku.

Paket riset awal dibuat pada snapshot terdahulu; lihat [audit historis](AUDIT.md). Sebelum pendaftaran TODO ini, branch aktif adalah dev pada HEAD 8cfe3e5d4b37ae252fd78c865903312aa869dfd4, dengan 46 milestone, 393 ID, 334 checked dan 59 unchecked. Snapshot branch, HEAD dan perubahan WIP direkam di luar repo sebelum penyuntingan. Pada snapshot pendaftaran di HEAD 1db6a4c69ca71b4c27823117c9fa5f929405a36a, TODO berisi 51 milestone/493 ID (334 checked/159 unchecked); semua entri V5 baru unchecked dan status lama sama dengan baseline pendaftaran. HEAD ad96dbf3ae98731e7c10972d7f0600b809398e9d (snapshot historis, 2026-10-30) menutup M20-06, sehingga TODO menjadi 335 checked/158 unchecked; seluruh 100 task V5 masih unchecked. Pada HEAD ca395d1 (2026-10-30), TODO berisi 52 milestone, 499 ID, 347 checked, 152 unchecked. Perubahan dokumentasi ini tidak mengubah kode, branch, issue/PR GitHub atau riwayat Git. Dalam pass dokumentasi ini tidak dijalankan application test, build, migration, deployment atau live service. Commit 1db6a4c memuat pendaftaran TODO dan dibuat selama pekerjaan berlangsung oleh pemilik repo; paket dan indeks pendukung tetap berada di working tree.

## Ringkasan temuan

MoonWitness XV adalah ekosistem riset dan media dengan Hub pusat serta aplikasi dan paket domain khusus. Kekuatan utamanya adalah batas kepemilikan data yang terdokumentasi, register TODO yang luas, kontrak hak/consent/publikasi, serta paket corpus, witness/media, research, ontology, graph, dan UNILEX.

Risiko perencanaan yang masih terlihat adalah perbedaan bahasa status implementasi SKYLINK/ECHOLOG/ORBIT dan beberapa source pin historis yang tidak berhasil di-resolve oleh connector. Konflik jumlah pada capture awal sudah diperbaiki pada README; granularity audit diberi label historis. Temuan maturity/pin menunjukkan bukti yang belum cukup, bukan bukti runtime rusak.

Beberapa pekerjaan rilis, consent, hak publikasi, komunitas, pembayaran, meter fisik, dan deployment sudah terbuka di TODO. Kandidat baru di paket ini tidak menggantikan pekerjaan tersebut. SKYLINK tetap bukan Hub, identity owner, model catalog, atau pemilik SQL ketiga. ECHOLOG tetap layanan object storage tanpa tabelnya sendiri. ARSY tetap Hub dan pemilik API/data bersama.

Arah terpadu yang disarankan: sambungkan aplikasi melalui kontrak eksplisit dan berversi; pisahkan sumber, interpretasi, narasi, testimony privat, pembukuan komersial, dan dana amal terbatas; minta otoritas manusia untuk keputusan publikasi, finansial, privasi, dan komunitas. Ide frontier harus diuji dengan eksperimen terbatas yang dapat berakhir no-go.

## Paket dokumen

| Dokumen | Isi |
|---|---|
| [Audit repositori dan arsitektur](AUDIT.md) | Inventaris sistem, status, batas domain, temuan dan gap |
| [Daftar sumber dan metode riset](RESEARCH_SOURCES.md) | 14 sumber primer/resmi, 24 README repositori terkait, metode dan batas cakupan |
| [Matriks 100 issue](ISSUE_MASTER_MATRIX.md) | Semua ID, domain, subdomain, prioritas, skor, wave dan ID TODO M46–M50 |
| [ADR applicability](ADR_APPLICABILITY.md) | Per-candidate review of existing ADR boundaries and triggers for future ADRs; not an approval |
| [Review 100 tugas](TASK_REVIEW.md) | Temuan overlap dengan pekerjaan yang ada, dependensi terlalu luas, dan perapian spesifikasi |
| [Issue engineering](ISSUES_ENGINEERING.md) | ENG-001 sampai ENG-032 |
| [Issue frontier](ISSUES_FRONTIER.md) | FUT-001 sampai FUT-030 |
| [Issue economy](ISSUES_ECONOMY.md) | ECO-001 sampai ECO-008 |
| [Issue charity/humanitarian](ISSUES_CHARITY.md) | CHAR-001 sampai CHAR-010 |
| [Issue faith/ontology](ISSUES_ONTOLOGY.md) | ONT-001 sampai ONT-020 |
| [Roadmap, korelasi dan QA](ROADMAP_QA.md) | Dependensi 100 ID, roadmap, peringkat, risiko, red-team dan batas hasil |

## Alokasi tepat

| Domain | Target | Jumlah |
|---|---:|---:|
| Engineering excellence | 32 | 32 |
| Frontier innovation | 30 | 30 |
| Economy/revenue | 8 | 8 |
| Charity/humanitarian | 10 | 10 |
| Faith/religion/ontology | 20 | 20 |
| **Total** | **100** | **100** |

Subdomain dan jumlahnya tercantum di awal setiap dokumen domain dan diperiksa dalam matriks.

## Pemetaan ke TODO dan cara memulai

| Kandidat | ID TODO canonical | Jumlah | Gerbang utama |
|---|---|---:|---|
| ENG | M46-01–M46-32 | 32 | Pemilik engineering/service yang sudah ada; dependensi per task |
| FUT | M47-01–M47-30 | 30 | Gerbang AI/security M21, rights/consent dan keputusan prototype |
| ECO | M48-01–M48-08 | 8 | M35 buyer/merchant gates; outreach tetap butuh izin |
| CHAR | M49-01–M49-10 | 10 | M32 scope, operator akuntabel, safeguarding dan consent |
| ONT | M50-01–M50-20 | 20 | M06/M16/M18/M19, rights/consent dan review ahli sesuai task |

Mulai dari unchecked row pada [TODO](../../../TODO.md), buka packet yang ditautkan, lalu ikuti dependency dan execution contract. Setiap packet merangkum microtasks, acceptance, verification, anti-overlap, rollback dan closure evidence serta menautkan spesifikasi 22 bagian. Pendaftaran bukan izin implementasi.

## Peta keluaran 25 laporan

Isi laporan dikonsolidasikan ke dokumen kanonik yang sudah dimiliki repositori agar tidak membentuk pohon dokumentasi kedua. Status “parsial” berarti temuan atau target riset tertentu belum tersedia; lihat batas yang dicatat, jangan menganggapnya selesai.

| No. | Laporan | Lokasi kanonik | Cakupan |
|---:|---|---|---|
| 01 | Executive ecosystem intelligence | [Ringkasan paket](README.md#ringkasan-temuan), [audit domain](AUDIT.md) | Terkonsolidasi; status implementasi dan risiko dibatasi bukti. |
| 02 | Repository architecture & state audit | [Audit repositori](AUDIT.md) | Terkonsolidasi; inspeksi selektif, bukan audit keamanan penuh. |
| 03 | Engineering excellence audit | [Audit engineering](AUDIT.md) | Terkonsolidasi; defect runtime yang belum direproduksi tetap UNKNOWN. |
| 04 | Frontier research intelligence | [Audit frontier](AUDIT.md), [sumber/metode](RESEARCH_SOURCES.md) | Parsial; coverage paper/OSS/product belum mencapai seluruh target. |
| 05 | Economic opportunity intelligence | [Audit ekonomi](AUDIT.md), [issue ekonomi](ISSUES_ECONOMY.md) | Terkonsolidasi; buyer, harga dan revenue tetap UNKNOWN. |
| 06 | Charity & humanitarian impact intelligence | [Audit charity](AUDIT.md), [issue charity](ISSUES_CHARITY.md) | Terkonsolidasi sebagai discovery/governance; tidak ada dampak yang diklaim. |
| 07 | Faith, religion & ontology intelligence | [Audit faith/ontology](AUDIT.md), [issue ontology](ISSUES_ONTOLOGY.md), [sumber](RESEARCH_SOURCES.md) | Parsial; sumber primer agama/sarjana belum ditinjau. |
| 08 | Unified ecosystem vision | [Visi lintas-ekosistem](AUDIT.md), [Master Vision](../../../docs/vision/MASTER_VISION_NARRATIVE_XV.md), [Blueprint](../../../BLUEPRINT.md) | Terkonsolidasi; keputusan canonical repository tetap mengatur. |
| 09 | Gap analysis & opportunity matrix | [Peta gap ke kandidat](AUDIT.md) | Terkonsolidasi; semua 100 ID dipetakan. |
| 10 | Candidate discovery summary | [Penemuan dan seleksi](ROADMAP_QA.md), [alokasi](README.md#alokasi-tepat) | Terkonsolidasi; alternatif tertunda dan bias riset tercatat. |
| 11 | Exact 100-issue master matrix | [Matriks dan crosswalk TODO](ISSUE_MASTER_MATRIX.md) | Lengkap: 100 ID dan 100 ID TODO canonical. |
| 12 | Engineering issues (32) | [ENG-001–032](ISSUES_ENGINEERING.md) | 32 spesifikasi dengan 22 bagian per issue. |
| 13 | Frontier innovation issues (30) | [FUT-001–030](ISSUES_FRONTIER.md) | 30 spesifikasi dengan 22 bagian per issue. |
| 14 | Economic issues (8) | [ECO-001–008](ISSUES_ECONOMY.md) | 8 spesifikasi dengan 22 bagian per issue. |
| 15 | Charity issues (10) | [CHAR-001–010](ISSUES_CHARITY.md) | 10 spesifikasi dengan 22 bagian per issue. |
| 16 | Faith & ontology issues (20) | [ONT-001–020](ISSUES_ONTOLOGY.md) | 20 spesifikasi dengan 22 bagian per issue. |
| 17 | Deduplication & reconciliation | [Deduplikasi](ROADMAP_QA.md) | Terbatas pada TODO, connector dan kontrak yang dapat diperiksa; bukan pencarian GitHub global. |
| 18 | Dependency & correlation matrix | [Matriks dependensi](ROADMAP_QA.md), [TODO crosswalk](ISSUE_MASTER_MATRIX.md) | 100 relasi kandidat; graph dependency tanpa siklus. |
| 19 | Architecture contract map | [Peta arsitektur](AUDIT.md), [cakupan domain](../../../docs/planning/DOMAIN_COVERAGE.md) | Batas ARSY/SKYLINK/ECHOLOG serta domain existing dipertahankan. |
| 20 | Milestone & execution blueprint | [Roadmap](ROADMAP_QA.md), [konteks milestone](../../../docs/milestones/README.md), [TODO](../../../TODO.md) | 5 milestone baru dengan owner, entry/exit gate, task dependencies. |
| 21 | Strategic rankings | [Peringkat strategis](ROADMAP_QA.md) | Hanya memakai ID yang sama dari 100 kandidat. |
| 22 | Cost, complexity & sustainability | [Biaya dan keberlanjutan](ROADMAP_QA.md) | Estimasi adalah planning range; biaya legal/operations belum lengkap. |
| 23 | Risk & governance register | [Register risiko](ROADMAP_QA.md) | Residual risks dan otoritas pemilik dinyatakan. |
| 24 | Recommended first execution plan | [Batch awal](ROADMAP_QA.md) | Triage saja; kontak manusia/implementasi memerlukan gerbang terpisah. |
| 25 | Final portfolio integrity certificate | [Sertifikat dan gap tersisa](ROADMAP_QA.md) | Validasi internal selesai; dedupe global dan target riset eksternal tetap terbuka. |

## Metode dan batas bukti

Pemeriksaan mencakup README, TODO, indeks dokumen, kontrak arsitektur, sebagian manifest/source path, Git metadata, command discovery, pencarian issue/PR melalui connector, 24 README repositori terkait, serta 14 sumber teknis/standar/operasional resmi atau primer. Sumbernya tercatat di [RESEARCH_SOURCES.md](RESEARCH_SOURCES.md).

Cakupan ini belum memenuhi target riset lengkap pada prompt: belum ada 15 paper yang ditinjau sistematis, 15 audit source code OSS, 10 studi produk, atau 15 tinjauan sumber primer/sarjana agama. Hanya satu paper peer-reviewed yang masuk daftar, yakni FAIR. Tidak ada kitab suci atau teks agama primer yang dikonsultasikan. Karena itu paket ini tidak membuat klaim doktrinal atau historis.

Label bukti dipakai dengan arti berikut: **VERIFIED** hanya untuk artefak/fakta yang benar-benar diperiksa; **INFERRED** untuk simpulan terbatas; **PROPOSED** untuk usulan; **EXPERIMENTAL** untuk prototipe; **SPECULATIVE** untuk hipotesis lemah; **UNKNOWN** untuk hal yang belum diketahui; **CONTESTED** untuk perbedaan pendapat substantif. Tingkat confidence menilai mutu bukti, bukan kebenaran agama.

## Batas penting

- Pencarian GitHub saat riset menemukan satu issue (#10) dan sepuluh record PR pada query yang digunakan; status PR tidak tersedia pada hasil connector tersimpan. Ini bukan audit global atau bukti deduplikasi seluruh riwayat. Pendaftaran TODO tidak membuat issue GitHub.
- Snapshot awal menemukan README/GRANULARITY_AUDIT berbeda dari TODO; TODO berwenang. Snapshot pendaftaran adalah 51 milestone/493 tugas (334 checked, 159 unchecked). Pada HEAD ad96dbf3ae98731e7c10972d7f0600b809398e9d, TODO berisi 335 checked/158 unchecked setelah M20-06 ditutup; seluruh 100 kandidat V5 tetap unchecked. Audit granularity tetap snapshot historis.
- Status M38–M40, SKYLINK, ECHOLOG, dan LUMEN tidak sepenuhnya selaras antar dokumen. Tidak ada test suite yang dijalankan untuk menghapus konflik tersebut.
- Worktree awal sangat kotor dengan UI, accessibility, media, dan M19 work-in-progress. Perubahan lokal tidak diasumsikan sebagai status rilis.
- Belum ada bukti buyer, pelanggan, pendapatan, kebutuhan penerima manfaat, partner, donasi, dampak, atau lokasi meter. Semua tetap UNKNOWN.

