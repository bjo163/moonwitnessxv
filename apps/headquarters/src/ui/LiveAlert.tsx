/**
 * The alert with an explicit live region used to be an HQ component. ADR-0017
 * folded it into MoonUI's `Alert` (`role` + `aria-live`), so this module keeps
 * only the old name for the call sites that have not adopted `Alert` yet. It
 * declares no component of its own.
 */
export { Alert as LiveAlert } from '@moonwitness/moonui'
