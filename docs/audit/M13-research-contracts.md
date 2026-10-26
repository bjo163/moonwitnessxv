# M13 — SRGBL v8, Key Witness and SWING (evidence)

- **Milestone**: M13 SRGBL v8, Key Witness and SWING
- **Status**: IMPLEMENTED AND PG-VERIFIED
- **Code baseline**: `3d88850` (addon, seed, gate, suite dan wiring radio, rebase di atas `1f80229`); commit bukti menambahkan ADR, laporan, TODO dan integrasi manifest/dist `moonql-research` di Dockerfile/Dockerfile.web
- **Date**: 2026-10-26
- **Scope**: `@moonwitness/moonql-research`, wiring hub radio, suite HTTP, drill PostgreSQL

---

## 1. What shipped

| Task | Deliverable | Evidence |
|---|---|---|
| M13-01 | P19 specs, register dan status dibaca pada SHA persis; pin XIV yang tidak tersedia dicatat sebagai gate terbuka, bukan diganti dokumen lain | `RESEARCH_PINS`, `RESEARCH_META`, `RESEARCH_ISSUE_REGISTER`; ADR `M13-01-srgbgl-p19-gates.md`; test `M13-01` |
| M13-02 | Gate S1: edisi, passage, citation, rights, rights snapshot, SHA persis, provenance dan source sense; sumber tak terselesaikan tetap `UNKNOWN` | `evaluateS1`; test `M13-02`; drill PG `EVIDENCE_SHA_MISMATCH` |
| M13-03 | R2 hanya menerima klaim `OBSERVED_TEXT` ber-span dan ber-SHA; G3 menolak dangling, cross-case, koreksi netral, dan spekulasi sebagai sumber | `evaluateR2`, `evaluateG3`; test `M13-03`; endpoint register 201/400 |
| M13-04 | B4 menolak frame kosong, aktor tak teresolusi dan `UNSPECIFIED` tanpa alasan; lensa wajib dideklarasikan; OFFSIDE tidak mengubah frame tersimpan | `evaluateB4`, `diagnoseOffside`; test `M13-04` |
| M13-05 | L5: satu kesimpulan `BOUNDED_DERIVED_READING` ber-limit, ber-boundary, ber-citation dan ber-SHA; tidak pernah divine judgment atau human review | `validateWitnessRow`, `witnessView`; test `M13-05`; drill PG |
| M13-06 | Maturity/15, quality/40, witness/100 dan direction −2..2 tetap terpisah; tanpa skor gabungan, ranking, atau merge | `scoreMaturity`, `scoreQuality`, `scoreWitness`, `scoreDirection`, `buildMetrics`; test `M13-06`; drill PG |
| M13-07 | SWING 7 operator kedalaman ≤3, Positive Correction dan OFFSIDE adversarial; hipotesis wajib mengutip dan tidak dapat memvalidasi diri | `proposeSwing`, `proposeSwingChain`, `validateHypothesisRow`, endpoint validate; test `M13-07`; drill PG |

### Permukaan API

- 7 model: `research_cases`, `research_frames`, `research_claims`, `research_relations`, `research_witnesses`, `research_quality_runs`, `research_hypotheses`.
- 5 endpoint baca publik: `GET /research/overview`, `/research/case`, `/research/metrics`, `/research/trace`, `/research/hypotheses`.
- 9 endpoint tulis admin-only: `claims/register`, `relations/register`, `frames/register`, `witnesses/register`, `quality/register`, `hypotheses/register`, `hypotheses/validate`, `swing/propose`, `offside/diagnose`.
- Addon terpasang di hub radio (`apps/radio/src/addons.ts`) dengan dependency `base`, `auth`, `corpus`, `actors`; Dockerfile dan Dockerfile.web menyalin manifest `packages/moonql-research` di kedua stage instalasi dan Dockerfile hub menyalin `dist`-nya.

---

## 2. Provenance and seed

