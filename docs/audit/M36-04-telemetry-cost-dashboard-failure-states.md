# M36-04: Telemetry Cost Dashboard and Failure States Specification

**Task:** M36-04 — Specify telemetry cost dashboard and failure states
**Milestone:** [M36 — HELIOGRID measured read-only energy pilot](../milestones/M36.md) · [packet](../tasks/M36/M36-04.md)
**Role:** EXECUTABLE LEAF (specification artifact)
**Priority / Difficulty:** P3 / D3
**Prerequisites:** M36-02 [units and provenance](M36-02-calibration-units-timestamp-provenance.md) · M36-03 [D17 owner and read-only boundary](M36-03-d17-owner-readonly-data-boundary.md) · M36-01 **open and BLOCKED**
**Baseline:** `dev` HEAD `9111f46` (M36-03) at authoring
**Status:** BASELINE ESTABLISHED — specification only. No dashboard, route, model, query or cost figure
was implemented or measured. Every number below is a synthetic worked example with its formula shown.
**UI authority:** [MASTER_DESIGN.md](../../MASTER_DESIGN.md); this leaf does not create UI vocabulary.

## 1. What This Dashboard Is For

Two audiences, one surface:

1. **The pilot operator** must be able to answer, without asking a human: *is the number I am looking at
   a real measurement, how confident is it, and did the data arrive at all?*
2. **The owner** must be able to answer: *what does this telemetry cost, and which knob changes it?*

The two are fused deliberately. In practice, cost knobs (sample interval, retention depth, rollup
granularity, per-site full-resolution opt-in) *are* data-quality knobs, and a dashboard that shows cost
on one page and freshness on another will get the trade wrong, because the person cutting storage has
no idea which claims they are invalidating.

It is explicitly **not** a generation/savings claims board. BLUEPRINT:110 forbids simulations
masquerading as measured generation or savings, so the headline figures here are *data health* and
*cost*, and any energy figure carries its provenance class next to it.

## 2. Grounded Inputs

| source | contributes |
|---|---|
| [M36-02 §2](M36-02-calibration-units-timestamp-provenance.md) | `presentationClass` (`MEASURED`, `SIMULATED`, `DERIVED`, `WITHHELD`), 5 calibration tiers, clock quality ladder, `gapBeforeMs`, `backfill`, duplicate detection by `integrityDigest` |
| [M36-02 §6.3](M36-02-calibration-units-timestamp-provenance.md) | 1-second retention risk and the down-sampling schedule |
| [M36-03 §4.1](M36-03-d17-owner-readonly-data-boundary.md) | ownership matrix, 7-day full-resolution retention, rollups at 1 m / 15 m / 1 h / 1 d, derivation metadata rows |
| [M36-03 §4.2 W-3](M36-03-d17-owner-readonly-data-boundary.md) | idempotent replay → duplicate count is a *signal*, not an error to hide |
| [MASTER_DESIGN.md:6](../../MASTER_DESIGN.md) | "Skin changes visual recipe but never keyboard handling, ARIA, form meaning, permissions, source identity, publication/rights state, or machine API"; visible errors and loading states |
| [MASTER_DESIGN.md:25 (ORBIT)](../../MASTER_DESIGN.md) | "use `LIVE` only when an authorized read model confirms freshness, and show `STALE`, `OFFLINE`, `UNKNOWN`, `BLOCKED`, and errors in plain words"; "Every initial fixture must be labelled `SIMULATED`" |
| [MASTER_DESIGN.md:27 (ISP Console)](../../MASTER_DESIGN.md) | "`UNKNOWN`, `STALE`, `OFFLINE`, `PENDING` and errors are words, never color-only dots or invented `LIVE`/`NOMINAL` states"; records "show their owning domain, observation time and current freshness"; dense readable tables; no browser-to-database path |
| [MASTER_DESIGN.md:12](../../MASTER_DESIGN.md) | primitives available: `<Skeleton>`/`<TableSkeleton>`, `<Tooltip>`, `<Button loading aria-busy>`, `<Tabs>` with roving tabindex |
| [M48-06](M48-06-cost-to-serve-model.md) | the repo's existing cost-to-serve shape, reused rather than paralleled |
| [ADR-0007](../decisions/ADR-0007-echolog-storage.md) | raw capture objects belong to ECHOLOG, with its own retention and digests |
| [ADR-0014 / ADR-0017](../decisions/README.md) | MoonUI skin contract and shared-first component ownership: no one-off dashboard widgets |

