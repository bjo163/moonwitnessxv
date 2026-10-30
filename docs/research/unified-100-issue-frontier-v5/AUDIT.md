# Audit Repositori, Arsitektur, dan Domain

**Batas bukti:** 2026-10-30. Temuan membedakan isi dokumen repositori dari perilaku yang dijalankan. Lihat [Sumber Riset](RESEARCH_SOURCES.md) untuk referensi dan batas pemeriksaan.

## Status repositori dan batas inspeksi

Sebelum penulisan, branch aktif adalah dev pada HEAD d9e2ca4b579ba7028e6e4830c090d556c44d74f5. git status --porcelain memiliki 84 entry yang sudah berubah/untracked; statusnya direkam di luar repositori. File paket ini adalah penambahan yang dimaksud. Penulisan paket tidak melakukan branch switch, commit, push, perubahan TODO/kode, atau mutasi GitHub.

Pada pemeriksaan akhir 2026-10-30 08:27 +07:00, branch masih dev dan HEAD terlihat di ea40e5cee759fdedddb69570eda1e103027c264b (commit terbaru tercatat 2026-10-30T08:27:22+07:00). Riwayat/snapshot berubah setelah pencatatan awal; perubahan itu bukan commit dari penulisan paket ini. WIP lain di worktree tetap dipertahankan.

Saat pencatatan, dev lokal cocok dengan origin/dev pada HEAD tersebut. origin/main berada di b4b655f19795cbeef7dbddb6fd08ad75b84a8fd0; main lokal dilaporkan 121 commit di belakang remote. Ini observasi read-only sesaat, bukan tindakan atau permintaan sinkronisasi. Tampilan status GitHub memberi konteks check yang terbatas dan tidak membuktikan CI penuh berhasil.

Command discovery melaporkan Node 24.22.1 dan pnpm 10.33.4, sesuai manifest root Node >=24 <25 dan pnpm@10.33.4. Hanya pencarian/perincian perintah yang dijalankan; tidak ada build atau test.

Worktree awal sangat kotor, termasuk perubahan UI, accessibility, media, dan M19. Perubahan lokal tidak dianggap sebagai rilis atau status canonical, dan audit ini tidak mengusulkan implementasi kedua pada file-file aktif tersebut. Audit bersifat dokumenter dan selektif; bukan security review menyeluruh, audit source menyeluruh, atau attestation deployment.

## Inventaris komponen dan kematangan yang terlihat

Aplikasi yang tercantum dalam dokumen/source meliputi ARSY (Hub/API), Cockpit, Dock, Headquarters, Orbit, Sentinel, AI Gateway, SKYLINK, ECHOLOG, Empire Web, dan LUMEN Runtime. Paket bersama mencakup MoonQL corpus, witness, research, ontology, graph, UNILEX, serta MoonUI. Ini inventaris jalur dokumentasi/source, bukan klaim bahwa seluruh aplikasi live atau lengkap.

| Klasifikasi saat audit | Contoh dan bukti | Yang tidak dibuktikan |
|---|---|---|
| Lengkap/terverifikasi dalam audit ini | Tidak ada fitur runtime yang secara independen dinyatakan lengkap dan terverifikasi oleh audit ini. | Tidak menyangkal bukti TODO yang tercatat terpisah. |
| Dicentang di TODO tetapi bahasa status berbeda | Baris M38–M40 dicentang; README/APPS/dokumen layanan/root guidance berbeda. | Tidak menyimpulkan kode tidak ada atau rusak. |
| Scaffold/parsial menurut root atau arsitektur | SKYLINK health skeleton; LUMEN worker/kontrak dengan registry dev=false; ORBIT shell/fixture. | Bukan bukti layanan deployed, manfaat pengguna, atau readiness. |
| Batas layanan yang ada | ECHOLOG adalah object storage/attachments stateless tanpa tabel sendiri sesuai keputusan. | Tidak membuktikan endpoint S3 aktif di suatu lingkungan. |
| Terbuka/direncanakan | M32, M35, M36 menunggu bukti kebutuhan/buyer/site; M16–20 memuat pekerjaan hak/reviewer/publikasi. | Tidak ada komunitas, buyer, penerima, merchant atau lokasi yang diasumsikan. |
| Rusak/deprecated | Tidak ada yang direproduksi atau diklasifikasikan oleh audit ini. | Tidak ditemukannya reproduksi bukan sertifikasi keamanan/kebenaran. |
| Belum diketahui | Readiness end-to-end, seluruh host deployment, status full suite, riwayat lengkap repositori terkait. | Semua tetap gap bukti. |

## Peta arsitektur dan kepemilikan