| Field | Value |
|---|---|
| D05 adoption | `moonwitnessxv@d539cee:docs/decisions/M02-07-historical-decisions-matrix.md`, SHA-256 `2cc26c18d5c8e8214a7f55de3386b3c55d361ebaaba7d926ed6aaf799fccd6c4` |
| P19 executable specs | `moonwitness-corpus@e2f5b93f:docs/MOONWITNESS-P19-EXECUTABLE-SPECS.md`, SHA-256 `c87c2a498dbe5340fe5a4ef3680f9c55d858beb89362f88d28832f314fa8c456` |
| P19 register | `moonwitness-corpus@e2f5b93f:docs/P19-REGISTER-RECONCILIATION.md`, SHA-256 `dfdc679fe3a08c16ae7004e40a092611a4c3daccb8e196d5cab772b4c1c93656` |
| SRGBL v8 status | `moonwitness-corpus@e2f5b93f:docs/SRGBL-V8-IMPLEMENTATION-STATUS.md`, SHA-256 `e136fc9d402cf3dfc5089925cf8091207e5f487d2bcf263b93fdc1d71fa10835` |
| Source/edition matrix | `moonwitness-corpus@e2f5b93f:docs/SRGBL-V8-SOURCE-EDITION-MATRIX.md`, SHA-256 `f1881959b36bdb9bda9f0f741676a9e1c76120d31708f89d12113708203b498b`, `AUDIT_ONLY_NO_CLEARANCE` |
| Vision | `moonwitnessxv@e2f4562:docs/vision/MASTER_VISION_NARRATIVE_XV.md#06`, SHA-256 `7aedcf33606388a7306b184c40391b4f85909388c2cc65dcb867ce1b6932ccbb` |
| Legacy XIV SRGBL | `moonwitness-xiv@99e1a4f028b37dc1:research/frameworks/srgbl.md` — `UNAVAILABLE_AT_PIN` (SHA tidak ada; 404/422 dan tidak ada di tree publik) |
| Seed volume | 3 case · 3 frame · 5 klaim · 2 relasi · 2 Key Witness · 1 quality run · 3 hipotesis |
| Sumber | edisi `quran_cairo_hafs`, provenance SHA `c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912`, rights `RIGHTS_EXACT_VERSION_CLEARED`; passage `QS 2:82`; terjemahan `QS_2_82_id_kemenag` |

Tiga case seed sengaja berbeda status: `RC-QS-002-082-AR` menempuh kelima stage dengan sumber Arab persis; `RC-QS-002-082-ID` membaca terjemahan berlisensi sehingga maturity berhenti setelah R2 dan direction `UNKNOWN` karena bukti berbobot nol; `RC-QS-037-030-AR` memakai edisi yang tak teresolusi sehingga seluruh stage `UNKNOWN` dan maturity 0. Tidak ada teks mentah yang diekspos (`rawTextExposed: false`).

---

## 3. Contracts and invariants

| Model | ACL | Purpose |
|---|---|---|
| `research_cases` | `ADMIN_WRITE` | Case riset, source sense, rights snapshot dan SHA persis; seed `noupdate` |
| `research_frames` | `ADMIN_WRITE` | Agent/recipient/domain/scope/genre/lens dan status review engineering |
| `research_claims` | `ADMIN_WRITE` | Klaim R2 dengan epistemic, representasi, status, span dan SHA |
| `research_relations` | `ADMIN_WRITE` | Relasi G3 dengan defensibility, counter-reading dan larangan spekulasi sebagai sumber |
| `research_witnesses` | `ADMIN_WRITE` | Key Witness: satu bacaan turunan berbatas, komponen skor dan `humanReviewed: false` |
| `research_quality_runs` | `ADMIN_WRITE` | Rubrik 10 dimensi × 0–4 pada bundle lengkap |
| `research_hypotheses` | `ADMIN_WRITE` | SWING/Positive Correction/OFFSIDE; kandidat yang tidak dapat memvalidasi diri |

