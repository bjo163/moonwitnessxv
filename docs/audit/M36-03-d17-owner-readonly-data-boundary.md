# M36-03: D17 Owner and Read-Only Data Boundary Decision

**Task:** M36-03 — Decide D17 owner and read-only data boundary
**Milestone:** [M36 — HELIOGRID measured read-only energy pilot](../milestones/M36.md) · [packet](../tasks/M36/M36-03.md)
**Role:** EXECUTABLE LEAF (decision artifact)
**Priority / Difficulty:** P3 / D3
**Prerequisites:** M36-01 (**open and BLOCKED**) · M36-02 [specification](M36-02-calibration-units-timestamp-provenance.md)
**Baseline:** `dev` HEAD `28efbba` (M36-02) at authoring
**Status:** BASELINE ESTABLISHED — decision recorded, **with a positive test actually executed** (§5).
No D17 domain module, table, addon or app exists; nothing was created by this leaf.
**Data:** every site, meter, reading, retention figure and credential below is synthetic.

## 1. Decision

> **D17 (physical Energy & Assets) is owned by the existing ARSY Hub through MoonQL — i.e. one new
> additive `packages/moonql-*` addon registered as a single line in the one wiring point,
> `apps/arsy/src/addons.ts`. `apps/heliogrid` (when it becomes conditional-real) is a *client*: a
> read consumer plus an append-only ingest writer that reaches the database only through the Hub. It
> imports no SQL driver, owns no migrations, and exposes no write-capable path to any actuator.**

The decision has four load-bearing clauses:

| # | clause | consequence |
|---|---|---|
| C-1 | one SQL owner set stays closed: `{packages/moonql, packages/skylink-store}` | no `heliogrid-store`, no knex/objection/drizzle/postgres import in any energy package, ever |
| C-2 | the D17 models live in a MoonQL addon, wired by exactly one line in `addons.ts` | ADR-0002's additive architecture is used, not re-invented; no second REST hub is created |
| C-3 | ingest is **append-only** into measurement-shaped models; no mutable "current value" row is authoritative | corrections are new dated rows, and a replayed batch cannot rewrite history |
| C-4 | the read-only boundary is enforced by the *absence of methods*, not by role checks alone | there is no actuation table, no command model, and no write-capable register path in the collector |

**Rejected alternatives** are in §3. The reason this is a decision and not a restatement is that C-3 and
C-4 have costs (a second write path must be built for anything mutable, and diagnostics convenience is
foregone), and those costs are accepted here explicitly.

## 2. Why the Existing Contracts Force This

| source | verbatim constraint | how it binds D17 |
|---|---|---|
| [BLUEPRINT.md:110](../../BLUEPRINT.md) | "Each model has precisely one ARSY/MoonQL owner; frontend boundaries do not confer database ownership … No second REST hub, login system, editor, approval engine or graph database." | the only permitted home for a new model is ARSY/MoonQL |
| [BLUEPRINT.md:110](../../BLUEPRINT.md) | "HELIOGRID pilot must start with verified read-only meters, units, calibration and technician permission; simulations never masquerade as measured generation/savings." | read-only is a mandate, not a phase; the boundary must make measured/simulated distinguishable at the data layer (M36-02 `presentationClass`) |
| [BLUEPRINT.md:110](../../BLUEPRINT.md) | D14–D17 are "**Proposed** (not globally accepted domain contracts)" | this leaf *proposes* the owner; it does not accept D17. Acceptance needs an ADR (M36-05/owner) |
| [BLUEPRINT.md:112](../../BLUEPRINT.md) D18/ADR-0006 | SKYLINK is "the **second and final** SQL/migration owner besides `@moonwitness/moonql`"; the guard test "must keep that set closed" | a third store is not available to HELIOGRID even in principle |
| [BLUEPRINT.md:114](../../BLUEPRINT.md) D19/ADR-0007 | ECHOLOG "owns no tables and imports no SQL driver … It owns bytes, digests, retention, legal hold and download grants only" | raw capture files may live in ECHOLOG; D17 rows may not |
| [ADR-0002 §2.1–2.2](../decisions/ADR-0002-additive-moonql-domains.md) | new domains are `packages/moonql-<domain>` via `defineAddon`, registered in the single `addons.ts`; "Satu Otoritas Runtime"; **Deny-by-Default** for sensitive models | the mechanism exists and is already used 12+ times |
| [apps/arsy/test/workspace-topology.test.ts:190](../../apps/arsy/test/workspace-topology.test.ts) | `assert.deepEqual([...owners].sort(), ['packages/moonql','packages/skylink-store'], 'no app or third package may import drizzle-orm or postgres')` | an executable guard already enforces C-1 today (§5) |
| [apps/arsy/test/workspace-topology.test.ts:~186](../../apps/arsy/test/workspace-topology.test.ts) | "topology: addons.ts is exactly the addons the hub depends on" | adding a D17 addon requires both the package and its `addons.ts` line; drift fails the suite |
| [AGENTS.md](../../AGENTS.md) | "inspect actual files before trusting historical claims"; report only observed results | the positive test below is a real run, not a plan |

