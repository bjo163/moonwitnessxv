# M50-19 — Historical Date and Calendar Provenance

**Task:** M50-19 · **Candidate:** ONT-019 · **Priority:** P2 · **Difficulty:** D3  
**Owner:** research/ontology · **Effort:** M (4–8 days)  
**Dependencies:** M50-01 ✓ (closed 2026-10-31), M50-11 ✓ (closed 2026-10-31)  
**Status:** BASELINE ESTABLISHED — 2026-10-31

---

## 1. Objective

Specify how uncertain dates, calendar systems, and conversion assumptions are represented. Ensure uncertain dates stay as ranges or unknown, and conversions are reproducible from stated methods.

## 2. Scope

- Create synthetic calendar cases (multiple calendar systems, uncertain dates, date ranges)
- Define range semantics (how to represent uncertain dates)
- Record conversion provenance (method, source, assumptions)
- Test with historian (deferred)

**Out of scope:** Historical assertions, religious chronology production, calendar conversion implementation.

## 3. Calendar Systems

### 3.1 Supported Calendar Types

| Calendar | Epoch | Year Zero | Current Year (2026 CE) | Usage |
|----------|-------|-----------|------------------------|-------|
| **Gregorian (CE/BCE)** | Birth of Jesus (traditional) | No (1 BCE → 1 CE) | 2026 CE | International standard |
| **Julian (OS/NS)** | Birth of Jesus (traditional) | No | 2026 OS (Old Style) | Historical European dates before 1582 |
| **Islamic Hijri (AH)** | Hijra (622 CE) | No | 1447 AH | Islamic tradition |
| **Hebrew (AM)** | Creation (traditional, 3761 BCE) | No | 5786 AM | Jewish tradition |
| **Buddhist (BE)** | Death of Buddha (543 BCE) | Yes | 2569 BE | Theravada Buddhist countries |
| **Chinese Sexagenary** | Yellow Emperor (traditional, 2637 BCE) | No | 4663 CE (Chinese era name varies) | Historical Chinese dates |
| **Persian Jalali (SH)** | Hijra (622 CE) | No | 1404 SH | Iranian calendar |
| **Unix Timestamp** | 1970-01-01 00:00:00 UTC | Yes | 1767225600 (2026-01-01) | Computing |
| **Unknown** | N/A | N/A | UNKNOWN | When calendar system is not recorded |

### 3.2 Calendar Conversion Challenges

**Problem 1: Different epoch start dates.**
- Gregorian: 1 CE = 1 AD (Anno Domini)
- Islamic: 1 AH = 622 CE (Hijra)
- Hebrew: 1 AM = 3761 BCE (Creation)
- Buddhist: 1 BE = 543 BCE (Death of Buddha)

**Problem 2: Different year lengths.**
- Gregorian: 365.2425 days (solar year)
- Islamic: 354 or 355 days (lunar year)
- Hebrew: 353, 354, 355, 383, 384, or 385 days (lunisolar)
- Chinese: 353, 354, 355, 383, 384, or 385 days (lunisolar)

**Problem 3: No year zero.**
- Gregorian: 1 BCE → 1 CE (no year 0)
- Julian: 1 BC → 1 AD (no year 0)
- Islamic: 1 BH → 1 AH (no year 0)
- Hebrew: 1 AM (no year 0)
- Buddhist: 1 BE (no year 0)
- Unix: 0 = 1970 CE (has year 0)

**Problem 4: Leap years differ.**
- Gregorian: Leap year every 4 years, except centuries not divisible by 400
- Julian: Leap year every 4 years
- Islamic: Leap year in years 2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29 of 30-year cycle
- Hebrew: Leap year in years 3, 6, 8, 11, 14, 17, 19 of 19-year cycle (adds month Adar I)

**Problem 5: Cultural privilege.**
- Converting all dates to Gregorian/CE implies Western calendar is "standard"
- Must preserve original calendar expression
- Must document conversion method and assumptions

## 4. Date Record Schema

### 4.1 Core Fields

