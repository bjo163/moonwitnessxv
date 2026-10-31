# Review duplikasi, dependensi, dan mutu spesifikasi M46–M50

**Status:** review perencanaan statis; bukan penerimaan, perubahan TODO, atau izin implementasi.  
**Snapshot:** branch `dev`, HEAD `1074b526196fa1623ef0c89725f77fffbf2fe579`; sebelum review worktree memiliki 91 entri perubahan/untracked.  
**Cakupan:** 100 kandidat ENG/FUT/ECO/CHAR/ONT, spesifikasi domain, paket tugas, matriks, roadmap, TODO, artefak tugas sebelumnya, kontrak dan kode terkait.

## Kesimpulan

- Tidak ada judul duplikat persis di antara 100 kandidat. Tidak ada kandidat yang perlu langsung dihapus hanya karena judulnya sama.
- Ada **overlap substansial** dengan pekerjaan yang sudah selesai atau kontrak yang sudah ada, terutama ENG-002, FUT-003, ONT-001/003/004, dan ONT-009. Sebelum tugas-tugas itu diadopsi, spesifikasinya perlu dipersempit menjadi pemeriksaan gap atau eksperimen yang memakai artefak yang sudah ada.
- Semua 100 spesifikasi memiliki 22 bagian bernomor; 100 packet cocok dengan kandidatnya. Dependensi blocker pada spesifikasi, roadmap, packet, dan kolom TODO cocok secara mekanis, dan graf blocker tidak memiliki siklus.
- Kecocokan mekanis itu menyembunyikan masalah makna: **10 task menggunakan ID milestone sebagai dependensi**, padahal validator TODO memperluas `Mdd` menjadi seluruh task dalam milestone. Beberapa cakupan hanya menyebut gerbang tertentu atau hanya memerlukan gerbang itu jika memakai data nyata.
- Definisi rentang upaya dalam roadmap tidak cocok dengan **97 dari 100** rentang hari yang dicantumkan pada spesifikasi. Matriks dan TODO konsisten dengan rentang per-task, tetapi label ukuran XS/S/M/L/XL menjadi tidak dapat dipakai sebagaimana definisi roadmap.
- Ada 8 relasi `enables` yang tidak menjadi prasyarat langsung maupun transitif bagi target. Perlu ubah menjadi `related` atau tambahkan dependensi blocker hanya jika memang prasyarat.

## Metode dan batas bukti

Saya memeriksa semua lima spesifikasi domain dan 100 packet, menghitung kelengkapan struktur, mencocokkan kandidat dengan matriks/TODO, memeriksa semua 394 baris TODO di luar 100 kandidat untuk kemiripan judul, lalu meninjau artefak dan implementasi untuk kandidat yang paling berpotensi berulang. Saya juga menjalankan pencarian GitHub repository-level read-only. Hasil connector yang terlihat berisi issue #10 dan sepuluh PR; tidak ada judul kandidat yang cocok persis. Hasil itu bukan bukti bahwa seluruh sejarah issue/PR eksternal atau semua repositori sumber sudah terdeduplikasi.

Review ini tidak menjalankan test, build, aplikasi, migrasi, atau perubahan GitHub. Kode yang dibaca hanya dipakai untuk memastikan apakah kontrak yang diajukan sudah tersedia.

## Overlap yang perlu ditangani sebelum adopsi

### 1. ENG-002 mengulang sebagian validator TODO yang sudah ada

[M29-03/M29-04](../../planning/TASK_REGISTER_VALIDATOR.md) dan [validator yang ada](../../../scripts/planning/task-register-validator.mjs) sudah membaca baris TODO, menghitung task, menolak ID malformed/duplikat, memvalidasi dependensi, dan mencari siklus. ENG-002 kembali mengusulkan parser read-only serta acceptance untuk ID malformed/duplikat.

**Rekomendasi:** pertahankan hanya kebutuhan yang belum tercakup—membandingkan jumlah hasil TODO dengan referensi agregat aktif—dan jadikan itu ekstensi validator yang sama. Hapus parser/fixture ID kedua. Jangan jadikan `ENG-002` prasyarat ONT-001; validasi register tidak diperlukan untuk menetapkan profil identitas sumber.

### 2. ONT-009 bertumpang tindih dengan kontrak graph M10/M12

[Audit M10](../../../docs/audit/M10-ontology-identity.md) dan kode [moonql-ontology](../../../packages/moonql-ontology/src/index.ts) sudah memodelkan edge dengan sumber, perspektif, status epistemik, alasan, dan referensi bukti; status VERIFIED memerlukan reviewer, alasan, dan bukti. [M12-02](../../../TODO.md) dan [moonql-graph](../../../packages/moonql-graph/src/index.ts) menambahkan tipe kandidat, evidence frame/span/SHA, dan pencocokan SHA sumber.