**The vocabulary is already fixed by MASTER_DESIGN.** This leaf therefore does not invent states; it
enumerates which of the accepted words applies to which telemetry condition, and adds only the
domain-specific ones that have no general equivalent.

## 3. Failure and Freshness State Catalog

Each state is derived from named fields. A state that cannot be derived from data is not allowed on the
surface (this is the anti-`NOMINAL` rule).

| # | state (word shown) | derived from | meaning to a reader | severity | blocks energy claims? |
|---|---|---|---|---|---|
| S-1 | `FRESH` | `ingestedAtUtc` within 2× nominal batch interval and `clockSource=INSTRUMENT` | arriving now, honest timestamps | — | no |
| S-2 | `STALE` | `now − lastIngestedAtUtc` > 5 × nominal interval | the site stopped reporting, or we stopped collecting | warn | yes, for windows overlapping the stale span |
| S-3 | `OFFLINE` | collector heartbeat absent > 3 min | the box itself is unreachable | warn | yes |
| S-4 | `GAP` | `gapBeforeMs > 1.5 × nominal interval` in accepted rows | a hole inside otherwise flowing data | warn | yes, for interval analytics over that hole |
| S-5 | `BACKFILL` | `backfill = true` (M36-02 §4.2) | arrived late; totals fine, live view was not | info | no |
| S-6 | `DUPLICATE-PRONE` | duplicate rate on `integrityDigest` > 1 % over the window | a resending gateway; harmless to totals, a warning about the link | info | no |
| S-7 | `CLOCK-STEP` | `|offsetEstimateMs|` jump > 10× prior estimate | the instrument's clock moved; ordering is uncertain around it | warn | yes, sub-minute claims |
| S-8 | `LOW-CLOCK` | `instrumentClockKind ∈ {LOCAL_RTC, UNKNOWN}` | minute resolution is the most this site can support | warn | yes, sub-minute claims |
| S-9 | `UNCALIBRATED` | tier `UNCALIBRATED` (record absent/expired) | these are indications, not calibrated measurements | error for measured framing | yes, entirely |
| S-10 | `FIELD-TIER` | tier `FIELD` or `CALIBRATED` | usable, but the bound is weaker than a laboratory claim | info | no, but caption must carry the tier |
| S-11 | `SIMULATED` | `presentationClass = 'SIMULATED'` | model output, never a measurement | info, always labelled | yes if unlabelled — that is the violation |
| S-12 | `DERIVED` | `presentationClass = 'DERIVED'` | computed from inputs; shows the input classes and combined bound | info | no |
| S-13 | `WITHHELD` | refusal reason present (`M36-02 §3`) | the reading exists but cannot be shown as measured; reason code, never the payload | warn | yes |
| S-14 | `UNKNOWN` | none of the above derivable | we do not know, and say so | warn | yes |
| S-15 | `PENDING` | derivation job queued/running for this rollup | the figure is not computed yet | info | n/a until complete |
| S-16 | `DEGRADED-ACCURACY` | combined uncertainty bound exceeds the claim being made | the number is here but cannot support the precision shown | warn | yes, for that claim |
| S-17 | `RETENTION-PURGE-PENDING` | purge job failed or overdue for the 7-day full-res window | privacy debt is accruing | **error** | no |
| S-18 | `BLOCKED` | an explicit operator/owner hold on a site or surface | nothing will update until released | warn | yes |
| S-19 | `NO-CONSENT` | D08 reference missing/withdrawn for a site | publishing is not permitted regardless of data quality | error | yes, publish path |

Rules that keep this catalog honest:

- **N-STATE-1** — no state is inferred from colour, icon or position alone; the word is rendered.
  (MASTER_DESIGN:25, :27.)
