# M18-06 — Display reviewer scope, source and original-vs-derivative label

- **Task:** M18-06 (P1) — "Display reviewer scope, source and original-vs-derivative label".
- **Acceptance under test:** No AI or copywriting masquerades as original source.
- **State:** implementation and focused evidence complete; **not self-closed**. The integrator owns review and the TODO checkbox. `TODO.md` was not modified.
- **Worker:** agent session (one new pure module, one new test file, this report).
- **Date of observation:** 2026-10-28 (local/UTC).
- **Baseline branch/SHA:** `dev` / `5b70e76cfe81a9d310c17f4a02ca022aa84beb87` (short `5b70e76`).
- **Observed HEAD at handoff:** `d1a5db73ab9db2493c3ae4c89b30ae70af1861a6` (`d1a5db7`). Four commits from concurrent sessions landed during this task (`e37ec5f`, `a7b71c0`, `f1c482a`, `d1a5db7`); none contains a file claimed here, and the three files below remain untracked. `result_sha` is therefore left to the integrator.
- **Prerequisite:** M18-03 is closed in `TODO.md` at `042ce6d`; its contract (`packages/moonql-research/src/release-manifest.ts`) was read at this tree.

## Baseline and worktree

- `git rev-parse --abbrev-ref HEAD` = `dev`; `git rev-parse HEAD` = `5b70e76cfe81a9d310c17f4a02ca022aa84beb87`.
- The worktree was already dirty on entry: **91** modified/untracked paths, including `apps/arsy`, `apps/cockpit`, `apps/dock`, `apps/headquarters`, `apps/echolog`, `packages/moonql*`, `.env.example` and `docs/audit/screens/*`. Those belong to other sessions; none was opened for write, staged, restored or deleted. `apps/dock` was inspected read-only.
- Concurrent work in the same package also appeared and changed during the task: untracked `src/withdrawal.ts` (M18-04), `src/projection-label.ts` and `test/planning/m16-07-projection-label.test.mjs`. They are not part of this claim and were never edited. The package-wide typecheck observation below records how that affected one intermediate run.
- The package barrel `packages/moonql-research/src/index.ts` was **not** edited. The new module is not exported, following the M18-03 precedent.
- No commit, stage, push, rebase or branch operation was performed.

## Packet expectation versus observed ownership

The packet says to inspect `apps/dock/src/data/queries/research.ts`. **That path does not exist at this tree.** `apps/dock/src/data/queries/` contains `actors.ts`, `catalog.ts`, `constellation.ts`, `denpa.ts`, `error.ts`, `graph-projection.ts`, `graph.ts`, `journey.ts`, `listen.ts`, `patches.ts`, `program.ts`, `reader.ts` and `terms.ts`. `apps/dock` was also dirty from parallel sessions.

The task was therefore implemented in the owning research package, `packages/moonql-research` (D05 research), which owns the source-sense, review-scope and rights vocabulary this label consumes. A new pure contract plus tests was preferred over editing a dirty Dock route or component, exactly as the task direction allows. No Dock, HQ, ARSY or MoonUI file was touched.

## Method

A **pure, self-contained** module was added at `packages/moonql-research/src/source-label.ts`. It has **no imports at all** — no database, route, store, filesystem, environment, network, wall clock, locale catalogue or `node:crypto` — and it is **not exported from `src/index.ts`**. It turns one review/source record into fail-closed display labels for:

1. the **reviewer scope** (who reviewed, under which recognised scope, or an explicit unverified label);
2. the **source identity** (a named ref/version, or an explicit `SOURCE UNAVAILABLE` label);
3. the **original-versus-derivative** class (`ORIGINAL`, `DERIVATIVE`, `UNVERIFIED`);
4. the **AI and translation disclosures** that must accompany the class.

Labels are returned as a stable machine key plus canonical English fallback text. Locale rendering stays with Dock (`apps/dock/src/lib/provenance-copy.ts`); this module adds no locale catalogue.

### Input record

Every field is optional. Absence is a displayable state, never an error and never a positive signal.

