/**
 * SRGBL v8 method constants and the pinned M13 seed.
 *
 * The SRGBL stage contract is adopted from M02-07 and frozen against the vision
 * pin. The executable P19 detail is read at the corpus pin below. The older
 * fourteen-stage pin named in M06-01 is unavailable, so it stays an unresolved
 * gate instead of being silently replaced by a different document.
 */

export const SRGBL_LEVELS = ['S1', 'R2', 'G3', 'B4', 'L5'] as const
export type SrgbLLevel = (typeof SRGBL_LEVELS)[number]

export const STAGE_NAMES: Record<SrgbLLevel, string> = {
  S1: 'Source & Sense',
  R2: 'Reality',
  G3: 'Governing Order',
  B4: 'Being',
  L5: 'Light',
}

export const STAGE_QUESTIONS: Record<SrgbLLevel, string> = {
  S1: 'Is the source, edition, rights and provenance traceable?',
  R2: 'What does this specific text express?',
  G3: 'Which relations, conditions or rules follow from the evidence?',
  B4: 'Who is the actor, recipient, role and context?',
  L5: 'What bounded, derived reading is reviewable?',
}

export const STAGE_LIMITS: Record<SrgbLLevel, string> = {
  S1: 'Cannot prove the source is infallible or licensed for every use.',
  R2: 'Cannot prove that every external or supernatural event occurred.',
  G3: 'Cannot turn a coincidental pattern into a universal law.',
  B4: 'Cannot establish ontological identity from a nickname or role.',
  L5: 'Cannot issue divine instruction, absolute truth or a salvation verdict.',
}

export const STAGE_RESULTS = ['PASS', 'UNKNOWN', 'FAIL'] as const
export type StageResult = (typeof STAGE_RESULTS)[number]

export const SOURCE_SENSES = ['ORIGINAL_ARABIC', 'LICENSED_TRANSLATION'] as const
export const RESEARCH_LENSES = ['COMPARATIVE_NEUTRAL', 'ISLAMIC_QURAN_ANCHORED', 'ACADEMIC_HISTORICAL'] as const
export const REVIEW_STATES = ['ENGINEERING_ONLY', 'UNREVIEWED', 'DISPUTED'] as const

export const EPISTEMIC_KINDS = ['OBSERVED_TEXT', 'INFERRED', 'INTERPRETED'] as const
export const CLAIM_REPRESENTATIONS = ['SOURCE_TEXT', 'TRANSLATION', 'INFERENCE'] as const
export const CLAIM_STATUSES = ['SUPPORTED', 'UNKNOWN', 'REJECTED'] as const

export const SRGBL_RELATION_TYPES = [
  'AFFIRMS',
  'PARALLELS',
  'CLARIFIES',
  'QUALIFIES',
  'CONTRASTS',
  'CORRECTS_WITHIN_FRAME',
  'UNRESOLVED',
  'NOT_RELATED',
] as const
export const DEFENSIBILITY = ['DEFENSIBLE', 'SPECULATIVE', 'UNKNOWN'] as const

export const KEY_SCHEME = 'semantic-core:v0'
export const KEY_SCHEME_STATUS = 'CANDIDATE_NOT_RATIFIED'
export const P18_KEY_CANDIDATES = [
  'mercy',
  'compassion',
  'forgiveness',
  'comfort',
  'justice',
  'truth',
  'accountability',
  'restoration',
  'praise',
  'gratitude',
  'trust',
  'hope',
  'patience',
  'humility',
  'generosity',
  'wisdom',
  'narrative',
  'warning',
  'promise',
  'covenant',
] as const

export const SWING_OPERATORS = [
  'direction',
  'polarity',
  'subject-object',
  'cause-effect',
  'perspective',
  'temporal',
  'semantic-opposition',
] as const
export type SwingOperator = (typeof SWING_OPERATORS)[number]

