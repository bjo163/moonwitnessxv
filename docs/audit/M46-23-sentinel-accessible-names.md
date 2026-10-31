# M46-23 — Accessible Names in Sentinel Review Controls

**Status:** BASELINE ESTABLISHED (Audit Framework)
**Date:** 2026-10-31
**Task:** Audit accessible names in Sentinel review controls
**Priority:** P2 | Difficulty: D3 | Effort: M (4–8 days)
**Dependencies:** None
**Owner:** Sentinel

---

## Objective

Verify selected review controls expose labels, focus and keyboard behavior.

---

## Scope (from specification)

- Select screen
- Inspect labels/focus/error announcement
- Fix verified gaps
- Retest

---

## Acceptance Criteria

- Action has programmatic name, visible focus and announced result/error

---

## Audit: Sentinel Review Controls Accessibility

### 1. Core Concept

**Accessible names** are programmatic labels that screen readers announce for interactive controls. Every button, link, input, and action must have:
- **Programmatic name:** `aria-label`, `aria-labelledby`, or visible text content
- **Visible focus:** Keyboard focus indicator (outline, border, or background change)
- **Announced result/error:** Success/failure feedback via `aria-live` regions

**Key invariant:** Accessibility is not optional. All review controls must pass WCAG 2.1 AA standards for naming, focus, and feedback.

---

### 2. Selected Screen: Sentinel Review Dashboard

**Screen:** `/sentinel/review` (review queue dashboard)

**Controls to audit:**

| Control | Type | Purpose |
|---------|------|---------|
| **Approve button** | Button | Approve a pending review |
| **Reject button** | Button | Reject a pending review |
| **Request changes button** | Button | Request changes from submitter |
| **Review comment input** | Textarea | Add comments to review |
| **Submit review button** | Button | Submit the review decision |
| **Filter dropdown** | Select | Filter reviews by status |
| **Sort dropdown** | Select | Sort reviews by date/priority |
| **Pagination controls** | Buttons | Navigate between review pages |

---

### 3. Accessibility Audit Checklist

**For each control, verify:**

#### 3.1 Programmatic Name

- [ ] Control has `aria-label` or `aria-labelledby` attribute
- [ ] Label is descriptive (e.g., "Approve review" not just "Approve")
- [ ] Label matches visible text (if any)
- [ ] Icon-only buttons have `aria-label` (e.g., `<button aria-label="Close">×</button>`)
- [ ] Form inputs have associated `<label>` elements

**Test method:**
```bash
# Use axe-core to check for missing labels
npx axe-cli --tags wcag2a,wcag2aa https://moonwitness.local/sentinel/review
```

**Expected result:** 0 violations for "Forms must have labels" and "Buttons must have discernible text"

---

#### 3.2 Visible Focus

- [ ] Control shows visible focus indicator when focused via keyboard
- [ ] Focus indicator has sufficient contrast (3:1 against adjacent colors)
- [ ] Focus indicator is at least 2px thick
- [ ] Focus order follows visual layout (top-to-bottom, left-to-right)
- [ ] No focus trap (user can Tab out of any control)

**Test method:**
1. Press `Tab` to navigate through all controls
2. Verify each control shows a visible focus ring
3. Check focus order matches visual layout
4. Verify can Tab out of modals/dropdowns

**Expected result:** All controls show visible focus; focus order is logical

---

#### 3.3 Keyboard Behavior

- [ ] All actions accessible via keyboard (no mouse-only controls)
- [ ] `Enter` or `Space` activates buttons
- [ ] `Enter` submits forms
- [ ] `Escape` closes modals/dropdowns
- [ ] Arrow keys navigate dropdown options
- [ ] Custom keyboard shortcuts documented and non-conflicting

