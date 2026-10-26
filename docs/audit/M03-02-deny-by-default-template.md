# M03-02 — Deny-by-Default Sensitive Addon Template Specification

- **Milestone**: M03 — ACL, Privacy, Consent and Abuse Prevention
- **Status**: RATIFIED
- **Reference**: [ADR-0002](file:///z:/project/moonradio/docs/decisions/ADR-0002-additive-moonql-domains.md), `packages/moonql/src/acl.ts`

---

## 1. Prinsip *Deny-by-Default*

Untuk mencegah terjadinya *open writes* atau kebocoran data sensitif (seperti naskah pribadi, kredensial, dsb.), setiap model baru yang menangani data sensitif diwajibkan menggunakan pola **Deny-by-Default**.

---

## 2. Template Standar Addon Sensitif

```typescript
import { defineAddon, defineModel, str, ts, ADMIN_FULL, type AnyAddon } from '@moonwitness/moonql'

export default defineAddon({
  name: 'sensitive_addon',
  models: {
    // Pola 1: Model Tertutup Penuh dari REST (Hanya dipanggil via Handler internal)
    internal_records: defineModel({
      label: 'Internal Record',
      fields: {
        payload: str(),
        createdAt: ts(),
      },
      rest: false, // Tidak menghasilkan endpoint REST sama sekali
      seedless: true,
    }),

    // Pola 2: Model Terproteksi Penuh (Wajib Peran Admin untuk List, Get, dan Mutasi)
    sensitive_items: defineModel({
      label: 'Sensitive Item',
      fields: {
        title: str({ maxLength: 100 }),
        secretData: str({ private: true }), // Field private tidak pernah diserialisasi ke JSON
      },
      rest: true,
      seedless: true,
      acl: ADMIN_FULL, // { list: ['admin'], get: ['admin'], create: ['admin'], update: ['admin'], remove: ['admin'] }
    }),

    // Pola 3: Model Berjenjang (Baca Publik, Tulis Wajib Role Tertentu)
    guarded_publications: defineModel({
      label: 'Guarded Publication',
      fields: {
        content: str(),
      },
      rest: true,
      acl: {
        list: 'public',
        get: 'public',
        create: ['editor', 'admin'],
        update: ['editor', 'admin'],
        remove: ['admin'],
      },
    }),
  },
})
```

### Konfigurasi Booting:
Pada lingkungan produksi, `MOONQL_ACL_POLICY=require` wajib diaktifkan (`docker-compose.yml`), sehingga booting Fastify Hub akan langsung gagal (*fail-closed*) jika ada model dengan antarmuka tulis REST yang tidak mendeklarasikan aturan ACL.
