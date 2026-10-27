/**
 * @moonwitness/lumen — Bounded Single-Agent Execution Loop (M41-04)
 *
 * Implements a sequential, bounded, recoverable execution loop for one agent.
 * Enforces hard iteration limits, deadlines, budget tracking, and fail-safe handling.
 */

import crypto from 'node:crypto';
import type {
  LumenRun,
  LumenStep,
  RunStatus,
  ModelGatewayPort,
  ModelRequest,
  ModelResponse,
  ToolRegistryPort,
  EventSinkPort,
  ClockPort,
  BudgetPort
} from './index.js';
import { validateRunTransition, validateStepPayload } from './index.js';

export interface ExecutionLoopContext {
  tenantId: string;
  userId: string;
  capabilities: string[];
  systemPrompt?: string;
}

export interface ExecutionLoopOptions {
  run: LumenRun;
  context: ExecutionLoopContext;
  gateway: ModelGatewayPort;
  tools?: ToolRegistryPort;
  clock?: ClockPort;
  events?: EventSinkPort;
  budget?: BudgetPort;
  maxIterations?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface ExecutionLoopResult {
  runId: string;
  finalStatus: RunStatus;
  totalIterations: number;
  steps: LumenStep[];
  finalContent?: string;
  pausedToolCall?: {
    toolName: string;
    arguments: Record<string, unknown>;
    argumentHash: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

const DEFAULT_MAX_ITERATIONS = 10;
const DEFAULT_TIMEOUT_MS = 30000;

export async function executeAgentLoop(options: ExecutionLoopOptions): Promise<ExecutionLoopResult> {
  const {
    run,
    context,
    gateway,
    tools,
    clock = { now: () => new Date() },
    events,
    budget,
    maxIterations = DEFAULT_MAX_ITERATIONS,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal
  } = options;

  let currentRunStatus = run.status;
  // If run is CLAIMED, transition to RUNNING
  if (currentRunStatus === 'CLAIMED') {
    validateRunTransition('CLAIMED', 'RUNNING');
    currentRunStatus = 'RUNNING';
  } else if (currentRunStatus !== 'RUNNING') {
    throw new Error(`INVALID_RUN_STATE: Run must be in CLAIMED or RUNNING state to execute, found "${currentRunStatus}"`);
  }

  const startTime = clock.now().getTime();
  const deadline = startTime + timeoutMs;
  const steps: LumenStep[] = [];
  let stepCounter = run.currentStepIndex || 0;
  let iterations = 0;

  const messages: ModelRequest['messages'] = [];
  if (context.systemPrompt) {
    messages.push({ role: 'system', content: context.systemPrompt });
  }

  while (iterations < maxIterations) {
    iterations++;

    // 1. Check Cancellation / AbortSignal
    if (signal?.aborted) {
      validateRunTransition(currentRunStatus, 'CANCELLED');
      return {
        runId: run.runId,
        finalStatus: 'CANCELLED',
        totalIterations: iterations,
        steps,
        error: {
          code: 'EXECUTION_CANCELLED',
          message: 'Execution loop cancelled via AbortSignal'
        }
      };
    }

    // 2. Check Deadline
    const now = clock.now().getTime();
    if (now >= deadline) {
      validateRunTransition(currentRunStatus, 'CANCELLED');
      return {
        runId: run.runId,
        finalStatus: 'CANCELLED',
        totalIterations: iterations,
        steps,
        error: {
          code: 'DEADLINE_EXCEEDED',
          message: `Execution exceeded maximum allowable deadline of ${timeoutMs}ms`
        }
      };
    }

    // 3. Check Budget
    if (budget) {
      const remaining = await budget.getRemainingBudget();
      if (remaining <= 0) {
        validateRunTransition(currentRunStatus, 'FAILED');
        return {
          runId: run.runId,
          finalStatus: 'FAILED',
          totalIterations: iterations,
          steps,
          error: {
            code: 'BUDGET_EXHAUSTED',
            message: 'Execution halted: token or resource budget exhausted'
          }
        };
      }
    }

    // 4. Step: MODEL_REQUEST
    const requestStepId = `step_${stepCounter++}_${run.runId}`;
    const modelStep: LumenStep = {
      stepId: requestStepId,
      stepIndex: stepCounter - 1,
      type: 'MODEL_REQUEST',
      status: 'EXECUTING',
      startedAt: clock.now().toISOString(),
      payload: { iteration: iterations, messageCount: messages.length }
    };
    validateStepPayload(modelStep);
    steps.push(modelStep);

    let modelResponse: ModelResponse;
    try {
      const availableTools = tools ? tools.listTools() : [];
      modelResponse = await gateway.requestInference({
        messages,
        tools: availableTools.map(t => ({
          name: t.name,
          description: t.description,
          parameters: t.parameters
        }))
      });
      modelStep.status = 'COMPLETED';
      modelStep.completedAt = clock.now().toISOString();

      if (events) {
        await events.emitEvent({
          eventId: `evt_${Date.now()}_${modelStep.stepId}`,
          runId: run.runId,
          stepId: modelStep.stepId,
          timestamp: clock.now().toISOString(),
          eventType: 'MODEL_INFERENCE_COMPLETED',
          data: { usage: modelResponse.usage }
        });
      }
    } catch (err: unknown) {
      modelStep.status = 'FAILED';
      modelStep.completedAt = clock.now().toISOString();
      const message = err instanceof Error ? err.message : String(err);
      modelStep.error = { code: 'GATEWAY_ERROR', message, retryable: false };

      validateRunTransition(currentRunStatus, 'FAILED');
      return {
        runId: run.runId,
        finalStatus: 'FAILED',
        totalIterations: iterations,
        steps,
        error: { code: 'GATEWAY_ERROR', message: `Model Gateway failed: ${message}` }
      };
    }

    // Record response content
    if (modelResponse.content) {
      messages.push({ role: 'assistant', content: modelResponse.content });
    }

    // 5. If no tool calls proposed, we reached a final answer!
    if (!modelResponse.toolCalls || modelResponse.toolCalls.length === 0) {
      validateRunTransition(currentRunStatus, 'COMPLETED');
      return {
        runId: run.runId,
        finalStatus: 'COMPLETED',
        totalIterations: iterations,
        steps,
        finalContent: modelResponse.content
      };
    }

    // 6. Handle Proposed Tool Calls sequentially
    for (const toolCall of modelResponse.toolCalls) {
      if (!tools) {
        validateRunTransition(currentRunStatus, 'FAILED');
        return {
          runId: run.runId,
          finalStatus: 'FAILED',
          totalIterations: iterations,
          steps,
          error: {
            code: 'NO_TOOL_REGISTRY',
            message: `Model proposed tool "${toolCall.name}" but no tool registry is configured`
          }
        };
      }

      const toolDef = tools.getTool(toolCall.name);
      if (!toolDef) {
        const errorStep: LumenStep = {
          stepId: `step_${stepCounter++}_${run.runId}`,
          stepIndex: stepCounter - 1,
          type: 'TOOL_PROPOSAL',
          status: 'FAILED',
          startedAt: clock.now().toISOString(),
          completedAt: clock.now().toISOString(),
          error: {
            code: 'UNKNOWN_TOOL',
            message: `Tool "${toolCall.name}" is not allowlisted in registry`,
            retryable: false
          }
        };
        steps.push(errorStep);

        validateRunTransition(currentRunStatus, 'FAILED');
        return {
          runId: run.runId,
          finalStatus: 'FAILED',
          totalIterations: iterations,
          steps,
          error: {
            code: 'UNKNOWN_TOOL',
            message: `Model proposed unknown or unapproved tool: "${toolCall.name}"`
          }
        };
      }

      // Check if tool requires Human Approval
      if (toolDef.requiresApproval) {
        const argumentHash = crypto
          .createHash('sha256')
          .update(JSON.stringify(toolCall.arguments || {}))
          .digest('hex');

        const pauseStep: LumenStep = {
          stepId: `step_${stepCounter++}_${run.runId}`,
          stepIndex: stepCounter - 1,
          type: 'APPROVAL_PAUSE',
          status: 'INTERRUPTED',
          startedAt: clock.now().toISOString(),
          completedAt: clock.now().toISOString(),
          payload: {
            toolName: toolCall.name,
            argumentHash
          }
        };
        steps.push(pauseStep);

        validateRunTransition(currentRunStatus, 'PAUSED_APPROVAL');
        return {
          runId: run.runId,
          finalStatus: 'PAUSED_APPROVAL',
          totalIterations: iterations,
          steps,
          pausedToolCall: {
            toolName: toolCall.name,
            arguments: toolCall.arguments,
            argumentHash
          }
        };
      }

      // Execute Tool
      const execStep: LumenStep = {
        stepId: `step_${stepCounter++}_${run.runId}`,
        stepIndex: stepCounter - 1,
        type: 'TOOL_EXECUTION',
        status: 'EXECUTING',
        startedAt: clock.now().toISOString(),
        payload: { toolName: toolCall.name, args: toolCall.arguments }
      };
      validateStepPayload(execStep);
      steps.push(execStep);

      try {
        const toolResult = await tools.executeTool(
          toolCall.name,
          toolCall.arguments,
          {
            tenantId: context.tenantId,
            userId: context.userId,
            capabilities: context.capabilities,
          }
        );
        execStep.status = 'COMPLETED';
        execStep.completedAt = clock.now().toISOString();

        // Feed tool response back into conversation history
        messages.push({
          role: 'user',
          content: `[Tool Result: ${toolCall.name}]: ${JSON.stringify(toolResult)}`
        });
      } catch (toolErr: unknown) {
        execStep.status = 'FAILED';
        execStep.completedAt = clock.now().toISOString();
        const msg = toolErr instanceof Error ? toolErr.message : String(toolErr);
        execStep.error = { code: 'TOOL_EXECUTION_ERROR', message: msg, retryable: false };

        validateRunTransition(currentRunStatus, 'FAILED');
        return {
          runId: run.runId,
          finalStatus: 'FAILED',
          totalIterations: iterations,
          steps,
          error: {
            code: 'TOOL_EXECUTION_ERROR',
            message: `Tool execution failed for "${toolCall.name}": ${msg}`
          }
        };
      }
    }
  }

  // Iteration limit exhausted
  validateRunTransition(currentRunStatus, 'FAILED');
  return {
    runId: run.runId,
    finalStatus: 'FAILED',
    totalIterations: iterations,
    steps,
    error: {
      code: 'MAX_ITERATIONS_EXCEEDED',
      message: `Execution exceeded maximum allowable iterations (${maxIterations}) without completion`
    }
  };
}