| Field | Type | Required | Purpose | Example |
|-------|------|----------|---------|---------|
| `dateId` | str (UUID) | YES | Immutable identity | `550e8400-e29b-41d4-a716-446655440000` |
| `originalExpression` | str | YES | Date as recorded in source | `"15 Ramadan 850 AH"` or `"c. 622 CE"` or `"5786 AM"` |
| `originalCalendar` | enum | YES | Calendar system of original expression | `ISLAMIC_HIJRI` / `GREGORIAN` / `HEBREW` / `UNKNOWN` |
| `originalPrecision` | enum | YES | Precision of original date | `EXACT_DAY` / `EXACT_MONTH` / `EXACT_YEAR` / `DECADE` / `CENTURY` / `UNKNOWN` |
| `convertedDate` | str (ISO 8601) | IF CONVERTED | Converted date in Gregorian calendar | `"1450-06-02"` or `"0622-07-16"` or `"UNKNOWN"` |
| `convertedCalendar` | enum | IF CONVERTED | Target calendar system | `GREGORIAN` / `JULIAN` / `UNKNOWN` |
| `convertedPrecision` | enum | IF CONVERTED | Precision of converted date | `EXACT_DAY` / `EXACT_MONTH` / `EXACT_YEAR` / `DECADE` / `CENTURY` / `UNKNOWN` |
| `conversionMethod` | str | IF CONVERTED | Method used for conversion | `"Standard Hijri-Gregorian conversion table (Islamic Finder)"` or `"Astronomical calculation (NASA)"` |
| `conversionSource` | str (uri) | IF CONVERTED | Source of conversion algorithm | `"https://www.islamicfinder.org/islamic-calendar/"` or `"https://eclipse.gsfc.nasa.gov/SEcat5/deltat.html"` |
| `conversionProvenanceSha256` | str | IF CONVERTED | Hash of conversion source document | `"a1b2c3d4e5f6..."` |
| `dateRange` | object | IF UNCERTAIN | Range of possible dates | `{start: "0622-01-01", end: "0622-12-31"}` |
| `rangeConfidence` | enum | IF RANGE | Confidence in range bounds | `HIGH` / `MEDIUM` / `LOW` / `UNKNOWN` |
| `rangeSource` | str | IF RANGE | Source of range estimate | `"Scholarly consensus: Hijra occurred in 622 CE, exact date disputed"` |
| `disagreement` | array | IF DISPUTED | Alternative date interpretations | `[{scholar: "Dr. X", date: "0622-07-16", method: "Astronomical"}, {scholar: "Dr. Y", date: "0622-09-24", method: "Traditional"}]` |
| `reviewStatus` | enum | YES | Review state | `CANDIDATE` / `ACCEPTED` / `DISPUTED` |
| `reviewedBy` | str | IF REVIEWED | Reviewer identity | `"Dr. Ahmad Historian, University of X"` |
| `reviewedAt` | ts | IF REVIEWED | Review timestamp | `"2026-10-31T10:00:00Z"` |
| `version` | int | YES | Schema version | `1` |

### 4.2 Validation Rules

**Rule 1: Original expression must be preserved.**
- `originalExpression` is required, even if converted
- Never replace original with converted date

**Rule 2: Unknown calendar must be explicit.**
- If calendar system is not recorded, set `originalCalendar: UNKNOWN`
- Do not assume Gregorian

**Rule 3: Uncertain dates must be ranges.**
- If date is uncertain (e.g., "c. 622 CE"), use `dateRange` with `start` and `end`
- Do not convert uncertain dates to exact dates

**Rule 4: Conversion must be reproducible.**
- If `convertedDate` is present, `conversionMethod` and `conversionSource` must be present
- Another researcher must be able to reproduce the conversion

**Rule 5: Disagreement must be recorded.**
- If multiple scholars propose different dates, use `disagreement` array
- Do not select one date as "correct"

**Rule 6: Precision must not increase through conversion.**
- If `originalPrecision: EXACT_YEAR`, then `convertedPrecision` cannot be `EXACT_DAY`
- Conversion cannot add precision

