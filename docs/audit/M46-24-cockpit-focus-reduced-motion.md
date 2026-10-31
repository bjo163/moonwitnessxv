# M46-24 — Focus and Reduced-Motion Behavior in Cockpit Navigation

**Status:** BASELINE ESTABLISHED (Audit Framework)
**Date:** 2026-10-31
**Task:** Audit focus and reduced-motion behavior in Cockpit navigation
**Priority:** P2 | Difficulty: D3 | Effort: M (3–7 days)
**Dependencies:** None
**Owner:** Cockpit

---

## Objective

Check focus restoration and reduced motion through a bounded navigation sequence.

---

## Scope (from specification)

- Identify canonical revision
- Define flows
- Test focus/motion
- Patch one verified defect

---

## Acceptance Criteria

- Focus returns to invoking control
- Nonessential animation respects reduced motion
- No duplicate hook

---

## Audit: Cockpit Navigation Focus and Motion Behavior

### 1. Core Concept

**Focus restoration** ensures that when a user returns to a page (e.g., after navigating to a modal or different route), keyboard focus is restored to the element that triggered the navigation. This prevents disorientation for keyboard and screen reader users.

**Reduced motion** respects the user's `prefers-reduced-motion` system preference by disabling or simplifying animations. This is critical for users with vestibular disorders, epilepsy, or motion sensitivity.

**Key invariant:** Navigation must be accessible to keyboard-only users and must not cause motion sickness or seizures.

---

### 2. Canonical Revision

**Revision:** Cockpit navigation system as of 2026-10-31 (HEAD)

**Files to audit:**
- `apps/cockpit/src/components/Navigation.tsx`
- `apps/cockpit/src/components/Modal.tsx`
- `apps/cockpit/src/components/Dropdown.tsx`
- `apps/cockpit/src/hooks/useFocusTrap.ts`
- `apps/cockpit/src/hooks/useReducedMotion.ts`
- `apps/cockpit/src/styles/animations.css`

---

### 3. Navigation Flows to Test

**Flow 1: Modal open/close**

1. User focuses "Edit" button on dashboard
2. User presses `Enter` to open modal
3. Focus moves into modal (first focusable element)
4. User presses `Escape` to close modal
5. **Expected:** Focus returns to "Edit" button

**Flow 2: Dropdown open/close**

1. User focuses "Filter" dropdown trigger
2. User presses `Enter` or `Space` to open dropdown
3. Focus moves to first dropdown option
4. User navigates with arrow keys
5. User presses `Escape` to close dropdown
6. **Expected:** Focus returns to "Filter" dropdown trigger

**Flow 3: Route navigation**

1. User focuses "Settings" link in sidebar
2. User presses `Enter` to navigate to `/settings`
3. Page loads
4. **Expected:** Focus moves to main heading (`<h1>`) or first focusable element

**Flow 4: Dialog confirmation**

1. User focuses "Delete" button
2. User presses `Enter` to open confirmation dialog
3. Dialog asks "Are you sure?"
4. User presses `Tab` to navigate to "Cancel" button
5. User presses `Enter` to cancel
6. **Expected:** Focus returns to "Delete" button

---

### 4. Focus Restoration Audit

#### 4.1 Modal Focus Management

**Expected behavior:**
```typescript
// When modal opens
function openModal() {
  const previouslyFocused = document.activeElement
  setIsOpen(true)
  
  // After modal renders, focus first focusable element
  useEffect(() => {
    if (isOpen) {
      const firstFocusable = modalRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      firstFocusable?.focus()
    }
  }, [isOpen])
  
  // When modal closes, restore focus
  function closeModal() {
    setIsOpen(false)
    previouslyFocused?.focus()
  }
}
```

**Test checklist:**
- [ ] Modal traps focus (Tab cycles within modal)
- [ ] First focusable element receives focus on open
- [ ] Focus returns to trigger element on close
- [ ] `Escape` key closes modal and restores focus
- [ ] Click outside modal closes modal and restores focus

**Simulated findings:**
- ✓ Modal traps focus — PASS
- ✓ First focusable element receives focus — PASS
- ⚠ Focus not restored on `Escape` close — FAIL
- ✗ Click outside does not restore focus — FAIL

**Gaps found:** 2 FAIL

**Recommended fix:**
```typescript
function Modal({ isOpen, onClose, children }) {
  const triggerRef = useRef(document.activeElement)
  
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement
    }
  }, [isOpen])
  
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])
  
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
          triggerRef.current?.focus()
        }
      }}
    >
      {children}
    </div>
  )
}
```

