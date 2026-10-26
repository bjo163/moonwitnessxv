# MOONWITNESS XV — MASTER TODO & MILESTONE EXECUTION REGISTER

> **Planning baseline · 26 October 2026 · active repo: [bjo163/moonwitnessxv](https://github.com/bjo163/moonwitnessxv), existing `main`.**
> This is a detailed, dependency-gated backlog, **not** evidence tasks have been completed. No new branch or GitHub issue is created. Before execution recheck the current HEAD, source rights and runtime status.

**Read:** [BLUEPRINT.md](BLUEPRINT.md) for the sole XV architecture and ownership contract; [Master Vision Narrative XV](docs/vision/MASTER_VISION_NARRATIVE_XV.md) for history, narrative and interpretive boundaries. **This TODO is the sole planning task/status index**. Avoid copying task progress into vision or independent lists. Real build logs, test results and specific commit SHAs establish completion; an existing file or CI configuration alone does not.

> **Revalidasi M01–M05 (2026-10-26, final):** temuan awal di HEAD `3822657` sudah ditindaklanjuti. Seluruh sisi memakai Node 24 LTS; checkout bersih dan CI pada `fa0f1b5` lulus `pnpm install --frozen-lockfile` + `pnpm verify` (199 test, 197 pass, 2 skipped, 0 fail; [run 40263464402](https://github.com/bjo163/moonwitnessxv/actions/runs/40263464402)). M01-01 dan M01-03 ditutup kembali; M01-05, M01-06, M01-07, M03-03, M03-05, dan M04-05 tetap terbuka. Rincian: [docs/audit/M01-M05-revalidation-2026-10-26.md](file:///z:/project/moonradio/docs/audit/M01-M05-revalidation-2026-10-26.md). Checkbox `[x]` yang bergantung pada test kini diverifikasi di SHA bersih.

## How to interpret and execute

**Priority:** `P0` blocker (security, compatibility, provenance, release); `P1` core product; `P2` improvement/next horizon; `P3` speculative optional research. **Difficulty:** `D1` isolated, `D2` small, `D3` bounded multi-file, `D4` complex with cross-domain tests/review, `D5` high-uncertainty that must first be broken into smaller work packets. These are relative estimates, not promises of elapsed time.

Each task ID `M00-01` is unique here; `M00` in a dependency denotes its entire exit gate. **No corresponding GitHub issues currently exist in XV; do not duplicate past XIV/Corpus issues in XV by ID.**

For each task: recheck `main` HEAD → inspect the named owner and dependencies → prepare scope (prefer ≤3 starting files; justify larger) and tests → implement only the stated behavior → run focused positive/negative tests and relevant `pnpm verify` checks → record SHA, exact commands/results, changed paths, rights source where relevant and reviewer → only then check the box. Never force-push/reset or invent a new branch to make a task run. If a required gate is blocked, report it and preserve `UNKNOWN`.

All checkboxes begin **unchecked**, even where related infrastructure already exists; each refers to a specific *verification or change deliverable*, not merely file presence. A milestone is complete only after its exit gate is demonstrated at a specific SHA.

## Group and milestone map

| Group | Milestones | Purpose |
|---|---|---|
| **G0 — FOUNDATION** | M00–M05 plus **M28 ARSY rename** | Audit, CI, governance, ACL, disaster recovery, API contract |
| **G1 — SOURCE** | M06–M11 | Historic source crosswalk, corpus, reader, lexicon, ontology, figures |
| **G2 — RESEARCH** | M12–M15 | Typed relations, SRGBL/Key Witness, MIZAN, comparative case |
| **G3 — WITNESS & CREATIVE** | M16–M19 | Personal witness, creative canon, publishing, design |
| **G4 — OPERATIONS** | M20–M23 | 100CENTER, optional AI, existing Radio/WA/DENPA, Journey |
| **G5 — OPTIONAL RESEARCH** | M24–M26 | World monitoring, Science/Time, legacy registries and source recovery |
| **G6 — RELEASE** | M27 | Real full-stack tests, privacy, rights and approved launch |

**Scope gate:** The first Reader release does not require Story/SHADOW or AI. Publishing a Story does additionally require M17 source/consent approval; using AI does additionally require M21 security and candidate approval. Do not conflate optional feature gating with first-release gating.

**ARSY migration (ADR-0001):** **M28 is an intentionally appended G0 milestone** (not a late/post-release feature): task IDs M00–M27 are preserved, and M28 must complete **before new Corpus modules and M27 release**. The existing `apps/radio` backend is the technical predecessor of **ARSY**; new target `apps/arsy` and `@moonwitness/arsy` are NOT YET RENAMED. Radio stations and playback remain within ARSY as SIGNAL/RADIO. Source of truth: [ADR-0001](docs/decisions/ADR-0001-arsy-is-xv-hub.md).

**P0 crosscut:** M22 protects Radio from the first engineering change even though grouped in G4. `M03` precedes any private source ingestion, `M04` before production, `M06` before historical data transfer, `M18` before public release. First useful scope is Radio unchanged + QS 2:82 licensed/metadata-only reader + one typed source/term + explicitly reviewed evidence + secure admin and actual restore. G5 must not block that release.

---


## M00 — Baseline reality and audit

**Group:** G0 · **Priority:** P0 · **Prerequisites:** — · **Scope:** apps, packages, README, package.json and runbook.

**Exit gate:** Pinned SHA with actual tested state, route and data owners. **No completion inferred merely from repository files.**

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M00-01** — Snapshot current HEAD and tree for evidence | P0 | D1 | — | SHA `787210b` and package inventory documented in `docs/audit/M00-01-baseline-inventory.md` |
| - [x] | **M00-02** — Map Fastify routes, MoonQL addons and manual module collisions | P0 | D2 | M00-01 | Documented in `docs/audit/M00-02-routes-addons-matrix.md` |
| - [x] | **M00-03** — Pin station seed and existing public envelope | P0 | D2 | M00-02 | Documented in `docs/audit/M00-03-station-seed-envelope.md` |
| - [x] | **M00-04** — Run and record lint, typecheck, build, test status | P0 | D2 | M00-01 | Documented in `docs/audit/M00-04-verification-log.md` (187 tests pass, build:web pass) |
| - [x] | **M00-05** — List auth, cookie, REST, webhook, export and privacy surfaces | P0 | D3 | M00-02 | Documented in `docs/audit/M00-05-auth-privacy-matrix.md` |
| - [x] | **M00-06** — List PG/memory, migrations, backups and restore evidence | P0 | D2 | M00-01 | Documented in `docs/audit/M00-06-db-disaster-recovery.md` |
| - [x] | **M00-07** — Publish discrepancy ledger CODE vs TESTED vs RELEASED vs UNKNOWN | P0 | D2 | M00-03,M00-04,M00-05,M00-06 | Documented in `docs/audit/M00-07-discrepancy-ledger.md` (Exit Gate Verified) |


## M01 — CI, version and release foundation

**Group:** G0 · **Priority:** P0 · **Prerequisites:** M00 · **Scope:** package.json, scripts and proposed GitHub workflows.

**Exit gate:** Repeatable exact-SHA verification without bypass. **No completion inferred merely from repository files.**

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M01-01** — Pin Node and pnpm compatible with lockfile | P0 | D2 | M00-04 | **Ditutup 2026-10-26:** Node 24 LTS (`>=24 <25`) diseragamkan di `.nvmrc`, engines, CI, dan kedua Dockerfile (`b9f527b`); checkout bersih dan CI `fa0f1b5` lulus install + `pnpm verify` ([spesifikasi](file:///z:/project/moonradio/docs/audit/M01-01-toolchain-pin.md)) |
| - [x] | **M01-02** — Define radio + Dock + HQ smoke procedure | P0 | D2 | M00-02 | Documented in `docs/audit/M01-02-smoke-procedure.md` (`pnpm ports:free`, 3-app probe) |
| - [x] | **M01-03** — Configure CI only after checking repository policy | P0 | D3 | M01-01,M01-02 | **Ditutup 2026-10-26:** [run 40263464402](https://github.com/bjo163/moonwitnessxv/actions/runs/40263464402) pada `fa0f1b5` — `Install dependencies` dan `pnpm verify` `success`; CI memakai `node-version-file: .nvmrc`. |
| - [x] | **M01-04** — Enforce generated SDK and schema drift check | P0 | D2 | M01-03 | Documented in `docs/audit/M01-04-sdk-drift-gate.md` (`gen:sdk:check`). **Catatan 2026-10-26:** kini dijalankan CI sebagai bagian `pnpm verify` dan lulus di checkout bersih `fa0f1b5`. |
| - [ ] | **M01-05** — Define semver, changelog and protected release lifecycle | P1 | D3 | M01-03 | **REOPENED 2026-10-26:** tidak ada `CHANGELOG.md`/prosedur changelog dan tidak ada bukti protected branch. |
| - [ ] | **M01-06** — Add dependency and secret-scanning gate | P0 | D3 | M01-03 | **REOPENED 2026-10-26:** tidak ada langkah audit/secret-scan di CI; `.gitignore` tidak memuat pola yang diklaim. |
| - [ ] | **M01-07** — Publish CI evidence ledger and no-bypass rule | P0 | D2 | M01-04,M01-06 | **REOPENED 2026-10-26:** ledger mengklaim "Exit Gate Verified", tetapi 7/7 run CI `failure`. |

**Revalidasi 2026-10-26 (final):** M01-01 dan M01-03 ditutup setelah Node 24 LTS diseragamkan dan CI `fa0f1b5` hijau (install + `pnpm verify`). Exit gate M01 belum penuh karena M01-05 (changelog/protected branch), M01-06 (audit/secret scan), dan M01-07 (ledger bukti) masih terbuka. Bukti: [laporan revalidasi](file:///z:/project/moonradio/docs/audit/M01-M05-revalidation-2026-10-26.md).


## M02 — XV governance and source of truth

**Group:** G0 · **Priority:** P0 · **Prerequisites:** M00 · **Scope:** Blueprint, Vision, future local ADRs.

**Exit gate:** One owner per type and reviewed XV decisions. **No completion inferred merely from repository files.**

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M02-01** — Disambiguate ALLAH/A-L-L-A-H, ZILL, SHADOW and numeric registries | P0 | D2 | M00-07 | Documented in `docs/decisions/M02-01-disambiguation-registry.md` |
| - [x] | **M02-02** — Assign D00–D13 to existing and proposed modules | P0 | D3 | M00-02,M02-01 | Documented in `docs/decisions/M02-02-domain-assignments.md` |
| - [x] | **M02-03** — Draft XV ADR for additive MoonQL domain architecture | P0 | D3 | M02-02 | Ratified in `docs/decisions/ADR-0002-additive-moonql-domains.md` |
| - [x] | **M02-04** — Draft XV ADR for source rights, consent and publishing storage | P0 | D3 | M02-02 | Ratified in `docs/decisions/ADR-0003-source-rights-and-consent.md` |
| - [x] | **M02-05** — Specify stable IDs and versioned legacy refs | P0 | D3 | M02-03 | Documented in `docs/decisions/M02-05-stable-ids-and-legacy-refs.md`. **Dikoreksi 2026-10-26:** prefix Story `st_` → `sa_` (sebelumnya duplikat dengan Stations). |
| - [x] | **M02-06** — Fix single task/status/document hierarchy | P0 | D1 | M02-01 | Documented in `docs/decisions/M02-06-document-hierarchy.md` |
| - [x] | **M02-07** — Review XIV/Empire decisions as historical, not current mandates | P0 | D2 | M02-03,M02-04 | Documented in `docs/decisions/M02-07-historical-decisions-matrix.md` (Exit Gate Verified) |

**Revalidasi 2026-10-26:** semua dokumen M02 ada. Satu defect dikoreksi: M02-05 memakai `st_` untuk Stations dan Story; Story diganti `sa_`.


## M03 — ACL, privacy, consent and abuse prevention

**Group:** G0 · **Priority:** P0 · **Prerequisites:** M00,M02 · **Scope:** MoonQL auth/ACL, Fastify and HQ access.

**Exit gate:** Sensitive data blocked on all unauthorized reads and writes. **No completion inferred merely from repository files.**

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M03-01** — Audit default public list/get/expand/view/export exposure | P0 | D3 | M00-05 | Negative API tests include direct request paths ([docs/audit/M03-01-public-exposure-audit.md](file:///z:/project/moonradio/docs/audit/M03-01-public-exposure-audit.md)). **Dikoreksi 2026-10-26:** `/on-air`, `/listen` 201, `/api-keys`, pseudonym `lp_`; referensi test diperbaiki. |
| - [x] | **M03-02** — Define deny-by-default sensitive addon template | P0 | D3 | M03-01 | Restricted model REST false or explicit guarded ops ([docs/audit/M03-02-deny-by-default-template.md](file:///z:/project/moonradio/docs/audit/M03-02-deny-by-default-template.md)) |
| - [ ] | **M03-03** — Test forged/expired HQ cookies vs Hub auth | P0 | D3 | M03-01 | **REOPENED 2026-10-26:** tidak ada test forged/expired `hq_token`; middleware HQ hanya mengecek keberadaan cookie. [Laporan](file:///z:/project/moonradio/docs/audit/M01-M05-revalidation-2026-10-26.md) |
| - [x] | **M03-04** — Decide tenant and reviewer/editor role boundaries | P0 | D4 | M02-02,M03-02 | Tenant support verified or clearly out of scope ([docs/decisions/M03-04-tenant-role-boundaries.md](file:///z:/project/moonradio/docs/decisions/M03-04-tenant-role-boundaries.md)) |
| - [ ] | **M03-05** — Test token TTL, revocation and API key cache limits | P0 | D3 | M03-03 | **REOPENED 2026-10-26:** revocation/role demotion diuji; TTL expiry dan API-key cache cap belum. |
| - [x] | **M03-06** — Write private witness, minors, copyright and withdrawal policy | P0 | D3 | M02-04 | No automatic import into public Git ([docs/decisions/M03-06-witness-withdrawal-policy.md](file:///z:/project/moonradio/docs/decisions/M03-06-witness-withdrawal-policy.md)) |
| - [x] | **M03-07** — Threat model CSP, logs, egress, DENPA, WA and SSR | P0 | D4 | M03-01,M03-05 | Critical risks receive blocking cases ([docs/audit/M03-07-threat-model.md](file:///z:/project/moonradio/docs/audit/M03-07-threat-model.md)). **Dikoreksi 2026-10-26:** volume WA `whatsapp-session`; klaim `.gitignore` dihapus. |

**Revalidasi 2026-10-26:** M03-01 dan M03-07 dikoreksi; M03-03 dan M03-05 dibuka kembali karena test forged/expired cookie, TTL expiry, dan cache cap tidak ada. Exit gate M03 belum terpenuhi.


## M04 — Database continuity and recovery

**Group:** G0 · **Priority:** P0 · **Prerequisites:** M00 · **Scope:** MoonQL sync/migrations, Docker Compose and restore runbook.

**Exit gate:** Isolated restore actually performed with data equivalence. **No completion inferred merely from repository files.**

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M04-01** — Verify production PG requirement vs memory fallback | P0 | D3 | M00-06 | No accidental production ephemeral storage ([docs/audit/M04-01-production-pg-requirement.md](file:///z:/project/moonradio/docs/audit/M04-01-production-pg-requirement.md)) |
| - [x] | **M04-02** — Define non-additive migration plan beyond autoSync | P0 | D3 | M04-01,M02-05 | Reviewed SQL rollback protects existing records ([docs/decisions/M04-02-migration-rollback-plan.md](file:///z:/project/moonradio/docs/decisions/M04-02-migration-rollback-plan.md)) |
| - [x] | **M04-03** — Execute test DB restore from real dump | P0 | D4 | M04-01 | **Direvalidasi 2026-10-26:** dump `20261025T213120Z` (73.900 B), restore exit 0, 36 stations/21 playlogs ([docs/audit/M04-03-db-restore-execution.md](file:///z:/project/moonradio/docs/audit/M04-03-db-restore-execution.md)) |
| - [x] | **M04-04** — Compare restored station/playlog rows and indexes | P0 | D2 | M04-03 | **Direvalidasi 2026-10-26:** 36 stations/21 playlogs, 9 indeks; angka lama 24 dan `station_envelope_metadata` tidak ada ([docs/audit/M04-04-row-counts-and-indexes.md](file:///z:/project/moonradio/docs/audit/M04-04-row-counts-and-indexes.md)) |
| - [ ] | **M04-05** — Copy backups off host and test retention path | P0 | D3 | M04-03 | **REOPENED 2026-10-26:** masih rencana; tidak ada implementasi rclone/prune, target off-host, atau test retensi ([docs/audit/M04-05-off-host-backup-retention.md](file:///z:/project/moonradio/docs/audit/M04-05-off-host-backup-retention.md)) |
| - [x] | **M04-06** — Test schema upgrade failure and rollback | P0 | D4 | M04-02,M04-03 | **Direvalidasi 2026-10-26:** rollback DDL gagal terbukti di container terisolasi; test otomatis belum ada ([docs/audit/M04-06-schema-upgrade-rollback.md](file:///z:/project/moonradio/docs/audit/M04-06-schema-upgrade-rollback.md)) |
| - [x] | **M04-07** — Update restore runbook with actual drill metadata | P1 | D2 | M04-04,M04-05,M04-06 | **Diperbarui 2026-10-26:** metadata drill aktual (dump, ukuran, hasil, operator revalidasi, batasan) ([docs/runbook-restore.md](file:///z:/project/moonradio/docs/runbook-restore.md)) |

**Revalidasi 2026-10-26:** restore dan rollback DDL diuji ulang di container terisolasi. Dump aktual `moonwitness-20261025T213120Z.dump` (73.900 B) menghasilkan 36 stations/21 playlogs dan 9 indeks; `pg_restore` exit 0. M04-03/04/06/07 diperbarui; M04-05 tetap dibuka karena belum ada backup off-host. Angka lama 24 playlogs/79,6 KB/`station_envelope_metadata` tidak ditemukan. Bukti: [laporan revalidasi](file:///z:/project/moonradio/docs/audit/M01-M05-revalidation-2026-10-26.md).


## M05 — API/SDK and module behavior contracts

**Group:** G0 · **Priority:** P0 · **Prerequisites:** M01,M02 · **Scope:** Fastify generated REST, MoonQL registry, client package.

**Exit gate:** No route duplicates, SDK drift or Radio break. **No completion inferred merely from repository files.**

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M05-01** — Record existing OpenAPI, envelope and error fixtures | P0 | D2 | M00-02 | **Diperbarui 2026-10-26:** sintaks filter aktual `?where=<json>` (diparse `parseWhereJson`), bukan `?where[field]=`; `?total=true` didokumentasikan ([docs/audit/M05-01-api-fixtures.md](file:///z:/project/moonradio/docs/audit/M05-01-api-fixtures.md)) |
| - [x] | **M05-02** — Test duplicate model/view/manual route rejection | P0 | D2 | M05-01 | Collision fails boot and has regression test ([apps/radio/test/api-contracts.test.ts](file:///z:/project/moonradio/apps/radio/test/api-contracts.test.ts)) |
| - [x] | **M05-03** — Define future addon namespace and registration standard | P0 | D2 | M02-02,M05-02 | New feature cannot shadow old radio endpoints ([docs/decisions/M05-03-addon-namespace-standards.md](file:///z:/project/moonradio/docs/decisions/M05-03-addon-namespace-standards.md)) |
| - [x] | **M05-04** — Verify SDK codegen deterministic hash and API version | P0 | D2 | M01-04,M05-01 | Repeat generation gives stable client ([apps/radio/test/api-contracts.test.ts](file:///z:/project/moonradio/apps/radio/test/api-contracts.test.ts)); `gen:sdk:check` lulus di checkout bersih `fa0f1b5` dan di CI |
| - [x] | **M05-05** — Define pagination, filter/expand, locale and UNKNOWN | P1 | D3 | M05-01 | **Dikoreksi 2026-10-26:** stations `maxLimit` 200 (bukan 100); `?limit` di atas maximum ditolak 400 oleh schema, bukan di-clamp; tidak ada filter/locale fallback di MoonQL ([docs/decisions/M05-05-query-standards.md](file:///z:/project/moonradio/docs/decisions/M05-05-query-standards.md)) |
| - [x] | **M05-06** — Document approved old-repo adapter boundaries | P1 | D3 | M02-07,M05-03 | No implicit historical runtime dependency ([docs/decisions/M05-06-adapter-boundaries.md](file:///z:/project/moonradio/docs/decisions/M05-06-adapter-boundaries.md)) |
| - [x] | **M05-07** — Add compatibility smoke for existing clients | P0 | D3 | M05-04,M05-06 | Smoke ada; suite checkout bersih dan CI `fa0f1b5` lulus 197 pass/2 skipped/0 fail ([apps/radio/test/stations.test.ts](file:///z:/project/moonradio/apps/radio/test/stations.test.ts)) |

**Revalidasi 2026-10-26 (final):** kontrak M05 diverifikasi terhadap kode dan test. Tiga dokumen dikoreksi (sintaks `?where`, `maxLimit`/penolakan 400, ketiadaan locale/UNKNOWN di query). Checkout bersih dan CI `fa0f1b5` lulus `build`, `test` (197 pass/2 skipped/0 fail), dan `gen:sdk:check`, sehingga exit gate M05 kini terbukti di SHA bersih. Bukti: [laporan revalidasi](file:///z:/project/moonradio/docs/audit/M01-M05-revalidation-2026-10-26.md).

## M06 — Source crosswalk and historical recovery

**Group:** G1 · **Priority:** P0 · **Prerequisites:** M00 · **Scope:** Historical repos, vision, source index.

**Exit gate:** Pinned provenance and no unauthorized private originals. This is a planning gate, not a completion claim.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M06-01** — Pin source repo SHA and exact path by artifact family | P0 | D2 | M00-07 | Immutable source references for priority families ([docs/audit/M06-01-source-repo-pins.md](file:///z:/project/moonradio/docs/audit/M06-01-source-repo-pins.md)) |
| - [x] | **M06-02** — Crosswalk XIV V10/V10.1/ledger/gap archive | P0 | D3 | M06-01 | 99 editorial chapters not mistaken for original manuscripts ([docs/decisions/M06-02-xiv-v10-crosswalk.md](file:///z:/project/moonradio/docs/decisions/M06-02-xiv-v10-crosswalk.md)) |
| - [x] | **M06-03** — Recover II 13 functions/8 eras/10 world rules | P0 | D2 | M06-01 | Source-specific era and lore evidence ([docs/decisions/M06-03-ii-lore-recovery.md](file:///z:/project/moonradio/docs/decisions/M06-03-ii-lore-recovery.md)) |
| - [x] | **M06-04** — Preserve XII 33 patch statuses and disputed 014 | P0 | D2 | M06-01 | 8+5+1+18+1 registry with zero divine approval inferred ([docs/decisions/M06-04-xii-patches-registry.md](file:///z:/project/moonradio/docs/decisions/M06-04-xii-patches-registry.md)) |
| - [x] | **M06-05** — Inventory Corpus, Empire, A-L-L-A-H, Rocksoul interfaces | P0 | D3 | M06-01 | Owner and compatibility map, not bulk code import ([docs/decisions/M06-05-historical-interfaces-map.md](file:///z:/project/moonradio/docs/decisions/M06-05-historical-interfaces-map.md)) |
| - [x] | **M06-06** — Classify license, privacy, consent and missing media | P0 | D3 | M06-02 | Unknown rights -> metadata-only and NEEDS_SOURCE ([docs/decisions/M06-06-rights-classification.md](file:///z:/project/moonradio/docs/decisions/M06-06-rights-classification.md)) |
| - [x] | **M06-07** — Publish source crosswalk, gaps and reviewer queue | P0 | D3 | M06-03,M06-04,M06-05,M06-06 | Source IDs and constraints auditable ([docs/audit/M06-07-source-crosswalk-queue.md](file:///z:/project/moonradio/docs/audit/M06-07-source-crosswalk-queue.md)) |


## M07 — Corpus source rights and ingestion pilot

**Group:** G1 · **Priority:** P0 · **Prerequisites:** M03,M04,M06,M28 · **Scope:** Proposed text addon, rights registry, source API.

**Exit gate:** QS 2:82 exact source/edition metadata without illegal raw bytes. This is a planning gate, not a completion claim.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M07-01** — Inventory historical multi-tradition dataset editions/licenses | P0 | D3 | M06-05 | Folder existence not confused with cleared source ([docs/audit/M07-01-editions-licenses-inventory.md](file:///z:/project/moonradio/docs/audit/M07-01-editions-licenses-inventory.md)) |
| - [x] | **M07-02** — Design artifact/work/edition/passage identity version schema | P0 | D3 | M02-05,M07-01 | Each citation points to real resolvable source ([docs/decisions/M07-02-corpus-identity-schema.md](file:///z:/project/moonradio/docs/decisions/M07-02-corpus-identity-schema.md)) |
| - [x] | **M07-03** — Prototype metadata-only catalog using existing MoonQL extension | P0 | D4 | M07-02,M03-02 | No sensitive or unlicensed text exposed ([packages/moonql-corpus/src/index.ts](file:///z:/project/moonradio/packages/moonql-corpus/src/index.ts)) |
| - [x] | **M07-04** — Apply rights veto for edition-specific text publication | P0 | D3 | M07-03,M03-06 | Rights unknown blocks bytes, not safe metadata ([docs/decisions/M07-04-rights-veto-policy.md](file:///z:/project/moonradio/docs/decisions/M07-04-rights-veto-policy.md)) |
| - [x] | **M07-05** — Create permission-verified QS 2:82 sample selectors | P0 | D2 | M07-02,M07-04 | No made-up Arabic or translated passage ([packages/moonql-corpus/src/index.ts](file:///z:/project/moonradio/packages/moonql-corpus/src/index.ts)) |
| - [x] | **M07-06** — Map foreign RGBL IDs without canonical duplication | P0 | D3 | M06-07,M07-05 | Source identity mapping preserves exact legacy reference ([apps/radio/test/corpus-ingestion.test.ts](file:///z:/project/moonradio/apps/radio/test/corpus-ingestion.test.ts)) |
| - [x] | **M07-07** — Test idempotent import, retries, deletion/retraction | P0 | D4 | M07-03,M07-06 | No duplicate on replay, reviewer/rights in log ([apps/radio/test/corpus-ingestion.test.ts](file:///z:/project/moonradio/apps/radio/test/corpus-ingestion.test.ts)) |


## M08 — Source-first Corpus Reader

**Group:** G1 · **Priority:** P0 · **Prerequisites:** M05,M07 · **Scope:** Dock Reader routes, generated client, MoonUI.

**Exit gate:** Reader trace and metadata-only fallback verified on real PG. This is a planning gate, not a completion claim.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M08-01** — Design UI states for source, absent, ambiguous, rights-blocked | P0 | D2 | M07-05 | States implemented in `/corpus/reader` + Dock Reader; absent/ambiguous tests and 28-check SSR drill ([evidence](file:///z:/project/moonradio/docs/audit/M08-reader-vertical-slice.md)) |
| - [x] | **M08-02** — Render work, edition, language, permission and source | P0 | D3 | M08-01 | QS 2:82 identity asserted in `apps/radio/test/corpus-reader.test.ts` and on PG (`corpus-reader-pg.test.ts`) |
| - [x] | **M08-03** — Add context and licensed parallel translation display | P1 | D3 | M08-02,M07-04 | Arabic separated from translations with language tags; Kemenag text only on cleared edition/translation |
| - [x] | **M08-04** — Add reproducible citation with selector and version | P0 | D2 | M08-02 | Citation includes edition code, provenance SHA, source date, retrieval; labelled copy button and focusable citation block |
| - [x] | **M08-05** — Test missing/forbidden/right-unknown Reader behavior | P0 | D3 | M08-03,M03-02 | Raw REST 401; blocked edition/translation withheld; absent/invalid covered in memory and PG tests |
| - [x] | **M08-06** — Test Arabic RTL, mobile, accessibility and keyboard | P0 | D3 | M08-03 | `apps/dock/scripts/verify-reader-ui.tsx` — 28 checks (RTL/lang, labels, focus, mobile breakpoint, nav) |
| - [x] | **M08-07** — Complete QS 2:82 API/PG/Reader/Reviewer vertical slice | P0 | D4 | M08-04,M08-05,M08-06 | PG drill + `corpus-reviewer.test.ts`: admin REST and public Reader return the same edition, provenance, URI and source date |

**Revalidasi 2026-10-26 (`9a31351`, baseline `f517fb8`):** corpus addon terpasang di hub; `corpus_passages`/`corpus_translations` menjadi `ADMIN_FULL` dengan unique `(citationKey, editionRef)`; `GET /corpus/reader` menjadi satu-satunya proyeksi teks publik dengan rights veto. Dock `/reader` menampilkan identitas sumber, Arabic RTL, terjemahan berlisensi, sitasi reproducible, serta state absent/ambiguous/rights-blocked. Suite penuh 215 test (212 pass, 3 skipped, 0 fail), build radio + Dock lulus, `gen:sdk:check` lulus (`1fa620155ba520bf`), drill PG nyata `engine=pg` lulus, drill UI 28/28. CI pada `61cc3ef` lulus ([run 40265719999](https://github.com/bjo163/moonwitnessxv/actions/runs/40265719999)). Bukti lengkap: [laporan M08](file:///z:/project/moonradio/docs/audit/M08-reader-vertical-slice.md).


## M09 — UNILEX and multilingual terminology

**Group:** G1 · **Priority:** P1 · **Prerequisites:** M06,M07 · **Scope:** Terms addon and term/meaning frontend view.

**Exit gate:** Scoped language/sense registry, no forced synonyms. This is a planning gate, not a completion claim.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M09-01** — Recover Empire UNILEX seed and review status | P1 | D2 | M06-05 | 71 seed concepts not called validated universal dictionary |
| - [ ] | **M09-02** — Define term, source language, script and sense schema | P1 | D3 | M09-01 | Every term has source, context and editorial status |
| - [ ] | **M09-03** — Test ALLAH/ARSY/ZILL and naming confusions | P1 | D2 | M09-02 | Theological and fictional senses stay separate |
| - [ ] | **M09-04** — Build exact/near/different matching review rules | P1 | D3 | M09-03 | Phonetic resemblance never silently sameAs |
| - [ ] | **M09-05** — Build a Terms Table as projection, not second vocabulary | P1 | D3 | M09-02,M05-05 | Search filters terms by approved source and scope |
| - [ ] | **M09-06** — Test mixed Arabic/Hebrew/Greek input and transliteration | P1 | D3 | M09-05 | Diacritics and RTL identities retained |
| - [ ] | **M09-07** — Define stable term ID correction/deprecation process | P1 | D2 | M09-04,M09-06 | Old senses preserved with reviewer reasoning |


## M10 — Ontology, alias and identity review

**Group:** G1 · **Priority:** P1 · **Prerequisites:** M02,M09 · **Scope:** Ontology addon, typed relation and HQ reviewer.

**Exit gate:** No automatic sameAs, graph candidates and conflicting sources visible. This is a planning gate, not a completion claim.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M10-01** — Define actor/entity/character/alias and typed edge contracts | P1 | D3 | M09-04,M02-05 | Separate kinds and versioned identity |
| - [ ] | **M10-02** — Make identity merge a reviewer-approved candidate action | P1 | D4 | M10-01,M03-04 | No automatic destructive merger |
| - [ ] | **M10-03** — Register source and perspective-scoped relation edges | P1 | D3 | M10-01 | Unknown/disputed relation not labeled verified |
| - [ ] | **M10-04** — Test ZILL/ZIIL, THE BATTERY/ALLAH, SHADOW variants | P1 | D2 | M10-02,M09-03 | Negative identity decisions preserved |
| - [ ] | **M10-05** — Build Constellation as read-only graph projection | P1 | D3 | M10-03 | Same graph ID as backend, no second graph authority |
| - [ ] | **M10-06** — Test split, corrections and invalid temporal merges | P1 | D4 | M10-02,M10-05 | Review rollback and source lineage survive |
| - [ ] | **M10-07** — Document reviewer conflict queue and evidence rubric | P1 | D2 | M10-04,M10-06 | UNKNOWN can remain unresolved |


## M11 — Figure/Event and Prophetic Mission Table

**Group:** G1 · **Priority:** P1 · **Prerequisites:** M07,M10 · **Scope:** Figure registry, event references, Dock view.

**Exit gate:** One actor record with tradition-scoped missions and references. This is a planning gate, not a completion claim.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M11-01** — Collect sourced prophet/mission/context examples | P1 | D2 | M07-05,M06-07 | No unsupported exclusive mission assertions |
| - [ ] | **M11-02** — Separate real actor vs historical report vs creative avatar | P1 | D3 | M10-01,M11-01 | No prophet impersonation |
| - [ ] | **M11-03** — Represent source-linked events, place and chronology confidence | P1 | D3 | M11-02 | Timelines preserve tradition vs history |
| - [ ] | **M11-04** — Build Prophetic Mission as Figure Registry filtered view | P1 | D3 | M11-02,M11-03 | No duplicate prophet database |
| - [ ] | **M11-05** — Add competing tradition and source-specific reading panel | P1 | D3 | M11-04 | No forced merged doctrine |
| - [ ] | **M11-06** — Test role/alias collisions and religious ranking failures | P1 | D3 | M11-05,M10-06 | Same named figure not automatically same referent |
| - [ ] | **M11-07** — Document 25 avatars as pedagogy, no religious authority | P2 | D2 | M11-06 | No AI claiming to be a prophet |


## M12 — Typed correlation and evidence graph

**Group:** G2 · **Priority:** P1 · **Prerequisites:** M10,M11 · **Scope:** Source-aware graph relation contracts and projections.

**Exit gate:** Candidate edges and reviewed graph releases separated. Evidence at exact SHA required.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M12-01** — Audit Rocksoul STORY/EVENT/PERSON/TEXT/LAW/PERSPECTIVE boundaries | P1 | D2 | M06-05 | No source owner duplication |
| - [ ] | **M12-02** — Define typed candidate edge with evidence span and frame | P1 | D3 | M10-03,M12-01 | Missing evidence cannot be approved edge |
| - [ ] | **M12-03** — Design immutable graph release pointer and rollback | P1 | D3 | M12-02,M02-05 | Exactly one versioned active release at a time |
| - [ ] | **M12-04** — Implement rebuildable adjacency/search view from canonical records | P1 | D4 | M12-03 | Derived graph can be dropped and reconstructed |
| - [ ] | **M12-05** — Add false identity and chronology counterexample fixtures | P1 | D3 | M12-02 | Similarity and co-occurrence never auto sameAs |
| - [ ] | **M12-06** — Build Constellation relation detail with provenance and unknown | P1 | D3 | M12-04,M12-05 | Candidate and approved relation clearly labeled |
| - [ ] | **M12-07** — Test export/replay/dedup and revoked edge visibility | P1 | D4 | M12-03,M12-06 | Graph release and source lineage correct |


## M13 — SRGBL v8, Key Witness and SWING

**Group:** G2 · **Priority:** P1 · **Prerequisites:** M07,M12 · **Scope:** Bounded method contracts and evidence-linked analysis.

**Exit gate:** S1–L5 and independent scores with fail-closed UNKNOWN. Evidence at exact SHA required.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M13-01** — Read SRGBL P19 specs, issue register and unresolved gates | P1 | D2 | M07-07 | Engineering commit not mistaken for human review |
| - [ ] | **M13-02** — Implement S1 exact edition, rights and source sense gate | P1 | D3 | M13-01 | Unresolved source stays unknown |
| - [ ] | **M13-03** — Implement R2 text claim and G3 defensible relation checks | P1 | D3 | M13-02,M12-05 | Speculation never presented as source |
| - [ ] | **M13-04** — Implement B4 actor/recipient/context and research lens | P1 | D3 | M13-03,M11-06 | Blank frame and unsupported identity rejected |
| - [ ] | **M13-05** — Implement L5 scoped derived interpretation and trace | P1 | D3 | M13-04 | One cited conclusion with limits, not divine judgment |
| - [ ] | **M13-06** — Keep maturity/15, quality/40, witness/100, direction separate | P1 | D3 | M13-05 | No theological truth ranking or score merge |
| - [ ] | **M13-07** — Test SWING, Positive Correction, OFFSIDE adversarial hypotheses | P1 | D4 | M13-06 | Hypothesis must cite and cannot self-validate |


## M14 — MIZAN and human research review

**Group:** G2 · **Priority:** P1 · **Prerequisites:** M03,M13 · **Scope:** Reviewer workflow, counterevidence, decisions, retractions.

**Exit gate:** No source or AI candidate auto-approved. Evidence at exact SHA required.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M14-01** — Design role-scoped draft/submitted/reviewed/disputed machine | P1 | D3 | M13-05,M03-04 | Named human actor transitions only |
| - [ ] | **M14-02** — Build evidence/counterevidence reviewer detail | P1 | D3 | M14-01 | Exact source ID and version inspectable |
| - [ ] | **M14-03** — Prepare real paired human annotator pilot process | P1 | D4 | M14-02 | Independent agreement actually recorded or BLOCKED |
| - [ ] | **M14-04** — Implement bounded MIZAN method version and explanation | P1 | D3 | M13-06,M14-01 | Explicit criterion and context for score |
| - [ ] | **M14-05** — Add rejection/revision/retraction with immutable decision trail | P1 | D3 | M14-02 | Old decisions preserved while correcting |
| - [ ] | **M14-06** — Test wrong-role, forged evidence and concurrent approval | P1 | D4 | M14-03,M14-05 | No unapproved publish on race |
| - [ ] | **M14-07** — Define human release criteria for reviewed knowledge claims | P1 | D2 | M14-04,M14-06 | Incomplete pilot remains not-public |


## M15 — Interdisciplinary historical comparison pilot

**Group:** G2 · **Priority:** P1 · **Prerequisites:** M12,M14 · **Scope:** Reviewed case narrative and separated source domains.

**Exit gate:** Jerusalem 70 CE case makes TEXT, EVENT, PERSON, STORY distinct. Evidence at exact SHA required.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M15-01** — Resolve Mark 13:2 exact edition and rights | P1 | D2 | M07-05 | Correct source reference with permission |
| - [ ] | **M15-02** — Record Jerusalem 70 CE event attestation and counterevidence | P1 | D3 | M15-01 | Historical chronology distinct from religious claim |
| - [ ] | **M15-03** — Record Josephus source and transmission scope | P1 | D2 | M11-03,M15-02 | Actor report has explicit source attribution |
| - [ ] | **M15-04** — Define attributed prophecy interpretation and opposing frames | P1 | D3 | M13-07,M15-03 | No automatic miraculous-fulfillment verdict |
| - [ ] | **M15-05** — Link TEXT/EVENT/PERSON/STORY typed reviewed candidates | P1 | D4 | M12-06,M15-04 | Cross-domain identities not merged |
| - [ ] | **M15-06** — Build evidence-centered public explanatory case view | P1 | D3 | M15-05,M14-07 | Review state and uncertainties visible |
| - [ ] | **M15-07** — Test false temporal matches and unsupported identity edges | P1 | D4 | M15-06 | Adversarial cases cannot pass as proof |


## M16 — Private witness archive and consent lifecycle

**Group:** G3 · **Priority:** P1 · **Prerequisites:** M03,M04,M06 · **Scope:** Private witness addon and protected editor.

**Exit gate:** Original, reported times, consent/correction and withdrawal honored. Evidence at exact SHA required.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M16-01** — Specify private witness object and provenance categories | P1 | D3 | M03-06,M06-07 | Default private, no automatic public original |
| - [ ] | **M16-02** — Preserve occurred/observed/recorded/written dates separately | P1 | D3 | M16-01 | Tick-Tock corrected chronology remains exact |
| - [ ] | **M16-03** — Implement immutable original and appended correction lineage | P1 | D4 | M16-02,M04-02 | Original bytes not overwritten by summary |
| - [ ] | **M16-04** — Gate upload and viewing by consent and explicit ACL | P1 | D4 | M16-03,M03-02 | No anonymous access or media link leakage |
| - [ ] | **M16-05** — Provide redacted derivative preview for human publishing request | P1 | D3 | M16-04 | Privacy review before any public output |
| - [ ] | **M16-06** — Test consent withdrawal, retention and search/export purge | P1 | D4 | M16-05 | Withdrawn testimony not retrievable publicly |
| - [ ] | **M16-07** — Label testimony vs empirical claim vs fiction in every projection | P1 | D2 | M16-06 | No unverified spiritual message asserted as fact |


## M17 — Story canon, characters, four books and SHADOW

**Group:** G3 · **Priority:** P1 · **Prerequisites:** M06,M16 · **Scope:** Story addon, HQ creative workbench, asset provenance.

**Exit gate:** Canonical story versions and source gaps remain transparent. Evidence at exact SHA required.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M17-01** — Map II eight eras, crew and XII/XIV story versions to identities | P1 | D3 | M06-03,M16-01 | Separate character/actor IDs with source locator |
| - [ ] | **M17-02** — Implement false-alias prevention for Shadow/Batteries/Honey/ZILL | P1 | D3 | M17-01,M10-04 | No phonetic or mystical sameAs |
| - [ ] | **M17-03** — Define story world, arc, episode, scene and version graph | P1 | D3 | M17-02 | 99 chapter headings not treated as 99 originals |
| - [ ] | **M17-04** — Record four-book THE BATTERIES and separate NPD variants gaps | P1 | D2 | M17-03 | Missing scene/pages marked NEEDS_SOURCE |
| - [ ] | **M17-05** — Build SHADOW editor as HQ workspace on shared auth | P1 | D4 | M17-03,M03-02 | Private drafts and revision permissions controlled |
| - [ ] | **M17-06** — Track original poster/music/derived media license and manifests | P1 | D3 | M17-05 | No unlicensed lyrics or external artwork |
| - [ ] | **M17-07** — Test chronology, alias conflict and unpublished image access | P1 | D4 | M17-06,M16-06 | Draft never visible in public Story |


## M18 — One publication and retraction gate

**Group:** G3 · **Priority:** P1 · **Prerequisites:** M03,M14,M07 · **Scope:** Source rights, review release and public projections.

**Exit gate:** Only reviewed/consented versions visible and retractable. Do not infer completion from code inventory alone.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M18-01** — Specify single publish state machine for text, testimony and story | P1 | D3 | M14-07,M07-07 | One approval path with type-specific rights veto; Story-specific release additionally needs M17 |
| - [ ] | **M18-02** — Store edition/body license, media consent and reviewer evidence | P1 | D3 | M18-01 | No unknown-rights byte published |
| - [ ] | **M18-03** — Create immutable release manifest and current-version pointer | P1 | D3 | M18-01,M12-03 | Public read refers to one approved revision |
| - [ ] | **M18-04** — Implement withdrawal, correction, takedown and appeal process | P1 | D4 | M18-03,M03-06 | Revoked content ceases public availability |
| - [ ] | **M18-05** — Invalidate search, preview, export and generated cache on revoke | P1 | D4 | M18-04 | No revoked content leaks from projections |
| - [ ] | **M18-06** — Display reviewer scope, source and original-vs-derivative label | P1 | D3 | M18-03 | No AI or copywriting masquerades as original source |
| - [ ] | **M18-07** — Test concurrent publish, wrong role and rollback/replay | P1 | D4 | M18-05,M18-06 | Unapproved public data remains denied |


## M19 — Design system, accessibility and frontend experience

**Group:** G3 · **Priority:** P1 · **Prerequisites:** M05,M08 · **Scope:** MoonUI, Dock, HQ and external design references.

**Exit gate:** Accessible four interaction modes without breaking old radio design. Do not infer completion from code inventory alone.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M19-01** — Audit MoonUI vs Moonframe vs Rocksoul asset ownership | P1 | D2 | M05-07 | One UI component contract with checked external rights |
| - [ ] | **M19-02** — Define Reader/Research/Story/Operator layout/typography tokens | P1 | D3 | M19-01 | Design intentional differences without semantic drift |
| - [ ] | **M19-03** — Map public information architecture and responsive search flows | P1 | D3 | M08-02,M19-02 | Reader not buried under 30 equal nav labels |
| - [ ] | **M19-04** — Implement keyboard/focus/errors/reduced motion accessibility | P1 | D3 | M19-03 | Basic WCAG-oriented interactions functional |
| - [ ] | **M19-05** — Test Arabic/Hebrew/Greek scripts, RTL and diacritics | P1 | D3 | M19-04 | Unicode and text-selection meaning retained |
| - [ ] | **M19-06** — Create screenshot and behavioral baseline across experience modes | P1 | D3 | M19-03,M19-05 | Visual snapshots complement behavioral tests |
| - [ ] | **M19-07** — Run J01/J03 browser acceptance; J05 only when Story is in release scope | P1 | D4 | M19-06 | Selected-scope flows pass with accessibility; optional Story cannot block Reader |


## M20 — Headquarters and 100CENTER human governance

**Group:** G4 · **Priority:** P1 · **Prerequisites:** M14,M18 · **Scope:** Existing HQ, models/views, audit and proposed review areas.

**Exit gate:** Single admin authorization, task and review workspace. Do not infer completion from code inventory alone.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M20-01** — Audit HQ generic model UI, route guards and existing ops widgets | P1 | D2 | M00-02,M14-01 | Existing features reused, not duplicate admin app |
| - [ ] | **M20-02** — Design role-scoped review queue and work item lifecycle | P1 | D3 | M20-01,M18-01 | No account may approve its own restricted submission |
| - [ ] | **M20-03** — Display rights/import blockers and reviewed source status | P1 | D3 | M20-02 | Editors can distinguish metadata-only vs released |
| - [ ] | **M20-04** — Create identity/alias and evidence reviewer panels | P1 | D3 | M20-02,M10-06 | Reviewer resolves with source and conflict links |
| - [ ] | **M20-05** — Improve audit actor attribution, retention and reliability contract | P1 | D4 | M20-02,M03-07 | No assumption existing async audit is immutable |
| - [ ] | **M20-06** — Build 100CENTER view for ordinary human task/incident decisions | P1 | D3 | M20-03,M20-05 | No supernatural mandate or automatic irreversible action |
| - [ ] | **M20-07** — Test direct URL, API role and stale-cookie access to HQ sections | P1 | D3 | M20-06 | Server denies unauthorized operations |


## M21 — Optional local AI research assistant candidate workflow

**Group:** G4 · **Priority:** P2 · **Prerequisites:** M03,M14 · **Scope:** Optional AI execution, candidate inbox and source-grounded retrieval.

**Exit gate:** No hidden remote fallback, no auto write/publish, deterministic fallback. Do not infer completion from code inventory alone.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M21-01** — Evaluate local model constraints, runtime/privacy and disable switch | P2 | D3 | M14-07,M03-07 | Service operates correctly with AI absent |
| - [ ] | **M21-02** — Define versioned AI candidate and tool-call evidence schema | P2 | D3 | M21-01 | Records model, prompt, data provenance and user consent |
| - [ ] | **M21-03** — Prototype source-permission-aware retrieval, not open private files | P2 | D4 | M07-07,M21-02 | Restricted bytes cannot reach unauthorized model/user |
| - [ ] | **M21-04** — Guard prompt injection, egress and tool permissions | P2 | D4 | M21-03 | Untrusted source cannot issue executable instructions |
| - [ ] | **M21-05** — Implement HQ review inbox for AI-suggested claims or edits | P2 | D3 | M21-02,M20-02 | Human reviewer required for canonical action |
| - [ ] | **M21-06** — Prove source/research UI usable with AI unavailable | P2 | D2 | M21-01 | No critical path depends on AI inference |
| - [ ] | **M21-07** — Test forged citations, scope bypass and auto-publication denial | P2 | D4 | M21-04,M21-05,M21-06 | Unauthorized requests blocked and recorded |


## M22 — Radio, channels and Signal backward compatibility

**Group:** G4 · **Priority:** P0 · **Prerequisites:** M00,M01,M03 · **Scope:** Existing radio, addons, Dock, WhatsApp and DENPA.

**Exit gate:** All current Signal flows remain functional while XV grows. Do not infer completion from code inventory alone.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M22-01** — Freeze actual station seed/catalog response before change | P0 | D2 | M00-03 | Source fixture and known stream state recorded |
| - [ ] | **M22-02** — Test player, playlog pseudonyms, listening beacons and schedules | P0 | D3 | M22-01 | No listener identity or playback regression |
| - [ ] | **M22-03** — Verify DENPA opt-in, webhook token and payload validation | P0 | D3 | M03-07 | Unauthenticated inbound cannot write |
| - [ ] | **M22-04** — Review WhatsApp QR/session lifecycle and disabled-default behavior | P0 | D3 | M03-07 | Credentials protected and no surprise channel startup |
| - [ ] | **M22-05** — Protect OpenAPI and root Hub service discovery contracts | P0 | D2 | M05-07,M22-01 | No renamed existing API or SDK entries |
| - [ ] | **M22-06** — Test private playlogs, admin metrics and public catalogue isolation | P0 | D3 | M22-02,M03-02 | No private model data via list/search |
| - [ ] | **M22-07** — Publish reusable Radio regression suite for all future gates | P0 | D2 | M22-03,M22-04,M22-05,M22-06 | Run before and after each integration |


## M23 — Voluntary Journey, Missions, 33 Patches and Empire vocabulary

**Group:** G4 · **Priority:** P2 · **Prerequisites:** M18,M20 · **Scope:** Optional journey module and editorial registry.

**Exit gate:** Human action tracked voluntarily without faith/salvation rankings. Do not infer completion from code inventory alone.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M23-01** — Preserve 33 patch titles, 014 conflict and all reported statuses | P2 | D2 | M06-04 | No fabricated divine approval or external submission |
| - [ ] | **M23-02** — Define self/community/global consent and member scopes | P2 | D3 | M03-06,M20-06 | Global cannot imply authority over personal accounts |
| - [ ] | **M23-03** — Model Path/Journey/Milestone/expiring human Mandate | P2 | D3 | M23-02 | Consent, revoke and responsible operator recorded |
| - [ ] | **M23-04** — Index nine Prime Code, 10 WINGS and GOD99 as separate metadata | P2 | D2 | M06-05 | No programmatic angel/god identities |
| - [ ] | **M23-05** — Prototype human-owned mission checklist with rollback | P2 | D3 | M23-03 | No automatic high-consequence world patch |
| - [ ] | **M23-06** — Keep AETHERION 10 realms and 100 levels as fictional game system | P2 | D2 | M23-04 | XP never equated with human age, holiness or heaven |
| - [ ] | **M23-07** — Adversarial test for spiritual ranking, unauthorized mission actions | P2 | D3 | M23-05,M23-06 | Human agency and stated metaphoric boundaries enforced |


## M24 — World Monitor and sourced external observations

**Group:** G5 · **Priority:** P2 · **Prerequisites:** M03,M05,M06 · **Scope:** Optional world addon and historical A-L-L-A-H adapters.

**Exit gate:** Attributable timestamped provider data with clear offline/freshness states. Only real evidence closes this gate.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M24-01** — Audit A-L-L-A-H USGS/GDACS/NOAA/Open-Meteo historical code and terms | P2 | D2 | M06-05 | Historical fixtures not mislabeled live production |
| - [ ] | **M24-02** — Specify source, units, geo precision, temporal and revision model | P2 | D3 | M24-01 | Every observation linked to provider and timestamp |
| - [ ] | **M24-03** — Design controlled outbound egress, quotas, retry and caching | P2 | D3 | M03-07,M24-02 | No uncontrolled alert bot or external fetch |
| - [ ] | **M24-04** — Prototype one feature-flagged read-only provider adapter | P2 | D4 | M24-03 | Fails safely when provider/terms/connection missing |
| - [ ] | **M24-05** — Build source-backed public World Monitor with stale flags | P2 | D3 | M24-04 | Not showing stale fixtures as live observations |
| - [ ] | **M24-06** — Review YouTube Sentinel moderation, appeal, classification lens | P2 | D4 | M24-01,M03-06 | No automated punitive action or unsupported theology certainty |
| - [ ] | **M24-07** — Test invalid/late/offline feed, timezone, geographic ambiguity | P2 | D4 | M24-05,M24-06 | Degraded provider displays uncertainty and source state |


## M25 — Time, Cosmos, Earth science and research horizons

**Group:** G5 · **Priority:** P3 · **Prerequisites:** M06,M24 · **Scope:** MTS, Cosmic Atlas, Atmosphere, HELIOGRID and Material Forge concepts.

**Exit gate:** Scientifically honest hypothesis map with no fake working device. Only real evidence closes this gate.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M25-01** — Audit M-TIME/Antikythera claims and engineering dependencies | P3 | D3 | M06-05 | UTC/celestial model and narrative time kept distinct |
| - [ ] | **M25-02** — Separate physical readings, simulation, astronomy and story modes | P3 | D2 | M24-02 | UI ontology has explicit claim type and source |
| - [ ] | **M25-03** — Design HELIOGRID/Material Forge falsifiable research questions | P3 | D3 | M06-05 | No generator/quantum chip claimed built |
| - [ ] | **M25-04** — Define unit normalization, measurement/calibration and source metadata | P3 | D3 | M25-02,M25-03 | No simulated values presented as sensor data |
| - [ ] | **M25-05** — Sketch optional Cosmos/Time explorer with proposal label | P3 | D2 | M25-01 | Not discoverable as shipped feature |
| - [ ] | **M25-06** — Research source context of comparative cosmos in sacred traditions | P3 | D3 | M25-02,M07-05 | Historical/scripture/scientific claims separated |
| - [ ] | **M25-07** — Prepare cost/safety/hardware feasibility decision before execution | P3 | D4 | M25-04,M25-06 | No hardware effort without empirical review |


## M26 — Legacy canon, Empire registries and missing sources

**Group:** G5 · **Priority:** P2 · **Prerequisites:** M06,M17 · **Scope:** V10/V10.1, II/XII, GOD-PROMISE, 25 Amanah and source gaps.

**Exit gate:** Versioned comprehensive archive inventory with honest unresolved entries. Only real evidence closes this gate.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M26-01** — Crosswalk 99 chapter labels to actual source versions | P2 | D3 | M06-02 | All slots indexed without falsely claiming 99 manuscripts |
| - [ ] | **M26-02** — Recover 00-MAIN GOD PROMISE distinct from ROCKSOUL/paper | P2 | D3 | M06-06 | Different originals not automatically merged |
| - [ ] | **M26-03** — Recover four THE BATTERIES books, NPD scenes, 15 synopsis sources | P2 | D4 | M26-01 | Missing pages, chronology and rights explicitly recorded |
| - [ ] | **M26-04** — Reconcile ZILL origins, Honey/Queen R, and story alias variants | P2 | D3 | M26-01,M10-04 | Ambiguous identities stay disputed |
| - [ ] | **M26-05** — Audit Empire nine principles, WINGS 10, G.O.D.99 and Asma registry | P2 | D2 | M06-05 | Independent taxonomy/permission kinds confirmed |
| - [ ] | **M26-06** — Locate exact 25 Bidang Amanah source and mission mapping | P2 | D4 | M26-05 | 25 evidence rows or explicitly unverified, never guessed names |
| - [ ] | **M26-07** — Audit early ZENIX/Universe history, AGE CODE and lost-source leads | P2 | D3 | M26-01 | Reported history vs repo evidence clearly tagged |


## M27 — Full-stack acceptance, release evidence and human go/no-go

**Group:** G6 · **Priority:** P0 · **Prerequisites:** M01,M03,M04,M08,M14,M18,M19,M20,M22,M28 · **Scope:** Exact release SHA, selected-scoped features, real tests and restore.

**Exit gate:** No publication until security/rights/data/recovery passes. Only real evidence closes this gate.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M27-01** — Freeze intended release feature set and exact commit manifest | P0 | D2 | M01-07,M20-07,M28-07 | Experimental optional features excluded unless separately accepted |
| - [ ] | **M27-02** — Execute build/lint/typecheck/tests/SDK/PG/docker matrix | P0 | D4 | M27-01 | Actual logs and pass/fail at source SHA |
| - [ ] | **M27-03** — Execute Radio + Reader + HQ security/browser E2E | P0 | D4 | M27-02,M19-07,M22-07 | User journeys J01/J03/J07 pass, denied role tests visible |
| - [ ] | **M27-04** — Restore isolated backup and prove row/manifest integrity | P0 | D3 | M04-07,M27-01 | Recovery run recorded and verified |
| - [ ] | **M27-05** — Complete licensing, consent, research review and AI scope gates | P0 | D3 | M18-07,M14-07 | No unreviewed/rights-unknown raw source publicly served |
| - [ ] | **M27-06** — Generate changelog, release notes and rollback/resume contract | P0 | D2 | M27-02,M27-05 | Exact SHA, binary outputs and migration steps recorded |
| - [ ] | **M27-07** — Hold human release go/no-go and log remaining risks | P0 | D2 | M27-03,M27-04,M27-06 | Only approved and tested scope deployed |


---


## M28 — ARSY Hub rename and compatibility migration

**Group:** G0 (Foundation) · **Priority:** P0 · **Prerequisites:** M00,M05,M22-01 · **Scope:** Existing `apps/radio`, workspace package, root scripts, pnpm lock, Docker Compose and Dockerfiles, current and future API environment names, test coverage, README and developer runbooks.

**Exit gate:** **`ARSY` becomes the single physical Fastify/MoonQL/API hub** at `apps/arsy` and `@moonwitness/arsy`; there is no second `apps/radio` runtime, while existing **Radio/SIGNAL** features, port `3000`, API routes and data remain compatible. Naming acceptance is ratified in [ADR-0001](docs/decisions/ADR-0001-arsy-is-xv-hub.md); actual code migration and tests remain unchecked.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M28-01** — Inventory all hub-name references and freeze old API/Radio fixtures | P0 | D2 | M00-02,M22-01 | Capture references in root scripts, lock importer, Dockerfiles, Compose DNS, frontend BFFs, env aliases, tests, generated SDK, metrics and runbooks with source SHA |
| - [ ] | **M28-02** — Ratify ARSY technical compatibility map using accepted ADR-0001 | P0 | D2 | M28-01,M02-03 | Specify names, safe deprecated env aliases, public routes, port `3000`, DB and no-duplicate-Hub rule; no unreviewed breaking change |
| - [ ] | **M28-03** — Move, not copy, backend workspace `apps/radio` to `apps/arsy` | P0 | D4 | M28-02 | Rename `@moonwitness/radio` to `@moonwitness/arsy`; preserve module/ORM logic and single process; no duplicated models or migrations |
| - [ ] | **M28-04** — Migrate package filters, pnpm lock, Dockerfiles, Compose and runners | P0 | D4 | M28-03 | Regenerate lock with pnpm; update all paths/build scripts/ports; retain tested `radio` internal DNS compatibility or transition mapping for Dock/HQ |
| - [ ] | **M28-05** — Reconcile ARSY config/type/service branding with legacy Radio env compatibility | P0 | D3 | M28-04 | Prefer `ARSY_API_URL`, `ARSY_PORT`, etc only after full consumer update; accept documented `RADIO_*` aliases deterministically and reject conflicting values; leave actual Radio domain names intact |
| - [ ] | **M28-06** — Execute full end-to-end hub rename regression and rollback drill | P0 | D4 | M28-04,M28-05,M22-07 | At exact SHA pass frozen pnpm installation, verify/typecheck/SDK, real Postgres, API/ACL, Docker Hub + 2 web images, Dock/HQ, Radio playback, channels/webhooks and rollback |
| - [ ] | **M28-07** — Complete ARSY migration changelog, service map and operator handoff | P0 | D2 | M28-06 | No leftover active import path `apps/radio` in current code (historical docs excepted), no parallel Hub, working Radio stations and named reviewed release evidence |

**Operator instruction:** do not implement ARSY as a second Fastify service or create a new repository; migrate the existing one with compatible aliases. The older term ARSY Research Compute is retained as a **future optional capability in this same Hub**, not a separate running agent and not a claim of theological authority. **M28 is executed after foundation/compatibility baselines and before first new Corpus migration or M27 release, regardless of its appended number.**

## Consistency controls for the 29-milestone register

**Priority order:** rename the **Hub application** to ARSY only after M28 compatibility gates; always protect the independent **Radio/SIGNAL feature**, permissions, sources, persistence, review and production restoration before adding unrelated surfaces. Although M22 appears under G4, run its P0 suite from the beginning. Stated milestone dependencies are conceptual gates: a task must also respect source rights and privacy even if its individual row does not restate them.

**Overlapping implementation is prohibited:** **ARSY = single Fastify/MoonQL Hub (currently code-named radio), not a second service**; one canonical TEXT owner for Reader and Explorer; one Figure Registry (Prophetic Table is a view); one Lexicon source for Terms; one Ontology for reviewed edges (Constellation is a derived graph); one Story model for SHADOW scenes and the public Story Universe; one user/IAM system for HQ/100CENTER; Radio continues using existing stations and schedule. No new backend merely for an Empire name.

**Narrative boundary:** fiction characters are not theological referents; the user's `ZILL` interpretation remains separate from Shadow-optics and historic `ZIIL`; 10 WINGS is not 10 AETHERION realms; GOD99 is not Asmaul Husna 99 or 99 Human States; 33 patch slots are reported/drafts/proposals/conflicts/in-chat status, not divine approvals. The full 99 chapter V10 is an index of editorial coverage, **not authenticated originals**.

**The next useful release** includes the tested ARSY Hub rename and prioritizes exact source/citation + one reviewed term/figure + human research review, preserving Radio and rights/restore. World Monitor, Cosmos, HELIOGRID, 25 Amanah, AETHERION and optional AI do not block that first slice and cannot be marketed as live implementations.

**Progress evidence to capture when work begins:** `task-id`, `source-SHA`, `files`, `tests and logs`, `source/rights` where applicable, `reviewer/decision`, `blocked/risks`, `new-SHA`, `date/timezone`. A future agent must not tick unchecked boxes simply because similar files or issues exist in XII/XIV/Corpus.

**Target register:** 29 milestones × 7 unique tasks = **203 work packets** organized into G0–G6. This file defines **planning tasks**, not 196 GitHub issues, implementations, production releases, or promises of elapsed delivery time.

**End of XV Master TODO v1.0 — 26 October 2026.**