- **N-STATE-2** — `LIVE` is used only by an authorized read model that confirms freshness (S-1); the
  dashboard's default fixture state is `SIMULATED`, per the ORBIT rule.
- **N-STATE-3** — a row that is both `STALE` and `UNCALIBRATED` shows both words; states are not
  collapsed into one "worst" badge, because the operator's actions differ.
- **N-STATE-4** — `WITHHELD` renders the refusal *code*, never value, unit, source or timestamp, which
  is exactly the behaviour the implemented measurement module already guarantees
  ([measurement-metadata.ts:208-211](../../packages/moonui/src/measurement-metadata.ts) reason-code
  design note, and M36-02 R-12).
- **N-STATE-5** — `RETENTION-PURGE-PENDING` is an error rather than an info state. Failing to delete
  on schedule is a privacy breach, not a cosmetic lag.

## 4. Cost Model

### 4.1 What "telemetry cost" means here

| bucket | unit of account | grows with |
|---|---|---|
| ingest volume | rows written | sites × channels × sample rate |
| hot storage | GiB at full resolution | sites × channels × sample rate × 7 d |
| warm/cold storage | GiB at rollup levels | sites × 5 y of rollups |
| object storage (ECHOLOG) | GiB of capture files | sites × export size × 90 d |
| compute | derivation job-seconds | rollup recomputes, backfills |
| bandwidth | GiB egress | backfills, dashboard polling |
| human | technician hours, review hours | calibrations, incidents |
| capital | meters, CTs, collector boxes, amortized | sites |
| governance | audit and disclosure handling | `SENSITIVE` reads |

The first five are machine-measurable; the last four are not, and a dashboard that shows only the first
five invites a decision on incomplete information (§7 R-3).

### 4.2 Worked synthetic sizing (formulae, not claims)

Assume a synthetic pilot: **4 sites, 12 instrument channels, 1-second interval.**

```
samples/day   = channels × 86 400                          = 1 036 800
rows/day      = samples/day                                 (append-only, one row per sample)
bytes/row     ≈ 96 B (id 26 + digests 64 + numeric/timestamp fields, synthetic estimate)
hot/day       = rows/day × bytes/row                        ≈ 99.6 MB/day
hot window    = hot/day × 7                                 ≈ 697 MB (all channels)
per-site hot  = hot/window ÷ sites                          ≈ 174 MB/site

rollup bytes: 1-min = samples/60 → ≈ 17.3 MB/day
              15-min → ≈ 1.2 MB/day
              hourly → ≈ 0.3 MB/day
              daily  → negligible
warm 5-year ≈ (17.3 + 1.2 + 0.3) MB × 365 × 5            ≈ 33.9 GB
ECHOLOG capture: 4 sites × 2 MB/day × 90 d                ≈ 720 MB
```

Presented on the surface as a **cost projection card** with the formula visible in a tooltip, because a
number without its formula is unfalsifiable. The cardinal sensitivity is the sample interval: a 1-second
to 15-second change is a 15× cost cut *and* an instant invalidation of every per-second claim (§3 S-7,
S-8), so the control that changes the interval must display both effects on the same row.

### 4.3 Cost-per-site economics (synthetic, illustrative only)

| item | synthetic unit cost | basis | note |
|---|---|---|---|
| bidirectional meter with pulse/register read | $120/site | off-the-shelf class, unverified | capital, amortized 5 y |
| 3× CT clamps | $60/site | accessory | must be passive |
| collector box (no actuator dependency, M36-03 W-7) | $80/site | single-board class | |
| installation + technician visit | $150/site | labour | **M36-01's to price, not this leaf's** |
| calibration (laboratory, if chosen) | $90/instrument | M36-02 §2.3 tier `METROLOGY` | `FIELD` tier is $0 and honest only as `FIELD` |
| hosting share (hot+warm+objects) | $1.10/site/month | derived from §4.2 volumes | self-hosted baseline; see [M48-06](M48-06-cost-to-serve-model.md) |
| dashboard query/compute share | $0.35/site/month | derivation jobs | |
| governance (audit review, consent upkeep) | $0.90/site/month | human time | the row most often omitted |
| **steady-state per site** | **≈ $2.35/month** plus amortized capital | | |

