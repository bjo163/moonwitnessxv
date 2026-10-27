# UI2-G03 operator-security audit — Cockpit preview URL, origin policy, kill/free-port confirmations

**Scope:** [todo-ui-2.md](../../todo-ui-2.md) gate **UI2-G03** (line 32, P1 · D2 · depends G01 · Operator security · file scope `apps/cockpit/client/components/CockpitPreviewView.tsx; test/`): "Audit local Cockpit iframe URL security/origin policy, shortcuts and kill/free-port confirmations. **DoD:** documented allowlist/user consent; negative URL and destructive-action tests."
**Nature:** read-only audit. Nothing was fixed, no checkbox was ticked, no source or test file was edited.

## 0. Baseline

| Item | Observed |
|---|---|
| Branch | `dev` — no topic branch created (Owner Policy) |
| HEAD | `49ec20e` (`docs(todo): close UI2-G11 with the current M38/M39 status snapshot`) |
| Cockpit-relevant HEAD ancestors | `9e89759` (log-frame fix + real port listeners), `97f1d6a` (control-plane trust), `9c70fbe`, `2559b42` |
| Working tree at start | not clean: other sessions' uncommitted `apps/arsy/src/*`, `apps/orbit/src/*`, `apps/skylink/src/modules/routes.ts`, `docs/audit/screens/*.png` plus untracked `apps/arsy/src/lib/skylink.ts`, `apps/arsy/test/skylink-client.test.ts`, `apps/orbit/src/lib/handoff/`, `docs/audit/M38-12-*.md`. **None were touched.** |
| Files written | this file only |
| Commands actually run | `git rev-parse`, `git status --porcelain`, `git log --oneline`, `git show --stat 9e89759`, `ls`, `find`, `grep`, `sed`/`wc` for reading, `cat apps/cockpit/package.json`, and `tsx --test test/security.test.ts` from `apps/cockpit` (§6). |
| Commands deliberately **not** run | no dev server / no cockpit start, no `pnpm verify`, no `pnpm lint`, no build, no `free-ports.mjs`, no `POST /api/ports/free`, no `/api/services/*` call against a live process, no `git add/commit/push/stash/checkout/restore/clean`. No process was killed and no port was freed. All destructive-path findings below are **static-reading evidence**, not executed proof. |
| Placeholder convention | ports/hosts are written as `http://127.0.0.1:<port>`; no real operator host, `.env` value or token value is reproduced here. |

## 1. Preview URL data path

There is **no validation anywhere on this path** and there is **no single choke point**: the same unvalidated string reaches five independent navigation sinks.

1. Free-text entry — `CockpitPreviewView.tsx:39-49`. `<TextInput value={previewUrl} onChange={(e) => setPreviewUrl(e.target.value)}>`; MoonUI's `TextInput` is a bare `<input>` with no `type="url"` and no sanitisation (`packages/moonui/src/form.tsx:95-121`).
2. State — `App.tsx:136` `useState('')`; nothing normalises it. It is never persisted (no storage write in `apps/cockpit/client`).
3. Sink A (imperative) — `CockpitPreviewView.tsx:44-47`: Enter key does `previewFrameRef.current.src = previewUrl`.
4. Sink B/C — GO `:50-58` (`:54`) and Reload `:59-67` (`:63`), both `previewFrameRef.current.src = previewUrl`.
5. Sink D — external window `:68-74`: `window.open(previewUrl, '_blank')` (`:71`), second feature argument only, no `noopener`/`noreferrer`.
6. Sink E (declarative) — `:92-97` `<iframe ref={previewFrameRef} className="preview-iframe" src={previewUrl} title={copy.iframeTitle} />`. No `sandbox`, no `referrerPolicy`, no `csp`, no `allow`.
7. Shortcut chips — `:20-25` map `config.services` (non-worker, `port !== undefined`, truthy `url`) to chips, each `onClick={() => openPreview(s.url)}` (`:84`).
8. `openPreview` — `App.tsx:467-473`: `setPreviewUrl(url)` + `setActiveTab('preview')` + `previewFrameRef.current.src = url` when the frame is mounted (it is unmounted on other tabs, `App.tsx:614-623`, so the declarative `src` is the fallback write).
9. Default value — `App.tsx:477-481`: first service with a `url` seeds `previewUrl`, so the frame loads a config-derived URL without any operator keystroke.
10. Other callers of the same sink: `CockpitSidebar.tsx:185-195` and `CockpitPortsView.tsx:98-102` (`openPreview(row.url)`), plus the cockpit's own self row built client-side at `CockpitPortsView.tsx:46-53`.

