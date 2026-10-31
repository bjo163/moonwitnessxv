# Roadmap, Korelasi, Risiko, dan Penjaminan Mutu

## Penemuan dan seleksi kandidat

Kandidat berasal dari konflik dokumentasi yang terlihat, batas paket yang sudah ada, pengecualian terhadap TODO terbuka, peluang berbasis standar, dan hipotesis terbatas. Seleksi mempertahankan pekerjaan dengan satu pemilik/hasil, dapat dievaluasi tanpa mengarang pengguna/bukti, dan menghormati kontrak domain. Konsep yang membuat Hub, identity provider, SQL owner, agent orchestrator, payment ledger, donation ledger, ontology owner, object storage, atau aplikasi komunitas duplikat ditolak/ditunda.

Repositori terkait hanya diperiksa pada tingkat README. Beberapa konsep/prototipe historis mungkin tumpang tindih; tidak ada yang dianggap instruksi implementasi. Ditunda juga: aksi agent otonom tanpa batas; jawaban agama yang dinyatakan sebagai kebenaran; token/marketplace serbaguna; profil donor/penerima yang publik; pemeringkatan agama; penargetan kemanusiaan prediktif; ingest corpus privat tanpa consent; dan produksi spatial world penuh. Bukti belum ada atau risikonya terlalu tinggi.

## Tinjauan adversarial enam lapis

| Tinjauan | Tantangan | Respons portofolio | Risiko tersisa |
|---|---|---|---|
| Engineering | Kebanyakan defect runtime tidak direproduksi; audit yang diusulkan bisa menjadi pekerjaan tanpa manfaat. | Tidak ada bug disebut terkonfirmasi selain konflik dokumen/lookup; hipotesis boleh berakhir no-go. | Review kode dan bukti test penuh belum dilakukan. |
| Inovasi | AI sitasi, graph, catatan offline, spatial UX dan simulasi bukan konsep baru secara umum. | Tidak mengklaim novelty; tiap konsep dibatasi pada kontrak MoonWitness, data sintetis dan kriteria berhenti. | Belum ada tinjauan literatur/survei produk sistematis. |
| Ekonomi | Wawancara dan harga hipotetis bukan bukti willingness-to-pay atau margin. | Pisahkan minat dan kewenangan membeli; tidak ada klaim harga/pendapatan; hormati M35. | Sampel institusi dan input biaya tidak tersedia. |
| Charity | Protokol bisa tetap eksploitatif; standar laporan tidak membuktikan kebutuhan/kepatuhan lokal. | Tidak mengusulkan kontak penerima, donasi, atau peluncuran program; partner, safeguarding, dan legal jadi gerbang. | Tidak ada pakar/partner kemanusiaan lokal yang meninjau paket ini. |
| Ontology | Kategori/provenance dapat menyisipkan worldview atau terlihat membuktikan klaim metafisik. | Atribusikan klaim/tradisi; pertahankan contested/unknown; contoh sintetis; review sarjana sebelum konten. | Tidak ada kajian teks agama primer atau sumber sarjana primer. |
| Arsitektur ekosistem | Konsep bersama bisa menduplikasi ARSY, ECHOLOG, TODO, atau kandidat lain. | Tetapkan pemilik canonical; kecualikan scope TODO; hindari SQL/identity/storage owner baru; dedupe sebelum adopsi. | Pencarian connector bukan audit penuh GitHub; sebagian relasi perlu review pemilik. |

Risiko tersisa adalah alasan mempertahankan status proposed dan batas confidence, bukan alasan menyebut audit ini lengkap.

## Deduplikasi dan rekonsiliasi