Observed current wiring — `apps/arsy/src/addons.ts` imports and registers
`moonql-base, -stations, -auth, -schedule, -playlog, -apikeys, -settings, -ops, -monitor, -corpus,
-unilex, -ontology, -actors, -graph, -research, -journey, @moonwitness/witness` through the single
`addons: AnyAddon[]` array. A D17 addon follows that same shape.

## 3. Options Evaluated

| option | description | verdict |
|---|---|---|
| **O-1 — ARSY/MoonQL addon (chosen)** | `packages/moonql-energy` (working name) with `defineModel` for sites, instruments, calibrations, readings; one `addons.ts` line; collector POSTs through the Hub | ✅ conforms to BLUEPRINT:110, ADR-0002, ADR-0006/0007 and the live topology guard; zero new infra |
| O-2 — `apps/heliogrid` owns its own DB | a `heliogrid-store` package with drizzle/postgres and its own migrations | ❌ breaks the closed owner set (the §5 test would fail), creates a third SQL owner, and duplicates the migration/backup story |
| O-3 — ECHOLOG holds D17 rows | reuse the storage service for metadata too | ❌ ADR-0007 makes ECHOLOG explicitly stateless; "consumers store `{object_key, digest, size, content_type}`" — it owns bytes, never domain rows |
| O-4 — ARSY but a handwritten REST module | a bespoke `/api/v1/energy/*` handler outside `defineAddon` | ❌ loses auto-REST, hook lifecycle, reserved-path protection and topological dependency sorting; adds a second API dialect for no benefit. Reserved paths exist to protect *handwritten* modules like `health`, not to invite new ones |
| O-5 — files/CSV in ECHOLOG only, no D17 model | readings live as exported objects, analytics read files | ❌ no per-row provenance, consent or retention control; makes M36-02's tier/gap rules unqueryable. Acceptable as a *capture* supplement, not as the owner |
| O-6 — defer, no owner decided | leave D17 unowned | ❌ M36-04 (dashboard) and M36-05 (gate) both need a storage contract to aim at |

O-5 is the interesting near-miss and is worth naming: a pilot can absolutely get by with CSV exports.
It cannot get by with CSV exports *and* the calibration-tier, gap-detection, replay-idempotency and
per-site retention rules M36-02 specifies, because those are row-level queries.

## 4. Read-Only Data Boundary

### 4.1 Ownership matrix

