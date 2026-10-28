# M26-05 — Empire Taxonomy and Permission-Kind Audit

- **Milestone**: M26 — Legacy canon, Empire registries and missing sources
- **Task**: M26-05 — Audit Empire nine principles, WINGS 10, G.O.D.99 and Asma registry
- **Baseline**: branch `dev`, `baseline_sha` `eb3b9f085da73e1e19d8686d467dab95c2b7d13e`
- **Mode**: read-only audit. No TODO edit, no source change, no commit, no build. This file is the only write.
- **Dependency**: M06-05 is closed — `TODO.md:217` (`- [x] **M06-05**`) and `docs/decisions/M06-05-historical-interfaces-map.md:1-5` (RATIFIED).
- **Worktree note**: unrelated uncommitted changes from another session were present and were not touched.

## Verdict

**CLOSABLE after owner decision (2026-10-28).** Code-level taxonomy separation and permission-kind separation both pass, and no Empire token grants authority. The only blocker was a ratified documentation conflict: `docs/decisions/M02-01-disambiguation-registry.md:36` defined `G.O.D.99` as the “arsitektur 99 bab/skenario” (99-chapter/scenario architecture), while `docs/vision/MASTER_VISION_NARRATIVE_XV.md:122` requires `G.O.D. 99` to be **distinct from any 99 editorial chapter count**, and `:435` defines it as 99 fictional organizational duty/persona slots. The owner chose the vision definition on 2026-10-28 and the registry line was corrected to 99 fictional duty/persona slots, explicitly separate from the 99 editorial chapters and from Asmaul Husna. Runtime permission kinds were never affected. Asma has no repository registry; that absence is recorded, not invented.

## 1. Scope and method

Inspected the real files named by the task plus their consumers:

- `packages/moonql-unilex/src/data/registry.ts`, `packages/moonql-unilex/src/index.ts`
- `packages/moonql-ops/src/empire.ts`, `packages/moonql-ops/src/index.ts`
- `packages/types/src/sentinel/telemetry.ts`
- `apps/headquarters/src/app/(admin)/page.tsx`, `apps/headquarters/src/lib/authz.ts`
- `packages/moonql/src/model.ts`, `acl.ts`, `addon.ts`; `packages/moonql-auth/src/index.ts`; `packages/moonql-apikeys/src/index.ts`
- `apps/skylink/src/auth.ts`, `apps/skylink/src/modules/routes.ts`; `apps/echolog/src/auth.ts`, `apps/echolog/src/modules/objects/index.ts`
- `BLUEPRINT.md`, `MASTER_DESIGN.md`, `docs/vision/MASTER_VISION_NARRATIVE_XV.md`, `docs/decisions/M02-01-disambiguation-registry.md`, `docs/decisions/M06-05-historical-interfaces-map.md`, ADR-0006, ADR-0007, `TODO.md`

Method: `rg`/`git ls-files` inventory; source reads at the baseline SHA; two Node enumerations of the compiled package exports; negative greps over the authorization and identity code. No external repository, network source, or database was consulted. No test was run; this is an evidence audit.

`MASTER_DESIGN.md` contains no Empire, WINGS, G.O.D., Asma, or Prime Code reference (`rg -i` returned no matches). It therefore does not define or merge these taxonomies.

## 2. Per-taxonomy ledger

