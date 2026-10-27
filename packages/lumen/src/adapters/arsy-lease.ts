import crypto from 'node:crypto';
import type {
  CheckpointPort,
  LumenCheckpoint,
  LumenLease,
  LumenRun,
  LumenStep,
  RunControlPort,
} from '../index.js';
import { validateCheckpointVersion } from '../index.js';

export type LeaseErrorCode =
  | 'LEASE_EXPIRED'
  | 'STALE_FENCING_TOKEN'
  | 'RUN_NOT_FOUND'
  | 'RUN_ALREADY_CLAIMED'
  | 'INVALID_RUN_STATE'
  | 'INCOMPATIBLE_CHECKPOINT_VERSION'
  | 'PAYLOAD_TOO_LARGE'
  | 'UNAUTHORIZED';

export class LumenLeaseError extends Error {
  readonly code: LeaseErrorCode;

  constructor(message: string, code: LeaseErrorCode) {
    super(message);
    this.name = 'LumenLeaseError';
    this.code = code;
  }
}

export interface ArsyLeaseAdapterOptions {
  /**
   * Optional base URL if connecting to a live ARSY HTTP endpoint.
   */
  baseUrl?: string;

  /**
   * Optional authentication token for ARSY RPC.
   */
  authToken?: string;

  /**
   * Custom clock function for deterministic time testing.
   */
  clockFn?: () => Date;

  /**
   * Supported schema version for checkpoints. Defaults to '1.0.0'.
   */
  supportedSchemaVersion?: string;

  /**
   * Maximum allowed step payload in bytes. Defaults to 262,144 (256 KB).
   */
  maxPayloadBytes?: number;
}

export interface StoredCanonicalRun {
  run: LumenRun;
  steps: LumenStep[];
  checkpoints: LumenCheckpoint[];
  lastHeartbeat?: string;
}

/**
 * Adapter implementing RunControlPort and CheckpointPort using ARSY canonical lease contracts.
 * Ensures strict fencing epoch monotonicity, step persistence, restart recovery,
 * and zero direct database dependencies in LUMEN.
 */
export class ArsyLeaseAdapter implements RunControlPort, CheckpointPort {
  private readonly baseUrl?: string;
  private readonly authToken?: string;
  private readonly clock: () => Date;
  private readonly supportedSchemaVersion: string;
  private readonly maxPayloadBytes: number;

  // In-memory canonical repository (used for simulated ARSY host and contract verification)
  private readonly canonicalStore: Map<string, StoredCanonicalRun> = new Map();

  constructor(options: ArsyLeaseAdapterOptions = {}) {
    this.baseUrl = options.baseUrl;
    this.authToken = options.authToken;
    this.clock = options.clockFn ?? (() => new Date());
    this.supportedSchemaVersion = options.supportedSchemaVersion ?? '1.0.0';
    this.maxPayloadBytes = options.maxPayloadBytes ?? 256 * 1024;
  }

  // --- Seed / Setup Helper for Tests & Runtime ---

  registerRun(run: LumenRun): void {
    this.canonicalStore.set(run.runId, {
      run: { ...run },
      steps: [],
      checkpoints: [],
    });
  }

  getCanonicalRun(runId: string): StoredCanonicalRun | undefined {
    return this.canonicalStore.get(runId);
  }

  // --- RunControlPort Implementation ---