| data | owner | writes via | mutability | retention (synthetic) |
|---|---|---|---|---|
| site inventory (opaque id, timezone, measurement category) | D17 addon / ARSY | Hub REST | editable by admin | until decommission + 5 y |
| instrument register (serial pseudonymised, model, class) | D17 addon | Hub REST | append + supersede | 10 y |
| calibration records (M36-02 §2.3) | D17 addon | Hub REST | append-only chain via `supersedes` | 10 y |
| raw readings (1 s) | D17 addon | collector ingest API | **append-only, immutable** | 7 d full resolution |
| rollups (1 m / 15 m / 1 h / 1 d) | D17 addon | scheduled derivation | recomputable, versioned | 5 y |
| derivation metadata (which inputs, which tier, which clock ladder) | D17 addon | same job | append-only | 5 y |
| raw capture files (vendor exports, CSV blobs) | **ECHOLOG (D19)** | ECHOLOG upload | immutable objects | 90 d |
| technician identity | **D00** | never copied; `technicianPseudonym` only in D17 | n/a | n/a |
| rights/consent for publishing a site's data | **D08** | D17 stores a reference, never a copy | n/a | n/a |
| dashboards, charts, copy | HELIOGRID client | read only | n/a | n/a |
| any command, setpoint, schedule, threshold for a device | **nobody — no such model exists** | n/a | n/a | n/a |

The last row is the boundary's shape: read-only is not "writes are permission-checked away", it is
"there is nothing to write to".

### 4.2 Write-path rules

| # | rule | enforcement |
|---|---|---|
| W-1 | the collector authenticates with a scoped API key whose permission set contains `readings:append` and `sites:read` only | Hub API-key scope, deny-by-default per ADR-0002 §1.3 |
| W-2 | `readings` accept appends exclusively; `PATCH`/`PUT`/`DELETE` on a reading returns 405 | model-level: no update/delete hook registered |
| W-3 | a replayed batch is idempotent on `(instrumentId, monotonicSeq, integrityDigest)` | unique constraint + append returns the existing row id |
| W-4 | rollups are recomputable from raw data and never hand-edited | derivation job writes with its own scope; the UI has no edit affordance |
| W-5 | no D17 model may hold a byte payload | `content_ref`-style references to ECHOLOG only (ADR-0007, mirrors M32-03 I-3) |
| W-6 | no D17 table is joined from another domain's SQL | cross-domain access goes through APIs; mirrors M32-02 §4 rule 1 |
| W-7 | the collector has no dependency on any actuator SDK | build-time: a manifest containing a control library fails a topology assertion |
| W-8 | calibration records cannot be deleted, only superseded | append-only chain, preserves why a reading was trusted when it was taken |

W-2 and W-7 are the two a reviewer should actually try to break; both are expressible as topology tests
in the existing `apps/arsy/test/workspace-topology.test.ts` style.

### 4.3 Read-path rules

