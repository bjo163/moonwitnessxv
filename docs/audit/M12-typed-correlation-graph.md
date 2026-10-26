# M12 — Typed Correlation and Evidence Graph (evidence)

- **Milestone**: M12 Typed correlation and evidence graph
- **Status**: IMPLEMENTED AND PG-VERIFIED
- **Code baseline**: `dba0eaa` (addon, kontrak, seed), `77d839c` (Dock Constellation dan suite graph), `1d9d83d` (gaya); ADR `776b689`; drill `e279998`; planning baseline `8064ff6`
- **Date**: 2026-10-26
- **Scope**: `@moonwitness/moonql-graph`, endpoint hub, Dock `/constellation` dan `/constellation/relations/[relationCode]`, drill PostgreSQL

---

## 1. What shipped

| Task | Deliverable | Evidence |
|---|---|---|
| M12-01 | Batas STORY/EVENT/PERSON/TEXT/LAW/PERSPECTIVE diaudit sebagai ADR dengan matriks pemilik tunggal | `docs/decisions/M12-01-rocksoul-boundaries.md`; graph hanya mengutip kode + SHA, tidak menyalin pemilik |
| M12-02 | Candidate edge bertipe dengan `evidenceSpan`, `evidenceFrame`, `evidenceSha`; approval menolak bukti yang hilang dan `sameAs` | `graph_candidates`; `registerCandidate`/`decideCandidate`; test `M12-02` dan `M12-05`; drill PG |
| M12-03 | Release immutable dengan manifest deterministik, `graphSha` unik, dan pointer singleton berversi untuk rollback | `graph_releases`; `graph_release_pointer`; test `M12-03`; drill PG |
| M12-04 | Adjacency/search turunan dari manifest release aktif, dapat di-drop dan dibangun ulang | `graph_adjacency`; `GET /graph/adjacency`, `GET /graph/search`, `POST /graph/adjacency/rebuild`; test `M12-04`; drill PG |
| M12-05 | Fixture identitas dan kronologi palsu: sameAs berbasis kemiripan dan klaim kronologi tetap pending/ditolak | `CANDIDATE_SEED`; test `M12-05`; drill PG |
| M12-06 | Relation detail Constellation dengan provenance, status candidate vs reviewed, dan UNKNOWN yang eksplisit | `apps/dock/src/app/constellation/relations/[relationCode]/page.tsx`; `GraphRelation`; drill UI 99/99; drill PG |
| M12-07 | Export/replay/dedup dan visibility candidate yang di-revoke | `GET /graph/export`; test `M12-07`; drill PG |

### Dashboard surface

- `/constellation` menampilkan panel release: releaseCode aktif, `graphSha`, jumlah edge/ontology/candidate/dedup, versi pointer, pemisahan candidate vs reviewed, dan antrean candidate dengan tautan detail. Setiap edge reviewed di graph kini menaut ke detail relasinya.
- `/constellation/relations/[relationCode]` adalah halaman server-rendered (`force-dynamic`) untuk satu candidate atau satu reviewed edge. Halaman menampilkan label eksplisit "Candidate claim — not a graph edge" atau "Reviewed ontology relation", status epistémik, keanggotaan release, entitas from/to, evidence span + frame + SHA persis, provenance sumber, jejak review, dan peringatan kebijakan `sameAs`.
- Halaman tidak memiliki form, button, atau input; semua proyeksi publik hanya baca. Gaya memakai primitif MoonUI dan token desain tanpa hex, termasuk fokus keyboard dan tata letak mobile satu kolom.

---

## 2. Provenance and seed

| Field | Value |
|---|---|
| Boundary decision | `moonwitnessxv@d539cee:docs/decisions/M02-01-disambiguation-registry.md`, SHA-256 `ee1836db96543f96cc88a1996a6a31cbc5cb099a82c07e3e0a8bc033fd6a3b95` |
| Terminology review | `moonwitnessxv@d539cee:docs/audit/M09-unilex-terminology.md`, SHA-256 `a1aaf2376b245dacf2392039b59f1eda5f02c8006c0ed817701b6a16d83ad2da` |
| Vision | `moonwitnessxv@e2f4562:docs/vision/MASTER_VISION_NARRATIVE_XV.md#06`, SHA-256 `7aedcf33606388a7306b184c40391b4f85909388c2cc65dcb867ce1b6932ccbb` |
| Seed volume | 5 candidate · 4 verified ontology edge · 1 release (5 edge) · 1 dedup · 1 pointer v1 · 5 adjacency row |
| Ontology input | 8 entitas, 7 relasi (4 `VERIFIED`), 5 sumber dari seed M10 |