| Taxonomy / registry | Actual evidence and storage | Observed entries | Code state | Permission linkage |
|---|---|---|---|---|
| Nine Prime Code principles (`PC01`–`PC09`) | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:408-422`; one UNILEX concept `P010` at `packages/moonql-unilex/src/data/registry.ts:982-996`; distinction list `BLUEPRINT.md:227` | **9** PC rows (`PC01`–`PC09`) | **doc-only**; no `PC0x` code rows, model, seed or table | none; narrative calls them project-authored human principles, “not a new scriptural source” (`:422`) |
| WINGS 10 | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:896-898`; one UNILEX concept `P009` at `registry.ts:966-980`; W01/W07 name references in `docs/decisions/ADR-0006-skylink-communication-surface.md:8` and `docs/decisions/ADR-0007-echolog-storage.md:14` | **10** names (`SKYLINK`, `RAINMAKERS`, `LAST SIGNAL`, `SOFT LANDING`, `QUESTION ZERO`, `DOUBLE CHECK`, `ECHOLOG`, `LEDGER PUNK`, `FIREWALL`, `HAVEN`) | **doc-only** as a taxonomy; **two names used as bounded service identities**. No local `wings10.json`: `test -d empireofthelight` → `ABSENT`; `test -f empireofthelight/data/organization/wings10.json` → `WINGS10_ABSENT` | none. Narrative says not “service accounts or granted operator permissions” (`:898`). SKYLINK/ECHOLOG authorization comes from the ARSY `admin` role, not a WINGS token (§4) |
| G.O.D.99 | `docs/vision/MASTER_VISION_NARRATIVE_XV.md:435,476`; one UNILEX concept `P008` at `registry.ts:950-964` | **1** concept; **0** of the 99 slots stored at baseline | **doc-only**; no 99-row seed, model or table at baseline | none; `P008` says “99 slot persona fiktif … angka bukan jumlah entitas ketuhanan” (`registry.ts:958`) |
| Asma / Asmaul Husna 99 registry | Only prose: `docs/vision/MASTER_VISION_NARRATIVE_XV.md:739` (“74 The 99 Asma Registry”), `:818` (`asmaul-husna-99` as a Corpus dataset example), `:477` (“never an Agent permission model”); `docs/decisions/M02-01-disambiguation-registry.md:35` | **0** names; no local data file | **absent** as a registry. `git ls-files | rg -i 'wings10|asma|god.?99'` → `NO_MATCH`; `rg -i 'asma|husna' packages apps` → `NO_CODE_MATCH` | none; the narrative explicitly forbids turning it into an agent permission model (`:477`) |
| 14 Empire systems (nearest implemented Empire vocabulary) | `packages/moonql-ops/src/empire.ts:6-144` (`EMPIRE_SYSTEMS_SEED`); model `empire_systems` at `packages/moonql-ops/src/index.ts:96-113`; telemetry union `packages/types/src/sentinel/telemetry.ts:4-16`; hardcoded UI at `apps/headquarters/src/app/(admin)/page.tsx:219-234` | **14** seed rows; **12** telemetry codes; **14** UI literals | **implemented metadata** (`empire_systems`, seeded; view `empireSystemsOverview`); duplicate vocabularies disagree (see §7) | normal MoonQL ACL only: `acl: ADMIN_WRITE` (`index.ts:110`), i.e. public read / admin write. No role or authority field exists in `EmpireSystemSeedRow` (`empire.ts:6-15`) |
| Persona / Department / AI Agent / Human Actor | `registry.ts:1110-1171` (`P018`–`P021`) | **4** distinct concepts | metadata concepts only | `P018` Persona explicitly “tidak otomatis membawa hak akses atau kewenangan” (`:1118`); `P020` AI Agent has “izin terbatas” (`:1150`); `P021` human authority comes from consent/rules (`:1166`) |
| Permission kinds | `packages/moonql/src/model.ts:14-22`; `packages/moonql/src/addon.ts:35-38`; `packages/moonql-auth/src/index.ts:43`; `packages/moonql-apikeys/src/index.ts:32,106-110`; `docs/decisions/M03-04-tenant-role-boundaries.md:18-25` | `public`, `auth`, role arrays; login roles `admin`/`user`/`guest`; API-key default `bot`; declared `editor`/`reviewer` | **runtime** for ACL, login roles and API keys; `editor`/`reviewer` remain **doc-only** | independent of every Empire row above |

No table in the repository joins an Empire taxonomy to an identity, role, session, or ACL row. `unilex_terms` stores all these as ordinary terms (`packages/moonql-unilex/src/index.ts:503-524`) with `acl: ADMIN_WRITE` (`:506`); `empire_systems` stores system vocabulary only. There is no merged identity table.

## 3. Per-taxonomy findings

### 3.1 Nine Prime Code principles — doc-only, complete as prose

The only complete enumeration is the nine-row table at `docs/vision/MASTER_VISION_NARRATIVE_XV.md:412-420`. There is no `PC01`–`PC09` constant, seed, model, table, or endpoint. The single machine-readable trace is `P010` “The Prime Code”, a `PROJECT`/`concept` UNILEX entry at `registry.ts:982-996`, defined as “Identitas fondasi nilai dan kualitas sistem, bukan kitab suci atau peraturan ilahi.” The gap is index/implementation, not permission leakage.

