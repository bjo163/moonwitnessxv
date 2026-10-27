import test from 'node:test';
import assert from 'node:assert/strict';
import { executeAgentLoop } from '../dist/index.js';
/* global AbortController */

test('positive: agent loop finishes directly when model returns final answer', async () => {
  const fakeGateway = {
    async requestInference() {
      return { content: 'The current lunar station is Station 4.' };
    }
  };

  const run = {
    runId: 'run_001',
    workflowVersion: '1.0.0',
    status: 'CLAIMED',
    currentStepIndex: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const result = await executeAgentLoop({
    run,
    context: {
      tenantId: 'tenant_main',
      userId: 'user_01',
      capabilities: ['read']
    },
    gateway: fakeGateway
  });

  assert.equal(result.finalStatus, 'COMPLETED');
  assert.equal(result.totalIterations, 1);
  assert.equal(result.finalContent, 'The current lunar station is Station 4.');
  assert.equal(result.steps.length, 1);
  assert.equal(result.steps[0].type, 'MODEL_REQUEST');
  assert.equal(result.steps[0].status, 'COMPLETED');
});

test('positive: agent loop executes allowlisted tool and continues to final completion', async () => {
  let callCount = 0;
  const fakeGateway = {
    async requestInference() {
      callCount++;
      if (callCount === 1) {
        return {
          content: 'Let me look up the station schedule.',
          toolCalls: [
            { id: 'call_1', name: 'lookup_schedule', arguments: { stationId: 'station_04' } }
          ]
        };
      }
      return {
        content: 'Station 4 schedule is active daily from 08:00 to 22:00.'
      };
    }
  };

  const executedTools = [];
  const fakeToolRegistry = {
    getTool(name) {
      if (name === 'lookup_schedule') {
        return {
          name: 'lookup_schedule',
          description: 'Lookup station schedule',
          parameters: { stationId: 'string' },
          requiresApproval: false
        };
      }
      return undefined;
    },
    listTools() {
      return [this.getTool('lookup_schedule')];
    },
    async executeTool(name, args) {
      executedTools.push({ name, args });
      return { schedule: '08:00-22:00', frequency: '104.5 MHz' };
    }
  };

  const run = {
    runId: 'run_002',
    workflowVersion: '1.0.0',
    status: 'RUNNING',
    currentStepIndex: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const result = await executeAgentLoop({
    run,
    context: {
      tenantId: 'tenant_main',
      userId: 'user_01',
      capabilities: ['read']
    },
    gateway: fakeGateway,
    tools: fakeToolRegistry
  });

  assert.equal(result.finalStatus, 'COMPLETED');
  assert.equal(result.totalIterations, 2);
  assert.equal(result.finalContent, 'Station 4 schedule is active daily from 08:00 to 22:00.');
  assert.equal(executedTools.length, 1);
  assert.equal(executedTools[0].name, 'lookup_schedule');
  assert.equal(executedTools[0].args.stationId, 'station_04');
  assert.equal(result.steps.length, 3); // MODEL_REQUEST (iter 1), TOOL_EXECUTION, MODEL_REQUEST (iter 2)
});

test('negative: reject unknown tool proposed by model', async () => {
  const fakeGateway = {
    async requestInference() {
      return {
        content: 'Attempting restricted action.',
        toolCalls: [{ id: 'call_bad', name: 'arbitrary_exec', arguments: { cmd: 'rm -rf' } }]
      };
    }
  };

  const fakeToolRegistry = {
    getTool() {
      return undefined; // Not in allowlist
    },
    listTools() {
      return [];
    },
    async executeTool() {
      throw new Error('Should not execute');
    }
  };

  const run = {
    runId: 'run_003',
    workflowVersion: '1.0.0',
    status: 'RUNNING',
    currentStepIndex: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const result = await executeAgentLoop({
    run,
    context: {
      tenantId: 'tenant_main',
      userId: 'user_01',
      capabilities: ['read']
    },
    gateway: fakeGateway,
    tools: fakeToolRegistry
  });

  assert.equal(result.finalStatus, 'FAILED');
  assert.equal(result.error?.code, 'UNKNOWN_TOOL');
  assert.ok(result.error?.message.includes('arbitrary_exec'));
});

test('negative: stop when max iterations exhausted', async () => {
  // Model keeps calling tool in loop
  const fakeGateway = {
    async requestInference() {
      return {
        content: 'Continuing loop...',
        toolCalls: [{ id: 'call_loop', name: 'ping_tool', arguments: {} }]
      };
    }
  };

  const fakeToolRegistry = {
    getTool(name) {
      return { name, description: 'ping', parameters: {}, requiresApproval: false };
    },
    listTools() {
      return [this.getTool('ping_tool')];
    },
    async executeTool() {
      return { pong: true };
    }
  };

  const run = {
    runId: 'run_004',
    workflowVersion: '1.0.0',
    status: 'RUNNING',
    currentStepIndex: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const result = await executeAgentLoop({
    run,
    context: {
      tenantId: 'tenant_main',
      userId: 'user_01',
      capabilities: ['read']
    },
    gateway: fakeGateway,
    tools: fakeToolRegistry,
    maxIterations: 3
  });

  assert.equal(result.finalStatus, 'FAILED');
  assert.equal(result.error?.code, 'MAX_ITERATIONS_EXCEEDED');
  assert.equal(result.totalIterations, 3);
});

test('negative: stop with CANCELLED on AbortSignal', async () => {
  const controller = new AbortController();
  controller.abort(); // already aborted

  const fakeGateway = {
    async requestInference() {
      return { content: 'Never called' };
    }
  };

  const run = {
    runId: 'run_005',
    workflowVersion: '1.0.0',
    status: 'RUNNING',
    currentStepIndex: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const result = await executeAgentLoop({
    run,
    context: {
      tenantId: 'tenant_main',
      userId: 'user_01',
      capabilities: ['read']
    },
    gateway: fakeGateway,
    signal: controller.signal
  });

  assert.equal(result.finalStatus, 'CANCELLED');
  assert.equal(result.error?.code, 'EXECUTION_CANCELLED');
});

test('negative: pause run when tool requires human approval', async () => {
  const fakeGateway = {
    async requestInference() {
      return {
        content: 'I need approval to broadcast emergency announcement.',
        toolCalls: [
          {
            id: 'call_danger',
            name: 'emergency_broadcast',
            arguments: { channel: 'all', message: 'Evacuate sector 7' }
          }
        ]
      };
    }
  };

  let executed = false;
  const fakeToolRegistry = {
    getTool(name) {
      if (name === 'emergency_broadcast') {
        return {
          name: 'emergency_broadcast',
          description: 'Send emergency broadcast',
          parameters: {},
          requiresApproval: true // REQUIRES HUMAN APPROVAL
        };
      }
      return undefined;
    },
    listTools() {
      return [this.getTool('emergency_broadcast')];
    },
    async executeTool() {
      executed = true;
      return { broadcasted: true };
    }
  };

  const run = {
    runId: 'run_006',
    workflowVersion: '1.0.0',
    status: 'RUNNING',
    currentStepIndex: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const result = await executeAgentLoop({
    run,
    context: {
      tenantId: 'tenant_main',
      userId: 'user_01',
      capabilities: ['admin']
    },
    gateway: fakeGateway,
    tools: fakeToolRegistry
  });

  assert.equal(result.finalStatus, 'PAUSED_APPROVAL');
  assert.equal(executed, false, 'Tool must NOT execute before human approval');
  assert.ok(result.pausedToolCall);
  assert.equal(result.pausedToolCall.toolName, 'emergency_broadcast');
  assert.ok(result.pausedToolCall.argumentHash);
  assert.equal(result.steps.length, 2); // MODEL_REQUEST, then APPROVAL_PAUSE
  assert.equal(result.steps[1].type, 'APPROVAL_PAUSE');
  assert.equal(result.steps[1].status, 'INTERRUPTED');
});
