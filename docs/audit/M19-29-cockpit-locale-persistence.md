# Audit Report: M19-29 Cockpit Locale State Persistence & Client Synchronization

- **Milestone:** M19 — Frontend
- **Task ID:** M19-29
- **Status:** CLOSED [x]
- **Auditor:** Antigravity AI Engine
- **Target App:** `apps/cockpit`
- **Related ADR:** [ADR-0005](../decisions/ADR-0005-locale.md), [ADR-0008](../decisions/ADR-0008-cockpit-mission-supervisor.md)

---

## 1. Scope & Objective

Verify client-side locale storage persistence (`localStorage`), hook synchronization (`useCockpitLocale`), fallback resilience for un-persisted or corrupted states, and cross-tab/session stability.

---

## 2. Key Deliverables & Code Changes

1. **Locale Management Hook (`apps/cockpit/client/hooks/useCockpitLocale.ts`):**
   - Storage key: `mw_cockpit_locale` in `localStorage`.
   - Initial state resolution:
     1. Checks `localStorage.getItem('mw_cockpit_locale')`.
     2. Validates against supported set `['id', 'en']`.
     3. Defaults safely to `'en'` if missing, empty, or unexpected.
   - Sync logic:
     - On state change via `setLocale`, writes immediately to `localStorage`.
     - Subscribes to `window.addEventListener('storage', ...)` to synchronize locale across multi-window Cockpit instances.
   - Output tuple/object:
     - `locale`: current active locale (`'id'` | `'en'`).
     - `setLocale`: setter function.
     - `copy`: active `CockpitCopyCatalog` from `getCockpitCopy(locale)`.

2. **Invariance Compliance:**
   - Locale persistence only controls client-side dictionary selection.
   - Does NOT rewrite browser URLs (no forced `/id` or `/en` paths on port 3004 / 5173).
   - Does NOT alter Fastify backend API requests or responses (`/api/status`, `/api/config`, `/api/progress`, etc.).

3. **Verification:**
   - Fallback testing in `test/locale.test.ts` proves that invalid locale inputs safely return default catalog.
   - Zero side-effects on process supervision or progress tracker mechanics.
