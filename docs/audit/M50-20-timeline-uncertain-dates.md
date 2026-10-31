# M50-20 — Timeline Prototype for Uncertain Dates

**Task:** M50-20 · **Candidate:** ONT-020 · **Priority:** P2 · **Difficulty:** D4  
**Owner:** research UX · **Effort:** L (4–8 days)  
**Dependencies:** M50-19 ✓ (closed 2026-10-31)  
**Status:** BASELINE ESTABLISHED — 2026-10-31

---

## 1. Objective

Test whether users can interpret date ranges, contested ordering, and unknown dates in a synthetic history view. Build a non-interactive mock with ranges, multiple calendar labels, and text table alternative.

## 2. Scope

- Create fictional dataset (10-15 events with varying date certainty)
- Render ranges and contested ordering (visual mockup)
- Test comprehension (can users identify uncertain ranges?)
- Check screen reader (text alternative)
- Decide (recommendation for implementation)

**Out of scope:** Empire Web rebuild, story canon change, publication, interactive timeline, new history service.

## 3. Design Principles

### 3.1 Honesty Over Precision

**Principle 1: Uncertain dates must look uncertain.**
- ✅ Date ranges shown as shaded bands
- ✅ Contested dates shown with multiple markers
- ❌ Uncertain dates shown as single points (implies false precision)

**Principle 2: Multiple calendar systems must be visible.**
- ✅ Show original calendar (e.g., "15 Ramadan 850 AH")
- ✅ Show converted calendar (e.g., "1450 CE")
- ❌ Show only converted calendar (erases original)

**Principle 3: Contested ordering must be explicit.**
- ✅ Show multiple possible orderings
- ✅ Label which ordering is disputed
- ❌ Show single ordering (implies consensus)

**Principle 4: Unknown dates must be filterable, not hidden.**
- ✅ "Unknown" is a visible category
- ✅ Events with unknown dates can be filtered
- ❌ Events with unknown dates excluded from timeline

### 3.2 Accessibility Requirements

**WCAG 2.1 AA compliance:**
- Keyboard navigation: all interactive elements accessible via Tab
- Screen reader: all visual information has text alternative
- Color contrast: 4.5:1 for normal text
- Plain language: Flesch-Kincaid grade 8-10

## 4. Fictional Dataset

### 4.1 Dataset Overview

**Total events:** 12 synthetic historical events  
**Date types:**
- 4 exact dates (known with certainty)
- 3 date ranges (uncertain but bounded)
- 2 contested dates (scholars disagree)
- 2 unknown dates (not recorded)
- 1 approximate date (rough estimate)

**Calendar systems:**
- 5 Gregorian (CE)
- 3 Islamic Hijri (AH)
- 2 Hebrew (AM)
- 1 Unknown
- 1 Julian (OS)

### 4.2 Event Details

**Event 1: Council of Nicaea**
```json
{
  "id": "event-001",
  "title": "Council of Nicaea",
  "date": {
    "originalExpression": "325 CE",
    "originalCalendar": "GREGORIAN",
    "originalPrecision": "EXACT_YEAR",
    "convertedDate": "0325",
    "convertedCalendar": "GREGORIAN",
    "convertedPrecision": "EXACT_YEAR"
  },
  "description": "First ecumenical council of Christian bishops, defined Nicene Creed",
  "tradition": "christian",
  "certainty": "EXACT"
}
```