export const HYPOTHESIS_MODES = ['SWING', 'POSITIVE_CORRECTION', 'OFFSIDE'] as const
export const HYPOTHESIS_STATUSES = ['CANDIDATE', 'CORROBORATED', 'REJECTED'] as const

export const WITNESS_COMPONENT_MAX = {
  sourceFidelity: 25,
  observability: 25,
  semanticConsistency: 20,
  crossReference: 15,
  nonOverlapping: 15,
} as const

export const QUALITY_DIMENSIONS = [
  'sGrounding',
  'rAccuracy',
  'gSupport',
  'bDiscipline',
  'lResponsibility',
  'provenance',
  'unknownHonesty',
  'alternativeCoverage',
  'confidenceCalibration',
  'actionUsefulness',
] as const

export const RIGHTS_STATUSES = [
  'RIGHTS_EXACT_VERSION_CLEARED',
  'RIGHTS_UNKNOWN',
  'METADATA_ONLY',
  'RESTRICTED',
  'PUBLIC_DOMAIN',
] as const
export const CLEARED_RIGHTS = 'RIGHTS_EXACT_VERSION_CLEARED'
export const QURAN_EDITION = 'quran_cairo_hafs'
export const QURAN_TRANSLATION = 'QS_2_82_id_kemenag'
export const QURAN_SHA256 = 'c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912'
export const DECIDED_AT = '2026-10-26T00:00:00.000Z'

export const RESEARCH_PINS = {
  srgblXiv: {
    ref: 'moonwitness-xiv@99e1a4f028b37dc1:research/frameworks/srgbl.md',
    sha256: null,
    status: 'UNAVAILABLE_AT_PIN',
    checkedAt: '2026-10-26',
    note: 'Raw URL 404; commit API 422 for the short SHA; the path is absent from the public main tree. Kept as an unresolved gate, not replaced by another document.',
  },
  p19Specs: {
    ref: 'moonwitness-corpus@e2f5b93fe172b61a78f0c8650f356e87600387ae:docs/MOONWITNESS-P19-EXECUTABLE-SPECS.md',
    sha256: 'c87c2a498dbe5340fe5a4ef3680f9c55d858beb89362f88d28832f314fa8c456',
    status: 'READ_AT_EXACT_SHA',
  },
  p19Register: {
    ref: 'moonwitness-corpus@e2f5b93fe172b61a78f0c8650f356e87600387ae:docs/P19-REGISTER-RECONCILIATION.md',
    sha256: 'dfdc679fe3a08c16ae7004e40a092611a4c3daccb8e196d5cab772b4c1c93656',
    status: 'READ_AT_EXACT_SHA',
  },
  p19Status: {
    ref: 'moonwitness-corpus@e2f5b93fe172b61a78f0c8650f356e87600387ae:docs/SRGBL-V8-IMPLEMENTATION-STATUS.md',
    sha256: 'e136fc9d402cf3dfc5089925cf8091207e5f487d2bcf263b93fdc1d71fa10835',
    status: 'READ_AT_EXACT_SHA',
  },
  sourceEditionMatrix: {
    ref: 'moonwitness-corpus@e2f5b93fe172b61a78f0c8650f356e87600387ae:docs/SRGBL-V8-SOURCE-EDITION-MATRIX.md',
    sha256: 'f1881959b36bdb9bda9f0f741676a9e1c76120d31708f89d12113708203b498b',
    status: 'AUDIT_ONLY_NO_CLEARANCE',
  },
  adoptionDecision: {
    ref: 'moonwitnessxv@d539cee:docs/decisions/M02-07-historical-decisions-matrix.md',
    sha256: '2cc26c18d5c8e8214a7f55de3386b3c55d361ebaaba7d926ed6aaf799fccd6c4',
    status: 'ADOPT_SRGBL_AS_D05_METHOD',
  },
  vision: {
    ref: 'moonwitnessxv@e2f4562:docs/vision/MASTER_VISION_NARRATIVE_XV.md#06',
    sha256: '7aedcf33606388a7306b184c40391b4f85909388c2cc65dcb867ce1b6932ccbb',
    status: 'FROZEN_CONTRACT',
  },
} as const

