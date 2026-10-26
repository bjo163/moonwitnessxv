# M14 — MIZAN and Human Research Review (evidence)

- **Milestone**: M14 MIZAN and human research review
- **Status**: IMPLEMENTED AND PG-VERIFIED
- **Code baseline**: `ada9d3b` (addon, seed, mesin review, MIZAN, suite dan wiring radio, di atas `31cc124` yang membawa journey/denpa/empire); commit bukti menambahkan ADR, laporan ini dan status TODO
- **Date**: 2026-10-26
- **Scope**: `@moonwitness/moonql-research`, wiring hub radio, suite HTTP M14, drill PostgreSQL

---

## 1. What shipped

| Task | Deliverable | Evidence |
|---|---|---|
| M14-01 | Mesin status `DRAFT/SUBMITTED/REVIEWED/DISPUTED/REJECTED/RETRACTED` dengan 7 aksi bernama; hanya aktor manusia bernama dari `auth_users`; registrasi selalu `DRAFT` v1; guest/anonim ditolak; submitter tidak dapat menyetujui sendiri | `review.ts` (`REVIEW_TRANSITIONS`, `canTransition`, `eventKeyFor`), `humanActor`, `transitionReview`; test `M14-01` |
| M14-02 | Detail reviewer menampilkan SHA persis, `exactMatch`, source ID + version per counterevidence; registrasi counterevidence palsu/stale SHA `400`; target non-klaim `400`; resolve menuntut alasan; resolve ganda `409` | `reviewDetail`, endpoint `counterevidence/register` + `:ceCode/resolve`; test `M14-02` |
| M14-03 | Proses pilot annotator berpasangan: `RECORDED` hanya dengan ≥2 annotator bernama berbeda pada SHA sama; annotator duplikat `409`; SHA berbeda `400`; disagreement tetap tercatat dan dilaporkan | `pilotStatus`, endpoint `pilot/annotations` + `GET /research/pilot`; test `M14-03` |
| M14-04 | Metode MIZAN v1 terikat teks kanonik + SHA-256, 6 kriteria × 0–4 = 24; run wajib terikat metode terdaftar, explanation/context/unknowns wajib, total dihitung server; skor bukan verdict dan tidak pernah menjadi ranking | `parseMizanScores`, `scoreMizan`, `mizanRunIsBounded`, model `mizan_methods`/`mizan_runs`; test `M14-04` |
| M14-05 | Reject/revisi/retract mempertahankan keputusan lama; event append-only; update/delete event, run, annotation ditolak; version CAS menolak transisi basi; dispute tidak dapat diselesaikan oleh pendisput | `validateEventRow`, hooks append-only, endpoint `dispute`/`resolve`/`retract`; test `M14-05` |
| M14-06 | Uji peran salah, bukti palsu, target hilang dan balapan approval: dua approval bersamaan menghasilkan `[200, 409]` dan tepat satu event `APPROVE`; tidak ada publish tanpa persetujuan | mutex per-review + CAS + unique `eventKey`; test `M14-06`; drill PG |
| M14-07 | Kriteria rilis turunan: review harus `REVIEWED`/`APPROVED`, reviewer berbeda, SHA persis, counterevidence lengkap dan terselesaikan, MIZAN terikat, pilot `RECORDED`; publikasi tetap `false`; pilot tidak lengkap memblokir approval | `releaseVerdict`, `GET /research/reviews/:reviewCode/release`; test `M14-07` |

### Permukaan API

- 6 model baru, semuanya `rest: false`: `research_reviews`, `research_review_events`,
  `research_counterevidence`, `mizan_methods`, `mizan_runs`, `research_pilot_annotations`.
- 15 endpoint baru: `GET /research/reviews`, `GET /research/reviews/:reviewCode`,
  `POST /research/reviews/register`, `POST /research/reviews/:reviewCode/{submit,decide,dispute,resolve,retract}`,
  `POST /research/counterevidence/register`, `POST /research/counterevidence/:ceCode/resolve`,
  `POST /research/mizan/methods`, `POST /research/mizan/runs`,
  `POST /research/pilot/annotations`, `GET /research/pilot`,
  `GET /research/reviews/:reviewCode/release`.
