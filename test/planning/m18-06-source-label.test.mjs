import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AI_INVOLVEMENT_STATES,
  REVIEWER_SCOPE_CODES,
  SOURCE_KINDS,
  SOURCE_SENSES,
  buildSourceLabel,
} from '../../packages/moonql-research/src/source-label.ts';
import { SOURCE_SENSES as SEED_SOURCE_SENSES } from '../../packages/moonql-research/src/seed.ts';

// Every fixture below is synthetic. No witness text, source bytes, consent
// record or production identifier is used.
const SOURCE_REF = 'fixture:source:critical-edition-1';
const SOURCE_VERSION = '1.2.0';
const DERIVED_FROM_REF = 'fixture:source:arabic-edition-1';
const REVIEWER_REF = 'principal:fixture:reviewer-001';
const REVIEWER_NAME = 'Fixture Reviewer';
const INVENTED_REF = 'fixture:source:invented-by-label';

function original(overrides = {}) {
  return {
    sourceKind: 'ORIGINAL_SOURCE',
    sourceSense: 'ORIGINAL_ARABIC',
    sourceRef: SOURCE_REF,
    sourceVersion: SOURCE_VERSION,
    aiInvolvement: 'NONE',
    reviewerRef: REVIEWER_REF,
    reviewerName: REVIEWER_NAME,
    reviewerScopes: ['SOURCE', 'RIGHTS'],
    ...overrides,
  };
}

function without(record, key) {
  const copy = { ...record };
  delete copy[key];
  return copy;
}

function labelTexts(label) {
  return [
    label.badge,
    label.recordedProvenanceLabel,
    label.sourceKindLabel,
    label.reviewerScope.label,
    label.sourceIdentity.label,
    label.aiDisclosure.label,
    label.translationDisclosure.label,
  ];
}

function assertNotOriginal(label) {
  assert.notEqual(label.displayProvenance, 'ORIGINAL', JSON.stringify(label));
  assert.equal(label.mayRenderOriginal, false);
  assert.notEqual(label.badge.key, 'displayOriginal');
  assert.ok(label.reasons.length > 0, 'a downgraded label must carry at least one reason');
}

test('positive: the source sense vocabulary stays mirrored to the research seed', () => {
  assert.deepEqual([...SOURCE_SENSES], [...SEED_SOURCE_SENSES]);
});

test('positive: a fully evidenced original renders ORIGINAL with every axis named', () => {
  const label = buildSourceLabel(original());

  assert.equal(label.schemaVersion, '1.0.0');
  assert.equal(label.recordedProvenance, 'ORIGINAL');
  assert.equal(label.displayProvenance, 'ORIGINAL');
  assert.equal(label.mayRenderOriginal, true);
  assert.equal(label.badge.key, 'displayOriginal');
  assert.equal(label.badge.text, 'ORIGINAL SOURCE');
  assert.deepEqual(label.reasons, []);

  assert.equal(label.sourceKind, 'ORIGINAL_SOURCE');
  assert.equal(label.sourceKindLabel.key, 'sourceKindOriginal');

  assert.equal(label.reviewerScope.state, 'VERIFIED');
  assert.equal(label.reviewerScope.reason, null);
  assert.equal(label.reviewerScope.reviewerRef, REVIEWER_REF);
  assert.equal(label.reviewerScope.reviewerName, REVIEWER_NAME);
  assert.deepEqual(label.reviewerScope.codes, ['SOURCE', 'RIGHTS']);
  assert.equal(label.reviewerScope.label.key, 'reviewerScopeVerified');
  assert.equal(label.reviewerScope.label.text, 'Reviewer scope: SOURCE, RIGHTS');

  assert.equal(label.sourceIdentity.state, 'NAMED');
  assert.equal(label.sourceIdentity.ref, SOURCE_REF);
  assert.equal(label.sourceIdentity.version, SOURCE_VERSION);
  assert.equal(label.sourceIdentity.label.text, `Source identity: ${SOURCE_REF}@${SOURCE_VERSION}`);

  assert.equal(label.aiDisclosure.state, 'NONE');
  assert.equal(label.aiDisclosure.label.key, 'aiDisclosureNone');
  assert.equal(label.translationDisclosure.state, 'NOT_A_TRANSLATION');
  assert.equal(label.translationDisclosure.label.key, 'translationDisclosureNotTranslation');
});