export const RESEARCH_META = {
  version: '1.0.0',
  method: 'srgbl-v8',
  methodStatus: 'ENGINEERING_CONTRACT_NOT_HUMAN_REVIEW',
  pins: RESEARCH_PINS,
  p19ReleaseDecision: 'BLOCKED',
  ownerNotice:
    'M13 implements bounded engineering contracts. It does not clear rights, ratify P18 keys, certify a reviewer, or promote a production reading.',
} as const

export const RESEARCH_ISSUE_REGISTER = [
  {
    id: 'P19-REG-L18-L19',
    finding:
      'L19 has no commit of its own while 0ea9659 implements its declared outcome under the p19-l18 tag; L18/L19 cannot both be claimed on that evidence.',
    status: 'OPEN_FOR_HUMAN',
  },
  {
    id: 'P19-REG-L13',
    finding:
      'L13 commit subject describes a different outcome than the declared L13 rejection of derived messages with dangling key IDs.',
    status: 'OPEN_FOR_HUMAN',
  },
  {
    id: 'P19-REG-L25',
    finding:
      'The five-case source/edition matrix is an audit, not a clearance. No interpretation edition is selected and reviewedBy stays null.',
    status: 'RIGHTS_GATE_OPEN',
  },
  {
    id: 'P19-REG-CI',
    finding:
      'No per-micro CI run exists; green wave-level runs prove the tree was green at the wave head, not that a micro acceptance check was reviewed.',
    status: 'OPEN_FOR_HUMAN',
  },
] as const

export const RESEARCH_POLICY = {
  stageOrder: SRGBL_LEVELS,
  failClosedUnknown: true,
  sourceRightsRequired: CLEARED_RIGHTS,
  exactShaRequired: true,
  engineeringCommitIsNotHumanReview: true,
  humanReviewAvailableInMilestone: false,
  reviewStates: REVIEW_STATES,
  scoringSeparated: true,
  combinedScore: null,
  theologicalRanking: 'FORBIDDEN',
  qualityRequiresCompleteBundle: true,
  witnessSupportIsCandidateSupport: true,
  directionRange: [-2, 2],
  swingTransformationIsTruth: false,
  swingMaximumDepth: 3,
  hypothesisSelfValidation: 'FORBIDDEN',
  positiveCorrectionRequiresDeclaredLens: true,
  offsideVerified: false,
  keySchemeStatus: KEY_SCHEME_STATUS,
  mergedWithFaithVerdict: false,
} as const

export const CASE_REVIEW_LABEL = 'ENGINEERING_ONLY — not a human review, not a rights clearance'

export type CaseSeed = {
  caseCode: string
  title: string
  citationKey: string
  editionCode: string | null
  translationCode: string | null
  sourceSense: (typeof SOURCE_SENSES)[number]
  evidenceSha: string | null
  rightsSnapshot: (typeof RIGHTS_STATUSES)[number]
  lens: (typeof RESEARCH_LENSES)[number]
  researchStatus: string
}

export const CASE_SEED: CaseSeed[] = [
  {
    caseCode: 'RC-QS-002-082-AR',
    title: 'QS 2:82 — exact Arabic edition reading',
    citationKey: 'QS 2:82',
    editionCode: QURAN_EDITION,
    translationCode: null,
    sourceSense: 'ORIGINAL_ARABIC',
    evidenceSha: QURAN_SHA256,
    rightsSnapshot: CLEARED_RIGHTS,
    lens: 'ISLAMIC_QURAN_ANCHORED',
    researchStatus: 'OPEN',
  },
  {
    caseCode: 'RC-QS-002-082-ID',
    title: 'QS 2:82 — licensed Indonesian translation sense',
    citationKey: 'QS 2:82',
    editionCode: QURAN_EDITION,
    translationCode: QURAN_TRANSLATION,
    sourceSense: 'LICENSED_TRANSLATION',
    evidenceSha: QURAN_SHA256,
    rightsSnapshot: CLEARED_RIGHTS,
    lens: 'COMPARATIVE_NEUTRAL',
    researchStatus: 'OPEN',
  },
  {
    caseCode: 'RC-QS-037-030-AR',
    title: 'QS 37:30 — neighbour context with an unresolved edition',
    citationKey: 'QS 37:30',
    editionCode: 'quran-tanzil-uthmani',
    translationCode: null,
    sourceSense: 'ORIGINAL_ARABIC',
    evidenceSha: null,
    rightsSnapshot: 'RIGHTS_UNKNOWN',
    lens: 'ACADEMIC_HISTORICAL',
    researchStatus: 'OPEN',
  },
]