- Tulis memakai `auth` tetapi tetap memvalidasi aktor manusia bernama; baca daftar/detail/release
  `ADMIN_ONLY`; seluruh model mentah tidak terekspos melalui REST generik (`404`).

---

## 2. Provenance and seed

| Field | Value |
|---|---|
| Baseline repo | `moonwitnessxv@7775a7d` (M13 green CI) |
| Case exact SHA | `c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912` |
| MIZAN method | `MIZAN-EVIDENCE-RISK-CONSISTENCY` v1, SHA-256 `9e6e50853663340c5a3f4f17931cbcb85b720a3b4e20d4a060b897dc7e05669c`, status `CANDIDATE_NOT_RATIFIED` |
| Counterevidence seed | 2 baris `OPEN` pada case `RC-QS-002-082-AR`, target klaim `CLM-QS2-82-COND`: `CE-QS2-82-RECIPIENT` (`tafsir:recipient-scope` v1) dan `CE-QS2-82-DEFINITION` (`lexicon:belief-righteous-action` v1) |
| Seed review/pilot/run | tidak ada — tidak ada review yang lahir `REVIEWED`, tidak ada pilot yang lahir `RECORDED`, tidak ada skor tersimpan sebelum reviewer bertindak |
| Label seed | `M13 engineering seed (not a human reviewer)` pada setiap baris seed |

MIZAN canonical text:

```text
MIZAN v1 criteria: evidenceGrounding,counterevidenceCoverage,provenance,consistency,riskDisclosure,unknownHonesty; each 0-4; total 24; no ranking; not divine judgment.
```

---

## 3. Contracts and invariants

| Model | Purpose |
|---|---|
| `research_reviews` | Identitas review, target, SHA, state, version, submitter/reviewer bernama, decision dan alasan |
| `research_review_events` | Trail append-only per transisi; `eventKey` unik `reviewCode:action:versionTo` |
| `research_counterevidence` | Counterevidence per target dengan source ID/version dan status resolusi |
| `mizan_methods` | Metode ber-versi dengan teks kanonik, SHA, kriteria, skala dan status |
| `mizan_runs` | Penilaian 6 kriteria pada review, terikat metode dan SHA persis |
| `research_pilot_annotations` | Anotasi independen per annotator pada case + SHA |

- Registrasi review menolak state selain `DRAFT`, versi selain 1, reviewer/decision yang sudah
  terisi; hook menolak perubahan identitas review.
- Event, run dan anotasi bersifat append-only: update dan delete ditolak; retraksi adalah state,
  bukan penghapusan.
- Counterevidence menuntut `sourceId`, `sourceVersion`, citation dan SHA persis; identitas tidak
  dapat diubah setelah dibuat.
- Metode MIZAN menuntut teks kanonik, SHA turunan teks, 6 kriteria pada urutan tetap, skala 0–4,
  maksimum 24 dan status `CANDIDATE_NOT_RATIFIED`; duplikat kode+versi atau SHA `409`.
- Total MIZAN selalu dihitung server dari enam skor; total yang dikirim klien tidak dipercaya.
- `publicationAvailable` selalu `false`; `autoApproved` selalu `false`; `scoreIsVerdict` selalu
  `false`; `theologicalRanking: FORBIDDEN`.

---

## 4. Measurements: pilot, MIZAN, release

- **Pilot**: 0 anotasi → `BLOCKED` dengan `PILOT_NEEDS_TWO_INDEPENDENT_ANNOTATIONS`; 1 anotasi →
  tetap `BLOCKED`; 2 anotasi berbeda pada SHA sama → `RECORDED`, `agreement` dihitung (contoh
  `SUPPORTED` + `CONTRADICTED` → `agreement: false`). `RECORDED` bukan publikasi.
- **MIZAN**: run valid pada test = 18/24 (`3+3+3+3+3+3`), explanation/context/unknowns terisi;
  skor 5, metode tak terdaftar, metode tak terikat, explanation kosong dan run duplikat ditolak.
  Metode tetap `CANDIDATE_NOT_RATIFIED` dan `bounded: true` pada detail review.
