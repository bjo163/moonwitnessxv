# Audit Report: M19-28 Cockpit Operator Settings, Shortcuts & Help Manual

- **Milestone:** M19 — Frontend
- **Task ID:** M19-28
- **Status:** CLOSED [x]
- **Auditor:** Antigravity AI Engine
- **Target App:** `apps/cockpit`
- **Related ADR:** [ADR-0005](../decisions/ADR-0005-locale.md), [ADR-0008](../decisions/ADR-0008-cockpit-mission-supervisor.md)

---

## 1. Scope & Objective

Implement an accessible, in-GUI Operator Help Manual and keyboard shortcut reference, wired to keyboard trigger `?` and footer action `? Help`, fully bilingual in Indonesian and English.

---

## 2. Key Deliverables & Code Changes

1. **Help Modal Component (`apps/cockpit/client/components/CockpitHelpModal.tsx`):**
   - Implements accessible dialog (`role="dialog"`, `aria-modal="true"`).
   - Dismisses via `Escape` or clicking `CLOSE [ESC]` / `TUTUP [ESC]`.
   - Comprehensive tabular layout of all workstation keybindings:
     - `Space`: Play / Pause media playback
     - `m` / `M`: Mute / Unmute audio
     - `[`: Previous media channel
     - `]`: Next media channel
     - `p` / `P`: Picture-in-Picture video toggle
     - `1`: Switch to Terminal & Logs tab
     - `2`: Switch to In-App Web Preview tab
     - `3`: Switch to Media & IPTV Player tab
     - `4`: Switch to Error Ledger tab
     - `5`: Switch to Network & Ports tab
     - `6`: Switch to Mission Progress tab
     - `` ` `` / `~`: Quick-toggle between Logs and Media
     - `?`: Open this operator manual dialog

2. **Footer Trigger (`apps/cockpit/client/components/CockpitFooter.tsx`):**
   - Displays clickable accessible button: `<button onClick={onOpenHelp}>? {copy.shortcutHelp}</button>`
   - `shortcutHelp`: `'Help'` / `'Bantuan'`
   - Runtime indicators: `'Fastify v5 + Vite + HLS.js // Moondeck XV Engine'`

3. **In-GUI Language Switcher (`apps/cockpit/client/components/CockpitTopBar.tsx`):**
   - Direct button `[ ID ]` / `[ EN ]` in TopBar right toolbar.
   - Triggers haptic feedback (`triggerHaptic('switch')`).
   - Cycles between `'id'` and `'en'` with zero page reloads.

4. **Verification:**
   - Vitest/Node test verified `getCockpitCopy` behavior, fallback safety, and string integrity.
