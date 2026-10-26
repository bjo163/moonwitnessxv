// Konfigurasi lint tunggal untuk seluruh workspace.
// Mengonsumsi modul terpusat @moonwitness/eslint-config (packages/eslint-config).
import createMoonwitnessConfig from './packages/eslint-config/src/index.js'

export default createMoonwitnessConfig({
  tsconfigRootDir: import.meta.dirname,
})