- Stage dievaluasi berurutan; stage hilir hanya dievaluasi bila stage hulu `PASS`. Hasil hanya `PASS`/`UNKNOWN`/`FAIL`, dan alasan kode selalu disertakan.
- `UNKNOWN` bersifat fail-closed: edisi/passage tak teresolusi, rights belum jelas, SHA hilang, terjemahan tak teresolusi, atau bukti berbobot nol tidak pernah dibulatkan menjadi lulus atau netral.
- Klaim `INFERENCE` tidak pernah dapat `SUPPORTED`; representasi `TRANSLATION` hanya sah pada source sense terjemahan yang teresolusi; `SOURCE_TEXT` hanya sah pada `ORIGINAL_ARABIC`.
- Relasi `DEFENSIBLE` menuntut span + SHA case dan kedua endpoint `OBSERVED_TEXT`; relasi `SPECULATIVE` tidak pernah boleh `presentedAsSource`.
- Frame `ACTOR_REGISTRY` menuntut referensi aktor yang teresolusi; `UNSPECIFIED` menuntut alasan tertulis. Identitas tidak pernah diturunkan dari nama panggilan atau peran.
- Key Witness selalu `ENGINEERING_ONLY`, `humanReviewed: false`, dan `claimKind: BOUNDED_DERIVED_READING`; jalur `humanReviewed: true` ditolak sampai M14.
- Proyeksi baca tidak menulis baris; seluruh tulis membutuhkan admin (anonim `401`).

---

## 4. Independent measurements and hypotheses

- **Maturity** = prefiks `PASS` bersambung, triangular `n(n+1)/2`, maksimum 15. Case Arab 15/15; case terjemahan 3/15; case edisi tak teresolusi 0/15.
- **Quality** = 10 dimensi × 0–4, maksimum 40 dan hanya pada bundle lengkap berlabel; seed Arab 28/40. Nilai 5 atau dimensi yang hilang ditolak `400`; update append-only ditolak.
- **Witness support** = 25/25/20/15/15, maksimum 100; 75 = `eligible-for-review` dan 25 = `needs-more-evidence`, keduanya bukan approval (`automaticCanonicalApproval: false`). Agregat selalu `null`.
- **Direction** = −2..+2 dari intensity × weight × confidence; case Arab `scored` 2, case terjemahan `UNKNOWN` dengan alasan `no positive evidence weight`.
- **Tidak ada merge**: `combined: null`, `ranking: false`, `merged: false`, `theologicalRanking: 'FORBIDDEN'`.
- **SWING**: 7 operator, kedalaman maksimum 3, guard duplikat mendahului guard siklus; setiap hop `CANDIDATE`, `UNVERIFIED`, `inheritedScore: null`. Chain 3 hop berhenti `complete`; duplikat berhenti `duplicate-candidate`; siklus berhenti `cycle`.
- **Positive Correction** menuntut lensa non-netral dan counter-reading; **OFFSIDE** menuntut `mismatchNote` + `proposedFrameNote` dan tidak pernah mengubah frame tersimpan (`verified: false`).
- **Validasi hipotesis**: self-validation `400`; `CORROBORATED` menuntut validator berbeda + sumber independen; `REJECTED` menuntut alasan; `verified` tetap `false` dan `humanReviewed` tetap `false`.

---

## 5. Verification log

Semua perintah dijalankan dari root worktree `moonradio-m13`; Node 24 LTS, pnpm 10.33.4.

| Command | Result |
|---|---|
| `pnpm install --frozen-lockfile` | pass setelah rebase di atas `1f80229` |
| `pnpm build` | pass (seluruh rantai, termasuk `moonql-research`, studio dan radio) |
| `pnpm --filter @moonwitness/radio exec tsx --test test/research.test.ts` | 8 test, 8 pass, 0 fail (3,1 dtk) |
| `pnpm --filter @moonwitness/radio exec tsx --test test/dockerfile-contract.test.ts` | 6 test, 6 pass (setelah manifest + dist `moonql-research` ditambahkan ke Dockerfile/Dockerfile.web) |
| `pnpm --filter @moonwitness/radio test` | 287 test, 279 pass, 0 fail, 8 skipped (67,6 dtk) |
| `pnpm gen:sdk:check` | generated SDK up to date |
| `pnpm ui:check` | 77 file, 0 violation, PASSED |
| `pnpm lint` | 0 error, 61 warning (pre-existing di `packages/moonql/*` dan tools) |
| `pnpm build:web` | pass; route `/studio` dan seluruh route Dock/Reader ikut ter-build |
| `PARITY_DATABASE_URL=… tsx --test test/research-pg.test.ts` | 1 test, 1 pass, 0 fail, `moonql.engine === 'pg'`; diulang sekali, lulus dengan angka sama |

