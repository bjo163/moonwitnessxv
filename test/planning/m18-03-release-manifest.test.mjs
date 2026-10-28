import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PUBLIC_RELEASE_SCOPE,
  ReleaseManifestError,
  buildReleaseManifest,
  createCurrentPointer,
  resolvePublicRevision,
} from '../../packages/moonql-research/src/release-manifest.ts';

// Every fixture below is synthetic. These strings are canaries: they may appear
// in a resolved public read but must never appear in a refusal record.
const CONTENT_REF = 'fixture:content:text-001';
const EDITION_REF = 'fixture:edition:critical-2';
const VERSION = '2.1.0';
const REVIEWER_REF = 'principal:fixture:reviewer-001';
const SETTER_REF = 'principal:fixture:release-setter-001';
const DECIDED_AT = '2026-10-20T00:00:00.000Z';
const APPROVED_AT = '2026-10-27T00:00:00.000Z';
const CONSENT_EXPIRES_AT = '2027-10-20T00:00:00.000Z';
const RELEASE_REF = 'fixture:release:001';

function revision(overrides = {}) {
  return {
    contentRef: CONTENT_REF,
    contentType: 'TEXT',
    editionRef: EDITION_REF,
    version: VERSION,
    rightsStatus: 'RIGHTS_EXACT_VERSION_CLEARED',
    rightsScope: PUBLIC_RELEASE_SCOPE,
    consentScope: PUBLIC_RELEASE_SCOPE,
    consentExpiresAt: CONSENT_EXPIRES_AT,
    reviewerRef: REVIEWER_REF,
    decidedAt: DECIDED_AT,
    approvalState: 'PUBLISHED',
    ...overrides,
  };
}

function build(revisions, overrides = {}) {
  return buildReleaseManifest({ releaseRef: RELEASE_REF, releaseVersion: 1, revisions, ...overrides });
}

function pointerFor(manifest, overrides = {}) {
  return createCurrentPointer(manifest, {
    approvedAt: APPROVED_AT,
    setBy: SETTER_REF,
    ...overrides,
  });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertResolved(result, contentRef = CONTENT_REF) {
  assert.equal(result.resolved, true, `expected a resolved revision, got ${JSON.stringify(result)}`);
  assert.equal(result.refusal, null);
  assert.equal(result.revision.contentRef, contentRef);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.revision), true);
}

function assertRefused(result, refusal) {
  assert.equal(result.resolved, false, `expected refusal ${refusal}, got ${JSON.stringify(result)}`);
  assert.equal(result.refusal, refusal);
  assert.equal(Object.hasOwn(result, 'revision'), false);
  const serialized = JSON.stringify(result);
  assert.equal(serialized.includes('fixture:content'), false);
  assert.equal(serialized.includes('fixture:edition'), false);
  assert.equal(serialized.includes('fixture:release'), false);
}

test('positive: exactly one approved revision resolves through the current pointer', () => {
  const manifest = build([revision()]);
  const pointer = pointerFor(manifest);
  const result = resolvePublicRevision(pointer, [manifest]);
  assertResolved(result);
  assert.equal(result.revision.editionRef, EDITION_REF);
  assert.equal(result.revision.version, VERSION);
  assert.equal(result.revision.reviewerRef, REVIEWER_REF);
  assert.equal(result.revision.decidedAt, DECIDED_AT);
  assert.equal(result.revision.approvalState, 'PUBLISHED');
  assert.equal(result.revision.manifestHash, manifest.manifestHash);
  assert.equal(result.revision.pointerVersion, 1);
});

test('positive: one published revision beside a draft resolves only the published revision', () => {
  const manifest = build([
    revision({ contentRef: 'fixture:content:text-002', approvalState: 'DRAFT', reviewerRef: null, decidedAt: null }),
    revision({ contentRef: 'fixture:content:text-003' }),
  ]);
  const result = resolvePublicRevision(pointerFor(manifest), [manifest]);
  assertResolved(result, 'fixture:content:text-003');
});

test('positive: each content type resolves its own approved revision and exact edition/version', () => {
  for (const contentType of ['TEXT', 'TESTIMONY', 'STORY']) {
    const contentRef = `fixture:content:${contentType.toLowerCase()}-001`;
    const manifest = build([revision({ contentType, contentRef })]);
    const result = resolvePublicRevision(pointerFor(manifest), [manifest]);
    assertResolved(result, contentRef);
    assert.equal(result.revision.contentType, contentType);
    assert.equal(result.revision.editionRef, EDITION_REF);
    assert.equal(result.revision.version, VERSION);
  }
});

