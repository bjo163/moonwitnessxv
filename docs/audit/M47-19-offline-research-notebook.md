# M47-19 Offline Research Notebook Design

**Task ID:** M47-19  
**Status:** BASELINE ESTABLISHED  
**Date:** 2026-10-31  
**Owner:** Research UX  
**Dependencies:** None (leaf task)

## Objective

Design a local-only research notebook prototype for synthetic sources, with user-controlled export and deletion. Test whether users can manage notes without server sync, understand local-only status, and recover from device loss scenarios.

## Scope

Paper design only — disposable browser prototype storing only synthetic notes locally. No server sync, account binding, or private witness data.

---

## 1. Note Schema Design

### 1.1 Core Note Structure

```json
{
  "id": "note_20261031_001",
  "version": 1,
  "createdAt": "2026-10-31T09:00:00.000Z",
  "updatedAt": "2026-10-31T09:15:00.000Z",
  "title": "Analysis of Source Alpha",
  "content": "This note documents the key findings from...",
  "tags": ["source-alpha", "analysis", "draft"],
  "sourceRefs": ["src_001", "src_002"],
  "status": "draft",
  "metadata": {
    "wordCount": 245,
    "lastEditedBy": "user_local",
    "editHistory": [
      {"timestamp": "2026-10-31T09:00:00.000Z", "action": "created"},
      {"timestamp": "2026-10-31T09:10:00.000Z", "action": "edited"},
      {"timestamp": "2026-10-31T09:15:00.000Z", "action": "edited"}
    ]
  }
}
```

### 1.2 Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (timestamp-based) |
| `version` | integer | Yes | Schema version for migration support |
| `createdAt` | ISO 8601 | Yes | Creation timestamp (UTC) |
| `updatedAt` | ISO 8601 | Yes | Last modification timestamp (UTC) |
| `title` | string | Yes | Note title (max 200 characters) |
| `content` | string | Yes | Note body (Markdown supported, max 50,000 characters) |
| `tags` | string[] | No | User-defined tags for organization |
| `sourceRefs` | string[] | No | References to synthetic source IDs |
| `status` | enum | Yes | Note status: `draft`, `review`, `final`, `archived` |
| `metadata` | object | Yes | System-generated metadata |
| `metadata.wordCount` | integer | Auto | Calculated word count |
| `metadata.lastEditedBy` | string | Auto | Always "user_local" (no multi-user) |
| `metadata.editHistory` | array | Auto | Timestamped edit log |

### 1.3 Schema Constraints

1. **No PII:** Schema does not store user identity, email, or personal data
2. **No server sync:** All data is local-only; no cloud backup or sync fields
3. **No sensitive data:** Schema explicitly excludes passwords, tokens, or secrets
4. **Local storage only:** Data stored in browser localStorage or IndexedDB
5. **Export format:** JSON (human-readable) or Markdown (portable)
6. **Version migration:** Schema version field enables future migrations

### 1.4 Example Synthetic Sources

For testing, define 5 synthetic sources:

```json
[
  {
    "id": "src_001",
    "title": "Ancient Library Catalog (Fictional)",
    "type": "manuscript",
    "date": "circa 300 BCE",
    "provenance": "Synthetic test data"
  },
  {
    "id": "src_002",
    "title": "Archaeological Survey Report (Fictional)",
    "type": "report",
    "date": "2025",
    "provenance": "Synthetic test data"
  },
  {
    "id": "src_003",
    "title": "Scholar Commentary (Fictional)",
    "type": "commentary",
    "date": "2026",
    "provenance": "Synthetic test data"
  },
  {
    "id": "src_004",
    "title": "Translation Notes (Fictional)",
    "type": "translation",
    "date": "2026",
    "provenance": "Synthetic test data"
  },
  {
    "id": "src_005",
    "title": "Comparative Analysis (Fictional)",
    "type": "analysis",
    "date": "2026",
    "provenance": "Synthetic test data"
  }
]
```

---

## 2. Local Storage Prototype Design

### 2.1 Storage Technology Selection

