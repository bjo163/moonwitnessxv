import crypto from 'node:crypto';
import type { ApprovalGatePort } from '../index.js';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export type ApprovalErrorCode =
  | 'APPROVAL_NOT_FOUND'
  | 'APPROVAL_EXPIRED'
  | 'APPROVAL_REJECTED'
  | 'APPROVAL_ALREADY_CONSUMED'
  | 'ARGUMENT_HASH_MISMATCH'
  | 'TOOL_NAME_MISMATCH'
  | 'RUN_ID_MISMATCH'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'SELF_APPROVAL_PROHIBITED';

export class LumenApprovalError extends Error {
  readonly code: ApprovalErrorCode;

  constructor(message: string, code: ApprovalErrorCode) {
    super(message);
    this.name = 'LumenApprovalError';
    this.code = code;
  }
}

export interface ApprovalRecord {
  approvalId: string;
  token: string;
  runId: string;
  toolName: string;
  toolVersion: string;
  argumentHash: string;
  argumentsSnapshot: Record<string, unknown>;
  requestedAt: string;
  expiresAt: string;
  requiredRole: string;
  status: ApprovalStatus;
  decision?: {
    decidedBy: string;
    decidedAt: string;
    approverRole: string;
  };
  consumed: boolean;
  consumedAt?: string;
}

export interface ApprovalGateAdapterOptions {
  /**
   * Time-to-live for approval requests in milliseconds. Defaults to 15 minutes (900,000 ms).
   */
  defaultTtlMs?: number;

  /**
   * Custom clock function for deterministic time testing.
   */
  clockFn?: () => Date;

  /**
   * Disallowed self-approval actor prefixes.
   */
  disallowedSelfActors?: string[];
}

export interface RequestApprovalOptions {
  toolVersion?: string;
  requiredRole?: string;
  ttlMs?: number;
}

export interface SubmitDecisionOptions {
  decidedBy: string;
  approverRole: string;
}

export interface ResumeValidationParams {
  token: string;
  runId: string;
  toolName: string;
  arguments: Record<string, unknown>;
}

/**
 * Adapter implementing ApprovalGatePort and enforcing cryptographic argument binding,
 * expiration deadlines, anti-tamper verification, role boundaries, and anti-replay protection.
 */
export class ApprovalGateAdapter implements ApprovalGatePort {
  private readonly defaultTtlMs: number;
  private readonly clock: () => Date;
  private readonly disallowedActors: Set<string>;
  private readonly records: Map<string, ApprovalRecord> = new Map();

  constructor(options: ApprovalGateAdapterOptions = {}) {
    this.defaultTtlMs = options.defaultTtlMs ?? 15 * 60 * 1000;
    this.clock = options.clockFn ?? (() => new Date());
    this.disallowedActors = new Set(
      options.disallowedSelfActors ?? ['model', 'assistant', 'lumen-worker', 'agent', 'system', 'autonomous']
    );
  }

  // --- ApprovalGatePort Implementation ---

  async requestApproval(
    runId: string,
    toolCall: { name: string; arguments: Record<string, unknown> },
    options: RequestApprovalOptions = {}
  ): Promise<{ token: string; expiresAt: string }> {
    const now = this.clock();
    const ttl = options.ttlMs ?? this.defaultTtlMs;
    const expiresAtDate = new Date(now.getTime() + ttl);
    const expiresAt = expiresAtDate.toISOString();

    const normalizedArgs = toolCall.arguments || {};
    const argumentHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(normalizedArgs))
      .digest('hex');