test('positive: a licensed translation is DERIVATIVE and names the source it derives from', () => {
  const label = buildSourceLabel({
    sourceKind: 'LICENSED_TRANSLATION',
    sourceSense: 'LICENSED_TRANSLATION',
    derivedFromRef: DERIVED_FROM_REF,
    aiInvolvement: 'NONE',
    reviewerRef: REVIEWER_REF,
    reviewerScopes: ['LANGUAGE', 'RIGHTS'],
  });

  assert.equal(label.recordedProvenance, 'DERIVATIVE');
  assert.equal(label.displayProvenance, 'DERIVATIVE');
  assertNotOriginal(label);
  assert.equal(label.badge.key, 'displayDerivative');
  assert.ok(label.reasons.includes('TRANSLATION'));
  assert.equal(label.translationDisclosure.state, 'TRANSLATION');
  assert.ok(label.translationDisclosure.label.text.includes('NOT THE ORIGINAL-LANGUAGE TEXT'));
  assert.equal(label.sourceIdentity.state, 'NAMED');
  assert.equal(label.sourceIdentity.ref, DERIVED_FROM_REF);
  assert.ok(label.sourceIdentity.label.text.includes(DERIVED_FROM_REF));
  assert.equal(label.reviewerScope.state, 'VERIFIED');
});

test('positive: copywriting and third-party copyrighted content are DERIVATIVE, never ORIGINAL', () => {
  const cases = [
    ['COPYWRITING', 'COPYWRITING', 'sourceKindCopywriting'],
    ['THIRD_PARTY_COPYRIGHT', 'THIRD_PARTY_COPYRIGHT', 'sourceKindThirdPartyCopyright'],
  ];
  for (const [kind, reason, key] of cases) {
    const label = buildSourceLabel(original({ sourceKind: kind }));
    assert.equal(label.recordedProvenance, 'DERIVATIVE');
    assertNotOriginal(label);
    assert.ok(label.reasons.includes(reason), `${kind} must carry ${reason}`);
    assert.equal(label.sourceKindLabel.key, key);
  }
});

test('positive: AI involvement is disclosed and can never keep an ORIGINAL class', () => {
  for (const [kind, state, reason] of [
    ['AI_GENERATED', 'GENERATED', 'AI_GENERATED'],
    ['AI_ASSISTED', 'ASSISTED', 'AI_ASSISTED'],
  ]) {
    const label = buildSourceLabel(original({ sourceKind: kind }));
    assert.equal(label.recordedProvenance, 'DERIVATIVE');
    assertNotOriginal(label);
    assert.equal(label.aiDisclosure.state, state);
    assert.ok(label.aiDisclosure.label.text.includes('NOT ORIGINAL SOURCE'));
    assert.ok(label.reasons.includes(reason));
  }

  const declared = buildSourceLabel(original({ aiInvolvement: 'GENERATED' }));
  assert.equal(declared.recordedProvenance, 'DERIVATIVE');
  assertNotOriginal(declared);
  assert.equal(declared.aiDisclosure.state, 'GENERATED');
  assert.ok(declared.reasons.includes('AI_GENERATED'));
});

test('positive: labels are deterministic and frozen, and input mutation cannot alter a built label', () => {
  const record = original();
  const first = buildSourceLabel(record);
  const second = buildSourceLabel(original());

  assert.deepEqual(first, second);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.reviewerScope), true);
  assert.equal(Object.isFrozen(first.reviewerScope.codes), true);
  assert.equal(Object.isFrozen(first.sourceIdentity), true);
  assert.equal(Object.isFrozen(first.aiDisclosure.label), true);

  record.sourceKind = 'AI_GENERATED';
  record.sourceRef = 'fixture:source:mutated';
  record.reviewerScopes.push('EDITORIAL');

  assert.equal(first.displayProvenance, 'ORIGINAL');
  assert.equal(first.sourceIdentity.ref, SOURCE_REF);
  assert.deepEqual(first.reviewerScope.codes, ['SOURCE', 'RIGHTS']);
});

