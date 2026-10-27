# M23-01 — Preserve 33 Patch Titles, 014 Conflict and All Reported Statuses

- **Milestone**: M23 Journey, Path & Mandate Consent
- **Task**: M23-01 (READ-only data/content audit; this artifact is the only write)
- **Baseline**: branch `dev`, `baseline_sha` 76ecdc58fa3798a2f0f4fc0cf6fc97da10920ac3
- **Code changed**: none. No TODO.md edit, no commits, no source/test modification.
- **Dependency check**: M06-04 is closed — `TODO.md` line 214 `- [x] **M06-04** — Preserve XII 33 patch statuses and disputed 014`, evidence `docs/decisions/M06-04-xii-patches-registry.md` (RATIFIED). NOT BLOCKED.

## 1. Source of truth

The canonical journey-patch data is the MoonQL demo seed for domain D11:

| Layer | File | Role |
|---|---|---|
| Seed (source of truth) | `packages/moonql-journey/src/seed.ts` — `WORLD_PATCH_SEED`, `PATCH_STATUSES` (lines 6–13) | 35 rows: slots 001–033 + `UNNUMBERED-01`, `UNNUMBERED-02` |
| Model | `packages/moonql-journey/src/index.ts:33–52` — `journey_patches`, `unique: [['slot']]` (48), `acl: ADMIN_WRITE` (49), `seed: WORLD_PATCH_SEED` (51) | Persistence; seeded once into empty table (`packages/moonql/src/boot.ts:223–233`) |
| Regression test | `apps/arsy/test/journey-patches.test.ts:31–74` | Asserts row count `>= 34` (line 36), slot 014 title/disputedTitle/status (39–43), slot 033 `USER_SUBMITTED_IN_CHAT` (46–48), UNNUMBERED-01 notes (51–57), overview view `>= 33` (69) |
| Client types | `packages/moonql-client/src/generated.ts` `JourneyPatchesOverviewOutput` (2333) | Status enum = the 6 seed statuses exactly; no approval value exists in the type surface |
| Public UI | `apps/dock/src/data/queries/journey.ts` → `apps/dock/src/app/patches/page.tsx` → `apps/dock/src/ui/client/PatchesExplorer.tsx` | Read-only projection of the same seed rows |
| Narrative authority | `docs/vision/MASTER_VISION_NARRATIVE_XV.md` §21A.8 (lines 919–961) | The 33-row table + unnumbered records |
| Shadow registry | `packages/core/src/patches.ts` (`WORLD_PATCHES`, exported at `packages/core/src/index.ts:19`) | Dormant duplicate, no consumers found — see §4 |

## 2. The 33 patch titles as recorded (verbatim)

Status vocabulary (`seed.ts:6–13`, six values, all report-preserving):
`REPORTED_IN_CHAT`, `RECOVERED_DRAFT`, `UNRESOLVED_NUMBERING_CONFLICT`, `EDITORIAL_PROPOSAL`, `USER_SUBMITTED_IN_CHAT`, `UNNUMBERED_HISTORICAL`.

| # | Slot | Title (verbatim, seed.ts) | Status |
|---|---|---|---|
| 1 | 001 | AEGIS PROTECTION | REPORTED_IN_CHAT |
| 2 | 002 | NEVERMORE | REPORTED_IN_CHAT |
| 3 | 003 | DIPINGIT MODE ON | REPORTED_IN_CHAT |
| 4 | 004 | PINK NOISE | REPORTED_IN_CHAT |
| 5 | 005 | WINDWALKER | REPORTED_IN_CHAT |
| 6 | 006 | PATCH QIBLAT UTARA | REPORTED_IN_CHAT |
| 7 | 007 | MAROON 5 | REPORTED_IN_CHAT |
| 8 | 008 | FUTURE IS NOW | REPORTED_IN_CHAT |
| 9 | 009 | WE ARE SAVAGES | RECOVERED_DRAFT |
| 10 | 010 | HAVE A NICE DAY | RECOVERED_DRAFT |
| 11 | 011 | KARMA — THE BUG IS ME | RECOVERED_DRAFT |
| 12 | 012 | THE PRIME DIRECTIVE | RECOVERED_DRAFT |
| 13 | 013 | SAFE FROM DAY ONE | RECOVERED_DRAFT |
| 14 | 014 | FAMILY WITHOUT FEAR (disputedTitle: THE WRONG WAY / HELLROAD) | UNRESOLVED_NUMBERING_CONFLICT |
| 15 | 015 | FAIR WORK, FAIR LIFE | EDITORIAL_PROPOSAL |
| 16 | 016 | BREAK THE DEBT LOOP | EDITORIAL_PROPOSAL |
| 17 | 017 | THE SECOND CHANCE | EDITORIAL_PROPOSAL |
| 18 | 018 | JUSTICE FOR EVERYONE | EDITORIAL_PROPOSAL |
| 19 | 019 | THE HONEST WITNESS | EDITORIAL_PROPOSAL |
| 20 | 020 | NO ONE DIES ALONE | EDITORIAL_PROPOSAL |
| 21 | 021 | THE MERCY NETWORK | EDITORIAL_PROPOSAL |
| 22 | 022 | CLEAN WATER FOR ALL | EDITORIAL_PROPOSAL |
| 23 | 023 | NO ONE GOES HUNGRY | EDITORIAL_PROPOSAL |
| 24 | 024 | HEALTH WITHOUT BARRIERS | EDITORIAL_PROPOSAL |
| 25 | 025 | LEARN FOR LIFE | EDITORIAL_PROPOSAL |
| 26 | 026 | NO ONE LEFT BEHIND | EDITORIAL_PROPOSAL |
| 27 | 027 | CRISIS READY | EDITORIAL_PROPOSAL |
| 28 | 028 | EARTH STEWARDSHIP | EDITORIAL_PROPOSAL |
| 29 | 029 | SAFE DIGITAL WORLD | EDITORIAL_PROPOSAL |
| 30 | 030 | FAIR GOVERNANCE | EDITORIAL_PROPOSAL |
| 31 | 031 | PEACE BUILDER | EDITORIAL_PROPOSAL |
| 32 | 032 | A SAFE PLACE TO LIVE | EDITORIAL_PROPOSAL |
| 33 | 033 | KOPIHITAM - SIACENG / FAITH TO ACTION | USER_SUBMITTED_IN_CHAT |