    const token = `appr_${crypto.randomBytes(16).toString('hex')}`;
    const approvalId = `req_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const record: ApprovalRecord = {
      approvalId,
      token,
      runId,
      toolName: toolCall.name,
      toolVersion: options.toolVersion ?? '1.0.0',
      argumentHash,
      argumentsSnapshot: JSON.parse(JSON.stringify(normalizedArgs)),
      requestedAt: now.toISOString(),
      expiresAt,
      requiredRole: options.requiredRole ?? '100CENTER_OPERATOR',
      status: 'PENDING',
      consumed: false,
    };

    this.records.set(token, record);

    return { token, expiresAt };
  }

  async checkApprovalStatus(token: string): Promise<ApprovalStatus> {
    const record = this.records.get(token);
    if (!record) {
      return 'EXPIRED';
    }

    if (record.status === 'PENDING') {
      const now = this.clock().getTime();
      const expires = new Date(record.expiresAt).getTime();
      if (now > expires) {
        record.status = 'EXPIRED';
      }
    }

    return record.status;
  }

  // --- Headquarters / 100CENTER Decision Ingestion ---

  async submitDecision(
    token: string,
    decision: 'APPROVED' | 'REJECTED',
    options: SubmitDecisionOptions
  ): Promise<void> {
    const record = this.records.get(token);
    if (!record) {
      throw new LumenApprovalError(`Approval token "${token}" not found`, 'APPROVAL_NOT_FOUND');
    }

    const now = this.clock();
    const expires = new Date(record.expiresAt).getTime();
    if (now.getTime() > expires) {
      record.status = 'EXPIRED';
      throw new LumenApprovalError(`Approval token "${token}" expired at ${record.expiresAt}`, 'APPROVAL_EXPIRED');
    }

    // Guard against self-approval by the agent or automated process
    const actorLower = options.decidedBy.trim().toLowerCase();
    if (this.disallowedActors.has(actorLower) || actorLower.startsWith('worker-') || actorLower.startsWith('model-')) {
      throw new LumenApprovalError(
        `Self-approval prohibited: Actor "${options.decidedBy}" is not an authorized human operator`,
        'SELF_APPROVAL_PROHIBITED'
      );
    }

    // Role check against required permission
    if (record.requiredRole && options.approverRole !== record.requiredRole && options.approverRole !== 'SUPER_ADMIN') {
      throw new LumenApprovalError(
        `Insufficient permissions: Actor role "${options.approverRole}" does not meet required role "${record.requiredRole}"`,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    record.status = decision;
    record.decision = {
      decidedBy: options.decidedBy,
      decidedAt: now.toISOString(),
      approverRole: options.approverRole,
    };
  }

  // --- Worker Resume Verification & Anti-Replay Guard ---

  async validateAndConsumeApproval(params: ResumeValidationParams): Promise<boolean> {
    const record = this.records.get(params.token);
    if (!record) {
      throw new LumenApprovalError(`Approval token "${params.token}" not found`, 'APPROVAL_NOT_FOUND');
    }

    if (record.consumed) {
      throw new LumenApprovalError(
        `Replay rejected: Approval token "${params.token}" was already consumed at ${record.consumedAt}`,
        'APPROVAL_ALREADY_CONSUMED'
      );
    }

    const now = this.clock().getTime();
    const expires = new Date(record.expiresAt).getTime();
    if (now > expires) {
      record.status = 'EXPIRED';
      throw new LumenApprovalError(`Approval token expired at ${record.expiresAt}`, 'APPROVAL_EXPIRED');
    }

    if (record.status === 'REJECTED') {
      throw new LumenApprovalError(`Action was explicitly rejected by human reviewer`, 'APPROVAL_REJECTED');
    }

    if (record.status !== 'APPROVED') {
      throw new LumenApprovalError(`Action is not approved (current status: ${record.status})`, 'APPROVAL_NOT_FOUND');
    }

    // Verify Run ID binding
    if (record.runId !== params.runId) {
      throw new LumenApprovalError(
        `Run ID mismatch: token belongs to run "${record.runId}", attempted resume with "${params.runId}"`,
        'RUN_ID_MISMATCH'
      );
    }

    // Verify Tool Name binding
    if (record.toolName !== params.toolName) {
      throw new LumenApprovalError(
        `Tool mismatch: token belongs to tool "${record.toolName}", attempted execution with "${params.toolName}"`,
        'TOOL_NAME_MISMATCH'
      );
    }

    // Verify Cryptographic Argument Hash Binding (Anti-Tamper)
    const resumeHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(params.arguments || {}))
      .digest('hex');

    if (resumeHash !== record.argumentHash) {
      throw new LumenApprovalError(
        `Argument tampering detected: Resume argument hash "${resumeHash}" does not match approved hash "${record.argumentHash}"`,
        'ARGUMENT_HASH_MISMATCH'
      );
    }

    // Mark consumed to prevent replays
    record.consumed = true;
    record.consumedAt = this.clock().toISOString();

    return true;
  }

  getRecord(token: string): ApprovalRecord | undefined {
    return this.records.get(token);
  }
}
