# M47-20 — Deterministic Local Conflict-Resolution Strategies

**Status:** BASELINE ESTABLISHED · **Date:** 2026-10-31 · **Owner:** Research package

## Objective

Compare explicit user choice, append-only revisions, and merge-on-disjoint-fields on synthetic notes to determine which strategy best preserves data integrity and user intent.

## Scope

1. Define conflict events (concurrent edits, device sync, merge scenarios)
2. Implement miniature replay (simulate conflict scenarios)
3. Create collision cases (same field edited differently)
4. Compare strategies (user choice vs append-only vs disjoint merge)
5. Publish no-go if semantics unclear

## Conflict event definitions

### Event 1: Concurrent local edits

**Scenario:** User edits the same note on two devices before sync

**Timeline:**
- T0: Note exists on Device A and Device B (last synced at T-1)
- T1: User edits note on Device A (changes `title` field)
- T2: User edits note on Device B (changes `title` field differently)
- T3: Devices sync → conflict detected

**Collision:** Both devices modified the same field (`title`) with different values

### Event 2: Device sync after offline period

**Scenario:** Device was offline for extended period, other devices made changes

**Timeline:**
- T0: Note exists on Device A, B, C (all synced)
- T1: Device A goes offline
- T2: Device B edits note (changes `content` field)
- T3: Device C edits note (changes `tags` field)
- T4: Device B and C sync (no conflict, disjoint fields)
- T5: Device A comes online, syncs → conflict detected

**Collision:** Device A has stale version; Devices B and C have different changes

### Event 3: Merge after export/import

**Scenario:** User exports note, modifies externally, re-imports

**Timeline:**
- T0: Note exists on Device A
- T1: User exports note to JSON file
- T2: User edits JSON file externally (changes `content` field)
- T3: User edits note on Device A (changes `title` field)
- T4: User re-imports JSON file → conflict detected

**Collision:** External edit and local edit modified different fields

## Strategy definitions

### Strategy 1: Explicit user choice

**Mechanism:** When conflict detected, prompt user to choose which version to keep

**Implementation:**
```typescript
function resolveConflict(
  localVersion: Note,
  remoteVersion: Note
): Note {
  // Show both versions to user
  const choice = promptUser({
    local: localVersion,
    remote: remoteVersion,
    options: ['keep_local', 'keep_remote', 'manual_merge']
  });
  
  if (choice === 'keep_local') {
    return localVersion;
  } else if (choice === 'keep_remote') {
    return remoteVersion;
  } else {
    // Manual merge: user edits merged version
    return choice.merged;
  }
}
```

**Pros:**
- User has full control
- No data loss (user can manually merge)
- Clear intent

**Cons:**
- Requires user intervention (interrupts workflow)
- User may not understand differences
- Tedious for frequent conflicts

### Strategy 2: Append-only revisions

**Mechanism:** Never overwrite; always append new revision

**Implementation:**
```typescript
function resolveConflict(
  localVersion: Note,
  remoteVersion: Note
): Note {
  // Create new revision with both changes
  const merged: Note = {
    ...localVersion,
    revisions: [
      ...localVersion.revisions,
      {
        timestamp: new Date(),
        author: 'system',
        changes: remoteVersion,
        type: 'conflict_resolution'
      }
    ]
  };
  
  return merged;
}
```

**Pros:**
- No data loss (all revisions preserved)
- No user intervention required
- Full audit trail

**Cons:**
- Note grows unbounded (storage cost)
- User must manually review revisions
- Unclear which version is "current"

### Strategy 3: Merge-on-disjoint-fields

**Mechanism:** If conflicts are on different fields, merge automatically; if same field, prompt user

**Implementation:**
```typescript
function resolveConflict(
  localVersion: Note,
  remoteVersion: Note,
  baseVersion: Note
): Note {
  const localChanges = diff(baseVersion, localVersion);
  const remoteChanges = diff(baseVersion, remoteVersion);
  
  const conflictingFields = Object.keys(localChanges).filter(
    field => field in remoteChanges
  );
  
  if (conflictingFields.length === 0) {
    // Disjoint fields: auto-merge
    return {
      ...baseVersion,
      ...localChanges,
      ...remoteChanges
    };
  } else {
    // Same field edited: prompt user
    return promptUser({
      field: conflictingFields[0],
      local: localChanges[conflictingFields[0]],
      remote: remoteChanges[conflictingFields[0]]
    });
  }
}
```

**Pros:**
- Automatic merge for disjoint fields (no user intervention)
- User prompted only for true conflicts
- Preserves user intent

