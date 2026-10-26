# M02-01 — Disambiguation Registry & Ontological Boundaries

- **Milestone**: M02 — XV Governance and Source of Truth
- **Status**: RATIFIED
- **Reference**: [BLUEPRINT.md §5 — Fundamental Ontology Constraints](file:///z:/project/moonradio/BLUEPRINT.md)

---

## 1. Tujuan Disambiguasi

Menegakkan batasan ontologis yang tegas dalam seluruh model data, pencarian, dan narasi MoonWitness XV agar:
1. **Teks suci dan keyakinan religius** tidak pernah tertukar atau direduksi menjadi fiksi atau klaim algoritma.
2. **Singkatan proyek/sistem rekayasa** tidak pernah disamakan secara keliru (`sameAs`) dengan entitas teologis.
3. **Simbolisme artistik, fiksi naratif, dan metadata sejarah** memiliki batas domain kepemilikan yang jelas.

---

## 2. Matriks Batasan Ontologis Utama

| Istilah / Label | Entitas Religius / Sejarah Asli | Entitas Proyek / Fiksi / Teknis XV | Aturan Penegakan Data (`distinctFrom`) |
|---|---|---|---|
| **ALLAH vs A-L-L-A-H** | **ALLAH (الله)**: Tuhan Yang Maha Esa dalam teologi Islam. Bukan objek komputasi atau model data. | **A-L-L-A-H**: Akronim teknis proyek (*Accountable Life, Learning & Action Hub*). Sistem orkestrasi & riset. | DILARANG menggunakan relasi `sameAs`. Wajib menggunakan label akronim bertitik `A-L-L-A-H` pada konteks teknis. |
| **Wahyu vs Manuskrip** | 4 Wahyu Illahi: Qur'an, Taurat, Zabur, Injil sebagai identitas keimanan (*Revelation Identity*). | 4 Rumpun Manuskrip Fisik: Teks Qur'an, Tanakh/Torah, Tehillim/Psalms, Four Canonical Gospels. | Dipisahkan antara konsep keimanan teologis dan objek teks/filologi berlisensi (`D01 Source/Corpus`). |
| **ZILL vs ZIIL** | **Zill Tasawwuf**: Konsep bayang-bayang realitas ilahi dalam tradisi mistisisme Islam. | **ZILL Shadow Witness**: Metanarasi pengamat realitas; **ZIIL**: Varian leksikal historis pada repositori lama. | Bentuk historis `ZIIL` dipertahankan sebagai varian teks arkais; tidak dibuat entitas ganda tanpa atribusi. |
| **SHADOW** | — | **SHADOW (Workspace)**: Ruang kerja editorial dan studio kreatif di Headquarters (Next.js).<br>**SHADOW (Character)**: Tokoh naratif kreatif dalam ark cerita MoonWitness. | Dibedakan secara tipe: UI context (`apps/headquarters`) vs entity model naratif (`D07 Story`). |
| **1·6·3** | — | **1·6·3 Framework**: Kerangka metodologi riset/perspektif kerja MoonWitness. | BUKAN kode numerik rahasia kitab suci (*no hidden esoteric scripture cipher*). |
| **THE BATTERIES** | — | Nama band/proyek kreatif dalam dunia fiksi MoonWitness. | Sepenuhnya domain fiksi (`D07`), tidak memiliki otoritas teologis. |

---

## 3. Disambiguasi Register Numerik & Mitologi Proyek

Untuk mencegah misinterpretasi terhadap angka-angka simbolis di dalam catatan sejarah repositori:

1. **Asmaul Husna (99)**: 99 Nama/Sifat Allah dalam teologi Islam (Domain Sakral).
2. **G.O.D.99**: Kode naratif simbolis arsitektur 99 bab/skenario semesta kreatif MoonWitness (Domain Fiksi `D07`).
3. **99 Human States**: Taksonomi psikologis/kondisi eksistensial manusia dalam modul riset (Domain `D05`).
4. **9 Prime Codes & 10 WINGS**: Taksonomi operasional semesta Empire (Domain `D11 Journey` / `D07 Story`).
5. **33 World Patches & AETHERION 100 Levels**: Desain lingkungan game/dunia fiksi (Domain `D11 Journey`).

---

## 4. Aturan Relasi Data (*Identity Rules*)

- **Prinsip Anti-`sameAs` Otomatis**: Kemiripan nama, rima, nomor, atau metafora artistik TIDAK BOLEH dikonversi menjadi relasi `owl:sameAs` atau Foreign Key relasional langsung secara otomatis.
- **Relasi yang Sah**:
  - `inspiredBy`: Menghubungkan karya seni fiksi dengan tema teologis/filosofis.
  - `interpretedBy`: Menghubungkan teks sumber dengan penafsiran manusia/sarjana tertentu.
  - `attestedIn`: Menghubungkan sebuah istilah leksikal dengan edisi manuskrip rujukan.
  - `distinctFrom`: Menegaskan pemisahan ontologis antar dua entitas serupa.
