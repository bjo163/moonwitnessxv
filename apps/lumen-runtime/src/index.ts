export * from './worker.js';

import { LumenWorker } from './worker.js';

// If run directly as a process:
if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`) {
  console.log('[LUMEN RUNTIME] Worker process entry initialized. Standing by for ARSY integration.');
}