Unnumbered extras (outside the 33): `UNNUMBERED-01` WILD YOUTH / MWX-SYF-00752 and `UNNUMBERED-02` RIBA — NOT APPROVED, both `UNNUMBERED_HISTORICAL` (seed.ts:339–356).

### Count verification (diff-style summary, commands actually run)

```
grep -c "slot: '"        seed.ts            -> 35 rows total
numbered slots 001–033   seed.ts            -> 33, uniq -d => no duplicate slots
status tally             seed.ts            -> 8 REPORTED_IN_CHAT, 5 RECOVERED_DRAFT,
                                               1 UNRESOLVED_NUMBERING_CONFLICT,
                                               18 EDITORIAL_PROPOSAL, 1 USER_SUBMITTED_IN_CHAT,
                                               2 UNNUMBERED_HISTORICAL
registry composition     8+5+1+18+1 = 33    matches M06-04 registry exactly

diff  seed titles (35)  vs  core WORLD_PATCHES titles (36)  -> first 35 byte-identical;
      only delta: +36 > THE FINAL AUDIT (core only, see §4.1)
diff  §21A.8 table (lines 925–957)  vs  seed numbered titles (33) -> 32/33 byte-identical;
      line-14 delta is formatting only: doc renders 014 as the joined dual title
      "FAMILY WITHOUT FEAR **vs** THE WRONG WAY / HELLROAD" = seed title + disputedTitle
```

**Title count found: 33 numbered canonical titles, confirmed exactly 33**, each preserved verbatim across seed, core registry, client view, dock UI, vision doc and M06-04 registry composition.

## 3. The 014 conflict record — location

- Data: `packages/moonql-journey/src/seed.ts:158–167` — `slot 014`, `title FAMILY WITHOUT FEAR`, `disputedTitle THE WRONG WAY / HELLROAD`, `status UNRESOLVED_NUMBERING_CONFLICT`, historicalNotes: "Never silently reassign."
- Schema: disputed title is a real column (`disputedTitle`, `packages/moonql-journey/src/index.ts:40`).
- Test guard: `apps/arsy/test/journey-patches.test.ts:39–43` and view-level `:71–73`.
- UI: conflict Alert banner `PatchesExplorer.tsx:87–98` (renders both titles, cites §21A.8); badge maps the status to the label `DISPUTED` (`PatchesExplorer.tsx:181`); dock counts disputed via the status (`queries/journey.ts:26`).
- Authority: `docs/vision/MASTER_VISION_NARRATIVE_XV.md:938`, gap re-listed at `:972` ("World Patch #014 numbering dispute remains open").

The conflict remains **open as an unresolved numbering split** — no code path merges, renumbers, or resolves it.

## 4. Integrity check and risk findings (recorded, NOT fixed — M23-02..07 own enforcement)

