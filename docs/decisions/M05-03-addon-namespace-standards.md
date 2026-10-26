# M05-03 — Future Addon Namespace & Registration Standards

- **Milestone**: M05 API/SDK and module behavior contracts
- **Task**: M05-03
- **Status**: RATIFIED
- **Auditor**: MoonWitness XV Architecture Group

---

## 1. Context & Collision Prevention

To ensure new domains (e.g. D00-D13) never shadow, overwrite, or collide with existing Radio or Core routes:
1. Every addon MUST declare a unique name conforming to `^[a-z][a-z0-9_]*$`.
2. Model names MUST NOT collide across different addons.
3. Addon REST endpoints MUST NOT use reserved manual module paths (`stations`, `health`, `channels`, `auth`).
4. Custom addon endpoints MUST be prefixed by the addon namespace or explicit `/api/v1/<domain>/...`.

---

## 2. Standard Addon Template

```typescript
import { defineAddon, defineModel, str } from '@moonwitness/moonql'

export default defineAddon({
  name: 'witness_intel',
  depends: ['base', 'auth'],
  models: {
    intel_reports: defineModel({
      label: 'Intel Report',
      rest: true,
      fields: {
        title: str({ maxLength: 100 }),
      },
      seedless: true,
    }),
  },
})
```
