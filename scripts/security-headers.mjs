// One definition, two doors.
//
// The header vocabulary lives in `@moonwitness/core` because the hub needs it at
// runtime and a Next config/middleware needs it at build time; this file keeps the
// historical import path (`scripts/security-headers.mjs`) working for both Next apps
// and re-exports the same objects, so there is no second definition to drift.
//
// `packages/core/dist` is built before any Next config runs: `pnpm dev` builds the
// libs first, and the web image copies `packages/core/dist` in its build stage.
export {
  securityHeaders,
  NON_FRAMING_HEADERS,
  embedOrigins,
  EMBED_PATH,
  SECURITY_HEADERS,
} from '../packages/core/dist/index.js'