| consumer | may read | may not read |
|---|---|---|
| HELIOGRID dashboard (member) | rollups, tier and clock metadata, gap/duplicate counts, site label | raw 1-second rows unless the site owner enabled full-resolution view |
| EMPIRE / public surface | only aggregates explicitly marked publishable, always with `presentationClass` | anything `UNCALIBRATED`, anything `SIMULATED` presented as measured |
| ARSY research tooling (ARSY/MoonQL) | D17 rows via its own models; joins only through the Hub contract | raw bytes (those are ECHOLOG's) |
| Sentinel / monitoring | health, ingest lag, gap counts | measurement values (avoids a second analytics path) |
| any other app | nothing without an API contract | no direct SQL, ever |

Full-resolution readings are the surveillance-adjacent part of this system (M36-02 §6.3): a 1-second
series identifies appliances. Keeping the default at rollup level, with an explicit opt-in per site,
means the privacy posture does not depend on everyone remembering to be careful.

### 4.4 Data classification

| class | examples | disclosure risk | handling |
|---|---|---|---|
| `PUBLIC` | publishable aggregates, method descriptions | none beyond claim risk | label must carry tier |
| `INTERNAL` | rollups, gap counts, instrument register | low | role-gated |
| `SENSITIVE` | raw 1-second readings, calibration certificates naming a lab | site behaviour reconstruction | opt-in, logged access, short retention |
| `RESTRICTED` | site identity details, technician identity | personal/location | not stored in D17; D00/D08 own it |

Access to `SENSITIVE` is an audited event, mirroring the M32-04 §7.3 pattern where the one permitted
narrow read is logged **and disclosed to the data subject**.

## 5. Acceptance Criteria

### 5.1 Positive test — **executed at this baseline**

The claim "the closed SQL-owner set is already enforced by an existing test, therefore C-1 is not
aspirational" is checkable right now, without a D17 module existing.

```bash
$ cd apps/arsy && npx tsx --test test/workspace-topology.test.ts
✔ topology: no source file reaches outside its own package (89.451ms)
✔ topology: a tsc -b member references every workspace dependency it declares (6.2253ms)
✔ topology: addons.ts is exactly the addons the hub depends on (0.7384ms)
✔ topology: the runtime has one ARSY Hub identity and no duplicate Radio app (2.5708ms)
✔ topology: every library package states its own packaging standard (0.2825ms)
✔ topology: SQL drivers are imported only by MoonQL and the SKYLINK store (105.748ms)
✔ topology: the root build scripts are derived, not enumerated (0.8506ms)
ℹ tests 7
ℹ pass 7
ℹ fail 0
```

| # | assertion | observed |
|---|---|---|
| P-1 | the topology suite runs green on `dev` at this baseline | ✅ 7 pass / 0 fail |
| P-2 | `SQL drivers are imported only by MoonQL and the SKYLINK store` passes → the owner set is `['packages/moonql','packages/skylink-store']` today | ✅ that exact test passed |
| P-3 | `addons.ts is exactly the addons the hub depends on` passes → the single wiring point is real and drift-checked | ✅ that exact test passed |
| P-4 | therefore O-1 is *compatible* with the enforced architecture and O-2 is *structurally impossible* without failing CI | ✅ follows from P-2/P-3 |

Scope note, stated plainly: this proves the **constraint exists**, not that a D17 addon works. It is a
decision-supporting test, not product verification.

### 5.2 Negative tests

| # | scenario | expected safe failure |
|---|---|---|
| N-1 | a `packages/heliogrid-store` importing `drizzle-orm` is added | the §5.1 test fails with `'no app or third package may import drizzle-orm or postgres'` — caught by CI, not by review luck |
| N-2 | a D17 addon is created but its `addons.ts` line is omitted | `addons.ts is exactly the addons the hub depends on` fails |
| N-3 | collector key used to `PATCH /api/v1/<readings>/…` | 405; the model registers no update path (W-2) |
| N-4 | gateway resends a batch after an outage | W-3 idempotency: one row, original id returned, totals unchanged |
| N-5 | a hand-edited rollup | not writable by any UI or role other than the derivation job; audit records the attempt |
| N-6 | a D17 model gains a `payload bytea` column | fails W-5 review + ADR-0007's explicit prohibition on `bytea` payloads |
| N-7 | a "diagnostics" endpoint that writes a device register | fails W-7 at build time; the collector has no actuator dependency and no such route |
| N-8 | ARSY query joins `d17_readings` to a D05 research table directly in SQL | fails W-6; must go through the API contract |
| N-9 | a `SIMULATED` series stored in the same model as measured readings without a discriminator | refused — `claimType`/`presentationClass` are required columns, so simulation cannot hide among measurements (BLUEPRINT:110) |
| N-10 | an unauthenticated ingest POST | 401 deny-by-default (ADR-0002 §1.3), no partial write |
| N-11 | dashboard requests raw 1-second rows where the site has not opted in | rollup-only response, plus an audited denial |
| N-12 | calibration record deletion | refused; supersede only (W-8), preserving `tierAtAccept` integrity |
| N-13 | a public EMPIRE surface asks for a `UNCALIBRATED` aggregate | refused; withheld class renders nothing (M36-02 §5) |
| N-14 | ECHOLOG asked to store D17 rows | refused; ADR-0007 makes it byte-and-digest only |

N-1 and N-2 are not hypothetical: they are the failure modes the two existing tests already name, which
is why choosing O-1 costs nothing in new governance machinery.

### 5.3 What is deliberately not claimed

- no D17 table, model, migration, addon package or app was created by this leaf;
- no ingest, dashboard, retention job or API key was run or provisioned;
- `pnpm verify` at the repo root is a broad integration check and is not offered as evidence for this
  decision;
- M36-01 remains BLOCKED, so no site, technician, meter or calibration authority exists to store.

## 6. Security, Rights and Privacy

| concern | position |
|---|---|
| credentials | the collector uses a scoped API key issued by the Hub; no DB credential reaches the site network. A site-side box holding a Postgres URL is the shape this decision avoids |
| network direction | the collector dials out to the Hub; no inbound port into the site's network |
| plaintext measurement data at rest | follows the existing database posture; TLS to the Hub is required, and a plain-text local buffer is deleted after successful ingest |
| site consent | site owner's written permission is an M36-01 precondition; D17 stores only a reference to that consent (D08 owns rights/consent per ADR-0007's carve-out) |
| personnel data | technician never stored by name; `technicianPseudonym` only |
| behavioural inference | mitigated by rollup-default reads (§4.3) and 7-day full-resolution retention (§4.1) |
| electrical safety | not this leaf's to grant; nothing here authorises installation work |
| audit | every `SENSITIVE` read, every denied write attempt, and every derivation run is an audited event |