The point of the table is not the figure — it is that **calibration tier changes cost**, and cost
changes which claims are affordable. A `METROLOGY` fleet at 12 channels is a different project from a
`FIELD` fleet, and the dashboard should make that legible rather than let tier drift happen silently
behind a single "energy" tile.

### 4.4 Knobs the dashboard must expose, each with its invalidated claims

| knob | cost effect | what it invalidates | guard |
|---|---|---|---|
| sample interval (1 s → 15 s → 60 s) | ~15× / ~60× hot-storage cut | per-second peaks, demand coincidence, appliance-adjacent analysis | requires an explicit acknowledgement listing the claims lost |
| full-resolution retention (7 d → 1 d) | linear cut | backfill depth, gap forensics | never *increases* retention without review |
| per-site full-resolution read opt-in | no storage change | nothing; changes access only | each read is an audited event (M36-03 §4.4) |
| rollup granularity | small change | shorter-horizon resolution | derivation version bump |
| calibration cadence | direct cost | tier `METROLOGY` continuity when stretched | expiry flips new readings to `UNCALIBRATED` (M36-02 §2.3) |
| capture-file retention (ECHOLOG 90 d) | object-storage cost | re-parse ability for old vendor exports | legal-hold override belongs to ECHOLOG/ADR-0007 |
| dashboard polling rate | bandwidth | nothing | staleness detection must not depend on polling |

A knob whose cost saving is displayed while its *invalidated claims* are not is a design defect, not a
simplification.

## 5. Dashboard Structure and UI Semantics

All primitives come from MoonUI with semantic tokens and shared-first ownership (ADR-0017). No bespoke
chart library is introduced for a pilot with four sites.

### 5.1 Layout

| region | content | primitives |
|---|---|---|
| header strip | pilot-level counts: sites reporting, sites `STALE`/`OFFLINE`, unreadable rows this hour, projected month cost | `<Tabs>` (roving tabindex), plain words |
| site table | one row per site: label (owner-chosen, never an address), last ingest, states present (all words), tier mix, cost share | dense readable table per MASTER_DESIGN:27; `<Tooltip>` for formula |
| channel inspector | per-channel: value, unit, `presentationClass`, bound, clock kind, gap/duplicate counts | `<Skeleton>`/`<TableSkeleton>` while loading; `<Button loading aria-busy>` for recomputation |
| cost panel | §4.2 projections, §4.3 per-site, §4.4 knobs with acknowledgement | forms have labels, visible errors, loading states |
| incident log | state transitions, purge failures, clock steps, `SENSITIVE` reads | append-only list; each entry names the affected site |
| claim panel | any energy figure with its inputs, tier, bound and a `MEASURED`/`SIMULATED`/`DERIVED`/`WITHHELD` caption | refuses to render a figure whose weakest input is `UNCALIBRATED` |

### 5.2 Non-negotiable surface rules

| # | rule | source |
|---|---|---|
| U-1 | every state is a word; colour is redundant decoration only | MASTER_DESIGN:25, :27 |
| U-2 | no invented `NOMINAL`/`OK` badge; absence of a state word means no issue detected | same |
| U-3 | each record shows its owning domain, observation time and current freshness | MASTER_DESIGN:27 |
| U-4 | initial/empty fixtures are labelled `SIMULATED` | MASTER_DESIGN:25 (ORBIT) |
| U-5 | `id`/`en` parity for every state word and cost label; no untranslated machine token shown raw | MASTER_DESIGN:6, ADR-0005 |
| U-6 | keyboard-complete: tab order, arrow navigation in tabs, focus visible, no hover-only information | MASTER_DESIGN:6 |
| U-7 | reduced motion honoured; a "live" pulse animation is decoration and must not convey state | MASTER_DESIGN:6 |
| U-8 | loading uses skeletons, not a spinner that hides an empty table | MASTER_DESIGN:12 |
| U-9 | no browser-to-database path; the surface reads the D17 read model through BFF/Hub APIs | MASTER_DESIGN:27, M36-03 |
| U-10 | a withheld reading never leaks its value, unit, source or timestamp | M36-02 §3 R-12 |
| U-11 | destructive/expensive actions (interval change, retention change) name what is affected and require confirmation | MASTER_DESIGN:27 pattern |
| U-12 | the dashboard has no control affordance at all — no button, form field or hidden API that could reach a device | M36-03 C-4 |

