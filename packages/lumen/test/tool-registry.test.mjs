import test from 'node:test';
import assert from 'node:assert/strict';
import { ToolRegistry } from '../dist/index.js';

test('positive: registered tool passes schema check and executes under trusted capabilities', async () => {
  const registry = new ToolRegistry();

  registry.registerTool({
    name: 'read_station_status',
    version: '1.0.0',
    description: 'Read the status of a specific radio station',
    sideEffect: 'READ_ONLY',
    requiredCapabilities: ['radio:read'],
    requiresApproval: false,
    parameters: {
      stationId: {
        type: 'string',
        required: true,
        validator: val => typeof val === 'string' && val.startsWith('station_')
      },
      verbose: {
        type: 'boolean',
        required: false
      }
    },
    async execute(args) {
      return { stationId: args.stationId, active: true, frequency: '98.5 MHz' };
    }
  });

  // Verify listTools
  const tools = registry.listTools();
  assert.equal(tools.length, 1);
  assert.equal(tools[0].name, 'read_station_status');

  // Verify successful execution with valid trusted context
  const context = {
    tenantId: 'tenant_main',
    userId: 'user_10',
    roles: ['operator'],
    capabilities: ['radio:read']
  };

  const result = await registry.executeTool(
    'read_station_status',
    { stationId: 'station_04', verbose: true },
    context
  );

  assert.deepEqual(result, { stationId: 'station_04', active: true, frequency: '98.5 MHz' });
});

test('negative: reject unknown tool, missing capabilities, malformed args, and approval bypass', async () => {
  const registry = new ToolRegistry();

  registry.registerTool({
    name: 'update_station_metadata',
    version: '1.0.0',
    description: 'Update station metadata',
    sideEffect: 'IDEMPOTENT_MUTATION',
    requiredCapabilities: ['radio:write'],
    requiresApproval: false,
    parameters: {
      stationId: { type: 'string', required: true },
      bitrate: { type: 'number', required: true, validator: n => typeof n === 'number' && n >= 128 }
    },
    async execute(args) {
      return { updated: true, bitrate: args.bitrate };
    }
  });

  registry.registerTool({
    name: 'delete_station',
    version: '1.0.0',
    description: 'Delete a radio station',
    sideEffect: 'CONSEQUENTIAL_MUTATION',
    requiredCapabilities: ['radio:admin'],
    requiresApproval: true, // Requires human approval!
    parameters: {
      stationId: { type: 'string', required: true }
    },
    async execute() {
      return { deleted: true };
    }
  });

  const baseContext = {
    tenantId: 'tenant_main',
    userId: 'user_10',
    roles: ['viewer'],
    capabilities: ['radio:read'] // Does NOT have radio:write or radio:admin
  };

  // 1. Unknown tool rejected
  await assert.rejects(
    () => registry.executeTool('non_existent_tool', {}, baseContext),
    /UNKNOWN_TOOL.*is not registered in the allowlisted registry/
  );

  // 2. Missing capabilities rejected before execution
  await assert.rejects(
    () => registry.executeTool('update_station_metadata', { stationId: 'station_01', bitrate: 256 }, baseContext),
    /PERMISSION_DENIED.*Missing required capability \[radio:write\]/
  );

  // 3. Model cannot elevate permissions via arguments
  const privilegeEscalationAttempt = {
    stationId: 'station_01',
    bitrate: 256,
    capabilities: ['radio:write', 'radio:admin'], // Fake claim inside arguments
    roles: ['superadmin']
  };
  await assert.rejects(
    () => registry.executeTool('update_station_metadata', privilegeEscalationAttempt, baseContext),
    /PERMISSION_DENIED.*Missing required capability \[radio:write\]/
  );

  // 4. Missing required parameter rejected
  const adminContext = {
    tenantId: 'tenant_main',
    userId: 'admin_01',
    roles: ['admin'],
    capabilities: ['radio:write', 'radio:admin']
  };
  await assert.rejects(
    () => registry.executeTool('update_station_metadata', { bitrate: 256 }, adminContext),
    /MALFORMED_TOOL_ARGUMENTS.*Missing required parameter "stationId"/
  );

  // 5. Wrong parameter type rejected
  await assert.rejects(
    () => registry.executeTool('update_station_metadata', { stationId: 'station_01', bitrate: 'fast' }, adminContext),
    /MALFORMED_TOOL_ARGUMENTS.*Parameter "bitrate" must be of type "number"/
  );

  // 6. Schema constraint validator failure rejected
  await assert.rejects(
    () => registry.executeTool('update_station_metadata', { stationId: 'station_01', bitrate: 64 }, adminContext),
    /MALFORMED_TOOL_ARGUMENTS.*failed schema constraint validation/
  );

  // 7. Direct execution of tool requiring human approval rejected
  await assert.rejects(
    () => registry.executeTool('delete_station', { stationId: 'station_01' }, adminContext),
    /APPROVAL_REQUIRED.*cannot be executed directly without a verified approval decision/
  );
});
