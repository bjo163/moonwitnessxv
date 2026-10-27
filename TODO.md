# MOONWITNESS XV — MASTER TODO & MILESTONE EXECUTION REGISTER

> **Planning baseline · 27 October 2026 · active repo: [bjo163/moonwitnessxv](https://github.com/bjo163/moonwitnessxv). Owner branch policy: work directly on existing `dev`; promote to `main` only after required verification.**
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
| **G7 — ECOSYSTEM** | M29–M37 plus **M40 ORBIT** and accepted **M41 LUMEN** | AI execution contracts, Master Design, optional Empire surfaces, cross-app identity, ORBIT frontend, and LUMEN framework/worker architecture (not a second Hub) |

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
| - [ ] | **M04-05** — Copy backups off host and test retention path | P0 | D3 | M04-03 | **OPEN; menunggu M39-10 dan penempatan ECHOLOG di host terpisah.** Pemilik memilih ECHOLOG sebagai server S3-compatible milik sendiri, bukan bucket eksternal/MinIO. Task baru dapat diuji setelah endpoint hidup pada mesin berbeda dari sumber backup, akses aman tersedia, retention diuji, dan restore berhasil. Belum ada backup/upload/restore yang dicoba ke ECHOLOG. [Audit](docs/audit/M04-05-off-host-backup-retention.md) ; [packet](docs/tasks/M04/M04-05.md) |
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
| - [x] | **M05-09** — Ratify id/en locale contract and per-runtime inclusion scope | P0 | D2 | M05-08,M02-06 | **Closed 2026-10-27:** integrator ratified ADR-0005 at decision SHA `56b9f69379058b6079f921644a14ebc606b43d43`; canonical `id`/`en`, default `en`, preference order, catalog rules, all six app/CLI/TUI/API boundaries, stable machine/auth/source invariants, and ARSY launchpad/Studio inclusion under M05-14 are recorded. Positive/negative contract vectors and owner crosswalk are reviewed. `pnpm --filter @moonwitness/radio exec tsx --test test/corpus-reader.test.ts test/service-index.test.ts` passed 7/7 on that SHA; these verify source/rights and current service-index invariants, not locale resolution. PR CI [40365941715](https://github.com/bjo163/moonwitnessxv/actions/runs/40365941715) passed on the exact SHA. Runtime locale tests remain M05-10/M05-11. [ADR](docs/decisions/ADR-0005-locale.md) |
| - [x] | **M05-10** — Implement shared i18n package or proven core adapter | P0 | D3 | M05-09 | **Closed 2026-10-27:** implemented the shared `packages/core` adapter with one canonical `id`/`en` registry, strict rejection, typed catalogs and parity checks; focused tests 4/4, package build/typecheck and scoped ESLint passed; root `pnpm test` passed (Radio 305 passed, 9 optional PostgreSQL skips, 0 failed). Independent review found no issues. Exact implementation SHA `e73e156bf4616131152ff865b3f6f67658a92d77`; report [M05-10 evidence](docs/audit/M05-10-shared-locale-contract.md). |
| - [x] | **M05-11** — Add locale resolution and persistence negative tests | P0 | D2 | M05-10 | **Closed 2026-10-27:** shared resolver enforces URL → persisted selection → existing account preference → weighted `Accept-Language` → `en`; unsupported URLs are returned for rejection, malformed preferences fail safely, region tags map only in header negotiation, and no IP/location lookup occurs. Focused core suite 7/7, typecheck and scoped ESLint passed; independent review passed after equal-quality header-order cases were added. Exact result SHA `dae3c9042d721af4481a430316617b660d7952a1`; [evidence](docs/audit/M05-11-locale-resolution.md). |
| - [x] | **M05-12** — Implement Intl formatting without translating source artifacts | P1 | D2 | M05-10 | **Closed 2026-10-27:** shared core formatters cover explicit `id`/`en` numbers, dates and separately supplied currency; date formatting requires an explicit timezone and invalid locales/values are rejected. Tests prove locale output and timezone independence from UI language; no source strings or IDs are formatted. Core suite 10/10, build/typecheck/scoped ESLint pass. Exact SHA `d06d581df2cf588804be3801bd6d4cec93dbd5d9`; [evidence](docs/audit/M05-12-intl-formatters.md). |
| - [x] | **M05-13** — Add missing-key/catalog parity verification gate | P0 | D3 | M05-10 | **Ditutup 2026-10-27**, exact SHA `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa`: missing required key fails, optional long copy remains allowed, Dock 13/13; root `pnpm verify` lulus. [Bukti](docs/audit/M05-13-catalog-key-gate.md) ; [packet](docs/tasks/M05/M05-13.md) |
| - [ ] | **M05-14** — Localize ARSY human messages and embedded UI, never API identifiers | P1 | D3 | M05-09,M28-05 | **Owner:** ARSY API; **paths:** apps/radio/src/plugins; apps/radio/src/lib/launchpad.ts; apps/radio/src/modules/studio/index.ts; packages/core; **steps:** inventory safe human error/diagnostic text and launchpad/Studio UI → negotiate validated locale → test API/auth and UI behavior; **DoD:** id/en only for consumer-visible human copy; preserve `/`, `/api/v1/studio`, response envelope/status/auth, stable identifiers, source/rights data and machine logs; do not localize raw runtime errors; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M05/M05-14.md) |
| - [x] | **M05-15** — Classify and scope AI Gateway human-facing localization | P1 | D2 | M05-09 | **Closed 2026-10-27** at exact SHA `e44c4b17b170f14305e258efe6d0fe9f75bda9e3`; bilingual provider/model descriptions and safe validation messages use the shared locale resolver and vary by `Accept-Language`; IDs, status/wire fields, health and raw diagnostics remain stable. Typecheck/build/focused ESLint passed; locale contract tests 4/4 and dependency contract 1/1 passed; independent review found no concrete issues. [Evidence](docs/audit/M05-15-aigateway-locale-e44c4b1.md) |
| - [ ] | **M05-16** — Classify Sentinel worker/CLI localization without log drift | P1 | D2 | M05-09 | **Harness/evidence in progress:** regression test now pins worker output shape/stream and `id`/`en` byte stability; Sentinel test and test-typecheck are wired into package and root verification. Worktree evidence: 7/7 pass, typecheck and scoped lint pass. Raw Hub error text remains a documented safety limitation; production logs were not changed or localized. Keep open until exact integration SHA and CI evidence. [Audit](docs/audit/M05-16-sentinel-locale-classification-b1c5b75.md) |
| - [x] | **M05-17** — Inventory actual app creation and deployment conventions | P0 | D2 | M05-08,M28-01 | **Ditutup 2026-10-27**, exact source SHA `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa`: six manifest-bearing workspace apps, unique ports 3000–3004, Docker target boundaries and slug collision/traversal policy inventoried. Evidence is source/config assertion only; no scaffolder behavior claimed. [Bukti](docs/audit/M05-17-app-factory-inventory.md) |
| - [x] | **M05-18** — Implement collision-safe App Factory CLI with dry-run | P1 | D3 | M05-17,M05-10 | **Closed at source SHA `70b6b14b6630b21da4449df5ad7e2c247be7736f`; closure recorded in this TODO update:** App Factory suite 19/19, scoped ESLint and diff-check pass; exact-SHA CI `40461134347` passed full verification and guarded promotion; independent review accepted cross-platform path assertions. Rollback retains a narrow documented lstat/unlink race; no generated app was committed. M05-19/M05-20 remain separate and open. [Evidence](docs/audit/M05-18-19-app-factory-worktree.md) · [packet](docs/tasks/M05/M05-18.md) |
| - [ ] | **M05-19** — Generate frontend skeleton inheriting i18n and MoonUI | P1 | D3 | M05-18,M05-10 | **Worktree evidence:** generated app TypeScript harness; actual Vite production build and generated route fixture pass; headless browser verifies `/en` navigation, locale switch to `/id`, labels, back/forward history, no page errors. MoonUI/core builds pass. Still open: dependency M05-18 plus exact-SHA CI/integrated review. [Evidence](docs/audit/M05-18-19-app-factory-worktree.md) · [packet](docs/tasks/M05/M05-19.md) |
| - [x] | **M05-20** — Generate internal worker/service variant without fake UI | P1 | D3 | M05-18 | **Closed at source SHA `007b7ac1d5f88663b80fff2b523dadc8073b218b`:** focused App Factory suite 19/19, scoped ESLint passed, independent read-only review found no blocker, and exact-SHA CI run `40462930335` passed. M05-18 and M05-10 are checked. Internal health remains in-process; no listener, database, Hub, or fabricated UI was added. [Evidence](docs/audit/M05-20-app-factory-worker-worktree.md) · [packet](docs/tasks/M05/M05-20.md) |
| - [ ] | **M05-21** — Verify generated app workspace/build/container integration | P1 | D4 | M05-19,M05-20 | **Worktree evidence:** disposable workspace auto-generates its lock then passes frozen install; frontend typecheck/Vite build/route tests/lint and worker typecheck/build pass; traversal input leaves no app files; repo lock unchanged. Container mapping remains open: Dockerfile.web is Next-only and no Vite production target is justified; exact-SHA integration/review/CI also pending. [Evidence](docs/audit/M05-21-app-factory-workspace-worktree.md) · [packet](docs/tasks/M05/M05-21.md) |
| - [ ] | **M05-22** — Document ownership, rollback and App Factory adoption gate | P1 | D2 | M05-21 | **Owner:** App Factory; **paths:** README.md; BLUEPRINT.md; validation docs; **steps:** write operating contract → demonstrate no duplicate apps/domains → record SHA; **DoD:** one reproducible command and explicit generated-app removal/rollback; evidence = focused positive/negative tests + exact SHA; rollback where needed |
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
| - [x] | **M16-01** — Specify private witness object and provenance categories | P1 | D3 | M03-06,M06-07 | **Closed 2026-10-27** at spec SHA `c4f75c96425a58fef9925ef67de4436fe4d5c153`: four separate nullable date slots, four orthogonal status axes, initial visibility always `PRIVATE`, no automatic public original (only consent-gated redacted derivatives approved by D08), BLUEPRINT §6 provenance vocabulary with no parallel enum, bytes stay ECHOLOG-owned and the SQL-owner set remains closed; schema needs are registered as NEEDS_MIGRATION/NEEDS_ADR, not decided here. [Spec](docs/decisions/M16-01-private-witness-object-spec.md) · [evidence](docs/audit/M16-01-witness-object-spec.md) · [packet](docs/tasks/M16/M16-01.md) |
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
| - [x] | **M18-01** — Specify single publish state machine for text, testimony and story | P1 | D3 | M14-07,M07-07 | **Ditutup sebagai spesifikasi 2026-10-27**, hasil exact SHA `79c6c43`: satu jalur review manusia, veto hak/consent spesifik tipe, Story tetap tertutup hingga gerbang M17 terpenuhi. Tes positif/negatif M14+Corpus 13/13 dan prasyarat M07+M14 9/9 lulus pada baseline `dc82e79`; tidak mengklaim D08/consent store sudah ada. [Bukti](docs/audit/M18-01-single-publication-state-machine.md). |
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
| - [x] | **M19-01** — Audit MoonUI vs Moonframe vs Rocksoul asset ownership | P1 | D2 | M05-07 | **Closed 2026-10-27** at audit SHA `d064b2e9bf078389d641b517817fb4695f2b0b19`: one component contract is MoonUI (87 consuming files, `pnpm ui:check` 112 files/0 violations); Moonframe is documentation-only with an MIT pin; Rocksoul repos carry no licence and are recorded as ungoverned. Shipped art without a rights ledger (`apps/dock/public/art`, `apps/headquarters/public/art`, `cockpit bgm.mp3`) and the static surface list are handed to M17-06 and the MoonUI gate. [Audit](docs/audit/M19-01-asset-ownership.md) |
| - [ ] | **M19-02** — Define Reader/Research/Story/Operator layout/typography tokens | P1 | D3 | M19-01 | Design intentional differences without semantic drift |
| - [ ] | **M19-03** — Map public information architecture and responsive search flows | P1 | D3 | M08-02,M19-02 | Reader not buried under 30 equal nav labels |
| - [ ] | **M19-04** — Implement keyboard/focus/errors/reduced motion accessibility | P1 | D3 | M19-03 | Basic WCAG-oriented interactions functional |
| - [ ] | **M19-05** — Test Arabic/Hebrew/Greek scripts, RTL and diacritics | P1 | D3 | M19-04 | Unicode and text-selection meaning retained |
| - [ ] | **M19-06** — Create screenshot and behavioral baseline across experience modes | P1 | D3 | M19-03,M19-05 | Visual snapshots complement behavioral tests |
| - [ ] | **M19-07** — Run J01/J03 browser acceptance; J05 only when Story is in release scope | P1 | D4 | M19-06 | Selected-scope flows pass with accessibility; optional Story cannot block Reader |
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
| - [ ] | **M19-19** — Audit source rights/public research projection in Dock | P0 | D3 | M18-01,M19-08 | **Containment in progress:** Compare no longer renders hardcoded candidate text or self-asserted `RIGHTS_CLEARED`; localized D08 withholding notice and regression test pass 3/3 in worktree. Scoped ESLint and Dock typecheck now pass on branch `2a3aaf1`. Remains open until M34-04 defines the approved projection and positive/negative publication tests pass on an exact SHA. [audit](docs/audit/M19-19-research-public-withholding.md); [packet](docs/tasks/M19/M19-19.md) |
| - [x] | **M19-20** — Localize HQ login and recoverable auth errors | P1 | D2 | M05-10 | **Closed at source SHA `35b26e8171b555b4b2cddfd931832ad18e417009`:** login/session tests 9/9 and expired-session redirect 1/1 passed at this SHA; scoped ESLint passed; HQ typecheck passed at `2d223fc` with identical M19-20 source files; independent review found no blocker. M05-10 is checked. Acceptance is taken from this TODO row because no M19-20 packet exists. Live-Hub browser flow and CI for `35b26e8` were not verified. [Evidence](docs/audit/M19-20-hq-login-locale-worktree.md) |
| - [ ] | **M19-21** — Localize HQ shell, navigation and operational statuses | P1 | D3 | M19-20 | **Owner:** Headquarters; **paths:** apps/headquarters/src/ui/client/SideNav.tsx; layouts/vertical.tsx; **steps:** translate navigation → distinguish real/demo telemetry → test menus; **DoD:** id/en and honest operational statuses; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-21.md) |
| - [ ] | **M19-22** — Localize HQ model/forms/views/actions/validation | P1 | D3 | M19-21 | **Owner:** Headquarters; **paths:** apps/headquarters/src/app/(admin)/models; views; **steps:** inventory metadata-generated labels → translate UI chrome/errors → test CRUD permissions; **DoD:** model/field identifiers stable; both locale forms usable; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-22.md) |
| - [ ] | **M19-23** — HQ language selection, cookie and cross-app links | P1 | D3 | M19-22,M05-11 | **Owner:** Headquarters; **paths:** apps/headquarters/src/layouts; locale helper/tests; **steps:** add selector → preserve current route/role → test session expiry; **DoD:** no auth bypass; preferences persist predictably; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-23.md) |
| - [ ] | **M19-24** — HQ id/en full visible UI regression and E2E | P1 | D3 | M19-23 | **Owner:** Headquarters; **paths:** apps/headquarters tests; locale fixtures; **steps:** test login, role, empty/error, model fields → snapshot copy → record SHA; **DoD:** id/en coverage verified beyond login only; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-24.md) |
| - [x] | **M19-25** — Audit actual Cockpit Vite UI and optional CLI help | P0 | D2 | M05-08 | **Closed 2026-10-27:** Cockpit panels, dialogs, forms, accessibility labels, launcher and optional CLI scope inventoried; human copy separated from machine actions/logs/IDs/ports/URLs. `pnpm --filter @moonwitness/cockpit test` passed 3/3. Exact source SHA `e73e156bf4616131152ff865b3f6f67658a92d77`; [audit](docs/audit/M19-25-cockpit-locale-scope.md). |
| - [x] | **M19-26** — Localize Cockpit nav, panes, status and tooltips | P1 | D3 | M19-25,M05-10 | **Closed 2026-10-27:** Localized TopBar, Sidebar, 6 primary functional tabs, and status pills with 1:1 en/id key parity; service tags (radio, dock, hq, ai, sentinel) and ports stay invariant; [audit](docs/audit/M19-26-cockpit-nav-locale.md). |
| - [x] | **M19-27** — Localize Cockpit forms, confirmations and errors | P1 | D3 | M19-26 | **Closed 2026-10-27:** Added accessible WAI-ARIA CockpitConfirmModal for destructive actions (stopAll, freePorts); localized search inputs, forms, and custom stream drawer; [audit](docs/audit/M19-27-cockpit-forms-confirmations.md). |
| - [x] | **M19-28** — Localize Cockpit settings/help and accessible messages | P1 | D2 | M19-26 | **Closed 2026-10-27:** Implemented CockpitHelpModal accessible via ? or footer trigger; complete keyboard shortcuts manual localized in en and id; [audit](docs/audit/M19-28-cockpit-settings-help.md). |
| - [x] | **M19-29** — Persist Cockpit UI locale and preserve command contracts | P1 | D3 | M19-27,M05-11 | **Closed 2026-10-27:** Implemented useCockpitLocale with localStorage persistence under mw_cockpit_locale and cross-tab sync; command contracts and API requests invariant; [audit](docs/audit/M19-29-cockpit-locale-persistence.md). |
| - [x] | **M19-30** — Verify Cockpit GUI and CLI human-output locale scope | P1 | D3 | M19-28,M19-29 | **Closed 2026-10-27:** Verified pnpm --filter @moonwitness/cockpit test (21/21 passing), client Vite build (0 errors), and tsc typecheck clean. ADR-0008 accepted; [audit](docs/audit/M19-30-cockpit-locale-verification.md). |
| - [ ] | **M19-31** — Protect RTL/script and corpus source language semantics | P1 | D3 | M19-09,M05-12 | **Owner:** MoonUI + Dock; **paths:** apps/dock/src/ui/components/reader.tsx; MoonUI tests; **steps:** test Arabic/Hebrew/Greek/diacritics → preserve source direction → verify copied citations; **DoD:** source language is not UI locale; diacritics/text stable; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-31.md) |
| - [x] | **M19-32** — Localize shared MoonUI UI chrome and design semantics | P1 | D3 | M05-10,M19-01 | **Closed 2026-10-27:** Verified unit and integration tests (17/17 passing), ui:check consistency (100 files, 0 violations), token/ARIA purity; [audit](docs/audit/M19-32-moonui-perfection-audit.md). |
| - [ ] | **M19-33** — Preserve cross-app locale during user navigation | P1 | D2 | M19-12,M19-23,M19-29 | **Owner:** platform navigation; **paths:** shared link adapter; target frontend tests; **steps:** map Dock/HQ/Cockpit links → preserve explicit locale where supported → test; **DoD:** no account token or PII leakage across subdomains; evidence = focused positive/negative tests + exact SHA; rollback where needed |
| - [ ] | **M19-34** — Create cross-app id/en accessibility and copy E2E matrix | P1 | D4 | M19-24,M19-30,M19-17 | **Owner:** platform QA; **paths:** app-specific browser suites; shared locale fixtures; **steps:** run visible UI matrix → missing-key check → record exact SHA; **DoD:** all agreed existing GUI apps verified; ARSY/API messages checked separately; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-34.md) |
| - [ ] | **M19-35** — Verify visual/screenshots and regression across locales | P1 | D3 | M19-34 | **Owner:** platform QA; **paths:** MoonUI screenshot fixtures; browser test runner; **steps:** snapshot key breakpoints both locales → test long labels → mark evidence; **DoD:** no clipped nav, RTL/source inversion or inaccessible selector; evidence = focused positive/negative tests + exact SHA; rollback where needed ; [packet](docs/tasks/M19/M19-35.md) |


