# M19-04 accessibility closure evidence

Status: all scoped acceptance clauses verified on committed source; TODO closure is recorded separately and the full Cockpit suite limitation is disclosed below.

## Scope and exact source

- Task: M19-04 keyboard, focus, error announcements, and reduced-motion accessibility across Dock, Headquarters, and Cockpit.
- Implementation SHA: `8f1a239894d64510e5301afd86548456d1332fa3`.
- This source includes the Dock term-index native disclosure/focus regression from `697dc1c5c475466fad35722349d10f324ac19eee` and the Cockpit reduced-motion CSS/browser regression.
- Exact integrated CI [40805510041](https://github.com/bjo163/moonwitnessxv/actions/runs/40805510041) passed repository build, lint, SDK check, tests, and web builds on `8f1a239`; its promotion job fast-forwarded `main` and completed release publication. Descendant documentation CI [40806771237](https://github.com/bjo163/moonwitnessxv/actions/runs/40806771237) also passed and promoted `21c42388b95a75f12e844a35d9b3f13eec64e19d`.

## Acceptance evidence

- Dock: `a11y-focus.test.mjs` pins visible focus rules, native anchors and disclosures, status/error announcements, and localized empty-state copy. The Dock route audit found no additional concrete live focus failure. `responsive-accessibility.test.mjs` pins the reduced-motion overrides for cards, animation, and scroll. The full Dock suite and UI checks are covered by the exact integrated CI above; the term-index focused test passed 6/6 at its source commit.
- Headquarters: `hq-locale-regression.test.ts` covers keyboard focus outlines, reduced-motion declarations, and alert/status live regions in both locales; the test is included in the successful exact integrated CI.
- Cockpit: in a clean detached checkout pinned to exact SHA `8f1a239894d64510e5301afd86548456d1332fa3`, `pnpm --filter @moonwitness/cockpit exec tsx --test test/m19-04-modal-focus.test.mjs` passed 2/2, covering dialog focus containment/restoration and computed reduced-motion animation/transition/scroll behavior. `pnpm --filter @moonwitness/cockpit typecheck` passed, `pnpm --filter @moonwitness/cockpit build:client` passed, and scoped ESLint reported zero errors with one existing `max-lines-per-function` warning.
- Independent review: one read-only Dock route audit found no additional concrete live focus defect; a separate review verified that the active Cockpit stylesheet and computed-style probe exercise the reduced-motion rule; a final cross-slice readiness review accepted closure after clean exact-SHA focused browser verification.
- Security, rights and privacy: no new data reads, public projections, identity behavior, or rights-bearing source were introduced by this task. Raw mandate endpoint ACL remains tracked separately by M27-16.

## Limitations

- The full Cockpit package suite at exact SHA `8f1a239` passed 47/48. Its only failure was the server-side `/api/errors` supervisor-ledger path assertion (`the ledger must read the file the supervisor writes`) in `apps/cockpit/test/cockpit.test.ts`, outside M19-04 accessibility behavior. The focused M19-04 browser tests passed cleanly.
- The shared developer worktree has separate uncommitted Cockpit media/progress work, whose local locale audit has 11 unmatched progress keys. Those files were excluded from the tested source SHA and were not used as M19-04 evidence.
- No human accessibility certification is claimed; the independent reviews were AI technical reviews.

The canonical TODO checkbox is checked only after this evidence was reviewed against the M19-04 packet. Rollback of the final reduced-motion slice is limited to commit `8f1a239894d64510e5301afd86548456d1332fa3`.