### 3.2 WINGS 10 — doc-only names, two names reused as software identities

The ten names are enumerated once at `MASTER_VISION_NARRATIVE_XV.md:898`. The source JSON cited by the narrative and both ADRs is in the sibling `empire-of-the-light` repository (`data/organization/wings10.json`) and is not present locally. The narrative already warns: “Verify their current source JSON registry at a pinned version before using them as configuration” (`:898`). W01/W07 are reused only as service names; ADR-0006:8 and ADR-0007:14 explicitly say `authorityLimit: NO_SUPERNATURAL_OR_DIVINE_AUTHORITY`, `PROPOSED_NOT_ASSIGNED`, and “not configuration”. The code confirms the authority source is ARSY, not a WINGS identifier: `apps/skylink/src/auth.ts:8-12` has principal kinds `service | arsy`, and `apps/skylink/src/modules/routes.ts:361-363` checks `principal.role === 'admin'`; `apps/echolog/src/auth.ts:8-12` is the same, and `apps/echolog/src/modules/objects/index.ts:94` checks `role !== 'admin'`.

### 3.3 G.O.D.99 — doc-only concept plus one blocking definitional conflict

`P008` stores only a concept (“99 slot persona fiktif … angka bukan jumlah entitas ketuhanan”, `registry.ts:958`); no 99 slot rows, no persona table, no agent identities. At baseline, no tracked runtime code has a `GOD-049`/`GOD-050`/`god99`/`personaSlot` match (negative grep in §5). The blocker is documentation, not code: see §7.1.

### 3.4 Asma / Asmaul Husna 99 — absent as a registry

There is no `asma`/`husna` match anywhere under `packages` or `apps`, no file named for it, and no 99-name list. The phrase “99 Asma Registry” occurs once, as a table-of-contents entry (`MASTER_VISION_NARRATIVE_XV.md:739`); `asmaul-husna-99` occurs once as an example Corpus dataset name (`:818`). `M02-01:35` describes Asmaul Husna as the 99 names/attributes of God in Islamic theology (sacred domain), which is the correct non-project referent; the narrative at `:477` explicitly says it must not become an “Agent permission model”. This is a missing-source gap, not a merge or authority grant.

### 3.5 The 14 Empire systems — implemented metadata, but a duplicated vocabulary

This is the only implemented Empire registry: `EMPIRE_SYSTEMS_SEED` has 14 rows with fields `code,name,historicalRole,xvMapping,disallowedInterpretation,category,status` (`empire.ts:6-15`) and is seeded into `empire_systems` (`moonql-ops/src/index.ts:96-113`). It has no role, permission, identity, or authority field. It is **not** one of the four taxonomies under audit, but it is the nearest implemented “Empire” metadata and is therefore in scope as a possible merge point. It is separate from `unilex_terms`; it does not import UNILEX and UNILEX does not import it.

The duplicate surfaces disagree, which is a taxonomy-maintenance gap (not authorization):

- `packages/types/src/sentinel/telemetry.ts:4-16` declares 12 codes and includes `OBSERVATORY`, which is not in the 14-row seed; it omits `MoonWitness OS`, `Semantic Engine`, and `Command Center Hub`.
- `apps/headquarters/src/app/(admin)/page.tsx:219-234` hardcodes a third 14-item list with display-only statuses (`GUARDED`, `IN_SESSION`, `SYNCED`, `STREAMING`) that are not the seed enum (`ACTIVE|BOUNDED|HISTORICAL_CONCEPT`, `index.ts:107`). The page badge says “14 / 14 SYNCHRONIZED” (`:446`) but is a literal, not a live check.

### 3.6 Persona, Department, Agent and Human Actor are typed apart

UNILEX separates the four concepts instead of collapsing them: `P018` Persona (no automatic access right, `registry.ts:1118`), `P019` Department (operational group with mandate, `:1134`), `P020` AI Agent (software with bounded tools and permissions, not a divine subject, `:1150`), `P021` Human Actor (real human with identity and authority from consent/rules, `:1166`). The registry’s canonical rule is explicit: “Persona/Scripture names never grant permissions or supernatural authority” (`registry.ts:53`). This is positive evidence against a merged angel/god identity model.