test('positive: only the complete positive gate can render ORIGINAL across the vocabulary matrix', () => {
  const kinds = [...SOURCE_KINDS, 'UNRECOGNISED_KIND', null];
  const senses = [...SOURCE_SENSES, 'UNRECOGNISED_SENSE', null];
  const aiStates = [...AI_INVOLVEMENT_STATES, null];
  const derivedValues = [null, DERIVED_FROM_REF];
  const refValues = [null, SOURCE_REF];
  const reviewerVariants = [
    { reviewerRef: REVIEWER_REF, reviewerScopes: ['SOURCE'] },
    { reviewerRef: null, reviewerScopes: ['SOURCE'] },
    { reviewerRef: REVIEWER_REF, reviewerScopes: [] },
    { reviewerRef: REVIEWER_REF, reviewerScopes: ['NOT_A_SCOPE'] },
  ];

  let originals = 0;
  for (const sourceKind of kinds) {
    for (const sourceSense of senses) {
      for (const aiInvolvement of aiStates) {
        for (const derivedFromRef of derivedValues) {
          for (const sourceRef of refValues) {
            for (const reviewer of reviewerVariants) {
              const label = buildSourceLabel({
                sourceKind,
                sourceSense,
                sourceRef,
                sourceVersion: SOURCE_VERSION,
                derivedFromRef,
                aiInvolvement,
                ...reviewer,
              });

              const reviewerVerified =
                reviewer.reviewerRef !== null &&
                reviewer.reviewerScopes.length > 0 &&
                reviewer.reviewerScopes.every((code) => REVIEWER_SCOPE_CODES.includes(code));
              const expected =
                sourceKind === 'ORIGINAL_SOURCE' &&
                sourceSense === 'ORIGINAL_ARABIC' &&
                aiInvolvement === 'NONE' &&
                derivedFromRef === null &&
                sourceRef !== null &&
                reviewerVerified;

              assert.equal(label.mayRenderOriginal, expected, JSON.stringify(label));
              assert.equal(label.displayProvenance === 'ORIGINAL', label.mayRenderOriginal);
              assert.equal(label.sourceIdentity.ref, derivedFromRef ?? sourceRef);

              if (label.mayRenderOriginal) {
                originals += 1;
                assert.equal(label.recordedProvenance, 'ORIGINAL');
                assert.equal(label.badge.key, 'displayOriginal');
                assert.deepEqual(label.reasons, []);
              } else {
                assertNotOriginal(label);
              }

              if (label.displayProvenance === 'DERIVATIVE') {
                assert.equal(label.recordedProvenance, 'DERIVATIVE');
              }
              if (label.displayProvenance === 'UNVERIFIED') {
                assert.notEqual(label.recordedProvenance, 'DERIVATIVE');
              }
              for (const code of label.reviewerScope.codes) {
                assert.ok(REVIEWER_SCOPE_CODES.includes(code));
              }
              for (const entry of labelTexts(label)) {
                assert.ok(entry.key.length > 0);
                assert.ok(entry.text.length > 0);
              }
            }
          }
        }
      }
    }
  }
  assert.equal(originals, 1, 'exactly one fully evidenced combination may render ORIGINAL');
});

test('negative: an unrecorded or unknown AI field blocks the ORIGINAL badge', () => {
  for (const record of [
    without(original(), 'aiInvolvement'),
    original({ aiInvolvement: null }),
    original({ aiInvolvement: 'UNKNOWN' }),
    original({ aiInvolvement: 'not-a-state' }),
  ]) {
    const label = buildSourceLabel(record);
    assert.equal(label.recordedProvenance, 'ORIGINAL');
    assert.equal(label.displayProvenance, 'UNVERIFIED');
    assert.equal(label.badge.key, 'displayOriginalUnverified');
    assert.equal(label.aiDisclosure.state, 'UNRECORDED');
    assert.ok(label.reasons.includes('AI_INVOLVEMENT_UNRECORDED'));
    assertNotOriginal(label);
  }
});

test('negative: a missing named reviewer falls back to an explicit unverified scope label', () => {
  for (const record of [
    without(original(), 'reviewerRef'),
    original({ reviewerRef: null }),
    original({ reviewerRef: '   ' }),
    original({ reviewerRef: 'principal:\nforged' }),
  ]) {
    const label = buildSourceLabel(record);
    assert.equal(label.displayProvenance, 'UNVERIFIED');
    assert.equal(label.reviewerScope.state, 'UNVERIFIED');
    assert.equal(label.reviewerScope.reason, 'REVIEWER_MISSING');
    assert.equal(label.reviewerScope.label.key, 'reviewerScopeNoReviewer');
    assert.ok(label.reviewerScope.label.text.includes('UNVERIFIED'));
    assert.ok(label.reasons.includes('REVIEWER_MISSING'));
    assertNotOriginal(label);
  }
});