| Technology | Capacity | Persistence | Browser Support | Recommendation |
|-----------|----------|-------------|-----------------|----------------|
| **localStorage** | ~5-10 MB | Until cleared | All modern browsers | ✓ Use for small datasets (<100 notes) |
| **sessionStorage** | ~5-10 MB | Until tab closes | All modern browsers | ✗ Not persistent enough |
| **IndexedDB** | ~50-500 MB | Until cleared | All modern browsers | ✓ Use for large datasets (>100 notes) |
| **Cache API** | ~50-500 MB | Until cleared | All modern browsers | ✗ Designed for HTTP responses |
| **File System Access API** | Unlimited | Permanent | Chrome/Edge only | ✗ Limited browser support |

**Recommendation:** Use localStorage for prototype (simpler, sufficient for testing). Provide migration path to IndexedDB for production.

### 2.2 Storage Architecture

```
┌─────────────────────────────────────────────────────────┐
│  BROWSER LOCAL STORAGE                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Key: "research_notebook_notes"                         │
│  Value: JSON array of all notes                         │
│  [                                                      │
│    {"id": "note_001", "title": "...", ...},            │
│    {"id": "note_002", "title": "...", ...},            │
│    ...                                                  │
│  ]                                                      │
│                                                         │
│  Key: "research_notebook_sources"                       │
│  Value: JSON array of synthetic sources                 │
│  [                                                      │
│    {"id": "src_001", "title": "...", ...},             │
│    ...                                                  │
│  ]                                                      │
│                                                         │
│  Key: "research_notebook_settings"                      │
│  Value: JSON object of user preferences                 │
│  {                                                      │
│    "theme": "light",                                    │
│    "sortOrder": "updatedAt",                            │
│    "viewMode": "list"                                   │
│  }                                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2.3 Storage Operations

#### Save Note

```javascript
function saveNote(note) {
  // Load existing notes
  const notes = JSON.parse(localStorage.getItem('research_notebook_notes') || '[]');
  
  // Check if note exists (update) or new (create)
  const existingIndex = notes.findIndex(n => n.id === note.id);
  
  if (existingIndex >= 0) {
    // Update existing note
    note.updatedAt = new Date().toISOString();
    note.metadata.editHistory.push({
      timestamp: note.updatedAt,
      action: 'edited'
    });
    notes[existingIndex] = note;
  } else {
    // Create new note
    note.createdAt = new Date().toISOString();
    note.updatedAt = note.createdAt;
    note.metadata.editHistory.push({
      timestamp: note.createdAt,
      action: 'created'
    });
    notes.push(note);
  }
  
  // Save back to localStorage
  localStorage.setItem('research_notebook_notes', JSON.stringify(notes));
  
  return note;
}
```

#### Load Notes

```javascript
function loadNotes() {
  const notesJson = localStorage.getItem('research_notebook_notes');
  if (!notesJson) return [];
  
  const notes = JSON.parse(notesJson);
  
  // Sort by updatedAt (most recent first)
  return notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}
```

#### Delete Note

```javascript
function deleteNote(noteId) {
  const notes = JSON.parse(localStorage.getItem('research_notebook_notes') || '[]');
  const filtered = notes.filter(n => n.id !== noteId);
  localStorage.setItem('research_notebook_notes', JSON.stringify(filtered));
  return true;
}
```

#### Delete All Notes

```javascript
function deleteAllNotes() {
  localStorage.removeItem('research_notebook_notes');
  localStorage.removeItem('research_notebook_sources');
  localStorage.removeItem('research_notebook_settings');
  return true;
}
```

### 2.4 Storage Limits and Warnings

| Metric | Limit | Warning Threshold | Action at Limit |
|--------|-------|-------------------|-----------------|
| **Total notes** | ~100 notes (5 MB) | 80 notes (4 MB) | Warn user; suggest export and delete old notes |
| **Single note size** | 50 KB | 40 KB | Warn user; suggest splitting note |
| **Total storage** | 10 MB | 8 MB | Block save; require export and cleanup |

**Warning message (at 80% capacity):**
```
⚠️ Storage Warning

Your research notebook is using 80% of available local storage (8 MB of 10 MB).

Recommendations:
- Export your notes to a file (see Export section)
- Delete old or unused notes
- Clear browser cache (will delete all local data)

