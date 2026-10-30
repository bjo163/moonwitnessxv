# UI2-P13 / UI2-P14 — Signal Catalog + Station Detail, and the DENPA transceiver deck

- **Tasks:** UI2-P13a–P13e (P0/P1, parent M19 / M22) and UI2-P14a–P14e (P0/P1, parent M22-03 / M19), both owned by `apps/dock`, both depending on UI2-G05.
- **Repo state at audit:** branch `dev`, HEAD `3b44d28`; implementation at `d1927b2`; the working tree of other lanes was preserved and is not part of these commits.
- **Scope:** implementation of the two existing routes plus this read-side audit. No neighbouring owner's paths were edited (see §8).
- **Method:** every claim is a `file:line` at this HEAD, a `git show`, or a command actually run whose literal output is quoted. Where a claim could not be proved it is marked **NOT PROVEN** and the leaf is left unticked.

---

## 1. UI2-P13a — what the station screen actually does today

### 1.1 query, filter, pagination

| Fact | Evidence |
|---|---|
| One hub read serves the grid, both facets and the paginator | `listStations` issues exactly one call, `serverClient().view('stationCatalog').read({ limit: 100 })` — `apps/dock/src/data/queries/catalog.ts:46-47` |
| Filtering is a pure in-memory walk of those rows | `catalog.ts:52-60` (`q` against `name` and `genre`, then `genre`, then `countryRef`) |
| Pagination is applied after filtering, not by the hub | `catalog.ts:62-72` — `pages = ceil(filtered.length / PAGE_SIZE)`, `rows = filtered.slice(start, start + PAGE_SIZE)` |
| Page size is the shared constant, not a local number | `packages/core/src/workspace.ts:62` (`dock: 12`) re-exported through `apps/dock/src/lib/env.ts:16`, consumed at `apps/dock/src/app/stations/page.tsx:127` |
| The filter form is a real `<form method="get">` | `stations/page.tsx:80` — so it works with scripting disabled, and `hrefFor` re-carries `q`/`genre`/`country` into every pagination link (`stations/page.tsx:53-61`) |
| The page never prints a count it did not read | `StationPage` splits `total` (matching the active filters) from `catalogSize` (the whole public catalog) — `catalog.ts:30-38`, rendered as "x of y" only when a filter is set (`stations/page.tsx:70-75`) |

Two consequences of the single-read design are recorded here because the leaf asked for them and because they bound what the UI may claim: `catalog.ts:46-47` reads `limit: 100` while the view itself declares `limit: 100` (`packages/moonql-stations/src/index.ts:154`), and pagination is computed client-side over that one page of rows. **The catalog currently fits (35 rows, §1.3), so the numbers are true today; if the hub's seed ever exceeds 100 rows, `catalogSize` becomes "the first 100", not the network.** That is a hub-contract limit, not something a UI leaf can fix without a second endpoint.

### 1.2 stream rights — the finding the leaf was written to catch

```
grep -rni "rights\|licen\|consent" packages/moonql-stations/src/index.ts
→ no matches
```

The `stations` model carries `streamUrl: str({ format: 'uri' })`, `genre`, `countryRef`, `active`, the probe fields and the computed `statusLabel` — and **no rights, licence, provenance or consent field of any kind** (`packages/moonql-stations/src/index.ts:40-56`). Every stream the Dock plays is therefore a third-party broadcast URL with no recorded grant. Under the ratified classification (`docs/decisions/M06-06-rights-classification.md:13-21`) that is the same polarity defect the comparative-reader audit reported for corpus rows: publication is the default, and clearance is absent rather than denied. This is not fixed here — adding a rights column to a hub-owned model is the data owner's decision, and a UI leaf inventing one would be exactly the "second data owner" the repo rules forbid. **Reported for the rights lane.**

Second, and separately: the player's failover target is a hardcoded URL outside the projection.

```
apps/dock/src/ui/client/Player.tsx:24   const AMBIENT_FAILOVER_URL = 'https://ice2.somafm.com/dronezone-128-mp3'
apps/dock/src/ui/client/Player.tsx:112  const activeSrc = isFailover ? AMBIENT_FAILOVER_URL : streamUrl
git log -S "AMBIENT_FAILOVER_URL" -- apps/dock/src/ui/client/Player.tsx
→ 9fde13f  (pre-existing, not introduced by this leaf)
```

`dronezone` is not one of the seeded stations (`groovesalad` is, at `packages/moonql-stations/src/index.ts:102`), so on stall the listener is moved to a stream the hub never projected. The badge the player shows is honest about leaving the station — `BACKUP: AMBIENT STREAM`, `statusFailoverAmbient: 'BACKUP: AMBIENT STREAM'` — but it does not, and cannot truthfully, say where the audio went. Removing zero-drop failover is a product decision, so it is **flagged, not changed**; the assertion in `apps/dock/test/ui2-p13-station-catalog-states.test.mjs` pins the constant and the wording together so a future edit cannot make the badge claim more than "a different stream".