test('negative: missing, unrecognised or mixed reviewer scopes never verify', () => {
  const missing = buildSourceLabel(original({ reviewerScopes: [] }));
  assert.equal(missing.reviewerScope.reason, 'REVIEWER_SCOPE_MISSING');
  assert.equal(missing.reviewerScope.label.key, 'reviewerScopeNoScope');
  assertNotOriginal(missing);

  const notAList = buildSourceLabel(original({ reviewerScopes: 'SOURCE' }));
  assert.equal(notAList.reviewerScope.reason, 'REVIEWER_SCOPE_MISSING');
  assertNotOriginal(notAList);

  const unknown = buildSourceLabel(original({ reviewerScopes: ['NOT_A_SCOPE'] }));
  assert.equal(unknown.reviewerScope.reason, 'REVIEWER_SCOPE_UNRECOGNISED');
  assert.equal(unknown.reviewerScope.label.key, 'reviewerScopeUnrecognised');
  assert.ok(unknown.reviewerScope.label.text.includes('NOT_A_SCOPE'));
  assert.deepEqual(unknown.reviewerScope.codes, []);
  assertNotOriginal(unknown);

  const mixed = buildSourceLabel(original({ reviewerScopes: ['SOURCE', 'NOT_A_SCOPE'] }));
  assert.equal(mixed.reviewerScope.reason, 'REVIEWER_SCOPE_UNRECOGNISED');
  assert.deepEqual(mixed.reviewerScope.codes, ['SOURCE']);
  assertNotOriginal(mixed);

  const nonString = buildSourceLabel(original({ reviewerScopes: ['SOURCE', 42, { scope: 'RIGHTS' }] }));
  assert.equal(nonString.reviewerScope.reason, 'REVIEWER_SCOPE_UNRECOGNISED');
  assert.equal(nonString.reviewerScope.label.text.includes('42'), false);
  assert.equal(nonString.reviewerScope.label.text.includes('object'), false);
  assertNotOriginal(nonString);

  const duplicate = buildSourceLabel(original({ reviewerScopes: ['SOURCE', 'SOURCE'] }));
  assert.equal(duplicate.reviewerScope.state, 'VERIFIED');
  assert.deepEqual(duplicate.reviewerScope.codes, ['SOURCE']);
  assert.equal(duplicate.displayProvenance, 'ORIGINAL');
});

test('negative: a missing source identity renders SOURCE UNAVAILABLE and invents no source', () => {
  const originalWithoutSource = buildSourceLabel(without(original(), 'sourceRef'));
  assert.equal(originalWithoutSource.sourceIdentity.state, 'UNAVAILABLE');
  assert.equal(originalWithoutSource.sourceIdentity.ref, null);
  assert.equal(originalWithoutSource.sourceIdentity.version, null);
  assert.equal(
    originalWithoutSource.sourceIdentity.label.text,
    'SOURCE UNAVAILABLE — no source identity recorded',
  );
  assert.ok(originalWithoutSource.reasons.includes('SOURCE_IDENTITY_MISSING'));
  assertNotOriginal(originalWithoutSource);

  const versionOnly = buildSourceLabel(original({ sourceRef: null }));
  assert.equal(versionOnly.sourceIdentity.state, 'UNAVAILABLE');
  assert.equal(versionOnly.sourceIdentity.version, null);

  const translationWithoutSource = buildSourceLabel({
    sourceKind: 'LICENSED_TRANSLATION',
    sourceSense: 'LICENSED_TRANSLATION',
    aiInvolvement: 'NONE',
    reviewerRef: REVIEWER_REF,
    reviewerScopes: ['LANGUAGE'],
  });
  assert.equal(translationWithoutSource.displayProvenance, 'DERIVATIVE');
  assert.equal(translationWithoutSource.sourceIdentity.state, 'UNAVAILABLE');
  assert.equal(JSON.stringify(translationWithoutSource).includes(INVENTED_REF), false);
  assert.ok(translationWithoutSource.reasons.includes('SOURCE_IDENTITY_MISSING'));
});

test('negative: conflicting source kind and sense fall to DERIVATIVE and name the conflict', () => {
  const originalKindTranslationSense = buildSourceLabel(original({ sourceSense: 'LICENSED_TRANSLATION' }));
  assert.equal(originalKindTranslationSense.recordedProvenance, 'DERIVATIVE');
  assert.equal(originalKindTranslationSense.displayProvenance, 'DERIVATIVE');
  assert.equal(originalKindTranslationSense.translationDisclosure.state, 'TRANSLATION');
  assert.ok(originalKindTranslationSense.reasons.includes('SOURCE_SENSE_CONFLICT'));
  assertNotOriginal(originalKindTranslationSense);

  const translationKindOriginalSense = buildSourceLabel({
    sourceKind: 'LICENSED_TRANSLATION',
    sourceSense: 'ORIGINAL_ARABIC',
    derivedFromRef: DERIVED_FROM_REF,
    aiInvolvement: 'NONE',
    reviewerRef: REVIEWER_REF,
    reviewerScopes: ['LANGUAGE'],
  });
  assert.equal(translationKindOriginalSense.displayProvenance, 'DERIVATIVE');
  assert.equal(translationKindOriginalSense.translationDisclosure.state, 'TRANSLATION');
  assert.ok(translationKindOriginalSense.reasons.includes('SOURCE_SENSE_CONFLICT'));
  assertNotOriginal(translationKindOriginalSense);
});

