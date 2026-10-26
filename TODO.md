# MOONWITNESS XV — MASTER TODO & MILESTONE EXECUTION REGISTER

> **Planning baseline · 26 October 2026 · active repo: [bjo163/moonwitnessxv](https://github.com/bjo163/moonwitnessxv), existing `main`.**
> This is a detailed, dependency-gated backlog, **not** evidence tasks have been completed. No new branch or GitHub issue is created. Before execution recheck the current HEAD, source rights and runtime status.

**Read:** [BLUEPRINT.md](BLUEPRINT.md) for the sole XV architecture and ownership contract; [Master Vision Narrative XV](docs/vision/MASTER_VISION_NARRATIVE_XV.md) for history, narrative and interpretive boundaries. **This TODO is the sole planning task/status index**. Avoid copying task progress into vision or independent lists. Real build logs, test results and specific commit SHAs establish completion; an existing file or CI configuration alone does not.

## How to interpret and execute

**Priority:** `P0` blocker (security, compatibility, provenance, release); `P1` core product; `P2` improvement/next horizon; `P3` speculative optional research. **Difficulty:** `D1` isolated, `D2` small, `D3` bounded multi-file, `D4` complex with cross-domain tests/review, `D5` high-uncertainty that must first be broken into smaller work packets. These are relative estimates, not promises of elapsed time.

Each task ID `M00-01` is unique here; `M00` in a dependency denotes its entire exit gate. **No corresponding GitHub issues currently exist in XV; do not duplicate past XIV/Corpus issues in XV by ID.**

For each task: recheck `main` HEAD → inspect the named owner and dependencies → prepare scope (prefer ≤3 starting files; justify larger) and tests → implement only the stated behavior → run focused positive/negative tests and relevant `pnpm verify` checks → record SHA, exact commands/results, changed paths, rights source where relevant and reviewer → only then check the box. Never force-push/reset or invent a new branch to make a task run. If a required gate is blocked, report it and preserve `UNKNOWN`.

All checkboxes begin **unchecked**, even where related infrastructure already exists; each refers to a specific *verification or change deliverable*, not merely file presence. A milestone is complete only after its exit gate is demonstrated at a specific SHA.

## Group and milestone map

| Group | Milestones | Purpose |
|---|---|---|
| **G0 — FOUNDATION** | M00–M05 | Audit, CI, governance, ACL, disaster recovery, API contract |
| **G1 — SOURCE** | M06–M11 | Historic source crosswalk, corpus, reader, lexicon, ontology, figures |
| **G2 — RESEARCH** | M12–M15 | Typed relations, SRGBL/Key Witness, MIZAN, comparative case |
| **G3 — WITNESS & CREATIVE** | M16–M19 | Personal witness, creative canon, publishing, design |
| **G4 — OPERATIONS** | M20–M23 | 100CENTER, optional AI, existing Radio/WA/DENPA, Journey |
| **G5 — OPTIONAL RESEARCH** | M24–M26 | World monitoring, Science/Time, legacy registries and source recovery |
| **G6 — RELEASE** | M27 | Real full-stack tests, privacy, rights and approved launch |

**P0 crosscut:** M22 protects Radio from the first engineering change even though grouped in G4. `M03` precedes any private source ingestion, `M04` before production, `M06` before historical data transfer, `M18` before public release. First useful scope is Radio unchanged + QS 2:82 licensed/metadata-only reader + one typed source/term + explicitly reviewed evidence + secure admin and actual restore. G5 must not block that release.

---


## M00 — Baseline reality and audit

**Group:** G0 · **Priority:** P0 · **Prerequisites:** — · **Scope:** apps, packages, README, package.json and runbook.

**Exit gate:** Pinned SHA with actual tested state, route and data owners. **No completion inferred merely from repository files.**

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M00-01** — Snapshot current HEAD and tree for evidence | P0 | D1 | — | SHA and package inventory documented |
| - [ ] | **M00-02** — Map Fastify routes, MoonQL addons and manual module collisions | P0 | D2 | M00-01 | One route/addon matrix from code |
| - [ ] | **M00-03** — Pin station seed and existing public envelope | P0 | D2 | M00-02 | Executable fixture with known response fields |
| - [ ] | **M00-04** — Run and record lint, typecheck, build, test status | P0 | D2 | M00-01 | Exact command outputs tied to a SHA |
| - [ ] | **M00-05** — List auth, cookie, REST, webhook, export and privacy surfaces | P0 | D3 | M00-02 | Anonymous/read/write risk matrix |
| - [ ] | **M00-06** — List PG/memory, migrations, backups and restore evidence | P0 | D2 | M00-01 | Unverified disaster recovery explicitly marked |
| - [ ] | **M00-07** — Publish discrepancy ledger CODE vs TESTED vs RELEASED vs UNKNOWN | P0 | D2 | M00-03,M00-04,M00-05,M00-06 | Named P0 blockers and reproducible steps |


## M01 — CI, version and release foundation

**Group:** G0 · **Priority:** P0 · **Prerequisites:** M00 · **Scope:** package.json, scripts and proposed GitHub workflows.

**Exit gate:** Repeatable exact-SHA verification without bypass. **No completion inferred merely from repository files.**

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M01-01** — Pin Node and pnpm compatible with lockfile | P0 | D2 | M00-04 | Reproducible local and CI toolchain |
| - [ ] | **M01-02** — Define radio + Dock + HQ smoke procedure | P0 | D2 | M00-02 | Exact ports and config with no secret copied |
| - [ ] | **M01-03** — Configure CI only after checking repository policy | P0 | D3 | M01-01,M01-02 | One run reports build/test/typecheck/lint |
| - [ ] | **M01-04** — Enforce generated SDK and schema drift check | P0 | D2 | M01-03 | Intentional drift produces a failing test |
| - [ ] | **M01-05** — Define semver, changelog and protected release lifecycle | P1 | D3 | M01-03 | Approval and rollback steps written |
| - [ ] | **M01-06** — Add dependency and secret-scanning gate | P0 | D3 | M01-03 | Known bad fixture fails without leaking secrets |
| - [ ] | **M01-07** — Publish CI evidence ledger and no-bypass rule | P0 | D2 | M01-04,M01-06 | Failed required check blocks approval |


## M02 — XV governance and source of truth

**Group:** G0 · **Priority:** P0 · **Prerequisites:** M00 · **Scope:** Blueprint, Vision, future local ADRs.

**Exit gate:** One owner per type and reviewed XV decisions. **No completion inferred merely from repository files.**

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M02-01** — Disambiguate ALLAH/A-L-L-A-H, ZILL, SHADOW and numeric registries | P0 | D2 | M00-07 | No false sameAs or fictional authority |
| - [ ] | **M02-02** — Assign D00–D13 to existing and proposed modules | P0 | D3 | M00-02,M02-01 | One canonical owner per data class |
| - [ ] | **M02-03** — Draft XV ADR for additive MoonQL domain architecture | P0 | D3 | M02-02 | Alternatives and backward-compatible tests |
| - [ ] | **M02-04** — Draft XV ADR for source rights, consent and publishing storage | P0 | D3 | M02-02 | Original bytes vs metadata ownership explicit |
| - [ ] | **M02-05** — Specify stable IDs and versioned legacy refs | P0 | D3 | M02-03 | Foreign/source IDs never silently overwritten |
| - [ ] | **M02-06** — Fix single task/status/document hierarchy | P0 | D1 | M02-01 | No duplicative TODO in vision and README |
| - [ ] | **M02-07** — Review XIV/Empire decisions as historical, not current mandates | P0 | D2 | M02-03,M02-04 | Adopt/adapt/reject/open evidence matrix |


## M03 — ACL, privacy, consent and abuse prevention

**Group:** G0 · **Priority:** P0 · **Prerequisites:** M00,M02 · **Scope:** MoonQL auth/ACL, Fastify and HQ access.

**Exit gate:** Sensitive data blocked on all unauthorized reads and writes. **No completion inferred merely from repository files.**

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M03-01** — Audit default public list/get/expand/view/export exposure | P0 | D3 | M00-05 | Negative API tests include direct request paths |
| - [ ] | **M03-02** — Define deny-by-default sensitive addon template | P0 | D3 | M03-01 | Restricted model REST false or explicit guarded ops |
| - [ ] | **M03-03** — Test forged/expired HQ cookies vs Hub auth | P0 | D3 | M03-01 | No cookie-only privileged data access |
| - [ ] | **M03-04** — Decide tenant and reviewer/editor role boundaries | P0 | D4 | M02-02,M03-02 | Tenant support verified or clearly out of scope |
| - [ ] | **M03-05** — Test token TTL, revocation and API key cache limits | P0 | D3 | M03-03 | Revoked credentials denied per defined window |
| - [ ] | **M03-06** — Write private witness, minors, copyright and withdrawal policy | P0 | D3 | M02-04 | No automatic import into public Git |
| - [ ] | **M03-07** — Threat model CSP, logs, egress, DENPA, WA and SSR | P0 | D4 | M03-01,M03-05 | Critical risks receive blocking cases |


## M04 — Database continuity and recovery

**Group:** G0 · **Priority:** P0 · **Prerequisites:** M00 · **Scope:** MoonQL sync/migrations, Docker Compose and restore runbook.

**Exit gate:** Isolated restore actually performed with data equivalence. **No completion inferred merely from repository files.**

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M04-01** — Verify production PG requirement vs memory fallback | P0 | D3 | M00-06 | No accidental production ephemeral storage |
| - [ ] | **M04-02** — Define non-additive migration plan beyond autoSync | P0 | D3 | M04-01,M02-05 | Reviewed SQL rollback protects existing records |
| - [ ] | **M04-03** — Execute test DB restore from real dump | P0 | D4 | M04-01 | Actual successful isolated restore evidence |
| - [ ] | **M04-04** — Compare restored station/playlog rows and indexes | P0 | D2 | M04-03 | Row counts and stable IDs match baseline |
| - [ ] | **M04-05** — Copy backups off host and test retention path | P0 | D3 | M04-03 | Single host loss does not destroy only backup |
| - [ ] | **M04-06** — Test schema upgrade failure and rollback | P0 | D4 | M04-02,M04-03 | Prior radio data not corrupted |
| - [ ] | **M04-07** — Update restore runbook with actual drill metadata | P1 | D2 | M04-04,M04-05,M04-06 | Named operator, time, results and constraints |


## M05 — API/SDK and module behavior contracts

**Group:** G0 · **Priority:** P0 · **Prerequisites:** M01,M02 · **Scope:** Fastify generated REST, MoonQL registry, client package.

**Exit gate:** No route duplicates, SDK drift or Radio break. **No completion inferred merely from repository files.**

| Status | Task | Priority | Difficulty | Depends on | Acceptance / evidence |
|---|---|---|---|---|---|
| - [ ] | **M05-01** — Record existing OpenAPI, envelope and error fixtures | P0 | D2 | M00-02 | Pinned current response contracts |
| - [ ] | **M05-02** — Test duplicate model/view/manual route rejection | P0 | D2 | M05-01 | Collision fails boot and has regression test |
| - [ ] | **M05-03** — Define future addon namespace and registration standard | P0 | D2 | M02-02,M05-02 | New feature cannot shadow old radio endpoints |
| - [ ] | **M05-04** — Verify SDK codegen deterministic hash and API version | P0 | D2 | M01-04,M05-01 | Repeat generation gives stable client |
| - [ ] | **M05-05** — Define pagination, filter/expand, locale and UNKNOWN | P1 | D3 | M05-01 | Bounded and source-safe query behavior |
| - [ ] | **M05-06** — Document approved old-repo adapter boundaries | P1 | D3 | M02-07,M05-03 | No implicit historical runtime dependency |
| - [ ] | **M05-07** — Add compatibility smoke for existing clients | P0 | D3 | M05-04,M05-06 | Current Radio tests keep passing |