## 7. Risks

| # | risk | likelihood | impact | mitigation |
|---|---|---|---|---|
| R-1 | D17 becomes a second analytics engine duplicating ARSY's role | medium | high | C-2: models live in the one Hub; clients compute nothing authoritative |
| R-2 | high-rate ingest pressures the single Postgres | medium | medium | rollups derived on a schedule; full-resolution retention capped; batch ingest with backpressure; load numbers are post-pilot (M36-04 cost model) |
| R-3 | someone adds a write path "just for configuration" and it grows into control | medium | severe | C-4 absence-of-methods plus W-7 build check; M36-05 verifies rather than trusts |
| R-4 | D17 tables drift into another domain's models | medium | high | W-6 + the existing "no source file reaches outside its own package" topology test |
| R-5 | ECHOLOG gradually becomes a metadata store | medium | high | O-3 rejected here and ADR-0007 re-cited in any review touching energy storage |
| R-6 | rollup recomputation silently changes published figures | medium | medium | derivation metadata rows (inputs, tier, ladder) are append-only and versioned |
| R-7 | raw retention longer than §4.1 by convenience | medium | high | a scheduled purge job with its own audited log; M36-04 shows retention state on the dashboard |
| R-8 | the decision is treated as D17 acceptance | medium | medium | §1 states D17 is *proposed*; acceptance requires an ADR by the owner |
| R-9 | M36-04 assumes a cost model that this boundary cannot support | low | medium | this leaf's write/read paths are the input to M36-04's cost dashboard |

## 8. Overlap Analysis

| neighbour | relationship | boundary kept |
|---|---|---|
| M36-01 | blocking prerequisite for any real data | no site/technician/authority is supplied here |
| M36-02 | supplies the reading shape, tiers and provenance | this leaf supplies storage ownership, not vocabulary |
| M36-04 | next: consumes ownership to build the cost/failure dashboard | no UI decided here |
| M36-05 | next: verifies read-only-by-construction and safety | §4.2 W-7 and C-4 are the claims M36-05 must test |
| ADR-0002 | mechanism used (additive addon, deny-by-default, one wiring point) | no new architecture invented |
| ADR-0006 / D18 | SKYLINK is the second and final SQL owner | HELIOGRID does not claim a third slot |
| ADR-0007 / D19 | ECHOLOG owns bytes and digests | D17 stores references only |
| D00 | identity, technician pseudonym | never copied into D17 |
| D08 | rights, consent, release authority | referenced, not re-implemented |
| ADR-0004 | Empire surfaces | HELIOGRID UI inherits locale/typed contracts; no second Hub/login/editor |

## 9. Deferred Items