### PostgreSQL vertical slice

Container disposable, terpisah dari `moonwitness-db`:

```text
docker run -d --name mw-m13-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=postgres \
  -p 127.0.0.1:55432:5432 postgres:16-alpine
```

```text
PARITY_DATABASE_URL=postgres://postgres:postgres@127.0.0.1:55432/postgres \
  pnpm --filter @moonwitness/radio exec tsx --test test/research-pg.test.ts
→ 1 test, 1 pass, 0 fail (7,2 dtk; run kedua 1,1 dtk)
```

Drill memeriksa seed SQL (3 case · 2 witness · pin P19 pada SHA persis · `p19ReleaseDecision: BLOCKED` · `combinedScore: null`), kelima stage Arab `PASS` dengan maturity 15, quality 28/40, witness 75 `eligible-for-review`, agregat witness `null`, direction 2, `combined: null`/`ranking: false`/`merged: false`, `rawTextExposed: false`, dan `humanReviewed: false`. Case terjemahan maturity 3 dengan direction `UNKNOWN`; case tak teresolusi kelima stage `UNKNOWN` dan maturity 0. Registrasi witness baru `201` (tetap `humanReviewed: false`) dan duplikat `409`; registrasi hipotesis `201` (`CANDIDATE`), self-validation `400`, corroboration independen `200` menjadi `CORROBORATED` dengan `verified: false`, `humanReviewed: false`, `inheritedScore: null`; SWING 3 hop `complete` seluruhnya `CANDIDATE`/`UNVERIFIED`/`inheritedScore: null`, kedalaman 4 `400`; pengubahan SHA case menjadi `aaaa…` membuat S1 `FAIL` `EVIDENCE_SHA_MISMATCH` dan maturity 0, lalu SHA dipulihkan. Cleanup memakai `removeWhere` (bypass hook) dan update SHA, sehingga run kedua lulus dengan angka sama.

Cleanup: `docker stop mw-m13-pg` + `docker rm mw-m13-pg`; tidak ada container `mw-m13-pg` tersisa.

---

## 6. Limits / follow-ups

- Pin XIV `research/frameworks/srgbl.md` tetap `UNAVAILABLE_AT_PIN`; kontrak stage diambil dari P19 specs + vision, dan gate tersebut tidak dianggap selesai.
- Empat temuan register P19 (`L18-L19`, `L13`, `L25`, `CI`) tetap `OPEN_FOR_HUMAN`/`RIGHTS_GATE_OPEN`; `p19ReleaseDecision` tetap `BLOCKED`.
- M13 tidak menyediakan review manusia: `humanReviewed` selalu `false`, `humanReviewAvailableInMilestone: false`; alur reviewer adalah M14.
- Key scheme `semantic-core:v0` tetap `CANDIDATE_NOT_RATIFIED`; token tidak menjadi kanon atau peringkat.
- Seed tiga case adalah sample kontrak, bukan korpus riset lengkap; perluasan menuntut review sumber per klaim.
- Image Docker tidak dibangun ulang pada milestone ini; kontrak Dockerfile diverifikasi oleh test, tetapi `pnpm verify:docker` tetap gate deployment terpisah.
- Catatan lingkungan: checkout Windows baru dengan `core.autocrlf=true` menulis `pnpm-lock.yaml` sebagai CRLF; test `dockerfile-contract` (dari commit studio `1f80229`) mencari blok `\nimporters:\n` sehingga perlu salinan kerja LF. CI Linux tidak terpengaruh. Perbaikan EOL test di luar scope M13 dan dicatat sebagai follow-up.