If storage reaches 100%, you will not be able to save new notes.
```

---

## 3. Export Functionality

### 3.1 Export Formats

| Format | Use Case | Advantages | Disadvantages |
|--------|----------|------------|---------------|
| **JSON** | Backup, migration, programmatic access | Complete data; machine-readable; preserves metadata | Not human-readable; large file size |
| **Markdown** | Reading, sharing, publication | Human-readable; portable; widely supported | Loses metadata; no tags or source refs |
| **HTML** | Web publishing, printing | Formatted; includes styles; printable | Large file size; not editable |
| **CSV** | Spreadsheet analysis, tabular view | Tabular; sortable; filterable | Loses note content; only metadata |

**Recommendation:** Support JSON (complete backup) and Markdown (portable reading) as primary export formats.

### 3.2 JSON Export

```json
{
  "exportVersion": 1,
  "exportedAt": "2026-10-31T10:00:00.000Z",
  "noteCount": 15,
  "sourceCount": 5,
  "notes": [
    {
      "id": "note_001",
      "title": "Analysis of Source Alpha",
      "content": "This note documents...",
      "tags": ["source-alpha", "analysis"],
      "sourceRefs": ["src_001"],
      "status": "draft",
      "createdAt": "2026-10-31T09:00:00.000Z",
      "updatedAt": "2026-10-31T09:15:00.000Z",
      "metadata": {
        "wordCount": 245,
        "editHistory": [...]
      }
    },
    ...
  ],
  "sources": [
    {
      "id": "src_001",
      "title": "Ancient Library Catalog (Fictional)",
      ...
    },
    ...
  ]
}
```

**Export process:**
1. User clicks "Export → JSON"
2. System loads all notes and sources from localStorage
3. System generates JSON export object
4. System creates downloadable file: `research_notebook_export_20261031.json`
5. User saves file to local filesystem

### 3.3 Markdown Export

```markdown
# Research Notebook Export

Exported: 2026-10-31 10:00:00 UTC  
Total notes: 15

---

## Analysis of Source Alpha

**Status:** Draft  
**Created:** 2026-10-31 09:00:00 UTC  
**Updated:** 2026-10-31 09:15:00 UTC  
**Tags:** source-alpha, analysis  
**Sources:** src_001

This note documents the key findings from...

---

## Comparative Analysis of Sources

**Status:** Final  
**Created:** 2026-10-30 14:00:00 UTC  
**Updated:** 2026-10-31 08:30:00 UTC  
**Tags:** comparison, synthesis  
**Sources:** src_001, src_002, src_003

This note compares the three sources and identifies...

---
```

**Export process:**
1. User clicks "Export → Markdown"
2. System loads all notes from localStorage
3. System generates Markdown document (one section per note)
4. System creates downloadable file: `research_notebook_export_20261031.md`
5. User saves file to local filesystem

### 3.4 Export Options

| Option | Default | Description |
|--------|---------|-------------|
| **Include metadata** | ✓ | Export edit history, word count, timestamps |
| **Include tags** | ✓ | Export user-defined tags |
| **Include source refs** | ✓ | Export references to synthetic sources |
| **Include archived notes** | ✗ | Exclude notes with status "archived" |
| **Date range** | All | Export only notes created/updated within date range |
| **Tag filter** | All | Export only notes with specific tags |

---

## 4. Delete Functionality

### 4.1 Delete Operations

| Operation | Scope | Reversible | Confirmation Required |
|-----------|-------|------------|----------------------|
| **Delete single note** | One note | No (unless exported) | ✓ Yes |
| **Delete multiple notes** | Selected notes | No (unless exported) | ✓ Yes |
| **Delete all notes** | All notes in storage | No (unless exported) | ✓ Yes (double confirmation) |
| **Clear all data** | Notes + sources + settings | No | ✓ Yes (triple confirmation) |

### 4.2 Delete Confirmation Dialogs

#### Single Note Delete

```
┌─────────────────────────────────────────────────────────┐
│  Delete Note?                                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Are you sure you want to delete this note?             │
│                                                         │
│  Title: "Analysis of Source Alpha"                      │
│  Created: 2026-10-31 09:00:00 UTC                       │
│  Word count: 245                                        │
│                                                         │
│  ⚠️ This action cannot be undone.                       │
│  💡 Tip: Export your notes before deleting to create    │
│     a backup.                                           │
│                                                         │
│  [CANCEL]  [DELETE NOTE]                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Delete All Notes

