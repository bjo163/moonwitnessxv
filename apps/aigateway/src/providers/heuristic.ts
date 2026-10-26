import type { AiProvider, ChatCompletionRequest, ChatCompletionResponse } from '../types.js'

export class HeuristicProvider implements AiProvider {
  readonly name = 'heuristic'
  readonly defaultModel = 'heuristic-triage-v1'
  readonly supportedModels = ['heuristic-triage-v1', 'heuristic-fast']

  isAvailable(): boolean {
    return true
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const start = Date.now()
    const lastUserMsg = [...request.messages].reverse().find((m) => m.role === 'user')?.content ?? ''

    // Analyze text content for sentiment & urgency
    const text = lastUserMsg.toLowerCase()
    let sentiment = 'neutral'
    let urgencyScore = 55

    if (/(gempa|tsunami|erupsi|darurat|banjir|kebakaran|evakuasi|critical|kritis|urgent|alert|bahaya)/.test(text)) {
      sentiment = 'alert'
      urgencyScore = 92
    } else if (/(eksploit|vulnerability|malware|breach|investigasi|investigation|bocor|serangan)/.test(text)) {
      sentiment = 'critical'
      urgencyScore = 86
    } else if (/(rilis|peluncuran|prestasi|rekor|sukses|juara|terobosan|positive|menang)/.test(text)) {
      sentiment = 'positive'
      urgencyScore = 68
    } else if (/(live|siaran|update|terkini|berita)/.test(text)) {
      urgencyScore = 72
    }

    const generatedBrief =
      `[AI Triage Heuristic] Automated OSINT signal assessment completed. ` +
      `Content exhibits ${sentiment.toUpperCase()} indicators with priority factor. ` +
      `Calculated urgency score: ${urgencyScore}/100. Verification status: deterministic heuristic model.`

    const latency = Math.max(1, Date.now() - start)

    return {
      id: `chatcmpl-heuristic-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: this.defaultModel,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: generatedBrief,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: Math.ceil(lastUserMsg.length / 4),
        completion_tokens: Math.ceil(generatedBrief.length / 4),
        total_tokens: Math.ceil((lastUserMsg.length + generatedBrief.length) / 4),
      },
      router_telemetry: {
        provider: this.name,
        model_used: this.defaultModel,
        latency_ms: latency,
      },
    }
  }
}