## 4. Permission linkage finding

The real permission kinds are:

1. **ACL rule**: `type AclRule = 'public' | 'auth' | string[]` (`packages/moonql/src/model.ts:15`); `public` needs no identity, `auth` needs any signed-in user, an array needs a matching role (`packages/moonql/src/acl.ts:25-36`). A row predicate may be attached (`model.ts:18-21`).
2. **Identity roles**: `User.roles: string[]` (`packages/moonql/src/addon.ts:35-38`). Login accounts have exactly `admin`, `user`, `guest` (`packages/moonql-auth/src/index.ts:43`).
3. **API-key role(s)**: a free CSV string, default `bot` (`packages/moonql-apikeys/src/index.ts:32`), resolved into `roles` at request time (`:106-110`). `bot` is therefore a machine-credential role, not a login role.
4. **Declared but unimplemented roles**: M03-04 ratifies `anonymous`, `user`, `editor`/`reviewer`, `admin` (`docs/decisions/M03-04-tenant-role-boundaries.md:18-25`). `editor`/`reviewer` do not exist in the runtime enum; the existing M20-02 evidence records this explicitly (`docs/audit/M20-02-review-queue-evidence.md:61-63`).
5. **HQ borrows, never owns**: “There is no local role table” (`apps/headquarters/src/lib/authz.ts:10-16`); route requirements come from the hub’s published `_schema` ACL (`:31-38`).
6. **Service principals**: `kind: 'service' | 'arsy'` (`apps/skylink/src/auth.ts:8-12`, `apps/echolog/src/auth.ts:8-12`). Administration is still the ARSY `admin` role (`apps/skylink/src/modules/routes.ts:361-363`, `apps/echolog/src/modules/objects/index.ts:94`). The WINGS-derived service names confer no role.

**No Empire vocabulary maps into any of these.** `empire_systems` has no authority column; `unilex_terms` is a term catalog; `EMPIRE_SYSTEMS_SEED` is not imported by auth, apikeys, ACL, or HQ authorization. The only empire-vocabulary references in the authorization/HQ code are the UI brand strings “EMPIRE OF THE LIGHT” (`apps/headquarters/src/lib/shell-copy.ts:25`, `login-copy.ts:28`), which are not used in a role or ACL decision.

## 5. Commands and observed results

### 5.1 Positive enumeration — UNILEX taxonomy concepts

```
$ node --input-type=module -e "import { UNILEX_SEED } from './packages/moonql-unilex/dist/index.js'; const ids=['P008','P009','P010','P018','P019','P020','P021']; console.log('UNILEX',UNILEX_SEED.schemaVersion,UNILEX_SEED.status,'entries='+UNILEX_SEED.entries.length); for (const id of ids){const e=UNILEX_SEED.entries.find(x=>x.id===id); console.log(id,'|',e.preferredLabel.en,'|',e.domain,'|',e.status);} console.log('rule:',UNILEX_SEED.canonicalRules.filter(r=>/permission/i.test(r)).join(''));"
UNILEX 0.1.0 PROPOSED_NOT_ADOPTED entries=71
P008 | G.O.D. 99 | PROJECT | DRAFT_REVIEW
P009 | WINGS 10 | PROJECT | DRAFT_REVIEW
P010 | The Prime Code | PROJECT | DRAFT_REVIEW
P018 | Persona | PROJECT | DRAFT_REVIEW
P019 | Department | PROJECT | DRAFT_REVIEW
P020 | AI Agent | PROJECT | DRAFT_REVIEW
P021 | Human Actor | PROJECT | DRAFT_REVIEW
rule: Persona/Scripture names never grant permissions or supernatural authority
```

Storage location: `unilex_terms` model (`packages/moonql-unilex/src/index.ts:503-524`), seeded from `UNILEX_SEED.entries` via `termRows` (`:180-190`); the source data is `packages/moonql-unilex/src/data/registry.ts`, pinned to `bjo163/empire-of-the-light@38354ff:data/unilex/terms.v0.1.json` (`registry.ts:1-7`, `index.ts:66-76`).

### 5.2 Positive enumeration — 14 Empire systems