  async claimRun(runId: string, lease: LumenLease): Promise<boolean> {
    const record = this.canonicalStore.get(runId);
    if (!record) {
      throw new LumenLeaseError(`Run "${runId}" not found in canonical store`, 'RUN_NOT_FOUND');
    }

    const now = this.clock().getTime();
    const existingLease = record.run.lease;

    // Check if currently leased by another active worker
    if (existingLease) {
      const existingExpires = new Date(existingLease.expiresAt).getTime();
      const isActive = now < existingExpires;

      // If active and fencingEpoch is not strictly higher, reject claim
      if (isActive && lease.fencingEpoch <= existingLease.fencingEpoch) {
        throw new LumenLeaseError(
          `Run "${runId}" is actively leased by worker "${existingLease.workerId}" with epoch ${existingLease.fencingEpoch}`,
          'RUN_ALREADY_CLAIMED'
        );
      }

      // Even if expired, fencingEpoch must be strictly monotonically greater
      if (lease.fencingEpoch <= existingLease.fencingEpoch) {
        throw new LumenLeaseError(
          `Claim rejected: lease fencingEpoch ${lease.fencingEpoch} is not greater than prior epoch ${existingLease.fencingEpoch}`,
          'STALE_FENCING_TOKEN'
        );
      }
    }

    // Ensure lease expiration is in the future
    const leaseExpires = new Date(lease.expiresAt).getTime();
    if (leaseExpires <= now) {
      throw new LumenLeaseError(`Claim rejected: lease expiresAt is in the past`, 'LEASE_EXPIRED');
    }

    // Transition run status to CLAIMED or RUNNING
    record.run.lease = { ...lease };
    record.run.status = 'CLAIMED';
    record.run.updatedAt = this.clock().toISOString();
    record.lastHeartbeat = this.clock().toISOString();

    return true;
  }

  async heartbeat(runId: string, leaseToken: string): Promise<boolean> {
    const record = this.canonicalStore.get(runId);
    if (!record || !record.run.lease) {
      return false;
    }

    const currentLease = record.run.lease;
    if (currentLease.leaseToken !== leaseToken) {
      return false;
    }

    const now = this.clock().getTime();
    const expiresAt = new Date(currentLease.expiresAt).getTime();

    if (now >= expiresAt) {
      throw new LumenLeaseError(`Heartbeat failed: lease expired at ${currentLease.expiresAt}`, 'LEASE_EXPIRED');
    }

    record.lastHeartbeat = this.clock().toISOString();
    return true;
  }

  async completeRun(runId: string, _result: Record<string, unknown>): Promise<void> {
    const record = this.canonicalStore.get(runId);
    if (!record) {
      throw new LumenLeaseError(`Run "${runId}" not found`, 'RUN_NOT_FOUND');
    }

    this.verifyActiveLease(record);

    record.run.status = 'COMPLETED';
    record.run.lease = undefined; // Release lease capacity
    record.run.updatedAt = this.clock().toISOString();
  }

  async failRun(runId: string, _error: { code: string; message: string }): Promise<void> {
    const record = this.canonicalStore.get(runId);
    if (!record) {
      throw new LumenLeaseError(`Run "${runId}" not found`, 'RUN_NOT_FOUND');
    }

    this.verifyActiveLease(record);

    record.run.status = 'FAILED';
    record.run.lease = undefined; // Release lease capacity
    record.run.updatedAt = this.clock().toISOString();
  }

  async pauseRunForApproval(runId: string, _approvalToken: string): Promise<void> {
    const record = this.canonicalStore.get(runId);
    if (!record) {
      throw new LumenLeaseError(`Run "${runId}" not found`, 'RUN_NOT_FOUND');
    }

    this.verifyActiveLease(record);

    record.run.status = 'PAUSED_APPROVAL';
    record.run.lease = undefined; // Pause releases worker capacity
    record.run.updatedAt = this.clock().toISOString();
  }

  // --- Step Persistence & Idempotency ---