test('positive: approved-within-scope and published both resolve; draft and in-review do not', () => {
  for (const approvalState of ['APPROVED_WITHIN_SCOPE', 'PUBLISHED']) {
    const manifest = build([revision({ approvalState })]);
    const result = resolvePublicRevision(pointerFor(manifest), [manifest]);
    assertResolved(result);
    assert.equal(result.revision.approvalState, approvalState);
  }
  for (const approvalState of ['DRAFT', 'IN_REVIEW']) {
    const manifest = build([revision({ approvalState, reviewerRef: null, decidedAt: null })]);
    assertRefused(resolvePublicRevision(pointerFor(manifest), [manifest]), 'REVISION_UNAPPROVED');
  }
});

test('positive: the manifest hash is deterministic across revision order and rebuilds', () => {
  const revisions = [
    revision({ contentRef: 'fixture:content:text-001' }),
    revision({ contentRef: 'fixture:content:text-002', contentType: 'TESTIMONY' }),
    revision({ contentRef: 'fixture:content:text-003', contentType: 'STORY', version: '1.0.0' }),
  ];
  const forward = build(revisions);
  const backward = build([...revisions].reverse());
  const rebuilt = build(revisions);
  assert.equal(forward.manifestHash, backward.manifestHash);
  assert.equal(forward.manifestHash, rebuilt.manifestHash);
  assert.deepEqual(forward, backward);
  assert.equal(forward.manifestHash.startsWith('sha256:'), true);
  assert.equal(forward.manifestHash.length, 'sha256:'.length + 64);
});

test('positive: every manifest field change produces a different hash', () => {
  const baseline = build([revision()]).manifestHash;
  const changes = [
    { contentRef: 'fixture:content:text-999' },
    { contentType: 'STORY' },
    { editionRef: 'fixture:edition:critical-3' },
    { version: '2.1.1' },
    { rightsStatus: 'PUBLIC_DOMAIN' },
    { rightsScope: 'internal-preview' },
    { consentScope: 'internal-preview' },
    { consentExpiresAt: '2028-10-20T00:00:00.000Z' },
    { reviewerRef: 'principal:fixture:reviewer-002' },
    { decidedAt: '2026-10-21T00:00:00.000Z' },
    { approvalState: 'APPROVED_WITHIN_SCOPE' },
  ];
  for (const change of changes) {
    const changed = build([revision(change)]).manifestHash;
    assert.notEqual(changed, baseline, `field change ${JSON.stringify(change)} reused the baseline hash`);
  }
  assert.notEqual(build([revision()], { releaseRef: 'fixture:release:002' }).manifestHash, baseline);
  assert.notEqual(build([revision()], { releaseVersion: 2 }).manifestHash, baseline);
});

test('positive: the pointer records version, manifest hash, approved-at instant and setter', () => {
  const manifest = build([revision()], { releaseVersion: 7 });
  const pointer = pointerFor(manifest);
  assert.equal(pointer.version, 7);
  assert.equal(pointer.manifestHash, manifest.manifestHash);
  assert.equal(pointer.approvedAt, APPROVED_AT);
  assert.equal(pointer.setBy, SETTER_REF);
  assert.equal(Object.isFrozen(pointer), true);
  assertResolved(resolvePublicRevision(pointer, [manifest]));
});

test('positive: a correction is a new manifest and a new pointer, never an overwrite', () => {
  const original = build([revision()]);
  const originalPointer = pointerFor(original);
  const corrected = build([revision({ contentRef: 'fixture:content:text-001-corrected', version: '2.2.0' })], {
    releaseVersion: 2,
  });
  const correctedPointer = pointerFor(corrected);
  assert.notEqual(corrected.manifestHash, original.manifestHash);
  assert.equal(correctedPointer.version, 2);
  assert.equal(resolvePublicRevision(correctedPointer, [original, corrected]).revision.contentRef, 'fixture:content:text-001-corrected');
  assert.equal(resolvePublicRevision(originalPointer, [original, corrected]).revision.contentRef, CONTENT_REF);
  assert.equal(resolvePublicRevision(originalPointer, [corrected]).refusal, 'MANIFEST_NOT_FOUND');
});

