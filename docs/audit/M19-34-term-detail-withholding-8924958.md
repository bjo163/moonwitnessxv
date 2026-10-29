# M19-34 — Anonymous term-detail withholding matrix

**Result: partial evidence; M19-34 remains open.** This audit verifies the public route fails closed while no approved D08 projection exists. It does not claim that the withheld detail page's layout is visually accepted.

## Baseline and result

- Branch: `dev`.
- Baseline: `cee2cdad3588be6c3432e3d92635c46e395b6432`.
- Exact source/test SHA: `8924958ad48eb3f748bb43f855bafd3b7b919b5c`.
- Changed path: `scripts/ui/m19-34-term-detail-withholding.spec.mjs`.
- The local evidence Hub ran in memory on loopback with the existing seeded UNILEX registry. A throwaway test admin password was supplied through `MOONQL_AUTH_ADMIN_PASSWORD`; no real credential was used.

## Checks and observed results

- `UI_PORT=3123`, `UI_HUB_URL=http://127.0.0.1:3122/api/v1`, and `UI_SCREENS_DIR` in the OS temp directory; `pnpm exec playwright test --config scripts/ui/playwright.config.mjs scripts/ui/m19-34-term-detail-withholding.spec.mjs` — **2 passed, 0 failed**. Each locale case checks 390×844, 768×1024, 1440×900, and 1920×1080 (eight locale/viewport combinations total).
- In each locale case, the test first confirms the loopback service identity is `M19-34 Evidence Hub`, admin login succeeds, and an authorized request for seeded `P001` returns 200. It then sends the same request without authorization and observes 401. The public Dock page resolves to the localized 404 and renders no `.dk-terms-detail`, `.dk-terms-sources`, or `.dk-terms-reviews` container at any of the four viewports.
- `pnpm exec eslint scripts/ui/m19-34-term-detail-withholding.spec.mjs` — passed with no diagnostics.
- `git diff --check -- scripts/ui/m19-34-term-detail-withholding.spec.mjs` — passed.
- The pre-commit hook ran `pnpm ui:check`: 140 files scanned, 0 violations.
- Independent AI code review found no blocker in the final test. It is a technical review, not human QA sign-off.

## Security, privacy and limitations

- The spec requires an `http:` loopback URL (`127.0.0.1` or `localhost`), exact `/api/v1` path, and the expected local evidence-Hub service identity before sending the throwaway password. The password and returned bearer token remain in the test process; the response body containing the term is not parsed, logged, captured, or written to evidence.
- The UI browser request uses Dock's no-token server SDK. The test proves the API's admin-positive/anonymous-negative behavior and the public withholding state; it does not release or copy the source term.
- This is a responsive **withholding** check, not screenshot/geometry/overflow evidence for an approved detail page. It covers one seeded identifier, not a positive public term-detail rendering.
- M19-19's public Graph/Ontology denial gap remains unresolved; the ARSY denial matrix still has its documented skip. Cross-app locale suites were not rerun at this SHA. No production Hub, data, deployment, or CI result is claimed.
- M19-34 stays open. Do not infer approval to publish UNILEX details from this test.

## Rollback

Remove `scripts/ui/m19-34-term-detail-withholding.spec.mjs` and this report. No app runtime behavior or persistent data changed; the evidence Hub was in-memory and stopped after the test.
