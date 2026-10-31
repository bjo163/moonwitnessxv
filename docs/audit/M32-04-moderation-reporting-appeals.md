# M32-04: Moderation, Reporting and Appeals Specification

**Task:** M32-04 — Specify moderation reporting and appeals
**Milestone:** [M32 — HARBOR member and community privacy](../milestones/M32.md) · [packet](../tasks/M32/M32-04.md)
**Role:** EXECUTABLE LEAF (specification artifact; no implementation)
**Priority / Difficulty:** P1 / D3
**Prerequisites:** M32-02 (D14 ownership, D00 session reuse, moderation framework) — [decision](M32-02-d14-ownership-d00-session-reuse.md); M32-03 (private library, consented contributions, contribution states) — [specification](M32-03-private-library-consented-contributions.md)
**Baseline:** `dev` HEAD `9830821` (M32-03) at authoring
**Status:** BASELINE ESTABLISHED — design and acceptance evidence only. Nothing here is implemented, deployed, or verified against a running service.
**Data:** every case id, reason code, report, subject and figure below is synthetic.
**Language note:** the accepted rights decisions in this repository are written in Indonesian
([M03-06](../decisions/M03-06-witness-withdrawal-policy.md), [ADR-0003](../decisions/ADR-0003-source-rights-and-consent.md));
their policy names are cited verbatim and this document does not paraphrase them into new authority.

## Executive Summary

M32-02 §6 declared the moderation skeleton: 4 roles (member / moderator / admin / legal reviewer),
3 workflows (content reporting / user suspension / legal escalation) and 4 tools. M32-03 §4.4 granted
moderators and reviewers **no access to the private library** and only metadata-grade audit access
after takedown. M32-04 fills in the part neither leaf answered: **what happens after a report is
filed, and what the affected member can do about it.**

Four decisions:

| # | Decision | Choice | Rejected alternative |
|---|---|---|---|
| D-1 | Separation of powers | the moderator who acts on a report may **not** decide its appeal; appeals are a distinct queue with a distinct role | same-moderator review (rejected: structurally unable to reverse itself) |
| D-2 | Action ladder | 6 graduated actions, each with a stated reason code, a duration, and an appealability flag | ad-hoc "delete/ban" (rejected: unappealable and unauditable) |
| D-3 | Privacy of the reporter | the reporter is never identified to the subject; the subject sees category, evidence hash, action and dates only | open disclosure (rejected: reports in a small witness community become retaliation vectors) |
| D-4 | Silence is not approval | every report and appeal has an SLA and an escalation trigger when the SLA lapses | best-effort handling (rejected: a queue with no clock is how suspensions become permanent by accident) |

The controlling constraint throughout is that moderation operates **only on derivatives and
contributions**, never on private library content (M32-03 §4.4, invariant I-1). A moderator facing a
problem whose evidence lives in a member's private library must escalate to the legal reviewer rather
than read it.

## 1. Problem Statement

### 1.1 What the existing authorities say and don't say

| source | establishes | gap left |
|---|---|---|
| [BLUEPRINT.md:97](../../BLUEPRINT.md) | HARBOR = voluntary member/community, personal library, contributions | no moderation contract at all |
| [BLUEPRINT.md:110](../../BLUEPRINT.md) | D14 Community/Membership is **proposed, not globally accepted** | nothing may be guaranteed cross-domain on D14 yet |
| [BLUEPRINT.md:207](../../BLUEPRINT.md) | D06: public archive carries only an approved derivative | who may remove that derivative, and who can contest it |
| M32-02 §6 | 4 roles, 3 workflows, 4 tools | no states, SLAs, reason codes, evidence handling, or appeal path |
| M32-03 §2.3/§4.4 | contribution states and read-path matrix | what `rejected` means procedurally, and how it can be contested |
| [ADR-0003 §2](../decisions/ADR-0003-source-rights-and-consent.md) | source rights, consent and publishing storage decisions | moderation-time rights adjudication workflow |
| [M03-06 §3](../decisions/M03-06-witness-withdrawal-policy.md) | Hak Penarikan & Kebijakan Hak Cipta (takedown/withdrawal, copyright) | internal team workflow to execute it |
| [M03-06 §2](../decisions/M03-06-witness-withdrawal-policy.md) | Perlindungan Khusus Anak di Bawah Umur (minors) | detection, hold, and escalation path in a community product |

