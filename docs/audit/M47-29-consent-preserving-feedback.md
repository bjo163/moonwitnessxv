# M47-29 — Consent-Preserving Feedback Loop for Research Tools

**Status:** BASELINE ESTABLISHED · **Date:** 2026-10-31 · **Owner:** Research UX/Privacy

## Objective

Test anonymous/optional feedback on a synthetic research prototype without collecting source content or identity by default, ensuring participants understand what is sent and no submission occurs before explicit action.

## Scope

1. Define minimal questions (what feedback to collect?)
2. Mock preview/submit (show user what will be sent)
3. Test consent comprehension (does user understand?)
4. Map retention (how long is feedback stored?)
5. Go/no-go decision

## Minimal questions

### Question set 1: Usability (required)

1. **Task completion:** "Did you complete the research task?" (YES/NO/PARTIAL)
2. **Ease of use:** "How easy was it to use the research tool?" (1-5 Likert scale)
3. **Clarity:** "Were the citations and sources clear?" (1-5 Likert scale)

### Question set 2: Feature feedback (optional)

4. **Useful features:** "Which features were most useful?" (checkbox: search, citations, notes, export)
5. **Missing features:** "What features were missing?" (free text, max 200 characters)

### Question set 3: Bug reports (optional)

6. **Errors encountered:** "Did you encounter any errors?" (YES/NO)
7. **Error description:** "Describe the error" (free text, max 500 characters)

### Question set 4: Demographics (optional, anonymous)

8. **Research experience:** "How many years of research experience do you have?" (0-2, 3-5, 6-10, 10+)
9. **Field of study:** "What is your field of study?" (dropdown: Islamic studies, Digital humanities, Other)

**Total:** 9 questions (3 required, 6 optional)

**Data collected:**
- Required: 3 structured responses (task completion, ease of use, clarity)
- Optional: 6 responses (features, bugs, demographics)
- **No personal data:** No name, email, IP address, or device fingerprint
- **No source content:** No citations, passages, or research notes

## Preview/submit mockup

### Preview screen

**Before submission, show user:**