### 1.3 sample stations not in the repository

The Dock holds no station fixture list to reject: `grep -rn "Prambors\|Hard Rock\|SomaFM" apps/dock/src` returns no seeded station names, and the only station data reaches the screen through `stationCatalog` (§1.1) or `stationCountByGenre`. So the P13a negative is satisfied by absence, and it is now pinned rather than assumed:

- The station select on `/denpa` no longer launders a failed catalog read into "0 target stations" — `read({ limit: 50 }).then(rows => rows.rows).catch(() => null)` (`apps/dock/src/app/denpa/page.tsx`), and `null` renders `badgeStationsUnknown` + `stationSelectUnknownHint` instead of a count.
- A hub `stationRef` the hub cannot resolve is dropped rather than stored (`apps/arsy/src/modules/denpa/index.ts:34-41`), so a hand-typed station in a URL parameter yields "Global network", not an invented station.

Catalog size, counted from the seed at this HEAD:

```
node -e "… count 'streamUrl:' rows between the stations seed and the next model …"
→ seed rows: 36 ; active:false: 1
```

`stationCatalog` filters `where: { active: true }` (`packages/moonql-stations/src/index.ts:151`), and the one inactive row is `Amandit 93.9 FM`, seeded off-air on purpose with the comment *"stationCatalog (where active:true) must hide this row"* (`:84-85`). So the public catalog is **35 of the 36 seeded rows**, and the screen's "35 stations in the network" is that count read from `catalogSize`, not a constant.

---

## 2. UI2-P13b/P13c/P13d — what the implementation commits, and how it is pinned

`d1927b2` moved the two station routes and the player from inline English to the route-scoped catalogue `apps/dock/src/ui/copy/stations-copy.ts`, and kept `src/lib` at exactly four shared catalogues so the UI2-G10 inventory test still passes.

| Leaf | Delivered | Gate that pins it |
|---|---|---|
| P13b | counts from `page.total` / `page.catalogSize`; GET filter form with `q`/`genre`/`country` carried into `hrefFor`; `readPanel<StationPage>` + `OutcomePanel` for loading/empty/error, `page.rows.length === 0` as the empty predicate | `test/ui2-p13-station-catalog-states.test.mjs` tests 2–4 |
| P13c | detail keeps country, schedule, projected `statusLabel`, play count and metadata; `station.statusLabel === 'live' ? sCopy.statusOnAir : sCopy.statusOffAir` (`stations/[id]/page.tsx:39-40`); `notFound()` for an unknown id (`:23`); an empty schedule says so instead of rendering a blank grid; `<Player stationId stationName streamUrl locale />` (`:49`) | tests 5–8, including `assert.doesNotMatch(detail, /autoPlay\|autoplay/)` and an exact `element.play()` call count of **1**, in the click handler |
| P13d | `locale` threaded into `StationGrid`/`StationCard` (`apps/dock/src/ui/components/sections.tsx:470-496`), so the card's link is locale-carrying; `.dk-station` gained `overflow-wrap: anywhere` (`apps/dock/src/app/globals.css:576`, staged as a one-line hunk so the other lane's stylesheet work stayed unstaged) | tests 9 |

**P13d honesty note.** The leaf text also says "source/logo accessibility". There is no logo or source image anywhere in this route's markup — `StationCard` renders name, status badge, genre and country name only — so there was nothing to label. The requirement is recorded as not-applicable rather than claimed as done. The status text on the card is the hub's own `statusLabel` string shown verbatim; that is data, matching the rule the Constellation lane uses for hub sentences.

Mobile stacking is provable from the stylesheet without a browser: `.dk-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)) }` (`globals.css:571-575`). At a 390 px viewport the available track is below `2 × 220 px`, so `auto-fill` yields one column. The pixel screenshot that the exit gate asks for is still outstanding (§6).

## 3. UI2-P14a — the form/route/permission contract, as it actually is

Chain: `DenpaTransceiver` (client) → `POST /api/denpa/transmit` (Dock proxy) → `POST /denpa/transmit` (hub, arsY) → `denpa_transmissions.create`.