### 1.2 Why appeals are not optional here

HARBOR's content is testimony-adjacent: a member's published observation may be their record of an
event they witnessed. A wrongly hidden contribution is not merely a UX defect, it suppresses the
member's own published account of their observation — and the withdrawal/correction policy in M03-06
§3 already treats publication as something with dated consequences. An action with no appeal is
therefore incompatible with the policy set the repository already accepted.

### 1.3 Out of scope

| out of scope | owned by |
|---|---|
| Implementing any queue, UI, or job | M32-05 verification, then an implementation task |
| Private-library semantics | M32-03 |
| Consent grant validity | M32-03 §4.1 / D06 owner |
| Court orders, law-enforcement contact, statutory notice | legal reviewer + a legal owner decision (packet §8) |
| Trust & safety staffing/budget | owner decision |
| Automated classifier training | deferred item §9.11 |

## 2. Reference Model

### 2.1 Actors

| role | grants | may not |
|---|---|---|
| `member` | file a report; respond to an action against their own content; open one appeal per action | see another member's report, act on any queue |
| `moderator` | triage the report queue; apply ladder actions 1–4; request escalation | apply actions 5–6; decide an appeal of their own action; read private library |
| `admin` | apply ladder actions 1–5; assign roles; approve policy revisions; close a resolved legal hold | decide appeals of their own action; read private library without a legal reviewer |
| `legal-reviewer` | apply action 6 (legal hold / restricted view); decide appeals; authorise statutory disclosure | browse library content absent a specific escalation |
| `system` | auto-apply a documented automated rule; enforce expiry of temporary actions | apply irreversible actions; be the sole basis for an appeal denial |

D00 sessions are reused per M32-02 §3; role membership lives in COMMUNITY-owned tables only, and
`evidenceRef` in the audit trail references the D00/D15 `evidence_ref` already used for payment
actions so there is one identity attestation across domains, not several.

### 2.2 Objects

```
Report      id, reporter(anonymous token), category, targetKind, targetId, excerpt, state
Action      id, reportId?, targetKind, targetId, ladderLevel, reasonCode, effect,
            actorId, startedAt, endsAt, reversible, appealable
Appeal      id, actionId, appellantId, grounds, newEvidenceRef, state, decision
LegalHold   id, actionId, scope, openedBy, reviewIntervalDays, closedAt
Case        a report plus every action, appeal, hold and note sharing its caseId
```

`targetKind ∈ {contribution, community-profile, comment, collection, message-dm}`. Note that
`library-item` is **absent** — this is the D-privacy decision expressed in the type system rather than
in prose, so an implementation that tries to moderate a library item fails to typecheck against the
enum.

### 2.3 Report lifecycle

```
new ──> triaged ──┬─> no-action                (terminal, notified to reporter as closed)
                  ├─> action-applied ─> resolved (terminal)
                  ├─> escalated-legal ─> legal-hold ─> resolved | no-action
                  └─> duplicate-merged ─> (absorbed into an existing case)
   └─ SLA breach ──> auto-escalated to admin, case gains an 'sla-missed' flag
```

### 2.4 Appeal lifecycle

```
filed ──> acknowledged ──> under-review ──┬─> granted            (action reversed, content restored)
            │                             ├─> granted-partially  (level reduced, duration shortened)
            │                             ├─> denied             (action stands; reasons itemised)
            │                             └─> denied-final       (only from under-review by legal-reviewer)
            └─ evidence-requested ──> (appellant 14 d to respond, else denied-stale)
   denied ──> second-review (legal-reviewer only, once) ──> granted | denied-final
```

Two rules make this fair rather than decorative: a `denied` appeal can always be raised to a
`second-review` by a different, more senior principal, and `denied-final` requires the reviewer who
did **not** take the original action (D-1) plus an itemised reason list.

## 3. Action Ladder

| level | action | effect | max duration | reversible | appealable | who |
|---|---|---|---|---|---|---|
| 1 | `observe` | tagged for pattern review; no member-visible effect | 30 d | n/a | no (no effect) | moderator |
| 2 | `reduce-visibility` | excluded from discovery/ranking; direct link still works | 14 d | yes | yes | moderator |
| 3 | `hide` | derivative unavailable to all non-reviewer readers; tombstone per M32-03 §4.5 | 30 d | yes | yes | moderator |
| 4 | `require-edit` | author must publish a corrected revision before restore | 14 d grace | yes | yes | moderator |
| 5 | `suspend-account` | D00-linked account cannot post or DM; library remains exportable | 90 d | yes | yes | admin |
| 6 | `legal-hold` | restricted view + preservation; no deletion permitted | until review | **no** (hold freezes deletion) | yes | legal-reviewer |