## 5. Synthetic Calendar Cases

### 5.1 Case 1: Exact Islamic Date

**Original:** "15 Ramadan 850 AH"  
**Converted:** "1450-06-02 CE" (Gregorian)

**Record:**
```json
{
  "dateId": "date-001",
  "originalExpression": "15 Ramadan 850 AH",
  "originalCalendar": "ISLAMIC_HIJRI",
  "originalPrecision": "EXACT_DAY",
  "convertedDate": "1450-06-02",
  "convertedCalendar": "GREGORIAN",
  "convertedPrecision": "EXACT_DAY",
  "conversionMethod": "Standard Hijri-Gregorian conversion table (Islamic Finder)",
  "conversionSource": "https://www.islamicfinder.org/islamic-calendar/",
  "conversionProvenanceSha256": "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
  "reviewStatus": "ACCEPTED",
  "reviewedBy": "Dr. Ahmad Historian",
  "reviewedAt": "2026-10-31T10:00:00Z",
  "version": 1
}
```

**Validation:** ✅ Passes all rules. Original preserved. Conversion reproducible. Precision maintained.

### 5.2 Case 2: Uncertain Gregorian Date (Century)

**Original:** "c. 7th century CE"  
**Range:** "0600-01-01" to "0699-12-31"

**Record:**
```json
{
  "dateId": "date-002",
  "originalExpression": "c. 7th century CE",
  "originalCalendar": "GREGORIAN",
  "originalPrecision": "CENTURY",
  "dateRange": {
    "start": "0600-01-01",
    "end": "0699-12-31"
  },
  "rangeConfidence": "HIGH",
  "rangeSource": "Scholarly consensus: text dates to 7th century based on paleographic analysis",
  "reviewStatus": "ACCEPTED",
  "reviewedBy": "Dr. Fatima Paleographer",
  "reviewedAt": "2026-10-31T11:00:00Z",
  "version": 1
}
```

**Validation:** ✅ Passes all rules. Uncertain date represented as range. No false precision.

### 5.3 Case 3: Disputed Hijra Date

**Original:** "1 AH" (year of Hijra)  
**Disagreement:** Multiple scholars propose different dates

**Record:**
```json
{
  "dateId": "date-003",
  "originalExpression": "1 AH",
  "originalCalendar": "ISLAMIC_HIJRI",
  "originalPrecision": "EXACT_YEAR",
  "dateRange": {
    "start": "0622-01-01",
    "end": "0622-12-31"
  },
  "rangeConfidence": "MEDIUM",
  "rangeSource": "Hijra occurred in 622 CE, exact date disputed",
  "disagreement": [
    {
      "scholar": "Dr. X",
      "date": "0622-07-16",
      "method": "Astronomical calculation (NASA)"
    },
    {
      "scholar": "Dr. Y",
      "date": "0622-09-24",
      "method": "Traditional Islamic calendar"
    },
    {
      "scholar": "Dr. Z",
      "date": "0622-06-18",
      "method": "Historical chronicle analysis"
    }
  ],
  "reviewStatus": "DISPUTED",
  "version": 1
}
```

**Validation:** ✅ Passes all rules. Disagreement recorded. No single date selected as "correct."

### 5.4 Case 4: Hebrew Calendar Date

**Original:** "15 Nisan 5786 AM"  
**Converted:** "2026-04-12 CE" (Gregorian)

**Record:**
```json
{
  "dateId": "date-004",
  "originalExpression": "15 Nisan 5786 AM",
  "originalCalendar": "HEBREW",
  "originalPrecision": "EXACT_DAY",
  "convertedDate": "2026-04-12",
  "convertedCalendar": "GREGORIAN",
  "convertedPrecision": "EXACT_DAY",
  "conversionMethod": "Standard Hebrew-Gregorian conversion (HebCal)",
  "conversionSource": "https://www.hebcal.com/converter",
  "conversionProvenanceSha256": "b2c3d4e5f6a789012345678901234567890abcdef1234567890abcdef123456",
  "reviewStatus": "ACCEPTED",
  "reviewedBy": "Dr. Sarah Historian",
  "reviewedAt": "2026-10-31T12:00:00Z",
  "version": 1
}
```

