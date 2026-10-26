import type { AiProvider, ChatCompletionRequest, ChatCompletionResponse } from '../types.js'

export class GeminiProvider implements AiProvider {
  readonly name = 'gemini'
  readonly defaultModel = 'gemini-2.5-flash'
  readonly supportedModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']

  private get apiKey(): string | undefined {
    return process.env.GEMINI_API_KEY
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0)
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const key = this.apiKey
    if (!key) throw new Error('GEMINI_API_KEY is not configured')

    const chosenModel =
      request.model && this.supportedModels.includes(request.model) ? request.model : this.defaultModel

    const systemMsg = request.messages.find((m) => m.role === 'system')?.content
    const contents = request.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

    const start = Date.now()
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${chosenModel}:generateContent?key=${encodeURIComponent(key)}`

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: request.temperature ?? 0.3,
        maxOutputTokens: request.max_tokens ?? 512,
      },
    }

    if (systemMsg) {
      body.systemInstruction = { parts: [{ text: systemMsg }] }
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      throw new Error(`Gemini API failed HTTP ${res.status}: ${errText.slice(0, 200)}`)
    }

    const data = (await res.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> }
        finishReason?: string
      }>
      usageMetadata?: {
        promptTokenCount?: number
        candidatesTokenCount?: number
        totalTokenCount?: number
      }
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const latency = Date.now() - start

    return {
      id: `chatcmpl-gemini-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: chosenModel,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: text,
          },
          finish_reason: data.candidates?.[0]?.finishReason?.toLowerCase() ?? 'stop',
        },
      ],
      usage: {
        prompt_tokens: data.usageMetadata?.promptTokenCount ?? 0,
        completion_tokens: data.usageMetadata?.candidatesTokenCount ?? 0,
        total_tokens: data.usageMetadata?.totalTokenCount ?? 0,
      },
      router_telemetry: {
        provider: this.name,
        model_used: chosenModel,
        latency_ms: latency,
      },
    }
  }
}