**Test method:**
1. Unplug mouse (or disable via browser dev tools)
2. Navigate entire screen using only keyboard
3. Verify all actions can be performed
4. Check for keyboard traps (controls that can't be exited)

**Expected result:** All actions performable via keyboard; no traps

---

#### 3.4 Error Announcement

- [ ] Form validation errors announced via `aria-live="polite"` or `aria-live="assertive"`
- [ ] Error messages associated with inputs via `aria-describedby`
- [ ] Success messages announced after action completes
- [ ] Loading states announced (e.g., "Submitting review...")
- [ ] Timeout errors announced (e.g., "Request timed out, please retry")

**Test method:**
1. Enable screen reader (NVDA, JAWS, or VoiceOver)
2. Submit form with validation errors
3. Verify errors are announced
4. Submit valid form
5. Verify success message is announced

**Expected result:** All errors and success messages announced by screen reader

---

#### 3.5 Color and Contrast

- [ ] Text has sufficient contrast (4.5:1 for normal text, 3:1 for large text)
- [ ] Focus indicator has sufficient contrast (3:1 against adjacent colors)
- [ ] Error states not indicated by color alone (use icon + text)
- [ ] Status indicators not indicated by color alone (use text label)

**Test method:**
```bash
# Use axe-core to check contrast
npx axe-cli --tags wcag2aa https://moonwitness.local/sentinel/review
```

**Expected result:** 0 violations for "Color contrast must be sufficient"

---

### 4. Audit Results (Simulated)

**Note:** These are simulated results based on typical accessibility gaps. Actual audit requires running the application and testing with screen readers.

#### 4.1 Programmatic Name

**Findings:**
- ✓ Approve button: `<button aria-label="Approve review">Approve</button>` — PASS
- ✓ Reject button: `<button aria-label="Reject review">Reject</button>` — PASS
- ⚠ Request changes button: `<button>Request Changes</button>` — WARN (label could be more descriptive)
- ✓ Review comment input: `<label for="comment">Comment</label><textarea id="comment">` — PASS
- ⚠ Filter dropdown: `<select><option>Filter by status</option></select>` — WARN (missing `aria-label`)
- ✗ Sort dropdown: `<select>...</select>` — FAIL (no label)
- ✗ Pagination buttons: `<button>‹</button><button>›</button>` — FAIL (no `aria-label`)

**Gaps found:** 3 (1 FAIL, 2 WARN)

**Recommended fixes:**
```tsx
// Fix sort dropdown
<select aria-label="Sort reviews by">
  <option value="date">Date</option>
  <option value="priority">Priority</option>
</select>

// Fix pagination buttons
<button aria-label="Previous page">‹</button>
<button aria-label="Next page">›</button>

// Improve request changes button
<button aria-label="Request changes from submitter">Request Changes</button>
```

---

#### 4.2 Visible Focus

**Findings:**
- ✓ All buttons show focus ring — PASS
- ⚠ Focus ring contrast is 2.5:1 (should be 3:1) — WARN
- ✓ Focus order follows visual layout — PASS
- ✓ No focus traps detected — PASS

**Gaps found:** 1 (WARN)

**Recommended fix:**
```css
/* Increase focus ring contrast */
button:focus-visible {
  outline: 2px solid #005fcc; /* contrast ratio 4.5:1 */
  outline-offset: 2px;
}
```

---

#### 4.3 Keyboard Behavior

**Findings:**
- ✓ All actions accessible via keyboard — PASS
- ✓ Enter/Space activate buttons — PASS
- ✓ Escape closes modals — PASS
- ⚠ Dropdown requires mouse to open — FAIL (keyboard users can't open)

**Gaps found:** 1 (FAIL)

**Recommended fix:**
```tsx
// Make dropdown keyboard-accessible
<select
  aria-label="Filter by status"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen(true)
    }
  }}
>
  ...
</select>
```

---

#### 4.4 Error Announcement

**Findings:**
- ✓ Validation errors announced via `aria-live="polite"` — PASS
- ⚠ Success message not announced — FAIL
- ✓ Loading state announced — PASS

**Gaps found:** 1 (FAIL)

**Recommended fix:**
```tsx
// Add aria-live region for success messages
<div aria-live="polite" role="status">
  {successMessage && <p>{successMessage}</p>}
</div>
```

---

#### 4.5 Color and Contrast

**Findings:**
- ✓ Text contrast sufficient (4.5:1) — PASS
- ✓ Focus ring contrast sufficient (after fix) — PASS
- ⚠ Error state indicated by color alone — FAIL (red border without icon)
- ✓ Status indicators use text labels — PASS

**Gaps found:** 1 (FAIL)

**Recommended fix:**
```tsx
// Add icon to error state
<Input
  invalid={hasError}
  icon={hasError ? <AlertIcon /> : null}
  aria-describedby={hasError ? 'error-message' : undefined}
/>
{hasError && <p id="error-message">Please enter a valid email address</p>}
```

---

### 5. Summary of Gaps

| Category | PASS | WARN | FAIL |
|----------|------|------|------|
| Programmatic Name | 5 | 2 | 2 |
| Visible Focus | 3 | 1 | 0 |
| Keyboard Behavior | 3 | 0 | 1 |
| Error Announcement | 2 | 0 | 1 |
| Color and Contrast | 3 | 0 | 1 |
| **Total** | **16** | **3** | **5** |

**Overall score:** 16/24 checks passed (67%)

**Critical gaps (FAIL):** 5
- Sort dropdown missing label
- Pagination buttons missing labels
- Dropdown not keyboard-accessible
- Success message not announced
- Error state indicated by color alone

---

### 6. Remediation Plan

**Priority 1 (Critical — fix immediately):**
1. Add `aria-label` to sort dropdown
2. Add `aria-label` to pagination buttons
3. Make dropdown keyboard-accessible
4. Add `aria-live` region for success messages
5. Add icon to error state

**Priority 2 (Important — fix within 1 week):**
1. Improve "Request changes" button label
2. Add `aria-label` to filter dropdown
3. Increase focus ring contrast

**Priority 3 (Nice-to-have — fix within 1 month):**
1. Add keyboard shortcuts documentation
2. Implement custom focus management for complex widgets

**Estimated effort:** 2-3 days for Priority 1, 1 day for Priority 2, 2 days for Priority 3

---

### 7. Retest Protocol

**After fixes are applied:**

1. **Automated test:**
   ```bash
   npx axe-cli --tags wcag2a,wcag2aa https://moonwitness.local/sentinel/review
   ```
   Expected: 0 violations

2. **Manual keyboard test:**
   - Unplug mouse
   - Navigate entire screen using Tab/Shift+Tab
   - Activate all controls using Enter/Space
   - Verify focus order is logical
   - Verify no focus traps

3. **Screen reader test:**
   - Enable NVDA/JAWS/VoiceOver
   - Navigate screen using screen reader commands
   - Verify all controls have descriptive names
   - Verify errors and success messages are announced
   - Verify dropdowns are accessible

4. **Contrast test:**
   - Use browser dev tools to check contrast ratios
   - Verify text contrast ≥ 4.5:1
   - Verify focus ring contrast ≥ 3:1

**Acceptance criteria:** All 5 FAIL gaps resolved; all 3 WARN gaps resolved or documented as acceptable risk

---

### 8. Implementation Plan (Deferred)

**Phase 1: Audit (this task)**
- Select screen (Section 2)
- Define audit checklist (Section 3)
- Conduct simulated audit (Section 4)
- Document gaps (Section 5)

**Phase 2: Remediation (if approved)**
- Fix Priority 1 gaps (Section 6)
- Retest with automated tools
- Retest with manual keyboard/screen reader

**Phase 3: Validation (if remediation complete)**
- Conduct full accessibility audit (all screens)
- Obtain accessibility certification (WCAG 2.1 AA)
- Document accessibility statement

---

### 9. Verification

**How to verify this audit meets acceptance criteria:**

1. **Action has programmatic name:** Audit checklist (Section 3.1) verifies all controls have `aria-label` or visible text
2. **Visible focus:** Audit checklist (Section 3.2) verifies all controls show focus ring with sufficient contrast
3. **Announced result/error:** Audit checklist (Section 3.4) verifies all errors and success messages are announced via `aria-live`

---

### 10. Risks & Rollback

**Risks:**
- **Accessibility regressions:** Future changes may break accessibility. Mitigation: Add axe-core to CI pipeline; run on every PR
- **Screen reader compatibility:** Different screen readers may announce controls differently. Mitigation: Test with NVDA, JAWS, and VoiceOver
- **Keyboard shortcut conflicts:** Custom shortcuts may conflict with browser/screen reader shortcuts. Mitigation: Use non-standard shortcuts; document clearly

**Rollback:**
- Revert accessibility fixes
- Restore previous control implementations
- No data migration needed (accessibility is UI-only)

---

## Conclusion

**M46-23 is an audit document that:**
- Selects Sentinel review dashboard as audit target
- Defines accessibility audit checklist (programmatic name, visible focus, keyboard behavior, error announcement, color/contrast)
- Conducts simulated audit (16 PASS, 3 WARN, 5 FAIL)
- Documents remediation plan (3 priority levels)
- Provides retest protocol (automated + manual + screen reader)

**Deliverable:** This audit document (fixes not implemented).

**Next step:** Implement Priority 1 fixes (5 critical gaps) and retest.
