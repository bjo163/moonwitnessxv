# Ekosistem Frontier — Paket Riset dan 100 Issue V5

**Status:** usulan perencanaan; belum masuk TODO dan belum menjadi issue GitHub  
**Tanggal:** 2026-10-30  
**Repositori:** MoonWitness XV, bjo163/moonwitnessxv

## Cakupan dan batas penggunaan

Paket ini memuat tepat 100 kandidat issue: 32 engineering, 30 frontier innovation, 8 economy, 10 charity/humanitarian, dan 20 faith/ontology. Setiap issue memiliki ID unik, satu domain utama dan subdomain, ruang lingkup, bukti dan tingkat keyakinan, rencana kerja, acceptance criteria, risiko, metrik, perkiraan upaya, rollback/fallback, relasi dependensi, serta bukti penutupan.

Ringkasan dan laporan riset berbahasa Indonesia. Spesifikasi issue rinci memakai English untuk istilah dan kriteria teknis agar mudah dipindahkan ke alur kerja engineering. Seluruh isi tetap berstatus **PROPOSED**.

Paket ini dibuat atas persetujuan pengguna untuk menulis dokumen perencanaan di folder baru. Isinya bukan otorisasi implementasi, bukan perubahan status TODO, dan bukan issue GitHub. TODO.md tetap satu-satunya sumber status tugas. Semua kandidat harus dibandingkan lagi dengan TODO, issue/PR terbaru, dan pemilik kontrak sebelum diterima.

Pekerjaan paket ini hanya menambah dokumen di folder ini; tidak mengubah kode produksi, checkbox TODO, branch, issue, pull request, atau riwayat Git. Tidak ada test, build, application script, deployment, migrasi, atau live service yang dijalankan. Pada pencatatan awal, branch adalah dev di HEAD d9e2ca4b579ba7028e6e4830c090d556c44d74f5 dan worktree memiliki 84 perubahan/untracked entry; daftar awal disimpan di luar repositori. Pada pemeriksaan akhir 2026-10-30 08:27 +07:00, HEAD yang terlihat adalah ea40e5cee759fdedddb69570eda1e103027c264b, dengan commit terbaru bertanggal 2026-10-30T08:27:22+07:00. Perubahan snapshot ini tidak dibuat oleh penulisan paket; seluruh WIP di luar folder paket tetap dipertahankan.

## Ringkasan temuan

MoonWitness XV adalah ekosistem riset dan media dengan Hub pusat serta aplikasi dan paket domain khusus. Kekuatan utamanya adalah batas kepemilikan data yang terdokumentasi, register TODO yang luas, kontrak hak/consent/publikasi, serta paket corpus, witness/media, research, ontology, graph, dan UNILEX.

Risiko perencanaan terbesar yang terlihat adalah perbedaan angka milestone/task antar dokumen, perbedaan bahasa status implementasi SKYLINK/ECHOLOG/ORBIT, dan beberapa source pin historis yang tidak berhasil di-resolve oleh connector pada pemeriksaan ini. Temuan itu menunjukkan konflik dokumentasi atau bukti yang belum cukup; bukan bukti bahwa runtime rusak.

Beberapa pekerjaan rilis, consent, hak publikasi, komunitas, pembayaran, meter fisik, dan deployment sudah terbuka di TODO. Kandidat baru di paket ini tidak menggantikan pekerjaan tersebut. SKYLINK tetap bukan Hub, identity owner, model catalog, atau pemilik SQL ketiga. ECHOLOG tetap layanan object storage tanpa tabelnya sendiri. ARSY tetap Hub dan pemilik API/data bersama.

Arah terpadu yang disarankan: sambungkan aplikasi melalui kontrak eksplisit dan berversi; pisahkan sumber, interpretasi, narasi, testimony privat, pembukuan komersial, dan dana amal terbatas; minta otoritas manusia untuk keputusan publikasi, finansial, privasi, dan komunitas. Ide frontier harus diuji dengan eksperimen terbatas yang dapat berakhir no-go.

## Paket dokumen

| Dokumen | Isi |
|---|---|
| [Audit repositori dan arsitektur](AUDIT.md) | Inventaris sistem, status, batas domain, temuan dan gap |
| [Daftar sumber dan metode riset](RESEARCH_SOURCES.md) | 14 sumber primer/resmi, 24 README repositori terkait, metode dan batas cakupan |
| [Matriks 100 issue](ISSUE_MASTER_MATRIX.md) | Semua ID, domain, subdomain, prioritas, skor dan wave |
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

## Metode dan batas bukti

Pemeriksaan mencakup README, TODO, indeks dokumen, kontrak arsitektur, sebagian manifest/source path, Git metadata, command discovery, pencarian issue/PR melalui connector, 24 README repositori terkait, serta 14 sumber teknis/standar/operasional resmi atau primer. Sumbernya tercatat di [RESEARCH_SOURCES.md](RESEARCH_SOURCES.md).

Cakupan ini belum memenuhi target riset lengkap pada prompt: belum ada 15 paper yang ditinjau sistematis, 15 audit source code OSS, 10 studi produk, atau 15 tinjauan sumber primer/sarjana agama. Hanya satu paper peer-reviewed yang masuk daftar, yakni FAIR. Tidak ada kitab suci atau teks agama primer yang dikonsultasikan. Karena itu paket ini tidak membuat klaim doktrinal atau historis.

Label bukti dipakai dengan arti berikut: **VERIFIED** hanya untuk artefak/fakta yang benar-benar diperiksa; **INFERRED** untuk simpulan terbatas; **PROPOSED** untuk usulan; **EXPERIMENTAL** untuk prototipe; **SPECULATIVE** untuk hipotesis lemah; **UNKNOWN** untuk hal yang belum diketahui; **CONTESTED** untuk perbedaan pendapat substantif. Tingkat confidence menilai mutu bukti, bukan kebenaran agama.

## Batas penting

- Pencarian GitHub terbatas pada tampilan connector: satu open governance issue (#10), sepuluh closed PR di tampilan yang dicari, dan tidak ada open PR yang muncul. Ini tidak membuktikan semua kandidat baru secara global.
- README, GRANULARITY_AUDIT, dan TODO memberi angka milestone/task berbeda. Sesuai kebijakan repo, TODO yang berwenang.
- Status M38–M40, SKYLINK, ECHOLOG, dan LUMEN tidak sepenuhnya selaras antar dokumen. Tidak ada test suite yang dijalankan untuk menghapus konflik tersebut.
- Worktree awal sangat kotor dengan UI, accessibility, media, dan M19 work-in-progress. Perubahan lokal tidak diasumsikan sebagai status rilis.
- Belum ada bukti buyer, pelanggan, pendapatan, kebutuhan penerima manfaat, partner, donasi, dampak, atau lokasi meter. Semua tetap UNKNOWN.

