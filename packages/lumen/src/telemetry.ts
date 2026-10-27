import crypto from 'node:crypto';
import type { BudgetPort, EventSinkPort, LumenEvent } from './index.js';
import { redactSensitive } from './adapters/ai-gateway.js';

export interface TelemetrySpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  runId: string;
  stepId?: string;
  workflowVersion?: string;
  startTime: string;
  endTime?: string;
  durationMs?: number;
  attributes: Record<string, string | number | boolean>;
  status: 'OK' | 'ERROR';
  error?: { code: string; message: string };
}

export interface TelemetrySinkOptions {
  /**
   * Whether telemetry is globally enabled. Defaults to true.
   */
  enabled?: boolean;

  /**
   * If true, enables bounded and redacted payload capture.
   * Defaults to false (strict safe default: no raw prompts/payloads).
   */
  enablePayloadCapture?: boolean;

  /**
   * Custom clock function for deterministic time testing.
   */
  clockFn?: () => Date;

  /**
   * Callback on span completion (useful for OpenTelemetry exporter bridge).
   */
  onSpanEnded?: (span: TelemetrySpan) => void;
}

/**
 * LumenTelemetrySink collects correlated spans and metrics across runs, steps,
 * gateway calls, and tool proposals while strictly redacting secrets and excluding
 * raw prompts or sensitive user payloads by default.
 */
export class LumenTelemetrySink implements EventSinkPort {
  readonly enabled: boolean;
  readonly enablePayloadCapture: boolean;
  private readonly clock: () => Date;
  private readonly onSpanEnded?: (span: TelemetrySpan) => void;

  private readonly spans: TelemetrySpan[] = [];
  private readonly events: LumenEvent[] = [];
  private readonly activeSpans: Map<string, TelemetrySpan> = new Map();

  constructor(options: TelemetrySinkOptions = {}) {
    this.enabled = options.enabled ?? true;
    this.enablePayloadCapture = options.enablePayloadCapture ?? false;
    this.clock = options.clockFn ?? (() => new Date());
    this.onSpanEnded = options.onSpanEnded;
  }

  // --- Span Management ---

  startSpan(params: {
    name: string;
    runId: string;
    stepId?: string;
    parentSpanId?: string;
    attributes?: Record<string, string | number | boolean>;
  }): string {
    if (!this.enabled) {
      return 'noop-span-id';
    }

    const spanId = `span_${crypto.randomBytes(8).toString('hex')}`;
    const traceId = `trace_${crypto.createHash('md5').update(params.runId).digest('hex')}`;
    const startTime = this.clock().toISOString();

    const sanitizedAttributes: Record<string, string | number | boolean> = {};
    if (params.attributes) {
      for (const [k, v] of Object.entries(params.attributes)) {
        if (typeof v === 'string') {
          sanitizedAttributes[k] = redactSensitive(v);
        } else {
          sanitizedAttributes[k] = v;
        }
      }
    }

    const span: TelemetrySpan = {
      traceId,
      spanId,
      parentSpanId: params.parentSpanId,
      name: params.name,
      runId: params.runId,
      stepId: params.stepId,
      startTime,
      attributes: sanitizedAttributes,
      status: 'OK',
    };

    this.activeSpans.set(spanId, span);
    return spanId;
  }

  endSpan(
    spanId: string,
    outcome: {
      status?: 'OK' | 'ERROR';
      error?: { code: string; message: string };
      attributes?: Record<string, string | number | boolean>;
    } = {}
  ): void {
    if (!this.enabled) return;

    const span = this.activeSpans.get(spanId);
    if (!span) return;

    this.activeSpans.delete(spanId);

    const endTime = this.clock();
    const startMs = new Date(span.startTime).getTime();
    const durationMs = Math.max(0, endTime.getTime() - startMs);

    span.endTime = endTime.toISOString();
    span.durationMs = durationMs;

    if (outcome.status) {
      span.status = outcome.status;
    }

    if (outcome.error) {
      span.status = 'ERROR';
      span.error = {
        code: outcome.error.code,
        message: redactSensitive(outcome.error.message),
      };
    }

    if (outcome.attributes) {
      for (const [k, v] of Object.entries(outcome.attributes)) {
        if (typeof v === 'string') {
          span.attributes[k] = redactSensitive(v);
        } else {
          span.attributes[k] = v;
        }
      }
    }

    this.spans.push(span);

    if (this.onSpanEnded) {
      this.onSpanEnded(span);
    }
  }

  // --- EventSinkPort Implementation ---

  async emitEvent(event: LumenEvent): Promise<void> {
    if (!this.enabled) return;

    // Filter event data: exclude private content, raw prompts, complete texts by default
    const filteredData: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(event.data)) {
      // Exclude known sensitive fields
      if (['prompt', 'rawPrompt', 'password', 'token', 'apiKey', 'secret', 'witnessMaterial'].includes(k)) {
        filteredData[k] = '[REDACTED_BY_POLICY]';
        continue;
      }

      if (typeof v === 'string') {
        filteredData[k] = redactSensitive(v);
      } else if (typeof v === 'object' && v !== null) {
        if (!this.enablePayloadCapture) {
          filteredData[k] = { type: 'object', size: JSON.stringify(v).length };
        } else {
          filteredData[k] = JSON.parse(redactSensitive(JSON.stringify(v)));
        }
      } else {
        filteredData[k] = v;
      }
    }

    const sanitizedEvent: LumenEvent = {
      ...event,
      data: filteredData,
    };

    this.events.push(sanitizedEvent);
  }

  getCompletedSpans(): TelemetrySpan[] {
    return [...this.spans];
  }

  getEmittedEvents(): LumenEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.spans.length = 0;
    this.events.length = 0;
    this.activeSpans.clear();
  }
}

export interface TokenBudgetOptions {
  maxTokens: number;
  initialConsumed?: number;
}

/**
 * TokenBudgetManager implements BudgetPort to enforce hard token usage caps
 * on execution runs based on trustworthy metrics from model inference responses.
 */
export class TokenBudgetManager implements BudgetPort {
  private readonly maxTokens: number;
  private consumedTokens: number;

  constructor(options: TokenBudgetOptions) {
    if (options.maxTokens <= 0) {
      throw new Error('maxTokens must be greater than zero');
    }
    this.maxTokens = options.maxTokens;
    this.consumedTokens = options.initialConsumed ?? 0;
  }

  async consumeBudget(tokens: number): Promise<boolean> {
    if (tokens < 0) {
      throw new Error('Consumed tokens cannot be negative');
    }

    if (this.consumedTokens + tokens > this.maxTokens) {
      this.consumedTokens = this.maxTokens;
      return false; // Budget exceeded
    }

    this.consumedTokens += tokens;
    return true;
  }

  async getRemainingBudget(): Promise<number> {
    return Math.max(0, this.maxTokens - this.consumedTokens);
  }

  getConsumedTokens(): number {
    return this.consumedTokens;
  }

  getMaxTokens(): number {
    return this.maxTokens;
  }

  isExhausted(): boolean {
    return this.consumedTokens >= this.maxTokens;
  }
}
