# ADR-0019 — Single AppShell component for application chrome

**Status: PROPOSED — pending owner review.** This decision establishes a centralized application shell pattern for all monorepo applications.

## Context

Applications in the monorepo currently compose their own header, navigation, main content area, and footer inline. Dock implements a `SiteLayout` pattern in `apps/dock/src/layouts/site.tsx` that orchestrates these landmarks and injects experience tokens. Empire-web composes chrome inline per route, leading to duplication and inconsistent landmark structure.

[MASTER_DESIGN.md](../MASTER_DESIGN.md) establishes that layout and composition are design-system concerns, not application concerns. A centralized shell ensures consistent accessibility landmarks (single `<main>`, single `<nav>`, skip link), uniform experience token injection, and reduces the surface area for drift.

## Decision

1. **All applications MUST use `<AppShell>` from `@moonwitness/moonui`** to orchestrate header, navigation, main content area, and footer. The component owns landmark structure and experience token injection.
2. **Applications supply header, footer, and content as props.** They may not re-declare **top-level** landmark anatomy (no inline `<header>`, `<nav>`, `<main>`, or `<footer>` tags at the application root level). Applications may use semantic landmarks **within** the content area for nested structures (articles, sections, sidebars).
3. **The shell is a server component.** It carries no client-side state or effects. Interactivity (toggles, menus, search) lives in child components passed as props.
4. **Experience tokens are injected via the `experience` prop.** Applications determine the experience from the route path; the shell maps it to CSS custom properties.
5. **Skip link is mandatory.** The shell renders a skip link as the first focusable element, targeting `<main id={mainId} tabIndex={-1}>`. Default `mainId` is `"main"`; applications may customize via prop to match existing skip link targets (e.g., empire-web uses `mainId="su-main"`). Skip link label is customizable via `skipToContentLabel` prop.
6. **Nav is optional.** Applications that do not need primary navigation may omit the `nav` prop.
7. **Geometry and layout are shell-owned.** Applications control content within landmarks; they do not control landmark positioning, sizing, or spacing. CSS customization of landmark anatomy is forbidden; applications may only customize content styling.
8. **AppShell is skin-agnostic.** The shell does not set or modify `data-skin`. Skin selection remains the application's responsibility (typically in the root layout). AppShell works with both `zine` and `empire` skins defined in ADR-0014.
9. **AppShell is brightness-agnostic.** The shell does not set or modify `data-brightness`. Brightness toggling is handled by the `<BrightnessToggle>` client component, which applications may include in their header. AppShell works with both dark and light brightness modifiers defined in ADR-0014 amendment (Decision 11).

## Rationale

- **Consistency:** Every application presents the same landmark structure to assistive technologies.
- **Maintainability:** Shell changes (e.g., skip link styling, experience token injection) propagate to all applications.
- **Accessibility:** Skip link, landmark roles, and focus management are implemented once, correctly.
- **Separation of concerns:** Applications own content; the design system owns chrome.
- **Flexibility:** Skin and brightness remain application-controlled, allowing per-app visual identity while standardizing structure.

## Consequences

- **Dock migration:** `apps/dock/src/layouts/site.tsx` becomes a thin wrapper that supplies header, footer, and content to `<AppShell>`. The `dk-shell`, `dk-skip`, `dk-main` classes are removed from `apps/dock/src/app/globals.css`. Experience token injection moves from inline to `experience` prop.
- **Empire-web migration:** Both `(entry)/layout.tsx` and `(localized)/[locale]/layout.tsx` use `<AppShell>` with `mainId="su-main"` to preserve existing skip link target. Inline header/footer composition is removed.
- **Other applications:** Headquarters, Orbit, Cockpit, ISP Console, Arsy, Echolog, Skylink, Sentinel adopt `<AppShell>` in subsequent milestones (priority and timeline TBD per app).
- **Testing:** MoonUI's `shell.test.ts` asserts landmark structure (10 tests passing). **TODO:** Add `contracts.test.mjs` assertion in each application to verify all routes use `<AppShell>`.
- **No breaking change to content:** Pages continue to render their content; only the chrome composition changes.
- **No breaking change to skin/brightness:** Applications retain full control over `data-skin` and `data-brightness` attributes.

## Migration pattern

```typescript
// Before: inline composition (simplified example)
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
      mainId="main"  // or custom ID if needed
    >
      {children}
    </AppShell>
  )
}
```

**Note:** Actual migration may be more complex if the application currently injects experience tokens manually or reads request headers. AppShell handles experience token injection via the `experience` prop, simplifying the migration. For applications with custom skip link targets (e.g., empire-web's `#su-main`), pass `mainId` prop to match.

## Rollback

Delete `packages/moonui/src/shell.tsx` and its export from `packages/moonui/src/index.ts`. Remove `.m-shell`, `.m-skip`, `.m-shell-header`, `.m-shell-nav`, `.m-shell-main`, `.m-shell-footer` styles from `packages/moonui/moon.css`. This ADR file and its test are removed last, after confirming nothing depends on them.

**Migration reversal:** If applications have already migrated to `<AppShell>`, rollback requires reverting each application's layout files to inline composition. This is a breaking change and must be coordinated across all affected applications. Recommended approach: (1) identify all migrated apps, (2) revert each app's layouts in dependency order, (3) verify each app builds and tests pass, (4) delete shell component last.
