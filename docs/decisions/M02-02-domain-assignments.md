# M02-02 — Domain Ownership Mapping & Boundary Register (D00–D20)

- **Milestone**: M02 — XV Governance and Source of Truth
- **Status**: RATIFIED
- **Reference**: [BLUEPRINT.md §4 — One Owner per Domain](../../BLUEPRINT.md)

---

## 1. Prinsip Batas Domain (*Single Canonical Owner*)

Setiap entitas data di MoonWitness XV hanya dimiliki oleh **satu domain kanonikal**. Seluruh modul lain, frontend, cache pencarian, dan visualisasi grafik hanyalah *consumer* atau *proyeksi baca* (`read-only projection`).

---

## 2. Matriks Kepemilikan Domain D00–D20

| Domain ID | Nama Domain | Paket / Modul Target | Entitas Kanonikal yang Dimiliki | Batas & Aturan Anti-Tumpang Tindih |
|---|---|---|---|---|
| **D00** | **Identity & Ops** *(Existing)* | `@moonwitness/moonql-auth`<br>`@moonwitness/moonql-apikeys`<br>`@moonwitness/moonql-ops` | `auth_users`, `sessions`, `api_keys`, `audit_logs` | Otoritas tunggal akun & sesi untuk seluruh sistem. SHADOW / Headquarters tidak membuat tabel login terpisah. |
| **D01** | **Source / Corpus** | `@moonwitness/corpus` *(Planned G1)* | `works`, `expressions`, `editions`, `passages`, `translations`, `sources` | Memegang teks asli dan metadata lisensi. Tidak menyimpan penafsiran teologis subjektif. |
| **D02** | **UNILEX (Lexicon)** | `@moonwitness/unilex` *(Planned G1)* | `terms`, `senses`, `etymologies`, `designations` | Glosarium leksikal dan semantik bahasa sumber (Arab, Ibrani, Aram, Yunani, Inggris, Indonesia). |
| **D03** | **Ontology** | `@moonwitness/ontology` *(Planned G1)* | `concepts`, `entities`, `typed_links`, `identity_decisions` | Pemetaan relasi grafik antar entitas. Relasi diverifikasi oleh manusia, bukan auto-crawler. |
| **D04** | **Actor & Event** | `@moonwitness/actors` *(Planned G1)* | `figures`, `roles`, `transmissions`, `historical_events`, `locations` | Catatan tokoh historis dan kronologi peristiwa. *Prophetic Table* adalah **VIEW** dari domain ini, bukan tabel terpisah. |
| **D05** | **Research** | `@moonwitness/research` *(Planned G2)* | `cases`, `assertions`, `counter_evidence`, `srgbl_evaluations`, `mizan_runs` | Analisis komparatif, evaluasi SRGBL, dan metode MIZAN. Mengutip `D01`, bukan menduplikasi teks. |
| **D06** | **Witness** | `@moonwitness/witness` *(Planned G3)* | `testimonies`, `consent_records`, `faultlines`, `corrections` | Arsip kesaksian personal berizin dan catatan koreksi fakta. Memiliki kontrol privasi ketat. |
| **D07** | **Story & Media** | `@moonwitness/story` *(Planned G3)* | `stories`, `arcs`, `characters`, `episodes`, `scenes`, `posters`, `media_manifests` | Seluruh kreasi fiksi, narasi zine, bab komik, dan metadata aset visual SHADOW. |
| **D08** | **Publication & Governance** | `@moonwitness/governance` *(Planned G3)* | `release_manifests`, `rights_approvals`, `editorial_signoffs`, `takedown_logs` | Pintu gerbang persetujuan rilis publik dan kepatuhan hak cipta. |
| **D09** | **Signal / Radio** *(Existing)* | `@moonwitness/moonql-stations`<br>`@moonwitness/moonql-schedule`<br>`@moonwitness/moonql-playlog`<br>`@moonwitness/whatsapp`<br>`@moonwitness/denpa` | `stations`, `schedules`, `playlogs`, `quality_beacons`, `channels`, `transmissions` | Domain radio live streaming, playlist, dan webhook interaksi yang sudah berjalan aktif. |
| **D10** | **World / Science** *(Optional)* | `@moonwitness/world` *(Planned G5)* | `earth_observations`, `astronomy_time_records`, `experiment_runs` | Observasi ilmiah empiris, waktu kosmis, dan pemantauan global. |
| **D11** | **Journey** *(Optional)* | `@moonwitness/journey` *(Planned G4)* | `paths`, `milestones`, `human_mandates`, `interactive_levels` | Eksplorasi alur belajar mandiri dan arsip 100CENTER. |
| **D12** | **Workflow** *(Optional)* | `@moonwitness/workflow` *(Planned G4)* | `review_tasks`, `human_decision_queue`, `ai_candidate_proposals` | Pengelolaan antrean kerja kurator manusia dan kandidat telaah AI. |
| **D13** | **Design System** *(Existing)* | `@moonwitness/moonui` | Komponen visual, token styling CSS, SVG Zine & Crown, layouts | Kontrak visual antarmuka monorepo. Bebas dari business logic atau database state. |
| **D18** | **Messages & Channels** *(Accepted — ADR-0006)* | `@moonwitness/skylink-store`, disajikan oleh `apps/skylink` | `channel_accounts`, `conversations`, `messages`, `delivery_attempts` (schema `skylink`) | Pemilik tunggal pesan/percakapan. **Tidak memiliki** identitas, sesi, atau login (D00 tetap ARSY). ARSY dan app lain hanya klien lewat REST/WS. Semantik `channels` pindah dari D09 ke D18 secara migrasi, bukan duplikasi; D09 tetap memiliki stations/schedule/playlog/DENPA. |
| **D19** | **Object Storage & Attachments** *(Accepted — ADR-0007)* | `@moonwitness/echolog-core` + `apps/echolog` | Objek byte, `sha256` digest, size, MIME, retensi, legal hold, kuota, grant unduh (metadata sidecar; **tanpa tabel**) | Pemilik tunggal byte. **Stateless** — himpunan SQL owner tetap `{moonql, skylink-store}`. Bukan pemilik consent (D08), identitas (D00), `media_manifests` (D07), artifact (D01), atau baris pesan (D18); konsumen hanya menyimpan `{object_key, digest, size, content_type}`. |
| **D20** | **ISP & Network Operations** *(Withdrawn — ADR-0019, 31 October 2026; previously accepted by ADR-0018 under M51)* | `@moonwitness/moonql-isp` through ARSY; protocol runtime `apps/isp-radius` **(both removed)** | ISP organizations/tenant scope, RADIUS users/profiles, NAS/network nodes, technical subscription bindings, accounting/sessions, IPAM/ODP references, registered-target observations/incidents/syslog | Withdrawn. The vertical has no consumer inside XV; the code is removed and the `isp_*` tables are left orphaned, never dropped automatically. ARSY/MoonQL remains the sole durable owner. D00 owns principals/grants; ISP commercial records map to D15; manual payment/reconciliation maps to D16. D20 stores references, never duplicate customer/invoice/payment rows or NAS shared secrets. Go runtime has no SQL. |

---

## 3. Aturan Pelaksanaan (*Anti-Duplication Rules*)
1. Tidak ada pembuatan modul baru yang melanggar kepemilikan domain di atas.
2. Saat migrasi nama ARSY (M28) berlangsung, seluruh entitas **D09 Signal** tetap utuh dan stabil.
3. Seluruh dependensi antarmuka publik (`apps/dock`) dan admin (`apps/headquarters`) hanya berinteraksi melalui SDK typed client yang diturunkan dari skema domain kanonikal ini.