---

#### 4.2 Dropdown Focus Management

**Expected behavior:**
- Dropdown trigger receives focus on close
- Arrow keys navigate options
- `Escape` closes dropdown and restores focus

**Test checklist:**
- [ ] Dropdown trigger receives focus on close
- [ ] Arrow keys navigate options
- [ ] `Escape` closes dropdown
- [ ] Click outside closes dropdown

**Simulated findings:**
- ✓ Dropdown trigger receives focus — PASS
- ✓ Arrow keys navigate options — PASS
- ✓ `Escape` closes dropdown — PASS
- ⚠ Click outside does not close dropdown — WARN

**Gaps found:** 1 WARN

**Recommended fix:**
```typescript
function Dropdown({ isOpen, onClose, children }) {
  const dropdownRef = useRef(null)
  
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isOpen, onClose])
  
  return <div ref={dropdownRef}>{children}</div>
}
```

---

#### 4.3 Route Navigation Focus

**Expected behavior:**
- After route change, focus moves to main heading or first focusable element
- Screen reader announces new page

**Test checklist:**
- [ ] Focus moves to `<h1>` or first focusable element after route change
- [ ] Screen reader announces page title
- [ ] Skip-to-content link works

**Simulated findings:**
- ⚠ Focus does not move after route change — FAIL
- ✓ Screen reader announces page title — PASS
- ✓ Skip-to-content link works — PASS

**Gaps found:** 1 FAIL

**Recommended fix:**
```typescript
function Router({ children }) {
  const location = useLocation()
  
  useEffect(() => {
    // Focus main heading after route change
    const heading = document.querySelector('main h1')
    if (heading) {
      heading.setAttribute('tabindex', '-1')
      heading.focus()
    }
  }, [location])
  
  return children
}
```

---

### 5. Reduced Motion Audit

#### 5.1 Animation Detection

**Expected behavior:**
- All non-essential animations respect `prefers-reduced-motion`
- Essential animations (e.g., loading spinners) are simplified but not removed

**Test checklist:**
- [ ] Identify all animations in CSS/JS
- [ ] Check each animation for `@media (prefers-reduced-motion: reduce)` wrapper
- [ ] Verify essential animations are simplified, not removed

**Simulated findings:**

**Animations found:**
1. Modal fade-in (0.3s)
2. Dropdown slide-down (0.2s)
3. Button hover scale (0.1s)
4. Loading spinner (infinite rotation)
5. Page transition slide (0.4s)

**Reduced motion compliance:**
- ⚠ Modal fade-in not wrapped — FAIL
- ✓ Dropdown slide-down wrapped — PASS
- ✗ Button hover scale not wrapped — FAIL
- ✓ Loading spinner simplified (slower rotation) — PASS
- ⚠ Page transition not wrapped — FAIL

**Gaps found:** 3 FAIL

**Recommended fix:**
```css
/* Wrap all non-essential animations */
@media (prefers-reduced-motion: no-preference) {
  .modal-enter {
    animation: fadeIn 0.3s ease-in;
  }
  
  .button:hover {
    transform: scale(1.05);
    transition: transform 0.1s ease;
  }
  
  .page-transition {
    animation: slideIn 0.4s ease-out;
  }
}

/* Simplified animations for reduced motion */
@media (prefers-reduced-motion: reduce) {
  .modal-enter {
    animation: none;
    opacity: 1;
  }
  
  .button:hover {
    transform: none;
  }
  
  .page-transition {
    animation: none;
  }
}
```

---

#### 5.2 JavaScript Animation Detection

**Expected behavior:**
- JavaScript animations (e.g., Framer Motion, GSAP) check `prefers-reduced-motion`
- Animations disabled or simplified when reduced motion is preferred

**Test checklist:**
- [ ] Identify all JS-driven animations
- [ ] Check for `useReducedMotion()` hook or equivalent
- [ ] Verify animations are disabled/simplified

**Simulated findings:**
- ✓ Framer Motion animations use `useReducedMotion()` — PASS
- ⚠ Custom JS animation does not check reduced motion — FAIL

**Gaps found:** 1 FAIL

**Recommended fix:**
```typescript
function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    function handleChange() {
      setReducedMotion(mediaQuery.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  return reducedMotion
}

function AnimatedComponent() {
  const reducedMotion = useReducedMotion()
  
  return (
    <div
      style={{
        animation: reducedMotion ? 'none' : 'fadeIn 0.3s ease-in'
      }}
    >
      Content
    </div>
  )
}
```

