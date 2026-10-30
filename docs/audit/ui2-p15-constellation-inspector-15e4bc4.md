# UI2-P15 — the Constellation's read-only node inspector

- **Task:** UI2-P15a–P15e (P0/P1 · parent M10 / M12 / M19) — Dock · Constellation + typed relation.
- **Depends:** UI2-G05 (shell contract).
- **Repo state at audit:** branch `dev`; implementation `51039c9` + follow-up `15e4bc4`; gates below quoted at `15e4bc4`, re-confirmed at `3b44d28`.
- **Code scope used:** `src/app/constellation/page.tsx`, `src/ui/components/constellation.tsx`, plus the read side `src/data/queries/constellation.ts`. `src/app/constellation/relations/[relationCode]/page.tsx` already exists and was not modified by this leaf.
- **Method:** each claim is a `file:line` at this HEAD, a `git show`, or a command actually run. Where the leaf asks for something the code does not do, it is recorded as **NOT PROVEN** instead of ticked.

---

## 1. UI2-P15a — inventory of the graph projection the screen reads

`/constellation` has exactly one data source: the hub endpoint `constellation` (`packages/moonql-ontology/src/index.ts:455-461`), `GET /ontology/constellation`, `requires: 'public'`, handler `buildConstellation(orm)`. That endpoint is declared `acl: 'public'` in the generated contract (`packages/moonql-client/src/generated.ts:2561`), so the screen needs no credential and shows no more than an anonymous reader is allowed to see. The reviewer queue is a **different, admin-only** endpoint (`/ontology/conflicts`, `requires: ADMIN_ONLY`, `packages/moonql-ontology/src/index.ts:463-469`) and the Dock does not call it.

What `buildConstellation` returns, and where each part comes from:

| Projection member | Built from | Notes that bind what the UI may say |
|---|---|---|
| `nodes[]` | `onto_entities` (perspective, `identityStatus`, `identityVersion`, `validFrom`, `componentId`, `aliases[]`) | `packages/moonql-ontology/src/graph.ts:150-170`; `componentId` falls back to the node's own stable id when no component row exists (`:166`) — so it is never a second identity |
| `aliases[]` | `onto_aliases` | each carries `perspective`, `status` and `evidenceRef` (`graph.ts:138-145`) |
| `edges[]` | `onto_relations` | typed, with `relationCode`, `perspective`, `epistemicStatus`, `assertedBy`, `evidenceRef` (`graph.ts:180-195`) |
| `identityDecisions[]` | `onto_identity_reviews` | `pairCode`, `decision`, `evidenceRef` (`graph.ts:210-220`) |
| `conflicts[]` | computed, four kinds only | `RELATION` `:245`, `IDENTITY` `:258`, `ENTITY` `:273`, `ALIAS` `:287` — the UI enumerates the same four and nothing else |
| `sources[]` | `onto_sources`, `limit: 200` | provenance rows are part of the projection (`graph.ts:83-88`, `:374`) |
| `registry` | `ONTOLOGY_META` | `graph.ts:347` |
| `graphId` | `gph_` + first 16 hex of `sha256Hex(canonical)` | `graph.ts:341` — a real digest of the serialized graph; the Dock shows it verbatim as a badge (`apps/dock/src/app/constellation/page.tsx:67`) and asserts nothing about it |
| `review` | `REVIEW_RUBRIC` | `graph.ts:68-73`: `automaticMerge: false`, `reviewerRequired: true`, `unresolvedAllowed: true` |

Two rules inside the builder constrain the inspector's alias claim:

- the collision key is `normalizeAlias(value) = value.trim().toLowerCase().replace(/\s+/g, ' ')` (`packages/moonql-ontology/src/graph.ts:66`), and alias conflicts are emitted as `code: \`ALIAS:${…}\``;
- `status === 'REJECTED'` aliases are excluded from the grouping (`graph.ts:233`), so a withdrawn alias cannot manufacture a conflict.

The Dock mirrors the first rule rather than trusting it by eye: `apps/dock/test/ui2-p15-graph-projection-inventory.test.mjs` extracts the hub's arrow-function body and the Dock's returned expression and asserts they are the **same string**, plus asserts the `ALIAS:` prefix still exists in the hub. A normaliser drift would otherwise hide an alias conflict instead of showing it.

## 2. Why the read side was split in two files

