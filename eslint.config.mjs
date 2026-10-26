// Konfigurasi lint tunggal untuk seluruh workspace.
// Mengonsumsi modul terpusat @moonwitness/eslint-config by name — it is a root
// devDependency, so the rules are consumed through the same door as everything
// else rather than by reaching into another package's src/ directory.
import createMoonwitnessConfig from '@moonwitness/eslint-config'

export default createMoonwitnessConfig({
  tsconfigRootDir: import.meta.dirname,
})
