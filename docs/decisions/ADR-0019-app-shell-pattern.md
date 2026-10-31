# ADR-0019 — Single AppShell component for application chrome

**Status: ACCEPTED — owner instruction, 31 October 2026 (WIB).** This decision establishes a centralized application shell pattern for all monorepo applications.

## Context

Applications in the monorepo currently compose their own header, navigation, main content area, and footer inline. Dock implements a `SiteLayout` pattern in `apps/dock/src/layouts/site.tsx` that orchestrates these landmarks and injects experience tokens. Empire-web composes chrome inline per route, leading to duplication and inconsistent landmark structure.

[MASTER_DESIGN.md](../MASTER_DESIGN.md) establishes that layout and composition are design-system concerns, not application concerns. A centralized shell ensures consistent accessibility landmarks (single `<main>`, single `<nav>`, skip link), uniform experience token injection, and reduces the surface area for drift.

## Decision

1. **All applications MUST use `<AppShell>` from `@moonwitness/moonui`** to orchestrate header, navigation, main content area, and footer. The component owns landmark structure and experience token injection.
2. **Applications supply header, footer, and content as props.** They may not re-declare landmark anatomy (no inline `<header>`, `<nav>`, `<main>`, or `<footer>` tags at the application level).
3. **The shell is a server component.** It carries no client-side state or effects. Interactivity (toggles, menus, search) lives in child components passed as props.
4. **Experience tokens are injected via the `experience` prop.** Applications determine the experience from the route path; the shell maps it to CSS custom properties.
5. **Skip link is mandatory.** The shell renders a skip link as the first focusable element, targeting `<main id="main" tabIndex={-1}>`. Applications may customize the label via `skipToContentLabel` prop.
6. **Nav is optional.** Applications that do not need primary navigation may omit the `nav` prop.
7. **The shell enforces horizontal overflow clipping.** `overflow-x: clip` on the root prevents horizontal scroll from runaway content.
8. **Geometry and layout are shell-owned.** Applications control content within landmarks; they do not control landmark positioning, sizing, or spacing.

## Rationale

- **Consistency:** Every application presents the same landmark structure to assistive technologies.
- **Maintainability:** Shell changes (e.g., skip link styling, experience token injection) propagate to all applications.
- **Accessibility:** Skip link, landmark roles, and focus management are implemented once, correctly.
- **Separation of concerns:** Applications own content; the design system owns chrome.

## Consequences

- **Dock migration:** `apps/dock/src/layouts/site.tsx` becomes a thin wrapper that supplies header, footer, and content to `<AppShell>`. The `dk-shell`, `dk-skip`, `dk-main` classes are removed from `apps/dock/src/app/globals.css`.
- **Empire-web migration:** Both `(entry)/layout.tsx` and `(localized)/[locale]/layout.tsx` use `<AppShell>`. Inline header/footer composition is removed.
- **Other applications:** Headquarters, Orbit, Cockpit, ISP Console, Arsy, Echolog, Skylink, Sentinel adopt `<AppShell>` in subsequent milestones.
- **Testing:** `contracts.test.mjs` in each application asserts that all routes use `<AppShell>`. MoonUI's `shell.test.ts` asserts landmark structure.
- **No breaking change to content:** Pages continue to render their content; only the chrome composition changes.

## Migration pattern

```typescript
// Before: inline composition
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <a className="app-skip" href="#main">Skip</a>
      <header className="app-header">...</header>
      <main className="app-main" id="main">{children}</main>
      <footer className="app-footer">...</footer>
    </div>
  )
}

// After: AppShell
import { AppShell } from '@moonwitness/moonui'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AppShell
      header={<AppHeader />}
      footer={<AppFooter />}
      experience="reader"
    >
      {children}
    </AppShell>
  )
}
```

## Rollback

Delete `packages/moonui/src/shell.tsx` and its export from `packages/moonui/src/index.ts`. Remove `.m-shell`, `.m-skip`, `.m-shell-header`, `.m-shell-nav`, `.m-shell-main`, `.m-shell-footer` styles from `packages/moonui/moon.css`. Applications revert to inline composition. This ADR file and its test are removed last, after confirming nothing depends on them.