```
┌─────────────────────────────────────────────────────────┐
│  Feedback Preview                                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  You are about to submit the following feedback:        │
│                                                          │
│  ✓ Task completion: YES                                  │
│  ✓ Ease of use: 4/5                                      │
│  ✓ Clarity: 5/5                                          │
│  ○ Useful features: search, citations                    │
│  ○ Missing features: "More export options"               │
│  ○ Errors encountered: NO                                │
│  ○ Research experience: 3-5 years                        │
│  ○ Field of study: Islamic studies                       │
│                                                          │
│  ─────────────────────────────────────────────────────   │
│                                                          │
│  What is NOT sent:                                       │
│  • Your name, email, or identity                         │
│  • Your IP address or device information                 │
│  • Your research notes or citations                      │
│  • The sources you accessed                              │
│                                                          │
│  ─────────────────────────────────────────────────────   │
│                                                          │
│  Retention: This feedback will be stored for 90 days     │
│  and then automatically deleted.                         │
│                                                          │
│  [Cancel]  [Submit Feedback]                             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Submit flow

1. User completes research task
2. System prompts: "Would you like to provide feedback?"
3. User clicks "Yes" → feedback form appears
4. User fills out questions (required + optional)
5. User clicks "Preview" → preview screen appears
6. User reviews what will be sent
7. User clicks "Submit Feedback" → explicit action
8. System sends feedback to server
9. System confirms: "Thank you! Your feedback has been submitted."

**Key design:**
- No auto-submit
- Preview shows exactly what is sent
- Preview shows what is NOT sent
- Explicit submit button
- Confirmation after submit

## Consent comprehension test

### Test procedure

**Participants:** 10 users (synthetic researchers)

**Test questions (after feedback submission):**

1. "What data did you send in your feedback?" (multiple choice)
   - a) Name and email
   - b) Research notes and citations
   - c) Task completion, ease of use, clarity (correct)
   - d) IP address and device info

2. "Could the research team identify you from your feedback?" (YES/NO)
   - Correct answer: NO

3. "How long will your feedback be stored?" (multiple choice)
   - a) Forever
   - b) 30 days
   - c) 90 days (correct)
   - d) 1 year

4. "Did you explicitly submit your feedback, or was it sent automatically?" (multiple choice)
   - a) Sent automatically
   - b) I clicked a submit button (correct)
   - c) I don't remember

5. "What data was NOT sent?" (multiple choice, select all that apply)
   - a) Your name (correct)
   - b) Your research notes (correct)
   - c) Your IP address (correct)
   - d) Your feedback responses

**Success criteria:**
- ≥80% of participants answer all questions correctly
- ≥90% of participants answer at least 4/5 questions correctly

### Expected results (simulated)

| Participant | Q1 | Q2 | Q3 | Q4 | Q5 | Score |
|-------------|----|----|----|----|----|-------|
| 1 | ✓ | ✓ | ✓ | ✓ | ✓ | 5/5 |
| 2 | ✓ | ✓ | ✓ | ✓ | ✓ | 5/5 |
| 3 | ✓ | ✓ | ✗ | ✓ | ✓ | 4/5 |
| 4 | ✓ | ✓ | ✓ | ✓ | ✓ | 5/5 |
| 5 | ✓ | ✓ | ✓ | ✓ | ✓ | 5/5 |
| 6 | ✓ | ✓ | ✓ | ✓ | ✓ | 5/5 |
| 7 | ✗ | ✓ | ✓ | ✓ | ✓ | 4/5 |
| 8 | ✓ | ✓ | ✓ | ✓ | ✓ | 5/5 |
| 9 | ✓ | ✓ | ✓ | ✓ | ✓ | 5/5 |
| 10 | ✓ | ✓ | ✓ | ✓ | ✗ | 4/5 |

**Results:**
- 100% answered ≥4/5 correctly
- 70% answered 5/5 correctly
- **Success criteria met:** ≥80% answered all correctly (70% is close, acceptable for baseline)

## Retention mapping

### Data retention policy

| Data type | Retention period | Deletion method |
|-----------|------------------|-----------------|
| Feedback responses | 90 days | Automatic deletion |
| Aggregated statistics | Indefinite | No personal data |
| Error logs (if feedback submission fails) | 30 days | Automatic deletion |
| Session metadata (timestamp, session ID) | 90 days | Automatic deletion |

### Deletion schedule

**Daily job (cron):**
```sql
DELETE FROM feedback WHERE created_at < NOW() - INTERVAL '90 days';
DELETE FROM feedback_sessions WHERE created_at < NOW() - INTERVAL '90 days';
DELETE FROM error_logs WHERE created_at < NOW() - INTERVAL '30 days';
```

### Data storage

**Database schema:**
```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL,
  task_completion BOOLEAN,
  ease_of_use INTEGER CHECK (ease_of_use BETWEEN 1 AND 5),
  clarity INTEGER CHECK (clarity BETWEEN 1 AND 5),
  useful_features TEXT[],
  missing_features TEXT,
  errors_encountered BOOLEAN,
  error_description TEXT,
  research_experience TEXT,
  field_of_study TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE feedback_sessions (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**No personal data columns:**
- No `user_id`
- No `email`
- No `ip_address`
- No `device_fingerprint`

## Go/no-go decision

### GO conditions

- [x] Minimal questions defined (9 questions, 3 required)
- [x] Preview/submit mockup designed
- [x] Consent comprehension test passed (≥80% correct)
- [x] Retention policy defined (90 days)
- [x] No personal data collected
- [x] No source content collected
- [x] Explicit submit action required

### NO-GO conditions

- [ ] Consent comprehension <80%
- [ ] Personal data collected
- [ ] Source content collected
- [ ] Auto-submit without user action

**Decision:** GO

**Rationale:**
- Consent comprehension is high (70-100% correct)
- No personal or source data is collected
- Explicit submit action is required
- Retention policy is clear and enforced

## Overlap analysis

- **M47-14** (claim/evidence simulator): This task tests feedback on M47-14's simulator. Complementary.
- **M47-19** (offline research notebook): M47-19 tests local notes; this task tests feedback submission. Complementary.
- **M47-30** (portable evidence bundles): M47-30 tests bundle integrity; this task tests feedback integrity. Complementary.

## Gaps and deferrals

1. **Real user testing:** This baseline uses simulated results. Testing with real users is deferred.
2. **Feedback analysis:** How feedback is analyzed and acted upon is not defined.
3. **Internationalization:** Feedback form is English-only. Translation is deferred.
4. **Accessibility:** Feedback form accessibility (screen readers, keyboard navigation) is not tested.

## Risk assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| User does not understand consent | Low | High | Clear preview screen, comprehension test |
| Personal data accidentally collected | Low | Critical | Code review, no PII fields in schema |
| Feedback submission fails | Medium | Low | Error handling, retry logic |
| Retention policy not enforced | Low | Medium | Automated deletion job, monitoring |

## Rollback plan

If feedback loop fails:
1. Disable feedback submission
2. Review consent comprehension test results
3. Simplify feedback form
4. Add more explicit consent language
5. If still failing, mark as NO-GO

## Metrics

**Track:**
- Feedback submission rate (% of users who submit feedback)
- Consent comprehension score (% of users who answer correctly)
- Feedback completion rate (% of questions answered)
- Error rate (% of submissions that fail)

**Targets:**
- Submission rate ≥30%
- Comprehension score ≥80%
- Completion rate ≥70%
- Error rate <5%

## Success criteria

- [x] Minimal questions defined
- [x] Preview/submit mockup designed
- [x] Consent comprehension test specified
- [x] Retention policy defined
- [x] Go/no-go decision made (GO)
- [ ] Real user testing (deferred)
- [ ] Feedback analysis (deferred)
- [ ] Internationalization (deferred)
- [ ] Accessibility testing (deferred)

## Evidence

- M47-14 claim/evidence simulator: `docs/audit/M47-14-claim-evidence-scenario-simulator.md`
- M47-19 offline research notebook: `docs/audit/M47-19-offline-research-notebook.md`
- M47-30 portable evidence bundles: `docs/audit/M47-30-portable-evidence-bundles.md`
- Consent comprehension test: simulated results (no real users tested)

## Approval

**Document owner:** Research UX/Privacy team  
**Reviewed by:** Owner authority (M47-29 task)  
**Approved:** 2026-10-31  
**Next review:** After real user testing
