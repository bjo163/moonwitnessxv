# M19-25 — Cockpit locale scope audit

**Task:** M19-25, Audit actual Cockpit Vite UI and optional CLI help  
**Worker:** `/root/m19_25_cockpit_audit`  
**Baseline/source SHA:** `c1f828b69c81e6ab039a9606597f658d3a38a1f9`  
**Working branch:** `codex/m05-08-locale-audit-387f784`  
**Result SHA:** pending integrator commit (this artifact is uncommitted)  
**Changed path:** `docs/audit/M19-25-cockpit-locale-scope.md`

## Finding

The Cockpit is an English-only local Vite/React UI hosted by a Fastify server. The actual locale implementation does not exist at this baseline: `client/index.html` declares `lang="en"`; the React app has no locale selector, resolver, or catalog wiring. This audit records visible surfaces for the child implementation tasks. It does not change runtime code or claim bilingual behavior.

## Visible surface inventory

| Surface | Human-facing copy in scope | Values/contracts to preserve |
|---|---|---|
| Global header / `CockpitTopBar` | brand descriptor; clock/uptime/status captions; media play, pause, channel, mute, volume, player controls; Start All, Stop All, Free Ports, CRT toggle | service state/status values, runtime clock and uptime, channel metadata, volume, `start`/`stop`/`restart` action identities, port-free API action |
| Service sidebar / `CockpitSidebar` | Microservices, LIVE CONTROL, Start/Stop/Restart/Preview, PORT/TYPE/PID/UP captions | configured service names/descriptions; service tags, status enums, port numbers and PID/uptime values |
| Tab navigation (`App.tsx`) | Terminal & Logs; In-App Web Preview; Media & IPTV Player; Error Ledger; Network & Ports | tab IDs `logs`, `preview`, `media`, `ledger`, `ports`; counts |
| Logs (`CockpitLogsView`) | Filter, ALL, Search logs, Errors Only, Auto-Scroll, Clear | original log text, service tags, severity and machine log fields must not be translated |
| Preview (`CockpitPreviewView`) | Go, Reload, External, accessible iframe title; shortcut names | URL input, loopback URLs/ports, route and protocol strings |
| Media / tuner (`CockpitMediaView`, `CockpitTunerSection`) | category filters, search, playback controls, keyboard help, station list, custom stream form and validation feedback; tuner labels/help | channel names/descriptions/genre and stream content are data, not UI copy; media kinds `bgm`, `radio`, `iptv`, stream URLs, station IDs, keyboard bindings |
| Error ledger (`CockpitLedgerView`) | SOURCE/ENTRIES, Refresh, Clear Log File, empty-state message | `dev-errors.log` filename and emitted error lines are machine/source data |
| Ports (`CockpitPortsView`) | service names/descriptions and Open In Preview | numeric ports, tags, localhost URLs and bound/idle state identifiers |
| Footer (`CockpitFooter`) | visible shortcut legend and terminal toggle help | physical shortcut keys `Space`, `M`, `[`, `]`, `P`, `1–5`, `~`; product/runtime branding/version may be treated as fixed identity pending design decision |
| Launcher / `src/index.ts` | optional console guidance when starting server or desktop mode; startup failure/shutdown diagnostics | ANSI decorations, URLs, host `127.0.0.1`, port default 3004, `--open` and `-o` flags, error objects, process signals |

No separate rendered dialog or confirmation component was found in the enumerated client files. The visible mutation flows are service controls, Start All/Stop All, Free Ports, clear logs/ledger and register custom stream. If confirmations/toasts are introduced by shared MoonUI wrappers, inspect their runtime behavior in the implementation task; this source audit found no direct `confirm()`, `dialog`, or toast use in Cockpit client code. Browser-native form constraints and `alert()` in port action handling are human feedback and belong in M19-27; transport responses and console diagnostics must remain protocol/log evidence.

## Classification and follow-on boundaries

- **Translate as UI:** labels, help, placeholders, tooltips (`title` attributes), accessible names, empty states, success/failure feedback intended for the operator, and static panel descriptions owned by Cockpit.
- **Do not translate:** API paths and payload keys, tab IDs, service tags, action names, enum values, stream URLs, filenames, port numbers, process identifiers, original log/error lines, channel IDs, keyboard shortcut keys, and launcher flags.
- **M19-26:** labels, tabs/panes, state labels, tooltips and accessible names in `App.tsx` and components.
- **M19-27:** custom-stream form, validation and mutation feedback; destructive/operational action confirmations where such behavior exists or is added under its scope.
- **M19-28:** settings/help and accessible messages; determine if a settings surface is missing rather than inventing one during this audit.
- **M19-29:** locale preference selection/persistence must preserve tab/action/service identifiers and command contracts.
- **M19-30:** verify both locales, shortcut invariance and live log fidelity.

The shared locale decision is accepted in ADR-0005: Cockpit uses an accessible in-GUI selector/local preference (no forced localized URL), with English fallback. Its implementation is explicitly future work. Human UI strings should use the shared id/en contract once M05-10/M05-11 provide it.

## CLI/launcher evidence

`apps/cockpit/package.json` exposes `dev`, `gui`, `start`, build, test and typecheck scripts. `src/index.ts` checks only `--open` and `-o` to launch a desktop window; no `--help` parsing or help/usage output exists. Default operation prints the local URL and mentions `--open`; `gui` invokes the same entry point with `--open`. This console guidance is human-facing and can be localized if desired, while flags/URL/host/port remain invariant. Startup errors and shutdown logs are diagnostic output, not application UI copy. CLI help is absent, so its future optional presence should not be assumed by localization work.

## Evidence and checks

Source inspection at baseline SHA `c1f828b69c81e6ab039a9606597f658d3a38a1f9` covered `apps/cockpit/client/App.tsx`, every component under `apps/cockpit/client/components`, client `index.html`, `apps/cockpit/src/index.ts`, `launcher.ts`, `server.ts`, and `apps/cockpit/package.json`, plus ADR-0005, M19 milestone context and current TODO scope.

Focused existing check executed:

```text
pnpm --filter @moonwitness/cockpit test
```

Observed: exit code 0; 3 tests passed, 0 failed. These cover config/service initialization and Fastify API/static assets, including malformed action rejection. They do not test rendered UI strings, localization, keyboard accessibility, or CLI help. No dedicated client/UI test script or client test files were present in the inspected package inventory.

## Limitations / status recommendation

- The task packet `docs/tasks/M19/M19-25.md` is absent; M19-25 exists in TODO and the M19 milestone index. This audit therefore uses the canonical TODO wording and adjacent M19-26 packet for downstream boundaries.
- No interactive browser, screen-reader, keyboard, or locale behavior was exercised; this is source inventory plus existing package test evidence.
- No negative locale test is applicable before a locale runtime exists. Existing invalid service action test rejects the machine action but does not establish locale behavior.
- Recommend M19-25 eligible for integrator review as a scope inventory, with completion contingent on review of this artifact and its evidence. Next eligible task is **M19-26** once M05-10 is satisfied; M19-27/M19-28 remain downstream of M19-26 as listed in TODO.
- Rollback: revert this documentation-only path; no runtime/API behavior changed.