**Rekomendasi:** ubah ONT-009 menjadi audit kesesuaian projection/UI terhadap kontrak yang ada. Sebutkan gap yang memang belum tertutup—misalnya pemisahan “hubungan langsung dari sumber” dengan “inferensi editorial”—dan larang penambahan enum/schema paralel tanpa gap bukti serta tinjauan owner.

### 3. FUT-003 beririsan dengan handoff dan approval yang sudah ada

[M40-08](../../../docs/audit/M40-08-approval-handoff.md) sudah menyediakan handoff ORBIT ke 100CENTER tanpa membuat jalur keputusan di ORBIT. [M41-08](../../../docs/audit/M41-08-approval-pause-resume.md) sudah memiliki adapter pause/resume dengan ikatan argumen, anti-replay, kedaluwarsa, dan pemeriksaan role. Hak keputusan UI/grant persisten tetap terikat pada M20/M37.

**Rekomendasi:** pertahankan FUT-003 hanya sebagai uji pemahaman/usability memakai kasus sintetis pada handoff read-only yang ada. Tambahkan pengecualian eksplisit terhadap UI/handoff M40-08 dan adapter M41-08; jangan membuat kartu approval kedua atau memberi prototipe otoritas. Dependensi `M20` juga terlalu luas—gunakan leaf/gate yang tepat atau nyatakan sebagai syarat integrasi nyata.

### 4. ONT-001/003/004 perlu membuktikan gap terhadap skema corpus yang ada

[M07-02](../../decisions/M07-02-corpus-identity-schema.md) sudah menetapkan hierarki work/edition/passage/translation dan provenance SHA. [M08-02/M08-04](../../../docs/audit/M08-reader-vertical-slice.md) sudah menampilkan identitas edition, sumber, hak, provenance SHA, tanggal, retrieval, dan citation yang dapat disalin. Model translation saat ini juga sudah memiliki language, translator, license, rights, dan edition. [M16-01](../../decisions/M16-01-private-witness-object-spec.md) mengadopsi vocabulary provenance BLUEPRINT, bukan enum paralel.

**Rekomendasi:** jadikan ONT-001/003 sebagai matriks gap terhadap skema M07/M08 saat ini. Untuk ONT-004, rumuskan pertanyaan sempit yang belum dijawab oleh citation ber-SHA—misalnya apa yang harus dilaporkan saat versi lama tidak lagi dapat diambil. Jangan menyusun ulang source identity, translation provenance, atau citation UI dari nol.

### 5. Kandidat berdekatan yang perlu batas hasil eksplisit

| Kelompok | Risiko overlap | Batas yang disarankan |
|---|---|---|
| ENG-015 / ENG-032 | Inventaris owner package dan peta onboarding dapat menghasilkan tabel owner yang sama. | ENG-015 menjadi sumber inventaris; ENG-032 hanya menyusun jalur/link onboarding dari sumber itu. |
| ENG-031 / ECO-006 | Keduanya menghitung biaya workload riset. | ENG-031 menyediakan satu baseline biaya operasi agregat; ECO-006 memodelkan rentang biaya per workflow dan asumsi support memakai baseline itu. |
| FUT-019 / FUT-026 / FUT-030 | Catatan lokal, export bundle, dan evidence bundle semua menyentuh manifest/export/checksum. | Tetapkan consumer, isi, format, dan kontrak tiap artefak. Jika FUT-026 memperluas export notebook, tambahkan FUT-019 sebagai blocker; jika tidak, bedakan namanya/tujuannya. FUT-030 perlu memakai ENG-016 untuk serialization canonical atau membatasi klaim ke hash byte fixture. |
| FUT-008 / FUT-025 / ONT-014 / FUT-009 | Navigator sumber, narasi jalur klaim, compare view, dan visualisasi uncertainty memakai permukaan UX serupa. | Bedakan pertanyaan riset dan acceptance tiap prototype; gunakan fixture sintetis bersama, bukan empat implementasi produk. |
| ECO-001 / ECO-002 / ECO-005 | Wawancara institusi dan organisasi riset dapat memakai responden/protokol yang sama. | Satu protokol consent/outreach dan satu kumpulan responden; pisahkan hipotesis demand, self-hosting, dan distribusi sebagai hasil analisis. |
| CHAR-003 / CHAR-004 / CHAR-007 / CHAR-010 | Role/RACI, dana terbatas, volunteer, dan complaint/escalation bersinggungan. | Gunakan satu peta peran/escalation; dokumen terpisah hanya untuk kontrol dana, batas volunteer, dan perlindungan pelapor. |
| ONT-011 / ONT-017 | Protokol source criticism dan protokol review interpretive summaries sama-sama meminta kompetensi, atribusi, dissent, dan batas review. | ONT-011 mengatur metode membaca sumber; ONT-017 mengatur pemeriksaan ringkasan. Bagikan vocabulary reviewer/conflict/dissent, jangan bentuk dua otoritas review. |
| ONT-004 / ONT-018 | Version resolution citation dan koreksi/withdrawal berbagi version history. | ONT-004 mengatur identitas versi yang dikutip; ONT-018 mengatur jenis koreksi, approver, pemberitahuan, retensi, dan rights withdrawal. |