| Field | Meaning |
|---|---|
| `sourceKind` | One of the six source kinds below; an unrecognised value renders unverified. |
| `sourceSense` | `ORIGINAL_ARABIC` or `LICENSED_TRANSLATION`, mirrored from `SOURCE_SENSES` in `./seed.ts`; required to display ORIGINAL. |
| `sourceRef` | Identity of the source this record reads or derives from. |
| `sourceVersion` | Exact source version, displayed beside `sourceRef`. |
| `derivedFromRef` | Explicit derivation pointer; takes precedence over `sourceRef` for identity. |
| `aiInvolvement` | `NONE`, `ASSISTED`, `GENERATED` or `UNKNOWN`; only `NONE` is a positive declaration. |
| `reviewerRef` | Named human reviewer; required to verify any scope. |
| `reviewerName` | Optional display name. |
| `reviewerScopes` | Recognised scope codes; a single scope is a one-item list. |

### Source kinds

| Kind | Class | Disclosure |
|---|---|---|
| `ORIGINAL_SOURCE` | may be ORIGINAL only through the full gate | exact source kind |
| `LICENSED_TRANSLATION` | DERIVATIVE | translation disclosure |
| `THIRD_PARTY_COPYRIGHT` | DERIVATIVE | third-party copyrighted content |
| `COPYWRITING` | DERIVATIVE | editorial copywriting |
| `AI_ASSISTED` | DERIVATIVE | AI-assisted disclosure |
| `AI_GENERATED` | DERIVATIVE | AI-generated disclosure |
| anything else / missing | UNVERIFIED | raw code shown as unrecognised, or "source kind not recorded" |

The copywriting and third-party-copyright kinds are the two ways the TODO acceptance names "copywriting": neither can ever reach `ORIGINAL`.

### Reviewer scopes

`SOURCE`, `RIGHTS`, `LANGUAGE`, `EDITORIAL`, `RESEARCH` are **display categories** for duties that already exist in the repository (exact-source review, rights/consent veto, translation review, editorial publication review, research claim review). They are not a role model, grant no authority and do not model the unratified M20-02 lane mandates. The raw set is exactly the exported `REVIEWER_SCOPE_CODES`; an unlisted code keeps its raw value in the unverified label as evidence but never verifies.

### The positive ORIGINAL gate

A record may render the `ORIGINAL` badge **only** when all six conditions hold:

1. `sourceKind === 'ORIGINAL_SOURCE'`;
2. `sourceSense === 'ORIGINAL_ARABIC'`;
3. no `derivedFromRef` is declared;
4. `aiInvolvement === 'NONE'` — an unrecorded/`UNKNOWN` AI field is not evidence that no AI was involved;
5. the source identity is named;
6. the reviewer scope is verified: a named reviewer, at least one recognised scope, and no unrecognised scope in the list.

Any failure renders `UNVERIFIED` with machine reasons. A record whose kind, translation sense or derivation pointer establishes a derivative renders `DERIVATIVE` even if every other field looks positive. Recorded AI involvement (`ASSISTED`/`GENERATED`) makes the class `DERIVATIVE` even when the record also says `ORIGINAL_SOURCE`: the generated text is not the source.

### Output

`buildSourceLabel(record)` returns a deeply frozen `SourceLabel` with:

| Field | Content |
|---|---|
| `recordedProvenance` / `recordedProvenanceLabel` | what the record declares |
| `displayProvenance` / `mayRenderOriginal` / `badge` | what a public view may render; never stronger |
| `sourceKind` / `sourceKindLabel` | recognised kind or `UNVERIFIED` |
| `reviewerScope` | `VERIFIED`/`UNVERIFIED`, recognised codes, reviewer ref/name, reason, label |
| `sourceIdentity` | `NAMED`/`UNAVAILABLE`, ref, version, label |
| `aiDisclosure` | `NONE`/`ASSISTED`/`GENERATED`/`UNRECORDED` plus label |
| `translationDisclosure` | `TRANSLATION`/`NOT_A_TRANSLATION`/`UNRECORDED` plus label |
| `reasons` | stable machine reasons in check order |

`reviewerScope` and `sourceIdentity` are separate axes on purpose: a genuine original with an unverified reviewer still displays `UNVERIFIED`, because a positive badge may not rest on an unverified scope.

### Fail-closed properties

- **Total:** `buildSourceLabel` never throws. `null`, arrays, primitives, dates, empty objects, control characters and non-string scope entries all return a frozen label.
- **No invention:** a derivative with no `derivedFromRef`/`sourceRef` renders `SOURCE UNAVAILABLE — no source identity recorded`; no source name is synthesised from another field.
- **No spoofing:** identifiers are trimmed; control characters (`U+0000`–`U+001F`, `U+007F`) make the identifier unavailable instead of being rendered raw. Non-string scope entries are not serialised into the label.
- **Deterministic and immutable:** input order and property order do not matter; every returned object/array is frozen; mutation throws `TypeError`.
- **Input-copy:** arrays are copied, so mutating the caller's record or scope array after the call cannot alter a built label.
- **Vocabulary drift check:** a test compares the mirrored `SOURCE_SENSES` with `SOURCE_SENSES` in `./seed.ts`, so a seed change fails the suite instead of silently diverging.