Kelima candidate adalah sample kontrak, bukan korpus korelasi lengkap. Dua disetujui (satu sengaja menduplikasi relasi ontology reviewed untuk membuktikan dedup), satu ditolak karena hanya berbagi label, dan dua tetap pending: `sameAs` berbasis kemiripan serta klaim kronologi. Setiap candidate membawa span, frame, sumber dan SHA persis; tidak ada candidate yang menyentuh identitas atau menghapus entitas.

Release seed berisi 4 relasi ontology terverifikasi plus 1 candidate yang disetujui; candidate duplikat tetap tercatat di lineage manifest tetapi tidak menambah edge. Pointer aktif adalah versi 1, dan kelima baris adjacency diturunkan dari manifest release tersebut.

---

## 3. Contracts and invariants

| Model | ACL | Purpose |
|---|---|---|
| `graph_candidates` | `ADMIN_WRITE` | Klaim relasi bertipe; bukan edge; status `PENDING`/`APPROVED`/`REJECTED`/`REVOKED` |
| `graph_releases` | `ADMIN_WRITE` | Freeze immutable berisi manifest deterministik dan `graphSha` unik |
| `graph_release_pointer` | `ADMIN_FULL` | Singleton `active`; versi CAS, release sebelumnya, dan rollback |
| `graph_adjacency` | `ADMIN_WRITE` | Baris turunan untuk adjacency/search; droppable dan rebuildable |

- Candidate tidak pernah menjadi edge dengan sendirinya. Hanya candidate `PENDING` yang dapat di-approve; approval membutuhkan reviewer, alasan, span, dan `evidenceSha` 64 hex yang cocok dengan `provenanceSha` sumber. `sameAs` tidak dapat di-approve di graph — identitas tetap milik review M10.
- Kode candidate, entitas, relation type, dan perspective bersifat immutable; candidate tidak pernah dihapus, sehingga keputusan negatif dan revoked tetap terlihat.
- Release tidak dapat di-update atau dihapus. Build yang sama menghasilkan `graphSha` yang sama dan di-replay sebagai release yang sudah ada; SHA duplikat ditolak. Build memblokir relasi `VERIFIED` tanpa sumber ber-SHA persis dan candidate approved tanpa span/SHA yang cocok, dengan daftar alasan.
- Dedup memilih relasi ontology reviewed di atas candidate dengan identitas `from|to|relationType|perspective` yang sama; duplikat tetap tercatat di lineage. Release tidak pernah menulis balik ke `onto_relations`.
- Pointer adalah singleton `active`; aktivasi memakai compare-and-swap `expectedVersion`, mencatat release sebelumnya, dan rollback dilakukan dengan mengaktifkan release lama — bukan mengedit release.
- Adjacency hanya diturunkan dari manifest release aktif. Rebuild menghapus baris release aktif lalu membangunnya ulang; search hanya mencakup adjacency turunan dan tidak pernah menampilkan candidate pending.
- Semua endpoint baca bersifat publik dan read-only; seluruh tulis membutuhkan admin (`401` untuk anonim). Proyeksi tidak menulis baris.

---

## 4. Identity, chronology and revocation policy

- Kemiripan nama, ko-okurensi, kemiripan leksikal, dan kedekatan kronologi tidak pernah otomatis menjadi `sameAs` atau edge terverifikasi. Fixture seed mempertahankan `sameAs` pending dan `sameAs` rejected beserta alasannya.
- Status epistemic pada candidate dan reviewed edge ditampilkan apa adanya (`UNKNOWN`, `DISPUTED`, `ASSERTED`, `VERIFIED`); UNKNOWN tetap tidak terselesaikan dan tidak pernah dilabeli terverifikasi. Halaman detail menyatakan bahwa UNKNOWN boleh tetap unresolved.
- Candidate yang di-revoke tetap terlihat dengan status `REVOKED`; release lama yang memuatnya tetap dapat diekspor dengan lineage aslinya, sedangkan release berikutnya mengecualikannya.
- Export release memuat manifest dan lineage sumber (kode, SHA, relasi ontology, candidate, dan dedup). Replay manifest menghasilkan `graphSha` yang sama; tidak ada klaim identitas yang dibuat oleh proses ini.

---

## 5. Verification log

Semua perintah dijalankan dari root repository; Node 24 LTS, pnpm 10.33.4.