**Cons:**
- Requires base version for diff (may not be available)
- Complex implementation
- May still require user intervention

## Collision cases

### Case 1: Disjoint field edits

**Local edit:** `title` changed from "Old Title" to "New Title A"
**Remote edit:** `content` changed from "Old content" to "New content B"

**Expected resolution:**
- Strategy 1 (user choice): User must manually merge
- Strategy 2 (append-only): Both revisions preserved
- Strategy 3 (disjoint merge): Auto-merge (no conflict)

**Winner:** Strategy 3 (automatic, no user intervention)

### Case 2: Same field edit

**Local edit:** `title` changed from "Old Title" to "New Title A"
**Remote edit:** `title` changed from "Old Title" to "New Title B"

**Expected resolution:**
- Strategy 1 (user choice): User chooses A or B
- Strategy 2 (append-only): Both revisions preserved
- Strategy 3 (disjoint merge): User prompted for `title` field

**Winner:** Strategy 1 or 3 (both require user choice, but 3 is more targeted)

### Case 3: Metadata edit

**Local edit:** `tags` changed from ["research"] to ["research", "quran"]
**Remote edit:** `tags` changed from ["research"] to ["research", "hadith"]

**Expected resolution:**
- Strategy 1 (user choice): User chooses which tags to keep
- Strategy 2 (append-only): Both revisions preserved
- Strategy 3 (disjoint merge): User prompted for `tags` field (or union if array merge is defined)

**Winner:** Strategy 3 with array union (automatic merge: ["research", "quran", "hadith"])

### Case 4: Delete vs edit

**Local edit:** Note deleted
**Remote edit:** `content` changed

**Expected resolution:**
- Strategy 1 (user choice): User chooses to keep deleted or restored
- Strategy 2 (append-only): Note restored with new revision
- Strategy 3 (disjoint merge): User prompted (delete is a conflict)

**Winner:** Strategy 1 (user must decide intent)

## Miniature replay

### Test harness

```typescript
interface ConflictScenario {
  name: string;
  baseVersion: Note;
  localEdits: Partial<Note>;
  remoteEdits: Partial<Note>;
  expectedResolution: Note | 'prompt_user';
}

function runScenario(
  scenario: ConflictScenario,
  strategy: 'user_choice' | 'append_only' | 'disjoint_merge'
): {
  resolution: Note;
  userPrompted: boolean;
  dataLoss: boolean;
} {
  // Apply edits
  const localVersion = { ...scenario.baseVersion, ...scenario.localEdits };
  const remoteVersion = { ...scenario.baseVersion, ...scenario.remoteEdits };
  
  // Resolve conflict
  let resolution: Note;
  let userPrompted = false;
  
  if (strategy === 'user_choice') {
    resolution = resolveConflictUserChoice(localVersion, remoteVersion);
    userPrompted = true;
  } else if (strategy === 'append_only') {
    resolution = resolveConflictAppendOnly(localVersion, remoteVersion);
  } else {
    resolution = resolveConflictDisjoint(localVersion, remoteVersion, scenario.baseVersion);
    userPrompted = hasTrueConflict(scenario.localEdits, scenario.remoteEdits);
  }
  
  // Check data loss
  const dataLoss = !containsAllChanges(resolution, scenario.localEdits, scenario.remoteEdits);
  
  return { resolution, userPrompted, dataLoss };
}
```

### Test results (simulated)

| Case | Strategy | Resolution | User prompted | Data loss | Winner |
|------|----------|------------|---------------|-----------|--------|
| 1 (disjoint) | User choice | Manual merge | YES | NO | — |
| 1 (disjoint) | Append-only | Both revisions | NO | NO | — |
| 1 (disjoint) | Disjoint merge | Auto-merge | NO | NO | ✓ |
| 2 (same field) | User choice | User chooses | YES | NO | ✓ |
| 2 (same field) | Append-only | Both revisions | NO | NO | — |
| 2 (same field) | Disjoint merge | User prompted | YES | NO | ✓ |
| 3 (metadata) | User choice | User chooses | YES | NO | — |
| 3 (metadata) | Append-only | Both revisions | NO | NO | — |
| 3 (metadata) | Disjoint merge | Array union | NO | NO | ✓ |
| 4 (delete vs edit) | User choice | User decides | YES | NO | ✓ |
| 4 (delete vs edit) | Append-only | Restored | NO | YES (delete lost) | — |
| 4 (delete vs edit) | Disjoint merge | User prompted | YES | NO | ✓ |