| Kapabilitas | Batas canonical yang didukung repositori | Aturan paket V5 |
|---|---|---|
| Hub/API dan data domain bersama | ARSY adalah Hub dan pemilik API/data bersama. | Jangan menambah Hub, identity owner, atau pemilik data serbaguna lain. |
| SKYLINK | ADR-0006 diterima; root guidance menyebut M38-07 health skeleton. | Jangan menyatakan messaging, identity, model catalog, atau SQL owner baru sudah ada. Riset protokol tidak boleh berubah menjadi implementasi. |
| ECHOLOG | ADR-0007 diterima; layanan object storage/attachments tanpa tabel sendiri. | Gunakan kontraknya; jangan jadikan ECHOLOG pemilik SQL atau buat storage service duplikat. |
| LUMEN | Worker/runtime scaffold dan kontrak didokumentasikan; app registry menyebut tidak ada dev server. | Runtime readiness UNKNOWN sampai ada bukti; jangan membuat orchestrator kedua. |
| Paket domain MoonQL | Paket corpus, ontology, witness, research, graph, UNILEX dan lainnya ada. | Perluas paket pemilik setelah tinjau kontrak; jangan buat ontology/provenance owner duplikat. |
| Aplikasi | Cockpit, Dock, Headquarters, Orbit, Sentinel, Empire Web, AI Gateway, SKYLINK, ECHOLOG dan aplikasi lain memiliki peran terdokumentasi. | Pakai aplikasi/komponen yang ada; jangan buat aplikasi baru untuk demo konsep. |
| Hak dan publikasi | D01/D06/D08, ADR dan TODO mengatur hak, consent, reviewer dan publikasi. | Jangan membuka proyeksi publik, mengimpor sumber privat, atau menyiratkan izin publikasi. |
| Akuntansi komersial dan amal | TODO masih menyisakan buyer, merchant/payment, Treasury, dan bukti program/donasi. | Pisahkan pendapatan komersial dari dana amal terbatas; tidak ada payment, penerima, atau klaim dampak tanpa pemilik dan bukti. |

## Status dan perbedaan bukti

### Konflik dokumentasi yang terverifikasi

1. **Jumlah task berbeda.** README menyebut 43 milestone/362 ID; GRANULARITY_AUDIT menyebut 311; TODO menyebut 46 milestone/393 ID unik. Kebijakan repo memberi TODO kewenangan status. Ini inkonsistensi dokumentasi, bukan bukti defect eksekusi.
2. **Bahasa kematangan M38–M40 berbeda.** README menyebut implementation gate terbuka; TODO menandai M38 (14/14), M39 (12/12), dan M40 (10/10) selesai; APPS/dokumen layanan memberi deskripsi lain. Root guidance menyebut SKYLINK baru health skeleton dan ECHOLOG layanan stateless. Bukti saling berbeda; tidak ada kesimpulan readiness.
3. **Resolusi source pin belum diketahui.** M06-01 mencatat pin repo. Lookup connector untuk bjo163/allah-hub mendapat 404; beberapa ref singkat c0a8f1e72b4d912a dan 5d820b17fa11c039 tidak ditemukan sebagai commit. Ini hanya membuktikan kegagalan lookup tersebut; repo/objek belum tentu tidak ada. Jangan ubah pin lama atau gunakan konten sebelum memperoleh ref penuh dan status hak.
4. **LUMEN scaffold bukan bukti runtime.** Dokumen menyebut worker scaffold/kontrak; registry app menyatakan dev=false; test worker lokal tersedia. Ini mendukung klarifikasi kematangan, bukan kesimpulan worker rusak.

### Pekerjaan TODO terbuka yang tidak digantikan paket ini

Tabel unchecked TODO berisi 65 baris terbuka saat pemeriksaan sebelum penulisan. Kelompoknya meliputi M04 backup off-host; M16 consent/redaction/label epistemik; M17 draft/hak media; M18 publikasi/cache revoke; M19 hak riset publik; M20 kontrol sumber/reviewer/admin HQ; M23 mandat manusia; M27 release gates; M28 kompatibilitas deployment; M32 komunitas; M33 media privat; M35 buyer/payment; M36 metering fisik; M44 host/deployment proof; dan M45 rebuild Empire Web. TODO saat ini tetap sumber judul/status yang berwenang; baca ulang sebelum membuat kandidat.

Kandidat V5 tidak dimaksudkan untuk menutup atau menggantikan pekerjaan tersebut. Tidak ada usulan implementasi baru untuk withdrawal testimony, otoritas publikasi/revocation, reviewer grant store, gate hak media, checklist release/deployment, MVP komunitas, ledger pembayaran, pemilik data meter fisik, atau rebuild halaman Empire Web.

## Audit engineering

### Terverifikasi

- Konflik angka agregat dan status dokumen di atas terlihat langsung di file repo/TODO.
- Lookup connector untuk pin yang disebut gagal; akar penyebab belum diketahui.
- Root scripts hanya ditemukan/diinventaris; tidak dieksekusi. Ref remote main/dev dan status branch adalah snapshot.

### Belum terkonfirmasi

Audit ini tidak mereproduksi defect runtime, kerentanan yang dapat dieksploitasi, kegagalan CI, regresi performa, kegagalan aksesibilitas, atau outage produksi. Bukti M27/M44/M45 yang tertulis di TODO berasal dari packet terkait dan tidak dijalankan ulang di sini. Karena itu usulan engineering berfokus pada inventaris yang bisa diverifikasi, regression contract, dan pengukuran terkontrol; usulan tersebut bukan klaim bug yang terkonfirmasi.