| Contract | Value | Source |
|---|---|---|
| message | required, `minLength 1`, `maxLength 500`; the handler then also slices to `MESSAGE_CAP = 500` | `apps/arsy/src/modules/denpa/index.ts:13,67,79` |
| pseudonym | optional, `maxLength 50`; if blank the hub derives one | `:68,81` |
| stationRef | name **or** id accepted; anything unresolvable becomes `null` | `:34-41` |
| record status | `status: 'ON_AIR'`, `broadcastAt: now`, written in the same `create` that accepts the body | `:84-92` |
| model write ACL | `acl: ADMIN_WRITE` on `denpa_transmissions`; anonymous writes reach the hub only through the `/denpa/transmit` endpoint, not REST | `packages/moonql-stations/src/index.ts:111-124` |
| rate limit | `/denpa/transmit` is in `LIMITED_SUFFIXES`, matched by `route.endsWith(suffix)` | `apps/arsy/src/plugins/rate-limit.ts:18,34` |
| inbound webhook | refused when `DENPA_ENABLED` is on and `DENPA_TOKEN` is empty, instead of registering a public writer | `apps/arsy/src/modules/denpa/index.ts:110-115` |

The Dock's own proxy adds a second 400 (`invalid JSON body`, `message cannot be empty`) and otherwise forwards the hub error through `failJson(error)` — `apps/dock/src/app/api/denpa/transmit/route.ts:8-29`, with `apps/dock/src/app/api/denpa/transmit/route.ts` reading `payload.message` before any write.

## 4. Two claims the deck was making that the hub does not support — both removed

### 4.1 "the hub decides whether the record enters the public feed" (fixed at `3b44d28`)

That sentence, shipped in `d1927b2`, implied a moderation step. There is none: `apps/arsy/src/modules/denpa/index.ts:84-92` writes `status: 'ON_AIR'` in the same `create` call that accepts the body, and the only decision made about the payload is to drop an unresolvable station and to clamp the message. Both locales now say what happens, and a test reads the handler so the wording cannot drift back into a promise of review:

```
test/ui2-p14-denpa-transmit-states.test.mjs · "UI2-P14b the deck states the write it can prove…"
  asserts /status: 'ON_AIR'/ and /const stationRef = await resolveStationRef/ inside the handler body,
  then asserts neither locale contains /decides whether|memutuskan apakah/i and both contain ON-AIR/MENGUDARA.
```

The pre-existing encryption claim ("Zero Data In Clear") stays removed and is asserted absent in both the page source and the catalogue JSON.

### 4.2 a failed catalog read shown as "0 target stations" (fixed at `d1927b2`)

`.catch(() => [])` made an outage indistinguishable from a quiet band. The read now yields `null` on failure, `null` renders `badgeStationsUnknown`, and the select carries `stationSelectUnknownHint`. Grounded by a test rather than by the diff.

### 4.3 report-only — the derived handle is a reversible identifier

When the handle field is left blank, `apps/arsy/src/modules/denpa/index.ts:81` substitutes `senderOf(req.ip)` → `pseudonym('dn', origin)` → `dn_` + the first 16 hex of `sha256(value)` with **no salt** (`packages/core/src/hash.ts:29-32`). The deck's privacy hint is truthful about this ("leave blank and the hub stores an identifier derived from your request address"), but the resulting value is not a strong pseudonym: the IPv4 space is small enough that any reader of the public feed can map `dn_xxxx` back to an address by enumeration. Fixing it means salting in the hub, which is outside a UI leaf and outside this session's ownership. **Flagged for the hub owner; nothing changed.**

## 5. Tests, and what each one is for

`apps/dock/test/ui2-p13-station-catalog-states.test.mjs` — **9 tests**; `apps/dock/test/ui2-p14-denpa-transmit-states.test.mjs` — **9 tests**. They are source-shape assertions plus real derivations, because `node --experimental-strip-types --test` does not compile JSX and the repo has no DOM runner wired into `pnpm verify`.

Notable negatives, each chosen because a plausible future edit would otherwise pass:

- the ON-AIR badge is grounded in the view's own filter: the test extracts the `publicLiveTransmissions` `defineView` block from `packages/moonql-stations/src/index.ts:195-211` and asserts `where: { status: 'ON_AIR' }` inside it, so the badge can never restate a stronger claim than the projection makes;
- the three stream faults (`statusStreamUnavailable`, `statusStreamStall`, `statusAutoplayBlocked`) must each be a live `setStreamFault('…')` branch **and** a key in `src/lib/states-copy.ts`, and `type StreamFault =` must exist, so the badge cannot invent a fourth state;
- the 500/50 caps are read out of the hub's JSON schema rather than written as constants in the test, so a hub cap change fails the Dock gate instead of silently diverging;
- the failover wording is pinned to the real constant, the beacon to `setBeacon(response.ok ? 'sent' : 'failed')`, and the stalled-stream notice to `${copy[streamFault]} · ${copy.statusLoggingPaused}`;
- every `sCopy.*` / `dCopy.*` key either page references must exist in **both** locales — the loop that catches a half-added catalogue;
- no `<form`, no `method="post"`, no write control in the read-only screens.