Dock tests run under `node --experimental-strip-types --test`, which strips types but resolves **no `@/` alias**. `src/data/queries/constellation.ts` could therefore not be imported by a test at all, which is why the projection had never been exercised as a function.

At `51039c9`:

- `src/data/queries/graph-projection.ts` (248 lines) holds every projection type plus the four pure derivations the inspector uses — `findNode`, `nodeRelations`, `nodeIdentityFacts`, `normalizeAliasSurface` — and **imports nothing**;
- `src/data/queries/constellation.ts` is now 13 lines: `serverClient`, `export * from './graph-projection'`, and the single `readConstellation`.

The split is itself under test, in both directions: the endpoint scan asserts the file still contains exactly one call and that it is `serverClient().call<ConstellationProjection>('/ontology/constellation')`, and a separate assertion requires the string `serverClient` to be **absent** from `graph-projection.ts`. A future edit that quietly adds a second hub call behind a derivation fails the gate instead of silently letting the inspector claim a relation the projection never carried.

Two pre-existing tests referenced the old single file and were repointed, not rewritten: `apps/dock/test/constellation-unilex-bridge.test.mjs` now reads the `unilexStableId: string | null` shape from `graph-projection.ts` while keeping its endpoint scan on `constellation.ts`, and the UI2-G10 inventory row in `apps/dock/test/locale-boundary-coverage.test.mjs:205` points at the new path.

## 3. UI2-P15b — the inspector, and the two things it must not become

The inspector is reached by `?node=<stableId>` on the same route (`apps/dock/src/app/constellation/page.tsx:46` reads the projection once; `src/ui/components/constellation.tsx` derives everything else from those arrays). Read-only status and the candidate/verified boundary are enforced by words the catalogue owns, not by an absence of evidence:

- `<Badge tone="ok">{copy.badgeReadOnly}</Badge>` plus `readOnlyNotice: 'READ-ONLY: this inspector changes nothing. A candidate is never shown as verified, and no control here merges two identities.'` (`src/ui/copy/constellation-copy.ts:101` region).
- `identityWords(node.identityStatus, copy)` renders a candidate as `'A candidate identity: recorded, not established.'` and an unnamed code as `'The projection carries an identity status code it does not name: '` + the code verbatim — an unknown status cannot borrow a known one's meaning.
- No write surface: the test asserts `'<form'`, `'action="'`, `'method="post"'` and `'onClick={() => merge'` are all absent from the component. This is grounded in the hub too — `REVIEW_RUBRIC.automaticMerge === false` (`graph.ts:71`) — so the leaf's "no implicit merge actions" is a statement about two layers, not one.

## 4. UI2-P15c — the part `51039c9` did not actually do, and `15e4bc4` fixed

**Recorded honestly:** at `51039c9` the inspector had no keyboard path, no focus handling, no scroll containment and no wrapping rule. The leaf could not have been ticked there. `15e4bc4` supplies it:

| Requirement | Implementation | Pin |
|---|---|---|
| keyboard list alternative | selection is an `<a className="dk-graph-source-link" href={localeHref('/constellation', \`?node=${encodeURIComponent(node.stableId)}\`)}>` (`constellation.tsx:225-232`) — tabbable, Enter-activatable, works with scripting off; `aria-label={`${copy.inspectLinkAria} ${node.stableId}`}` names the destination | test asserts the exact href substring, that an `<a>` opens within 400 chars before it, and that no `onClick={() => select` exists |
| selected state announced | `aria-current={selected ? 'true' : undefined}` (`:229`) | asserted |
| focus return | the inspector carries `#graph-node-${node.stableId}` back to the card and a second link `href={localeHref('/constellation')}` clears the selection (`:418-423`) | asserted |
| scroll containment | `.dk-graph-detail` gained `max-height: 70vh; overflow-y: auto; overflow-wrap: anywhere;` (`apps/dock/src/app/globals.css:1703-1714`) and the region is `role="group" tabIndex={0} aria-labelledby="graph-node-inspector-heading"` (`constellation.tsx:399`) | test extracts the rule block and asserts all three declarations plus the focusable region |
| long names | `.dk-graph-node-title` carries `overflow-wrap: anywhere` (`globals.css:1554-1560`) | asserted |
| mobile | `@media (max-width: 900px) { .dk-graph-nodes { grid-template-columns: 1fr } }` (`globals.css:1890-1893`) | asserted |