Panduan keamanan berasal dari SECURITY.md, keputusan yang diterima, NIST dan OWASP. Pencarian issue connector menampilkan issue governance terbuka #10 dan tidak menampilkan open PR pada view yang dicari; cakupan itu tidak cukup untuk audit duplikasi atau kerentanan global. Tidak ada dugaan kerentanan yang dipublikasikan.

## Riset frontier

Produk mempunyai fondasi potensial untuk riset berbasis sitasi: paket corpus, witness, ontology, research, graph dan source-label. TEI P5 dan W3C PROV-O relevan untuk diuji sebagai representasi, bukan pengganti skema repo. NIST AI RMF dan OWASP GenAI mendukung threat model/evaluasi. Human approval adalah batas penting; panduan OpenAI hanya satu contoh vendor. Ink & Switch menyediakan riset/prototipe local-first, bukan solusi sync siap pakai.

Tidak ada klaim bahwa RAG, agent, spatial UX, local-first, provenance atau simulation baru bagi dunia. Nilai yang diusulkan spesifik pada proyek dan perlu diuji dengan peneliti/pengguna nyata. Semua eksperimen dibatasi data sintetis/diizinkan dan dapat berakhir no-go.

## Peluang ekonomi

TODO M35 menyatakan bahwa layanan, buyer, harga, merchant/legal/payment owner dan bukti unit economics belum siap. Dokumen Empire Web juga menyebut akun, pembayaran dan donasi menunggu alur operasi nyata. Karena itu delapan kandidat ekonomi dimulai dari discovery, atribusi biaya, wawancara harga, atau desain kontrak nontransaksional. Tidak ada payment processing, entitlement, iklan tertarget, token, atau ledger kedua. Pernyataan minat tidak boleh dilaporkan sebagai pendapatan.

## Charity dan dampak kemanusiaan

TODO M32 belum memiliki kebutuhan anggota pertama dan jalur opt-in yang terverifikasi. Audit ini tidak memverifikasi penerima manfaat, partner, donasi, penyaluran, hasil program, atau kasus safeguarding. ICRC, CHS, OECD-DAC dan IATI memberi kerangka tata kelola/evaluasi, tetapi tidak mensertifikasi proyek. Usulan dimulai dari discovery dan kesiapan governance; data sensitif tidak dikumpulkan sebelum rencana minimisasi dan safeguarding disetujui.

## Faith, agama dan ontology

Repositori memiliki paket corpus, ontology, graph, witness dan research serta gate hak/consent/publikasi. Inventaris sumber tidak cukup untuk menyatakan kesimpulan teologis atau historis. Dua puluh empat repositori terkait hanya ditinjau pada tingkat README; klaim/desainnya tidak membuktikan otoritas sumber atau penerimaan fitur. Tidak ada teks agama primer yang diakses untuk laporan ini. Usulan ontology memisahkan klaim, bukti, interpretasi dan atribusi; tidak menetapkan kebenaran metafisik.

TEI P5 dapat menginformasikan representasi witness/varian tekstual; PROV-O dapat menginformasikan pemetaan provenance; prinsip FAIR menginformasikan stewardship tetapi tidak menggantikan privasi, hak cipta atau consent. Entitas dan edge graph mencatat klaim teratribusi; keduanya bukan bukti mandiri.

## Peta gap ke kandidat

| Status terlihat | Kapabilitas yang diinginkan | Gap/bukti | Kandidat |
|---|---|---|---|
| Angka README/TODO/audit granularitas berbeda. | Satu hitungan terdokumentasi dengan benar. | Konflik dokumen terverifikasi; TODO berwenang. | ENG-001/002 |
| Deskripsi M38–M40 berbeda. | Pernyataan kematangan terikat bukti/ref tepat. | Konflik status terverifikasi; runtime belum dicek ulang. | ENG-003/004 |
| Lookup beberapa source pin gagal. | Inventaris referensi immutable yang dapat di-resolve. | Kegagalan lookup terverifikasi; akar masalah UNKNOWN. | ENG-005, ONT-001 |
| Paket provenance/research ada; pemetaan lintas format belum dikaji penuh. | Keputusan interoperabilitas berdasarkan prototipe kecil. | Peluang, belum ada alasan adopsi. | FUT-015, ONT-006 |
| Nilai produk dan buyer belum dibuktikan. | Keputusan pelanggan/problem/harga berdasarkan bukti. | M35 terbuka; tidak ada traction yang diklaim. | ECO-001–008 |
| Kebutuhan komunitas dan dampak belum dibuktikan. | Discovery dan governance dengan consent. | M32 terbuka; tidak ada penerima manfaat yang diklaim. | CHAR-001–010 |
| Ada kontrak kelas klaim/sitasi. | Peneliti dapat menelusuri sumber, versi dan atribusi. | Kontrak parsial; audit ilmiah end-to-end belum ada. | ONT-001–020 |