```
$ node --input-type=module -e "import { EMPIRE_SYSTEMS_SEED as S } from './packages/moonql-ops/dist/empire.js'; console.log('EMPIRE_SYSTEMS_SEED rows='+S.length); console.log('fields='+Object.keys(S[0]).join(',')); console.log('codes='+S.map(r=>r.code).join(','));"
EMPIRE_SYSTEMS_SEED rows=14
fields=code,name,historicalRole,xvMapping,disallowedInterpretation,category,status
codes=sys_moonwitness_os,sys_semantic,sys_furqan,sys_mizan,sys_amanah,sys_shura,sys_100center,sys_kitab,sys_sidra,sys_dcc,sys_atmosphere,sys_heliogrid,sys_arsy,sys_material_forge
```

Storage location: MoonQL model `empire_systems` (`packages/moonql-ops/src/index.ts:96-113`), seeded once from `EMPIRE_SYSTEMS_SEED` (`:112`), read by `empireSystemsOverview` (`:116-122`). No role/authority field is present.

### 5.3 Positive enumeration — nine principles and ten WINGS

```
$ rg -c '^\| PC0[1-9] \|' docs/vision/MASTER_VISION_NARRATIVE_XV.md
9
$ rg -n '^\| PC0[1-9] \|' docs/vision/MASTER_VISION_NARRATIVE_XV.md
412:| PC01 | Source Integrity |
...
420:| PC09 | Continuity |
$ rg -n 'The ten fictional/specialist labels' -A2 docs/vision/MASTER_VISION_NARRATIVE_XV.md
898:The ten fictional/specialist labels named in the historical narrative are: **SKYLINK**, **RAINMAKERS**, **LAST SIGNAL**, **SOFT LANDING**, **QUESTION ZERO**, **DOUBLE CHECK**, **ECHOLOG**, **LEDGER PUNK**, **FIREWALL**, **HAVEN**. ...
```

### 5.4 Positive evidence for permission kinds

```
$ rg -n "export type AclRule|export interface AclRowSpec|export interface User|roles: string\[\]|role: sel|roles: str" packages/moonql/src/model.ts packages/moonql/src/addon.ts packages/moonql-auth/src/index.ts packages/moonql-apikeys/src/index.ts
packages/moonql/src/model.ts:15:export type AclRule = 'public' | 'auth' | string[]
packages/moonql/src/model.ts:18:export interface AclRowSpec {
packages/moonql/src/addon.ts:35:export interface User {
packages/moonql/src/addon.ts:37:  roles: string[]
packages/moonql-auth/src/index.ts:43:        role: sel(['admin', 'user', 'guest'], { default: 'user' }),
packages/moonql-apikeys/src/index.ts:32:        roles: str({ maxLength: 120, default: 'bot' }),
```

### 5.5 Negative evidence — no taxonomy source file

```
$ git ls-files | rg -i 'wings10|asma|god.?99' || echo NO_MATCH
NO_MATCH
$ rg -n -i 'asma|husna' packages apps --glob '!node_modules' --glob '!*.map' || echo NO_CODE_MATCH
NO_CODE_MATCH
$ test -d empireofthelight && echo PRESENT || echo ABSENT
ABSENT
$ test -f empireofthelight/data/organization/wings10.json && echo WINGS10_PRESENT || echo WINGS10_ABSENT
WINGS10_ABSENT
```

### 5.6 Negative evidence — no authorization use of Empire tokens

```
$ git grep -n -E "EMPIRE|PRIME CODE|WINGS|G\.O\.D|ASMA|GOD-0|personaSlot" HEAD -- packages/moonql-auth/src packages/moonql-apikeys/src packages/moonql/src apps/arsy/src/lib apps/headquarters/src/lib
HEAD:apps/headquarters/src/lib/login-copy.ts:28:    brandSubtitle: 'EMPIRE OF THE LIGHT',
HEAD:apps/headquarters/src/lib/shell-copy.ts:25:    brandSubtitle: 'EMPIRE OF THE LIGHT',
```

Those two lines are display copy, not role/ACL logic. A case-insensitive variant over the same directories returned only `packages/moonql/src/model.ts:37` (`"...audit, jobs, personal data"`), which is an unrelated comment, not an Empire term. `P008`–`P010` have no consumer outside `registry.ts` at baseline:

