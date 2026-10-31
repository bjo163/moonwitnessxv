/**
 * The Cockpit top bar is MoonUI's (ADR-0017 R1): the implementation moved to
 * `packages/moonui/src/client/surfaces/cockpit.tsx`, together with the
 * `cockpit-*` rules it needs, which now live in `moon.css`.
 *
 * This module is a compatibility re-export only — it renders no markup, so it is
 * no longer an exception in `docs/design/moonui-exceptions.json`. New call sites
 * import `CockpitTopBar` from `@moonwitness/moonui/client` directly, as
 * `client/App.tsx` does.
 */
export { CockpitTopBar } from '@moonwitness/moonui/client'
export type { CockpitRackChannel, CockpitTopBarProps } from '@moonwitness/moonui/client'
