import type { AiProvider, ChatCompletionRequest, ChatCompletionResponse } from '../types.js'

export class GroqProvider implements AiProvider {
  readonly name = 'groq'
  readonly defaultModel = 'llama-3.3-70b-versatile'
  readonly supportedModels = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768']

  private get apiKey(): string | undefined {
    return process.env.GROQ_API_KEY
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0)
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const key = this.apiKey
    if (!key) throw new Error('GROQ_API_KEY is not configured')

    const chosenModel =
      request.model && this.supportedModels.includes(request.model) ? request.model : this.defaultModel

    const start = Date.now()
    const url = 'https://api.groq.com/openai/v1/chat/completions'

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: chosenModel,
        messages: request.messages,
        temperature: request.temperature ?? 0.3,
        max_tokens: request.max_tokens ?? 512,
      }),
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      throw new Error(`Groq API failed HTTP ${res.status}: ${errText.slice(0, 200)}`)
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