```
$ git grep -n -E "P008|P009|P010" HEAD -- packages apps
HEAD:packages/moonql-unilex/src/data/registry.ts:950:      "id": "P008",
HEAD:packages/moonql-unilex/src/data/registry.ts:966:      "id": "P009",
HEAD:packages/moonql-unilex/src/data/registry.ts:982:      "id": "P010",
```

`EMPIRE_SYSTEMS_SEED` is imported only by its own addon at baseline:

```
$ git grep -n "EMPIRE_SYSTEMS_SEED" HEAD -- packages apps
HEAD:packages/moonql-ops/src/empire.ts:17:export const EMPIRE_SYSTEMS_SEED: EmpireSystemSeedRow[] = [
HEAD:packages/moonql-ops/src/index.ts:15:import { EMPIRE_SYSTEMS_SEED } from './empire.js'
HEAD:packages/moonql-ops/src/index.ts:112:      seed: EMPIRE_SYSTEMS_SEED,
```

No `wings10`, `personaSlot`, `GOD-0`, `god99`, `Prime Code`, or `Asma` identifier appears in any role, ACL, session, or API-key definition.

## 6. Answers to the acceptance questions

**(a) Separate metadata/vocabulary, or one merged identity table?** Separate. There is no identity table joining these tokens to users, sessions, roles, or ACLs. UNILEX keeps them as `PROJECT` concepts with `kind: concept`; `empire_systems` is a separate system-vocabulary table with no authority column. The only merge is textual and is in a ratified decision document, not in code: `M02-01:36` equates G.O.D.99 with a 99-chapter/scenario architecture, contradicting `MASTER_VISION:122,435`. See §7.1.

**(b) Any programmatic angel/god identities or permissions granted from them?** No. At baseline, no `GOD-049`/`GOD-050`/`wings10`/`personaSlot` token exists in tracked code; no role enum contains an Empire value; `EMPIRE_SYSTEMS_SEED` has no authority field; UNILEX's own canonical rule forbids persona/scripture names granting permissions (`registry.ts:53`). SKYLINK and ECHOLOG, named after W01/W07, authorize through the ARSY `admin` role (`apps/skylink/src/modules/routes.ts:361-363`, `apps/echolog/src/modules/objects/index.ts:94`), not through a WINGS token.

**(c) Real permission kinds and any Empire mapping?** `public` / `auth` / role arrays; login roles `admin`, `user`, `guest`; API-key roles (default `bot`); declared-but-unimplemented `editor`/`reviewer`; service principals `service` / `arsy`. None of these contains or derives from an Empire term. The HQ layer has no independent role table (`apps/headquarters/src/lib/authz.ts:10-16`). No mapping exists.

**(d) Doc-only, incomplete, or missing source evidence?** Nine principles: doc-only (9 rows) plus one concept. WINGS 10: doc-only names; source JSON absent locally; two names reused as service names. G.O.D.99: doc-only concept; no 99 slots; definitional conflict in M02-01. Asma registry: absent; no 99 names; only prose and one Corpus dataset example. 14 systems: implemented metadata, but three disagreeing vocabularies. `editor`/`reviewer`: declared but not implemented.

## 7. Gaps and ownership

### 7.1 Blocking — G.O.D.99 merged with a 99-chapter architecture

- `docs/decisions/M02-01-disambiguation-registry.md:36` (RATIFIED; `TODO.md:122` marked `[x]`): “**G.O.D.99**: Kode naratif simbolis arsitektur 99 bab/skenario semesta kreatif MoonWitness (Domain Fiksi `D07`).”
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:122`: “`G.O.D. 99` organization **distinct from** Asmaul Husna 99, 99 Human States, and any 99 editorial chapter count.”
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:435`: “`G.O.D. 99` = 99 **fictional organizational duty/persona slots**, historically grouped in nine divisions.”
- `docs/vision/MASTER_VISION_NARRATIVE_XV.md:479`: “**99 V10 chapters** | Editorial archive organization”.

The ratified decision therefore defines G.O.D.99 as a 99-chapter/scenario architecture while the narrative defines it as organizational duty/persona slots and expressly separates it from a 99-chapter count. Even on a charitable reading (“scenarios” rather than “editorial chapters”), the definition is unreconciled and cannot support “independent taxonomy confirmed.” This is a **doc-level merged identity**, not a runtime authorization path. No code reads M02-01 at runtime.

