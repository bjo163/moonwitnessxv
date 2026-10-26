import type { AiProvider, ChatCompletionRequest, ChatCompletionResponse } from '../types.js'

export class OllamaProvider implements AiProvider {
  readonly name = 'ollama'
  readonly defaultModel = 'llama3'
  readonly supportedModels = ['llama3', 'llama3.2', 'qwen2.5', 'mistral', 'phi3']

  private get host(): string {
    return process.env.OLLAMA_HOST ?? 'http://127.0.0.1:11434'
  }

  isAvailable(): boolean {
    // If explicitly disabled via env, false; otherwise can be probed or assumed available on host
    return process.env.OLLAMA_DISABLED !== 'true'
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const chosenModel = request.model && !['free', 'auto', 'default'].includes(request.model)
      ? request.model
      : process.env.OLLAMA_MODEL ?? this.defaultModel

    const start = Date.now()
    const url = `${this.host}/v1/chat/completions`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: chosenModel,
        messages: request.messages,
        temperature: request.temperature ?? 0.3,
        max_tokens: request.max_tokens ?? 512,
      }),
      signal: AbortSignal.timeout(4_000), // Quick timeout for local daemon
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      throw new Error(`Ollama daemon failed HTTP ${res.status}: ${errText.slice(0, 150)}`)
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
