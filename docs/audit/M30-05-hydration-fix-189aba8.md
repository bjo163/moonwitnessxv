# M30-05 exact-SHA visual certification — 2026-10-28

## Run identity

- Task: M30-05, `Certify behavior and screenshot tests`.
- Tested source: `dev` SHA `189aba80cce4f07d4bc98c112b5ed7d0fe7aec65`; remote `origin/dev` matched. `origin/main` was last observed at `32060943102120428bff26849601c2c760f851ca`.
- Runtime: Node `v24.22.1`, pnpm `10.33.4`.
- Checkout: isolated `C:\Users\bjo16\.codex\worktrees\m19-34-clean-run`. The harness used its own Dock server on port `3139` and wrote to `docs/audit/M30-05-hydration-fix/`; it did not overwrite the shared `docs/audit/screens/` captures.
- Hub was explicitly forced offline at `http://127.0.0.1:65535/api/v1`. Only the synthetic offline/error UI branches were exercised. No credentials, private source content, or live data were used.

## Change and checks

`MtsTelemetryClock` no longer calculates the wall clock during SSR/client's first render. It renders a stable `--:--:-- UTC` placeholder and starts telemetry in `useEffect`; phase details appear after hydration. The visual harness now fails any covered screen that logs a React hydration mismatch and includes a direct UTC/local toggle check.

Commands and observed results at the tested source SHA:

| Command | Result |
|---|---|
| `pnpm --filter @moonwitness/moonui build` | Passed. |
| `pnpm --filter @moonwitness/moonui test` | 40 passed, 0 failed, 0 skipped. Includes the stable SSR placeholder assertion. |
| `pnpm exec eslint packages/moonui/src/client/mts-clock.tsx packages/moonui/test/components.test.ts scripts/ui/visual.spec.mjs` | Passed, no diagnostics. |
| `$env:UI_SCREENS_DIR='docs/audit/M30-05-hydration-fix'; $env:UI_PORT='3139'; $env:UI_SCREENSHOT='viewport'; pnpm exec playwright test --config scripts/ui/playwright.config.mjs scripts/ui/visual.spec.mjs` | 44 passed, 0 failed, 1 skipped. |

`geometry.json` records 32 viewport/locale records and 8 reduced-motion records; 0 assertion failures, 0 hydration errors, 0 horizontal overflow, and 0 elements outside the viewport. The clock UTC/local browser check passed; keyboard checks passed with no console errors. Eight home captures saw the loading fallback during settling, but all reached a settled state (`stillLoading: false`). The test run recorded 41 screenshots (19,559,815 bytes).

## Remaining gap and disposition

The term index rendered its offline error branch and exposed no stable term ID. The harness recorded the term-detail route as a skip instead of a pass. The valid term-detail state remains unverified until a running/seeded Hub is available. An independent reviewer has not yet reviewed this exact run and artifact set. Therefore M30-05 remains open; the current evidence is not a completion claim.

The negative regression check is explicit: any React hydration mismatch on a covered matrix route fails the test. The first instrumented run at this SHA failed on 8 cases because the isolated checkout still had pre-change compiled MoonUI output; after rebuilding MoonUI at the same SHA, all covered captures had zero hydration pageerrors. The package-level SSR assertion also rejects wall-clock text in the server render. The earlier baseline run at `8137b09` recorded four hydration pageerrors.

## Security, rollback, and artifacts

- Security/rights/privacy: offline synthetic UI only; no rights-bearing source was accessed or copied.
- Rollback: revert commit `189aba80cce4f07d4bc98c112b5ed7d0fe7aec65` to restore the previous clock behavior and remove its hydration guard/test. Keep this audit as a historical record if rolling back.
- Result SHA: `189aba80cce4f07d4bc98c112b5ed7d0fe7aec65`.
- Reviewer: pending; no self-review is represented as independent approval.

[Task packet](../tasks/M30/M30-05.md) · [Machine-readable results and screenshots](M30-05-hydration-fix/geometry.json) · [Initial exact-SHA baseline](M30-05-exact-sha-8137b09.md)
