# MOONWITNESS XV — MASTER TODO & MILESTONE EXECUTION REGISTER

> **Planning baseline · 26 October 2026 · active repo: [bjo163/moonwitnessxv](https://github.com/bjo163/moonwitnessxv), existing `main`.**
> This is a detailed, dependency-gated backlog, **not** evidence tasks have been completed. No new branch or GitHub issue is created. Before execution recheck the current HEAD, source rights and runtime status.

**Read:** [BLUEPRINT.md](BLUEPRINT.md) for the sole XV architecture and ownership contract; [Master Vision Narrative XV](docs/vision/MASTER_VISION_NARRATIVE_XV.md) for history, narrative and interpretive boundaries. **This TODO is the sole planning task/status index**. Avoid copying task progress into vision or independent lists. Real build logs, test results and specific commit SHAs establish completion; an existing file or CI configuration alone does not.

> **Revalidasi M01–M05 (2026-10-26, final):** temuan awal di HEAD `3822657` sudah ditindaklanjuti. Seluruh sisi memakai Node 24 LTS; checkout bersih dan CI pada `fa0f1b5` lulus `pnpm install --frozen-lockfile` + `pnpm verify` (199 test, 197 pass, 2 skipped, 0 fail; [run 40263464402](https://github.com/bjo163/moonwitnessxv/actions/runs/40263464402)). M01-01 dan M01-03 ditutup kembali; M01-05, M01-06, M01-07, M03-03, M03-05, dan M04-05 tetap terbuka. Rincian: [docs/audit/M01-M05-revalidation-2026-10-26.md](docs/audit/M01-M05-revalidation-2026-10-26.md). Checkbox `[x]` yang bergantung pada test kini diverifikasi di SHA bersih.

**Planning references:** [Master Design](MASTER_DESIGN.md) · [Architecture](docs/architecture/README.md) · [ADR index](docs/decisions/README.md) · [AI execution contract](docs/planning/AI_EXECUTION_CONTRACT.md). These are specifications, not additional task/status registers. G7 does not block a scope-limited bilingual public preview.

## How to interpret and execute

**Priority:** `P0` blocker (security, compatibility, provenance, release); `P1` core product; `P2` improvement/next horizon; `P3` speculative optional research. **Difficulty:** `D1` isolated, `D2` small, `D3` bounded multi-file, `D4` complex with cross-domain tests/review, `D5` high-uncertainty that must first be broken into smaller work packets. These are relative estimates, not promises of elapsed time.

Each task ID `M00-01` is unique here; `M00` in a dependency denotes its entire exit gate. **No corresponding GitHub issues currently exist in XV; do not duplicate past XIV/Corpus issues in XV by ID.**

For each task: recheck `main` HEAD → inspect the named owner and dependencies → prepare scope (prefer ≤3 starting files; justify larger) and tests → implement only the stated behavior → run focused positive/negative tests and relevant `pnpm verify` checks → record SHA, exact commands/results, changed paths, rights source where relevant and reviewer → only then check the box. Never force-push/reset or invent a new branch to make a task run. If a required gate is blocked, report it and preserve `UNKNOWN`.

New unchecked rows represent **unverified planned deliverables**. Historical checked rows retain their pinned evidence and are never reset by planning-only changes; each checkbox means a tested *scoped deliverable*, not an entire production release. A milestone is complete only after its exit gate is demonstrated at a specific SHA.

## IMMEDIATE EXECUTION — FOUNDATION + GLOBAL i18n + FIRST BILINGUAL PUBLIC RELEASE

**Evidence anchor:** \`main\` \`bb3aed0c7c5c7c99a5ed53851370b2376e915672\` (CI \`40304933576\` green); 29 established milestones, 203 historic IDs, **106 historic checkmarks and 97 open at that SHA**. This documentation update does NOT execute implementation. Recheck \`main\` before starting and never use a stale baseline to change a checkbox.

**Single execution register:** The rows below are crosslinks to the *canonical task rows inside their existing milestones*, NOT a second TODO/checklist. Tasks labelled new have a unique \`Mxx-yy\` ID appended in the proper parent milestone. Keep prior IDs, checked history and evidence. Existing task/exit gate dependencies still apply unless their prerequisite is explicitly shown as a scoped preview exception; previews NEVER bypass ACL, source rights or privacy.

| Track | Canonical IDs and order | Scope / acceptance boundary |
|---|---|---|
| **T0 Audit** | [M00](#m00--baseline-reality-and-audit) evidence → **M05-08**, **M19-08**, **M19-25**, **M28-01** (can parallelize read-only) | Inventory all six actual apps, rights, URLs, current source SHA and port/build contracts. |
| **T1 Shared i18n contract** | **M05-08 → M05-09 → M05-10 → M05-11/M05-12/M05-13** | id/en registry, deterministic preference, catalog, ICU/Intl formatting, missing-key tests; no IP/geolocation. |
| **T2 ARSY early compatibility migration** | **M28-01 → M28-02 → M28-08/M28-09 → M28-10 → M28-11 → M28-12 → M28-13 → M28-14 → M28-15** plus existing M28-03–07 closure | Rename existing backend, not fork it; retain SIGNAL, SDK, env/DNS, PG and rollback; depends on real Radio regression gates [M22](#m22--radio-channels-and-signal-backward-compatibility). |
| **T3 App Factory** | **M05-17 → M05-18 → M05-19/M05-20 → M05-21 → M05-22** | Safe scaffolder; generated user-facing app inherits i18n, production convention, build tests. |
| **T4 ALL existing application languages** | Dock **M19-08–M19-19**; HQ **M19-20–M19-24**; Cockpit **M19-25–M19-30**; MoonUI **M19-31–M19-35**; ARSY/AI/Sentinel **M05-14–M05-16**; shared developer/operator CLI **M05-23** | All six actual apps explicitly covered; Cockpit has its own GUI/CLI scope. Shared repository CLI tools have a separate owner. Distinct from preview-only subset. |
| **T5 Bilingual Dock preview** | **M19-09 → M19-10/M19-11 → M19-12 → M19-14/M19-16/M19-17/M19-19 → M27-08** | Complete \`/id\` and \`/en\`, \`/\` routing, HTML lang/SEO, Hub-offline fallback, privacy and accessibility. |
| **T6 Container test** | **M27-09 → M27-10 → M27-11/M27-12/M27-16** | Actual frozen build, Docker/Compose hardening, negative ACL and HTTP smoke. |
| **T7 Coolify preview** | **M27-13 → M27-14 → M27-15/M27-17/M27-18 → M27-19** | Domain/proxy/TLS/health, evidence and human go/no-go; no deployment claimed until observed. |

**Real parallelism:** i18n contract and ARSY read-only inventory may start together. ARSY name migration is prioritized early but is **not an artificial technical prerequisite of serving a static bilingual public page**; release scope must explicitly say whether the production Hub is included. Do not hold Dock preview for App Factory or optional geolocation. Do not mark **all-app global i18n complete** merely because Dock passes bilingual preview.

**Parent-to-microtask ownership (one outcome, not two jobs):** Existing `M28-01..07` are umbrella acceptance tasks, while `M28-08/09` refine M28-01, `M28-10` implements M28-03, `M28-11` refines M28-04, `M28-12` refines M28-05, `M28-13/14` refine M28-06 and `M28-15` refines M28-07. Do **not** allocate parent and child to separate agents to implement the same path twice; close the parent only when its micro-evidence and complete parent DoD both pass. Similarly, M19-08–35 subdivide frontend/a11y goals of M19-01–07, and M27-08–19 subdivide selected-scope preview requirements while M27-01–07 remain the full XV release gate. Reuse one integration owner per shared file, with no cloned suites or second register.

**Ownership leases for multi-AI:** one integrator writes \`TODO.md\` and shared configs; MoonUI/i18n owner has shared catalogs; ARSY owner controls runtime migration; Dock/HQ/Cockpit owners edit their scoped apps and request interface changes through the shared owner. Record exact SHA, paths, test results, conflicts, feature flag and rollback before marking \`[x]\`.

**Known baseline conflicts to reconcile during execution, NOT rewritten as prior success:** checked M03-07 references still-open M03-05 and checked M04-07 references still-open M04-05 (scoped documentation completion ≠ fully met milestone gate). 50 historic \`file:///z:/project/moonradio/\` links were nonportable and are being rewritten to working Git-relative links in this docs pass. The earlier claim “M28 before any new Corpus modules” is stale as Corpus/Research addon code already exists; M28 is instead a **pre-production compatibility migration for the accepted ARSY identity**, without retroactive history rewriting. R01 security risks remain release-blocking: unapproved Research/Journey read projections, unsupported source rights, local Cockpit mutation API, AI Gateway auth and Sentinel static credential fallbacks.

**Status semantics:** \`PLANNED → READY → CLAIMED → IMPLEMENTED → VERIFIED\`; \`BLOCKED/DEFERRED/SUPERSEDED\` recorded with reason. Existing checkboxes stay unchanged until exact-SHA acceptance tests and responsible review. No new backend, branch, repo, or duplicate master task list.


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
| **G7 — ECOSYSTEM** | M29–M37 | AI handoffs, Master Design, Lighthouse, Harbor, SHADOW, MoonLab, WORKS, HELIOGRID, cross-app identity |

**Scope gate:** The first Reader release does not require Story/SHADOW or AI. Publishing a Story does additionally require M17 source/consent approval; using AI does additionally require M21 security and candidate approval. Do not conflate optional feature gating with first-release gating.

**ARSY migration (ADR-0001):** **M28 is an intentionally appended G0 milestone** (not a late/post-release feature): task IDs M00–M27 are preserved, and M28 is an early pre-production Hub compatibility migration; existing Corpus/Research addons are already present and must not be erased or described as future-only. The existing `apps/radio` backend is the technical predecessor of **ARSY**; new target `apps/arsy` and `@moonwitness/arsy` are NOT YET RENAMED. Radio stations and playback remain within ARSY as SIGNAL/RADIO. Source of truth: [ADR-0001](docs/decisions/ADR-0001-arsy-is-xv-hub.md).

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
| - [x] | **M01-01** — Pin Node and pnpm compatible with lockfile | P0 | D2 | M00-04 | **Ditutup 2026-10-26:** Node 24 LTS (`>=24 <25`) diseragamkan di `.nvmrc`, engines, CI, dan kedua Dockerfile (`b9f527b`); checkout bersih dan CI `fa0f1b5` lulus install + `pnpm verify` ([spesifikasi](docs/audit/M01-01-toolchain-pin.md)) |
| - [x] | **M01-02** — Define radio + Dock + HQ smoke procedure | P0 | D2 | M00-02 | Documented in `docs/audit/M01-02-smoke-procedure.md` (`pnpm ports:free`, 3-app probe) |
| - [x] | **M01-03** — Configure CI only after checking repository policy | P0 | D3 | M01-01,M01-02 | **Ditutup 2026-10-26:** [run 40263464402](https://github.com/bjo163/moonwitnessxv/actions/runs/40263464402) pada `fa0f1b5` — `Install dependencies` dan `pnpm verify` `success`; CI memakai `node-version-file: .nvmrc`. |
| - [x] | **M01-04** — Enforce generated SDK and schema drift check | P0 | D2 | M01-03 | Documented in `docs/audit/M01-04-sdk-drift-gate.md` (`gen:sdk:check`). **Catatan 2026-10-26:** kini dijalankan CI sebagai bagian `pnpm verify` dan lulus di checkout bersih `fa0f1b5`. |
| - [ ] | **M01-05** — Define semver, changelog and protected release lifecycle | P1 | D3 | M01-03 | **REOPENED 2026-10-26:** tidak ada `CHANGELOG.md`/prosedur changelog dan tidak ada bukti protected branch. ; [packet](docs/tasks/M01/M01-05.md) |
| - [ ] | **M01-06** — Add dependency and secret-scanning gate | P0 | D3 | M01-03 | **REOPENED 2026-10-26:** tidak ada langkah audit/secret-scan di CI; `.gitignore` tidak memuat pola yang diklaim. ; [packet](docs/tasks/M01/M01-06.md) |
| - [ ] | **M01-07** — Publish CI evidence ledger and no-bypass rule | P0 | D2 | M01-04,M01-06 | **REOPENED 2026-10-26:** ledger mengklaim "Exit Gate Verified", tetapi 7/7 run CI `failure`. |

**Revalidasi 2026-10-26 (final):** M01-01 dan M01-03 ditutup setelah Node 24 LTS diseragamkan dan CI `fa0f1b5` hijau (install + `pnpm verify`). Exit gate M01 belum penuh karena M01-05 (changelog/protected branch), M01-06 (audit/secret scan), dan M01-07 (ledger bukti) masih terbuka. Bukti: [laporan revalidasi](docs/audit/M01-M05-revalidation-2026-10-26.md).


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
| - [x] | **M03-01** — Audit default public list/get/expand/view/export exposure | P0 | D3 | M00-05 | Negative API tests include direct request paths ([docs/audit/M03-01-public-exposure-audit.md](docs/audit/M03-01-public-exposure-audit.md)). **Dikoreksi 2026-10-26:** `/on-air`, `/listen` 201, `/api-keys`, pseudonym `lp_`; referensi test diperbaiki. |
| - [x] | **M03-02** — Define deny-by-default sensitive addon template | P0 | D3 | M03-01 | Restricted model REST false or explicit guarded ops ([docs/audit/M03-02-deny-by-default-template.md](docs/audit/M03-02-deny-by-default-template.md)) |
| - [ ] | **M03-03** — Test forged/expired HQ cookies vs Hub auth | P0 | D3 | M03-01 | **REOPENED 2026-10-26:** tidak ada test forged/expired `hq_token`; middleware HQ hanya mengecek keberadaan cookie. [Laporan](docs/audit/M01-M05-revalidation-2026-10-26.md) ; [packet](docs/tasks/M03/M03-03.md) |
| - [x] | **M03-04** — Decide tenant and reviewer/editor role boundaries | P0 | D4 | M02-02,M03-02 | Tenant support verified or clearly out of scope ([docs/decisions/M03-04-tenant-role-boundaries.md](docs/decisions/M03-04-tenant-role-boundaries.md)) |
| - [ ] | **M03-05** — Test token TTL, revocation and API key cache limits | P0 | D3 | M03-03 | **REOPENED 2026-10-26:** revocation/role demotion diuji; TTL expiry dan API-key cache cap belum. ; [packet](docs/tasks/M03/M03-05.md) |
| - [x] | **M03-06** — Write private witness, minors, copyright and withdrawal policy | P0 | D3 | M02-04 | No automatic import into public Git ([docs/decisions/M03-06-witness-withdrawal-policy.md](docs/decisions/M03-06-witness-withdrawal-policy.md)) |
| - [x] | **M03-07** — Threat model CSP, logs, egress, DENPA, WA and SSR | P0 | D4 | M03-01,M03-05 | Critical risks receive blocking cases ([docs/audit/M03-07-threat-model.md](docs/audit/M03-07-threat-model.md)). **Dikoreksi 2026-10-26:** volume WA `whatsapp-session`; klaim `.gitignore` dihapus. |

**Revalidasi 2026-10-26:** M03-01 dan M03-07 dikoreksi; M03-03 dan M03-05 dibuka kembali karena test forged/expired cookie, TTL expiry, dan cache cap tidak ada. Exit gate M03 belum terpenuhi.


## M04 — Database continuity and recovery

**Group:** G0 · **Priority:** P0 · **Prerequisites:** M00 · **Scope:** MoonQL sync/migrations, Docker Compose and restore runbook.

**Exit gate:** Isolated restore actually performed with data equivalence. **No completion inferred merely from repository files.**

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M04-01** — Verify production PG requirement vs memory fallback | P0 | D3 | M00-06 | No accidental production ephemeral storage ([docs/audit/M04-01-production-pg-requirement.md](docs/audit/M04-01-production-pg-requirement.md)) |
| - [x] | **M04-02** — Define non-additive migration plan beyond autoSync | P0 | D3 | M04-01,M02-05 | Reviewed SQL rollback protects existing records ([docs/decisions/M04-02-migration-rollback-plan.md](docs/decisions/M04-02-migration-rollback-plan.md)) |
| - [x] | **M04-03** — Execute test DB restore from real dump | P0 | D4 | M04-01 | **Direvalidasi 2026-10-26:** dump `20261025T213120Z` (73.900 B), restore exit 0, 36 stations/21 playlogs ([docs/audit/M04-03-db-restore-execution.md](docs/audit/M04-03-db-restore-execution.md)) |
| - [x] | **M04-04** — Compare restored station/playlog rows and indexes | P0 | D2 | M04-03 | **Direvalidasi 2026-10-26:** 36 stations/21 playlogs, 9 indeks; angka lama 24 dan `station_envelope_metadata` tidak ada ([docs/audit/M04-04-row-counts-and-indexes.md](docs/audit/M04-04-row-counts-and-indexes.md)) |
| - [ ] | **M04-05** — Copy backups off host and test retention path | P0 | D3 | M04-03 | **REOPENED 2026-10-26:** masih rencana; tidak ada implementasi rclone/prune, target off-host, atau test retensi ([docs/audit/M04-05-off-host-backup-retention.md](docs/audit/M04-05-off-host-backup-retention.md)) ; [packet](docs/tasks/M04/M04-05.md) |
| - [x] | **M04-06** — Test schema upgrade failure and rollback | P0 | D4 | M04-02,M04-03 | **Direvalidasi 2026-10-26:** rollback DDL gagal terbukti di container terisolasi; test otomatis belum ada ([docs/audit/M04-06-schema-upgrade-rollback.md](docs/audit/M04-06-schema-upgrade-rollback.md)) |
| - [x] | **M04-07** — Update restore runbook with actual drill metadata | P1 | D2 | M04-04,M04-05,M04-06 | **Diperbarui 2026-10-26:** metadata drill aktual (dump, ukuran, hasil, operator revalidasi, batasan) ([docs/runbook-restore.md](docs/runbook-restore.md)) |

**Revalidasi 2026-10-26:** restore dan rollback DDL diuji ulang di container terisolasi. Dump aktual `moonwitness-20261025T213120Z.dump` (73.900 B) menghasilkan 36 stations/21 playlogs dan 9 indeks; `pg_restore` exit 0. M04-03/04/06/07 diperbarui; M04-05 tetap dibuka karena belum ada backup off-host. Angka lama 24 playlogs/79,6 KB/`station_envelope_metadata` tidak ditemukan. Bukti: [laporan revalidasi](docs/audit/M01-M05-revalidation-2026-10-26.md).


## M05 — API/SDK and module behavior contracts

**Group:** G0 · **Priority:** P0 · **Prerequisites:** M01,M02 · **Scope:** Fastify generated REST and SDK **plus** added global locale/API-message/App Factory foundations. Historical M05-01–07 scope was verified before expansion; that does not close M05-08–22.

**Exit gate:** Legacy API fixtures remain stable; shared id/en catalog and factory-generated app each pass their own exact-SHA tests. No milestone-wide success inferred from the pre-expansion 7/7 evidence.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M05-01** — Record existing OpenAPI, envelope and error fixtures | P0 | D2 | M00-02 | **Diperbarui 2026-10-26:** sintaks filter aktual `?where=<json>` (diparse `parseWhereJson`), bukan `?where[field]=`; `?total=true` didokumentasikan ([docs/audit/M05-01-api-fixtures.md](docs/audit/M05-01-api-fixtures.md)) |
| - [x] | **M05-02** — Test duplicate model/view/manual route rejection | P0 | D2 | M05-01 | Collision fails boot and has regression test ([apps/radio/test/api-contracts.test.ts](apps/radio/test/api-contracts.test.ts)) |
| - [x] | **M05-03** — Define future addon namespace and registration standard | P0 | D2 | M02-02,M05-02 | New feature cannot shadow old radio endpoints ([docs/decisions/M05-03-addon-namespace-standards.md](docs/decisions/M05-03-addon-namespace-standards.md)) |
| - [x] | **M05-04** — Verify SDK codegen deterministic hash and API version | P0 | D2 | M01-04,M05-01 | Repeat generation gives stable client ([apps/radio/test/api-contracts.test.ts](apps/radio/test/api-contracts.test.ts)); `gen:sdk:check` lulus di checkout bersih `fa0f1b5` dan di CI |
| - [x] | **M05-05** — Define pagination, filter/expand, locale and UNKNOWN | P1 | D3 | M05-01 | **Dikoreksi 2026-10-26:** stations `maxLimit` 200 (bukan 100); `?limit` di atas maximum ditolak 400 oleh schema, bukan di-clamp; tidak ada filter/locale fallback di MoonQL ([docs/decisions/M05-05-query-standards.md](docs/decisions/M05-05-query-standards.md)) |
| - [x] | **M05-06** — Document approved old-repo adapter boundaries | P1 | D3 | M02-07,M05-03 | No implicit historical runtime dependency ([docs/decisions/M05-06-adapter-boundaries.md](docs/decisions/M05-06-adapter-boundaries.md)) |
| - [x] | **M05-07** — Add compatibility smoke for existing clients | P0 | D3 | M05-04,M05-06 | Smoke ada; suite checkout bersih dan CI `fa0f1b5` lulus 197 pass/2 skipped/0 fail ([apps/radio/test/stations.test.ts](apps/radio/test/stations.test.ts)) |
| - [x] | **M05-08** — Inventory locale coverage of all six runnable applications | P0 | D2 | M00-07 | **Closed 2026-10-26:** integrator review passed against inventory at `4b229ec97ed6468dbe8b01fc79f29398e3b368b4`; six app manifests and CLI/TUI/API boundaries mapped, source-language vs UI locale distinguished, owner task IDs checked, and no locale implementation claimed. Source-language positive/negative test evidence is cited; PR CI run [40361827534](https://github.com/bjo163/moonwitnessxv/actions/runs/40361827534) passed on that exact SHA. Baseline `main`/`dev` `d8c5bfa` CI run [40359838620](https://github.com/bjo163/moonwitnessxv/actions/runs/40359838620) passed; only governance docs changed since audit source SHA `387f784`. Inventory: [M05-08 locale audit](docs/audit/M05-08-locale-inventory.md); [packet](docs/tasks/M05/M05-08.md) |
| - [ ] | **M05-09** — Ratify id/en locale contract and per-runtime inclusion scope | P0 | D2 | M05-08,M02-06 | **Owner:** platform/i18n; **paths:** BLUEPRINT.md; docs/decisions/ADR-0005-locale.md and index; **steps:** ratify canonical values/default, preference order, key/format rules and positive/negative contract vectors → cross-check all six apps and CLI/TUI/API consumer owners → decide embedded ARSY UI scope; **DoD:** deterministic id/en contract, no geo/IP selection, source text/edition distinct from UI, all existing runtime boundaries and stable machine/auth invariants recorded before implementation; evidence = reviewed vectors + owner crosswalk + exact SHA; rollback = superseding ADR ; [ADR](docs/decisions/ADR-0005-locale.md) |
| - [ ] | **M05-10** — Implement shared i18n package or proven core adapter | P0 | D3 | M05-09 | **Owner:** platform/i18n; **paths:** packages/i18n (proposed) OR packages/core; **steps:** inspect package reuse → implement typed locale/catalog contracts → unit test both locales; **DoD:** one registry; unsupported values rejected; no duplicated dictionaries; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M05/M05-10.md) |
| - [ ] | **M05-11** — Add locale resolution and persistence negative tests | P0 | D2 | M05-10 | **Owner:** platform/i18n; **paths:** shared locale package; shared tests; **steps:** test explicit URL → test cookie/account/browser priorities → test malformed values; **DoD:** URL wins; no precise location/IP dependency; invalid preference safe; evidence = focused positive/negative tests + exact SHA; rollback where needed |
| - [ ] | **M05-12** — Implement Intl formatting without translating source artifacts | P1 | D2 | M05-10 | **Owner:** platform/i18n; **paths:** shared locale formatter/tests; **steps:** format dates/numbers/currency → preserve source quotes/IDs → test scripts; **DoD:** id/en format stable; timezone/region hints do not assert country; evidence = focused positive/negative tests + exact SHA; rollback where needed |
| - [ ] | **M05-13** — Add missing-key/catalog parity verification gate | P0 | D3 | M05-10 | **Owner:** platform/i18n; **paths:** shared package tests; scripts; package.json; **steps:** generate key manifest → fail on missing required UI keys → wire targeted verification; **DoD:** CI detects required-label omissions without blocking optional untranslated long-form content; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M05/M05-13.md) |
| - [ ] | **M05-14** — Localize ARSY human messages and embedded UI, never API identifiers | P1 | D3 | M05-09,M28-05 | **Owner:** ARSY API; **paths:** apps/radio/src/plugins; apps/radio/src/lib/launchpad.ts; apps/radio/src/modules/studio/index.ts; packages/core; **steps:** inventory safe human error/diagnostic text and launchpad/Studio UI → negotiate validated locale → test API/auth and UI behavior; **DoD:** id/en only for consumer-visible human copy; preserve `/`, `/api/v1/studio`, response envelope/status/auth, stable identifiers, source/rights data and machine logs; do not localize raw runtime errors; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M05/M05-14.md) |
| - [ ] | **M05-15** — Classify and scope AI Gateway human-facing localization | P1 | D2 | M05-09 | **Owner:** AI Gateway; **paths:** apps/aigateway/src/server.ts; its tests; **steps:** inventory model/provider/status/error display → localize appropriate descriptions → test; **DoD:** wire codes and model IDs unchanged; provider/auth hardening not weakened; evidence = focused positive/negative tests + exact SHA; rollback where needed |
| - [ ] | **M05-16** — Classify Sentinel worker/CLI localization without log drift | P1 | D2 | M05-09 | **Owner:** Sentinel; **paths:** apps/sentinel/src/index.ts; tests; **steps:** identify human CLI help vs machine logs → localize only suitable UI → regression test; **DoD:** structured event names/metrics and machine-consumed logs unchanged; evidence = focused positive/negative tests + exact SHA; rollback where needed |
| - [ ] | **M05-17** — Inventory actual app creation and deployment conventions | P0 | D2 | M05-08,M28-01 | **Owner:** App Factory; **paths:** pnpm-workspace.yaml; Dockerfile.web; package.json; **steps:** map frontend/worker/service variants → list name/port collision rules → select minimal scaffolder; **DoD:** reuse existing packages and no extra API/database per app; evidence = focused positive/negative tests + exact SHA; rollback where needed |
| - [ ] | **M05-18** — Implement collision-safe App Factory CLI with dry-run | P1 | D3 | M05-17,M05-10 | **Owner:** App Factory; **paths:** scripts/app-create.mjs (proposed); package.json; tests; **steps:** validate identifier/paths → dry-run rendered file list → refuse overwrite; **DoD:** invalid/path-traversal/existing names rejected with no writes; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M05/M05-18.md) |
| - [ ] | **M05-19** — Generate frontend skeleton inheriting i18n and MoonUI | P1 | D3 | M05-18,M05-10 | **Owner:** App Factory + MoonUI; **paths:** App Factory template(s); shared i18n package; fixture tests; **steps:** template locale UI → emit TS/lint/build scripts → verify both locales; **DoD:** sample app builds with id/en, selector, valid routing and accessibility labels; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M05/M05-19.md) |
| - [ ] | **M05-20** — Generate internal worker/service variant without fake UI | P1 | D3 | M05-18 | **Owner:** App Factory; **paths:** App Factory templates; fixture tests; **steps:** emit appropriate process/health config → preserve machine error codes → verify; **DoD:** no bogus locale selector, public port, database or separate Hub; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M05/M05-20.md) |
| - [ ] | **M05-21** — Verify generated app workspace/build/container integration | P1 | D4 | M05-19,M05-20 | **Owner:** App Factory + CI; **paths:** workspace scripts; factory fixtures; Dockerfile.web integration; **steps:** generate isolated sample → frozen install/build/check → test container mapping; **DoD:** generated app works without manual manifest/lock edits; production route only if justified; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M05/M05-21.md) |
| - [ ] | **M05-22** — Document ownership, rollback and App Factory adoption gate | P1 | D2 | M05-21 | **Owner:** App Factory; **paths:** README.md; BLUEPRINT.md; validation docs; **steps:** write operating contract → demonstrate no duplicate apps/domains → record SHA; **DoD:** one reproducible command and explicit generated-app removal/rollback; evidence = focused positive/negative tests + exact SHA; rollback where needed |
| - [ ] | **M05-23** — Localize shared developer/operator CLI human output | P1 | D2 | M05-08,M05-10 | **Owner:** platform/cli; **paths:** packages/cli/src; apps/radio/src/tools/gen-sdk.ts; focused CLI fixtures; **steps:** inventory human help/status/error output → use the shared id/en catalog → preserve commands, flags, paths, IDs, exit codes and machine-readable behavior; **DoD:** both locales cover human-facing help and status/error copy, with positive/negative output tests proving stable command contracts; evidence = focused tests + exact SHA; rollback where needed |

**Revalidasi 2026-10-26 (final):** kontrak M05 diverifikasi terhadap kode dan test. Tiga dokumen dikoreksi (sintaks `?where`, `maxLimit`/penolakan 400, ketiadaan locale/UNKNOWN di query). Checkout bersih dan CI `fa0f1b5` lulus `build`, `test` (197 pass/2 skipped/0 fail), dan `gen:sdk:check`, sehingga exit gate M05 kini terbukti di SHA bersih. Bukti: [laporan revalidasi](docs/audit/M01-M05-revalidation-2026-10-26.md).

## M06 — Source crosswalk and historical recovery

**Group:** G1 · **Priority:** P0 · **Prerequisites:** M00 · **Scope:** Historical repos, vision, source index.

**Exit gate:** Pinned provenance and no unauthorized private originals. This is a planning gate, not a completion claim.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M06-01** — Pin source repo SHA and exact path by artifact family | P0 | D2 | M00-07 | Immutable source references for priority families ([docs/audit/M06-01-source-repo-pins.md](docs/audit/M06-01-source-repo-pins.md)) |
| - [x] | **M06-02** — Crosswalk XIV V10/V10.1/ledger/gap archive | P0 | D3 | M06-01 | 99 editorial chapters not mistaken for original manuscripts ([docs/decisions/M06-02-xiv-v10-crosswalk.md](docs/decisions/M06-02-xiv-v10-crosswalk.md)) |
| - [x] | **M06-03** — Recover II 13 functions/8 eras/10 world rules | P0 | D2 | M06-01 | Source-specific era and lore evidence ([docs/decisions/M06-03-ii-lore-recovery.md](docs/decisions/M06-03-ii-lore-recovery.md)) |
| - [x] | **M06-04** — Preserve XII 33 patch statuses and disputed 014 | P0 | D2 | M06-01 | 8+5+1+18+1 registry with zero divine approval inferred ([docs/decisions/M06-04-xii-patches-registry.md](docs/decisions/M06-04-xii-patches-registry.md)) |
| - [x] | **M06-05** — Inventory Corpus, Empire, A-L-L-A-H, Rocksoul interfaces | P0 | D3 | M06-01 | Owner and compatibility map, not bulk code import ([docs/decisions/M06-05-historical-interfaces-map.md](docs/decisions/M06-05-historical-interfaces-map.md)) |
| - [x] | **M06-06** — Classify license, privacy, consent and missing media | P0 | D3 | M06-02 | Unknown rights -> metadata-only and NEEDS_SOURCE ([docs/decisions/M06-06-rights-classification.md](docs/decisions/M06-06-rights-classification.md)) |
| - [x] | **M06-07** — Publish source crosswalk, gaps and reviewer queue | P0 | D3 | M06-03,M06-04,M06-05,M06-06 | Source IDs and constraints auditable ([docs/audit/M06-07-source-crosswalk-queue.md](docs/audit/M06-07-source-crosswalk-queue.md)) |


## M07 — Corpus source rights and ingestion pilot

**Group:** G1 · **Priority:** P0 · **Prerequisites:** M03,M04,M06,M28 · **Scope:** Proposed text addon, rights registry, source API.

**Exit gate:** QS 2:82 exact source/edition metadata without illegal raw bytes. This is a planning gate, not a completion claim.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M07-01** — Inventory historical multi-tradition dataset editions/licenses | P0 | D3 | M06-05 | Folder existence not confused with cleared source ([docs/audit/M07-01-editions-licenses-inventory.md](docs/audit/M07-01-editions-licenses-inventory.md)) |
| - [x] | **M07-02** — Design artifact/work/edition/passage identity version schema | P0 | D3 | M02-05,M07-01 | Each citation points to real resolvable source ([docs/decisions/M07-02-corpus-identity-schema.md](docs/decisions/M07-02-corpus-identity-schema.md)) |
| - [x] | **M07-03** — Prototype metadata-only catalog using existing MoonQL extension | P0 | D4 | M07-02,M03-02 | No sensitive or unlicensed text exposed ([packages/moonql-corpus/src/index.ts](packages/moonql-corpus/src/index.ts)) |
| - [x] | **M07-04** — Apply rights veto for edition-specific text publication | P0 | D3 | M07-03,M03-06 | Rights unknown blocks bytes, not safe metadata ([docs/decisions/M07-04-rights-veto-policy.md](docs/decisions/M07-04-rights-veto-policy.md)) |
| - [x] | **M07-05** — Create permission-verified QS 2:82 sample selectors | P0 | D2 | M07-02,M07-04 | No made-up Arabic or translated passage ([packages/moonql-corpus/src/index.ts](packages/moonql-corpus/src/index.ts)) |
| - [x] | **M07-06** — Map foreign RGBL IDs without canonical duplication | P0 | D3 | M06-07,M07-05 | Source identity mapping preserves exact legacy reference ([apps/radio/test/corpus-ingestion.test.ts](apps/radio/test/corpus-ingestion.test.ts)) |
| - [x] | **M07-07** — Test idempotent import, retries, deletion/retraction | P0 | D4 | M07-03,M07-06 | No duplicate on replay, reviewer/rights in log ([apps/radio/test/corpus-ingestion.test.ts](apps/radio/test/corpus-ingestion.test.ts)) |


## M08 — Source-first Corpus Reader

**Group:** G1 · **Priority:** P0 · **Prerequisites:** M05,M07 · **Scope:** Dock Reader routes, generated client, MoonUI.

**Exit gate:** Reader trace and metadata-only fallback verified on real PG. This is a planning gate, not a completion claim.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M08-01** — Design UI states for source, absent, ambiguous, rights-blocked | P0 | D2 | M07-05 | States implemented in `/corpus/reader` + Dock Reader; absent/ambiguous tests and 28-check SSR drill ([evidence](docs/audit/M08-reader-vertical-slice.md)) |
| - [x] | **M08-02** — Render work, edition, language, permission and source | P0 | D3 | M08-01 | QS 2:82 identity asserted in `apps/radio/test/corpus-reader.test.ts` and on PG (`corpus-reader-pg.test.ts`) |
| - [x] | **M08-03** — Add context and licensed parallel translation display | P1 | D3 | M08-02,M07-04 | Arabic separated from translations with language tags; Kemenag text only on cleared edition/translation |
| - [x] | **M08-04** — Add reproducible citation with selector and version | P0 | D2 | M08-02 | Citation includes edition code, provenance SHA, source date, retrieval; labelled copy button and focusable citation block |
| - [x] | **M08-05** — Test missing/forbidden/right-unknown Reader behavior | P0 | D3 | M08-03,M03-02 | Raw REST 401; blocked edition/translation withheld; absent/invalid covered in memory and PG tests |
| - [x] | **M08-06** — Test Arabic RTL, mobile, accessibility and keyboard | P0 | D3 | M08-03 | `apps/dock/scripts/verify-reader-ui.tsx` — 28 checks (RTL/lang, labels, focus, mobile breakpoint, nav) |
| - [x] | **M08-07** — Complete QS 2:82 API/PG/Reader/Reviewer vertical slice | P0 | D4 | M08-04,M08-05,M08-06 | PG drill + `corpus-reviewer.test.ts`: admin REST and public Reader return the same edition, provenance, URI and source date |

**Revalidasi 2026-10-26 (`9a31351`, baseline `f517fb8`):** corpus addon terpasang di hub; `corpus_passages`/`corpus_translations` menjadi `ADMIN_FULL` dengan unique `(citationKey, editionRef)`; `GET /corpus/reader` menjadi satu-satunya proyeksi teks publik dengan rights veto. Dock `/reader` menampilkan identitas sumber, Arabic RTL, terjemahan berlisensi, sitasi reproducible, serta state absent/ambiguous/rights-blocked. Suite penuh 215 test (212 pass, 3 skipped, 0 fail), build radio + Dock lulus, `gen:sdk:check` lulus (`1fa620155ba520bf`), drill PG nyata `engine=pg` lulus, drill UI 28/28. CI pada `61cc3ef` lulus ([run 40265719999](https://github.com/bjo163/moonwitnessxv/actions/runs/40265719999)). Bukti lengkap: [laporan M08](docs/audit/M08-reader-vertical-slice.md).


## M09 — UNILEX and multilingual terminology

**Group:** G1 · **Priority:** P1 · **Prerequisites:** M06,M07 · **Scope:** Terms addon and term/meaning frontend view.

**Exit gate:** Scoped language/sense registry, no forced synonyms. This is a planning gate, not a completion claim.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M09-01** — Recover Empire UNILEX seed and review status | P1 | D2 | M06-05 | 71 seed concepts pinned at `38354ff` with raw SHA-256 and an explicit "not a validated universal dictionary" notice; XV addenda P030/P031 separated ([evidence](docs/audit/M09-unilex-terminology.md)) |
| - [x] | **M09-02** — Define term, source language, script and sense schema | P1 | D3 | M09-01 | 7 models; every projected term has an approved source, context note, sense and `DRAFT_REVIEW` status (test 1) |
| - [x] | **M09-03** — Test ALLAH/ARSY/ZILL and naming confusions | P1 | D2 | M09-02 | Four approved `distinctFrom` edges; P004:P031 `REJECTED`/`NEAR` with reason (test 2) |
| - [x] | **M09-04** — Build exact/near/different matching review rules | P1 | D3 | M09-03 | Preview never writes; reviewer + evidence required; anonymous POST 401; contradiction refused (tests 2–3) |
| - [x] | **M09-05** — Build a Terms Table as projection, not second vocabulary | P1 | D3 | M09-02,M05-05 | `GET /unilex/terms` filters by approved source, lane, scope, status and query; Dock `/terms` + 45-check SSR drill |
| - [x] | **M09-06** — Test mixed Arabic/Hebrew/Greek input and transliteration | P1 | D3 | M09-05 | Raw diacritics, script and RTL/LTR retained; cross-script always `DIFFERENT` (test 5, UI drill) |
| - [x] | **M09-07** — Define stable term ID correction/deprecation process | P1 | D2 | M09-04,M09-06 | Stable IDs immutable; deprecation reason + successor; old sense preserved with reviewer note; review log (test 6) |

**Revalidasi 2026-10-26 (`9fde13f`, baseline `3178a4c`):** addon `@moonwitness/moonql-unilex` terpasang di hub dengan 7 model, seed 71 konsep yang dipin ke `bjo163/empire-of-the-light@38354ff` (SHA-256 `8e60fe61…d05772`), plus 2 addenda XV yang dipisahkan. Proyeksi `GET /unilex/terms` hanya menampilkan term bersumber `APPROVED_FOR_CITATION`; preview tidak pernah menulis relasi dan identitas hanya dicatat reviewer dengan bukti. Dock `/terms` dan `/terms/[stableId]` menampilkan bentuk per aksara/bahasa, sense berkonteks, provenance, relasi, keputusan identitas dan review log. `pnpm verify` lulus; 230 test (226 pass, 4 skipped, 0 fail); drill UI 45/45; drill PG nyata `engine=pg` lulus dengan 73 terms / 146 forms / 73 senses / 28 relations. SDK snapshot `e86eaa67aa9fd70b`. CI pada `77b96d0` lulus ([run 40272393554](https://github.com/bjo163/moonwitnessxv/actions/runs/40272393554)) setelah `typescript`/`@types/node` dideklarasikan untuk paket `moonql-unilex`. Bukti lengkap: [laporan M09](docs/audit/M09-unilex-terminology.md).


## M10 — Ontology, alias and identity review

**Group:** G1 · **Priority:** P1 · **Prerequisites:** M02,M09 · **Scope:** Ontology addon, typed relation and HQ reviewer.

**Exit gate:** No automatic sameAs, graph candidates and conflicting sources visible. This is a planning gate, not a completion claim.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M10-01** — Define actor/entity/character/alias and typed edge contracts | P1 | D3 | M09-04,M02-05 | Separate kinds and versioned identity |
| - [x] | **M10-02** — Make identity merge a reviewer-approved candidate action | P1 | D4 | M10-01,M03-04 | No automatic destructive merger |
| - [x] | **M10-03** — Register source and perspective-scoped relation edges | P1 | D3 | M10-01 | Unknown/disputed relation not labeled verified |
| - [x] | **M10-04** — Test ZILL/ZIIL, THE BATTERY/ALLAH, SHADOW variants | P1 | D2 | M10-02,M09-03 | Negative identity decisions preserved |
| - [x] | **M10-05** — Build Constellation as read-only graph projection | P1 | D3 | M10-03 | Same graph ID as backend, no second graph authority |
| - [x] | **M10-06** — Test split, corrections and invalid temporal merges | P1 | D4 | M10-02,M10-05 | Review rollback and source lineage survive |
| - [x] | **M10-07** — Document reviewer conflict queue and evidence rubric | P1 | D2 | M10-04,M10-06 | UNKNOWN can remain unresolved |

**Revalidasi 2026-10-26 (`7493fea`, baseline `d539cee`):** addon `@moonwitness/moonql-ontology` terpasang di hub dengan 6 model dan seed terpin: 5 sumber, 8 entitas (`ACTOR`/`ENTITY`/`CHARACTER` terpisah), 7 alias, 7 relasi bertipe, 4 keputusan identitas dan 3 log review. `GET /ontology/constellation` adalah proyeksi read-only dengan graph ID deterministik `gph_<16 hex>`; merge hanya lewat keputusan reviewer dengan jendela temporal, split (`REVOKED`) memulihkan komponen tanpa menghapus riwayat, dan edge `UNKNOWN`/`DISPUTED` tidak pernah diproyeksikan sebagai terverifikasi. Dock `/constellation` menampilkan graph identity, entity, alias ber-`lang`/`dir`, edge, keputusan identitas, rubrik bukti dan conflict queue tanpa kontrol tulis. Suite penuh 236 test (231 pass, 5 skipped, 0 fail), drill UI 71/71, drill PG nyata `engine=pg` lulus dan idempoten, `pnpm build`, `pnpm build:web`, `ui:check` (65 file, 0 violation), `gen:sdk:check` (`0a97846a800aa4e9`) dan eslint file M10 (0 error/0 warning) lulus; `pnpm verify` lokal hanya tertahan lint WIP `packages/moonui/src/client/*` yang bukan bagian milestone. CI pada `7493fea` lulus ([run 40277413272](https://github.com/bjo163/moonwitnessxv/actions/runs/40277413272)). Bukti lengkap: [laporan M10](docs/audit/M10-ontology-identity.md).


## M11 — Figure/Event and Prophetic Mission Table

**Group:** G1 · **Priority:** P1 · **Prerequisites:** M07,M10 · **Scope:** Figure registry, event references, Dock view.

**Exit gate:** One actor record with tradition-scoped missions and references. This is a planning gate, not a completion claim.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M11-01** — Collect sourced prophet/mission/context examples | P1 | D2 | M07-05,M06-07 | No unsupported exclusive mission assertions |
| - [x] | **M11-02** — Separate real actor vs historical report vs creative avatar | P1 | D3 | M10-01,M11-01 | No prophet impersonation |
| - [x] | **M11-03** — Represent source-linked events, place and chronology confidence | P1 | D3 | M11-02 | Timelines preserve tradition vs history |
| - [x] | **M11-04** — Build Prophetic Mission as Figure Registry filtered view | P1 | D3 | M11-02,M11-03 | No duplicate prophet database |
| - [x] | **M11-05** — Add competing tradition and source-specific reading panel | P1 | D3 | M11-04 | No forced merged doctrine |
| - [x] | **M11-06** — Test role/alias collisions and religious ranking failures | P1 | D3 | M11-05,M10-06 | Same named figure not automatically same referent |
| - [x] | **M11-07** — Document 25 avatars as pedagogy, no religious authority | P2 | D2 | M11-06 | No AI claiming to be a prophet |

**Revalidasi 2026-10-26 (`7d43241`, baseline `8064ff6`):** addon `@moonwitness/moonql-actors` terpasang di hub dengan 7 model dan seed terpin: 3 tradisi, 2 lokasi, 5 figur (`PROPHETIC_FIGURE`/`SOURCE_REPORTED`/`CANDIDATE`), 7 role, 6 misi, 5 event, 0 avatar. Prophetic Mission Table adalah view read-only atas `actor_figures` (bukan database nabi kedua): tidak ada field misi eksklusif atau ranking, setiap klaim membawa source + passage, dan `GET /actors/figure` menyajikan bacaan per tradisi berdampingan dengan `mergedDoctrine: false`. Kronologi memakai `UNDATED`/`REPORTED_DATE`/`DISPUTED_DATE`/`ATTESTED_DATE` terpisah dari verifikasi, tempat tanpa sumber disimpan `UNNAMED`, dan nama bersama tidak pernah merge. Proposal 25 avatar tercatat `PROPOSAL_ONLY_NOT_INTEGRATED` tanpa nama pulihan, dengan disclosure wajib "not the prophet" dan otoritas `PEDAGOGICAL_ONLY`. Dock `/missions`, `/figures`, `/figures/[figureCode]` read-only. Suite penuh 242 test (236 pass, 6 skipped, 0 fail), drill UI 56/56, drill PG nyata `engine=pg` lulus dua kali, `pnpm build`, `pnpm build:web`, `ui:check` (72 file, 0 violation), `gen:sdk:check` dan eslint file M11 (0 error/0 warning) lulus. Kode M11 mendarat bersama commit ekosistem `fd7bf7f`; commit bukti `7d43241` menambahkan drill PG, deklarasi dependency `@moonwitness/moonql-actors` di apps/radio (memperbaiki tahap install CI) dan laporan audit. CI pada `7d43241` lulus ([run 40280734466](https://github.com/bjo163/moonwitnessxv/actions/runs/40280734466)). Bukti lengkap: [laporan M11](docs/audit/M11-figure-mission-table.md).


## M12 — Typed correlation and evidence graph

**Group:** G2 · **Priority:** P1 · **Prerequisites:** M10,M11 · **Scope:** Source-aware graph relation contracts and projections.

**Exit gate:** Candidate edges and reviewed graph releases separated. Evidence at exact SHA required.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M12-01** — Audit Rocksoul STORY/EVENT/PERSON/TEXT/LAW/PERSPECTIVE boundaries | P1 | D2 | M06-05 | No source owner duplication |
| - [x] | **M12-02** — Define typed candidate edge with evidence span and frame | P1 | D3 | M10-03,M12-01 | Missing evidence cannot be approved edge |
| - [x] | **M12-03** — Design immutable graph release pointer and rollback | P1 | D3 | M12-02,M02-05 | Exactly one versioned active release at a time |
| - [x] | **M12-04** — Implement rebuildable adjacency/search view from canonical records | P1 | D4 | M12-03 | Derived graph can be dropped and reconstructed |
| - [x] | **M12-05** — Add false identity and chronology counterexample fixtures | P1 | D3 | M12-02 | Similarity and co-occurrence never auto sameAs |
| - [x] | **M12-06** — Build Constellation relation detail with provenance and unknown | P1 | D3 | M12-04,M12-05 | Candidate and approved relation clearly labeled |
| - [x] | **M12-07** — Test export/replay/dedup and revoked edge visibility | P1 | D4 | M12-03,M12-06 | Graph release and source lineage correct |

**Revalidasi 2026-10-26 (`e279998`, baseline `8064ff6`):** addon `@moonwitness/moonql-graph` terpasang dengan 4 model dan seed terpin: 5 candidate (2 approved, 1 rejected, 2 pending), 4 relasi ontology `VERIFIED`, 1 release immutable berisi 5 edge (4 ontology + 1 candidate, 1 dedup), pointer singleton v1 dan 5 baris adjacency. Candidate adalah klaim, bukan edge: approval menuntut reviewer, alasan, span, dan SHA-256 persis yang cocok dengan sumber; `sameAs` tidak pernah dapat di-approve (identitas tetap review M10), dan build release memblokir bukti yang tidak lengkap. Release deterministik dan immutable dengan `graphSha` unik; replay mengembalikan release yang ada, pointer memakai CAS `expectedVersion`, dan rollback hanya mengaktifkan release lama. Adjacency/search adalah turunan yang dapat di-drop dan dibangun ulang dari manifest aktif; candidate revoked tetap terlihat dan tetap ada di export release lama. Dock `/constellation` menampilkan panel release + antrean candidate, dan `/constellation/relations/[relationCode]` menyajikan detail candidate vs reviewed, evidence span/frame/SHA, provenance, review trail dan UNKNOWN tanpa kontrol tulis. Suite M12 6/6 lulus, drill UI 99/99, drill PG nyata `engine=pg` lulus dua kali, `pnpm build`, `pnpm build:web`, `ui:check` (75 file, 0 violation), `gen:sdk:check` dan eslint file M12 (0 error/0 warning) lulus. `pnpm verify` pada tree M12 bersih (worktree `90a9b22` + lockfile sinkron) lulus: suite penuh 258 test (251 pass, 7 skipped, 0 fail), `lint-budget` 2/2, lint 0 error. CI run 33 pada `90a9b22` gagal di tahap `pnpm install --frozen-lockfile` karena importer `packages/eslint-config`/`packages/types` belum ada di lockfile; commit lanjutan `06238fb` menyinkronkan lockfile dan CI run 34 lulus ([run 40285847611](https://github.com/bjo163/moonwitnessxv/actions/runs/40285847611)). Bukti lengkap: [laporan M12](docs/audit/M12-typed-correlation-graph.md).


## M13 — SRGBL v8, Key Witness and SWING

**Group:** G2 · **Priority:** P1 · **Prerequisites:** M07,M12 · **Scope:** Bounded method contracts and evidence-linked analysis.

**Exit gate:** S1–L5 and independent scores with fail-closed UNKNOWN. Evidence at exact SHA required.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M13-01** — Read SRGBL P19 specs, issue register and unresolved gates | P1 | D2 | M07-07 | Engineering commit not mistaken for human review |
| - [x] | **M13-02** — Implement S1 exact edition, rights and source sense gate | P1 | D3 | M13-01 | Unresolved source stays unknown |
| - [x] | **M13-03** — Implement R2 text claim and G3 defensible relation checks | P1 | D3 | M13-02,M12-05 | Speculation never presented as source |
| - [x] | **M13-04** — Implement B4 actor/recipient/context and research lens | P1 | D3 | M13-03,M11-06 | Blank frame and unsupported identity rejected |
| - [x] | **M13-05** — Implement L5 scoped derived interpretation and trace | P1 | D3 | M13-04 | One cited conclusion with limits, not divine judgment |
| - [x] | **M13-06** — Keep maturity/15, quality/40, witness/100, direction separate | P1 | D3 | M13-05 | No theological truth ranking or score merge |
| - [x] | **M13-07** — Test SWING, Positive Correction, OFFSIDE adversarial hypotheses | P1 | D4 | M13-06 | Hypothesis must cite and cannot self-validate |

**Revalidasi 2026-10-26 (`3d88850`, baseline `1f80229`):** addon `@moonwitness/moonql-research` terpasang di hub dengan 7 model dan seed terpin: 3 case (Arab exact, terjemahan berlisensi, edisi tak teresolusi), 3 frame, 5 klaim R2, 2 relasi G3, 2 Key Witness, 1 quality run dan 3 hipotesis. Stage S1–L5 fail-closed: S1 menuntut edisi/passage/citation/rights/rights snapshot/SHA-256 persis/source sense; R2 hanya menerima klaim `OBSERVED_TEXT` ber-span dan ber-SHA; G3 menolak spekulasi sebagai sumber; B4 menolak frame kosong, aktor tak teresolusi dan `UNSPECIFIED` tanpa alasan; L5 hanya boleh satu bacaan turunan berlimit — tidak pernah divine judgment atau human review. Maturity/15 (prefiks `PASS` bersambung), quality/40 (10 dimensi pada bundle lengkap), witness/100 (kandidat; ≥70 hanya `eligible-for-review`), dan direction −2..2 (bobot nol = `UNKNOWN`) tetap terpisah tanpa skor gabungan, ranking atau merge. SWING memakai 7 operator kedalaman ≤3 dan berhenti pada duplikat/siklus; Positive Correction menuntut lensa non-netral + counter-reading; OFFSIDE tidak mengedit frame; hipotesis wajib mengutip, tidak dapat memvalidasi diri, dan corroboration menuntut validator berbeda + sumber independen. Pin P19 (specs/register/status) dibaca pada SHA persis; pin XIV tetap `UNAVAILABLE_AT_PIN` dan empat temuan register tetap terbuka dengan `p19ReleaseDecision: BLOCKED`. Suite M13 8/8, Dockerfile contract 6/6, suite penuh 287 test (279 pass, 8 skipped, 0 fail), drill PG nyata `engine=pg` lulus dua kali, `pnpm build`, `pnpm build:web`, `ui:check` (81 file, 0 violation), `gen:sdk:check` dan lint 0 error lulus; manifest + dist `moonql-research` ditambahkan ke kedua Dockerfile agar gate image tetap lengkap. Bukti lengkap: [laporan M13](docs/audit/M13-research-contracts.md); keputusan: [ADR M13-01](docs/decisions/M13-01-srgbgl-p19-gates.md).


## M14 — MIZAN and human research review

**Group:** G2 · **Priority:** P1 · **Prerequisites:** M03,M13 · **Scope:** Reviewer workflow, counterevidence, decisions, retractions.

**Exit gate:** No source or AI candidate auto-approved. Evidence at exact SHA required.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M14-01** — Design role-scoped draft/submitted/reviewed/disputed machine | P1 | D3 | M13-05,M03-04 | Named human actor transitions only |
| - [x] | **M14-02** — Build evidence/counterevidence reviewer detail | P1 | D3 | M14-01 | Exact source ID and version inspectable |
| - [x] | **M14-03** — Prepare real paired human annotator pilot process | P1 | D4 | M14-02 | Independent agreement actually recorded or BLOCKED |
| - [x] | **M14-04** — Implement bounded MIZAN method version and explanation | P1 | D3 | M13-06,M14-01 | Explicit criterion and context for score |
| - [x] | **M14-05** — Add rejection/revision/retraction with immutable decision trail | P1 | D3 | M14-02 | Old decisions preserved while correcting |
| - [x] | **M14-06** — Test wrong-role, forged evidence and concurrent approval | P1 | D4 | M14-03,M14-05 | No unapproved publish on race |
| - [x] | **M14-07** — Define human release criteria for reviewed knowledge claims | P1 | D2 | M14-04,M14-06 | Incomplete pilot remains not-public |

**Revalidasi 2026-10-26 (`ada9d3b`, di atas `31cc124`; baseline M13 `7775a7d`):** addon `@moonwitness/moonql-research` diperluas dengan 6 model (`research_reviews`, `research_review_events`, `research_counterevidence`, `mizan_methods`, `mizan_runs`, `research_pilot_annotations`) dan 15 endpoint review/counterevidence/MIZAN/pilot/release. Mesin status `DRAFT→SUBMITTED→REVIEWED` dengan `REJECTED`/`DISPUTED`/`RETRACTED` hanya dapat digerakkan oleh aktor manusia bernama dari `auth_users`; registrasi selalu `DRAFT` v1 (tanpa auto-approve), submitter tidak boleh menyetujui sendiri (four-eyes), dan guest/anonim ditolak. Setiap transisi memakai version CAS + mutex per-review dan menulis event append-only ber-`eventKey` unik; balapan dua approval menghasilkan `[200,409]` dengan tepat satu event `APPROVE`. Bukti wajib SHA persis (`c0a8…8912`); counterevidence seed (2, `OPEN`) harus diselesaikan dengan alasan sebelum approval; pilot `RECORDED` hanya dengan ≥2 annotator berbeda pada SHA sama (disagreement tetap dicatat), dan pilot kosong tetap `BLOCKED`. MIZAN v1 (`9e6e…669c`, 6 kriteria × 0–4 = 24, `CANDIDATE_NOT_RATIFIED`) menuntut metode terdaftar, explanation/context/unknowns dan total dihitung server; skor bukan verdict dan tidak pernah menjadi ranking. Release hanya kelayakan turunan dan `publicationAvailable` selalu `false` — tanpa jalur publikasi. Suite M14 7/7, Dockerfile contract + compat 10/10, suite penuh 302 test (293 pass, 9 skipped, 0 fail), drill PG nyata `engine=pg` lulus dua kali, `pnpm build`, `pnpm build:web`, `ui:check` (81 file, 0 violation), `gen:sdk:check` dan lint 0 error lulus. CI run 40294309739 pada `6ed2540` (main) lulus ([run 40294309739](https://github.com/bjo163/moonwitnessxv/actions/runs/40294309739)). Bukti lengkap: [laporan M14](docs/audit/M14-mizan-review.md); keputusan: [ADR M14-01](docs/decisions/M14-01-review-workflow.md).


## M15 — Interdisciplinary historical comparison pilot

**Group:** G2 · **Priority:** P1 · **Prerequisites:** M12,M14 · **Scope:** Reviewed case narrative and separated source domains.

**Exit gate:** Jerusalem 70 CE case makes TEXT, EVENT, PERSON, STORY distinct. Evidence at exact SHA required.

**Revalidasi 2026-10-26 (M15 historical comparison pilot):** addon `@moonwitness/moonql-research` diperluas dengan subsistem pilot komparasi interdisipliner Jerusalem 70 CE (`historical-pilot.ts`) yang memisahkan secara ketat domain `TEXT`, `EVENT`, `PERSON`, dan `STORY`. Edisi Mark 13:2 diselesaikan pada edisi SBLGNT / Westcott-Hort 1881 berstatus `PUBLIC_DOMAIN` dengan SHA persis (`e7b8…284c`). Attestasi peristiwa 70 CE dipisahkan dari klaim teologis/mukjizat dengan strata arkeologi Robinson's Arch dan Arch of Titus (`a5f4…1863`), disertai counterevidence kelestarian batuan fondasi Western Wall (`CE-RETAINING-WALL-STONES`). Sumber Flavius Josephus BJ VI.4.5-7 (`b348…a954`, Loeb 1928) memuat transmisi istana Flavian dan counterevidence tradisi Sulpicius Severus / Tacitus. Endpoint publik `GET /research/comparative-case` menyajikan tampilan eksplanatori berbasis bukti lengkap dengan ketidakpastian epistemik dan review state. Upaya penggabungan identitas lintas domain (`link-identity`) atau penyatuan tokoh historis (`SAME_AS`) serta vonis pemenuhan mukjizat otomatis (`assert-fulfillment`) secara ketat ditolak (`400`). Pengujian kecocokan temporal adversarial tanpa bukti manuskrip pra-peristiwa ditolak sebagai bukti historis (`200`, `valid: false`, `requiresCounterevidence: true`). Suite M15 7/7 lulus, committed SDK agrees with live contract, dan monorepo lint 0 error.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M15-01** — Resolve Mark 13:2 exact edition and rights | P1 | D2 | M07-05 | Correct source reference with permission |
| - [x] | **M15-02** — Record Jerusalem 70 CE event attestation and counterevidence | P1 | D3 | M15-01 | Historical chronology distinct from religious claim |
| - [x] | **M15-03** — Record Josephus source and transmission scope | P1 | D2 | M11-03,M15-02 | Actor report has explicit source attribution |
| - [x] | **M15-04** — Define attributed prophecy interpretation and opposing frames | P1 | D3 | M13-07,M15-03 | No automatic miraculous-fulfillment verdict |
| - [x] | **M15-05** — Link TEXT/EVENT/PERSON/STORY typed reviewed candidates | P1 | D4 | M12-06,M15-04 | Cross-domain identities not merged |
| - [x] | **M15-06** — Build evidence-centered public explanatory case view | P1 | D3 | M15-05,M14-07 | Review state and uncertainties visible |
| - [x] | **M15-07** — Test false temporal matches and unsupported identity edges | P1 | D4 | M15-06 | Adversarial cases cannot pass as proof |


## M16 — Private witness archive and consent lifecycle

**Group:** G3 · **Priority:** P1 · **Prerequisites:** M03,M04,M06 · **Scope:** Private witness addon and protected editor.

**Exit gate:** Original, reported times, consent/correction and withdrawal honored. Evidence at exact SHA required.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M16-01** — Specify private witness object and provenance categories | P1 | D3 | M03-06,M06-07 | Default private, no automatic public original ; [packet](docs/tasks/M16/M16-01.md) |
| - [ ] | **M16-02** — Preserve occurred/observed/recorded/written dates separately | P1 | D3 | M16-01 | Tick-Tock corrected chronology remains exact ; [packet](docs/tasks/M16/M16-02.md) |
| - [ ] | **M16-03** — Implement immutable original and appended correction lineage | P1 | D4 | M16-02,M04-02 | Original bytes not overwritten by summary ; [packet](docs/tasks/M16/M16-03.md) |
| - [ ] | **M16-04** — Gate upload and viewing by consent and explicit ACL | P1 | D4 | M16-03,M03-02 | No anonymous access or media link leakage ; [packet](docs/tasks/M16/M16-04.md) |
| - [ ] | **M16-05** — Provide redacted derivative preview for human publishing request | P1 | D3 | M16-04 | Privacy review before any public output ; [packet](docs/tasks/M16/M16-05.md) |
| - [ ] | **M16-06** — Test consent withdrawal, retention and search/export purge | P1 | D4 | M16-05 | Withdrawn testimony not retrievable publicly ; [packet](docs/tasks/M16/M16-06.md) |
| - [ ] | **M16-07** — Label testimony vs empirical claim vs fiction in every projection | P1 | D2 | M16-06 | No unverified spiritual message asserted as fact |


## M17 — Story canon, characters, four books and SHADOW

**Group:** G3 · **Priority:** P1 · **Prerequisites:** M06,M16 · **Scope:** Story addon, HQ creative workbench, asset provenance.

**Exit gate:** Canonical story versions and source gaps remain transparent. Evidence at exact SHA required.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M17-01** — Map II eight eras, crew and XII/XIV story versions to identities | P1 | D3 | M06-03,M16-01 | Separate character/actor IDs with source locator ; [packet](docs/tasks/M17/M17-01.md) |
| - [ ] | **M17-02** — Implement false-alias prevention for Shadow/Batteries/Honey/ZILL | P1 | D3 | M17-01,M10-04 | No phonetic or mystical sameAs ; [packet](docs/tasks/M17/M17-02.md) |
| - [ ] | **M17-03** — Define story world, arc, episode, scene and version graph | P1 | D3 | M17-02 | 99 chapter headings not treated as 99 originals ; [packet](docs/tasks/M17/M17-03.md) |
| - [ ] | **M17-04** — Record four-book THE BATTERIES and separate NPD variants gaps | P1 | D2 | M17-03 | Missing scene/pages marked NEEDS_SOURCE |
| - [ ] | **M17-05** — Build SHADOW editor as HQ workspace on shared auth | P1 | D4 | M17-03,M03-02 | Private drafts and revision permissions controlled ; [packet](docs/tasks/M17/M17-05.md) |
| - [ ] | **M17-06** — Track original poster/music/derived media license and manifests | P1 | D3 | M17-05 | No unlicensed lyrics or external artwork ; [packet](docs/tasks/M17/M17-06.md) |
| - [ ] | **M17-07** — Test chronology, alias conflict and unpublished image access | P1 | D4 | M17-06,M16-06 | Draft never visible in public Story ; [packet](docs/tasks/M17/M17-07.md) |


## M18 — One publication and retraction gate

**Group:** G3 · **Priority:** P1 · **Prerequisites:** M03,M14,M07 · **Scope:** Source rights, review release and public projections.

**Exit gate:** Only reviewed/consented versions visible and retractable. Do not infer completion from code inventory alone.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M18-01** — Specify single publish state machine for text, testimony and story | P1 | D3 | M14-07,M07-07 | One approval path with type-specific rights veto; Story-specific release additionally needs M17 ; [packet](docs/tasks/M18/M18-01.md) |
| - [ ] | **M18-02** — Store edition/body license, media consent and reviewer evidence | P1 | D3 | M18-01 | No unknown-rights byte published ; [packet](docs/tasks/M18/M18-02.md) |
| - [ ] | **M18-03** — Create immutable release manifest and current-version pointer | P1 | D3 | M18-01,M12-03 | Public read refers to one approved revision ; [packet](docs/tasks/M18/M18-03.md) |
| - [ ] | **M18-04** — Implement withdrawal, correction, takedown and appeal process | P1 | D4 | M18-03,M03-06 | Revoked content ceases public availability ; [packet](docs/tasks/M18/M18-04.md) |
| - [ ] | **M18-05** — Invalidate search, preview, export and generated cache on revoke | P1 | D4 | M18-04 | No revoked content leaks from projections ; [packet](docs/tasks/M18/M18-05.md) |
| - [ ] | **M18-06** — Display reviewer scope, source and original-vs-derivative label | P1 | D3 | M18-03 | No AI or copywriting masquerades as original source ; [packet](docs/tasks/M18/M18-06.md) |
| - [ ] | **M18-07** — Test concurrent publish, wrong role and rollback/replay | P1 | D4 | M18-05,M18-06 | Unapproved public data remains denied ; [packet](docs/tasks/M18/M18-07.md) |


## M19 — Design system, accessibility and frontend experience

**Group:** G3 · **Priority:** P1 · **Prerequisites:** Relevant M05 locale contracts, M08 for Reader-specific work · **Scope:** MoonUI, Dock, Headquarters, **Cockpit Vite/CLI**, bilingual first landing and shared design. Microtasks M19-08–35 refine the existing M19 umbrellas.

**Exit gate:** Accessible interaction modes without Radio regression, bilingual Dock preview with tested /id and /en, and independently verified id/en coverage of HQ/Cockpit and applicable other app surfaces. A Dock preview may pass its **scoped** gate before the complete global M19 gate.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M19-01** — Audit MoonUI vs Moonframe vs Rocksoul asset ownership | P1 | D2 | M05-07 | One UI component contract with checked external rights |
| - [ ] | **M19-02** — Define Reader/Research/Story/Operator layout/typography tokens | P1 | D3 | M19-01 | Design intentional differences without semantic drift |
| - [ ] | **M19-03** — Map public information architecture and responsive search flows | P1 | D3 | M08-02,M19-02 | Reader not buried under 30 equal nav labels |
| - [ ] | **M19-04** — Implement keyboard/focus/errors/reduced motion accessibility | P1 | D3 | M19-03 | Basic WCAG-oriented interactions functional |
| - [ ] | **M19-05** — Test Arabic/Hebrew/Greek scripts, RTL and diacritics | P1 | D3 | M19-04 | Unicode and text-selection meaning retained |
| - [ ] | **M19-06** — Create screenshot and behavioral baseline across experience modes | P1 | D3 | M19-03,M19-05 | Visual snapshots complement behavioral tests |
| - [ ] | **M19-07** — Run J01/J03 browser acceptance; J05 only when Story is in release scope | P1 | D4 | M19-06 | Selected-scope flows pass with accessibility; optional Story cannot block Reader |
| - [ ] | **M19-08** — Audit Dock route and public content locale coverage | P0 | D2 | M05-08 | **Owner:** Dock; **paths:** apps/dock/src/app; src/ui/components; **steps:** inventory real pages → map public/protected status → mark existing legacy URL contract; **DoD:** no false whole-corpus localization; evidence = focused positive/negative tests + exact SHA; rollback where needed |
| - [ ] | **M19-09** — Implement Dock /id, /en, / and unsupported-locale routes | P0 | D4 | M05-11,M19-08 | **Owner:** Dock; **paths:** apps/dock/src/app; apps/dock/src/middleware.ts (future proxy); **steps:** define route boundary → preserve embed/api/metadata headers → test redirects/404; **DoD:** both localized roots work; no broken legacy API/assets/SSE/CSP; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-09.md) |
| - [ ] | **M19-10** — Write and integrate Indonesian landing content | P0 | D2 | M19-09,M02-01 | **Owner:** Dock editorial; **paths:** apps/dock/src/app; locale catalog; **steps:** source approved mission → label AVAILABLE/PILOT/PLANNED → verify all Indonesian hero/sections; **DoD:** no fabricated impact, feature readiness, divine authorization; evidence = focused positive/negative tests + exact SHA; rollback where needed |
| - [ ] | **M19-11** — Write and integrate English landing content | P0 | D2 | M19-09,M19-10 | **Owner:** Dock editorial; **paths:** apps/dock/src/app; locale catalog; **steps:** translate meaning → check names/provenance → verify all English hero/sections; **DoD:** same claims and functionality as Indonesian; evidence = focused positive/negative tests + exact SHA; rollback where needed |
| - [ ] | **M19-12** — Build accessible language switcher and stable route links | P0 | D2 | M19-09 | **Owner:** Dock + MoonUI; **paths:** apps/dock/src/ui/components; shared i18n; **steps:** add switcher → preserve current path → test keyboard/ARIA and persisted choice; **DoD:** id⇄en changes copy; no accidental reset to browser language; evidence = focused positive/negative tests + exact SHA; rollback where needed |
| - [ ] | **M19-13** — Consolidate Dock header and active nav semantics | P1 | D3 | M19-12,M19-03 | **Owner:** Dock; **paths:** apps/dock/src/ui/components/shell.tsx; tests; **steps:** group nav → correct active current route → fix non-functional Join CTA; **DoD:** mobile navigation accessible; legacy paths still work; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-13.md) |
| - [ ] | **M19-14** — Implement locale-aware Dock metadata and SEO alternates | P0 | D3 | M19-09,M19-11 | **Owner:** Dock; **paths:** apps/dock/src/app/layout.tsx; manifest.ts; metadata routes; **steps:** localized title/description → canonical+hreflang → sitemap/OG test; **DoD:** id/en metadata real; no invented site URL or orphan canonical; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-14.md) |
| - [ ] | **M19-15** — Localize Dock forms/validation/loading/error/empty states | P1 | D3 | M19-09,M05-13 | **Owner:** Dock; **paths:** apps/dock/src/ui; locale catalogs; **steps:** inventory all visible states → replace hardcoded labels → test failure paths; **DoD:** no essential mixed-language UX or untranslated accessible labels; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-15.md) |
| - [ ] | **M19-16** — Decouple informative landing from live Hub availability | P0 | D3 | M19-09 | **Owner:** Dock; **paths:** apps/dock/src/app/page.tsx; data/queries/program.ts; **steps:** render curated static mission → isolate optional live widgets → test Hub offline; **DoD:** GET /id and /en remain useful and HTTP 200 without DB/Hub; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-16.md) |
| - [ ] | **M19-17** — Test bilingual homepage responsive and reduced-motion | P0 | D3 | M19-10,M19-11,M19-12 | **Owner:** Dock + MoonUI; **paths:** apps/dock/src/app; CSS; browser tests; **steps:** test mobile/desktop → keyboard/focus/reduced-motion → fix regressions; **DoD:** no overflow, dead CTA, layout or assistive tech regression; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-17.md) |
| - [ ] | **M19-18** — Remove nested Dock SiteLayout and duplicate landmarks | P1 | D2 | M19-08 | **Owner:** Dock; **paths:** apps/dock/src/app/{prisms,timeline,studio,reader}; tests; **steps:** remove nested wrappers → inspect SSR markup → test one header/main/footer; **DoD:** no double nav/landmarks on affected routes; evidence = focused positive/negative tests + exact SHA; rollback where needed |
| - [ ] | **M19-19** — Audit source rights/public research projection in Dock | P0 | D3 | M18-01,M19-08 | **Owner:** Dock + D08; **paths:** apps/dock/src/data/queries/research.ts; reader/compare/page.tsx; **steps:** remove direct unrestricted candidate publication → use approved D08 projection → negative-test; **DoD:** no unreviewed or rights-unknown information leaked to public; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-19.md) |
| - [ ] | **M19-20** — Localize HQ login and recoverable auth errors | P1 | D2 | M05-10 | **Owner:** Headquarters; **paths:** apps/headquarters/src/app/login; src/layouts/auth.tsx; **steps:** apply shared catalogs → validate both languages → test expired session; **DoD:** login, labels and errors complete without disclosing credentials; evidence = focused positive/negative tests + exact SHA; rollback where needed |
| - [ ] | **M19-21** — Localize HQ shell, navigation and operational statuses | P1 | D3 | M19-20 | **Owner:** Headquarters; **paths:** apps/headquarters/src/ui/client/SideNav.tsx; layouts/vertical.tsx; **steps:** translate navigation → distinguish real/demo telemetry → test menus; **DoD:** id/en and honest operational statuses; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-21.md) |
| - [ ] | **M19-22** — Localize HQ model/forms/views/actions/validation | P1 | D3 | M19-21 | **Owner:** Headquarters; **paths:** apps/headquarters/src/app/(admin)/models; views; **steps:** inventory metadata-generated labels → translate UI chrome/errors → test CRUD permissions; **DoD:** model/field identifiers stable; both locale forms usable; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-22.md) |
| - [ ] | **M19-23** — HQ language selection, cookie and cross-app links | P1 | D3 | M19-22,M05-11 | **Owner:** Headquarters; **paths:** apps/headquarters/src/layouts; locale helper/tests; **steps:** add selector → preserve current route/role → test session expiry; **DoD:** no auth bypass; preferences persist predictably; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-23.md) |
| - [ ] | **M19-24** — HQ id/en full visible UI regression and E2E | P1 | D3 | M19-23 | **Owner:** Headquarters; **paths:** apps/headquarters tests; locale fixtures; **steps:** test login, role, empty/error, model fields → snapshot copy → record SHA; **DoD:** id/en coverage verified beyond login only; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-24.md) |
| - [ ] | **M19-25** — Audit actual Cockpit Vite UI and optional CLI help | P0 | D2 | M05-08 | **Owner:** Cockpit; **paths:** apps/cockpit/client; src; package.json; **steps:** inventory React panels/menus/dialogs/CLI → tag machine vs human strings; **DoD:** all visible Cockpit surfaces explicitly scoped; evidence = focused positive/negative tests + exact SHA; rollback where needed |
| - [ ] | **M19-26** — Localize Cockpit nav, panes, status and tooltips | P1 | D3 | M19-25,M05-10 | **Owner:** Cockpit; **paths:** apps/cockpit/client/App.tsx; components; catalogs; **steps:** replace labels with catalog → test service states → verify aria labels; **DoD:** id/en controls work without altering live logs; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-26.md) |
| - [ ] | **M19-27** — Localize Cockpit forms, confirmations and errors | P1 | D3 | M19-26 | **Owner:** Cockpit; **paths:** apps/cockpit/client/components; UI tests; **steps:** translate positive/negative feedback → preserve dangerous-action confirmation → test; **DoD:** id/en for every visible mutation flow; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-27.md) |
| - [ ] | **M19-28** — Localize Cockpit settings/help and accessible messages | P1 | D2 | M19-26 | **Owner:** Cockpit; **paths:** apps/cockpit/client/components; locale fixtures; **steps:** translate help/settings → tooltips/aria → test keyboard; **DoD:** no mixed-language human UI; no change to machine logs; evidence = focused positive/negative tests + exact SHA; rollback where needed |
| - [ ] | **M19-29** — Persist Cockpit UI locale and preserve command contracts | P1 | D3 | M19-27,M05-11 | **Owner:** Cockpit; **paths:** apps/cockpit/client/App.tsx; preference helper/tests; **steps:** implement explicit switcher → persist locally → negative-test state/action; **DoD:** id/en stable across refresh; service tags/CLI commands unchanged; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-29.md) |
| - [ ] | **M19-30** — Verify Cockpit GUI and CLI human-output locale scope | P1 | D3 | M19-28,M19-29 | **Owner:** Cockpit; **paths:** apps/cockpit/client tests; CLI output fixtures; **steps:** run id/en behavioral tests → verify shortcuts/log fields invariant → record SHA; **DoD:** Cockpit explicitly VERIFIED before global gate; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-30.md) |
| - [ ] | **M19-31** — Protect RTL/script and corpus source language semantics | P1 | D3 | M19-09,M05-12 | **Owner:** MoonUI + Dock; **paths:** apps/dock/src/ui/components/reader.tsx; MoonUI tests; **steps:** test Arabic/Hebrew/Greek/diacritics → preserve source direction → verify copied citations; **DoD:** source language is not UI locale; diacritics/text stable; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-31.md) |
| - [ ] | **M19-32** — Localize shared MoonUI UI chrome and design semantics | P1 | D3 | M05-10,M19-01 | **Owner:** MoonUI; **paths:** packages/moonui/src; locale integration tests; **steps:** audit shared labels/ARIA → connect catalogs → test consumers; **DoD:** shared UI behavior same across skins and languages; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-32.md) |
| - [ ] | **M19-33** — Preserve cross-app locale during user navigation | P1 | D2 | M19-12,M19-23,M19-29 | **Owner:** platform navigation; **paths:** shared link adapter; target frontend tests; **steps:** map Dock/HQ/Cockpit links → preserve explicit locale where supported → test; **DoD:** no account token or PII leakage across subdomains; evidence = focused positive/negative tests + exact SHA; rollback where needed |
| - [ ] | **M19-34** — Create cross-app id/en accessibility and copy E2E matrix | P1 | D4 | M19-24,M19-30,M19-17 | **Owner:** platform QA; **paths:** app-specific browser suites; shared locale fixtures; **steps:** run visible UI matrix → missing-key check → record exact SHA; **DoD:** all agreed existing GUI apps verified; ARSY/API messages checked separately; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-34.md) |
| - [ ] | **M19-35** — Verify visual/screenshots and regression across locales | P1 | D3 | M19-34 | **Owner:** platform QA; **paths:** MoonUI screenshot fixtures; browser test runner; **steps:** snapshot key breakpoints both locales → test long labels → mark evidence; **DoD:** no clipped nav, RTL/source inversion or inaccessible selector; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-35.md) |


## M20 — Headquarters and 100CENTER human governance

**Group:** G4 · **Priority:** P1 · **Prerequisites:** M14,M18 · **Scope:** Existing HQ, models/views, audit and proposed review areas.

**Exit gate:** Single admin authorization, task and review workspace. Do not infer completion from code inventory alone.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M20-01** — Audit HQ generic model UI, route guards and existing ops widgets | P1 | D2 | M00-02,M14-01 | Existing features reused, not duplicate admin app |
| - [ ] | **M20-02** — Design role-scoped review queue and work item lifecycle | P1 | D3 | M20-01,M18-01 | No account may approve its own restricted submission ; [packet](docs/tasks/M20/M20-02.md) |
| - [ ] | **M20-03** — Display rights/import blockers and reviewed source status | P1 | D3 | M20-02 | Editors can distinguish metadata-only vs released ; [packet](docs/tasks/M20/M20-03.md) |
| - [ ] | **M20-04** — Create identity/alias and evidence reviewer panels | P1 | D3 | M20-02,M10-06 | Reviewer resolves with source and conflict links ; [packet](docs/tasks/M20/M20-04.md) |
| - [ ] | **M20-05** — Improve audit actor attribution, retention and reliability contract | P1 | D4 | M20-02,M03-07 | No assumption existing async audit is immutable ; [packet](docs/tasks/M20/M20-05.md) |
| - [ ] | **M20-06** — Build 100CENTER view for ordinary human task/incident decisions | P1 | D3 | M20-03,M20-05 | No supernatural mandate or automatic irreversible action ; [packet](docs/tasks/M20/M20-06.md) |
| - [ ] | **M20-07** — Test direct URL, API role and stale-cookie access to HQ sections | P1 | D3 | M20-06 | Server denies unauthorized operations ; [packet](docs/tasks/M20/M20-07.md) |


## M21 — Optional local AI research assistant candidate workflow

**Group:** G4 · **Priority:** P2 · **Prerequisites:** M03,M14 · **Scope:** Optional AI execution, candidate inbox and source-grounded retrieval.

**Exit gate:** No hidden remote fallback, no auto write/publish, deterministic fallback. Do not infer completion from code inventory alone.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M21-01** — Evaluate local model constraints, runtime/privacy and disable switch | P2 | D3 | M14-07,M03-07 | Service operates correctly with AI absent ; [packet](docs/tasks/M21/M21-01.md) |
| - [ ] | **M21-02** — Define versioned AI candidate and tool-call evidence schema | P2 | D3 | M21-01 | Records model, prompt, data provenance and user consent ; [packet](docs/tasks/M21/M21-02.md) |
| - [ ] | **M21-03** — Prototype source-permission-aware retrieval, not open private files | P2 | D4 | M07-07,M21-02 | Restricted bytes cannot reach unauthorized model/user ; [packet](docs/tasks/M21/M21-03.md) |
| - [ ] | **M21-04** — Guard prompt injection, egress and tool permissions | P2 | D4 | M21-03 | Untrusted source cannot issue executable instructions ; [packet](docs/tasks/M21/M21-04.md) |
| - [ ] | **M21-05** — Implement HQ review inbox for AI-suggested claims or edits | P2 | D3 | M21-02,M20-02 | Human reviewer required for canonical action ; [packet](docs/tasks/M21/M21-05.md) |
| - [ ] | **M21-06** — Prove source/research UI usable with AI unavailable | P2 | D2 | M21-01 | No critical path depends on AI inference |
| - [ ] | **M21-07** — Test forged citations, scope bypass and auto-publication denial | P2 | D4 | M21-04,M21-05,M21-06 | Unauthorized requests blocked and recorded ; [packet](docs/tasks/M21/M21-07.md) |


## M22 — Radio, channels and Signal backward compatibility

**Group:** G4 · **Priority:** P0 · **Prerequisites:** M00,M01,M03 · **Scope:** Existing radio, addons, Dock, WhatsApp and DENPA.

**Exit gate:** All current Signal flows remain functional while XV grows. Do not infer completion from code inventory alone.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M22-01** — Freeze actual station seed/catalog response before change | P0 | D2 | M00-03 | Source fixture and known stream state recorded ; [packet](docs/tasks/M22/M22-01.md) |
| - [ ] | **M22-02** — Test player, playlog pseudonyms, listening beacons and schedules | P0 | D3 | M22-01 | No listener identity or playback regression ; [packet](docs/tasks/M22/M22-02.md) |
| - [ ] | **M22-03** — Verify DENPA opt-in, webhook token and payload validation | P0 | D3 | M03-07 | Unauthenticated inbound cannot write ; [packet](docs/tasks/M22/M22-03.md) |
| - [ ] | **M22-04** — Review WhatsApp QR/session lifecycle and disabled-default behavior | P0 | D3 | M03-07 | Credentials protected and no surprise channel startup ; [packet](docs/tasks/M22/M22-04.md) |
| - [ ] | **M22-05** — Protect OpenAPI and root Hub service discovery contracts | P0 | D2 | M05-07,M22-01 | No renamed existing API or SDK entries |
| - [ ] | **M22-06** — Test private playlogs, admin metrics and public catalogue isolation | P0 | D3 | M22-02,M03-02 | No private model data via list/search ; [packet](docs/tasks/M22/M22-06.md) |
| - [ ] | **M22-07** — Publish reusable Radio regression suite for all future gates | P0 | D2 | M22-03,M22-04,M22-05,M22-06 | Run before and after each integration |


## M23 — Voluntary Journey, Missions, 33 Patches and Empire vocabulary

**Group:** G4 · **Priority:** P2 · **Prerequisites:** M18,M20 · **Scope:** Optional journey module and editorial registry.

**Exit gate:** Human action tracked voluntarily without faith/salvation rankings. Do not infer completion from code inventory alone.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M23-01** — Preserve 33 patch titles, 014 conflict and all reported statuses | P2 | D2 | M06-04 | No fabricated divine approval or external submission |
| - [ ] | **M23-02** — Define self/community/global consent and member scopes | P2 | D3 | M03-06,M20-06 | Global cannot imply authority over personal accounts ; [packet](docs/tasks/M23/M23-02.md) |
| - [ ] | **M23-03** — Model Path/Journey/Milestone/expiring human Mandate | P2 | D3 | M23-02 | Consent, revoke and responsible operator recorded ; [packet](docs/tasks/M23/M23-03.md) |
| - [ ] | **M23-04** — Index nine Prime Code, 10 WINGS and GOD99 as separate metadata | P2 | D2 | M06-05 | No programmatic angel/god identities |
| - [ ] | **M23-05** — Prototype human-owned mission checklist with rollback | P2 | D3 | M23-03 | No automatic high-consequence world patch ; [packet](docs/tasks/M23/M23-05.md) |
| - [ ] | **M23-06** — Keep AETHERION 10 realms and 100 levels as fictional game system | P2 | D2 | M23-04 | XP never equated with human age, holiness or heaven |
| - [ ] | **M23-07** — Adversarial test for spiritual ranking, unauthorized mission actions | P2 | D3 | M23-05,M23-06 | Human agency and stated metaphoric boundaries enforced ; [packet](docs/tasks/M23/M23-07.md) |


## M24 — World Monitor and sourced external observations

**Group:** G5 · **Priority:** P2 · **Prerequisites:** M03,M05,M06 · **Scope:** Optional world addon and historical A-L-L-A-H adapters.

**Exit gate:** Attributable timestamped provider data with clear offline/freshness states. Only real evidence closes this gate.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M24-01** — Audit A-L-L-A-H USGS/GDACS/NOAA/Open-Meteo historical code and terms | P2 | D2 | M06-05 | Historical fixtures not mislabeled live production |
| - [ ] | **M24-02** — Specify source, units, geo precision, temporal and revision model | P2 | D3 | M24-01 | Every observation linked to provider and timestamp ; [packet](docs/tasks/M24/M24-02.md) |
| - [ ] | **M24-03** — Design controlled outbound egress, quotas, retry and caching | P2 | D3 | M03-07,M24-02 | No uncontrolled alert bot or external fetch ; [packet](docs/tasks/M24/M24-03.md) |
| - [ ] | **M24-04** — Prototype one feature-flagged read-only provider adapter | P2 | D4 | M24-03 | Fails safely when provider/terms/connection missing ; [packet](docs/tasks/M24/M24-04.md) |
| - [ ] | **M24-05** — Build source-backed public World Monitor with stale flags | P2 | D3 | M24-04 | Not showing stale fixtures as live observations ; [packet](docs/tasks/M24/M24-05.md) |
| - [ ] | **M24-06** — Review YouTube Sentinel moderation, appeal, classification lens | P2 | D4 | M24-01,M03-06 | No automated punitive action or unsupported theology certainty ; [packet](docs/tasks/M24/M24-06.md) |
| - [ ] | **M24-07** — Test invalid/late/offline feed, timezone, geographic ambiguity | P2 | D4 | M24-05,M24-06 | Degraded provider displays uncertainty and source state ; [packet](docs/tasks/M24/M24-07.md) |


## M25 — Time, Cosmos, Earth science and research horizons

**Group:** G5 · **Priority:** P3 · **Prerequisites:** M06,M24 · **Scope:** MTS, Cosmic Atlas, Atmosphere, HELIOGRID and Material Forge concepts.

**Exit gate:** Scientifically honest hypothesis map with no fake working device. Only real evidence closes this gate.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M25-01** — Audit M-TIME/Antikythera claims and engineering dependencies | P3 | D3 | M06-05 | UTC/celestial model and narrative time kept distinct ; [packet](docs/tasks/M25/M25-01.md) |
| - [ ] | **M25-02** — Separate physical readings, simulation, astronomy and story modes | P3 | D2 | M24-02 | UI ontology has explicit claim type and source |
| - [ ] | **M25-03** — Design HELIOGRID/Material Forge falsifiable research questions | P3 | D3 | M06-05 | No generator/quantum chip claimed built ; [packet](docs/tasks/M25/M25-03.md) |
| - [ ] | **M25-04** — Define unit normalization, measurement/calibration and source metadata | P3 | D3 | M25-02,M25-03 | No simulated values presented as sensor data ; [packet](docs/tasks/M25/M25-04.md) |
| - [ ] | **M25-05** — Sketch optional Cosmos/Time explorer with proposal label | P3 | D2 | M25-01 | Not discoverable as shipped feature |
| - [ ] | **M25-06** — Research source context of comparative cosmos in sacred traditions | P3 | D3 | M25-02,M07-05 | Historical/scripture/scientific claims separated ; [packet](docs/tasks/M25/M25-06.md) |
| - [ ] | **M25-07** — Prepare cost/safety/hardware feasibility decision before execution | P3 | D4 | M25-04,M25-06 | No hardware effort without empirical review ; [packet](docs/tasks/M25/M25-07.md) |


## M26 — Legacy canon, Empire registries and missing sources

**Group:** G5 · **Priority:** P2 · **Prerequisites:** M06,M17 · **Scope:** V10/V10.1, II/XII, GOD-PROMISE, 25 Amanah and source gaps.

**Exit gate:** Versioned comprehensive archive inventory with honest unresolved entries. Only real evidence closes this gate.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M26-01** — Crosswalk 99 chapter labels to actual source versions | P2 | D3 | M06-02 | All slots indexed without falsely claiming 99 manuscripts ; [packet](docs/tasks/M26/M26-01.md) |
| - [ ] | **M26-02** — Recover 00-MAIN GOD PROMISE distinct from ROCKSOUL/paper | P2 | D3 | M06-06 | Different originals not automatically merged ; [packet](docs/tasks/M26/M26-02.md) |
| - [ ] | **M26-03** — Recover four THE BATTERIES books, NPD scenes, 15 synopsis sources | P2 | D4 | M26-01 | Missing pages, chronology and rights explicitly recorded ; [packet](docs/tasks/M26/M26-03.md) |
| - [ ] | **M26-04** — Reconcile ZILL origins, Honey/Queen R, and story alias variants | P2 | D3 | M26-01,M10-04 | Ambiguous identities stay disputed ; [packet](docs/tasks/M26/M26-04.md) |
| - [ ] | **M26-05** — Audit Empire nine principles, WINGS 10, G.O.D.99 and Asma registry | P2 | D2 | M06-05 | Independent taxonomy/permission kinds confirmed |
| - [ ] | **M26-06** — Locate exact 25 Bidang Amanah source and mission mapping | P2 | D4 | M26-05 | 25 evidence rows or explicitly unverified, never guessed names ; [packet](docs/tasks/M26/M26-06.md) |
| - [ ] | **M26-07** — Audit early ZENIX/Universe history, AGE CODE and lost-source leads | P2 | D3 | M26-01 | Reported history vs repo evidence clearly tagged ; [packet](docs/tasks/M26/M26-07.md) |


## M27 — Full-stack acceptance, release evidence and human go/no-go

**Group:** G6 · **Priority:** P0 · **Prerequisites:** M01,M03,M04,M08,M14,M18,M19,M20,M22,M28 for **full XV**; *scoped bilingual preview* follows M27-08–19 and the specific security/rights/locale/deployment gates it actually uses. · **Scope:** Exact release SHA, public-preview or full-feature manifest, real tests and restore.

**Exit gate:** No publication of restricted/unreviewed data; preview and full release evidence are separately classified. A successful scoped preview does **not** close M27-01–07/full XV.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M27-01** — Freeze intended release feature set and exact commit manifest | P0 | D2 | M01-07,M20-07,M28-07 | Experimental optional features excluded unless separately accepted |
| - [ ] | **M27-02** — Execute build/lint/typecheck/tests/SDK/PG/docker matrix | P0 | D4 | M27-01 | Actual logs and pass/fail at source SHA |
| - [ ] | **M27-03** — Execute Radio + Reader + HQ security/browser E2E | P0 | D4 | M27-02,M19-07,M22-07 | User journeys J01/J03/J07 pass, denied role tests visible |
| - [ ] | **M27-04** — Restore isolated backup and prove row/manifest integrity | P0 | D3 | M04-07,M27-01 | Recovery run recorded and verified |
| - [ ] | **M27-05** — Complete licensing, consent, research review and AI scope gates | P0 | D3 | M18-07,M14-07 | No unreviewed/rights-unknown raw source publicly served |
| - [ ] | **M27-06** — Generate changelog, release notes and rollback/resume contract | P0 | D2 | M27-02,M27-05 | Exact SHA, binary outputs and migration steps recorded |
| - [ ] | **M27-07** — Hold human release go/no-go and log remaining risks | P0 | D2 | M27-03,M27-04,M27-06 | Only approved and tested scope deployed |
| - [ ] | **M27-08** — Freeze bilingual preview release manifest and non-goals | P0 | D2 | M19-08,M05-09 | **Owner:** release management; **paths:** TODO.md; release runbook; **steps:** pin exact source SHA → identify included public routes → list explicitly excluded draft/private features; **DoD:** preview not conflated with full XV M27 completion; evidence = focused positive/negative tests + exact SHA; rollback where needed |
| - [ ] | **M27-09** — Verify frozen pnpm + Dock/Hub production Docker builds | P0 | D3 | M27-08 | **Owner:** release engineering; **paths:** Dockerfile; Dockerfile.web; Docker build logs; **steps:** run pnpm verify:docker → run image smoke → capture digests; **DoD:** BUILD_VERIFIED only with actual logs and exact source SHA; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M27/M27-09.md) |
| - [ ] | **M27-10** — Create secure preview Compose topology and verify routing | P0 | D4 | M27-09,M03-07 | **Owner:** release engineering; **paths:** docker-compose.yml or approved preview override; tests; **steps:** config --quiet → internal-only network/ports → health/load/offline smoke; **DoD:** no DB/HQ/Cockpit/AI ports publicly reachable by default; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M27/M27-10.md) |
| - [ ] | **M27-11** — Gate production secrets and sample-password rejection | P0 | D2 | M27-10,M01-06 | **Owner:** security/release; **paths:** Compose environment tests; .env.example; **steps:** use dummy staging secrets → reject missing/default values → scan rendered config output; **DoD:** no secrets committed/printed or sample credentials in production; evidence = focused positive/negative tests + exact SHA; rollback where needed |
| - [ ] | **M27-12** — Test Dock /id /en SEO, navigation and health under Compose | P0 | D3 | M27-10,M19-17,M19-14 | **Owner:** Dock/release; **paths:** Docker staging tests; browser E2E fixtures; **steps:** start services → request two locales → test links, headers and degrade; **DoD:** all preview routes respond correctly and omit private data; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M27/M27-12.md) |
| - [ ] | **M27-13** — Produce Git-backed Coolify deployment playbook | P0 | D2 | M27-10 | **Owner:** DevOps; **paths:** README.md; docs/runbook-restore.md or operator deploy notes; **steps:** record Git repo/branch/compose path/service Dock:3001 → document domains/secrets/health; **DoD:** official docs matched; internal services not published; evidence = focused positive/negative tests + exact SHA; rollback where needed |
| - [ ] | **M27-14** — Verify HTTPS domain, routing and real deployed SHA | P0 | D3 | M27-12,M27-13 | **Owner:** DevOps; **paths:** Coolify deployment logs; HTTP/TLS smoke output; **steps:** deploy only after authorized go/no-go → check /id /en TLS, headers, revision; **DoD:** DEPLOYED_VERIFIED only with real access/logs; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M27/M27-14.md) |
| - [ ] | **M27-15** — Test rollback target and off-host data backups if used | P0 | D4 | M27-10,M04-05 | **Owner:** DevOps/DB; **paths:** docs/runbook-restore.md; tested snapshots; **steps:** pin previous image → test rollback and restore in isolated DB → report limitations; **DoD:** no false 'off-host verified' claim; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M27/M27-15.md) |
| - [ ] | **M27-16** — Test public URL, ACL and unsafe-data negative matrix | P0 | D3 | M19-19,M27-12 | **Owner:** security/release; **paths:** Hub ACL tests; public browser tests; **steps:** try anonymous draft source/hypothesis/mandate access → test list/get/search/export; **DoD:** access denied until released public projection; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M27/M27-16.md) |
| - [ ] | **M27-17** — Capture launch monitoring, observability and incident response | P1 | D2 | M27-12 | **Owner:** operations; **paths:** operator docs; monitor smoke fixtures; **steps:** document logs/latency/error budget/oncall → simulate unhealthy service → test fallback; **DoD:** no fake telemetry or undetected public outage; evidence = focused positive/negative tests + exact SHA; rollback where needed |
| - [ ] | **M27-18** — Separate preview acceptance from full-stack M27 gate | P0 | D2 | M27-12,M27-16 | **Owner:** governance; **paths:** TODO.md; release notes; **steps:** record CI_VERIFIED/BUILD_VERIFIED/DEPLOYMENT_READY/DEPLOYED_VERIFIED/RELEASE_ACCEPTED → human review; **DoD:** preview scope cannot certify unshipped Empire modules; evidence = focused positive/negative tests + exact SHA; rollback where needed |
| - [ ] | **M27-19** — Record post-deploy bilingual verification and exact release evidence | P0 | D3 | M27-14,M27-18 | **Owner:** release governance; **paths:** release notes; acceptance logs; **steps:** verify id/en live URLs → record deployment ID+SHA+rollback → secure final approval; **DoD:** no claim of success before access verified and human approval; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M27/M27-19.md) |


---


## M28 — ARSY Hub rename and compatibility migration

**Group:** G0 (Foundation) · **Priority:** P0 · **Prerequisites:** M00, historical M05-01–07 API baseline and M22-01; new M05 i18n/App Factory tasks are independent except where an actual shared-interface dependency is specified. · **Scope:** Single `apps/radio`→`apps/arsy` move, workspace/package identity, pnpm lock, Docker/Compose/DNS, SDK/env aliases, radio/channel fixtures, regression and rollback.

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
| - [ ] | **M28-08** — Audit every actual Radio/ARSY import and backend identity | P0 | D2 | M28-01 | **Owner:** ARSY; **paths:** apps/radio; package.json; pnpm-lock.yaml; **steps:** enumerate runtime/scripts/tests → classify Radio-domain exceptions → lock migration manifest; **DoD:** one canonical identity map, no missed workspace; evidence = focused positive/negative tests + exact SHA; rollback where needed |
| - [ ] | **M28-09** — Freeze Radio/Signal backward-compatible API fixtures | P0 | D2 | M28-01,M22-01 | **Owner:** ARSY/SIGNAL; **paths:** apps/radio/test; SDK fixtures; **steps:** pin station/player/WA/DENPA routes → capture envelope/port and seed → compare; **DoD:** regressions measurable before rename; evidence = focused positive/negative tests + exact SHA; rollback where needed |
| - [ ] | **M28-10** — Migrate runtime directory/import/package under single Hub | P0 | D4 | M28-02,M28-08 | **Owner:** ARSY; **paths:** apps/radio→apps/arsy; workspace package.json; TS refs; **steps:** move not clone → rename imports → compile backend; **DoD:** only one app registered, no duplicate schemas; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M28/M28-10.md) |
| - [ ] | **M28-11** — Migrate pnpm lock, scripts, images and internal DNS | P0 | D4 | M28-10 | **Owner:** ARSY/DevOps; **paths:** pnpm-lock.yaml; Dockerfile; docker-compose.yml; **steps:** regenerate lock via pnpm → update image/env names and aliases → run build/config smoke; **DoD:** old internal clients keep resolving during accepted window; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M28/M28-11.md) |
| - [ ] | **M28-12** — Implement fail-closed RADIO_*/ARSY_* precedence and aliases | P0 | D3 | M28-11 | **Owner:** ARSY config; **paths:** apps/arsy/src/config.ts; shared SDK config/tests; **steps:** inventory aliases → reject conflicting values → test legacy + preferred keys; **DoD:** one deterministic API destination with backward compatibility; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M28/M28-12.md) |
| - [ ] | **M28-13** — Run exact-SHA Hub/PG/Radio/Dock/HQ/SDK regression matrix | P0 | D4 | M28-12,M22-07 | **Owner:** ARSY QA; **paths:** apps/arsy/test; Docker tests; SDK fixtures; **steps:** run pnpm verify, PG CRUD/auth, Docker builds, channels and radio → record logs; **DoD:** pass/fail proven and safe rollback tested; no live site claims; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M28/M28-13.md) |
| - [ ] | **M28-14** — Revalidate all six app integration contracts after rename | P0 | D3 | M28-13 | **Owner:** platform integration; **paths:** apps/* config consumers; integration tests; **steps:** probe Dock/HQ/Cockpit/AI/Sentinel → check API URLs and auth → compare fixtures; **DoD:** no stray Hub or second backend, existing apps still run; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M28/M28-14.md) |
| - [ ] | **M28-15** — Close rename documentation only after deployment compatibility proof | P0 | D2 | M28-14,M28-07 | **Owner:** architecture/release; **paths:** ADR-0001; README.md; deployment notes; **steps:** record source SHA → update old/new path and DNS evidence → mark migration; **DoD:** ADR implementation status changes only after actual rename verification; evidence = focused positive/negative tests + exact SHA; rollback where needed |

**Operator instruction:** do not implement ARSY as a second Fastify service or create a new repository; migrate the existing one with compatible aliases. The older term ARSY Research Compute is retained as a **future optional capability in this same Hub**, not a separate running agent and not a claim of theological authority. **M28 is planned early after compatibility baselines; its rename must be tested before any release claiming the renamed ARSY identity. Existing addon work predates physical rename and must be preserved.**

## M29 — AI execution and planning integrity

**Group:** G7 · **Prerequisite:** M02-06 · **Status:** PLANNED, no implementation implied. **Outcome:** AI execution and planning integrity. **Gate:** all leaves pass relevant decision, rights/privacy, i18n, security, regression, operational-cost and human-adoption checks. **Rollback:** document tested recovery before any risky change. This is a distinct milestone; future apps/finance/energy remain proposal-gated.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M29-01** — Classify every task's leaf or umbrella role | P1 | D2 | M02-06 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M29/M29-01.md) |
| - [ ] | **M29-02** — Ratify one multi-agent task lease contract | P1 | D2 | M29-01 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M29/M29-02.md) |
| - [ ] | **M29-03** — Specify ID/dependency/Markdown-link validator | P1 | D3 | M29-02 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M29/M29-03.md) |
| - [ ] | **M29-04** — Prove validator on invalid fixtures | P1 | D3 | M29-03 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M29/M29-04.md) |
| - [ ] | **M29-05** — Verify one low-context agent handoff | P1 | D4 | M29-04 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M29/M29-05.md) |

---

## M30 — Master Design and shared MoonUI behaviors

**Group:** G7 · **Prerequisite:** M19-01 · **Status:** PLANNED, no implementation implied. **Outcome:** Master Design and shared MoonUI behaviors. **Gate:** all leaves pass relevant decision, rights/privacy, i18n, security, regression, operational-cost and human-adoption checks. **Rollback:** document tested recovery before any risky change. This is a distinct milestone; future apps/finance/energy remain proposal-gated.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M30-01** — Inventory real MoonUI tokens and components | P1 | D2 | M19-01 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M30/M30-01.md) |
| - [ ] | **M30-02** — Specify semantic typography/color/spacing tokens | P1 | D2 | M30-01 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M30/M30-02.md) |
| - [ ] | **M30-03** — Specify forms tabs menus keyboard and error states | P1 | D3 | M30-02 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M30/M30-03.md) |
| - [ ] | **M30-04** — Specify bilingual skin/RTL/vector/media pipeline | P1 | D3 | M30-03 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M30/M30-04.md) |
| - [ ] | **M30-05** — Certify behavior and screenshot tests | P1 | D4 | M30-04 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M30/M30-05.md) |

---

## M31 — LIGHTHOUSE Empire public gateway

**Group:** G7 · **Prerequisite:** M19-10,M19-11 · **Status:** PLANNED, no implementation implied. **Outcome:** LIGHTHOUSE Empire public gateway. **Gate:** all leaves pass relevant decision, rights/privacy, i18n, security, regression, operational-cost and human-adoption checks. **Rollback:** document tested recovery before any risky change. This is a distinct milestone; future apps/finance/energy remain proposal-gated.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M31-01** — Decide brand hierarchy and public domain purpose | P1 | D2 | M19-10,M19-11 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M31/M31-01.md) |
| - [ ] | **M31-02** — Design gateway journeys and available/planned states | P1 | D2 | M31-01 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M31/M31-02.md) |
| - [ ] | **M31-03** — Decide reuse Dock vs extra frontend | P1 | D3 | M31-02 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M31/M31-03.md) |
| - [ ] | **M31-04** — Write accessible id/en gateway copy and metadata | P1 | D3 | M31-03 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M31/M31-04.md) |
| - [ ] | **M31-05** — Test correct links permissions and offline fallback | P1 | D4 | M31-04 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M31/M31-05.md) |

---

## M32 — HARBOR member and community privacy

**Group:** G7 · **Prerequisite:** M03-06 · **Status:** PLANNED, no implementation implied. **Outcome:** HARBOR member and community privacy. **Gate:** all leaves pass relevant decision, rights/privacy, i18n, security, regression, operational-cost and human-adoption checks. **Rollback:** document tested recovery before any risky change. This is a distinct milestone; future apps/finance/energy remain proposal-gated.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M32-01** — Validate first-member need and opt-in journey | P1 | D2 | M03-06 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M32/M32-01.md) |
| - [ ] | **M32-02** — Decide D14 ownership and D00 session reuse | P1 | D2 | M32-01 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M32/M32-02.md) |
| - [ ] | **M32-03** — Specify private library and consented contributions | P1 | D3 | M32-02 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M32/M32-03.md) |
| - [ ] | **M32-04** — Specify moderation reporting and appeals | P1 | D3 | M32-03 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M32/M32-04.md) |
| - [ ] | **M32-05** — Verify authorized privacy-first community MVP | P1 | D4 | M32-04 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M32/M32-05.md) |

---

## M33 — SHADOW creative authoring surface

**Group:** G7 · **Prerequisite:** M17-03 · **Status:** PLANNED, no implementation implied. **Outcome:** SHADOW creative authoring surface. **Gate:** all leaves pass relevant decision, rights/privacy, i18n, security, regression, operational-cost and human-adoption checks. **Rollback:** document tested recovery before any risky change. This is a distinct milestone; future apps/finance/energy remain proposal-gated.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M33-01** — Inventory existing generator and HQ Story plans | P1 | D2 | M17-03 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M33/M33-01.md) |
| - [ ] | **M33-02** — Decide HQ embedded versus separate SHADOW UI | P1 | D2 | M33-01 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M33/M33-02.md) |
| - [ ] | **M33-03** — Specify D07 scene version and media rights | P1 | D3 | M33-02 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M33/M33-03.md) |
| - [ ] | **M33-04** — Specify single renderer and HQ review handoff | P1 | D3 | M33-03 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M33/M33-04.md) |
| - [ ] | **M33-05** — Verify private poster access and attribution | P1 | D4 | M33-04 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M33/M33-05.md) |

---

## M34 — MOONLAB research workbench

**Group:** G7 · **Prerequisite:** M14-07 · **Status:** PLANNED, no implementation implied. **Outcome:** MOONLAB research workbench. **Gate:** all leaves pass relevant decision, rights/privacy, i18n, security, regression, operational-cost and human-adoption checks. **Rollback:** document tested recovery before any risky change. This is a distinct milestone; future apps/finance/energy remain proposal-gated.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M34-01** — Inventory D05 MIZAN and raw Research exposure | P1 | D2 | M14-07 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M34/M34-01.md) |
| - [ ] | **M34-02** — Decide standalone MoonLab or HQ desk | P1 | D2 | M34-01 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M34/M34-02.md) |
| - [ ] | **M34-03** — Specify source-linked case and hypothesis drafts | P1 | D3 | M34-02 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M34/M34-03.md) |
| - [ ] | **M34-04** — Specify D08 released research projection | P1 | D3 | M34-03 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M34/M34-04.md) |
| - [ ] | **M34-05** — Test reviewer separation and wrong-role access | P1 | D4 | M34-04 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M34/M34-05.md) |

---

## M35 — WORKS economic and financial operations pilot

**Group:** G7 · **Prerequisite:** M02-02 · **Status:** PLANNED, no implementation implied. **Outcome:** WORKS economic and financial operations pilot. **Gate:** all leaves pass relevant decision, rights/privacy, i18n, security, regression, operational-cost and human-adoption checks. **Rollback:** document tested recovery before any risky change. This is a distinct milestone; future apps/finance/energy remain proposal-gated.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M35-01** — Validate one real service and potential buyer | P1 | D2 | M02-02 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M35/M35-01.md) |
| - [ ] | **M35-02** — Decide merchant legal/payment and D15/D16 owners | P1 | D2 | M35-01 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M35/M35-02.md) |
| - [ ] | **M35-03** — Specify quote order delivery invoice and refund | P1 | D3 | M35-02 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M35/M35-03.md) |
| - [ ] | **M35-04** — Specify Treasury roles and payment idempotency | P1 | D3 | M35-03 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M35/M35-04.md) |
| - [ ] | **M35-05** — Verify sandbox-to-real evidence and unit economics | P1 | D4 | M35-04 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M35/M35-05.md) |

---

## M36 — HELIOGRID measured read-only energy pilot

**Group:** G7 · **Prerequisite:** M25-03 · **Status:** PLANNED, no implementation implied. **Outcome:** HELIOGRID measured read-only energy pilot. **Gate:** all leaves pass relevant decision, rights/privacy, i18n, security, regression, operational-cost and human-adoption checks. **Rollback:** document tested recovery before any risky change. This is a distinct milestone; future apps/finance/energy remain proposal-gated.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M36-01** — Identify approved physical meter site and technician | P3 | D2 | M25-03 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M36/M36-01.md) |
| - [ ] | **M36-02** — Specify calibration units and timestamp provenance | P3 | D2 | M36-01 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M36/M36-02.md) |
| - [ ] | **M36-03** — Decide D17 owner and read-only data boundary | P3 | D3 | M36-02 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M36/M36-03.md) |
| - [ ] | **M36-04** — Specify telemetry cost dashboard and failure states | P3 | D3 | M36-03 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M36/M36-04.md) |
| - [ ] | **M36-05** — Verify safety and post-pilot feasibility gate | P3 | D4 | M36-04 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M36/M36-05.md) |

---

## M37 — Cross-app identity and deployment boundaries

**Group:** G7 · **Prerequisite:** M03-03,M05-09 · **Status:** PLANNED, no implementation implied. **Outcome:** Cross-app identity and deployment boundaries. **Gate:** all leaves pass relevant decision, rights/privacy, i18n, security, regression, operational-cost and human-adoption checks. **Rollback:** document tested recovery before any risky change. This is a distinct milestone; future apps/finance/energy remain proposal-gated.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M37-01** — Classify six app deployment/security surfaces | P1 | D2 | M03-03,M05-09 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M37/M37-01.md) |
| - [ ] | **M37-02** — Specify SSO session and safe redirect boundary | P1 | D2 | M37-01 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M37/M37-02.md) |
| - [ ] | **M37-03** — Specify tenant/role capability access | P1 | D3 | M37-02 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M37/M37-03.md) |
| - [ ] | **M37-04** — Specify locale-preserving links and event owner | P1 | D3 | M37-03 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M37/M37-04.md) |
| - [ ] | **M37-05** — Test cross-app token expiry and role isolation | P1 | D4 | M37-04 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M37/M37-05.md) |
---

## Consistency controls for 38-milestone plan

**Priority order:** rename the **Hub application** to ARSY only after M28 compatibility gates; always protect the independent **Radio/SIGNAL feature**, permissions, sources, persistence, review and production restoration before adding unrelated surfaces. Although M22 appears under G4, run its P0 suite from the beginning. Stated milestone dependencies are conceptual gates: a task must also respect source rights and privacy even if its individual row does not restate them.

**Overlapping implementation is prohibited:** **ARSY = single Fastify/MoonQL Hub (currently code-named radio), not a second service**; one canonical TEXT owner for Reader and Explorer; one Figure Registry (Prophetic Table is a view); one Lexicon source for Terms; one Ontology for reviewed edges (Constellation is a derived graph); one Story model for SHADOW scenes and the public Story Universe; one user/IAM system for HQ/100CENTER; Radio continues using existing stations and schedule. No new backend merely for an Empire name.

**Narrative boundary:** fiction characters are not theological referents; the user's `ZILL` interpretation remains separate from Shadow-optics and historic `ZIIL`; 10 WINGS is not 10 AETHERION realms; GOD99 is not Asmaul Husna 99 or 99 Human States; 33 patch slots are reported/drafts/proposals/conflicts/in-chat status, not divine approvals. The full 99 chapter V10 is an index of editorial coverage, **not authenticated originals**.

**Next release slices:** a *bilingual public landing preview* may launch with Dock-only or a validated secure Hub, provided no unreviewed data is public; the *full XV feature release* still requires physical ARSY compatibility, source/citation + reviewed evidence, Radio regression, rights, restore and independent human governance. World Monitor, Cosmos, HELIOGRID, 25 Amanah, AETHERION and optional AI do not block that first slice and cannot be marketed as live implementations.

**Progress evidence to capture when work begins:** `task-id`, `source-SHA`, `files`, `tests and logs`, `source/rights` where applicable, `reviewer/decision`, `blocked/risks`, `new-SHA`, `date/timezone`. A future agent must not tick unchecked boxes simply because similar files or issues exist in XII/XIV/Corpus.

**Target register:** 38 milestones (29 preserved M00–M28 plus M29–M37), 266 preserved task IDs plus 45 newly scoped leaf IDs = **311 unique tasks**. Prior checkmarks keep scoped historical evidence. This file is the **only** active task register, not a GitHub-issue count, implementation claim or promise of elapsed time.

**End of XV Master TODO — modular planning v2, 26 October 2026.**
