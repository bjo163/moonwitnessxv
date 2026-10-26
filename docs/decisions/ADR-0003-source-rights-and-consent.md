# ADR-0003 — Source Rights, Consent, and Publishing Storage

- **Status**: ACCEPTED
- **Date**: 2026-10-26
- **Context**: MoonWitness XV Content Integrity, Copyright & Privacy Framework
- **Reference**: [BLUEPRINT.md §3, §6](file:///z:/project/moonradio/BLUEPRINT.md)

---

## 1. Konteks & Prinsip Kepemilikan Data

MoonWitness XV mengelola empat kategori materi yang memiliki karakteristik hak yang berbeda:
1. **Naskah & Teks Klasik** (manuskrip sejarah, teks kitab suci, edisi kritis).
2. **Karya Berhak Cipta Pihak Ketiga** (terjemahan modern, artikel akademis, rekaman audio).
3. **Kesaksian Pribadi (*Personal Witness*)** (pengalaman individu, wawancara, catatan komunitas).
4. **Karya Kreatif Orisinal MoonWitness** (ark cerita zine, poster, musik fiksi THE BATTERIES).

Untuk melindungi hak moral, privasi, dan kepatuhan hukum:
- **Git XV** hanya memiliki kode perangkat lunak, definisi skema, spesifikasi editorial, dan metadata hubungan.
- **Pemilik Sumber / Penerbit Asli** tetap memiliki hak cipta atas teks sumber dan berkas asli.
- **Penyimpan Aset Terizin** (Object Storage) menyimpan bita mentah (*bytes*) secara terisolasi; repositori Git hanya menyimpan hash/digest dan metadata pengenal.

---

## 2. Keputusan Arsitektur (*Decision*)

1. **Pemisahan Bita Asli vs Metadata (`D01 Source/Corpus`)**:
   - Dilarang meng-commit berkas PDF berukuran besar, pindaian manuskrip mentah, atau rekaman musik ke dalam Git.
   - Tabel `sources` dan `editions` hanya menyimpan:
     - `sourceUri`: Penunjuk ke repositori penyedia atau arsip digital resmi.
     - `bytesDigest`: Hash SHA-256 dari edisi rujukan untuk menjamin integritas teks.
     - `rightsStatus`: Status lisensi (`PUBLIC_DOMAIN`, `LICENSED`, `RESTRICTED_METADATA_ONLY`).

2. **Protokol Persetujuan Kesaksian Pribadi (`D06 Witness`)**:
   - Setiap data saksi wajib memiliki catatan persetujuan (`consent_records`):
     - Jenis izin: Anonim penuh, nama samaran terverifikasi, atau nama publik atas izin tertulis.
     - Perlindungan anak di bawah umur: Tidak ada data saksi minor yang dapat dipublikasikan tanpa verifikasi wali.
   - **Hak Penarikan (*Right to Withdraw / Takedown*)**:
     - Jika narasumber mencabut izin, status catatan diubah menjadi `WITHDRAWN`.
     - Proyeksi publik (API/Search) langsung memblokir tampilan konten, sementara jejak audit tetap disimpan demi integritas catatan sejarah.

3. **Gerbang Persetujuan Publikasi (`D08 Governance`)**:
   - Transisi status materi mengikuti siklus ketat:
     `DRAFT` → `IN_REVIEW` → `APPROVED_WITHIN_SCOPE` → `PUBLISHED`.
   - Tidak ada konten baru yang dapat dipublikasikan secara otomatis oleh bot atau AI tanpa telaah manusia (*Human-in-the-Loop*).

---

## 3. Konsekuensi (*Consequences*)

### Positif:
- Menghindari pelanggaran hak cipta dan tuntutan hukum akibat penyebaran materi tanpa izin.
- Ukuran repositori Git tetap ringan, cepat di-clone, dan terbebas dari berkas biner media raksasa.
- Privasi individu dan integritas saksi sejarah terlindungi secara etis.

### Hal yang Perlu Diperhatikan:
- Setiap impor data historis dari repositori masa lalu (seperti arsip XIV atau Rocksoul) wajib melalui audit lisensi sebelum disuntikkan ke dalam modul XV.
