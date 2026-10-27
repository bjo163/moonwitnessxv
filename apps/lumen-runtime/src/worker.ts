import type {
  ApprovalGatePort,
  CheckpointPort,
  ExecutionLoopContext,
  LumenLease,
  LumenRun,
  ModelGatewayPort,
  RunControlPort,
  ToolRegistryPort,
} from '@moonwitness/lumen';
import { executeAgentLoop } from '@moonwitness/lumen';

export type WorkerStatus = 'INITIALIZING' | 'READY' | 'RUNNING' | 'STOPPING' | 'STOPPED';

export interface LumenWorkerOptions {
  workerId?: string;
  maxConcurrency?: number;
  leaseDurationMs?: number;
  modelGateway: ModelGatewayPort;
  toolRegistry: ToolRegistryPort;
  runControl: RunControlPort;
  checkpointPort: CheckpointPort;
  approvalGate: ApprovalGatePort;
  clockFn?: () => Date;
}

export interface WorkerReadiness {
  status: WorkerStatus;
  workerId: string;
  activeRuns: number;
  maxConcurrency: number;
  healthy: boolean;
  uptimeMs: number;
  timestamp: string;
}

export interface ClaimRunOptions {
  runId: string;
  fencingEpoch: number;
  prompt: string;
  trustedContext?: Record<string, unknown>;
  maxIterations?: number;
  deadlineMs?: number;
}

/**
 * LumenWorker is the internal single-agent execution worker process.
 * It claims runs under monotonic fenced leases from ARSY, runs the bounded loop,
 * enforces human approvals, records checkpoints, and stops gracefully.
 * It exposes NO public HTTP routes, owns NO database tables, and acts as a safe worker.
 */
export class LumenWorker {
  readonly workerId: string;
  private readonly maxConcurrency: number;
  private readonly leaseDurationMs: number;
  private readonly modelGateway: ModelGatewayPort;
  private readonly toolRegistry: ToolRegistryPort;
  private readonly runControl: RunControlPort;
  private readonly checkpointPort: CheckpointPort;
  private readonly approvalGate: ApprovalGatePort;
  private readonly clock: () => Date;

  private status: WorkerStatus = 'INITIALIZING';
  private readonly startTime: Date;
  private activeRunsCount = 0;
  private abortController: AbortController = new AbortController();

  constructor(options: LumenWorkerOptions) {
    if (!options.modelGateway) {
      throw new Error('LumenWorker requires a valid ModelGatewayPort');
    }
    if (!options.toolRegistry) {
      throw new Error('LumenWorker requires a valid ToolRegistryPort');
    }
    if (!options.runControl) {
      throw new Error('LumenWorker requires a valid RunControlPort');
    }
    if (!options.checkpointPort) {
      throw new Error('LumenWorker requires a valid CheckpointPort');
    }
    if (!options.approvalGate) {
      throw new Error('LumenWorker requires a valid ApprovalGatePort');
    }

    this.clock = options.clockFn ?? (() => new Date());
    this.startTime = this.clock();
    this.workerId = options.workerId ?? `lumen-worker-${process.pid || 1}-${Math.random().toString(36).slice(2, 8)}`;
    this.maxConcurrency = options.maxConcurrency ?? 1;
    this.leaseDurationMs = options.leaseDurationMs ?? 30_000;

    this.modelGateway = options.modelGateway;
    this.toolRegistry = options.toolRegistry;
    this.runControl = options.runControl;
    this.checkpointPort = options.checkpointPort;
    this.approvalGate = options.approvalGate;
  }

  async start(): Promise<void> {
    if (this.status === 'STOPPING' || this.status === 'STOPPED') {
      throw new Error('Cannot start a stopped worker');
    }
    this.status = 'READY';
  }

  async stop(): Promise<void> {
    this.status = 'STOPPING';
    this.abortController.abort();
    this.status = 'STOPPED';
  }

  getReadiness(): WorkerReadiness {
    const now = this.clock().getTime();
    const uptimeMs = Math.max(0, now - this.startTime.getTime());
    const isHealthy = this.status === 'READY' || this.status === 'RUNNING';

    return {
      status: this.status,
      workerId: this.workerId,
      activeRuns: this.activeRunsCount,
      maxConcurrency: this.maxConcurrency,
      healthy: isHealthy,
      uptimeMs,
      timestamp: this.clock().toISOString(),
    };
  }