export const FRAME_SEED = [
  {
    frameCode: 'FR-QS2-82-ISLAMIC',
    caseCode: 'RC-QS-002-082-AR',
    agentLabel: 'Allah — the divine speaker identified within QS 2:82',
    agentBasis: 'TEXTUAL_SPEAKER',
    agentActorCode: null,
    agentNote: 'Divine speech is identified from the passage itself; no actor-registry identity is asserted.',
    recipientLabel: 'The addressees of QS 2:82 as stated in the passage',
    recipientBasis: 'TEXTUAL_ADDRESS',
    domain: 'Quranic reward and eschatology language',
    scope: 'QS 2:82 as one verse with its immediate literary context',
    genre: 'scripture',
    tradition: 'Islam',
    lens: 'ISLAMIC_QURAN_ANCHORED',
    lensNote: 'Read within the declared Quran-anchored lens; any comparison claim stays scoped to this lens.',
    reviewState: 'ENGINEERING_ONLY',
  },
  {
    frameCode: 'FR-QS2-82-NEUTRAL',
    caseCode: 'RC-QS-002-082-ID',
    agentLabel: 'Allah — the divine speaker identified within QS 2:82',
    agentBasis: 'TEXTUAL_SPEAKER',
    agentActorCode: null,
    agentNote: 'Divine speech is identified from the passage itself; no actor-registry identity is asserted.',
    recipientLabel: 'The addressees of QS 2:82 as stated in the passage',
    recipientBasis: 'TEXTUAL_ADDRESS',
    domain: 'Translation-level reward language',
    scope: 'QS 2:82 read through the licensed Indonesian translation',
    genre: 'scripture',
    tradition: 'Islam',
    lens: 'COMPARATIVE_NEUTRAL',
    lensNote: 'Neutral comparison lane: the translation sense is displayed without a correction claim.',
    reviewState: 'ENGINEERING_ONLY',
  },
  {
    frameCode: 'FR-QS37-30-UNRESOLVED',
    caseCode: 'RC-QS-037-030-AR',
    agentLabel: 'UNSPECIFIED',
    agentBasis: 'UNSPECIFIED',
    agentActorCode: null,
    agentNote: 'Speaker and recipient cannot be resolved until the exact edition and neighbour context are available.',
    recipientLabel: 'UNSPECIFIED',
    recipientBasis: 'UNSPECIFIED',
    domain: 'Comparative address and audience language',
    scope: 'QS 37:30 with neighbours 37:27–33, exact edition unavailable',
    genre: 'scripture',
    tradition: 'Islam',
    lens: 'ACADEMIC_HISTORICAL',
    lensNote: 'Historical-context lens declared, but the source gate is unresolved, so the frame stays non-evaluable.',
    reviewState: 'UNREVIEWED',
  },
] as const

