# MoonUI Component Behavior Bible

**Status: VERIFIED & SHIPPED (M19-32, M30-01, M30-02, M30-03)**  
Single Source of Truth: `packages/moonui/moon.css`, `packages/moonui/src/`, and `packages/moonui/src/client/`.

---

## 1. Design Token Constancy (Zero Drift)
All MoonWitness surfaces (Dock, Headquarters, Cockpit, etc.) strictly draw visual tokens from `@moonwitness/moonui`:
- **Palette**: `ink` (`#07060b`), `night` (`#0b0912`), `paper` (`#0d0b14`), `surface` (`#13101d`), `surface2` (`#1b172a`), `fg` (`#f7f4ec`), `pink` (`#ff007a`), `cyan` (`#00d4ff`), `accent` (`#ffd400`), `ok` (`#00e676`), `moon` (`#9d4edd`), `muted` (`#9e96b0`).
- **Glows**: `--pink-glow`, `--cyan-glow`, `--accent-glow`, `--ok-glow` (45% alpha radial/box shadows).
- **Fonts**: `--font-sans` (`Inter`), `--font-display` (`Impact`/`Anton`), `--font-zine` (`Comic Sans MS`/`Segoe Print`), `--font-mono` (`JetBrains Mono`).
- **Spacing**: `--s1` (4px), `--s2` (6px), `--s3` (12px), `--s4` (20px), `--s5` (32px), `--ctl` (30px).

Linter enforcement: `pnpm ui:check` scans all app surfaces and fails on any arbitrary hex color, duplicate class, or typography drift.

---

## 2. Server-Safe Primitives (`@moonwitness/moonui`)
Exported from `packages/moonui/src/index.ts`. Safe for Server-Side Rendering (SSR) and Server Components:

### Buttons & Controls
- `<Button>`: Native button semantics, supports sizes `sm`, `md`, `lg` and variants `primary`, `accent`, `cyan`, `paper`, `ghost`, `danger`, and `cyber`. Supports `loading` state (`aria-busy="true"` + inline spinner + `disabled`). Supports physical micro-haptics when clicked in client contexts.
- `<LinkButton>`: Anchor styled identically to button. Supports `variant` and optional micro-haptics.
- `<Toggle>`: Accessible native checkbox wrapper with physical relay haptics on change.
- `<Field>`: WAI-ARIA form field coupling `label`, `hint`, and `error` with target inputs via `htmlFor`.
- `<TextInput>`, `<Textarea>`, `<SelectInput>`: Standardized inputs with tokenized borders, focus rings, and affix slots.

### Cyberpunk & Tactical Feedback
- `<Tooltip>`: Lightweight hover/focus label with `role="tooltip"`, monospace styling, and position modes (`top`, `bottom`, `left`, `right`).
- `<Skeleton>`, `<CardSkeleton>`, `<TableSkeleton>`: Low-contrast shimmer placeholders (`aria-hidden="true"`) preventing layout shifts during async data loading.
- `<GlitchText>`: High-contrast chromatic glitch typography replicating cyber-dystopian terminal headers via `data-text` pseudo-elements.
- `<CyberFrame>`: HUD container featuring glowing corner brackets in `cyan`, `pink`, `accent`, or `ok`.

### Navigation & Layout
- `<Tabs>`: WAI-ARIA roving `tabIndex` (`0` for active, `-1` for inactive) with full keyboard arrow navigation (`ArrowRight`/`ArrowDown`, `ArrowLeft`/`ArrowUp`), `Home` (first tab), `End` (last tab), and optional switch haptics.
- `<Nav>`, `<TabBar>`, `<UserChip>`: Structured navigation primitives.
- `<Card>`, `<CardHeader>`, `<CardBody>`, `<Panel>`, `<Badge>`, `<EmptyState>`, `<DataTable>`.

---

## 3. Client Interactive & Sensory Primitives (`@moonwitness/moonui/client`)
Exported from `packages/moonui/src/client/index.ts`. Client-only (`'use client'`):

### Modal & Dialogs
- `<Modal>`: Accessible tactile modal with backdrop blur, `role="dialog"`, `aria-modal="true"`, accessible focus trapping, focus restoration on unmount, and `Escape` handle.
- `<AlertDialog>`: High-risk confirmation dialog (`role="alertdialog"`) with tone modes (`danger`, `accent`, `ok`), explicit confirmation/cancel actions, and focus guard.

### Micro-Haptics & Audio Feedback
- `triggerHaptic(pattern)`: Couples Web Audio synthesized clicks/relays with physical device vibration (`navigator.vibrate`) in 0KB network payload. Patterns: `tap` (8ms), `switch` (15ms), `alert` ([20ms, 40ms, 20ms]), `error` ([40ms, 60ms, 40ms, 60ms, 40ms]), `tuning` (5ms).
- `playUiSound(type)`: Real-time Web Audio API oscillator tone generator (`click`, `toggle`, `relay`, `alert`, `tuning`).

### Toast Notifications
- `<ToastProvider>`, `<ToastContainer>`, `useToast()`: Global floating notifications with tone borders (`ok`, `pink`, `cyan`, `accent`), auto-dismissal, dismiss haptics, and click-to-close.

### Audio & Telemetry Visualizers
- `<AudioSpectrum>`: HiDPI neon FFT frequency spectrum visualizer. Binds to Web Audio `AnalyserNode` or renders synthetic ambient radio pulse.
- `<AudioVisualizer>`: Multifunction phosphor visualizer supporting `bars`, `oscilloscope`, and circular `radar` modes.
- `<SMeterGauge>`, `<AnalogTuner>`, `<LivingBackdrop>`, `<MtsTelemetryClock>`.

---

## 4. Verification & Testing
The test suite in `packages/moonui/test/` runs natively under Node 24:
```bash
pnpm --filter @moonwitness/moonui test
pnpm ui:check
```
All components are certified for WAI-ARIA accessibility, keyboard traversal, token purity, and zero visual drift.
