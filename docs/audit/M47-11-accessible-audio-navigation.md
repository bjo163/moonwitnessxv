# M47-11 — Accessible Audio Navigation for Cleared Excerpts

**Status:** BASELINE ESTABLISHED (Design Document)
**Date:** 2026-10-31
**Task:** Prototype accessible audio navigation for cleared excerpts
**Priority:** P2 | Difficulty: D3 | Effort: M (5–9 days)
**Dependencies:** None
**Owner:** reader UX

---

## Objective

Test whether optional audio navigation improves access to a synthetic/cleared short excerpt.

---

## Scope (from specification)

- Confirm allowed synthetic asset
- Prototype controls
- Test keyboard/captions
- Conduct small access review
- Go/no-go

---

## Acceptance Criteria

- Controls work by keyboard
- Transcript remains available
- Asset provenance is clear

---

## Design: Accessible Audio Navigation

### 1. Core Concept

**Audio navigation** provides spoken-word playback of cleared text excerpts with synchronized highlighting. Users can play, pause, skip, and adjust playback speed. The interface is fully keyboard-accessible and includes captions/transcripts.

**Key invariant:** Audio is *optional* and *supplementary*. The text transcript is always available. Audio does not replace reading — it enhances access.

---

### 2. Allowed Synthetic Asset

**Asset:** QS 2:82 (Indonesian Kemenag translation)

**Provenance:**
- **Source:** `corpus_translations:QS_2_82_id_kemenag`
- **Rights status:** `RIGHTS_EXACT_VERSION_CLEARED`
- **License:** Public Domain / Open Translation
- **Synthetic generation:** Text-to-speech (TTS) using open-source model (e.g., Coqui TTS, Mozilla TTS)
- **Audio format:** MP3, 128 kbps, 44.1 kHz
- **Duration:** ~15 seconds
- **File size:** ~240 KB

**Why this asset?**
- Rights-cleared (no licensing restrictions)
- Short (easy to test)
- Synthetic (no human recording costs)
- Multilingual support (Arabic original + Indonesian translation)

---

### 3. Audio Controls

**Control panel:**

```
┌─────────────────────────────────────────────────────────────┐
│  AUDIO NAVIGATION                                           │
│                                                             │
│  QS 2:82 (Indonesian Kemenag translation)                   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [⏮] [⏪] [▶️] [⏩] [⏭]                                  │ │
│  │ ━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━ 0:07 / 0:15  │ │
│  │ Speed: [0.5x] [0.75x] [1x] [1.25x] [1.5x] [2x]        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [📝 Show transcript]  [⚙️ Settings]                        │
│                                                             │
│  Keyboard shortcuts:                                        │
│  Space = play/pause  ← → = skip 5s  [ ] = speed            │
└─────────────────────────────────────────────────────────────┘
```

**Controls:**
- **⏮ Previous:** Jump to previous segment (if multi-segment)
- **⏪ Skip back 5s:** Rewind 5 seconds
- **▶️ Play / ⏸ Pause:** Toggle playback
- **⏩ Skip forward 5s:** Fast-forward 5 seconds
- **⏭ Next:** Jump to next segment (if multi-segment)
- **Progress bar:** Seek to position
- **Speed selector:** Adjust playback speed (0.5x – 2x)
- **Show transcript:** Toggle transcript panel
- **Settings:** Audio quality, voice selection, caption style

---

### 4. Keyboard Accessibility

**Keyboard shortcuts:**

| Key | Action |
|-----|--------|
| `Space` | Play / pause |
| `←` (Left arrow) | Skip back 5 seconds |
| `→` (Right arrow) | Skip forward 5 seconds |
| `[` | Decrease playback speed |
| `]` | Increase playback speed |
| `T` | Toggle transcript |
| `?` | Show keyboard shortcuts |

**Focus management:**
- Tab order: Play button → Skip back → Skip forward → Speed selector → Transcript toggle → Settings
- Focus indicator: Visible outline (2px solid blue)
- Skip links: "Skip to audio controls" link at top of page

**Screen reader support:**
- ARIA labels: `aria-label="Play audio"`, `aria-label="Skip back 5 seconds"`, etc.
- Live regions: `aria-live="polite"` for playback position updates
- Role: `role="application"` for audio player container

---

### 5. Transcript Panel

**Transcript display:**

