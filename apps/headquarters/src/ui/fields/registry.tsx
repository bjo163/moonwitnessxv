import { FIELD_WIDGETS } from '@moonwitness/moonui'

/**
 * Headquarters consumes the shared field widget registry from @moonwitness/moonui.
 * This file re-exports the registry for local use, satisfying the architectural
 * constraint that HQ does not own its own widget map.
 */
export { FIELD_WIDGETS }
export default FIELD_WIDGETS