The scroll region is made focusable rather than "restored" by script: a keyboard reader who tabs into a 70 vh panel can scroll it without the page stealing the wheel, and the return link is a fragment to the card's own `id`. **NOT PROVEN:** no 390/768/1440/1920 capture was taken by this lane. `docs/audit/screens/constellation-*` PNGs exist in the working tree but are another lane's uncommitted run, so they are not cited as evidence here.

## 5. UI2-P15d — evidence, sense, perspective and reviewer decision, in words

Every row that can carry provenance renders it or states its absence: alias (`constellation.tsx:155-160`), edge (`:274-279`), decision (`:317-322`), conflict (`:559-564`, `:744-749`) — `fieldEvidenceRef` + the raw code, else `noEvidenceRef`. Nothing prints an empty slot that a reader could mistake for "no evidence exists" rather than "none recorded on this row".

Sense is the case where honesty meant saying less. `headingSense` renders `senseUnprojected: 'The ontology projection carries no sense record for a node. Senses belong to the UNILEX namespace, which this route does not read.'` and, when the node does carry `unilexStableId`, `senseViaUnilex` points at `/terms/<stableId>` instead of restating a definition the Dock has no authority over (`:504-512`). Perspective is shown as the projected value, never inferred.

Reviewer decisions are named per recorded code — `decisionPending`, `decisionApprovedMerge`, `decisionRejected`, `decisionRevoked`, and `decisionUnknown` which shows the code unchanged — and `decisionsIntro` states that they are "read here, never taken: this view offers no merge, no split and no alias change."

The chrome itself was the last English leak in this route, fixed at `15e4bc4`:

```
before: >READ ONLY<   >REGISTRY {version}   >IDENTITY v{n}   >reviewer: {name}   UNILEX: no term mapping
        aria-label={`Open the UNILEX entry ${…}`}
after : copy.badgeReadOnly / badgeRegistry / badgeIdentityVersion / fieldReviewer
        copy.unilexNone / copy.unilexLinkAria        (both locales, constellation-copy.ts)
```

`constellation-copy.ts` now carries `badgeRegistry` ('REGISTRY' / 'REGISTRI') and `badgeIdentityVersion` ('IDENTITY' / 'IDENTITAS') beside the existing `badgeReadOnly` ('READ-ONLY' / 'HANYA-BACA'), and the UNILEX link's accessible name comes from the catalogue too. `defineLocaleCatalog` makes an id/en key drift a compile error rather than a runtime surprise; the test additionally forbids the five inline strings from returning and asserts the four new keys exist in **both** locales.

The hub's own sentences (`authority.notice`, `registry.notice`, `statusLabel`, `reason`) stay verbatim by design — they are data, not UI copy — and that exception is documented in the catalogue header rather than left to be rediscovered.

## 6. UI2-P15e — the negatives, exercised as functions

`ui2-p15-graph-projection-inventory.test.mjs` runs the derivations against a hand-built projection shaped like the hub's (3 nodes, 3 edges one of which points at `n-9`, 2 identity decisions one of which names absent nodes, all four conflict types plus an unrelated `ALIAS:unrelated`):

- orphan node → `total 0`, empty `outgoing`/`incoming`, no invented relation count;
- edge to an endpoint outside the projection → reported in `unknownEndpoints: ['n-9']` and in `unresolved`, never dropped;
- unknown `?node=` id → `findNode(...)` returns `null`, so the inspector says the node is not in this projection instead of rendering a placeholder;
- empty projection → all three derivations return empties, so a hub outage and a quiet graph stay distinguishable;
- a conflict belonging to another pair is never credited to this node (`n-3` gets `entityConflicts` only, `n-1` gets exactly `ALIAS:hevel stone`);
- `unresolved` is compared **sorted** — listing order is not a claim the inspector makes and must not become a test's claim either.

## 7. Gates observed

```
at 51039c9 : (parent commit d1927b2 gates; see ui2-p13-p14 doc)
at 15e4bc4 :
  node --experimental-strip-types --no-warnings --test test/*.test.mjs → tests 240 ; pass 240 ; fail 0
  npx tsc --noEmit -p tsconfig.json                                    → exit 0, no diagnostics
  pnpm ui:check                                                        → Files scanned: 138 | Total Violations: 0
  pnpm exec eslint apps/dock                                           → 0 errors, 5 warnings
                                                                        (catalog.ts:51 ×3, patches.ts:110 ×2 — neither file is in this commit)
  git show --stat 51039c9 → 7 files, +1170/-217
  git show --stat 15e4bc4 → 6 files,  +81/-12
re-confirmed at 3b44d28 → tests 241 ; pass 241 ; fail 0
```