U-12 is stated as a UI rule and enforced as an architecture rule (absence of methods), so a
mis-designed button cannot become an actuator path.

## 6. Derived Metrics

| metric | definition | unit | state interaction |
|---|---|---|---|
| ingest completeness | accepted samples ÷ expected samples over the window, expected = elapsed ÷ nominal interval | % | `GAP`, `STALE`, `OFFLINE` all reduce it; reported with the reason mix, not just the number |
| duplicate rate | duplicate `integrityDigest` attempts ÷ ingest attempts | % | high rate is `DUPLICATE-PRONE`, and does **not** change totals (W-3) |
| backfill lag | median(`ingestedAtUtc − collectedAtUtc`) | s | `BACKFILL` when > 120 s |
| clock bound | max(`offsetUncertaintyMs`) over the window | ms | exceeds claim → `DEGRADED-ACCURACY` |
| calibrated share | rows with tier ∈ {`METROLOGY`,`CALIBRATED`} ÷ measured rows | % | shown beside every aggregate |
| withheld share | refusal rows ÷ attempted rows | % | `WITHHELD` count is never folded into a total |
| storage cost/share | from §4.2 | USD/site/month (synthetic) | knob changes recompute live |
| retention debt | days since last successful purge past the schedule | d | > 0 → `RETENTION-PURGE-PENDING` (error) |
| audit reads | `SENSITIVE` reads in window | count | each names site and reader role |

Aggregates must be computed **only from rows whose state permits the claim.** The simplest way this
dashboard can lie is to average a `FIELD` and a `METROLOGY` series and caption the result as calibrated;
M36-02 §2.4's weaker-tier-wins rule is the defence and `calibrated share` is what makes it visible.

## 7. Acceptance Criteria

Nothing here is executable at baseline: there is no HELIOGRID app, no D17 read model, no dashboard
route. The recipes are written to be runnable verbatim once they exist.

### 7.1 Positive test — a stale, uncalibrated site cannot produce a measured claim

```bash
# synthetic site/channel; would live in the future heliogrid package
pnpm --filter @moonwitness/heliogrid test
```

| # | assertion |
|---|---|
| P-1 | site with `now − lastIngestedAtUtc = 30 min` at 1 s interval renders `STALE` as a word |
| P-2 | same site's instrument whose calibration record expired yesterday renders `UNCALIBRATED` |
| P-3 | the site row shows both words (N-STATE-3) and the claim panel refuses to produce a measured figure for the overlapping window |
| P-4 | historical readings accepted while tier was `METROLOGY` still show `tierAtAccept = METROLOGY` for their own window |
| P-5 | cost panel projects hot storage from §4.2 and exposes the formula in the tooltip |
| P-6 | changing the interval control from 1 s to 15 s shows the invalidated-claims list and requires confirmation (U-11, §4.4) |
| P-7 | keyboard-only walkthrough reaches every control with visible focus; no information exists on hover only (U-6) |
| P-8 | the same walkthrough in `id` and `en` shows every state word translated; no raw machine token leaks (U-5) |
| P-9 | `ingest completeness` reports its reason mix (`GAP`/`STALE`/`OFFLINE`) rather than a bare percentage |
| P-10 | an overdue purge raises `RETENTION-PURGE-PENDING` as an error state and appears in the incident log |

### 7.2 Negative tests — including the packet-mandated pair