## Files

- `packages/moonql-research/src/source-label.ts` — new, 636 lines, pure module, types and labels.
- `test/planning/m18-06-source-label.test.mjs` — new, 452 lines, 17 `node:test` cases with synthetic fixtures.
- `docs/audit/M18-06-source-label.md` — this report.

Nothing else was created or changed: `TODO.md`, `packages/moonql-research/src/index.ts`, `seed.ts`, schemas, migrations, routes and every pre-existing modified/untracked file from other sessions were left untouched. `git status --short -- packages/moonql-research/src/source-label.ts test/planning/m18-06-source-label.test.mjs` shows only the two untracked new files.

## Positive evidence

Command, run from the repository root:

```text
node --experimental-strip-types --test test/planning/m18-06-source-label.test.mjs
```

Exit code **0**, 17 tests, 17 pass, 0 fail. Verbatim final output:

```text
✔ positive: the source sense vocabulary stays mirrored to the research seed (1.3887ms)
✔ positive: a fully evidenced original renders ORIGINAL with every axis named (0.9866ms)
✔ positive: a licensed translation is DERIVATIVE and names the source it derives from (0.3741ms)
✔ positive: copywriting and third-party copyrighted content are DERIVATIVE, never ORIGINAL (0.5783ms)
✔ positive: AI involvement is disclosed and can never keep an ORIGINAL class (0.4238ms)
✔ positive: labels are deterministic and frozen, and input mutation cannot alter a built label (0.3633ms)
✔ positive: only the complete positive gate can render ORIGINAL across the vocabulary matrix (37.2619ms)
✔ negative: an unrecorded or unknown AI field blocks the ORIGINAL badge (0.339ms)
✔ negative: a missing named reviewer falls back to an explicit unverified scope label (0.2845ms)
✔ negative: missing, unrecognised or mixed reviewer scopes never verify (0.4168ms)
✔ negative: a missing source identity renders SOURCE UNAVAILABLE and invents no source (0.2554ms)
✔ negative: conflicting source kind and sense fall to DERIVATIVE and name the conflict (0.218ms)
✔ negative: a declared derivation is DERIVATIVE even when the kind says ORIGINAL_SOURCE (0.1023ms)
✔ negative: missing or unrecognised source kinds cannot render ORIGINAL (0.1527ms)
✔ negative: malformed records never throw and never render ORIGINAL (0.2736ms)
✔ negative: control characters in identifiers are refused instead of displayed raw (0.116ms)
✔ negative: in-place mutation of a frozen label throws and leaves values unchanged (0.416ms)
ℹ tests 17
ℹ suites 0
ℹ pass 17
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 171.8294
```

What the positive cases prove:

- A record with `ORIGINAL_SOURCE` + `ORIGINAL_ARABIC` + explicit `NONE` AI + named source + verified reviewer renders exactly `ORIGINAL SOURCE`, with the reviewer scope (`SOURCE, RIGHTS`), source identity (`ref@version`), no-AI disclosure and non-translation disclosure all named.
- A licensed translation is `DERIVATIVE`, carries the translation disclosure, and names the source it derives from (`derivedFromRef`).
- Copywriting and third-party copyrighted content are `DERIVATIVE` with their own source-kind labels, never `ORIGINAL`.
- AI-generated and AI-assisted content is `DERIVATIVE` with a `NOT ORIGINAL SOURCE` disclosure even when every other field, including a verified reviewer, is positive.
- Labels are deterministic, deeply frozen and unaffected by later mutation of the caller's record or scope array.
- A **3,200-combination matrix** over every source kind (plus unrecognised/missing), every source sense (plus unrecognised/missing), every AI state (plus missing), derivation present/absent, source identity present/absent and four reviewer variants renders `ORIGINAL` in **exactly one** combination — the fully evidenced one. Every other combination is `DERIVATIVE` or `UNVERIFIED` with at least one reason.
- The mirrored source-sense vocabulary still equals the live `seed.ts` vocabulary.

## Negative evidence

All fixtures are synthetic. Each case asserts `displayProvenance !== 'ORIGINAL'`, `mayRenderOriginal === false`, a non-`displayOriginal` badge key and at least one machine reason.