test('negative: a declared derivation is DERIVATIVE even when the kind says ORIGINAL_SOURCE', () => {
  const label = buildSourceLabel(original({ derivedFromRef: DERIVED_FROM_REF }));
  assert.equal(label.recordedProvenance, 'DERIVATIVE');
  assert.equal(label.displayProvenance, 'DERIVATIVE');
  assert.equal(label.sourceIdentity.ref, DERIVED_FROM_REF);
  assert.ok(label.reasons.includes('DERIVATIVE_DECLARED'));
  assertNotOriginal(label);
});

test('negative: missing or unrecognised source kinds cannot render ORIGINAL', () => {
  const missing = buildSourceLabel(without(original(), 'sourceKind'));
  assert.equal(missing.recordedProvenance, 'UNVERIFIED');
  assert.equal(missing.sourceKind, 'UNVERIFIED');
  assert.equal(missing.sourceKindLabel.key, 'sourceKindMissing');
  assert.ok(missing.reasons.includes('SOURCE_KIND_MISSING'));
  assertNotOriginal(missing);

  const unknown = buildSourceLabel(original({ sourceKind: 'original_source' }));
  assert.equal(unknown.recordedProvenance, 'UNVERIFIED');
  assert.equal(unknown.sourceKind, 'UNVERIFIED');
  assert.equal(unknown.sourceKindLabel.key, 'sourceKindUnrecognised');
  assert.ok(unknown.sourceKindLabel.text.includes('original_source'));
  assert.ok(unknown.reasons.includes('SOURCE_KIND_UNRECOGNISED'));
  assertNotOriginal(unknown);

  const missingSense = buildSourceLabel(without(original(), 'sourceSense'));
  assert.equal(missingSense.recordedProvenance, 'ORIGINAL');
  assert.equal(missingSense.displayProvenance, 'UNVERIFIED');
  assert.equal(missingSense.translationDisclosure.state, 'UNRECORDED');
  assert.ok(missingSense.reasons.includes('SOURCE_SENSE_UNRECORDED'));
  assertNotOriginal(missingSense);

  const unknownSense = buildSourceLabel(original({ sourceSense: 'MODERN_ENGLISH' }));
  assert.equal(unknownSense.displayProvenance, 'UNVERIFIED');
  assert.ok(unknownSense.reasons.includes('SOURCE_SENSE_UNRECOGNISED'));
  assertNotOriginal(unknownSense);
});

test('negative: malformed records never throw and never render ORIGINAL', () => {
  for (const value of [undefined, null, 42, 'ORIGINAL_SOURCE', [], [original()]]) {
    const label = buildSourceLabel(value);
    assert.equal(label.displayProvenance, 'UNVERIFIED');
    assert.equal(label.mayRenderOriginal, false);
    assert.ok(label.reasons.includes('RECORD_INVALID'));
  }

  for (const value of [new Date(), {}, { sourceKind: ['ORIGINAL_SOURCE'] }]) {
    const label = buildSourceLabel(value);
    assert.equal(label.displayProvenance, 'UNVERIFIED');
    assertNotOriginal(label);
  }
});

test('negative: control characters in identifiers are refused instead of displayed raw', () => {
  const source = buildSourceLabel(original({ sourceRef: 'fixture:source:\nsplit' }));
  assert.equal(source.sourceIdentity.state, 'UNAVAILABLE');
  assert.equal(source.displayProvenance, 'UNVERIFIED');
  assert.ok(source.reasons.includes('SOURCE_IDENTITY_MISSING'));

  const reviewer = buildSourceLabel(original({ reviewerRef: 'principal:\u0000forged' }));
  assert.equal(reviewer.reviewerScope.state, 'UNVERIFIED');
  assert.equal(reviewer.reviewerScope.reason, 'REVIEWER_MISSING');
  assertNotOriginal(reviewer);
});

test('negative: in-place mutation of a frozen label throws and leaves values unchanged', () => {
  const label = buildSourceLabel(original());
  assert.throws(() => {
    label.displayProvenance = 'DERIVATIVE';
  }, TypeError);
  assert.throws(() => {
    label.reviewerScope.codes.push('EDITORIAL');
  }, TypeError);
  assert.throws(() => {
    label.reasons.push('AI_GENERATED');
  }, TypeError);

  assert.equal(label.displayProvenance, 'ORIGINAL');
  assert.deepEqual(label.reviewerScope.codes, ['SOURCE', 'RIGHTS']);
  assert.deepEqual(label.reasons, []);
});