test('positive: build copies its input, so mutating the source cannot alter a built manifest', () => {
  const source = revision();
  const manifest = build([source]);
  const before = JSON.stringify(manifest);
  source.contentRef = 'fixture:content:forged';
  source.approvalState = 'DRAFT';
  assert.equal(JSON.stringify(manifest), before);
});

test('negative: two approved revisions are never both returned', () => {
  const manifest = build([
    revision({ contentRef: 'fixture:content:text-001' }),
    revision({ contentRef: 'fixture:content:text-002' }),
  ]);
  assertRefused(resolvePublicRevision(pointerFor(manifest), [manifest]), 'MULTIPLE_APPROVED_REVISIONS');
});

test('negative: rights-unknown revisions are refused', () => {
  const manifest = build([revision({ rightsStatus: 'RIGHTS_UNKNOWN' })]);
  assertRefused(resolvePublicRevision(pointerFor(manifest), [manifest]), 'RIGHTS_UNKNOWN');
});

test('negative: metadata-only and restricted rights are refused', () => {
  for (const rightsStatus of ['METADATA_ONLY', 'RESTRICTED']) {
    const manifest = build([revision({ rightsStatus })]);
    assertRefused(resolvePublicRevision(pointerFor(manifest), [manifest]), 'RIGHTS_NOT_CLEARED');
  }
});

test('negative: rights cleared for another scope are refused', () => {
  const manifest = build([revision({ rightsScope: 'internal-preview' })]);
  assertRefused(resolvePublicRevision(pointerFor(manifest), [manifest]), 'RIGHTS_SCOPE_MISMATCH');
  const missingScope = build([revision({ rightsScope: null })]);
  assertRefused(resolvePublicRevision(pointerFor(missingScope), [missingScope]), 'RIGHTS_SCOPE_MISMATCH');
});

test('negative: missing consent is refused', () => {
  const manifest = build([revision({ consentScope: null, consentExpiresAt: null })]);
  assertRefused(resolvePublicRevision(pointerFor(manifest), [manifest]), 'CONSENT_MISSING');
});

test('negative: consent for another scope is refused', () => {
  const manifest = build([revision({ consentScope: 'internal-preview' })]);
  assertRefused(resolvePublicRevision(pointerFor(manifest), [manifest]), 'CONSENT_SCOPE_MISMATCH');
});

test('negative: consent expired at the pointer instant is refused', () => {
  const manifest = build([revision({ consentExpiresAt: '2026-10-26T00:00:00.000Z' })]);
  assertRefused(resolvePublicRevision(pointerFor(manifest), [manifest]), 'CONSENT_EXPIRED');
  const boundary = build([revision({ consentExpiresAt: APPROVED_AT })]);
  assertRefused(resolvePublicRevision(pointerFor(boundary), [boundary]), 'CONSENT_EXPIRED');
});

test('negative: a pointer to an unknown release version or manifest is refused', () => {
  const manifest = build([revision()], { releaseVersion: 3 });
  const pointer = pointerFor(manifest);
  assertRefused(resolvePublicRevision({ ...pointer, version: 99 }, [manifest]), 'POINTER_VERSION_UNKNOWN');
  assertRefused(resolvePublicRevision(pointer, []), 'MANIFEST_NOT_FOUND');
  const other = build([revision()], { releaseRef: 'fixture:release:other' });
  assertRefused(resolvePublicRevision(pointerFor(other), [manifest]), 'MANIFEST_NOT_FOUND');
});

test('negative: an invalid pointer version is refused', () => {
  const manifest = build([revision()]);
  for (const version of [0, -1, 1.5, '1']) {
    const pointer = { ...pointerFor(manifest), version };
    assertRefused(resolvePublicRevision(pointer, [manifest]), 'POINTER_VERSION_INVALID');
  }
});

test('negative: a malformed pointer is refused', () => {
  const manifest = build([revision()]);
  const pointer = pointerFor(manifest);
  assertRefused(resolvePublicRevision(null, [manifest]), 'POINTER_INVALID');
  assertRefused(resolvePublicRevision({ ...pointer, manifestHash: 'not-a-hash' }, [manifest]), 'POINTER_INVALID');
  assertRefused(resolvePublicRevision({ ...pointer, approvedAt: 'yesterday' }, [manifest]), 'POINTER_INVALID');
  assertRefused(resolvePublicRevision({ ...pointer, setBy: '   ' }, [manifest]), 'POINTER_INVALID');
  const missingHash = clone(pointer);
  delete missingHash.manifestHash;
  assertRefused(resolvePublicRevision(missingHash, [manifest]), 'POINTER_INVALID');
});