| Scenario | Observed label / reason |
|---|---|
| `aiInvolvement` missing, `null`, `UNKNOWN` or an unlisted state | recorded `ORIGINAL`, display `UNVERIFIED`, badge `ORIGINAL CLAIM UNVERIFIED — NOT SHOWN AS ORIGINAL`, AI `UNRECORDED`, reason `AI_INVOLVEMENT_UNRECORDED` |
| `aiInvolvement: GENERATED` beside `ORIGINAL_SOURCE` | recorded and display `DERIVATIVE`, AI `GENERATED`, reason `AI_GENERATED` |
| reviewer ref missing, `null`, blank or containing a control character | reviewer `UNVERIFIED`, label `REVIEWER SCOPE UNVERIFIED — no named reviewer recorded`, reason `REVIEWER_MISSING` |
| `reviewerScopes: []` or a non-array string | `REVIEWER SCOPE UNVERIFIED — no review scope recorded`, reason `REVIEWER_SCOPE_MISSING` |
| one unknown scope | `REVIEWER SCOPE UNVERIFIED — unrecognised scope: NOT_A_SCOPE`, reason `REVIEWER_SCOPE_UNRECOGNISED`, no recognised codes |
| mixed known + unknown scopes | still `UNVERIFIED`; only the recognised `SOURCE` code is retained (all-or-nothing) |
| non-string scope entries (`42`, an object) | still `UNVERIFIED`; neither value appears in the label text |
| source identity missing | source `UNAVAILABLE`, label `SOURCE UNAVAILABLE — no source identity recorded`, reason `SOURCE_IDENTITY_MISSING`, no ref invented |
| translation with no source identity | display `DERIVATIVE`, source `UNAVAILABLE`, no invented ref anywhere in the serialised label |
| `ORIGINAL_SOURCE` + `sourceSense: LICENSED_TRANSLATION` | display `DERIVATIVE`, translation disclosure, reasons `TRANSLATION` and `SOURCE_SENSE_CONFLICT` |
| `LICENSED_TRANSLATION` + `sourceSense: ORIGINAL_ARABIC` | display `DERIVATIVE`, translation disclosure, reason `SOURCE_SENSE_CONFLICT` |
| `derivedFromRef` on an `ORIGINAL_SOURCE` record | display `DERIVATIVE`, identity is the declared parent, reason `DERIVATIVE_DECLARED` |
| source kind missing | recorded/display `UNVERIFIED`, label `Source kind not recorded`, reason `SOURCE_KIND_MISSING` |
| lower-case or unknown source kind | `UNVERIFIED`, label shows the raw code as `Unrecognised source kind: …`, reason `SOURCE_KIND_UNRECOGNISED` |
| source sense missing | recorded `ORIGINAL`, display `UNVERIFIED`, translation `UNRECORDED`, reason `SOURCE_SENSE_UNRECORDED` |
| unknown source sense | `UNVERIFIED`, reason `SOURCE_SENSE_UNRECOGNISED` |
| `undefined`, `null`, number, string, array or array-of-record input | `UNVERIFIED`, reason `RECORD_INVALID`; no throw |
| date/empty object/array-valued kind | `UNVERIFIED`; no throw, no positive badge |
| control character in `sourceRef` / `reviewerRef` | identity `UNAVAILABLE` / reviewer `UNVERIFIED`; the raw control-character string is never rendered |
| in-place mutation of label, codes array or reasons array | `TypeError`, values unchanged |

## Commands and observed results

All commands were run locally on 2026-10-28. No network, database, Docker, build or deployment was used.

| Command (working directory) | Observed result |
|---|---|
| `git rev-parse --abbrev-ref HEAD` / `git rev-parse HEAD` (repo root) | `dev` / `5b70e76cfe81a9d310c17f4a02ca022aa84beb87` |
| `git status --short` (repo root) | 91 pre-existing modified/untracked paths; none opened for write |
| `ls apps/dock/src/data/queries/` (repo root) | no `research.ts`; the packet path is absent |
| `pnpm typecheck` (`packages/moonql-research`), after the module was written | **failed** with 4 `TS2322` errors, all in untracked `src/withdrawal.ts` (concurrent M18-04 work); no error in `source-label.ts` |
| `pnpm exec tsc --noEmit --strict --noUncheckedIndexedAccess --target ES2022 --module NodeNext --moduleResolution NodeNext --lib ES2022 --skipLibCheck src/source-label.ts` (`packages/moonql-research`) | no diagnostics, exit 0 (run twice, before and after the ESLint fix) |
| `pnpm typecheck` (`packages/moonql-research`), later run | no diagnostics, exit 0 — the concurrent `withdrawal.ts` had been changed by its own session |
| `node --experimental-strip-types --test test/planning/m18-06-source-label.test.mjs` (repo root) | 17 tests, 17 pass, 0 fail, exit 0, 171.8294 ms |
| `pnpm exec eslint packages/moonql-research/src/source-label.ts test/planning/m18-06-source-label.test.mjs` (repo root), first run | 1 error: `no-control-regex` on the control-character check |
| same ESLint command, after replacing the regex with a char-code scan | no output, exit 0 |