**Owner**: no open task owns this correction. `M02-01` is closed, so the fix requires reopening/revalidating M02-01 or a new M26-05 follow-up erratum. It is **not** owned by M23-04, whose scope is indexing metadata. Until corrected, M26-05 is NOT-CLOSABLE.

### 7.2 Non-blocking but real — metadata index is not implemented at baseline

`TODO.md:549` / M23-04 (“Index nine Prime Code, 10 WINGS and GOD99 as separate metadata”, open, no packet) owns the missing machine-readable index. At baseline `eb3b9f0`, only prose (nine principles, ten WINGS) and one UNILEX concept each exist; no separate metadata rows for the nine principles, ten WINGS, or 99 G.O.D. slots. M23-04 is the correct owner for this gap and must preserve the separations above without creating a role/identity link.

**Concurrent worktree note (not baseline evidence):** during this audit, untracked files `packages/moonql-unilex/src/data/empire-taxonomy.ts` and `packages/moonql-unilex/test/empire-taxonomy.test.mjs` appeared, together with a modified export in `packages/moonql-unilex/src/index.ts`, apparently M23-04 work by another session. They are not committed at `eb3b9f0`, were not modified, and were not treated as accepted evidence. Their header declares `authority: 'metadata-only'`, `EMPIRE_TAXONOMY_KINDS = ['prime-code','wings','god99']`, and no runtime identity/permission binding (`empire-taxonomy.ts:1-23`). If that change is reviewed and accepted, it may close the metadata-index gap; it does not resolve §7.1.

### 7.3 Non-blocking — Asma registry has no source and no owner

No local registry, no 99 names, no data file. The narrative itself says the Asma/25-field source chain is a “high-priority archival and source-recovery item” and “do not manufacture 25 names” (`MASTER_VISION:919-921`). `M26-06` is the 25 Bidang Amanah task, not the Asma registry. **No current open task owns the Asma registry source recovery.** Recommend a new follow-up task (source/rights review first; no names invented). This audit does not fetch or verify external sources.

### 7.4 Non-blocking — WINGS source JSON and duplicated system vocabularies

`data/organization/wings10.json` is external to this repository and absent locally; no pinned copy or digest is stored in XV. M23-04 should index only after a pinned source reference is recorded. Separately, `EmpireSystemCode` (12 codes, includes `OBSERVATORY`) and the HQ hardcoded 14-item list disagree with the 14-row seed and its status enum; this is vocabulary drift, not authority. It should be reconciled under M23-04 or a separate metadata follow-up, and the HQ “14 / 14 SYNCHRONIZED” badge (`apps/headquarters/src/app/(admin)/page.tsx:446`) should not be presented as a live health claim.

## 8. Limitations

- Read-only audit at `eb3b9f0`; no TODO status change, no source edit, no commit, no push, no test run, no database query, no deployment.
- The positive enumerations imported the compiled `dist` exports (`packages/moonql-unilex/dist`, `packages/moonql-ops/dist`); the corresponding source files were read separately and the observed counts match. A stale-dist mismatch cannot be fully excluded without rebuilding, which this audit did not do.
- The sibling Empire repository, its `wings10.json`, the 99 Asma names, and any external Prime Code/G.O.D. source were not fetched or verified. The audit therefore records them as doc-only/absent in **this** repository, not as nonexistent externally.
- The unrelated uncommitted worktree changes were not inspected beyond `git status` and were not modified. Two untracked M23-04 files appeared during the audit (see §7.2); they are excluded from baseline evidence and were not tested.
- No claim is made that documentation, a green unrelated CI, or a configuration listing proves deployment or production behavior.

## 9. Closure decision

**NOT-CLOSABLE** under the stated acceptance. The permission and code-independence portions pass; one ratified document (`docs/decisions/M02-01-disambiguation-registry.md:36`) still merges G.O.D.99 with a 99-chapter/scenario architecture, contrary to `MASTER_VISION_NARRATIVE_XV.md:122` and `:435`. Correct that definition (or record a reviewable erratum) and the audit can be re-run to READY-TO-CLOSE. The metadata-index gap remains with M23-04; the Asma registry gap has no current owner and needs a new source-recovery task.
