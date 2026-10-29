# M24-01 — A-L-L-A-H pinned World Monitor code review (2026-10-29)

This follow-up supplements the earlier XV-only inventory and provider-terms review. It does not import code, approve reuse, authorize a live adapter, or close M24-01. The prior inventory remains valid for the exact XV tree it inspected; its statements about the external source being unavailable are superseded by this follow-up.

## Source identity and scope

- **XV baseline inspected:** `dev` at `e91734869dd418e158697dc926c7168262dd973a`.
- **Pinned historical source:** [`bjo163/A-L-L-A-H`](https://github.com/bjo163/A-L-L-A-H) commit [`47bac90cade77ee2136cb66d546156b220fe8481`](https://github.com/bjo163/A-L-L-A-H/commit/47bac90cade77ee2136cb66d546156b220fe8481), the repository/commit named in `docs/vision/MASTER_VISION_NARRATIVE_XV.md`.
- **Retrieval:** GitHub repository contents and raw source at that exact commit were readable on 2026-10-29. No live provider endpoint was requested. The API and fixture claims below are static source findings, not evidence that the old application was deployed or actually ran against providers.
- **Separate unresolved pin:** `docs/audit/M06-01-source-repo-pins.md` also records `bjo163/allah-hub@71a80c94dae0021b`, path `core/manifest.json`, as `TAXONOMY_ONLY`. This is a different repository name and a different reference; inspecting `A-L-L-A-H@47bac90` does not resolve or replace that M06 pin. M06-05 still prohibits wholesale historical import.
- **Source reuse:** the historical README says the repository has no root `LICENSE`. This review makes no claim that its application code, UI, fixture contents, or assets may be copied into XV.

## Provider implementation at the pinned commit

| Provider | Historical adapter / endpoint | Fixture and test evidence | Classification |
|---|---|---|---|
| **USGS** | [`apps/api/src/world-monitor-ingest.ts`](https://github.com/bjo163/A-L-L-A-H/blob/47bac90cade77ee2136cb66d546156b220fe8481/apps/api/src/world-monitor-ingest.ts) defines a primary `all_day.geojson` feed and an FDSN query fallback. `parseQuakes` validates IDs, epoch timestamps and coordinates. | `apps/api/tests/world-monitor-ingest.test.mjs` loads static `usgs-earthquakes` and malformed fixtures; the sample identifier is `fixture-usgs-001`. | Live-fetch-capable source code exists; fixtures remain test fixtures and are not themselves live observations. No provider call was made for this review. |
| **GDACS** | The same ingestion file defines `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH`; `parseDisasters` maps event ID, modified/from date and normalized properties. | Static `gdacs-disasters` and malformed fixtures are loaded by the offline parser test; the sample ID is `fixture-gdacs-001`. | Live-fetch-capable source code exists; fixture status is explicit. Runtime execution/deployment is unverified. |
| **NOAA** | The ingestion file defines NOAA SWPC planetary K index JSON as primary and the legacy product JSON as fallback. `parseKp` distinguishes estimated and reported values and validates range and observation time. | Static `noaa-kp-estimated`, `noaa-kp-reported`, and malformed fixtures are consumed by parser tests. | Live-fetch-capable source code exists; tests are fixture-based, with no live request in the test suite inspected. |
| **Open-Meteo** | The ingestion file defines current weather and air-quality API calls at eight fixed locations, with GFS weather fallback. `parseOpenMeteo` validates coordinates, timestamp, recognized measurements and ranges. These are **current-condition** calls, not an historical archive API. | Static weather, air-quality, malformed and fallback fixtures are loaded by parser tests. They contain fixture-labelled IDs/values and are exercised offline. | Live-fetch-capable source code exists; fixtures remain separate from runtime observations. |

The historical API worker's [`world-monitor-scheduler.ts`](https://github.com/bjo163/A-L-L-A-H/blob/47bac90cade77ee2136cb66d546156b220fe8481/apps/api/src/world-monitor-scheduler.ts) starts a run and schedules later runs with a configured interval clamped to 5–15 minutes. The ingestion code requests JSON with a 12-second timeout, tries fallback sources when a primary fails or is stale, timestamps observations (`observedAt`, `fetchedAt`), and marks stale data. It stores source/tier/category and freshness/status data; source-run metadata includes the request URL and a bounded/redacted raw-payload record. These controls demonstrate a historical implementation, not production reliability, data accuracy, legal clearance, or evidence of a run.

The old package manifest describes `@empire/batteries-world-monitor` as not yet connecting live regional sources, while the API app contains the provider fetcher and scheduler. The narrow reading is that the package itself owns contracts/YouTube Sentinel and the API app owns ingestion; its package description is still easy to misread as repository-wide capability status and should be clarified by that repository's owner.

## Fixture/live boundary

- The test suite reads local JSON files under `apps/api/tests/fixtures/world-monitor/`; the fixtures and malformed cases are never fetched from providers by those tests.
- Fixture names and IDs explicitly include `fixture`; the tests assert these IDs. They are not evidence of current provider state or production connection.
- The fixture set does not carry a complete, machine-readable capture manifest with original provider URL, retrieval time, source revision, checksum, applicable terms snapshot, or redistribution decision. Fixture payload timestamps alone must not be interpreted as capture/retrieval timestamps.
- Live-capable requests are in API worker source and the scheduler. A source-code URL and a fixture filename are not proof that the old deployment ran or that any fixture is a production sample.
- The pinned README describes the project as a local, not production-certified foundation. Its deployment checklist marks live source/run verification steps pending. This is consistent with classifying the code as implemented but deployment/runtime evidence as unknown.

**M24-01 acceptance assessment:** At the pinned commit, the parser tests' static fixtures are visibly labelled as fixtures and are distinct from the code path capable of fetching live endpoints. The source does not justify saying the providers were live in production. The missing fixture capture/provenance manifest and the package-description ambiguity remain documentation/evidence gaps. The acceptance can be recorded as *fixture labeling verified for the inspected test set*, while any claim of deployed or historically executed provider ingestion remains **UNKNOWN**.

## Provider terms and limits (checked 2026-10-29)

These are bounded observations from official material, not legal advice or authorization to reuse the old application or redistribute provider data.

| Provider | Official material | Audit consequence |
|---|---|---|
| **USGS** | [USGS data licensing](https://www.usgs.gov/data-management/data-licensing), [USGS earthquake feeds](https://earthquake.usgs.gov/earthquakes/feed/v1.0/index.php), and [ENS disclaimer](https://earthquake.usgs.gov/ens/help_disclaimer). | USGS-authored data are generally public domain in the U.S. and USGS asks for source credit, but third-party material/restrictions can apply. The ENS disclaimer says ENS is preliminary and not an earthquake/tsunami warning system; do not generalize ENS-specific wording to every USGS product. The selected feed's own product and lifecycle terms still need rechecking before reuse. |
| **GDACS** | [Terms of use](https://www.gdacs.org/About/termofuse.aspx) and [API quick start](https://www.gdacs.org/Documents/2025/GDACS_API_quickstart_v2.pdf). | The API quick start requests GDACS acknowledgement. Terms say some alerts are automated and unreviewed, can be uncertain/incomplete/late, need validation, and do not replace designated local/national authorities. Free access is not treated here as a blanket data redistribution licence. |
| **NOAA SWPC** | [SWPC Data Access](https://www.spaceweather.gov/content/data-access), [NOAA content FAQ](https://www.noaa.gov/office-education/outreach-communication/faq). | SWPC exposes JSON products and points to NCEI for historical archive access. NOAA says most content is public domain unless annotated otherwise, requests source/program credit, and prohibits implied endorsement or presenting altered content as official. The exact product/version still needs its own source and revision review. |
| **Open-Meteo** | [Terms](https://open-meteo.com/en/terms), [licence and attribution](https://open-meteo.com/en/licence). | The free API terms limit use to non-commercial purposes, require CC BY 4.0 attribution and currently state 10,000/day, 5,000/hour, 600/minute and 300,000/month limits. The licence page requires a link next to displayed location data and identifies upstream datasets with their own licences. Project commercial classification and selected upstream model terms are not established here. |

**Quota inference, not a runtime measurement:** the source configuration can request up to 24 Open-Meteo location/product requests in one full pass (16 weather/air-quality primary calls plus up to 8 GFS weather fallback calls). At the configured minimum five-minute schedule, that is at most 6,912 Open-Meteo HTTP requests/day if every run performs the entire set and no other calls are made. This is below the current free-tier daily limit on that assumption, but manual calls, concurrent deployments, provider counting rules, term changes and actual run cadence require an owner-controlled quota gate; this arithmetic does not certify compliance.

## Gaps, decisions and task state

1. The pinned historical code does contain source adapters for all four named providers. The earlier XV-only report's “no provider adapters” conclusion applies to XV source only, not the external A-L-L-A-H snapshot.
2. Static fixture tests prove parser behavior against fixtures, not provider freshness, exact historical acquisition, data rights, or a production deployment.
3. No provider response was fetched live, no external service was exercised, and no historical runtime/deployment logs were available.
4. The differing `A-L-L-A-H` and `allah-hub` repository pins still need source-owner reconciliation; the historical repository's missing root license prevents inferring code-reuse permission.
5. **Reviewer at this follow-up:** AI technical review only. At the time, M24-01 still needed current-source reassessment and integrator acceptance; see the later scoped acceptance in [the main audit §11](M24-01-provider-audit.md#11-current-state-acceptance-revalidation-2026-10-29). AI review does not satisfy the M24 milestone human-review exit gate.
6. **Next eligible dependency:** after the scoped M24-01 leaf acceptance recorded in the main audit, M24-02 is eligible. M24-03/M24-04/M24-05 still require their own dependencies and do not gain implementation or rights approval from these findings.

## Reproduction / evidence limits

- Historical source was read through the GitHub contents/raw-file API at exact commit `47bac90cade77ee2136cb66d546156b220fe8481`; the links above are commit-pinned.
- No repository file was copied or executed. No test, typecheck, build, live database, live provider request, or deployment was run for this addendum.
- **Changed paths:** this addendum only. **Rollback:** remove this addendum; no runtime files or data were changed.
- **Result SHA:** uncommitted at the time of writing; no exact integrated result SHA is claimed.