The first lint run exposed that the control-character filter used a regular expression the repository lint forbids. It was replaced with an explicit `charCodeAt` scan; no behaviour changed, and the final scoped lint is clean. The intermediate package-wide typecheck failure was produced by another session's untracked file appearing mid-task; it was neither edited nor worked around, and the later package-wide run passed.

## Security, rights and privacy notes

- **Asymmetric, fail-closed gate.** `ORIGINAL` requires positive evidence on all six axes. AI involvement that is merely unrecorded blocks it; a derivative kind, translation sense or declared parent blocks it; an unverified reviewer scope blocks it. Nothing can be promoted to `ORIGINAL` by absence of data.
- **No reviewer masquerade.** A scope list is all-or-nothing: one unrecognised code makes the whole scope unverified, and a scope without a named reviewer is unverified. The raw unrecognised code is shown as evidence but never translated into a positive scope.
- **No source invention.** The identity is exactly `derivedFromRef ?? sourceRef`. When both are absent the label is `SOURCE UNAVAILABLE`; no title, edition, author or placeholder is fabricated.
- **Copywriting and AI are separate kinds.** `COPYWRITING`, `THIRD_PARTY_COPYRIGHT`, `AI_ASSISTED` and `AI_GENERATED` are structurally derivative, so the acceptance is enforced by construction rather than by a copy-writing convention.
- **Untrusted input.** The function is total, trims identifiers, refuses control characters, ignores non-string scope entries instead of serialising them, and never throws on malformed input.
- **Immutability.** Every returned structure is deeply frozen; there is no update or delete operation.
- **No real data.** All fixtures are synthetic `fixture:` refs and `principal:fixture:` names. No witness, source text, consent record, secret, environment value, review note or production identifier was used or written.
- **No rights determination.** This contract does not evaluate rights or consent; that remains M18-03's gate. A wiring task must compose both and may not treat this label as a rights clearance.

## Explicit non-claims

- **Not wired to anything.** The module is not imported by `src/index.ts`, Dock, HQ, ARSY, ORBIT, any route, component, projection, search, export or cache. No UI, screenshot, keyboard or ARIA behaviour changed.
- **No UI locale or a11y evidence.** Label text is a canonical English fallback; no `en`/`id` catalogue entry, screen capture or reduced-motion/keyboard check exists for it. A future wiring task must add both locales and keep machine codes untranslated (ADR-0005).
- **No reviewer identity or review-state verification.** The contract does not check who the reviewer is, independence, four-eyes, whether the review is current, disputed or retracted, or whether the scope grant is authorised. M14-01, M18-03 and M18-04 own those decisions.
- **No role model.** `SOURCE`/`RIGHTS`/`LANGUAGE`/`EDITORIAL`/`RESEARCH` are display categories only; no role, grant, permission or M20-02 lane mandate is created or widened.
- **No rights/consent gate.** Rights-unknown or restricted material is not refused here; composing this label with the M18-03 rights gate is required before any public use.
- **No D08 store, database, schema or migration.** Nothing is persisted; records are in-memory caller-supplied objects.
- **No publication, withdrawal, correction or takedown.** No content is published, served, indexed or made public by this change.
- **No endpoint or HTTP behavior changed.**
- **No TODO or milestone closure.** M18-06 remains unchecked; the integrator must review the evidence.
- **No commit, push, deployment or CI result.** `result_sha` is the baseline plus untracked files; concurrent sessions advanced HEAD to `d1a5db7` without these files.
- **No reviewer approval.** Reviewer is unassigned in this report.

## Limitations