## Temuan dependensi

### Dependensi milestone terlalu luas

Panduan validator [TASK_REGISTER_VALIDATOR.md](../../planning/TASK_REGISTER_VALIDATOR.md) menyatakan ID milestone `Mdd` berarti seluruh task dalam milestone itu. Sepuluh baris berikut memakai dependensi seperti itu:

| TODO | Dependensi milestone | Catatan cakupan |
|---|---|---|
| M46-08 | M16, M18, M19 | Audit log privacy; tentukan leaf policy/release yang benar-benar dibutuhkan. |
| M46-26 | M19 | Authorization matrix route; ganti dengan leaf M19/M27 yang overlap atau bukti bahwa seluruh M19 perlu selesai. |
| M47-03 | M20 | Mock approval tanpa keputusan nyata; scope menyebut authority gate eksternal, bukan seluruh M20. |
| M47-08 | M19 | Prototype sintetis; M19 disebut hanya untuk integrasi sumber nyata. |
| M47-23 | M20 | Mock disagreement; bedakan uji UX dari integrasi reviewer authority. |
| M50-02 | M16, M18 | Model konseptual dan contoh sintetis ikut terblokir gerbang konten nyata. |
| M50-04 | M18 | Spesifikasi citation version ikut terblokir milestone publikasi seluruhnya. |
| M50-14 | M19 | Compare view data sintetis ikut terblokir gate data nyata. |
| M50-17 | M20 | Protokol review diblokir seluruh milestone authority meski tidak membuat grant/UI. |
| M50-18 | M18, M19 | Prinsip koreksi ikut menunggu seluruh rights/publication milestones. |

**Rekomendasi:** gunakan dependensi leaf yang spesifik untuk blocker sungguhan. Pindahkan gerbang yang hanya berlaku pada penggunaan data nyata atau integrasi produksi ke “start conditions”/“external gate”; bila integrasi nyata memang scope, pisahkan sebagai task lanjutan. Jangan menghapus gate hak, consent, atau otoritas—buat cakupannya tepat.

### Blocker kandidat yang tampak tidak relevan atau terlalu dini

- **ONT-001 → ENG-002:** validator register bukan prasyarat identitas sumber.
- **FUT-005 → ENG-010:** inventaris header/CSP browser tidak memblokir benchmark model lokal di mesin developer sintetis.
- **FUT-004 → FUT-003:** mock human-approval tidak diperlukan untuk uji injeksi sumber sintetis yang tidak menjalankan tool.
- **FUT-016 → ENG-019/ENG-021:** prototype timeline statis/fiktif tidak melakukan object streaming atau shipping route bundle.
- **FUT-028 → FUT-021:** map client sekali pakai tidak memakai cache terenkripsi.
- **ONT-007 → FUT-009/FUT-027:** klasifikasi claim/evidence tidak perlu menunggu tampilan uncertainty atau simulator pelatihan reviewer; jadikan keduanya bahan konsultasi jika memang dibutuhkan. Gate M16-07 tetap berlaku sebelum projection.
- **CHAR-010 → CHAR-009:** complaint/incident pathway sebaiknya siap sebelum kontak program; tidak perlu menunggu rencana outcome measurement.
- **FUT-017 → ENG-018/ENG-020:** task menyebut baseline “jika tersedia”; nyatakan benchmark sebagai input opsional, kecuali analisis tidak dapat dimulai tanpa baseline tersebut.

Ini usulan untuk memeriksa/merapikan dependency, bukan perubahan yang sudah diterapkan.

### Relasi `enables` yang tidak didukung blocker