1. Membandingkan kandidat dengan 65 entri TODO terbuka, terutama M16–20, M23, M27–28, M32–36, M44–45. Tidak ada kandidat untuk menutup, menggantikan atau mengimplementasikan scope itu.
2. Mencari pada view connector GitHub yang tersedia. Query riset mengembalikan satu issue (#10) dan sepuluh record PR; state PR tidak tersedia pada hasil tersimpan, sehingga status open/closed tidak disimpulkan. Cakupan itu tidak membuktikan semua kandidat unik atau seluruh riwayat. Issue #10 adalah governance/evidence context, bukan kandidat baru.
3. Membandingkan 100 kandidat berdasarkan pemilik canonical dan otoritas data. Tiap issue mencantumkan ID terkait dan pengecualian. Fondasi bersama (label bukti, evaluasi provenance, aksesibilitas, akuntansi biaya) memiliki satu kandidat utama; pemakai domain menggunakannya ulang.
4. Mengecek ADR-0006 SKYLINK, ADR-0007 ECHOLOG, batas ARSY Hub, hak/publikasi D01/D06/D08, dan TODO pembayaran/komunitas. Konflik dokumen dicatat, tidak disembunyikan.

Sebelum issue diadopsi, ulangi dedupe terhadap TODO saat ini, seluruh issue/PR terbuka dan tertutup, serta branch state terbaru. Body issue yang siap pakai bukan otorisasi implementasi.

## Peta kontrak bersama

| Kapabilitas bersama | Pemilik canonical | Kandidat | Batas |
|---|---|---|---|
| API domain dan catatan lintas aplikasi | ARSY / paket MoonQL pemilik | ENG-011–015, FUT-001–007, ONT-006–010 | Aplikasi tetap menjadi konsumen; jangan menambah pemilik SQL ketiga. |
| Lampiran objek | ECHOLOG sesuai ADR-0007 | ENG-019–021, FUT-016, ONT-004 | Hanya penyimpanan; tanpa tabel atau kewenangan hak. TODO yang ada tetap menjadi acuan. |
| Kontrol agent | AI Gateway yang ada / batas pemanggil yang disetujui | ENG-009, FUT-001–007, FUT-023 | Tidak ada tindakan otonom terkait keuangan, publikasi, hak, atau moderasi. |
| Ontologi dan klaim sumber | Pemilik ontologi/corpus/riset MoonQL yang ada | FUT-008–015, ONT-001–020 | Catatan beratribusi, bukan otoritas teologis. |
| Akses pengguna, persetujuan, proyeksi publik | Kontrak D00/D01/D06/D08 dan pemilik yang disetujui | ENG-008, ONT-002–005, ONT-017 | Tanpa publikasi atau akses sumber privat di luar kewenangan yang ada. |
| Akuntansi komersial | Pemilik belum ditetapkan; M35 masih terbuka | ECO-001–008 | Tidak mengusulkan ledger pembayaran atau pencampuran dana donasi. |
| Program amal dan dana terbatas | Operator yang akuntabel belum diverifikasi; M32 masih terbuka | CHAR-001–010 | Hanya discovery dan tata kelola sampai entitas penanggung jawab tersedia. |
| Bukti dan evaluasi | Paket pemilik; tanpa layanan bukti global baru | ENG-001–007, FUT-001–030, ONT-001–020 | Gunakan ulang skema/registry sempit hanya setelah pemetaan diputuskan. |

## Matriks dependensi dan korelasi

“—” berarti tidak ada dependensi penghambat yang teridentifikasi saat perencanaan. ID terkait hanya memberi konteks dan bukan prasyarat. Tidak ada dependensi melingkar yang direncanakan. `OUTSIDE` menandai gerbang TODO yang sudah ada dan perlu direkonsiliasi lebih dahulu, bukan ID issue baru.

| ID | Terblokir oleh | Memungkinkan / terkait |
|---|---|---|
| ENG-001 | — | ENG-002 |
| ENG-002 | ENG-001 | ENG-032 |
| ENG-003 | — | ENG-004 |
| ENG-004 | ENG-003 | FUT-022 |
| ENG-005 | — | ONT-001, ONT-002, ENG-016 |
| ENG-006 | — | ENG-007, ENG-012 |
| ENG-007 | — | ENG-029, ENG-003 |
| ENG-008 | OUTSIDE: M16/M18/M19 | ONT-017 |
| ENG-009 | — | FUT-001–007 |
| ENG-010 | OUTSIDE: M44-08, Deployment approval | FUT-005 |
| ENG-011 | — | OUTSIDE: M27 release process |
| ENG-012 | ENG-006, ENG-009 | FUT-001 |
| ENG-013 | — | ENG-014 |
| ENG-014 | ENG-013 | FUT-018 |
| ENG-015 | — | FUT-015, ONT-006 |
| ENG-016 | ENG-002 | ONT-001, ONT-003 |
| ENG-017 | — | ENG-020 |
| ENG-018 | — | FUT-017 |
| ENG-019 | — | FUT-016 |
| ENG-020 | — | FUT-017, ONT-009 |
| ENG-021 | — | ENG-024, FUT-017 |
| ENG-022 | OUTSIDE: Orbit WIP reconciliation | — |
| ENG-023 | OUTSIDE: Sentinel WIP reconciliation | — |
| ENG-024 | OUTSIDE: Cockpit WIP reconciliation | ENG-021 |
| ENG-025 | — | ENG-026 |
| ENG-026 | OUTSIDE: M19 scope review | ENG-008 |
| ENG-027 | CI history access | ENG-028 |
| ENG-028 | ENG-027 | ENG-032 |
| ENG-029 | ENG-004, ENG-008 | ENG-030 |
| ENG-030 | ENG-008 | ENG-029 |
| ENG-031 | Aggregate cost data | ECO-005, ECO-006 |
| ENG-032 | — | ENG-001, ENG-028 |
| FUT-001 | ENG-009, ENG-012 | FUT-002, FUT-003 |
| FUT-002 | FUT-001 | FUT-006, FUT-027 |
| FUT-003 | FUT-001, ENG-009, OUTSIDE: M20 | FUT-004, FUT-007 |
| FUT-004 | FUT-001, FUT-003 | FUT-006 |
| FUT-005 | ENG-010 | FUT-007 |
| FUT-006 | FUT-002, FUT-004 | ONT-003 |
| FUT-007 | FUT-005 | FUT-003 (related) |
| FUT-008 | OUTSIDE: M19 gate for real sources | FUT-009, FUT-014 |
| FUT-009 | FUT-008 | FUT-010, ONT-007 |
| FUT-010 | FUT-008, OUTSIDE: publication gate before real content | FUT-009 |
| FUT-011 | Rights approval for any non-synthetic asset | ENG-022, ENG-024 |
| FUT-012 | — | — |
| FUT-013 | ENG-020 | ONT-009 |
| FUT-014 | — | ONT-009 |
| FUT-015 | ENG-015 | ONT-006 |
| FUT-016 | ENG-019, ENG-021, OUTSIDE: M33-05 | — |
| FUT-017 | ENG-018, ENG-020 | — |
| FUT-018 | ENG-014 | ONT-006 |
| FUT-019 | — | FUT-020, FUT-030 |
| FUT-020 | FUT-019 | FUT-030 |
| FUT-021 | FUT-019 | FUT-030 |
| FUT-022 | ENG-004 | — |
| FUT-023 | FUT-003, OUTSIDE: M20 | — |
| FUT-024 | OUTSIDE: M23-03/M23-05 scope review | CHAR-006 |
| FUT-025 | FUT-014 | ONT-011, ONT-014 |
| FUT-026 | FUT-015, ENG-016 | ONT-004 |
| FUT-027 | FUT-023 | ONT-007 |
| FUT-028 | FUT-013, FUT-021 | ONT-009 |
| FUT-029 | FUT-014 | CHAR-001 |
| FUT-030 | FUT-019 | ENG-016 |
| ECO-001 | OUTSIDE: M35-01 | ECO-002 |
| ECO-002 | ECO-001, OUTSIDE: M35-01/M35-02 | ECO-003 |
| ECO-003 | ECO-001, ECO-002, OUTSIDE: M35-02 | ECO-004 |
| ECO-004 | OUTSIDE: M35-02 | CHAR-003, CHAR-004 |
| ECO-005 | ECO-001, outreach approval | — |
| ECO-006 | ECO-001, ECO-002, ENG-031 | ECO-007 |
| ECO-007 | ECO-006 | CHAR-004 |
| ECO-008 | ECO-004, OUTSIDE: M17-06/M18-02/M35-02 | — |
| CHAR-001 | OUTSIDE: M32-01 | CHAR-002 |
| CHAR-002 | CHAR-001 | — |
| CHAR-003 | Accountable operator identified | CHAR-004, CHAR-007 |
| CHAR-004 | CHAR-003 | CHAR-005 |
| CHAR-005 | CHAR-004 | CHAR-006 |
| CHAR-006 | CHAR-005 | CHAR-010 |
| CHAR-007 | CHAR-003 | CHAR-008 |
| CHAR-008 | CHAR-007 | — |
| CHAR-009 | CHAR-001, CHAR-003 | CHAR-010 |
| CHAR-010 | CHAR-003, CHAR-007, CHAR-009 | — |
| ONT-001 | ENG-002, ENG-005 | ONT-002 |
| ONT-002 | ONT-001, OUTSIDE: M16/M18 | ONT-003 |
| ONT-003 | ONT-001, ONT-002 | ONT-013, FUT-006 |
| ONT-004 | ONT-001, OUTSIDE: M18 public-citation gate | — |
| ONT-005 | ONT-001 | ENG-005 |
| ONT-006 | ENG-015, FUT-015 | ONT-007 |
| ONT-007 | FUT-009, FUT-027, OUTSIDE: M16-07 | ONT-008 |
| ONT-008 | ONT-007 | ONT-009, FUT-023 |
| ONT-009 | ENG-020, ONT-008 | ONT-010 |
| ONT-010 | ENG-012, ONT-009 | — |
| ONT-011 | ONT-001, ONT-007 | ONT-012, FUT-008 |
| ONT-012 | ONT-011 | FUT-023 |
| ONT-013 | ONT-003, ONT-011 | FUT-006 |
| ONT-014 | FUT-008, OUTSIDE: M19 gate | — |
| ONT-015 | ONT-001, ONT-007 | FUT-008 |
| ONT-016 | ONT-011, ONT-012 | — |
| ONT-017 | ONT-011, ONT-012, OUTSIDE: M20 authority review | ONT-018 |
| ONT-018 | ONT-004, ONT-017, OUTSIDE: M18/M19 | — |
| ONT-019 | ONT-001, ONT-011 | ONT-020 |
| ONT-020 | ONT-019 | FUT-025 |

## Gelombang roadmap yang diusulkan

Ini adalah gelombang perencanaan, bukan milestone TODO baru. Gerbang TODO yang ada dan persetujuan maintainer tetap mengatur pelaksanaan.

| Gelombang | Tujuan | Kandidat | Gerbang |
|---|---|---|---|
| W0 — Rekonsiliasi bukti | Benahi hitungan, pernyataan kematangan, pin, tumpang tindih issue, dan pemilik. | ENG-001–005, ONT-001 | Maintainer mengonfirmasi sumber acuan dan referensi persis; implementasi tidak diasumsikan. |
| W1 — Kontrak dan baseline | Tetapkan skema, API, baseline pengujian/pengukuran, serta cakupan aksesibilitas. | ENG-006–021, ENG-025–032; ONT-002–010 | Tidak berbenturan dengan M16–20, M27, M33, M44; tinjauan teknis sesuai cakupan. |
| W2 — Prototipe riset terbatas | Uji hipotesis AI, HCI, local-first, dan interaksi pengetahuan. | FUT-001–030; ONT-011–016 | Corpus sintetis/berizin, batas waktu jelas, kriteria berhenti, dan peninjau manusia. |
| W3 — Discovery kebutuhan dan nilai | Validasi asumsi komunitas, ekonomi, dan program tanpa transaksi. | ECO-001–008; CHAR-001–010 | Keputusan pemilik M35/M32, persetujuan, safeguarding, serta tinjauan legal dan keuangan. |
| W4 — Implementasi opsional yang disetujui | Promosikan hanya kandidat yang berhasil ke TODO dengan pemilik, dependensi, dan hak yang jelas. | Hanya subset terpilih | Persetujuan eksplisit pemilik; rekonsiliasi TODO; otorisasi implementasi terpisah. |

## Peringkat strategis (hanya 100 ID yang sama)

Urutan ini adalah saran untuk peninjauan, bukan pengukuran objektif. Matriks utama memuat enam input skor bersama untuk setiap issue. Hitung skor bersama dengan pembulatan menjauhi nol dari 10 × (0,20U + 0,20V + 0,20A + 0,15R + 0,15D + 0,10E), setara dengan 2U + 2V + 2A + 1,5R + 1,5D + E. Setiap input bernilai 0–10. U dimulai dari 10/8/6/4 untuk P0/P1/P2/P3, lalu disesuaikan +2 untuk risiko Kritis, +1 Tinggi, −1 Rendah, dan dibatasi pada 0–10. V adalah proksi yang dibatasi bukti: 6 untuk ekonomi/amal atau moonshot P3, 8 untuk P1 di domain lain, selebihnya 7. A bernilai 7 untuk P3 dan 9 untuk lainnya. R bernilai 8/6/4 untuk confidence Tinggi/Sedang/Rendah. D bernilai 5 tanpa kandidat yang bergantung, 7 jika ada satu, 8 untuk dua, 9 untuk tiga, dan 10 untuk empat atau lebih kandidat yang daftar penghambatnya menyebut issue ini. E bernilai 10/9/7/5/3 untuk XS/S/M/L/XL. Semua ini adalah heuristik perencanaan eksplisit, bukan nilai pengguna atau probabilitas delivery yang diukur secara independen; cakupan riset yang rendah dapat mengubah hasil secara berarti. Skor domain memakai pertimbangan khusus tiap domain dan tidak dapat dibandingkan lintas domain.

Untuk skor khusus domain, lensa yang dipakai adalah: engineering—risiko terverifikasi, keandalan, dan kemudahan perbaikan; frontier—mutu hipotesis, kelayakan teknis, dan nilai pembelajaran; ekonomi—bukti pembeli, kejelasan nilai, dan ketidakpastian biaya; amal—bukti kebutuhan, martabat, safeguarding, dan akuntabilitas; iman/ontologi—ketertelusuran sumber, atribusi, ketidakpastian, dan integritas interpretasi. Skor hanya perkiraan komparatif untuk triase; bukan probabilitas atau ukuran hasil.

- **Top 15 engineering review priorities:** ENG-001, ENG-002, ENG-003, ENG-005, ENG-006, ENG-007, ENG-008, ENG-009, ENG-011, ENG-012, ENG-013, ENG-014, ENG-016, ENG-025, ENG-032.
- **Top 15 frontier investigations:** FUT-001, FUT-002, FUT-003, FUT-006, FUT-008, FUT-011, FUT-015, FUT-016, FUT-018, FUT-019, FUT-021, FUT-023, FUT-025, FUT-027, FUT-030.
- **Top 10 cross-domain multipliers:** ENG-001, ENG-009, ENG-012, ENG-015, FUT-001, FUT-003, FUT-015, ONT-001, ONT-006, ONT-017.
- **Top 10 quick wins (subject to TODO reconciliation):** ENG-001, ENG-002, ENG-003, ENG-005, ENG-006, ENG-013, ENG-025, ONT-001, ECO-001, CHAR-001.
- **Top five moonshots:** FUT-019, FUT-021, FUT-024, FUT-028, FUT-030.
- **Top five economy discovery opportunities:** ECO-001, ECO-002, ECO-005, ECO-007, ECO-008.
- **Top five charity discovery opportunities:** CHAR-001, CHAR-002, CHAR-005, CHAR-008, CHAR-010.
- **Top ten faith/ontology foundations:** ONT-001–ONT-010.

## Biaya, kompleksitas, dan keberlanjutan

Label upaya menunjukkan rentang hari-orang: XS 0,5–1; S 2–4; M 5–10; L 11–20; XL 21–40. Ketidakpastian lebih tinggi untuk riset dan tata kelola. Angka ini perkiraan perencanaan, bukan penawaran biaya. Upaya riset dijelaskan di body issue. Paket ini tidak membenarkan pembelian infrastruktur berulang. Eksperimen AI perlu batas token per run, data uji lokal/sintetis, dan kondisi berhenti; anggaran AI cloud tidak diasumsikan. Pekerjaan spatial atau simulasi sebaiknya memakai prototipe sementara dan dihentikan bila bukti pengguna lemah. Biaya legal, keamanan, dukungan, dan audit untuk amal, pembayaran, serta penyimpanan belum dihitung; tidak ada asumsi pengimbang pendapatan.

## Register risiko dan tata kelola

| Risiko | Bukti/status | Mitigasi / gerbang pemilik |
|---|---|---|
| Source pin disalahartikan sebagai konten terverifikasi atau berlisensi | Kegagalan lookup terkonfirmasi; penyebab dan hak UNKNOWN. | Pertahankan referensi persis, wajibkan SHA penuh dan metadata hak; jangan impor/publikasikan. |
| Dokumen proyek melebih-lebihkan kapabilitas yang sudah diterapkan | Konflik pernyataan M38–40 dan jumlah terkonfirmasi. | TODO menjadi acuan status, SHA rilis persis, paket bukti yang dapat direproduksi. |
| AI mengarang/melebih-lebihkan klaim atau bertindak otonom | Risiko umum didukung NIST/OWASP; dampak pada proyek masih prospektif. | Output tertaut sitasi, abstain, persetujuan, tanpa pemanggilan tool berdampak dalam PoC. |
| Data saksi privat atau pengguna rentan terekspos | Batas persetujuan/hak yang ada; tidak ada insiden baru yang dinyatakan. | Data sintetis/berizin, minimisasi, tinjauan akses, gerbang D06/D08 yang ada. |
| Dana komersial atau terbatas tercampur | Pemilik operasional atau ledger belum terverifikasi. | Sistem transaksi di luar cakupan; jika kelak disetujui, pisahkan operator akuntabel dan catatan. |
| Pelaporan amal menyiratkan dampak tanpa bukti | Bukti penerima/hasil belum terverifikasi. | Pengumpulan berbasis persetujuan, umpan balik independen, evaluasi mengacu OECD/CHS; jangan mengklaim kepatuhan. |
| Klaim keagamaan menghapus perbedaan atau menyiratkan otoritas | Tinjauan teks primer belum dilakukan. | Atribusikan tradisi, penulis, edisi, terjemahan, dan status kontroversi; minta tinjauan ahli sebelum rilis. |
| Layanan bersama baru menduplikasi ARSY/ECHOLOG/SKYLINK | Batas arsitektur telah dinyatakan. | Gunakan kembali pemilik canonical; tolak pemilik SQL atau identity tambahan. |
| Biaya operasional melampaui nilai | Baseline biaya belum tersedia. | Eksperimen terbatas, ukur biaya per tugas, gunakan gerbang lanjut/berhenti. |

## Crosswalk kanonik dan urutan mulai

Semua kandidat sudah didaftarkan sebagai unchecked TODO leaves: ENG-001..032 ↔ M46-01..32; FUT-001..030 ↔ M47-01..30; ECO-001..008 ↔ M48-01..08; CHAR-001..010 ↔ M49-01..10; ONT-001..020 ↔ M50-01..20. [Matriks](ISSUE_MASTER_MATRIX.md) mencantumkan ID TODO pada setiap baris. Dependensi graf memakai V5 ID; gunakan kolom TODO ID untuk mengurutkan tugas. Gate pemilik, M21/M32/M35, rights/consent, akses dan otorisasi manusia tetap berlaku. Semua 100 tambahan tetap unchecked.

## Batch pelaksanaan pertama yang disarankan

Mulai triase dari M46-01..05 (ENG-001..005) dan M50-01 (ONT-001), setelah membaca packet/dependencies dan memeriksa keadaan aktual. Pendaftaran tidak menyatakan tugas aman diterapkan atau mengizinkan implementasi. ECO-001 dan CHAR-001 memerlukan cakupan M35/M32, review operator dan otorisasi sebelum kontak/pengumpulan data. FUT-001 hanya dapat diprototipekan dengan fixture sintetis setelah batas AI Gateway/tool dan M21 disahkan. Semua mulai unchecked; eksekusi mengikuti authorization contract.

## Sertifikat integritas portofolio

- [x] Alokasi persis ditentukan: 32 / 30 / 8 / 10 / 20 = 100 ID.
- [x] Setiap ID memiliki satu domain dan subdomain utama canonical; body lengkap issue muncul tepat di satu file domain.
- [x] Batas confidence bukti dan kematangan terlihat; tidak diklaim ada test/build atau deployment yang dijalankan.
- [x] Cluster TODO terbuka dan batas arsitektur yang ada disebut; tidak ada klaim menggantikannya secara langsung.
- [x] Traction komersial, penerima manfaat, donasi, dampak kemanusiaan, kebenaran doktrin, dan lisensi sumber tidak dikarang.
- [x] Dependensi dirancang tanpa siklus; setiap body mencantumkan ID issue persis atau gerbang TODO yang sudah ada.
- [x] Biaya dan upaya dinyatakan sebagai perkiraan; ukuran memerlukan baseline sebelum klaim dibuat.
- [ ] Deduplikasi global terhadap semua issue aktif/tertutup dan riwayat sumber lengkap repositori terkait belum terverifikasi.
- [ ] Target cakupan riset eksternal (paper, audit source code, kasus produk, sumber agama primer) belum tercapai dan harus dituntaskan sebelum keputusan implementasi ber-confidence tinggi.

Ini adalah sertifikat perencanaan riset dengan cakupan terbatas, bukan jaminan kelengkapan atau kebenaran. Butir yang belum dicentang merupakan batas material dan harus tetap terlihat.