- **Contract only.** This is a pure label function with no consumer. It proves the rule, not that any surface renders it.
- **Self-declared inputs.** `aiInvolvement`, `sourceKind`, `sourceSense` and scope codes are trusted as recorded. A false `NONE` or a forged `ORIGINAL_SOURCE` cannot be detected by a display helper; the owning store/review path must supply them.
- **Source identity is opaque.** The ref is displayed verbatim and is not verified to exist, match bytes or belong to the claimed edition.
- **Narrow source-sense vocabulary.** `ORIGINAL_ARABIC` / `LICENSED_TRANSLATION` is the live research vocabulary; other source traditions would need the owning task to extend it, and until then they cannot display `ORIGINAL` here.
- **Scope categories are not M20-02 lanes.** Lane mandates (`D01.TEXT`, `D08.RIGHTS`, …) are a design proposal (`NEEDS_ADR`) and are deliberately not modelled.
- **No review-state re-evaluation.** A `REVIEWED` scope remains displayed even if the review is later disputed or retracted; M18-04's withdrawal path must stop rendering the label.
- **Bidi formatting is not filtered.** Identifiers are checked for C0/DEL control characters only. Unicode bidi formatting characters (U+200E/F, U+202A–E, U+2066–9) are not classified as control characters here, because reviewer names may legitimately contain RTL text; a UI that renders untrusted identifiers must apply its own bidi isolation policy.
- **No rights composition.** As above, a rights-unknown record can still render `ORIGINAL` here if the provenance gate passes; this module is a label, not a rights clearance.
- **English fallback only.** Locale text and RTL layout for these labels are not implemented.
- **No absolute ordering guarantee for future reason additions.** Reasons are de-duplicated in check order; adding a check changes the list, so a consumer should treat the list as a set of codes.

## Rollback

Delete the three new files:

1. `packages/moonql-research/src/source-label.ts`
2. `test/planning/m18-06-source-label.test.mjs`
3. `docs/audit/M18-06-source-label.md`

No existing file, export, schema, migration, dependency, environment, route or stored data requires reverting. `packages/moonql-research/src/index.ts` was never edited, so the package barrel is unchanged.

## Report fields

- `task_id`: M18-06
- `baseline_sha`: `5b70e76cfe81a9d310c17f4a02ca022aa84beb87` (`dev`); observed HEAD at handoff `d1a5db7`, advanced only by concurrent sessions
- `worker`: agent session
- `claimed_files`: `packages/moonql-research/src/source-label.ts`, `test/planning/m18-06-source-label.test.mjs`, `docs/audit/M18-06-source-label.md`
- `actual_changed_files`: same three paths, all new/untracked; no existing file changed
- `positive_test_and_output`: `node --experimental-strip-types --test test/planning/m18-06-source-label.test.mjs` — 17 tests, 17 pass, 0 fail, exit 0; positive cases cover the full ORIGINAL gate, translation, copywriting, third-party copyright, AI-assisted/generated, determinism, freezing, input-copy, a 3,200-combination matrix with exactly one ORIGINAL, and the seed vocabulary mirror
- `negative_test_and_output`: same 17/17 run — unrecorded/unknown AI, missing/blank/control-character reviewer, missing/unrecognised/mixed/non-string scopes, missing source identity, kind/sense conflicts, declared derivation, missing/unrecognised kind or sense, malformed inputs, control characters and frozen mutation; every case is UNVERIFIED/DERIVATIVE with a stable reason and never `ORIGINAL`
- `security_rights_privacy`: asymmetric fail-closed gate; AI unrecorded blocks ORIGINAL; copywriting/third-party copyright/AI are structurally DERIVATIVE; unverified reviewer scope blocks ORIGINAL; no source identity invented (`SOURCE UNAVAILABLE`); total function on untrusted input; control characters refused; frozen output; synthetic fixtures only; no secrets, environment values or real source content
- `reviewer`: unassigned — integrator review required
- `rollback`: delete the three new files (above); no existing path changes
- `result_sha`: no commit created; worktree remains at `5b70e76` plus the three untracked files, with concurrent HEAD at `d1a5db7`
- `limitations`: pure contract only, not wired to any UI route; self-declared inputs; opaque unverified source ref; narrow Arabic source-sense vocabulary; display scopes are not M20-02 lanes; no review-state re-evaluation; no rights composition; English fallback only
- `next_eligible_task`: M18-04 — "Implement withdrawal, correction, takedown and appeal process" (open, depends on M18-03 and M03-06). M18-05 depends on M18-04; M18-07 additionally depends on M18-05 and on integrator acceptance of this task. M18-02 remains independently open.