Delapan klaim ini tidak memiliki jalur blocker dari target kembali ke sumbernya: ENG-006→ENG-007, ENG-007→ENG-029, ENG-009→FUT-005/FUT-007, ENG-025→ENG-026, FUT-002→FUT-027, FUT-025→ONT-014, dan ONT-006→ONT-007. Ubah menjadi `related` jika hanya berbagi konteks. Jika memang wajib, tulis blocker yang dibutuhkan pada spesifikasi dan TODO.

## Perapian spesifikasi lintas portofolio

### Label ukuran dan estimasi hari tidak selaras

[ROADMAP_QA.md](ROADMAP_QA.md) mendefinisikan XS 0,5–1; S 2–4; M 5–10; L 11–20; XL 21–40 person-days. Sebanyak 97 spesifikasi memberi rentang hari yang berada di luar band labelnya. Tiga lainnya berada dalam band secara angka; satu spesifikasi (`ECO-001`) menulis “researcher days” dan perlu dinormalisasi ke satuan yang sama. Angka hari pada TODO cocok dengan teks estimasi masing-masing spesifikasi; masalah utamanya adalah band label pusat.

**Rekomendasi:** pilih satu skala—ubah label ukuran tiap issue agar sesuai dengan rentang hari yang dimaksud, atau revisi rentang hari agar sesuai label roadmap. Tetapkan apakah unitnya hari-orang kerja, waktu elapsed, atau estimasi peneliti termasuk review eksternal. Jangan mengubah angka tanpa peninjauan owner.

### Klaim snapshot “current HEAD” sudah tertinggal

README paket dan ENG-001 masih menyebut ad96dbf sebagai HEAD terkini. Pada baseline review, HEAD adalah `1074b526…`; TODO pada HEAD berisi 493 ID (336 checked/157 open). Working tree TODO memuat 494 ID (336/158) karena penambahan M19-36 yang belum masuk HEAD. Keseluruhan 100 kandidat V5 masih unchecked di HEAD dan worktree. Labeli dua snapshot itu secara terpisah; hitung ulang pada saat ENG-001 dikerjakan.

**Pemeriksaan ulang setelah snapshot review:** branch tetap `dev`, tetapi HEAD telah maju ke `9975fae` (`feat(journey): make the consent scopes an audience contract and close M23-02`). TODO di HEAD sekarang berisi 493 task (337 checked/156 open); TODO worktree berisi 502 baris task (337/165). Semua 100 task V5 tetap unchecked, dan 100 sel dependensi packet masih cocok dengan TODO worktree. Angka awal di atas adalah snapshot saat review dimulai; perubahan setelahnya tidak mengubah kesimpulan status V5.

### Detail lain

- ENG-006 sebaiknya membandingkan kontrak error ARSY terhadap [M05-01](../../../TODO.md) terlebih dahulu; hasil no-gap harus menjadi hasil penutupan yang sah, bukan alasan membuat envelope kedua.
- ENG-024 harus merekonsiliasi bukti Cockpit yang sudah ada di M19-04 dan WIP saat mulai; implementasi baru memerlukan failure yang dapat direproduksi.
- ENG-002 menyebut “planning checks” sebagai output tanpa mendefinisikan check yang mengonsumsi hasilnya; tetapkan satu command/consumer atau hilangkan klaim integrasi.
- Untuk tugas yang menjadi no-go bila gap tidak ditemukan, cantumkan secara konsisten bahwa audit tanpa perubahan merupakan hasil sukses yang dapat diterima.

## Hasil pemeriksaan statis

- 100 kandidat dan 100 matriks/paket terpetakan; tidak ada ID/title duplikat persis di antara kandidat.
- Seluruh 100 spesifikasi memiliki 22 bagian bernomor dan setiap packet menautkan satu spesifikasi domain.
- 100 packet dependency cells cocok dengan TODO saat ini; blocker issue spec cocok dengan ROADMAP; graf blocker tanpa siklus.
- Semua target tautan file lokal yang diperiksa ditemukan. Tidak ada test/build dijalankan.
- Checkbox TODO, kode, dan issue/PR GitHub tidak diubah oleh review ini.

## Urutan koreksi yang disarankan

1. Rapikan ENG-002, ONT-009, FUT-003, dan ONT-001/003/004 terhadap artefak yang sudah ada.
2. Ganti dependensi milestone yang terlalu luas dengan leaf/gate spesifik, lalu koreksi 8 relasi `enables`.
3. Selesaikan batas output pada kelompok overlap dan selaraskan skala effort.
4. Segarkan snapshot baseline dan jalankan ulang dedupe sebelum kandidat dipromosikan atau issue GitHub dibuat.
