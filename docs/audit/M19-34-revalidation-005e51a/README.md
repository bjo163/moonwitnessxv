# M19-34 — Cross-app Indonesian/English accessibility and copy revalidation

Status: exact-SHA verification evidence reviewed by the primary integrator and accepted for M19-34 closure. This audit does not certify a production deployment.

## Baseline and provenance

- Source SHA: `005e51ab4248b5dee91061ed39bc22e630afe7d4` (detached, clean checkout before verification). Remote `dev` and `main` both pointed to this SHA.
- Worker: independent Codex subagent for the verification run; primary integrator reviewed this report and the exact-SHA evidence.
- Result SHA: `005e51ab4248b5dee91061ed39bc22e630afe7d4`; evidence and status are recorded in an evidence-only follow-up commit, with no app runtime source changes.
- CI run [40808906291](https://github.com/bjo163/moonwitnessxv/actions/runs/40808906291) passed monorepo build, lint, generated-SDK check, tests and web builds; the promotion job fast-forwarded `main` to the same SHA.
- Runtime: Node `v24.22.1`, pnpm `10.33.4`; workspace dependencies were installed from the local pnpm store and built before package-level checks.
- Browser and UI fixtures were synthetic, offline, or in-memory. No production credential, live Hub, or rights-bearing source material was used.

## Exact-SHA results

| Surface | Command | Result at `005e51a` |
|---|---|---|
| Cockpit locale/browser | `pnpm --filter @moonwitness/cockpit exec node --test test/m19-34-locale-browser.test.mjs` | 2/2; typecheck passed. |
| Cockpit catalog | `pnpm --filter @moonwitness/cockpit exec tsx --test test/locale.test.ts test/locale-usage.test.ts` | 6/6. |
| Headquarters locale/auth | `pnpm --filter @moonwitness/arsy exec tsx --test ../../apps/headquarters/test/login-locale.test.ts ../../apps/headquarters/test/shell-locale.test.ts ../../apps/headquarters/test/hq-authz-guard.test.ts ../../apps/headquarters/test/locale-preference.test.ts ../../apps/headquarters/test/hq-locale-regression.test.ts ../../apps/headquarters/test/editor-actions.test.ts` | 47/47; typecheck passed. |
| Headquarters browser | `pnpm --filter @moonwitness/arsy exec node --test ../../apps/headquarters/test/hq-locale-e2e.spec.mjs` | 1/1. |
| Dock locale/accessibility | `pnpm --filter @moonwitness/dock exec node --test test/locale-routes.test.mjs test/locale-href-contract.test.mjs test/locale-boundary-coverage.test.mjs test/states-copy-parity.test.mjs test/landing-copy.test.mjs test/landing-copy-required-keys.test.mjs test/landing-copy-english.test.mjs test/responsive-accessibility.test.mjs` | 55/55; typecheck passed. |
| Dock rendered script/direction | `pnpm --filter @moonwitness/arsy exec tsx --tsconfig ../../apps/dock/tsconfig.json --test ../../apps/dock/test/m19-05-reader-render.test.tsx` | 4/4, including Chromium computed direction/alignment; this task was also exercised by the successful exact-SHA CI. |
| Dock visual/accessibility matrix | `pnpm exec playwright test --config scripts/ui/playwright.config.mjs scripts/ui/visual.spec.mjs` with `UI_PORT=3156`, `UI_SCREENSHOT=viewport`, and an external `UI_SCREENS_DIR` | 44 passed, 1 skipped. It recorded 32 locale/viewport records (390, 768, 1440, 1920 × id/en) and 8 reduced-motion records; maximum horizontal overflow, clipped elements and interactive elements outside the viewport were all zero. One skip is the existing term-detail capture because the offline index has no stable public term id. Keyboard and telemetry checks passed. [Geometry](M19-34-revalidation-005e51a/dock-geometry.json). |
| ORBIT browser | `pnpm --filter @moonwitness/orbit exec node --test test/orbit-locale-browser.test.mjs` | 1/1; typecheck passed. |
| ORBIT suite | `pnpm --filter @moonwitness/orbit test` | 89/89. |
| ARSY/public denial | `pnpm --filter @moonwitness/arsy exec tsx --test test/public-projection-denial.test.ts` | 16/16, zero skipped. Anonymous Graph, Ontology and Research projections were denied; admin controls retained their intended access. This is containment evidence and does not grant D08 publication approval. |
| Anonymous term-detail withholding | `pnpm exec playwright test --config scripts/ui/playwright.config.mjs scripts/ui/m19-34-term-detail-withholding.spec.mjs` against the local ephemeral evidence Hub | 2/2 locale cases. Each case verified seeded admin request 200, anonymous API 401, localized 404 and no detail/source/review DOM at all four viewport widths (eight combinations). |
| Withholding-page geometry | `pnpm exec playwright test --config scripts/ui/playwright.config.mjs scripts/ui/m19-34-withholding-geometry.local.spec.mjs` | 8/8 locale/viewport cases; zero horizontal overflow, zero visible elements outside viewport, one main and heading, and zero term detail/source/review containers. The probe did not read or log term text. [Metrics](M19-34-revalidation-005e51a/withholding-geometry.json). |

The visual screenshot set was written outside the worktree to `Z:\project\mw-m19-34-evidence\dock-matrix-005e51a`; the directory exists and contains 40 PNGs plus `geometry.json`. The matrix JSON included in this audit records the exact `runHead` and offline condition. The geometry probe source is preserved as [withholding-geometry.probe.mjs](../../../scripts/ui/m19-34-withholding-geometry.local.spec.mjs). It was run as a temporary local-only probe against the exact app SHA and is not registered in the repository test command; it reads no term text. The probe run used local environment variable names `UI_PORT`, `UI_HUB_URL`, `UI_SCREENS_DIR`, `TEMP`, and `TMP`; values and credentials are intentionally omitted. The separate in-memory evidence Hub used `MOONQL_AUTH_ADMIN_PASSWORD`, `ARSY_TITLE`, `RADIO_TITLE`, `API_TITLE`, `ARSY_PORT`, `RADIO_PORT`, `PORT`, and `EVIDENCE_HUB_PORT`; no values were recorded.

## Scope, privacy and remaining boundary

The cross-app current-state matrix now covers Dock, Headquarters, Cockpit, and ORBIT in Indonesian and English; ARSY denial is checked separately with no skip. The old Dock detail skip is resolved for the *withheld* state: responsive geometry of the localized 404 was measured across all eight locale/viewport combinations, and no protected detail markup appeared.

No approved D08 public term projection exists. Therefore no positive public term-detail page was fabricated or measured, and this audit makes no claim about that unpublished page's geometry or rights. The M19-19 denial tests now pass; M19-19 remains open for its broader release/projection DoD. This cross-app verification does not close M19-19 or authorize publication.

Actual changed files for this verification record: this audit folder and the reproducibility probe at `scripts/ui/m19-34-withholding-geometry.local.spec.mjs`. No application source, identity behavior, API contract, data owner, or persistence changed.

## Closure assessment and rollback

Evidence satisfies M19-34's current-app locale/accessibility matrix and its negative anonymous-public-read requirement at the exact promoted SHA. The primary integrator reviewed the exact SHA, commands, metrics and scope; this is a technical review and not an independent human QA certification. No public term-detail acceptance is claimed.

Next eligible task: inspect the remaining M19-03 public IA/search parent scope before selecting its next leaf. Do not treat this verification task as approval to publish term details.

Rollback removes only this audit folder and the local-only geometry probe. No runtime source, persistent data, identity, API behavior or release decision changed.