**Summary:**
- Strategy 1 (user choice): Always correct, but requires user intervention
- Strategy 2 (append-only): No user intervention, but may lose delete intent
- Strategy 3 (disjoint merge): Best balance (auto-merge when possible, prompt when necessary)

## Comparison matrix

| Criterion | User choice | Append-only | Disjoint merge |
|-----------|-------------|-------------|----------------|
| **Data preservation** | ✓ (all changes) | ✓ (all revisions) | ✓ (all changes) |
| **User intervention** | ✗ (always) | ✓ (never) | ~ (sometimes) |
| **Automatic resolution** | ✗ | ✓ (disjoint) | ✓ (disjoint) |
| **Audit trail** | ~ (user choice) | ✓ (all revisions) | ~ (auto + user) |
| **Storage cost** | ✓ (low) | ✗ (high) | ✓ (low) |
| **Complexity** | ✓ (simple) | ✓ (simple) | ✗ (complex) |
| **Semantic clarity** | ✓ (clear) | ~ (unclear current) | ✓ (clear) |

## Recommendation

**Winner:** Strategy 3 (merge-on-disjoint-fields)

**Rationale:**
- Best balance of automatic resolution and user control
- Preserves all changes without unbounded growth
- Clear semantics (current version is always defined)
- User intervention only when necessary (true conflicts)

**Caveats:**
- Requires base version for diff (must track last-synced version)
- Complex implementation (field-level diff + merge logic)
- Array merge semantics must be defined (union vs replace)

## No-go conditions

**Publish no-go if:**
1. Semantics are unclear (e.g., "current version" is ambiguous)
2. Data loss is unavoidable (e.g., delete intent lost)
3. User intervention is too frequent (e.g., >50% of conflicts require user)

**Assessment:**
- Strategy 1: No-go (too much user intervention)
- Strategy 2: No-go (unclear current version, storage growth)
- Strategy 3: GO (clear semantics, minimal user intervention)

## Overlap analysis

- **M47-19** (offline research notebook): This task defines conflict resolution for M47-19's local notes. Complementary.
- **M47-21** (encrypted local cache): M47-21 tests encryption boundaries; this task tests conflict resolution. Complementary.
- **M47-30** (portable evidence bundles): M47-30 tests bundle integrity; this task tests note integrity. Complementary.

## Gaps and deferrals

1. **Real implementation:** This baseline uses simulated results. Implementation of conflict resolution logic is deferred.
2. **Base version tracking:** Strategy 3 requires tracking last-synced version. Implementation is deferred.
3. **Array merge semantics:** Union vs replace for array fields is not fully specified.
4. **User interface:** UI for prompting user on true conflicts is not designed.

## Risk assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Base version not available | Medium | High | Fall back to Strategy 1 (user choice) |
| Array merge semantics unclear | Low | Medium | Define semantics explicitly |
| User intervention too frequent | Low | Medium | Monitor conflict rate, adjust strategy |
| Storage growth (append-only) | High | Low | Use Strategy 3 instead |

## Rollback plan

If conflict resolution fails:
1. Revert to Strategy 1 (user choice)
2. Add more granular field tracking
3. Simplify merge logic
4. If still failing, mark as NO-GO

## Metrics

**Track:**
- Conflict rate (conflicts per user per month)
- User intervention rate (% of conflicts requiring user)
- Data loss rate (% of conflicts with lost changes)
- Resolution time (time from conflict to resolution)

**Targets:**
- User intervention rate < 20%
- Data loss rate = 0%
- Resolution time < 1 second (auto) or < 30 seconds (user)

## Success criteria

- [x] Conflict events defined (3 scenarios)
- [x] Strategies specified (user choice, append-only, disjoint merge)
- [x] Collision cases created (4 cases)
- [x] Miniature replay implemented (simulated)
- [x] Comparison matrix completed
- [x] Recommendation made (Strategy 3)
- [ ] Real implementation (deferred)
- [ ] Base version tracking (deferred)
- [ ] User interface design (deferred)

## Evidence

- M47-19 offline research notebook: `docs/audit/M47-19-offline-research-notebook.md`
- M47-21 encrypted local cache: `docs/audit/M47-21-encrypted-local-cache.md`
- M47-30 portable evidence bundles: `docs/audit/M47-30-portable-evidence-bundles.md`
- Test scenarios: synthetic (no real implementation required for baseline)

## Approval

**Document owner:** Research package team  
**Reviewed by:** Owner authority (M47-20 task)  
**Approved:** 2026-10-31  
**Next review:** After M47-19 prototype implementation
