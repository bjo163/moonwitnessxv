import type { AiProvider, ChatCompletionRequest, ChatCompletionResponse } from '../types.js'

export class OpenRouterProvider implements AiProvider {
  readonly name = 'openrouter'
  readonly defaultModel = 'meta-llama/llama-3.3-70b-instruct:free'
  readonly supportedModels = [
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemini-2.0-flash-exp:free',
    'deepseek/deepseek-r1:free',
  ]

  private get apiKey(): string | undefined {
    return process.env.OPENROUTER_API_KEY
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0)
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const key = this.apiKey
    if (!key) throw new Error('OPENROUTER_API_KEY is not configured')

    const chosenModel =
      request.model && (request.model.endsWith(':free') || this.supportedModels.includes(request.model))
        ? request.model
        : this.defaultModel

    const start = Date.now()
    const url = 'https://openrouter.ai/api/v1/chat/completions'

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': 'https://github.com/moonwitness/moonradio',
        'X-Title': 'Moonwitness AI Gateway',
      },
      body: JSON.stringify({
        model: chosenModel,
        messages: request.messages,
        temperature: request.temperature ?? 0.3,
        max_tokens: request.max_tokens ?? 512,
      }),
      signal: AbortSignal.timeout(12_000),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      throw new Error(`OpenRouter API failed HTTP ${res.status}: ${errText.slice(0, 200)}`)
    }

    const data = (await res.json()) as ChatCompletionResponse
    const latency = Date.now() - start

    return {
      ...data,
      router_telemetry: {
        provider: this.name,
        model_used: chosenModel,
        latency_ms: latency,
      },
    }
  }
}