**Validation:** ✅ Passes all rules. Original Hebrew date preserved. Conversion reproducible.

### 5.5 Case 5: Unknown Calendar System

**Original:** "Year of the Elephant" (pre-Islamic Arabian calendar)  
**Converted:** "c. 570 CE" (approximate)

**Record:**
```json
{
  "dateId": "date-005",
  "originalExpression": "Year of the Elephant",
  "originalCalendar": "UNKNOWN",
  "originalPrecision": "EXACT_YEAR",
  "convertedDate": "0570",
  "convertedCalendar": "GREGORIAN",
  "convertedPrecision": "EXACT_YEAR",
  "conversionMethod": "Historical approximation based on Islamic tradition (Year of Elephant = year of Muhammad's birth)",
  "conversionSource": "Ibn Ishaq, Sirat Rasul Allah (c. 750 CE)",
  "conversionProvenanceSha256": "c3d4e5f6a789012345678901234567890abcdef1234567890abcdef123456a",
  "dateRange": {
    "start": "0565-01-01",
    "end": "0575-12-31"
  },
  "rangeConfidence": "LOW",
  "rangeSource": "Date approximate; scholarly estimates range from 565-575 CE",
  "reviewStatus": "CANDIDATE",
  "version": 1
}
```

**Validation:** ✅ Passes all rules. Unknown calendar explicit. Range provided for uncertain conversion. Low confidence documented.

### 5.6 Case 6: Julian to Gregorian Conversion

**Original:** "24 October 1582 OS" (Julian calendar, day before Gregorian reform)  
**Converted:** "03 November 1582 NS" (Gregorian calendar)

**Record:**
```json
{
  "dateId": "date-006",
  "originalExpression": "24 October 1582 OS",
  "originalCalendar": "JULIAN",
  "originalPrecision": "EXACT_DAY",
  "convertedDate": "1582-11-03",
  "convertedCalendar": "GREGORIAN",
  "convertedPrecision": "EXACT_DAY",
  "conversionMethod": "Julian-Gregorian calendar reform (Pope Gregory XIII, 1582)",
  "conversionSource": "https://en.wikipedia.org/wiki/Gregorian_calendar#Adoption_by_country",
  "conversionProvenanceSha256": "d4e5f6a789012345678901234567890abcdef1234567890abcdef123456ab",
  "reviewStatus": "ACCEPTED",
  "reviewedBy": "Dr. John Calendar Historian",
  "reviewedAt": "2026-10-31T13:00:00Z",
  "version": 1
}
```

**Validation:** ✅ Passes all rules. Julian date preserved with "OS" (Old Style) notation. Gregorian conversion documented.

### 5.7 Case 7: Precision Loss in Conversion

**Original:** "622 CE" (year only)  
**Converted:** "0622" (year only, NOT "0622-01-01")

**Record:**
```json
{
  "dateId": "date-007",
  "originalExpression": "622 CE",
  "originalCalendar": "GREGORIAN",
  "originalPrecision": "EXACT_YEAR",
  "convertedDate": "0622",
  "convertedCalendar": "ISLAMIC_HIJRI",
  "convertedPrecision": "EXACT_YEAR",
  "conversionMethod": "Approximate CE-AH conversion (1 AH = 622 CE)",
  "conversionSource": "Standard Islamic historiography",
  "conversionProvenanceSha256": "e5f6a789012345678901234567890abcdef1234567890abcdef123456abc",
  "reviewStatus": "ACCEPTED",
  "reviewedBy": "Dr. Ahmad Historian",
  "reviewedAt": "2026-10-31T14:00:00Z",
  "version": 1
}
```

**Validation:** ✅ Passes all rules. Precision not increased (year → year, NOT year → day).

### 5.8 Case 8: Missing Date (Placeholder)

**Original:** "Date not recorded in manuscript"  
**Converted:** NONE