| # | deferred | to |
|---|---|---|
| 1 | authoring `packages/moonql-energy` (`defineAddon`, models, hooks, crons) | implementation task after an accepted D17 ADR |
| 2 | the `addons.ts` line + the topology test additions for W-2/W-7 | same task |
| 3 | D17 acceptance as a domain contract | owner + ADR |
| 4 | numeric ingest rate limits and storage sizing | M36-04 cost model + post-pilot measurement |
| 5 | retention period confirmation | legal/security owner |
| 6 | full-resolution opt-in UX | HELIOGRID UI + MASTER_DESIGN |
| 7 | API-key issuance and rotation runbook | ops |
| 8 | collector packaging (does it ship inside an existing app or as a new conditional app?) | M36-05 / owner |
| 9 | vendor protocol allowlist per meter (which registers are readable) | M36-01 site survey + implementation |
| 10 | TLS termination and Hub exposure policy for ingest | security owner |
| 11 | offline buffer size and eviction on a site box | implementation |
| 12 | cross-site aggregation rules | post-pilot |
| 13 | billing-grade measurement (legal metrology) | out of scope; needs statutory status |
| 14 | power-quality classes | out of pilot scope (M36-02 §1.3) |
| 15 | backup/restore drill for D17 rows | ops, before any production claim |
| 16 | an energy-specific linter for "no actuator dependency" | implementation; §5.2 N-7 is currently a review + manifest check |
| 17 | data-export contract for a decommissioned site | implementation |
| 18 | multi-currency/tariff linkage with WORKS/M35 | separate decision |
| 19 | whether rollups live in the same addon or a derivation addon | implementation review |
| 20 | independent review of this ownership choice before D17 acceptance | integrator + owner |

## 10. Rollback

1. revert the commit adding this file and the TODO.md row change;
2. nothing was provisioned, so there is no schema, key, buffer or job to unwind;
3. if the decision is later reversed, three properties must carry into the replacement: **the closed SQL
   owner set (§1 C-1)**, **append-only immutable readings with idempotent replay (W-2, W-3)**, and
   **absence-of-methods read-only (C-4)**. A replacement that keeps a D17 owner but drops any of those
   three is a regression even if it is architecturally tidier.

## 11. Report

| field | value |
|---|---|
| `task_id` | M36-03 |
| `baseline_sha` | `28efbba` (dev, M36-02) at authoring |
| `worker` | Qoder Desktop agent session |
| `claimed_files` | `docs/audit/M36-03-d17-owner-readonly-data-boundary.md`, `TODO.md` (single row) |
| `actual_changed_files` | same two files; read-only inspection of `apps/arsy/src/addons.ts`, `apps/arsy/test/workspace-topology.test.ts`, `BLUEPRINT.md`, ADR-0002/0006/0007 |
| `positive_test_and_output` | §5.1 — `npx tsx --test test/workspace-topology.test.ts` in `apps/arsy`: **7 tests, 7 pass, 0 fail**, including the two that enforce this decision (`SQL drivers are imported only by MoonQL and the SKYLINK store`, `addons.ts is exactly the addons the hub depends on`). Output recorded verbatim |
| `negative_test_and_output` | §5.2 — 14 cases; N-1 and N-2 map onto assertions the executed suite already contains, the remaining 12 are recipes for an unimplemented surface and are **not executed** |
| `security_rights_privacy` | no DB credential at sites, outbound-only collector, scoped deny-by-default keys, rollup-default reads against behavioural reconstruction, 7-day full-resolution retention, pseudonymised technicians, consent/D00/D08 referenced not copied, audited sensitive reads; no actuation model exists to command |
| `reviewer` | integrator + owner (D17 acceptance itself needs an ADR this leaf does not create) |
| `rollback` | §10 |
| `result_sha` | commit recorded in the TODO row closure line |
| `limitations` | the positive test proves the constraint exists and that O-1 is compatible with it, not that a D17 module works; M36-01 is BLOCKED so no real site data or authority exists; all retention/scope numbers are synthetic proposals; D17 remains a proposed domain contract |
| `next_eligible_task` | M36-04 — Specify telemetry cost dashboard and failure states |

