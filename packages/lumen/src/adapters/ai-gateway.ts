import type { ModelGatewayPort, ModelRequest, ModelResponse } from '../index.js';

export type GatewayErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'UNAVAILABLE'
  | 'TIMEOUT'
  | 'CANCELLED'
  | 'MALFORMED_RESPONSE'
  | 'BAD_REQUEST'
  | 'GATEWAY_ERROR';

export class LumenGatewayError extends Error {
  readonly code: GatewayErrorCode;
  readonly statusCode?: number;
  readonly retryable: boolean;

  constructor(message: string, code: GatewayErrorCode, statusCode?: number, retryable = false) {
    super(message);
    this.name = 'LumenGatewayError';
    this.code = code;
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}

export interface AiGatewayAdapterOptions {
  /**
   * Base URL of the MoonWitness AI Gateway.
   * Defaults to 'http://127.0.0.1:3003'.
   */
  baseUrl?: string;

  /**
   * Optional bearer token or authorization key.
   */
  apiKey?: string;

  /**
   * Optional default model ID if not specified in inference request (e.g., 'auto', 'free').
   */
  defaultModel?: string;

  /**
   * Request timeout in milliseconds. Defaults to 30,000 ms.
   */
  timeoutMs?: number;

  /**
   * Custom fetch implementation (useful for tests or mocking).
   * Defaults to globalThis.fetch.
   */
  fetchFn?: typeof fetch;