```
┌─────────────────────────────────────────────────────────────┐
│  TRANSCRIPT                                                  │
│                                                              │
│  QS 2:82 (Indonesian Kemenag translation)                    │
│                                                              │
│  [0:00] Adapun orang-orang yang beriman dan beramal saleh,  │
│  [0:05] mereka itulah penghuni surga. Mereka kekal di       │
│  [0:10] dalamnya.                                            │
│                                                              │
│  [📋 Copy transcript]  [⬇️ Download transcript]              │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- **Synchronized highlighting:** Current phrase is highlighted as audio plays
- **Clickable phrases:** Click a phrase to jump to that position
- **Copy/download:** Export transcript as plain text or Markdown
- **Caption style:** Customizable font size, color, background

**Transcript format:**
```json
{
  "version": "1.0",
  "passageRef": "QS 2:82",
  "translation": "Indonesian Kemenag",
  "phrases": [
    {
      "startTime": 0.0,
      "endTime": 4.5,
      "text": "Adapun orang-orang yang beriman dan beramal saleh,"
    },
    {
      "startTime": 4.5,
      "endTime": 9.0,
      "text": "mereka itulah penghuni surga."
    },
    {
      "startTime": 9.0,
      "endTime": 15.0,
      "text": "Mereka kekal di dalamnya."
    }
  ]
}
```

---

### 6. Access Review Protocol

**How to conduct the access review:**

1. **Recruit participants:** 3–5 users with diverse accessibility needs (visual impairment, motor impairment, cognitive disability)
2. **Task scenarios:**
   - Play audio from the beginning
   - Pause and resume playback
   - Skip to a specific position
   - Adjust playback speed
   - Read along with transcript
   - Navigate using keyboard only
3. **Collect feedback:**
   - Comprehension: Did audio improve understanding?
   - Accessibility: Were controls easy to use?
   - Satisfaction: Would you use this feature again?
4. **Analyze results:**
   - Task completion rate (target: >90%)
   - Time on task (target: <30 seconds per task)
   - Satisfaction score (target: >4/5 Likert scale)

**Success criteria:**
- Task completion rate >90%
- Keyboard navigation works 100% of the time
- Screen reader announces all controls correctly
- Satisfaction score >4/5

---

### 7. Asset Provenance

**Provenance badge:**

```
┌─────────────────────────────────────────────────────────────┐
│  AUDIO PROVENANCE                                            │
│                                                              │
│  Source: QS 2:82 (Indonesian Kemenag translation)            │
│  Rights: RIGHTS_EXACT_VERSION_CLEARED                        │
│  License: Public Domain / Open Translation                   │
│  Synthetic: Yes (TTS generated, Coqui TTS v1.0)              │
│  Generated: 2026-10-31T09:44:00.000Z                         │
│  Checksum: SHA-256 a1b2c3d4e5f6...                           │
│                                                              │
│  [🔍 Verify provenance]  [📄 View license]                   │
└─────────────────────────────────────────────────────────────┘
```

**Provenance verification:**
1. Compute SHA-256 hash of audio file
2. Compare to hash in provenance record
3. If match → audio is authentic
4. If mismatch → audio is corrupted; reject

---

### 8. Implementation Plan (Deferred)

**Phase 1: Asset generation (this task)**
- Confirm allowed synthetic asset (Section 2)
- Generate audio using TTS
- Create transcript with timestamps
- Compute checksums

**Phase 2: Audio player prototype (if approved)**
- Build audio player UI (Section 3)
- Implement keyboard shortcuts (Section 4)
- Add transcript panel (Section 5)
- Integrate with corpus reader

**Phase 3: Access review (if prototype is built)**
- Recruit participants (Section 6)
- Conduct usability testing
- Collect feedback
- Analyze results

**Phase 4: Production deployment (if review succeeds)**
- Optimize audio quality
- Add more passages
- Support multiple languages
- Integrate with user preferences

---

### 9. Verification

**How to verify this design meets acceptance criteria:**

1. **Controls work by keyboard:** Keyboard shortcuts defined (Section 4); focus management specified.
2. **Transcript remains available:** Transcript panel always accessible (Section 5); can be toggled but not removed.
3. **Asset provenance is clear:** Provenance badge shows source, rights, license, checksum (Section 7).

---

### 10. Risks & Rollback

**Risks:**
- **Audio quality:** TTS may sound robotic. Mitigation: Use high-quality TTS model; allow user to adjust voice.
- **Synchronization:** Transcript may drift from audio. Mitigation: Use phrase-level timestamps; allow manual adjustment.
- **Accessibility gaps:** Some users may still struggle. Mitigation: Conduct access review; iterate based on feedback.

**Rollback:**
- Disable audio navigation
- Revert to text-only view
- No data migration needed (audio is additive)

---

### 11. Metrics (If Implemented)

- **Adoption:** % of users who enable audio navigation (target: >20%)
- **Completion rate:** % of users who complete listening (target: >80%)
- **Keyboard usage:** % of interactions via keyboard (target: >30%)
- **Transcript usage:** % of users who view transcript (target: >50%)
- **Satisfaction:** avg. satisfaction score (target: >4/5)

---

## Conclusion

**M47-11 is a design document that:**
- Confirms allowed synthetic asset (QS 2:82 Indonesian Kemenag, rights-cleared)
- Prototypes audio controls (play/pause, skip, speed, seek)
- Specifies keyboard accessibility (shortcuts, focus management, screen reader)
- Designs transcript panel (synchronized highlighting, clickable phrases)
- Provides access review protocol (participants, tasks, success criteria)
- Documents asset provenance (source, rights, license, checksum)

**Deliverable:** This design document (no code implemented).

**Next step:** Generate synthetic audio asset and conduct access review with 3–5 participants.