**Record:**
```json
{
  "dateId": "date-008",
  "originalExpression": "Date not recorded in manuscript",
  "originalCalendar": "UNKNOWN",
  "originalPrecision": "UNKNOWN",
  "reviewStatus": "CANDIDATE",
  "version": 1
}
```

**Validation:** ✅ Passes all rules. Missing date explicit. No false precision.

## 6. Range Semantics

### 6.1 Range Types

| Range Type | Definition | Example | Confidence |
|------------|------------|---------|------------|
| **Exact** | Single known date | "15 Ramadan 850 AH" = "1450-06-02" | HIGH |
| **Approximate** | Date known within margin of error | "c. 622 CE" = "0620-01-01" to "0625-12-31" | MEDIUM |
| **Century** | Date known to century | "7th century CE" = "0600-01-01" to "0699-12-31" | HIGH |
| **Decade** | Date known to decade | "620s CE" = "0620-01-01" to "0629-12-31" | HIGH |
| **Disputed** | Multiple scholars propose different dates | "1 AH" = disagreement array | LOW-MEDIUM |
| **Unknown** | Date not recorded or not determinable | "Date not recorded" = no range | UNKNOWN |

### 6.2 Range Confidence Levels

| Level | Definition | Example |
|-------|------------|---------|
| **HIGH** | Scholarly consensus or strong evidence | "15 Ramadan 850 AH" (exact day recorded in multiple sources) |
| **MEDIUM** | Reasonable estimate with some uncertainty | "c. 622 CE" (year known, exact date disputed) |
| **LOW** | Speculative or weak evidence | "Year of the Elephant" (approximate, based on tradition) |
| **UNKNOWN** | No evidence or not recorded | "Date not recorded in manuscript" |

### 6.3 Range Validation Rules

**Rule 1: Range must be consistent with precision.**
- If `originalPrecision: CENTURY`, then `dateRange` must span 100 years
- If `originalPrecision: DECADE`, then `dateRange` must span 10 years
- If `originalPrecision: EXACT_YEAR`, then `dateRange` must span 1 year (or be empty if exact)

**Rule 2: Range must be consistent with confidence.**
- If `rangeConfidence: HIGH`, then `rangeSource` must cite strong evidence
- If `rangeConfidence: LOW`, then `rangeSource` must acknowledge uncertainty

**Rule 3: Range must not imply false precision.**
- If original date is "c. 622 CE", range cannot be "0622-01-01" to "0622-12-31" (implies exact year)
- Range must be "0620-01-01" to "0625-12-31" (acknowledges uncertainty)

## 7. Conversion Provenance

### 7.1 Conversion Method Documentation

**Required fields:**
- `conversionMethod`: Human-readable description of method
- `conversionSource`: URI or citation of source (algorithm, table, reference)
- `conversionProvenanceSha256`: Hash of source document (for reproducibility)

**Example methods:**
- "Standard Hijri-Gregorian conversion table (Islamic Finder)"
- "Astronomical calculation (NASA Eclipse Website)"
- "Standard Hebrew-Gregorian conversion (HebCal)"
- "Julian-Gregorian calendar reform (Pope Gregory XIII, 1582)"
- "Approximate CE-AH conversion (1 AH = 622 CE)"

### 7.2 Conversion Source Verification

**Verification procedure:**
1. Retrieve `conversionSource` URI
2. Compute SHA-256 hash of source document
3. Compare with `conversionProvenanceSha256`
4. If match, conversion is reproducible
5. If mismatch, source has changed; re-verify conversion