Deliberate properties:

- Level 5 does **not** lock the private library. A suspended member must still be able to `exportItem`
  and request deletion (M32-03 §3.2, GDPR-adjacent rights from M32-02 §5). Suspension removes the
  ability to publish, not the ability to leave with one's own data.
- Level 6 freezes deletion. That is the only irreversible-adjacent action and it is gated behind the
  legal reviewer alone, matching M03-06 §3 takedown/copyright handling where preservation can be a
  legal requirement rather than a product choice.
- No ladder level authorises revealing a private original. If the evidence needed to act exists only in
  a library, the case is `escalated-legal` and the moderator works from the reporter's own excerpt.
- Levels 1–2 are deliberately weak; they exist so that borderline cases do not get escalated to `hide`
  merely because the queue wants a closed state.

## 4. Reason Codes

Stable, machine-readable, and paired with human-readable copy in both locales (ADR-0005 locale
contract; copy itself is a MASTER_DESIGN/M32-05 concern).

| code | meaning | appealable | notes |
|---|---|---|---|
| `RSN-COPYRIGHT` | rights claim on third-party material | yes | routes to legal-reviewer automatically (M03-06 §3) |
| `RSN-NO-CONSENT` | published derivative lacks or exceeds a valid grant | yes | checks against M32-03 §4.1 grants |
| `RSN-CONSENT-WITHDRAWN` | grant withdrawn, takedown overdue | no (author's own right) | never an appeal by a third party |
| `RSN-PRIVATE-DISCLOSURE` | reveals another person's private data | yes | PII redaction in excerpt, §6.2 |
| `RSN-MINOR-SAFETY` | possible involvement of a person under age | yes, expedited | auto-escalate within 1 h (M03-06 §2) |
| `RSN-HARASSMENT` | targeted harassment of a member | yes | reporter identity protected |
| `RSN-MISINFORMATION` | materially false claim about a verifiable event | yes | requires a cited counter-evidence ref |
| `RSN-DANGEROUS` | instructions likely to cause physical harm | yes | no auto-hide on keyword alone |
| `RSN-SPAM` | bulk/commercial repetition | yes | automated rules may only reach level 1–2 |
| `RSN-DUPLICATE` | same content posted repeatedly | yes | merge rather than hide when possible |
| `RSN-UNSAFE-TAG` | category label misrepresents content | yes | |
| `RSN-OTHER` | none of the above | yes | free text mandatory; `OTHER` may not justify level ≥4 |

`RSN-CONSENT-WITHDRAWN` is explicitly non-appealable by anyone other than the author: an appeal that
could force a withdrawn item back public would defeat M32-03 §4.5 and D06 outright.

## 5. Reporting Specification

### 5.1 What a reporter submits

| field | required | notes |
|---|---|---|
| `category` | yes | one of §4 codes, chosen from a plain-language list |
| `targetKind`, `targetId` | yes | filled automatically when reporting from the content view |
| `excerpt` | no, max 500 chars | reporter's own words about what is wrong; never a screenshot upload |
| `contactFollowup` | no | if absent, the case can still be resolved but the reporter gets no reply channel |
| anonymous | yes by default | reporter identity is not stored on the case unless they opt in to being identified |

No screenshot/image upload at report time. Reports referencing bytes the reporter did not author would
pull third-party images into a moderation store, growing the very privacy surface the queue exists to
limit. The `evidenceRef` for the subject itself is the existing content hash, not a new copy.

### 5.2 Tables (proposed, unapplied)

```sql
CREATE TABLE harbor_reports (
  report_id     TEXT PRIMARY KEY,              -- 'rep_' + opaque
  case_id       TEXT NOT NULL,
  reporter_ref  TEXT NULL,                     -- null when anonymous; opaque token otherwise
  category      TEXT NOT NULL,
  target_kind   TEXT NOT NULL CHECK (target_kind IN
                  ('contribution','community-profile','comment','collection','message-dm')),
  target_id     TEXT NOT NULL,
  excerpt       TEXT NULL CHECK (excerpt IS NULL OR length(excerpt) <= 500),
  state         TEXT NOT NULL,
  sla_due_at    TEXT NOT NULL,
  created_at    TEXT NOT NULL,
  closed_at     TEXT NULL
);

CREATE TABLE harbor_actions (
  action_id     TEXT PRIMARY KEY,
  case_id       TEXT NOT NULL,
  report_id     TEXT NULL,
  ladder_level  INTEGER NOT NULL CHECK (ladder_level BETWEEN 1 AND 6),
  reason_code   TEXT NOT NULL,
  target_kind   TEXT NOT NULL,
  target_id     TEXT NOT NULL,
  actor_id      TEXT NOT NULL,
  effect_json   TEXT NOT NULL,
  started_at    TEXT NOT NULL,
  ends_at       TEXT NULL,                      -- null only for legal-hold
  reversible    INTEGER NOT NULL,
  appealable    INTEGER NOT NULL,
  superseded_by TEXT NULL
);

CREATE TABLE harbor_appeals (
  appeal_id        TEXT PRIMARY KEY,
  action_id        TEXT NOT NULL REFERENCES harbor_actions(action_id),
  case_id          TEXT NOT NULL,
  appellant_id     TEXT NOT NULL,
  grounds          TEXT NOT NULL CHECK (length(grounds) <= 2000),
  new_evidence_ref TEXT NULL,
  state            TEXT NOT NULL,
  assigned_to      TEXT NULL,                   -- must satisfy §7 separation rule
  decision         TEXT NULL,
  decided_by       TEXT NULL,
  decided_at       TEXT NULL,
  due_at           TEXT NOT NULL
);

CREATE TABLE harbor_case_notes (
  note_id TEXT PRIMARY KEY, case_id TEXT NOT NULL,
  author_role TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL,
  redacted INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE harbor_mod_audit (
  event_id TEXT PRIMARY KEY, case_id TEXT NOT NULL, actor_id TEXT NULL,
  event TEXT NOT NULL,           -- assigned|action-applied|appeal-*|hold-*|disclosure
  actor_session TEXT NOT NULL,   -- D00 sessionId, for forgery checks (N-10)
  occurred_at TEXT NOT NULL,
  detail_json TEXT NOT NULL       -- must be PII-scrubbed before insert
);
```

Indexes: `harbor_reports(state, sla_due_at)`, `harbor_actions(target_kind, target_id, started_at)`,
`harbor_appeals(state, due_at)`, `harbor_mod_audit(case_id, occurred_at)`.

## 6. Moderation Workflow

### 6.1 Triage

```
1. case auto-assigned to a moderator who has no prior action on the subject member (30-day window)
2. moderator reads the subject derivative (never the library, §3) and the report excerpt
3. moderator selects: no-action | apply ladder 1–4 | merge-duplicate | escalate-legal
4. reason code + effect recorded atomically with the audit event
5. subject member notified (unless level 1); notification names category, action, dates, appeal link
6. reporter notified of closure when a contact channel exists
7. SLA clock stops; a level >= 3 action opens the appeal window immediately
```

Assignment rule at step 1 is what makes D-1 mechanical instead of aspirational: the system refuses to
assign a case to someone who already acted on that member, so a moderator cannot quietly become their
own reviewer across separate reports.

### 6.2 Evidence and PII handling

| rule | consequence |
|---|---|
| report excerpts are scrubbed of identifiers before storage | the queue cannot become a searchable PII dump |
| audit `detail_json` is scrubbed at insert time, not read time | a leak of the audit log is not a leak of testimony |
| a case may be merged but never re-scoped to a new subject | "report this person" cannot be smuggled into an existing case |
| a member's identity is never exposed by a report | D-3; enforced by `reporter_ref` being null by default |
| a moderator's note cannot attach a private-library reference | enforced by §2.2 `targetKind` enum |

### 6.3 Escalation to legal

| trigger | action |
|---|---|
| `RSN-COPYRIGHT` or `RSN-MINOR-SAFETY` filed | auto-escalate, 1 h response for minors |
| evidence needed exists only in a private library | escalate; only then may a legal reviewer open a narrowly scoped read (§7.3) |
| external legal demand | escalate; no member-visible change until reviewed |
| two contradictory rights assertions | escalate; the platform does not invent an ordering of rights claims |
| a moderator reports inability to decide | escalate without penalty; declining to guess is a valid outcome |

### 6.4 SLAs

| queue item | target | breach consequence |
|---|---|---|
| first triage | 24 h | auto-escalate to admin, `sla-missed` |
| minor-safety first response | 1 h | page admin, `sla-missed`, subject hidden provisionally at level 3 |
| appeal acknowledgement | 48 h | auto-assign to admin |
| appeal decision | 14 d | case review required; action expires at its own `ends_at` regardless |
| legal-hold review | every 30 d | hold cannot silently persist; a missed review forces release or re-authorisation |
| temporary action expiry | automatic | the system, not a human, ends levels 2–5 |

The last row is the anti-pattern killer: a `hide` that nobody remembers is a permanent hide. Expiry is
enforced by the store, and re-applying requires a fresh action with a fresh reason code.

## 7. Appeals Specification

### 7.1 Who may appeal

The **subject** of an action: the author of the affected contribution or profile. A reporter may not
appeal a `no-action` outcome — they may file a new report with new evidence, which is an honest
restatement of the same information and does not create a second decision path.

### 7.2 Separation of powers

```
canDecideAppeal(principal, action):
  if principal.role = 'legal-reviewer': ok = true
  elif principal.role = 'admin': ok = (principal != action.actor)
  else: return DENY
  if principal in caseParticipants(action.case_id, within=30d): return DENY
  if principal.hasLedLegalHoldOn(action.case_id): return DENY
  return ALLOW(principal)
```

Three independent bars: not the actor, not a participant in the case, not the holder of a legal hold
on that case. This is the mechanism for D-1 and it is also the source of the staffing risk in §8 R-1 —
a small team can satisfy "not the actor" and fail "not a participant", which is why the fallback is
documented rather than wished away.

### 7.3 What the appellant sees, and what a legal reviewer may see

The appellant sees: category, reason code, action level and duration, dates, the report excerpt
verbatim minus reporter identity, and the decision with itemised reasons. They do not see reporter
identity, other cases against them, or another member's data.

The narrow legal-reviewer library read is the one exception to M32-03 I-1 and is specified precisely:

| condition | requirement |
|---|---|
| who | `legal-reviewer` only, never moderator/admin alone |
| when | after `escalated-legal`, and only for a case whose evidence provably exists only in the library |
| scope | a single item id for a single case id, recorded in `harbor_mod_audit` as `library-disclosure` |
| lifetime | 24 h, non-renewable without a second authorisation |
| effect on data | read-only; no export, no copy into the case, no derivative created |
| notification | the member is told that a scoped disclosure occurred, with the case id and date |
| absence | without this row existing, a legal reviewer reading library content is simply a privacy breach |

The notification requirement is what makes this auditable by the person whose privacy it touches,
rather than internally self-certified.

### 7.4 Reversal, partial grant, and second review

| decision | effect | data consequence |
|---|---|---|
| `granted` | action lifted immediately | derivative restored to prior state; tombstone retained with `reversed=true` |
| `granted-partially` | level reduced or duration shortened | new action row supersedes the old (`superseded_by`) |
| `denied` | action stands until its own expiry | itemised reason list mandatory |
| `denied-final` | no further internal review | only from a principal satisfying §7.2; mandatory reasons + external route |
| `denied-stale` | appellant did not supply requested evidence within 14 d | appeal closed; may be refiled once with evidence |

`denied-stale` cannot be used where the requested evidence is something the platform holds —
otherwise a queue could win by asking for the impossible.

### 7.5 Restoration is not re-publication of consent

A granted appeal restores a derivative that already had a valid grant (M32-03 §4.1). If the underlying
grant expired or was withdrawn while the action was in force, the appeal restores nothing: the
authorisation, not the moderation decision, is then the blocker. The appeal decision must state which
of the two it is about, because "the moderator was wrong" and "you may not publish this" are different
outcomes with different next steps.

## 8. Risk Assessment

| # | risk | likelihood | impact | mitigation | contingency |
|---|---|---|---|---|---|
| R-1 | team too small to satisfy §7.2 separation | high | high | document a pre-agreed alternate reviewer roster | if none exists, appeals route to the owner as a named decision-maker; do not silently let the actor self-review |
| R-2 | retaliation against reporters | medium | high | anonymous by default, D-3, no reporter identity in notifications | treat any exposure as a privacy incident |
| R-3 | moderation used to suppress legitimate testimony | medium | high | appealability at every level ≥2, itemised reasons, second review | `denied-final` records the dissenting note if any reviewer disagreed |
| R-4 | permanent hides by neglect | medium | medium | auto-expiry enforced by the store (§6.4) | expiry events are auditable and countable |
| R-5 | minor-safety report delayed | low | severe | 1 h SLA with paging + provisional level-3 hold | a missed 1 h SLA is an escalation to the owner, not a queue stat |
| R-6 | moderator reads private material "to be thorough" | medium | severe | `targetKind` enum excludes library; §7.3 is the sole path and requires member notification | audit `library-disclosure` events are reviewed independently |
| R-7 | appeals used to re-publish withdrawn-consent content | medium | high | §4 `RSN-CONSENT-WITHDRAWN` non-appealable; §7.5 | none — the author's withdrawal is dispositive |
| R-8 | automated rules over-apply | medium | medium | automation capped at levels 1–2, never a sole appeal basis | keyword-only hides are treated as a defect (N-7) |
| R-9 | audit log becomes a PII store | medium | high | scrub at insert, not read | incident response: redact after the fact and record the correction |
| R-10 | legal hold used as convenience | low | high | level 6 gated to legal-reviewer, 30 d forced review | missed review forces release |
| R-11 | reporter floods with duplicate reports | medium | low | merge-duplicates path, per-reporter rate limit | duplicates absorb into the case, no extra actions |
| R-12 | D14 remains unaccepted, roles have no cross-domain guarantee | medium | medium | roles are COMMUNITY-internal; only D00 sessions are asserted cross-domain | re-scope when D14 is accepted or renamed (mirrors M32-03 R-10) |

## 9. Overlap Analysis

| neighbour | relationship | boundary kept |
|---|---|---|
| M32-02 | consumes its 4 roles / 3 workflows / 4 tools | adds states, ladder, codes, SLAs, appeal path |
| M32-03 | consumes contribution states and read-path matrix | acts on derivatives only; `library-item` excluded from `targetKind` |
| M32-05 | successor: runs §12 against a deployment | nothing executed here |
| D00 / ADR-0015 | reviewer grant model exists for D00–D12 review | HARBOR moderation roles are domain-internal; no new global role is invented |
| ADR-0003 | source rights/consent authority | rights disputes escalate, never adjudicated by a moderator |
| M03-06 §2/§3 | minors, copyright, withdrawal policy | this leaf supplies workflow, not policy |
| ADR-0005 / MASTER_DESIGN | locale + UI semantics | reason-code copy and keyboard paths deferred to §9 deferred items |
| TREASURY (M35-04) | role/separation precedent | same audit discipline, separate role names, no shared privilege |
| ECHOLOG (ADR-0007) | bytes | moderation stores no bytes; only hashes and references |

## 10. Deferred Items

| # | deferred | to |
|---|---|---|
| 1 | any implementation of the 5 tables | implementation task, never a spec leaf |
| 2 | moderation UI, queue views, note composer | MASTER_DESIGN + implementation |
| 3 | reason-code copy in `id` and `en` | content owner + ADR-0005 |
| 4 | keyboard paths and screen-reader labels for the queue | a11y review at M32-05 |
| 5 | appeal notification email/push mechanics | implementation |
| 6 | reporter reputation / bad-faith scoring | rejected pending a rights decision |
| 7 | automated classifier as a triage aid | deferred pending a documented accuracy claim |
| 8 | moderator training, rota, and pay | owner decision |
| 9 | alternate-reviewer roster for §7.2 | owner decision (R-1) |
| 10 | statutory disclosure procedure and counsel | legal owner |
| 11 | cross-domain (Skylink/EMPIRE) shared moderation | explicitly **not** designed here — no second Hub is implied |
| 12 | DM (`message-dm`) moderation depth | Skylink D18 owner; only the enum slot is reserved |
| 13 | quantitative SLA validation | post-pilot |
| 14 | appeal-success-rate metrics | post-pilot |
| 15 | ombuds/external escalation body | owner decision |
| 16 | data-retention period for closed cases | legal/security owner |
| 17 | export of a full case for litigation | legal owner, after a hold exists |
| 18 | multi-language report handling | content owner |
| 19 | redaction tooling for excerpts | implementation |
| 20 | moderator tooling beyond the 4 declared in M32-02 §6 | implementation |

## 11. Rollback

1. revert the commit adding this file and the TODO.md row change;
2. no queue, table, flag, or notification exists to unwind — nothing was implemented;
3. if a later implementation ships and this ladder is replaced, three properties must survive: **no
   irreversible action without a legal reviewer (level 6), no auto-expiry-less temporary action (§6.4),
   and no self-review of an appeal (§7.2)**. Dropping any one is a governance regression, not a
   simplification.

## 12. Acceptance Criteria

### 12.1 Positive test — report, hide, appeal, reverse

```bash
# synthetic member/report/case; runnable only once a HARBOR moderation surface exists
node scripts/diagnostics/harbor-moderation-flow.mjs --scenario report-hide-appeal-reverse
```

| # | assertion |
|---|---|
| P-1 | report created anonymously, `state=new`, `sla_due_at = created + 24 h`, no `reporter_ref` |
| P-2 | assignment refuses a moderator who acted on that member within 30 d, and picks another |
| P-3 | level-3 `hide` with `RSN-HARASSMENT` recorded atomically with `action-applied` audit event |
| P-4 | subject notified with category, action, dates, appeal link; notification contains no reporter identity |
| P-5 | derivative readers get 404; tombstone exists and retains hashes and dates (M32-03 §4.5) |
| P-6 | appeal filed by the author within the window → `state=filed`, `due_at = +14 d` |
| P-7 | §7.2 admits only a non-actor reviewer; the original actor is refused assignment |
| P-8 | decision `granted` → action lifted, readers restored, tombstone `reversed=true`, audit has `appeal-granted` |
| P-9 | every case, action and appeal has an audit event carrying `actor_session` |
| P-10 | nothing in the audit log or excerpts contains a private-library reference or an unscrubbed identifier |

Observed result at authoring: **not run** — the diagnostics runner does not exist. The recipe is the
deliverable; passage is not claimed.

### 12.2 Negative tests

| # | scenario | expected safe failure |
|---|---|---|
| N-1 | `targetKind=library-item` submitted | 422 `VALIDATION_FAILED`; enum has no such value (M32-03 I-1) |
| N-2 | moderator applies level 5 `suspend-account` | 403 `ROLE_FORBIDDEN` |
| N-3 | moderator applies level 6 `legal-hold` | 403 `ROLE_FORBIDDEN` |
| N-4 | action without a reason code | 422 `VALIDATION_FAILED` |
| N-5 | `ladder_level=7` | 422 (CHECK constraint) |
| N-6 | level ≥4 justified with `RSN-OTHER` | 422 `REASON_TOO_VAGUE` |
| N-7 | automated keyword rule attempts `hide` (level 3) | blocked; automation capped at level 2 |
| N-8 | reporter identity requested by the subject's UI | no disclosure path exists; response omits it entirely |
| N-9 | subject appeals a `RSN-CONSENT-WITHDRAWN` hide on someone else's behalf | 403; withdrawal is the author's dispositive act |
| N-10 | forged audit event without a valid `actor_session` | rejected; event not written |
| N-11 | same moderator assigned to appeal their own action | refused (§7.2), case reassigned |
| N-12 | legal-reviewer attempts a library read outside an escalated case | 403 and a `disclosure-attempt-denied` audit event |
| N-13 | expired level-2 `reduce-visibility` still applied | effect removed automatically; no human intervention required |
| N-14 | appeal asserts restoration after the consent grant expired | decision states the blocker is authorisation, nothing is republished (M32-03 §4.1.2) |
| N-15 | replayed "apply action" with an idempotency key already seen | original action returned; no duplicate audit event, no double duration |

N-15 exists because this repository already met payment replay in M35-04 and M35-05 — a duplicate
`hide` that silently doubles a suspension duration is the same class of bug wearing different clothes.

### 12.3 Commands available now

```bash
git rev-parse --abbrev-ref HEAD   # dev
```

No moderation package script, migration, or test exists. Root `pnpm verify` is a broad integration
check and proves nothing about this specification.

## 13. Conclusion

Moderation in a community built on testimony has one failure mode that matters more than any queue
throughput metric: the tool meant to protect members becomes a way to quietly suppress a member's own
published account. This specification answers that with four structural properties rather than good
intentions — the reportable-object type cannot name a private library item, every temporary action ends
by itself, the person who acted cannot decide the appeal against their own act, and the one exception
that lets a legal reviewer see private material is time-boxed, single-item, and disclosed to the member
it concerns.

## Appendix A: Report → Action → Appeal Sequence

```
reporter        HARBOR report queue     moderator        subject member      appeals reviewer   audit
   │ file          │                        │                   │                    │          │
   ├──────────────>state=new (anon) ───────>│ assign (skip 30d actors)              │          │
   │               │── sla_due=+24h ───────>│                                    │          │
   │               │                        │ read derivative (never library)     │          │
   │               │                        ├─ action level 3 RSN-HARASSMENT ─────┤─> notify │
   │               │                        │                                   │  +appeal link
   │               │<─ state=action-applied ─┤                                   │          ├─ action-applied
   │  (closure)    │                        │                                   ├─ appeal filed
   │<── no action on reporter identity ──────┤                                   │   due=+14d ├─ appeal-filed
   │               │                        │                 §7.2: actor barred ┤ assign other
   │               │                        │                                   ├─ granted
   │               │<─ action lifted ────────┤<── readers restored ──────────────┤          ├─ appeal-granted
   │               │                        │                                   │  tombstone reversed=true
```

## Appendix B: Separation Matrix (who may do what to whom)

| actor \ target | their own action | another actor's action | their own content | another member's content | private library |
|---|---|---|---|---|---|
| moderator | ❌ appeal | ✅ triage/act 1–4 | ❌ (no self-moderation) | ✅ act 1–4 | ❌ |
| admin | ❌ appeal own | ✅ appeal others' | ❌ | ✅ act 1–5 | ❌ |
| legal-reviewer | — | ✅ appeal any (if §7.2 clean) | ❌ | ✅ act 1–6 | ✅ only via §7.3 |
| subject member | — | ✅ appeal own action once, second-review once | ✅ export/delete | ❌ | ✅ own only |
| reporter | — | ❌ (may refile with new evidence) | ❌ | ❌ | ❌ |
| system | — | auto-expire 2–5 | — | levels 1–2 only | ❌ |

"no self-moderation" exists because a moderator publishing their own content should not be able to
clear a report against it; the case is routed to another actor by the same rule that bars self-appeal.

## Appendix C: Reason Code → Route Map

```
RSN-COPYRIGHT        -> legal-reviewer            (M03-06 §3 takedown/copyright)
RSN-MINOR-SAFETY     -> legal-reviewer, 1h SLA    (M03-06 §2 protection of minors)
RSN-NO-CONSENT       -> moderator, checks M32-03 §4.1 grants
RSN-CONSENT-WITHDRAWN-> automatic takedown task, non-appealable
RSN-PRIVATE-DISCLOSURE-> moderator + redaction; escalates if third party identifiable
RSN-HARASSMENT       -> moderator
RSN-MISINFORMATION   -> moderator; requires cited counter-evidence ref
RSN-DANGEROUS        -> moderator; never keyword-only
RSN-SPAM             -> system (levels 1–2) or moderator
RSN-DUPLICATE        -> merge into existing case
RSN-UNSAFE-TAG       -> moderator, level 4 require-edit preferred
RSN-OTHER            -> moderator, free text mandatory, max level 3
```

## Appendix D: Glossary (selected)

| term | definition used here |
|---|---|
| case | a report and every action, appeal, hold and note sharing one `caseId` |
| action | a dated, reason-coded intervention on a derivative or profile, at one ladder level |
| ladder level | the severity of an action, 1 (observe) to 6 (legal hold) |
| derivative | the published object a moderation action may target (M32-03 §4.2) |
| tombstone | post-removal metadata-and-hash record; gains `reversed=true` on restoration |
| appeal | a dated request by the subject that an action be reviewed by a non-actor |
| second review | one escalation of a `denied` appeal to a more senior non-participant |
| denied-final | the terminal internal denial, only issuable under §7.2 |
| legal hold | a preservation state that freezes deletion, gated to the legal reviewer |
| separation of powers | the rule that no principal both acts on a case and decides its appeal |
| SLA breach | the clock passing `sla_due_at`, which escalates rather than merely recording |
| auto-expiry | the store ending a temporary action without human memory being required |
| scoped disclosure | the single time-boxed legal-reviewer read permitted by §7.3 |
| existence leak | a response revealing that an item exists though its content is withheld |