```
┌─────────────────────────────────────────────────────────┐
│  Delete All Notes?                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Are you sure you want to delete ALL notes?             │
│                                                         │
│  Total notes: 15                                        │
│  Total word count: 3,245                                │
│  Date range: 2026-10-25 to 2026-10-31                   │
│                                                         │
│  ⚠️ This action cannot be undone.                       │
│  ⚠️ All local data will be permanently deleted.         │
│                                                         │
│  💡 Tip: Export your notes before deleting to create    │
│     a backup.                                           │
│                                                         │
│  To confirm, type "DELETE ALL" below:                   │
│  [_________________]                                    │
│                                                         │
│  [CANCEL]  [DELETE ALL NOTES] (disabled until confirmed)│
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.3 Delete Process

```javascript
function deleteNoteWithConfirmation(noteId) {
  // Show confirmation dialog
  const confirmed = showDeleteConfirmationDialog(noteId);
  
  if (!confirmed) return false;
  
  // Delete note from localStorage
  deleteNote(noteId);
  
  // Show success message
  showSuccessMessage('Note deleted successfully.');
  
  return true;
}

function deleteAllNotesWithConfirmation() {
  // Show confirmation dialog (requires typing "DELETE ALL")
  const confirmed = showDeleteAllConfirmationDialog();
  
  if (!confirmed) return false;
  
  // Delete all data from localStorage
  deleteAllNotes();
  
  // Show success message
  showSuccessMessage('All notes deleted successfully.');
  
  return true;
}
```

---

## 5. Device Loss Threat Model

### 5.1 Threat Scenarios

| Scenario | Likelihood | Impact | Mitigation |
|----------|-----------|--------|------------|
| **Browser cache cleared** | HIGH | All local data lost | Warn user; suggest regular exports |
| **Device lost/stolen** | MEDIUM | All local data lost | Warn user; suggest cloud backup (out of scope) |
| **Browser updated** | LOW | Data may be lost if storage API changes | Use stable storage APIs; test after updates |
| **LocalStorage quota exceeded** | MEDIUM | Cannot save new notes | Warn user at 80% capacity; block save at 100% |
| **User switches devices** | HIGH | Data not available on new device | Warn user; suggest export/import workflow |
| **User switches browsers** | HIGH | Data not available in new browser | Warn user; suggest export/import workflow |
| **Private/incognito mode** | HIGH | Data lost when browser closes | Detect private mode; warn user |
| **Disk failure** | LOW | All local data lost | Warn user; suggest multiple backups |

### 5.2 Threat Warnings

#### On First Use

```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ Local-Only Storage Warning                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  This research notebook stores all data LOCALLY in      │
│  your browser. This means:                              │
│                                                         │
│  ✓ Your data is private (not sent to any server)        │
│  ✓ Your data persists across browser sessions           │
│  ✗ Your data is NOT backed up to the cloud              │
│  ✗ Your data is NOT available on other devices          │
│  ✗ Your data will be LOST if you:                       │
│     - Clear your browser cache                          │
│     - Switch to a different browser                     │
│     - Switch to a different device                      │
│     - Use private/incognito mode                        │
│                                                         │
│  💡 Recommendations:                                    │
│  - Export your notes regularly (Export → JSON)          │
│  - Save exports to a secure location (cloud, USB, etc.) │
│  - Do not use private/incognito mode                    │
│  - Do not clear browser cache without exporting first   │
│                                                         │
│  [I UNDERSTAND, CONTINUE]                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### On Browser Cache Clear Detection