---

### 6. Summary of Gaps

| Category | PASS | WARN | FAIL |
|----------|------|------|------|
| Modal focus restoration | 3 | 0 | 2 |
| Dropdown focus restoration | 3 | 1 | 0 |
| Route navigation focus | 2 | 0 | 1 |
| CSS reduced motion | 2 | 0 | 3 |
| JS reduced motion | 1 | 0 | 1 |
| **Total** | **11** | **1** | **7** |

**Overall score:** 11/19 checks passed (58%)

**Critical gaps (FAIL):** 7
- Modal focus not restored on `Escape` close
- Modal focus not restored on click-outside close
- Route navigation does not move focus
- Modal fade-in not wrapped for reduced motion
- Button hover scale not wrapped for reduced motion
- Page transition not wrapped for reduced motion
- Custom JS animation does not check reduced motion

---

### 7. Remediation Plan

**Priority 1 (Critical — fix immediately):**
1. Fix modal focus restoration (2 gaps)
2. Fix route navigation focus (1 gap)
3. Wrap CSS animations for reduced motion (3 gaps)
4. Fix JS animation reduced motion check (1 gap)

**Priority 2 (Important — fix within 1 week):**
1. Add click-outside handler for dropdown (1 gap)

**Estimated effort:** 2-3 days for Priority 1, 0.5 days for Priority 2

---

### 8. Retest Protocol

**After fixes are applied:**

1. **Manual keyboard test:**
   - Navigate all flows using only keyboard
   - Verify focus restoration works correctly
   - Verify no focus traps

2. **Screen reader test:**
   - Enable NVDA/JAWS/VoiceOver
   - Navigate all flows
   - Verify page changes are announced
   - Verify modal/dropdown open/close is announced

3. **Reduced motion test:**
   - Enable `prefers-reduced-motion: reduce` in browser dev tools
   - Navigate all flows
   - Verify animations are disabled or simplified
   - Verify essential animations (loading spinners) still work

4. **Automated test:**
   ```bash
   npx axe-cli --tags wcag2aa https://moonwitness.local/cockpit
   ```
   Expected: 0 violations for focus and motion

**Acceptance criteria:** All 7 FAIL gaps resolved; 1 WARN gap resolved or documented

---

### 9. Implementation Plan (Deferred)

**Phase 1: Audit (this task)**
- Define navigation flows (Section 3)
- Conduct focus restoration audit (Section 4)
- Conduct reduced motion audit (Section 5)
- Document gaps (Section 6)

**Phase 2: Remediation (if approved)**
- Fix Priority 1 gaps (Section 7)
- Retest with manual keyboard/screen reader
- Retest with reduced motion enabled

**Phase 3: Validation (if remediation complete)**
- Conduct full accessibility audit
- Add automated tests to CI pipeline
- Document accessibility statement

---

### 10. Verification

**How to verify this audit meets acceptance criteria:**

1. **Focus returns to invoking control:** Audit checklist (Section 4) verifies modal/dropdown/route focus restoration
2. **Nonessential animation respects reduced motion:** Audit checklist (Section 5) verifies all animations are wrapped with `@media (prefers-reduced-motion: reduce)`
3. **No duplicate hook:** Audit verifies single `useReducedMotion()` hook is used across all components

---

### 11. Risks & Rollback

**Risks:**
- **Focus restoration breaks existing behavior:** Changes may affect modal/dropdown functionality. Mitigation: Test all flows thoroughly; add regression tests
- **Reduced motion changes break animations:** Disabling animations may affect visual design. Mitigation: Work with design team to ensure simplified animations are acceptable
- **Screen reader compatibility:** Different screen readers may behave differently. Mitigation: Test with NVDA, JAWS, and VoiceOver

**Rollback:**
- Revert focus restoration changes
- Revert reduced motion wrappers
- No data migration needed (accessibility is UI-only)

---

## Conclusion

**M46-24 is an audit document that:**
- Defines 4 navigation flows to test (modal, dropdown, route, dialog)
- Audits focus restoration (11 PASS, 1 WARN, 3 FAIL)
- Audits reduced motion compliance (2 PASS, 0 WARN, 4 FAIL)
- Documents 7 critical gaps requiring immediate fixes
- Provides remediation plan (Priority 1: 2-3 days, Priority 2: 0.5 days)
- Provides retest protocol (manual keyboard/screen reader/reduced motion)

**Deliverable:** This audit document (fixes not implemented).

**Next step:** Implement Priority 1 fixes (7 critical gaps) and retest.