| Command | Result |
|---|---|
| `pnpm build` | pass (seluruh rantai, termasuk `moonql-graph` dan radio) |
| `pnpm --filter @moonwitness/radio exec tsx --test test/graph.test.ts` | 6 test, 6 pass, 0 fail |
| `pnpm --filter @moonwitness/dock typecheck` | pass |
| `cd apps/dock && node ../radio/node_modules/tsx/dist/cli.mjs scripts/verify-graph-ui.tsx` | 99/99 checks pass |
| `cd apps/dock && node ../radio/node_modules/tsx/dist/cli.mjs scripts/verify-constellation-ui.tsx` | 71/71 checks pass |
| `… verify-terms-ui.tsx` / `verify-missions-ui.tsx` / `verify-reader-ui.tsx` | 45/45 · 56/56 · 28/28 checks pass |
| `pnpm build:web` | pass; route `/constellation/relations/[relationCode]` ada di build output |
| `pnpm ui:check` | pass; 75 file, 0 violation |
| `pnpm gen:sdk:check` | generated SDK up to date |
| `pnpm exec eslint <file M12>` | 0 error, 0 warning |
| `pnpm test` (tree kerja) | 258 test, 250 pass, 7 skipped, 1 fail — satu-satunya kegagalan `lint-budget` karena `packages/cli/` untracked (WIP bersamaan, 7 `eslint-disable`) menambah budget 14 menjadi 21; semua test M12 lulus |
| `lint-budget` pada tree commit bersih (`e279998`, worktree terpisah) | 2 test, 2 pass — budget kembali 14 tanpa WIP tersebut |

### PostgreSQL vertical slice

Container disposable, terpisah dari `moonwitness-db`:

```text
docker run -d --name mw-m12-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=postgres \
  -p 127.0.0.1:55432:5432 postgres:16-alpine
```

```text
PARITY_DATABASE_URL=postgres://postgres:postgres@127.0.0.1:55432/postgres \
  pnpm --filter @moonwitness/radio exec tsx --test test/graph-pg.test.ts
→ 1 test, 1 pass, 0 fail (moonql.engine === 'pg')
```

Drill memeriksa seed SQL (5 candidate / 1 release / 1 pointer / 5 adjacency · 4 relasi reviewed · 5 edge di release aktif), penolakan approval `sameAs` dan approval tanpa bukti tanpa partial write, penolakan registrasi dengan SHA salah, release immutable dan replay `existing`, penolakan update/delete release, pointer singleton dan CAS `version 1, not 99` → `409`, aktivasi versi 2, rebuild adjacency (5 → 6 baris lalu 6 → 6), pencarian candidate baru, revoke candidate yang tetap terlihat dan tetap ada di export release lama, export lineage (4 ontology edge, 1 dedup, 3 sumber ber-SHA 64 hex), build lanjutan tanpa candidate revoked, aktivasi versi 3, rebuild 5 baris, rollback ke release seed versi 4, dan jumlah akhir 7 candidate / 3 release / 1 pointer / 5 adjacency. GET berulang tidak menulis baris. Run kedua lulus dengan angka yang sama, membuktikan cleanup drill idempoten.

Cleanup: `docker stop mw-m12-pg` + `docker rm mw-m12-pg`; tidak ada container `mw-m12-pg` tersisa dan port 55432 tidak lagi dipakai.

---

## 6. Limits / follow-ups

- Verifikasi UI adalah markup server-rendered plus assertion CSS/konsistensi MoonUI; tidak ada sesi browser yang ditinggalkan (preferensi owner). Karena tidak ada kontrol tulis, perilaku keyboard terbatas pada navigasi dan tautan.
- Drill PG memakai database disposable dan fixture kecil; ia memvalidasi skema, join, ACL, guard review, immutability, CAS pointer, rebuild adjacency dan proyeksi read-only, bukan volume produksi.
- Seed lima candidate adalah sample kontrak, bukan registry korelasi lengkap. Perluasan membutuhkan review sumber per klaim; tidak ada identitas universal yang divalidasi di sini.
- Docker image tidak dibangun ulang pada milestone ini; `pnpm verify:docker` tetap gate deployment terpisah.
- `sameAs` tetap tidak dapat di-approve di graph; setiap perubahan identitas harus melalui alur review M10 dengan bukti dan reviewer.
- Suite penuh pada tree kerja sesekali tertahan WIP bersamaan di luar milestone (`packages/cli`); CI hanya melihat file yang di-commit, dan tree commit M12 lulus `lint-budget` secara terpisah.
