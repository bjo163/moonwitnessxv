# M19-05 reader rendering evidence

Status: scoped acceptance passed on the exact implementation SHA below. Fixtures contain synthetic Unicode only.

## Source and checks

- Branch: `dev`
- Exact implementation SHA: `056b0bdff3ab35dd95e47135fd06f15e24241d40`
- Verification used a clean detached checkout pinned to that SHA.
- `pnpm --filter @moonwitness/arsy exec tsx --tsconfig ../../apps/dock/tsconfig.json --test ../../apps/dock/test/m19-05-reader-render.test.tsx`: **4/4 passed**. React SSR preserves script text, marks, language and direction; Chromium verifies RTL/LTR direction, Hebrew `dir="auto"` resolution, and the production Dock Arabic alignment rule.
- `pnpm --filter @moonwitness/dock exec node --test test/m19-05-script-rtl-diacritics.test.mjs`: **10/10 passed**, including negative source-contract checks.
- `pnpm exec eslint apps/dock/test/m19-05-reader-render.test.tsx`: passed with no output/errors.
- `git diff --check`: passed.
- Workspace dependency setup in the clean checkout: `pnpm install --frozen-lockfile --offline` and `pnpm --filter '@moonwitness/dock^...' --if-present build` both succeeded.

## Boundary and limitations

- Fixtures use code-point-built synthetic Arabic, Hebrew, and Greek strings; no scripture, translation, witness, or Hub data was loaded.
- The browser check validates browser directionality and the actual Arabic alignment CSS rule. It does not establish glyph/font coverage on other operating systems or provide screenshot baselines; those remain with M19-06/M19-07.
- No runtime Reader behavior, rights decision, or data projection changed. The test file is registered in the root `pnpm test` chain; integrated CI is expected to verify that registration on the closure commit.

Rollback: remove `apps/dock/test/m19-05-reader-render.test.tsx`, its root test-chain entry, this packet, and this evidence file; revert the M19-05 TODO row.