  /**
   * Custom headers to pass with every request.
   */
  headers?: Record<string, string>;
}

/**
 * Redacts sensitive tokens, API keys, and authorization secrets from error strings.
 */
export function redactSensitive(text: string): string {
  return text
    .replace(/(Bearer\s+)[^\s"';&]+/gi, '$1[REDACTED]')
    .replace(/(key=)[^\s"';&]+/gi, '$1[REDACTED]')
    .replace(/AIza[0-9A-Za-z\-_]{20,}/g, '[REDACTED_GEMINI_KEY]')
    .replace(/gsk_[0-9A-Za-z]{20,}/g, '[REDACTED_GROQ_KEY]')
    .replace(/sk-[0-9A-Za-z\-_]{20,}/gi, '[REDACTED_API_KEY]');
}

/**
 * Adapter implementing LUMEN ModelGatewayPort using MoonWitness AI Gateway contracts.
 */
export class AiGatewayAdapter implements ModelGatewayPort {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly defaultModel: string;
  private readonly timeoutMs: number;
  private readonly fetchFn: typeof fetch;
  private readonly extraHeaders: Record<string, string>;

  constructor(options: AiGatewayAdapterOptions = {}) {
    this.baseUrl = (options.baseUrl ?? 'http://127.0.0.1:3003').replace(/\/+$/, '');
    this.apiKey = options.apiKey;
    this.defaultModel = options.defaultModel ?? 'auto';
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.fetchFn = options.fetchFn ?? globalThis.fetch;
    this.extraHeaders = options.headers ?? {};
  }

  async requestInference(request: ModelRequest): Promise<ModelResponse> {
    const url = `${this.baseUrl}/v1/chat/completions`;
    const model = request.model ?? this.defaultModel;

    const headers: Record<string, string> = {
      'content-type': 'application/json',
      ...this.extraHeaders,
    };

    if (this.apiKey) {
      headers['authorization'] = `Bearer ${this.apiKey}`;
    }

    const payload: Record<string, unknown> = {
      model,
      messages: request.messages,
      temperature: request.temperature ?? 0.2,
    };

    if (request.maxTokens !== undefined) {
      payload.max_tokens = request.maxTokens;
    }

    if (request.tools && request.tools.length > 0) {
      payload.tools = request.tools.map((tool) => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        },
      }));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    let res: Response;
    try {
      res = await this.fetchFn(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new LumenGatewayError(
          `AI Gateway request timed out after ${this.timeoutMs}ms`,
          'TIMEOUT',
          undefined,
          true
        );
      }
      const rawMessage = err instanceof Error ? err.message : String(err);
      throw new LumenGatewayError(
        `AI Gateway network failure: ${redactSensitive(rawMessage)}`,
        'UNAVAILABLE',
        undefined,
        true
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      let errorBody = '';
      try {
        errorBody = await res.text();
      } catch {
        errorBody = '';
      }

      const safeMessage = redactSensitive(errorBody || res.statusText || `HTTP ${res.status}`);
      let code: GatewayErrorCode;
      let retryable = false;

      switch (res.status) {
        case 400:
          code = 'BAD_REQUEST';
          break;
        case 401:
          code = 'UNAUTHORIZED';
          break;
        case 403:
          code = 'FORBIDDEN';
          break;
        case 404:
          code = 'NOT_FOUND';
          break;
        case 429:
          code = 'RATE_LIMITED';
          retryable = true;
          break;
        case 502:
        case 503:
        case 504:
          code = 'UNAVAILABLE';
          retryable = true;
          break;
        default:
          code = res.status >= 500 ? 'GATEWAY_ERROR' : 'BAD_REQUEST';
          retryable = res.status >= 500;
          break;
      }

      throw new LumenGatewayError(
        `AI Gateway returned HTTP ${res.status}: ${safeMessage}`,
        code,
        res.status,
        retryable
      );
    }

    let json: any;
    try {
      json = await res.json();
    } catch (parseErr: unknown) {
      throw new LumenGatewayError(
        'Failed to parse AI Gateway response as JSON',
        'MALFORMED_RESPONSE',
        res.status,
        false
      );
    }

    if (!json || typeof json !== 'object' || !Array.isArray(json.choices) || json.choices.length === 0) {
      throw new LumenGatewayError(
        'Malformed AI Gateway response: missing choices array',
        'MALFORMED_RESPONSE',
        res.status,
        false
      );
    }

    const firstChoice = json.choices[0];
    const message = firstChoice.message ?? {};
    const content = typeof message.content === 'string' ? message.content : '';

    const toolCalls: Array<{ id: string; name: string; arguments: Record<string, unknown> }> = [];

    // 1. Structured OpenAI-compatible tool_calls
    if (Array.isArray(message.tool_calls)) {
      for (const tc of message.tool_calls) {
        let args: Record<string, unknown> = {};
        if (tc.function?.arguments) {
          if (typeof tc.function.arguments === 'string') {
            try {
              args = JSON.parse(tc.function.arguments);
            } catch {
              args = { raw: tc.function.arguments };
            }
          } else if (typeof tc.function.arguments === 'object' && tc.function.arguments !== null) {
            args = tc.function.arguments as Record<string, unknown>;
          }
        } else if (tc.arguments) {
          args = typeof tc.arguments === 'string' ? JSON.parse(tc.arguments) : tc.arguments;
        }

        toolCalls.push({
          id: String(tc.id || `call_${Date.now()}_${toolCalls.length}`),
          name: String(tc.function?.name || tc.name || 'unknown_tool'),
          arguments: args,
        });
      }
    }

    // 2. Fallback: Parse structured tool proposal in message content if not in tool_calls
    if (toolCalls.length === 0 && content.trim().length > 0) {
      const parsedFromContent = this.extractToolCallFromContent(content);
      if (parsedFromContent) {
        toolCalls.push(parsedFromContent);
      }
    }

    const usage = json.usage
      ? {
          promptTokens: Number(json.usage.prompt_tokens ?? 0),
          completionTokens: Number(json.usage.completion_tokens ?? 0),
          totalTokens: Number(json.usage.total_tokens ?? 0),
        }
      : undefined;

    return {
      content,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage,
    };
  }

  private extractToolCallFromContent(content: string): { id: string; name: string; arguments: Record<string, unknown> } | null {
    // Check for fenced code block: ```json ... ``` or raw json object
    const blockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    const candidate = blockMatch ? blockMatch[1] : (content.trim().startsWith('{') && content.trim().endsWith('}') ? content.trim() : null);

    if (!candidate) return null;

    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object') {
        const toolName = parsed.tool || parsed.name || parsed.action;
        const toolArgs = parsed.arguments || parsed.args || parsed.parameters;
        if (typeof toolName === 'string' && toolArgs && typeof toolArgs === 'object') {
          return {
            id: `call_${Date.now()}`,
            name: toolName,
            arguments: toolArgs as Record<string, unknown>,
          };
        }
      }
    } catch {
      // not valid JSON tool call
    }

    return null;
  }
}