```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ Data Loss Detected                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Your local research notebook data has been cleared.    │
│                                                         │
│  This may have happened because:                        │
│  - You cleared your browser cache                       │
│  - You used a browser cleanup tool                      │
│  - Your browser was updated                             │
│  - You switched to private/incognito mode               │
│                                                         │
│  If you have a recent export, you can import it to      │
│  restore your data.                                     │
│                                                         │
│  [IMPORT EXPORT FILE]  [START FRESH]                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Recovery Procedures

#### Scenario 1: User Has Recent Export

1. User clicks "Import → JSON File"
2. User selects export file from local filesystem
3. System validates export file format
4. System loads notes and sources from export
5. System saves to localStorage
6. System shows success message: "Imported 15 notes successfully."

#### Scenario 2: User Has No Export (Data Lost)

1. System detects empty localStorage
2. System shows warning: "No local data found."
3. System offers options:
   - Start fresh (create new notebook)
   - Import export file (if user finds one later)
   - Exit (close application)
4. If user chooses "Start fresh," system initializes empty localStorage

#### Scenario 3: User Switches Devices

1. On old device: User exports notes to JSON file
2. User transfers JSON file to new device (email, USB, cloud, etc.)
3. On new device: User imports JSON file
4. System loads notes and sources from export
5. System saves to localStorage on new device

---

## 6. Usability Study Design

### 6.1 Study Objectives

1. **Can users create, edit, and delete notes without confusion?**
2. **Do users understand that data is local-only (not backed up)?**
3. **Can users successfully export and import notes?**
4. **Do users understand the risks of device loss and cache clearing?**
5. **Can users recover from data loss scenarios?**

### 6.2 Study Participants

**Target:** 10-15 participants

**Recruitment criteria:**
- Researchers, students, or knowledge workers who take notes
- Mix of technical and non-technical users
- Mix of browser experience (Chrome, Firefox, Safari, Edge)
- No prior experience with this specific prototype

### 6.3 Study Tasks

#### Task 1: Create and Edit Notes (5 minutes)

**Instructions:**
1. Create a new note titled "My First Note"
2. Write 2-3 sentences in the note body
3. Add tags: "test", "usability-study"
4. Save the note
5. Edit the note and change the title to "My Updated Note"
6. Save the changes

**Success criteria:**
- Note created successfully
- Tags added successfully
- Note edited and saved successfully
- User understands how to create and edit notes

#### Task 2: Export Notes (3 minutes)

**Instructions:**
1. Export all your notes to a JSON file
2. Save the export file to your desktop
3. Open the export file and verify it contains your note

**Success criteria:**
- Export file created successfully
- File saved to desktop
- File contains correct data (user verifies)

#### Task 3: Delete and Recover (5 minutes)

**Instructions:**
1. Delete the note "My Updated Note"
2. Confirm the deletion
3. Verify the note is no longer in your notebook
4. Import the JSON export file you created in Task 2
5. Verify the note is restored

**Success criteria:**
- Note deleted successfully
- User understands deletion is permanent
- Export file imported successfully
- Note restored successfully

#### Task 4: Device Loss Scenario (5 minutes)

**Instructions:**
1. Imagine your computer broke and you got a new one
2. Show me how you would recover your notes on the new computer
3. Export your notes to a JSON file
4. Clear your browser cache (simulate device loss)
5. Import the JSON file to recover your notes

**Success criteria:**
- User understands device loss scenario
- User exports notes before cache clearing
- User clears cache successfully
- User imports notes successfully
- User understands this is the recovery workflow

#### Task 5: Comprehension Questions (3 minutes)

**Ask user:**
1. Where is your note data stored? (Expected: "In my browser's local storage")
2. What happens if you clear your browser cache? (Expected: "All my notes are deleted")
3. What happens if you switch to a different browser? (Expected: "My notes are not available; I need to export/import")
4. How do you back up your notes? (Expected: "Export to JSON file and save to a secure location")
5. Is your data synced to the cloud? (Expected: "No, it's local-only")

**Success criteria:**
- User answers all questions correctly
- User understands local-only storage model
- User understands backup and recovery procedures

### 6.4 Study Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Task completion rate** | 90% | Count successful task completions |
| **Time on task** | <5 min per task | Timer for each task |
| **Error rate** | <10% | Count errors (wrong clicks, confusion) |
| **Comprehension score** | 80% correct | Count correct answers to comprehension questions |
| **User satisfaction** | 4/5 or higher | Post-study survey (Likert scale) |
| **Data loss understanding** | 100% | User correctly identifies local-only storage and risks |

### 6.5 Post-Study Survey

**Questions (1-5 Likert scale):**

1. How easy was it to create and edit notes?
2. How easy was it to export and import notes?
3. How clear was the warning about local-only storage?
4. How confident are you that you can recover from data loss?
5. How likely are you to use this notebook for real research?

**Open-ended questions:**

6. What was confusing or frustrating?
7. What features would you add?
8. How would you improve the data loss warning?
9. Would you trust this notebook with important research notes? Why or why not?

---

## 7. User Interface Design (Paper Mockup)

### 7.1 Main Notebook View

```
┌─────────────────────────────────────────────────────────────┐
│  📓 Research Notebook                          [Export ▼]  │
├─────────────────────────────────────────────────────────────┤
│  ⚠️ Local-only storage — not backed up to cloud            │
│     [Learn more]  [Dismiss]                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [+ New Note]  [Search...]  [Filter by tag ▼]             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📝 My Updated Note                                  │   │
│  │ Tags: test, usability-study                         │   │
│  │ Updated: 2026-10-31 10:15 AM  |  245 words         │   │
│  │ Status: Draft                                       │   │
│  │ [Open]  [Edit]  [Delete]                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📝 Comparative Analysis of Sources                  │   │
│  │ Tags: comparison, synthesis                         │   │
│  │ Updated: 2026-10-31 08:30 AM  |  1,245 words       │   │
│  │ Status: Final                                       │   │
│  │ [Open]  [Edit]  [Delete]                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📝 Source Alpha Notes                               │   │
│  │ Tags: source-alpha, analysis                        │   │
│  │ Updated: 2026-10-30 02:15 PM  |  532 words         │   │
│  │ Status: Review                                      │   │
│  │ [Open]  [Edit]  [Delete]                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Showing 3 of 3 notes  |  Total: 2,022 words              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Storage: 1.2 MB / 10 MB (12%)  [Manage Storage]          │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Note Editor View

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Notebook    📝 Edit Note          [Save] [✓]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Title: [My Updated Note_______________________________]   │
│                                                             │
│  Status: [Draft ▼]   Tags: [test, usability-study] [+]    │
│                                                             │
│  Sources: [src_001: Ancient Library Catalog] [Remove]     │
│           [Add source reference ▼]                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Content (Markdown supported):                       │   │
│  │                                                     │   │
│  │ This note documents the key findings from my        │   │
│  │ analysis of Source Alpha. The main points are:      │   │
│  │                                                     │   │
│  │ 1. The catalog dates to circa 300 BCE               │   │
│  │ 2. It contains 200 entries                          │   │
│  │ 3. The provenance is well-documented                │   │
│  │                                                     │   │
│  │ [B] [I] [U] [H1] [H2] [Link] [List]                │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Word count: 245  |  Last edited: 2026-10-31 10:15 AM     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Save Changes]  [Discard Changes]  [Delete Note]          │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Export Dialog