| # | scenario | expected safe failure |
|---|---|---|
| N-1 | a simulation series is placed on the dashboard beside measured rows with no label | refused: fixture/simulation data renders `SIMULATED` (U-4, S-11); an unlabelled simulation is a BLUEPRINT:110 violation, not a styling issue |
| N-2 | calibrated aggregate computed over a window that includes `UNCALIBRATED` rows | refused; weaker tier wins, figure is captioned at the weaker tier (M36-02 §2.4) |
| N-3 | gateway replays a whole batch after an outage | totals unchanged; duplicate rate rises and `DUPLICATE-PRONE` appears (S-6); no "corrected" figure silently changes the day |
| N-4 | dashboard shows a green dot with no state word | fails U-1/N-STATE-1; a colour-only state is treated as a defect |
| N-5 | an `LIVE` badge appears because the page loaded recently | refused; `LIVE` requires an authorized freshness read model (N-STATE-2) |
| N-6 | a `WITHHELD` row's tooltip reveals the raw value | refused (U-10); refusal codes only, never payload |
| N-7 | operator lowers retention to save cost without seeing what it invalidates | blocked; §4.4 requires the invalidated-claims list to be displayed and confirmed |
| N-8 | purge job fails and the incident log stays quiet | fails P-10/N-8: retention debt is an error state, not a silent lag (N-STATE-5) |
| N-9 | any control on the dashboard attempts to write to a device or set a threshold | impossible by construction (U-12, M36-03 C-4, W-7); presence of such an affordance is a release blocker verified at M36-05 |
| N-10 | a `SENSITIVE` full-resolution read with no site opt-in | denied and audited (M36-03 §4.3, §4.4) |
| N-11 | same dashboard at 4× sites with the same interval | cost projection scales linearly and is recomputed, not extrapolated by a hard-coded number |
| N-12 | clock step mid-window | `CLOCK-STEP` appears; sub-minute demand peak for that window is refused (S-7, M36-02 §4.3) |
| N-13 | derivation job still running | `PENDING`, and no partially computed figure is rendered as final (S-15) |
| N-14 | unknown clock kind | `LOW-CLOCK`/`UNKNOWN` and no interval claim (S-8, S-14) |
| N-15 | page opened while the read model is unreachable | skeletons plus an explicit error state; an empty table is never presented as "no consumption" (U-8) |

N-1, N-2 and N-9 are the three that decide whether this dashboard can be trusted: the first two are
about the claims, the last is about the physical world.

### 7.3 Commands executed while authoring

```
$ git rev-parse --abbrev-ref HEAD
dev
$ git log --oneline -1
9111f46 docs(audit): M36-03 D17 owner and read-only data boundary decision — baseline established
```

No test suite, build or server was run for this leaf: there is nothing of HELIOGRID's to run. The
topology suite executed in M36-03 §5.1 belongs to that leaf's evidence, not this one's.

## 8. Risks