export const CLAIM_SEED = [
  {
    claimCode: 'CLM-QS2-82-COND',
    caseCode: 'RC-QS-002-082-AR',
    claim: 'QS 2:82 opens with a conditional description of those who believe and do righteous deeds.',
    epistemic: 'OBSERVED_TEXT',
    representation: 'SOURCE_TEXT',
    status: 'SUPPORTED',
    citationKey: 'QS 2:82',
    evidenceSpan: 'QS 2:82 — opening conditional clause',
    evidenceSha: QURAN_SHA256,
  },
  {
    claimCode: 'CLM-QS2-82-REWARD',
    caseCode: 'RC-QS-002-082-AR',
    claim: 'QS 2:82 closes with the reward image of companions of the garden abiding therein.',
    epistemic: 'OBSERVED_TEXT',
    representation: 'SOURCE_TEXT',
    status: 'SUPPORTED',
    citationKey: 'QS 2:82',
    evidenceSpan: 'QS 2:82 — reward clause',
    evidenceSha: QURAN_SHA256,
  },
  {
    claimCode: 'CLM-QS2-82-INFER',
    caseCode: 'RC-QS-002-082-AR',
    claim: 'The reward language implies an unconditional guarantee for every self-identified believer.',
    epistemic: 'INFERRED',
    representation: 'INFERENCE',
    status: 'UNKNOWN',
    citationKey: 'QS 2:82',
    evidenceSpan: 'Inference beyond the verse text',
    evidenceSha: null,
  },
  {
    claimCode: 'CLM-QS2-82-ID-TRANS',
    caseCode: 'RC-QS-002-082-ID',
    claim:
      'The licensed Indonesian translation expresses the reward clause with "penghuni surga" and "kekal di dalamnya".',
    epistemic: 'OBSERVED_TEXT',
    representation: 'TRANSLATION',
    status: 'SUPPORTED',
    citationKey: 'QS 2:82',
    evidenceSpan: 'QS 2:82 — Kemenag Indonesian translation clause',
    evidenceSha: QURAN_SHA256,
  },
  {
    claimCode: 'CLM-QS37-30-POINTER',
    caseCode: 'RC-QS-037-030-AR',
    claim: 'The address in QS 37:30 cannot be assessed until the exact edition and neighbour context are resolved.',
    epistemic: 'INFERRED',
    representation: 'INFERENCE',
    status: 'UNKNOWN',
    citationKey: 'QS 37:30',
    evidenceSpan: null,
    evidenceSha: null,
  },
] as const

export const RELATION_SEED = [
  {
    relationCode: 'REL-QS2-82-COND-REWARD',
    caseCode: 'RC-QS-002-082-AR',
    fromClaimCode: 'CLM-QS2-82-COND',
    toClaimCode: 'CLM-QS2-82-REWARD',
    relationType: 'AFFIRMS',
    lens: 'ISLAMIC_QURAN_ANCHORED',
    defensibility: 'DEFENSIBLE',
    evidenceSpan: 'QS 2:82 — conditional clause to reward clause',
    evidenceSha: QURAN_SHA256,
    counterReading: 'A reading that treats the verse as a general maxim without its conditional structure.',
    presentedAsSource: false,
  },
  {
    relationCode: 'REL-QS2-82-REWARD-INFER',
    caseCode: 'RC-QS-002-082-AR',
    fromClaimCode: 'CLM-QS2-82-REWARD',
    toClaimCode: 'CLM-QS2-82-INFER',
    relationType: 'PARALLELS',
    lens: 'ISLAMIC_QURAN_ANCHORED',
    defensibility: 'SPECULATIVE',
    evidenceSpan: 'Speculative extension beyond the verse',
    evidenceSha: null,
    counterReading: 'The verse does not state an unconditional guarantee; this extension stays speculative.',
    presentedAsSource: false,
  },
] as const