test('negative: tampered manifest content is refused even when the pointer hash still matches', () => {
  const manifest = build([revision()]);
  const pointer = pointerFor(manifest);
  const tampered = clone(manifest);
  tampered.revisions[0].contentRef = 'fixture:content:forged';
  assertRefused(resolvePublicRevision(pointer, [tampered]), 'MANIFEST_TAMPERED');
  const extraField = clone(manifest);
  extraField.publishedBy = 'fixture:principal:forged';
  assertRefused(resolvePublicRevision(pointer, [extraField]), 'MANIFEST_TAMPERED');
});

test('negative: an ambiguous registry holding the same hash twice is refused', () => {
  const manifest = build([revision()]);
  assertRefused(resolvePublicRevision(pointerFor(manifest), [manifest, clone(manifest)]), 'MANIFEST_AMBIGUOUS');
});

test('negative: a non-list or malformed registry is refused', () => {
  const manifest = build([revision()]);
  const pointer = pointerFor(manifest);
  assertRefused(resolvePublicRevision(pointer, manifest), 'MANIFEST_LIST_INVALID');
  assertRefused(resolvePublicRevision(pointer, [manifest, 'fixture:not-a-manifest']), 'MANIFEST_LIST_INVALID');
});

test('negative: duplicate revision identity cannot silently overwrite a revision', () => {
  assert.throws(
    () => build([revision(), revision({ version: VERSION })]),
    (error) => error instanceof ReleaseManifestError && error.reason === 'DUPLICATE_REVISION',
  );
});

test('negative: an approved revision without a reviewer or decision time is rejected', () => {
  assert.throws(
    () => build([revision({ reviewerRef: null })]),
    (error) => error instanceof ReleaseManifestError && error.reason === 'REVISION_FIELD_MISSING',
  );
  assert.throws(
    () => build([revision({ decidedAt: null })]),
    (error) => error instanceof ReleaseManifestError && error.reason === 'REVISION_FIELD_MISSING',
  );
  assert.throws(
    () => build([revision({ consentExpiresAt: 'not-a-timestamp' })]),
    (error) => error instanceof ReleaseManifestError && error.reason === 'TIMESTAMP_INVALID',
  );
  assert.throws(
    () => build([revision()], { releaseVersion: 0 }),
    (error) => error instanceof ReleaseManifestError && error.reason === 'RELEASE_VERSION_INVALID',
  );
});

test('negative: in-place mutation attempts throw and leave the manifest unchanged', () => {
  const manifest = build([revision()]);
  const first = manifest.revisions[0];
  assert.equal(Object.isFrozen(manifest), true);
  assert.equal(Object.isFrozen(manifest.revisions), true);
  assert.equal(Object.isFrozen(first), true);
  assert.throws(() => { first.contentRef = 'fixture:content:forged'; }, TypeError);
  assert.throws(() => { manifest.manifestHash = 'sha256:' + '0'.repeat(64); }, TypeError);
  assert.throws(() => { manifest.revisions.push(revision()); }, TypeError);
  assert.equal(first.contentRef, CONTENT_REF);
  assertResolved(resolvePublicRevision(pointerFor(manifest), [manifest]));
});

test('negative: pointer creation rejects tampered manifests and invalid pointer fields', () => {
  const manifest = build([revision()]);
  const tampered = clone(manifest);
  tampered.releaseRef = 'fixture:release:forged';
  assert.throws(
    () => pointerFor(tampered),
    (error) => error instanceof ReleaseManifestError && error.reason === 'MANIFEST_TAMPERED',
  );
  assert.throws(
    () => pointerFor(manifest, { approvedAt: 'not-a-timestamp' }),
    (error) => error instanceof ReleaseManifestError && error.reason === 'POINTER_TIMESTAMP_INVALID',
  );
  assert.throws(
    () => pointerFor(manifest, { setBy: '' }),
    (error) => error instanceof ReleaseManifestError && error.reason === 'POINTER_SETTER_MISSING',
  );
  assert.throws(
    () => createCurrentPointer(manifest, null),
    (error) => error instanceof ReleaseManifestError && error.reason === 'POINTER_FIELD_INVALID',
  );
});