One regression was introduced and fixed inside this sequence, and it is worth recording rather than hiding: while clearing an eslint `no-regex-spaces` warning I mangled the `publicLiveTransmissions` extraction regex in the P14 test (`\n    \}\)` → `\n {4}\)\)`), which made that test assert against nothing. The full-suite run caught it (`tests 240, fail 3`), the regex was restored and the fixed line shipped in `3b44d28`. Source-shape assertions are only as strong as the pattern that reads them, so both P15 and P14 tests now `assert.ok(extracted, '…')` before matching inside an extracted block.

## 8. Verdict

| Leaf | Status | Basis |
|---|---|---|
| UI2-P15a | **DONE** | §1 inventory of nodes / typed edges / aliases / identity decisions / conflicts / provenance with `file:line` for each, plus the endpoint's own ACL |
| UI2-P15b | **DONE** | §3, 10 tests at `51039c9`, read-only and candidate≠verified both asserted |
| UI2-P15c | **DONE** | §4 — implemented at `15e4bc4`, *not* at `51039c9`; keyboard path, focus return, containment, wrapping and the 900 px single column are each asserted |
| UI2-P15d | **DONE** | §5 — evidence/sense/perspective/decision in words, no implicit merge, chrome moved into the id/en catalogue |
| UI2-P15e | **DONE** for the five named cases (orphan, unknown relation, candidate conflict, empty projection, keyboard) | §6 + the keyboard assertions in §4 |

Not closed by this leaf, and not claimed: **UI2-P15 does not close M10 / M12 / M19** (the task row says so explicitly). Reduced-motion behavior on this route and the 390/768/1440/1920 screenshots remain with the Wave-B visual run; the `relations/[relationCode]` sub-route is a separate screen row and was not modified. The parent graph domain's own defects (the `/ontology/conflicts` reviewer queue being admin-only while the public page shows conflicts, and `componentId`'s stable-id fallback at `graph.ts:166`) are reported above and left to their owner.

## 9. Rollback

```
git revert --no-commit 15e4bc4   # keyboard path + catalogue-bound chrome + its 3 tests
git revert --no-commit 51039c9   # the inspector, the projection split, the catalogue
```

`15e4bc4` touches a shared stylesheet with a single 3-line hunk inside `.dk-graph-detail`; it was staged with `git apply --cached` from a one-hunk patch so the other lane's `.dk-space-card` change stayed unstaged. Reverting `51039c9` also reverts the two repointed pre-existing tests, so the tree returns to a self-consistent state rather than leaving `locale-boundary-coverage` pointing at a file that no longer exists.

## 10. Commands actually executed

```
git status --short ; git log --oneline -3
git show --stat 51039c9 ; git show --stat 15e4bc4 ; git show d1927b2:apps/dock/test/ui2-p14-denpa-transmit-states.test.mjs
grep -n "normalizeAlias|REVIEW_RUBRIC|automaticMerge|type: 'ENTITY'" packages/moonql-ontology/src/graph.ts
sed -n 83,88p ; sed -n 138,170p ; sed -n 180,220p ; sed -n 230,300p ; sed -n 335,395p packages/moonql-ontology/src/graph.ts
sed -n 450,470p packages/moonql-ontology/src/index.ts
grep -rn "ontology/constellation" apps/arsy/src packages            # acl public, one definition
grep -n "?node=|graph-node-|aria-current|dk-graph-detail\"" apps/dock/src/ui/components/constellation.tsx
grep -n "dk-graph-detail|dk-graph-node-title|dk-graph-nodes" apps/dock/src/app/globals.css
git diff apps/dock/src/app/globals.css
node --experimental-strip-types --no-warnings --test test/*.test.mjs        # 240/240, then 3 failures, then 240/240, then 241/241
npx tsc --noEmit -p tsconfig.json ; pnpm ui:check ; pnpm exec eslint apps/dock
```

Not executed: Playwright, any browser capture, `pnpm verify` end-to-end, `git push`.