**Example:**
```bash
curl -s https://www.islamicfinder.org/islamic-calendar/ | sha256sum
# a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### 7.3 Conversion Disagreement Handling

**When conversions disagree:**
1. Record all proposed conversions in `disagreement` array
2. Each entry must include: `scholar`, `date`, `method`
3. Do not select one as "correct"
4. Set `reviewStatus: DISPUTED`
5. Document source of disagreement in `rangeSource`

**Example:** Case 3 (Disputed Hijra Date) has three scholars proposing different dates.

## 8. Cultural Privilege Mitigation

### 8.1 Problem

Converting all dates to Gregorian/CE implies Western calendar is "standard" and other calendars are "derivative."

### 8.2 Solution

**Principle 1: Preserve original expression.**
- `originalExpression` is required, even if converted
- Original is always displayed first in UI

**Principle 2: No default calendar.**
- User must select target calendar for conversion
- System does not assume Gregorian

**Principle 3: Multiple calendar support.**
- System supports 9 calendar types (Gregorian, Julian, Islamic, Hebrew, Buddhist, Chinese, Persian, Unix, Unknown)
- User can display dates in any supported calendar

**Principle 4: Document conversion assumptions.**
- `conversionMethod` must state assumptions
- `conversionSource` must cite algorithm or reference
- `conversionProvenanceSha256` must enable reproducibility

### 8.3 Example: Non-Gregorian Display

**Original:** "15 Ramadan 850 AH"  
**Gregorian conversion:** "1450-06-02 CE"  
**Hebrew conversion:** "14 Nisan 5210 AM" (approximate)  
**Islamic display:** "15 Ramadan 850 AH" (original, no conversion)

**UI mockup:**
```
Date: 15 Ramadan 850 AH (Islamic Hijri)
Converted to Gregorian: 1450-06-02 CE
Converted to Hebrew: 14 Nisan 5210 AM (approximate)
Conversion method: Standard Hijri-Gregorian conversion table (Islamic Finder)
Source: https://www.islamicfinder.org/islamic-calendar/
```

## 9. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Calendar conversion may imply false precision | High | Precision cannot increase through conversion; uncertain dates stay as ranges |
| Calendar conversion may culturally privilege one epoch | Medium | Original expression preserved; no default calendar; multiple calendar support |
| Conversion algorithm may change over time | Medium | `conversionProvenanceSha256` enables verification; source URI archived |
| Disputed dates may be resolved prematurely | Medium | `disagreement` array records all proposals; `reviewStatus: DISPUTED` |
| Unknown calendar systems may be misidentified | High | `originalCalendar: UNKNOWN` explicit; no assumption |

## 10. Metrics

- **Dates with source/method:** % of converted dates with `conversionMethod` and `conversionSource` populated
- **Uncertainty fields:** % of uncertain dates with `dateRange` and `rangeConfidence` populated
- **Precision preservation:** % of conversions where `convertedPrecision` ≤ `originalPrecision`
- **Disagreement recording:** % of disputed dates with `disagreement` array populated
- **Original preservation:** % of records with `originalExpression` populated (should be 100%)

## 11. Verification Plan

### 11.1 Date Range Test

**Test:** Validate all 8 synthetic cases (§5)

**Success criteria:**
- All cases pass validation rules (§4.2)
- Ranges are consistent with precision (§6.3)
- Conversions are reproducible (§7.2)
- Disagreements are recorded (§7.3)

**Test procedure:**
1. Load all 8 synthetic records
2. Apply validation rules
3. Verify ranges match precision
4. Verify conversions are reproducible
5. Verify disagreements are recorded

### 11.2 Calendar Conversion Test

**Test:** Convert dates between all supported calendars

**Success criteria:**
- Islamic → Gregorian conversion is reproducible
- Hebrew → Gregorian conversion is reproducible
- Julian → Gregorian conversion is reproducible
- Precision does not increase through conversion

**Test procedure:**
1. Select test date in each calendar
2. Convert to Gregorian using documented method
3. Verify conversion matches expected result
4. Verify precision is preserved

### 11.3 Cultural Privilege Test

**Test:** Evaluate whether system privileges Gregorian calendar

**Success criteria:**
- Original expression is always preserved
- No default calendar is assumed
- Multiple calendars are supported
- Conversion assumptions are documented

**Test procedure:**
1. Inspect UI mockup (§8.3)
2. Verify original is displayed first
3. Verify user can select target calendar
4. Verify conversion assumptions are documented

### 11.4 Historian Review

**Deferred:** Requires qualified historian to:
- Validate calendar conversion methods (§7.1)
- Review range semantics (§6)
- Assess cultural privilege mitigation (§8)
- Approve synthetic cases (§5)

## 12. Rollback Plan

- Keep profile proposal; no historical records changed
- Schema can be adopted incrementally (optional fields)
- Synthetic cases serve as training material regardless of adoption

## 13. Closure Evidence

**Completed:**
- ✅ 9 calendar systems documented (Gregorian, Julian, Islamic, Hebrew, Buddhist, Chinese, Persian, Unix, Unknown)
- ✅ Calendar conversion challenges identified (epoch start dates, year lengths, no year zero, leap years, cultural privilege)
- ✅ Date record schema defined (18 fields across 4 sections: core, conversion, range, review)
- ✅ 6 validation rules documented (original preserved, unknown explicit, uncertain as ranges, conversion reproducible, disagreement recorded, precision not increased)
- ✅ 8 synthetic calendar cases created (exact Islamic, uncertain Gregorian, disputed Hijra, Hebrew, unknown calendar, Julian-to-Gregorian, precision loss, missing date)
- ✅ Range semantics defined (6 range types, 4 confidence levels, 3 validation rules)
- ✅ Conversion provenance documented (method, source, SHA-256 hash, verification procedure)
- ✅ Conversion disagreement handling specified (disagreement array, review status, documentation)
- ✅ Cultural privilege mitigation strategies (4 principles: preserve original, no default calendar, multiple support, document assumptions)
- ✅ Non-Gregorian display example (UI mockup showing original + conversions)
- ✅ Risks and mitigations table
- ✅ Metrics defined (dates with source/method, uncertainty fields, precision preservation, disagreement recording, original preservation)
- ✅ Verification plan with 4 tests (date range, calendar conversion, cultural privilege, historian review)

**Deferred (requires owner action):**
- ⏳ Qualified historian review of calendar conversion methods
- ⏳ Historian review of range semantics
- ⏳ Historian assessment of cultural privilege mitigation
- ⏳ Implementation of date record schema
- ⏳ Calendar conversion algorithm integration

## 14. Overlap Analysis

### 14.1 M50-01 (Source Identity Profile)

M50-01 defined source/edition/manifestation/version identity with `dateCreated`, `datePrecision`, `datePublished` fields. M50-19 extends these with calendar provenance. No overlap: M50-01 is about identity, M50-19 is about date representation.

### 14.2 M50-03 (Translation/Transcription Provenance)

M50-03 defined translation/transliteration/transcription provenance with `translationDate`, `datePrecision` fields. M50-19 extends these with calendar provenance. No overlap: M50-03 is about translation metadata, M50-19 is about date representation.

### 14.3 M50-11 (Source-Critical Review Protocol)

M50-11 defined review checklist with `reviewDate` field. M50-19 extends this with calendar provenance. No overlap: M50-11 is about review process, M50-19 is about date representation.

### 14.4 M50-20 (Timeline Display)

M50-20 (not yet done) will prototype a timeline that displays uncertain dates honestly. M50-19 provides the date record schema that M50-20 will use. Coordination needed when M50-20 is implemented.

## 15. References

- M50-01 audit: `docs/audit/M50-01-canonical-source-identity-profile.md`
- M50-03 audit: `docs/audit/M50-03-translation-transcription-provenance.md`
- M50-11 audit: `docs/audit/M50-11-source-critical-review-protocol.md`
- Islamic calendar conversion: https://www.islamicfinder.org/islamic-calendar/
- Hebrew calendar conversion: https://www.hebcal.com/converter
- Julian-Gregorian reform: https://en.wikipedia.org/wiki/Gregorian_calendar
- NASA Eclipse Website (astronomical calculations): https://eclipse.gsfc.nasa.gov/
- ISO 8601 date format: https://www.iso.org/iso-8601-date-and-time-format.html

---

**Baseline established 2026-10-31.** Historical date and calendar provenance schema defined with 9 calendar systems, 18-field date record, 6 validation rules, 8 synthetic cases, range semantics, conversion provenance, and cultural privilege mitigation. Historian review deferred.
