# M38-09 audit — transport-only WhatsApp adapter

- **Task:** M38-09, P0 leaf; prerequisite M38-08 is closed.
- **Baseline:** `21d5acfcc6e096a04acea0e2ca91afc4429e2777`.
- **Result:** `2112622aaac679aeffac475781f168cec49a7ad7`.
- **Worker/reviewer:** WhatsApp adapter agent; integrator reviewed package boundaries and reran focused package checks.
- **Changed paths:** moved `packages/whatsapp` to `packages/skylink-whatsapp`, updated workspace lock/package references and TypeScript references, and moved the bot handler into ARSY consumer `apps/arsy/src/channels/whatsapp.ts`.
- **Positive evidence:** `pnpm --filter @moonwitness/skylink-whatsapp test` — 3/3 passed (synthetic receive normalization, no-session send, invalid/self-message rejection); package build passed; ARSY build passed.
- **Negative evidence:** no-session send returns a clear error; self messages and messages without destination are dropped. `rg -n "HUB_ORIGIN_DEFAULT|/api/v1/|Moonwitness|MoonWitness" packages/skylink-whatsapp/src` returned no matches.
- **Security/rights/privacy:** synthetic inputs only; no live WhatsApp account, QR, credentials, or stored session. The package has no Hub URL or domain behavior.
- **Reviewer/rollback:** integrator; revert the adapter move and restore the former package/consumer factory.
- **Limitations/next:** broader ARSY test-project typecheck has known cross-app/rootDir issues; package and ARSY production builds pass. M38-10 is now eligible; it requires Telegram webhook implementation and security contract.