## 12. Conclusion

D17 has exactly one defensible owner in this repository, because the repository has already decided
what an owner means: one Hub, one closed SQL-owner set that a live test guards, one wiring point, and a
storage service that is stateless on purpose. Choosing ARSY/MoonQL therefore costs no new governance
machinery — the guard that would catch a wrong choice is already running and passed at this baseline.
The part of this decision that actually needs defending is C-3 and C-4: making readings immutable and
refusing to build any write-capable diagnostic path are inconveniences someone will be tempted to lift
"just for the pilot". They are recorded here as accepted costs, with named tests, so that lifting them
later is visibly a decision and not an accident.

## Appendix A: Ownership Sketch

```
                    ┌──────────────────────────────┐
   site network     │  ARSY Hub  (single REST hub) │
  ┌──────────┐      │  ┌────────────────────────┐  │
  │ meters   │read  │  │ packages/moonql-energy │  │   D17 models:
  │ (passive │──API─┼─▶│  defineAddon + models  │  │   sites, instruments,
  │  CT/etc) │      │  └──────────┬─────────────┘  │   calibrations, readings,
  └──────────┘      │             │                │   rollups, derivation meta
        │           │      ┌──────▼───────┐        │
        │ collector   │      │ MoonQL ORM   │        │
        │ (no SQL     │      └──────┬───────┘        │
        │  driver)    │             │                │
        └────────────▶│        ┌────▼─────┐          │
   writes: readings:append     │ Postgres │          │
   reads:  sites:read          └──────────┘          │
   no writes to devices — ever                       │
                     └───────┬──────────────┬───────┘
                             │              │
                    ┌────────▼───┐   ┌──────▼─────────┐
                    │ ECHOLOG    │   │ clients:       │
                    │ raw capture│   │ HELIOGRID UI,  │
                    │ objects    │   │ research,      │
                    │ (no tables)│   │ EMPIRE (agg.)  │
                    └────────────┘   └────────────────┘
```

## Appendix B: Boundary Assertions Expressed as Future Tests

```
// shape only — NOT written by this leaf; the style follows
// apps/arsy/test/workspace-topology.test.ts
test('topology: no energy package imports an SQL driver', ...)
  // already implied by the executed 'SQL drivers are imported only by MoonQL and the SKYLINK store'

test('topology: the collector manifest declares no actuator or control SDK', ...)
  // W-7 / N-7: manifest scan against a denylist of control libraries

test('topology: D17 reading models expose no update or delete hook', ...)
  // W-2 / N-3: assert the registered model has append semantics only

test('topology: D17 columns contain no byte payload', ...)
  // W-5 / N-6: schema scan, mirrors ADR-0007's 'no bytea payloads in Postgres'

test('topology: readings are idempotent on (instrument, seq, digest)', ...)
  // W-3 / N-4: unique-constraint presence check
```

## Appendix C: Glossary (selected)

| term | definition used here |
|---|---|
| closed SQL-owner set | the exactly-two packages permitted to import an SQL driver, guarded by a live test |
| additive domain addon | a `defineAddon` package registered in the single `addons.ts` list |
| append-only | rows are inserted and superseded, never updated or deleted |
| idempotent ingest | a replay produces one stored row and returns the original identifier |
| derivation metadata | the record of which inputs, tier and clock quality produced a rollup |
| absence-of-methods | read-only guaranteed by exposing no write path, not by checking permission on one |
| full-resolution opt-in | a site owner's explicit choice to allow 1-second reads |
| rollup | a down-sampled aggregate (1 m / 15 m / 1 h / 1 d) |
| presentation class | the caption contract from M36-02: `MEASURED`, `SIMULATED`, `DERIVED`, `WITHHELD` |
| tierAtAccept | the calibration tier frozen when a historical reading was accepted |
| deny-by-default | ADR-0002's rule that sensitive models are closed until explicitly scoped |