  /**
   * Claims a run from ARSY with a monotonic fencing epoch, then executes the bounded agent loop.
   */
  async claimAndExecute(options: ClaimRunOptions): Promise<{
    status: 'COMPLETED' | 'PAUSED_APPROVAL' | 'FAILED' | 'CANCELLED';
    output?: string;
    approvalToken?: string;
    error?: string;
  }> {
    if (this.status !== 'READY' && this.status !== 'RUNNING') {
      throw new Error(`Worker cannot accept runs while in status: ${this.status}`);
    }

    if (this.activeRunsCount >= this.maxConcurrency) {
      throw new Error(`Worker concurrency limit reached (${this.maxConcurrency})`);
    }

    this.activeRunsCount++;
    this.status = 'RUNNING';

    const now = this.clock();
    const expiresAt = new Date(now.getTime() + this.leaseDurationMs).toISOString();

    const lease: LumenLease = {
      leaseToken: `lease_${this.workerId}_${Date.now()}`,
      workerId: this.workerId,
      fencingEpoch: options.fencingEpoch,
      expiresAt,
    };

    try {
      // 1. Claim run from canonical authority
      const claimed = await this.runControl.claimRun(options.runId, lease);
      if (!claimed) {
        throw new Error(`Failed to claim run "${options.runId}"`);
      }

      // 2. Check for existing checkpoint to resume from
      const checkpoint = await this.checkpointPort.loadCheckpoint(options.runId);

      const runRecord: LumenRun = {
        runId: options.runId,
        workflowVersion: '1.0.0',
        status: 'CLAIMED',
        lease,
        currentStepIndex: checkpoint?.stepIndex ?? 0,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      const loopContext: ExecutionLoopContext = {
        tenantId: (options.trustedContext?.tenantId as string) ?? 'default',
        userId: (options.trustedContext?.userId as string) ?? 'system',
        capabilities: Array.isArray(options.trustedContext?.capabilities)
          ? (options.trustedContext.capabilities as string[])
          : ['*'],
        systemPrompt: options.prompt,
      };

      // 3. Execute bounded agent loop
      const result = await executeAgentLoop({
        run: runRecord,
        context: loopContext,
        gateway: this.modelGateway,
        tools: this.toolRegistry,
        maxIterations: options.maxIterations ?? 10,
        timeoutMs: options.deadlineMs ?? 60_000,
        signal: this.abortController.signal,
      });

      if (result.finalStatus === 'COMPLETED') {
        // Save checkpoint and notify complete
        await this.checkpointPort.saveCheckpoint({
          checkpointId: `chk_${Date.now()}`,
          runId: options.runId,
          schemaVersion: '1.0.0',
          stepIndex: (checkpoint?.stepIndex ?? 0) + 1,
          snapshot: { finalOutput: result.finalContent },
          createdAt: this.clock().toISOString(),
        });

        await this.runControl.completeRun(options.runId, { output: result.finalContent });
        return { status: 'COMPLETED', output: result.finalContent };
      }

      if (result.finalStatus === 'PAUSED_APPROVAL' && result.pausedToolCall) {
        // Request human approval and release worker lease
        const appr = await this.approvalGate.requestApproval(options.runId, {
          name: result.pausedToolCall.toolName,
          arguments: result.pausedToolCall.arguments,
        });

        return {
          status: 'PAUSED_APPROVAL',
          approvalToken: appr.token,
          output: `Paused for approval on tool ${result.pausedToolCall.toolName}`,
        };
      }

      if (result.finalStatus === 'CANCELLED') {
        return { status: 'CANCELLED', error: 'Execution was cancelled' };
      }

      // Failure
      const failureReason = result.error?.message ?? 'Unknown loop execution failure';
      await this.runControl.failRun(options.runId, {
        code: result.error?.code ?? 'EXECUTION_FAILED',
        message: failureReason,
      });
      return { status: 'FAILED', error: failureReason };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      try {
        await this.runControl.failRun(options.runId, { code: 'WORKER_ERROR', message: msg });
      } catch {
        // Suppress secondary failures if run was not claimed
      }
      return { status: 'FAILED', error: msg };
    } finally {
      this.activeRunsCount--;
      if (this.activeRunsCount === 0 && this.status === 'RUNNING') {
        this.status = 'READY';
      }
    }
  }
}
