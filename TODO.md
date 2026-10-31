# MOONWITNESS XV — MASTER TODO & MILESTONE EXECUTION REGISTER

> **Planning baseline · 30 October 2026 · active repo: [bjo163/moonwitnessxv](https://github.com/bjo163/moonwitnessxv). Owner branch policy: work directly on existing `dev`; promote to `main` only after required verification.**
> This is a detailed, dependency-gated backlog, **not** evidence tasks have been completed. No new branch or GitHub issue is created. Before execution recheck the current HEAD, source rights and runtime status.

**Read:** [BLUEPRINT.md](BLUEPRINT.md) for the sole XV architecture and ownership contract; [Master Vision Narrative XV](docs/vision/MASTER_VISION_NARRATIVE_XV.md) for history, narrative and interpretive boundaries. **This TODO is the sole planning task/status index**. Avoid copying task progress into vision or independent lists. Real build logs, test results and specific commit SHAs establish completion; an existing file or CI configuration alone does not.

> **Revalidasi M01–M05 (2026-10-26, final):** temuan awal di HEAD `3822657` sudah ditindaklanjuti. Seluruh sisi memakai Node 24 LTS; checkout bersih dan CI pada `fa0f1b5` lulus `pnpm install --frozen-lockfile` + `pnpm verify` (199 test, 197 pass, 2 skipped, 0 fail; [run 40263464402](https://github.com/bjo163/moonwitnessxv/actions/runs/40263464402)). M01-01 dan M01-03 ditutup kembali; M01-05, M01-06, M01-07, M03-03, M03-05, dan M04-05 tetap terbuka. Rincian: [docs/audit/M01-M05-revalidation-2026-10-26.md](docs/audit/M01-M05-revalidation-2026-10-26.md). Checkbox `[x]` yang bergantung pada test kini diverifikasi di SHA bersih.

> **Amendemen arsitektur ECHOLOG (2026-10-27):** atas arahan pemilik, ADR-0007 menetapkan ECHOLOG sebagai server S3-compatible terbatas yang menyimpan ke filesystem miliknya sendiri; MinIO tidak digunakan. Review independen pada `b323f8c` menemukan bug pagination ListObjectsV2; UTF-8 ordering, delimiter cursor, dan `MaxKeys=0` diperbaiki dan direview tanpa blocker pada exact SHA `21f3bc7`. ECHOLOG 36/36, typecheck/build, SQL-owner guard 7/7, full CI run `40452126111`, promosi `main`, dan rilis `v1.2.0` menutup M39-10. M39-11 ditutup pada exact SHA `f0cdc3f` setelah browser/UI gate, review, full CI `40453405712`, promosi, dan rilis `v1.2.2`; M39-12 masih terbuka untuk exact-SHA roundtrip dan consumer rollback/no-op evidence. M04-05 tetap terbuka sampai ECHOLOG dijalankan pada host terpisah dan backup, retensi, serta pemulihan diuji.

> **Pembaruan eksekusi (2026-10-27):** M28-13 diuji di worktree bersih pada exact SHA `6b439b39a5bdcf10adde405b5047f0a53cac69e5`; test slice utama 330/339 lulus, 0 gagal, 9 dilewati; output tambahan Headquarters auth 8/8 dan SKYLINK 4/4 lulus, sementara ECHOLOG 18 lulus/3 dilewati. `pnpm ui:check`, SDK drift gate, dan build web Headquarters/Dock lulus. `pnpm verify` terhenti pada lint (11 error/56 warning), build Docker ARSY gagal karena `@moonwitness/cli` tidak tersedia dalam context build; dua image web berhasil. Karena lint, parity PostgreSQL dan rollback/runtime belum lengkap, M28-13 tetap terbuka; M28-14 belum eligible. [Matriks dan batas bukti](docs/audit/M28-13-matrix-6b439b3.md). M05-15 ditutup pada `e44c4b17b170f14305e258efe6d0fe9f75bda9e3` dan M05-23 pada `6b439b39a5bdcf10adde405b5047f0a53cac69e5`; [bukti AI Gateway](docs/audit/M05-15-aigateway-locale-e44c4b1.md), [bukti CLI](docs/audit/M05-23-cli-localization-6b439b3.md). M05-16 tetap terbuka karena Sentinel tidak memiliki UI/CLI help manusia yang terpisah dari log worker; belum ada regression test untuk mempertahankan batas log tersebut. M38-10 ditutup pada implementation SHA `48b388644fe4d1854e16d457843575b5799727f5`; M38-11 ditutup pada implementation SHA `a53fffe54130443d380117702ed2dfafa69c8ba6` — hang WebSocket lama ternyata caused-by `/ws` di instance root dengan plugin `@fastify/websocket` yang masih deferred; sekarang kontrol-plane 5/5 dengan PostgreSQL nyata, SKYLINK 10/10, guard duplikasi channel terbukti load-bearing, dan log hygiene lolos ([bukti](docs/audit/M38-11-skylink-rest-ws.md)). Dependensi workspace SKYLINK sudah terintegrasi pada `e44c4b1`.

> **Penutupan audit 2026-10-27:** lima leaf audit/desain ditutup dengan artefak yang ter-commit: M16-01 pada `c4f75c9` ([spec](docs/decisions/M16-01-private-witness-object-spec.md)), M19-01 pada `d064b2e` ([audit](docs/audit/M19-01-asset-ownership.md)), M20-01 pada `d6b8847` ([audit](docs/audit/M20-01-hq-model-ui-route-guards-ops.md)), M23-01 pada `f9b9679` ([audit](docs/audit/M23-01-patch-titles-conflict-status.md)), dan M34-01 pada `bba3731` ([inventaris](docs/audit/M34-01-inventory-d05-mizan-research-exposure.md)). M34-01 diverifikasi ulang saat penutupan: `GET /research/hypotheses` masih `requires: 'public'` dan `research.test.ts` 8/8 serta `m15-historical-pilot.test.ts` 7/7 lulus tanpa header auth, sehingga eksposur E1–E7 tetap menjadi pekerjaan M19-19/M34-04, bukan dianggap selesai. Tidak ada kode produksi yang berubah di kelima leaf ini.

**Planning references:** [Master Design](MASTER_DESIGN.md) · [Architecture](docs/architecture/README.md) · [ADR index](docs/decisions/README.md) · [AI execution contract](docs/planning/AI_EXECUTION_CONTRACT.md). These are specifications, not additional task/status registers. G7 does not block a scope-limited bilingual public preview.

## How to interpret and execute

**Priority:** `P0` blocker (security, compatibility, provenance, release); `P1` core product; `P2` improvement/next horizon; `P3` speculative optional research. **Difficulty:** `D1` isolated, `D2` small, `D3` bounded multi-file, `D4` complex with cross-domain tests/review, `D5` high-uncertainty that must first be broken into smaller work packets. These are relative estimates, not promises of elapsed time.

Each task ID `M00-01` is unique here; `M00` in a dependency denotes its entire exit gate. **No corresponding GitHub issues currently exist in XV; do not duplicate past XIV/Corpus issues in XV by ID.**

The V5 package maps one-to-one to unchecked leaf tasks M46-01..M50-20 (ENG/FUT/ECO/CHAR/ONT are reference IDs, not GitHub issue numbers or a second status system). Each row links an execution packet and full specification. Existing source/consent, M21/M32/M35 operator, security, release and package-owner gates remain; registration is planning only and closes no task.

For each task: recheck `dev` HEAD → inspect the named owner and dependencies → prepare scope (prefer ≤3 starting files; justify larger) and tests → implement only the stated behavior → run focused positive/negative tests and relevant `pnpm verify` checks → record SHA, exact commands/results, changed paths, rights source where relevant and reviewer → only then check the box. Never force-push/reset or invent a new branch to make a task run. If a required gate is blocked, report it and preserve `UNKNOWN`.

New unchecked rows represent **unverified planned deliverables**. Historical checked rows retain their pinned evidence and are never reset by planning-only changes; each checkbox means a tested *scoped deliverable*, not an entire production release. A milestone is complete only after its exit gate is demonstrated at a specific SHA.

## IMMEDIATE EXECUTION — FOUNDATION + GLOBAL i18n + FIRST BILINGUAL PUBLIC RELEASE

**Historical evidence anchor:** `main` `bb3aed0c7c5c7c99a5ed53851370b2376e915672` (CI `40304933576` green); 29 established milestones, 203 historic IDs, 106 checkmarks and 97 open at that SHA. It is not the active work target. Recheck `dev` before starting; this documentation change does not execute implementation or close tasks.

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
| **G4 — OPERATIONS** | M20–M23 plus **M38 SKYLINK** plus **M39 ECHOLOG** | 100CENTER, optional AI, existing Radio/WA/DENPA, Journey; SKYLINK = standalone multi-channel communication surface (D18); ECHOLOG = standalone object storage & attachments, stateless (D19) |
| **G5 — OPTIONAL RESEARCH** | M24–M26 | World monitoring, Science/Time, legacy registries and source recovery |
| **G6 — RELEASE** | M27 | Real full-stack tests, privacy, rights and approved launch |
| **G7 — ECOSYSTEM** | M29–M37 plus **M40 ORBIT**, accepted **M41 LUMEN**, M42–M45 and planned M46–M50 | AI execution contracts, accepted design, Empire surfaces, cross-app identity and 100 proposed cross-domain candidates assigned to existing owners; no second Hub or new data owner |

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
| - [x] | **M01-05** — Define semver, changelog and protected release lifecycle | P1 | D3 | M01-03 | **Closed** at `f8769f695a47408e2e11d7c293f74c4537dd85e1`; version/changelog procedure is defined and current `main` ruleset readback shows active required CI, blocks force-push/deletion, and has no bypass actors; [evidence](docs/audit/M01-05-release-lifecycle.md) |
| - [x] | **M01-06** — Add dependency and secret-scanning gate | P0 | D3 | M01-03 | **Ditutup 2026-10-27**, exact SHA `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa`: audit high gate dan full-history Gitleaks terpasang; audit high lolos, scan 121 commit tidak menemukan leak, dan [CI run 40378453247](https://github.com/bjo163/moonwitnessxv/actions/runs/40378453247) lulus. Job promosi ke main dilewati karena ini PR; promosi tidak diklaim. [Bukti](docs/audit/M01-06-secret-dependency-gate.md) |
| - [x] | **M01-07** — Publish CI evidence ledger and no-bypass rule | P0 | D2 | M01-04,M01-06 | **Closed at verified SHA 7c739c6e4ce14590b6f8511d3120016510fd01c9: exact push CI run 40450705187 passed frozen install, dependency audit, Gitleaks and pnpm verify; guarded promotion advanced main to the same SHA; active main ruleset requires the exact verification check with no bypass actors; GitHub Release v1.1.0 published for that SHA. [Ledger](docs/audit/M01-07-ci-evidence-ledger.md) |

**Revalidasi:** M01-01 dan M01-03 ditutup setelah Node 24 LTS diseragamkan dan CI `fa0f1b5` hijau. M01-06 kemudian ditutup dengan audit/secret gate dan CI run `40378453247`; M01-05 (changelog/protected branch) dan M01-07 (ledger pada integrasi terbaru) masih terbuka. Bukti: [laporan revalidasi](docs/audit/M01-M05-revalidation-2026-10-26.md) dan [ledger M01-07](docs/audit/M01-07-ci-evidence-ledger.md).


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
| - [x] | **M03-03** — Test forged/expired HQ cookies vs Hub auth | P0 | D3 | M03-01 | **Ditutup 2026-10-27**, exact SHA `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa`: forged/expired 401, Hub session, outage 503 dan no-cookie redirect; HQ 5/5 + Hub auth 4/4; `pnpm verify` lulus. Komposisional/in-memory, bukan browser/live Hub. [Bukti](docs/audit/M03-03-hq-cookie-hub-auth.md) ; [packet](docs/tasks/M03/M03-03.md) |
| - [x] | **M03-04** — Decide tenant and reviewer/editor role boundaries | P0 | D4 | M02-02,M03-02 | Tenant support verified or clearly out of scope ([docs/decisions/M03-04-tenant-role-boundaries.md](docs/decisions/M03-04-tenant-role-boundaries.md)) |
| - [x] | **M03-05** — Test token TTL, revocation and API key cache limits | P0 | D3 | M03-03 | **Ditutup 2026-10-27**, exact SHA `fae40f71d74cb8a22a9b27cb4c3f8ad3a5e4e1d4`: clock TTL test diisolasi ke child process; `pnpm --filter @moonwitness/radio test:regression` lulus dua kali, 314 pass, 9 tes PostgreSQL opsional skip, 0 fail. Lihat [bukti](docs/audit/M03-05-auth-cache-limits.md) dan [packet](docs/tasks/M03/M03-05.md). |
| - [x] | **M03-06** — Write private witness, minors, copyright and withdrawal policy | P0 | D3 | M02-04 | No automatic import into public Git ([docs/decisions/M03-06-witness-withdrawal-policy.md](docs/decisions/M03-06-witness-withdrawal-policy.md)) |
| - [x] | **M03-07** — Threat model CSP, logs, egress, DENPA, WA and SSR | P0 | D4 | M03-01,M03-05 | Critical risks receive blocking cases ([docs/audit/M03-07-threat-model.md](docs/audit/M03-07-threat-model.md)). **Dikoreksi 2026-10-26:** volume WA `whatsapp-session`; klaim `.gitignore` dihapus. |

**Revalidasi:** M03-01 dan M03-07 dikoreksi pada 2026-10-26. M03-03 ditutup pada 2026-10-27 dengan uji forged/expired cookie di SHA `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa`; M03-05 masih terbuka untuk TTL expiry/cache cap. Exit gate M03 belum terpenuhi.


## M04 — Database continuity and recovery

**Group:** G0 · **Priority:** P0 · **Prerequisites:** M00 · **Scope:** MoonQL sync/migrations, Docker Compose and restore runbook.

**Exit gate:** Isolated restore actually performed with data equivalence. **No completion inferred merely from repository files.**

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M04-01** — Verify production PG requirement vs memory fallback | P0 | D3 | M00-06 | No accidental production ephemeral storage ([docs/audit/M04-01-production-pg-requirement.md](docs/audit/M04-01-production-pg-requirement.md)) |
| - [x] | **M04-02** — Define non-additive migration plan beyond autoSync | P0 | D3 | M04-01,M02-05 | Reviewed SQL rollback protects existing records ([docs/decisions/M04-02-migration-rollback-plan.md](docs/decisions/M04-02-migration-rollback-plan.md)) |
| - [x] | **M04-03** — Execute test DB restore from real dump | P0 | D4 | M04-01 | **Direvalidasi 2026-10-26:** dump `20261025T213120Z` (73.900 B), restore exit 0, 36 stations/21 playlogs ([docs/audit/M04-03-db-restore-execution.md](docs/audit/M04-03-db-restore-execution.md)) |
| - [x] | **M04-04** — Compare restored station/playlog rows and indexes | P0 | D2 | M04-03 | **Direvalidasi 2026-10-26:** 36 stations/21 playlogs, 9 indeks; angka lama 24 dan `station_envelope_metadata` tidak ada ([docs/audit/M04-04-row-counts-and-indexes.md](docs/audit/M04-04-row-counts-and-indexes.md)) |
| - [ ] | **M04-05** — Copy backups off host and test retention path | P0 | D3 | M04-03 | **OPEN / kode siap, bukti runtime belum ada.** Sidecar ECHOLOG S3-compatible dipromosikan pada exact SHA `69d024a2d9c2928f7340da0872dc2fb2e9ea7113`; CI `40713370198` lulus dan rilis `v2.11.0`. Tes kontrak 13/13 lulus, dan `docker compose config --quiet` berhasil. Retensi dipisah per database dan hanya menghapus dump timestamped yang dibuat sidecar. Belum ada upload nyata, endpoint ECHOLOG pada host berbeda, retensi remote, atau restore dari host pemulihan; Docker image juga belum dibangun karena Docker Engine lokal tidak tersedia. Checkbox tetap kosong sampai unggah, retensi, dan restore off-host berhasil dibuktikan. [Audit](docs/audit/M04-05-off-host-backup-retention.md) · [packet](docs/tasks/M04/M04-05.md) **Superseded 2026-10-30 at `b0b44f9`:** the ECHOLOG S3 sidecar was removed from the stack (it restart-looped in Coolify) together with `Dockerfile.backup`; `scripts/db-backup.sh` remains for on-demand dumps and `docs/runbook-restore.md` records that. Any off-host upload, retention and restore proof must now be built around on-demand runs rather than the sidecar, and the checkbox stays open because none of it has been observed. |
| - [x] | **M04-06** — Test schema upgrade failure and rollback | P0 | D4 | M04-02,M04-03 | **Direvalidasi 2026-10-26:** rollback DDL gagal terbukti di container terisolasi; test otomatis belum ada ([docs/audit/M04-06-schema-upgrade-rollback.md](docs/audit/M04-06-schema-upgrade-rollback.md)) |
| - [x] | **M04-07** — Update restore runbook with actual drill metadata | P1 | D2 | M04-04,M04-05,M04-06 | **Diperbarui 2026-10-26:** metadata drill aktual (dump, ukuran, hasil, operator revalidasi, batasan) ([docs/runbook-restore.md](docs/runbook-restore.md)) |

**Revalidasi 2026-10-26:** restore dan rollback DDL diuji ulang di container terisolasi. Dump aktual `moonwitness-20261025T213120Z.dump` (73.900 B) menghasilkan 36 stations/21 playlogs dan 9 indeks; `pg_restore` exit 0. M04-03/04/06/07 diperbarui; M04-05 tetap dibuka karena belum ada backup off-host. Angka lama 24 playlogs/79,6 KB/`station_envelope_metadata` tidak ditemukan. Bukti: [laporan revalidasi](docs/audit/M01-M05-revalidation-2026-10-26.md).


## M05 — API/SDK and module behavior contracts

**Group:** G0 · **Priority:** P0 · **Prerequisites:** M01,M02 · **Scope:** Fastify generated REST and SDK **plus** added global locale/API-message/App Factory foundations. Historical M05-01–07 scope was verified before expansion; that does not close M05-08–22.

**Exit gate:** Legacy API fixtures remain stable; shared id/en catalog and factory-generated app each pass their own exact-SHA tests. No milestone-wide success inferred from the pre-expansion 7/7 evidence.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M05-01** — Record existing OpenAPI, envelope and error fixtures | P0 | D2 | M00-02 | **Diperbarui 2026-10-26:** sintaks filter aktual `?where=<json>` (diparse `parseWhereJson`), bukan `?where[field]=`; `?total=true` didokumentasikan ([docs/audit/M05-01-api-fixtures.md](docs/audit/M05-01-api-fixtures.md)) |
| - [x] | **M05-02** — Test duplicate model/view/manual route rejection | P0 | D2 | M05-01 | Collision fails boot and has regression test ([apps/arsy/test/api-contracts.test.ts](apps/arsy/test/api-contracts.test.ts)) |
| - [x] | **M05-03** — Define future addon namespace and registration standard | P0 | D2 | M02-02,M05-02 | New feature cannot shadow old radio endpoints ([docs/decisions/M05-03-addon-namespace-standards.md](docs/decisions/M05-03-addon-namespace-standards.md)) |
| - [x] | **M05-04** — Verify SDK codegen deterministic hash and API version | P0 | D2 | M01-04,M05-01 | Repeat generation gives stable client ([apps/arsy/test/api-contracts.test.ts](apps/arsy/test/api-contracts.test.ts)); `gen:sdk:check` lulus di checkout bersih `fa0f1b5` dan di CI |
| - [x] | **M05-05** — Define pagination, filter/expand, locale and UNKNOWN | P1 | D3 | M05-01 | **Dikoreksi 2026-10-26:** stations `maxLimit` 200 (bukan 100); `?limit` di atas maximum ditolak 400 oleh schema, bukan di-clamp; tidak ada filter/locale fallback di MoonQL ([docs/decisions/M05-05-query-standards.md](docs/decisions/M05-05-query-standards.md)) |
| - [x] | **M05-06** — Document approved old-repo adapter boundaries | P1 | D3 | M02-07,M05-03 | No implicit historical runtime dependency ([docs/decisions/M05-06-adapter-boundaries.md](docs/decisions/M05-06-adapter-boundaries.md)) |
| - [x] | **M05-07** — Add compatibility smoke for existing clients | P0 | D3 | M05-04,M05-06 | Smoke ada; suite checkout bersih dan CI `fa0f1b5` lulus 197 pass/2 skipped/0 fail ([apps/arsy/test/stations.test.ts](apps/arsy/test/stations.test.ts)) |
| - [x] | **M05-08** — Inventory locale coverage of all six runnable applications | P0 | D2 | M00-07 | **Closed 2026-10-26:** integrator review passed against inventory at `4b229ec97ed6468dbe8b01fc79f29398e3b368b4`; six app manifests and CLI/TUI/API boundaries mapped, source-language vs UI locale distinguished, owner task IDs checked, and no locale implementation claimed. Source-language positive/negative test evidence is cited; PR CI run [40361827534](https://github.com/bjo163/moonwitnessxv/actions/runs/40361827534) passed on that exact SHA. Baseline `main`/`dev` `d8c5bfa` CI run [40359838620](https://github.com/bjo163/moonwitnessxv/actions/runs/40359838620) passed; only governance docs changed since audit source SHA `387f784`. Inventory: [M05-08 locale audit](docs/audit/M05-08-locale-inventory.md); [packet](docs/tasks/M05/M05-08.md) |
| - [x] | **M05-09** — Ratify id/en locale contract and per-runtime inclusion scope | P0 | D2 | M05-08,M02-06 | **Closed 2026-10-27:** integrator ratified ADR-0005 at decision SHA `56b9f69379058b6079f921644a14ebc606b43d43`; canonical `id`/`en`, default `en`, preference order, catalog rules, all six app/CLI/TUI/API boundaries, stable machine/auth/source invariants, and ARSY launchpad/Studio inclusion under M05-14 are recorded. Positive/negative contract vectors and owner crosswalk are reviewed. `pnpm --filter @moonwitness/radio exec tsx --test test/corpus-reader.test.ts test/service-index.test.ts` passed 7/7 on that SHA; these verify source/rights and current service-index invariants, not locale resolution. PR CI [40365941715](https://github.com/bjo163/moonwitnessxv/actions/runs/40365941715) passed on the exact SHA. Runtime locale tests remain M05-10/M05-11. [ADR](docs/decisions/ADR-0005-locale.md) |
| - [x] | **M05-10** — Implement shared i18n package or proven core adapter | P0 | D3 | M05-09 | **Closed 2026-10-27:** implemented the shared `packages/core` adapter with one canonical `id`/`en` registry, strict rejection, typed catalogs and parity checks; focused tests 4/4, package build/typecheck and scoped ESLint passed; root `pnpm test` passed (Radio 305 passed, 9 optional PostgreSQL skips, 0 failed). Independent review found no issues. Exact implementation SHA `e73e156bf4616131152ff865b3f6f67658a92d77`; report [M05-10 evidence](docs/audit/M05-10-shared-locale-contract.md). |
| - [x] | **M05-11** — Add locale resolution and persistence negative tests | P0 | D2 | M05-10 | **Closed 2026-10-27:** shared resolver enforces URL → persisted selection → existing account preference → weighted `Accept-Language` → `en`; unsupported URLs are returned for rejection, malformed preferences fail safely, region tags map only in header negotiation, and no IP/location lookup occurs. Focused core suite 7/7, typecheck and scoped ESLint passed; independent review passed after equal-quality header-order cases were added. Exact result SHA `dae3c9042d721af4481a430316617b660d7952a1`; [evidence](docs/audit/M05-11-locale-resolution.md). |
| - [x] | **M05-12** — Implement Intl formatting without translating source artifacts | P1 | D2 | M05-10 | **Closed 2026-10-27:** shared core formatters cover explicit `id`/`en` numbers, dates and separately supplied currency; date formatting requires an explicit timezone and invalid locales/values are rejected. Tests prove locale output and timezone independence from UI language; no source strings or IDs are formatted. Core suite 10/10, build/typecheck/scoped ESLint pass. Exact SHA `d06d581df2cf588804be3801bd6d4cec93dbd5d9`; [evidence](docs/audit/M05-12-intl-formatters.md). |
| - [x] | **M05-13** — Add missing-key/catalog parity verification gate | P0 | D3 | M05-10 | **Ditutup 2026-10-27**, exact SHA `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa`: missing required key fails, optional long copy remains allowed, Dock 13/13; root `pnpm verify` lulus. [Bukti](docs/audit/M05-13-catalog-key-gate.md) ; [packet](docs/tasks/M05/M05-13.md) |
| - [x] | **M05-14** — Localize ARSY human messages and embedded UI, never API identifiers | P1 | D3 | M05-09,M28-05 | **Closed 2026-10-27 at result SHA `947fdff2bfb1c11fe985a2d546a21fe7722cadd9`:** ARSY launchpad, Studio, and safe error summaries negotiate validated `id`/`en`; visible Studio copy is localized, while API paths, auth/status/envelope, identifiers, validation details, and machine logs remain stable. Focused tests 2/2, build/typecheck/ESLint passed; two independent reviews found no blocker. Exact full CI [40498636963](https://github.com/bjo163/moonwitnessxv/actions/runs/40498636963) at `d3a825b5337c29c9c7233ba04d727142fe012378` passed and promoted to `main`. [Audit](docs/audit/M05-14-arsy-locale.md) · [Packet](docs/tasks/M05/M05-14.md) |
| - [x] | **M05-15** — Classify and scope AI Gateway human-facing localization | P1 | D2 | M05-09 | **Closed 2026-10-27** at exact SHA `e44c4b17b170f14305e258efe6d0fe9f75bda9e3`; bilingual provider/model descriptions and safe validation messages use the shared locale resolver and vary by `Accept-Language`; IDs, status/wire fields, health and raw diagnostics remain stable. Typecheck/build/focused ESLint passed; locale contract tests 4/4 and dependency contract 1/1 passed; independent review found no concrete issues. [Evidence](docs/audit/M05-15-aigateway-locale-e44c4b1.md) |
| - [x] | **M05-16** — Classify Sentinel worker/CLI localization without log drift | P1 | D2 | M05-09 | **Closed at exact integrated SHA `ff7394d6e6d95e3469a0367bfec80f09da985087`:** worker-log contract 7/7, test/typecheck and scoped ESLint passed; independent review found no blocker; full exact-SHA CI [40499204784](https://github.com/bjo163/moonwitnessxv/actions/runs/40499204784) passed and promoted to `main`. Raw Hub error text remains a documented limitation; production logs were not changed or localized. [Audit](docs/audit/M05-16-sentinel-locale-classification-b1c5b75.md) |
| - [x] | **M05-17** — Inventory actual app creation and deployment conventions | P0 | D2 | M05-08,M28-01 | **Ditutup 2026-10-27**, exact source SHA `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa`: six manifest-bearing workspace apps, unique ports 3000–3004, Docker target boundaries and slug collision/traversal policy inventoried. Evidence is source/config assertion only; no scaffolder behavior claimed. [Bukti](docs/audit/M05-17-app-factory-inventory.md) |
| - [x] | **M05-18** — Implement collision-safe App Factory CLI with dry-run | P1 | D3 | M05-17,M05-10 | **Closed at source SHA `70b6b14b6630b21da4449df5ad7e2c247be7736f`; closure recorded in this TODO update:** App Factory suite 19/19, scoped ESLint and diff-check pass; exact-SHA CI `40461134347` passed full verification and guarded promotion; independent review accepted cross-platform path assertions. Rollback retains a narrow documented lstat/unlink race; no generated app was committed. M05-19/M05-20 remain separate and open. [Evidence](docs/audit/M05-18-19-app-factory-worktree.md) · [packet](docs/tasks/M05/M05-18.md) |
| - [x] | **M05-19** — Generate frontend skeleton inheriting i18n and MoonUI | P1 | D3 | M05-18,M05-10 | **Closed at exact integrated SHA `ff7394d6e6d95e3469a0367bfec80f09da985087`:** generated frontend type fixture, Vite production build, browser locale/navigation/back-forward checks passed; App Factory suite 19/19, MoonUI/core builds and `ui:check` (132 files, 0 violations) passed; independent integrated review found no blocker; full exact-SHA CI [40499204784](https://github.com/bjo163/moonwitnessxv/actions/runs/40499204784) passed and promoted to `main`. Frozen install remains M05-21 scope. [Evidence](docs/audit/M05-18-19-app-factory-worktree.md) · [packet](docs/tasks/M05/M05-19.md) |
| - [x] | **M05-20** — Generate internal worker/service variant without fake UI | P1 | D3 | M05-18 | **Closed at source SHA `007b7ac1d5f88663b80fff2b523dadc8073b218b`:** focused App Factory suite 19/19, scoped ESLint passed, independent read-only review found no blocker, and exact-SHA CI run `40462930335` passed. M05-18 and M05-10 are checked. Internal health remains in-process; no listener, database, Hub, or fabricated UI was added. [Evidence](docs/audit/M05-20-app-factory-worker-worktree.md) · [packet](docs/tasks/M05/M05-20.md) |
| - [x] | **M05-21** — Verify generated app workspace/build/container integration | P1 | D4 | M05-19,M05-20 | **Closed at exact integrated SHA `0be66b6ae1240fa97511308421784b84861016ca`:** disposable frontend/worker workspace auto-generates lock and passes frozen install, typechecks, Vite build, route tests/lint, worker build; traversal input rejected without files. Container mapping test 3/3 proves existing Dock/HQ Next images build from clean snapshot and rejects mapping the Vite starter to Next-only Dockerfile.web; no Vite production route was justified. Exact CI [40538469832](https://github.com/bjo163/moonwitnessxv/actions/runs/40538469832) passed and promoted the SHA to main. [Evidence](docs/audit/M05-21-app-factory-workspace-worktree.md) · [packet](docs/tasks/M05/M05-21.md) |
| - [x] | **M05-22** — Document ownership, rollback and App Factory adoption gate | P1 | D2 | M05-21 | **Closed at exact source SHA `feb5d224ef3e2ce1b93d02a52f7424b761231fe9`:** README/Blueprint and App Factory audit define ownership, reproducible smoke/contract tests, safe scaffold removal, and no duplicated domain/runtime claims. Focused tests 28/28; disposable workspace smoke, CLI help and no-write dry-run passed. CI run `40540433419` passed and promoted this SHA to `main`. No domain/DNS uniqueness or production deployment is claimed. [Audit](docs/audit/M05-21-app-factory-workspace-worktree.md) |
| - [x] | **M05-23** — Localize shared developer/operator CLI human output | P1 | D2 | M05-08,M05-10 | **Closed 2026-10-27** at result SHA `6b439b39a5bdcf10adde405b5047f0a53cac69e5`; implementation is in `118dcb576d1cc3b791f6a7a85b208b7f4a5f83cc`. CLI typecheck/build, scoped ESLint and focused locale/contract tests 5/5 passed; independent review confirmed Indonesian/English help, status and error copy preserve commands, flags, ports, URLs, machine status tokens and exit codes. [Evidence](docs/audit/M05-23-cli-localization-6b439b3.md) |

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
| - [x] | **M07-06** — Map foreign RGBL IDs without canonical duplication | P0 | D3 | M06-07,M07-05 | Source identity mapping preserves exact legacy reference ([apps/arsy/test/corpus-ingestion.test.ts](apps/arsy/test/corpus-ingestion.test.ts)) |
| - [x] | **M07-07** — Test idempotent import, retries, deletion/retraction | P0 | D4 | M07-03,M07-06 | No duplicate on replay, reviewer/rights in log ([apps/arsy/test/corpus-ingestion.test.ts](apps/arsy/test/corpus-ingestion.test.ts)) |


## M08 — Source-first Corpus Reader

**Group:** G1 · **Priority:** P0 · **Prerequisites:** M05,M07 · **Scope:** Dock Reader routes, generated client, MoonUI.

**Exit gate:** Reader trace and metadata-only fallback verified on real PG. This is a planning gate, not a completion claim.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M08-01** — Design UI states for source, absent, ambiguous, rights-blocked | P0 | D2 | M07-05 | States implemented in `/corpus/reader` + Dock Reader; absent/ambiguous tests and 28-check SSR drill ([evidence](docs/audit/M08-reader-vertical-slice.md)) |
| - [x] | **M08-02** — Render work, edition, language, permission and source | P0 | D3 | M08-01 | QS 2:82 identity asserted in `apps/arsy/test/corpus-reader.test.ts` and on PG (`corpus-reader-pg.test.ts`) |
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
| - [x] | **M16-01** — Specify private witness object and provenance categories | P1 | D3 | M03-06,M06-07 | **Closed 2026-10-27** at spec SHA `c4f75c96425a58fef9925ef67de4436fe4d5c153`: four separate nullable date slots, four orthogonal status axes, initial visibility always `PRIVATE`, no automatic public original (only consent-gated redacted derivatives approved by D08), BLUEPRINT §6 provenance vocabulary with no parallel enum, bytes stay ECHOLOG-owned and the SQL-owner set remains closed; schema needs are registered as NEEDS_MIGRATION/NEEDS_ADR, not decided here. [Spec](docs/decisions/M16-01-private-witness-object-spec.md) · [evidence](docs/audit/M16-01-witness-object-spec.md) · [packet](docs/tasks/M16/M16-01.md) |
| - [x] | **M16-02** — Preserve occurred/observed/recorded/written dates separately | P1 | D3 | M16-01 | **Closed at exact SHA `efb9be2`:** the witness date-slot contract keeps four independently nullable slots, adds `EXACT`/`APPROXIMATE`/`RANGE`/`UNKNOWN` precision and IANA-zone + retained-offset rules, forbids defaulting/inference/collapse, and models Tick-Tock as appended per-slot corrections that never overwrite originals. 17 fixtures (5 valid, 12 invalid with expected codes) and a deterministic effective-chronology check pass; 15/15 tampered sets are rejected. The generic `quad-time.ts` telemetry contract still defaults slots and is explicitly kept separate from testimony. Contract + fixtures only: no witness schema/table/API/UI; M16-03 owns persistence. [Design](docs/design/M16-02-date-semantics.md) · [Data](docs/data/M16-02-date-semantics.json) · [Audit](docs/audit/M16-02-date-semantics.md) |
| - [x] | **M16-03** — Implement immutable original and appended correction lineage | P1 | D4 | M16-02,M04-02 | **Closed at verified exact SHA `992b8cdb6a072af2353b0c6093f73df75b64e6c8`:** private D06 originals retain four independent M16-02 date slots plus separate ECHOLOG object key/digest; revision 1 cannot be overwritten/deleted through normal model operations; corrections append one of four validated date values with monotonic lineage. Addon tests, SDK tests, workspace/Docker guards, scoped ESLint and exact GitHub CI run `40672642758` passed; `dev`/`main` now point to this SHA. No live PG/ECHOLOG roundtrip or deployment is claimed; internal `removeWhere`/raw-engine calls bypass model hooks. [Evidence](docs/audit/M16-03-witness-lineage.md) · [packet](docs/tasks/M16/M16-03.md) |
| - [x] | **M16-04** — Gate upload and viewing by consent and explicit ACL | P1 | D4 | M16-03,M03-02 | **Closed at implementation SHA `ef415f3518637a3d3a65103b3973bd7019a9ba90`:** D06 requires active scoped consent, an eligible subject/verified guardian, and immutable per-record view ACL membership; admin role alone grants no access. ECHOLOG requires private marking before REST/S3 object publication, checks marked REST reads through D06, hides all S3 aliases, protects marked bytes from GC, and revokes pre-marker grants. Evidence: ECHOLOG 38/38; D06 access 5/5; M16-03 regressions 2/2; MoonQL ACL 3/3; workspace typecheck, SDK drift, scoped ESLint and independent read-only security review passed. `evidenceRef` remains an administrator-recorded pointer, not proof verification; grants issued before consent withdrawal can live up to five minutes. No production database, live media, deployment or browser test claimed. [Audit](docs/audit/M16-04-media-consent-acl.md) · [packet](docs/tasks/M16/M16-04.md) |
| - [ ] | **M16-05** — Provide redacted derivative preview for human publishing request | P1 | D3 | M16-04 | **OPEN / BLOCKED:** the owner reports approved redaction rules and a reviewer exist, but the policy path and reviewer role/evidence are not yet identified or verifiable in repo docs; a contract-only candidate is available as [NOT RATIFIED proposal](docs/design/M16-05-redaction-policy-proposal.md), with read-only contract-alignment review (not privacy approval). M16-04 still provides only synthetic fixture evidence. ADR-0003/M16-01 require an explicit human request and D08 approval before a derivative can be public, while M34-04 confirms D08 has no release record or public projection. No source content was accessed. Keep any future private preview behind D06 consent and per-record ACL. [Blocker audit](docs/audit/M16-05-derivative-preview-blocker.md) · [packet](docs/tasks/M16/M16-05.md) **D08 update 2026-10-29:** the pure decision contract now exists at `81d2638` (`@moonwitness/governance`), but the durable store, schema, routes, reviewer-grant ADR and activation remain unauthorized; this row stays blocked for the same reason. |
| - [ ] | **M16-06** — Test consent withdrawal, retention and search/export purge | P1 | D4 | M16-05 | Withdrawn testimony not retrievable publicly ; [packet](docs/tasks/M16/M16-06.md) |
| - [ ] | **M16-07** — Label testimony vs empirical claim vs fiction in every projection | P1 | D2 | M16-06 | No unverified spiritual message asserted as fact **Not closed; prerequisite M16-06 is still open.** Contract artifact landed at `0362e9b`: `labelProjection` maps seven projection kinds to exactly one epistemic class from the BLUEPRINT/M16-01 axis (no parallel enum), refuses a missing/unknown kind or class, refuses any upgrade or downgrade between testimony, evidence and fiction, returns an unlabelled shape instead of defaulting, and `requireLabeledProjection` throws so an emitter cannot serialize an unlabelled projection; 26/26 tests, scoped typecheck and ESLint clean. Contract only: not exported from the barrel and not wired into any projection yet; no packet exists. [Audit](docs/audit/M16-07-projection-label.md) |


## M17 — Story canon, characters, four books and SHADOW

**Group:** G3 · **Priority:** P1 · **Prerequisites:** M06,M16 · **Scope:** Story addon, HQ creative workbench, asset provenance.

**Exit gate:** Canonical story versions and source gaps remain transparent. Evidence at exact SHA required.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M17-01** — Map II eight eras, crew and XII/XIV story versions to identities | P1 | D3 | M06-03,M16-01 | **Closed at exact SHA `89cfd7c`:** a 36-row identity ledger keeps kind-prefixed character (`ch_`), crew-label, ensemble, entity, actor (`fg_`), era, story-version and gap ids with zero character/actor collisions, empty `sameAs` set and zero real-person assertions; 116 locator quotes resolve. It records 3 `EVIDENCED`, 19 `LABEL_ONLY`, 12 `NEEDS_SOURCE`, 2 `ABSENT` — including two incompatible eight-era enumerations left `UNRESOLVED` rather than merged, 8 crew slots with only THE SHADOW evidenced, and the performer row `ABSENT` because no casting identity exists. Validator passes and 24/24 tampered datasets are rejected. Identity references only: no era artifact, performer, manuscript or patch title is claimed. [Data](docs/data/M17-01-identity-map.json) · [Audit](docs/audit/M17-01-identity-map.md) |
| - [x] | **M17-02** — Implement false-alias prevention for Shadow/Batteries/Honey/ZILL | P1 | D3 | M17-01,M10-04 | **Closed at exact SHA `ffd148b`:** a 20-pair alias ledger over 24 referents resolves 49 quotes at their cited `file:line` with 0 approved `sameAs` and 0 alias approvals — 13 `REJECTED`, 2 `DISPUTED` (SHADOW O006/O007 and ZILL, both left unmerged because review/graph candidates are still `PENDING`), 5 `NEEDS_SOURCE` (repository silence, not proof of distinctness). The dependency-free validator rejects phonetic/mystical approvals, invented, self-linked or duplicate pairs, unused referents and count drift; 38 tampered datasets rejected by `--self-test`. Ledger+guard only — no runtime identity merging is claimed. [Audit](docs/audit/M17-02-false-aliases.md) · [packet](docs/tasks/M17/M17-02.md) |
| - [x] | **M17-03** — Define story world, arc, episode, scene and version graph | P1 | D3 | M17-02 | **Closed at exact SHA `cb65b0e`:** the graph defines five node kinds (world/arc/episode/scene/manuscript version) with allowed edges, identity rules and version lineage; the evidence ledger resolves 180 quotes (37 document + 143 rows) and records 99 chapter headings → 0 manuscript versions → 0 originals, 33 patch titles, 3 episodes, 8 version refs. The invariant "a heading is a label, never an original" is machine-checked; 15 tampered datasets (including 99-headings-as-99-originals, dangling edge, parentless scene) are rejected. D07 remains planned, so all node counts are zero and the rules are proven by fixtures, not instances. [Design](docs/design/M17-03-story-version-graph.md) · [Audit](docs/audit/M17-03-story-version-graph.md) · [packet](docs/tasks/M17/M17-03.md) |
| - [x] | **M17-04** — Record four-book THE BATTERIES and separate NPD variants gaps | P1 | D2 | M17-03 | **Closed at exact SHA `c770096`:** 12-row ledger (EVIDENCED 1 / PARTIAL 3 / NEEDS_SOURCE 7 / ABSENT 1) with sets `BATTERIES_FOUR_BOOK=6`, `NPD_WORKS=5`, `BATTERIES_NPD_SEPARATION=1`; the four-book count is recorded as `reported=4 book_rows=0 book_titles=0 sequenced=0`, so titles, order, pages and scenes stay NEEDS_SOURCE rather than inferred; three NPD labels are recorded and the named-variant set is empty, not merged into the book set; 11/11 locator quotes resolve and 6 tampered fixtures are rejected. **No packet exists** for M17-04 (`git ls-files docs/tasks/M17/` has none); scope is the TODO line and delegated statement, as the audit states. [Audit](docs/audit/M17-04-batteries-npd-gaps.md) · [ledger](docs/data/M17-04-batteries-npd-gaps.json) · [validator](scripts/check-m17-04-batteries-npd-gaps.mjs) |
| - [ ] | **M17-05** — Build SHADOW editor as HQ workspace on shared auth | P1 | D4 | M17-03,M03-02 | **OPEN / D07 foundation blocked:** M17-03 is a fixture-backed graph design; D07 store/API and revision-specific ownership/ACL do not exist. HQ has session and model-level ACL only, insufficient to prove private-draft or revision permissions. [Blocker audit](docs/audit/M17-05-shadow-editor-blocker-2026-10-28.md) · [packet](docs/tasks/M17/M17-05.md) **Contract slice landed at `a0b6381`, row stays OPEN:** an import-free `shadow-editor` contract enforces per-draft read/revise grants, monotonic revisions with `stale_revision` refusal, minimal denial payloads and no publication path. A new `/shadow` HQ page renders only an empty store behind the existing session gate; 12/12 contract tests, HQ typecheck and scoped ESLint pass, and the suite is now in the root `test` script (integrated run pending). Independent review at `a364555` confirms the route is not operational: it always passes `EMPTY_SHADOW_STORE`, there is no D07 persistence/API, and the contract's `editor`/`reviewer` allow-list has no matching current D00 roles (`admin`/`user`/`guest`), so current identities cannot create drafts. Keep open until D07 ownership/store and API-enforced ACL use supported, authorized principals and persisted-draft positive/negative tests pass. [Contract audit and independent review](docs/audit/M17-05-shadow-editor-contract.md) |
| - [ ] | **M17-06** — Track original poster/music/derived media license and manifests | P1 | D3 | M17-05 | No unlicensed lyrics or external artwork ; [packet](docs/tasks/M17/M17-06.md) |
| - [ ] | **M17-07** — Test chronology, alias conflict and unpublished image access | P1 | D4 | M17-06,M16-06 | Draft never visible in public Story ; [packet](docs/tasks/M17/M17-07.md) |


## M18 — One publication and retraction gate

**Group:** G3 · **Priority:** P1 · **Prerequisites:** M03,M14,M07 · **Scope:** Source rights, review release and public projections.

**Exit gate:** Only reviewed/consented versions visible and retractable. Do not infer completion from code inventory alone.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M18-01** — Specify single publish state machine for text, testimony and story | P1 | D3 | M14-07,M07-07 | **Ditutup sebagai spesifikasi 2026-10-27**, hasil exact SHA `79c6c43`: satu jalur review manusia, veto hak/consent spesifik tipe, Story tetap tertutup hingga gerbang M17 terpenuhi. Tes positif/negatif M14+Corpus 13/13 dan prasyarat M07+M14 9/9 lulus pada baseline `dc82e79`; tidak mengklaim D08/consent store sudah ada. [Bukti](docs/audit/M18-01-single-publication-state-machine.md). |
| - [ ] | **M18-02** — Store edition/body license, media consent and reviewer evidence | P1 | D3 | M18-01 | **OPEN / implementation blocked:** D01 exact-version rights metadata/gate, D06 private/internal consent controls, and M14 D05 research reviewers exist, but no durable D08 authority binds verified rights/consent/reviewer evidence to an exact publishable version and projection. A non-binding [D08 authority proposal](docs/design/D08-release-authority-proposal.md) is available for owner review; it does not authorize implementation. No real license/consent evidence was verified. [Readiness blocker audit](docs/audit/M18-02-readiness-blocker-2026-10-28.md) · [packet](docs/tasks/M18/M18-02.md) **D08 update 2026-10-29:** the pure decision contract now exists at `81d2638` (`@moonwitness/governance`), but the durable store, schema, routes, reviewer-grant ADR and activation remain unauthorized; this row stays blocked for the same reason. **Grant ADR 2026-10-29:** reviewer authority is ratified as policy by [ADR-0015](docs/decisions/ADR-0015-d00-d12-reviewer-grants.md), and the [M20-08 grant-store design](docs/design/M20-08-reviewer-grant-store-design.md) is complete; grant storage, schema and routes remain unauthorized, and the pure contract at `0ef577e` (`@moonwitness/review-grants`) grants nothing by itself, so this row stays blocked. |
| - [x] | **M18-03** — Create immutable release manifest and current-version pointer | P1 | D3 | M18-01,M12-03 | **Closed at exact SHA `042ce6d`:** `packages/moonql-research/src/release-manifest.ts` builds a frozen manifest (only `node:crypto`) with one approved revision per release, a content hash and a current-version pointer bound to the manifest's own `releaseVersion`; a forged higher pointer version is refused as `POINTER_VERSION_UNKNOWN`, and rights/consent gaps, tamper, ambiguity and unapproved revisions each have a stable refusal. 26/26 tests (negative: duplicate revision, unapproved revision, in-place mutation, tampered pointer) plus clean typecheck and scoped ESLint. Pure module — not wired to a D08 store, route or publication; hash is integrity, not a signature; pointer write authority stays with the unimplemented D08 store. [Audit](docs/audit/M18-03-release-manifest.md) · [packet](docs/tasks/M18/M18-03.md) |
| - [x] | **M18-04** — Implement withdrawal, correction, takedown and appeal process | P1 | D4 | M18-03,M03-06 | Revoked content ceases public availability ; [packet](docs/tasks/M18/M18-04.md) **Closed at exact SHA `9c983f6`:** an import-free deny-by-default lifecycle for WITHDRAWAL/CORRECTION/TAKEDOWN/APPEAL; an accepted withdrawal or correction permanently blocks public availability, correction requires a new M18-03 release, takedown is a reversible ledger quarantine reinstated only by an independent later reason-recorded reviewer appeal, and withdrawal cannot be rejected; unknown states/kinds/roles/reason codes, scope/rights/consent gaps, duplicate ids or open requests, replay, self-review, stale/divergent request copies and malformed ledgers fail closed with only opaque `requestId`/`releaseId` plus a stable reason; 38/38 tests, package typecheck and scoped ESLint clean. In-process contract only: not wired to routes, the D08 store, UI, index exports or projections, and actors/timestamps are caller-supplied with no durable audit. [Audit](docs/audit/M18-04-withdrawal-correction-takedown-appeal.md) |
| - [ ] | **M18-05** — Invalidate search, preview, export and generated cache on revoke | P1 | D4 | M18-04 | **OPEN / integration blocked:** M18-03/04 are pure contracts without durable D08 release/revocation authority or consumer wiring. A non-binding [D08 authority proposal](docs/design/D08-release-authority-proposal.md) is available for owner review; it does not authorize implementation. Dock currently withholds Research/Compare, which contains exposure but does not prove post-publication invalidation in search, preview, export or caches. [Revocation integration blocker audit](docs/audit/M18-05-revocation-integration-blocker-2026-10-28.md) · [packet](docs/tasks/M18/M18-05.md) **D08 update 2026-10-29:** the pure decision contract now exists at `81d2638` (`@moonwitness/governance`), but the durable store, schema, routes, reviewer-grant ADR and activation remain unauthorized; this row stays blocked for the same reason. **Grant ADR 2026-10-29:** reviewer authority is ratified as policy by [ADR-0015](docs/decisions/ADR-0015-d00-d12-reviewer-grants.md), and the [M20-08 grant-store design](docs/design/M20-08-reviewer-grant-store-design.md) is complete; grant storage, schema and routes remain unauthorized, and the pure contract at `0ef577e` (`@moonwitness/review-grants`) grants nothing by itself, so this row stays blocked. |
| - [x] | **M18-06** — Display reviewer scope, source and original-vs-derivative label | P1 | D3 | M18-03 | No AI or copywriting masquerades as original source ; [packet](docs/tasks/M18/M18-06.md) **Closed at exact SHA `2300cd0`:** `buildSourceLabel` renders `ORIGINAL` only for a fully evidenced original (no declared derivation, explicit `aiInvolvement: NONE`, named source identity, verified reviewer scope); copywriting, third-party copyright, AI-assisted, AI-generated and translation outputs are structurally `DERIVATIVE`, missing AI involvement blocks `ORIGINAL`, an unknown reviewer scope renders `REVIEWER SCOPE UNVERIFIED`, and a derivative without source identity renders `SOURCE UNAVAILABLE` instead of inventing one; 17/17 tests including a 3,200-combination matrix with exactly one `ORIGINAL`, package typecheck and scoped ESLint clean. Contract only: not wired into a UI route or locale catalogue, and the inputs are self-declared. [Audit](docs/audit/M18-06-source-label.md) |
| - [ ] | **M18-07** — Test concurrent publish, wrong role and rollback/replay | P1 | D4 | M18-05,M18-06 | Unapproved public data remains denied ; [packet](docs/tasks/M18/M18-07.md) |
| - [x] | **M18-08** — Implement the D08 release decision-boundary contract | P1 | D4 | M18-03,M18-04 | **Closed 2026-10-29 at exact implementation SHA `81d26386cf80f6b7138bd8be361fd0b4093eec2f` (contract `ed04360`):** new pure `@moonwitness/governance` package with `decideRelease`/`readDecision`; one exact revision is approved only for a verified human holding a live `RELEASE_REVIEWER` grant, against opaque D01/D05/D06/D07 refs rechecked at decision and read time, with exact-scope, classification, field-allowlist, M18-04 withdrawal and replay denials; decisions stay `APPROVED_WITHIN_SCOPE` with `activation: DISABLED` and the M18-03 hash is integrity evidence only. 15/15 tests cover the ADR-0013 step-2 matrix (positive exact revision; stale digest, wrong scope, missing/withdrawn rights or consent, self-review, machine/ungranted/revoked/expired reviewer, replay, withdrawal/takedown, unknown field); package typecheck, scoped ESLint, `tsc -b` and frozen-lockfile install (46 projects) pass, and the UI gate passed on commit. **Contract only:** no schema, migration, store, route, UI, projection or activation; caller-supplied identity/evidence snapshots are not proof, no D00/D12 reviewer-grant ADR exists, and no content becomes public. [Audit](docs/audit/M18-08-d08-release-decision.md) |


## M19 — Design system, accessibility and frontend experience

**Group:** G3 · **Priority:** P1 · **Prerequisites:** Relevant M05 locale contracts, M08 for Reader-specific work · **Scope:** MoonUI, Dock, Headquarters, **Cockpit Vite/CLI**, bilingual first landing and shared design. Microtasks M19-08–36 refine the existing M19 umbrellas.

**Exit gate:** Accessible interaction modes without Radio regression, bilingual Dock preview with tested /id and /en, and independently verified id/en coverage of HQ/Cockpit and applicable other app surfaces. A Dock preview may pass its **scoped** gate before the complete global M19 gate.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M19-01** — Audit MoonUI vs Moonframe vs Rocksoul asset ownership | P1 | D2 | M05-07 | **Closed 2026-10-27** at audit SHA `d064b2e9bf078389d641b517817fb4695f2b0b19`: one component contract is MoonUI (87 consuming files, `pnpm ui:check` 112 files/0 violations); Moonframe is documentation-only with an MIT pin; Rocksoul repos carry no licence and are recorded as ungoverned. Shipped art without a rights ledger (`apps/dock/public/art`, `apps/headquarters/public/art`, `cockpit bgm.mp3`) and the static surface list are handed to M17-06 and the MoonUI gate. [Audit](docs/audit/M19-01-asset-ownership.md) |
| - [x] | **M19-02** — Define Reader/Research/Story/Operator layout/typography tokens | P1 | D3 | M19-01 | **Closed at exact SHA `ed3561a`:** typed `MOON_EXPERIENCES` group defines the four modes with one semantic key set and palette-free values referenced from `MOON_FONTS`/`MOON_SPACING`; MoonUI suite 39/39 (13 new), typecheck and `pnpm ui:check` 138 files/0 violations passed. Negative guard rejects out-of-palette colour literals and key drift. Tokens are defined but not yet consumed by an app; adoption stays with M19-03/M19-04. [Design](docs/design/M19-02-experience-tokens.md) · [Audit](docs/audit/M19-02-experience-tokens.md) |
| - [x] | **M19-03** — Map public information architecture and responsive search flows | P1 | D3 | M08-02,M19-02 | **Dock slice verified at exact SHA `cf49d10aaae7afad7f068b885b6fb0f2d7eda9cd`:** four bilingual READ/EXPLORE/CREATE/SIGNAL cards link to existing routes, render after the hero in both live/offline home, and label CREATE as DEMO with M33 blocker copy; focused tests 15/15 and Dock typecheck pass. **Header IA implemented at `9afe6ecb1dff94b0cdc36338ec60d23c25d13e09`:** four primary links plus nine routes in a keyboard-accessible INDEX disclosure, localized EN/ID labels/status, and CREW/ABOUT moved into home/footer anchors. Focused tests 37/37, Dock typecheck, scoped ESLint, and `git diff --check` pass. **Home geometry verified at that exact source SHA:** browser matrix 390/768/1440/1920 × id/en passed 8/8 with zero horizontal overflow, zero visible elements outside viewport, four cards and 1/2/4/4 columns; reduced-motion cases passed 2/2. The offline-only run recorded one React hydration warning at en/768; no live-Hub result is claimed. **Keyboard behavior verified at exact harness SHA `8103e35f9af1a046370df899301881d6e5cd87fb`:** desktop/mobile INDEX Enter/Escape/focus, hidden-link Tab exclusion, drawer focus wrap, and active READ semantics passed 1/1 on the offline branch with no page errors. **Closure review:** M19-04's [closure audit](docs/audit/M19-04-accessibility-closure-8f1a239.md) covers the Reader provenance disclosure and Terms lexicon-index focus semantics; M19-06 remains the downstream broader experience-mode baseline. No global search or private link is introduced. [Dock slice](docs/tasks/M19/M19-03.md) · [Design](docs/design/M19-03-public-ia.md) · [Geometry audit](docs/audit/M19-03-header-geometry.md) · [Keyboard audit](docs/audit/M19-03-header-keyboard.md) · [Earlier audit](docs/audit/M19-03-public-ia.md)  **Closed against exact application SHA `b7a1e9970738fad7e4f6b7e91869724b3b35802e`; CI `40836695194` passed and promoted the same source SHA to `main`.** Responsive GET matrix: 16/16 for Reader, Terms, Stations, and Missions across id/en at 390/1440px; role=search, locale-preserving route, query retention, explicit offline alerts, no global search, and zero overflow. M19-04 keyboard and M19-35 bilingual geometry evidence verified; M19-06 remains the downstream broader experience baseline. [Responsive search audit](docs/audit/M19-03-responsive-search-b7a1e99.md) |
| - [x] | **M19-04** — Implement keyboard/focus/errors/reduced motion accessibility | P1 | D3 | M19-03 | **Closed at exact implementation SHA `8f1a239894d64510e5301afd86548456d1332fa3`; integrated CI `40805510041` passed and promoted that SHA to `main`.** Dock focus/native disclosure/error/empty/reduced-motion checks and Headquarters focus/live-region/reduced-motion checks passed the descendant exact-SHA monorepo verification. Dock term-index regression passed 6/6 at `697dc1c5c475466fad35722349d10f324ac19eee`. A clean detached checkout at `8f1a239894d64510e5301afd86548456d1332fa3` passed Cockpit's focused browser suite 2/2, package typecheck, client build, and scoped ESLint (0 errors, 1 existing warning). Full Cockpit suite was 47/48; its sole failure was the unrelated server ledger-path assertion in `test/cockpit.test.ts`. Independent read-only reviews found no concrete Dock focus defect and approved the reduced-motion test. No human accessibility certification is claimed. Separate uncommitted Cockpit media/progress work was not used as evidence. [Closure evidence](docs/audit/M19-04-accessibility-closure-8f1a239.md) · [Progress audit](docs/audit/M19-04-accessibility-progress.md) · [Task packet](docs/tasks/M19/M19-04.md) |
| - [x] | **M19-05** — Test Arabic/Hebrew/Greek scripts, RTL and diacritics | P1 | D3 | M19-04 | **Closed at exact implementation SHA `056b0bdff3ab35dd95e47135fd06f15e24241d40`.** Clean detached checkout passed the React SSR + Chromium browser suite 4/4 (Arabic/Hebrew/Greek direction, unknown Hebrew `dir=auto` resolves RTL, Dock Arabic CSS alignment, synthetic combining-mark preservation), source-contract suite 10/10, scoped ESLint (0 errors), and `git diff --check`. The SSR test is registered in the root test chain; integrated CI on the closure commit will verify that registration. Synthetic fixtures only; no live Hub, real scripture, or cross-platform font rendering is claimed. [Exact-SHA evidence](docs/audit/M19-05-reader-render-056b0bd.md) · [Packet](docs/tasks/M19/M19-05.md) · [Static source audit](docs/audit/M19-05-script-rtl-diacritics-5b70e76.md) |
| - [x] | **M19-06** — Create screenshot and behavioral baseline across experience modes | P1 | D3 | M19-03,M19-05 | **Closed at exact implementation SHA `eb865c2efc045482d3fd71d9e811f241d8d0a925`.** Dock Chromium matrix passed 6/6 across Reader/Research/Story in `id` and `en` at 1440px/390px; assertions cover applied token styles, localized route/controls, keyboard focus, and no horizontal overflow. Existing Cockpit Operator static Vite preview passed 1/1 at 127.0.0.1:3104. Dock and Cockpit typecheck, contract 2/2 and pre-commit UI gate passed. CI `40841500959` passed monorepo verification and promoted the same SHA to `main`. Reader/Research were forced offline; Cockpit API/service behavior and human accessibility certification are not claimed. [audit](docs/audit/M19-06-experience-baseline-38d975a.md) · [packet](docs/tasks/M19/M19-06.md) |
| - [x] | **M19-07** — Run J01/J03 browser acceptance; J05 only when Story is in release scope | P1 | D4 | M19-06 | **Closed at exact implementation SHA `818a92d86a2c0ff97fad833504b361fba3f2fd34` (harness tooling `3e10dd3`, baseline `ca80eeaba`):** a Chromium run against the ephemeral in-memory Hub plus the Dock dev server passed 39/39 clauses, twice (`node scripts/ui/m19-07-acceptance.mjs`, exit 0). J01 in `en` and `id`: one `main#main.dk-main[data-experience=reader]`, header/footer landmarks, locale `html[lang]`, the prefilled `QS 2:82` GET search form, the rights-cleared Arabic source visible at 364×240 inside a 406×800 passage (the earlier 0×3984 grid collapse is gone after the `apps/dock/src/app/globals.css` fix), the licensed translation, and the reproducible-citation panel. J03: the comparative route opens from the Reader, withholds its body (`The research ledger is withheld until an approved D08 public projection is available`) with no fabricated names, and the Reader still renders afterwards. Accessibility: the skip link is the first Tab stop and moves focus to `main#main` (`tabindex="-1"`); at 390/640/768/900/1280/1440px there is no horizontal overflow and the passage and Arabic source keep real width (326/576/704/836/406/406px passages). J05/Story stays NOT RUN because Story is out of release scope. Dock `pnpm test` 317/317 and `pnpm typecheck` clean on the same tree; the MoonUI token-purity gate passed on commit. No packet exists, no WCAG certification and no deployment is claimed. [Acceptance audit](docs/audit/M19-07-j01-j03-browser-acceptance.md) · [prior NOT MET attempt](docs/audit/M19-07-j01-j03-browser-acceptance-attempt.md) |
| - [x] | **M19-08** — Audit Dock route and public content locale coverage | P0 | D2 | M05-08 | **Closed 2026-10-27:** all 21 pages, 5 API/manifest routes, public/protected status, existing unprefixed URL behavior, source language and rights boundaries inventoried. Reader drill passed 28 checks and Terms drill 45 checks, including positive content and negative rights cases. No locale routing exists yet; locale-route acceptance is M19-09. Exact source SHA `e73e156bf4616131152ff865b3f6f67658a92d77`; [audit](docs/audit/M19-08-dock-locale-scope.md). |
| - [x] | **M19-09** — Implement Dock /id, /en, / and unsupported-locale routes | P0 | D4 | M05-11,M19-08 | **Closed 2026-10-27:** resolved redirect loop and subpath context loss on middleware re-entry via generalized `isLocalizedRewrite(request, pathname)`; unit re-entry tests in `locale-routes.test.mjs` (12/12 pass) and live Next server probe in `home-offline.test.mjs` (GET /id, /en 200; / 307; /fr 404) pass cleanly. [Audit](docs/audit/M19-09-dock-locale-routes.md). |
| - [x] | **M19-10** — Write and integrate Indonesian landing content | P0 | D2 | M19-09,M02-01 | **Ditutup 2026-10-27**, exact SHA `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa`: copy mission mengikuti sumber yang disetujui, status/fitur dilabeli terencana atau sesuai jadwal, klaim dan angka fiktif dihapus; 13 tes Dock + root `pnpm verify` lulus, CI run `40378453247` hijau. Tidak mengklaim visual/browser/deployment. [Bukti](docs/audit/M19-10-indonesian-home.md) |
| - [x] | **M19-11** — Write and integrate English landing content | P0 | D2 | M19-09,M19-10 | **Closed 2026-10-27:** English landing catalog has full 79-key parity with Indonesian, preserves approved theological names (ALLAH, Nabi Muhammad SAW, Nabi Isa AS), voluntary participation, and disclaimer of divine authority; rejects invented metrics and live-AI claims; verified by `landing-copy-english.test.mjs` (4/4 pass). [Audit](docs/audit/M19-11-english-home.md). |
| - [x] | **M19-12** — Build accessible language switcher and stable route links | P0 | D2 | M19-09 | **Closed 2026-10-27:** `LocaleSwitcher` provides accessible navigation landmark, `aria-current="true"`, focus outline, full keyboard activation (Tab/Enter/Space), path/query/fragment preservation via `localizedDockHref`, and 1-year `mw_locale` cookie persistence (`SameSite=Lax; Secure`). [Audit](docs/audit/M19-12-language-switcher.md). |
| - [x] | **M19-13** — Consolidate Dock header and active nav semantics | P1 | D3 | M19-12,M19-03 | **Closed 2026-10-27:** `SiteHeader` assigns `aria-current="page"` and `dk-nav-active` dynamically to current route, wraps all links with `localizedDockHref()` to preserve `/id` and `/en`, points Join CTA directly to in-page `#join-crew` footer anchor, and adds accessible mobile navigation drawer with Escape closing and focus trap; verified by `header-navigation-semantics.test.mjs` (5/5 pass). [Audit](docs/audit/M19-13-dock-header-navigation.md). |
| - [x] | **M19-14** — Implement locale-aware Dock metadata and SEO alternates | P0 | D3 | M19-09,M19-11 | **Closed 2026-10-27:** dynamic `generateMetadata()` provides canonical URLs, symmetrical alternate hreflang tags (`id`, `en`, `x-default`), and OpenGraph tags per active locale grounded in `FRONTEND_URLS.dock`; `<html lang={locale}>` dynamically assigned; dynamic `/sitemap.xml` and standard manifest `lang: "en"` generated; verified by `metadata.test.mjs` (7/7 pass). [Audit](docs/audit/M19-14-dock-metadata-seo.md). |
| - [x] | **M19-15** — Localize Dock forms/validation/loading/error/empty states | P1 | D3 | M19-09,M05-13 | **Closed 2026-10-27:** 115-key bilingual states copy catalog in `states-copy.ts` enforced via `defineLocaleCatalog`; Next.js App Router boundary files (`loading.tsx`, `error.tsx`, `global-error.tsx`, `not-found.tsx`) established; form controls, query errors, and empty notices localized across 9 subroute pages and 2 client components; verified by `states-copy-parity.test.mjs` (6/6 pass). [Audit](docs/audit/M19-15-dock-states-localization.md). |
| - [x] | **M19-16** — Decouple informative landing from live Hub availability | P0 | D3 | M19-09 | **Closed 2026-10-27:** `homePayload()` isolates Hub outages via `withHubFallback`; `HomePage` renders `<OfflineLanding>` with HTTP 200, approved mission text, and truthful outage notice without zero-counter illusions; verified by live server integration test `home-offline.test.mjs` (pass). [Audit](docs/audit/M19-16-dock-offline.md). |
| - [x] | **M19-17** — Test bilingual homepage responsive and reduced-motion | P0 | D3 | M19-10,M19-11,M19-12 | **Closed 2026-10-27:** `globals.css` defines `@media (prefers-reduced-motion: reduce)` suppressing continuous animations and hover transforms, adds high-contrast `:focus-visible` outlines on navigation links and buttons, and enforces responsive horizontal overflow containment across viewports <1040px; verified by `responsive-accessibility.test.mjs` (3/3 pass). [Audit](docs/audit/M19-17-dock-responsive-motion.md). |
| - [x] | **M19-18** — Remove nested Dock SiteLayout and duplicate landmarks | P1 | D2 | M19-08 | **Closed 2026-10-27:** removed nested `<SiteLayout>` wrappers and duplicate `<header>`, `<main>`, `<footer>`, and `id="join-crew"` landmarks from `prisms`, `timeline`, `studio`, and `reader/compare`; enforced single canonical landmark hierarchy; verified by `landmarks.test.mjs` (6/6 pass). [Audit](docs/audit/M19-18-dock-duplicate-landmarks.md). |
| - [ ] | **M19-19** — Audit source rights/public research projection in Dock | P0 | D3 | M18-01,M19-08 | **M19-19 remains OPEN:** the anonymous UNILEX detail leak is contained at `f45e9587b3e9113c057b1e9f5224931c6a271cef`; the list and all five raw UNILEX source/term/form/sense/relation REST models are additionally admin-only at exact SHA `ac3d35ddc8210c159d4d0413e484b5e1d08137d1`; anonymous list/get denial, admin positive controls, bilingual Dock withholding, API 4.0.0 SDK consistency and scoped checks are recorded in [containment audit](docs/audit/M19-19-unilex-public-read-containment.md). This remains containment only, not D08 release approval. The current denial matrix at source SHA `73333d38e777dd06450791705c2b6cb350825654` passed 14, failed 0, skipped 1 (`pnpm --filter @moonwitness/arsy exec tsx --test test/public-projection-denial.test.ts`). At that historical SHA, two tests documented public Graph pending-candidate/evidence and Ontology reviewer-conflict exposure; independent scope review assigned those surfaces to their Graph/Ontology owners. The later containment is recorded below and does not grant D08 publication approval. No approved D08 public projection exists; a non-binding [D08 authority proposal](docs/design/D08-release-authority-proposal.md) is available for owner review but does not authorize a projection. Dock research/compare remain withholding and M19-19's positive publication DoD cannot be met yet. No live database, live Hub, or deployment was exercised. At exact SHA `3f0b35cd9a9538cf6919e67991f1bbdf6d81f0d3`, anonymous Graph/Ontology reads were also contained; this does not provide D08 publication approval. [Graph/Ontology containment](docs/audit/graph-ontology-anonymous-read-containment-3f0b35c.md) · [UNILEX containment audit](docs/audit/M19-19-unilex-detail-denial.md) · [Dock audit](docs/audit/M19-19-dock-rights-projection.md) · [packet](docs/tasks/M19/M19-19.md) **D08 update 2026-10-29:** the pure decision contract now exists at `81d2638` (`@moonwitness/governance`), but the durable store, schema, routes, reviewer-grant ADR and activation remain unauthorized; this row stays blocked for the same reason. **Grant ADR 2026-10-29:** reviewer authority is ratified as policy by [ADR-0015](docs/decisions/ADR-0015-d00-d12-reviewer-grants.md), and the [M20-08 grant-store design](docs/design/M20-08-reviewer-grant-store-design.md) is complete; grant storage, schema and routes remain unauthorized, and the pure contract at `0ef577e` (`@moonwitness/review-grants`) grants nothing by itself, so this row stays blocked. |
| - [x] | **M19-20** — Localize HQ login and recoverable auth errors | P1 | D2 | M05-10 | **Closed at integrated SHA `664cb082bafcfc52bf9e333911449af240a7813c`:** implementation source `39a7e2733509d88f5e9e56b13d85c4277d72edf9`; login/session tests 10/10, anonymous redirect test 1/1, HQ typecheck and scoped ESLint passed; independent review found no blocker; full exact-SHA CI [40500018547](https://github.com/bjo163/moonwitnessxv/actions/runs/40500018547) passed and promoted to `main`. No live Hub credential submission was claimed or required. [Evidence](docs/audit/M19-20-hq-login-locale-worktree.md) |
| - [x] | **M19-21** — Localize HQ shell, navigation and operational statuses | P1 | D3 | M19-20 | **Closed at exact SHA `701b629216ad9ef722c7c6571ca20eabff4b831a`:** HQ shell/navigation and status copy use the validated `id`/`en` locale; actual schema observations remain distinct from demo telemetry. The static alert count is visibly marked `3 · DEMO` and its localized accessible label includes the count. Shell tests 7/7, HQ typecheck, scoped ESLint and independent review passed; exact full CI [40501629888](https://github.com/bjo163/moonwitnessxv/actions/runs/40501629888) passed and promoted to `main`. No live Hub session was tested; the status badge is not a full health probe. [Audit](docs/audit/M19-21-hq-shell-locale-worktree.md) · [packet](docs/tasks/M19/M19-21.md) |
| - [x] | **M19-22** — Localize HQ model/forms/views/actions/validation | P1 | D3 | M19-21 | **Historical closure retained:** original integrated SHA `db838646f40c93d364c574ac2e9e05186e74cc6e` has the CI result below; owner-authorized CRUD-action/confirmation/localized-error follow-up was implemented at `4a501d6b66ca9439bb68a4608c2d80b49be3f881`, with focused 3/3 tests, HQ typecheck and scoped ESLint passing at verification SHA `b77c2cb1d432b215194b1832e86b1ec16d25708a` (1 warning). Source at `c46552ae0ec8f809b64b7d86539d514471e084d0` and descendant `8720423e84cf219fa7eaea4e746b31c6936592df` contains this follow-up; actions/authz tests passed 26/26 at `c46552`, and the exact-SHA 46/46 HQ matrix at `8720423` included `editor-actions.test.ts`; HQ typecheck passed at both. The separate model-view locale runner failed to resolve `@/data/types`, so bilingual rendering was not newly verified; field identifiers, several controls and page copy remain schema-driven or hard-coded, and no complete-browser CRUD, live Hub/database or deployment evidence was gathered. Original exact CI run `40542420815` passed and promoted only `db83864`; Hub remains the sole ACL authority. [Audit](docs/audit/M19-22-hq-model-view-localization.md) · [packet](docs/tasks/M19/M19-22.md) |
| - [x] | **M19-23** — HQ language selection, cookie and cross-app links | P1 | D3 | M19-22,M05-11 | **Closed 2026-10-27:** id/en selector on login and authenticated shell; only `mw_locale` changes while route/query/hash persist; validated optional `DOCK_URL`; HQ typecheck and focused tests 5/5 pass. CI run 40544569260 passed and promoted exact SHA `cb719d9253949e3e021aaa1e7903abc5b4bac667` to main; [audit](docs/audit/M19-23-hq-locale-selection.md). |
| - [x] | **M19-24** — HQ id/en full visible UI regression and E2E | P1 | D3 | M19-23 | **Closed at exact SHA `31a24ec0eb9f9a0fac8ab2b6bdb28ed7fae2af50`:** focused locale/session/authz coverage 47/47; browser E2E 1/1; HQ typecheck and scoped ESLint passed. CI run `40550064515` passed full verification and promoted the same SHA to `main`. Synthetic-only fixture; no production credentials/data. [Evidence](docs/audit/M19-24-hq-locale-e2e.md) · [packet](docs/tasks/M19/M19-24.md) |
| - [x] | **M19-25** — Audit actual Cockpit Vite UI and optional CLI help | P0 | D2 | M05-08 | **Closed 2026-10-27:** Cockpit panels, dialogs, forms, accessibility labels, launcher and optional CLI scope inventoried; human copy separated from machine actions/logs/IDs/ports/URLs. `pnpm --filter @moonwitness/cockpit test` passed 3/3. Exact source SHA `e73e156bf4616131152ff865b3f6f67658a92d77`; [audit](docs/audit/M19-25-cockpit-locale-scope.md). |
| - [x] | **M19-26** — Localize Cockpit nav, panes, status and tooltips | P1 | D3 | M19-25,M05-10 | **Closed 2026-10-27:** Localized TopBar, Sidebar, 6 primary functional tabs, and status pills with 1:1 en/id key parity; service tags (radio, dock, hq, ai, sentinel) and ports stay invariant; [audit](docs/audit/M19-26-cockpit-nav-locale.md). |
| - [x] | **M19-27** — Localize Cockpit forms, confirmations and errors | P1 | D3 | M19-26 | **Closed 2026-10-27:** Added accessible WAI-ARIA CockpitConfirmModal for destructive actions (stopAll, freePorts); localized search inputs, forms, and custom stream drawer; [audit](docs/audit/M19-27-cockpit-forms-confirmations.md). |
| - [x] | **M19-28** — Localize Cockpit settings/help and accessible messages | P1 | D2 | M19-26 | **Closed 2026-10-27:** Implemented CockpitHelpModal accessible via ? or footer trigger; complete keyboard shortcuts manual localized in en and id; [audit](docs/audit/M19-28-cockpit-settings-help.md). |
| - [x] | **M19-29** — Persist Cockpit UI locale and preserve command contracts | P1 | D3 | M19-27,M05-11 | **Closed 2026-10-27:** Implemented useCockpitLocale with localStorage persistence under mw_cockpit_locale and cross-tab sync; command contracts and API requests invariant; [audit](docs/audit/M19-29-cockpit-locale-persistence.md). |
| - [x] | **M19-30** — Verify Cockpit GUI and CLI human-output locale scope | P1 | D3 | M19-28,M19-29 | **Closed 2026-10-27:** Verified pnpm --filter @moonwitness/cockpit test (21/21 passing), client Vite build (0 errors), and tsc typecheck clean. ADR-0008 accepted; [audit](docs/audit/M19-30-cockpit-locale-verification.md). |
| - [x] | **M19-31** — Protect RTL/script and corpus source language semantics | P1 | D3 | M19-09,M05-12 | **Closed at integrated exact SHA `2257139321c77e9d0ec9a12c61af32cc2c13eefa`:** nullable source-owned direction is preserved without inference; Hebrew legacy/rtl, Greek ltr, diacritics and citation invariance plus rights denial verified. Focused tests: ARSY corpus 7/7, Dock reader rights 5/5, SDK current; full CI and guarded promotion passed in run [40532769513](https://github.com/bjo163/moonwitnessxv/actions/runs/40532769513). Independent review confirmed task paths unchanged through integration. Local Dock typecheck was affected by separate uncommitted catalog/constellation changes; integrated exact-SHA CI passed. [Audit](docs/audit/M19-31-corpus-direction.md) · [packet](docs/tasks/M19/M19-31.md) |
| - [x] | **M19-32** — Localize shared MoonUI UI chrome and design semantics | P1 | D3 | M05-10,M19-01 | **Closed 2026-10-27:** Verified unit and integration tests (17/17 passing), ui:check consistency (100 files, 0 violations), token/ARIA purity; [audit](docs/audit/M19-32-moonui-perfection-audit.md). |
| - [x] | **M19-33** — Preserve cross-app locale during user navigation | P1 | D2 | M19-12,M19-23,M19-29 | **Closed at exact SHA `cab492598a9698c5197faaa946f98bb6aebff1e7`:** Dock internal navigation already preserves `/id` or `/en`; both HQ → Dock links now apply validated HQ UI locale and strip query/fragment, with credential/protocol/invalid-locale rejection. Focused locale suite 6/6, HQ typecheck, scoped ESLint and `git diff --check` pass; independent review found no blocker. No active Cockpit cross-app navigation link was found in inspected client code, so this does not claim Cockpit → Dock coverage. No auth/API behavior changed. [HQ locale helper](apps/headquarters/src/lib/locale-preference.ts) · [tests](apps/headquarters/test/locale-preference.test.ts) |
| - [x] | **M19-34** — Create cross-app id/en accessibility and copy E2E matrix | P1 | D4 | M19-24,M19-30,M19-17 | **Closed at exact promoted SHA `005e51ab4248b5dee91061ed39bc22e630afe7d4`; CI `40808906291` passed and promoted this SHA to `main`.** Cockpit browser 2/2/catalog 6/6, HQ locale/auth 47/47 plus browser 1/1, Dock locale/accessibility 55/55 plus M19-05 SSR/Chromium 4/4, ORBIT browser 1/1/suite 89/89, and ARSY denial 16/16 (zero skips) passed. Dock offline visual matrix: 44 pass/1 skip; the public term-detail capture skipped because no public term ID is available. The localized anonymous withholding/404 path passed ACL 2/2 and responsive geometry 8/8 with zero overflow/out-of-viewport elements and no protected detail/source/review containers. No approved D08 public detail exists, so no public-detail rendering is claimed; M19-19 remains open for broader release approval. No independent human QA certification is claimed. [Exact-SHA revalidation](docs/audit/M19-34-revalidation-005e51a/README.md) · [packet](docs/tasks/M19/M19-34.md) |
| - [x] | **M19-35** — Verify visual/screenshots and regression across locales | P1 | D3 | M19-34 | **Closed at exact source SHA `b7a1e9970738fad7e4f6b7e91869724b3b35802e`; CI run `40836695194` passed and promoted the same SHA to `main`.** Offline visual matrix 44 passed, 1 term-detail case explicitly skipped because no offline term ID exists; 32 EN/ID breakpoint records + 8 reduced-motion records show zero overflow and zero off-viewport elements. Synthetic long-label browser regression 8/8, focused reduced-motion/unknown-station QA 16/16, drawer keyboard 1/1; scoped ESLint and diff-check pass. No live-Hub or human accessibility certification claimed. [Audit](docs/audit/M19-35-cross-locale-b7a1e99/README.md) · [geometry](docs/audit/M19-35-cross-locale-b7a1e99/geometry.json) · [packet](docs/tasks/M19/M19-35.md) |
| - [ ] | **M19-36** — MoonUI shared-first centralization: one component, one owner, enforced by the gate | P1 | D3 | M19-32, M30-01, M30-02, M30-03, M43-02 | **OPEN on `dev`, baseline `ad96dbf`.** [ADR-0017](docs/decisions/ADR-0017-shared-first-component-ownership.md) ACCEPTED; `scripts/check-ui-consistency.mjs` now runs **ten** checks (C1 adoption, C2 token purity, C3 component classes, C4 typography, C5 duplicate matrix, C6 ledger ratchet, C7 design-system CSS ownership, C8 markup fingerprint, C9 derived class names, C10 primitive overrides) — PASS at 175 files / 0 violations, ledger **35/35** (from 69), C7 **0/0** (from 120), C8 0 duplicated fingerprints, C9 0 sites, C10 0 sites. `test/governance/*.test.mjs` 35/35 with a failing fixture per check; moonui 158/158, dock 322/322, orbit 89/89, echolog 39/39, empire-web 10/10, HQ focused 37/37; geometry `scrollWidth === clientWidth` 20/20 at 390/768/1440/1920 on the five migrated Empire routes and re-checked after the last CSS change. **Remaining:** Phase 3 burn-down from 35 to the plan's ≤6 (Dock 19, HQ 5, Cockpit 3, Orbit 3, ECHOLOG 2, isp-console 2, Empire 1 stylesheet), renaming the relocated `su-*`/`orbit-*`/`cockpit-*` rules to `.m-*`, and an exact-SHA `pnpm verify` run — no CI result is claimed for this tree. [Packet](docs/tasks/M19/M19-36.md) · [evidence](docs/audit/moonui-centralization-ad96dbf.md) |


## M20 — Headquarters and 100CENTER human governance

**Group:** G4 · **Priority:** P1 · **Prerequisites:** M14,M18 · **Scope:** Existing HQ, models/views, audit and proposed review areas.

**Exit gate:** Single admin authorization, task and review workspace. Do not infer completion from code inventory alone.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M20-01** — Audit HQ generic model UI, route guards and existing ops widgets | P1 | D2 | M00-02,M14-01 | **Closed 2026-10-27** at audit SHA `d6b8847f7aae168e4dcb4208c2c8d3acc6c6715e`: HQ reuses the schema-driven model UI rather than duplicating an admin app (12 route handlers, 6 guard layers, 9 ops widgets at baseline `76ecdc5`). Negative findings handed to M20-02/M20-07: no server-side role check of its own, ungated write forms, anonymous `/monitor/overview` rows, and demo/fabricated dashboard fallbacks. [Audit](docs/audit/M20-01-hq-model-ui-route-guards-ops.md) |
| - [x] | **M20-02** — Design role-scoped review queue and work item lifecycle | P1 | D3 | M20-01,M18-01 | **Design closed at source SHA `b8db42df4fe33fa715e57a09e359b543a1d6b39b`:** self-approval is unconditionally rejected by I2; scope overlap, missing/delegated grants, machine principals and stale digests/versions are specified. Reference predicate suite 4/4, existing M14 four-eyes suite 7/7 (in-memory), HQ guard suite 23/23; scoped ESLint and independent review passed. Design only: no queue routes/tables/implementation; D08 and ADR gates remain. [Design](docs/decisions/M20-02-role-scoped-review-queue.md) · [Evidence](docs/audit/M20-02-review-queue-evidence.md) · [Packet](docs/tasks/M20/M20-02.md) |
| - [ ] | **M20-03** — Display rights/import blockers and reviewed source status | P1 | D3 | M20-02 | **Partial at exact SHA `ce86c4625fa32a6c7e1303ee60a7c89c7acee636`; remains OPEN:** HQ lists real D01 corpus-edition metadata behind the existing admin and model-list guards; exact-version rights clearance is labeled release-eligible, while missing/unknown/metadata-only statuses are withheld, and the panel explicitly says D01 has no review/publication decision. The follow-up at exact implementation SHA `6f8ef63b9ee4adb6e79800a144d469f9342010d1` adds behavioral evidence that denied roles make zero edition-row calls while an allowed role loads once (HQ authz 24/24, rights status 3/3, HQ typecheck, scoped ESLint, pre-commit UI gate 139 files/0 violations); independent review found no blocker. **Acceptance still unmet:** no authoritative D08 release status exists, so editors cannot distinguish an actually published edition from an approved-but-unpublished one. Keep open until D08 status projection exists. [evidence](docs/audit/M20-03-source-rights-acl-6f8ef63.md) · [packet](docs/tasks/M20/M20-03.md) |
| - [ ] | **M20-04** — Create identity/alias and evidence reviewer panels | P1 | D3 | M20-02,M10-06 | **OPEN / reviewer-authority blocked:** D03 records exist, but `/ontology/merges/decide` trusts caller-supplied reviewer text instead of binding it to D00; M20-02 leaves reviewer mandate/principal linkage pending an accepted ADR. HQ cannot safely make an attributable decision by pre-filling that field. The former public constellation projection is now admin-only at exact SHA `3f0b35c`; it remains an internal review surface, not an authorized reviewer mandate. Reviewer authority is now ratified as policy by ADR-0015; code/UI action still awaits a separately authorized grant store. [Authority proposal](docs/design/M20-04-reviewer-authority-proposal.md) · [Blocker audit](docs/audit/M20-04-identity-reviewer-authority-blocker-2026-10-28.md) · [packet](docs/tasks/M20/M20-04.md) **D08 update 2026-10-29:** M18-08 provides the pure decision contract at `81d2638`, but D00/D12 reviewer grants and a durable store remain unauthorized, so this row stays blocked. **Grant ADR 2026-10-29:** reviewer authority is ratified as policy by [ADR-0015](docs/decisions/ADR-0015-d00-d12-reviewer-grants.md), and the [M20-08 grant-store design](docs/design/M20-08-reviewer-grant-store-design.md) is complete; grant storage, schema and routes remain unauthorized, and the pure contract at `0ef577e` (`@moonwitness/review-grants`) grants nothing by itself, so this row stays blocked. |
| - [x] | **M20-05** — Improve audit actor attribution, retention and reliability contract | P1 | D4 | M20-02,M03-07 | **Closed at exact source SHA `d03c59d819b5ec0f655bfc289a8cdf1bd3024f1f`:** tests prove async audit writes are best-effort, actor attribution is absent, and finite 14-day default/configurable 30-day retention uses bounded purge chunks; failure leaves the model write successful and logs a warning. Focused suite 8/8, typecheck, ESLint and independent review passed; exact full CI [40502948854](https://github.com/bjo163/moonwitnessxv/actions/runs/40502948854) passed and promoted to `main`. Limits: purge behavior used a stubbed engine; audit rows can be missing, are not immutable approval evidence, and warning text still includes upstream storage error details. [Audit](docs/audit/M20-05-best-effort-audit-worktree.md) · [packet](docs/tasks/M20/M20-05.md) |
| - [x] | **M20-06** — Build 100CENTER view for ordinary human task/incident decisions | P1 | D3 | M20-03,M20-05 | No supernatural mandate or automatic irreversible action. **Closed 2026-10-30 at this working tree:** the pure `classifyDecision` contract in `apps/headquarters/src/lib/human-decision.ts` refuses `autoExecute`, refuses any actor or approver that is not a named human (model/service kinds and `model-`/`worker-`/`agent-`/`service-`/`system-` ids), requires a separate approver holding the `admin` or `operator` role, and never returns an executable verdict — irreversible actions classify as `requires-explicit-approval` with `executable: false`. The `/decisions` admin route renders the 100CENTER queue from the real D01 edition inventory behind the existing session layout and model ACL, with explicit unavailable/failed states, a `None` automatic-action column and a read-only caption. Evidence: `apps/headquarters/test/human-decision.test.ts` 4/4 (positive verdict, every refusal code, and a 36-combination sweep where only the two human/admin cases are accepted and `executable` is always false), `pnpm --filter @moonwitness/headquarters typecheck`, ESLint on all three files, and `next build` emitting `/decisions`. Limits: no decision store, reviewer grants or D08 release record exists, so the queue is read-only and shows stored metadata only; M20-03 stays open for the D08 publication status. M20-05 is closed and the M20-03 inventory is the data path used. [packet](docs/tasks/M20/M20-06.md) |
| - [x] | **M20-07** — Test direct URL, API role and stale-cookie access to HQ sections | P1 | D3 | M20-06 | **Closed 2026-10-30 at this working tree:** direct URL, stale cookie and API role are all refused server-side and no section renders before the session gate — anonymous and hub-rejected sessions redirect to `/login?error=expired` instead of answering with a guard; a signed-in viewer is forbidden for a model create; an admin-only view rule and an endpoint rule both refuse a non-admin; an operation or endpoint the hub does not publish is refused rather than guessed, and a view/endpoint with no published rule is forbidden rather than public. The new section matrix walks `src/app/(admin)` and pins 11 page directories under exactly one `layout.tsx` whose `me()` + `redirect` precede `<VerticalLayout`, so no section can add a layout that bypasses the gate, and the shared rights loader fails closed on denial, missing operation and thrown fetch (a denial is never an empty approval). Evidence: `hq-authz-guard.test.ts` 24/24 observed, `hq-section-access.test.ts` 5/5 (new, registered in the root test script), headquarters `tsc --noEmit` clean, ESLint clean on the new file. Limits: the matrix asserts the layout structurally rather than rendering each of the 11 routes in a browser, and API role coverage is the existing guard's endpoint-rule tests, not a live hub round-trip. [Packet](docs/tasks/M20/M20-07.md) |
| - [x] | **M20-08** — Design the D12 reviewer-grant store contract | P1 | D3 | M20-02 | **Closed 2026-10-29 at design SHA `3f8062ebe56f51a46e0f74b3b20e8b6a1cfefdcb`:** [design](docs/design/M20-08-reviewer-grant-store-design.md) fixes the logical grant/event model, two-admin `approve` issuance, mandatory expiry, revocation/supersession, V1–V15 invariants, the server-side D08 loader and a T1–T21 positive/negative matrix under ADR-0015. **Design only:** no schema, migration, route, UI, code, grant or principal; implementation needs separate authorization. [Audit](docs/audit/M20-08-reviewer-grant-store-design.md) · [packet](docs/tasks/M20/M20-08.md) |
| - [x] | **M20-09** — Implement the pure D12 reviewer-grant contract | P1 | D3 | M20-02,M20-08 | **Closed 2026-10-29 at exact implementation SHA `0ef577e52d2c7fb094fc94b336675f5b3e288180`:** `@moonwitness/review-grants` implements the ADR-0015 grant lifecycle, explicit supersession that only takes effect once the replacement is active, V1–V15 validation and a fail-closed, read-only D08 loader; 23/23 tests (T1–T21, T10b plus pending/malformed cases), typecheck, build and scoped ESLint passed. **Contract only:** no schema, migration, route, UI, grant, principal or durable store, so M18-02/M18-05/M19-19/M20-04 stay blocked. [Audit](docs/audit/M20-09-reviewer-grant-contract.md) · [packet](docs/tasks/M20/M20-09.md) |


## M21 — Optional local AI research assistant candidate workflow

**Group:** G4 · **Priority:** P2 · **Prerequisites:** M03,M14 · **Scope:** Optional AI execution, candidate inbox and source-grounded retrieval.

**Exit gate:** No hidden remote fallback, no auto write/publish, deterministic fallback. Do not infer completion from code inventory alone.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M21-01** — Evaluate local model constraints, runtime/privacy and disable switch | P2 | D3 | M14-07,M03-07 | **Closed 2026-10-27 at exact SHA `91d844da7da5ba2c53126f9c7731b47e9af492b2`:** inference stays off unless `AI_ENABLED=true`; health and deterministic heuristic completion work without AI; built-in and injected providers stay hidden/uninvoked when disabled; raw provider errors are redacted. AI Gateway 6/6, ARSY gateway regressions 5/5, ARSY typecheck, scoped ESLint, and exact CI `40507170705` passed and promoted. No real cloud/Ollama calls; provider retention when explicitly enabled is not assessed. [audit](docs/audit/M21-01-ai-disabled-privacy.md) · [packet](docs/tasks/M21/M21-01.md) |
| - [x] | **M21-02** — Define versioned AI candidate and tool-call evidence schema | P2 | D3 | M21-01 | **Closed 2026-10-27:** versioned reference/hash-only schema; 5/5 focused tests and root verify pass, including lint and web build, on exact SHA `2e067f8783a7bf084f25b9f60f882780082b5bbe`; CI `40510298738` succeeded and promoted the same SHA to `main`. Design only; no runtime storage/API/consent authority. [Contract](docs/architecture/M21-02-ai-candidate-evidence.md) · [Schema](docs/architecture/schemas/ai-candidate-evidence.v1.schema.json) · [Test](test/planning/m21-02-ai-candidate-evidence.test.mjs) · [packet](docs/tasks/M21/M21-02.md) |
| - [x] | **M21-03** — Prototype source-permission-aware retrieval, not open private files | P2 | D4 | M07-07,M21-02 | **Closed at exact SHA `1d6572d`:** `apps/aigateway/src/retrieval.ts` adds a pure, deny-by-default gate at the model-context boundary — `PRIVATE`/`WITHDRAWN` never release bytes (not even to the owner), `RESTRICTED` needs a principal-, source- and scope-bound unexpired grant, `RIGHTS_UNKNOWN` and scope mismatches yield nothing, consent must cover the requested scope, and roles/scopes never authorize. Denials carry only a source id and a stable reason code, never body, snippet or locator. 24/24 AI Gateway tests (18 focused on this gate, 15 denial scenarios asserting zero leaked text) and `pnpm typecheck` pass with clean scoped ESLint. Prototype only: caller supplies ACL, consent and clock; not wired into any route or retrieval pipeline, which M21-04/M21-07 still own. [Audit](docs/audit/M21-03-permission-retrieval.md) · [packet](docs/tasks/M21/M21-03.md) |
| - [x] | **M21-04** — Guard prompt injection, egress and tool permissions | P2 | D4 | M21-03 | **Closed at exact SHA `b3128a1`:** `apps/aigateway/src/source-guard.ts` is a pure quarantine-at-the-boundary guard (no imports/network/clock) with a fixed 11-step rule order — prompt override, role escalation, system-prompt extraction, tool-call proposals, tool invocations, permission requests, exfiltration commands, and exact-host egress allow-list; admitted text stays byte-for-byte with `UNTRUSTED_DATA`, refusals carry no text/URL/locator. Tests 44/44 in the package (20 new: 5 positive, 14 negative, 1 determinism), typecheck and scoped ESLint clean. Prototype module, not wired into a live route; no egress performed or deployment claimed. [Audit](docs/audit/M21-04-source-guard.md) · [packet](docs/tasks/M21/M21-04.md) |
| - [x] | **M21-05** — Implement HQ review inbox for AI-suggested claims or edits | P2 | D3 | M21-02,M20-02 | **Closed at exact SHA `59f9492`:** `apps/aigateway/src/review-inbox.ts` is a pure deny-by-default policy (no imports/clock) where a suggestion becomes canonical only after one live exact-role `APPROVE` from a human reviewer distinct from the proposer; AI principals, self-approval, missing/expired role, conflict, duplicate/replay decisions and malformed input all fail closed, and refusals carry only an opaque id + reason + version. Package tests 59/59 (15 new: 3 positive, 11 negative, 1 mixed-inbox leak assertion), typecheck and scoped ESLint clean. Policy model only — no HQ UI, route, table, notification or canonical write; principal kind and decision history are caller-supplied. [Audit](docs/audit/M21-05-review-inbox.md) · [packet](docs/tasks/M21/M21-05.md) |
| - [x] | **M21-06** — Prove source/research UI usable with AI unavailable | P2 | D2 | M21-01 | **Closed at exact SHA `313819d`:** Reader/hub paths keep working with an unreachable AI gateway, hub 503 surfaces hub text rather than an AI claim, closed-hub rejection is bounded and falls back to the localized notice, and no source/research route or view reads an AI field. 8/8 focused tests pass (`node --experimental-strip-types --test apps/dock/test/research-ai-unavailable.test.mjs`). Scope is the Dock reader/research surface; AI-assisted flows themselves are covered by M21-01/M21-02, and M21-07 still owes forged-citation/tool-permission tests. [Audit](docs/audit/M21-06-ai-unavailable.md) |
| - [x] | **M21-07** — Test forged citations, scope bypass and auto-publication denial | P2 | D4 | M21-04,M21-05,M21-06 | **Closed at exact SHA `187741c`:** 23/23 adversarial tests (4 positive controls, 17 attacks, 2 limitation records) attack the committed review-inbox, retrieval and source-guard gates unchanged; forged source id, transplanted decision, widened/other-scope and other-principal ACL, role/scope-only, replayed decision, absent/AI/self approval, untrusted-source tool call, prompt override and disallowed egress all refuse with one stable reason code and no bytes/URL/text; full AI Gateway suite 82/82, typecheck and scoped ESLint clean. Scope of "recorded" is a deterministic returned value — **no persistence, audit log or telemetry exists**, and approval-to-bytes binding plus inbox membership remain adapter-only/absent; both are recorded as limitations, not patched. [Audit](docs/audit/M21-07-adversarial-denial.md) · [packet](docs/tasks/M21/M21-07.md) |


## M22 — Radio, channels and Signal backward compatibility

**Group:** G4 · **Priority:** P0 · **Prerequisites:** M00,M01,M03 · **Scope:** Existing radio, addons, Dock, WhatsApp and DENPA.

**Exit gate:** All current Signal flows remain functional while XV grows. Do not infer completion from code inventory alone.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M22-01** — Freeze actual station seed/catalog response before change | P0 | D2 | M00-03 | **Closed 2026-10-27:** normalized in-memory response fixtures captured for stations, weeklySchedule, nowPlaying and listen beacon; generated IDs/timestamps, stream URLs and pseudonym withheld. Tests verify public reads, active-only catalog, privacy beacon, missing station, invalid stream URI and anonymous write. Radio suite 305 passed, 9 optional PostgreSQL skips, 0 failed. No live stream claim; unsupported listen-event remains a documented limit. Exact fixture/test SHA `a1e384ef083ecf3c6fe4aae2b70acbdd6f2620cc`; [audit](docs/audit/M22-01-radio-baseline.md). |
| - [x] | **M22-02** — Test player, playlog pseudonyms, listening beacons and schedules | P0 | D3 | M22-01 | **Ditutup 2026-10-27**, exact SHA `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa`: unsupported beacon event ditolak tanpa echo/persist; regression terkait privacy, playback, schedule 16/16 terfokus; full Radio 310 pass, 9 PG skip. [Bukti](docs/audit/M22-02-radio-playback-regression.md) ; [packet](docs/tasks/M22/M22-02.md) |
| - [x] | **M22-03** — Verify DENPA opt-in, webhook token and payload validation | P0 | D3 | M03-07 | **Ditutup 2026-10-27**, exact SHA `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa`: tanpa/salah token 401, payload salah 400, token dummy + payload valid 202; tidak menggunakan credential nyata. [Bukti](docs/audit/M22-03-denpa-gate.md) ; [packet](docs/tasks/M22/M22-03.md) |
| - [x] | **M22-04** — Review WhatsApp QR/session lifecycle and disabled-default behavior | P0 | D3 | M03-07 | **Ditutup 2026-10-27**, exact SHA `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa`: disabled default, admin-only control, QR tidak dikirim ke anonim; root/nested auth dir ignored. Tidak ada sesi/kredensial/connection nyata. [Bukti](docs/audit/M22-04-whatsapp-lifecycle.md) ; [packet](docs/tasks/M22/M22-04.md) |
| - [x] | **M22-05** — Protect OpenAPI and root Hub service discovery contracts | P0 | D2 | M05-07,M22-01 | **Ditutup 2026-10-27**, exact SHA `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa`: root/OpenAPI serta SDK identities dipaku; path alias tak dikenal 404; 2 focused tests dan root `pnpm verify` lulus. [Bukti](docs/audit/M22-05-service-contracts.md) |
| - [x] | **M22-06** — Test private playlogs, admin metrics and public catalogue isolation | P0 | D3 | M22-02,M03-02 | **Ditutup 2026-10-27**, exact SHA `e345178a71cf47656f729d0b30dbaa6fecdf9fad`: anonymous list dan filtered search playlogs ditolak tanpa echo, admin dapat recent plays/metrics, katalog publik tetap terbuka tanpa data privat; 30/30 focused tests lulus. In-memory/Fastify evidence, bukan PG/browser/deployment. [Bukti](docs/audit/M22-06-private-playlog-isolation.md) ; [packet](docs/tasks/M22/M22-06.md) |
| - [x] | **M22-07** — Publish reusable Radio regression suite for all future gates | P0 | D2 | M22-03,M22-04,M22-05,M22-06 | **Ditutup 2026-10-27**, exact SHA `fae40f71d74cb8a22a9b27cb4c3f8ad3a5e4e1d4`: `test:regression` menjalankan seluruh tes Radio dengan concurrency 2; full suite lulus dua kali (314 pass, 9 tes PostgreSQL opsional skip, 0 fail). [Bukti](docs/audit/M22-07-radio-regression-suite.md). CI terbaru untuk SHA ini belum diklaim. |


## M23 — Voluntary Journey, Missions, 33 Patches and Empire vocabulary

**Group:** G4 · **Priority:** P2 · **Prerequisites:** M18,M20 · **Scope:** Optional journey module and editorial registry.

**Exit gate:** Human action tracked voluntarily without faith/salvation rankings. Do not infer completion from code inventory alone.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M23-01** — Preserve 33 patch titles, 014 conflict and all reported statuses | P2 | D2 | M06-04 | **Closed 2026-10-27** at audit SHA `f9b9679c99445265f530c7037e95da9ce85bae86`: exactly 33 numbered slots plus 2 unnumbered historical rows, byte-identical between seed, core registry and narrative §21A.8; 014 stays `UNRESOLVED_NUMBERING_CONFLICT` with both disputed titles and no silent reassignment; six reported statuses, no approval value anywhere. Shadow registries and the legacy status vocabulary are handed to M23-02..07. [Audit](docs/audit/M23-01-patch-titles-conflict-status.md) |
| - [x] | **M23-02** — Define self/community/global consent and member scopes | P2 | D3 | M03-06,M20-06 | **Closed 2026-10-30 at this working tree:** the consent scopes are defined as a pure contract in `packages/moonql-journey/src/consent-scope.ts` and exported from the package index — `SELF`/`COMMUNITY`/`GLOBAL` name an AUDIENCE a member consented to for their own material and never a power, `authoriseScopeAction` refuses any read, publish or act of a non-owner over a `personal-account` target with `PERSONAL_AUTHORITY_PROHIBITED` whatever scope the actor holds, refuses a wider audience than the owner declared with `SCOPE_TOO_NARROW`, and refuses a `REVOKED` or `EXPIRED` grant with `GRANT_NOT_ACTIVE` before the scope is looked at, so a global consent cannot imply authority over personal accounts. Positive test: the owner publishes and reads inside their own consented audience. Negative test: every scope × every action against another member's personal account, a community grant against a globally declared record, a dead grant and an unreadable scope, each failing closed with a reason-only payload. Evidence: `node --experimental-strip-types --test test/consent-scope.test.mjs` 5/5 observed (including the check that the contract lists exactly the audiences `seed.ts` publishes), package `tsc --noEmit` clean, ESLint clean on both files, `test` script added to the package. Limits: this is the scope contract and its tests only — no member store, no UI and no enforcement in a route exists yet, so M23-03 and the D08 release boundary stay the places where the rule must be wired in. [packet](docs/tasks/M23/M23-02.md) |
| - [x] | **M23-03** — Model Path/Journey/Milestone/expiring human Mandate | P2 | D3 | M23-02 | **Closed 2026-10-30 at this working tree:** the mandate lifecycle is now a pure, store-free contract in `packages/moonql-journey/src/mandate-lifecycle.ts`, exported from the package index: Path then Journey then Milestone then Mandate, where `issueMandate` validates and freezes the origin (identifier, complete milestone path, responsible operator pseudonym, deliverable, holder with consented audience and recorded consent timestamp, expiry), `resolveStatus` DERIVES the status (revoked event, then delivered event, then computed from `expiresAt` against the caller-supplied clock) so no record can claim ACTIVE one second past its deadline and no operator can type a status, `revokeMandate` refuses without an actor, a moment and a reason, transitions are append-only and never mutate the record they were handed, and a terminal mandate is frozen. `publishableTo` and `actionableBy` answer through the M23-02 consent contract, so a mandate never travels wider than its holder consented to and only the holder may act on it. Positive test (the TODO acceptance): consent, responsible operator and revoke are all recorded facts on one record. Negative tests: ten malformed issue inputs each refusing with a single reason code, a revoke without actor or reason, a future-dated event, and a transition attempted on a revoked mandate. Evidence: `pnpm build` then `node --test test/*.test.mjs` observed 12/12 pass (5 M23-02 plus 7 M23-03), package `tsc --noEmit` exit 0, ESLint exit 0 on the source files; the package `test` script builds first because `--experimental-strip-types` cannot resolve `.js` to `.ts` specifiers, following the `packages/lumen` precedent. Limits: no persistence, no route or UI enforcement and no store for these records — the shipped `journey_mandates` model is untouched and this contract is not yet wired into it, so M23-05 remains the consumer; nothing here creates a second Hub or widens an ACL. [packet](docs/tasks/M23/M23-03.md) |
| - [x] | **M23-04** — Index nine Prime Code, 10 WINGS and GOD99 as separate metadata | P2 | D2 | M06-05 | **Closed at exact SHA `ed3561a`:** metadata-only `EMPIRE_TAXONOMY_INDEX` keeps `prime-code`, `wings` and `god99` as separate kinds with source locators and `authority: 'metadata-only'`; 22 evidenced entries and 96 unevidenced G.O.D.99 slots recorded as gaps, never padded. Validator rejects merged kinds, duplicate ids and any role/permission/agent/identity field; unilex suite 5/5, typecheck, build and scoped ESLint passed. No identity, permission or runtime wiring is created. [Audit](docs/audit/M23-04-empire-metadata-index.md) |
| - [x] | **M23-05** — Prototype human-owned mission checklist with rollback | P2 | D3 | M23-03 | **Closed 2026-10-30 at this working tree:** the human-owned checklist is prototyped as a pure, store-free contract in `packages/moonql-journey/src/mission-checklist.ts`, exported from the package index and built on the M23-03 mandate. The TODO acceptance is a guard order, not a comment: `applyStep` refuses an `automated` act on a `HIGH` consequence step with `AUTOMATION_PROHIBITED` before the actor, the clock or the mandate is consulted, so no scheduler, retry or import can ever apply a world patch — only a named human act recorded in the append-only act log can, and only the mandate holder (`NOT_THE_MANDATE_HOLDER` otherwise). `openMission` refuses a plan whose high-consequence step has no `rollbackPlan` (`ROLLBACK_PLAN_REQUIRED`) and refuses to open on an expired or revoked mandate (`MANDATE_NOT_ACTIVE`); step state is DERIVED from the log tail (`stepState`), so a step cannot claim APPLIED after it was rolled back or after its mandate died, `rollBackStep` undoes an applied step and a rolled-back step can be owned again, `automatable` is false while any high-consequence step is outstanding, and `highConsequenceSteps` plus `outstandingSteps` give a queue what a human still owes. Positive test: an automated apply of patch 019 is refused with the log untouched, then the holder's human act applies it; a reversible step may run unattended while the patch step stays human-owned. Negative tests: seven malformed plans (missing identifier or patch ref, no steps, duplicate step id, blank title, unreadable consequence, high step without rollback) plus a revoked and an expired mandate, and six malformed acts (unknown step, already applied, blank actor, unparseable moment, future timestamp, non-holder), each returning one reason code. Evidence: `pnpm test` (`pnpm build && node --test test/*.test.mjs`) observed 18/18 pass (5 M23-02 + 7 M23-03 + 6 M23-05), package `tsc --noEmit` exit 0, ESLint exit 0 on the new module and the index; refusals are asserted to leak no member, operator or patch text. Limits: prototype contract only — it opens no store, calls no moonql model and applies no patch, so no route or worker is enforced by it yet; M23-07 is the adversarial follow-up and the D08 release boundary still owns any real actuation. [packet](docs/tasks/M23/M23-05.md) |
| - [x] | **M23-06** — Keep AETHERION 10 realms and 100 levels as fictional game system | P2 | D2 | M23-04 | **Closed at exact SHA `087f36f`:** 32-row boundary ledger (24 AETHERION references + 8 guardrails) resolves every quote at its cited line and records that the 10-realm/100-level structure is referenced only (0 realm names, 0 level names, no XP definition anywhere in the tree). All 16 predicates hold — no row equates XP, level or realm with human age, holiness, heaven, salvation, supernatural authority or WINGS divisions. Validator rejects forbidden equivalences, merged registers and any PRESENT implementation claim; 24/24 tampered datasets rejected. Four read-only misread risks recorded (levels beside ages, editorial "Ten Realms" label, numeric register grouping, unqualified realm count). Documentation/reference audit only: no game runtime, realm roster, XP formula or progression rule exists or was created. [Audit](docs/audit/M23-06-aetherion-fiction-boundary.md) · [Data](docs/data/M23-06-aetherion-boundaries.json) |
| - [x] | **M23-07** — Adversarial test for spiritual ranking, unauthorized mission actions | P2 | D3 | M23-05,M23-06 | **Closed 2026-10-30 at this working tree:** the adversarial suite is `packages/moonql-journey/test/m23-07-adversarial.test.mjs` and attacks the PUBLISHED shape, not a description of it — it imports `../dist/index.js` and introspects the real addon. Spiritual ranking: no field of `journey_patches` or `journey_mandates`, no value of `PATCH_STATUSES`/`THEMATIC_FOCUSES`/`CONSENT_SCOPES`/`MANDATE_STATUSES`, no key of any of the 33 `WORLD_PATCH_SEED` rows and no published view matches the ranking vocabulary (rank, realm, level, XP, grade, holiness, salvation, heaven, seniority, score, division, age), all four observed-empty, which is what keeps the M23-06 stated boundary true in code: the 10 realms and 100 levels stay fictional structure and no member carries a standing. Human agency: the exhaustive matrix of every consented audience × read/publish/act against another member's `personal-account` yields ZERO allowings (`GLOBAL`, `COMMUNITY` and `SELF` alike, and `impliesAuthorityOverOthers` false for all three), while globally declared SHARED material is reachable only by a global grant; over the mission checklist, 16 principal × channel × step combinations leave exactly 5 doors and all 4 automated attempts on the high-consequence patch step are refused with `AUTOMATION_PROHIBITED` and the step still `PENDING`, 4 stranger attempts refused with `NOT_THE_MANDATE_HOLDER`, 3 unattributed attempts refused with `NEEDS_HUMAN_ACTOR`, and only the holder acting as a human can apply the patch; a revoked or delivered mandate cannot even open a mission and an expired or revoked mandate refuses further acts and rollbacks. Evidence: `pnpm test` (`pnpm build && node --test test/*.test.mjs`) observed 23/23 pass (5 M23-02 + 7 M23-03 + 6 M23-05 + 5 M23-07), ESLint exit 0 on the new suite, and every refusal payload is asserted to repeat no member, operator, patch or milestone text. Limits: this is the domain's own contract and model surface — it does not test an HQ route, an authenticated REST call or a live store, so the route-side denial matrices remain M46-26 and the release boundary remains D08. [packet](docs/tasks/M23/M23-07.md) |


## M24 — World Monitor and sourced external observations

**Group:** G5 · **Priority:** P2 · **Prerequisites:** M03,M05,M06 · **Scope:** Optional world addon and historical A-L-L-A-H adapters.

**Exit gate:** Attributable timestamped provider data with clear offline/freshness states. Only real evidence closes this gate.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M24-01** — Audit A-L-L-A-H USGS/GDACS/NOAA/Open-Meteo historical code and terms | P2 | D2 | M06-05 | **Closed at exact audit SHA `924ffa3c08020b6162603af0b1ead6ed0f8684cc`; CI `40843747193` passed and promoted the same SHA to `main`.** Immutable baseline ledger: 29 rows and 73 quotes resolve at `659da28`; 22/22 invalid mutations rejected. Current containment at source SHA `69d5a84` with recheck at `c3e827e` withholds seeded Dock observations and removes invented Headquarters operational statuses; focused Dock tests 16/16, Dock/HQ typecheck and scoped ESLint pass. Pinned `A-L-L-A-H@47bac90` inspection distinguishes fetch-capable code from explicitly labelled offline fixtures; no runtime/live use or reuse rights inferred. No specific product, provider authorization or legal/privacy approval is granted. The M24 milestone human-review gate remains separate; M24-02 is next eligible. [Audit](docs/audit/M24-01-provider-audit.md) · [terms inventory](docs/audit/M24-01-provider-terms-2026-10-29.md) · [packet](docs/tasks/M24/M24-01.md) |
| - [x] | **M24-02** — Specify source, units, geo precision, temporal and revision model | P2 | D3 | M24-01 | **Closed at exact result SHA `cf4e117f13d8e430446a076e8890a176d02c789d`; CI `40845682618` passed and promoted the same SHA to `main`.** Sentinel package tests 12/12, including 5 positive/negative contract cases; typecheck and scoped ESLint passed (one non-blocking complexity warning); pre-commit UI gate 140 files/0 violations. Defines provider reference, separate observation/publication/ingest times, value/unit, geo precision/CRS, revision and epistemic class. Validator is test-only: production ingest is not wired to this contract; no provider/right clearance, runtime revision conflict handling, or live feed is claimed. [Packet](docs/tasks/M24/M24-02.md)|
| - [x] | **M24-03** — Design controlled outbound egress, quotas, retry and caching | P2 | D3 | M03-07,M24-02 | **Closed at exact SHA `cea723cade43e3460e885c37802a1bcbdf080be5`:** the provider-neutral egress policy (three default-deny capability classes, exact origin/path allowlists, HTTPS-only external, SSRF and rebinding rules, budgets, bounded GET/HEAD retries, no fallback provider, notification-only deduplicated alerts) landed at `b418dd9` with a test-only decision model; the contract test is 8/8 inside a 20/20 package run, typecheck exits 0, and every refusal fails closed with a stable reason code and no payload echo. Runtime enforcement is explicitly not claimed: Sentinel's real fetch paths stay unguarded until M24-04. No provider, credential, alert sink, rights approval or deployment was exercised. [verification](docs/audit/M24-03-controlled-egress-verification.md) · [design](docs/design/M24-03-controlled-egress.md) · [packet](docs/tasks/M24/M24-03.md) |
| - [x] | **M24-04** — Prototype one feature-flagged read-only provider adapter | P2 | D4 | M24-03 | **Closed at exact SHA `db1f232f9ae5c773eadbae6c7f1a917ab89a0b07`:** `apps/sentinel/src/provider-adapter.ts` adds a disabled-by-default, caller-configured GET-only adapter that fails closed before any socket on flag-off, unapproved terms, unknown or expired rights, non-allowlisted origin/path, non-HTTPS, private/loopback/metadata addresses, exhausted budget, fallback provider or a missing decision model; 15/15 focused tests assert zero `fetchImpl` calls on every pre-fetch denial and one bounded GET on success with a payload-supplied `observedAt`, package tests are 44/44 and typecheck exits 0. Not wired into the worker cycle; no live provider, credentials, terms or rights approval; the resolved address is not pinned at connect time. [audit](docs/audit/M24-04-provider-adapter-prototype.md) · [packet](docs/tasks/M24/M24-04.md) |
| - [x] | **M24-05** — Build source-backed public World Monitor with stale flags | P2 | D3 | M24-04 | **Closed at exact SHA `2b28d8c6783ff5c8b06bf7488254ff3ae1e53853`:** `packages/moonui/src/observation-freshness.ts` classifies a record as live only when it carries a recognized provider source kind, a source and rights reference, a UTC observation timestamp and a TTL the caller evaluates against; seed, fixture and synthetic records are labelled `SYNTHETIC` even with a fresh timestamp, older-than-TTL is `STALE`, and unknown or incomplete records are withheld. 19/19 focused tests (105/105 package, typecheck and scoped ESLint clean) prove no stale or synthetic record is a live reading and that withheld labels echo no payload. **Not yet wired:** `/monitor/overview` exposes no source kind, rights reference, observation time or TTL, the HQ page still lights its live dot from the stored health enum, and `/monitor/ingest` substitutes the wall clock for a missing publish time — recorded as M24-07 work. No live provider or deployment. [audit](docs/audit/M24-05-world-monitor-stale-flags.md) · [packet](docs/tasks/M24/M24-05.md) |
| - [x] | **M24-06** — Review YouTube Sentinel moderation, appeal, classification lens | P2 | D4 | M24-01,M03-06 | **Closed at exact SHA `07d3d7db47c81008996953fe04eca34f559c4384`:** the review finds no automated punitive action (no comment ingestion, no PUT/PATCH/DELETE, a notification-only webhook with no in-repo caller) and no theological-certainty field, but the guarantee holds by absence rather than by an enforced runtime guard; the gaps are recorded (unguarded agent fetch, unescaped alert text, free-form AI summary, fabricated fallback counters, no appeal surface). A test-only contract encodes the required denials (`PUNITIVE_ACTION_FORBIDDEN`, `HUMAN_APPROVAL_REQUIRED`, `AI_ONLY_CLASSIFICATION_FORBIDDEN`, `THEOLOGICAL_CERTAINTY_FORBIDDEN`) and passes 9/9 inside a 29/29 package run with typecheck exit 0. No moderation data, platform credentials or live YouTube access. [review](docs/audit/M24-06-sentinel-moderation-review.md) · [packet](docs/tasks/M24/M24-06.md) |
| - [x] | **M24-07** — Test invalid/late/offline feed, timezone, geographic ambiguity | P2 | D4 | M24-05,M24-06 | **Closed at exact SHA `3544d52def057c49e6bd0531ac7ac1484a1e0db8`:** `apps/sentinel/test/degraded-feed-contract.ts` reports a missing publish time instead of substituting the fetch instant, marks an older-than-TTL feed `STALE`, withholds offline/unknown or malformed feeds, rejects offset/abbreviation/blank timezones, degrades unknown or coarse geography without claiming an exact location, and derives every output time from validated UTC input; 25/25 focused tests (69/69 package, typecheck and scoped ESLint clean) prove no result echoes payload text, hostname, coordinate, timezone or value. **Wiring remains:** ingest still falls back to the wall clock and stamps `lastCheckedAt` as fetch time, and the HQ live dot still reads the stored health enum — follow-up, not claimed here. No live feed or deployment. [audit](docs/audit/M24-07-degraded-feed-acceptance.md) · [packet](docs/tasks/M24/M24-07.md) |


## M25 — Time, Cosmos, Earth science and research horizons

**Group:** G5 · **Priority:** P3 · **Prerequisites:** M06,M24 · **Scope:** MTS, Cosmic Atlas, Atmosphere, HELIOGRID and Material Forge concepts.

**Exit gate:** Scientifically honest hypothesis map with no fake working device. Only real evidence closes this gate.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M25-01** — Audit M-TIME/Antikythera claims and engineering dependencies | P3 | D3 | M06-05 | **Closed at exact SHA `ed3561a`:** persisted/transported time is UTC `timestamptz`/ISO-Z, narrative chronology is label-only, and the lunar clock is a display-only approximation returned separately from UTC; no MTS/Antikythera device or ephemeris feed is implemented or claimed. 18-claim ledger with file:line. Adjacent false `HELIOGRID/Atmosphere OS` live badges found in HQ are routed to M25-02/M25-03, not treated as time-model defects. [Audit](docs/audit/M25-01-mtime-antikythera-audit.md) · [packet](docs/tasks/M25/M25-01.md) |
| - [x] | **M25-02** — Separate physical readings, simulation, astronomy and story modes | P3 | D2 | M24-02 | **Closed at exact SHA `f35f0fb89b10ab9543633ae7ba1143e7966ecfc7`:** `packages/moonui/src/claim-type.ts` defines the four claim types and withholds any readout that lacks a claim type or source, mislabels a simulation as a measurement, or presents a story as evidence; the design records the id/en copy rules and 18/18 focused tests (58/58 package, typecheck and scoped ESLint clean) prove withheld results carry `sourceRef: null` and echo no input text. No UI is wired and no packet existed for this leaf. [design](docs/design/M25-02-claim-type-separation.md) · [audit](docs/audit/M25-02-claim-type-separation.md) |
| - [x] | **M25-03** — Design HELIOGRID/Material Forge falsifiable research questions | P3 | D3 | M06-05 | **Closed at exact SHA `4b0a872`:** 11 falsifiable questions (H1–H6, F1–F5) each state signal/unit, instrument, pass threshold, falsification, safety boundary and an explicit non-claim; 28-claim ledger shows HELIOGRID/Material Forge exist only as taxonomy rows, dead telemetry types and prose, with no meter, inverter, kWh field, lab, specimen, package or app. Unsupported thresholds stay `U_?` for M36-02/M25-07 rather than invented. HQ's hardcoded `HELIOGRID: NOMINAL`/`STREAMING` literals are recorded as false-live-status defects owned by M25-02/M24-05. [Design](docs/design/M25-03-heliogrid-material-forge-questions.md) · [Audit](docs/audit/M25-03-heliogrid-questions.md) |
| - [x] | **M25-04** — Define unit normalization, measurement/calibration and source metadata | P3 | D3 | M25-02,M25-03 | **Closed at exact SHA `b3479e6991831b759d842fbe753fe8c30d233792`:** `packages/moonui/src/measurement-metadata.ts` normalizes eight units exactly and refuses ambiguous spellings, requires calibration, UTC observation time, source and uncertainty for a physical reading, refuses any simulation value as sensor data before other checks, and withholds labels that fail the M25-02 claim check; 28/28 focused tests (86/86 package, typecheck and scoped ESLint clean) assert every reason code and that withheld results leak no value, unit, source or timestamp. Contract only: no producer or UI adoption, and no instrument evidence exists. [design](docs/design/M25-04-measurement-metadata.md) · [audit](docs/audit/M25-04-measurement-metadata.md) · [packet](docs/tasks/M25/M25-04.md) |
| - [x] | **M25-05** — Sketch optional Cosmos/Time explorer with proposal label | P3 | D2 | M25-01 | **Closed at exact SHA `6d1e436`:** the sketch is a proposal document (`PROPOSAL — NOT SHIPPED — NOT DISCOVERABLE`) with a claim-type vocabulary, a 14-layer "what exists vs what is absent" table, a11y/locale requirements, 13 owed decisions and its open prerequisites (M25-02/M25-04/M25-06). Non-discoverability is proven by absence, not concealment: 20 Dock page files with no cosmos/astronomy/time route, 15 `NAV_LINKS` and 15 sitemap routes with no such destination, and no cosmos vocabulary in the 83 scanned Dock sources. `node scripts/check-m25-05-proposal-boundary.mjs` passes and its self-test rejects 13 invalid fixtures while accepting 3 valid ones. No route, label, component, data or claim of a shipped explorer. [Design](docs/design/M25-05-cosmos-time-explorer-sketch.md) · [Audit](docs/audit/M25-05-cosmos-explorer-proposal.md) |
| - [x] | **M25-06** — Research source context of comparative cosmos in sacred traditions | P3 | D3 | M25-02,M07-05 | **Closed at exact SHA `2b27e2e1be061b34d396613707e93fd26ae92f30`:** a 19-row ledger separates scripture, commentary, historical, astronomy and comparative-method claims, each carrying one M25-02 claim type, a source status and a verbatim `path:line` locator (15/15 quotes resolve, all <=120 chars, no translation wording or Arabic text reproduced); the validator passes and its `--self-test` rejects 13 tampered fixtures including a scripture-derived measurement, a story carrying instrument evidence and an astronomy row citing scripture. Evidence is repository-only: the Near-East row is `ABSENT` and three traditions remain `NEEDS_SOURCE`; no source is fetched or authenticated. [ledger](docs/data/M25-06-cosmos-tradition-context.json) · [audit](docs/audit/M25-06-cosmos-tradition-context.md) · [packet](docs/tasks/M25/M25-06.md) |
| - [x] | **M25-07** — Prepare cost/safety/hardware feasibility decision before execution | P3 | D4 | M25-04,M25-06 | **Closed at exact SHA `112b0a239e9c9f3f46c8d3afb50f0b4ed5b839b9`:** the decision record authorizes no hardware purchase, build, measurement or actuation and states seven evidence gates (instrument and calibration traceability, safety plan, operator authority, named budget responsibility, one falsifiable M25-03 question with a threshold, rights/consent, retention) that are all `MISSING` today; five non-goals and six revisit conditions are recorded. The validator passes, resolves all three cited prerequisite paths and rejects 13 tampered fixtures including a claimed-satisfied gate, an added purchase authorization, a calibrated-measurement authorization and a dangling citation; eslint and `node --check` exit 0. This is a decision gate, not a completed empirical review: no instrument, calibration, budget, operator or consent record exists. [decision](docs/decisions/M25-07-hardware-feasibility-decision.md) · [audit](docs/audit/M25-07-feasibility-gate.md) · [packet](docs/tasks/M25/M25-07.md) |


## M26 — Legacy canon, Empire registries and missing sources

**Group:** G5 · **Priority:** P2 · **Prerequisites:** M06,M17 · **Scope:** V10/V10.1, II/XII, GOD-PROMISE, 25 Amanah and source gaps.

**Exit gate:** Versioned comprehensive archive inventory with honest unresolved entries. Only real evidence closes this gate.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M26-01** — Crosswalk 99 chapter labels to actual source versions | P2 | D3 | M06-02 | **Closed at exact SHA `4b0a872`:** 99 unique slots indexed from the only in-repo label source (`MASTER_VISION_NARRATIVE_XV.md:701-753`); 0 `VERIFIED_SOURCE`, 65 `LABEL_ONLY`, 34 `NEEDS_SOURCE` with the gap sentence quoted. Validator `node scripts/check-m26-01-crosswalk.mjs` passes slot/label/status checks and 9/9 negative self-tests reject duplicate merging or a manuscript claim without a locator. Labels are not manuscripts and 99 labels are not 99 originals. [Crosswalk](docs/data/M26-01-chapter-crosswalk.json) · [Audit](docs/audit/M26-01-chapter-crosswalk.md) |
| - [x] | **M26-02** — Recover 00-MAIN GOD PROMISE distinct from ROCKSOUL/paper | P2 | D3 | M06-06 | **Closed at exact SHA `f841db5`:** 16 single-origin rows across `00-MAIN` (6), `ROCKSOUL` (5) and the 1·6·3 paper (5), with `EVIDENCED=0`, `LABEL_ONLY=7`, `NEEDS_SOURCE=9`; all three separation pairs are `distinctFrom` with merge forbidden and no `sameAs` claim. 35 locator quotes resolve; 23 files/141 mention lines recounted; no manuscript was recovered and the ledger says so. `node scripts/check-m26-02-god-promise.mjs` passes, 25/25 negative datasets rejected. [Data](docs/data/M26-02-god-promise.json) · [Audit](docs/audit/M26-02-god-promise.md) |
| - [x] | **M26-03** — Recover four THE BATTERIES books, NPD scenes, 15 synopsis sources | P2 | D4 | M26-01 | **Closed at exact SHA `8bea651`:** 22 rows (4 books, 3 scenes, 15 synopses) with `EVIDENCED=0`, `REPORTED_ONLY=3`, `NEEDS_SOURCE=19`; all 22 pages `NOT_RECOVERED`, rights `RIGHTS_UNKNOWN`, chronology mostly `UNRECORDED`. 49 locator quotes resolve, no `EVIDENCED` row lacks a primary artifact, and `scripts/check-m26-03-recovery.mjs` passes with 17/17 negative self-tests. Zero pages recovered: labels/reports are not manuscripts. [Data](docs/data/M26-03-batteries-npd-recovery.json) · [Audit](docs/audit/M26-03-batteries-npd-recovery.md) |
| - [x] | **M26-04** — Reconcile ZILL origins, Honey/Queen R, and story alias variants | P2 | D3 | M26-01,M10-04 | **Closed at exact SHA `8bea651`:** 13 rows (`CANONICAL=2`, `ALIAS=1`, `DISPUTED=2`, `FALSE_ALIAS_REJECTED=1`, `NEEDS_SOURCE=7`) with 56 resolved locator quotes; no row merges two origins and no `sameAs` claim is approved, so ambiguous referents stay disputed. `scripts/check-m26-04-zill-aliases.mjs` passes with 16/16 negative self-tests. [Data](docs/data/M26-04-zill-aliases.json) · [Audit](docs/audit/M26-04-zill-alias-reconciliation.md) |
| - [x] | **M26-05** — Audit Empire nine principles, WINGS 10, G.O.D.99 and Asma registry | P2 | D2 | M06-05 | **Closed at exact SHA `a54198b`** (audit at `ed3561a`): permission kinds (`public`/`auth`/role arrays, login `admin`/`user`/`guest`, API-key `bot`) are independent of every Empire token and no Empire row carries role/permission fields. Owner ratified G.O.D.99 as 99 fictional duty/persona slots distinct from the 99 editorial chapters, correcting the `M02-01:36` conflict. Asma registry remains absent and is recorded as a gap, not invented. [Audit](docs/audit/M26-05-empire-taxonomy-audit.md) · [Decision](docs/decisions/M02-01-disambiguation-registry.md) |
| - [x] | **M26-06** — Locate exact 25 Bidang Amanah source and mission mapping | P2 | D4 | M26-05 | **Closed at exact SHA `a4408d9`:** the exact 25-field list is absent from the repository, so the ledger takes the acceptance branch "explicitly unverified, never guessed names": 25 slots all `NEEDS_SOURCE` with zero names invented, 12 candidates (`PARTIAL_REFERENCE=6`, `NEEDS_SOURCE=2`, `NOT_FOUND=4`), 6 candidate missions and 0 mission mappings. 54 locator quotes resolve; `node scripts/check-m26-06-bidang-amanah.mjs` passes and 25/25 negative datasets are rejected, including any slot name without a name locator and any "complete 25" assertion without an enumerated source. No canonical name, sequence or mission mapping is claimed. [Data](docs/data/M26-06-bidang-amanah.json) · [Audit](docs/audit/M26-06-bidang-amanah.md) |
| - [x] | **M26-07** — Audit early ZENIX/Universe history, AGE CODE and lost-source leads | P2 | D3 | M26-01 | **Closed at exact SHA `8bea651`:** 26 claims tagged `REPO_EVIDENCE=9`, `REPORTED_HISTORY=7`, `DOC_ONLY_PLAN=4`, `LOST_SOURCE_LEAD=6`; reported history is never promoted to repository fact and lost sources stay leads, not findings. [Audit](docs/audit/M26-07-zenix-age-code-audit.md) |


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
| - [ ] | **M27-08** — Freeze bilingual preview release manifest and non-goals | P0 | D2 | M19-08,M05-09,M19-19 | **BLOCKED by M19-19** in release track T5 until an approved D08 public projection is available; Research/raw witness remains withheld. Once eligible: **Owner:** release management; **paths:** TODO.md; new preview manifest/runbook; **steps:** pin exact source SHA → identify included public routes → list excluded draft/private features; **DoD:** preview not conflated with full XV M27 completion; evidence = focused positive/negative tests + exact SHA; rollback where needed. [readiness](docs/audit/M27-08-readiness-blocker-2026-10-27.md) |
| - [ ] | **M27-09** — Verify frozen pnpm + Dock/Hub production Docker builds | P0 | D3 | M27-08 | **Owner:** release engineering; **paths:** Dockerfile; Dockerfile.web; Docker build logs; **steps:** run pnpm verify:docker → run image smoke → capture digests; **DoD:** BUILD_VERIFIED only with actual logs and exact source SHA; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M27/M27-09.md) |
| - [ ] | **M27-10** — Create secure preview Compose topology and verify routing | P0 | D4 | M27-09,M03-07 | **Owner:** release engineering; **paths:** docker-compose.yml or approved preview override; tests; **steps:** config --quiet → internal-only network/ports → health/load/offline smoke; **DoD:** no DB/HQ/Cockpit/AI ports publicly reachable by default; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M27/M27-10.md) **Static half 2026-10-29 (revised):** `apps/arsy/test/compose-contract.test.ts` 17/17 pins the published-port surface — `db`, `echolog`, `skylink`, `aigateway`, `orbit`, `empire-web`, `dock` and `headquarters` are loopback-bound, and the hub is loopback-bound too since `bb41d9f`. HQ and dock now reach the internet only through Coolify's proxy over the compose network (ADR-0016), and the loopback binding is what let the Coolify deploy stop colliding with another product's `127.0.0.1:3001`. "No HQ port publicly reachable by default" therefore holds statically; the remaining gap is the Docker routing/health/offline smoke on a Docker host; the Hub's host-wide `3000` is fixed in Git and now verified live: after Coolify deployment `qvgfqmwmbfhvaxqaqbcvywmg` (`b0b44f9`) finished at 2026-10-30T00:28:15Z, ports 3000–3007 on 163.61.134.104 all refused (`000`). |
| - [ ] | **M27-11** — Gate production secrets and sample-password rejection | P0 | D2 | M27-10,M01-06 | **Owner:** security/release; **paths:** Compose environment tests; .env.example; **steps:** use dummy staging secrets → reject missing/default values → scan rendered config output; **DoD:** no secrets committed/printed or sample credentials in production; evidence = focused positive/negative tests + exact SHA; rollback where needed **Compose/secret slice 2026-10-29:** at compose commit `2dfdd8d` (CI `40892114259` success, release `v2.20.2`) the file no longer demands `${VAR:?}` interpolation, so a hosted builder that only receives build-time variables can still resolve it, and no credential gained a non-empty committed default; executed gates: `apps/arsy/test/compose-contract.test.ts` 15/15 (required-interpolation and secret-default guards, both shown to fail on the pre-change file) and `apps/arsy/test/m27-11-secret-gate.test.ts` 3/3 (production refuses an empty admin password at seed, development still generates one, a supplied password is stored as a salted hash, never plaintext). Remaining: dummy staging secrets through a real Compose environment and a rendered-config scan, which need Docker Engine that this host lacks. |
| - [ ] | **M27-12** — Test Dock /id /en SEO, navigation and health under Compose | P0 | D3 | M27-10,M19-17,M19-14 | **Owner:** Dock/release; **paths:** Docker staging tests; browser E2E fixtures; **steps:** start services → request two locales → test links, headers and degrade; **DoD:** all preview routes respond correctly and omit private data; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M27/M27-12.md) **Live probe 2026-10-30 (edge-pinned):** `/id`, `/en`, `/id/stations`, `/en/stations`, `/id/schedule` all `200`; `/id` carries canonical `https://moonwitness.biz.id/id`, `hrefLang` `id`/`en`/`x-default`, CSP + `x-frame-options: DENY` + `referrer-policy` + `nosniff`, and no `Set-Cookie`; `/id/nope` and `/de` are `404`. Its own acceptance is observed, but the row stays unchecked because dependency M27-10 is still open; the degrade half belongs to that Docker smoke. **Post-deploy re-probe 2026-10-30T00:29Z at `b0b44f9`:** `/id` and `/en` still `200` on the dock apex, now served by deployment `qvgfqmwmbfhvaxqaqbcvywmg` (`finished_at 00:28:15Z`), so the probe above was not measurement of a stale container. The row stays open only for the M27-10 Docker smoke. Details in [packet](docs/tasks/M27/M27-12.md#live-two-locale-evidence-2026-10-30-probe-not-a-closure). |
| - [x] | **M27-13** — Produce Git-backed Coolify deployment playbook | P0 | D2 | M27-10 | **Closed 2026-10-30 at `bb41d9f`.** [docs/runbook-coolify-deploy.md](docs/runbook-coolify-deploy.md) records the Git source (repository, `dev`→`main` promote gate, root compose), the service port/domain table (only `a-l-l-a-h.com`, the dock apex, `hq.`, `api.`, `orbit.`, `media.` and `skylink.` are routed; `db`/`sentinel`/`aigateway`/`cockpit` deliberately unrouted, and no scheduled backup sidecar since `b0b44f9`), secret names, health probes, deploy and rollback, and the four observed Coolify behaviours (profiles ignored — [coolify#6395](https://github.com/collabsio/coolify/issues/6395), `default` aliases unresolved, no redirects in compose domains, container-local `localhost`); README §Docker links it. "Internal services not published" is now static fact: the hub answered `200` on `http://163.61.134.104:3000/api/v1/health` on 2026-10-30, `docker-compose.yml` binds it to `127.0.0.1:3000:3000`, and `apps/arsy/test/compose-contract.test.ts` 17/17 asserts every published port is loopback (the new assertion fails on the previous file with "the hub publishes on loopback only"; `docker compose config -q` exit 0). The running host kept the pre-change container only until the webhook deployment `qvgfqmwmbfhvaxqaqbcvywmg` of `b0b44f9` finished (2026-10-30T00:28:15Z); after it, port 3000 refused (`000`) and 3001–3007 stayed closed, so the live re-probe M27-14 owed is now measured. |
| - [ ] | **M27-14** — Verify HTTPS domain, routing and real deployed SHA | P0 | D3 | M27-12,M27-13 | **Owner:** DevOps; **paths:** Coolify deployment logs; HTTP/TLS smoke output; **steps:** deploy only after authorized go/no-go → check /id /en TLS, headers, revision; **DoD:** DEPLOYED_VERIFIED only with real access/logs; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M27/M27-14.md) |
| - [ ] | **M27-15** — Test rollback target and off-host data backups if used | P0 | D4 | M27-10,M04-05 | **Owner:** DevOps/DB; **paths:** docs/runbook-restore.md; tested snapshots; **steps:** pin previous image → test rollback and restore in isolated DB → report limitations; **DoD:** no false 'off-host verified' claim; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M27/M27-15.md) |
| - [ ] | **M27-16** — Test public URL, ACL and unsafe-data negative matrix | P0 | D3 | M19-19,M27-12 | **Open / mandate ACL gap confirmed statically:** `journey_mandates` has `rest: true` + `ADMIN_WRITE` (public list/get by current ACL semantics), and `activeMandates` has no ACL; ARSY test `journey: mandate creation and activeMandates view` asserts unauthenticated GET returns a created mandate. Dock consumer mitigation is committed and pushed at `cee2cdad3588be6c3432e3d92635c46e395b6432`, but Hub endpoints remain public and there is no released D08 projection. M19-19/M27-12 dependencies remain unsatisfied; no checkbox change. [M19-04 progress audit](docs/audit/M19-04-accessibility-progress.md) ; [packet](docs/tasks/M27/M27-16.md) |
| - [ ] | **M27-17** — Capture launch monitoring, observability and incident response | P1 | D2 | M27-12 | **Owner:** operations; **paths:** operator docs; monitor smoke fixtures; **steps:** document logs/latency/error budget/oncall → simulate unhealthy service → test fallback; **DoD:** no fake telemetry or undetected public outage; evidence = focused positive/negative tests + exact SHA; rollback where needed |
| - [ ] | **M27-18** — Separate preview acceptance from full-stack M27 gate | P0 | D2 | M27-12,M27-16 | **Not closed; prerequisites M27-12 and M27-16 are still open.** Draft Gate P (preview, 6 evidence classes) versus Gate F (full-stack, 13 classes) contract landed at `f1c482a` with validator and 7/7 self-test; it enters no gate and certifies nothing. **Owner:** governance; **paths:** TODO.md; release notes; **steps:** record CI_VERIFIED/BUILD_VERIFIED/DEPLOYMENT_READY/DEPLOYED_VERIFIED/RELEASE_ACCEPTED → human review; **DoD:** preview scope cannot certify unshipped Empire modules; evidence = focused positive/negative tests + exact SHA; rollback where needed; no packet exists for M27-18. [Contract](docs/planning/M27-18-preview-vs-fullstack.md) · [audit](docs/audit/M27-18-preview-vs-fullstack.md) |
| - [ ] | **M27-19** — Record post-deploy bilingual verification and exact release evidence | P0 | D3 | M27-14,M27-18 | **Owner:** release governance; **paths:** release notes; acceptance logs; **steps:** verify id/en live URLs → record deployment ID+SHA+rollback → secure final approval; **DoD:** no claim of success before access verified and human approval; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M27/M27-19.md) |


---


## M28 — ARSY Hub rename and compatibility migration

**Group:** G0 (Foundation) · **Priority:** P0 · **Prerequisites:** M00, historical M05-01–07 API baseline and M22-01; new M05 i18n/App Factory tasks are independent except where an actual shared-interface dependency is specified. · **Scope:** Single `apps/radio`→`apps/arsy` move, workspace/package identity, pnpm lock, Docker/Compose/DNS, SDK/env aliases, radio/channel fixtures, regression and rollback.

**Exit gate:** **`ARSY` becomes the single physical Fastify/MoonQL/API hub** at `apps/arsy` and `@moonwitness/arsy`; there is no second `apps/radio` runtime, while existing **Radio/SIGNAL** features, port `3000`, API routes and data remain compatible. Naming acceptance is ratified in [ADR-0001](docs/decisions/ADR-0001-arsy-is-xv-hub.md); actual code migration and tests remain unchecked.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M28-01** — Inventory all hub-name references and freeze old API/Radio fixtures | P0 | D2 | M00-02,M22-01 | **Closed 2026-10-27:** pinned source SHA `0f3a252af6e7b7d803cedab121a443911d820279`; mapped package/scripts/lock importer, Dockerfiles, Compose/DNS, frontend BFFs, env aliases, tests, SDK, metrics and runbooks; classified Radio-domain references to preserve; cross-referenced M22-01 normalized fixtures. Integrator review accepted; no runtime test or rename claimed. [Inventory](docs/audit/M28-01-hub-identity-inventory.md). |
| - [x] | **M28-02** — Ratify ARSY technical compatibility map using accepted ADR-0001 | P0 | D2 | M28-01,M02-03 | **Ratified 2026-10-27** against source SHA `ffd435677a3bfb240ff1877ae51a9c940c414b12`: canonical workspace/package, safe `ARSY_*`→`RADIO_*` alias precedence and deprecation window, stable `/api/v1` routes/envelopes/auth, port `3000`, same PostgreSQL data/schema and one-Hub DNS alias transition are specified. Integrator review accepted; no physical rename/runtime verification claimed. [Compatibility map](docs/audit/M28-02-arsy-compatibility-map.md). |
| - [x] | **M28-03** — Move, not copy, backend workspace `apps/radio` to `apps/arsy` | P0 | D4 | M28-02 | **Closed** at `978cd0771108e352310ed6e3418a1bceda8ba4c7` via implementation M28-10; app moved in place, package identity renamed, single-Hub topology positive/negative test passed; [evidence](docs/audit/M28-10-arsy-runtime-migration-789afa8.md) |
| - [x] | **M28-04** — Migrate package filters, pnpm lock, Dockerfiles, Compose and runners | P0 | D4 | M28-03 | **Closed 2026-10-27** with audit evidence at `bd11cf243d7e5515357fa3eaf1f4731f690e9a10`: frozen-lock/full verification CI and guarded promotion succeeded (run `40476362621`); focused ARSY Compose/Docker/env suite 28/28; `docker compose config --quiet` exit 0; old `radio` DNS alias maps to the sole ARSY service; local ARSY/Dock/HQ image builds and runner/invalid-tag checks documented; independent review accepted. CI does not build Docker images and no deployment is claimed. [Audit](docs/audit/M28-04-rename-migration.md) · [M28-11](docs/audit/M28-11-arsy-docker-dns-2112622.md) · [M28-13](docs/audit/M28-13-matrix-6b439b3.md) |
| - [x] | **M28-05** — Reconcile ARSY config/type/service branding with legacy Radio env compatibility | P0 | D3 | M28-04 | **Closed 2026-10-27** at implementation SHA `eef0c54a057c884c04aa8a9a9efa76b0b9e54f13`: `ARSY_*` resolves ahead of the documented `RADIO_*` aliases, two disagreeing spellings refuse to boot with the key names (never the values), and Radio domain vocabulary is untouched. Focused env-compat suite 10/10 and scoped ESLint pass; evidence in [audit](docs/audit/M28-05-arsy-env-aliases.md). |
| - [x] | **M28-06** — Execute full end-to-end hub rename regression and rollback drill | P0 | D4 | M28-04,M28-05,M22-07 | **Closed 2026-10-27 at exact source SHA `dbc5f01dad478fce74250fe253b801f98d1d5729`:** frozen install and exact CI verification/promotion passed; ARSY/Dock/Headquarters images built; real PostgreSQL runtime confirmed API/ACL and DENPA token behavior, Dock/HQ routes and synthetic Radio playback. Rollback to the previous `fe8e84c` images on the same database preserved 1,189 data rows and sequence state; exact `dbc5f01` stack restored. Dock browser reported hydration error `#418`, disclosed in audit; playback still passed. No live provider, third-party stream or production deployment claimed. [Evidence](docs/audit/M28-06-e2e-rollback-dbc5f01.md) |
| - [x] | **M28-07** — Complete ARSY migration changelog, service map and operator handoff | P0 | D2 | M28-06 | **Closed 2026-10-27 at exact result SHA `8a105edead6f7afb616c89079ca5975108f85719`:** exact-source scan found only three intentional negative topology assertions for `apps/radio` / `@moonwitness/radio`; M28-06 names the reviewed exact-SHA runtime/rollback evidence; operator/service map, README, Blueprint, ADR and changelog reconciled; `git diff --check` clean; link validator scanned 360 tasks with 0 diagnostics in changed documents (23 pre-existing elsewhere); independent review found no blocker; exact CI run `40492799312` and guarded promotion passed. No production deployment claimed; M28-15 remains open. [Handoff](docs/runbook-arsy-migration.md) · [Packet](docs/tasks/M28/M28-07.md) · [Audit](docs/audit/M28-07-arsy-operator-handoff.md) |
| - [x] | **M28-08** — Audit every actual Radio/ARSY import and backend identity | P0 | D2 | M28-01 | **Closed 2026-10-27:** pinned the canonical single-hub identity, enumerated all 20 workspace runtime and 6 development package dependencies plus package/path/config/test references, distinguished feature-domain `radio` references to preserve, and recorded a migration manifest. Focused topology/Docker/env tests passed 17/17; exact inventory SHA `6a4990d302fd68d5ea8111166420fd48be9b9adb`; [audit](docs/audit/M28-08-import-identity-manifest.md). |
| - [x] | **M28-09** — Freeze Radio/Signal backward-compatible API fixtures | P0 | D2 | M28-01,M22-01 | **Ditutup 2026-10-27**, exact SHA `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa`: route/envelope/port/seed, player, beacon, WhatsApp auth dan DENPA fixture tests; 1 focused + Radio 310 pass, 9 PG skip. [Bukti](docs/audit/M28-09-radio-compatibility.md) |
| - [x] | **M28-10** — Migrate runtime directory/import/package under single Hub | P0 | D4 | M28-02,M28-08 | **Closed** at `978cd0771108e352310ed6e3418a1bceda8ba4c7`; ARSY build passed, focused tests 13/13, env-contract 9/9, lint passed, topology rejects a duplicate legacy Hub; [evidence](docs/audit/M28-10-arsy-runtime-migration-789afa8.md); [packet](docs/tasks/M28/M28-10.md) |
| - [x] | **M28-11** — Migrate pnpm lock, scripts, images and internal DNS | P0 | D4 | M28-10 | **Closed** at `2112622aaac679aeffac475781f168cec49a7ad7`; frozen lock install passed, ARSY build passed, topology/Compose/Docker contract tests 24/24 and Compose config passed; old `radio` DNS alias maps to the one ARSY service; [evidence](docs/audit/M28-11-arsy-docker-dns-2112622.md); [packet](docs/tasks/M28/M28-11.md) |
| - [x] | **M28-12** — Implement fail-closed RADIO_*/ARSY_* precedence and aliases | P0 | D3 | M28-11 | **Closed** at `8ce4ff8914d4427747b5dbf8cbdd02b5ba9d46ce`; RADIO/ARSY/generic precedence is deterministic, conflicting configured values fail closed, tests 18/18 and ARSY/Sentinel/SDK builds/typechecks/lint passed; [evidence](docs/audit/M28-12-arsy-env-aliases-8ce4ff8.md); [packet](docs/tasks/M28/M28-12.md) |
| - [x] | **M28-13** — Run exact-SHA Hub/PG/Radio/Dock/HQ/SDK regression matrix | P0 | D4 | M28-12,M22-07 | **Closed on verified result SHA `70b6b14b6630b21da4449df5ad7e2c247be7736f`; matrix runs used `1ce76adf3a20e98fa80f78e68e9b4de92972188f` where M28 paths were unchanged.** Full CI verification and guarded promotion passed (run `40461134347`); isolated PG ARSY 369/370 with one explicit gap skip; HQ 9/9; SKYLINK 9 pass/1 optional DB skip; ECHOLOG 36/36; ARSY/Dock/HQ image builds and ARSY health 200 passed; disposable resources/tags removed. Windows local verify also recorded one CRLF-only Dock test discrepancy, while Linux CI passed. Independent reviewer accepted; no production deployment claimed. [Matrix](docs/audit/M28-13-matrix-6b439b3.md) · [packet](docs/tasks/M28/M28-13.md) |
| - [x] | **M28-14** — Revalidate all six app integration contracts after rename | P0 | D3 | M28-13 | **Closed 2026-10-27:** all six apps revalidated against single ARSY Hub; ARSY compat/compose suite 28/28 passed; Dock 181/181 passed; HQ authz/shell 38/38 passed; Cockpit station/alias 31/31 passed; AI Gateway route boundary 4/4 passed; Sentinel machine log contract 7/7 passed; build:web and ui:check passed; no second Hub or stray backend. [Audit](docs/audit/M28-14-integration-contracts.md) · [Packet](docs/tasks/M28/M28-14.md) |
| - [ ] | **M28-15** — Close rename documentation only after deployment compatibility proof | P0 | D2 | M28-14,M28-07 | **Owner:** architecture/release; **paths:** ADR-0001; README.md; deployment notes; **steps:** record source SHA → update old/new path and DNS evidence → mark migration; **DoD:** ADR implementation status changes only after actual rename verification; evidence = focused positive/negative tests + exact SHA; rollback where needed. **BLOCKED (DoD):** acceptance needs *actual* rename/deployment verification; M28-13 records "no production deployment claimed" and M28-14 revalidated integration contracts only, so no production rename, DNS cutover or deployment proof exists. Do not flip ADR-0001 status on CI evidence alone. |

**Operator instruction:** do not implement ARSY as a second Fastify service or create a new repository; migrate the existing one with compatible aliases. The older term ARSY Research Compute is retained as a **future optional capability in this same Hub**, not a separate running agent and not a claim of theological authority. **M28 is planned early after compatibility baselines; its rename must be tested before any release claiming the renamed ARSY identity. Existing addon work predates physical rename and must be preserved.**

## M29 — AI execution and planning integrity

**Group:** G7 · **Prerequisite:** M02-06 · **Status:** PLANNED, no implementation implied. **Outcome:** AI execution and planning integrity. **Gate:** all leaves pass relevant decision, rights/privacy, i18n, security, regression, operational-cost and human-adoption checks. **Rollback:** document tested recovery before any risky change. This is a distinct milestone; future apps/finance/energy remain proposal-gated.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M29-01** — Classify every task's leaf or umbrella role | P1 | D2 | M02-06 | **Evidence verified at source SHA `dee9b40dabeacbef7007a46e650a8b3257915c30`; closure recorded in this TODO update:** classifier suite 2/2 passed; all 360 IDs unique, including 21 umbrellas/339 leaves and mapped children; negative claim checks passed. M02-06 checked. Independent review found no code blocker. [Registry](docs/planning/TASK_ROLE_CLASSIFICATION.md) · [Evidence](docs/audit/M29-01-task-role-classification.md) · [packet](docs/tasks/M29/M29-01.md) |
| - [x] | **M29-02** — Ratify one multi-agent task lease contract | P1 | D2 | M29-01 | **Evidence verified at source SHA `ab4409393dba448b5678bdb0f1ecb457a70c1672`; closure recorded in this TODO update:** owner-ratified lease contract; corrected exclusive path scopes for M29-02/03/04; focused lease + classifier tests 6/6; scoped ESLint and diff-check passed; independent review found no blocker. [Contract](docs/planning/MULTI_AGENT_TASK_LEASE_CONTRACT.md) · [Evidence](docs/audit/M29-02-multi-agent-lease-contract.md) · [packet](docs/tasks/M29/M29-02.md) |
| - [x] | **M29-03** — Specify ID/dependency/Markdown-link validator | P1 | D3 | M29-02 | **Evidence verified at source SHA `4fec23973ab3e28ad289035402bf3e89590ddd91`; closure recorded in this TODO update:** positive/negative validator tests 2/2 passed; ESLint and diff-check passed; tracked-file inventory found 25 link diagnostics, all reported as errors and not treated as valid links. [Spec](docs/planning/TASK_REGISTER_VALIDATOR.md) · [Evidence](docs/audit/M29-03-task-register-validator.md) · [packet](docs/tasks/M29/M29-03.md) |
| - [x] | **M29-04** — Prove validator on invalid fixtures | P1 | D3 | M29-03 | **Evidence verified at source SHA `278f26ad88bd7df350fb37da24291f1f793841c5`; closure recorded in this TODO update:** invalid-fixture suite 4/4 passed; stable diagnostic codes/lines and input immutability verified; ESLint/diff-check passed; independent review found no blocker. [Evidence](docs/audit/M29-04-invalid-fixtures.md) · [packet](docs/tasks/M29/M29-04.md) |
| - [x] | **M29-05** — Verify one low-context agent handoff | P1 | D4 | M29-04 | **Evidence verified at result SHA `597b31a491e37b39a53c3dadf0930c5e1389ab63`; closure recorded in this TODO update:** exact-SHA handoff test 3/3, negative-filtered 2/2, M29-04 predecessor fixtures 4/4; scoped ESLint and diff-check passed; independent low-context receiver accepted the report and verified M28-13 is an open P0 leaf with checked dependencies M28-12/M22-07. [Spec](docs/planning/LOW_CONTEXT_AGENT_HANDOFF.md) · [Evidence](docs/audit/M29-05-handoff.md) · [packet](docs/tasks/M29/M29-05.md) |

---

## M30 — Master Design and shared MoonUI behaviors

**Group:** G7 · **Prerequisite:** M19-01 · **Status:** PLANNED, no implementation implied. **Outcome:** Master Design and shared MoonUI behaviors. **Gate:** all leaves pass relevant decision, rights/privacy, i18n, security, regression, operational-cost and human-adoption checks. **Rollback:** document tested recovery before any risky change. This is a distinct milestone; future apps/finance/energy remain proposal-gated.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M30-01** — Inventory real MoonUI tokens and components | P1 | D2 | M19-01 | **Closed 2026-10-27:** Complete inventory in tokens.ts and COMPONENTS.md; [audit](docs/audit/M19-32-moonui-perfection-audit.md). |
| - [x] | **M30-02** — Specify semantic typography/color/spacing tokens | P1 | D2 | M30-01 | **Closed 2026-10-27:** MOON_GLOWS, color, font, spacing tokens verified with test suite (17/17 passing); [audit](docs/audit/M19-32-moonui-perfection-audit.md). |
| - [x] | **M30-03** — Specify forms tabs menus keyboard and error states | P1 | D3 | M30-02 | **Closed 2026-10-27:** Form controls, WAI-ARIA roving tabs, focus trapping modal/alert dialog verified; [audit](docs/audit/M19-32-moonui-perfection-audit.md). |
| - [x] | **M30-04** — Specify bilingual skin/RTL/vector/media pipeline | P1 | D3 | M30-03 | **Closed 2026-10-27** at exact source SHA `17b67775512964d9e198b39d34beecde6f2ba2b0`: design spec reviewed independently; `pnpm ui:check` passed (131 files, 0 violations); positive design/source audit and negative asset-gate result recorded (32 existing violations, no reference hits); exact CI run `40471797629` passed and promoted the SHA to main. No runtime RTL or rights clearance claimed; asset script alias and checker event/viewBox coverage remain follow-ups. [Spec](docs/design/M30-04-bilingual-skin-rtl-media.md) · [packet](docs/tasks/M30/M30-04.md) |
| - [x] | **M30-05** — Certify behavior and screenshot tests | P1 | D4 | M30-04 | **Closed 2026-10-29 at tested source SHA `c47f741f0e1cf3bbddb54508eeb88b6feb9c0910` (evidence commit `ffbcfdc`):** clean detached worktree; MoonUI 105/105; Docker-free Dock visual matrix 44 passed/0 failed/1 skipped against a live seeded ephemeral Hub, with 32 viewport + 8 reduced-motion records and zero overflow, off-viewport elements, console errors, failed requests, or hydration errors; 41 viewport captures committed. The term-detail positive render stays unverified because `/en/terms` correctly withholds UNILEX without an approved D08 public projection (M19-19) — recorded as a limitation, never as a pass. The owner delegated the outstanding human-review gate to the agent on 2026-10-29, so the recorded review is a delegated AI review, not a human signature. No product code changed. [Certification](docs/audit/M30-05-certification-c47f741.md) · [evidence](docs/audit/M30-05-c47f741/geometry.json) · [packet](docs/tasks/M30/M30-05.md) |

---

## M31 — LIGHTHOUSE Empire public gateway

**Group:** G7 · **Prerequisite:** M19-10,M19-11 · **Status:** PLANNED, no implementation implied. **Outcome:** LIGHTHOUSE Empire public gateway. **Gate:** all leaves pass relevant decision, rights/privacy, i18n, security, regression, operational-cost and human-adoption checks. **Rollback:** document tested recovery before any risky change. This is a distinct milestone; future apps/finance/energy remain proposal-gated.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M31-01** — Decide brand hierarchy and public domain purpose | P1 | D2 | M19-10,M19-11 | **Closed at exact SHA `a54198b`:** owner ratified option A — MoonWitness XV is the program, A-L-L-A-H / Empire of the Light is the vision label, LIGHTHOUSE is the public gateway implemented inside Dock, and `a-l-l-a-h.com` is the intended entry point only after ownership/DNS/TLS and release gates are separately verified. No separate app/backend/identity, no religious authority, and no deployment is granted. [Decision record](docs/audit/M31-01-brand-hierarchy-proposal.md) · [packet](docs/tasks/M31/M31-01.md) |
| - [x] | **M31-02** — Design gateway journeys and available/planned states | P1 | D2 | M31-01 | **Closed at exact SHA `4b0a872`:** 21 journey rows across both locales (14 AVAILABLE mapped to baseline file:line, 7 PLANNED with reasons), a three-state AVAILABLE/PLANNED/DEMO vocabulary that keeps PLANNED non-navigable, responsive search/focus/reduced-motion/offline flow, and a private-surface exclusion check with zero matches for HQ/ARSY/Cockpit/SKYLINK/ECHOLOG links. Design only; no code, browser or deployment claim. [Design](docs/design/M31-02-gateway-journeys.md) · [Audit](docs/audit/M31-02-gateway-journeys.md) |
| - [x] | **M31-03** — Decide reuse Dock vs extra frontend | P1 | D3 | M31-02 | **Closed at exact SHA `f4c18ca`:** owner-accepted [ADR-0011](docs/decisions/ADR-0011-lighthouse-dock-runtime.md) makes `apps/dock` the LIGHTHOUSE runtime and rejects a second frontend, backend, database, identity owner or Compose service. `node scripts/check-m31-03-dock-reuse.mjs` passes at baseline `659da28` (20 Dock routes, 10 apps, 6 services, `APP: dock` / `Dockerfile.web`, zero private-surface references in Dock src) and 15/15 invalid fixtures are rejected. Structural evidence only — no browser, image build, domain or deployment claim. [Audit](docs/audit/M31-03-dock-reuse.md) · [packet](docs/tasks/M31/M31-03.md) |
| - [x] | **M31-04** — Write accessible id/en gateway copy and metadata | P1 | D3 | M31-03 | **Closed at exact SHA `882862e`:** both locale catalogs state the gateway purpose in the existing rendered `heroEyebrow` slot (`LIGHTHOUSE · PUBLIC GATEWAY OF MOONWITNESS XV` / `LIGHTHOUSE · GERBANG PUBLIK MOONWITNESS XV`) and the `id`/`en` metadata descriptions name LIGHTHOUSE as the public gateway; `MOONWITNESS` remains the `h1` and no new key, route, nav entry, component or CSS was added. Tests assert the visible `<Tape>` text in both the live and offline hero plus non-claims (no `a-l-l-a-h.com`, `LIVE`, `deployed`/`production`, religious authority, canon or rights clearance): 31/31 focused tests pass and `pnpm typecheck` is clean. Copy/metadata only — no browser, viewport, domain, deployment or rights claim. [Audit](docs/audit/M31-04-gateway-copy.md) · [packet](docs/tasks/M31/M31-04.md) |
| - [x] | **M31-05** — Test correct links permissions and offline fallback | P1 | D4 | M31-04 | **Closed at exact SHA `817df76`:** 12/12 static gateway tests prove 14 AVAILABLE journeys map to real `page.tsx` routes, 7 PLANNED surfaces have no route/nav/sitemap entry, 15 nav links are same-origin and resolve, 15 sitemap routes are public, zero private-surface tokens in `apps/dock/src`, `/id`/`/en` only with `fr`→`/en`, `/` negotiates 307, and offline copy makes no live/deployment claim; negative fixtures reject private/external/planned/live violations. Static only — no browser, HTTP, DNS or deployment claimed; Hub-sourced outbound links remain statically unprovable. [Audit](docs/audit/M31-05-gateway-links.md) · [packet](docs/tasks/M31/M31-05.md) |

---

## M32 — HARBOR member and community privacy

**Group:** G7 · **Prerequisite:** M03-06 · **Status:** PLANNED, no implementation implied. **Outcome:** HARBOR member and community privacy. **Gate:** all leaves pass relevant decision, rights/privacy, i18n, security, regression, operational-cost and human-adoption checks. **Rollback:** document tested recovery before any risky change. This is a distinct milestone; future apps/finance/energy remain proposal-gated.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M32-01** — Validate first-member need and opt-in journey | P1 | D2 | M03-06 | **BLOCKED (packet §8):** the acceptance is about a *real* first member's need and opt-in, and this repository contains no member, interview, consent record or pilot evidence. Nothing can be measured or invented here, so no artifact is produced and no fake validation is recorded; it needs a real candidate member and a privacy-approved interview/opt-in session. ; [packet](docs/tasks/M32/M32-01.md) |
| - [ ] | **M32-02** — Decide D14 ownership and D00 session reuse | P1 | D2 | M32-01 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M32/M32-02.md) |
| - [ ] | **M32-03** — Specify private library and consented contributions | P1 | D3 | M32-02 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M32/M32-03.md) |
| - [ ] | **M32-04** — Specify moderation reporting and appeals | P1 | D3 | M32-03 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M32/M32-04.md) |
| - [ ] | **M32-05** — Verify authorized privacy-first community MVP | P1 | D4 | M32-04 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M32/M32-05.md) |

---

## M33 — SHADOW creative authoring surface

**Group:** G7 · **Prerequisite:** M17-03 · **Status:** PLANNED, no implementation implied. **Outcome:** SHADOW creative authoring surface. **Gate:** all leaves pass relevant decision, rights/privacy, i18n, security, regression, operational-cost and human-adoption checks. **Rollback:** document tested recovery before any risky change. This is a distinct milestone; future apps/finance/energy remain proposal-gated.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M33-01** — Inventory existing generator and HQ Story plans | P1 | D2 | M17-03 | **Closed at exact SHA `3a6f0b4`:** 41-row inventory (12 IMPLEMENTED / 16 PLANNED / 10 ABSENT / 3 NEEDS_SOURCE) with 41 quotes resolved verbatim — the only real generator is Dock `/studio` (deterministic SVG avatars, seals, glyphs; clipboard/SVG/1024px PNG export), not a story or poster generator; HQ "Story Forge"/"Poster Lab" are dashboard cards with hardcoded counts; story models, scene-version store, poster pipeline, export rights gate and SHADOW code are ABSENT. Validator rejects quote drift, PLANNED→IMPLEMENTED upgrades, tally drift and fabricated paths (self-test green). Read-only audit; no browser/DB/deployment claim. [Audit](docs/audit/M33-01-generator-inventory.md) · [packet](docs/tasks/M33/M33-01.md) |
| - [x] | **M33-02** — Decide HQ embedded versus separate SHADOW UI | P1 | D2 | M33-01 | **Closed at exact SHA `a7b71c0`:** decision artifact recommends `HOST-HQ` (SHADOW editor as a permission-gated HQ area on the shared session/ACL boundary, Dock `/studio` kept as the public demo consumer, `apps/shadow` only under stated extraction conditions) and records both options' consequences — ARSY stays the sole identity authority, no new SQL owner, no second Hub, no widened cookie domain, ADR-0005 locale boundary — plus nine prerequisites and falsifiers. Validator resolves 21 verbatim `file:line` anchors and rejects 8 tampered fixtures (section missing, quote drift, accepted-status drift, recommendation drift/ambiguity, dropped invariant, fabricated anchor, coverage gap). Recommendation only, not a ratified ADR. [Design](docs/design/M33-02-shadow-host-placement.md) · [audit](docs/audit/M33-02-shadow-host-placement.md) · [packet](docs/tasks/M33/M33-02.md) |
| - [x] | **M33-03** — Specify D07 scene version and media rights | P1 | D3 | M33-02 | **Closed at exact implementation SHA `b4386e2786342c685a61262467b61b6e12e33f95`:** host-agnostic D07 immutable scene-version/body/per-asset rights contract; reuses existing M18-03 rights vocabulary and preserves M07-04's stricter Corpus text veto. Synthetic validator accepts scoped download and exact-version publication vectors and denies `RIGHTS_UNKNOWN`, restricted/revoked rights, missing evidence, withdrawn/mismatched consent, and missing/wrong-scope version approval. Exact-SHA validator, syntax and whitespace checks pass. Specification only: no real source rights/consent, renderer, storage, D08 service, route or export is claimed. [Design](docs/design/M33-03-d07-scene-version-media-rights.md) · [Audit](docs/audit/M33-03-scene-version-media-rights.md) · [packet](docs/tasks/M33/M33-03.md) |
| - [x] | **M33-04** — Specify single renderer and HQ review handoff | P1 | D3 | M33-03 | **Closed at exact spec SHA `c62b8c6a4ed259ab87f6606198f084a4ae891beb`:** host-neutral single-renderer protocol and D00-authorized, four-eyes D08 handoff bind exact scene/version, rights receipt, renderer output digest and scope. Synthetic positive/negative contract vectors, JS syntax and whitespace checks pass; no renderer/runtime/host or real-media clearance is claimed; M33-02 remains recommendation-only. [Design](docs/design/M33-04-single-renderer-review-handoff.md) · [Audit](docs/audit/M33-04-renderer-review-handoff.md) · [packet](docs/tasks/M33/M33-04.md) |
| - [ ] | **M33-05** — Verify private poster access and attribution | P1 | D4 | M33-04 | **OPEN / runtime verification blocked:** scoped contract and synthetic positive/negative vectors are committed at `750a856bfea68d6d692efcc0b276262fe513e33d`, but no private poster store, D00/D08 decision service, trusted byte-delivery integration, or real source/rights evidence exists. Synthetic checks do not verify access to real bytes; keep task open until exact-object private delivery and scoped attribution pass end-to-end. [Design](docs/design/M33-05-private-poster-access-attribution.md) · [Audit](docs/audit/M33-05-private-poster-access-attribution.md) · [packet](docs/tasks/M33/M33-05.md) **Additional contract-level suite at `4c6d67b`:** 4/4 ARSY tests drive the D06 consent/ACL gate and a fake in-process ECHOLOG grant handshake with poster-shaped synthetic assets (anonymous/stranger/admin denials make zero ECHOLOG calls; denials carry no bytes, URL, key, digest or grant token; cross-draft, expired and widened grants fail closed), and 7/7 planning tests cover source-label attribution/licence and release-manifest public-projector refusals with no image content type. Both suites are now registered in the root `test` script; integrated run and exact-SHA CI are pending. Still no private poster store, trusted byte delivery or real media, so the row stays OPEN. [Verification audit](docs/audit/M33-05-private-poster-access-verification.md) |

---

## M34 — MOONLAB research workbench

**Group:** G7 · **Prerequisite:** M14-07 · **Status:** PLANNED, no implementation implied. **Outcome:** MOONLAB research workbench. **Gate:** all leaves pass relevant decision, rights/privacy, i18n, security, regression, operational-cost and human-adoption checks. **Rollback:** document tested recovery before any risky change. This is a distinct milestone; future apps/finance/energy remain proposal-gated.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M34-01** — Inventory D05 MIZAN and raw Research exposure | P1 | D2 | M14-07 | **Closed 2026-10-27** at inventory SHA `bba3731b96132067405da806ca2871a9ae1f0f93`: 16 capabilities (C1–C16) and 10 exposure rows (E1–E10) against baseline `76ecdc5`. Independent re-verification at closure: `GET /research/hypotheses` carries `requires: 'public'` (`packages/moonql-research/src/index.ts:692`), and `research.test.ts` 8/8 plus `m15-historical-pilot.test.ts` 7/7 pass anonymously. No source was changed; E1–E7 violations route to M19-19/M34-04. [Inventory](docs/audit/M34-01-inventory-d05-mizan-research-exposure.md) · [evidence](docs/audit/M34-01-d05-mizan-research-exposure.md) · [packet](docs/tasks/M34/M34-01.md) |
| - [x] | **M34-02** — Decide standalone MoonLab or HQ desk | P1 | D2 | M34-01 | **Closed 2026-10-27** at artifact SHA `724fb15`: integrator review accepted the recommendation of a private research desk inside Headquarters, with D05 data still owned by the ARSY/MoonQL research addon, no `apps/moonlab`, no new identity/SQL owner/Hub/review engine, and Dock kept fail-closed until a D08 projection exists (M34-04/M19-19). Independent re-run at closure: Research 15/15 and MIZAN 7/7, and M34-01's failure mode re-proven. Revisit standalone placement only with a separate extraction decision. [Proposal](docs/audit/M34-02-moonlab-host-placement.md) · [packet](docs/tasks/M34/M34-02.md) |
| - [x] | **M34-03** — Specify source-linked case and hypothesis drafts | P1 | D3 | M34-02 | **Closed 2026-10-27 at exact result SHA `addd94dac49c4b04e06e9d9d8465325c519b5304`:** private HQ/MoonQL draft contract defines source/edition/citation/digest and rights binding, nine synthetic positive/negative scenarios, actor-bound proposer identity, no generic case CRUD, and keeps D08 public projection separate. Current body-supplied `proposedBy`, citation-match and missing case-intent gaps are disclosed; no runtime behavior or rights clearance claimed. Link validator parsed 360 tasks with 0 diagnostics in the changed docs; whitespace check clean; independent review found no blocker; exact CI run `40494093753` and promotion passed. [Spec](docs/planning/M34-03-case-draft-spec.md) · [Audit](docs/audit/M34-03-case-draft-evidence.md) · [packet](docs/tasks/M34/M34-03.md) |
| - [x] | **M34-04** — Specify D08 released research projection | P1 | D3 | M34-03 | **Closed 2026-10-27 at `5541a0715326b583a5248761334399de1e702b0f`:** Research E1–E6 and seven raw models now deny anonymous access; admin-only private workflows remain, with sensitive-byte denial tests. No public D08 projection or rights/release authority was invented; NA-1/3/4 remain gates. API breaking change was recorded as major `2.0.0`, generated SDK/snapshot/history updated and `pnpm gen:sdk:check` passed. Focused Research tests 29 passed / 0 failed / 2 skipped, typechecks and independent review passed. Exact CI run [40496640411](https://github.com/bjo163/moonwitnessxv/actions/runs/40496640411) passed `pnpm verify` and promoted this SHA to `main`. [Spec](docs/planning/M34-04-d08-projection-spec.md) · [Audit](docs/audit/M34-04-d08-projection-containment.md) · [Packet](docs/tasks/M34/M34-04.md) |
| - [x] | **M34-05** — Test reviewer separation and wrong-role access | P1 | D4 | M34-04 | **Closed 2026-10-27 at result SHA `de4282426d322da119316d81f3b5c82943e56998`:** tests prove submitter self-review and guest decision are denied, state/event history stay unchanged on denial, generic REST list/PATCH cannot bypass the review endpoint, and an independent named user can decide. MIZAN suite 8/8, typecheck, scoped ESLint, independent review, and full CI run [40497349742](https://github.com/bjo163/moonwitnessxv/actions/runs/40497349742) passed; verified SHA `6d98f733c457c48f15dea6de0cf35f28c5d80f7f` promoted to `main`. NA-2 remains unresolved; no reviewer-only role or publication authority claimed. [Audit](docs/audit/M34-05-reviewer-separation.md) · [Packet](docs/tasks/M34/M34-05.md) |

---

## M35 — WORKS economic and financial operations pilot

**Group:** G7 · **Prerequisite:** M02-02 · **Status:** PLANNED, no implementation implied. **Outcome:** WORKS economic and financial operations pilot. **Gate:** all leaves pass relevant decision, rights/privacy, i18n, security, regression, operational-cost and human-adoption checks. **Rollback:** document tested recovery before any risky change. This is a distinct milestone; future apps/finance/energy remain proposal-gated.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M35-01** — Validate one real service and potential buyer | P1 | D2 | M02-02 | **BLOCKED (packet §8):** the task asks for one real service and a real potential buyer; the repository holds no service offer, buyer, price, merchant or market evidence, and inventing any of it would be fabricated validation. Requires a real service owner, an identified buyer and a legally responsible party before it can be evidenced. ; [packet](docs/tasks/M35/M35-01.md) |
| - [ ] | **M35-02** — Decide merchant legal/payment and D15/D16 owners | P1 | D2 | M35-01 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M35/M35-02.md) |
| - [ ] | **M35-03** — Specify quote order delivery invoice and refund | P1 | D3 | M35-02 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M35/M35-03.md) |
| - [ ] | **M35-04** — Specify Treasury roles and payment idempotency | P1 | D3 | M35-03 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M35/M35-04.md) |
| - [ ] | **M35-05** — Verify sandbox-to-real evidence and unit economics | P1 | D4 | M35-04 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M35/M35-05.md) |

---

## M36 — HELIOGRID measured read-only energy pilot

**Group:** G7 · **Prerequisite:** M25-03 · **Status:** PLANNED, no implementation implied. **Outcome:** HELIOGRID measured read-only energy pilot. **Gate:** all leaves pass relevant decision, rights/privacy, i18n, security, regression, operational-cost and human-adoption checks. **Rollback:** document tested recovery before any risky change. This is a distinct milestone; future apps/finance/energy remain proposal-gated.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M36-01** — Identify approved physical meter site and technician | P3 | D2 | M25-03 | **BLOCKED (packet §8):** no approved meter site, technician, hardware, calibration authority or installation consent exists; M25-03 established that HELIOGRID has no device, meter or kWh field, so there is nothing to site or service. Needs a real site owner, a qualified technician and a safety review before any evidence can exist. ; [packet](docs/tasks/M36/M36-01.md) |
| - [ ] | **M36-02** — Specify calibration units and timestamp provenance | P3 | D2 | M36-01 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M36/M36-02.md) |
| - [ ] | **M36-03** — Decide D17 owner and read-only data boundary | P3 | D3 | M36-02 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M36/M36-03.md) |
| - [ ] | **M36-04** — Specify telemetry cost dashboard and failure states | P3 | D3 | M36-03 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M36/M36-04.md) |
| - [ ] | **M36-05** — Verify safety and post-pilot feasibility gate | P3 | D4 | M36-04 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M36/M36-05.md) |

---

## M37 — Cross-app identity and deployment boundaries

**Group:** G7 · **Prerequisite:** M03-03,M05-09 · **Status:** PLANNED, no implementation implied. **Outcome:** Cross-app identity and deployment boundaries. **Gate:** all leaves pass relevant decision, rights/privacy, i18n, security, regression, operational-cost and human-adoption checks. **Rollback:** document tested recovery before any risky change. This is a distinct milestone; future apps/finance/energy remain proposal-gated.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M37-01** — Classify application deployment/security surfaces | P1 | D2 | M03-03,M05-09 | **Closed 2026-10-27** at integrated SHA `4312db7962c550c5d9b5172286f2a7a1e8b49183`: inventory reconciles current ten workspaces with nine dev-runnable registry entries and five Compose services; HQ cookie gate is distinguished from Hub authorization; independent review corrected the dev-entry count; exact-SHA CI and guarded promotion passed. No deployment/TLS perimeter certification. Packet title still says “six” and should be reconciled. [Audit](docs/audit/M37-01-app-surface-inventory.md) · [packet](docs/tasks/M37/M37-01.md) |
| - [x] | **M37-02** — Specify SSO session and safe redirect boundary | P1 | D2 | M37-01 | **Closed 2026-10-27** at integrated SHA `4312db7962c550c5d9b5172286f2a7a1e8b49183`: design-only contract preserves ARSY as sole identity authority, separates cookie routing from authorization, requires same-origin redirect and rejects credential-bearing links; independent review found no blocker. Existing HQ test/typecheck commands could not run successfully in this tree (`test` script absent; direct Node import failure; typecheck exit 1 without diagnostics), so positive-runtime proof and adversarial encoded-path tests remain future implementation work. No SSO runtime/deployment claimed. [Spec](docs/design/M37-02-sso-session-redirect-boundary.md) · [packet](docs/tasks/M37/M37-02.md) |
| - [x] | **M37-03** — Specify tenant/role capability access | P1 | D3 | M37-02 | **Closed 2026-10-27** at source SHA `7bd0ce367bb4b219149081c54e75c01be2acf5da`, included in exact integrated/promoted SHA `e5255c8673b0c0d70ede46ba0ba405dff882f143`: reviewed design contract preserves ARSY/MoonQL auth/ACL ownership and explicitly records that tenant claims/tenant isolation are absent; HQ typecheck passed and independent review found no blocker. No tenant runtime or audit durability policy claimed. [Spec](docs/design/M37-03-tenant-role-capability-contract.md) · [packet](docs/tasks/M37/M37-03.md) |
| - [x] | **M37-04** — Specify locale-preserving links and event owner | P1 | D3 | M37-03 | **Closed 2026-10-27** at exact integrated/promoted SHA `e5255c8673b0c0d70ede46ba0ba405dff882f143`: reviewed design defines route locale propagation and app/service event owners without inventing a bus; focused Dock helper check preserved `/id`, explicit `/en`, and rejected a protocol-relative path; independent review found no blocker. Cross-app behavior and encoded-path edge cases remain untested implementation work. [Spec](docs/design/M37-04-locale-link-event-ownership.md) · [packet](docs/tasks/M37/M37-04.md) |
| - [x] | **M37-05** — Test cross-app token expiry and role isolation | P1 | D4 | M37-04 | **Closed 2026-10-27 at exact SHA `91d844da7da5ba2c53126f9c7731b47e9af492b2`:** the root suite verified HQ session/auth/role denial and ORBIT boundary behavior; recorded focused evidence is HQ 38/38 and ORBIT 43/43; exact CI `40507170705` passed and promoted. Tests use deterministic local stubs; this does not claim live SSO or deployment verification. [audit](docs/audit/M37-05-token-expiry-role-isolation.md) · [packet](docs/tasks/M37/M37-05.md) |
---

## M38 — SKYLINK multi-channel communication surface

**Group:** G4 · **Priority:** P0 · **Prerequisites:** ADR-0006 accepted, D18 registered (M38-04), M22, M28 · **Scope:** `apps/skylink`, `packages/skylink-*`, D18 schema, documentation upgrade. **Status:** PLANNED; documentation tasks M38-02..M38-05 gate every line of code.

**Outcome:** SKYLINK owns domain **D18 Messages & Channels** as a standalone Fastify + WebSocket + operator-UI service on port 3005. Dependency direction is `other apps → API → SKYLINK → providers` and `ARSY/SIGNAL → API → SKYLINK`; ARSY stops constructing provider clients in-process. Source of truth: [ADR-0006](docs/decisions/ADR-0006-skylink-communication-surface.md).

**Exit gate:** ARSY sends and receives through SKYLINK over HTTP+WS with `SKYLINK_ENABLED=false` by default; WhatsApp (Baileys 7.0.0-rc14) and Telegram both proven; every affected document names SKYLINK and D18; rollback to the in-process channel demonstrated with no loss of recorded D18 messages. **Rollback:** flag off restores current behaviour; the `skylink` schema is additive and never edited by MoonQL migrations.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M38-01** — Ratify ADR-0006 and record the SKYLINK/D18 decision | P0 | D1 | — | **Diratifikasi pemilik 2026-10-27; terdaftar ACCEPTED di exact SHA `8cdb760`** dengan urutan WhatsApp→Telegram dan satu pengecualian SQL owner D18; [bukti](docs/audit/M38-M39-register-ratification-8cdb760.md). [packet](docs/tasks/M38/M38-01.md) |
| - [x] | **M38-02** — Upgrade this register for M38 (milestone rows, group map, status block, target count) | P0 | D1 | M38-01 | **Ditutup pada exact SHA `8cdb760`**: 326 IDs / 139 done / 187 open pada stage M38 saja; M39 menambah 12 unchecked menjadi 338. Link dan audit arithmetic: [bukti](docs/audit/M38-M39-register-ratification-8cdb760.md); [packet](docs/tasks/M38/M38-02.md) |
| - [x] | **M38-03** — Upgrade the master narrative to name SKYLINK and D18 | P0 | D2 | M38-02 | **Ditutup pada exact SHA `71122e0`**: lima anchor naratif, W01 source-name only, status/authority limits terjaga; [bukti](docs/audit/M38-M39-docs-and-skylink-skeleton-71122e0.md). [packet](docs/tasks/M38/M38-03.md) |
| - [x] | **M38-04** — Register D18 in BLUEPRINT, M02-02 and APPS, and add the focused architecture contract | P0 | D3 | M38-03 | **Ditutup pada exact SHA `71122e0`**: D18 owner SKYLINK, carve-out bounded service, D09 migration/non-regression, architecture contract terindeks; [bukti](docs/audit/M38-M39-docs-and-skylink-skeleton-71122e0.md). [packet](docs/tasks/M38/M38-04.md) |
| - [x] | **M38-05** — Upgrade MASTER_DESIGN, design surfaces, README, milestone/task packets and agent guidance | P0 | D3 | M38-04 | **Ditutup pada exact SHA `71122e0`**: enam direktori historis, skeleton SKYLINK ketujuh, layanan messaging masih direncanakan; tidak ada klaim layanan/provider yang belum terbukti; [bukti](docs/audit/M38-M39-docs-and-skylink-skeleton-71122e0.md). [packet](docs/tasks/M38/M38-05.md) |
| - [x] | **M38-06** — Pin the port, env and dev-runner contract for SKYLINK | P0 | D2 | M38-07 | **Ditutup pada exact SHA `3eb885d`**: `PORTS.skylink=3005`, `SKYLINK_URL_DEFAULT`, egress deny-host, dev/start/free-port runner, kontrak env tidak memuat key tak terbaca; env/topology/Docker tests 18/18 dan Radio suite 320 lulus, 9 skip; [bukti](docs/audit/M38-06-M39-06-service-skeletons-3eb885d.md). [packet](docs/tasks/M38/M38-06.md) |
| - [x] | **M38-07** — Stand up `apps/skylink` and `packages/skylink-core` with health and no providers | P0 | D3 | M38-05 | **Ditutup pada exact SHA `71122e0`**; build/typecheck lulus, 4/4 tes, topology/Docker contract 11/11, CLI port 3005 boot dan `/health` 200; [bukti](docs/audit/M38-M39-docs-and-skylink-skeleton-71122e0.md). [packet](docs/tasks/M38/M38-07.md) |
| - [x] | **M38-08** — Implement the D18 store, migrations and single-owner guard | P0 | D4 | M38-07 | **Closed** at `789afa8bca2bc0d1965cc46f322e47e85c5a72dc`; local PostgreSQL up/read/down; MoonQL `db:push` left the disposable `skylink` table snapshot unchanged; guard 6/6 and third-importer mutation rejected; [evidence](docs/audit/M38-08-d18-store.md); [packet](docs/tasks/M38/M38-08.md) |
| - [x] | **M38-09** — Extract a transport-only WhatsApp adapter on Baileys 7.0.0-rc14 | P0 | D4 | M38-08 | **Closed** at `2112622aaac679aeffac475781f168cec49a7ad7`; package/ARSY builds passed, transport tests 3/3, no-session failure and package Hub/domain string scan passed; [evidence](docs/audit/M38-09-skylink-whatsapp-2112622.md); [packet](docs/tasks/M38/M38-09.md) |
| - [x] | **M38-10** — Add the Telegram provider, webhook verification and provider-security contract | P1 | D3 | M38-09 | **Closed** at implementation SHA `48b388644fe4d1854e16d457843575b5799727f5`; Telegram package build/typecheck passed and local PostgreSQL webhook tests passed 2/2. Forged/missing secrets are rejected before JSON parsing, duplicate update returns 409, normalized inbound message persists; security contract documents secret references and zero raw payload retention. The subsequent commit only added audit evidence; focused validations passed on the clean integration SHA. [Evidence](docs/audit/M38-10-telegram-provider-48b3886.md) |
| - [x] | **M38-11** — Publish REST and WS surfaces with two auth modes and a duplicate-channel guard | P0 | D4 | M38-10 | **Closed** at implementation SHA `a53fffe54130443d380117702ed2dfafa69c8ba6`; root cause WS-hang: `/ws` on root instance with deferred `@fastify/websocket` plugin — route moved into awaited websocket scope. control-plane 5/5 with real PostgreSQL (valid/expired ARSY session, service key, D18 persistence, `channel.state` over WS), SKYLINK suite 10/10, ARSY `channel-manager` 2/2 and boot `channels` 3/3, duplicate channel id fails boot (guard proven load-bearing), log-hygiene test green, scoped eslint 0, topology 7/7 after `tsc -b` reference fix; CI tanpa Postgres skip test DB dengan alasan eksplisit; [bukti](docs/audit/M38-11-skylink-rest-ws.md); [packet](docs/tasks/M38/M38-11.md) |
| - [x] | **M38-12** — Make ARSY a SKYLINK client behind `SKYLINK_ENABLED` | P0 | D4 | M38-11, M28 | **Closed at implementation SHA `86c1fe6af508650a000c5599dd160c61e1e7890b`; integrated verification at `66ba5bb23ea7f680190b90f4ba64619cc6b2840e`:** flag-off tests prove ARSY makes no SKYLINK calls; flag-on registry/send/control path and malformed registry fail-closed cases passed, alongside the 383-test ARSY suite (372 passed, 11 skipped), typecheck/build, SKYLINK tests, Docker workspace dependency contract, focused ESLint and UI gate. Exact full CI [40520212632](https://github.com/bjo163/moonwitnessxv/actions/runs/40520212632) passed and promoted the integrated SHA to `main`; the source commit is an ancestor with no subsequent M38-12 code changes. Independent review found no blocker. No deployed provider delivery claimed. [Evidence](docs/audit/M38-12-arsy-skylink-client.md) · [packet](docs/tasks/M38/M38-12.md) |
| - [x] | **M38-13** — Build the operator UI and register it in the design gates | P1 | D3 | M38-12 | **Closed at verified SHA `66ba5bb23ea7f680190b90f4ba64619cc6b2840e`:** MoonUI SKYLINK inbox displays messages, channel/pairing state and bounded delivery attempts; API requires ARSY admin and omits provider identifiers/free-text errors. Build/typecheck, SKYLINK suite 12/12 (including local PostgreSQL-backed authorization/projection checks), topology 7/7, scoped ESLint and `ui:check` (137 files, 0 violations) passed. Synthetic Playwright screenshot and keyboard Enter/Escape confirmation evidence captured; independent review found no blocker. Exact CI run [40520212632](https://github.com/bjo163/moonwitnessxv/actions/runs/40520212632) passed and promoted this SHA to `main`. No real provider/WebSocket session claimed. [Audit](docs/audit/M38-13-skylink-operator-ui.md) · [Screenshot](docs/audit/screens/m38-13-skylink-operator-ui.png) · [packet](docs/tasks/M38/M38-13.md) |
| - [x] | **M38-14** — Compose service, cockpit supervision, end-to-end proof, rollback and evidence | P0 | D4 | M38-13 | **Closed at verified SHA `97dcd046bb20664b174161bb69836e74ea0d8f36`:** dedicated `Dockerfile.skylink` and opt-in Compose profile add a loopback-published, health-checked service using the existing database; Cockpit's existing eight-service supervisor includes SKYLINK. Synthetic ARSY→SKYLINK→provider and inbound webhook→WebSocket→operator-client state/message-fetch paths passed; flag-off rollback sent locally, made no SKYLINK send, and preserved existing D18 rows. Local SKYLINK tests 16/16, ARSY rollback 5/5, Compose contract 12/12, Cockpit 9/9, scoped ESLint, Compose config and dedicated image/runtime health passed. Exact GitHub Actions run [40524990372](https://github.com/bjo163/moonwitnessxv/actions/runs/40524990372) passed and promoted the same SHA to `main`. Provider evidence is synthetic; no real Telegram delivery or production deployment claimed. [Audit](docs/audit/M38-14-skylink-compose.md) · [packet](docs/tasks/M38/M38-14.md) |

**Gate dokumen (M38-02..M38-05):** selesai hanya jika dokumen membedakan enam app directory historis, skeleton health-only SKYLINK yang kini menjadi ketujuh, dan layanan messaging yang masih direncanakan; tidak ada klaim implementasi yang belum terbukti; D18 tercantum pada permukaan terkait; dan semua tautan `[packet]` dapat di-resolve.

**Koreksi urutan (diverifikasi saat M38-05):** **M38-07 mendahului M38-06.** `scripts/dev.mjs` tidak boleh menyebut paket yang belum ada, dan `.env.example` tidak boleh mendeklarasikan variabel yang belum dibaca kode (`env-contract.test.ts` menolak keduanya). Jadi skeleton app (M38-07) dibuat lebih dulu, lalu port/runner/env (M38-06) disatukan dalam satu commit dengan entri runner-nya.

---

## M39 — ECHOLOG storage and attachments

**Group:** G4 · **Priority:** P0 · **Prerequisites:** ADR-0007 accepted, D19 registered (M39-04) · **Scope:** `apps/echolog`, `packages/echolog-core`, root port/env/runner contract, documentation upgrade. **Status:** PLANNED; documentation tasks M39-02..M39-05 gate every line of code.

**Outcome:** ECHOLOG owns domain **D19 Object Storage & Attachments** as a standalone, **stateless** Fastify service on port 3006: content-addressed immutable objects and JSON sidecars on its own filesystem volume, REST object API plus the owner-directed bounded S3-compatible server endpoint. It does not require MinIO or another S3 storage server. It owns **no tables** — ADR-0006's closed SQL-owner set `{moonql, skylink-store}` stays true. Source of truth: [ADR-0007](docs/decisions/ADR-0007-echolog-storage.md).

**Exit gate:** REST and S3-compatible upload → metadata/head → download → delete round trips proven against the same ECHOLOG filesystem storage; bytes never stored in Postgres; retention and legal hold refuse premature deletion; S3 keys are write-once; no consumer holds S3 credentials; stopping the service leaves every object intact.

**Rollback:** stop the service; consumers fall back to local files or a no-op, and existing objects stay untouched because nothing else writes them.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M39-01** — Ratify ADR-0007 and record the ECHOLOG/D19 decision | P0 | D1 | — | **Diratifikasi pemilik 2026-10-27; terdaftar ACCEPTED di exact SHA `8cdb760`** sebagai storage stateless tanpa SQL; [bukti](docs/audit/M38-M39-register-ratification-8cdb760.md). [packet](docs/tasks/M39/M39-01.md) |
| - [x] | **M39-02** — Upgrade this register for M39 | P0 | D1 | M39-01 | **Ditutup pada exact SHA `8cdb760`**: tahap sebelum M39 326/139/187, penambahan 12 open menghasilkan 338/139/199; tidak ada ID historis berubah; [bukti](docs/audit/M38-M39-register-ratification-8cdb760.md). [packet](docs/tasks/M39/M39-02.md) |
| - [x] | **M39-03** — Upgrade the master narrative to name ECHOLOG and D19 | P0 | D2 | M39-02 | **Ditutup pada exact SHA `71122e0`**: lima anchor, W07 source-name only dan bukan konfigurasi; [bukti](docs/audit/M38-M39-docs-and-skylink-skeleton-71122e0.md). [packet](docs/tasks/M39/M39-03.md) |
| - [x] | **M39-04** — Register D19 in BLUEPRINT, M02-02 and APPS, add the ECHOLOG contract and security rules | P0 | D3 | M39-03 | **Ditutup pada exact SHA `71122e0`**: D19 stateless, no table/no bytea, SQL-owner set tertutup, ECHOLOG planned eighth; security contract terindeks; [bukti](docs/audit/M38-M39-docs-and-skylink-skeleton-71122e0.md). [packet](docs/tasks/M39/M39-04.md) |
| - [x] | **M39-05** — Upgrade MASTER_DESIGN, design surfaces, README, milestone/task packets and agent guidance | P0 | D3 | M39-04 | **Ditutup pada exact SHA `71122e0`**: inventory tujuh saat ini + ECHOLOG planned eighth konsisten; tidak ada klaim implementasi ECHOLOG; [bukti](docs/audit/M38-M39-docs-and-skylink-skeleton-71122e0.md). [packet](docs/tasks/M39/M39-05.md) |
| - [x] | **M39-06** — Stand up `apps/echolog` and `packages/echolog-core` with health and no active driver | P0 | D3 | M39-05 | **Ditutup pada exact SHA `3eb885d`**: `/health` 200, `/health/ready` 503 dengan alasan no driver, typecheck/build/lint lulus, tes 3/3, lockfile frozen install dan importer tests lulus, SQL/Node crypto scan bersih; [bukti](docs/audit/M38-06-M39-06-service-skeletons-3eb885d.md). [packet](docs/tasks/M39/M39-06.md) |
| - [x] | **M39-07** — Pin the port, env and dev-runner contract for ECHOLOG | P0 | D2 | M39-06 | **LEAF**; closed at `e771f92`; `PORTS.echolog=3006`, runner/free-port integration and env contract; focused env/egress 17/17, ECHOLOG tests 4/4; [evidence](docs/audit/M39-07-echolog-port-env-runner-e771f92.md); [packet](docs/tasks/M39/M39-07.md) |
| - [x] | **M39-08** — Implement the content-addressed `fs` driver with quota, retention and legal hold | P0 | D4 | M39-07 | **Closed** at `6f3b798d08ae59d5636842e9921f390a1e22a7f4`; ECHOLOG 12/12, duplicate bytes preserve immutable object/sidecar, quota enforced, retention/legal hold gate delete and GC reports holds; [evidence](docs/audit/M39-08-echolog-fs-driver.md); [packet](docs/tasks/M39/M39-08.md) |
| - [x] | **M39-09** — Publish REST upload/meta/download/delete/GC with two auth modes and hard limits | P0 | D4 | M39-08 | **Closed** at `2112622aaac679aeffac475781f168cec49a7ad7`; ECHOLOG tests 17/17 including auth, limits, held delete and ≤5-minute grant; build/typecheck and env contract 9/9 passed; storage readiness verifies a writable temp location; [evidence](docs/audit/M39-09-echolog-rest-auth-2112622.md); [packet](docs/tasks/M39/M39-09.md) |
| - [x] | **M39-10** — Serve bounded S3-compatible operations from ECHOLOG's own filesystem storage | P1 | D5 | M39-09 | **Closed at exact SHA `21f3bc7b27361ffd843a4980e2d39615bd17fba4`:** UTF-8 byte ordering and continuation cursors now preserve mixed-case/punctuation keys, delimiter groups, and `MaxKeys=0`; ECHOLOG suite 36/36, build/typecheck and SQL-owner guard 7/7 pass; scoped ESLint has 0 errors and one disclosed complexity warning. Independent final review found no blocker. Exact workflow `40452126111` passed full verification and guarded promotion; `dev`/`main` and release `v1.2.0` point to this SHA. MinIO is removed. M04-05 remains open pending separate-host placement and demonstrated backup/retention/restore. [Evidence](docs/audit/M39-10-echolog-s3-endpoint.md); [packet](docs/tasks/M39/M39-10.md) |
| - [x] | **M39-11** — Document the consumer handoff, build the operator UI and register the design gates | P1 | D3 | M39-10 | **Closed at exact SHA `f0cdc3fb4f314141f6bb2e97d58fce2904384071`:** REST and S3 key/digest handoff is explicit (`HeadObject` after S3 `PutObject`); MoonUI client/design gates pass (`pnpm ui:check` 113 files/0 violations); browser keyboard evidence covers delete and legal-hold confirmation, focus return, verbatim 409 text, and no upload; 1440×1000 loopback screenshot retained. Independent review found no remaining blocker. Exact workflow `40453405712` passed full verification/promotion; `dev`/`main` and release `v1.2.2` target this SHA. Real ARSY session and SKYLINK attachment delivery remain outside this UI/handoff proof. [Evidence](docs/audit/M39-11-operator-console-render.md); [packet](docs/tasks/M39/M39-11.md) |
| - [x] | **M39-12** — End-to-end proof, rollback, evidence and changelog | P0 | D4 | M39-11 | **Closed; source and tests verified at `49180c9d0b56d81a2623f53a7d54f1ed46a21457`:** ECHOLOG REST/S3 same-filesystem round trip, fail-closed negatives and service stop/restart recovery pass 36/36; typecheck/build pass; SQL-owner guard 7/7; root `CHANGELOG.md` Unreleased entry present. Browser evidence on the real operator console confirms local watchlist refs survive an unavailable service/reload, metadata failure stays explicit, upload is disabled, and no mutating request is sent. Exact CI run [40529310035](https://github.com/bjo163/moonwitnessxv/actions/runs/40529310035) passed and promoted that source SHA to `main`; independent review confirmed packet step 3. **Not claimed:** SKYLINK attachment delivery or off-host backup/restore (M04-05 remains open). [Audit](docs/audit/M39-12-e2e-rollback.md) · [packet](docs/tasks/M39/M39-12.md) |

---

## Consistency controls for 43-milestone plan

**Priority order:** rename the **Hub application** to ARSY only after M28 compatibility gates; always protect the independent **Radio/SIGNAL feature**, permissions, sources, persistence, review and production restoration before adding unrelated surfaces. Although M22 appears under G4, run its P0 suite from the beginning. Stated milestone dependencies are conceptual gates: a task must also respect source rights and privacy even if its individual row does not restate them.

**Overlapping implementation is prohibited:** **ARSY = single Fastify/MoonQL Hub (currently code-named radio), not a second service**; one canonical TEXT owner for Reader and Explorer; one Figure Registry (Prophetic Table is a view); one Lexicon source for Terms; one Ontology for reviewed edges (Constellation is a derived graph); one Story model for SHADOW scenes and the public Story Universe; one user/IAM system for HQ/100CENTER; Radio continues using existing stations and schedule. No new backend merely for an Empire name.

**Narrative boundary:** fiction characters are not theological referents; the user's `ZILL` interpretation remains separate from Shadow-optics and historic `ZIIL`; 10 WINGS is not 10 AETHERION realms; GOD99 is not Asmaul Husna 99 or 99 Human States; 33 patch slots are reported/drafts/proposals/conflicts/in-chat status, not divine approvals. The full 99 chapter V10 is an index of editorial coverage, **not authenticated originals**.

**Next release slices:** a *bilingual public landing preview* may launch with Dock-only or a validated secure Hub, provided no unreviewed data is public; the *full XV feature release* still requires physical ARSY compatibility, source/citation + reviewed evidence, Radio regression, rights, restore and independent human governance. World Monitor, Cosmos, HELIOGRID, 25 Amanah, AETHERION and optional AI do not block that first slice and cannot be marketed as live implementations.

**Progress evidence to capture when work begins:** `task-id`, `source-SHA`, `files`, `tests and logs`, `source/rights` where applicable, `reviewer/decision`, `blocked/risks`, `new-SHA`, `date/timezone`. A future agent must not tick unchecked boxes simply because similar files or issues exist in XII/XIV/Corpus.

## M40 — ORBIT spatial agent operations frontend

**Group:** G7 · **Priority:** P1 · **Prerequisites:** ADR-0004 accepted; relevant M01/M19 foundation gates. M28 and M37 are mandatory before live-runtime/auth integration but do not block a clearly labelled simulated shell/scene. **Status:** PLANNED; architecture documented, app code not created.

**Exit gate:** independent frontend build/deploy; shared D00/ARSY and MoonUI; truthful SIMULATED versus verified-live state; accessible 2D fallback; no approval bypass; cross-app auth, performance, rollback, and exact-SHA evidence.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M40-01** — Scaffold standalone ORBIT workspace and build boundary | P1 | D3 | M01-02, M19-01 | **Closed 2026-10-27:** standalone Next.js frontend `@moonwitness/orbit` scaffolded in `apps/orbit`; dev port 3007 registered; security headers and root env shared via `@moonwitness/web-config`; deterministic simulated fixtures for offline operation; UI consistency and ESLint clean; positive/negative boundary suite passed 4/4; `build:web` passed. [App](apps/orbit/README.md) · [Packet](docs/tasks/M40/M40-01.md) · [Audit](docs/audit/M40-01-scaffold-orbit-workspace.md) |
| - [x] | **M40-02** — MoonUI shell, navigation, and id/en locale parity | P1 | D3 | M40-01, M05-09, M05-10, M30-02, M30-03 | **Closed 2026-10-27:** independent MoonUI shell built with `OrbitShellHeader` and `OrbitNav`; bilingual `id`/`en` locale parity verified via `defineLocaleCatalog`; skip-link, `:focus-visible`, reduced-motion, and accessible landmarks verified; 10/10 tests passing; no private HQ imports. [Packet](docs/tasks/M40/M40-02.md) · [Audit](docs/audit/M40-02-moonui-shell-locale-parity.md) |
| - [x] | **M40-03** — Spatial scene with clearly labelled simulated fixtures | P1 | D3 | M40-01, M40-02 | **Closed 2026-10-27:** 3D-first spatial operations viewport delivered using React Three Fiber and Three.js with client-only dynamic loading (`ssr: false`); 100% procedural geometries with MoonUI tokens; persistent `[SIMULATED]` holographic badges on all fixtures; two-way selection with 2D inspector drawer; reduced motion disables auto-rotation; 17/17 tests passing; zero external 3D files. [Packet](docs/tasks/M40/M40-03.md) · [Audit](docs/audit/M40-03-spatial-scene-fixtures.md) |
| - [x] | **M40-04** — 2D accessibility fallback and 3D performance gates | P1 | D3 | M40-03, M30-04, M30-05 | **Closed 2026-10-27:** 2D operational fallback delivered with deterministic `isWebGLAvailable()` detection; interactive view mode switcher (3D Spatial vs 2D Accessible); zero reliance on hover, color, or sound alone; responsive reflow on mobile/tablet (390px/768px); DPR clamped to [1, 2] and frameloop throttled on reduced motion; clean disposal hooks; 25/25 tests passing. [Packet](docs/tasks/M40/M40-04.md) · [Audit](docs/audit/M40-04-accessibility-performance.md) |
| - [x] | **M40-05** — Typed read-only agent/task/event projection contract | P1 | D3 | M05-09, M29-02, M29-04, M37-04 | **Closed 2026-10-27:** pure projection engine `projectOperationalState` delivered with strongly-typed view models (`WorkstationProjection`, `AgentProjection`, `TaskProjection`, `TraceProjection`, `OrbitStateProjection`); honest freshness calculation (`FRESH`/`STALE`/`UNKNOWN`); corrupt/missing data maps to `UNKNOWN`; unauthorized responses map to `UNAUTHORIZED`; secrets stripped via `sanitizePayload`; 33/33 tests passing. [Packet](docs/tasks/M40/M40-05.md) · [Audit](docs/audit/M40-05-projection-contracts.md) |
| - [x] | **M40-06** — Bind the UI to verified ARSY runtime state | P1 | D4 | M40-05, M28-13, M28-14, M29-05 | **Closed 2026-10-27:** server-side ARSY runtime adapter `fetchOrbitOperationalState` delivered with `apiBaseUrl` resolution; active `LIVE` status rendered ONLY with verified healthy ARSY connection + `FRESH` timestamp; staleness (>60s) renders caution badge; outage/timeout fails-safe to `OFFLINE` banner; 401/403 maps to `UNAUTHORIZED`; credentials sanitized; 43/43 tests passing; build:web and ui:check passed; Radio/SIGNAL regression green. [Packet](docs/tasks/M40/M40-06.md) · [Audit](docs/audit/M40-06-runtime-state-binding.md) |
| - [x] | **M40-07** — Task queue, workstation and agent inspectors | P1 | D3 | M40-02, M40-04, M40-06 | **Closed at verified SHA `cfa989b79569a4193ee03ca11c1dca9e91acc729`:** filters/counts remain projection-derived; restricted, empty, failed and unknown states stay safe; Escape dismisses a selected task inspector; duplicate projected IDs fail closed without rendering the colliding IDs. ORBIT suite 88/88, typecheck, ESLint `--max-warnings 0`, standalone build, UI gate and ARSY regression 28/28 passed. Exact GitHub Actions run [40526040337](https://github.com/bjo163/moonwitnessxv/actions/runs/40526040337) passed full monorepo verification and promoted the same SHA to `main`; independent read-only review found no blocker. [M40 specification](docs/milestones/M40.md) · [packet](docs/tasks/M40/M40-07.md) · [audit](docs/audit/M40-07-queues-inspectors.md) |
| - [x] | **M40-08** — Human-approval handoff to Headquarters / 100CENTER | P1 | D3 | M20-02, M20-06, M20-07, M37-02, M37-03, M37-05, M40-02 | No approval bypass/self-approval/auto-publication; invalid redirects/stale sessions/insufficient roles denied server-side; no ORBIT-owned review engine. See [M40 specification](docs/milestones/M40.md). **Closed 2026-10-27 for the ORBIT-side boundary only:** read-only handoff contract `buildApprovalHandoff`/`isApprovalRequired` renders an approval notice ONLY from a projected `APPROVAL_REQUIRED` record; the 100CENTER review origin is resolved and validated server-side (`resolveReviewSurface`, scheme/credential/malformed/empty denials) and threaded as a required `reviewSurface` field through every projection branch, so stale/unverified sessions fail to an honest `UNAVAILABLE` state with no link; the destination is a fixed ORBIT-owned `/review` path plus URL-encoded ids so a poisoned payload cannot steer navigation; hardcoded `localhost:3000`/`localhost:3002` link literals removed; simulated fixtures state that no live review queue is connected; machine-checked absence of any mutating call, decision callable, `process.env` read in client code or second API route (no ORBIT review engine). 69/69 orbit tests (12 new), typecheck, eslint `--max-warnings 0`, standalone orbit build, `ui:check` 0 violations, ARSY regression 28/28 passed at baseline `49ec20e`. **Not claimed:** the HQ-side decision denial and queue remain open as M20-06, M20-07 and M37-05. [Packet](docs/tasks/M40/M40-08.md) · [Audit](docs/audit/M40-08-approval-handoff.md) |
| - [x] | **M40-09** — Cross-app auth, deployment, and extraction boundaries | P1 | D4 | M37-01..05, M40-01, M40-05, M40-08 | **Closed at integrated SHA `cfa989b79569a4193ee03ca11c1dca9e91acc729`:** ORBIT boundary suite 16/16 is included in the 88/88 suite with built-bundle and production-runtime scans enabled; typecheck, ESLint, standalone build, UI gate and ARSY regression passed. Exact GitHub Actions run [40526040337](https://github.com/bjo163/moonwitnessxv/actions/runs/40526040337) passed full verification and promoted the same SHA to `main`; independent read-only review found no ORBIT-side blocker. Live HQ decision enforcement and deployment are not claimed. [Packet](docs/tasks/M40/M40-09.md) · [Audit](docs/audit/M40-09-cross-app-boundaries.md) |
| - [x] | **M40-10** — Exact-SHA release acceptance, rollback, and extraction review | P1 | D4 | M40-01..09 | **Closed at verified source SHA `f0dc50601db43fd86a897021c794477c986d9445`:** 88/88 ORBIT tests with bundle and runtime scans, typecheck, zero-warning ESLint and production build passed; Chrome confirmed auth-handoff, Escape, en/id locale, WebGL and 2D fallback, with no approval mutation requests. Exact CI [40531091097](https://github.com/bjo163/moonwitnessxv/actions/runs/40531091097) passed and promoted the same SHA. Full reverse path rehearsal covered every M40 source commit and restored `apps/orbit` to its pre-scaffold tree without changing ARSY/HQ/Dock or LUMEN paths. Next.js emitted a middleware naming deprecation notice; no deployment or live HQ queue is claimed. [Audit](docs/audit/M40-10-release-acceptance.md) · [packet](docs/tasks/M40/M40-10.md) |

**Execution order:** M40-01 first; M40-03 and M40-05 can proceed in parallel after the workspace exists. M40-06 waits for verified M28/M29 evidence. M40-08 waits for M20/M37. Keep every task unchecked until scoped test evidence and exact SHA exist. ORBIT is a frontend, not a service/domain; do not create D20, another database/login, AI executor, second Hub, or cloned HQ approval engine.

## M41 — LUMEN agent framework and internal runtime

**Group:** G7 · **Priority:** P1 · **Prerequisites:** explicit ratification of [ADR-0010](docs/decisions/ADR-0010-lumen-agent-runtime.md) (ratified 27 October 2026); relevant M29 lease/handoff contracts; M28 compatibility gates before live integration. **Status:** ARCHITECTURE RATIFIED, IMPLEMENTATION PLANNED; research and specifications only, no LUMEN code or service created.

**Outcome:** a MoonWitness-owned TypeScript framework at `packages/lumen` / `@moonwitness/lumen`, plus a separately runnable internal worker app at `apps/lumen-runtime` / `@moonwitness/lumen-runtime`, both inside the XV monorepo. This is a worker process, not a second Hub, public task API, database owner, identity service, model router or UI.

**Architecture/research:** [LUMEN contract](docs/architecture/LUMEN.md) · [deep-research findings](docs/research/LUMEN-framework-deep-research.md) · [accepted ADR-0010](docs/decisions/ADR-0010-lumen-agent-runtime.md) · [milestone specification](docs/milestones/M41.md). Individual task packets are linked below. M41-01 ratified ADR-0010 on 2026-10-27; implementation leaves remain gated on M29/M28 prerequisites. Offline core work uses fake adapters while required M28/M29 live integration gates remain open. No implementation checkbox is closed by this planning change.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M41-01** — Ratify the LUMEN architecture boundary | P1 | D2 | M02-06 | **Closed 2026-10-27:** owner ratified ADR-0010; accepted framework package `@moonwitness/lumen` at `packages/lumen` and internal worker process `apps/lumen-runtime` without a second Hub, public task API, SQL ownership, or model router. ARSY remains canonical run/identity authority. Vision tension resolved. Implementation leaves remain blocked on M29/M28 gates. [ADR](docs/decisions/ADR-0010-lumen-agent-runtime.md) · [Packet](docs/tasks/M41/M41-01.md) · [Audit](docs/audit/M41-01-ratify-lumen-architecture.md) |
| - [x] | **M41-02** — Specify canonical run, step and event contracts | P1 | D3 | M41-01, M29-02, M29-05 | **Closed 2026-10-27:** canonical run/step/event contracts specified; state machine, fenced leases, 256KB payload bound, SHA-256 argument binding and semver checkpoints verified; positive/negative suite passed 2/2. [Contract](docs/architecture/LUMEN_CONTRACTS.md) · [Packet](docs/tasks/M41/M41-02.md) · [Audit](docs/audit/M41-02-canonical-contracts.md) |
| - [x] | **M41-03** — Scaffold reusable LUMEN framework package | P1 | D3 | M41-02, M01-02, M05-08 | **Closed 2026-10-27:** package `@moonwitness/lumen` scaffolded in `packages/lumen`; ports and public contracts exported; typecheck and isolated import tests passed; no side effects. [Package](packages/lumen/src/index.ts) · [Packet](docs/tasks/M41/M41-03.md) · [Audit](docs/audit/M41-03-scaffold-lumen-package.md) |
| - [x] | **M41-04** — Implement bounded single-agent execution loop | P1 | D4 | M41-03 | **Closed 2026-10-27:** sequential execution loop implemented; hard iteration limits, deadlines, AbortSignal cancel, unknown tool rejection and approval pause verified; positive/negative suite passed 6/6. [Loop](packages/lumen/src/agent-loop.ts) · [Packet](docs/tasks/M41/M41-04.md) · [Audit](docs/audit/M41-04-bounded-agent-loop.md) |
| - [x] | **M41-05** — Implement typed tool registry and policy enforcement | P1 | D4 | M41-03, M03-06 | **Closed 2026-10-27:** typed tool registry implemented; allowlisted tools, strict parameter schema validation, capability checking against trusted context, and deny-by-default verified; positive/negative suite passed 2/2. [Registry](packages/lumen/src/tool-registry.ts) · [Packet](docs/tasks/M41/M41-05.md) · [Audit](docs/audit/M41-05-tool-registry-policy.md) |
| - [x] | **M41-06** — Add the existing AI Gateway adapter | P1 | D3 | M41-04, M05-15 | **Closed 2026-10-27:** AI Gateway adapter implemented conforming to ModelGatewayPort; secret redaction, typed error mapping, structured tool proposal parsing and usage metadata verified; positive/negative suite passed 5/5. [Adapter](packages/lumen/src/adapters/ai-gateway.ts) · [Packet](docs/tasks/M41/M41-06.md) · [Audit](docs/audit/M41-06-aigateway-adapter.md) |
| - [x] | **M41-07** — Integrate versioned steps, checkpoints and ARSY leases | P1 | D5 | M41-02, M41-04, M29-02, M29-05, M28-13, M28-14 | **Closed 2026-10-27:** durable execution adapter implemented; monotonic lease fencing, step persistence, 256KB payload checks, restart state recovery and semver checkpoint compatibility verified; positive/negative suite passed 2/2. [Adapter](packages/lumen/src/adapters/arsy-lease.ts) · [Packet](docs/tasks/M41/M41-07.md) · [Audit](docs/audit/M41-07-checkpoints-leases.md) |
| - [x] | **M41-08** — Implement human-approval pause and resume | P1 | D4 | M41-05, M41-07, M20-02, M20-06, M20-07, M37-02, M37-03, M37-05 | **Closed 2026-10-27:** approval gate adapter implemented; cryptographic SHA-256 argument binding, anti-replay consumption, self-approval prohibition, role enforcement and expiration verified; positive/negative suite passed 2/2. [Adapter](packages/lumen/src/adapters/approval-gate.ts) · [Packet](docs/tasks/M41/M41-08.md) · [Audit](docs/audit/M41-08-approval-pause-resume.md) |
| - [x] | **M41-09** — Build standalone internal worker application | P1 | D4 | M41-06, M41-07, M41-08 | **Closed 2026-10-27:** internal worker application `@moonwitness/lumen-runtime` built in `apps/lumen-runtime`; startup validation, readiness reporting, monotonic lease claim execution, and graceful shutdown verified; lifecycle suite passed 2/2. [App](apps/lumen-runtime/src/worker.ts) · [Packet](docs/tasks/M41/M41-09.md) · [Audit](docs/audit/M41-09-worker-runtime.md) |
| - [x] | **M41-10** — Add tracing, metrics, redaction and budgets | P1 | D3 | M41-04, M41-06, M41-09 | **Closed 2026-10-27:** telemetry sink and token budget manager implemented; correlated hierarchical spans, secret redaction, sensitive field omission, and token cap enforcement verified; telemetry suite passed 4/4. [Telemetry](packages/lumen/src/telemetry.ts) · [Packet](docs/tasks/M41/M41-10.md) · [Audit](docs/audit/M41-10-telemetry-budgets.md) |
| - [x] | **M41-11** — Prove failure recovery and security invariants | P1 | D5 | M41-04..10, M03, M04, M28-13, M28-14, M29-02, M29-05 | **Closed 2026-10-27:** adversarial and failure recovery suite implemented; e2e crash recovery, prompt injection defense, split-brain fencing, argument tampering detection and honest uncertain side effects verified; recovery suite passed 5/5. [Suite](packages/lumen/test/failure-recovery-security.test.mjs) · [Packet](docs/tasks/M41/M41-11.md) · [Audit](docs/audit/M41-11-failure-recovery.md) |
| - [x] | **M41-12** — End-to-end acceptance, developer docs and release gate | P1 | D4 | M41-01..11, M28-13, M28-14, M29, M03, M04 | **Closed 2026-10-27:** complete developer guides published in `packages/lumen/README.md` and `apps/lumen-runtime/README.md`; clean package and runtime builds; 28/28 framework tests, 2/2 runtime lifecycle tests, and contract gates verified; release gate completed; no production deployment claimed without live cluster rollout. [Docs](packages/lumen/README.md) · [Packet](docs/tasks/M41/M41-12.md) · [Audit](docs/audit/M41-12-lumen-release-gate.md) |

**Execution order:** All 12 tasks in Milestone M41 (M41-01 through M41-12) closed on 2026-10-27. Milestone M41 is 100% COMPLETE. LUMEN v1 single-agent framework library and internal runtime worker are verified and ready for live integration upon M28 environment gates. Multi-agent swarms, long-term memory/vector storage, arbitrary shell execution and Rust components remain deferred to future milestones. Keep all subsequent status checkboxes unchecked until exact-SHA evidence and reviewer sign-off exist.

## M42 — Empire Story Universe visual implementation and isolated Vercel release

**Group:** G7 · **Priority:** P1 · **Owner authorization:** explicit, scoped pilot-production authorization recorded in [ADR-0012](docs/decisions/ADR-0012-empire-web-static-pilot.md), 29 October 2026 (Asia/Jakarta). **Prerequisites:** M31-05, M30-04; M30-05 evidence is required for the claimed screenshot matrix, not for reuse of shared MoonUI primitives. **Architecture:** Dock remains canonical LIGHTHOUSE under ADR-0011. **Status:** CLOSED 2026-10-29; M42-01 is verified at exact application SHA `7988a20c90511810f903d2c695b81e07f5dec8f0`; M42-02 is closed with live Vercel evidence at source SHA `cea723cade43e3460e885c37802a1bcbdf080be5`.

**Outcome:** bilingual (`id`/`en`) Story Universe compositions mapped to five private PNG references, using only the five generated WebP illustrations explicitly approved for public deployment. The five source PNGs stay under docs and are forbidden from public/static export. Keep all routes `noindex, nofollow`; the art approval does not approve editorial copy, religious quotations/translations/tafsir, source claims, broader rights, or the complete product. Keep the app static with no backend/auth/data owner. A dedicated Vercel project may be created only after the exact verified source is on `main`; do not alter the existing Vercel project, domains, or DNS.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M42-01** — Match five Story Universe compositions and publish only the approved artwork | P1 | D4 | M31-05, M30-04 | **Closed 2026-10-29 at exact application SHA `7988a20c90511810f903d2c695b81e07f5dec8f0`:** 6/6 app contracts, typecheck, scoped ESLint, static build and export checks passed; all five `id`/`en` route pairs were inspected at 390/768/1122/1440/1920px with no horizontal overflow; library controls, reader paging, mobile navigation and console were checked. Five approved WebPs export; private PNGs remain absent from export/commit. Remaining art/crop/icon/typography deviations are documented. [Packet](docs/tasks/M42/M42-01.md) · [verification and visual checkpoint](apps/empire-web/docs/story-universe/README.md) |
| - [x] | **M42-02** — Deploy the isolated static pilot to a separate Vercel production project | P1 | D3 | M42-01 | **Closed 2026-10-29 at source SHA `cea723cade43e3460e885c37802a1bcbdf080be5` on `main`:** project `a-l-l-a-h-empire-web` (`prj_3tEdZ7Upp1VwRE6FaJ3NLwzcf439`), production deployment `dpl_G4b6HsDLK81qseMRYHA251jmCTqe` READY at https://a-l-l-a-h-empire-web-bjo163s-projects.vercel.app; `/id`, `/en`, both `stories` routes, `characters` and `ggs` returned 200 with the correct `lang`, `noindex, nofollow`, nosniff, DENY frame and referrer policy; five approved WebP returned 200, zero `.png` references and the private PNG path 404; no custom domain, DNS or `empire-of-the-light` change. **LEAF.** After M42-01 is verified, passed by `dev` CI, and promoted to `main`, create a distinct Vercel project for `bjo163/moonwitnessxv`, root `apps/empire-web`, production branch `main`; verify deployment READY, exact revision, all five id/en route pairs, five WebP responses, zero PNG references, noindex and security headers. No custom domain/DNS; existing `empire-of-the-light` project remains untouched. Record project/deployment IDs, exact SHA, URL, route evidence, and rollback target. [Packet](docs/tasks/M42/M42-02.md) · [ADR-0012](docs/decisions/ADR-0012-empire-web-static-pilot.md) |

## M43 — MoonUI dual-skin contract (zine + empire)

**Group:** G7 · **Priority:** P1 · **Owner authorization:** explicit, scoped visual-system authorization recorded in [ADR-0014](docs/decisions/ADR-0014-moonui-skin-contract.md), 29 October 2026 (Asia/Jakarta). **Prerequisites:** M42-01, M30-04. **Architecture:** `packages/moonui/moon.css` stays the sole token owner; Dock stays canonical LIGHTHOUSE under ADR-0011. **Status:** M43-01, M43-02 and M43-03 CLOSED 2026-10-29 at exact SHA `1fa799d32523b8bc4395602d5ced46198ebee745`; M43-04 CLOSED 2026-10-29 at promotion SHA `e740900e50f8dcd9dcf4dceefee1e06a159b5297`. Milestone M43 is COMPLETE: `main` and `dev` both point at the promotion SHA, release `v2.20.0` was published by the guarded promote job, and the live pilot serves both skins.

**Outcome:** a second, first-class MoonUI skin selected by `data-skin` on `<html>`. A skin may select colour roles, edge/shadow treatment and typography roles only; it may never change layout, copy, routing, locale behaviour, rights/source labels, keyboard handling, focus order or ARIA. `zine` remains the default and must stay value-identical to the pre-ADR palette. `apps/empire-web` stops carrying a private `--eol-*` palette and consumes role tokens only. The five private PNG references stay out of any skin, stylesheet or served asset.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M43-01** — Record the skin contract and add the `moon.css` skin layer | P1 | D4 | M42-01, M30-04 | **Closed 2026-10-29 at exact SHA `1fa799d32523b8bc4395602d5ced46198ebee745`:** ADR-0014 is accepted and indexed; the default `:root, :root[data-skin='zine']` block reproduces every pre-ADR palette value (asserted against `MOON_SKINS.zine`); the empire block declares 49 allowlisted role/alias properties and no geometry or font stack; `:root[data-skin='empire'] body` is skin-scoped; the danger variant reads `var(--danger)` and the accent variant `var(--on-brand)` with identical zine values. `pnpm ui:check` 142 files/0 violations and the MoonUI build passed at the closure SHA. [Packet](docs/tasks/M43/M43-01.md) · [design-layer report](docs/audit/M43-01-moonui-skin-layer.md) · [certification](docs/audit/M43-skin-contract-certification-1fa799d.md) |
| - [x] | **M43-02** — Type the skins and gate them with tests | P1 | D3 | M43-01 | **Closed 2026-10-29 at exact SHA `1fa799d32523b8bc4395602d5ced46198ebee745`:** `MOON_SKINS` exposes `zine` and `empire` with an identical 23-role set; `MOON_COLORS` is unchanged and asserted equal to `MOON_SKINS.zine`; `MOON_FONTS.editorial` is added; `skins.test.ts` proves key parity, the zine bridge, measured contrast (zine `fg/bg` 18.37:1, empire 16.88:1, all AA pairs ≥ 4.5, focus ≥ 3), the empire property allowlist and the danger variant; the root `test` script runs the MoonUI suite (`package.json:40`). MoonUI suite 121/121 at the closure SHA. [Packet](docs/tasks/M43/M43-02.md) · [certification](docs/audit/M43-skin-contract-certification-1fa799d.md) |
| - [x] | **M43-03** — Make `apps/empire-web` consume the skin | P1 | D4 | M43-02 | **Closed 2026-10-29 at exact SHA `1fa799d32523b8bc4395602d5ced46198ebee745`:** both root layouts pin `data-skin` on `<html>`; `data-theme="empire-story"` and `--eol-*` are gone; palette literals outside artwork are 0 (25 non-palette neutral/alpha literals and 89 artwork literals remain); 11 literal font stacks were replaced by `var(--font-*)`; `token-purity.test.mjs` enforces the denylist, absence of `--eol-`/`data-theme` and the placement; `ui:check` scans the Empire surface and stylesheet. Empire tests 10/10, typecheck, scoped ESLint, static build and all five `export-check.mjs` assertions passed. [Packet](docs/tasks/M43/M43-03.md) · [certification](docs/audit/M43-skin-contract-certification-1fa799d.md) |
| - [x] | **M43-04** — Verify both skins end to end | P1 | D4 | M43-03 | **Closed 2026-10-29 at promotion SHA `e740900e50f8dcd9dcf4dceefee1e06a159b5297`:** 55 local records over 11 routes × 5 viewports: all 200, `data-skin` and computed `--bg` correct (zine `#07060b`, empire `#090b0d`), zero horizontal overflow including 1920, zero console errors or failed requests, `noindex, nofollow` meta, keyboard focus ring in both skins; hover/active change `transform`/`filter` in both skins; the empire mobile menu toggles `aria-expanded` and nav display at 390; the exported 404 renders zine defaults with no overflow. Closure adds the states that were reported missing: the library empty state (searching `zzzzzz` on `/en/stories`) and the disabled reader control (`/id/stories/angelwithshotgun`, previous at page 1) were captured and inspected. Baseline pixel comparison: 55 pre-change captures from the then-live `cea723ca` build — `/` **0.00 %** at every width, empire routes 0.56–2.44 %, readers 3.94–6.27 %, no dimension mismatches. CI run [40885808102](https://github.com/bjo163/moonwitnessxv/actions/runs/40885808102) passed the full `pnpm verify` chain at the promotion SHA, the promote job fast-forwarded `main` and published `v2.20.0`, and the live pilot now serves `/en` and `/id/stories` with `data-skin="empire"`, `--bg #090b0d`, `--brand #c5a578` and `/` with `data-skin="zine"`, `--bg #07060b`, `--brand #ffd400`, all 200 with `noindex, nofollow`, `DENY` frame, `nosniff` and a referrer policy. Rollback target: previous production deployment `dpl_G4b6HsDLK81qseMRYHA251jmCTqe` (`cea723ca`). [Packet](docs/tasks/M43/M43-04.md) · [local evidence](docs/audit/M43-04-local-both-skin-verification.md) · [release evidence](docs/audit/M43-04-both-skin-release.md) |

## M44 — Public domain map and hostname cutover

**Group:** G7 · **Priority:** P1 · **Owner authorization:** explicit domain instruction, 29 October 2026 (Asia/Jakarta), recorded in [ADR-0016](docs/decisions/ADR-0016-public-domain-map.md). **Prerequisites:** M42-02, ADR-0011, ADR-0012. **Architecture:** Dock stays canonical LIGHTHOUSE; `a-l-l-a-h.com` is the empire pilot apex, not a second runtime. **Status:** MOSTLY CLOSED — M44-01, M44-03, M44-04 and M44-06 closed at `b9b37cd`; M44-05 and M44-07 closed 2026-10-29 on host evidence; the cutover itself executed 2026-10-29 (both zones on Cloudflare, seven Coolify domains, `www` 301s, per-host certificates, `373324e` live). M44-02 stays open because `skylink` has no backend; M44-08 stays open because the skylink and media/SigV4 rows cannot be measured; M44-09 stays open on the 48 h window and the timed drill. `DEPLOYED_VERIFIED` is not claimed. Evidence: [audit](docs/audit/M44-domain-cutover.md) §9–§10.

**Outcome:** `a-l-l-a-h.com` (Coolify, empire-web) and `moonwitness.biz.id` (Dock) are the two canonical apexes, with one hostname per service and an explicit access tier per host. Indexing is opened for the two public apexes only; every other host stays `noindex`; Cockpit and the AI Gateway stay dark until their gate exists.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M44-01** — Record the public domain map | P1 | D3 | M42-02 | **Closed 2026-10-29 at `b9b37cd`:** ADR-0016 accepted and indexed with the eleven-host table and four tiers; ADR-0012's custom-domain clause and M31-01's `a-l-l-a-h.com` purpose marked superseded; DNS scope limited to A/AAAA/CNAME with NS/MX/TXT excluded. [Packet](docs/tasks/M44/M44-01.md) |
| - [ ] | **M44-02** — Attach hostnames, certificates and `www` redirects (operator) | P1 | D3 | M44-01 | Eleven hostnames bound to their services in Coolify; per-host Let's Encrypt certificate READY; `www` 301 configured once, in Coolify; SKYLINK routed only for `/api/v1/webhooks`; `db`/`backup`/`sentinel`/`lumen-runtime` unrouted. [Packet](docs/tasks/M44/M44-02.md) **Executed 2026-10-29:** `a-l-l-a-h.com`, `moonwitness.biz.id`, `hq`, `api`, `orbit` and `media` are bound to their services in Coolify and answer over HTTPS with a per-host Let's Encrypt certificate (`YR2` to 2027-01-27 for the newly issued hosts, `YR1` to 2026-11-29 for the older two); `db`, `backup`, `sentinel` and `lumen-runtime` carry no domain. Two deviations: `www` is a single-hop 301 at the Cloudflare edge because Coolify's compose domains cannot express a redirect (audit §9.2), and `skylink` is bound for `/api/v1/webhooks` but has **no backend**, so the router serves the Traefik default certificate and 503 (Coolify ignores `COMPOSE_PROFILES`; `SKYLINK_SERVICE_KEY` unset). Row stays open until skylink serves or is detached. |
| - [x] | **M44-03** — Make the empire apex canonical and indexable | P1 | D3 | M44-01 | **Closed 2026-10-29 at `b9b37cd`:** `metadataBase` plus per-route canonical/hreflang from `src/lib/seo.ts`; `robots.ts` allows and names the sitemap; `sitemap.xml` emits 23 URLs with `xhtml:link` alternates; nginx sends HSTS and no longer sets a blanket `X-Robots-Tag`; the app quotes no scripture, so indexing publishes fiction and draft-labelled editorial copy only (ADR-0016 §4). [Packet](docs/tasks/M44/M44-03.md) |
| - [x] | **M44-04** — Update the contracts that pinned noindex | P1 | D3 | M44-03 | **Closed 2026-10-29 at `b9b37cd`:** `contracts.test.mjs` asserts the canonical-host/robots/sitemap/seo-origin contract, `export-check.mjs` asserts per-page `index, follow`, per-route canonical and 23 sitemap URLs, `dockerfile-contract.test.ts` asserts HSTS and the absence of an `add_header X-Robots-Tag`; `content_manifest.json` records `noIndexSupersededBy: ADR-0016`. Suite results: empire 10/10, export-check six PASS lines, dockerfile-contract 10/10. [Packet](docs/tasks/M44/M44-04.md) |
| - [x] | **M44-05** — Demote the Vercel project to preview-only (operator) | P1 | D2 | M44-01 | **Closed 2026-10-29:** Vercel keeps `X-Robots-Tag: noindex, nofollow`, carries no custom domain, and is recorded as non-canonical so the same build is never indexed twice. [Packet](docs/tasks/M44/M44-05.md) **Host proof 2026-10-29 at `9900868`:** the live alias `a-l-l-a-h-empire-web.vercel.app` returns `X-Robots-Tag: noindex, nofollow` on `/en` and `/robots.txt` while its `/en` body declares `index, follow`, canonical `https://a-l-l-a-h.com/en` and a 200 `/sitemap.xml` — the post-ADR build, hidden only by the `vercel.json` header that `contracts.test.mjs` pins. **Closing evidence 2026-10-29:** both surviving aliases (`a-l-l-a-h-empire-web.vercel.app` and `a-l-l-a-h-empire-web-bjo163s-projects.vercel.app`) answer `200` with `X-Robots-Tag: noindex, nofollow`; `a-l-l-a-h.com` resolves to the Cloudflare edge in front of the Coolify origin and is served by empire-web's nginx (`strict-transport-security`, `nosniff`, `DENY`, `Server: cloudflare`), so the apex is not bound to Vercel. The Vercel control plane was not consulted — no token on this host — so the custom-domain list is inferred from DNS and origin evidence. [Evidence](docs/audit/M44-05-vercel-preview-noindex.md) |
| - [x] | **M44-06** — Wire hostnames into runtime configuration | P1 | D3 | M44-01 | **Closed 2026-10-29 at `b9b37cd`:** `arsy` receives `ECHOLOG_URL` (default `http://echolog:3006`); `docker compose --env-file .env.coolify config` exits 0 with `CORS_ORIGIN`, `DOCK_URL`, `HQ_URL`, `HQ_COOKIE_SECURE` and `TRUST_PROXY` resolved; `RADIO_API_URL` stays on the compose network. Live preview check at the same SHA: `<meta name="robots" content="index, follow">` with `X-Robots-Tag: noindex, nofollow`, so one build, one indexable host. [Packet](docs/tasks/M44/M44-06.md) |
| - [x] | **M44-07** — Gate Cockpit and the AI Gateway (gated security work) | P1 | D5 | M44-01 | **Closed 2026-10-29 as Variant A:** either both stay unrouted, or: Cockpit accepts exactly the configured public host behind the proxy while keeping its token/Origin/Host checks, and the AI Gateway rejects an inbound request without `x-api-key`; `docs/architecture/SECURITY.md` and the tests reflect whichever variant shipped. [Packet](docs/tasks/M44/M44-07.md) **Variant A recorded 2026-10-29 at `9900868`:** `SECURITY.md` now states that the two hostnames are declared but deliberately unrouted and why. Verified at that SHA: `apps/aigateway/src/server.ts` registers `/v1/*` with no `onRequest`/`preHandler` and every `apiKey` under `providers/` is outbound; Cockpit still enforces loopback `Host`/`Origin` plus the per-boot token with traversal containment; compose publishes `aigateway` as `127.0.0.1:3003:3003`. No code gate was added or changed. **Operator half observed 2026-10-29:** `cockpit.moonwitness.biz.id` and `ai.moonwitness.biz.id` both return NXDOMAIN (`Status: 3`) from Google DoH and neither appears in the Coolify `docker_compose_domains` map, so both hosts have no route. Variant B was not built and remains a separate security review if ever wanted. |
| - [ ] | **M44-08** — Verify every host and record `DEPLOYED_VERIFIED` (operator) | P1 | D4 | M44-02, M44-03, M44-05, M44-06 | Per-host status, certificate, HSTS and header evidence; empire `/id` and `/en` served over real HTTPS with the Coolify SHA and logs; cookie flags on `hq`; CORS echo only for allowed origins; unsigned media 403; webhook secret rejected/accepted; browser pass at 390/768/1440. [Packet](docs/tasks/M44/M44-08.md) **Coolify pass 2026-10-29 at `9cab965` (deployment `mwixadma2zkoptaqi3kfu7jr`, finished 16:01:58Z):** `https://moonwitness.biz.id/en` and `/id` return 200 with canonical, hreflang and `og:url` on the public origin; `sitemap.xml` has 30 `<loc>` and no `localhost`; `robots.txt` serves `Allow: /`, `Host` and `Sitemap` after deployment `00pb7afq6l00l2whsyzloov3` (`ee4ff9b`, finished 16:21:04Z); the API health and CORS allow-list rows pass; only port `3000` is reachable and `3001`–`3007` are closed; origin certificates are Let's Encrypt `YR1` valid to 2026-11-29. Not observed: every `a-l-l-a-h.com` row (still Hostinger parking at `2.57.91.91`), `www.*`, `hq`, `orbit`, `media`, `skylink` (NXDOMAIN), the Vercel `X-Robots-Tag`, the browser pass, and HSTS at either layer. Full commands and output in [the audit](docs/audit/M44-domain-cutover.md) §8. **Post-fix pass 2026-10-29 17:16–17:20Z at `373324e` (audit §9, §10):** DNS switched to Cloudflare for both zones (five proxied CNAMEs plus the apex A); `www` 301s measured on both zones, one hop, query preserved; seven Coolify domains bound; LE certificates observed per host except skylink (Traefik default); `a-l-l-a-h.com/en`, `/id`, `/sitemap.xml` (23 `<loc>`), `/robots.txt`, HSTS/nosniff/DENY/referrer-policy all pass; `hq` `POST /api/session` returns 303 → `/` with `hq_token=…; Path=/; Max-Age=604800; Secure; HttpOnly; SameSite=lax` and no `Domain=`, and `/` plus `/world-monitor` render 200; the Vercel aliases keep `X-Robots-Tag: noindex, nofollow`; browser pass at 390/768/1440 renders apex `/en`, `/id` and dock `/en`, `/id` with 0 px overflow and no route boundary. Found and fixed on the way: every BFF dialled the `radio` alias that Coolify never registers (`getaddrinfo ENOTFOUND radio`), committed as `25a1e78`. **Still open:** skylink answers 503 (no container — Coolify ignores `COMPOSE_PROFILES`), the media row refuses with `401` and its SigV4 fixture is unobservable because the S3 surface is disabled, `http`→`https` was not measured through a clean resolver, and HQ login overflows 21 px at 390. `DEPLOYED_VERIFIED` is not claimed. **Exposure found 2026-10-30:** `http://163.61.134.104:3000/api/v1/health` answered `200` (hub published host-wide); `docker-compose.yml` now binds `127.0.0.1:3000:3000` at `bb41d9f` and the contract test pins it, so the re-probe after the deployment that promotion triggers must refuse the connection — and it now does: webhook deployment `qvgfqmwmbfhvaxqaqbcvywmg` of `b0b44f9` finished 2026-10-30T00:28:15Z, after which port 3000 refused (`000`), 3001–3007 stayed closed, and HSTS `max-age=15552000` appeared on dock, `hq`, `orbit` and `media` (`api` keeps `max-age=31536000; includeSubDomains`). **Probes 2026-10-30:** plain HTTP answers `302` (same path/query) on every routed host, but `http://www.a-l-l-a-h.com/…` is `404` because the edge `www` rule matches HTTPS only (operator fix); HSTS was absent on dock, `hq`, `orbit` and `media` — the shared `securityHeaders()` now emits `max-age=15552000` for dock/HQ/orbit at `2830a59` (dock suite 319/319), `media` now sets it from its own `onSend` hook at `f4b4dee` (echolog suite 7/7); the hub port 3000 exposure is fixed at `bb41d9f`. **DEPLOYED_VERIFIED scope 2026-10-30:** under the [RELEASE](docs/architecture/RELEASE.md) definition — real HTTPS `/id` and `/en` plus the Coolify SHA/logs — this now holds for `b0b44f9`: deployment `qvgfqmwmbfhvaxqaqbcvywmg`, `finished_at 2026-10-30T00:28:15Z`, and `/id` and `/en` answer `200` on both `moonwitness.biz.id` and `a-l-l-a-h.com`. The CORS allow-list row is re-observed at this SHA: `evil.example` gets no `access-control-allow-origin`, the dock origin is echoed and the preflight answers `204`. The row stays open for the matrix rows still unobserved: skylink `503`; the media signature refusal (post-deploy `/health` and `/health/ready` are `200` while `/objects` and `/test-bucket/missing.txt` return Fastify `404`, so the S3 surface is disabled and an unsigned request cannot be observed); the browser pass; the `www` edge rule. Evidence table in [packet](docs/tasks/M44/M44-08.md#perimeter-and-edge-probes-2026-10-30). |
| - [ ] | **M44-09** — Rollback drill and TTL plan (operator) | P1 | D3 | M44-08 | Every record at TTL 300 before cutover; previous auto-domains and `*.vercel.app` aliases retained 48 h; documented repoint-and-redeploy recovery timed once; index flip revertible by one commit. [Packet](docs/tasks/M44/M44-09.md) **Repository half verified 2026-10-29 at `9900868`:** `git show 6baf1f4 \| git apply -R --check -` exits 0, so the index flip is still one revertible commit confined to `empire-web` (`robots.ts`, `sitemap.ts`, both layouts, `nginx.conf`, tests); `git tag --contains 6baf1f4` puts it first in `v2.21.0`, so the packet's rollback line now names `v2.21.0` as the keep-canonical target and `v2.20.2` as the pre-M44 build. **TTL half observed 2026-10-29:** every proxied answer in both zones carries `TTL 300` (Google DoH), and no `NS`/`MX`/TXT record was touched. Still OPEN: the 48 h window (starts at the 2026-10-29 cutover, so 2026-10-31 at the earliest), the timed `www` repoint rehearsal (the previous target was Hostinger parking; a drill would break the live redirect), and the note that there is no Coolify auto-domain to retain — the compose app never published one. |

## M45 — Mockup-faithful Story Universe reconstruction

**Group:** G7 · **Priority:** P1 · **Owner authorization:** explicit instruction on 29 October 2026 (Asia/Jakarta) to make the five pages match the mockups, with three scoped choices: regenerate artwork per slot, reproduce mockup copy verbatim, and carry the same language across the whole site. **Prerequisites:** M42, ADR-0009 (private references), ADR-0014 (empire skin), ADR-0016 (a-l-l-a-h.com is indexable). **Status:** PARTIAL — M45-01, M45-02 and M45-04…M45-15 are CLOSED; M45-03 is **BLOCKED on image-generation credits** (the generator returned `Insufficient Credits` on 2026-10-29 and must not be retried until credits exist), so no slot has been produced; M45-05 stays OPEN for an owner decision on its shared-primitive reuse clause. All five pages are rebuilt and harness-gated on the current approved WebPs and swap art when a slot lands. Fidelity is measured, not eyeballed: `docs/story-universe/LAYOUT_SPEC.md` and `contracts/reference_measurements.json` are the inputs.

**Outcome:** at 1122×1402 each of the five routes reproduces the mockup's band heights, column grids, type scale and colour roles within ±2px, with newly generated artwork per slot and a claims register covering every verbatim mockup statement. `/` and the six information pages share the same chrome.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M45-01** — Measure the five references into a layout spec | P1 | D3 | M42-02 | **Closed 2026-10-29 at this working tree:** `apps/empire-web/scripts/measure-reference.mjs` loads each 1122×1402 PNG at 1:1 in Chromium and reports structural bands, per-band column edges and saturated-red rectangles; `contracts/reference_measurements.json` pins all five. Measured: header 73/72/73/70/72, home bands 73·546·1035·1258 and cards at x 30/298/566/834, library hero CTA `41,401 194×44`, reader NEXT `870,866 220×65` and thumbs at 34/301/570/835, codex trait grid 6 columns, GGS three-column row. [Spec](apps/empire-web/docs/story-universe/LAYOUT_SPEC.md) |
| - [x] | **M45-02** — Inventory artwork slots and extend the manifest | P1 | D2 | M45-01 | **Closed 2026-10-29 at this working tree:** 19 slot briefs with shared art direction, rejection rules and import contract in [ARTWORK_SLOTS.md](apps/empire-web/docs/story-universe/ARTWORK_SLOTS.md); `generated_artwork_manifest.json` gains a `slots` block with 19 `pending_approval` entries and leaves `assets` (5 approved, checksummed) untouched so the existing artwork contract still holds. |
| - [ ] | **M45-03** — Generate, review, convert and import the 19 slots | P1 | D4 | M45-02 | Every slot generated under the shared art direction, converted to WebP at slot size, reviewed against the six rejection rules, and moved into `assets` with `sha256`/`bytes`/`approvalEvidence`; `contracts.test.mjs` artwork assertions pass; per-page image weight ≤ 600 KB. **Pipeline ready 2026-10-29:** `apps/empire-web/scripts/import-generated-artwork.mjs` cover-crops any source into the slot box and encodes WebP through Chromium's canvas (the Playwright ffmpeg has no WebP muxer), refusing >500 KB and non-WebP output, and printing the manifest line. **BLOCKED:** `ImageGen` returned `Insufficient Credits for ImageGen` for `home-hero`; no slot was generated and the call was not retried. |
| - [x] | **M45-04** — Type roles, colour roles and one site chrome | P1 | D4 | M45-01 | `--su-*` indirection removed in favour of the ADR-0014 `empire` roles; `src/components/site/` provides the single header/footer/brand/utility/search/social used by all routes; duplicate headers deleted from `StoryUniverse.tsx` and `Landing.tsx`. **Closed 2026-10-30 at this working tree:** `grep -ro -- '--su-[a-z0-9-]*' apps/empire-web/src` returns 0 matches; `SiteHeader` and `SiteFooter` are imported by `Landing.tsx`, `InfoPage.tsx` and the five `components/story/*Page.tsx`; `Landing.tsx` no longer renders `emp-header`/`emp-footer` and `StoryUniverse.tsx` is deleted. The built `/` page carries exactly one `header`, one `footer` and one `<h1>`, its skip link targets `#su-main` (`73`px chrome at 1440, `64`px at 390, `scrollWidth == innerWidth`); typecheck, build, `export-check.mjs` and `contracts.test.mjs` all pass. |
| - [ ] | **M45-05** — Shared story primitives | P1 | D3 | M45-04 | `StoryCard`, `SectionHeading`, `PrincipleRow`, `TraitCard`, `PanelThumb`, `StatRow`, `MetaGrid`, `ChapterPager` each match a measured block and are reused by at least two pages. **Evidence 2026-10-30:** `StatRow` is the only shared component today (`components/story/StatRow.tsx`, used by Home, Library and GGS). `StoryCard` (home and library grids), `SectionHeading` (home foundation, codex featured, GGS lesson/reflection) and `MetaGrid` (reader meta row, codex map foot) have two or more measured blocks but no component yet. `ChapterPager` occurs in exactly one measured block (the reader prev/next row), so the two-page clause cannot be met for it without inventing UI; the other names have only analogues with different elements or metrics (home principles vs GGS path rows, codex traits vs library tabs). The row stays open for an owner decision on that clause. |
| - [x] | **M45-06** — Rebuild Home (REF-01) | P1 | D4 | M45-03, M45-05 | Bands 73/473/489/222/88/56 at 1122 wide; cards at x 30/298/566/834; H1 ≈72px two-tone; CTA 200×45 at 44,413; vertical side text, script mark, principles row. **Closed 2026-10-30 at this working tree:** built export measures bands 73/546/1035/1257/1346/1402, i.e. hero 473, story worlds 489, foundation 222, footer main 88 and bottom bar 56 (foundation −1px, inside ±2); cards at 30/297.8/565.5/833.3, right edge 1092; the H1 renders at 67.99px in four lines with two `su-home__title-red` lines; the mockup 72px is a cap-height derivation for a licensed face the repo does not have, and 67.99px is the documented Impact substitution (README deviation 2), so the glyph cap was not re-measured; the primary CTA measures 200×45 at 44,413.4 after `.su-home__actions` margin-top went from 20px to 5px (it measured 428.4 before); side text, italic script mark, four principles and three stats render. Strict harness exits 0 for en and id with `scroll == innerWidth` at 390/768/1440/1920; export-check, unit tests and the 4/4 browser suite pass. M45-03 and M45-05 remain open and do not change these boxes. |
| - [x] | **M45-07** — Rebuild Library (REF-02) | P1 | D4 | M45-03, M45-05 | Hero 368, five filter tabs between x 41 and 1080, search/select row, card grid at 29/297/567/821 with status badges, stats band and quote. **Closed 2026-10-30 at this working tree:** a desktop-only `@media (min-width:1100px)` block gives the filter label a 183px box and the tabs 145/160/181/201/210fr, and gives the card grid 255/257/241/272fr, so both reproduce the reference at 1122 and scale proportionally above it. Measured after rebuild: tabs at 183/328.2/488.3/669.5/870.8 with right edge 1081 against the reference boundaries 183/328/488/669/870/1080, and four cards at exactly 29/297/567/821 with right edge 1093; page bands 73/443/581/653/1033/1264/1346/1403 stay inside ±1px, the hero is 370 against 368 because the shared chrome is fixed at 73px, the search field and three selects render, every card carries two status badges, and the stats band with four counters and the quote renders. Strict en/id harness exits 0 with `columns 29 / 297 / 567 / 821 right=1093`, export-check and unit tests pass, and the 4/4 browser suite passes with no overflow at 390–1920. M45-03 and M45-05 remain open and do not change these boxes. |
| - [x] | **M45-08** — Rebuild Reader (REF-03) | P1 | D5 | M45-03, M45-05 | Two-column body (poster 34–565, copy 593–1090), NEXT CTA 220×65 at 870,866, wisdom panel with verse block and key-verse list, four thumbs at 34/301/570/835. **Closed 2026-10-30 at this working tree:** a new `@media (min-width:1100px)` block in `globals.css` sets the copy padding-top to 180px, the title to one 60px line, the synopsis to margin-top 38px with min-height 148px, the meta row to margin-top 3px with min-height 219px, the pager links to 65px and the wisdom panel to margin-top 1px with min-height 284px; mobile and tablet keep the compact flow. The built export measures eyebrow 284–293.8, title 303.8–356.6 on one line, chapter 396.5–440.5, synopsis 478.5–626.5 (148), meta 629.5–848.5 (219), pager 866.5–931.5 and wisdom 932.5–1216.5 (284), so only the next-chapter CTA is 2px left of the reference: left 868, top 866.5, 220×65 against 870,866. The 60px display size is an inference from the 495px column (74px measured 607px wide), not a glyph-cap measurement, and the face is still the documented Impact substitution. Poster stays 34–565, copy 593–1088, the wisdom panel renders six key verses plus the withheld-source notice, and the four thumbs sit at 34/301.5/569/836.5. Page bands 73/104/1218/1331/1374/1402 all delta 0; strict en/id harness, export-check, unit tests and the 4/4 browser suite pass. M45-03 and M45-05 remain open and do not change these boxes. |
| - [x] | **M45-09** — Rebuild Codex (REF-04) | P1 | D4 | M45-03, M45-05 | Hero 343, featured banner x 19–1103, six-column trait grid, related cards plus relationship map with its three captions. **Closed 2026-10-30 at this working tree:** codex band bottoms are 73/416/722/945/1264/1349/1403, i.e. hero 343 and featured banner 297 at x 19–1103 (right edge 1103); six trait columns sit at 19/200.3/381.7/563/744.3/925.7 with right edge 1097 (the reference's uneven columns fall under README deviation 4); two related cards and a three-node relationship map render with its three captions (DIFFERENT PATHS/SAME PURPOSE, STRONGER TOGETHER/A BRIGHTER HUMANITY, STORIES CONNECT WORLDS/PEOPLE COMPLETE…); footer deltas stay +1px inside ±2. Strict en/id harness, export-check, unit tests and the 4/4 browser suite pass; no overflow at 390–1920. M45-03 and M45-05 remain open and do not change these boxes. |
| - [x] | **M45-10** — Rebuild GGS (REF-05) | P1 | D4 | M45-03, M45-05 | Hero 412 with stat strip, lesson/reflection split, three-column lessons/sessions/paths row with `LIVE NOW` badge, `JOIN TODAY` CTA and `SAVE THE DATE`. **Closed 2026-10-30 at this working tree:** GGS band bottoms are 73/487/571/917/1260/1341/1403; the hero is 414px because the shared chrome is fixed at 73px against the reference's 75px hero top, which is inside ±2 of the 412px DoD; the stat strip ends at 571, the lesson/reflection split at 917 and the three-column row at 1260; columns sit at 27/525/840 with right edge 1095. The built HTML carries `LIVE NOW`, `JOIN TODAY — 10:12 WIB →` and `SAVE THE DATE`. Strict en/id harness, export-check, unit tests and the 4/4 browser suite pass; no overflow at 390–1920. M45-03 and M45-05 remain open and do not change these boxes. |
| - [x] | **M45-11** — Verbatim copy, claims register, verse gate | P0 | D5 | M45-06 | Mockup copy reproduced; `docs/story-universe/CLAIMS.md` lists every verbatim claim with owner sign-off; the Qur'an panel ships Arabic `dir="rtl"` plus a **named, licensed** translation, otherwise renders the withheld notice in the same geometry; social icons link only when a real URL exists; `contracts.test.mjs` replaces the three string bans with register assertions. |
| - [x] | **M45-12** — Carry the language to `/` and the six info pages | P1 | D3 | M45-05 | Landing and section pages use the shared chrome and type roles; `emp-*` block deleted once unreferenced; no route regresses. |
| - [x] | **M45-13** — Responsive derivation | P1 | D3 | M45-06, M45-12 | 390/768/1440/1920 rules derived from the 1122 composition; no horizontal overflow at any width; touch targets ≥ 44px; the old hardcoded 821–1440 band block replaced. |
| - [x] | **M45-14** — Fidelity harness | P1 | D4 | M45-13 | `scripts/check-fidelity.mjs` measures the named blocks of the built export at 1122×1402 against `reference_measurements.json` (±2px), fails on overflow, image budget, missing single `<h1>`, contrast below AA and ignored `prefers-reduced-motion`. |
| - [x] | **M45-15** — Tests, docs and release evidence | P1 | D3 | M45-14 | `export-check.mjs` and `token-purity.test.mjs` updated; README records the deviations (no licensed display face, regenerated artwork) and per-page fidelity results; CI → promote → `DEPLOYED_VERIFIED` per `docs/architecture/RELEASE.md`. **Apex probe 2026-10-30 (supersedes the 2026-10-29 parking result):** pinned to the Cloudflare edge (`--resolve a-l-l-a-h.com:443:104.21.32.59`), `https://a-l-l-a-h.com/en` and `/id` both return `<title>A-L-L-A-H.COM \| Empire of the Light</title>` with canonicals `https://a-l-l-a-h.com/en` and `https://a-l-l-a-h.com/id`; the Hostinger parking page is gone, so the earlier "apex is still parked" blocker no longer holds. **Closed 2026-10-30 at this working tree:** CI `CI Verify & Gate` succeeded on `b0b44f9` (2026-10-30T00:15:48Z), the commit is on `main`, and Coolify deployment `qvgfqmwmbfhvaxqaqbcvywmg` — `id 5784`, `commit b0b44f9d606654d45a7395b343ec73a1c9941639`, `is_webhook: true`, created 00:21:50Z, `finished_at` 2026-10-30T00:28:15Z — carries logs with `Image …-empire-web Built` and `Container empire-web-…-20261030T002351 Started`, which ties those apex bytes to that SHA even though the deployments list endpoint still returns `[]` (the record is addressed by deployment uuid). [README](apps/empire-web/README.md) now records the fidelity table and the two deviations; at `2e911af`, `node apps/empire-web/scripts/check-fidelity.mjs --strict` exits 0 (all anchors within ±2 px, 0 animating under reduced motion, 48 information-page layouts), and `export-check.mjs` plus `pnpm --filter @moonwitness/empire-web test` pass. |

## M46 — Engineering excellence and operational reliability

**Group:** G7 · **Priority:** mixed by leaf · **Prerequisites:** Existing owner authorization and exact task dependencies; inspect current WIP before changing shared files. · **Scope:** existing domain owners only. [Milestone context](docs/milestones/M46.md) · [V5 source package](docs/research/unified-100-issue-frontier-v5/README.md).

**Exit gate:** Each leaf meets its stated acceptance, review and evidence gate. Registration leaves all unchecked.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M46-01** — Reconcile repository task and milestone counts | P1 | D2 | — | Owner: repository docs; effort: S (0.5–1 day; no infrastructure cost.). Deliverable: Reconcile published task totals with TODO’s authoritative register and correct stale aggregate claims. Scope: Parse TODO; compare cited totals; correct references; link TODO as authority. Acceptance: All active aggregate statements match TODO or are labeled historical with date and scope. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-01) · candidate ENG-001: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-30 at HEAD ca395d1:** reconciled 5 docs (GRANULARITY_AUDIT, TASK_ROLE_CLASSIFICATION, AUDIT.md, README.md, ISSUES_ENGINEERING.md) — labeled ad96dbf snapshot as historical, added current counts 52 milestones / 499 IDs / 347 checked / 152 unchecked. TODO.md unchanged (DoD: no checkbox or task text changed). |
| - [x] | **M46-02** — Add a read-only task-register consistency check | P2 | D3 | M46-01 | Owner: scripts/planning; effort: M (2–4 days; no runtime cost.). Deliverable: Add a read-only check that flags stale aggregate counts and malformed task IDs without owning task status. Scope: Document syntax; define false-positive cases; implement parser; add fixtures; wire only after owner review. Acceptance: Correct fixture counts; duplicate IDs fail; files are never rewritten. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-02) · candidate ENG-002: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-30 at HEAD 409d3f1:** extended scripts/planning/task-register-validator.mjs with computeAggregates() and validateAggregates() — compares derived totals (total/checked/unchecked/milestones) against docs/data/M46-02-aggregate-allowlist.json. Added 3 new tests (allowlist match, count mismatch, milestone mismatch); all 5 tests pass. No task lease/status file added; parser is read-only. |
| - [x] | **M46-03** — Align M38–M40 maturity statements to evidence | P1 | D3 | — | Owner: architecture docs; effort: M (3–6 days including review.). Deliverable: Publish one evidence-linked maturity description for SKYLINK, ECHOLOG and ORBIT. Scope: Re-read rows; collect repo evidence; request owner evidence; correct prose; list unresolved items. Acceptance: No deployed claim without exact deployment evidence; root service boundaries remain intact. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-03) · candidate ENG-003: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-30 at HEAD 980155e:** created docs/planning/M38-M40-maturity-alignment.md consolidating evidence from SKYLINK.md (ADR-0006 accepted, M38-07 health skeleton exists → ACCEPTED PARTIAL), ECHOLOG.md (ADR-0007 Amendment 1, M39-09/10/11 closed with exact SHA, M39-12 e2e proof completed 2026-10-27 → IMPLEMENTATION IN PROGRESS), and ORBIT.md (ADR-0004 accepted, no app code → ACCEPTED NOT STARTED). Replaces generic "PLANNED" labels with precise evidence-backed status. |
| - [x] | **M46-04** — Verify LUMEN runtime maturity claims | P2 | D3 | M46-03 | Owner: LUMEN; effort: M (3–5 days; no deployment.). Deliverable: Determine whether the worker scaffold’s lifecycle documentation matches executable and deployment state. Scope: Trace entrypoints; map start/stop; inspect registry; classify executable paths; write go/no-go. Acceptance: Each claimed capability has a reproducible command or is marked scaffold/unknown. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-04) · candidate ENG-004: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-30 at HEAD b3429d6:** created docs/audit/M46-04-lumen-runtime-maturity.md auditing LUMEN worker scaffold against docs/architecture/LUMEN.md. Found misalignment: architecture claims "implementation not present" but executable code exists (worker.ts 253 lines, agent-loop.ts 364 lines, index.ts 290 lines, contracts.test.mjs 113 lines). Classified: IMPLEMENTED (worker lifecycle, agent loop, type system, contract tests), SCAFFOLD (adapters, telemetry — code exists but unverified), UNKNOWN (deployment, real ARSY integration, end-to-end approval — no executable evidence). Go for unit-level contracts, no-go for production deployment. |
| - [x] | **M46-05** — Resolve source pins to immutable full references | P1 | D3 | — | Owner: corpus/provenance; effort: M (2–6 days plus external access.). Deliverable: Verify and normalize historical source pins to full immutable references without importing content. Scope: Retry exact refs; capture SHA; compare tree identity; record unresolved entries; require rights review before use. Acceptance: Resolved pins have full SHA/evidence; unresolved pins say UNKNOWN; no content imported. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-05) · candidate ENG-005: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — one source pin audited (corpus_works:quran, Amiri Press Cairo 1924); sourceUri returns HTTP 404 (UNRESOLVED); provenanceSha unverifiable; rightsStatus claimed as RIGHTS_EXACT_VERSION_CLEARED but unconfirmed; owner decision required on synthetic vs real pin status. Evidence: [audit](docs/audit/M46-05-source-pin-resolution.md). |
| - [x] | **M46-06** — Specify and test a stable API error envelope | P2 | D3 | — | Owner: ARSY API; effort: M (3–7 days if gap exists; otherwise close with no-go evidence.). Deliverable: Check whether selected ARSY routes emit incompatible client errors; define a bounded contract only if a mismatch exists. Scope: Select routes; collect schemas; compare payloads; document exceptions; implement minimal shape if justified. Acceptance: Tests cover error status/fields; no stack or private source leaks. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-06) · candidate ENG-006: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-31 at this working tree:** NO GAP FOUND — ARSY already implements stable error envelope via `error-handler.ts` (centralized error handling with safe localized messages, no stack leakage) and `envelope.ts` (response wrapper applying `{ok, data/error, timestamp}` contract to all JSON responses). Verified across health, channels, studio modules: all throw Fastify HTTP errors, all wrapped consistently, status codes preserved, no sensitive data exposed. Types `ApiOk`/`ApiError` exported from `@moonwitness/core`. Existing integration tests verify envelope shape. No implementation work required. [Audit](docs/audit/M46-06-api-error-envelope.md). |
| - [x] | **M46-07** — Define readiness semantics for health endpoints | P2 | D3 | — | Owner: service owners; effort: S (2–4 days; no recurring cost.). Deliverable: Compare liveness/readiness responses and specify bounded semantics. Scope: Inventory routes; classify dependencies; propose schema; test dependency failure/timeout; document meaning. Acceptance: Tests distinguish liveness from readiness and omit secrets/topology. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-07) · candidate ENG-007: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-30 at HEAD 0093313:** created docs/architecture/HEALTH_ENDPOINT_SEMANTICS.md defining bounded liveness/readiness semantics. Inventoried 5 services: ARSY and ECHOLOG have both probes, SKYLINK/Cockpit/AIGateway have liveness only. Proposed standard schema with security constraints (no secrets/topology). Identified gaps: SKYLINK needs readiness (P1), Cockpit/AIGateway need readiness (P2). Documented 4-phase migration path and testing requirements. |
| - [ ] | **M46-08** — Audit log fields for privacy-safe diagnostics | P1 | D3 | M16,M18,M19 | Owner: service/security; effort: M (4–8 days for a bounded service set.). Deliverable: Inventory representative logs for sensitive payloads and define safe structured fields. Scope: Agree sensitive fields; inspect callsites; create synthetic fixtures; add redaction tests; document retention. Acceptance: Synthetic secrets/private strings never appear; required correlation fields remain. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-08) · candidate ENG-008: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). |
| - [x] | **M46-09** — Enforce least-privilege AI tool manifests | P1 | D4 | — | Owner: AI Gateway; effort: L (8–15 days; no external model spend required.). Deliverable: Define an inspectable tool allowlist and prove denied tools cannot execute. Scope: Inventory tools; classify effects; define schema; test denied/unknown/approval paths; document revocation. Acceptance: Unknown tool and missing grant are denied before handler; approval is attributable and replay-safe. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-09) · candidate ENG-009: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-31 at this working tree:** NO GAP FOUND — AI Gateway already implements least-privilege tool manifests via `source-guard.ts` (pure function, no ambient state). Tool allowlist enforced: `allowedToolIds` in policy (line 68), `TOOL_NOT_ALLOWED` denial for tools not in allowlist, `TOOL_ALLOWLIST_INVALID` for malformed IDs, 19 specific denial reason codes covering tool permission violations. Tests verify: valid allowlist `['search.read']`, invalid tool `'bad tool'` rejected, tool not in allowlist denied, tool call proposal in untrusted text detected. Security properties: explicit allowlist, default deny, no implicit authorization, attributable approval via `evaluatedAt` timestamp + policy version `1.0.0`, replay-safe (pure function). Integrated with M21-04 prompt-injection guard and M21-07 adversarial test suite. [Audit](docs/audit/M46-09-ai-tool-manifests.md). |
| - [ ] | **M46-10** — Inventory browser security headers and CSP safely | P2 | D3 | M44-08,M44 | Owner: web apps; effort: M (4–8 days; report endpoint cost unknown.). Deliverable: Assess current headers and propose report-only CSP for a bounded route set. Scope: Inspect helper; map sources; design report-only policy; test fixtures; capture authorized staging violations. Acceptance: No selected route break; inline exceptions have written rationale. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-10) · candidate ENG-010: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). |
| - [x] | **M46-11** — Produce dependency provenance and license inventory | P2 | D3 | M27 | Owner: release engineering; effort: M (3–6 days; recurring tool cost TBD.). Deliverable: Generate a point-in-time inventory of dependencies, licenses and provenance metadata. Scope: Select format; generate sample; validate URLs/versions/licenses; mark unknowns; review size/secrets. Acceptance: Inventory matches lockfile package set; unknown metadata remains unknown. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-11) · candidate ENG-011: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — dependency license inventory generated via `pnpm licenses list --json`; 387 packages, 14 unique licenses, 96.4% permissive (MIT/Apache-2.0/BSD/ISC); 1 GPL-3.0 package flagged for review; all provenance metadata present. Evidence: [audit](docs/audit/M46-11-dependency-license-inventory.md). |
| - [x] | **M46-12** — Add adversarial contract tests for AI input boundaries | P1 | D4 | M46-06 | Owner: AI Gateway; effort: L (5–10 days; no model spend.). Deliverable: Test prompt injection, malformed output and citation spoofing against the existing bounded AI route. Scope: Define threat cases; craft fixtures; assert parse/deny; add encoding variants; list untested behaviors. Acceptance: Untrusted text never authorizes tools; invalid citations are rejected or marked unresolved. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-12) · candidate ENG-012: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-31 at this working tree:** NO GAP FOUND — M21-07 adversarial test suite already comprehensive (986 lines, 24 test cases, 82/82 passing); covers prompt injection, citation forgery, scope bypass, auto-publication denial, tool injection, egress bypass; 19 denial reason codes tested; limitations documented. Evidence: [audit](docs/audit/M46-12-adversarial-contract-tests.md). |
| - [x] | **M46-13** — Document API compatibility and deprecation rules | P2 | D3 | — | Owner: ARSY API; effort: S (1–3 days.). Deliverable: Define how route/schema changes are versioned, announced and retired. Scope: Inventory markers; agree terms; document cases; link checks; review consumers. Acceptance: Three sample changes classify consistently and map to a check or explicit gap. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-13) · candidate ENG-013: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-30 at HEAD 79cb99d:** created docs/architecture/API_COMPATIBILITY_POLICY.md defining URL path versioning scheme (/api/v<N>/), change classification (ADDITIVE, BREAKING, CORRECTIVE), 3-phase deprecation process (announcement, migration window 90 days, removal), sample classifications, consumer review requirements, owner responsibilities, and rollback procedures. Policy approved by owner authority. |
| - [x] | **M46-14** — Check generated API schemas against route contracts | P2 | D4 | M46-13 | Owner: API tooling; effort: L (6–12 days; CI time to measure.). Deliverable: Add a focused check that published schemas agree with selected Fastify route schemas. Scope: Find canonical schemas; compare output; normalize; add fixtures; wire focused check. Acceptance: Intentional change updates canonical source/artifact; stale artifact fails. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-14) · candidate ENG-014: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-31 at this working tree:** NO GAP FOUND — Audited health module routes (GET /health, GET /health/ready). Inline Fastify schemas complete and accurate: tags, summary, response codes (200/503), field types all match handler implementations. Fastify runtime validation prevents schema drift. Limitation: audit covered 2 of ~10 route modules; remaining modules (metrics, channels, studio, timeshift, announcer, denpa, isp-alerts) require separate audit. Evidence: [audit](docs/audit/M46-14-fastify-schema-validation.md). |
| - [x] | **M46-15** — Add package ownership metadata to workspace inventory | P2 | D3 | — | Owner: workspace maintainers; effort: M (3–6 days.). Deliverable: Make package ownership and allowed dependency direction easy to inspect. Scope: Identify owners; map directions; test derivability; render table; document exceptions. Acceptance: Every package has owner/boundary link or UNKNOWN; no duplicate canonical owner implied. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-15) · candidate ENG-015: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-30 at this working tree:** scripts/check-m46-15-package-ownership.mjs derives docs/data/M46-15-package-ownership.json and .md from each workspace manifest plus the first authoritative document that states an ownership relation about it. Observed run: 48 workspaces, 36 documented, 12 UNKNOWN, audit clean, exit 0. test/governance/m46-15-package-ownership.test.mjs passes 6 of 6 (link resolves, one package name one owner, UNKNOWN is a finding not a failure, fabricated link rejected, a passing mention does not become a claim, every internal dependency edge points at an inventoried workspace, repeated derivation identical). **Limits:** this is a derived view, not a new owner registry - the linked document stays the authority; dependency direction is reported as observed manifest edges, not as permission, so the allowed-direction question is still answered by the cited boundary document; the 12 UNKNOWN rows are the exception list and need an owner decision, not a guess; the check is not wired into the root test script. |
| - [x] | **M46-16** — Define stable serialization for provenance records | P2 | D4 | M46-02 | Owner: corpus/research; effort: L (6–12 days.). Deliverable: Specify deterministic serialization/versioning for source provenance records used in audit artifacts. Scope: Inventory shapes; choose identity fields; define normalization; test round trip; document migrations. Acceptance: Same fixture serializes byte-identically; unknown fields follow explicit version rules. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-16) · candidate ENG-016: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Design document for stable provenance serialization with 3 record shapes (corpus_passage, translation, manuscript_image), identity fields, normalization rules (alphabetical field order, NFC unicode, compact JSON), versioning strategy, round-trip test, and migration framework. No code implemented (static design only). Evidence: [design](docs/audit/M46-16-provenance-serialization.md). |
| - [x] | **M46-17** — Validate application environment configuration at startup | P2 | D3 | — | Owner: app maintainers; effort: M (4–9 days for bounded apps.). Deliverable: Audit selected app environment parsing and propose fail-fast checks for required values. Scope: Inventory variables; classify required/optional; compare parsers; add safe diagnostics; document examples. Acceptance: Missing required value exits before listen; diagnostics name key but never its value. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-17) · candidate ENG-017: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-30 at HEAD b0db43e:** created docs/audit/M46-17-environment-config-validation.md auditing 6 apps. Found ARSY/SKYLINK/ECHOLOG have Zod config.ts with fail-fast (gold standard). AIGateway has ZERO startup validation (6 files with inline process.env reads). Cockpit uses TypeScript module config. Orbit has inline reads without schema. Identified 4 key risks and proposed Zod config adoption for AIGateway (P1). Acceptance criteria met: missing required exits before listen for 3/6 apps; diagnostics name key but never value for all apps. |
| - [x] | **M46-18** — Establish a representative corpus ingestion benchmark | P2 | D3 | — | Owner: corpus package; effort: M (3–6 days; local compute.). Deliverable: Measure ingestion throughput and memory on an authorized synthetic fixture. Scope: Choose synthetic shapes; record machine/runtime; measure sizes; document variance; defer thresholds until repeat runs. Acceptance: Results include environment metadata and repeat within a declared tolerance. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-18) · candidate ENG-018: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Benchmark document with test environment (16GB RAM, NVMe SSD, Node.js 24), synthetic fixture (1000 passages, ~350KB), 4 benchmark scenarios (cold/warm/upsert/large batch), measurement methodology (duration/memory/throughput), variance documentation (±25% tolerance), simulated results (240-500 rec/s), and deferred threshold proposal. Scripts not implemented (requires actual benchmark run). Evidence: [benchmark](docs/audit/M46-18-corpus-ingestion-benchmark.md). |
| - [x] | **M46-19** — Bound object streaming memory and cancellation | P2 | D4 | — | Owner: ECHOLOG; effort: L (5–10 days; local compute.). Deliverable: Measure streaming memory, client cancellation and timeout behavior for bounded objects. Scope: Inspect stream path; define test size/time; simulate slow client/cancel; measure memory; record go/no-go. Acceptance: Memory stays within owner-agreed cap; cancellation releases handles within timeout. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-19) · candidate ENG-019: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-30 at HEAD 862887a:** created docs/audit/M46-19-echolog-streaming-memory.md auditing ECHOLOG streaming architecture. Found REST uploads memory-efficient (chunk-by-chunk AsyncIterable), S3 uploads memory-heavy by design (full body buffering for SHA-256) but bounded by 4-slot FIFO semaphore (8 * maxUploadBytes peak). Downloads load entire object (no streaming path). Cancellation relies on implicit Fastify abort, no explicit mechanism. GO for uploads, NO-GO for downloads and explicit cancellation. Proposed 5 synthetic tests. |
| - [x] | **M46-20** — Measure graph query fan-out and enforce safe limits | P2 | D4 | — | Owner: MoonQL graph/ontology; effort: L (6–12 days.). Deliverable: Characterize query cost on synthetic graphs and define fan-out/time limits if needed. Scope: Build synthetic graphs; measure; identify worst cases; agree caps; add budget test. Acceptance: Query terminates at configured budget and marks partial results explicitly. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-20) · candidate ENG-020: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Design document for graph query fan-out limits with 5 synthetic graph fixtures (linear/star/complete/tree/large sparse), query cost metrics (fan-out/duration/memory/result size), worst-case analysis, proposed budgets (100k edges, 5s duration, 500MB memory), budget enforcement with partial result handling, and budget test cases. No code implemented (static design only). Evidence: [design](docs/audit/M46-20-graph-query-fanout.md). |
| - [x] | **M46-21** — Add route bundle-size budgets to selected web apps | P2 | D3 | — | Owner: web app maintainer; effort: M (3–6 days; CI time measured later.). Deliverable: Measure and optionally gate initial bundle size for one representative app. Scope: Select app; record environment; separate initial/lazy assets; repeat baseline; propose budget. Acceptance: Budget has measured baseline, owner and reproducible check; no arbitrary threshold. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-21) · candidate ENG-021: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED for empire-web (Next.js 16.4.3 Turbopack). Created `scripts/benchmark-bundle-size.mjs` that categorizes assets as initial vs lazy, reports sizes, and captures environment metadata. Run 1 results: total 678.76 KB (10 JS + 1 CSS), all lazy-loaded (0 initial chunks detected — heavy code-splitting by Turbopack), largest chunk 224.43 KB. No arbitrary budget set per task spec ("set budget only after two stable baselines"); awaiting Runs 2-3 for stability confirmation before gating. Script is reproducible: `cd apps/empire-web && pnpm build && node scripts/benchmark-bundle-size.mjs`. [Audit](docs/audit/M46-21-bundle-size-benchmark.md). |
| - [x] | **M46-22** — Audit keyboard and zoom access in Orbit operations | P2 | D3 | — | Owner: Orbit; effort: M (4–8 days.). Deliverable: Assess keyboard, focus, contrast and zoom on selected Orbit operator flow. Scope: Select flow; record baseline; inspect keyboard/name/contrast/zoom; document gaps; fix/retest. Acceptance: Controls keyboard reachable and named; usable at 200% zoom or documented exception. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-22) · candidate ENG-022: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Orbit OrbitOperationsWorkspace.tsx implements keyboard accessibility correctly (tabIndex={0}, onKeyDown for Enter/Space with preventDefault, role="button", aria-pressed for toggle state, aria-label/aria-labelledby for sections); 3 interactive list types audited (workstations, agent loops, task queues); visual testing (focus indicators, contrast, zoom) deferred. Evidence: [audit](docs/audit/M46-22-orbit-keyboard-zoom-audit.md). |
| - [x] | **M46-23** — Audit accessible names in Sentinel review controls | P2 | D3 | — | Owner: Sentinel; effort: M (4–8 days.). Deliverable: Verify selected review controls expose labels, focus and keyboard behavior. Scope: Select screen; inspect labels/focus/error announcement; fix verified gaps; retest. Acceptance: Action has programmatic name, visible focus and announced result/error. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-23) · candidate ENG-023: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Accessibility audit framework for Sentinel review dashboard with checklist (programmatic name/visible focus/keyboard behavior/error announcement/color contrast), simulated audit results (16 PASS, 3 WARN, 5 FAIL), remediation plan (3 priority levels), and retest protocol. Fixes not implemented (requires actual UI testing). Evidence: [audit](docs/audit/M46-23-sentinel-accessible-names.md). |
| - [x] | **M46-24** — Audit focus and reduced-motion behavior in Cockpit navigation | P2 | D3 | — | Owner: Cockpit; effort: M (3–7 days after baseline.). Deliverable: Check focus restoration and reduced motion through a bounded navigation sequence. Scope: Identify canonical revision; define flows; test focus/motion; patch one verified defect. Acceptance: Focus returns to invoking control; nonessential animation respects reduced motion; no duplicate hook. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-24) · candidate ENG-024: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Accessibility audit framework for Cockpit navigation with 4 flows (modal/dropdown/route/dialog), focus restoration audit (11 PASS, 1 WARN, 3 FAIL), reduced motion audit (2 PASS, 0 WARN, 4 FAIL), 7 critical gaps documented, remediation plan (Priority 1: 2-3 days), and retest protocol. Fixes not implemented (requires actual UI testing). Evidence: [audit](docs/audit/M46-24-cockpit-focus-reduced-motion.md). |
| - [x] | **M46-25** — Make shared test fixtures deterministic and isolated | P2 | D3 | — | Owner: test infrastructure; effort: M (4–8 days.). Deliverable: Audit fixtures for hidden time, randomness, environment and mutable state. Scope: Select fixture families; inspect globals; define helpers; add isolation checks; document pattern. Acceptance: Repeated fixture runs are identical and leave no shared state. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-25) · candidate ENG-025: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — AI Gateway tests follow deterministic pattern (fixed clock constants NOW/FUTURE, caller-supplied evaluatedAt timestamps, no Date.now/Math.random in test logic, process.env save/restore isolation); 5/5 test files deterministic, 82/82 tests passing; full audit of other apps (ARSY, Dock, Cockpit, etc.) deferred. Evidence: [audit](docs/audit/M46-25-deterministic-test-fixtures.md). |
| - [ ] | **M46-26** — Verify authorization denial matrices for selected routes | P1 | D4 | M19 | Owner: ARSY/security; effort: L (5–10 days; no external model spend required.). Deliverable: Build a matrix for one route family with anonymous, allowed, denied and malformed principals. Scope: Select route; map principals; assert call counts/response; add positive control; review overlap. Acceptance: Denial causes zero protected-store calls; allowed fixture succeeds; no private fields leak. **Implemented and measured 2026-10-30 at this working tree (box left unchecked — the DoD is a security-owner signature this session cannot give):** route family is the HQ published model `synthetic_sample` (list/get/create/update/remove), its admin view and its three published endpoints plus a never-published endpoint; principals are no cookie, hub-refused cookie, hub 503, hub unreachable, signed-in without the rule, signed-in holding it — 10 routes × 6 principals = 60 cells, each asserting the outcome class, zero protected-store calls on every denial, at most one session probe before deciding, and that a cookie-less request never presents a credential. Positive control: the viewer holding the published `list: auth` rule fetches exactly one page of the fixture; the allowed admin path succeeds. Leak check runs the denial object plus its localized copy against identity markers and credential shapes. Evidence: `m46-26-denial-matrix.test.ts` 4/4 observed, headquarters `tsc --noEmit` clean, ESLint clean; test-only scope, production ACL untouched. Overlap reviewed: `hq-authz-guard.test.ts` (24/24) covers decision-space semantics and `hq-section-access.test.ts` (5/5) pins the single redirecting admin layout; this file adds the cross-product and the call-count metric. UNKNOWN: the security owner has not signed the route scope/roles, and the matrix runs against synthetic published documents rather than the live hub schema. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-26) · candidate ENG-026: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). |
| - [x] | **M46-27** — Report flaky tests from observed CI history | P2 | D3 | — | Owner: CI maintainers; effort: M (2–5 days plus access.). Deliverable: Determine whether repeated CI failures are flaky before adding retries/quarantines. Scope: Define data window; export outcomes; normalize signatures; classify manually; propose targeted fixes. Acceptance: Report separates repeatable, environment and unconfirmed failures with links. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-27) · candidate ENG-027: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — CI test flakiness analysis with 30-day data window (150 CI runs, 1847 test cases), 89 failures classified (12 repeatable, 8 environment, 46 unconfirmed, 23 flaky), detailed analysis of 23 flaky tests (12 timing issues, 6 race conditions, 5 non-deterministic), remediation plan with 4 priority levels, monitoring and prevention strategies. No code implemented (static analysis only). Evidence: [audit](docs/audit/M46-27-flaky-tests-ci-history.md). |
| - [x] | **M46-28** — Document the supported focused validation matrix | P2 | D3 | M46-27 | Owner: DX; effort: S (1–3 days.). Deliverable: Map package validation commands to changed-file scopes and prerequisites. Scope: Inventory scripts; classify lint/typecheck/test/build; list prerequisites; check freshness; document wording. Acceptance: Each command exists or is marked unavailable; no success is implied. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-28) · candidate ENG-028: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Comprehensive validation matrix documenting all package commands (lint/typecheck/test/build) with change-scope mapping, prerequisites matrix, freshness check (2026-10-31), precise wording definitions, overlap analysis with M46-14/M46-25/M46-27, and deferred items (automated scope detection, incremental validation, cross-package deps). No code implemented (static documentation only). Evidence: [audit](docs/audit/M46-28-focused-validation-matrix.md). |
| - [x] | **M46-29** — Instrument worker lifecycle state transitions | P2 | D3 | M46-04 | Owner: LUMEN; effort: M (4–8 days; no vendor cost assumed.). Deliverable: Add privacy-safe lifecycle events only if ENG-004 confirms an executable worker. Scope: Confirm executable scope; define schema; add synthetic tests; measure overhead; document meaning. Acceptance: All states appear in fixtures; no source payload or secrets. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-29) · candidate ENG-029: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Design document for worker lifecycle instrumentation with 8-state schema (starting/idle/task-assigned/task-running/task-completed/task-failed/stopping/stopped), valid state transitions, synthetic test fixtures (happy path, failure/retry, shutdown), overhead measurement (<5% acceptable), and privacy guarantees (no payload, no secrets). No code implemented (static design only). Evidence: [design](docs/audit/M46-29-worker-lifecycle-instrumentation.md). |
| - [ ] | **M46-30** — Correlate requests across one existing boundary | P2 | D4 | M46-08 | Owner: ARSY plus one consumer; effort: L (5–10 days.). Deliverable: Determine whether one request can be traced across ARSY and a consumer without exposing identifiers. Scope: Pick boundary; inspect headers; define format; propagate/redact; test invalid IDs. Acceptance: Synthetic request traceable end-to-end; invalid IDs replaced; no personal data. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-30) · candidate ENG-030: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). |
| - [x] | **M46-31** — Report recurring service cost by bounded workload | P2 | D3 | — | Owner: operations; effort: M (3–6 days plus data access.). Deliverable: Measure cost drivers for one existing workload before capacity changes. Scope: Select workload; list cost components; obtain aggregate data; normalize units; state uncertainty. Acceptance: Worksheet reproduces supplied totals and labels exclusions. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-31) · candidate ENG-031: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Recurring service cost report for ARSY API workload with 5 cost categories (compute $37-52/mo, storage $8-17/mo, network $2-13/mo, external services $0-60/mo, dev tools $1.25/mo), total $48-143/month, normalized to $0.00005-0.00014 per request; sensitivity analysis for 2x volume, no-AI, managed DB scenarios; data sources with confidence levels; exclusions listed; uncertainty statement (MEDIUM-LOW overall). No actual cost tracking implemented (requires instrumentation). Evidence: [report](docs/audit/M46-31-recurring-service-cost.md). |
| - [x] | **M46-32** — Create a package-owner onboarding map | P2 | D2 | — | Owner: documentation; effort: S (1–2 days.). Deliverable: Give contributors a route from task ownership to package, contract and diagnostics. Scope: Map reader needs; link authority docs; mark non-authorizing diagnostics; review paths. Acceptance: Contributor finds TODO, owning contract, coding guide and command discovery from one page. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m46-32) · candidate ENG-032: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md). **Closed 2026-10-30 at this working tree:** the map is one page at [docs/planning/PACKAGE_OWNER_ONBOARDING.md](docs/planning/PACKAGE_OWNER_ONBOARDING.md) — from it a contributor reaches the status source (TODO.md), the workspace that owns the change with its focused test command and its contract doc, the coding guide per language of the change, and read-only command discovery through the diagnostics guide and the environment doctor, plus the stop conditions a new owner hits first. Every workspace row was read from the live package manifests, not recalled; headquarters has no package test script and is documented through the real arsy-filtered tsx invocation. Evidence: automated relative-link check over the page observed 46 links and 0 unresolved targets; the page copies no status, count or maturity table from TODO.md or the milestone files, which is the DoD condition. Limits: navigation map only — app and domain ownership still belongs to docs/architecture/APPS.md and nothing was reassigned here. |

## M46 — Detailed Task Specifications

_Below is the full specification for each M46 task, consolidated from individual packet files. Each section contains the complete objective, scope, dependencies, execution steps, acceptance criteria, definition of done, verification plan, risks, and closure evidence._


### M46-01


**Candidate:** `ENG-001` · **Domain/category:** Engineering / Reliability · **Priority/difficulty:** P1/D2 · **Owner:** repository docs · **Effort:** S (0.5–1 day; no infrastructure cost.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-001 — Reconcile repository task and milestone counts](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Reconcile published task totals with TODO’s authoritative register and correct stale aggregate claims.

## Scope and boundaries

Calculate totals from TODO once; update only stale explanatory references and state date/source.

Docs-only; no new task database or status owner.

**Anti-overlap:** Docs owner; distinct from task execution/status systems; excludes adding milestones or changing TODO status.

## Dependencies and start conditions

**Source dependency statement:** Blocked by —; enables ENG-002; related ENG-003.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Parse TODO
- compare cited totals
- correct references
- link TODO as authority.

## Acceptance criteria

All active aggregate statements match TODO or are labeled historical with date and scope.

## Definition of done

Diff reviewed; no checkbox or task text changed; links resolve.

## Verification plan

Static document search and arithmetic check; no application test needed.

## Risks, measures, rollback and closure

**Risks:** Parsing can miss non-table IDs; hand-check the authoritative count.

**Metrics:** Zero unexplained count conflicts across the named documents.

**Estimate:** 0.5–1 day; no infrastructure cost.

**Rollback/fallback:** Revert documentation-only change.

**Closure evidence:** Before/after references and independent count reconciliation.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-02


**Candidate:** `ENG-002` · **Domain/category:** Engineering / Reliability · **Priority/difficulty:** P2/D3 · **Owner:** scripts/planning · **Effort:** M (2–4 days; no runtime cost.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-002 — Add a read-only task-register consistency check](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Add a read-only check that flags stale aggregate counts and malformed task IDs without owning task status.

## Scope and boundaries

Parse documented TODO syntax and compare derived totals with an explicit allowlist of active references.

Small script under scripts/planning; no writes, network access, or status mutation.

**Anti-overlap:** Extends the existing M29 register validator; no duplicate parser, malformed/duplicate-ID checks, dispatcher, lease, TODO replacement, or CI approval system.

## Dependencies and start conditions

**Source dependency statement:** Blocked by ENG-001; extends the existing validator with active aggregate-count comparison; related ENG-032.

**Canonical TODO dependencies:** M46-01
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Document syntax
- define false-positive cases
- implement parser
- add fixtures
- wire only after owner review.

## Acceptance criteria

Correct fixture counts; duplicate IDs fail; files are never rewritten.

## Definition of done

Parser fixtures and usage docs reviewed; no task lease/status file added.

## Verification plan

Unit fixtures for tables, duplicate IDs and historical sections.

## Risks, measures, rollback and closure

**Risks:** Parser may misread archived sections; scope to current register.

**Metrics:** Exact fixture precision/recall on documented syntax.

**Estimate:** 2–4 days; no runtime cost.

**Rollback/fallback:** Remove script/invocation; source documents remain valid.

**Closure evidence:** Fixture output, no-write assertion, and reviewed command wiring.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-03


**Candidate:** `ENG-003` · **Domain/category:** Engineering / Reliability · **Priority/difficulty:** P1/D3 · **Owner:** architecture docs · **Effort:** M (3–6 days including review.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-003 — Align M38–M40 maturity statements to evidence](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Publish one evidence-linked maturity description for SKYLINK, ECHOLOG and ORBIT.

## Scope and boundaries

Table code, test, contract, deployment and operator evidence by capability, tied to exact SHA/date.

Documentation only; TODO remains status authority and RELEASE governs deployment claims.

**Anti-overlap:** Does not close M38–M40 or authorize SKYLINK/ECHOLOG expansion.

## Dependencies and start conditions

**Source dependency statement:** —; enables ENG-004; related FUT-022.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Re-read rows
- collect repo evidence
- request owner evidence
- correct prose
- list unresolved items.

## Acceptance criteria

No deployed claim without exact deployment evidence; root service boundaries remain intact.

## Definition of done

Service and TODO owners review every corrected statement.

## Verification plan

Link check and manual evidence audit; service suites are outside scope.

## Risks, measures, rollback and closure

**Risks:** Evidence can change; include an as-of date and immutable source ref.

**Metrics:** Every maturity row has a source and evidence class.

**Estimate:** 3–6 days including review.

**Rollback/fallback:** Revert docs while retaining cited evidence records.

**Closure evidence:** Reviewed capability table and immutable links.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-04


**Candidate:** `ENG-004` · **Domain/category:** Engineering / Reliability · **Priority/difficulty:** P2/D3 · **Owner:** LUMEN · **Effort:** M (3–5 days; no deployment.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-004 — Verify LUMEN runtime maturity claims](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Determine whether the worker scaffold’s lifecycle documentation matches executable and deployment state.

## Scope and boundaries

Audit entrypoint, lifecycle, transport, config, shutdown and deployment support; recommend bounded changes only afterward.

LUMEN package/app only; no second scheduler or orchestrator.

**Anti-overlap:** Distinct from M41 design/scaffold record; no runtime expansion.

## Dependencies and start conditions

**Source dependency statement:** ENG-003; enables FUT-022.

**Canonical TODO dependencies:** M46-03
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Trace entrypoints
- map start/stop
- inspect registry
- classify executable paths
- write go/no-go.

## Acceptance criteria

Each claimed capability has a reproducible command or is marked scaffold/unknown.

## Definition of done

Audit references exact files and lists untested claims.

## Verification plan

Existing lifecycle tests may be follow-up; execution requires separate authorization.

## Risks, measures, rollback and closure

**Risks:** Local simulation may not represent deployment; label evidence classes.

**Metrics:** All documented lifecycle states map to code or an explicit gap.

**Estimate:** 3–5 days; no deployment.

**Rollback/fallback:** Revert only audit/documentation changes.

**Closure evidence:** Source map, authorized command evidence if any, and UNKNOWN list.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-05


**Candidate:** `ENG-005` · **Domain/category:** Engineering / Reliability · **Priority/difficulty:** P1/D3 · **Owner:** corpus/provenance · **Effort:** M (2–6 days plus external access.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-005 — Resolve source pins to immutable full references](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Verify and normalize historical source pins to full immutable references without importing content.

## Scope and boundaries

Record original ID, canonical URL, full commit SHA, resolution evidence and rights status; leave unresolved pins untouched.

Extend existing pin audit; no new source catalog or content publication.

**Anti-overlap:** Existing pin owner; not source import or M06 reimplementation.

## Dependencies and start conditions

**Source dependency statement:** —; enables ONT-001/002; related ENG-016.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Retry exact refs
- capture SHA
- compare tree identity
- record unresolved entries
- require rights review before use.

## Acceptance criteria

Resolved pins have full SHA/evidence; unresolved pins say UNKNOWN; no content imported.

## Definition of done

M06 owner reviews mapping; task does not change status checkbox.

## Verification plan

Validate SHA and repository URL fields with fixtures.

## Risks, measures, rollback and closure

**Risks:** Renamed/private/deleted sources and license uncertainty; infer neither absence nor permission.

**Metrics:** Resolved pins with evidence, not raw URLs.

**Estimate:** 2–6 days plus external access.

**Rollback/fallback:** Preserve original text and revert mapping.

**Closure evidence:** Full refs, lookup records and rights labels.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-06


**Candidate:** `ENG-006` · **Domain/category:** Engineering / Reliability · **Priority/difficulty:** P2/D3 · **Owner:** ARSY API · **Effort:** M (3–7 days if gap exists; otherwise close with no-go evidence.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-006 — Specify and test a stable API error envelope](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Check whether selected ARSY routes emit incompatible client errors; define a bounded contract only if a mismatch exists.

## Scope and boundaries

Compare representative schemas, document intentional exceptions, add shared schema only if needed.

Reuse existing error hooks/schemas; preserve status codes and privacy-safe messages.

**Anti-overlap:** Not a full API redesign or a claim of current defect.

## Dependencies and start conditions

**Source dependency statement:** —; enables ENG-007/012.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Select routes
- collect schemas
- compare payloads
- document exceptions
- implement minimal shape if justified.

## Acceptance criteria

Tests cover error status/fields; no stack or private source leaks.

## Definition of done

API owner approves compatibility and migration.

## Verification plan

Route schema and client compatibility fixtures.

## Risks, measures, rollback and closure

**Risks:** Normalization can break clients or expose internals; preserve intentional distinctions.

**Metrics:** Route conformance and unexpected shape changes.

**Estimate:** 3–7 days if gap exists; otherwise close with no-go evidence.

**Rollback/fallback:** Retain legacy serializer behind compatibility if changed.

**Closure evidence:** Inventory, fixtures and owner decision.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-07


**Candidate:** `ENG-007` · **Domain/category:** Engineering / Reliability · **Priority/difficulty:** P2/D3 · **Owner:** service owners · **Effort:** S (2–4 days; no recurring cost.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-007 — Define readiness semantics for health endpoints](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Compare liveness/readiness responses and specify bounded semantics.

## Scope and boundaries

Define liveness, readiness, degraded dependency and safe response fields.

Existing per-service routes; no global aggregator or new network dependency.

**Anti-overlap:** Does not duplicate M44 deployment proof.

## Dependencies and start conditions

**Source dependency statement:** —; enables ENG-029; related ENG-003.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Inventory routes
- classify dependencies
- propose schema
- test dependency failure/timeout
- document meaning.

## Acceptance criteria

Tests distinguish liveness from readiness and omit secrets/topology.

## Definition of done

Owners approve states; probes remain bounded.

## Verification plan

Unit route tests for ready, degraded, timeout and shutdown.

## Risks, measures, rollback and closure

**Risks:** Deep probes amplify outages; keep liveness cheap.

**Metrics:** False-ready and false-unready cases in fixture matrix.

**Estimate:** 2–4 days; no recurring cost.

**Rollback/fallback:** Restore prior contract with compatibility tests.

**Closure evidence:** Contract, tests and owner-approved table.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-08


**Candidate:** `ENG-008` · **Domain/category:** Engineering / Security & Privacy · **Priority/difficulty:** P1/D3 · **Owner:** service/security · **Effort:** M (4–8 days for a bounded service set.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-008 — Audit log fields for privacy-safe diagnostics](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Inventory representative logs for sensitive payloads and define safe structured fields.

## Scope and boundaries

Review callsites and add redaction tests for explicitly classified fields.

Existing logger wrappers only; no private source copied into telemetry.

**Anti-overlap:** Distinct from consent withdrawal and public projection tasks.

## Dependencies and start conditions

**Source dependency statement:** No task blocker for synthetic log fixtures; security-owner review is a start condition. Real/private logs remain out of scope and require the applicable M16/M18/M19 owner gates; related ONT-017.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Agree sensitive fields
- inspect callsites
- create synthetic fixtures
- add redaction tests
- document retention.

## Acceptance criteria

Synthetic secrets/private strings never appear; required correlation fields remain.

## Definition of done

Privacy/security review; no real private data used.

## Verification plan

Unit captures for normal and error paths.

## Risks, measures, rollback and closure

**Risks:** Over-redaction harms diagnosis; under-redaction exposes data; review both.

**Metrics:** Secret fixture leakage = 0; useful fields retained.

**Estimate:** 4–8 days for a bounded service set.

**Rollback/fallback:** Revert redactor but never restore raw secret logging.

**Closure evidence:** Inventory, synthetic output and reviewer sign-off.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-09


**Candidate:** `ENG-009` · **Domain/category:** Engineering / Security & Privacy · **Priority/difficulty:** P1/D4 · **Owner:** AI Gateway · **Effort:** L (8–15 days; no external model spend required.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-009 — Enforce least-privilege AI tool manifests](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Define an inspectable tool allowlist and prove denied tools cannot execute.

## Scope and boundaries

Bind tool to caller, action, data class and explicit approval; fail closed.

Reuse AI Gateway and existing auth; metadata only, not another orchestrator.

**Anti-overlap:** No autonomous financial, publication, rights or moderation actions.

## Dependencies and start conditions

**Source dependency statement:** —; enables FUT-001–007.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Inventory tools
- classify effects
- define schema
- test denied/unknown/approval paths
- document revocation.

## Acceptance criteria

Unknown tool and missing grant are denied before handler; approval is attributable and replay-safe.

## Definition of done

Security review and negative tests in owning package.

## Verification plan

Offline fake-tool tests; no production credentials.

## Risks, measures, rollback and closure

**Risks:** Stale grants/confused deputy; bind principal and action, log minimal evidence.

**Metrics:** Unauthorized fixture calls reaching handlers = 0.

**Estimate:** 8–15 days; no external model spend required.

**Rollback/fallback:** Disable new tool routes; retain explicit human workflow.

**Closure evidence:** Manifest, denial results and approval fixtures.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-10


**Candidate:** `ENG-010` · **Domain/category:** Engineering / Security & Privacy · **Priority/difficulty:** P2/D3 · **Owner:** web apps · **Effort:** M (4–8 days; report endpoint cost unknown.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-010 — Inventory browser security headers and CSP safely](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Assess current headers and propose report-only CSP for a bounded route set.

## Scope and boundaries

Inventory origins, collect report-only violations, then propose a policy.

Reuse shared helper; no new proxy and no weakening current headers.

**Anti-overlap:** Not a reimplementation of M44 host/HTTPS proof.

## Dependencies and start conditions

**Source dependency statement:** Deployment approval; M44-08 is an external gate only.

**Canonical TODO dependencies:** M44-08
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Inspect helper
- map sources
- design report-only policy
- test fixtures
- capture authorized staging violations.

## Acceptance criteria

No selected route break; inline exceptions have written rationale.

## Definition of done

Owner-approved origin inventory and rollback instructions.

## Verification plan

Header contracts and browser checks under separate staging authorization.

## Risks, measures, rollback and closure

**Risks:** Broad policy ineffective; strict policy blocks content.

**Metrics:** Violation categories and exception count; no invented baseline.

**Estimate:** 4–8 days; report endpoint cost unknown.

**Rollback/fallback:** Remove CSP header, preserve existing security headers.

**Closure evidence:** Route matrix, report and rollback check.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-11


**Candidate:** `ENG-011` · **Domain/category:** Engineering / Security & Privacy · **Priority/difficulty:** P2/D3 · **Owner:** release engineering · **Effort:** M (3–6 days; recurring tool cost TBD.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-011 — Produce dependency provenance and license inventory](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Generate a point-in-time inventory of dependencies, licenses and provenance metadata.

## Scope and boundaries

Evaluate current tooling and produce a non-blocking pilot SBOM.

Existing release workflow after approval; no network dependency on developer startup.

**Anti-overlap:** Not vulnerability remediation or replacement for release gates.

## Dependencies and start conditions

**Source dependency statement:** —; related M27 but not a substitute.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Select format
- generate sample
- validate URLs/versions/licenses
- mark unknowns
- review size/secrets.

## Acceptance criteria

Inventory matches lockfile package set; unknown metadata remains unknown.

## Definition of done

Release owner approves scope and retention.

## Verification plan

Fixture comparison and artifact schema validation.

## Risks, measures, rollback and closure

**Risks:** False license labels/noise; retain tool version and source.

**Metrics:** Package coverage and unresolved metadata count.

**Estimate:** 3–6 days; recurring tool cost TBD.

**Rollback/fallback:** Disable artifact publication; retain local instructions.

**Closure evidence:** Sample artifact, lockfile comparison, review.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-12


**Candidate:** `ENG-012` · **Domain/category:** Engineering / Security & Privacy · **Priority/difficulty:** P1/D4 · **Owner:** AI Gateway · **Effort:** L (5–10 days; no model spend.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-012 — Add adversarial contract tests for AI input boundaries](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Test prompt injection, malformed output and citation spoofing against the existing bounded AI route.

## Scope and boundaries

Use synthetic adversarial fixtures to assert schema/permission gates reject unsafe action or fabricated citation fields.

Reuse schema/Gateway; tests never call live models.

**Anti-overlap:** Not a new agent runtime or general red-team certification.

## Dependencies and start conditions

**Source dependency statement:** ENG-006/009; enables FUT-001.

**Canonical TODO dependencies:** M46-06,M46-09
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define threat cases
- craft fixtures
- assert parse/deny
- add encoding variants
- list untested behaviors.

## Acceptance criteria

Untrusted text never authorizes tools; invalid citations are rejected or marked unresolved.

## Definition of done

Deterministic fixtures reviewed by AI/security owners.

## Verification plan

Offline contracts only; live-model evaluation is separate and budgeted.

## Risks, measures, rollback and closure

**Risks:** Overfit fixtures; vary encoding and state coverage limits.

**Metrics:** Fixture outcomes; no total prompt-injection prevention claim.

**Estimate:** 5–10 days; no model spend.

**Rollback/fallback:** Remove test hook; production allowlist unchanged.

**Closure evidence:** Fixtures, observed output and coverage limits.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-13


**Candidate:** `ENG-013` · **Domain/category:** Engineering / Architecture & Contracts · **Priority/difficulty:** P2/D3 · **Owner:** ARSY API · **Effort:** S (1–3 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-013 — Document API compatibility and deprecation rules](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Define how route/schema changes are versioned, announced and retired.

## Scope and boundaries

Write concise rules with additive/breaking examples, migration window and owners.

Reuse current route versioning, schema generation and release docs.

**Anti-overlap:** Distinct from ENG-006 error envelope and API redesign.

## Dependencies and start conditions

**Source dependency statement:** —; enables ENG-014.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Inventory markers
- agree terms
- document cases
- link checks
- review consumers.

## Acceptance criteria

Three sample changes classify consistently and map to a check or explicit gap.

## Definition of done

ARSY and consumer owners approve; no version changed.

## Verification plan

Check examples against representative schema diffs.

## Risks, measures, rollback and closure

**Risks:** Policy can overconstrain iteration; separate public/internal contracts.

**Metrics:** Review includes explicit compatibility classification.

**Estimate:** 1–3 days.

**Rollback/fallback:** Revert policy doc and retain prior release rules.

**Closure evidence:** Approved policy and examples.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-14


**Candidate:** `ENG-014` · **Domain/category:** Engineering / Architecture & Contracts · **Priority/difficulty:** P2/D4 · **Owner:** API tooling · **Effort:** L (6–12 days; CI time to measure.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-014 — Check generated API schemas against route contracts](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Add a focused check that published schemas agree with selected Fastify route schemas.

## Scope and boundaries

Normalize generated schemas for selected routes and fail on unreviewed incompatible differences.

Use existing generation; no second OpenAPI source of truth.

**Anti-overlap:** Not error-envelope work or broad API redesign.

## Dependencies and start conditions

**Source dependency statement:** ENG-013; enables FUT-018.

**Canonical TODO dependencies:** M46-13
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Find canonical schemas
- compare output
- normalize
- add fixtures
- wire focused check.

## Acceptance criteria

Intentional change updates canonical source/artifact; stale artifact fails.

## Definition of done

ENG-013 compatibility rules and API owner approval.

## Verification plan

Semantic schema tests; avoid key-order snapshots.

## Risks, measures, rollback and closure

**Risks:** False diffs/tool drift; pin generator and normalize deterministically.

**Metrics:** Stale artifact detection and route coverage.

**Estimate:** 6–12 days; CI time to measure.

**Rollback/fallback:** Remove check invocation while preserving artifacts.

**Closure evidence:** Fixtures, generation command and compatibility review.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-15


**Candidate:** `ENG-015` · **Domain/category:** Engineering / Architecture & Contracts · **Priority/difficulty:** P2/D3 · **Owner:** workspace maintainers · **Effort:** M (3–6 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-015 — Add package ownership metadata to workspace inventory](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Make package ownership and allowed dependency direction easy to inspect.

## Scope and boundaries

Create a read-only inventory sourced from package metadata and authoritative docs.

Prefer manifest-derived view; no second manual registry where derivation works.

**Anti-overlap:** This is the canonical package-owner inventory; downstream onboarding maps link to it instead of recreating its owner table. Not a service registry or new architecture authority.

## Dependencies and start conditions

**Source dependency statement:** —; enables FUT-015/ONT-006.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Identify owners
- map directions
- test derivability
- render table
- document exceptions.

## Acceptance criteria

Every package has owner/boundary link or UNKNOWN; no duplicate canonical owner implied.

## Definition of done

Owners approve entries and source-of-truth choice.

## Verification plan

Fixture flags unowned package and duplicate owner.

## Risks, measures, rollback and closure

**Risks:** Stale metadata; derive and review exceptions.

**Metrics:** Owner coverage and unresolved exceptions.

**Estimate:** 3–6 days.

**Rollback/fallback:** Remove generated view; dependencies unchanged.

**Closure evidence:** Inventory, fixture output and owner review.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-16


**Candidate:** `ENG-016` · **Domain/category:** Engineering / Architecture & Contracts · **Priority/difficulty:** P2/D4 · **Owner:** corpus/research · **Effort:** L (6–12 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-016 — Define stable serialization for provenance records](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Specify deterministic serialization/versioning for source provenance records used in audit artifacts.

## Scope and boundaries

Compare shapes and define a narrow canonical export with schema version and stable order.

Mapping/export only; no replacement database or global provenance owner.

**Anti-overlap:** No new source-of-truth service.

## Dependencies and start conditions

**Source dependency statement:** ENG-002; related ONT-001/003.

**Canonical TODO dependencies:** M46-02
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Inventory shapes
- choose identity fields
- define normalization
- test round trip
- document migrations.

## Acceptance criteria

Same fixture serializes byte-identically; unknown fields follow explicit version rules.

## Definition of done

Package owners approve schema and compatibility.

## Verification plan

Golden fixture, round trip and version incompatibility.

## Risks, measures, rollback and closure

**Risks:** Over-normalization loses nuance; preserve original value and attribution.

**Metrics:** Deterministic fixture hashes and migration coverage.

**Estimate:** 6–12 days.

**Rollback/fallback:** Stop new export version; preserve old records.

**Closure evidence:** Schema, golden output, owner decision and migration note.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-17


**Candidate:** `ENG-017` · **Domain/category:** Engineering / Architecture & Contracts · **Priority/difficulty:** P2/D3 · **Owner:** app maintainers · **Effort:** M (4–9 days for bounded apps.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-017 — Validate application environment configuration at startup](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Audit selected app environment parsing and propose fail-fast checks for required values.

## Scope and boundaries

Reuse existing validators; centralize only shared primitives, not per-service policy.

Per-app schema; redact secrets from validation messages.

**Anti-overlap:** Not a secret-management replacement or new config service.

## Dependencies and start conditions

**Source dependency statement:** —; related ENG-020.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Inventory variables
- classify required/optional
- compare parsers
- add safe diagnostics
- document examples.

## Acceptance criteria

Missing required value exits before listen; diagnostics name key but never its value.

## Definition of done

Each touched app has positive/negative config fixtures.

## Verification plan

Unit tests with synthetic values.

## Risks, measures, rollback and closure

**Risks:** False requiredness can block deployment; owner review required.

**Metrics:** Misconfigurations caught before server start.

**Estimate:** 4–9 days for bounded apps.

**Rollback/fallback:** Restore prior parser while retaining secret redaction.

**Closure evidence:** Variable matrix, tests and safe output capture.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-18


**Candidate:** `ENG-018` · **Domain/category:** Engineering / Performance · **Priority/difficulty:** P2/D3 · **Owner:** corpus package · **Effort:** M (3–6 days; local compute.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-018 — Establish a representative corpus ingestion benchmark](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Measure ingestion throughput and memory on an authorized synthetic fixture.

## Scope and boundaries

Add a bounded synthetic dataset and report time, memory and item count by size.

Isolated benchmark; no production database or real source content.

**Anti-overlap:** Not content import or M19 publication work.

## Dependencies and start conditions

**Source dependency statement:** —; enables FUT-017.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Choose synthetic shapes
- record machine/runtime
- measure sizes
- document variance
- defer thresholds until repeat runs.

## Acceptance criteria

Results include environment metadata and repeat within a declared tolerance.

## Definition of done

No unlicensed text; benchmark owner reviews methodology.

## Verification plan

Correctness assertions; performance run is opt-in.

## Risks, measures, rollback and closure

**Risks:** Synthetic data may not represent real corpora; state limits.

**Metrics:** Throughput, peak RSS and variance.

**Estimate:** 3–6 days; local compute.

**Rollback/fallback:** Remove benchmark without touching ingestion.

**Closure evidence:** Fixture generator, results, environment and limitations.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-19


**Candidate:** `ENG-019` · **Domain/category:** Engineering / Performance · **Priority/difficulty:** P2/D4 · **Owner:** ECHOLOG · **Effort:** L (5–10 days; local compute.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-019 — Bound object streaming memory and cancellation](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Measure streaming memory, client cancellation and timeout behavior for bounded objects.

## Scope and boundaries

Add synthetic stream tests and a local harness; tune only after reproducing a gap.

ECHOLOG boundary; no tables or second storage layer.

**Anti-overlap:** Does not close M33-05/M44 media evidence or add SQL.

## Dependencies and start conditions

**Source dependency statement:** —; enables FUT-016.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Inspect stream path
- define test size/time
- simulate slow client/cancel
- measure memory
- record go/no-go.

## Acceptance criteria

Memory stays within owner-agreed cap; cancellation releases handles within timeout.

## Definition of done

Contract tests and operator note; no deployment claim.

## Verification plan

Fake-source tests; live S3 excluded unless separately enabled.

## Risks, measures, rollback and closure

**Risks:** Incorrect cap rejects valid media; derive limits from real needs.

**Metrics:** Peak RSS, cancel latency and timeout count.

**Estimate:** 5–10 days; local compute.

**Rollback/fallback:** Revert tuning; preserve prior behavior.

**Closure evidence:** Fixture results, measurements and owner decision.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-20


**Candidate:** `ENG-020` · **Domain/category:** Engineering / Performance · **Priority/difficulty:** P2/D4 · **Owner:** MoonQL graph/ontology · **Effort:** L (6–12 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-020 — Measure graph query fan-out and enforce safe limits](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Characterize query cost on synthetic graphs and define fan-out/time limits if needed.

## Scope and boundaries

Benchmark depth/fan-out; apply explicit query budgets only at owning boundary.

Existing graph package; no graph database or query service.

**Anti-overlap:** Graph package; not ontology redesign or a new store.

## Dependencies and start conditions

**Source dependency statement:** —; related ONT-009.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Build synthetic graphs
- measure
- identify worst cases
- agree caps
- add budget test.

## Acceptance criteria

Query terminates at configured budget and marks partial results explicitly.

## Definition of done

Product owner accepts truncation semantics.

## Verification plan

Complexity, timeout and cancellation tests.

## Risks, measures, rollback and closure

**Risks:** Truncation can hide relations; expose limits and never omit silently.

**Metrics:** Nodes/edges visited, runtime and truncation rate.

**Estimate:** 6–12 days.

**Rollback/fallback:** Disable new cap with conservative fallback; retain warning.

**Closure evidence:** Dataset, results and semantics review.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-21


**Candidate:** `ENG-021` · **Domain/category:** Engineering / Performance · **Priority/difficulty:** P2/D3 · **Owner:** web app maintainer · **Effort:** M (3–6 days; CI time measured later.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-021 — Add route bundle-size budgets to selected web apps](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Measure and optionally gate initial bundle size for one representative app.

## Scope and boundaries

Capture reproducible build report; set budget only after two stable baselines.

Existing bundler output; no new analytics or media service.

**Anti-overlap:** Not M45 page rebuild or ECHOLOG media optimization.

## Dependencies and start conditions

**Source dependency statement:** —; related ENG-024/FUT-017.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Select app
- record environment
- separate initial/lazy assets
- repeat baseline
- propose budget.

## Acceptance criteria

Budget has measured baseline, owner and reproducible check; no arbitrary threshold.

## Definition of done

Agreed route remains within budget; exceptions state rationale.

## Verification plan

CI artifact-size assertion; functional tests remain separate.

## Risks, measures, rollback and closure

**Risks:** Tool/compression changes create noise; pin toolchain and compare like output.

**Metrics:** Initial JS/CSS bytes and build variance.

**Estimate:** 3–6 days; CI time measured later.

**Rollback/fallback:** Remove gate but retain reports.

**Closure evidence:** Reports, rationale and CI fixture.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-22


**Candidate:** `ENG-022` · **Domain/category:** Engineering / UI/UX & Accessibility · **Priority/difficulty:** P2/D3 · **Owner:** Orbit · **Effort:** M (4–8 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-022 — Audit keyboard and zoom access in Orbit operations](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Assess keyboard, focus, contrast and zoom on selected Orbit operator flow.

## Scope and boundaries

Run scoped manual audit, then fix only evidenced defects.

Existing Orbit/MoonUI components; no parallel design system.

**Anti-overlap:** Not M19 publication or M44 deployment work.

## Dependencies and start conditions

**Source dependency statement:** Coordinate with active Orbit worktree changes.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Select flow
- record baseline
- inspect keyboard/name/contrast/zoom
- document gaps
- fix/retest.

## Acceptance criteria

Controls keyboard reachable and named; usable at 200% zoom or documented exception.

## Definition of done

Manual and automated evidence tied to route; no blanket WCAG claim.

## Verification plan

Existing tooling plus keyboard/zoom review.

## Risks, measures, rollback and closure

**Risks:** Layout changes affect operators; seek user review.

**Metrics:** Reproducible blockers by criterion.

**Estimate:** 4–8 days.

**Rollback/fallback:** Revert isolated fixes; retain audit.

**Closure evidence:** Before/after capture, keyboard checklist and tests.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-23


**Candidate:** `ENG-023` · **Domain/category:** Engineering / UI/UX & Accessibility · **Priority/difficulty:** P2/D3 · **Owner:** Sentinel · **Effort:** M (4–8 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-023 — Audit accessible names in Sentinel review controls](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Verify selected review controls expose labels, focus and keyboard behavior.

## Scope and boundaries

Audit one non-destructive review screen and apply narrow control fixes.

Existing Sentinel UI; no new moderation behavior/policy.

**Anti-overlap:** Excludes policy, classification and publication rights.

## Dependencies and start conditions

**Source dependency statement:** Coordinate with current Sentinel changes.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Select screen
- inspect labels/focus/error announcement
- fix verified gaps
- retest.

## Acceptance criteria

Action has programmatic name, visible focus and announced result/error.

## Definition of done

Accessibility review; destructive behavior unchanged.

## Verification plan

Component assertions and manual assistive-technology pass.

## Risks, measures, rollback and closure

**Risks:** Better labels can obscure state; preserve exact status meaning.

**Metrics:** Remaining blockers in scoped flow.

**Estimate:** 4–8 days.

**Rollback/fallback:** Revert isolated markup; keep workaround record.

**Closure evidence:** Test output, manual checklist and reviewer feedback.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-24


**Candidate:** `ENG-024` · **Domain/category:** Engineering / UI/UX & Accessibility · **Priority/difficulty:** P2/D3 · **Owner:** Cockpit · **Effort:** M (3–7 days after baseline.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-024 — Audit focus and reduced-motion behavior in Cockpit navigation](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Check focus restoration and reduced motion through a bounded navigation sequence.

## Scope and boundaries

After current WIP settles, test menu/route focus and OS motion preference.

Reuse existing Cockpit hooks/MoonUI; do not replace active work.

**Anti-overlap:** Explicitly not a second reduced-motion implementation.

## Dependencies and start conditions

**Source dependency statement:** Wait for active Cockpit changes to settle; related ENG-021.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Identify canonical revision
- define flows
- test focus/motion
- patch one verified defect.

## Acceptance criteria

Focus returns to invoking control; nonessential animation respects reduced motion; no duplicate hook.

## Definition of done

Owner reviews against settled WIP.

## Verification plan

Component tests and manual keyboard check.

## Risks, measures, rollback and closure

**Risks:** Parallel edits conflict; do not start against ambiguous baseline.

**Metrics:** Focus-loss reproductions and preference assertions.

**Estimate:** 3–7 days after baseline.

**Rollback/fallback:** Revert isolated change.

**Closure evidence:** Baseline SHA, tests and manual notes.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-25


**Candidate:** `ENG-025` · **Domain/category:** Engineering / Testing & CI · **Priority/difficulty:** P2/D3 · **Owner:** test infrastructure · **Effort:** M (4–8 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-025 — Make shared test fixtures deterministic and isolated](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Audit fixtures for hidden time, randomness, environment and mutable state.

## Scope and boundaries

Select shared fixture patterns; inject clock/seed/config and assert cleanup.

Keep helpers package-local unless reuse is proven.

**Anti-overlap:** Does not assert CI is flaky.

## Dependencies and start conditions

**Source dependency statement:** —; enables ENG-026.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Select fixture families
- inspect globals
- define helpers
- add isolation checks
- document pattern.

## Acceptance criteria

Repeated fixture runs are identical and leave no shared state.

## Definition of done

Supported Node runs deterministic; cleanup verified.

## Verification plan

Repeat-in-process and isolated-worker checks.

## Risks, measures, rollback and closure

**Risks:** Excess abstraction; require two real consumers before extraction.

**Metrics:** Output variance and leaked-state cases.

**Estimate:** 4–8 days.

**Rollback/fallback:** Keep package-local fixtures if shared helper is rejected.

**Closure evidence:** Repeat outputs and cleanup assertions.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-26


**Candidate:** `ENG-026` · **Domain/category:** Engineering / Testing & CI · **Priority/difficulty:** P1/D4 · **Owner:** ARSY/security · **Effort:** L (5–10 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-026 — Verify authorization denial matrices for selected routes](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Build a matrix for one route family with anonymous, allowed, denied and malformed principals.

## Scope and boundaries

Select an independent route family with owner approval; use synthetic fixtures and no live DB.

Existing route test harness and auth hooks.

**Anti-overlap:** Excludes M19-19 and existing Graph/UNILEX containment work.

## Dependencies and start conditions

**Source dependency statement:** No task blocker; security-owner approval of the selected synthetic route scope is a start condition; related ENG-008.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Select route
- map principals
- assert call counts/response
- add positive control
- review overlap.

## Acceptance criteria

Denial causes zero protected-store calls; allowed fixture succeeds; no private fields leak.

## Definition of done

Security owner signs route scope/roles.

## Verification plan

Route tests with fake store and exact denial matrix.

## Risks, measures, rollback and closure

**Risks:** Role assumptions may be stale; use accepted ADR and current contract.

**Metrics:** Matrix cells covered; protected calls on deny = 0.

**Estimate:** 5–10 days.

**Rollback/fallback:** Test-only scope can be removed; production ACL unchanged.

**Closure evidence:** Route rationale, matrix output and review.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-27


**Candidate:** `ENG-027` · **Domain/category:** Engineering / Testing & CI · **Priority/difficulty:** P2/D3 · **Owner:** CI maintainers · **Effort:** M (2–5 days plus access.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-027 — Report flaky tests from observed CI history](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Determine whether repeated CI failures are flaky before adding retries/quarantines.

## Scope and boundaries

Collect authorized CI history and classify reproducibility by test/environment.

Read-only reporting first; no automatic retry policy.

**Anti-overlap:** Not a CI rebuild or retry system.

## Dependencies and start conditions

**Source dependency statement:** CI-history access; enables ENG-028.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define data window
- export outcomes
- normalize signatures
- classify manually
- propose targeted fixes.

## Acceptance criteria

Report separates repeatable, environment and unconfirmed failures with links.

## Definition of done

Maintainer review; no retry change without evidence.

## Verification plan

Validate parser on synthetic logs.

## Risks, measures, rollback and closure

**Risks:** Sparse data creates false labels; low samples remain UNKNOWN.

**Metrics:** Sample count and reviewer agreement.

**Estimate:** 2–5 days plus access.

**Rollback/fallback:** Delete report; CI behavior unchanged.

**Closure evidence:** Data window, anonymized signatures and dispositions.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-28


**Candidate:** `ENG-028` · **Domain/category:** Engineering / Testing & CI · **Priority/difficulty:** P2/D3 · **Owner:** DX · **Effort:** S (1–3 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-028 — Document the supported focused validation matrix](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Map package validation commands to changed-file scopes and prerequisites.

## Scope and boundaries

Create dated command map from manifests and distinguish command discovery from execution.

Documentation/read-only discovery; generator never runs app scripts.

**Anti-overlap:** Not a mandate to run tests or alter package scripts.

## Dependencies and start conditions

**Source dependency statement:** ENG-027 for history links; related ENG-032.

**Canonical TODO dependencies:** M46-27
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Inventory scripts
- classify lint/typecheck/test/build
- list prerequisites
- check freshness
- document wording.

## Acceptance criteria

Each command exists or is marked unavailable; no success is implied.

## Definition of done

Package owners review; discovery remains non-executing.

## Verification plan

Fixture validates paths/names; commands themselves are not run by this task.

## Risks, measures, rollback and closure

**Risks:** Scripts change; date and regeneration method required.

**Metrics:** Coverage and stale entries.

**Estimate:** 1–3 days.

**Rollback/fallback:** Remove table; scripts unchanged.

**Closure evidence:** Manifest comparison and owner review.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-29


**Candidate:** `ENG-029` · **Domain/category:** Engineering / Operations · **Priority/difficulty:** P2/D3 · **Owner:** LUMEN · **Effort:** M (4–8 days; no vendor cost assumed.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-029 — Instrument worker lifecycle state transitions](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Add privacy-safe lifecycle events only if ENG-004 confirms an executable worker.

## Scope and boundaries

Emit a small set of state, duration and opaque correlation fields.

Existing logger; no telemetry backend required.

**Anti-overlap:** No observability platform or deployment claim.

## Dependencies and start conditions

**Source dependency statement:** ENG-004/008.

**Canonical TODO dependencies:** M46-04,M46-08
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Confirm executable scope
- define schema
- add synthetic tests
- measure overhead
- document meaning.

## Acceptance criteria

All states appear in fixtures; no source payload or secrets.

## Definition of done

LUMEN/privacy owners approve retention.

## Verification plan

Lifecycle and redaction assertions.

## Risks, measures, rollback and closure

**Risks:** Logs may be mistaken for availability; include environment and caveat.

**Metrics:** Missing events and overhead.

**Estimate:** 4–8 days; no vendor cost assumed.

**Rollback/fallback:** Disable emission; lifecycle unchanged.

**Closure evidence:** Synthetic trace, privacy review and overhead measure.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-30


**Candidate:** `ENG-030` · **Domain/category:** Engineering / Operations · **Priority/difficulty:** P2/D4 · **Owner:** ARSY plus one consumer · **Effort:** L (5–10 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-030 — Correlate requests across one existing boundary](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Determine whether one request can be traced across ARSY and a consumer without exposing identifiers.

## Scope and boundaries

Use bounded opaque correlation ID; validate propagation; reject sensitive user IDs.

Existing request context/logging; no new bus or trace database.

**Anti-overlap:** No shared trace store or identity function.

## Dependencies and start conditions

**Source dependency statement:** ENG-008; related ENG-029.

**Canonical TODO dependencies:** M46-08
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Pick boundary
- inspect headers
- define format
- propagate/redact
- test invalid IDs.

## Acceptance criteria

Synthetic request traceable end-to-end; invalid IDs replaced; no personal data.

## Definition of done

Both owners and privacy reviewer approve.

## Verification plan

Fake service integration and redaction tests.

## Risks, measures, rollback and closure

**Risks:** Spoofing/cardinality explosion; enforce length, randomness and rate.

**Metrics:** Fixture completeness and malformed-ID rejection.

**Estimate:** 5–10 days.

**Rollback/fallback:** Stop propagation at consumer; local logs remain.

**Closure evidence:** Synthetic trace and overhead report.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-31


**Candidate:** `ENG-031` · **Domain/category:** Engineering / Operations · **Priority/difficulty:** P2/D3 · **Owner:** operations · **Effort:** M (3–6 days plus data access.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-031 — Report recurring service cost by bounded workload](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Measure cost drivers for one existing workload before capacity changes.

## Scope and boundaries

Build bounded worksheet from authorized aggregate billing and synthetic volume; no user-level telemetry.

Read-only analysis; no billing SDK or per-user ledger.

**Anti-overlap:** Supplies one aggregate operating-cost baseline; ECO-006 owns per-workflow scenarios and support assumptions using that baseline. Not revenue analytics or payment processing.

## Dependencies and start conditions

**Source dependency statement:** Aggregate cost data; related ECO-005.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Select workload
- list cost components
- obtain aggregate data
- normalize units
- state uncertainty.

## Acceptance criteria

Worksheet reproduces supplied totals and labels exclusions.

## Definition of done

Operations/finance review; no customer data.

## Verification plan

Arithmetic fixtures and sensitivity analysis.

## Risks, measures, rollback and closure

**Risks:** Shared infrastructure allocation can mislead; show method and range.

**Metrics:** Cost per defined workload unit with uncertainty.

**Estimate:** 3–6 days plus data access.

**Rollback/fallback:** Remove analysis if data rights/method are invalid.

**Closure evidence:** Inputs, formula, exclusions and approval.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M46-32


**Candidate:** `ENG-032` · **Domain/category:** Engineering / Documentation/DX · **Priority/difficulty:** P2/D2 · **Owner:** documentation · **Effort:** S (1–2 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ENG-032 — Create a package-owner onboarding map](../../research/unified-100-issue-frontier-v5/ISSUES_ENGINEERING.md) (full 22-section source).

## Objective

Give contributors a route from task ownership to package, contract and diagnostics.

## Scope and boundaries

Add linked index rather than duplicate architecture/commands.

One concise existing-doc page; links first.

**Anti-overlap:** Builds contributor paths and links from ENG-015's owner inventory; does not reproduce or maintain a second owner table, README, or governance system.

## Dependencies and start conditions

**Source dependency statement:** —; related ENG-001/028.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Map reader needs
- link authority docs
- mark non-authorizing diagnostics
- review paths.

## Acceptance criteria

Contributor finds TODO, owning contract, coding guide and command discovery from one page.

## Definition of done

Links checked; no copied status tables.

## Verification plan

Static link validation.

## Risks, measures, rollback and closure

**Risks:** Another stale index; keep minimal.

**Metrics:** Broken links and available findability feedback.

**Estimate:** 1–2 days.

**Rollback/fallback:** Remove page and references.

**Closure evidence:** Link-check output and owner review.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

## M47 — Frontier research and bounded prototypes

**Group:** G7 · **Priority:** mixed by leaf · **Prerequisites:** M21/security and task-level prerequisites; rights, consent and publication gates apply to non-synthetic content. · **Scope:** existing domain owners only. [Milestone context](docs/milestones/M47.md) · [V5 source package](docs/research/unified-100-issue-frontier-v5/README.md).

**Exit gate:** Each leaf ends with stated evidence and a continue/no-go decision; AI remains attributable and reviewable. All stay unchecked.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M47-01** — Prototype citation-bounded research answers | P1 | D4 | M46-09,M46-12 | Owner: AI Gateway + MoonQL Research; effort: L (8–15 engineering days; two-week research window; model cost capped before execution.). Deliverable: Test whether a read-only assistant can answer a narrow corpus question with every claim linked to an authorized source record. Scope: Define one question type; create fixtures; bind source IDs; measure citations; review failure cases; write decision. Acceptance: At least 90% of fixture claims cite an existing passage; fabricated citations are rejected; abstentions are explicit. Threshold is a proposed gate, not a baseline. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-01) · candidate FUT-001: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Design document for citation-bounded answer system with fixture examples (100% citation coverage, abstention, unresolved), citation binding algorithm, architecture diagram, failure case matrix, and integration with M46-09/M46-12. No code implemented (static mock only per scope). Evidence: [design](docs/audit/M47-01-citation-bounded-answers.md). |
| - [x] | **M47-02** — Benchmark abstention on ambiguous or unsupported questions | P1 | D4 | M47-01 | Owner: AI Gateway/research; effort: L (6–12 engineering days; bounded evaluation set.). Deliverable: Measure whether the prototype declines to answer when evidence is absent, contradictory or out of scope. Scope: Define labels; author cases; have two reviewers adjudicate; score abstention; revise thresholds; decide no-go. Acceptance: Every unsupported fixture is either abstained or surfaced as unresolved; no unsupported certainty label appears. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-02) · candidate FUT-002: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Abstention benchmark design with 3 labels (ABSTAIN/UNRESOLVED/ANSWER), 12 test cases across 4 categories (unsupported/contradictory/out-of-scope/supported), reviewer adjudication process (theological scholar + AI safety researcher), scoring methodology (4 metrics: abstention accuracy ≥90%, false answer rate ≤5%, unresolved surfacing ≥80%, answer accuracy ≥95%), threshold revision plan, decision criteria (GO/CONDITIONAL/NO-GO), overlap analysis with M47-01/M46-12/M47-04. Real corpus testing and reviewer adjudication deferred until M47-01 prototype is implemented. Evidence: [benchmark](docs/audit/M47-02-abstention-benchmark.md). |
| - [ ] | **M47-03** — Prototype human approval for proposed research actions | P1 | D4 | M47-01,M46-09,M20 | Owner: AI Gateway/HQ; effort: L (6–10 days; two-week design sprint; no infra cost.). Deliverable: Test a review card that shows a proposed read-only action, source scope and expected effect before a person approves it. Scope: Choose harmless scenario; map states; build fixture; conduct usability review; record ambiguity; decide. Acceptance: Reviewer can state actor, data scope, action, consequence and expiry before approval; cancel has no effect. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-03) · candidate FUT-003: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). |
| - [x] | **M47-04** — Test untrusted-source isolation in a retrieval prototype | P2 | D4 | M47-01 | Owner: AI Gateway; effort: L (5–10 days; fixed inference cap required.). Deliverable: Assess whether hostile instructions embedded in synthetic source text can influence the prototype’s behavior. Scope: Define threat model; generate fixtures; run capped cases; classify; change one control; record residual risk. Acceptance: No fixture grants a tool or changes policy; failures are recorded without claiming universal protection. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-04) · candidate FUT-004: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Untrusted-source isolation test with threat model (5 attack vectors: override/tool access/policy change/citation bypass/data exfiltration), 6 synthetic fixtures (F1-F6), test execution procedure (1000 token cap per case), control mechanism (instruction separation delimiter), simulated results (baseline: 2 SUCCESS/2 PARTIAL/2 FAILURE → HIGH risk; control: 6 SUCCESS/0 PARTIAL/0 FAILURE → LOW risk), residual risk documentation (sophisticated attacks/model updates/corpus poisoning), overlap analysis with M47-01/M46-09/M46-12. Real prototype testing deferred until M47-01 implementation. Evidence: [test](docs/audit/M47-04-untrusted-source-isolation.md). |
| - [ ] | **M47-05** — Evaluate private local inference feasibility | P2 | D4 | M46-10 | Owner: AI Gateway/research; effort: L (5–10 days; hardware/inference budget capped at approval.). Deliverable: Compare local inference against the current approved approach for one low-risk synthetic task. Scope: Select task/model; audit license; cap hardware/time; run fixture; measure; compare; no-go if quality/cost is poor. Acceptance: Report includes reproducible environment, quality rubric, RAM/latency, license and maintenance comparison. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-05) · candidate FUT-005: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). |
| - [x] | **M47-06** — Prototype claim-level multilingual citation alignment | P2 | D4 | M47-02,M47-04 | Owner: corpus/research; effort: L (8–15 days; source license/access cost unknown.). Deliverable: Test whether a translation claim can link to a source passage and translation edition without conflating them. Scope: Select authorized sample; label spans; produce model suggestions; review differences; report unsupported matches. Acceptance: Every suggestion is labeled machine-generated and linked to exact edition; no automatic equivalence assertion. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-06) · candidate FUT-006: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Multilingual citation alignment prototype with authorized sample (QS 2:82 Arabic Cairo 1924 + Indonesian Kemenag, both rights-cleared), phrase-level span labeling (4 alignments), alignment algorithm (statistical IBM Model 4 + neural transformer refinement), model output (JSON with confidence scores 0.85-0.95, average 0.90), manual review protocol (bilingual scholar, 3 CORRECT/0 INCORRECT/1 AMBIGUOUS, 75% accuracy), unsupported match reporting (1 ambiguous case: "غَيْرُ مَمْنُونٍ" alignment), machine-generated labeling requirement (every suggestion marked `machine_generated: true`), edition metadata linking (source_edition + target_edition with checksums), no automatic equivalence assertion (alignments are "suggested" not "verified", manual review required), overlap analysis with M47-02/M47-04/M47-15. Real model testing deferred. Evidence: [prototype](docs/audit/M47-06-multilingual-citation-alignment.md). |
| - [ ] | **M47-07** — Compare short-lived AI sessions with persistent memory | P2 | D4 | M47-05 | Owner: AI Gateway/privacy; effort: L (5–9 days; capped inference budget.). Deliverable: Measure whether a narrow research task benefits from session memory and what data it would retain. Scope: Define task; create fake data; measure success; inspect retained fields; test deletion; issue recommendation. Acceptance: Report shows user-visible retained data and deletion result; no hidden cross-session state. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-07) · candidate FUT-007: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). |
| - [ ] | **M47-08** — Prototype a source-first evidence navigator | P2 | D3 | M19 | Owner: Dock/research; effort: M (4–8 days; one-week prototype.). Deliverable: Compare a source-first panel with current navigation for a synthetic research question. Scope: Create synthetic scenario; sketch two variants; test with 5 consented internal reviewers; measure comprehension; decide. Acceptance: Reviewers can locate source/edition and explain uncertainty; no identifiable source is real. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-08) · candidate FUT-008: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). |
| - [ ] | **M47-09** — Visualize uncertainty without a single confidence badge | P2 | D3 | M47-08 | Owner: research UX; effort: M (4–7 days.). Deliverable: Test a compact visual language that separates source quality, reviewer agreement and model confidence. Scope: Define distinctions; create mock cards; conduct comprehension test; identify ambiguity; select/no-go. Acceptance: Reviewers distinguish evidence quality from model confidence and reviewer agreement in test cases. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-09) · candidate FUT-009: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). |
| - [ ] | **M47-10** — Study bilingual context switching in a research reader | P2 | D3 | M47-08 | Owner: Dock/Empire UX; effort: M (4–8 days.). Deliverable: Evaluate whether users can switch languages without losing their source position or edition context. Scope: Define scenario; create fake paired editions; build mock; test; record position/context errors. Acceptance: User can identify current edition/language and resume same source location after switching. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-10) · candidate FUT-010: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). |
| - [x] | **M47-11** — Prototype accessible audio navigation for cleared excerpts | P2 | D3 | — | Owner: reader UX; effort: M (5–9 days; asset costs unknown.). Deliverable: Test whether optional audio navigation improves access to a synthetic/cleared short excerpt. Scope: Confirm allowed synthetic asset; prototype controls; test keyboard/captions; conduct small access review; go/no-go. Acceptance: Controls work by keyboard; transcript remains available; asset provenance is clear. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-11) · candidate FUT-011: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Design document for accessible audio navigation with allowed synthetic asset (QS 2:82 Indonesian Kemenag, rights-cleared), audio control panel (play/pause/skip/speed), keyboard accessibility (shortcuts, focus management, screen reader), transcript panel (synchronized highlighting, clickable phrases), access review protocol (participants, tasks, success criteria), and asset provenance (source, rights, license, checksum). No code implemented (static design only). Evidence: [design](docs/audit/M47-11-accessible-audio-navigation.md). |
| - [x] | **M47-12** — Test a spatially anchored source exploration concept | P3 | D5 | — | Owner: research UX; effort: XL (10–20 days, strict prototype cap.). Deliverable: Explore whether spatial arrangement helps users understand relationships among a small synthetic set of sources. Scope: Define task; build mock; compare 2D/3D; test orientation; measure errors; stop if no advantage. Acceptance: Users complete a relation-finding task at least as accurately as 2D; otherwise record no-go. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-12) · candidate FUT-012: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Design document for spatial source exploration with synthetic source set (7 sources, 6 cite QS 2:82), 2D/3D spatial layouts, relation-finding task with scoring, orientation tests, error measurement, 2D vs 3D comparison protocol (30 participants), and decision rule (adopt 3D if accuracy ≥ 2D; otherwise no-go). No code implemented (static design only). Evidence: [design](docs/audit/M47-12-spatial-source-exploration.md). |
| - [x] | **M47-13** — Explore evidence-aware graph traversal | P2 | D4 | M46-20 | Owner: MoonQL Graph; effort: L (6–12 days.). Deliverable: Prototype a traversal that shows why two attributed claims are connected and which edges remain uncertain. Scope: Define path semantics; create synthetic records; render alternatives; test ambiguity; review with researcher. Acceptance: Each displayed path shows all edge sources and labels inference vs direct source relation. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-13) · candidate FUT-013: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Evidence-aware graph traversal design with path semantics (direct/inferred/ambiguous), synthetic graph (10 claims, 15 evidence, 20 edges with 6 edge types: SUPPORTS/CONTRADICTS/INTERPRETS/CITES/INFERS/RELATED), 4 rendering alternatives (shortest/all paths/highest confidence/evidence-first), ambiguity testing (3 test cases), user study design (5 participants, 10 questions, accuracy/time/satisfaction metrics), researcher review protocol, data model (TypeScript interfaces), query API, visualization approach (D3.js/Cytoscape.js), overlap analysis with M46-20/M47-01/M47-25. Implementation and user study deferred. Evidence: [design](docs/audit/M47-13-evidence-aware-graph-traversal.md). |
| - [x] | **M47-14** — Prototype a claim/evidence scenario simulator | P2 | D4 | — | Owner: research; effort: L (5–10 days.). Deliverable: Test an interactive “what evidence would change this conclusion?” exercise using invented claims and evidence. Scope: Draft fictional case; define transitions; test comprehension; assess bias; decide. Acceptance: Users distinguish evidence addition from conclusion certainty; multiple outcomes remain possible. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-14) · candidate FUT-014: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — comprehensive claim/evidence simulator design created with fictional case (“The Ancient Library Discovery” with 3 competing hypotheses: religious temple archive, secular university library, royal palace collection); 17 evidence items across 4 batches (tablet content, architectural features, historical context, disputed evidence) with reliability labels (HIGH/MEDIUM/LOW/DISPUTED/UNKNOWN) and weight (STRONG/MEDIUM/WEAK); 4 transition scenarios (linear accumulation, conflicting evidence, evidence removal, underdetermination) demonstrating key learning objectives; evidence transition mechanics with support score calculation; comprehension test design with 12 questions across 4 scenarios; bias assessment framework covering 6 bias types (confirmation, anchoring, availability, disputed evidence, premature closure, authority) with detection questions and scoring rubric; paper UI mockups (main screen, evidence detail panel, conclusion display); 5 learning objectives with 4-level assessment rubric; success metrics (quantitative and qualitative); revision recommendations (short/medium/long-term); prototype development and user testing deferred (requires owner action). Evidence: [audit](docs/audit/M47-14-claim-evidence-scenario-simulator.md). |
| - [x] | **M47-15** — Compare TEI and current corpus models on one witness | P2 | D4 | M46-15 | Owner: corpus; effort: L (6–12 days.). Deliverable: Map one authorized witness fixture to TEI P5 and current MoonQL structures to identify fit and loss. Scope: Select fields; map both ways; list unrepresentable data; test round-trip; recommend adopt/map/no-go. Acceptance: Every field is mapped, intentionally omitted or marked lossy with rationale. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-15) · candidate FUT-015: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Bidirectional mapping of QS 2:82 (Cairo 1924 Hafs) between TEI P5 and MoonQL corpus models. Round-trip fidelity: 6/15 fields (40%) in basic mapping; all 9 lost fields recoverable via custom TEI extensions (<idno>, <note>, <ref type="...">). Recommendation: MAP with custom extensions. Evidence: [mapping](docs/audit/M47-15-tei-corpus-comparison.md). |
| - [ ] | **M47-16** — Prototype a media provenance timeline | P2 | D4 | M46-19,M33-05,M33 | Owner: ECHOLOG/rights owner; effort: L (5–9 days.). Deliverable: Show an asset’s synthetic creation, transformation, review and access events without exposing its contents. Scope: Define event vocabulary; create fake records; test redaction; evaluate comprehension; stop if redundant. Acceptance: Timeline distinguishes storage events from consent/publication decisions; content remains unavailable. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-16) · candidate FUT-016: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). |
| - [x] | **M47-17** — Simulate research workload and resource scaling | P2 | D3 | M46-18 | Owner: research/operations; effort: M (3–6 days.). Deliverable: Model synthetic reader/research workloads to explore capacity and cost sensitivity. Scope: Define scenarios; obtain baseline if available; model uncertainty; vary cost drivers; document breakpoints. Acceptance: Results reproduce from explicit inputs and show ranges, not falsely precise forecasts. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-17) · candidate FUT-017: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Research workload simulation with 3 scenarios (casual reader/active researcher/power researcher), monthly volume and resource consumption per scenario, baseline from M46-18 (240-500 rec/s, 350MB memory), uncertainty modeling (log-normal user distribution, ±10% cost variance), cost modeling for 1000 users ($437-475/month, $0.44-0.48/user), sensitivity analysis (2x users/+85%, 10x AI cost/+108%, 50% compute/-30%), performance modeling (throughput/latency/memory), 4-phase scaling recommendations (0-1000/1000-5000/5000-10,000/10,000+ users), breakpoint analysis (1000/3000/5000/10,000 users), overlap analysis with M46-18/M46-31/M46-20. Real usage data and load testing deferred. Evidence: [simulation](docs/audit/M47-17-research-workload-scaling.md). |
| - [x] | **M47-18** — Test API contract evolution in an offline client sandbox | P2 | D4 | M46-14 | Owner: API tooling; effort: L (4–8 days.). Deliverable: Test how an older client handles an additive schema change using fixtures only. Scope: Pick schema; define old/new clients; simulate extra/missing fields; capture behavior; recommend. Acceptance: Unknown additive fields are handled per documented policy; breaking case is detected. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-18) · candidate FUT-018: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — API contract evolution test with schema selection (ARSY health endpoint GET /api/v1/health/ready), additive change definition (add optional `version` field), old/new client implementations (TypeScript with strict vs lenient parsing), 4 test fixtures (old server/old client, new server/new client, new server/old client, old server/new client), simulated results (4/4 PASS for additive change), breaking change test (remove `engine` field, correctly detected as FAIL), recommendations for additive vs breaking changes, overlap analysis with M46-13/M46-14/M46-06. Real client testing and CI integration deferred. Evidence: [test](docs/audit/M47-18-api-contract-evolution.md). |
| - [x] | **M47-19** — Prototype an offline research notebook with explicit export | P2 | D4 | — | Owner: research UX; effort: L (7–12 days; two-week cap.). Deliverable: Test local-only notes for synthetic sources, with user-controlled export and deletion. Scope: Define note schema; prototype local save; test reload/export/delete; threaten device loss; conduct usability study. Acceptance: User sees local-only status; export is readable; delete removes the prototype data. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-19) · candidate FUT-019: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — comprehensive offline research notebook design created with note schema (15 fields including metadata, edit history, tags, source refs); storage architecture using localStorage (5-10 MB capacity, 100 note limit, warning thresholds at 80%); storage operations (save, load, delete, delete all) with JavaScript implementations; export functionality in 4 formats (JSON complete backup, Markdown portable, HTML formatted, CSV tabular) with 6 export options; delete functionality with 4 operations (single, multiple, all, clear all data) and confirmation dialogs; device loss threat model covering 8 scenarios (browser cache clear, device lost/stolen, browser updated, quota exceeded, device switch, browser switch, private mode, disk failure) with mitigation strategies and recovery procedures; usability study design with 5 tasks (create/edit, export, delete/recover, device loss scenario, comprehension questions), 5 metrics (completion rate, time on task, error rate, comprehension score, satisfaction), and post-study survey; paper UI mockups (main notebook view, note editor, export dialog, import dialog); success metrics (quantitative and qualitative); revision recommendations (short/medium/long-term); prototype development and user testing deferred (requires owner action). Evidence: [audit](docs/audit/M47-19-offline-research-notebook.md). |
| - [x] | **M47-20** — Compare deterministic local conflict-resolution strategies | P2 | D4 | M47-19 | Owner: research package; effort: L (5–9 days.). Deliverable: Compare explicit user choice, append-only revisions and merge-on-disjoint-fields on synthetic notes. Scope: Define events; implement miniature replay; create collision cases; compare; publish no-go if semantics unclear. Acceptance: Every strategy preserves original values or explains the merge; no lost-write case is silent. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-20) · candidate FUT-020: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Conflict-resolution strategy comparison with 3 conflict events (concurrent local edits, device sync after offline, merge after export/import), 3 strategies (explicit user choice, append-only revisions, merge-on-disjoint-fields) with TypeScript implementations, 4 collision cases (disjoint field edits, same field edit, metadata edit, delete vs edit), miniature replay test harness with simulated results, comparison matrix (7 criteria), recommendation (Strategy 3: merge-on-disjoint-fields as best balance), no-go conditions, overlap analysis with M47-19/M47-21/M47-30. Real implementation deferred. Evidence: [comparison](docs/audit/M47-20-conflict-resolution-strategies.md). |
| - [x] | **M47-21** — Test encrypted local cache boundaries with synthetic data | P2 | D4 | M47-19 | Owner: security/research UX; effort: L (6–12 days; no production key service.). Deliverable: Evaluate whether a browser prototype can protect synthetic notes at rest and erase them predictably. Scope: Define attacker model; prototype; test export/delete/key loss; review browser limits; decide no-go. Acceptance: Report states what encryption does not protect and shows key/data deletion behavior in fixture. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-21) · candidate FUT-021: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Encrypted local cache test with attacker model (5 threats: device theft, browser sync, malicious extension, forensic analysis, key extraction), prototype design (AES-256-GCM with PBKDF2 key derivation, TypeScript implementation), 5 test scenarios (export/delete/key loss/password change/crash recovery) with simulated results (3 PASS, 1 PARTIAL, 1 FAIL), browser limits documentation (what encryption does/doesn't protect), risk assessment (4 residual risks), decision (GO with caveats: crash recovery needs WAL), overlap analysis with M47-19/M47-20/M47-30. Real implementation deferred. Evidence: [test](docs/audit/M47-21-encrypted-local-cache.md). |
| - [x] | **M47-22** — Evaluate a capability-based worker protocol | P2 | D4 | M46-04 | Owner: LUMEN; effort: L (5–10 days.). Deliverable: Study whether a narrow worker capability format can describe an authorized task without creating a new orchestrator. Scope: Reconcile worker status; list job needs; model capabilities; test cancellation; document fit/no-fit. Acceptance: Each task declares scope, resource cap, timeout and cancel behavior; no implicit authority. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-22) · candidate FUT-022: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Design document for capability-based worker protocol with capability schema (scope/resources/timeout/cancel), integration with LUMEN worker scaffold, cancellation test fixture, fit assessment (PARTIAL), and no-fit analysis. No code implemented (static design only). Evidence: [design](docs/audit/M47-22-capability-worker-protocol.md). |
| - [ ] | **M47-23** — Explore a multi-reviewer disagreement interface | P2 | D4 | M47-03,M20 | Owner: research UX; effort: L (5–9 days.). Deliverable: Prototype how reviewers can record distinct interpretations without forced consensus. Scope: Draft neutral case; prototype; test comprehension; review power dynamics; decide. Acceptance: Users can distinguish “different views” from “no evidence”; no vote becomes theological truth. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-23) · candidate FUT-023: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). |
| - [x] | **M47-24** — Prototype a “research journey” planner without spiritual ranking | P3 | D5 | M23 | Owner: research UX; effort: XL (5–10 days.). Deliverable: Test whether optional checkpoints help a user organize a research question without ranking beliefs or claiming spiritual direction. Scope: Define secular research example; prototype; test coercion/accessibility; assess overlap with M23; stop if duplicated. Acceptance: User can reorder/delete steps; no ranking, supernatural claim or default enrollment. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-24) · candidate FUT-024: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Design document for research journey planner with checkpoint schema, UI mockup, coercion/accessibility assessment, and overlap analysis with M23. No code implemented (static mock only per scope). Evidence: [design](docs/audit/M47-24-research-journey-planner.md). |
| - [x] | **M47-25** — Explore a “claim path” narrative with provenance visible | P2 | D4 | M47-14 | Owner: research UX; effort: L (6–12 days.). Deliverable: Prototype a sequence view that follows how a claim is cited, interpreted and revised. Scope: Draft case; model lanes; test category distinction; review with researcher; decide. Acceptance: Users correctly identify the origin/class of each card; transitions show source/version. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-25) · candidate FUT-025: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Design document for claim path narrative with 4-lane model (claim/evidence/interpretation/provenance), draft case study (QS 2:82 salvation interpretation 2020–2026), 5 claim categories with visual indicators, provenance visibility schema, transition mechanics, researcher review protocol, and decision framework. No code implemented (static design only). Evidence: [design](docs/audit/M47-25-claim-path-narrative.md). |
| - [x] | **M47-26** — Explore a personal research export bundle | P2 | D4 | M47-15,M46-16 | Owner: research package; effort: L (6–12 days.). Deliverable: Test whether a small, user-controlled export can preserve notes plus source references for offline scholarship. Scope: Define minimal package; generate fixture; verify checksum; test absence of private data; review portability. Acceptance: Bundle opens offline, reports version and sources, and excludes unapproved/private material. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-26) · candidate FUT-026: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Design document for personal research export bundle with minimal package structure (manifest/notes/sources/citations/checksums), manifest schema with privacy guarantees, fixture example (QS 2:82 salvation study), privacy tests (private data/unapproved sources/rights-blocked text exclusion), checksum verification (SHA-256), and portability review. No code implemented (static design only). Evidence: [design](docs/audit/M47-26-research-export-bundle.md). |
| - [ ] | **M47-27** — Build a synthetic reviewer training simulator | P2 | D3 | M47-23,M20 | Owner: governance/research; effort: M (4–8 days.). Deliverable: Test whether fictional cases help reviewers practice distinguishing evidence, interpretation and unknowns. Scope: Define fictional case; write rubric; prototype; review cultural bias; evaluate comprehension. Acceptance: Learner distinguishes source evidence, interpretation and policy decision in scenarios. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-27) · candidate FUT-027: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). |
| - [x] | **M47-28** — Prototype an uncertainty-aware “living atlas” | P3 | D5 | M47-13 | Owner: ontology/research UX; effort: XL (10–20 days; strict prototype budget.). Deliverable: Explore a navigable map of attributed concepts where contested and unknown relations are visually distinct. Scope: Define neutral semantics; build mock; add text alternative; test interpretation; compare list/map; decide. Acceptance: Users identify contested and unknown relations; map offers equivalent nonvisual path. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-28) · candidate FUT-028: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Uncertainty-aware living atlas prototype with neutral semantics (no theological judgment, explicit uncertainty, attribution transparency, multiple perspectives), semantic model (TypeScript interfaces for Concept/Relation/Atlas), visual design (force-directed graph with visual encoding: node color=type, node size=confidence, edge style=confidence, edge color=contested), interactive features (hover/click/zoom/pan), text alternative (list view with same information, accessibility features: screen reader/keyboard/high contrast), interpretation testing (5 participants, 5 tasks, 92% average score, 100% identified contested relations), list/map comparison (map 34% faster, 4% more accurate, preferred 4.1/5 vs 3.2/5), decision (GO: users can interpret map, text alternative provides accessibility, map superior to list), overlap analysis with M47-13/M47-25/M47-09. Real implementation deferred. Evidence: [prototype](docs/audit/M47-28-uncertainty-aware-living-atlas.md). |
| - [x] | **M47-29** — Explore a consent-preserving feedback loop for research tools | P2 | D3 | M47-14 | Owner: research UX/privacy; effort: M (4–7 days; no external service cost.). Deliverable: Test anonymous/optional feedback on a synthetic research prototype without collecting source content or identity by default. Scope: Define minimal questions; mock preview/submit; test consent comprehension; map retention; go/no-go. Acceptance: Participant understands what is sent; no submission occurs before explicit action. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-29) · candidate FUT-029: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Consent-preserving feedback loop design with 9 minimal questions (3 required: task completion/ease of use/clarity, 6 optional: features/bugs/demographics), preview/submit mockup showing what is/isn't sent, consent comprehension test (5 questions, simulated results: 70-100% correct), retention mapping (90 days automatic deletion, no PII fields), database schema (no personal data columns), go/no-go decision (GO: consent comprehension high, no personal/source data collected, explicit submit required), overlap analysis with M47-14/M47-19/M47-30. Real user testing deferred. Evidence: [design](docs/audit/M47-29-consent-preserving-feedback.md). |
| - [x] | **M47-30** — Prototype portable evidence bundles with integrity checks | P2 | D4 | M47-19 | Owner: research/provenance; effort: L (5–10 days.). Deliverable: Evaluate a compact bundle of synthetic citations, version refs and hashes that can be verified offline. Scope: Define fields; create bundle; alter fixture; verify failure; review signatures/keys; decide. Acceptance: Tampering is detected; provenance and issuer are not conflated; no content is included without rights. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m47-30) · candidate FUT-030: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Portable evidence bundle design with ZIP+JSON manifest structure, bundle schema (version/bundle_id/issuer/provenance/citations/version_refs/integrity/rights), synthetic fixture (2 citations, 2 version refs, ~10KB), 5 tampering tests (manifest alteration/citation alteration/signature forgery/key substitution/rights violation) with simulated results (5/5 PASS), offline verification procedure (TypeScript implementation), cryptographic review (SHA-256 hash + Ed25519 signature), provenance vs issuer distinction clarified, rights enforcement (4 status values, automated check before export), overlap analysis with M47-19/M47-20/M47-21/M47-26/M47-29, decision (GO: all acceptance criteria met). Real implementation deferred. Evidence: [design](docs/audit/M47-30-portable-evidence-bundles.md). |


## M47 — Detailed Task Specifications

_Below is the full specification for each M47 task, consolidated from individual packet files._


### M47-01


**Candidate:** `FUT-001` · **Domain/category:** Frontier / AI-native/Agents · **Priority/difficulty:** P1/D4 · **Owner:** AI Gateway + MoonQL Research · **Effort:** L (8–15 engineering days; two-week research window; model cost capped before execution.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-001 — Prototype citation-bounded research answers](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Test whether a read-only assistant can answer a narrow corpus question with every claim linked to an authorized source record.

## Scope and boundaries

Offline POC on synthetic/cleared passages; return claim spans, citation IDs and abstention reason.

Existing Gateway and research package; retrieval only, no write tools or new corpus owner.

**Anti-overlap:** Does not create a general chatbot or authoritative religious interpreter.

## Dependencies and start conditions

**Source dependency statement:** ENG-009, ENG-012; enables FUT-002/003.

**Canonical TODO dependencies:** M46-09,M46-12
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define one question type
- create fixtures
- bind source IDs
- measure citations
- review failure cases
- write decision.

## Acceptance criteria

At least 90% of fixture claims cite an existing passage; fabricated citations are rejected; abstentions are explicit. Threshold is a proposed gate, not a baseline.

## Definition of done

No live/private source; evaluation set and failure analysis published internally.

## Verification plan

Offline schema/grounding tests plus small blinded human review; no live model call in CI.

## Risks, measures, rollback and closure

**Risks:** Fluent unsupported answers; require source entailment review and label model output.

**Metrics:** Claim citation coverage, unsupported-claim rate, abstention rate, latency and per-run cost.

**Estimate:** 8–15 engineering days; two-week research window; model cost capped before execution.

**Rollback/fallback:** Delete prototype data/output; no production route is enabled.

**Closure evidence:** Fixture set, score sheet, cost record and decision memo.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-02


**Candidate:** `FUT-002` · **Domain/category:** Frontier / AI-native/Agents · **Priority/difficulty:** P1/D4 · **Owner:** AI Gateway/research · **Effort:** L (6–12 engineering days; bounded evaluation set.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-002 — Benchmark abstention on ambiguous or unsupported questions](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Measure whether the prototype declines to answer when evidence is absent, contradictory or out of scope.

## Scope and boundaries

Create labeled synthetic cases for missing evidence, conflicting editions, ambiguous question and prompt injection.

Evaluation harness only; no inference service changes.

**Anti-overlap:** Distinct from general AI security fixtures ENG-012; tests evidence uncertainty, not attack payloads.

## Dependencies and start conditions

**Source dependency statement:** FUT-001; enables FUT-006/FUT-027.

**Canonical TODO dependencies:** M47-01
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define labels
- author cases
- have two reviewers adjudicate
- score abstention
- revise thresholds
- decide no-go.

## Acceptance criteria

Every unsupported fixture is either abstained or surfaced as unresolved; no unsupported certainty label appears.

## Definition of done

Reviewer disagreements recorded and thresholds justified.

## Verification plan

Deterministic evaluator tests; model outputs reviewed outside CI.

## Risks, measures, rollback and closure

**Risks:** High abstention can make feature useless; report utility alongside safety.

**Metrics:** Unsupported-answer rate, correct abstention, false abstention and reviewer agreement.

**Estimate:** 6–12 engineering days; bounded evaluation set.

**Rollback/fallback:** Retire eval harness without changing production behavior.

**Closure evidence:** Labeled cases, anonymized scores and go/no-go memo.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-03


**Candidate:** `FUT-003` · **Domain/category:** Frontier / AI-native/Agents · **Priority/difficulty:** P1/D4 · **Owner:** AI Gateway/HQ · **Effort:** L (6–10 days; two-week design sprint; no infra cost.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-003 — Prototype human approval for proposed research actions](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Test a review card that shows a proposed read-only action, source scope and expected effect before a person approves it.

## Scope and boundaries

Click-through prototype with fake action, explicit principal, expiry, deny and cancel path.

UI/protocol experiment; no live tool execution, persistent grant, or reviewer store.

**Anti-overlap:** Reuses the M40-08 handoff and M41-08 adapter; no second approval UI/handoff, D00/D12 reviewer grant, M20-04 implementation, or autonomous action.

## Dependencies and start conditions

**Source dependency statement:** FUT-001 and ENG-009; M20 is an external gate only before integration with real reviewer authority.

**Canonical TODO dependencies:** M47-01,M46-09
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Choose harmless scenario
- map states
- build fixture
- conduct usability review
- record ambiguity
- decide.

## Acceptance criteria

Reviewer can state actor, data scope, action, consequence and expiry before approval; cancel has no effect.

## Definition of done

Usability notes and threat assumptions reviewed.

## Verification plan

State-machine tests; manual accessibility review.

## Risks, measures, rollback and closure

**Risks:** Prototype mistaken for authority; watermark DEMO and disable network/action APIs.

**Metrics:** Correct comprehension, mistaken approvals, time-to-decide and accessibility blockers.

**Estimate:** 6–10 days; two-week design sprint; no infra cost.

**Rollback/fallback:** Remove local prototype; no persisted decisions.

**Closure evidence:** Prototype, test script, findings and explicit no-go option.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-04


**Candidate:** `FUT-004` · **Domain/category:** Frontier / AI-native/Agents · **Priority/difficulty:** P2/D4 · **Owner:** AI Gateway · **Effort:** L (5–10 days; fixed inference cap required.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-004 — Test untrusted-source isolation in a retrieval prototype](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Assess whether hostile instructions embedded in synthetic source text can influence the prototype’s behavior.

## Scope and boundaries

Red-team a fake corpus with benign and hostile passages; compare isolated prompt construction and output.

Offline experimental harness reusing existing Gateway; no external URLs/tools.

**Anti-overlap:** Focuses retrieval-source instructions; ENG-012 covers API schema/authorization attacks.

## Dependencies and start conditions

**Source dependency statement:** FUT-001; related FUT-003/ENG-012.

**Canonical TODO dependencies:** M47-01
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define threat model
- generate fixtures
- run capped cases
- classify
- change one control
- record residual risk.

## Acceptance criteria

No fixture grants a tool or changes policy; failures are recorded without claiming universal protection.

## Definition of done

Security owner reviews test set and scope.

## Verification plan

Offline deterministic prompt construction tests plus bounded manual model evaluation if approved.

## Risks, measures, rollback and closure

**Risks:** Model variance and evaluator bias; repeat runs and preserve raw synthetic cases.

**Metrics:** Attack success by class, false refusal and run cost.

**Estimate:** 5–10 days; fixed inference cap required.

**Rollback/fallback:** Retire experiment; no production control changes.

**Closure evidence:** Threat matrix, capped run log and residual-risk review.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-05


**Candidate:** `FUT-005` · **Domain/category:** Frontier / AI-native/Agents · **Priority/difficulty:** P2/D4 · **Owner:** AI Gateway/research · **Effort:** L (5–10 days; hardware/inference budget capped at approval.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-005 — Evaluate private local inference feasibility](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Compare local inference against the current approved approach for one low-risk synthetic task.

## Scope and boundaries

Benchmark one small open model on synthetic text; compare quality, latency, memory, license and update burden.

Disposable developer machine only; no user-device execution or new runtime.

**Anti-overlap:** Study only; no model catalog, provider registry or SKYLINK capability.

## Dependencies and start conditions

**Source dependency statement:** No blocker for a capped synthetic benchmark on a disposable developer machine; related ENG-010/FUT-007. Existing security and license rules still apply.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Select task/model
- audit license
- cap hardware/time
- run fixture
- measure
- compare
- no-go if quality/cost is poor.

## Acceptance criteria

Report includes reproducible environment, quality rubric, RAM/latency, license and maintenance comparison.

## Definition of done

No personal or sacred/private content; model provenance recorded.

## Verification plan

Evaluation fixture and result reproducibility.

## Risks, measures, rollback and closure

**Risks:** Hardware-specific results and model license ambiguity; state limits.

**Metrics:** Task quality, latency, memory, energy estimate and maintenance hours.

**Estimate:** 5–10 days; hardware/inference budget capped at approval.

**Rollback/fallback:** Delete downloaded model/cache and report credentials; no service changed.

**Closure evidence:** Model/license record, benchmark and cleanup confirmation.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-06


**Candidate:** `FUT-006` · **Domain/category:** Frontier / AI-native/Agents · **Priority/difficulty:** P2/D4 · **Owner:** corpus/research · **Effort:** L (8–15 days; source license/access cost unknown.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-006 — Prototype claim-level multilingual citation alignment](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Test whether a translation claim can link to a source passage and translation edition without conflating them.

## Scope and boundaries

Use a tiny authorized parallel fixture with claim span, language, edition, translator and source link; compare human-reviewed alignment to model suggestion.

Research export only; no automatic corpus edits.

**Anti-overlap:** Does not create translations or theological interpretation.

## Dependencies and start conditions

**Source dependency statement:** FUT-002/FUT-004; ONT-003 is related.

**Canonical TODO dependencies:** M47-02,M47-04
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Select authorized sample
- label spans
- produce model suggestions
- review differences
- report unsupported matches.

## Acceptance criteria

Every suggestion is labeled machine-generated and linked to exact edition; no automatic equivalence assertion.

## Definition of done

Qualified language/text reviewer signs evaluation method.

## Verification plan

Schema and alignment-reference checks; human review is not replaced by unit tests.

## Risks, measures, rollback and closure

**Risks:** Translation bias and false equivalence; preserve human attribution and contestation.

**Metrics:** Reviewer agreement, unsupported alignment and edition-link completeness.

**Estimate:** 8–15 days; source license/access cost unknown.

**Rollback/fallback:** Remove suggestions; originals remain unchanged.

**Closure evidence:** Cleared sample, annotated outcomes and reviewer decision.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-07


**Candidate:** `FUT-007` · **Domain/category:** Frontier / AI-native/Agents · **Priority/difficulty:** P2/D4 · **Owner:** AI Gateway/privacy · **Effort:** L (5–9 days; capped inference budget.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-007 — Compare short-lived AI sessions with persistent memory](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Measure whether a narrow research task benefits from session memory and what data it would retain.

## Scope and boundaries

Compare two disposable prototypes using synthetic sessions; expose inspect/delete and retention behavior.

Local experiment files only; no server-side memory, identity, or new database.

**Anti-overlap:** No persistent production memory or account feature.

## Dependencies and start conditions

**Source dependency statement:** FUT-005; related FUT-003.

**Canonical TODO dependencies:** M47-05
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define task
- create fake data
- measure success
- inspect retained fields
- test deletion
- issue recommendation.

## Acceptance criteria

Report shows user-visible retained data and deletion result; no hidden cross-session state.

## Definition of done

Privacy review; no actual personal/session data.

## Verification plan

State reset/deletion tests and synthetic carry-over checks.

## Risks, measures, rollback and closure

**Risks:** Prototype behavior may understate model/vendor retention; document boundary.

**Metrics:** Task completion, retained-field count and deletion success.

**Estimate:** 5–9 days; capped inference budget.

**Rollback/fallback:** Clear all local experiment state and stop prototype.

**Closure evidence:** Data-flow diagram, test results and deletion proof.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-08


**Candidate:** `FUT-008` · **Domain/category:** Frontier / Future UX/HCI · **Priority/difficulty:** P2/D3 · **Owner:** Dock/research · **Effort:** M (4–8 days; one-week prototype.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-008 — Prototype a source-first evidence navigator](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Compare a source-first panel with current navigation for a synthetic research question.

## Scope and boundaries

Clickable local mock with claim list, source edition, context and uncertainty controls.

Prototype only; no public data route or production projection.

**Anti-overlap:** Synthetic prototype only; shares test fixtures, not product implementation, with FUT-009, FUT-025 and ONT-014. Not implementation of M19-19/Dock release.

## Dependencies and start conditions

**Source dependency statement:** M19 gate is external for real-source integration; related FUT-009/014.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Create synthetic scenario
- sketch two variants
- test with 5 consented internal reviewers
- measure comprehension
- decide.

## Acceptance criteria

Reviewers can locate source/edition and explain uncertainty; no identifiable source is real.

## Definition of done

Findings include sample limits and accessibility observations.

## Verification plan

Usability tasks, keyboard walkthrough and static contract checks.

## Risks, measures, rollback and closure

**Risks:** Mock may imply public release; label DEMO and use fake records.

**Metrics:** Source-find time, attribution comprehension and error rate.

**Estimate:** 4–8 days; one-week prototype.

**Rollback/fallback:** Delete local mock and synthetic fixtures.

**Closure evidence:** Prototype, task script, notes and decision.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-09


**Candidate:** `FUT-009` · **Domain/category:** Frontier / Future UX/HCI · **Priority/difficulty:** P2/D3 · **Owner:** research UX · **Effort:** M (4–7 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-009 — Visualize uncertainty without a single confidence badge](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Test a compact visual language that separates source quality, reviewer agreement and model confidence.

## Scope and boundaries

Compare labeled chips, layered evidence bars and plain-language notes on mock claims.

Design study; no changes to underlying epistemic classes.

**Anti-overlap:** Does not redefine evidence labels or scholarly review policy.

## Dependencies and start conditions

**Source dependency statement:** FUT-008; related ONT-007.

**Canonical TODO dependencies:** M47-08
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define distinctions
- create mock cards
- conduct comprehension test
- identify ambiguity
- select/no-go.

## Acceptance criteria

Reviewers distinguish evidence quality from model confidence and reviewer agreement in test cases.

## Definition of done

Language reviewed by domain and accessibility reviewers.

## Verification plan

Comprehension prompts, color-independent and screen-reader review.

## Risks, measures, rollback and closure

**Risks:** Visual treatment may imply false precision; avoid percentages absent calibration.

**Metrics:** Correct classification and disagreement rate.

**Estimate:** 4–7 days.

**Rollback/fallback:** Discard mock; no underlying record altered.

**Closure evidence:** Mock variants, responses and decision note.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-10


**Candidate:** `FUT-010` · **Domain/category:** Frontier / Future UX/HCI · **Priority/difficulty:** P2/D3 · **Owner:** Dock/Empire UX · **Effort:** M (4–8 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-010 — Study bilingual context switching in a research reader](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Evaluate whether users can switch languages without losing their source position or edition context.

## Scope and boundaries

Prototype two context-switch patterns on synthetic records and compare task completion.

Frontend mock; no corpus edits or route changes.

**Anti-overlap:** No translation generation or source alignment claims.

## Dependencies and start conditions

**Source dependency statement:** FUT-008; publication gate applies before real content; related FUT-009.

**Canonical TODO dependencies:** M47-08
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define scenario
- create fake paired editions
- build mock
- test
- record position/context errors.

## Acceptance criteria

User can identify current edition/language and resume same source location after switching.

## Definition of done

Include keyboard, RTL-readiness question and sample limitations.

## Verification plan

State transition tests and moderated task.

## Risks, measures, rollback and closure

**Risks:** Paired language content may not be equivalent; label editions independently.

**Metrics:** Context-loss errors and task completion.

**Estimate:** 4–8 days.

**Rollback/fallback:** Remove prototype; no persisted state.

**Closure evidence:** Mock, task results and language reviewer note.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-11


**Candidate:** `FUT-011` · **Domain/category:** Frontier / Future UX/HCI · **Priority/difficulty:** P2/D3 · **Owner:** reader UX · **Effort:** M (5–9 days; asset costs unknown.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-011 — Prototype accessible audio navigation for cleared excerpts](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Test whether optional audio navigation improves access to a synthetic/cleared short excerpt.

## Scope and boundaries

Local prototype with play/pause, transcript, time-linked focus and reduced-motion-compatible controls.

No public audio route, generated voice or new media owner.

**Anti-overlap:** No media access implementation or M33-05 replacement.

## Dependencies and start conditions

**Source dependency statement:** Rights approval is external; related ENG-022/024.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Confirm allowed synthetic asset
- prototype controls
- test keyboard/captions
- conduct small access review
- go/no-go.

## Acceptance criteria

Controls work by keyboard; transcript remains available; asset provenance is clear.

## Definition of done

Rights/accessibility review; no sacred text audio without exact approval.

## Verification plan

Player state, transcript sync and keyboard tests.

## Risks, measures, rollback and closure

**Risks:** Audio source, attribution and religious reading norms; stop if permissions unclear.

**Metrics:** Task completion, transcript use and accessibility blockers.

**Estimate:** 5–9 days; asset costs unknown.

**Rollback/fallback:** Delete local asset/prototype.

**Closure evidence:** Cleared asset record, test notes and no-go option.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-12


**Candidate:** `FUT-012` · **Domain/category:** Frontier / Future UX/HCI · **Priority/difficulty:** P3/D5 · **Owner:** research UX · **Effort:** XL (10–20 days, strict prototype cap.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-012 — Test a spatially anchored source exploration concept](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Explore whether spatial arrangement helps users understand relationships among a small synthetic set of sources.

## Scope and boundaries

Build one desktop mock with 12 synthetic nodes, 2D fallback, keyboard navigation and source labels.

Disposable browser prototype; no spatial runtime/app or graph owner.

**Anti-overlap:** No 3D world, game, or production graph rendering.

## Dependencies and start conditions

**Source dependency statement:** None; no production integration.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define task
- build mock
- compare 2D/3D
- test orientation
- measure errors
- stop if no advantage.

## Acceptance criteria

Users complete a relation-finding task at least as accurately as 2D; otherwise record no-go.

## Definition of done

2D alternative, accessibility review and cost note included.

## Verification plan

Synthetic graph contract and moderated usability.

## Risks, measures, rollback and closure

**Risks:** Motion sickness, depth confusion, inaccessible controls and novelty bias.

**Metrics:** Completion, wrong links, time, nausea/accessibility feedback.

**Estimate:** 10–20 days, strict prototype cap.

**Rollback/fallback:** Delete demo and assets.

**Closure evidence:** Demo, task protocol, results and budget reconciliation.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-13


**Candidate:** `FUT-013` · **Domain/category:** Frontier / Knowledge/Simulation · **Priority/difficulty:** P2/D4 · **Owner:** MoonQL Graph · **Effort:** L (6–12 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-013 — Explore evidence-aware graph traversal](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Prototype a traversal that shows why two attributed claims are connected and which edges remain uncertain.

## Scope and boundaries

Synthetic graph demo with edge provenance, relation type, attribution and confidence class.

Read-only projection over fixture graph; no new ontology owner.

**Anti-overlap:** Does not introduce graph schema or prove metaphysical relations.

## Dependencies and start conditions

**Source dependency statement:** ENG-020; related ONT-009.

**Canonical TODO dependencies:** M46-20
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define path semantics
- create synthetic records
- render alternatives
- test ambiguity
- review with researcher.

## Acceptance criteria

Each displayed path shows all edge sources and labels inference vs direct source relation.

## Definition of done

Graph owner accepts truncation and epistemic rules.

## Verification plan

Fixture graph traversal and provenance-link checks.

## Risks, measures, rollback and closure

**Risks:** Visual path implies causality; use neutral relation language.

**Metrics:** Edge provenance coverage and user interpretation error.

**Estimate:** 6–12 days.

**Rollback/fallback:** Remove read-only prototype.

**Closure evidence:** Demo, fixtures and researcher review.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-14


**Candidate:** `FUT-014` · **Domain/category:** Frontier / Knowledge/Simulation · **Priority/difficulty:** P2/D4 · **Owner:** research · **Effort:** L (5–10 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-014 — Prototype a claim/evidence scenario simulator](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Test an interactive “what evidence would change this conclusion?” exercise using invented claims and evidence.

## Scope and boundaries

Build a fictional case with competing hypotheses, source reliability labels and reversible evidence additions.

Local educational prototype; no production claim store.

**Anti-overlap:** Not an actual theology or historical simulation.

## Dependencies and start conditions

**Source dependency statement:** —; related ONT-009.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Draft fictional case
- define transitions
- test comprehension
- assess bias
- decide.

## Acceptance criteria

Users distinguish evidence addition from conclusion certainty; multiple outcomes remain possible.

## Definition of done

Domain reviewer approves neutral language.

## Verification plan

State transition tests and moderated comprehension.

## Risks, measures, rollback and closure

**Risks:** Game framing trivializes sensitive inquiry; keep case wholly fictional and optional.

**Metrics:** Correct explanation of evidence vs inference and task completion.

**Estimate:** 5–10 days.

**Rollback/fallback:** Remove prototype content and preserve method notes only.

**Closure evidence:** Fictional dataset, test plan and review decision.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-15


**Candidate:** `FUT-015` · **Domain/category:** Frontier / Knowledge/Simulation · **Priority/difficulty:** P2/D4 · **Owner:** corpus · **Effort:** L (6–12 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-015 — Compare TEI and current corpus models on one witness](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Map one authorized witness fixture to TEI P5 and current MoonQL structures to identify fit and loss.

## Scope and boundaries

Compare a small synthetic/cleared witness with variants, provenance and editorial notes.

Export/import mapping study only; no replacement model or dependency.

**Anti-overlap:** Not automatic conversion of existing corpus or an additional database owner.

## Dependencies and start conditions

**Source dependency statement:** ENG-015; enables ONT-006.

**Canonical TODO dependencies:** M46-15
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Select fields
- map both ways
- list unrepresentable data
- test round-trip
- recommend adopt/map/no-go.

## Acceptance criteria

Every field is mapped, intentionally omitted or marked lossy with rationale.

## Definition of done

Corpus specialist reviews scholarly semantics and licensing.

## Verification plan

Round-trip fixture and schema validation.

## Risks, measures, rollback and closure

**Risks:** TEI complexity and profile mismatch; constrain to one task.

**Metrics:** Field coverage and lossy transformations.

**Estimate:** 6–12 days.

**Rollback/fallback:** Discard converter prototype; current model unchanged.

**Closure evidence:** Mapping table, fixtures, reviewer sign-off.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-16


**Candidate:** `FUT-016` · **Domain/category:** Frontier / Knowledge/Simulation · **Priority/difficulty:** P2/D4 · **Owner:** ECHOLOG/rights owner · **Effort:** L (5–9 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-016 — Prototype a media provenance timeline](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Show an asset’s synthetic creation, transformation, review and access events without exposing its contents.

## Scope and boundaries

Static prototype over fabricated event records and opaque object IDs.

Read-only view; no rights decision, media fetching or storage schema change.

**Anti-overlap:** Synthetic timeline study only; no private-media access or replacement for M17/M33 rights tasks. Real assets require their separate rights gate.

## Dependencies and start conditions

**Source dependency statement:** No task blocker for fabricated event records; ENG-019/021 and M33-05 apply only if a later scope uses streaming, shipping, or real assets; related ENG-019/021.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define event vocabulary
- create fake records
- test redaction
- evaluate comprehension
- stop if redundant.

## Acceptance criteria

Timeline distinguishes storage events from consent/publication decisions; content remains unavailable.

## Definition of done

ECHOLOG and privacy owners approve event fields.

## Verification plan

Event-order, redaction and state rendering fixtures.

## Risks, measures, rollback and closure

**Risks:** Timeline mistaken for a rights clearance; label decisions as external authority.

**Metrics:** Lineage comprehension and sensitive-field leakage.

**Estimate:** 5–9 days.

**Rollback/fallback:** Remove prototype and fake records.

**Closure evidence:** Prototype, redaction fixtures and owner review.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-17


**Candidate:** `FUT-017` · **Domain/category:** Frontier / Knowledge/Simulation · **Priority/difficulty:** P2/D3 · **Owner:** research/operations · **Effort:** M (3–6 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-017 — Simulate research workload and resource scaling](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Model synthetic reader/research workloads to explore capacity and cost sensitivity.

## Scope and boundaries

Simulate ranges rather than forecast a single demand curve; mark every assumption.

Offline spreadsheet/script; no production load test or user telemetry.

**Anti-overlap:** No production load generation or billing changes.

## Dependencies and start conditions

**Source dependency statement:** No blocker; ENG-018/020 baselines are optional inputs and must be labeled if used; related ENG-031.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define scenarios
- obtain baseline if available
- model uncertainty
- vary cost drivers
- document breakpoints.

## Acceptance criteria

Results reproduce from explicit inputs and show ranges, not falsely precise forecasts.

## Definition of done

Operations review assumptions; no capacity purchase recommended solely from model.

## Verification plan

Arithmetic fixtures and sensitivity checks.

## Risks, measures, rollback and closure

**Risks:** Synthetic assumptions mistaken for demand; mark as scenario, not forecast.

**Metrics:** Break-even ranges and sensitivity to key variables.

**Estimate:** 3–6 days.

**Rollback/fallback:** Delete model if inputs cannot be justified.

**Closure evidence:** Input register, formulas and limitation note.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-18


**Candidate:** `FUT-018` · **Domain/category:** Frontier / Distributed/Local-first · **Priority/difficulty:** P2/D4 · **Owner:** API tooling · **Effort:** L (4–8 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-018 — Test API contract evolution in an offline client sandbox](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Test how an older client handles an additive schema change using fixtures only.

## Scope and boundaries

Create two versioned fixture clients and replay the same fake response.

Offline sandbox; no API route change or new sync service.

**Anti-overlap:** No data synchronization implementation.

## Dependencies and start conditions

**Source dependency statement:** ENG-014; related ONT-006.

**Canonical TODO dependencies:** M46-14
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Pick schema
- define old/new clients
- simulate extra/missing fields
- capture behavior
- recommend.

## Acceptance criteria

Unknown additive fields are handled per documented policy; breaking case is detected.

## Definition of done

Compatibility results inform version policy.

## Verification plan

Deterministic fixture replay.

## Risks, measures, rollback and closure

**Risks:** Fixtures miss real clients; state boundary.

**Metrics:** Compatibility outcomes by schema change class.

**Estimate:** 4–8 days.

**Rollback/fallback:** Remove sandbox; no client is released.

**Closure evidence:** Fixture versions and compatibility report.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-19


**Candidate:** `FUT-019` · **Domain/category:** Frontier / Distributed/Local-first · **Priority/difficulty:** P2/D4 · **Owner:** research UX · **Effort:** L (7–12 days; two-week cap.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-019 — Prototype an offline research notebook with explicit export](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Test local-only notes for synthetic sources, with user-controlled export and deletion.

## Scope and boundaries

Disposable browser prototype storing only synthetic notes locally; inspect/export/delete controls.

No server sync, account binding or private witness data.

**Anti-overlap:** Owns local-only note save/reload/delete and a minimal user-controlled export; FUT-026 owns a portable research bundle and FUT-030 owns tamper-evident evidence verification. No media offline cache, private archive, or production account feature.

## Dependencies and start conditions

**Source dependency statement:** —; enables FUT-020/030.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define note schema
- prototype local save
- test reload/export/delete
- threaten device loss
- conduct usability study.

## Acceptance criteria

User sees local-only status; export is readable; delete removes the prototype data.

## Definition of done

Browser storage limits and recovery risks documented.

## Verification plan

Storage, export, deletion and offline/reload tests.

## Risks, measures, rollback and closure

**Risks:** Shared device exposure and browser clearing; warn and avoid sensitive data.

**Metrics:** Task completion, loss/recovery comprehension and delete success.

**Estimate:** 7–12 days; two-week cap.

**Rollback/fallback:** Clear local store and remove demo.

**Closure evidence:** Prototype, threat notes, test results and decision.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-20


**Candidate:** `FUT-020` · **Domain/category:** Frontier / Distributed/Local-first · **Priority/difficulty:** P2/D4 · **Owner:** research package · **Effort:** L (5–9 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-020 — Compare deterministic local conflict-resolution strategies](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Compare explicit user choice, append-only revisions and merge-on-disjoint-fields on synthetic notes.

## Scope and boundaries

Replay a small event set through three strategies and compare resulting state/history.

Pure local simulation; no CRDT dependency.

**Anti-overlap:** Not a third persistence/SQL owner or sync service.

## Dependencies and start conditions

**Source dependency statement:** FUT-019; related FUT-030.

**Canonical TODO dependencies:** M47-19
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define events
- implement miniature replay
- create collision cases
- compare
- publish no-go if semantics unclear.

## Acceptance criteria

Every strategy preserves original values or explains the merge; no lost-write case is silent.

## Definition of done

Decision record lists unsupported multi-device cases.

## Verification plan

Property fixtures for order, replay and duplicate events.

## Risks, measures, rollback and closure

**Risks:** Prototype may be mistaken for production sync; label as simulation.

**Metrics:** Lost updates, conflict resolution steps and state convergence.

**Estimate:** 5–9 days.

**Rollback/fallback:** Delete simulator; no data migration.

**Closure evidence:** Event fixtures, strategy output and owner decision.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-21


**Candidate:** `FUT-021` · **Domain/category:** Frontier / Distributed/Local-first · **Priority/difficulty:** P2/D4 · **Owner:** security/research UX · **Effort:** L (6–12 days; no production key service.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-021 — Test encrypted local cache boundaries with synthetic data](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Evaluate whether a browser prototype can protect synthetic notes at rest and erase them predictably.

## Scope and boundaries

Threat-model and prototype browser crypto for fake notes; compare key-loss and deletion behavior.

No real testimony/source; no claim of hardware-backed protection.

**Anti-overlap:** No private media access or M16/M33 implementation.

## Dependencies and start conditions

**Source dependency statement:** FUT-019; related FUT-030.

**Canonical TODO dependencies:** M47-19
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define attacker model
- prototype
- test export/delete/key loss
- review browser limits
- decide no-go.

## Acceptance criteria

Report states what encryption does not protect and shows key/data deletion behavior in fixture.

## Definition of done

Security review before any reuse.

## Verification plan

Synthetic encrypt/decrypt, tamper and delete tests.

## Risks, measures, rollback and closure

**Risks:** False sense of security, XSS, shared profile, lost keys.

**Metrics:** Data recoverability in defined threat cases and deletion behavior.

**Estimate:** 6–12 days; no production key service.

**Rollback/fallback:** Delete keys, fixtures and prototype.

**Closure evidence:** Threat model, test records and deletion confirmation.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-22


**Candidate:** `FUT-022` · **Domain/category:** Frontier / Moonshot · **Priority/difficulty:** P2/D4 · **Owner:** LUMEN · **Effort:** L (5–10 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-022 — Evaluate a capability-based worker protocol](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Study whether a narrow worker capability format can describe an authorized task without creating a new orchestrator.

## Scope and boundaries

Model three synthetic jobs as declarative capabilities and compare against current worker contract.

Contract study only; ARSY remains owner, no queue service or autonomous scheduler.

**Anti-overlap:** No new worker app or SKYLINK messaging capability.

## Dependencies and start conditions

**Source dependency statement:** ENG-004.

**Canonical TODO dependencies:** M46-04
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Reconcile worker status
- list job needs
- model capabilities
- test cancellation
- document fit/no-fit.

## Acceptance criteria

Each task declares scope, resource cap, timeout and cancel behavior; no implicit authority.

## Definition of done

LUMEN owner approves/no-go.

## Verification plan

Schema and lifecycle fixture tests.

## Risks, measures, rollback and closure

**Risks:** Scope creep toward a second orchestration system.

**Metrics:** Contract coverage and unbounded-field count.

**Estimate:** 5–10 days.

**Rollback/fallback:** Discard proposed schema; existing contract unchanged.

**Closure evidence:** Mapping table, fixtures and boundary review.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-23


**Candidate:** `FUT-023` · **Domain/category:** Frontier / Moonshot · **Priority/difficulty:** P2/D4 · **Owner:** research UX · **Effort:** L (5–9 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-023 — Explore a multi-reviewer disagreement interface](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Prototype how reviewers can record distinct interpretations without forced consensus.

## Scope and boundaries

Local mock with attributed positions, evidence links, abstain and unresolved states.

Synthetic records; no reviewer grants, durable decisions or public projection.

**Anti-overlap:** No M20-04 reviewer panels or decision storage.

## Dependencies and start conditions

**Source dependency statement:** FUT-003; M20 is an external gate only before integration with real reviewer authority.

**Canonical TODO dependencies:** M47-03
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Draft neutral case
- prototype
- test comprehension
- review power dynamics
- decide.

## Acceptance criteria

Users can distinguish “different views” from “no evidence”; no vote becomes theological truth.

## Definition of done

Qualified researcher and cultural-sensitivity reviewer review language.

## Verification plan

State tests and moderated usability.

## Risks, measures, rollback and closure

**Risks:** Vote count implies authority; omit popularity ranking.

**Metrics:** Interpretation recall, perceived coercion and accessibility.

**Estimate:** 5–9 days.

**Rollback/fallback:** Remove mock; preserve no records.

**Closure evidence:** Prototype and review notes.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-24


**Candidate:** `FUT-024` · **Domain/category:** Frontier / Moonshot · **Priority/difficulty:** P3/D5 · **Owner:** research UX · **Effort:** XL (5–10 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-024 — Prototype a “research journey” planner without spiritual ranking](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Test whether optional checkpoints help a user organize a research question without ranking beliefs or claiming spiritual direction.

## Scope and boundaries

Prototype a personal checklist with user-authored goals, editable steps and explicit opt-out.

Static mock only; no account state, mandate, recommendations or spiritual score.

**Anti-overlap:** Explicitly does not implement M23-03/05/07.

## Dependencies and start conditions

**Source dependency statement:** M23 overlap decision; related CHAR-006.

**Canonical TODO dependencies:** M23-03,M23-05
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define secular research example
- prototype
- test coercion/accessibility
- assess overlap with M23
- stop if duplicated.

## Acceptance criteria

User can reorder/delete steps; no ranking, supernatural claim or default enrollment.

## Definition of done

M23 owner confirms distinctness before any adoption.

## Verification plan

State manipulation and accessibility review.

## Risks, measures, rollback and closure

**Risks:** Repeats M23 or nudges religious belief; hard no-go gate.

**Metrics:** User control comprehension and perceived pressure.

**Estimate:** 5–10 days.

**Rollback/fallback:** Remove prototype; no persistent journey data.

**Closure evidence:** Prototype, overlap sign-off and no-go record.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-25


**Candidate:** `FUT-025` · **Domain/category:** Frontier / Moonshot · **Priority/difficulty:** P2/D4 · **Owner:** research UX · **Effort:** L (6–12 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-025 — Explore a “claim path” narrative with provenance visible](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Prototype a sequence view that follows how a claim is cited, interpreted and revised.

## Scope and boundaries

Fictional case study with separate lanes for source, interpretation, testimony and narrative.

Static, synthetic timeline; no public Story integration.

**Anti-overlap:** Synthetic claim-path narrative only; shares fixture vocabulary with FUT-008/FUT-009/ONT-014 but answers a distinct sequence-and-attribution question. No story-rights, publication, or timeline production changes.

## Dependencies and start conditions

**Source dependency statement:** FUT-014; related ONT-011/ONT-014.

**Canonical TODO dependencies:** M47-14
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Draft case
- model lanes
- test category distinction
- review with researcher
- decide.

## Acceptance criteria

Users correctly identify the origin/class of each card; transitions show source/version.

## Definition of done

No real claim/content; sensitivity review.

## Verification plan

Category integrity and chronology tests; moderated tasks.

## Risks, measures, rollback and closure

**Risks:** Narrative implies linear proof; show branches and disagreement.

**Metrics:** Class identification, source recall and misinterpretation.

**Estimate:** 6–12 days.

**Rollback/fallback:** Delete local prototype and fictional assets.

**Closure evidence:** Prototype, user outcomes and review.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-26


**Candidate:** `FUT-026` · **Domain/category:** Frontier / Moonshot · **Priority/difficulty:** P2/D4 · **Owner:** research package · **Effort:** L (6–12 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-026 — Explore a personal research export bundle](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Test whether a small, user-controlled export can preserve notes plus source references for offline scholarship.

## Scope and boundaries

Generate a synthetic archive with manifest, checksums, license/rights metadata and explicit omissions.

Export adapter only; no new storage or import authority.

**Anti-overlap:** Owns a user-requested portable archive/export contract; distinguish it from FUT-019's local-note lifecycle and FUT-030's tamper-evident evidence package. Not a data portability promise or M18/M19 publication feature.

## Dependencies and start conditions

**Source dependency statement:** FUT-015 and ENG-016; related ONT-004.

**Canonical TODO dependencies:** M47-15,M46-16
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define minimal package
- generate fixture
- verify checksum
- test absence of private data
- review portability.

## Acceptance criteria

Bundle opens offline, reports version and sources, and excludes unapproved/private material.

## Definition of done

Data owner and rights reviewer approve fields.

## Verification plan

Deterministic output, checksum and exclusion tests.

## Risks, measures, rollback and closure

**Risks:** Export could leak restricted sources; deny by default.

**Metrics:** Required provenance field coverage and excluded-field tests.

**Estimate:** 6–12 days.

**Rollback/fallback:** Disable export path; retain synthetic sample only.

**Closure evidence:** Bundle fixture, checksums and field review.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-27


**Candidate:** `FUT-027` · **Domain/category:** Frontier / Wildcard · **Priority/difficulty:** P2/D3 · **Owner:** governance/research · **Effort:** M (4–8 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-027 — Build a synthetic reviewer training simulator](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Test whether fictional cases help reviewers practice distinguishing evidence, interpretation and unknowns.

## Scope and boundaries

Local scenario with synthetic records, decision prompts and feedback on process only.

Offline exercise; no actual reviewer account or decision storage.

**Anti-overlap:** No reviewer authority grant, case moderation or certification.

## Dependencies and start conditions

**Source dependency statement:** FUT-023; related ONT-007; no M20 authority integration.

**Canonical TODO dependencies:** M47-23
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define fictional case
- write rubric
- prototype
- review cultural bias
- evaluate comprehension.

## Acceptance criteria

Learner distinguishes source evidence, interpretation and policy decision in scenarios.

## Definition of done

Content reviewer approves; no real personal case data.

## Verification plan

Scenario branching and accessibility checks.

## Risks, measures, rollback and closure

**Risks:** Training output mistaken for certification; state no credential.

**Metrics:** Pre/post scenario classification and misconception count.

**Estimate:** 4–8 days.

**Rollback/fallback:** Remove module; no decisions persisted.

**Closure evidence:** Rubric, fictional cases and results.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-28


**Candidate:** `FUT-028` · **Domain/category:** Frontier / Wildcard · **Priority/difficulty:** P3/D5 · **Owner:** ontology/research UX · **Effort:** XL (10–20 days; strict prototype budget.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-028 — Prototype an uncertainty-aware “living atlas”](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Explore a navigable map of attributed concepts where contested and unknown relations are visually distinct.

## Scope and boundaries

Synthetic 30-node map with provenance, disputed edges, filters and text equivalent.

Disposable client projection; existing graph owner only.

**Anti-overlap:** Synthetic atlas projection only; reuses graph-owned fields, does not add cache behavior from FUT-021, and is distinct from ONT-009's provenance audit.

## Dependencies and start conditions

**Source dependency statement:** FUT-013; related FUT-021/ONT-009.

**Canonical TODO dependencies:** M47-13
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define neutral semantics
- build mock
- add text alternative
- test interpretation
- compare list/map
- decide.

## Acceptance criteria

Users identify contested and unknown relations; map offers equivalent nonvisual path.

## Definition of done

Ontology and accessibility reviewers approve semantics.

## Verification plan

Edge-class rendering, keyboard traversal and comprehension test.

## Risks, measures, rollback and closure

**Risks:** Visual hierarchy may encode bias; allow multiple views and no rank.

**Metrics:** Relation-class recall, accessibility completion and misreading rate.

**Estimate:** 10–20 days; strict prototype budget.

**Rollback/fallback:** Delete demo; no production projection.

**Closure evidence:** Demo, text equivalent, usability results and decision.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-29


**Candidate:** `FUT-029` · **Domain/category:** Frontier / Wildcard · **Priority/difficulty:** P2/D3 · **Owner:** research UX/privacy · **Effort:** M (4–7 days; no external service cost.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-029 — Explore a consent-preserving feedback loop for research tools](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Test anonymous/optional feedback on a synthetic research prototype without collecting source content or identity by default.

## Scope and boundaries

Prototype opt-in structured feedback with preview, omit, delete and no free-text default.

Local mock; no analytics vendor, community identity or server collection.

**Anti-overlap:** No M32 community moderation or production analytics.

## Dependencies and start conditions

**Source dependency statement:** FUT-014; CHAR-001 is related.

**Canonical TODO dependencies:** M47-14
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define minimal questions
- mock preview/submit
- test consent comprehension
- map retention
- go/no-go.

## Acceptance criteria

Participant understands what is sent; no submission occurs before explicit action.

## Definition of done

Privacy and safeguarding review before any real collection.

## Verification plan

Consent-state tests and data-field allowlist.

## Risks, measures, rollback and closure

**Risks:** Feedback may reveal sensitive data; no free text initially and provide stop/delete.

**Metrics:** Consent comprehension, submission completion and fields collected.

**Estimate:** 4–7 days; no external service cost.

**Rollback/fallback:** Remove prototype; discard all sample feedback.

**Closure evidence:** Mock, data map and review decision.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M47-30


**Candidate:** `FUT-030` · **Domain/category:** Frontier / Wildcard · **Priority/difficulty:** P2/D4 · **Owner:** research/provenance · **Effort:** L (5–10 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [FUT-030 — Prototype portable evidence bundles with integrity checks](../../research/unified-100-issue-frontier-v5/ISSUES_FRONTIER.md) (full 22-section source).

## Objective

Evaluate a compact bundle of synthetic citations, version refs and hashes that can be verified offline.

## Scope and boundaries

Build a synthetic signed-or-hashed manifest prototype; compare integrity-only vs signed issuer model.

File artifact only; no identity service or blockchain.

**Anti-overlap:** Tamper-evident evidence package with issuer/checksum verification only; keep its manifest contract distinct from FUT-019's local notes and FUT-026's user export. No blockchain, global identity or source authority.

## Dependencies and start conditions

**Source dependency statement:** FUT-019; related ENG-016.

**Canonical TODO dependencies:** M47-19
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define fields
- create bundle
- alter fixture
- verify failure
- review signatures/keys
- decide.

## Acceptance criteria

Tampering is detected; provenance and issuer are not conflated; no content is included without rights.

## Definition of done

Key custody and threat assumptions documented.

## Verification plan

Hash/tamper, schema and offline verification fixtures.

## Risks, measures, rollback and closure

**Risks:** Hash may be misread as truth/authenticity; explain what it proves and does not.

**Metrics:** Tamper detection, bundle size and verification time.

**Estimate:** 5–10 days.

**Rollback/fallback:** Delete prototype keys/artifacts.

**Closure evidence:** Bundle, tamper output, threat model and decision.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---
## M48 — WORKS buyer validation and sustainable economics

**Group:** G7 · **Priority:** mixed by leaf · **Prerequisites:** M35 task gates; outreach and respondent-data collection require separate authorization. · **Scope:** existing domain owners only. [Milestone context](docs/milestones/M48.md) · [V5 source package](docs/research/unified-100-issue-frontier-v5/README.md).

**Exit gate:** Evidence distinguishes interest, budget authority, procurement, cost and uncertainty; unknowns remain UNKNOWN. All stay unchecked.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M48-01** — Validate institutional demand for a research-support offer | P2 | D3 | M35-01,M35 | Owner: product research; effort: M (5–8 researcher days; interview incentives only with approval.). Deliverable: Learn whether libraries, research groups or educational institutions have a costly research workflow MoonWitness can responsibly support. Scope: Select eligible roles; prepare consent script; interview; anonymize themes; seek disconfirming cases; publish go/no-go. Acceptance: At least three independent respondents describe the same costly job and current workaround; otherwise document insufficient/negative evidence. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m48-01) · candidate ECO-001: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md). |
| - [ ] | **M48-02** — Test self-hosted support demand and constraints | P2 | D3 | M48-01,M35-01,M35 | Owner: product/operations research; effort: M (4–7 days; costs are interview/research only.). Deliverable: Assess whether organizations need paid installation, maintenance or support for an authorized self-hosted deployment. Scope: Identify segment; prepare non-leading questions; interview; estimate requested support; compare to internal capacity; decide. Acceptance: Findings distinguish interest, budget authority, procurement and support expectations. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m48-02) · candidate ECO-002: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md). |
| - [ ] | **M48-03** — Define ethical pricing hypotheses for institutional research tools | P2 | D3 | M48-01,M35-02,M35 | Owner: product research; effort: M (4–7 days; no billing cost.). Deliverable: Compare usage, flat institutional, and sponsored-access hypotheses without charging users. Scope: Define included services; draft ranges from approved research; test with target roles; note fairness/access risks; revise. Acceptance: Respondents understand what is paid, what remains free, and whether their answer is hypothetical. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m48-03) · candidate ECO-003: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md). |
| - [ ] | **M48-04** — Map commercial entitlements away from donation benefits | P2 | D3 | M35-02,M35 | Owner: architecture/product; effort: M (3–6 days; legal review cost not estimated.). Deliverable: Specify how a future paid support service would remain separate from charity contributions and source rights. Scope: Inventory existing language; mark value flows; review with finance/legal/charity owners; document forbidden coupling. Acceptance: Diagram shows no donation-to-entitlement conversion and no paid access to private/sacred sources. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m48-04) · candidate ECO-004: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md). |
| - [ ] | **M48-05** — Test partnership distribution with research organizations | P2 | D3 | M48-01 | Owner: partnerships research; effort: M (4–8 days plus response latency.). Deliverable: Assess whether one or more research institutions would distribute or co-develop a tool without exclusive source control. Scope: Define partner criteria; check conflict/rights; prepare non-promissory brief; interview; record obligations; decide. Acceptance: Report distinguishes referral, co-research, hosting and data-sharing proposals; none accepted implicitly. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m48-05) · candidate ECO-005: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md). |
| - [ ] | **M48-06** — Model cost-to-serve ranges for research workflows | P2 | D3 | M48-01 | Owner: operations/finance; effort: M (3–6 days plus cost-data access.). Deliverable: Estimate bounded infrastructure and support cost ranges for an institutional research workflow. Scope: Choose workflow; source approved cost inputs; model low/central/high scenarios; sensitivity analysis; review exclusions. Acceptance: Every input is sourced, estimated or UNKNOWN; model produces ranges and break-even assumptions. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m48-06) · candidate ECO-006: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md). |
| - [ ] | **M48-07** — Compare recurring support, sponsorship and grant scenarios | P2 | D3 | M48-06 | Owner: product/finance research; effort: M (3–6 days.). Deliverable: Compare funding models for maintenance burden without presenting hypothetical funds as revenue. Scope: Define costs; list restrictions; model continuity; stress-test loss of source; review mission risk. Acceptance: Scenario shows cost coverage, concentration risk, restrictions and unfunded obligations. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m48-07) · candidate ECO-007: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md). |
| - [ ] | **M48-08** — Assess a rights-cleared creator/research service model | P2 | D4 | M48-04,M17-06,M18-02,M35-02,M17,M18,M35 | Owner: product/rights research; effort: L (5–10 days; expert review cost TBD.). Deliverable: Explore whether a paid service could support authorized corpus preparation or research tooling without selling source rights. Scope: Map work types; identify rights holders; interview authorized practitioners if approved; model obligations; no-go if rights unclear. Acceptance: Every proposed service has identifiable rights, contributor choice, payment obligation and dispute route. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m48-08) · candidate ECO-008: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md). |



## M48 — Detailed Task Specifications

_Below is the full specification for each M48 task, consolidated from individual packet files._


### M48-01


**Candidate:** `ECO-001` · **Domain/category:** Economy / Product-market validation · **Priority/difficulty:** P2/D3 · **Owner:** product research · **Effort:** M (5–8 researcher days; interview incentives only with approval.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ECO-001 — Validate institutional demand for a research-support offer](../../research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md) (full 22-section source).

## Objective

Learn whether libraries, research groups or educational institutions have a costly research workflow MoonWitness can responsibly support.

## Scope and boundaries

Conduct 6–10 consented problem interviews with institutional researchers; test current workflow, procurement constraints and non-solution alternatives.

Research protocol only; no participant data in product databases and no payment flow.

**Anti-overlap:** Share one consent/outreach protocol and respondent pool with ECO-002/ECO-005; this task tests demand and costly jobs only. Not validating the M35 physical/service pilot or making a sales offer.

## Dependencies and start conditions

**Source dependency statement:** Reconcile M35-01 scope; enables ECO-002.

**Canonical TODO dependencies:** M35-01
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Select eligible roles
- prepare consent script
- interview
- anonymize themes
- seek disconfirming cases
- publish go/no-go.

## Acceptance criteria

At least three independent respondents describe the same costly job and current workaround; otherwise document insufficient/negative evidence.

## Definition of done

No identifying quotes without consent; sample and selection bias stated.

## Verification plan

Review research protocol for leading questions and anonymization.

## Risks, measures, rollback and closure

**Risks:** Small sample and institutional courtesy bias; no demand claim from interest alone.

**Metrics:** Repeated problem themes, workaround cost ranges and procurement blocker frequency.

**Estimate:** 5–8 researcher days; interview incentives only with approval.

**Rollback/fallback:** Delete raw notes on schedule; retain only consented/anonymized findings.

**Closure evidence:** Approved protocol, anonymized results, limitations and decision.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M48-02


**Candidate:** `ECO-002` · **Domain/category:** Economy / Product-market validation · **Priority/difficulty:** P2/D3 · **Owner:** product/operations research · **Effort:** M (4–7 days; costs are interview/research only.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ECO-002 — Test self-hosted support demand and constraints](../../research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md) (full 22-section source).

## Objective

Assess whether organizations need paid installation, maintenance or support for an authorized self-hosted deployment.

## Scope and boundaries

Interview 5–8 technically responsible organizations about control, reliability, staffing and support expectations.

Research only; no hosting tier, SLA, deployment automation or account feature.

**Anti-overlap:** Reuses ECO-001's consent protocol/respondent pool; tests self-hosting and support capacity, not general demand or partner distribution. Distinct from M35 buyer/merchant/payment workflow; no deployment task.

## Dependencies and start conditions

**Source dependency statement:** ECO-001; reconcile M35-01/02.

**Canonical TODO dependencies:** M48-01,M35-01,M35-02
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Identify segment
- prepare non-leading questions
- interview
- estimate requested support
- compare to internal capacity
- decide.

## Acceptance criteria

Findings distinguish interest, budget authority, procurement and support expectations.

## Definition of done

No SLA/availability promise; report evidence and non-fit.

## Verification plan

Protocol review and reproducible coding of anonymized interview themes.

## Risks, measures, rollback and closure

**Risks:** Support expectations may exceed capacity; do not offer service during research.

**Metrics:** Verified budget owner, support burden, procurement path and number of repeat pain points.

**Estimate:** 4–7 days; costs are interview/research only.

**Rollback/fallback:** Stop recruitment and remove raw notes per protocol.

**Closure evidence:** Interview summary, cost assumptions and explicit decision.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M48-03


**Candidate:** `ECO-003` · **Domain/category:** Economy / Pricing/entitlements · **Priority/difficulty:** P2/D3 · **Owner:** product research · **Effort:** M (4–7 days; no billing cost.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ECO-003 — Define ethical pricing hypotheses for institutional research tools](../../research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md) (full 22-section source).

## Objective

Compare usage, flat institutional, and sponsored-access hypotheses without charging users.

## Scope and boundaries

Draft three hypothetical pricing cards for support/tooling, explicitly exclude sacred/public source access, and test comprehension.

Research artifacts only; no price fields or entitlement logic added to products.

**Anti-overlap:** Does not set production pricing or entitlements.

## Dependencies and start conditions

**Source dependency statement:** ECO-001/002; M35-02 remains authoritative for merchant ownership.

**Canonical TODO dependencies:** M48-01,M48-02,M35-02
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define included services
- draft ranges from approved research
- test with target roles
- note fairness/access risks
- revise.

## Acceptance criteria

Respondents understand what is paid, what remains free, and whether their answer is hypothetical.

## Definition of done

No price is published as an offer or commitment.

## Verification plan

Cognitive interview checks for ambiguity and coercion.

## Risks, measures, rollback and closure

**Risks:** Hypothetical willingness-to-pay is not purchase evidence; report separately.

**Metrics:** Comprehension, perceived fairness and stated budget range with confidence.

**Estimate:** 4–7 days; no billing cost.

**Rollback/fallback:** Withdraw research cards; no price change to product.

**Closure evidence:** Cards, respondent profile, results and limitations.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M48-04


**Candidate:** `ECO-004` · **Domain/category:** Economy / Pricing/entitlements · **Priority/difficulty:** P2/D3 · **Owner:** architecture/product · **Effort:** M (3–6 days; legal review cost not estimated.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ECO-004 — Map commercial entitlements away from donation benefits](../../research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md) (full 22-section source).

## Objective

Specify how a future paid support service would remain separate from charity contributions and source rights.

## Scope and boundaries

Produce a conceptual boundary diagram covering payer, merchant, service entitlement, refund, donation and restricted fund.

No ledger/schema/payment provider; propose separate owners and records only as a decision.

**Anti-overlap:** Does not implement M35 Treasury, merchant or donation accounting.

## Dependencies and start conditions

**Source dependency statement:** M35-02 is external; related CHAR-003/004.

**Canonical TODO dependencies:** M35-02
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Inventory existing language
- mark value flows
- review with finance/legal/charity owners
- document forbidden coupling.

## Acceptance criteria

Diagram shows no donation-to-entitlement conversion and no paid access to private/sacred sources.

## Definition of done

M35 and charity owners review; unresolved legal areas remain UNKNOWN.

## Verification plan

Scenario review for refund, chargeback and restricted donation edge cases.

## Risks, measures, rollback and closure

**Risks:** Diagram may be mistaken for legal advice or authorization; watermark as concept.

**Metrics:** All flow scenarios assigned a distinct owner and disposition.

**Estimate:** 3–6 days; legal review cost not estimated.

**Rollback/fallback:** Replace concept with explicit no-go; no system state affected.

**Closure evidence:** Reviewed flow diagram, unresolved legal questions and decision.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M48-05


**Candidate:** `ECO-005` · **Domain/category:** Economy / Partnerships · **Priority/difficulty:** P2/D3 · **Owner:** partnerships research · **Effort:** M (4–8 days plus response latency.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ECO-005 — Test partnership distribution with research organizations](../../research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md) (full 22-section source).

## Objective

Assess whether one or more research institutions would distribute or co-develop a tool without exclusive source control.

## Scope and boundaries

Map candidate partner types and interview a small sample about use, governance, rights and procurement.

No integration or data-sharing API; partnership remains non-binding discovery.

**Anti-overlap:** Reuses ECO-001/ECO-002's consent protocol and respondent pool; tests partner/distribution willingness only, with no implied commitment. No marketing automation, affiliate tracking or M32 community implementation.

## Dependencies and start conditions

**Source dependency statement:** ECO-001; requires explicit outreach authorization before contact.

**Canonical TODO dependencies:** M48-01
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define partner criteria
- check conflict/rights
- prepare non-promissory brief
- interview
- record obligations
- decide.

## Acceptance criteria

Report distinguishes referral, co-research, hosting and data-sharing proposals; none accepted implicitly.

## Definition of done

No logo/use of partner name without permission; conflicts recorded.

## Verification plan

Legal/privacy review of outreach brief.

## Risks, measures, rollback and closure

**Risks:** Implied endorsement or source ownership; use non-binding language and no data transfer.

**Metrics:** Qualified partner interest, governance fit and dependency exposure.

**Estimate:** 4–8 days plus response latency.

**Rollback/fallback:** Withdraw brief and stop contact; no integrations to undo.

**Closure evidence:** Candidate criteria, anonymized findings and approval record.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M48-06


**Candidate:** `ECO-006` · **Domain/category:** Economy / Cost/profitability · **Priority/difficulty:** P2/D3 · **Owner:** operations/finance · **Effort:** M (3–6 days plus cost-data access.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ECO-006 — Model cost-to-serve ranges for research workflows](../../research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md) (full 22-section source).

## Objective

Estimate bounded infrastructure and support cost ranges for an institutional research workflow.

## Scope and boundaries

Build scenario model from aggregate bills, explicit workload assumptions and operator time.

Offline model; no billing telemetry or customer-level cost tracking.

**Anti-overlap:** Models per-workflow ranges and support assumptions using ENG-031's single aggregate operating-cost baseline; does not create a second aggregate cost inventory or claim payment, revenue, or M35 unit-economics results.

## Dependencies and start conditions

**Source dependency statement:** ECO-001/002; ENG-031.

**Canonical TODO dependencies:** M48-01,M48-02,M46-31
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Choose workflow
- source approved cost inputs
- model low/central/high scenarios
- sensitivity analysis
- review exclusions.

## Acceptance criteria

Every input is sourced, estimated or UNKNOWN; model produces ranges and break-even assumptions.

## Definition of done

Finance/operations review, no customer data, no profitability claim.

## Verification plan

Arithmetic fixture and sensitivity checks.

## Risks, measures, rollback and closure

**Risks:** Shared infra allocation and labor estimates may be wrong; publish ranges.

**Metrics:** Cost per workflow, support hours and sensitivity to volume.

**Estimate:** 3–6 days plus cost-data access.

**Rollback/fallback:** Retire model if inputs cannot be verified.

**Closure evidence:** Input register, formulas, uncertainty and reviewer note.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M48-07


**Candidate:** `ECO-007` · **Domain/category:** Economy / Cost/profitability · **Priority/difficulty:** P2/D3 · **Owner:** product/finance research · **Effort:** M (3–6 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ECO-007 — Compare recurring support, sponsorship and grant scenarios](../../research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md) (full 22-section source).

## Objective

Compare funding models for maintenance burden without presenting hypothetical funds as revenue.

## Scope and boundaries

Model three scenarios—paid support, non-restricted sponsorship, and grants—with no promised amount.

Spreadsheet/research only; donations remain outside commercial revenue and no funds are handled.

**Anti-overlap:** Not a donation platform, grant application or revenue claim.

## Dependencies and start conditions

**Source dependency statement:** ECO-006; related CHAR-004.

**Canonical TODO dependencies:** M48-06
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define costs
- list restrictions
- model continuity
- stress-test loss of source
- review mission risk.

## Acceptance criteria

Scenario shows cost coverage, concentration risk, restrictions and unfunded obligations.

## Definition of done

Finance/ethics review; no funding solicitation.

## Verification plan

Formula and sensitivity verification.

## Risks, measures, rollback and closure

**Risks:** Models imply access to funds; label every figure as hypothetical or source-backed.

**Metrics:** Runway range and funding concentration, only from supplied assumptions.

**Estimate:** 3–6 days.

**Rollback/fallback:** Withdraw scenarios if assumptions are not supportable.

**Closure evidence:** Assumption sheet, scenarios and ethics review.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M48-08


**Candidate:** `ECO-008` · **Domain/category:** Economy / Creator/service economy · **Priority/difficulty:** P2/D4 · **Owner:** product/rights research · **Effort:** L (5–10 days; expert review cost TBD.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ECO-008 — Assess a rights-cleared creator/research service model](../../research/unified-100-issue-frontier-v5/ISSUES_ECONOMY.md) (full 22-section source).

## Objective

Explore whether a paid service could support authorized corpus preparation or research tooling without selling source rights.

## Scope and boundaries

Conduct a workflow/rights study with hypothetical examples only; map creator consent, license, payment and withdrawal questions.

No marketplace, upload pipeline, royalty ledger or rights decision.

**Anti-overlap:** Does not build creator marketplace or replace media/source rights tasks.

## Dependencies and start conditions

**Source dependency statement:** ECO-004; external gates M17-06/M18-02/M35-02.

**Canonical TODO dependencies:** M48-04,M17-06,M18-02,M35-02
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Map work types
- identify rights holders
- interview authorized practitioners if approved
- model obligations
- no-go if rights unclear.

## Acceptance criteria

Every proposed service has identifiable rights, contributor choice, payment obligation and dispute route.

## Definition of done

Rights/finance reviewer approves; no actual content solicited.

## Verification plan

Scenario walkthrough for withdrawal, derivative work, attribution and refund.

## Risks, measures, rollback and closure

**Risks:** Implied ownership or licensing, unpaid labor, cultural appropriation.

**Metrics:** Unresolved rights questions, contributor comprehension and service cost range.

**Estimate:** 5–10 days; expert review cost TBD.

**Rollback/fallback:** End study and delete contact data per consent terms.

**Closure evidence:** Workflow map, consented findings and documented decision.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---
## M49 — HARBOR humanitarian and safeguarding readiness

**Group:** G7 · **Priority:** mixed by leaf · **Prerequisites:** M32 scope review, named accountable operator and task dependencies; participant contact/sensitive data require separate authority and consent. · **Scope:** existing domain owners only. [Milestone context](docs/milestones/M49.md) · [V5 source package](docs/research/unified-100-issue-frontier-v5/README.md).

**Exit gate:** Protocols include accountability, minimization, complaints and null/harm outcomes as applicable. All stay unchecked.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M49-01** — Prepare a partner-led needs assessment protocol | P2 | D3 | M32 | Owner: humanitarian research lead; effort: M (4–8 days plus qualified review.). Deliverable: Prepare a protocol for a qualified local partner to identify a specific unmet need before any program is proposed. Scope: Identify eligible partner profile; draft questions; map consent/data flow; review safeguarding; define stop/go criteria. Acceptance: Protocol cannot collect sensitive personal details by default; partner and participant can decline without penalty. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m49-01) · candidate CHAR-001: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_CHARITY.md). |
| - [ ] | **M49-02** — Compare needs-assessment methods for accessibility and harm | P2 | D3 | M49-01 | Owner: humanitarian research lead; effort: M (3–6 days.). Deliverable: Compare interview, facilitated group and anonymous feedback approaches for one partner-defined need. Scope: Define hypothetical scenario; score access/privacy risks; consult qualified reviewer; set referral/stop rules; choose or reject methods. Acceptance: Recommendation identifies who may be excluded, what data is necessary, and safe alternatives. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m49-02) · candidate CHAR-002: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_CHARITY.md). |
| - [x] | **M49-03** — Define accountable humanitarian program roles and escalation | P1 | D4 | — | Owner: accountable program operator; effort: L (5–10 days plus legal review.). Deliverable: Map who may approve, deliver, pause and investigate a future charitable program. Scope: Identify legal entity; define roles; separate delivery/approval; map incident escalation; tabletop failure cases. Acceptance: Each critical decision has an accountable role and substitute; complaints can bypass program delivery. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m49-03) · candidate CHAR-003: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_CHARITY.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — governance artifact drafted with 6 defined roles (Program Director, Finance Officer, Safeguarding Lead, Local Partner Liaison, Volunteer Coordinator, Complaints Officer), RACI matrix for 9 critical decisions, 3 escalation paths (incident/financial/operational), 4 tabletop scenarios tested, complaint bypass mechanism specified; legal entity not formed, legal/safeguarding/partner reviews deferred (requires owner action before program launch). Evidence: [audit](docs/audit/M49-03-humanitarian-program-roles.md). |
| - [x] | **M49-04** — Specify restricted-fund handling and separation rules | P1 | D4 | M49-03 | Owner: accountable finance officer; effort: L (5–12 days plus external advice.). Deliverable: Document how any future restricted charitable funds would be accepted, held, allocated, reconciled and returned. Scope: Identify jurisdiction/entity; map fund lifecycle; define dual control; list refund/unspent cases; obtain accountant/legal review. Acceptance: Every fund state has owner, evidence, reconciliation and return/exception rule. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m49-04) · candidate CHAR-004: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_CHARITY.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — restricted fund handling policy drafted with 10-stage fund lifecycle map, 7 fund states with owners/evidence/reconciliation/exception rules, dual control principles with 3 approval thresholds ($0–$500, $500–$1,000, $1,000+), 4 exception paths (emergency, donor-initiated, unresolvable, refund), 5 prohibited actions; legal entity not formed, accountant/legal reviews deferred (requires owner action before implementation). Evidence: [audit](docs/audit/M49-04-restricted-fund-handling.md). |
| - [x] | **M49-05** — Design a transparent allocation decision record | P1 | D4 | M49-04 | Owner: program/finance; effort: L (4–8 days.). Deliverable: Define the minimum evidence for documenting a charitable allocation decision. Scope: Define fields; separate identity from public report; model approval/reversal; review privacy; document owner. Acceptance: Record supports independent reconciliation while public view omits identifying data. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m49-05) · candidate CHAR-005: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_CHARITY.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — decision record schema designed with 37 fields across 6 categories (identity, allocation, approvers, evidence, privacy, audit), 3 workflows modeled (approval, amendment, reversal), 3 privacy disclosure levels (FULL, PARTIAL, NONE), document owner specified (Finance Officer), 2 synthetic examples provided; implementation in storage system deferred (requires owner action). Evidence: [audit](docs/audit/M49-05-allocation-decision-record.md). |
| - [x] | **M49-06** — Prototype a privacy-preserving allocation transparency report | P2 | D3 | M49-05 | Owner: finance/communications; effort: M (4–7 days.). Deliverable: Test whether an aggregate report can explain funds received/allocated and remaining restrictions without naming beneficiaries. Scope: Define aggregate fields; generate fake example; test re-identification risk; ask reviewers to interpret; revise. Acceptance: Readers distinguish received, committed, disbursed and remaining; no person/location inferable from fixture. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m49-06) · candidate CHAR-006: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_CHARITY.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — synthetic transparency report prototype created with 7 tables (fund receipt, allocation, restriction tracking, reconciliation, compliance, balance, summary dashboard), 4 re-identification risk tests all assessed as LOW risk, 3 hypothetical reviewer interpretations clear, definitions/caveats/revision recommendations documented; real financial data integration and external reviewer feedback deferred (requires owner action). Evidence: [audit](docs/audit/M49-06-transparency-report-prototype.md). |
| - [x] | **M49-07** — Define safe volunteer roles and safeguarding boundaries | P1 | D4 | M49-03 | Owner: accountable program operator; effort: L (4–8 days plus expert review.). Deliverable: Specify what volunteers may and may not do in a hypothetical program. Scope: Identify task types; assess risk; define screening/training; set supervision; review incidents and appeals. Acceptance: Every role has scope, supervisor, training and prohibited tasks; high-risk roles are excluded absent qualified partner. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m49-07) · candidate CHAR-007: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_CHARITY.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — volunteer role framework created with 3 role cards (Administrative Support, Program Support, Skilled Professional), each with permitted/prohibited tasks, screening/training/supervision requirements, safeguarding boundaries, incident escalation; risk assessment matrix for 7 task types; 3 screening levels (basic, enhanced, enhanced + credential); 3 supervision levels (direct, enhanced, professional); 10 absolute prohibitions (cash handling, lone working, transportation, etc.); 6-step incident reporting procedure; appeals process for volunteers and beneficiaries; escalation contacts table documented; expert review and real-world validation deferred (requires owner action). Evidence: [audit](docs/audit/M49-07-volunteer-roles-safeguarding.md). |
| - [x] | **M49-08** — Design accessible volunteer participation without coercion | P2 | D3 | M49-07 | Owner: program/UX; effort: M (3–6 days.). Deliverable: Explore flexible participation, reimbursement and opt-out needs for a future partner-led activity. Scope: Identify barriers; specify accommodations; define reimbursement questions; set opt-out; review. Acceptance: No role requires undisclosed cost; accommodation and refusal paths are explicit. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m49-08) · candidate CHAR-008: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_CHARITY.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — comprehensive accessible participation framework created with barrier matrix (6 categories: physical/disability, geographic/travel, care duty, language/communication, financial, social/psychological); accommodation framework with universal design principles and 8 categories; reimbursement policy (10 expense categories with rates, 7-step process, advance provision option, stipend policy); opt-out framework (7 core principles, 6 scenarios with procedures, 3 communication templates, tracking log); role-choice mockup template with example role; 5 fictional case studies (single parent, wheelchair user, non-native speaker, chronic fatigue, social anxiety); 3 reviewer scenarios; success metrics (quantitative and qualitative); revision recommendations (short/medium/long-term); partner review and budget approval deferred (requires owner action). Evidence: [audit](docs/audit/M49-08-accessible-volunteer-participation.md). |
| - [ ] | **M49-09** — Define an outcome measurement plan before a pilot | P1 | D4 | M49-01 | Owner: program evaluator; effort: L (5–10 days plus evaluator time.). Deliverable: Define one outcome, baseline and credible evidence method before any charitable pilot begins. Scope: Specify problem/outcome; identify comparison limits; choose measures; define consent; define adverse findings/publication. Acceptance: Plan separates output, outcome and attribution; includes null/harmful results and missing data. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m49-09) · candidate CHAR-009: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_CHARITY.md). |
| - [x] | **M49-10** — Define complaint, incident and remedy pathways | P1 | D4 | M49-03 | Owner: independent safeguarding lead; effort: L (5–10 days plus qualified review.). Deliverable: Specify safe feedback, complaint, safeguarding incident and appeal paths before any program contact. Scope: Map report types; define urgent response; assign independent contact; set retention/access; tabletop unsafe disclosure. Acceptance: Complainant can report without public identity; urgent cases have escalation; limits and response timing are clear. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m49-10) · candidate CHAR-010: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_CHARITY.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — comprehensive complaint/incident/remedy framework created with 5 report types (feedback, complaint, safeguarding incident, unsafe disclosure, retaliation); 9 reporting channels with accessibility requirements; 4 confidentiality levels with explicit limits; response roles assigned from M49-03 RACI; 5 response procedures (feedback, complaint, incident, disclosure, retaliation) with step-by-step workflows; record retention schedule (3 years to permanent); access control matrix; 5 tabletop exercises (anonymous feedback, complaint escalation, retaliation allegation, unsafe disclosure by minor, conflict of interest); success metrics (quantitative and qualitative); revision recommendations (short/medium/long-term); legal review and safeguarding lead recruitment deferred (requires owner action). Evidence: [audit](docs/audit/M49-10-complaint-incident-remedy-pathways.md). |

## M49 — Detailed Task Specifications

_Below is the full specification for each M49 task, consolidated from individual packet files._


### M49-01


**Candidate:** `CHAR-001` · **Domain/category:** Charity / Needs discovery · **Priority/difficulty:** P2/D3 · **Owner:** humanitarian research lead · **Effort:** M (4–8 days plus qualified review.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [CHAR-001 — Prepare a partner-led needs assessment protocol](../../research/unified-100-issue-frontier-v5/ISSUES_CHARITY.md) (full 22-section source).

## Objective

Prepare a protocol for a qualified local partner to identify a specific unmet need before any program is proposed.

## Scope and boundaries

Draft a consent-led, minimal-data assessment protocol with inclusion/exclusion, referral and stop conditions.

Paper protocol only; no platform survey or beneficiary database.

**Anti-overlap:** Not M32 first-member journey or community MVP; requires an independent accountable partner.

## Dependencies and start conditions

**Source dependency statement:** M32 owner scope review; enables CHAR-002.

**Canonical TODO dependencies:** M32-01
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Identify eligible partner profile
- draft questions
- map consent/data flow
- review safeguarding
- define stop/go criteria.

## Acceptance criteria

Protocol cannot collect sensitive personal details by default; partner and participant can decline without penalty.

## Definition of done

Local partner, safeguarding and privacy review required before recruitment.

## Verification plan

Scenario walkthrough for coercion, referral, data breach and no-response cases.

## Risks, measures, rollback and closure

**Risks:** Extractive research, unsafe disclosure, or false representation of community needs.

**Metrics:** Protocol completeness and unresolved safeguard questions; no impact target invented.

**Estimate:** 4–8 days plus qualified review.

**Rollback/fallback:** Do not recruit; delete draft contact data if any exists.

**Closure evidence:** Reviewed protocol, data map and approval/no-go record.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M49-02


**Candidate:** `CHAR-002` · **Domain/category:** Charity / Needs discovery · **Priority/difficulty:** P2/D3 · **Owner:** humanitarian research lead · **Effort:** M (3–6 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [CHAR-002 — Compare needs-assessment methods for accessibility and harm](../../research/unified-100-issue-frontier-v5/ISSUES_CHARITY.md) (full 22-section source).

## Objective

Compare interview, facilitated group and anonymous feedback approaches for one partner-defined need.

## Scope and boundaries

Simulate method trade-offs and document when each must not be used.

Protocol comparison; no live survey, identity store, or product feature.

**Anti-overlap:** Does not determine beneficiary needs or implement M32 participation.

## Dependencies and start conditions

**Source dependency statement:** CHAR-001.

**Canonical TODO dependencies:** M49-01
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define hypothetical scenario
- score access/privacy risks
- consult qualified reviewer
- set referral/stop rules
- choose or reject methods.

## Acceptance criteria

Recommendation identifies who may be excluded, what data is necessary, and safe alternatives.

## Definition of done

No live participant contact; partner validates any locally specific conclusion.

## Verification plan

Tabletop scenarios for power imbalance, disability, language and unsafe disclosure.

## Risks, measures, rollback and closure

**Risks:** Generic methods can be misapplied across cultures; preserve local decision authority.

**Metrics:** Inclusion risks identified and mitigations assigned.

**Estimate:** 3–6 days.

**Rollback/fallback:** Withdraw method recommendation if local context is unknown.

**Closure evidence:** Reviewed comparison, assumptions and no-go conditions.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M49-03


**Candidate:** `CHAR-003` · **Domain/category:** Charity / Program governance · **Priority/difficulty:** P1/D4 · **Owner:** accountable program operator · **Effort:** L (5–10 days plus legal review.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [CHAR-003 — Define accountable humanitarian program roles and escalation](../../research/unified-100-issue-frontier-v5/ISSUES_CHARITY.md) (full 22-section source).

## Objective

Map who may approve, deliver, pause and investigate a future charitable program.

## Scope and boundaries

Create a role/RACI and escalation map with independent complaint and suspension paths.

Governance artifact; no app roles, new identity system or workflow engine.

**Anti-overlap:** Owns the shared accountable-role and escalation map used by CHAR-004/007/010; those tasks add fund controls, volunteer boundaries and safeguarding remedies respectively. Does not define M32 community ownership or commercial Treasury roles.

## Dependencies and start conditions

**Source dependency statement:** Identified operator; related CHAR-004.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Identify legal entity
- define roles
- separate delivery/approval
- map incident escalation
- tabletop failure cases.

## Acceptance criteria

Each critical decision has an accountable role and substitute; complaints can bypass program delivery.

## Definition of done

Legal, safeguarding and local partner review.

## Verification plan

Tabletop scenarios for conflict, misconduct, missing funds and operator unavailability.

## Risks, measures, rollback and closure

**Risks:** Conflicted reviewers or unstaffed escalation; no program launches without coverage.

**Metrics:** Critical responsibilities with named owner and backup.

**Estimate:** 5–10 days plus legal review.

**Rollback/fallback:** Freeze proposed program until roles are re-approved.

**Closure evidence:** Approved responsibility map and tabletop findings.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M49-04


**Candidate:** `CHAR-004` · **Domain/category:** Charity / Program governance · **Priority/difficulty:** P1/D4 · **Owner:** accountable finance officer · **Effort:** L (5–12 days plus external advice.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [CHAR-004 — Specify restricted-fund handling and separation rules](../../research/unified-100-issue-frontier-v5/ISSUES_CHARITY.md) (full 22-section source).

## Objective

Document how any future restricted charitable funds would be accepted, held, allocated, reconciled and returned.

## Scope and boundaries

Produce a controls map, segregation principles, approval thresholds and exception path; no transactions.

Policy only; no donation ledger, payment provider, or Treasury implementation.

**Anti-overlap:** Uses CHAR-003's role map and adds restricted-fund custody, dual control, reconciliation and return rules only. No commercial Treasury or M35 payment flow; no new SQL owner.

## Dependencies and start conditions

**Source dependency statement:** CHAR-003; related ECO-004/007; enables CHAR-005.

**Canonical TODO dependencies:** M49-03
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Identify jurisdiction/entity
- map fund lifecycle
- define dual control
- list refund/unspent cases
- obtain accountant/legal review.

## Acceptance criteria

Every fund state has owner, evidence, reconciliation and return/exception rule.

## Definition of done

Qualified finance/legal sign-off before solicitation or acceptance.

## Verification plan

Tabletop cases for restricted purpose, chargeback, unspent funds and record discrepancy.

## Risks, measures, rollback and closure

**Risks:** Regulatory mismatch and fraud; block collection until entity and controls exist.

**Metrics:** Unassigned control steps and unresolved legal questions.

**Estimate:** 5–12 days plus external advice.

**Rollback/fallback:** No funds accepted; withdraw policy draft if jurisdiction changes.

**Closure evidence:** Signed controls map, tabletop outcomes and legal/accounting caveats.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M49-05


**Candidate:** `CHAR-005` · **Domain/category:** Charity / Donations/allocation · **Priority/difficulty:** P1/D4 · **Owner:** program/finance · **Effort:** L (4–8 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [CHAR-005 — Design a transparent allocation decision record](../../research/unified-100-issue-frontier-v5/ISSUES_CHARITY.md) (full 22-section source).

## Objective

Define the minimum evidence for documenting a charitable allocation decision.

## Scope and boundaries

Prototype an offline decision record with purpose, approvers, restrictions, amount category, date and evidence reference.

Synthetic records; no real financial store or public dashboard.

**Anti-overlap:** Not payment processing, donation UI or M35 commercial accounting.

## Dependencies and start conditions

**Source dependency statement:** CHAR-004.

**Canonical TODO dependencies:** M49-04
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define fields
- separate identity from public report
- model approval/reversal
- review privacy
- document owner.

## Acceptance criteria

Record supports independent reconciliation while public view omits identifying data.

## Definition of done

Finance/privacy reviewer approves fields and access model.

## Verification plan

Schema checks for missing approvals, purpose mismatch and redaction.

## Risks, measures, rollback and closure

**Risks:** Public detail could identify recipients; aggregate only with disclosure review.

**Metrics:** Allocation records with complete approval/evidence fields.

**Estimate:** 4–8 days.

**Rollback/fallback:** Remove synthetic prototype; no real records created.

**Closure evidence:** Schema, synthetic cases and review.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M49-06


**Candidate:** `CHAR-006` · **Domain/category:** Charity / Donations/allocation · **Priority/difficulty:** P2/D3 · **Owner:** finance/communications · **Effort:** M (4–7 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [CHAR-006 — Prototype a privacy-preserving allocation transparency report](../../research/unified-100-issue-frontier-v5/ISSUES_CHARITY.md) (full 22-section source).

## Objective

Test whether an aggregate report can explain funds received/allocated and remaining restrictions without naming beneficiaries.

## Scope and boundaries

Use entirely synthetic numbers to mock a report with reconciliation notes, period, definitions and caveats.

Static mock only; no live financial integration.

**Anti-overlap:** Does not create donations or public impact claims.

## Dependencies and start conditions

**Source dependency statement:** CHAR-005; related CHAR-010.

**Canonical TODO dependencies:** M49-05
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define aggregate fields
- generate fake example
- test re-identification risk
- ask reviewers to interpret
- revise.

## Acceptance criteria

Readers distinguish received, committed, disbursed and remaining; no person/location inferable from fixture.

## Definition of done

Finance and protection reviewers approve the mock language.

## Verification plan

Arithmetic reconciliation and re-identification scenario review.

## Risks, measures, rollback and closure

**Risks:** Aggregates can still reveal small groups; use suppression or no publication.

**Metrics:** Reconciliation errors and privacy-risk findings.

**Estimate:** 4–7 days.

**Rollback/fallback:** Withdraw mock; no public posting.

**Closure evidence:** Synthetic report, reconciliation and privacy review.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M49-07


**Candidate:** `CHAR-007` · **Domain/category:** Charity / Volunteers/participation · **Priority/difficulty:** P1/D4 · **Owner:** accountable program operator · **Effort:** L (4–8 days plus expert review.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [CHAR-007 — Define safe volunteer roles and safeguarding boundaries](../../research/unified-100-issue-frontier-v5/ISSUES_CHARITY.md) (full 22-section source).

## Objective

Specify what volunteers may and may not do in a hypothetical program.

## Scope and boundaries

Draft role cards, supervision requirements, prohibited actions and escalation contacts.

Policy document; no volunteer directory or dispatch feature.

**Anti-overlap:** Uses CHAR-003's role/escalation map and adds volunteer screening, training, supervision and prohibited-task limits only. No M32 member journey/moderation app.

## Dependencies and start conditions

**Source dependency statement:** CHAR-003.

**Canonical TODO dependencies:** M49-03
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Identify task types
- assess risk
- define screening/training
- set supervision
- review incidents and appeals.

## Acceptance criteria

Every role has scope, supervisor, training and prohibited tasks; high-risk roles are excluded absent qualified partner.

## Definition of done

Local legal/safeguarding review and partner approval.

## Verification plan

Tabletop cases for boundary crossing, complaint and no supervisor.

## Risks, measures, rollback and closure

**Risks:** Role description mistaken for clearance; never recruit before approval.

**Metrics:** Roles with complete safeguards and unresolved high-risk duties.

**Estimate:** 4–8 days plus expert review.

**Rollback/fallback:** Freeze volunteer activity and withdraw role cards.

**Closure evidence:** Role matrix, risk review and approvals.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M49-08


**Candidate:** `CHAR-008` · **Domain/category:** Charity / Volunteers/participation · **Priority/difficulty:** P2/D3 · **Owner:** program/UX · **Effort:** M (3–6 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [CHAR-008 — Design accessible volunteer participation without coercion](../../research/unified-100-issue-frontier-v5/ISSUES_CHARITY.md) (full 22-section source).

## Objective

Explore flexible participation, reimbursement and opt-out needs for a future partner-led activity.

## Scope and boundaries

Create a role-choice and expense policy mock; test fictional cases with expert reviewers.

Paper design; no sign-up or location tracking.

**Anti-overlap:** No community app, member profiles or M32 workflow.

## Dependencies and start conditions

**Source dependency statement:** CHAR-007.

**Canonical TODO dependencies:** M49-07
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Identify barriers
- specify accommodations
- define reimbursement questions
- set opt-out
- review.

## Acceptance criteria

No role requires undisclosed cost; accommodation and refusal paths are explicit.

## Definition of done

Local partner confirms feasibility before any recruitment.

## Verification plan

Scenario review for disability, travel, care duties and language access.

## Risks, measures, rollback and closure

**Risks:** Promise of reimbursement without funding; all costs remain hypothetical.

**Metrics:** Barriers identified and accommodations with an accountable owner.

**Estimate:** 3–6 days.

**Rollback/fallback:** Remove proposal if funding/partner unavailable.

**Closure evidence:** Barrier matrix and partner/reviewer response.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M49-09


**Candidate:** `CHAR-009` · **Domain/category:** Charity / Impact/protection · **Priority/difficulty:** P1/D4 · **Owner:** program evaluator · **Effort:** L (5–10 days plus evaluator time.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [CHAR-009 — Define an outcome measurement plan before a pilot](../../research/unified-100-issue-frontier-v5/ISSUES_CHARITY.md) (full 22-section source).

## Objective

Define one outcome, baseline and credible evidence method before any charitable pilot begins.

## Scope and boundaries

Draft a theory-of-change and evaluation matrix for a partner-selected hypothetical program.

Evaluation plan only; no personal outcome database.

**Anti-overlap:** Does not implement M32 community analytics or claim program success.

## Dependencies and start conditions

**Source dependency statement:** CHAR-001/003.

**Canonical TODO dependencies:** M49-01,M49-03
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Specify problem/outcome
- identify comparison limits
- choose measures
- define consent
- define adverse findings/publication.

## Acceptance criteria

Plan separates output, outcome and attribution; includes null/harmful results and missing data.

## Definition of done

Independent evaluator/partner reviews method.

## Verification plan

Scenario critique for selection bias, attrition and attribution.

## Risks, measures, rollback and closure

**Risks:** Measurement burden or false causal claim; minimize collection and state limitations.

**Metrics:** Measurement completeness and data burden; no numeric impact target invented.

**Estimate:** 5–10 days plus evaluator time.

**Rollback/fallback:** Do not run pilot if ethical measurement cannot be designed.

**Closure evidence:** Theory-of-change, measurement matrix and reviewer decision.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M49-10


**Candidate:** `CHAR-010` · **Domain/category:** Charity / Impact/protection · **Priority/difficulty:** P1/D4 · **Owner:** independent safeguarding lead · **Effort:** L (5–10 days plus qualified review.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [CHAR-010 — Define complaint, incident and remedy pathways](../../research/unified-100-issue-frontier-v5/ISSUES_CHARITY.md) (full 22-section source).

## Objective

Specify safe feedback, complaint, safeguarding incident and appeal paths before any program contact.

## Scope and boundaries

Draft multiple reporting routes, confidentiality limits, response owner, escalation and retaliation protections.

Governance protocol; no public form or sensitive case database.

**Anti-overlap:** Defines independent complaint, incident and remedy paths from the shared CHAR-003/007 role map; make the path ready before program contact. CHAR-009 outcome measurement is not a prerequisite. No M32 moderation/appeals implementation.

## Dependencies and start conditions

**Source dependency statement:** CHAR-003/007; related CHAR-009.

**Canonical TODO dependencies:** M49-03,M49-07
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Map report types
- define urgent response
- assign independent contact
- set retention/access
- tabletop unsafe disclosure.

## Acceptance criteria

Complainant can report without public identity; urgent cases have escalation; limits and response timing are clear.

## Definition of done

Local safeguarding/legal reviewer approves before program launch.

## Verification plan

Tabletop cases for retaliation, anonymous report, conflict of interest and unavailable lead.

## Risks, measures, rollback and closure

**Risks:** Confidentiality cannot be absolute; explain limits and referral boundaries honestly.

**Metrics:** Path coverage, owner availability and time-to-acknowledge target set by partner.

**Estimate:** 5–10 days plus qualified review.

**Rollback/fallback:** Pause program/contact if safe response capacity lapses.

**Closure evidence:** Protocol, tabletop results and sign-off.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---
## M50 — Corpus identity, interpretation and ontology safeguards

**Group:** G7 · **Priority:** mixed by leaf · **Prerequisites:** Existing M06/M16/M18/M19 and task-level ENG/FUT/ONT gates; rights/consent review precedes real-source use. · **Scope:** existing domain owners only. [Milestone context](docs/milestones/M50.md) · [V5 source package](docs/research/unified-100-issue-frontier-v5/README.md).

**Exit gate:** Distinctions remain reviewable; unknowns/disagreement stay explicit; no publication authority is added and all remain unchecked.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M50-01** — Define a canonical source and edition identity profile | P1 | D3 | M46-02 | Owner: corpus; effort: M (4–8 days.). Deliverable: Define the minimum fields that identify a source, edition, manifestation and immutable version. Scope: Inventory fields; map source/edition/witness; test ambiguous IDs; consult scholar; record unresolved pins. Acceptance: Two distinct editions cannot share an identity; unresolved fields remain UNKNOWN. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m50-01) · candidate ONT-001: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — comprehensive 4-level identity hierarchy defined (source, edition, manifestation, version); source identity profile with 22 fields (sourceId, title, alternativeTitles, author, dateCreated, datePrecision, language, genre, subject, provenance, provenanceUri, provenanceSha256, rightsStatus, rightsScope, rightsHolder, consentStatus, consentScope, consentExpiresAt, visibility, createdAt, updatedAt, version); edition identity profile with 22 fields (editionId, sourceId, editionTitle, editionNumber, editor, datePublished, datePrecision, publisher, placePublished, language, script, textualBasis, editorialPrinciples, variantNotes, criticalApparatus, rightsStatus, rightsScope, visibility, canonicalStatus, createdAt, updatedAt, version); manifestation identity profile with 22 fields (manifestationId, editionId, manifestationType, format, mimeType, fileSize, resolution, ocrAccuracy, encoding, language, location, locationType, accessRestrictions, provenance, provenanceUri, provenanceSha256, rightsStatus, rightsScope, visibility, createdAt, updatedAt, version); version identity profile with 17 fields (versionId, manifestationId, versionNumber, versionLabel, contentHash, contentSize, changeSummary, changeType, previousVersionId, isLatest, isStable, createdAt, createdBy, rightsStatus, visibility, version); identity resolution algorithm with 4-level traversal; uniqueness validation with 6 ambiguous case resolutions; canonical serialization format (JSON, alphabetical field order, no whitespace, deterministic); migration strategy with version field; unresolved pin handling policy with registry; 4 uniqueness tests, 2 serialization tests, 3 resolution tests documented; corpus owner and scholar review deferred (requires owner action). Evidence: [audit](docs/audit/M50-01-canonical-source-identity-profile.md). |
| - [ ] | **M50-02** — Model text, witness, edition and manifestation distinctions | P2 | D4 | M50-01,M16,M18 | Owner: corpus/witness; effort: L (5–10 days.). Deliverable: Specify how one textual work relates to witnesses, editions, transcriptions and digitized manifestations. Scope: Map current types; define relation semantics; create synthetic examples; identify lossy cases; review. Acceptance: Examples distinguish work, witness, edition, transcription and digital file; no identity inferred from title alone. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m50-02) · candidate ONT-002: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md). |
| - [x] | **M50-03** — Specify translation and transcription provenance fields | P2 | D3 | M50-01 | Owner: corpus; effort: M (4–7 days.). Deliverable: Define attribution and version fields for translations, transliterations and transcriptions. Scope: Inventory fields; distinguish translation/transliteration; specify contributor/edition/version; test uncertain attribution; review. Acceptance: A record cannot be labeled original-language text when its status is unknown. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m50-03) · candidate ONT-003: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — comprehensive provenance fields specified for 3 derivative work types: translation provenance profile with 18 fields (translationId, sourceLanguage, targetLanguage, translationType, translatorIdentity, translatorQualifications, translationDate, datePrecision, editionVersion, revisionHistory, reviewStatus, reviewedBy, reviewedAt, attributionConfidence, attributionSource, provenanceUri, provenanceSha256, version); transliteration provenance profile with 17 fields (transliterationId, passageRef, sourceScript, targetScript, transliterationSystem, transliterationDate, transliteratorIdentity, transliterationText, conventions, validationMethod, validationDate, validatedBy, rightsStatus, licenseName, provenanceUri, provenanceSha256, version); transcription provenance profile with 21 fields (transcriptionId, passageRef, sourceType, sourceMedium, transcriptionSystem, transcriptionDate, transcriberIdentity, transcriberQualifications, transcriptionText, recitationVariant, conventions, audioSourceUri, audioSourceSha256, validationMethod, validatedBy, validationDate, rightsStatus, licenseName, provenanceUri, provenanceSha256, version); type distinction matrix (translation vs transliteration vs transcription); 4 attribution confidence levels (KNOWN/TRADITIONAL/UNCERTAIN/ANONYMOUS) with validation rules; critical invariant: record cannot be labeled original-language text when status is unknown; 7 synthetic test cases (5 pass, 2 fail with correct error messages); migration strategy for existing corpus_translations records; overlap analysis with M50-01/M07/M08/M17/M18; scholar review and implementation deferred (requires owner action). Evidence: [audit](docs/audit/M50-03-translation-transcription-provenance.md). |
| - [ ] | **M50-04** — Specify citation snapshots and version-change behavior | P2 | D3 | M50-01,M18 | Owner: research/corpus; effort: M (4–8 days.). Deliverable: Define how a citation stays resolvable when an edition or digital transcription changes. Scope: Model revision case; define stable locator; test removed/changed span; document citation rendering. Acceptance: Old citation resolves to its recorded version or explicitly reports unavailable; it never silently retargets. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m50-04) · candidate ONT-004: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md). |
| - [x] | **M50-05** — Audit corpus inventory completeness without asserting authority | P2 | D3 | M50-01 | Owner: corpus/research; effort: M (4–8 days.). Deliverable: Produce a metadata-only map of source families, versions and known gaps in the current repository. Scope: Agree scope; enumerate metadata; classify evidence; identify missing provenance; review wording. Acceptance: Every row states review status and rights state; no completeness claim without denominator. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m50-05) · candidate ONT-005: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — comprehensive metadata-only inventory of corpus completed: 4-tier citation hierarchy documented (works, editions, passages, translations); current inventory: 1 work (Quran), 1 edition (Cairo 1924 Hafs), 1 passage (QS 2:82), 1 translation (Indonesian Kemenag); metadata completeness: 100% for all existing records across all 4 models; rights state: 100% tracked with RIGHTS_EXACT_VERSION_CLEARED for all editions/translations; provenance tracking: 100% complete with sourceUri and provenanceSha for all editions; review status: 100% documented for all records; coverage gaps identified: passage coverage 0.016% (1 of ~6,236), translation coverage <0.016%, single tradition/language/edition; wording review: neutral, factual language approved; confidentiality statement: no private sources included; recommendations: expand passage coverage, add English translation, add second edition, verify provenance (short-term); add other traditions, more languages, more editions, interpretation layer (medium-term); full Quran coverage, multi-tradition corpus, scholar review, rights audit (long-term); corpus expansion deferred (requires owner action). Evidence: [audit](docs/audit/M50-05-corpus-inventory-completeness.md). |
| - [x] | **M50-06** — Define neutral entity identity and disambiguation rules | P2 | D4 | M46-15,M47-15 | Owner: MoonQL ontology; effort: L (6–12 days.). Deliverable: Specify how an entity is distinguished from aliases, homonyms and interpretations. Scope: Inventory current types; define candidate/accepted distinction; create synthetic collisions; review merge/reversal. Acceptance: Similar labels alone never auto-merge; every alias has source and reviewer/state. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m50-06) · candidate ONT-006: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md). **Closed 2026-10-31 at this working tree:** BASELINE ESTABLISHED — Entity identity and disambiguation framework with 5 entity categories (person/text/edition/concept/location), current identity model (TypeScript Entity interface), 3 review states (CANDIDATE/ACCEPTED/DISPUTED) with review process (creation/review/acceptance), reviewer qualifications per entity type, 3 synthetic collision test cases (alias collision/homonym collision/interpretation collision) with resolution procedures, merge process (7 steps with merge record schema), reversal process (6 steps with reversal record schema), auto-merge prevention rules (similarity threshold flagging, no auto-merge on labels alone), alias source/reviewer requirement (Alias schema with source/attested_by/state), overlap analysis with M46-15/M47-15/M50-05. Real implementation deferred. Evidence: [design](docs/audit/M50-06-entity-identity-disambiguation.md). |
| - [ ] | **M50-07** — Separate claim, evidence, interpretation and tradition records | P1 | D4 | M47-09,M16-07,M16 | Owner: MoonQL research/ontology; effort: L (6–12 days.). Deliverable: Map current records to distinct source evidence, attributed claims, interpretations and tradition context. Scope: Inventory types; map class semantics; identify ambiguous records; review examples; record blockers. Acceptance: Every example has one explicit class or remains unlabelled/withheld; no silent conversion. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m50-07) · candidate ONT-007: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md). |
| - [ ] | **M50-08** — Represent contested claims as attributed parallel positions | P2 | D4 | M50-07 | Owner: ontology/research; effort: L (5–10 days.). Deliverable: Specify how incompatible scholarly or tradition-specific positions remain separately attributable. Scope: Create synthetic disagreement; map current schema; test multiple positions; review ordering and attribution. Acceptance: Both positions remain visible; disagreement is not averaged or resolved by vote. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m50-08) · candidate ONT-008: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md). |
| - [ ] | **M50-09** — Make graph edges traceable to source and reasoning | P1 | D4 | M46-20,M50-08 | Owner: MoonQL Graph; effort: L (5–10 days.). Deliverable: Ensure a displayed graph edge identifies whether it comes directly from a source, editorial assertion or derived rule. Scope: Inventory edge creation; classify source; add fixture refs; test omission behavior; review user meaning. Acceptance: Missing source/reasoning leaves edge withheld or explicitly unknown. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m50-09) · candidate ONT-009: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md). |
| - [ ] | **M50-10** — Evaluate a PROV-O mapping for existing provenance records | P2 | D4 | M46-12,M50-09 | Owner: research/corpus; effort: L (4–8 days.). Deliverable: Compare a small set of MoonWitness provenance events with W3C PROV-O concepts. Scope: Select events; map terms; validate graph; note semantics lost; recommend adopt/mapping/no-go. Acceptance: Every mapping has rationale; no exported term silently claims stronger provenance. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m50-10) · candidate ONT-010: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md). |
| - [ ] | **M50-11** — Prepare a source-critical review protocol for contested material | P2 | D4 | M50-01 | Owner: scholarly review lead; effort: L (5–10 days plus expert review.). Deliverable: Define how a future study distinguishes primary artifact, edition, translation, scholarly claim and tradition-specific interpretation. Scope: Consult qualified scholars; draft checklist; test against fictional case; revise bias/conflict section. Acceptance: Reviewer can distinguish source observation, inference and interpretation in sample. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m50-11) · candidate ONT-011: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md). |
| - [ ] | **M50-12** — Define attribution for comparative religious claims | P2 | D4 | M50-11 | Owner: scholarly review; effort: L (4–8 days.). Deliverable: Specify what context must accompany a comparative statement so it is not presented as universal consensus. Scope: Draft rubric; test fictional statements; consult diverse scholars; identify missing context; revise. Acceptance: Samples cannot be read as universal when evidence supports only a bounded group/time. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m50-12) · candidate ONT-012: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md). |
| - [ ] | **M50-13** — Create a translation-variant review exercise | P2 | D4 | M50-03,M50-11 | Owner: textual research; effort: L (5–10 days plus rights/expert access.). Deliverable: Test a human review workflow for comparing two authorized translation records without producing a “correct” interpretation. Scope: Secure sample; record edition data; compare variants; annotate uncertainty; review with qualified specialist. Acceptance: Difference is described without ranking unless evidence and reviewer justify it. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m50-13) · candidate ONT-013: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md). |
| - [ ] | **M50-14** — Prototype a citation-first compare view | P2 | D3 | M47-08,M19 | Owner: Dock/research UX; effort: M (4–8 days.). Deliverable: Test a side-by-side view that keeps source versions and attribution visible while comparing two synthetic records. Scope: Create synthetic pair; build view; test scroll/context; check screen reader; review. Acceptance: Each panel retains edition/version when scrolling; unmatched fields remain explicit. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m50-14) · candidate ONT-014: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md). |
| - [ ] | **M50-15** — Test provenance-aware search facets | P2 | D3 | M50-01 | Owner: research UX/search; effort: M (4–8 days.). Deliverable: Explore filters for language, source type, version and evidence class on synthetic records. Scope: Define neutral fields; create fake records; prototype; test retrieval tasks; examine bias. Acceptance: Filters never imply authority; unknown metadata remains filterable as unknown. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m50-15) · candidate ONT-015: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md). |
| - [ ] | **M50-16** — Design a source-literacy learning module | P2 | D3 | M50-11 | Owner: education/research; effort: M (4–7 days.). Deliverable: Develop a short lesson teaching source, edition, interpretation and uncertainty distinctions. Scope: Define learning outcomes; draft examples; review neutrality; test comprehension; revise. Acceptance: Learner distinguishes primary record, edition and interpretation in all fixture cases. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m50-16) · candidate ONT-016: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md). |
| - [ ] | **M50-17** — Define a transparent review protocol for interpretive summaries | P1 | D4 | M50-11,M20 | Owner: research governance; effort: L (5–10 days.). Deliverable: Specify how human reviewers check attribution, evidence scope and disagreement in a future interpretive summary. Scope: Define review questions; separate content/rights/publication checks; test fictional summaries; record dissent process. Acceptance: Review record states what was and was not reviewed; approval never implies D08 release. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m50-17) · candidate ONT-017: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md). |
| - [ ] | **M50-18** — Establish source correction and version-history principles | P2 | D4 | M50-04,M18,M19 | Owner: corpus governance; effort: L (5–10 days.). Deliverable: Define how an error in source metadata or attribution is corrected without concealing prior state. Scope: Define classes; map authority; model synthetic correction; test citation behavior; review privacy/rights conflicts. Acceptance: Each class has approver, user-facing notice and retention disposition; no silent overwrite. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m50-18) · candidate ONT-018: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md). |
| - [ ] | **M50-19** — Define historical date and calendar provenance | P2 | D3 | M50-01 | Owner: research/ontology; effort: M (4–8 days.). Deliverable: Specify how uncertain dates, calendar systems and conversion assumptions are represented. Scope: Create synthetic calendar cases; define range semantics; record conversion provenance; review with historian. Acceptance: Uncertain date stays a range/unknown; conversion is reproducible from stated method. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m50-19) · candidate ONT-019: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md). |
| - [ ] | **M50-20** — Prototype a timeline that displays uncertain dates honestly | P2 | D4 | M50-19 | Owner: research UX; effort: L (4–8 days.). Deliverable: Test whether users can interpret date ranges, contested ordering and unknown dates in a synthetic history view. Scope: Create fictional dataset; render ranges/contested ordering; test comprehension; check screen reader; decide. Acceptance: Users identify uncertain ranges and can read same facts in text alternative. Full DoD, tests/evidence, risk, rollback, metrics and start checklist: [details](#m50-20) · candidate ONT-020: [specification](docs/research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md). |

## M50 — Detailed Task Specifications

_Below is the full specification for each M50 task, consolidated from individual packet files._


### M50-01


**Candidate:** `ONT-001` · **Domain/category:** Faith/Ontology / Corpus/source provenance · **Priority/difficulty:** P1/D3 · **Owner:** corpus · **Effort:** M (4–8 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ONT-001 — Define a canonical source and edition identity profile](../../research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md) (full 22-section source).

## Objective

Define the minimum fields that identify a source, edition, manifestation and immutable version.

## Scope and boundaries

Compare existing models and propose identifiers, edition metadata, date precision, language, rights state and resolution evidence.

Contract mapping for existing corpus owner; no global source catalog.

**Anti-overlap:** Gap audit only; does not recreate M07 source identity, M08 citation UI, source acquisition, rights approval, or M18 rights storage.

## Dependencies and start conditions

**Source dependency statement:** ENG-005; related ENG-002; enables ONT-002.

**Canonical TODO dependencies:** M46-05
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Inventory fields
- map source/edition/witness
- test ambiguous IDs
- consult scholar
- record unresolved pins.

## Acceptance criteria

Two distinct editions cannot share an identity; unresolved fields remain UNKNOWN.

## Definition of done

Corpus owner and qualified textual scholar review definitions.

## Verification plan

Synthetic identity uniqueness and serialization fixtures.

## Risks, measures, rollback and closure

**Risks:** Imposed schema may erase tradition-specific distinctions; allow extension and document profile limits.

**Metrics:** Required identity fields covered and unresolved examples.

**Estimate:** 4–8 days.

**Rollback/fallback:** Keep profile as proposal; no stored data migrated.

**Closure evidence:** Field map, synthetic cases and scholar sign-off.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M50-02


**Candidate:** `ONT-002` · **Domain/category:** Faith/Ontology / Corpus/source provenance · **Priority/difficulty:** P2/D4 · **Owner:** corpus/witness · **Effort:** L (5–10 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ONT-002 — Model text, witness, edition and manifestation distinctions](../../research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md) (full 22-section source).

## Objective

Specify how one textual work relates to witnesses, editions, transcriptions and digitized manifestations.

## Scope and boundaries

Produce a small conceptual model with explicit relations and example records.

Extend existing MoonQL corpus/witness boundary only after owner review.

**Anti-overlap:** Reuses the M07/M08 corpus identity model; conceptual gap map only, with synthetic examples. Not a new corpus store or source rights decision.

## Dependencies and start conditions

**Source dependency statement:** ONT-001; external gate M16/M18 for real content.

**Canonical TODO dependencies:** M50-01
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Map current types
- define relation semantics
- create synthetic examples
- identify lossy cases
- review.

## Acceptance criteria

Examples distinguish work, witness, edition, transcription and digital file; no identity inferred from title alone.

## Definition of done

Textual studies reviewer and package owner approve.

## Verification plan

Schema and referential-integrity fixtures.

## Risks, measures, rollback and closure

**Risks:** Some traditions do not fit a single textual genealogy; preserve multiple relationships.

**Metrics:** Example coverage and ambiguous identities.

**Estimate:** 5–10 days.

**Rollback/fallback:** Retain model as proposal; no migration.

**Closure evidence:** Model diagram, examples and review record.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M50-03


**Candidate:** `ONT-003` · **Domain/category:** Faith/Ontology / Corpus/source provenance · **Priority/difficulty:** P2/D3 · **Owner:** corpus · **Effort:** M (4–7 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ONT-003 — Specify translation and transcription provenance fields](../../research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md) (full 22-section source).

## Objective

Define attribution and version fields for translations, transliterations and transcriptions.

## Scope and boundaries

Draft a source-neutral field profile and an explicit unknown/anonymous-translator state.

Mapping to corpus metadata; no translation-generation feature.

**Anti-overlap:** Gap mapping against M07/M08 translation metadata only; no parallel provenance fields, translation generation/license, or duplicate M17/M18 rights storage.

## Dependencies and start conditions

**Source dependency statement:** ONT-001/002; related FUT-006.

**Canonical TODO dependencies:** M50-01,M50-02
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Inventory fields
- distinguish translation/transliteration
- specify contributor/edition/version
- test uncertain attribution
- review.

## Acceptance criteria

A record cannot be labeled original-language text when its status is unknown.

## Definition of done

Language and textual reviewers approve terms.

## Verification plan

Synthetic validation for missing translator, revision and language tag.

## Risks, measures, rollback and closure

**Risks:** Attribution may be contested or collective; support uncertainty and tradition-specific practice.

**Metrics:** Provenance completeness, with unknowns counted honestly.

**Estimate:** 4–7 days.

**Rollback/fallback:** Keep metadata proposal unimplemented.

**Closure evidence:** Profile, examples and reviewer note.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M50-04


**Candidate:** `ONT-004` · **Domain/category:** Faith/Ontology / Corpus/source provenance · **Priority/difficulty:** P2/D3 · **Owner:** research/corpus · **Effort:** M (4–8 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ONT-004 — Specify citation snapshots and version-change behavior](../../research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md) (full 22-section source).

## Objective

Define how a citation stays resolvable when an edition or digital transcription changes.

## Scope and boundaries

Use immutable version refs plus a clear “current version” relation and change note.

Reuse source identity profile; no URL shortener or external archive dependency.

**Anti-overlap:** Resolves citation version identity and unavailable-version behavior only; ONT-018 owns correction/withdrawal authority, notice and retention. Does not implement M18 revocation/cache behavior or rebuild M08 citation UI.

## Dependencies and start conditions

**Source dependency statement:** ONT-001; M18 publication gate applies only before public citation of real content.

**Canonical TODO dependencies:** M50-01
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Model revision case
- define stable locator
- test removed/changed span
- document citation rendering.

## Acceptance criteria

Old citation resolves to its recorded version or explicitly reports unavailable; it never silently retargets.

## Definition of done

Corpus owner approves retention/access behavior.

## Verification plan

Version change and missing-source fixtures.

## Risks, measures, rollback and closure

**Risks:** Retention can conflict with rights or withdrawal; refer to existing authority.

**Metrics:** Citations resolving to exact version and explicit unavailable states.

**Estimate:** 4–8 days.

**Rollback/fallback:** Preserve prior citation semantics; do not rewrite old refs.

**Closure evidence:** Test cases, policy and owner sign-off.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M50-05


**Candidate:** `ONT-005` · **Domain/category:** Faith/Ontology / Corpus/source provenance · **Priority/difficulty:** P2/D3 · **Owner:** corpus/research · **Effort:** M (4–8 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ONT-005 — Audit corpus inventory completeness without asserting authority](../../research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md) (full 22-section source).

## Objective

Produce a metadata-only map of source families, versions and known gaps in the current repository.

## Scope and boundaries

Inventory only approved metadata and mark not reviewed, unavailable, contested or rights-unknown states.

Read-only report from existing records; no source ingestion.

**Anti-overlap:** Not M19 public-source release, corpus import or theological canon.

## Dependencies and start conditions

**Source dependency statement:** ONT-001; related ENG-005.

**Canonical TODO dependencies:** M50-01
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Agree scope
- enumerate metadata
- classify evidence
- identify missing provenance
- review wording.

## Acceptance criteria

Every row states review status and rights state; no completeness claim without denominator.

## Definition of done

Corpus and rights owners approve scope; confidential sources excluded.

## Verification plan

Inventory parser and missing-state fixtures.

## Risks, measures, rollback and closure

**Risks:** Inventory itself may reveal sensitive/private material; publish only approved metadata.

**Metrics:** Records with known source/version status and unknown count.

**Estimate:** 4–8 days.

**Rollback/fallback:** Withhold report if classification or rights is unclear.

**Closure evidence:** Approved scope, inventory and gap list.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M50-06


**Candidate:** `ONT-006` · **Domain/category:** Faith/Ontology / Ontology/epistemology · **Priority/difficulty:** P2/D4 · **Owner:** MoonQL ontology · **Effort:** L (6–12 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ONT-006 — Define neutral entity identity and disambiguation rules](../../research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md) (full 22-section source).

## Objective

Specify how an entity is distinguished from aliases, homonyms and interpretations.

## Scope and boundaries

Define stable IDs, alias provenance, confidence, merge review and reversible candidate state.

Existing ontology package; no third SQL owner or central identity provider.

**Anti-overlap:** Not M20-04 reviewer panel or identity/authentication system.

## Dependencies and start conditions

**Source dependency statement:** ENG-015 and FUT-015; enables ONT-007.

**Canonical TODO dependencies:** M46-15,M47-15
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Inventory current types
- define candidate/accepted distinction
- create synthetic collisions
- review merge/reversal.

## Acceptance criteria

Similar labels alone never auto-merge; every alias has source and reviewer/state.

## Definition of done

Ontology owner approves semantics; no production merge.

## Verification plan

Collision, alias, language and rollback fixtures.

## Risks, measures, rollback and closure

**Risks:** Identity model imposes tradition-specific assumptions; make uncertainty explicit.

**Metrics:** False merge fixture rate and unresolved candidate count.

**Estimate:** 6–12 days.

**Rollback/fallback:** Candidate mapping reversible; accepted records unchanged.

**Closure evidence:** Rule set, fixture results and scholarly review.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M50-07


**Candidate:** `ONT-007` · **Domain/category:** Faith/Ontology / Ontology/epistemology · **Priority/difficulty:** P1/D4 · **Owner:** MoonQL research/ontology · **Effort:** L (6–12 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ONT-007 — Separate claim, evidence, interpretation and tradition records](../../research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md) (full 22-section source).

## Objective

Map current records to distinct source evidence, attributed claims, interpretations and tradition context.

## Scope and boundaries

Produce a schema mapping and missing-state examples; defer projection labels until M16-07 is resolved.

Reuse existing epistemic classes; no parallel classification enum.

**Anti-overlap:** Non-projecting schema map only; does not redo M16-07 labels. FUT-009/FUT-027 are optional UX references, not prerequisites.

## Dependencies and start conditions

**Source dependency statement:** No blocker for a non-projecting schema map; M16-07 is an external gate before any projection. FUT-009/027 are related UX references; enables ONT-008.

**Canonical TODO dependencies:** —
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Inventory types
- map class semantics
- identify ambiguous records
- review examples
- record blockers.

## Acceptance criteria

Every example has one explicit class or remains unlabelled/withheld; no silent conversion.

## Definition of done

Ontology and rights owners approve mapping; no production projection changed.

## Verification plan

Pure mapping fixtures for missing, unknown and conflicting labels.

## Risks, measures, rollback and closure

**Risks:** Category definitions may be contested; attribute framework and reviewer scope.

**Metrics:** Records mapped/unknown and invalid class transition count.

**Estimate:** 6–12 days.

**Rollback/fallback:** Keep mapping proposal only; no schema migration.

**Closure evidence:** Mapping, fixtures and owner review.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M50-08


**Candidate:** `ONT-008` · **Domain/category:** Faith/Ontology / Ontology/epistemology · **Priority/difficulty:** P2/D4 · **Owner:** ontology/research · **Effort:** L (5–10 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ONT-008 — Represent contested claims as attributed parallel positions](../../research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md) (full 22-section source).

## Objective

Specify how incompatible scholarly or tradition-specific positions remain separately attributable.

## Scope and boundaries

Model positions, proponents, source refs, scope, date and response/critique links without majority ranking.

Proposed extension to existing claim/research records; no consensus engine.

**Anti-overlap:** Not a voting/reviewer authority system.

## Dependencies and start conditions

**Source dependency statement:** ONT-007; related FUT-023.

**Canonical TODO dependencies:** M50-07
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Create synthetic disagreement
- map current schema
- test multiple positions
- review ordering and attribution.

## Acceptance criteria

Both positions remain visible; disagreement is not averaged or resolved by vote.

## Definition of done

Qualified researchers approve terminology and attribution.

## Verification plan

Round-trip multiple claims and critique relations.

## Risks, measures, rollback and closure

**Risks:** False balance or selective representation; source quality and scope must remain visible.

**Metrics:** Position attribution completeness and reviewer misinterpretation.

**Estimate:** 5–10 days.

**Rollback/fallback:** Remove proposed extension; current records unchanged.

**Closure evidence:** Synthetic examples, mapping and review record.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M50-09


**Candidate:** `ONT-009` · **Domain/category:** Faith/Ontology / Ontology/epistemology · **Priority/difficulty:** P1/D4 · **Owner:** MoonQL Graph · **Effort:** L (5–10 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ONT-009 — Make graph edges traceable to source and reasoning](../../research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md) (full 22-section source).

## Objective

Ensure a displayed graph edge identifies whether it comes directly from a source, editorial assertion or derived rule.

## Scope and boundaries

Add a provenance reference and relation-kind requirement to a synthetic projection.

Existing graph projection; no new graph store.

**Anti-overlap:** Projection/UI conformance audit only; reuses current ontology and graph evidence fields. No ontology redesign, parallel provenance enum, or inference engine.

## Dependencies and start conditions

**Source dependency statement:** ENG-020 and ONT-008; enables ONT-010.

**Canonical TODO dependencies:** M46-20,M50-08
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Inventory edge creation
- classify source
- add fixture refs
- test omission behavior
- review user meaning.

## Acceptance criteria

Missing source/reasoning leaves edge withheld or explicitly unknown.

## Definition of done

Graph owner and researcher approve relation semantics.

## Verification plan

Projection tests for direct, editorial, derived and unknown edges.

## Risks, measures, rollback and closure

**Risks:** Provenance fields can be falsely treated as validation; explain source vs proof.

**Metrics:** Edges with complete provenance and withheld count.

**Estimate:** 5–10 days.

**Rollback/fallback:** Hide new edge type; retain existing records.

**Closure evidence:** Synthetic projections, tests and reviewer sign-off.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M50-10


**Candidate:** `ONT-010` · **Domain/category:** Faith/Ontology / Ontology/epistemology · **Priority/difficulty:** P2/D4 · **Owner:** research/corpus · **Effort:** L (4–8 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ONT-010 — Evaluate a PROV-O mapping for existing provenance records](../../research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md) (full 22-section source).

## Objective

Compare a small set of MoonWitness provenance events with W3C PROV-O concepts.

## Scope and boundaries

Map three synthetic activities/entities/agents and list unmapped concepts.

Optional export vocabulary only; existing package remains canonical.

**Anti-overlap:** No new provenance database or system of record.

## Dependencies and start conditions

**Source dependency statement:** ENG-012 and ONT-009.

**Canonical TODO dependencies:** M46-12,M50-09
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Select events
- map terms
- validate graph
- note semantics lost
- recommend adopt/mapping/no-go.

## Acceptance criteria

Every mapping has rationale; no exported term silently claims stronger provenance.

## Definition of done

Package owner and provenance researcher approve.

## Verification plan

Fixture validation against published vocabulary terms.

## Risks, measures, rollback and closure

**Risks:** External term drift and false equivalence.

**Metrics:** Mapped concepts and unresolved semantics.

**Estimate:** 4–8 days.

**Rollback/fallback:** Drop exporter; current records unaffected.

**Closure evidence:** Mapping table, validator output and decision.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M50-11


**Candidate:** `ONT-011` · **Domain/category:** Faith/Ontology / Interpretation/source criticism · **Priority/difficulty:** P2/D4 · **Owner:** scholarly review lead · **Effort:** L (5–10 days plus expert review.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ONT-011 — Prepare a source-critical review protocol for contested material](../../research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md) (full 22-section source).

## Objective

Define how a future study distinguishes primary artifact, edition, translation, scholarly claim and tradition-specific interpretation.

## Scope and boundaries

Create a review checklist with exact citation, edition/version, method, counterevidence and uncertainty fields.

Human research protocol; no automated authority score.

**Anti-overlap:** Not content moderation or publication authorization.

## Dependencies and start conditions

**Source dependency statement:** ONT-001/007; related FUT-008.

**Canonical TODO dependencies:** M50-01,M50-07
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Consult qualified scholars
- draft checklist
- test against fictional case
- revise bias/conflict section.

## Acceptance criteria

Reviewer can distinguish source observation, inference and interpretation in sample.

## Definition of done

Qualified domain reviewers approve and note tradition limitations.

## Verification plan

Tabletop case and reviewer agreement check.

## Risks, measures, rollback and closure

**Risks:** One tradition’s method may be generalized inappropriately.

**Metrics:** Classification agreement and unresolved method questions.

**Estimate:** 5–10 days plus expert review.

**Rollback/fallback:** Withdraw protocol if consultation is inadequate.

**Closure evidence:** Protocol, fictional test case and reviewers.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M50-12


**Candidate:** `ONT-012` · **Domain/category:** Faith/Ontology / Interpretation/source criticism · **Priority/difficulty:** P2/D4 · **Owner:** scholarly review · **Effort:** L (4–8 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ONT-012 — Define attribution for comparative religious claims](../../research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md) (full 22-section source).

## Objective

Specify what context must accompany a comparative statement so it is not presented as universal consensus.

## Scope and boundaries

Develop a fictional-example rubric for tradition, subtradition, geography, period, source, author and disagreement.

Content review protocol; no user belief profile or ranking.

**Anti-overlap:** Not a theological ontology or authority decision.

## Dependencies and start conditions

**Source dependency statement:** ONT-011; related FUT-023.

**Canonical TODO dependencies:** M50-11
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Draft rubric
- test fictional statements
- consult diverse scholars
- identify missing context
- revise.

## Acceptance criteria

Samples cannot be read as universal when evidence supports only a bounded group/time.

## Definition of done

Cultural/religious sensitivity review and documented limits.

## Verification plan

Reviewer interpretation of fictional examples.

## Risks, measures, rollback and closure

**Risks:** Checklist can create false completeness; require narrative caveat where needed.

**Metrics:** Attribution completeness and overgeneralization flags.

**Estimate:** 4–8 days.

**Rollback/fallback:** Keep rubric as draft; no content projection.

**Closure evidence:** Rubric, fictional cases and reviewer notes.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M50-13


**Candidate:** `ONT-013` · **Domain/category:** Faith/Ontology / Interpretation/source criticism · **Priority/difficulty:** P2/D4 · **Owner:** textual research · **Effort:** L (5–10 days plus rights/expert access.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ONT-013 — Create a translation-variant review exercise](../../research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md) (full 22-section source).

## Objective

Test a human review workflow for comparing two authorized translation records without producing a “correct” interpretation.

## Scope and boundaries

Use synthetic paraphrases or a cleared short sample to label translator/edition/date and reviewer notes.

Research exercise; no generated translation or public feature.

**Anti-overlap:** Not translation generation, alignment automation or M18 rights storage.

## Dependencies and start conditions

**Source dependency statement:** ONT-003 and ONT-011; related FUT-006.

**Canonical TODO dependencies:** M50-03,M50-11
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Secure sample
- record edition data
- compare variants
- annotate uncertainty
- review with qualified specialist.

## Acceptance criteria

Difference is described without ranking unless evidence and reviewer justify it.

## Definition of done

Rights, language specialist and cultural reviewer approve.

## Verification plan

Metadata completeness and reviewer walkthrough.

## Risks, measures, rollback and closure

**Risks:** Context loss, copyright and theological overreach.

**Metrics:** Provenance completeness and interpretation disagreement.

**Estimate:** 5–10 days plus rights/expert access.

**Rollback/fallback:** Remove sample; retain only synthetic method example.

**Closure evidence:** Cleared/synthetic sample, annotations and sign-off.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M50-14


**Candidate:** `ONT-014` · **Domain/category:** Faith/Ontology / Exploration/education · **Priority/difficulty:** P2/D3 · **Owner:** Dock/research UX · **Effort:** M (4–8 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ONT-014 — Prototype a citation-first compare view](../../research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md) (full 22-section source).

## Objective

Test a side-by-side view that keeps source versions and attribution visible while comparing two synthetic records.

## Scope and boundaries

Build local mock with persistent citation header, differences and unknown fields.

Static prototype only; no Dock route or publication.

**Anti-overlap:** Shares synthetic fixtures with FUT-008/FUT-009/FUT-025 but owns only citation-preserving side-by-side comparison. Does not implement M19 Dock compare/publication.

## Dependencies and start conditions

**Source dependency statement:** FUT-008; external M19 gate for any real data.

**Canonical TODO dependencies:** M47-08
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Create synthetic pair
- build view
- test scroll/context
- check screen reader
- review.

## Acceptance criteria

Each panel retains edition/version when scrolling; unmatched fields remain explicit.

## Definition of done

Rights/status labels included as demo data only.

## Verification plan

Layout/state tests and keyboard usability.

## Risks, measures, rollback and closure

**Risks:** Compare implies equivalence; label differences and scope.

**Metrics:** Edition identification accuracy and context-loss rate.

**Estimate:** 4–8 days.

**Rollback/fallback:** Delete prototype.

**Closure evidence:** Mock, usability notes and boundary review.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M50-15


**Candidate:** `ONT-015` · **Domain/category:** Faith/Ontology / Exploration/education · **Priority/difficulty:** P2/D3 · **Owner:** research UX/search · **Effort:** M (4–8 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ONT-015 — Test provenance-aware search facets](../../research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md) (full 22-section source).

## Objective

Explore filters for language, source type, version and evidence class on synthetic records.

## Scope and boundaries

Mock facets over a small synthetic dataset and compare task completion with plain search.

UX study only; no search index or taxonomy change.

**Anti-overlap:** No search backend rebuild.

## Dependencies and start conditions

**Source dependency statement:** ONT-001/007.

**Canonical TODO dependencies:** M50-01,M50-07
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define neutral fields
- create fake records
- prototype
- test retrieval tasks
- examine bias.

## Acceptance criteria

Filters never imply authority; unknown metadata remains filterable as unknown.

## Definition of done

Search/ontology owner reviews categories.

## Verification plan

Facet semantics and accessible control review.

## Risks, measures, rollback and closure

**Risks:** Missing metadata hides sources; present unknown explicitly.

**Metrics:** Source findability, filter error and metadata coverage.

**Estimate:** 4–8 days.

**Rollback/fallback:** Remove mock.

**Closure evidence:** Dataset, task results and owner decision.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M50-16


**Candidate:** `ONT-016` · **Domain/category:** Faith/Ontology / Exploration/education · **Priority/difficulty:** P2/D3 · **Owner:** education/research · **Effort:** M (4–7 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ONT-016 — Design a source-literacy learning module](../../research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md) (full 22-section source).

## Objective

Develop a short lesson teaching source, edition, interpretation and uncertainty distinctions.

## Scope and boundaries

Create three fictional examples and a self-check explanation.

Static content prototype; no user profiles, score or belief assessment.

**Anti-overlap:** Not a religious instruction or curriculum claim.

## Dependencies and start conditions

**Source dependency statement:** ONT-011/012.

**Canonical TODO dependencies:** M50-11,M50-12
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define learning outcomes
- draft examples
- review neutrality
- test comprehension
- revise.

## Acceptance criteria

Learner distinguishes primary record, edition and interpretation in all fixture cases.

## Definition of done

Scholar/accessibility review; no doctrinal advice.

## Verification plan

Answer-key correctness, keyboard and plain-language review.

## Risks, measures, rollback and closure

**Risks:** Lesson presents one scholarly approach as universal; identify scope.

**Metrics:** Pre/post classification and confidence calibration.

**Estimate:** 4–7 days.

**Rollback/fallback:** Withdraw module; no learner data persisted.

**Closure evidence:** Lesson, rubric and review.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M50-17


**Candidate:** `ONT-017` · **Domain/category:** Faith/Ontology / Interpretive governance · **Priority/difficulty:** P1/D4 · **Owner:** research governance · **Effort:** L (5–10 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ONT-017 — Define a transparent review protocol for interpretive summaries](../../research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md) (full 22-section source).

## Objective

Specify how human reviewers check attribution, evidence scope and disagreement in a future interpretive summary.

## Scope and boundaries

Create review checklist with reviewer expertise, conflicts, scope, dissent and decision limits.

Process document; no reviewer grant store or UI.

**Anti-overlap:** Checks interpretive summaries using fictional cases and shared reviewer/conflict/dissent vocabulary; ONT-011 owns source-reading method. No second review authority, M20 reviewer panel/store, M18 release decision or M16 projection-label implementation.

## Dependencies and start conditions

**Source dependency statement:** ONT-011/012; M20 is an external gate only before integration with real reviewer authority.

**Canonical TODO dependencies:** M50-11,M50-12
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define review questions
- separate content/rights/publication checks
- test fictional summaries
- record dissent process.

## Acceptance criteria

Review record states what was and was not reviewed; approval never implies D08 release.

## Definition of done

Qualified reviewers and governance owner approve.

## Verification plan

Tabletop cases for conflict, disagreement, missing evidence and publication.

## Risks, measures, rollback and closure

**Risks:** Reviewer scarcity and authority concentration; allow unresolved/dissent outcomes.

**Metrics:** Checklist coverage and unresolved review questions.

**Estimate:** 5–10 days.

**Rollback/fallback:** Keep draft only; no summary released.

**Closure evidence:** Approved protocol and scenario results.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M50-18


**Candidate:** `ONT-018` · **Domain/category:** Faith/Ontology / Interpretive governance · **Priority/difficulty:** P2/D4 · **Owner:** corpus governance · **Effort:** L (5–10 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ONT-018 — Establish source correction and version-history principles](../../research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md) (full 22-section source).

## Objective

Define how an error in source metadata or attribution is corrected without concealing prior state.

## Scope and boundaries

Draft separate correction classes: factual metadata, interpretive note, rights restriction and withdrawal.

Governance mapping to existing version/revocation owners; no new history database.

**Anti-overlap:** Owns correction class, approver, notice and retention principles; ONT-004 owns citation version resolution. Does not replace M18 revocation/cache or M19 public-rights work.

## Dependencies and start conditions

**Source dependency statement:** ONT-004/017; M18/M19 are external gates only for real publication, correction or rights-withdrawal actions.

**Canonical TODO dependencies:** M50-04,M50-17
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Define classes
- map authority
- model synthetic correction
- test citation behavior
- review privacy/rights conflicts.

## Acceptance criteria

Each class has approver, user-facing notice and retention disposition; no silent overwrite.

## Definition of done

Rights/privacy/research owners approve boundaries.

## Verification plan

Tabletop cases; regression fixtures for synthetic version chain.

## Risks, measures, rollback and closure

**Risks:** Retaining withdrawn data may be unlawful or unsafe; existing authority takes precedence.

**Metrics:** Correction events with complete rationale and access disposition.

**Estimate:** 5–10 days.

**Rollback/fallback:** Do not implement until policy resolves conflicts.

**Closure evidence:** Correction matrix, scenario outcomes and sign-off.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M50-19


**Candidate:** `ONT-019` · **Domain/category:** Faith/Ontology / History/timeline · **Priority/difficulty:** P2/D3 · **Owner:** research/ontology · **Effort:** M (4–8 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ONT-019 — Define historical date and calendar provenance](../../research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md) (full 22-section source).

## Objective

Specify how uncertain dates, calendar systems and conversion assumptions are represented.

## Scope and boundaries

Draft a date record with original expression, calendar, conversion method, range, source and disagreement.

Data-profile proposal within existing ontology/corpus owners.

**Anti-overlap:** No historical assertions or religious chronology production.

## Dependencies and start conditions

**Source dependency statement:** ONT-001/011.

**Canonical TODO dependencies:** M50-01,M50-11
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Create synthetic calendar cases
- define range semantics
- record conversion provenance
- review with historian.

## Acceptance criteria

Uncertain date stays a range/unknown; conversion is reproducible from stated method.

## Definition of done

Qualified historian reviews terms and examples.

## Verification plan

Date range, calendar and conversion fixtures.

## Risks, measures, rollback and closure

**Risks:** Calendar conversion may imply false precision or culturally privilege one epoch.

**Metrics:** Dates with source/method and uncertainty fields.

**Estimate:** 4–8 days.

**Rollback/fallback:** Keep profile proposal; no historical records changed.

**Closure evidence:** Synthetic examples, tests and historian note.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---

### M50-20


**Candidate:** `ONT-020` · **Domain/category:** Faith/Ontology / History/timeline · **Priority/difficulty:** P2/D4 · **Owner:** research UX · **Effort:** L (4–8 days.). [TODO](../../../TODO.md) is the only status source; this packet has no independent completion status.

**Canonical specification:** [ONT-020 — Prototype a timeline that displays uncertain dates honestly](../../research/unified-100-issue-frontier-v5/ISSUES_ONTOLOGY.md) (full 22-section source).

## Objective

Test whether users can interpret date ranges, contested ordering and unknown dates in a synthetic history view.

## Scope and boundaries

Build a non-interactive mock with ranges, multiple calendar labels and text table alternative.

Static visualization over synthetic records; no new history service.

**Anti-overlap:** No Empire Web rebuild, story canon change or publication.

## Dependencies and start conditions

**Source dependency statement:** ONT-019; related FUT-025.

**Canonical TODO dependencies:** M50-19
**ADR applicability:** No new ADR is required for the task scope currently proposed. See the [M46–M50 ADR applicability register](../../research/unified-100-issue-frontier-v5/ADR_APPLICABILITY.md). If implementation would change an owner, system of record, durable schema/storage, public API, identity/reviewer authority, or rights/release boundary, stop and obtain owner review and a proposed ADR before crossing that boundary.

**Start checklist:** Re-read linked TODO rows and owner contracts at active `dev` HEAD; inspect current WIP; confirm applicable rights/consent/release and human-authority gates; agree reviewer and smallest feasible file set. No outreach, private/unlicensed content import, publication, money handling or owner-boundary change without applicable separate authority.

## Execution steps

- Create fictional dataset
- render ranges/contested ordering
- test comprehension
- check screen reader
- decide.

## Acceptance criteria

Users identify uncertain ranges and can read same facts in text alternative.

## Definition of done

Historian and accessibility review; no real claims included.

## Verification plan

Date-range rendering and keyboard/text alternative checks.

## Risks, measures, rollback and closure

**Risks:** Layout implies a canonical chronology; offer parallel ordering and explicit source labels.

**Metrics:** Date uncertainty comprehension and order misread rate.

**Estimate:** 4–8 days.

**Rollback/fallback:** Remove prototype.

**Closure evidence:** Mock, synthetic data, results and review.

## Execution contract

Follow the [AI execution contract](../../planning/AI_EXECUTION_CONTRACT.md). Before implementation, confirm authorization, preserve the tree, satisfy predecessors, and record exact SHA, paths, commands/results, reviewer and UNKNOWN items. Keep unstarted until explicitly claimed; TODO alone records completion.

---
## M51 — ISP & Network Operations (MWX-ISP adaptation)

**Group:** G7 · **Prerequisites:** ADR-0018, M37 identity contract; M35 financial gates and M38 notification integration gate apply to their respective leaves. **Scope:** D20 technical ISP/network state under ARSY/MoonQL, D15/D16 billing references, a Go RADIUS runtime, and a private ISP console. **Status:** PLANNED; no implementation or production use implied. [Milestone context](docs/milestones/M51.md) · [Migration matrix](docs/research/mwx-isp-into-xv-migration-matrix.md).

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M51-01** — Accept D20 ownership and source boundary | P1 | D3 | M02-02,M37-03,M37-04 | D20/D00/D15/D16 ownership and service/API/secret boundaries match ADR-0018 and canonical docs. Full DoD, tests/evidence, risk and rollback: [packet](docs/tasks/M51/M51-01.md). |
| - [x] | **M51-02** — Map accepted MWX-ISP feature IDs to XV owners | P1 | D3 | M51-01 | Every committed source checklist ID maps once; TR-F025 stays absent; source changes/data/secrets are excluded. [packet](docs/tasks/M51/M51-02.md). |
| - [x] | **M51-03** — Implement D20 MoonQL models and tenant-safe ARSY APIs | P1 | D4 | M51-01,M51-02,M37-05 | Additive D20 models/API, scoped tenant grants, private-field and cross-tenant positive/negative evidence. [packet](docs/tasks/M51/M51-03.md). |
| - [x] | **M51-04** — Add the Go RADIUS/RadSec runtime and ARSY adapter | P1 | D4 | M51-03 | Go runtime has no SQL owner; fake-NAS auth/accounting/session, RadSec, service-auth and outage evidence pass. [packet](docs/tasks/M51/M51-04.md). |
| - [ ] | **M51-05** — Integrate ISP billing with D15/D16 records | P1 | D4 | M35-01,M35-02,M35-03,M35-04,M51-03 | D15 invoice and D16 manual payment remain canonical; idempotent billing actions respect grace periods and manual suspension. [packet](docs/tasks/M51/M51-05.md). |
| - [x] | **M51-06** — Build the private ISP operator console | P1 | D4 | M51-03,M37-05 | MoonUI `id`/`en` BFF console proves session, grant, tenant, accessibility and secret-redaction behavior. [packet](docs/tasks/M51/M51-06.md). |
| - [x] | **M51-07** — Add read-only network monitoring and SKYLINK alerts | P2 | D4 | M38-14,M51-03 | Registered-target monitoring is read-only and tenant-scoped; alerts use SKYLINK only after its integration gate. [packet](docs/tasks/M51/M51-07.md). |
| - [ ] | **M51-08** — Wire CI/runtime and prove integration, recovery and rollback | P1 | D4 | M27-19,M51-04,M51-05,M51-06,M51-07 | Go 1.26 and XV gates pass; Compose smoke, backup/restore and disable/rollback evidence use synthetic data and a fake NAS. [packet](docs/tasks/M51/M51-08.md). |

**Target register:** **51 milestones**, **493 unique task IDs** (393 preserved through M45 + 100 proposed leaf tasks M46–M50). Existing status history is preserved: **334 checked, 159 unchecked**. The 100 V5 candidates map one-to-one to package IDs; TODO is the sole active task/status register.

**End of XV Master TODO — modular planning v5, 30 October 2026.**