**Origin of the shortcut/default URLs:** `DEFAULT_CONFIG.services[].url` are repo-authored loopback literals from the shared `PORTS` map — `apps/cockpit/src/config.ts:27,38,49,62,77,90,101,112` over `packages/core/src/workspace.ts:16`. `loadMoondeckConfig` (`config.ts:121-151`) may replace them wholesale from a `moondeck.config.*` file found on disk (`config.ts:125-130`) with no schema or host check. So the chips are operator-trusted, not attacker-trusted — this is **not** a finding. The free-text field is.

**Contrast that proves the gap is an omission, not a design:** the media path does validate — `server.ts:282-290` requires `new URL()` to parse and restricts `parsedUrl.protocol` to `http:`/`https:` before storing a channel. The preview path performs neither step, and it is the path that drives a live top-level-capable frame.

## 2. Origin / frame-boundary policy

**Server-side trust (exists, and is good):** loopback regexes at `server.ts:18-19`; CORS allows only loopback origins (`:73-77`); a `preHandler` (`:79-102`) checks Host against `LOOPBACK_HOST`, rejects a foreign `Origin`, and requires the `x-moondeck-token` echo — but **only for `MUTATING_METHODS`** (`:21`, `:80`). GETs are ungated by Host/Origin, and `GET /api/config` returns the boot token plus the full service/port topology (`server.ts:220`). Loopback bind is confirmed at `apps/cockpit/src/index.ts:16` (`host = '127.0.0.1'`).

**Frame boundary:** `grep` over `apps/cockpit` (ts/tsx/js, excluding `node_modules`/`dist`) for `postMessage`, `addEventListener('message')`, `onmessage` returns **zero matches**. There is therefore no parent↔preview message channel, and consequently **no missing-origin-check finding to make** — the "origin policy" for the preview frame is entirely "the browser's default, plus nothing this repo wrote".

**What is actually missing at the boundary:**
- No response security headers anywhere in the Cockpit: `grep` for `Content-Security-Policy|security-headers|referrerPolicy|sandbox=` in `apps/cockpit` (all source, html, mjs) returns zero matches, and `scripts/security-headers.mjs` is not referenced by this app. `GET /` (`server.ts:114-123`) sends `index.html` with no `frame-ancestors`/`X-Frame-Options`, so the control-plane UI itself is frameable by any external page → clickjacking against `Stop All` / `Free Ports` (mitigated, not eliminated, by the two confirm modals).
- The preview `<iframe>` carries no `sandbox`, so the previewed document keeps popups, forms, scripts and cross-origin top-navigation of the Cockpit tab; no `referrerPolicy` (default `strict-origin-when-cross-origin`) and no `csp` attribute.
- The legacy fallback UI repeats the same pattern (`apps/cockpit/public/cockpit.js:367-383` writes `frame.src = url` and `window.open(url, '_blank)` from `previewUrlInput`; `apps/cockpit/public/index.html:109` hardcodes an unsandboxed `<iframe src="http://127.0.0.1:<port>">`). It is a fallback surface for the same gap.
- Adjacent server-side URL sink: `GET /api/metadata?url=` (`server.ts:263-272`) hands the string to `fetchIcyMetadata` (`packages/core/src/icy.ts:121-141`), which runs **layer 1 only** (`assertPublicHttpUrl`, `packages/core/src/web-fetch.ts:127-150`). The cockpit process never calls `configureEgress`, so `installedResolver` stays `null` (`web-fetch.ts:95-110`) and layer 2 never runs; `icy.ts` sets no `redirect` option, so Node follows redirects and only the first URL is judged. The repo's own stated position is the opposite: `apps/arsy/test/egress.test.ts:127` asserts `redirect === 'error'` — "a redirect is how an SSRF gate gets walked around".