## M20 — Headquarters and 100CENTER human governance

**Group:** G4 · **Priority:** P1 · **Prerequisites:** M14,M18 · **Scope:** Existing HQ, models/views, audit and proposed review areas.

**Exit gate:** Single admin authorization, task and review workspace. Do not infer completion from code inventory alone.

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [x] | **M20-01** — Audit HQ generic model UI, route guards and existing ops widgets | P1 | D2 | M00-02,M14-01 | **Closed 2026-10-27** at audit SHA `d6b8847f7aae168e4dcb4208c2c8d3acc6c6715e`: HQ reuses the schema-driven model UI rather than duplicating an admin app (12 route handlers, 6 guard layers, 9 ops widgets at baseline `76ecdc5`). Negative findings handed to M20-02/M20-07: no server-side role check of its own, ungated write forms, anonymous `/monitor/overview` rows, and demo/fabricated dashboard fallbacks. [Audit](docs/audit/M20-01-hq-model-ui-route-guards-ops.md) |
| - [x] | **M20-02** — Design role-scoped review queue and work item lifecycle | P1 | D3 | M20-01,M18-01 | **Design closed at source SHA `b8db42df4fe33fa715e57a09e359b543a1d6b39b`:** self-approval is unconditionally rejected by I2; scope overlap, missing/delegated grants, machine principals and stale digests/versions are specified. Reference predicate suite 4/4, existing M14 four-eyes suite 7/7 (in-memory), HQ guard suite 23/23; scoped ESLint and independent review passed. Design only: no queue routes/tables/implementation; D08 and ADR gates remain. [Design](docs/decisions/M20-02-role-scoped-review-queue.md) · [Evidence](docs/audit/M20-02-review-queue-evidence.md) · [Packet](docs/tasks/M20/M20-02.md) |
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
| - [ ] | **M27-08** — Freeze bilingual preview release manifest and non-goals | P0 | D2 | M19-08,M05-09,M19-19 | **BLOCKED by M19-19** in release track T5 until an approved D08 public projection is available; Research/raw witness remains withheld. Once eligible: **Owner:** release management; **paths:** TODO.md; new preview manifest/runbook; **steps:** pin exact source SHA → identify included public routes → list excluded draft/private features; **DoD:** preview not conflated with full XV M27 completion; evidence = focused positive/negative tests + exact SHA; rollback where needed. [readiness](docs/audit/M27-08-readiness-blocker-2026-10-27.md) |
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
| - [x] | **M28-01** — Inventory all hub-name references and freeze old API/Radio fixtures | P0 | D2 | M00-02,M22-01 | **Closed 2026-10-27:** pinned source SHA `0f3a252af6e7b7d803cedab121a443911d820279`; mapped package/scripts/lock importer, Dockerfiles, Compose/DNS, frontend BFFs, env aliases, tests, SDK, metrics and runbooks; classified Radio-domain references to preserve; cross-referenced M22-01 normalized fixtures. Integrator review accepted; no runtime test or rename claimed. [Inventory](docs/audit/M28-01-hub-identity-inventory.md). |
| - [x] | **M28-02** — Ratify ARSY technical compatibility map using accepted ADR-0001 | P0 | D2 | M28-01,M02-03 | **Ratified 2026-10-27** against source SHA `ffd435677a3bfb240ff1877ae51a9c940c414b12`: canonical workspace/package, safe `ARSY_*`→`RADIO_*` alias precedence and deprecation window, stable `/api/v1` routes/envelopes/auth, port `3000`, same PostgreSQL data/schema and one-Hub DNS alias transition are specified. Integrator review accepted; no physical rename/runtime verification claimed. [Compatibility map](docs/audit/M28-02-arsy-compatibility-map.md). |
| - [x] | **M28-03** — Move, not copy, backend workspace `apps/radio` to `apps/arsy` | P0 | D4 | M28-02 | **Closed** at `978cd0771108e352310ed6e3418a1bceda8ba4c7` via implementation M28-10; app moved in place, package identity renamed, single-Hub topology positive/negative test passed; [evidence](docs/audit/M28-10-arsy-runtime-migration-789afa8.md) |
| - [ ] | **M28-04** — Migrate package filters, pnpm lock, Dockerfiles, Compose and runners | P0 | D4 | M28-03 | Regenerate lock with pnpm; update all paths/build scripts/ports; retain tested `radio` internal DNS compatibility or transition mapping for Dock/HQ |
| - [x] | **M28-05** — Reconcile ARSY config/type/service branding with legacy Radio env compatibility | P0 | D3 | M28-04 | **Closed 2026-10-27** at implementation SHA `eef0c54a057c884c04aa8a9a9efa76b0b9e54f13`: `ARSY_*` resolves ahead of the documented `RADIO_*` aliases, two disagreeing spellings refuse to boot with the key names (never the values), and Radio domain vocabulary is untouched. Focused env-compat suite 10/10 and scoped ESLint pass; evidence in [audit](docs/audit/M28-05-arsy-env-aliases.md). |
| - [ ] | **M28-06** — Execute full end-to-end hub rename regression and rollback drill | P0 | D4 | M28-04,M28-05,M22-07 | At exact SHA pass frozen pnpm installation, verify/typecheck/SDK, real Postgres, API/ACL, Docker Hub + 2 web images, Dock/HQ, Radio playback, channels/webhooks and rollback |
| - [ ] | **M28-07** — Complete ARSY migration changelog, service map and operator handoff | P0 | D2 | M28-06 | No leftover active import path `apps/radio` in current code (historical docs excepted), no parallel Hub, working Radio stations and named reviewed release evidence |
| - [x] | **M28-08** — Audit every actual Radio/ARSY import and backend identity | P0 | D2 | M28-01 | **Closed 2026-10-27:** pinned the canonical single-hub identity, enumerated all 20 workspace runtime and 6 development package dependencies plus package/path/config/test references, distinguished feature-domain `radio` references to preserve, and recorded a migration manifest. Focused topology/Docker/env tests passed 17/17; exact inventory SHA `6a4990d302fd68d5ea8111166420fd48be9b9adb`; [audit](docs/audit/M28-08-import-identity-manifest.md). |
| - [x] | **M28-09** — Freeze Radio/Signal backward-compatible API fixtures | P0 | D2 | M28-01,M22-01 | **Ditutup 2026-10-27**, exact SHA `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa`: route/envelope/port/seed, player, beacon, WhatsApp auth dan DENPA fixture tests; 1 focused + Radio 310 pass, 9 PG skip. [Bukti](docs/audit/M28-09-radio-compatibility.md) |
| - [x] | **M28-10** — Migrate runtime directory/import/package under single Hub | P0 | D4 | M28-02,M28-08 | **Closed** at `978cd0771108e352310ed6e3418a1bceda8ba4c7`; ARSY build passed, focused tests 13/13, env-contract 9/9, lint passed, topology rejects a duplicate legacy Hub; [evidence](docs/audit/M28-10-arsy-runtime-migration-789afa8.md); [packet](docs/tasks/M28/M28-10.md) |
| - [x] | **M28-11** — Migrate pnpm lock, scripts, images and internal DNS | P0 | D4 | M28-10 | **Closed** at `2112622aaac679aeffac475781f168cec49a7ad7`; frozen lock install passed, ARSY build passed, topology/Compose/Docker contract tests 24/24 and Compose config passed; old `radio` DNS alias maps to the one ARSY service; [evidence](docs/audit/M28-11-arsy-docker-dns-2112622.md); [packet](docs/tasks/M28/M28-11.md) |
| - [x] | **M28-12** — Implement fail-closed RADIO_*/ARSY_* precedence and aliases | P0 | D3 | M28-11 | **Closed** at `8ce4ff8914d4427747b5dbf8cbdd02b5ba9d46ce`; RADIO/ARSY/generic precedence is deterministic, conflicting configured values fail closed, tests 18/18 and ARSY/Sentinel/SDK builds/typechecks/lint passed; [evidence](docs/audit/M28-12-arsy-env-aliases-8ce4ff8.md); [packet](docs/tasks/M28/M28-12.md) |
| - [x] | **M28-13** — Run exact-SHA Hub/PG/Radio/Dock/HQ/SDK regression matrix | P0 | D4 | M28-12,M22-07 | **Closed on verified result SHA `70b6b14b6630b21da4449df5ad7e2c247be7736f`; matrix runs used `1ce76adf3a20e98fa80f78e68e9b4de92972188f` where M28 paths were unchanged.** Full CI verification and guarded promotion passed (run `40461134347`); isolated PG ARSY 369/370 with one explicit gap skip; HQ 9/9; SKYLINK 9 pass/1 optional DB skip; ECHOLOG 36/36; ARSY/Dock/HQ image builds and ARSY health 200 passed; disposable resources/tags removed. Windows local verify also recorded one CRLF-only Dock test discrepancy, while Linux CI passed. Independent reviewer accepted; no production deployment claimed. [Matrix](docs/audit/M28-13-matrix-6b439b3.md) · [packet](docs/tasks/M28/M28-13.md) |
| - [x] | **M28-14** — Revalidate all six app integration contracts after rename | P0 | D3 | M28-13 | **Closed 2026-10-27:** all six apps revalidated against single ARSY Hub; ARSY compat/compose suite 28/28 passed; Dock 181/181 passed; HQ authz/shell 38/38 passed; Cockpit station/alias 31/31 passed; AI Gateway route boundary 4/4 passed; Sentinel machine log contract 7/7 passed; build:web and ui:check passed; no second Hub or stray backend. [Audit](docs/audit/M28-14-integration-contracts.md) · [Packet](docs/tasks/M28/M28-14.md) |
| - [ ] | **M28-15** — Close rename documentation only after deployment compatibility proof | P0 | D2 | M28-14,M28-07 | **Owner:** architecture/release; **paths:** ADR-0001; README.md; deployment notes; **steps:** record source SHA → update old/new path and DNS evidence → mark migration; **DoD:** ADR implementation status changes only after actual rename verification; evidence = focused positive/negative tests + exact SHA; rollback where needed |

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
| - [x] | **M34-01** — Inventory D05 MIZAN and raw Research exposure | P1 | D2 | M14-07 | **Closed 2026-10-27** at inventory SHA `bba3731b96132067405da806ca2871a9ae1f0f93`: 16 capabilities (C1–C16) and 10 exposure rows (E1–E10) against baseline `76ecdc5`. Independent re-verification at closure: `GET /research/hypotheses` carries `requires: 'public'` (`packages/moonql-research/src/index.ts:692`), and `research.test.ts` 8/8 plus `m15-historical-pilot.test.ts` 7/7 pass anonymously. No source was changed; E1–E7 violations route to M19-19/M34-04. [Inventory](docs/audit/M34-01-inventory-d05-mizan-research-exposure.md) · [evidence](docs/audit/M34-01-d05-mizan-research-exposure.md) · [packet](docs/tasks/M34/M34-01.md) |
| - [x] | **M34-02** — Decide standalone MoonLab or HQ desk | P1 | D2 | M34-01 | **Closed 2026-10-27** at artifact SHA `724fb15`: integrator review accepted the recommendation of a private research desk inside Headquarters, with D05 data still owned by the ARSY/MoonQL research addon, no `apps/moonlab`, no new identity/SQL owner/Hub/review engine, and Dock kept fail-closed until a D08 projection exists (M34-04/M19-19). Independent re-run at closure: Research 15/15 and MIZAN 7/7, and M34-01's failure mode re-proven. Revisit standalone placement only with a separate extraction decision. [Proposal](docs/audit/M34-02-moonlab-host-placement.md) · [packet](docs/tasks/M34/M34-02.md) |
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
| - [x] | **M37-01** — Classify application deployment/security surfaces | P1 | D2 | M03-03,M05-09 | **Closed 2026-10-27** at integrated SHA `4312db7962c550c5d9b5172286f2a7a1e8b49183`: inventory reconciles current ten workspaces with nine dev-runnable registry entries and five Compose services; HQ cookie gate is distinguished from Hub authorization; independent review corrected the dev-entry count; exact-SHA CI and guarded promotion passed. No deployment/TLS perimeter certification. Packet title still says “six” and should be reconciled. [Audit](docs/audit/M37-01-app-surface-inventory.md) · [packet](docs/tasks/M37/M37-01.md) |
| - [x] | **M37-02** — Specify SSO session and safe redirect boundary | P1 | D2 | M37-01 | **Closed 2026-10-27** at integrated SHA `4312db7962c550c5d9b5172286f2a7a1e8b49183`: design-only contract preserves ARSY as sole identity authority, separates cookie routing from authorization, requires same-origin redirect and rejects credential-bearing links; independent review found no blocker. Existing HQ test/typecheck commands could not run successfully in this tree (`test` script absent; direct Node import failure; typecheck exit 1 without diagnostics), so positive-runtime proof and adversarial encoded-path tests remain future implementation work. No SSO runtime/deployment claimed. [Spec](docs/design/M37-02-sso-session-redirect-boundary.md) · [packet](docs/tasks/M37/M37-02.md) |
| - [ ] | **M37-03** — Specify tenant/role capability access | P1 | D3 | M37-02 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M37/M37-03.md) |
| - [ ] | **M37-04** — Specify locale-preserving links and event owner | P1 | D3 | M37-03 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M37/M37-04.md) |
| - [ ] | **M37-05** — Test cross-app token expiry and role isolation | P1 | D4 | M37-04 | **LEAF**; deliver one reviewed artifact and positive/negative acceptance evidence at exact SHA; parent milestone not separately implemented ; [packet](docs/tasks/M37/M37-05.md) |
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
| - [ ] | **M38-12** — Make ARSY a SKYLINK client behind `SKYLINK_ENABLED` | P0 | D4 | M38-11, M28 | **LEAF**; flag off reproduces today's behaviour exactly, flag on routes through SKYLINK, M22 Radio regression suite green, Dockerfile copies every workspace dependency dist; evidence = suite output + exact SHA; [packet](docs/tasks/M38/M38-12.md) |
| - [ ] | **M38-13** — Build the operator UI and register it in the design gates | P1 | D3 | M38-12 | **LEAF**; inbox, pairing and channel status render from MoonUI primitives, `pnpm ui:check` reports zero violations, client enters the lint and design-system globs; evidence = `ui:check` output + screenshot + exact SHA; [packet](docs/tasks/M38/M38-13.md) |
| - [ ] | **M38-14** — Compose service, cockpit supervision, end-to-end proof, rollback and evidence | P0 | D4 | M38-13 | **LEAF**; compose service has a healthcheck, cockpit supervises six services, ARSY→SKYLINK→provider and inbound→WS→UI verified, rollback demonstrated, `docs/audit/M38-*.md` records every command; evidence = logs + exact SHA; [packet](docs/tasks/M38/M38-14.md) |

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
| - [ ] | **M39-12** — End-to-end proof, rollback, evidence and changelog | P0 | D4 | M39-11 | **Evidence in progress:** same-filesystem REST/S3 round trip and service restart/rollback pass in ECHOLOG suite (34/34); SQL-owner guard 7/7; root `CHANGELOG.md` Unreleased entry added. Remains open pending M39-10/M39-11 exact-SHA integration and SKYLINK consumer rollback/no-op evidence. [audit](docs/audit/M39-12-e2e-rollback.md); [packet](docs/tasks/M39/M39-12.md) |