```
┌─────────────────────────────────────────────────────────────┐
│  Export Notes                                          [X] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Export format:                                             │
│  ◉ JSON (complete backup with metadata)                    │
│  ○ Markdown (human-readable, portable)                     │
│  ○ HTML (formatted for web publishing)                     │
│                                                             │
│  Options:                                                   │
│  ☑ Include metadata (edit history, word count)             │
│  ☑ Include tags                                             │
│  ☑ Include source references                               │
│  ☐ Include archived notes                                  │
│                                                             │
│  Filter:                                                    │
│  Date range: [All time ▼]                                  │
│  Tags: [All tags ▼]                                        │
│                                                             │
│  Notes to export: 3 of 3                                   │
│  Estimated file size: 15 KB                                │
│                                                             │
│  [CANCEL]  [EXPORT TO FILE]                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.4 Import Dialog

```
┌─────────────────────────────────────────────────────────────┐
│  Import Notes                                          [X] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Select export file to import:                              │
│                                                             │
│  [Choose File]  research_notebook_export_20261031.json     │
│                                                             │
│  File validation:                                           │
│  ✓ Valid JSON format                                       │
│  ✓ Export version: 1                                       │
│  ✓ Contains 3 notes                                        │
│  ✓ Contains 5 sources                                      │
│                                                             │
│  Import options:                                            │
│  ◉ Replace all existing notes                              │
│  ○ Merge with existing notes (skip duplicates)             │
│  ○ Add to existing notes (create duplicates if needed)     │
│                                                             │
│  ⚠️ Warning: Importing will modify your local notebook.    │
│     Consider exporting your current notes first.            │
│                                                             │
│  [CANCEL]  [IMPORT NOTES]                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Limitations and Deferred Items

