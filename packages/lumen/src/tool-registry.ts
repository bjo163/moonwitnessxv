/**
 * @moonwitness/lumen — Typed Tool Registry & Policy Enforcement (M41-05)
 *
 * Implements allowlisted tool registration, schema validation, capability checking,
 * and fail-safe pre-execution policy enforcement.
 * Denies by default; never trusts model-supplied claims for authorization.
 */

import type { ToolDefinition, ToolRegistryPort } from './index.js';

export type SideEffectClass = 'READ_ONLY' | 'IDEMPOTENT_MUTATION' | 'CONSEQUENTIAL_MUTATION';

export interface ToolParameterSchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  description?: string;
  validator?: (value: unknown) => boolean;
}

export interface TrustedSecurityContext {
  tenantId: string;
  userId: string;
  roles: string[];
  capabilities: string[];
}

export interface ToolPolicyDefinition {
  name: string;
  version: string;
  description: string;
  sideEffect: SideEffectClass;
  requiredCapabilities: string[];
  requiresApproval: boolean;
  timeoutMs?: number;
  parameters: Record<string, ToolParameterSchema>;
  execute: (args: Record<string, unknown>, context: TrustedSecurityContext) => Promise<unknown>;
}

export class ToolRegistry implements ToolRegistryPort {
  private tools = new Map<string, ToolPolicyDefinition>();

  public registerTool(tool: ToolPolicyDefinition): void {
    if (!tool.name || typeof tool.name !== 'string') {
      throw new Error('INVALID_TOOL_DEFINITION: Tool name is required');
    }
    if (this.tools.has(tool.name)) {
      throw new Error(`TOOL_ALREADY_EXISTS: Tool "${tool.name}" is already registered`);
    }
    this.tools.set(tool.name, tool);
  }

  public getTool(name: string): ToolDefinition | undefined {
    const def = this.tools.get(name);
    if (!def) return undefined;
    return {
      name: def.name,
      description: def.description,
      parameters: def.parameters,
      requiresApproval: def.requiresApproval
    };
  }

  public getPolicy(name: string): ToolPolicyDefinition | undefined {
    return this.tools.get(name);
  }

  public listTools(): ToolDefinition[] {
    return Array.from(this.tools.values()).map(def => ({
      name: def.name,
      description: def.description,
      parameters: def.parameters,
      requiresApproval: def.requiresApproval
    }));
  }

  public validateArguments(tool: ToolPolicyDefinition, args: Record<string, unknown>): void {
    const rawArgs = args || {};

    for (const [paramName, schema] of Object.entries(tool.parameters)) {
      const val = rawArgs[paramName];

      if (schema.required && (val === undefined || val === null || val === '')) {
        throw new Error(
          `MALFORMED_TOOL_ARGUMENTS: Missing required parameter "${paramName}" for tool "${tool.name}"`
        );
      }

      if (val !== undefined && val !== null) {
        const actualType = Array.isArray(val) ? 'array' : typeof val;
        if (actualType !== schema.type) {
          throw new Error(
            `MALFORMED_TOOL_ARGUMENTS: Parameter "${paramName}" must be of type "${schema.type}", found "${actualType}"`
          );
        }

        if (schema.validator && !schema.validator(val)) {
          throw new Error(
            `MALFORMED_TOOL_ARGUMENTS: Parameter "${paramName}" failed schema constraint validation`
          );
        }
      }
    }
  }

  public evaluatePolicy(tool: ToolPolicyDefinition, context: TrustedSecurityContext): void {
    if (!context || !Array.isArray(context.capabilities)) {
      throw new Error('INVALID_SECURITY_CONTEXT: Trusted security context with capabilities is required');
    }

    const requiredCaps = tool.requiredCapabilities ?? [];
    const missingCaps = requiredCaps.filter(
      cap => !context.capabilities.includes(cap) && !context.capabilities.includes('*')
    );

    if (missingCaps.length > 0) {
      throw new Error(
        `PERMISSION_DENIED: Missing required capability [${missingCaps.join(', ')}] for tool "${tool.name}"`
      );
    }
  }

  public async executeTool(
    name: string,
    args: Record<string, unknown>,
    rawContext: Record<string, unknown>
  ): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`UNKNOWN_TOOL: Tool "${name}" is not registered in the allowlisted registry`);
    }

    // Cast and validate trusted context
    const context: TrustedSecurityContext = {
      tenantId: String(rawContext.tenantId || ''),
      userId: String(rawContext.userId || ''),
      roles: Array.isArray(rawContext.roles) ? rawContext.roles.map(String) : [],
      capabilities: Array.isArray(rawContext.capabilities) ? rawContext.capabilities.map(String) : []
    };

    // 1. Evaluate Capability Permissions
    this.evaluatePolicy(tool, context);

    // 2. Validate Arguments Schema
    this.validateArguments(tool, args);

    // 3. Consequential actions require approval token check (cannot execute directly)
    if (tool.requiresApproval) {
      throw new Error(
        `APPROVAL_REQUIRED: Tool "${tool.name}" is classified as requiring human approval and cannot be executed directly without a verified approval decision`
      );
    }

    // 4. Execute with Timeout
    const timeoutMs = tool.timeoutMs || 10000;
    return await Promise.race([
      tool.execute(args, context),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`TOOL_TIMEOUT: Tool "${tool.name}" exceeded execution timeout of ${timeoutMs}ms`)),
          timeoutMs
        )
      )
    ]);
  }
}
