# M02-05 — Stable Identifiers and Versioned Legacy References

- **Milestone**: M02 — XV Governance and Source of Truth
- **Status**: RATIFIED
- **Reference**: [BLUEPRINT.md §5, §6](../../BLUEPRINT.md)

---

## 1. Aturan Pengenal Utama (*Internal Stable IDs*)

Untuk memastikan seluruh record memiliki identitas unik, tahan benturan saat migrasi data, dan ramah URL:

1. **Format Awalan Domain (*Prefix Notation*)**:
   Semua ID primer internal menggunakan awalan kode domain yang diikuti oleh identifier berbasis karakter acak/time-sortable (ULID atau nano-id):
   - `st_<id>` — Stations (`D09 Signal`)
   - `pl_<id>` — Playlogs (`D09 Signal`)
   - `wk_<id>` — Works (`D01 Corpus`)
   - `ed_<id>` — Editions (`D01 Corpus`)
   - `ps_<id>` — Passages (`D01 Corpus`)
   - `tm_<id>` — Terms (`D02 UNILEX`)
   - `fg_<id>` — Figures / Actors (`D04 Actor`)
   - `cs_<id>` — Research Cases (`D05 Research`)
   - `wt_<id>` — Witness Testimonies (`D06 Witness`)
   - `sa_<id>` — Story Arcs & Episodes (`D07 Story`)

   > Revalidasi 2026-10-26: prefix Story sebelumnya juga `st_`, bertabrakan dengan
   > Stations. Diganti `sa_` agar satu prefix hanya dimiliki satu tipe; belum ada
   > kode yang memakai prefix ini. Lihat
   > [laporan revalidasi](../audit/M01-M05-revalidation-2026-10-26.md).

2. **Kekekalan ID (*Immutability*)**:
   - Sekali sebuah ID diterbitkan dan dirujuk oleh SDK atau antarmuka publik, ID tersebut **tidak boleh diubah atau ditimpa**.

---

## 2. Pengelolaan ID Sumber Luar (*Foreign Source IDs*)

ID dari standar kanonik eksternal dipertahankan sebagai atribut pemetaan standar, **bukan** primary key internal:

| Korpus / Skema | Pola Pengenal Eksternal | Contoh | Penyimpanan |
|---|---|---|---|
| **Al-Qur'an** | `qs:<surah>:<ayah>` | `qs:2:82` | `passageRef` |
| **Tanakh / Taurat / Zabur** | `ot:<book>:<chapter>:<verse>` | `ot:psa:23:1` | `passageRef` |
| **Perjanjian Baru / Injil** | `nt:<book>:<chapter>:<verse>` | `nt:jhn:1:1` | `passageRef` |
| **Leksikon Semitik** | `strongs:<H|G><number>` | `strongs:H7307` | `externalVocab` |
| **Standar Bibliografi** | `doi:<suffix>`, `urn:isbn:<isbn>` | `urn:isbn:9780199535903` | `sourceIdentifier` |

---

## 3. Skema Pelacakan Garis Keturunan Historis (*Legacy Lineage*)

Data yang diimpor dari repositori generasi sebelumnya (XIV, Rocksoul, Corpus awal) **dilarang menimpa atau merekayasa ID asal**. Setiap record impor wajib mencantumkan metadata garis keturunan:

```typescript
export interface LegacyReference {
  /** Repositori asal data (contoh: 'moonwitness-xiv', 'rocksoul-platform') */
  sourceRepo: string
  /** ID record asli di sistem lama */
  originalId: string
  /** Commit SHA sumber saat data diekstraksi */
  sourceSha: string
  /** Versi parser/transformer yang digunakan */
  transformVersion: string
  /** Timestamp ekstraksi */
  importedAt: string
}
```

### Aturan Penjaminan Integritas:
- Operasi impor bersifat **idempoten**: penarikan ulang dengan kombinasi `sourceRepo + originalId` yang sama tidak akan menciptakan duplikasi data, melainkan memperbarui atribut jika hash sumber berubah.
- Foreign keys historis tidak boleh dihapus secara diam-diam.