export const WITNESS_SEED = [
  {
    witnessCode: 'KW-QS2-82-ISLAMIC-01',
    caseCode: 'RC-QS-002-082-AR',
    frameCode: 'FR-QS2-82-ISLAMIC',
    claimCode: 'CLM-QS2-82-COND',
    keyToken: 'promise',
    scheme: KEY_SCHEME,
    direction: 2,
    intensity: 2,
    confidencePct: 100,
    weight: 1,
    conclusion:
      'Within the declared Islamic scripture frame, QS 2:82 presents belief and righteous action as the condition for the garden reward; the verse does not specify a mechanism for judging any person’s salvation.',
    limits:
      'This is a bounded reading of one verse. It cannot establish a universal verdict, rank persons, define the boundaries of belief or righteous action, or replace a human reviewer.',
    contextNote: 'Reward language read in the immediate verse context.',
    boundaryNote: 'Not a divine judgment, not a salvation verdict, and not a score of the religion.',
    evidenceRef: 'QS 2:82 @ quran_cairo_hafs; Kemenag translation QS_2_82_id_kemenag (lens support only)',
    citationKey: 'QS 2:82',
    evidenceSha: QURAN_SHA256,
    sourceFidelity: 20,
    observability: 20,
    semanticConsistency: 15,
    crossReference: 10,
    nonOverlapping: 10,
    claimKind: 'BOUNDED_DERIVED_READING',
    reviewState: 'ENGINEERING_ONLY',
  },
  {
    witnessCode: 'KW-QS2-82-ID-01',
    caseCode: 'RC-QS-002-082-ID',
    frameCode: 'FR-QS2-82-NEUTRAL',
    claimCode: 'CLM-QS2-82-ID-TRANS',
    keyToken: 'promise',
    scheme: KEY_SCHEME,
    direction: 2,
    intensity: 2,
    confidencePct: 0,
    weight: 0,
    conclusion:
      'The licensed Indonesian translation states the reward clause with "penghuni surga" abiding therein; no further doctrine is inferred.',
    limits:
      'Translation-level observation only. It cannot establish the original Arabic reading, a salvation verdict, or any ranking between persons.',
    contextNote: 'Read through the licensed Indonesian translation lane.',
    boundaryNote: 'Not a divine judgment; zero evidence weight keeps direction UNKNOWN.',
    evidenceRef: 'QS 2:82 licensed translation QS_2_82_id_kemenag; edition digest quran_cairo_hafs',
    citationKey: 'QS 2:82',
    evidenceSha: QURAN_SHA256,
    sourceFidelity: 0,
    observability: 0,
    semanticConsistency: 0,
    crossReference: 0,
    nonOverlapping: 0,
    claimKind: 'BOUNDED_DERIVED_READING',
    reviewState: 'ENGINEERING_ONLY',
  },
] as const

export const QUALITY_SEED = [
  {
    runCode: 'QR-QS2-82-01',
    caseCode: 'RC-QS-002-082-AR',
    method: 'srgbl-v8',
    profile: 'engineering-structural-v1',
    sGrounding: 3,
    rAccuracy: 3,
    gSupport: 2,
    bDiscipline: 3,
    lResponsibility: 3,
    provenance: 4,
    unknownHonesty: 4,
    alternativeCoverage: 2,
    confidenceCalibration: 2,
    actionUsefulness: 2,
  },
] as const

