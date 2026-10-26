# ADR-0008: Cockpit Mission Supervisor Architecture, Technician Console, and Bilingual State

- **Status:** ACCEPTED
- **Date:** 2026-10-27
- **Deciders:** MoonWitness XV Core Engineering, Operator Experience Lead
- **Scope:** `apps/cockpit`, `packages/moonui`, Developer Operations, Local Supervision

---

## 1. Context & Problem Statement

MoonWitness XV is composed of multiple autonomous microservices running on local ports:
- **Radio Backend** (`port 3000`): Fastify API, Audio metadata engine, MoonQL
- **AI Gateway** (`port 3001`): Local AI research agent proxy, cascading fallback router
- **Sentinel Telemetry** (`port 3002`): Multi-platform spectrum radar, health monitoring
- **Headquarters App** (`port 3003`): Unified administration workspace
- **Dock Web Surface** (`port 3004` / dev fallback): Public radio, zine, and broadcast web frontend
- **Cockpit Technician Console** (`port 3004` production / `port 5173` dev): Operator mission supervisor

Before milestone **M19-25–M19-30**, Cockpit operated as an internal English-only developer utility with unconfirmed destructive actions (`Stop All`, `Free Ports` killing OS processes without confirmation), lacking accessibility dialog semantics, lacking an in-app shortcuts guide, and missing compliance with the repository-wide bilingual mandate established in [ADR-0005](ADR-0005-locale.md).

We needed an authoritative decision defining:
1. The architectural role of Cockpit as a mission supervisor (not a public client, not a second Hub, not a SQL owner).
2. The technician UX paradigm: brutalist cyber-tactical interface, CRT shader, zero latency, offline-first operation.
3. The client-side bilingual localization model conforming to ADR-0005 for single-page applications without server routing.
4. The safety model for destructive operations via accessible modal dialogs (WAI-ARIA `role="alertdialog"`).
5. The operator help system and keyboard shortcut scheme (`?`, `Space`, `1-6`, `M`, `[`, `]`, `P`).

---

## 2. Decision Drivers

- **ADR-0005 Compliance:** Equal prominence for Indonesian (`id`) and English (`en`), with zero machine translation and 1:1 catalog parity.
- **Architectural Boundary:** Cockpit is an operational observer and supervisor. It reads `TODO.md` directly via the read-only `ProgressTracker` and controls child processes via `ProcessSupervisor`. It owns no database tables and does not replicate ARSY (ADR-0001).
- **Safety & Operator Protection:** Destructive actions (`Stop All`, `Free Ports`) must prompt for operator confirmation via a modal with keyboard trap and Escape dismissal.
- **Accessibility & Power-User Ergonomics:** All views reachable via single keystrokes (`1`–`6`), audio operable without mouse (`Space`, `m`, `[`, `]`, `p`), and a discoverable help modal (`?`).
- **Data Invariance:** Machine service tags (`radio`, `dock`, `hq`, `ai`, `sentinel`), CLI flags (`moon status`, `moon free-ports`), port numbers, log stream payloads, and error file paths (`dev-errors.log`) must NEVER be translated.

---

## 3. Decision

### 3.1. Architectural Role & Boundary
- `apps/cockpit` is the **Mission Supervisor & Technician Console**.
- It exposes a Fastify backend providing process control (`/api/services/:tag/:action`), log streaming, channel lists, error ledger access, and read-only progress analytics (`/api/progress`, `/api/todo/tasks`).
- It serves a Vite-bundled React single-page application at root `/`.

### 3.2. Bilingual State & Storage (`useCockpitLocale`)
- Unlike `apps/dock` which uses URL route prefixes (`/id/...` and `/en/...`), Cockpit is a local SPA. It persists the operator's locale choice in browser `localStorage` under key `mw_cockpit_locale`.
- Permitted locales: `'en'` (default for international technicians) and `'id'` (Bahasa Indonesia).
- An explicit in-GUI toggle button in `CockpitTopBar` allows instantaneous language switching with zero network roundtrips.
- The copy catalog `COCKPIT_COPY` (`apps/cockpit/client/lib/cockpit-copy.ts`) maintains exact 1:1 key parity between English and Indonesian across all sections: TopBar, Sidebar, Tabs, Logs, Preview, Media, Ports, Ledger, Progress, Confirmations, and Help.

### 3.3. Accessible Modal Dialogs
- **Confirmation Modal (`CockpitConfirmModal`):**
  - Implements WAI-ARIA `role="alertdialog"`, `aria-modal="true"`.
  - Used for `stopAll` and `freePorts`.
  - Traps focus on the primary action button, dismisses on `Escape` or backdrop click.
  - Clear distinction between destructive actions and normal actions.
- **Help Modal (`CockpitHelpModal`):**
  - Implements WAI-ARIA `role="dialog"`, `aria-modal="true"`.
  - Accessible via `?` key or footer link `? Help` / `? Bantuan`.
  - Lists all keyboard shortcuts with `<Kbd>` components.

### 3.4. Technical Tokens Invariance
- Service identifiers: `radio`, `dock`, `hq`, `ai`, `sentinel`.
- Ports: `3000`, `3001`, `3002`, `3003`, `3004`, `5173`.
- CLI commands: `moon status`, `moon free-ports`, `pnpm dev`.
- System file paths: `dev-errors.log`, `TODO.md`.
- Raw log lines streamed from services remain verbatim in their original format.

---

## 4. Consequences

### Positive
- Cockpit provides a unified, safe, bilingual mission control interface for developers and operators.
- Unintentional process termination is prevented by required confirmations.
- Full parity between Indonesian and English user experience.
- Automated tests verify catalog key parity, fallback behavior, and machine token invariance (`test/locale.test.ts`).

### Negative / Trade-offs
- Adding new UI elements to Cockpit requires updating both `en` and `id` branches of `COCKPIT_COPY` to maintain test compliance.