## 3. Bypass list

| # | Bypass | Evidence | Severity |
|---|---|---|---|
| B1 | Any scheme accepted into the frame: no `new URL()`, no allowlist, no port-range or loopback check on `previewUrl` before it is written to `iframe.src`. `data:text/html,…` documents load in frames; `javascript:` in a frame `src`/setter is refused by current Chromium, but that refusal is **browser policy, not a control in this repo** and differs across engines. Nothing in `CockpitPreviewView.tsx` would notice if it changed. | `CockpitPreviewView.tsx:42,46,54,63,71,95`; contrast `server.ts:282-290` | **High** |
| B2 | Protocol-relative and scheme-less input is resolved against the Cockpit's own base URL, not rejected: `//<host>/…` silently previews an attacker-chosen host on the cockpit port 80/443; a bare `host/…` previews a *cockpit* path while the operator believes they are previewing a service. No normalization exists before any comparison, so no comparison is possible either. | `CockpitPreviewView.tsx:95` + `:46` (same absence) | **Medium** |
| B3 | Attacker-chosen public hosts are previewable by design with no warning and no consent step distinguishing "local loopback service" from "arbitrary internet origin"; the placeholder text (`cockpit-copy.ts:269`) advertises "Enter URL or choose preset…" and never mentions origin scope. | `CockpitPreviewView.tsx:39-74`; `cockpit-copy.ts:269-273` | **Medium** |
| B4 | Reverse tabnabbing: `window.open(previewUrl, '_blank')` with no `noopener,noreferrer`, so the opened document holds `window.opener` and can navigate the Cockpit tab (and the previewed page is the same hostile string as B1/B2). | `CockpitPreviewView.tsx:71` | **Medium** |
| B5 | Unsanboxed frame: previewed content may script, pop windows, and top-navigate the Cockpit tab; no `referrerPolicy`/`csp`/`allow`. | `CockpitPreviewView.tsx:92-97` | **Medium** |
| B6 | The Cockpit UI itself is frameable (no CSP/`frame-ancestors`/`X-Frame-Options` served) → clickjacking on the control plane from an external page on the operator's browser. | zero header matches in `apps/cockpit`; `server.ts:114-154` | **Medium** |
| B7 | DNS-rebinding reads of `GET /api/config`: the Host/Origin gate is skipped for non-mutating methods, so a rebound name can pull the boot token and the full port/service topology. Mutations from that rebound origin are still refused by the Host check (`server.ts:84-89`), which is why this is information disclosure, not control. | `server.ts:21,80,220` | **Medium** |
| B8 | Blind loopback SSRF via the media metadata probe: layer-1-only policy, no resolver installed in this process, redirects followed and never re-validated. | `server.ts:263-272`; `packages/core/src/icy.ts:126,134`; `web-fetch.ts:95-110,157-167`; `apps/arsy/test/egress.test.ts:127` | **Low-Med** (outside G03's file scope; needs its own gate) |
| B9 | No choke point to protect: five write sinks (four imperative `.src` assignments plus the declarative `src`) with no shared validator; a fix that only guards the `src` attribute would leave the Enter-key/GO/Reload/`window.open` paths open. | `CockpitPreviewView.tsx:46,54,63,71,95`; `App.tsx:471` | structural |

**Merely thin, not missing:** the loopback CORS + Host + Origin + token gate on mutations (`server.ts:73-102`) is real and negative-tested; `POST /api/services/:tag/:action` whitelists the action verb (`:415-418`) and an unknown tag simply resolves to nothing (`supervisor.ts:230-232`, `:376-379`), so the service route cannot name an arbitrary PID; channel-URL scheme validation is correct (`server.ts:282-290`).

## 4. Shortcuts / keyboard

Global handler: `App.tsx:423-465`, registered on `window` once (`:463`), and it **skips any event whose target is an `INPUT`/`TEXTAREA`/`contentEditable`** (`:426-428`), so the preview field's Enter is local to the component (`CockpitPreviewView.tsx:44-48`) and not part of a global binding.

Bindings (all `:431-460`): `Space` play/pause, `m`/`M` mute, `[`/`]` prev/next channel, `p`/`P` picture-in-picture, `1`–`6` tab switch, `` ` ``/`~` logs↔media, `?` help. **No destructive action is keyboard-bound** — no `ctrlKey`/`metaKey` combination exists anywhere in `apps/cockpit/client` (`grep` for `metaKey|ctrlKey` returns nothing), and the only other `keydown` listeners are `Escape` handlers on the two modals (`CockpitConfirmModal.tsx:34-38`, `CockpitHelpModal.tsx:22-27`). So the shortcut half of the gate is clean by absence, with two caveats worth recording:

- `P` is documented as "Jump to Ports" (`cockpit-copy.ts:400`, rendered at `CockpitHelpModal.tsx:44`) but the handler runs `togglePip()` (`App.tsx:440-441`); the `` ` `` toggle (`:454-456`) is undocumented. Operator-facing key help is therefore wrong — a trust problem, not a destructive-key problem.
- Modals close on `Escape` and the confirm modal also closes on a backdrop click (`CockpitConfirmModal.tsx:70`); the destructive confirm is a *single* click with no typed-confirmation or hold-to-confirm, so a mis-click sequence is plausible for the two actions that are gated at all (see §5).

## 5. Kill / free-port confirmation audit

**Client, five destructive entry points, two confirmed:**

| Action | Wired at | Confirmation | Target named to operator? |
|---|---|---|---|
| Stop all | `App.tsx:208-219` → `requestStopAll` | yes, modal with `isDestructive: true` | no — static catalog copy only |
| Free ports | `App.tsx:221-232` → `requestFreePorts` | yes, modal with `isDestructive: true` | no — static catalog copy only |
| Per-service stop | `CockpitSidebar.tsx:161-167` → `void controlService(svc.tag,'stop')` | **none** | n/a |
| Per-service restart | `CockpitSidebar.tsx:168-174` → `controlService(...,'restart')` | **none** | n/a |
| Start all | `CockpitTopBar.tsx:206-208`, `App.tsx:556` | none (non-destructive) | n/a |
| Clear error ledger | `useCockpitActions.ts:141-145` | native `confirm('Clear all logged errors?')` — bypasses `CockpitConfirmModal` and the id/en catalog | no |

The modal itself is sound (`CockpitConfirmModal.tsx:53-131`: `role="dialog"`, `aria-modal`, focus into the container `:44`, danger variant `:127`, irreversible note `:109-121`), but it is fed only the two fixed strings `stopAllDesc` and `freePortsDesc` (`cockpit-copy.ts:407,409`), which name *categories*, never a PID, port list or process command line.

**The consent text under-describes the action.** `freePortsDesc` promises "forcefully release ports **3000-3004**". The executed sweep is derived from the registry, not that range: `server.ts:481-493` runs `execFileSync(process.execPath, [scripts/free-ports.mjs], { stdio: 'ignore' })`, and `scripts/free-ports.mjs:27` takes `PORTS = PORTED.map(a => a.port)` = 3000–3007 (`scripts/apps.registry.mjs:24,38,52,66,80,95,110,127`; `packages/core/src/workspace.ts:16`). It additionally kills, on Windows, **every `node.exe` whose command line matches a broad dev-tree regex** — including any `--filter @moonwitness/*` wrapper — regardless of port (`free-ports.mjs:59-77`). The operator consents to less than what runs, and the per-PID stdout is discarded (`stdio: 'ignore'`, `server.ts:485`), so the only feedback is `alert(data.message)` → "Ports freed successfully" (`useCockpitActions.ts:120-122`). **Neither the target set before execution nor the killed set after execution is identified to the operator.**

**Self-termination:** the cockpit's own listen port 3004 is in `PORTED` (`apps.registry.mjs:77-80`), so the sweep includes the PID holding the control plane's socket. The registry marks cockpit `supervised: false` with the comment "The operator console must never supervise itself" (`apps.registry.mjs:83-84`), but `free-ports.mjs:27` filters on "has a port", not on `supervised` — so `POST /api/ports/free` kills the process that is serving the request. Read-only inference; not exercised.

**Signal/port allowlist:** none. `POST /api/ports/free` accepts no request parameters at all (`server.ts:481` takes `_req`), so there is no per-port scoping, no dry-run, no `--only` list, and no `EGRESS`/port allowlist concept on this route. The script jumps straight to `taskkill /T /F` / `SIGKILL` (`free-ports.mjs:86-87`), while the supervisor's own stop path is a graceful `SIGTERM` on POSIX and `taskkill /T /F` on Windows (`supervisor.ts:376-398` → `:484-495`). Two different kill policies for the same ports, and the harsher one is the un-scoped one. POSIX `SIGTERM` also leaves grandchildren alive (`child.kill` only, `:490`), so the same UI button has different blast radius per OS.

**Did `9e89759` make the destructive path safer?** Read `git show --stat 9e89759`: it touched `App.tsx`, `CockpitLogsView.tsx`, `CockpitPortsView.tsx`, `useCockpitSync.ts`, `public/cockpit.js`, `src/server.ts`, `src/supervisor.ts`, `test/security.test.ts`. Its port contribution is the `portStatus` probe — `server.ts:337-357` (built from `supervisor.isPortListening` per service, `supervisor.ts:208-212`) and the test "Ports: /api/status reports portStatus for every configured service" (`security.test.ts:125-146`). Verdict: it fixes an *observation* bug (an occupied port displayed as IDLE/FREE, commit message) and that truth is now real — but `CockpitPortsView.tsx:64-105` renders only Bound/Idle plus an Open Preview button; it does not show PIDs, and the Free Ports control lives in `CockpitTopBar` with the same static `freePortsDesc`. **The new data is never fed into the confirmation**, so the gate's "kill/free-port confirmations" requirement is unchanged by `9e89759`; its real value here is that it now *proves* the `3000-3004` copy in `freePortsDesc` is stale, since the UI already knows about 3005–3007.

## 6. Test evidence

Executed, exactly: `tsx --test test/security.test.ts` from `apps/cockpit` — **8 pass, 0 fail, 0 skipped, 1688.9 ms**:

```
✔ S1: mutating routes reject a missing token, a foreign Origin, and a rebound Host (193.4ms)
✔ S2: /assets path traversal is contained (6.1ms)
✔ M2: /api/status projects service state without lastError (540.5ms)
✔ C1: client LogEntry uses the server tag field (1.9ms)
✔ C1b: CockpitLogsView passes TerminalLine objects to TerminalViewer (0.6ms)
✔ Ports: /api/status reports portStatus for every configured service (553.7ms)
✔ C2: Ports & Preview views hardcode no ports and drop the static maps (1.8ms)
✔ L1: legacy public UI derives from /api/config and echoes the token (0.5ms)
```

Relevance to this gate:

- **Negative URL tests: none.** The only preview-related test is `C2` (`security.test.ts:149-158`), a source-text regex assertion that `CockpitPreviewView.tsx` contains no literal `:<port>` and does derive from `config.services`. It proves the opposite of what the DoD wants: it *locks in* the config-derived chip list while never asserting that `javascript:`, `data:`, `//host`, `file:`, or a non-loopback host is refused. `grep` for `javascript:|data:text/html|blob:` across `apps/cockpit` (ts/tsx/js) returns **zero matches** — no such string appears in any test or in any validator.
- **Negative destructive-action tests: none for confirmation.** `S1` (`security.test.ts:28-61`) is a genuine *authorisation* negative test for `POST /api/services/radio/stop` (missing token → 401, foreign Origin → 403, rebound Host → 403, same-origin + token → 200). Nothing asserts that `/api/ports/free` refuses a foreign Origin, nothing asserts the modal gate exists, nothing asserts `controlService` stop/restart is confirmed, and nothing asserts the copy matches the registry port set. `clearLedger`'s native `confirm` is untested too.
- **Harness gap that explains the absence:** `apps/cockpit/package.json` declares test script `tsx --test test/**/*.test.ts` and dev deps of only `@types/*`, `@vitejs/plugin-react`, `tsx`, `typescript`, `vite` — no `@testing-library/*`, no `jsdom`, no `playwright` (`grep` for those in the manifest: no matches). A negative test that renders `CockpitPreviewView` and asserts a refused URL cannot be written in this app today without first adding a DOM harness — a scope decision that belongs to the fix, not this audit.
- The URL-allowlist test pattern the DoD wants already exists in the repo, as the model to copy: `apps/arsy/test/egress.test.ts:33,57,67,76,85,110,134,145` (private literals, integer hosts, compose names, own port, DNS-resolves-private, never-dialled + `redirect:'error'`, resolver install/clear).
- Not run by me: `test/cockpit.test.ts` (its `restart reports the real outcome` case drives the supervisor) and `pnpm verify`/`pnpm lint`. No live server was started; `security.test.ts` uses Fastify `inject` only and no `listen`, and it never calls `/api/ports/free` — that is why it was safe to execute.

## 7. Verdict on the two DoD clauses

**"documented allowlist/user consent" — NOT met.** No allowlist is documented anywhere in the repository for the preview surface (`grep` over `docs/audit/*.md` for an iframe/preview allowlist finds only the *recommendation* to create one, `ui2-preflight-2026-10-27.md:66`), and none exists in code: the free-text URL is written straight into five navigation sinks with zero parsing, zero scheme check, zero host/loopback or port-range policy (§1, §3 B1/B2), and no attributes on the frame (§2). The existing repo precedent that shows how narrow the omission is: `POST /api/channels` already enforces `http:`/`https:` on a URL (`server.ts:282-290`) and `packages/core/src/web-fetch.ts:127-150` already ships a policy the preview path never consults. User consent is equally absent — nothing tells the operator that the preview frame can leave loopback, and the two consents that do exist are misdescribed (§5: `freePortsDesc` vs the registry-derived 3000–3007 sweep plus the port-independent `node.exe` regex kill, with no PID/`window.opener`-safe target ever named). This document records the findings; recording them is not the same as the allowlist+consent design being in place.

**"negative URL and destructive-action tests" — NOT met.** No negative URL case exists for the preview path (zero `javascript:`/`data:`/`//` strings in any cockpit test; `C2` asserts only hardcoding hygiene), and no test asserts a destructive action requires confirmation. The one real negative test, `S1`, covers route authorisation, not the gate's subject (§6).

**G03 cannot honestly be ticked at `49ec20e`, and no checkbox was touched here.** What closing it would take, in the gate's own file scope: one exported validator used by all five sinks (absolute `http:`/`https:` only, loopback host allowlist derived from `/api/config`/`PORTS`, refuse protocol-relative and scheme-less input rather than resolving it); `sandbox`+`referrerPolicy`+`allow` on the frame and `noopener,noreferrer` on `window.open`; `frame-ancestors`/CSP on the served cockpit HTML; confirmation extended to per-service stop/restart and the ledger clear, with the modal fed a real target list (tag, port, PID from `/api/status` + `portStatus`) instead of static copy; `freePortsDesc` corrected to the registry-derived set and a `supervised: false` self-exclusion added to `free-ports.mjs`; and negative tests for refused URLs plus un-confirmed destructive actions, which first needs a DOM harness decision. B7/B8 (rebinding GET `Host` gate; layer-2/redirect policy on `/api/metadata`) sit in `apps/cockpit/src` and `packages/core`, outside G03's declared scope — they should be raised as their own gate rather than silently folded in.
