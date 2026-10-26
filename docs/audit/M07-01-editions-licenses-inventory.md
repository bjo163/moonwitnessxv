# M07-01 — Inventory of Historical Multi-Tradition Dataset Editions & Licenses

- **Milestone**: M07 Corpus source rights and ingestion pilot
- **Task**: M07-01
- **Status**: RATIFIED
- **Auditor**: MoonWitness XV Architecture & Governance Group

---

## 1. Multi-Tradition Editions Inventory

To prevent raw file dumps from being mistaken for cleared sources, every dataset edition is registered with provenance metadata:

| Tradition | Work | Canonical Edition | Provenance / Transmission | Cleared License Status |
|---|---|---|---|---|
| **Islamic** | Al-Qur'an | Amiri Press Cairo Edition 1924 (Hafs 'an 'Asim) | Verified mutawatir oral transmission & Cairo standard typography | `RIGHTS_EXACT_VERSION_CLEARED` (Public Domain) |
| **Islamic (Vernacular)** | Al-Qur'an Terjemahan | Terjemah Kemenag RI (Edisi Penyempurnaan 2019) | Indonesian Ministry of Religious Affairs | `RIGHTS_EXACT_VERSION_CLEARED` (Official Open License) |
| **Abrahamic (Taurat/Torah)** | Torah (Bereshit - Devarim) | Leningrad Codex (B19a, 1008 CE) | Masoretic Text, National Library of Russia | `RIGHTS_EXACT_VERSION_CLEARED` (Public Domain) |
| **Abrahamic (Zabur/Psalms)** | Tehillim | Aleppo Codex / Leningrad Codex | Historical Masoretic Hebrew text | `RIGHTS_EXACT_VERSION_CLEARED` (Public Domain) |
| **Abrahamic (Injil/Gospels)** | Canonical Gospels | Codex Sinaiticus & Vaticanus (4th Century CE) | Byzantine / Alexandrian Greek text types | `RIGHTS_EXACT_VERSION_CLEARED` (Public Domain) |

---

## 2. Invariant Rule
Folder existence in a legacy repo does not constitute clearance. Unverified private manuscripts or modern copyrighted commentary translations remain strictly in `RIGHTS_UNKNOWN / METADATA_ONLY` status until reviewed.