---

## Consistency controls for 40-milestone plan

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
| - [ ] | **M40-07** — Task queue, workstation and agent inspectors | P1 | D3 | M40-02, M40-04, M40-06 | Scene and 2D list select same records; no fabricated activity/progress/tool calls; restricted/empty/failed states are safe; keyboard stable. See [M40 specification](docs/milestones/M40.md). |
| - [ ] | **M40-08** — Human-approval handoff to Headquarters / 100CENTER | P1 | D3 | M20-02, M20-06, M20-07, M37-02, M37-03, M37-05, M40-02 | No approval bypass/self-approval/auto-publication; invalid redirects/stale sessions/insufficient roles denied server-side; no ORBIT-owned review engine. See [M40 specification](docs/milestones/M40.md). |
| - [ ] | **M40-09** — Cross-app auth, deployment, and extraction boundaries | P1 | D4 | M37-01..05, M40-01, M40-05, M40-08 | Unauthorized/expired calls denied; no service key in browser bundle/config/logs; independent frontend build; no DB/identity owners or private HQ imports. See [M40 specification](docs/milestones/M40.md). |
| - [ ] | **M40-10** — Exact-SHA release acceptance, rollback, and extraction review | P1 | D4 | M40-01..09 | All claims tied to output; auth/locale/3D/2D/offline/stale/approval flows verified; rollback does not change ARSY/HQ/Dock data; extraction separate. See [M40 specification](docs/milestones/M40.md). |

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

**Target register:** **42 milestones** (29 preserved M00–M28 + M29–M37 + appended M38, M39, M40 and M41), 267 preserved IDs from M00–M28 + 45 IDs from M29–M37 + 14 SKYLINK IDs + 12 ECHOLOG IDs + 10 ORBIT IDs + 12 LUMEN IDs = **360 unique task IDs**. Prior checkmarks and evidence remain unchanged. TODO is the only active task/status register.

**End of XV Master TODO — modular planning v4, 27 October 2026.**