export const HYPOTHESIS_SEED = [
  {
    hypothesisCode: 'HYP-SWING-QS2-82-01',
    caseCode: 'RC-QS-002-082-AR',
    frameCode: 'FR-QS2-82-ISLAMIC',
    mode: 'SWING',
    operator: 'semantic-opposition',
    question:
      'If QS 2:82 conditions the garden reward on belief and righteous action, does the verse oppose a claim that identity alone guarantees it?',
    citationKey: 'QS 2:82',
    evidenceSpan: 'QS 2:82 — conditional and reward clauses',
    evidenceSha: QURAN_SHA256,
    lens: 'ISLAMIC_QURAN_ANCHORED',
    counterReadings: null,
    mismatchNote: null,
    proposedFrameNote: null,
    proposedBy: 'M13 engineering seed',
    status: 'CANDIDATE',
    selfValidated: false,
    inheritedScore: null,
    independentSourceRef: null,
    validatedBy: null,
    verificationNote: null,
  },
  {
    hypothesisCode: 'HYP-POSCORR-QS2-82-01',
    caseCode: 'RC-QS-002-082-AR',
    frameCode: 'FR-QS2-82-ISLAMIC',
    mode: 'POSITIVE_CORRECTION',
    operator: null,
    question:
      'Within the declared Quran-anchored lens, correct the reading that the verse guarantees salvation by identity alone.',
    citationKey: 'QS 2:82',
    evidenceSpan: 'QS 2:82 — conditional clause',
    evidenceSha: QURAN_SHA256,
    lens: 'ISLAMIC_QURAN_ANCHORED',
    counterReadings:
      'Preserve the counter-reading that "believe and do righteous deeds" is not defined by this verse itself, and that other passages sit outside this bounded case.',
    mismatchNote: null,
    proposedFrameNote: null,
    proposedBy: 'M13 engineering seed',
    status: 'CANDIDATE',
    selfValidated: false,
    inheritedScore: null,
    independentSourceRef: null,
    validatedBy: null,
    verificationNote: null,
  },
  {
    hypothesisCode: 'HYP-OFFSIDE-QS2-82-01',
    caseCode: 'RC-QS-002-082-AR',
    frameCode: 'FR-QS2-82-ISLAMIC',
    mode: 'OFFSIDE',
    operator: null,
    question: 'Does the evidence frame assign the reward clause to a different recipient than the declared frame?',
    citationKey: 'QS 2:82',
    evidenceSpan: 'QS 2:82 — declared recipient versus proposed evidence frame',
    evidenceSha: QURAN_SHA256,
    lens: 'ISLAMIC_QURAN_ANCHORED',
    counterReadings: null,
    mismatchNote: 'The proposed evidence frame assigns the reward clause to a wider audience than the declared recipient.',
    proposedFrameNote: 'Examine whether the recipient is the addressees of QS 2:82 or a wider audience; human-only decision.',
    proposedBy: 'M13 engineering seed',
    status: 'CANDIDATE',
    selfValidated: false,
    inheritedScore: null,
    independentSourceRef: null,
    validatedBy: null,
    verificationNote: null,
  },
] as const

// ------------------------------------------------------- M14 review & MIZAN

export const REVIEW_MACHINE_STATES = [
  'DRAFT',
  'SUBMITTED',
  'REVIEWED',
  'DISPUTED',
  'REJECTED',
  'RETRACTED',
] as const
export const REVIEW_DECISIONS = ['APPROVED', 'REJECTED', 'REVISION_REQUESTED'] as const
export const REVIEW_ACTIONS = [
  'SUBMIT',
  'APPROVE',
  'REJECT',
  'REQUEST_REVISION',
  'DISPUTE',
  'RESOLVE_DISPUTE',
  'RETRACT',
] as const
export const REVIEW_TARGET_KINDS = ['CLAIM', 'HYPOTHESIS'] as const
export const COUNTEREVIDENCE_STATUSES = ['OPEN', 'ACKNOWLEDGED', 'REJECTED'] as const
export const PILOT_ASSESSMENTS = ['SUPPORTED', 'CONTRADICTED', 'UNDETERMINED'] as const

export const MIZAN_CRITERIA = [
  { key: 'evidenceGrounding', label: 'Every reading is tied to an exact source span and digest' },
  { key: 'counterevidenceCoverage', label: 'Counterevidence is recorded and answered, not omitted' },
  { key: 'provenance', label: 'Source identity, version and representation are inspectable' },
  { key: 'consistency', label: 'Claims do not silently contradict adjacent reviewed claims' },
  { key: 'riskDisclosure', label: 'Known risks and misuse surface are stated' },
  { key: 'unknownHonesty', label: 'Unknowns stay labelled unknown instead of guessed' },
] as const