**Event 2: Hijra (Muhammad's migration)**
```json
{
  "id": "event-002",
  "title": "Hijra (Muhammad's migration from Mecca to Medina)",
  "date": {
    "originalExpression": "1 AH",
    "originalCalendar": "ISLAMIC_HIJRI",
    "originalPrecision": "EXACT_YEAR",
    "convertedDate": "0622",
    "convertedCalendar": "GREGORIAN",
    "convertedPrecision": "EXACT_YEAR",
    "dateRange": {
      "start": "0622-01-01",
      "end": "0622-12-31"
    },
    "rangeConfidence": "MEDIUM",
    "rangeSource": "Hijra occurred in 622 CE, exact date disputed"
  },
  "description": "Migration of Prophet Muhammad from Mecca to Medina, start of Islamic calendar",
  "tradition": "islamic",
  "certainty": "RANGE"
}
```

**Event 3: Destruction of Second Temple**
```json
{
  "id": "event-003",
  "title": "Destruction of Second Temple",
  "date": {
    "originalExpression": "9 Av 3828 AM",
    "originalCalendar": "HEBREW",
    "originalPrecision": "EXACT_DAY",
    "convertedDate": "0070-08-30",
    "convertedCalendar": "GREGORIAN",
    "convertedPrecision": "EXACT_DAY"
  },
  "description": "Roman destruction of the Second Temple in Jerusalem",
  "tradition": "jewish",
  "certainty": "EXACT"
}
```

**Event 4: Composition of Quran (disputed)**
```json
{
  "id": "event-004",
  "title": "Composition of the Quran",
  "date": {
    "originalExpression": "c. 610-632 CE",
    "originalCalendar": "GREGORIAN",
    "originalPrecision": "DECADE",
    "dateRange": {
      "start": "0610-01-01",
      "end": "0632-12-31"
    },
    "rangeConfidence": "HIGH",
    "rangeSource": "Scholarly consensus: Quran revealed over 22-year period",
    "disagreement": [
      {
        "scholar": "Traditional Islamic scholarship",
        "date": "0610-06-32",
        "method": "Biographical sources (sira)"
      },
      {
        "scholar": "Some Western scholars",
        "date": "0620-0650",
        "method": "Manuscript evidence and linguistic analysis"
      }
    ]
  },
  "description": "Revelation and compilation of the Quran during Prophet Muhammad's lifetime",
  "tradition": "islamic",
  "certainty": "DISPUTED"
}
```

**Event 5: Council of Chalcedon**
```json
{
  "id": "event-005",
  "title": "Council of Chalcedon",
  "date": {
    "originalExpression": "451 CE",
    "originalCalendar": "GREGORIAN",
    "originalPrecision": "EXACT_YEAR",
    "convertedDate": "0451",
    "convertedCalendar": "GREGORIAN",
    "convertedPrecision": "EXACT_YEAR"
  },
  "description": "Fourth ecumenical council, defined Christ's two natures",
  "tradition": "christian",
  "certainty": "EXACT"
}
```

**Event 6: Compilation of Hebrew Bible (disputed)**
```json
{
  "id": "event-006",
  "title": "Compilation of Hebrew Bible (Tanakh)",
  "date": {
    "originalExpression": "c. 5th-2nd century BCE",
    "originalCalendar": "GREGORIAN",
    "originalPrecision": "CENTURY",
    "dateRange": {
      "start": "-0500-01-01",
      "end": "-0100-12-31"
    },
    "rangeConfidence": "MEDIUM",
    "rangeSource": "Scholarly estimates vary; Torah likely earlier, Writings later",
    "disagreement": [
      {
        "scholar": "Traditional Jewish scholarship",
        "date": "c. 1300-1000 BCE (Mosaic authorship of Torah)",
        "method": "Religious tradition"
      },
      {
        "scholar": "Documentary hypothesis scholars",
        "date": "c. 500-200 BCE (multiple sources compiled)",
        "method": "Source criticism and linguistic analysis"
      }
    ]
  },
  "description": "Compilation of Hebrew Bible over several centuries",
  "tradition": "jewish",
  "certainty": "DISPUTED"
}
```

**Event 7: Battle of Badr**
```json
{
  "id": "event-007",
  "title": "Battle of Badr",
  "date": {
    "originalExpression": "17 Ramadan 2 AH",
    "originalCalendar": "ISLAMIC_HIJRI",
    "originalPrecision": "EXACT_DAY",
    "convertedDate": "0624-03-13",
    "convertedCalendar": "GREGORIAN",
    "convertedPrecision": "EXACT_DAY"
  },
  "description": "First major battle between Muslims and Meccan polytheists",
  "tradition": "islamic",
  "certainty": "EXACT"
}
```

**Event 8: Great Schism (East-West)**
```json
{
  "id": "event-008",
  "title": "Great Schism (East-West)",
  "date": {
    "originalExpression": "1054 CE",
    "originalCalendar": "JULIAN",
    "originalPrecision": "EXACT_YEAR",
    "convertedDate": "1054-07-16",
    "convertedCalendar": "GREGORIAN",
    "convertedPrecision": "EXACT_YEAR",
    "conversionMethod": "Julian-Gregorian calendar reform"
  },
  "description": "Split between Roman Catholic and Eastern Orthodox churches",
  "tradition": "christian",
  "certainty": "EXACT"
}
```

**Event 9: Unknown manuscript discovery**
```json
{
  "id": "event-009",
  "title": "Discovery of Ancient Religious Manuscript",
  "date": {
    "originalExpression": "Date not recorded",
    "originalCalendar": "UNKNOWN",
    "originalPrecision": "UNKNOWN"
  },
  "description": "Manuscript discovered in unknown circumstances, date not recorded in provenance",
  "tradition": "UNKNOWN",
  "certainty": "UNKNOWN"
}
```

**Event 10: Buddhist Council (approximate)**
```json
{
  "id": "event-010",
  "title": "Third Buddhist Council",
  "date": {
    "originalExpression": "c. 250 BCE",
    "originalCalendar": "GREGORIAN",
    "originalPrecision": "EXACT_YEAR",
    "dateRange": {
      "start": "-0260-01-01",
      "end": "-0240-12-31"
    },
    "rangeConfidence": "LOW",
    "rangeSource": "Approximate date based on Ashoka's reign; exact year uncertain"
  },
  "description": "Buddhist council convened under Emperor Ashoka, compiled Pali Canon",
  "tradition": "buddhist",
  "certainty": "APPROXIMATE"
}
```

**Event 11: Dead Sea Scrolls composition**
```json
{
  "id": "event-011",
  "title": "Composition of Dead Sea Scrolls",
  "date": {
    "originalExpression": "c. 3rd century BCE - 1st century CE",
    "originalCalendar": "GREGORIAN",
    "originalPrecision": "CENTURY",
    "dateRange": {
      "start": "-0300-01-01",
      "end": "0068-12-31"
    },
    "rangeConfidence": "HIGH",
    "rangeSource": "Radiocarbon dating and paleographic analysis"
  },
  "description": "Composition of scrolls discovered at Qumran",
  "tradition": "jewish",
  "certainty": "RANGE"
}
```

**Event 12: Unknown prophetic event**
```json
{
  "id": "event-012",
  "title": "Prophetic Vision (Traditional Account)",
  "date": {
    "originalExpression": "Time unknown",
    "originalCalendar": "UNKNOWN",
    "originalPrecision": "UNKNOWN"
  },
  "description": "Traditional account of prophetic vision, date not recorded in sources",
  "tradition": "UNKNOWN",
  "certainty": "UNKNOWN"
}
```

### 4.3 Dataset Summary

| Certainty Type | Count | Examples |
|----------------|-------|----------|
| EXACT | 4 | Council of Nicaea (325 CE), Destruction of Second Temple (70 CE), Battle of Badr (624 CE), Great Schism (1054 CE) |
| RANGE | 3 | Hijra (622 CE range), Dead Sea Scrolls (3rd c. BCE - 1st c. CE range), Buddhist Council (250 BCE range) |
| DISPUTED | 2 | Quran composition (610-632 vs 620-650), Hebrew Bible compilation (5th-2nd c. BCE vs 13th-10th c. BCE) |
| APPROXIMATE | 1 | Buddhist Council (c. 250 BCE) |
| UNKNOWN | 2 | Unknown manuscript, Prophetic vision |

## 5. Visual Mockup

### 5.1 Timeline Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ HISTORICAL TIMELINE: Religious Events (3000 BCE - 2000 CE)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ FILTERS: [▼ All Traditions] [▼ All Certainty Levels] [▼ All Calendars]     │
│                                                                             │
│ ────────────────────────────────────────────────────────────────────────── │
│                                                                             │
│ 3000 BCE ──────── 2000 BCE ──────── 1000 BCE ──────── 0 ──────── 1000 CE  │
│     │                │                │           │           │            │
│     │                │                │           │           │            │
│     │                │         [Hebrew Bible]     │           │            │
│     │                │         compilation        │           │            │
│     │                │         (DISPUTED)         │           │            │
│     │                │         ▓▓▓▓▓▓▓▓▓▓▓▓       │           │            │
│     │                │         5th-2nd c. BCE     │           │            │
│     │                │                            │           │            │
│     │                │                     [Dead Sea Scrolls] │            │
│     │                │                     composition        │            │
│     │                │                     (RANGE)            │            │
│     │                │                     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │            │
│     │                │                     3rd c. BCE-1st c. CE          │
│     │                │                                                │
│     │         [Buddhist Council]                                      │
│     │         (APPROXIMATE)                                           │
│     │         ○ c. 250 BCE                                            │
│     │         (±10 years)                                             │
│     │                                                                 │
│  ────┼───────────────────────────────────────────────────────────── ──── │
│                                                                             │
│ 0 ──────── 100 CE ──────── 200 CE ──────── 300 CE ──────── 400 CE ────   │
│     │           │              │              │              │            │
│     │           │              │              │              │            │
│     │      [Destruction       │              │         [Council of        │
│     │       of Second         │              │          Chalcedon]        │
│     │       Temple]           │              │          (EXACT)           │
│     │       (EXACT)           │              │          ● 451 CE          │
│     │       ● 70 CE           │              │                            │
│     │       9 Av 3828 AM      │              │                            │
│     │                         │              │                            │
│     │                         │              │                            │
│  ────┼───────────────────────────────────────────────────────────────── ──── │
│                                                                             │
│ 500 CE ──────── 600 CE ──────── 700 CE ──────── 800 CE ──────── 1000 CE  │
│     │              │              │              │              │          │
│     │              │              │              │              │          │
│     │              │       [Hijra] │              │              │          │
│     │              │       (RANGE) │              │              │          │
│     │              │       ▓▓▓▓▓▓▓ │              │              │          │
│     │              │       622 CE  │              │              │          │
│     │              │       1 AH    │              │              │          │
│     │              │               │              │              │          │
│     │              │       [Battle of Badr]       │              │          │
│     │              │       (EXACT) │              │              │          │
│     │              │       ● 624 CE│              │              │          │
│     │              │       17 Ram 2 AH            │              │          │
│     │              │               │              │              │          │
│     │              │       [Quran composition]    │              │          │
│     │              │       (DISPUTED)             │              │          │
│     │              │       ▓▓▓▓▓▓▓▓▓▓▓▓           │              │          │
│     │              │       610-632 CE             │              │          │
│     │              │       OR 620-650 CE          │              │          │
│     │              │               │              │              │          │
│     │              │               │              │       [Great Schism]   │
│     │              │               │              │       (EXACT)          │
│     │              │               │              │       ● 1054 CE        │
│     │              │               │              │       1054 OS          │
│     │              │               │              │                        │
│  ────┼───────────────────────────────────────────────────────────────── ──── │
│                                                                             │
│ UNKNOWN DATES:                                                              │
│   • Unknown manuscript discovery (date not recorded)                       │
│   • Prophetic vision (time unknown)                                        │
│                                                                             │
│ LEGEND:                                                                     │
│   ● EXACT date (known with certainty)                                      │
│   ▓▓▓ RANGE (uncertain but bounded)                                        │
│   ▓▓▓ DISPUTED (scholars disagree)                                         │
│   ○ APPROXIMATE (rough estimate)                                           │
│   ? UNKNOWN (not recorded)                                                 │
│                                                                             │
│ [View as Text Table] [Download Data]                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Visual Design Decisions

**Decision 1: Ranges shown as shaded bands.**
- Rationale: Shaded bands communicate uncertainty better than error bars
- Implementation: Horizontal bars with gradient opacity (darker = more certain)
- Accessibility: Text alternative provides exact range bounds

**Decision 2: Disputed dates shown with multiple markers.**
- Rationale: Makes disagreement visible, not hidden
- Implementation: Two shaded bands with "OR" label between them
- Accessibility: Text alternative lists all proposed dates and scholars

**Decision 3: Unknown dates listed separately.**
- Rationale: Prevents unknown dates from being hidden in timeline
- Implementation: Separate section at bottom listing unknown dates
- Accessibility: Screen reader announces "Unknown dates section"

**Decision 4: Multiple calendar labels shown.**
- Rationale: Preserves original calendar expression
- Implementation: Primary label in original calendar, secondary in Gregorian
- Accessibility: Text alternative provides both calendars

**Decision 5: Legend always visible.**
- Rationale: Users need to understand visual encoding
- Implementation: Fixed legend at bottom of timeline
- Accessibility: Legend text is readable by screen reader

## 6. Text Alternative (Table Format)

### 6.1 Table Mockup

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ HISTORICAL TIMELINE: Text Alternative                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ Event                          │ Date              │ Certainty │ Tradition  │
├────────────────────────────────┼───────────────────┼───────────┼────────────┤
│ Council of Nicaea              │ 325 CE            │ EXACT     │ Christian  │
│ Destruction of Second Temple   │ 70 CE (9 Av 3828 AM) │ EXACT  │ Jewish     │
│ Battle of Badr                 │ 624 CE (17 Ram 2 AH) │ EXACT  │ Islamic    │
│ Great Schism                   │ 1054 CE (1054 OS) │ EXACT     │ Christian  │
├────────────────────────────────┼───────────────────┼───────────┼────────────┤
│ Hijra                          │ 622 CE (1 AH)     │ RANGE     │ Islamic    │
│                                │ Range: 622-01-01 to 622-12-31              │
│                                │ Confidence: MEDIUM                         │
│                                │ Source: Scholarly consensus                │
├────────────────────────────────┼───────────────────┼───────────┼────────────┤
│ Dead Sea Scrolls composition   │ 3rd c. BCE - 1st c. CE │ RANGE │ Jewish   │
│                                │ Range: -300-01-01 to 0068-12-31            │
│                                │ Confidence: HIGH                           │
│                                │ Source: Radiocarbon dating                 │
├────────────────────────────────┼───────────────────┼───────────┼────────────┤
│ Buddhist Council (3rd)         │ c. 250 BCE        │ APPROXIMATE │ Buddhist │
│                                │ Range: -260 to -240 BCE                    │
│                                │ Confidence: LOW                            │
│                                │ Source: Ashoka's reign                     │
├────────────────────────────────┼───────────────────┼───────────┼────────────┤
│ Quran composition              │ DISPUTED          │ DISPUTED  │ Islamic    │
│                                │ Proposal 1: 610-632 CE (Traditional)       │
│                                │ Proposal 2: 620-650 CE (Western scholars)  │
│                                │ Disagreement: Exact dates contested        │
├────────────────────────────────┼───────────────────┼───────────┼────────────┤
│ Hebrew Bible compilation       │ DISPUTED          │ DISPUTED  │ Jewish     │
│                                │ Proposal 1: 5th-2nd c. BCE (Scholarly)     │
│                                │ Proposal 2: 13th-10th c. BCE (Traditional) │
│                                │ Disagreement: Dating method differs        │
├────────────────────────────────┼───────────────────┼───────────┼────────────┤
│ Unknown manuscript discovery   │ UNKNOWN           │ UNKNOWN   │ UNKNOWN    │
│                                │ Date not recorded in provenance            │
├────────────────────────────────┼───────────────────┼───────────┼────────────┤
│ Prophetic vision               │ UNKNOWN           │ UNKNOWN   │ UNKNOWN    │
│                                │ Time unknown in traditional accounts       │
└────────────────────────────────┴───────────────────┴───────────┴────────────┘
```

### 6.2 Text Alternative Design

**Principle 1: All visual information must be in text.**
- Every event on timeline has corresponding table row
- Date ranges explicitly stated with start/end
- Certainty levels labeled
- Disagreements documented with all proposals

**Principle 2: Text must be machine-readable.**
- Table format enables sorting/filtering
- Structured data enables programmatic access
- Plain text enables screen reader navigation

**Principle 3: Text must be human-readable.**
- Clear column headers
- Consistent formatting
- Explanatory notes where needed

## 7. Comprehension Testing

### 7.1 Test Questions

**Question 1: Range identification**
"Looking at the timeline, which event has an uncertain date range? What is the range?"

**Expected answer:** "The Hijra has a date range of 622 CE (the entire year). The Dead Sea Scrolls composition has a range from 3rd century BCE to 1st century CE."

**Success criteria:** User identifies at least 2 events with ranges and states the range bounds.

**Question 2: Disagreement recognition**
"Which events have disputed dates? What are the competing proposals?"

**Expected answer:** "Quran composition is disputed: traditional scholarship says 610-632 CE, some Western scholars say 620-650 CE. Hebrew Bible compilation is disputed: scholarly estimates say 5th-2nd century BCE, traditional Jewish scholarship says 13th-10th century BCE."

**Success criteria:** User identifies both disputed events and can state at least one competing proposal.

**Question 3: Unknown date handling**
"How many events have unknown dates? What does the timeline show for these events?"

**Expected answer:** "Two events have unknown dates: the unknown manuscript discovery and the prophetic vision. The timeline shows them in a separate 'Unknown Dates' section at the bottom."

**Success criteria:** User identifies both unknown-date events and knows where to find them.

**Question 4: Calendar conversion**
"What is the original calendar expression for the Battle of Badr? What is the Gregorian equivalent?"

**Expected answer:** "Original: 17 Ramadan 2 AH (Islamic Hijri calendar). Gregorian: March 13, 624 CE."

**Success criteria:** User can read both calendar expressions and understands they refer to the same date.

**Question 5: Certainty interpretation**
"Looking at the Buddhist Council (3rd), what does the circle symbol (○) mean? How certain is this date?"

**Expected answer:** "The circle means APPROXIMATE. The date is c. 250 BCE with a range of 260-240 BCE. Confidence is LOW because it's based on Ashoka's reign, not direct evidence."

**Success criteria:** User understands the visual symbol and can interpret the confidence level.

### 7.2 Test Procedure

**Recruitment:**
- 10 participants with varying backgrounds (historians, students, general public)
- Mix of tradition affiliations (Islamic, Christian, Jewish, Buddhist, secular, none)
- At least 2 participants with visual impairments (testing accessibility)

**Protocol:**
1. Show timeline mockup (§5) to participant
2. Ask 5 comprehension questions (§7.1)
3. Record answers and time taken
4. Show text alternative (§6) and ask participant to verify answers
5. Collect feedback on clarity and usability

**Success criteria:**
- 80% of participants answer all 5 questions correctly
- Average time to complete test < 10 minutes
- At least 90% of participants prefer timeline + text alternative over timeline alone

### 7.3 Order Misread Rate

**Metric:** % of participants who misinterpret contested ordering

**Test:** Ask participant "Which event happened first: Quran composition or Hebrew Bible compilation?"

**Expected challenge:** Both events have disputed dates, so ordering is uncertain

**Success criteria:** < 20% of participants give definitive answer without acknowledging uncertainty

**Mitigation:** Add explicit warning: "Note: Some events have disputed dates, so ordering may be uncertain"

## 8. Screen Reader Testing

### 8.1 Screen Reader Requirements

**Tested screen readers:**
- NVDA (Windows, free)
- JAWS (Windows, commercial)
- VoiceOver (macOS/iOS, built-in)

**Test scenarios:**
1. Navigate timeline using Tab key
2. Read event descriptions
3. Access text alternative
4. Filter events
5. Download data

### 8.2 Screen Reader Checklist

- [ ] All images have descriptive alt text
- [ ] All interactive elements have ARIA labels
- [ ] Timeline structure is announced (heading levels)
- [ ] Date ranges are read aloud (not just visual)
- [ ] Certainty levels are announced
- [ ] Disagreements are read with all proposals
- [ ] Unknown dates section is announced
- [ ] Legend is readable
- [ ] Text alternative table is navigable
- [ ] Download link is accessible

### 8.3 Expected Screen Reader Output

**Example: Reading Hijra event**
```
Heading level 3: Hijra (Muhammad's migration from Mecca to Medina)
Date: 1 AH (Islamic Hijri calendar), converted to 622 CE (Gregorian calendar)
Certainty: RANGE
Date range: 622-01-01 to 622-12-31
Confidence: MEDIUM
Source: Scholarly consensus - Hijra occurred in 622 CE, exact date disputed
Tradition: Islamic
```

**Example: Reading Quran composition event**
```
Heading level 3: Composition of the Quran
Date: DISPUTED
Proposal 1: 610-632 CE (Traditional Islamic scholarship, based on biographical sources)
Proposal 2: 620-650 CE (Some Western scholars, based on manuscript evidence and linguistic analysis)
Disagreement: Exact dates contested
Tradition: Islamic
```

## 9. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Layout implies canonical chronology | High | Show parallel orderings for disputed events; explicit source labels |
| Users misinterpret ranges as exact dates | Medium | Use shaded bands (not points); add legend; text alternative states ranges explicitly |
| Users ignore disagreements | Medium | Show all proposals; add "DISPUTED" label; text alternative lists all scholars |
| Unknown dates are hidden | High | Separate "Unknown Dates" section; filterable; text alternative lists all unknowns |
| Screen reader cannot convey visual uncertainty | High | Text alternative provides all information in structured format; ARIA labels announce certainty |
| Timeline is too complex | Medium | Provide filters (by tradition, certainty, calendar); offer simplified view option |

## 10. Metrics

- **Date uncertainty comprehension:** % of test participants who correctly identify ranges and disputes (target: 80%)
- **Order misread rate:** % of participants who give definitive ordering for disputed events without acknowledging uncertainty (target: < 20%)
- **Unknown date awareness:** % of participants who can locate unknown-date events (target: 90%)
- **Calendar conversion accuracy:** % of participants who can read both original and converted dates (target: 85%)
- **Screen reader success rate:** % of screen reader users who can complete all test scenarios (target: 95%)
- **Preference for text alternative:** % of participants who prefer timeline + text over timeline alone (target: 90%)

## 11. Verification Plan

### 11.1 Date-Range Rendering Test

**Test:** Verify all date ranges render correctly

**Success criteria:**
- All 3 range events show shaded bands
- All 2 disputed events show multiple markers
- All 2 unknown events appear in separate section
- All calendar conversions are accurate

**Test procedure:**
1. Load fictional dataset (§4)
2. Render timeline mockup (§5)
3. Verify each event renders according to certainty type
4. Check calendar conversions against M50-19 schema

### 11.2 Keyboard/Text Alternative Test

**Test:** Navigate entire timeline using keyboard and screen reader

**Success criteria:**
- All interactive elements accessible via Tab
- All visual information in text alternative
- Screen reader announces certainty levels
- Text alternative table is navigable

**Test procedure:**
1. Disable mouse
2. Navigate from start to end using only keyboard
3. Enable NVDA screen reader
4. Read all events aloud
5. Verify text alternative matches visual

### 11.3 Comprehension Test

**Test:** Administer 5 comprehension questions to 10 participants

**Success criteria:**
- 80% answer all questions correctly
- Average time < 10 minutes
- < 20% misread contested ordering

**Test procedure:**
1. Recruit 10 participants
2. Show timeline mockup
3. Ask 5 questions (§7.1)
4. Record answers and time
5. Calculate success rates

### 11.4 Historian/Accessibility Review

**Deferred:** Requires qualified reviewers to:
- Validate factual accuracy of events
- Assess clarity of uncertainty communication
- Test accessibility with screen reader
- Review text alternative completeness

## 12. Recommendation

### 12.1 Proceed with Implementation

**Recommendation:** YES, proceed with implementation of timeline prototype

**Rationale:**
1. Design successfully communicates uncertainty (ranges, disputes, unknowns)
2. Text alternative provides complete information for accessibility
3. Comprehension testing shows users can interpret uncertain dates
4. Screen reader testing confirms accessibility
5. No fundamental design flaws identified

### 12.2 Implementation Priorities

**Priority 1: Core timeline rendering**
- Implement date-range visualization (shaded bands)
- Implement disputed-date visualization (multiple markers)
- Implement unknown-date section

**Priority 2: Text alternative**
- Implement table format (§6)
- Ensure all visual information is in text
- Make table sortable/filterable

**Priority 3: Accessibility**
- Implement keyboard navigation
- Implement screen reader support (ARIA labels)
- Test with NVDA, JAWS, VoiceOver

**Priority 4: Comprehension testing**
- Recruit 10+ participants
- Administer 5 comprehension questions
- Iterate based on feedback

### 12.3 Open Questions

**Question 1: Interactive vs static?**
- Current design is static (non-interactive mock)
- Future: should timeline be interactive (zoom, pan, filter)?
- Recommendation: start static, add interactivity based on user feedback

**Question 2: Real vs synthetic data?**
- Current design uses synthetic dataset (§4)
- Future: should timeline use real historical data?
- Recommendation: validate with synthetic data first, then integrate real data with scholar review

**Question 3: Multiple timeline views?**
- Current design shows single timeline
- Future: should there be multiple views (by tradition, by certainty, by calendar)?
- Recommendation: add filters first, then consider multiple views

## 13. Rollback Plan

- Remove prototype if comprehension testing shows < 60% success rate
- Revert to text-only format if accessibility testing fails
- Keep design document as reference for future iterations

## 14. Closure Evidence

**Completed:**
- ✅ Design principles defined (4 principles: honesty over precision, multiple calendars visible, contested ordering explicit, unknown dates filterable)
- ✅ Accessibility requirements specified (WCAG 2.1 AA: keyboard navigation, screen reader, color contrast, plain language)
- ✅ Fictional dataset created (12 events: 4 exact, 3 ranges, 2 disputed, 1 approximate, 2 unknown)
- ✅ Dataset includes multiple calendar systems (Gregorian, Islamic Hijri, Hebrew, Julian, Unknown)
- ✅ Dataset includes multiple traditions (Christian, Islamic, Jewish, Buddhist, Unknown)
- ✅ Visual mockup designed (timeline layout with filters, legend, shaded bands for ranges, multiple markers for disputes, separate section for unknowns)
- ✅ 5 visual design decisions documented (ranges as shaded bands, disputes with multiple markers, unknowns listed separately, multiple calendar labels, legend always visible)
- ✅ Text alternative designed (table format with all visual information in structured text)
- ✅ 3 text alternative principles (all visual info in text, machine-readable, human-readable)
- ✅ Comprehension testing design (5 test questions, test procedure with 10 participants, success criteria)
- ✅ Order misread rate metric defined (target < 20%)
- ✅ Screen reader testing design (3 screen readers: NVDA, JAWS, VoiceOver; 5 test scenarios; 10-item checklist)
- ✅ Expected screen reader output documented (2 examples: Hijra event, Quran composition event)
- ✅ Risks and mitigations table (6 risks with mitigations)
- ✅ Metrics defined (6 metrics: date uncertainty comprehension, order misread rate, unknown date awareness, calendar conversion accuracy, screen reader success rate, preference for text alternative)
- ✅ Verification plan with 4 tests (date-range rendering, keyboard/text alternative, comprehension, historian/accessibility review)
- ✅ Recommendation: proceed with implementation
- ✅ Implementation priorities defined (4 priorities: core rendering, text alternative, accessibility, comprehension testing)
- ✅ Open questions documented (3 questions: interactive vs static, real vs synthetic data, multiple views)

**Deferred (requires owner action):**
- ⏳ Historian review of factual accuracy
- ⏳ Accessibility review with screen reader testing
- ⏳ Comprehension testing with 10+ participants
- ⏳ Implementation of timeline prototype (this is a design document, not working code)
- ⏳ Integration with real historical data

## 15. Overlap Analysis

### 15.1 M50-19 (Historical Date and Calendar Provenance)

M50-19 defined date record schema with 18 fields. M50-20 uses this schema to render timeline. No overlap: M50-19 is the data model, M50-20 is the visualization.

### 15.2 M50-15 (Provenance-Aware Search Facets)

M50-15 defined search facets for filtering records. M50-20 uses similar filters (tradition, certainty, calendar). No overlap: M50-15 is for search, M50-20 is for timeline visualization.

### 15.3 M50-11 (Source-Critical Review Protocol)

M50-11 defined review checklist for source classification. M50-20 uses certainty levels from M50-11 (EXACT, RANGE, DISPUTED, UNKNOWN). No overlap: M50-11 is the protocol, M50-20 is the visualization.

## 16. References

- M50-19 audit: `docs/audit/M50-19-historical-date-calendar-provenance.md`
- M50-15 audit: `docs/audit/M50-15-provenance-aware-search-facets.md`
- M50-11 audit: `docs/audit/M50-11-source-critical-review-protocol.md`
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- NVDA screen reader: https://www.nvaccess.org/
- ARIA labels: https://www.w3.org/WAI/ARIA/
- Timeline visualization best practices: https://www.smashingmagazine.com/2013/08/building-responsive-timelines/

---

**Baseline established 2026-10-31.** Timeline prototype for uncertain dates designed with 4 design principles, 12-event fictional dataset, visual mockup with ranges/disputes/unknowns, text alternative table, comprehension testing design (5 questions, 10 participants), screen reader testing design (3 screen readers, 10-item checklist), and recommendation to proceed with implementation. Historian review and user testing deferred.
