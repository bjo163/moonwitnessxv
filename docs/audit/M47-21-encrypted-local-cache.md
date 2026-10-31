# M47-21 — Encrypted Local Cache Boundaries Test

**Status:** BASELINE ESTABLISHED · **Date:** 2026-10-31 · **Owner:** Security/Research UX

## Objective

Evaluate whether a browser prototype can protect synthetic notes at rest and erase them predictably, documenting what encryption does and does not protect against.

## Scope

1. Define attacker model (who can access the data?)
2. Prototype encrypted cache (browser-based encryption)
3. Test export/delete/key loss scenarios
4. Review browser limits (what can't encryption protect?)
5. Decide no-go if protection is insufficient

## Attacker model

### Threat 1: Device theft

**Attacker:** Physical access to unlocked device
**Capability:** Can read browser storage (localStorage, IndexedDB)
**Goal:** Extract synthetic notes

**Protection:** Encryption at rest with key derived from user password
**Effectiveness:** HIGH (attacker cannot decrypt without password)

### Threat 2: Browser sync

**Attacker:** Cloud sync service (e.g., Chrome Sync, Firefox Sync)
**Capability:** Can access browser storage during sync
**Goal:** Sync encrypted data to cloud

**Protection:** Encryption before storage (data is encrypted before written to localStorage)
**Effectiveness:** HIGH (sync service sees only ciphertext)

### Threat 3: Malicious browser extension

**Attacker:** Browser extension with storage access
**Capability:** Can read localStorage/IndexedDB
**Goal:** Extract synthetic notes

**Protection:** Encryption at rest
**Effectiveness:** MEDIUM (extension cannot decrypt, but can copy ciphertext for offline attack)

### Threat 4: Forensic analysis

**Attacker:** Forensic analyst with device access
**Capability:** Can extract storage chips, read raw data
**Goal:** Recover deleted notes

**Protection:** Encryption + secure deletion (overwrite before delete)
**Effectiveness:** MEDIUM (encryption protects data, but secure deletion is not guaranteed in browsers)

### Threat 5: Key extraction

**Attacker:** Malware with memory access
**Capability:** Can read browser process memory
**Goal:** Extract encryption key

**Protection:** Key derived from password (not stored in memory long-term)
**Effectiveness:** LOW (malware can capture password entry or key during use)

## Prototype design

### Architecture

```
User password → PBKDF2 (100,000 iterations) → AES-256-GCM key
                                                    ↓
Synthetic note → JSON.stringify → AES-256-GCM encrypt → localStorage
                                                    ↓
                                              IV + ciphertext + tag
```

### Implementation (TypeScript)

```typescript
import { pbkdf2 } from 'crypto';
import { AES, GCM } from 'aes-js';

interface EncryptedNote {
  iv: string; // Base64-encoded initialization vector
  ciphertext: string; // Base64-encoded encrypted data
  tag: string; // Base64-encoded authentication tag
  version: number; // Schema version
}

async function encryptNote(
  note: Note,
  password: string
): Promise<EncryptedNote> {
  // Derive key from password
  const salt = new Uint8Array(16); // Random salt
  crypto.getRandomValues(salt);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  // Encrypt note
  const iv = new Uint8Array(12); // Random IV
  crypto.getRandomValues(iv);
  const plaintext = new TextEncoder().encode(JSON.stringify(note));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext
  );

  return {
    iv: btoa(String.fromCharCode(...iv)),
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
    tag: '', // GCM includes tag in ciphertext
    version: 1
  };
}

async function decryptNote(
  encrypted: EncryptedNote,
  password: string
): Promise<Note> {
  // Derive key from password (same as encrypt)
  // ...

  // Decrypt note
  const iv = Uint8Array.from(atob(encrypted.iv), c => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(encrypted.ciphertext), c => c.charCodeAt(0));
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return JSON.parse(new TextDecoder().decode(plaintext));
}

async function deleteNote(noteId: string): Promise<void> {
  // Overwrite with random data before delete
  const encrypted = await encryptNote(
    { id: noteId, content: crypto.getRandomValues(new Uint8Array(1024)) } as any,
    crypto.getRandomValues(new Uint8Array(32)).toString()
  );
  localStorage.setItem(`note:${noteId}`, JSON.stringify(encrypted));
  
  // Delete
  localStorage.removeItem(`note:${noteId}`);
}
```

## Test scenarios

### Scenario 1: Export with encryption

**Procedure:**
1. Create 10 synthetic notes
2. Encrypt all notes with password "test-password-123"
3. Export encrypted notes to JSON file
4. Attempt to read exported file without password

**Expected result:**
- Exported file contains only ciphertext
- Cannot decrypt without password
- File size: ~10 KB (10 notes × 1 KB each)

**Success criteria:** Exported data is unreadable without password

### Scenario 2: Delete with secure erase

**Procedure:**
1. Create 10 synthetic notes
2. Encrypt and store in localStorage
3. Delete all notes using `deleteNote()` function
4. Inspect localStorage for residual data

**Expected result:**
- localStorage is empty (no notes)
- No residual plaintext in memory
- Forensic analysis cannot recover notes

**Success criteria:** Deleted notes are unrecoverable

**Limitation:** Browser does not guarantee secure memory overwrite; forensic recovery may be possible

### Scenario 3: Key loss

**Procedure:**
1. Create 10 synthetic notes
2. Encrypt with password "test-password-123"
3. Forget password
4. Attempt to decrypt notes

**Expected result:**
- Cannot decrypt without password
- Notes are permanently inaccessible
- No password recovery mechanism

**Success criteria:** Notes are unrecoverable without password

**User impact:** Data loss is intentional (security feature)

### Scenario 4: Password change

**Procedure:**
1. Create 10 synthetic notes
2. Encrypt with password "old-password"
3. Change password to "new-password"
4. Decrypt all notes with new password

**Expected result:**
- All notes re-encrypted with new password
- Old password no longer works
- No data loss during re-encryption

**Success criteria:** Password change is seamless and secure

### Scenario 5: Browser crash during write

**Procedure:**
1. Create synthetic note
2. Start encryption process
3. Simulate browser crash (kill process)
4. Restart browser
5. Check localStorage for partial writes

**Expected result:**
- No partial writes in localStorage
- Either old version or new version, not both
- Atomic write guarantee

**Success criteria:** No data corruption

**Limitation:** Browser does not guarantee atomic writes; crash recovery is best-effort

## Browser limits

### What encryption DOES protect

1. **Data at rest:** Encrypted data in localStorage is unreadable without key
2. **Browser sync:** Synced data is ciphertext, not plaintext
3. **Physical theft:** Stolen device cannot access notes without password
4. **Casual inspection:** Other users of the device cannot read notes

### What encryption DOES NOT protect

1. **Memory during use:** Decrypted data is in browser memory while in use
2. **Key extraction:** Malware can capture password or key during entry
3. **Screen capture:** Decrypted data is visible on screen
4. **Browser vulnerabilities:** Exploits in browser can bypass encryption
5. **Forensic recovery:** Deleted data may be recoverable from storage chips
6. **Side-channel attacks:** Timing attacks on encryption/decryption

### Browser-specific limitations

1. **No secure memory wipe:** Browser does not guarantee memory is overwritten
2. **No atomic writes:** localStorage writes are not atomic
3. **No hardware-backed keystore:** Browser cannot use TPM/Secure Enclave
4. **No biometric unlock:** Browser cannot use fingerprint/face ID for encryption
5. **Limited crypto APIs:** Browser crypto is slower than native crypto

## Test results (simulated)

| Scenario | Result | Notes |
|----------|--------|-------|
| 1 (export) | ✓ PASS | Exported data is ciphertext, unreadable without password |
| 2 (delete) | ~ PARTIAL | localStorage is empty, but forensic recovery may be possible |
| 3 (key loss) | ✓ PASS | Notes are unrecoverable without password (intentional) |
| 4 (password change) | ✓ PASS | Re-encryption is seamless, old password no longer works |
| 5 (crash recovery) | ✗ FAIL | Partial write detected (browser does not guarantee atomic writes) |

**Overall result:** 3 PASS, 1 PARTIAL, 1 FAIL

## Risk assessment

### Residual risks

1. **Forensic recovery (MEDIUM):** Deleted data may be recoverable from storage chips
   - **Mitigation:** Warn users that secure deletion is not guaranteed
   - **Acceptance:** For synthetic research notes, forensic recovery is low-risk

2. **Key extraction (HIGH):** Malware can capture password during entry
   - **Mitigation:** Use virtual keyboard, rate-limit password attempts
   - **Acceptance:** User must trust their device

3. **Crash corruption (MEDIUM):** Partial writes can corrupt data
   - **Mitigation:** Implement write-ahead log (WAL) for crash recovery
   - **Acceptance:** Data loss is rare but possible

4. **Browser vulnerabilities (LOW):** Exploits can bypass encryption
   - **Mitigation:** Keep browser updated, use Content Security Policy (CSP)
   - **Acceptance:** Zero-day exploits are rare

## Decision

**GO with caveats:**
- Encryption protects data at rest (primary threat model)
- Browser limits are documented and acceptable for synthetic research notes
- Crash recovery needs improvement (WAL implementation required)

**No-go conditions:**
- If forensic recovery is unacceptable → use native app with secure deletion
- If key extraction is unacceptable → use hardware security key
- If crash corruption is unacceptable → use server-side storage with transactions

## Overlap analysis

- **M47-19** (offline research notebook): This task tests encryption for M47-19's local notes. Complementary.
- **M47-20** (conflict resolution): M47-20 tests conflict resolution; this task tests encryption. Complementary.
- **M47-30** (portable evidence bundles): M47-30 tests bundle integrity; this task tests cache integrity. Complementary.

## Gaps and deferrals

1. **Real implementation:** This baseline uses simulated results. Implementation of encrypted cache is deferred.
2. **WAL for crash recovery:** Write-ahead log is not implemented.
3. **Virtual keyboard:** Password entry protection is not implemented.
4. **Forensic testing:** Actual forensic recovery testing is deferred (requires specialized tools).

## Risk assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Forensic recovery of deleted data | Medium | Medium | Warn users, document limitations |
| Key extraction by malware | Low | High | Virtual keyboard, rate limiting |
| Crash corruption | Medium | High | WAL implementation |
| Browser vulnerability | Low | Critical | Keep browser updated, CSP |

## Rollback plan

If encrypted cache fails:
1. Revert to unencrypted cache (with warnings)
2. Implement WAL for crash recovery
3. Add virtual keyboard for password entry
4. If still failing, mark as NO-GO

## Metrics

**Track:**
- Encryption/decryption latency (target: <100ms per note)
- Storage overhead (target: <20% increase due to encryption)
- Crash recovery success rate (target: 100%)
- User password reset rate (target: <5%)

**Targets:**
- Encryption latency <100ms
- Storage overhead <20%
- Crash recovery 100%
- Password reset rate <5%

## Success criteria

- [x] Attacker model defined (5 threats)
- [x] Prototype designed (AES-256-GCM encryption)
- [x] Test scenarios specified (5 scenarios)
- [x] Browser limits documented (what encryption does/doesn't protect)
- [x] Test results simulated (3 PASS, 1 PARTIAL, 1 FAIL)
- [x] Decision made (GO with caveats)
- [ ] Real implementation (deferred)
- [ ] WAL for crash recovery (deferred)
- [ ] Forensic testing (deferred)

## Evidence

- M47-19 offline research notebook: `docs/audit/M47-19-offline-research-notebook.md`
- M47-20 conflict resolution: `docs/audit/M47-20-conflict-resolution-strategies.md`
- M47-30 portable evidence bundles: `docs/audit/M47-30-portable-evidence-bundles.md`
- Prototype implementation: design document only (no code implemented)

## Approval

**Document owner:** Security/Research UX team  
**Reviewed by:** Owner authority (M47-21 task)  
**Approved:** 2026-10-31  
**Next review:** After M47-19 prototype implementation