export const MIZAN_SCALE_MIN = 0
export const MIZAN_SCALE_MAX = 4
export const MIZAN_MAX_SCORE = MIZAN_CRITERIA.length * MIZAN_SCALE_MAX
export const MIZAN_METHOD_CODE = 'MIZAN-EVIDENCE-RISK-CONSISTENCY'
export const MIZAN_METHOD_VERSION = '1'
export const MIZAN_METHOD_STATUS = 'CANDIDATE_NOT_RATIFIED'
export const MIZAN_METHOD_TEXT =
  'MIZAN v1 criteria: evidenceGrounding,counterevidenceCoverage,provenance,consistency,riskDisclosure,unknownHonesty; each 0-4; total 24; no ranking; not divine judgment.'
export const MIZAN_METHOD_SHA256 = '9e6e50853663340c5a3f4f17931cbcb85b720a3b4e20d4a060b897dc7e05669c'
export const MIZAN_MIN_INDEPENDENT_ANNOTATORS = 2

export const M14_POLICY = {
  autoApprove: false,
  publicationAvailable: false,
  namedHumanActorRequired: true,
  guestRoleMayReview: false,
  fourEyes: true,
  revisionPreservesHistory: true,
  retractionIsDeletion: false,
  exactShaRequired: true,
  counterevidenceRequiredForApproval: true,
  counterevidenceMustBeResolved: true,
  pilotMinimumIndependentAnnotators: MIZAN_MIN_INDEPENDENT_ANNOTATORS,
  pilotRecordedIsNotPublication: true,
  mizanMethodStatus: MIZAN_METHOD_STATUS,
  mizanCriteria: MIZAN_CRITERIA.map((entry) => entry.key),
  mizanScale: [MIZAN_SCALE_MIN, MIZAN_SCALE_MAX],
  mizanMaxScore: MIZAN_MAX_SCORE,
  mizanScoreIsVerdict: false,
  theologicalRanking: 'FORBIDDEN',
  reviewMachineStates: REVIEW_MACHINE_STATES,
  reviewDecisions: REVIEW_DECISIONS,
} as const

export const COUNTEREVIDENCE_SEED = [
  {
    ceCode: 'CE-QS2-82-RECIPIENT',
    caseCode: 'RC-QS-002-082-AR',
    targetKind: 'CLAIM',
    targetCode: 'CLM-QS2-82-COND',
    sourceId: 'tafsir:recipient-scope',
    sourceVersion: 'v1',
    citationKey: 'QS 2:82',
    evidenceSha: QURAN_SHA256,
    finding:
      'The verse names a declared addressee; extending the reward clause to a wider audience is not established by this verse alone.',
    registeredByName: 'M13 engineering seed (not a human reviewer)',
    status: 'OPEN',
    resolutionReason: null,
    resolvedByName: null,
    resolvedAt: null,
  },
  {
    ceCode: 'CE-QS2-82-DEFINITION',
    caseCode: 'RC-QS-002-082-AR',
    targetKind: 'CLAIM',
    targetCode: 'CLM-QS2-82-COND',
    sourceId: 'lexicon:belief-righteous-action',
    sourceVersion: 'v1',
    citationKey: 'QS 2:82',
    evidenceSha: QURAN_SHA256,
    finding:
      'The verse names belief and righteous action without defining either boundary; passages that define them sit outside this bounded case.',
    registeredByName: 'M13 engineering seed (not a human reviewer)',
    status: 'OPEN',
    resolutionReason: null,
    resolvedByName: null,
    resolvedAt: null,
  },
] as const

export const MIZAN_METHOD_SEED = [
  {
    methodCode: MIZAN_METHOD_CODE,
    version: MIZAN_METHOD_VERSION,
    methodSha: MIZAN_METHOD_SHA256,
    methodText: MIZAN_METHOD_TEXT,
    criteria: MIZAN_CRITERIA.map((entry) => entry.key).join(','),
    scaleMin: MIZAN_SCALE_MIN,
    scaleMax: MIZAN_SCALE_MAX,
    maxScore: MIZAN_MAX_SCORE,
    status: MIZAN_METHOD_STATUS,
    registeredByName: 'M13 engineering seed (not a human reviewer)',
  },
] as const