  async recordStep(runId: string, step: LumenStep): Promise<void> {
    const record = this.canonicalStore.get(runId);
    if (!record) {
      throw new LumenLeaseError(`Run "${runId}" not found`, 'RUN_NOT_FOUND');
    }

    this.verifyActiveLease(record);

    // Validate 256 KB payload bound
    if (step.payload) {
      const payloadStr = JSON.stringify(step.payload);
      const payloadBytes = Buffer.byteLength(payloadStr, 'utf8');
      if (payloadBytes > this.maxPayloadBytes) {
        throw new LumenLeaseError(
          `Step payload size (${payloadBytes} bytes) exceeds maximum limit (${this.maxPayloadBytes} bytes)`,
          'PAYLOAD_TOO_LARGE'
        );
      }
      step.payloadHash = crypto.createHash('sha256').update(payloadStr).digest('hex');
    }

    // Check for duplicate step
    const existingIndex = record.steps.findIndex((s) => s.stepId === step.stepId);
    if (existingIndex >= 0) {
      // Update existing step in place (e.g. from PENDING to COMPLETED)
      record.steps[existingIndex] = { ...step };
    } else {
      record.steps.push({ ...step });
    }

    record.run.currentStepIndex = Math.max(record.run.currentStepIndex, step.stepIndex);
    record.run.updatedAt = this.clock().toISOString();
  }

  async getSteps(runId: string): Promise<LumenStep[]> {
    const record = this.canonicalStore.get(runId);
    if (!record) {
      throw new LumenLeaseError(`Run "${runId}" not found`, 'RUN_NOT_FOUND');
    }
    return [...record.steps];
  }

  // --- CheckpointPort Implementation ---

  async saveCheckpoint(checkpoint: LumenCheckpoint): Promise<void> {
    const record = this.canonicalStore.get(checkpoint.runId);
    if (!record) {
      throw new LumenLeaseError(`Run "${checkpoint.runId}" not found`, 'RUN_NOT_FOUND');
    }

    this.verifyActiveLease(record);

    // Enforce semver checkpoint schema compatibility
    validateCheckpointVersion(checkpoint.schemaVersion, this.supportedSchemaVersion);

    // Persist checkpoint
    record.checkpoints.push({ ...checkpoint });
    record.run.updatedAt = this.clock().toISOString();
  }

  async loadCheckpoint(runId: string): Promise<LumenCheckpoint | undefined> {
    const record = this.canonicalStore.get(runId);
    if (!record) {
      throw new LumenLeaseError(`Run "${runId}" not found`, 'RUN_NOT_FOUND');
    }

    if (record.checkpoints.length === 0) {
      return undefined;
    }

    const latest = record.checkpoints[record.checkpoints.length - 1];
    if (!latest) {
      return undefined;
    }
    validateCheckpointVersion(latest.schemaVersion, this.supportedSchemaVersion);
    return { ...latest };
  }

  // --- Recovery Helper ---

  /**
   * Recovers execution state from latest checkpoint and persisted steps.
   * Enables resuming from completed steps without repeating expensive or non-idempotent operations.
   */
  async recoverExecutionState(runId: string): Promise<{
    run: LumenRun;
    checkpoint?: LumenCheckpoint;
    completedSteps: Map<string, LumenStep>;
  }> {
    const record = this.canonicalStore.get(runId);
    if (!record) {
      throw new LumenLeaseError(`Run "${runId}" not found`, 'RUN_NOT_FOUND');
    }

    const checkpoint = await this.loadCheckpoint(runId);
    const completedSteps = new Map<string, LumenStep>();

    for (const step of record.steps) {
      if (step.status === 'COMPLETED') {
        completedSteps.set(step.stepId, { ...step });
      }
    }

    return {
      run: { ...record.run },
      checkpoint,
      completedSteps,
    };
  }

  // --- Private Verification Helper ---

  private verifyActiveLease(record: StoredCanonicalRun): void {
    const lease = record.run.lease;
    if (!lease) {
      throw new LumenLeaseError('Operation rejected: worker holds no active lease on run', 'UNAUTHORIZED');
    }

    const now = this.clock().getTime();
    const expiresAt = new Date(lease.expiresAt).getTime();
    if (now >= expiresAt) {
      throw new LumenLeaseError(`Operation rejected: lease expired at ${lease.expiresAt}`, 'LEASE_EXPIRED');
    }
  }
}
