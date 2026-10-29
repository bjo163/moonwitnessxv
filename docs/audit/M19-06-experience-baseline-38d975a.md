# M19-06 — Experience token consumption and visual/behavior baseline

- **Task:** M19-06 (P1), depends on M19-03 and M19-05.
- **Base/source SHA:** `38d975acb7be6d404d92975585d6faf27b37645b` (detached checkout; no commit created).
- **Worker:** `/root/m19_06`.
- **Scope:** Dock Reader, Terms/Research and Studio/Story; Cockpit Operator. Existing pages only; no new route, source, data owner, API or page mock.
- **Status:** implementation and local evidence complete; TODO remains unchanged for integrator review.

## Changes

- `apps/dock/src/layouts/site.tsx` reads the existing route context and maps `/reader` (including its subroutes) to `reader`, `/terms` to `research`, and `/studio` to `story`. It emits the complete typed M19-02 token group as CSS custom properties on the existing main landmark.
- `apps/dock/src/app/globals.css` consumes the mode max width, gutters, section gap, body font/size/leading, heading font/scale, code font/scale and prose measure. The Studio heading reads the accepted display scale token instead of a local fixed size.
- `apps/cockpit/client/main.tsx` emits the `operator` token group on the existing root; `cockpit-layout.css` consumes its body font/size/leading for the current console.
- `apps/dock/test/m19-06-experience-modes.test.mjs` guards the route-to-token map and operator root consumption.
- `scripts/ui/m19-06-experience-modes.spec.mjs` covers current Dock routes in both locales; `scripts/ui/m19-06-operator.spec.mjs` covers the current Cockpit UI using Vite's read-only static preview; `scripts/ui/playwright.operator.config.mjs` keeps that run separate from the Dock server harness.

## Evidence

### Dock browser matrix

Command: `pnpm exec playwright test --config scripts/ui/playwright.config.mjs scripts/ui/m19-06-experience-modes.spec.mjs`

Result: **6/6 passed** (Chromium). Hub condition measured `offline-forced` against `http://127.0.0.1:65535/api/v1`; no Hub or public-source content was read. Reader and Terms showed their existing offline alerts. No source text or rows were injected. Assertions cover `/en` and `/id` document language and active localized route, one main/navigation/heading structure, applied computed width/type/leading, no horizontal document overflow at 1440×900 and 390×844, Reader and Research GET search form visibility/focus, and Story tab switching.

Applied typography matched the token values: Reader body 17px, h1 28px, leading 1.75; Research body 14px, h1 22px, leading 1.55; Story body 18px, display heading 56px, leading 1.8. Max-width CSS variables are `72rem`, `88rem`, `66rem`; pixel computed values scale with the app's 13px root font size. Six full-page PNGs per mode/locale are saved in `docs/audit/screens/` with names `m19-06-{reader|research|story}-{en|id}-{1440|390}.png`. These are new task-prefixed files; no tracked prior baseline screenshot was overwritten.

### Cockpit browser check

Commands: `pnpm --filter @moonwitness/cockpit build:client`; start `pnpm --filter @moonwitness/cockpit exec vite preview --host 127.0.0.1 --port 3104 --strictPort`; then `pnpm exec playwright test --config scripts/ui/playwright.operator.config.mjs scripts/ui/m19-06-operator.spec.mjs` with `UI_SCREENS_DIR` set to `docs/audit/screens`.

Result: **1/1 passed** (Chromium). Screenshot at `docs/audit/screens/m19-06-operator-offline-{1440|390}.png`. Preview used port 3104 and static built assets only; no Cockpit server, process supervisor, service actions, or reserved ports 3000–3005 were used. The test verifies `operator` root metadata, `none` measure, `100%` max width, dense density, 12px body size and computed 15.6px line height, plus the existing tab and keyboard focus behavior. API-backed console state and service controls are **not verified** by static preview.

### Focused checks

- `pnpm --filter @moonwitness/dock exec node --test test/m19-06-experience-modes.test.mjs` — **2/2 pass**.
- `pnpm --filter @moonwitness/dock typecheck` — pass.
- `pnpm --filter @moonwitness/cockpit typecheck` — pass.
- `pnpm --filter @moonwitness/cockpit build:client` — pass (Vite notes the existing output chunk exceeds its advisory 500 kB size threshold).
- Scoped ESLint and `git diff --check` — pass.

## Invariants, limitations and rollback

Locale, copy, route taxonomy, ARIA, keyboard semantics and reduced-motion CSS are not keyed to experience mode. Only existing synthetic Studio UI and current route copy appear in the captures; the image-reference set is not used. Reader/Research results are offline states, not source-backed content. Cockpit evidence is static-preview evidence and makes no claim about API-backed controls or live service state. No independent human review or accessibility certification is claimed.

Rollback by reverting only the listed Dock/Cockpit code and test files and deleting this packet, this audit and the M19-06 screenshots. No persisted data or schema changes exist.

## Actual changed paths

```text
apps/cockpit/client/cockpit-layout.css
apps/cockpit/client/main.tsx
apps/dock/src/app/globals.css
apps/dock/src/layouts/site.tsx
apps/dock/src/ui/client/GeneratorStudio.tsx
apps/dock/test/m19-06-experience-modes.test.mjs
docs/audit/M19-06-experience-baseline-38d975a.md
docs/tasks/M19/M19-06.md
scripts/ui/m19-06-experience-modes.spec.mjs
scripts/ui/m19-06-operator.spec.mjs
scripts/ui/playwright.operator.config.mjs
docs/audit/screens/m19-06-*.png (14 images)
```