- **Release**: review `REVIEWED` + `APPROVED` pada case Arab yang counterevidence-nya sudah
  diselesaikan dan pilot-nya `RECORDED` → `eligible: true`, tetapi `publicationAvailable: false`.
  Review pada case terjemahan tanpa counterevidence/pilot → approval `400` dengan blocker
  `COUNTEREVIDENCE_MISSING` + `PILOT_NEEDS_TWO_INDEPENDENT_ANNOTATIONS`; release tetap `false`.
- **Race**: dua `APPROVE` paralel dengan `expectedVersion: 2` → HTTP `[200, 409]`, tepat satu
  event `APPROVE`, release `eligible: true` dan publikasi tetap `false`.

---

## 5. Verification log

Semua perintah dijalankan dari root worktree `moonradio-m14`; Node 24 LTS, pnpm 10.33.4.

| Command | Result |
|---|---|
| `pnpm build` | pass (seluruh rantai workspace, termasuk `moonql-research` dan `moonql-client`) |
| `pnpm build:web` | pass |
| `pnpm ui:check` | 81 file, 0 violation, PASSED |
| `pnpm lint` | 0 error, 62 warning (pre-existing di `packages/moonql/*` dan tools) |
| `pnpm gen:sdk:check` | generated SDK up to date (`schemaHash f1dd19609a87d617`) |
| `pnpm --filter @moonwitness/radio exec tsx --test test/mizan.test.ts` | 7 test, 7 pass, 0 fail |
| `pnpm --filter @moonwitness/radio exec tsx --test test/dockerfile-contract.test.ts test/moonql-compat.test.ts` | 10 test, 10 pass |
| `pnpm --filter @moonwitness/radio test` | 302 test, 293 pass, 0 fail, 9 skipped |
| `PARITY_DATABASE_URL=… tsx --test test/mizan-pg.test.ts` | 1 test, 1 pass, `moonql.engine === 'pg'`; diulang sekali, lulus dengan angka sama |

### PostgreSQL vertical slice

Container disposable, terpisah dari `moonwitness-db`:

```text
docker run -d --name mw-m14-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=postgres \
  -p 127.0.0.1:55432:5432 postgres:16-alpine
```

Drill M14 membuat user alice/bob, dua review, menyelesaikan kedua counterevidence seed, mencatat
pilot `SUPPORTED` + `CONTRADICTED`, membuat dua run MIZAN, menyetujui review pertama, lalu
membalapkan review kedua: `[200, 409]`, satu event `APPROVE`, SHA persis dan pilot `RECORDED`
terbukti di SQL, release `eligible: true` dengan `publicationAvailable: false`. Cleanup memakai
`removeWhere` (bypass hook) untuk review/event/run/anotasi/user/session dan mengembalikan
counterevidence seed ke `OPEN`, sehingga run kedua lulus dengan angka sama. Container dihentikan
dan dihapus setelah drill; tidak ada container `mw-m14-pg` tersisa.

---

## 6. Limits / follow-ups

- **Tidak ada UI review baru di M14.** Milestone ini mengirim kontrak API + suite; permukaan
  reviewer di HQ dan case view publik menyusul di M20 dan M15-06.
- **Mutex bersifat in-process.** Race antar-proses masih aman secara durabel melalui version CAS
  dan unique `eventKey` (tepat satu pemenang), tetapi tidak ada distributed lock; deployment
  multi-replica perlu mengandalkan dua guard durabel tersebut.
- **Pilot belum dijalankan dengan manusia nyata.** Proses dan kontrak tersedia, tetapi tidak ada
  anotator asli yang di-seed; status pilot tetap `BLOCKED` sampai ada dua annotator bernama.
- **Tidak ada jalur publikasi.** Release hanya kelayakan turunan; M18/M27 yang akan membangun
  state machine publik dan gate rilis.
- MIZAN tetap `CANDIDATE_NOT_RATIFIED` dan bukan penilaian ilahi; tidak ada ranking teologis.
- Counterevidence seed adalah data engineering, bukan temuan reviewer manusia.
- Catatan lingkungan: checkout Windows dengan `core.autocrlf=true` menulis `pnpm-lock.yaml`
  sebagai CRLF; test `dockerfile-contract` membutuhkan salinan kerja LF. Normalisasi EOL lokal
  tidak di-commit dan CI Linux tidak terpengaruh (follow-up yang sama dengan M13).