| # | risk | likelihood | impact | mitigation |
|---|---|---|---|---|
| R-1 | dashboard becomes the de-facto claim generator; screenshots escape context | high | high | every figure carries `presentationClass` + bound in the same view; exports include them |
| R-2 | cost reduction chosen without seeing invalidated claims | medium | high | §4.4 knob table, N-7 |
| R-3 | human/capital/governance buckets omitted, so the cheap option always wins | medium | medium | §4.1 marks the four non-machine-measurable buckets as required rows, with `UNKNOWN` when unpriced |
| R-4 | state catalog grows into a colour legend | medium | medium | N-STATE-1 words-first; U-1 |
| R-5 | purge failure treated as low priority | medium | high | N-STATE-5 error severity, incident log entry required |
| R-6 | aggregate code bypasses weaker-tier-wins for performance | medium | high | `calibrated share` always displayed; N-2 |
| R-7 | dashboard polling masks staleness | low | medium | staleness derived from ingest timestamps, not page freshness (N-5) |
| R-8 | bespoke widgets violate shared-first (ADR-0017) and fail the UI gate | medium | medium | §5 primitives named from MoonUI; no new widget families invented here |
| R-9 | cost figures hard-coded and later treated as measured | medium | medium | every figure shows formula + `synthetic` marker; no pricing claim for installation (M36-01's) |
| R-10 | a "diagnostics" button added later creates an actuation path | low | severe | U-12 is architectural (M36-03 W-7); verified not asserted at M36-05 |

## 9. Overlap Analysis

| neighbour | relationship | boundary |
|---|---|---|
| M36-02 | consumes tiers, clock ladder, `presentationClass`, gap/duplicate signals | adds no new measurement vocabulary |
| M36-03 | consumes ownership, retention, read opt-in, W-7/W-3 | adds no storage or permission model |
| M36-01 | still BLOCKED; installation/labour pricing is its to supply | §4.3 marks that row as unpriceable here |
| M36-05 | successor: verifies read-only-by-construction and safety | this leaf supplies the surface it inspects |
| M48-06 | existing cost-to-serve shape | reused; no parallel costing dialect invented |
| MASTER_DESIGN | owns every state word and interaction rule | this leaf selects and maps, never invents |
| ADR-0017 / ADR-0014 | shared-first components, skin contract | no one-off dashboard kit; skin never changes semantics |
| ADR-0005 | locale contract | U-5 `id`/`en` parity |
| ADR-0007 | ECHOLOG object retention and legal hold | capture-file knob defers to ECHOLOG's own policy |
| TREASURY / M35 | cost *of the pilot* is not a customer payment flow | no D15/D16 record is created by telemetry cost |

## 10. Deferred Items

| # | deferred | to |
|---|---|---|
| 1 | implementing the dashboard, routes and read model | implementation task after D17 acceptance |
| 2 | real hosting pricing for this stack | ops measurement post-pilot |
| 3 | hardware and installation quotes | M36-01 (site owner + technician) |
| 4 | calibration service prices | M36-01 (calibration authority) |
| 5 | charting primitive choice inside MoonUI | shared-first review (ADR-0017) |
| 6 | state-word translation copy in `id`/`en` | content owner (ADR-0005) |
| 7 | alert routing and paging for error states | ops |
| 8 | per-site cost attribution methodology | implementation + owner |
| 9 | multi-site fleet view | post-pilot |
| 10 | export/share affordance design with provenance attached | implementation + rights review |
| 11 | capacity planning thresholds (5 ×, 3 min, 1 %) calibration | post-pilot measurement |
| 12 | accessibility audit of the dense table | design-review at M36-05 |
| 13 | power-quality views | out of pilot scope (M36-02 §1.3) |
| 14 | tariff/cost-of-energy overlay | separate decision with M35 |
| 15 | ML anomaly detection | deferred; no accuracy claim can be made yet |
| 16 | self-service site onboarding UI | post-pilot |
| 17 | role-based views beyond the 5 in §5.1 | owner decision |
| 18 | historical cost trend storage | implementation |
| 19 | retention-debt automation (self-healing purge) | implementation, with audit |
| 20 | verification of every number in §4 | M36-05 + real invoices |

## 11. Rollback

1. revert the commit adding this file and the TODO.md row change;
2. no route, model, job or figure was created, so there is nothing to unwind;
3. if this surface is later rebuilt, three properties must survive: **every state is a derived word and
   `LIVE` requires an authorized freshness read (N-STATE-1/2)**, **cost knobs always display the claims
   they invalidate (§4.4, N-7)**, and **the surface has no write affordance toward any device (U-12)**.

## 12. Report

| field | value |
|---|---|
| `task_id` | M36-04 |
| `baseline_sha` | `9111f46` (dev, M36-03) at authoring |
| `worker` | Qoder Desktop agent session |
| `claimed_files` | `docs/audit/M36-04-telemetry-cost-dashboard-failure-states.md`, `TODO.md` (single row) |
| `actual_changed_files` | same two files; `MASTER_DESIGN.md`, M36-02/03, M48-06 and measurement-metadata.ts read for grounding only |
| `positive_test_and_output` | §7.1 P-1…P-10 defined; **not executed** — no `@moonwitness/heliogrid` package exists |
| `negative_test_and_output` | §7.2 N-1…N-15 defined, including the mandated simulation-versus-calibrated-measurement refusal and the no-actuation construction case; **not executed** |
| `security_rights_privacy` | states are words (no colour-only meaning), withheld rows leak no payload, full-resolution reads require per-site opt-in and are audited, retention debt is an error state, `SENSITIVE` reads disclose to the data subject, no browser-to-database path, and the surface exposes no control affordance |
| `reviewer` | integrator; design review for the dense table at M36-05 |
| `rollback` | §11 |
| `result_sha` | commit recorded in the TODO row closure line |
| `limitations` | every cost figure, threshold and sizing number is synthetic and formula-labelled; installation and calibration prices are M36-01's to supply and are marked unpriceable here; no state is measured, no dashboard exists, and the 5×/3-min/1 % thresholds are proposals awaiting real data; D17 remains unaccepted |
| `next_eligible_task` | M36-05 — Verify safety and post-pilot feasibility gate |

## 13. Conclusion

A cost dashboard for measured energy data has one job that a generic chart board cannot do: it must
make the *provenance* of a number as visible as its magnitude, because the moment storage is cut to
save money someone is unknowingly invalidating a claim they will still repeat next week. That is why
this specification binds every state to a derivable field, keeps the accepted MASTER_DESIGN words
(`STALE`, `OFFLINE`, `UNKNOWN`, `PENDING`, `BLOCKED`, `SIMULATED`) instead of inventing a legend,
requires each cost knob to show the claims it destroys, and treats an overdue retention purge as an
error rather than a lag. And it is why the strongest rule here is also the simplest: the surface has no
button that could reach a device, and that is an architectural property to be verified at M36-05, not a
promise.

## Appendix A: State Derivation Decision Table

```
for each site/channel window:
  if explicit operator hold:            emit BLOCKED
  if heartbeat missing > 3 min:         emit OFFLINE
  elif now − lastIngestedAtUtc > 5×I:   emit STALE
  if any row has gapBeforeMs > 1.5×I:   emit GAP
  if duplicateRate > 1 %:               emit DUPLICATE-PRONE
  if any row.backfill:                  emit BACKFILL
  if |offsetStep| > 10× prior estimate: emit CLOCK-STEP
  if clockKind in {LOCAL_RTC,UNKNOWN}:  emit LOW-CLOCK
  if min(tier) == UNCALIBRATED:         emit UNCALIBRATED
  elif tier == FIELD:                   emit FIELD-TIER
  if refusalRows > 0:                   emit WITHHELD (+ reason codes only)
  if derivationJob running:             emit PENDING
  if combinedBound > claimPrecision:    emit DEGRADED-ACCURACY
  if purgeJob overdue or failed:        emit RETENTION-PURGE-PENDING (error)
  if consentRef missing or withdrawn:   emit NO-CONSENT
  if nothing derivable:                 emit UNKNOWN
  if all clear AND authorized freshness read confirms: allow FRESH/LIVE
  # multiple emissions are shown together (N-STATE-3), never collapsed
```

## Appendix B: Cost Sensitivity Sketch (synthetic)

| interval | hot bytes/day (12 ch) | 7-day hot | calibrated-share needed for | per-second claims |
|---|---|---|---|---|
| 1 s | ≈ 99.6 MB | ≈ 697 MB | peaks, coincidence, sub-minute events | yes, if clock is GPS/NTP class |
| 15 s | ≈ 6.6 MB | ≈ 46 MB | 15 s resolution analytics | no |
| 60 s | ≈ 1.7 MB | ≈ 11.6 MB | minute load profiles | no |
| 900 s | ≈ 0.11 MB | ≈ 0.8 MB | daily/energy totals only | no |

The table's purpose is to make the trade explicit in one view: a 60× storage saving is also the total
loss of every sub-minute claim, and the dashboard must present them as one decision rather than two
settings.

## Appendix C: Glossary (selected)

| term | definition used here |
|---|---|
| state word | the plain-text term rendered for a condition; colour never carries meaning alone |
| authorized freshness read | a read model that confirms data currency, the only precondition for `LIVE` |
| claim panel | the region that renders an energy figure together with its inputs, tier and bound |
| calibrated share | the fraction of rows in an aggregate that hold a `METROLOGY`/`CALIBRATED` tier |
| retention debt | elapsed time past the scheduled purge for full-resolution data |
| invalidated claims | the specific analyses a cost knob makes impossible; must be shown with the knob |
| weaker-tier-wins | aggregates take their least trustworthy input's tier (M36-02 §2.4) |
| backfill lag | median delay between collection and ingest |
| derivation job | the scheduled process computing rollups, whose incomplete output is `PENDING` |
| control affordance | any UI element that could command a device; none exists on this surface |