### 4.1 Shadow registries that could drift titles/statuses
- `packages/core/src/patches.ts:27–92` (`WORLD_PATCHES`, publicly exported at `packages/core/src/index.ts:19`) is a dormant second registry. Its 33 numbered titles match the seed verbatim, but it carries a **third unnumbered entry `THE FINAL AUDIT` (patches.ts:86–91)** absent from the DB seed (vision doc line 959 calls it a "displaced concept"), reuses the literal `slot: 'UNNUMBERED'` three times (breaks the seed's unique-slot discipline), and diverges on `thematicFocus` for slots 024, 026, 031 and WILD YOUTH. Any future consumer binding to core instead of the seed would display rows the database does not contain.
- `packages/types/src/domain/patches.ts:4` defines a legacy `WorldPatchStatus = 'ACTIVE' | 'DISPUTED' | 'SURRENDERED' | 'HISTORICAL'` vocabulary (unused by any found consumer). Adopting it would silently reclassify `UNRESOLVED_NUMBERING_CONFLICT` and turn report-preservation statuses into verdict statuses — a direct threat to the invariant in §5.

### 4.2 Provenance wording drift (not corruption)
- `docs/decisions/M06-04-xii-patches-registry.md:17–20` names 014's status `DISPUTED / HUMAN_ATTRIBUTION_ONLY` and describes it as claiming "theological/eschatological certainty", while the implementation status is `UNRESOLVED_NUMBERING_CONFLICT` and §21A.8:938 records it as a numbering conflict with THE WRONG WAY. Titles and disputed-ness are preserved in both; the label mismatch should be reconciled by a downstream doc-owner, not by editing data.

### 4.3 Divine-approval auto-assert surfaces — negative findings
- **Journey domain: clean.** `journey_patches.status` is a closed 6-value select of report-preserving statuses (`seed.ts:6–13`); no `approved`, `granted`, or `divine` field exists anywhere in `packages/moonql-journey`, the client types (`generated.ts` JourneyPatches* interfaces), or the dock patches UI. Seed itself annotates 033 as "not a divine mandate" (`seed.ts:337`).
- **Nearest risk elsewhere in code (file:line):** `packages/moonql-research/src/index.ts:479` and `:901` admit `claimKind: sel(['BOUNDED_DERIVED_READING', 'DIVINE_JUDGMENT', 'SALVATION_VERDICT'])` as *writable enum values* on `research_witnesses`. The endpoint handler rejects non-bounded kinds (`:911–912`) and the L5 gate fails them (`gates.ts:532`), but an admin-direct REST write (`research_witnesses` is `rest: true`, `acl: ADMIN_WRITE`, `index.ts:453–454`) can persist `claimKind='DIVINE_JUDGMENT'` on a row until a gate run flags it. That is the one concrete "divine-approval-shaped" value stored anywhere in the repo; enforcement-to-zero belongs to M23 follow-ons / research owners.
- Landing copy already asserts the opposite invariant and is test-guarded: `apps/dock/src/lib/landing-copy.ts:12` ("we make no claim of divine authorization"), tested at `apps/dock/test/landing-copy-english.test.mjs:24`.

### 4.4 External submission — checked, none found
- `journey_patches` writes are ADMIN_ONLY for create/update/remove (`packages/moonql/src/model.ts:32–36`); no unauthenticated mutation path.
- No pipeline forwards patch rows out of the repo: the only "patch" hits in transport code (`apps/arsy/src/channels/whatsapp.ts`, `packages/skylink-whatsapp/src/client.ts:73`, `apps/sentinel/src/index.ts:18`, `apps/arsy/src/modules/announcer/tts.ts`) are HTTP-`PATCH`/`dispatch` vocabulary, not patch-registry traffic. Dock `/patches` is read-only projection. Vision doc explicitly forbids treating records as external proof (`MASTER_VISION_NARRATIVE_XV.md:479` "not proof of external delivery… do not mark requests 'granted by ALLAH'"; `:961` no "divine patch completed" record).

## 5. Milestone invariant (to be enforced by M23-02..07)

1. **Statuses remain as-reported.** Every registry row keeps one of the six report-preserving statuses; nothing is promoted to approved/granted/active, and `UNRESOLVED_NUMBERING_CONFLICT` for 014 stays open until primary-source resolution — never silently reassigned.
2. **Titles are immutable history.** All 33 canonical titles plus disputedTitle and both unnumbered titles must stay byte-verbatim wherever referenced (§21A.8 is the wording authority; seed is the data authority).
3. **No fabricated divine approval, no external submission claims.** Future consent/mandate work (M23-02 scopes, M23-03 Mandate model, M23-05 "No automatic high-consequence world patch") must enforce: human operator, pseudonym, expiry, and accountable deliverable only.

Where enforcement will land later: single canonical data owner (retire `packages/core/src/patches.ts` and the legacy `packages/types/src/domain/patches.ts` vocabulary or bind them to the seed), server-side guards keeping `journey_patches` status within the preserved enum on admin writes, and closing the `claimKind` direct-write window in `research_witnesses`.

## 6. Acceptance evidence

- **Positive:** §2 table + §2 diff summary — 33 titles verified byte-for-byte against `seed.ts` (grep/diff commands recorded above), §21A.8 table and `WORLD_PATCHES`; count exactly 33 numbered (35 rows incl. 2 unnumbered, matching arsy's `>= 34` / view `>= 33` guards); status tally reproduces M06-04's 8+5+1+18+1.
- **Negative:** §4.3 — one concrete divine-judgment-shaped writable value with file:line (`moonql-research/src/index.ts:479`/`:901`, guarded at `:911–912` and `gates.ts:532`), plus checked-and-none attempts for external submission (§4.4) and for any journey-side approval field (none exists).

**Verdict: READY-TO-CLOSE.** All 33 patch titles, the 014 conflict and every reported status are preserved verbatim in the source-of-truth seed, schema, tests, client types, dock UI and §21A.8; zero divine-approval or external-submission paths exist in the journey domain. Shadow-registry and claimKind risks are documented for M23-02..07 enforcement. No code changed; this file is the only write.