### 8.1 Not Covered in This Baseline

1. **Actual prototype implementation:** This is a paper design only. No interactive prototype has been built.
2. **Real user testing:** Usability study is designed but not conducted.
3. **Real device loss testing:** Threat scenarios are documented but not tested in production.
4. **Cross-browser testing:** Storage behavior has not been tested across all browsers.
5. **Accessibility review:** UI mockups have not been tested with screen readers or keyboard navigation.
6. **Performance testing:** Storage limits and performance have not been measured with large datasets.
7. **Security audit:** Local storage security has not been audited for vulnerabilities.

### 8.2 Requires Owner Action

1. **Prototype development:** Build actual interactive prototype (HTML/CSS/JavaScript) — estimated 7-12 days
2. **User testing:** Recruit 10-15 participants and conduct usability study
3. **Device loss testing:** Test recovery scenarios with real users
4. **Cross-browser testing:** Test on Chrome, Firefox, Safari, Edge
5. **Accessibility review:** Test with users with disabilities
6. **Performance testing:** Test with 100+ notes to measure storage limits
7. **Security audit:** Review local storage security with security expert

---

## 9. Success Metrics

### 9.1 Quantitative Metrics

- **Task completion rate:** Target 90% of users complete all usability tasks
- **Time on task:** Target <5 minutes per task
- **Error rate:** Target <10% errors
- **Comprehension score:** Target 80% correct answers
- **User satisfaction:** Target 4/5 or higher
- **Data loss understanding:** Target 100% of users understand local-only storage

### 9.2 Qualitative Metrics

- **User confidence:** Target 80% of users feel confident they can recover from data loss
- **Trust:** Target 70% of users would trust this notebook with important research
- **Clarity:** Target 90% of users find the local-only warning clear and understandable
- **Ease of use:** Target 80% of users find export/import workflow intuitive

---

## 10. Revision Recommendations

### 10.1 Short-Term (0-3 months)

1. Build actual interactive prototype (HTML/CSS/JavaScript)
2. Conduct usability study with 10-15 participants
3. Test device loss and recovery scenarios
4. Iterate on design based on user feedback
5. Test on multiple browsers (Chrome, Firefox, Safari, Edge)

### 10.2 Medium-Term (3-12 months)

6. Conduct accessibility review with users with disabilities
7. Test performance with 100+ notes
8. Conduct security audit of local storage
9. Add advanced features (search, filtering, sorting)
10. Develop migration path to IndexedDB for large datasets

### 10.3 Long-Term (12+ months)

11. Integrate with production claim store (if applicable)
12. Add cloud backup option (optional, user-controlled)
13. Add multi-device sync (optional, user-controlled)
14. Develop mobile app version
15. Benchmark against other research notebook tools

---

## 11. Conclusion

This baseline establishes a comprehensive design for an offline research notebook with local-only storage. The note schema supports 15 fields including metadata and edit history. Storage architecture uses localStorage with 10 MB capacity and warning thresholds. Export functionality supports JSON (complete backup) and Markdown (portable) formats. Delete functionality includes single-note, multi-note, and delete-all operations with confirmation dialogs. Device loss threat model covers 8 scenarios with mitigation strategies. Usability study design includes 5 tasks, 5 comprehension questions, and post-study survey. Paper UI mockups demonstrate main notebook view, note editor, export dialog, and import dialog.

**Status:** BASELINE ESTABLISHED — ready for prototype development and user testing.

**Next steps:** Owner action required on prototype development, user testing, and cross-browser testing (see Section 8.2).

**Evidence:** This document.