## 6. Gates actually run at HEAD `3b44d28`

```
cd apps/dock && node --experimental-strip-types --no-warnings --test test/*.test.mjs
→ tests 241 ; pass 241 ; fail 0      (240 before the appended P14b truthfulness test)

cd apps/dock && npx tsc --noEmit -p tsconfig.json
→ exit 0, no diagnostics

pnpm ui:check                        (also re-run by the pre-commit hook)
→ Files scanned: 138 | Total Violations: 0 → PASSED

pnpm exec eslint apps/dock
→ 0 errors, 5 warnings — apps/dock/src/data/queries/catalog.ts:51 (×3) and
  apps/dock/src/data/queries/patches.ts:110 (×2); both pre-existing, neither in
  the files this leaf committed

git show --stat d1927b2 → 14 files, +626/-109
git show --stat 3b44d28 → 2 files,  +18/-2
```

**NOT PROVEN, and therefore not claimed:** the 390/768/1440/1920 screenshots. `docs/audit/screens/` contains no `stations-*` or `denpa-*` captures at this HEAD, and the Playwright harness has not been run for these two routes. **UI2-P13e** ("attach 390/768/1440/1920 evidence") and **UI2-P14e** ("plus responsive screenshot/geometry checks") stay unticked pending that run, together with the denied/rate-limit feed test which needs a live hub rather than a source assertion. The exit gate also asks for reduced-motion and keyboard evidence on these routes; keyboard is asserted in source (§2) but reduced motion is a Wave-B item.

## 7. Rollback

Three independent commits, all revertable without touching another lane:

```
git revert --no-commit 3b44d28   # DENPA subtitle honesty fix + its test
git revert --no-commit d1927b2   # the whole station/denpa screen group
```

`d1927b2` is self-contained apart from two shared files it edits additively: `src/lib/states-copy.ts` (+144 keys per locale parity, with `test/required-states-ui-keys.mjs` and `test/states-copy-parity.test.mjs` retuned in the same commit) and one 1-line hunk of `src/app/globals.css`. Reverting it also reverts those, so no orphan key or dangling rule is left behind.

## 8. Deliberately not touched

`src/app/globals.css` is shared and was mid-edit by another lane. Only my own hunk was staged (a single-hunk `git apply --cached` of the `.dk-station` line in `d1927b2` and the `.dk-graph-detail` lines in `15e4bc4`); the other lane's `.dk-space-card` and `responsive-accessibility.test.mjs` work stayed unstaged and uncommitted. The Constellation lane (`51039c9`, `15e4bc4`) is evidenced separately in `ui2-p15-constellation-inspector-*.md`. `apps/dock/src/data/queries/patches.ts` and `apps/dock/src/ui/copy/patches-copy.ts` were, at `d1927b2`, unreferenced files from an earlier agent; they are UI2-P16 work and are evidenced with that leaf, not here.

## 9. Commands actually executed for this document

```
git status --short ; git log --oneline -3
git show --stat d1927b2 ; git show --stat 51039c9 ; git log -S "AMBIENT_FAILOVER_URL" -- apps/dock/src/ui/client/Player.tsx
grep -n "stationCatalog|publicLiveTransmissions|denpa_transmissions|where: { active: true }" packages/moonql-stations/src/index.ts
sed -n 40,72p ; sed -n 111,146p ; sed -n 147,215p   packages/moonql-stations/src/index.ts
node -e "…count seeded streamUrl rows and active:false rows…"          # 36 rows, 1 inactive
grep -rni "rights|licen|consent" packages/moonql-stations/src/index.ts  # no matches
sed -n 60,140p apps/arsy/src/modules/denpa/index.ts
grep -n "LIMITED_SUFFIXES" apps/arsy/src/plugins/rate-limit.ts
grep -rn "senderOf" apps/arsy/src ; sed -n 29,32p packages/core/src/hash.ts
sed -n 1,80p apps/dock/src/data/queries/catalog.ts ; grep -n PAGE_SIZE apps/dock/src/lib/env.ts packages/core/src/workspace.ts
sed -n 470,496p apps/dock/src/ui/components/sections.tsx ; grep -n "dk-grid" -A 5 apps/dock/src/app/globals.css
cat apps/dock/src/app/api/denpa/transmit/route.ts
node --experimental-strip-types --no-warnings --test test/*.test.mjs     # 240/240
npx tsc --noEmit -p tsconfig.json ; pnpm ui:check ; pnpm exec eslint apps/dock
```

Not executed: any Playwright run, any browser capture, `pnpm verify` end-to-end, and any push — those belong to the Wave-B evidence run and to the push of this group.
